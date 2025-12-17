const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Optional file-based jobs store fallback (set USE_FILE_DB=true to enable)
const USE_FILE_DB = process.env.USE_FILE_DB === 'true';
const DATA_DIR = path.join(__dirname, 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

function ensureFileStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
    if (!fs.existsSync(JOBS_FILE)) fs.writeFileSync(JOBS_FILE, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to initialize file store:', e);
  }
}

function readJobs() {
  try {
    const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeJobs(jobs) {
  try {
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  } catch (e) {
    console.error('Failed to write jobs file:', e);
  }
}

// Database configuration
let pool = null;

// Helper: convert `?` placeholders to PostgreSQL `$1, $2, ...`
const toPgParams = (sql) => {
  let i = 0;
  return sql.replace(/\?/g, () => {
    i += 1;
    return `$${i}`;
  });
};

// Initialize PostgreSQL database with a small compatibility wrapper
const initDB = async () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/b2b_plastics';
    const useSSL = process.env.DATABASE_SSL === 'true';
    
    // First, try to connect to 'postgres' database to create our target database if needed
    // Extract connection details from connectionString or use defaults
    const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/b2b_plastics';
    const adminConnectionString = dbUrl.replace(/\/[^\/]+$/, '/postgres');
    const adminPool = new Pool({
      connectionString: adminConnectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    });
    
    try {
      // Check if database exists, if not create it
      const dbCheck = await adminPool.query(
        "SELECT 1 FROM pg_database WHERE datname = 'b2b_plastics'"
      );
      
      if (dbCheck.rows.length === 0) {
        console.log('Database b2b_plastics does not exist. Creating...');
        await adminPool.query('CREATE DATABASE b2b_plastics');
        console.log('Database b2b_plastics created successfully');
      }
      
      await adminPool.end();
    } catch (error) {
      console.error('Error checking/creating database:', error.message);
      // Continue anyway - might already exist or connection string might be different
    }
    
    // Now connect to our target database
    pool = new Pool({
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    });
    
    // Test connection (non-blocking - will fail gracefully on first use if DB is not ready)
    pool.query('SELECT 1').then(() => {
      console.log('Connected to PostgreSQL database successfully');
    }).catch((error) => {
      console.error('Warning: Initial PostgreSQL connection test failed:', error.message);
      console.log('Database operations will be attempted, but may fail until connection is established.');
    });
  }

  // Provide an interface similar to sqlite's `run/all/get/exec`
  return {
    async run(sql, params = []) {
      const q = toPgParams(sql);
      const res = await pool.query(q, params);
      return { lastID: res.rows?.[0]?.id ?? null, changes: res.rowCount };
    },
    async all(sql, params = []) {
      const q = toPgParams(sql);
      const res = await pool.query(q, params);
      return res.rows;
    },
    async get(sql, params = []) {
      const q = toPgParams(sql);
      const res = await pool.query(q, params);
      return res.rows[0] || null;
    },
    async exec(sql) {
      return pool.query(sql);
    }
  };
};

// Initialize database and create tables
const initializeDatabase = async () => {
  try {
    if (USE_FILE_DB) {
      console.log('File-store mode enabled: skipping SQL migrations');
      ensureFileStore();
      return;
    }
    console.log('Initializing PostgreSQL database...');
    const database = await initDB();

    // Create users table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firebase_uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        role TEXT DEFAULT 'USER',
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add role column if it doesn't exist (migration for existing databases)
    try {
      const columnCheck = await database.get(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
      `);
      
      if (!columnCheck) {
        console.log('Adding role column to users table...');
        await database.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'USER';`);
        console.log('Role column added successfully');
      } else {
        console.log('Role column already exists');
      }
    } catch (error) {
      // Column might already exist or there's a different issue
      console.log('Note: Could not verify/add role column:', error.message);
      // Continue anyway - the INSERT statements will handle it gracefully
    }

    // Add approval status columns to users table (migration)
    try {
      const userColumns = await database.all(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `);
      const userColumnNames = userColumns.map(c => c.column_name);
      
      if (!userColumnNames.includes('can_chat')) {
        await database.exec(`ALTER TABLE users ADD COLUMN can_chat BOOLEAN DEFAULT FALSE;`);
        console.log('Added can_chat column to users table');
      }
      if (!userColumnNames.includes('can_sell')) {
        await database.exec(`ALTER TABLE users ADD COLUMN can_sell BOOLEAN DEFAULT FALSE;`);
        console.log('Added can_sell column to users table');
      }
      if (!userColumnNames.includes('can_buy')) {
        await database.exec(`ALTER TABLE users ADD COLUMN can_buy BOOLEAN DEFAULT FALSE;`);
        console.log('Added can_buy column to users table');
      }
      if (!userColumnNames.includes('is_seller_approved')) {
        await database.exec(`ALTER TABLE users ADD COLUMN is_seller_approved BOOLEAN DEFAULT FALSE;`);
        console.log('Added is_seller_approved column to users table');
      }
    } catch (error) {
      console.log('Note: Could not add approval columns to users table:', error.message);
    }

    // Create jobs table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        firebase_uid TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        material TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        budget NUMERIC NOT NULL,
        location TEXT NOT NULL,
        client TEXT NOT NULL,
        deadline DATE,
        description TEXT,
        requirements TEXT,
        specifications TEXT,
        estimated_duration TEXT,
        status TEXT DEFAULT 'active',
        bids_received INTEGER DEFAULT 0,
        rating NUMERIC DEFAULT NULL,
        posted_date DATE DEFAULT CURRENT_DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        priority TEXT DEFAULT 'normal',
        boost_requested BOOLEAN DEFAULT FALSE,
        boost_approved BOOLEAN DEFAULT FALSE,
        boost_requested_at TIMESTAMP,
        boost_approved_at TIMESTAMP
      );
    `);
    
    // Add priority and boost columns if they don't exist (migration)
    try {
      const priorityCheck = await database.get(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'priority'
      `);
      
      if (!priorityCheck) {
        console.log('Adding priority and boost columns to jobs table...');
        await database.exec(`ALTER TABLE jobs ADD COLUMN priority TEXT DEFAULT 'normal';`);
        await database.exec(`ALTER TABLE jobs ADD COLUMN boost_requested BOOLEAN DEFAULT FALSE;`);
        await database.exec(`ALTER TABLE jobs ADD COLUMN boost_approved BOOLEAN DEFAULT FALSE;`);
        await database.exec(`ALTER TABLE jobs ADD COLUMN boost_requested_at TIMESTAMP;`);
        await database.exec(`ALTER TABLE jobs ADD COLUMN boost_approved_at TIMESTAMP;`);
        console.log('Priority and boost columns added successfully');
      }
    } catch (error) {
      console.log('Note: Could not verify/add priority columns:', error.message);
    }

    // Create conversations table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        job_owner_uid TEXT NOT NULL,
        participant_uid TEXT NOT NULL,
        job_title TEXT NOT NULL,
        last_message TEXT,
        last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, job_owner_uid, participant_uid)
      );
    `);

    // Create bids table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        bidder_uid TEXT NOT NULL,
        bidder_name TEXT NOT NULL,
        bid_amount NUMERIC NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, bidder_uid)
      );
    `);

    // Create conversation_messages table (for job-based conversations)
    await database.exec(`
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_uid TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create testimonials table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        image TEXT NOT NULL,
        testimonial TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create banners table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        image TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create sponsors table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        logo TEXT NOT NULL,
        website TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create messages table (private DM)
    await database.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      );
    `);

    // Create chat_permissions table for admin approval system
    await database.exec(`
      CREATE TABLE IF NOT EXISTS chat_permissions (
        id SERIAL PRIMARY KEY,
        requester_uid TEXT NOT NULL,
        requester_name TEXT,
        seller_uid TEXT NOT NULL,
        seller_name TEXT,
        machinery_id INTEGER REFERENCES machinery(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by TEXT,
        revoked_at TIMESTAMP,
        revoked_by TEXT,
        UNIQUE(requester_uid, seller_uid, machinery_id)
      );
    `);

    // Create chat_requests table for general chat access requests
    await database.exec(`
      CREATE TABLE IF NOT EXISTS chat_requests (
        id SERIAL PRIMARY KEY,
        user_uid TEXT NOT NULL,
        user_name TEXT,
        user_email TEXT,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by TEXT,
        notes TEXT
      );
    `);

    // Create machinery_conversations table for machinery-based conversations
    await database.exec(`
      CREATE TABLE IF NOT EXISTS machinery_conversations (
        id SERIAL PRIMARY KEY,
        machinery_id INTEGER NOT NULL REFERENCES machinery(id) ON DELETE CASCADE,
        seller_uid TEXT NOT NULL,
        buyer_uid TEXT NOT NULL,
        permission_granted BOOLEAN DEFAULT FALSE,
        last_message TEXT,
        last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(machinery_id, seller_uid, buyer_uid)
      );
    `);

    // Create machinery_messages table for machinery-based chat messages
    await database.exec(`
      CREATE TABLE IF NOT EXISTS machinery_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES machinery_conversations(id) ON DELETE CASCADE,
        sender_uid TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create forum tables
    await database.exec(`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await database.exec(`
      CREATE TABLE IF NOT EXISTS forum_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create products table (basic catalog for cart)
    await database.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        category TEXT,
        image TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add is_approved column to products if it doesn't exist (migration)
    try {
      const productColumns = await database.all(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'products'
      `);
      const productColumnNames = productColumns.map(c => c.column_name);
      
      if (!productColumnNames.includes('is_approved')) {
        await database.exec(`ALTER TABLE products ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;`);
        console.log('Added is_approved column to products table');
      }
    } catch (error) {
      console.log('Note: Could not add is_approved column to products table:', error.message);
    }

    // Create machinery table for managing machinery listings
    await database.exec(`
      CREATE TABLE IF NOT EXISTS machinery (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        firebase_uid TEXT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        capacity TEXT,
        price NUMERIC NOT NULL,
        unit TEXT DEFAULT 'piece',
        image TEXT,
        location TEXT,
        supplier TEXT,
        rating NUMERIC DEFAULT 0,
        in_stock BOOLEAN DEFAULT TRUE,
        year INTEGER,
        condition TEXT,
        description TEXT,
        specifications TEXT,
        features TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add user_id, firebase_uid, and is_approved columns if they don't exist (migration)
    try {
      const machineryColumns = await database.all(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'machinery'
      `);
      const columnNames = machineryColumns.map(c => c.column_name);
      
      if (!columnNames.includes('user_id')) {
        await database.exec(`ALTER TABLE machinery ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`);
        console.log('Added user_id column to machinery table');
      }
      if (!columnNames.includes('firebase_uid')) {
        await database.exec(`ALTER TABLE machinery ADD COLUMN firebase_uid TEXT;`);
        console.log('Added firebase_uid column to machinery table');
      }
      if (!columnNames.includes('is_approved')) {
        await database.exec(`ALTER TABLE machinery ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;`);
        console.log('Added is_approved column to machinery table');
      }
    } catch (error) {
      console.log('Note: Could not add columns to machinery table:', error.message);
    }

    // Create carts and cart_items tables
    await database.exec(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await database.exec(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        qty INTEGER NOT NULL,
        price_snapshot NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create orders and order_items tables
    await database.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total NUMERIC NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await database.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        qty INTEGER NOT NULL,
        price_snapshot NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default testimonials if table is empty
    const testimonialCountRow = await database.get('SELECT COUNT(*) as count FROM testimonials');
    const testimonialCount = Number(testimonialCountRow?.count || 0);
    if (testimonialCount === 0) {
      await database.exec(`
        INSERT INTO testimonials (name, company, image, testimonial, rating) VALUES
        ('Rajesh Kumar', 'Kumar Plastics Ltd.', '/placeholder-avatar.svg', 'Excellent platform for finding quality machinery. Found the perfect injection molding machine for our production line.', 5),
        ('Priya Sharma', 'Sharma Industries', '/placeholder-avatar.svg', 'Great experience sourcing raw materials. The suppliers are reliable and the quality is consistently good.', 5),
        ('Amit Patel', 'Patel Manufacturing', '/placeholder-avatar.svg', 'The B2B platform has revolutionized our procurement process. Highly recommended for plastic industry professionals.', 5),
        ('Sunita Reddy', 'Reddy Polymers', '/placeholder-avatar.svg', 'Outstanding service and quality products. The platform connects us with the best suppliers in the industry.', 5);
      `);
    }

    // Insert default banners if table is empty
    const bannerCountRow = await database.get('SELECT COUNT(*) as count FROM banners');
    const bannerCount = Number(bannerCountRow?.count || 0);
    if (bannerCount === 0) {
      await database.exec(`
        INSERT INTO banners (title, image) VALUES
        ('Welcome to B2B Plastics SRM', '/placeholder-banner.svg'),
        ('Quality Machinery & Materials', '/placeholder-banner.svg');
      `);
    }

    // Insert default sponsors if table is empty
    const sponsorCountRow = await database.get('SELECT COUNT(*) as count FROM sponsors');
    const sponsorCount = Number(sponsorCountRow?.count || 0);
    if (sponsorCount === 0) {
      await database.exec(`
        INSERT INTO sponsors (name, logo, website) VALUES
        ('PlasticTech Solutions', '/placeholder-banner.svg', 'https://plastictechsolutions.com'),
        ('Industrial Partners', '/placeholder-banner.svg', 'https://industrialpartners.com');
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// User operations
const userOperations = {
  async createOrUpdateUser(firebaseUid, email, displayName) {
    if (USE_FILE_DB) {
      return firebaseUid;
    }
    const database = await initDB();
    try {
      await database.run(`
        INSERT INTO users (firebase_uid, email, display_name, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT (firebase_uid) DO UPDATE SET
          email = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          updated_at = CURRENT_TIMESTAMP
      `, [firebaseUid, email, displayName]);
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }
};

// Job operations
const jobOperations = {
  async createJob(jobData, firebaseUid) {
    if (USE_FILE_DB) {
      ensureFileStore();
      const jobs = readJobs();
      const nextId = jobs.length > 0 ? Math.max(...jobs.map(j => Number(j.id) || 0)) + 1 : 1;
      const newJob = {
        id: nextId,
        firebase_uid: firebaseUid,
        owner_uid: firebaseUid,
        title: jobData.title,
        category: jobData.category,
        material: jobData.material,
        quantity: Number(jobData.quantity),
        budget: Number(jobData.budget),
        location: jobData.location,
        client: jobData.client || 'Anonymous',
        deadline: jobData.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: jobData.description || '',
        requirements: JSON.stringify(jobData.requirements || {}),
        specifications: JSON.stringify(jobData.specifications || []),
        estimatedDuration: jobData.estimatedDuration || '1-2 weeks',
        posted_date: jobData.posted_date || new Date().toISOString().split('T')[0],
        status: jobData.status || 'Open',
        bidsReceived: 0,
        rating: 0,
        unit: jobData.unit || 'kg'
      };
      jobs.push(newJob);
      writeJobs(jobs);
      return newJob.id;
    }
    const database = await initDB();
    try {
      // Get user ID from firebase_uid
      const userRows = await database.all(
        'SELECT id FROM users WHERE firebase_uid = ?',
        [firebaseUid]
      );
      
      if (userRows.length === 0) {
        throw new Error('User not found');
      }
      
      const userId = userRows[0].id;
      
      const result = await database.run(`
        INSERT INTO jobs (
          user_id, firebase_uid, title, category, material, quantity, 
          budget, location, client, deadline, description, requirements, 
          specifications, estimated_duration, posted_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `, [
        userId,
        firebaseUid,
        jobData.title,
        jobData.category,
        jobData.material,
        jobData.quantity,
        jobData.budget,
        jobData.location,
        jobData.client,
        jobData.deadline,
        jobData.description,
        JSON.stringify(jobData.requirements || {}),
        JSON.stringify(jobData.specifications || []),
        jobData.estimatedDuration,
        jobData.posted_date || new Date().toISOString().split('T')[0]
      ]);
      
      return result.lastID;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  async getAllJobs() {
    if (USE_FILE_DB) {
      ensureFileStore();
      const jobs = readJobs();
      return jobs.map(job => ({
        ...job,
        requirements: job.requirements ? JSON.parse(job.requirements) : {},
        specifications: job.specifications ? JSON.parse(job.specifications) : []
      }));
    }
    const database = await initDB();
    try {
      const rows = await database.all(`
        SELECT j.*, u.display_name as user_name, u.email as user_email, j.firebase_uid as owner_uid
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        ORDER BY 
          CASE 
            WHEN j.priority = 'high' THEN 1
            WHEN j.priority = 'normal' THEN 2
            WHEN j.priority = 'low' THEN 3
            ELSE 4
          END,
          j.posted_date DESC
      `);
      
      return rows.map(job => ({
        ...job,
        requirements: job.requirements ? JSON.parse(job.requirements) : {},
        specifications: job.specifications ? JSON.parse(job.specifications) : []
      }));
    } catch (error) {
      console.error('Error getting all jobs:', error);
      throw error;
    }
  },

  async getJobById(jobId) {
    if (USE_FILE_DB) {
      ensureFileStore();
      const jobs = readJobs();
      const job = jobs.find(j => String(j.id) === String(jobId));
      if (!job) return null;
      return {
        ...job,
        requirements: job.requirements ? JSON.parse(job.requirements) : {},
        specifications: job.specifications ? JSON.parse(job.specifications) : []
      };
    }
    const database = await initDB();
    try {
      const job = await database.get(`
        SELECT j.*, u.display_name as user_name, u.email as user_email, j.firebase_uid as owner_uid
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        WHERE j.id = ?
      `, [jobId]);
      
      if (!job) return null;
      
      return {
        ...job,
        requirements: job.requirements ? JSON.parse(job.requirements) : {},
        specifications: job.specifications ? JSON.parse(job.specifications) : []
      };
    } catch (error) {
      console.error('Error getting job by ID:', error);
      throw error;
    }
  },

  async getJobsByUser(firebaseUid) {
    if (USE_FILE_DB) {
      ensureFileStore();
      const jobs = readJobs().filter(j => j.firebase_uid === firebaseUid);
      return jobs.map(job => ({
        ...job,
        requirements: job.requirements ? JSON.parse(job.requirements) : {},
        specifications: job.specifications ? JSON.parse(job.specifications) : []
      }));
    }
    const database = await initDB();
    try {
      const rows = await database.all(`
        SELECT j.*, u.display_name as user_name, u.email as user_email
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        WHERE j.firebase_uid = ?
        ORDER BY j.posted_date DESC
      `, [firebaseUid]);
      
      return rows.map(job => ({
        ...job,
        requirements: job.requirements ? JSON.parse(job.requirements) : {},
        specifications: job.specifications ? JSON.parse(job.specifications) : []
      }));
    } catch (error) {
      console.error('Error getting jobs by user:', error);
      throw error;
    }
  },

  async updateJob(jobId, updateData) {
    if (USE_FILE_DB) {
      ensureFileStore();
      const jobs = readJobs();
      const idx = jobs.findIndex(j => String(j.id) === String(jobId));
      if (idx === -1) return false;
      const current = jobs[idx];
      jobs[idx] = {
        ...current,
        ...updateData,
        requirements: updateData.requirements ? JSON.stringify(updateData.requirements) : current.requirements,
        specifications: updateData.specifications ? JSON.stringify(updateData.specifications) : current.specifications,
        updated_at: new Date().toISOString()
      };
      writeJobs(jobs);
      return true;
    }
    const database = await initDB();
    try {
      const result = await database.run(`
        UPDATE jobs 
        SET title = ?, category = ?, material = ?, quantity = ?, 
            budget = ?, location = ?, client = ?, deadline = ?, 
            description = ?, requirements = ?, specifications = ?, 
            estimated_duration = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        updateData.title,
        updateData.category,
        updateData.material,
        updateData.quantity,
        updateData.budget,
        updateData.location,
        updateData.client,
        updateData.deadline,
        updateData.description,
        JSON.stringify(updateData.requirements || {}),
        JSON.stringify(updateData.specifications || []),
        updateData.estimatedDuration,
        updateData.status,
        jobId
      ]);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  async deleteJob(jobId) {
    if (USE_FILE_DB) {
      ensureFileStore();
      const jobs = readJobs();
      const next = jobs.filter(j => String(j.id) !== String(jobId));
      writeJobs(next);
      return true;
    }
    const database = await initDB();
    try {
      const result = await database.run('DELETE FROM jobs WHERE id = ?', [jobId]);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
};

// Bid operations
const bidOperations = {
  async createBid(jobId, bidderUid, bidderName, bidAmount, message) {
    if (USE_FILE_DB) {
      // For file DB, we'll store bids in a separate file
      // For now, just return success (can be enhanced later)
      return { success: true, bidId: Date.now() };
    }
    
    const database = await initDB();
    try {
      // Check if bid already exists
      const existingBid = await database.get(`
        SELECT * FROM bids WHERE job_id = ? AND bidder_uid = ?
      `, [jobId, bidderUid]);
      
      if (existingBid) {
        // Update existing bid
        const result = await database.run(`
          UPDATE bids 
          SET bid_amount = ?, message = ?, updated_at = CURRENT_TIMESTAMP
          WHERE job_id = ? AND bidder_uid = ?
          RETURNING id
        `, [bidAmount, message || '', jobId, bidderUid]);
        
        // Update bids_received count in jobs table
        await database.run(`
          UPDATE jobs SET bids_received = (
            SELECT COUNT(*) FROM bids WHERE job_id = ?
          ) WHERE id = ?
        `, [jobId, jobId]);
        
        return { success: true, bidId: existingBid.id, updated: true };
      }
      
      // Create new bid
      const result = await database.run(`
        INSERT INTO bids (job_id, bidder_uid, bidder_name, bid_amount, message)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
      `, [jobId, bidderUid, bidderName, bidAmount, message || '']);
      
      // Update bids_received count in jobs table
      await database.run(`
        UPDATE jobs SET bids_received = (
          SELECT COUNT(*) FROM bids WHERE job_id = ?
        ) WHERE id = ?
      `, [jobId, jobId]);
      
      return { success: true, bidId: result.lastID };
    } catch (error) {
      console.error('Error creating bid:', error);
      return { success: false, error: error.message };
    }
  },

  async getBidsByJobId(jobId) {
    if (USE_FILE_DB) {
      return [];
    }
    
    const database = await initDB();
    try {
      const bids = await database.all(`
        SELECT * FROM bids 
        WHERE job_id = ? 
        ORDER BY created_at DESC
      `, [jobId]);
      
      return bids;
    } catch (error) {
      console.error('Error fetching bids:', error);
      return [];
    }
  },

  async getBidByBidder(jobId, bidderUid) {
    if (USE_FILE_DB) {
      return null;
    }
    
    const database = await initDB();
    try {
      const bid = await database.get(`
        SELECT * FROM bids 
        WHERE job_id = ? AND bidder_uid = ?
      `, [jobId, bidderUid]);
      
      return bid;
    } catch (error) {
      console.error('Error fetching bid:', error);
      return null;
    }
  },

  async updateBidStatus(bidId, status) {
    if (USE_FILE_DB) {
      return { success: true };
    }
    
    const database = await initDB();
    try {
      const result = await database.run(`
        UPDATE bids 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [status, bidId]);
      
      return { success: result.changes > 0 };
    } catch (error) {
      console.error('Error updating bid status:', error);
      return { success: false, error: error.message };
    }
  }
};

// Chat operations
const chatOperations = {
  async createOrGetConversation(jobId, jobOwnerUid, participantUid, jobTitle) {
    const database = await initDB();
    try {
      // Check if conversation already exists
      const existingConversation = await database.get(`
        SELECT * FROM conversations 
        WHERE job_id = ? AND job_owner_uid = ? AND participant_uid = ?
      `, [jobId, jobOwnerUid, participantUid]);

      if (existingConversation) {
        return { success: true, conversationId: existingConversation.id };
      }

      // Create new conversation
      const result = await database.run(`
        INSERT INTO conversations (job_id, job_owner_uid, participant_uid, job_title)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `, [jobId, jobOwnerUid, participantUid, jobTitle]);

      return { success: true, conversationId: result.lastID };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error.message };
    }
  },

  async sendMessage(conversationId, senderUid, senderName, message) {
    const database = await initDB();
    try {
      // Insert message
      await database.run(`
        INSERT INTO conversation_messages (conversation_id, sender_uid, sender_name, message)
        VALUES (?, ?, ?, ?)
      `, [conversationId, senderUid, senderName, message]);

      // Update conversation last message
      await database.run(`
        UPDATE conversations 
        SET last_message = ?, last_message_time = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [message, conversationId]);

      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  },

  async getConversations(userUid) {
    const database = await initDB();
    try {
      const conversations = await database.all(`
        SELECT c.*, u1.display_name as job_owner_name, u2.display_name as participant_name
        FROM conversations c
        LEFT JOIN users u1 ON c.job_owner_uid = u1.firebase_uid
        LEFT JOIN users u2 ON c.participant_uid = u2.firebase_uid
        WHERE c.job_owner_uid = ? OR c.participant_uid = ?
        ORDER BY c.last_message_time DESC
      `, [userUid, userUid]);

      return { success: true, conversations };
    } catch (error) {
      console.error('Error getting conversations:', error);
      return { success: false, error: error.message };
    }
  },

  async getMessages(conversationId) {
    const database = await initDB();
    try {
      const messages = await database.all(`
        SELECT * FROM conversation_messages 
        WHERE conversation_id = ? 
        ORDER BY timestamp ASC
      `, [conversationId]);

      return { success: true, messages };
    } catch (error) {
      console.error('Error getting messages:', error);
      return { success: false, error: error.message };
    }
  }
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Security and logging
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
// Rate limiting configuration
// In development, disable rate limiting for localhost to avoid 429 errors during admin operations
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Helper to check if request is from localhost
const isLocalhostRequest = (req) => {
  const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
  const hostname = req.hostname || req.get('host') || '';
  const forwarded = req.get('x-forwarded-for') || '';
  
  return ip === '127.0.0.1' || 
         ip === '::1' || 
         ip === '::ffff:127.0.0.1' ||
         String(ip).includes('127.0.0.1') ||
         String(hostname).includes('localhost') ||
         String(forwarded).includes('127.0.0.1') ||
         String(forwarded).includes('localhost');
};

// General rate limiting - disabled for localhost in development
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // Increased from 100 to 500 requests per minute
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // In development, skip rate limiting for localhost
    const shouldSkip = isDevelopment && isLocalhostRequest(req);
    if (shouldSkip && req.method !== 'GET') {
      console.log(`[Rate Limit] Skipping general rate limit for localhost ${req.method} to ${req.path}`);
    }
    return shouldSkip;
  }
});

// Admin endpoints - very lenient rate limiting, disabled for localhost in development
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10000, // Very high limit for admin (10000 requests per minute)
  message: 'Too many admin requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // In development, always skip for localhost
    const shouldSkip = isDevelopment && isLocalhostRequest(req);
    if (shouldSkip) {
      console.log(`[Rate Limit] Skipping admin rate limit for localhost request to ${req.path}`);
    }
    return shouldSkip;
  }
});

// Apply general rate limiting - but completely bypass for localhost in development
app.use((req, res, next) => {
  if (isDevelopment && isLocalhostRequest(req)) {
    // Completely bypass rate limiting for localhost in development
    return next();
  }
  // Apply rate limiting for non-localhost or production
  generalLimiter(req, res, next);
});
app.use(express.json());

// Handle CORS preflight requests
app.options('*', cors());

// Initialize database (non-blocking - server will start even if DB init fails)
initializeDatabase().catch((error) => {
  console.error('Database initialization error:', error.message);
  console.log('Server will continue to start, but database operations may fail.');
  console.log('Please ensure PostgreSQL is running and credentials are correct.');
});

// Routes
// Auth helpers and middleware
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

const issueToken = (user) => {
  const payload = {
    uid: user.firebase_uid,
    userId: user.id,
    email: user.email,
    role: user.role || 'USER'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
};

const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
  next();
};

// JWT Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const db = await initDB();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = issueToken(user);
    await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    res.json({ token, role: user.role || 'USER', uid: user.firebase_uid });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
app.get('/api/jobs', async (req, res) => {
  try {
    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const jobs = await jobOperations.getAllJobs();
    console.log(`[GET /api/jobs] Returning ${jobs.length} jobs`);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.header('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
});

// User endpoint to request boost
app.post('/api/jobs/:id/boost', async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { user_uid } = req.body;
    
    if (!user_uid) {
      return res.status(400).json({ error: 'user_uid is required' });
    }
    
    // Verify job exists and belongs to user
    const job = await db.get('SELECT * FROM jobs WHERE id = ? AND firebase_uid = ?', [id, user_uid]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found or you do not have permission' });
    }
    
    // Check if boost already requested
    if (job.boost_requested) {
      return res.status(400).json({ error: 'Boost already requested for this job' });
    }
    
    // Request boost
    await db.run(
      'UPDATE jobs SET boost_requested = TRUE, boost_requested_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    res.json({ success: true, message: 'Boost request submitted. Waiting for admin approval.' });
  } catch (error) {
    console.error('Error requesting boost:', error);
    res.status(500).json({ error: 'Failed to request boost' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { jobData, user } = req.body;
    // Basic validation
    if (!user || !user.uid) {
      return res.status(400).json({ error: 'User must be logged in' });
    }
    const required = ['title','category','material','quantity','budget','location']
    for (const k of required) {
      if (jobData?.[k] === undefined || jobData?.[k] === null || (typeof jobData[k] === 'string' && jobData[k].trim() === '')) {
        return res.status(400).json({ error: `Missing required field: ${k}` });
      }
    }
    if (isNaN(Number(jobData.quantity)) || isNaN(Number(jobData.budget))) {
      return res.status(400).json({ error: 'Quantity and budget must be numeric' });
    }
    
    // Register user if not exists
    if (user) {
      await userOperations.createOrUpdateUser(user.uid, user.email, user.displayName);
    }
    
    const jobId = await jobOperations.createJob(jobData, user.uid);
    res.json({ success: true, jobId });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await jobOperations.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

app.get('/api/users/:uid/jobs', async (req, res) => {
  try {
    const jobs = await jobOperations.getJobsByUser(req.params.uid);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    res.status(500).json({ error: 'Failed to fetch user jobs' });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const success = await jobOperations.updateJob(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const success = await jobOperations.deleteJob(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Admin delete job endpoint
app.delete('/api/admin/jobs/:id', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const jobId = Number(id);
    
    if (isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }
    
    // Delete related data first (bids, conversations, messages)
    await db.run('DELETE FROM bids WHERE job_id = ?', [jobId]);
    await db.run('DELETE FROM conversation_messages WHERE conversation_id IN (SELECT id FROM conversations WHERE job_id = ?)', [jobId]);
    await db.run('DELETE FROM conversations WHERE job_id = ?', [jobId]);
    await db.run('DELETE FROM chat_requests WHERE job_id = ?', [jobId]);
    
    // Delete the job
    const result = await db.run('DELETE FROM jobs WHERE id = ?', [jobId]);
    if (result.changes > 0) {
      res.json({ success: true, message: 'Job deleted successfully' });
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job: ' + error.message });
  }
});

// Bid endpoints
app.post('/api/jobs/:id/bids', async (req, res) => {
  try {
    const { bidder_uid, bidder_name, bid_amount, message } = req.body;
    
    if (!bidder_uid || !bidder_name || !bid_amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await bidOperations.createBid(
      req.params.id,
      bidder_uid,
      bidder_name,
      bid_amount,
      message
    );
    
    if (result.success) {
      res.json({ 
        success: true, 
        bidId: result.bidId,
        updated: result.updated || false
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to create bid' });
    }
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ error: 'Failed to create bid' });
  }
});

app.get('/api/jobs/:id/bids', async (req, res) => {
  try {
    const bids = await bidOperations.getBidsByJobId(req.params.id);
    res.json(bids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

app.get('/api/jobs/:id/bids/:bidder_uid', async (req, res) => {
  try {
    const bid = await bidOperations.getBidByBidder(
      req.params.id,
      req.params.bidder_uid
    );
    
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    res.json(bid);
  } catch (error) {
    console.error('Error fetching bid:', error);
    res.status(500).json({ error: 'Failed to fetch bid' });
  }
});

app.put('/api/bids/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const result = await bidOperations.updateBidStatus(req.params.id, status);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: result.error || 'Failed to update bid status' });
    }
  } catch (error) {
    console.error('Error updating bid status:', error);
    res.status(500).json({ error: 'Failed to update bid status' });
  }
});

// Chat endpoints
app.post('/api/chat/conversations', async (req, res) => {
  try {
    const { jobId, jobOwnerUid, participantUid, jobTitle } = req.body;
    const result = await chatOperations.createOrGetConversation(jobId, jobOwnerUid, participantUid, jobTitle);
    res.json(result);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/chat/messages', async (req, res) => {
  try {
    const { conversationId, senderUid, senderName, message } = req.body;
    const result = await chatOperations.sendMessage(conversationId, senderUid, senderName, message);
    res.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/chat/conversations/:userUid', async (req, res) => {
  try {
    const result = await chatOperations.getConversations(req.params.userUid);
    res.json(result);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/chat/messages/:conversationId', async (req, res) => {
  try {
    const result = await chatOperations.getMessages(req.params.conversationId);
    res.json(result);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Admin endpoints (no auth required - using simple admin login)
// Apply more lenient rate limiting to admin endpoints
app.get('/api/admin/users', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    const { search } = req.query;
    let query = `
      SELECT id, firebase_uid, email, display_name, created_at, last_login, role,
             can_chat, can_sell, can_buy, is_seller_approved
      FROM users 
    `;
    const params = [];

    if (search) {
      query += ' WHERE LOWER(email) LIKE LOWER(?) OR LOWER(display_name) LIKE LOWER(?) OR LOWER(firebase_uid) LIKE LOWER(?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';
    const users = await database.all(query, params);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/admin/users/:userId', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { userId } = req.params;
    const { email, display_name, role, can_chat, can_sell, can_buy, is_seller_approved } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
    if (display_name !== undefined) { updateFields.push('display_name = ?'); updateValues.push(display_name); }
    if (role !== undefined) { updateFields.push('role = ?'); updateValues.push(role); }
    if (can_chat !== undefined) { updateFields.push('can_chat = ?'); updateValues.push(can_chat === true || can_chat === 'true'); }
    if (can_sell !== undefined) { updateFields.push('can_sell = ?'); updateValues.push(can_sell === true || can_sell === 'true'); }
    if (can_buy !== undefined) { updateFields.push('can_buy = ?'); updateValues.push(can_buy === true || can_buy === 'true'); }
    if (is_seller_approved !== undefined) { updateFields.push('is_seller_approved = ?'); updateValues.push(is_seller_approved === true || is_seller_approved === 'true'); }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const result = await db.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/admin/users/:userId', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    const { userId } = req.params;
    
    // Delete user's jobs first (due to foreign key constraint)
    await database.run('DELETE FROM jobs WHERE user_id = ?', [userId]);
    
    // Delete user's conversations and messages
    await database.run(`
      DELETE FROM conversation_messages 
      WHERE conversation_id IN (
        SELECT id FROM conversations WHERE job_owner_uid = (
          SELECT firebase_uid FROM users WHERE id = ?
        ) OR participant_uid = (
          SELECT firebase_uid FROM users WHERE id = ?
        )
      )
    `, [userId, userId]);
    
    await database.run(`
      DELETE FROM conversations 
      WHERE job_owner_uid = (
        SELECT firebase_uid FROM users WHERE id = ?
      ) OR participant_uid = (
        SELECT firebase_uid FROM users WHERE id = ?
      )
    `, [userId, userId]);
    
    // Finally delete the user
    await database.run('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/admin/stats', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    
    const userCountRows = await database.all('SELECT COUNT(*) as count FROM users');
    const jobCountRows = await database.all('SELECT COUNT(*) as count FROM jobs');
    const conversationCountRows = await database.all('SELECT COUNT(*) as count FROM conversations');
    const messageCountRows = await database.all('SELECT COUNT(*) as count FROM conversation_messages');
    
    const userCount = userCountRows[0]?.count || 0;
    const jobCount = jobCountRows[0]?.count || 0;
    const conversationCount = conversationCountRows[0]?.count || 0;
    const messageCount = messageCountRows[0]?.count || 0;
    
    res.json({
      totalUsers: userCount,
      totalJobs: jobCount,
      totalConversations: conversationCount,
      totalMessages: messageCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const db = await initDB();
    // Only show approved products to regular users
    const products = await db.all('SELECT * FROM products WHERE is_approved = TRUE ORDER BY created_at DESC');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Admin endpoint to get all products including unapproved
app.get('/api/admin/products', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const products = await db.all('SELECT * FROM products ORDER BY created_at DESC');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Admin endpoint to update product approval
app.put('/api/admin/products/:id', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { is_approved, name, price, category, image } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    if (is_approved !== undefined) { updateFields.push('is_approved = ?'); updateValues.push(is_approved === true || is_approved === 'true'); }
    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(price); }
    if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
    if (image !== undefined) { updateFields.push('image = ?'); updateValues.push(image); }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateValues.push(id);
    const result = await db.run(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin delete product endpoint
app.delete('/api/admin/products/:id', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const productId = Number(id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    
    // Delete related cart items and order items first
    await db.run('DELETE FROM cart_items WHERE product_id = ?', [productId]);
    await db.run('DELETE FROM order_items WHERE product_id = ?', [productId]);
    
    // Delete the product
    const result = await db.run('DELETE FROM products WHERE id = ?', [productId]);
    if (result.changes > 0) {
      res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product: ' + error.message });
  }
});

// Machinery endpoints
app.get('/api/machinery', async (req, res) => {
  try {
    const db = await initDB();
    // Only show approved machinery to regular users
    const machinery = await db.all('SELECT * FROM machinery WHERE is_approved = TRUE ORDER BY created_at DESC');
    res.json(machinery);
  } catch (error) {
    console.error('Error fetching machinery:', error);
    res.status(500).json({ error: 'Failed to fetch machinery' });
  }
});

// User machinery endpoints
app.post('/api/machinery', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { firebase_uid } = req.user;
    
    // Check if user has permission to sell and is seller approved
    const permissions = await getUserPermissions(db, firebase_uid);
    if (!permissions || !permissions.can_sell || !permissions.is_seller_approved) {
      return res.status(403).json({ error: 'Selling permission not approved. Please contact admin for seller approval.' });
    }
    
    const {
      name, category, capacity, price, unit, image, location,
      supplier, rating, in_stock, year, condition, description,
      specifications, features
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    // Get user ID
    const userRows = await db.all('SELECT id FROM users WHERE firebase_uid = ?', [firebase_uid]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userId = userRows[0].id;

    const result = await db.run(`
      INSERT INTO machinery (
        user_id, firebase_uid, name, category, capacity, price, unit, image, location,
        supplier, rating, in_stock, year, condition, description,
        specifications, features, is_approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `, [
      userId, firebase_uid, name, category || null, capacity || null, price, unit || 'piece',
      image || null, location || null, supplier || null, rating || 0,
      in_stock !== undefined ? in_stock : true, year || null, condition || null,
      description || null,
      specifications ? JSON.stringify(specifications) : null,
      features ? JSON.stringify(features) : null,
      false // New machinery requires admin approval
    ]);

    res.json({ success: true, id: result.lastID, message: 'Machinery listing created. Pending admin approval.' });
  } catch (error) {
    console.error('Error creating machinery:', error);
    res.status(500).json({ error: 'Failed to create machinery' });
  }
});

app.get('/api/users/:uid/machinery', async (req, res) => {
  try {
    const db = await initDB();
    const { uid } = req.params;
    const machinery = await db.all(
      'SELECT * FROM machinery WHERE firebase_uid = ? ORDER BY created_at DESC',
      [uid]
    );
    res.json(machinery);
  } catch (error) {
    console.error('Error fetching user machinery:', error);
    res.status(500).json({ error: 'Failed to fetch user machinery' });
  }
});

app.put('/api/machinery/:id', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { firebase_uid } = req.user;
    const {
      name, category, capacity, price, unit, image, location,
      supplier, rating, in_stock, year, condition, description,
      specifications, features
    } = req.body;

    // Check if user owns this machinery
    const machinery = await db.get('SELECT firebase_uid FROM machinery WHERE id = ?', [id]);
    if (!machinery) {
      return res.status(404).json({ error: 'Machinery not found' });
    }
    if (machinery.firebase_uid !== firebase_uid) {
      return res.status(403).json({ error: 'You can only edit your own machinery' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
    if (capacity !== undefined) { updateFields.push('capacity = ?'); updateValues.push(capacity); }
    if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(price); }
    if (unit !== undefined) { updateFields.push('unit = ?'); updateValues.push(unit); }
    if (image !== undefined) { updateFields.push('image = ?'); updateValues.push(image); }
    if (location !== undefined) { updateFields.push('location = ?'); updateValues.push(location); }
    if (supplier !== undefined) { updateFields.push('supplier = ?'); updateValues.push(supplier); }
    if (rating !== undefined) { updateFields.push('rating = ?'); updateValues.push(rating); }
    if (in_stock !== undefined) { updateFields.push('in_stock = ?'); updateValues.push(in_stock); }
    if (year !== undefined) { updateFields.push('year = ?'); updateValues.push(year); }
    if (condition !== undefined) { updateFields.push('condition = ?'); updateValues.push(condition); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (specifications !== undefined) { updateFields.push('specifications = ?'); updateValues.push(JSON.stringify(specifications)); }
    if (features !== undefined) { updateFields.push('features = ?'); updateValues.push(JSON.stringify(features)); }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const result = await db.run(
      `UPDATE machinery SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Machinery not found' });
    }
  } catch (error) {
    console.error('Error updating machinery:', error);
    res.status(500).json({ error: 'Failed to update machinery' });
  }
});

app.delete('/api/machinery/:id', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { firebase_uid } = req.user;

    // Check if user owns this machinery
    const machinery = await db.get('SELECT firebase_uid FROM machinery WHERE id = ?', [id]);
    if (!machinery) {
      return res.status(404).json({ error: 'Machinery not found' });
    }
    if (machinery.firebase_uid !== firebase_uid) {
      return res.status(403).json({ error: 'You can only delete your own machinery' });
    }

    const result = await db.run('DELETE FROM machinery WHERE id = ?', [id]);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Machinery not found' });
    }
  } catch (error) {
    console.error('Error deleting machinery:', error);
    res.status(500).json({ error: 'Failed to delete machinery' });
  }
});

// Admin machinery endpoints
// Admin Jobs endpoints
app.get('/api/admin/jobs', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { search } = req.query;
    let query = `
      SELECT j.*, u.display_name as user_name, u.email as user_email, u.firebase_uid
      FROM jobs j
      LEFT JOIN users u ON j.user_id = u.id
    `;
    const params = [];

    if (search) {
      query += ' WHERE LOWER(j.title) LIKE LOWER(?) OR LOWER(j.category) LIKE LOWER(?) OR LOWER(j.client) LIKE LOWER(?) OR LOWER(u.display_name) LIKE LOWER(?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY 
        CASE 
          WHEN j.priority = 'high' THEN 1
          WHEN j.priority = 'normal' THEN 2
          WHEN j.priority = 'low' THEN 3
          ELSE 4
        END,
        j.posted_date DESC`;
    
    const jobs = await db.all(query, params);
    res.json(jobs.map(job => ({
      ...job,
      requirements: job.requirements ? (typeof job.requirements === 'string' ? JSON.parse(job.requirements) : job.requirements) : {},
      specifications: job.specifications ? (typeof job.specifications === 'string' ? JSON.parse(job.specifications) : job.specifications) : []
    })));
  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.put('/api/admin/jobs/:id/priority', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { priority } = req.body;
    
    if (!priority || !['high', 'normal', 'low'].includes(priority)) {
      return res.status(400).json({ error: 'Priority must be high, normal, or low' });
    }
    
    await db.run(
      'UPDATE jobs SET priority = ?, boost_approved = ?, boost_approved_at = ? WHERE id = ?',
      [priority, priority === 'high' ? true : false, priority === 'high' ? new Date().toISOString() : null, id]
    );
    
    res.json({ success: true, message: `Job priority set to ${priority}` });
  } catch (error) {
    console.error('Error updating job priority:', error);
    res.status(500).json({ error: 'Failed to update job priority' });
  }
});

app.put('/api/admin/jobs/:id/boost', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { approved } = req.body;
    
    if (typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'approved must be a boolean' });
    }
    
    if (approved) {
      // Approve boost - set priority to high
      await db.run(
        'UPDATE jobs SET boost_approved = TRUE, boost_approved_at = CURRENT_TIMESTAMP, priority = ? WHERE id = ?',
        ['high', id]
      );
    } else {
      // Reject boost - keep priority as normal
      await db.run(
        'UPDATE jobs SET boost_approved = FALSE, boost_requested = FALSE WHERE id = ?',
        [id]
      );
    }
    
    res.json({ success: true, message: approved ? 'Boost approved' : 'Boost rejected' });
  } catch (error) {
    console.error('Error updating boost status:', error);
    res.status(500).json({ error: 'Failed to update boost status' });
  }
});

app.put('/api/admin/jobs/:id', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const {
      title, category, material, quantity, budget, location, client,
      deadline, description, requirements, specifications, estimated_duration, status
    } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) { updateFields.push('title = ?'); updateValues.push(title); }
    if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
    if (material !== undefined) { updateFields.push('material = ?'); updateValues.push(material); }
    if (quantity !== undefined) { updateFields.push('quantity = ?'); updateValues.push(quantity); }
    if (budget !== undefined) { updateFields.push('budget = ?'); updateValues.push(budget); }
    if (location !== undefined) { updateFields.push('location = ?'); updateValues.push(location); }
    if (client !== undefined) { updateFields.push('client = ?'); updateValues.push(client); }
    if (deadline !== undefined) { updateFields.push('deadline = ?'); updateValues.push(deadline); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (requirements !== undefined) { updateFields.push('requirements = ?'); updateValues.push(JSON.stringify(requirements)); }
    if (specifications !== undefined) { updateFields.push('specifications = ?'); updateValues.push(JSON.stringify(specifications)); }
    if (estimated_duration !== undefined) { updateFields.push('estimated_duration = ?'); updateValues.push(estimated_duration); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status); }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const result = await db.run(
      `UPDATE jobs SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

app.get('/api/admin/machinery', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { search } = req.query;
    let query = 'SELECT m.*, u.display_name as user_name, u.email as user_email FROM machinery m LEFT JOIN users u ON m.user_id = u.id';
    const params = [];

    if (search) {
      query += ' WHERE LOWER(m.name) LIKE LOWER(?) OR LOWER(m.category) LIKE LOWER(?) OR LOWER(m.supplier) LIKE LOWER(?) OR LOWER(u.display_name) LIKE LOWER(?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY m.category, m.created_at DESC';
    const machinery = await db.all(query, params);
    res.json(machinery);
  } catch (error) {
    console.error('Error fetching machinery for admin:', error);
    res.status(500).json({ error: 'Failed to fetch machinery' });
  }
});

app.put('/api/admin/machinery/:id', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const {
      name, category, capacity, price, unit, image, location,
      supplier, rating, in_stock, year, condition, description,
      specifications, features, is_approved
    } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (category !== undefined) { updateFields.push('category = ?'); updateValues.push(category); }
    if (capacity !== undefined) { updateFields.push('capacity = ?'); updateValues.push(capacity); }
    if (price !== undefined) { updateFields.push('price = ?'); updateValues.push(price); }
    if (unit !== undefined) { updateFields.push('unit = ?'); updateValues.push(unit); }
    if (image !== undefined) { updateFields.push('image = ?'); updateValues.push(image); }
    if (location !== undefined) { updateFields.push('location = ?'); updateValues.push(location); }
    if (supplier !== undefined) { updateFields.push('supplier = ?'); updateValues.push(supplier); }
    if (rating !== undefined) { updateFields.push('rating = ?'); updateValues.push(rating); }
    if (in_stock !== undefined) { updateFields.push('in_stock = ?'); updateValues.push(in_stock); }
    if (year !== undefined) { updateFields.push('year = ?'); updateValues.push(year); }
    if (condition !== undefined) { updateFields.push('condition = ?'); updateValues.push(condition); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description); }
    if (specifications !== undefined) { updateFields.push('specifications = ?'); updateValues.push(JSON.stringify(specifications)); }
    if (features !== undefined) { updateFields.push('features = ?'); updateValues.push(JSON.stringify(features)); }
    if (is_approved !== undefined) { updateFields.push('is_approved = ?'); updateValues.push(is_approved === true || is_approved === 'true'); }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const result = await db.run(
      `UPDATE machinery SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Machinery not found' });
    }
  } catch (error) {
    console.error('Error updating machinery:', error);
    res.status(500).json({ error: 'Failed to update machinery' });
  }
});

app.delete('/api/admin/machinery/:id', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const machineryId = Number(id);
    
    if (isNaN(machineryId)) {
      return res.status(400).json({ error: 'Invalid machinery ID' });
    }
    
    // Delete related cart items and order items first
    await db.run('DELETE FROM cart_items WHERE machinery_id = ?', [machineryId]);
    await db.run('DELETE FROM order_items WHERE machinery_id = ?', [machineryId]);
    
    // Delete the machinery
    const result = await db.run('DELETE FROM machinery WHERE id = ?', [machineryId]);
    if (result.changes > 0) {
      res.json({ success: true, message: 'Machinery deleted successfully' });
    } else {
      res.status(404).json({ error: 'Machinery not found' });
    }
  } catch (error) {
    console.error('Error deleting machinery:', error);
    res.status(500).json({ error: 'Failed to delete machinery: ' + error.message });
  }
});
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
grep

app.post('/api/admin/machinery', async (req, res) => {
  try {
    const db = await initDB();
    const {
      name, category, capacity, price, unit, image, location,
      supplier, rating, in_stock, year, condition, description,
      specifications, features
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required' });
    }

    const result = await db.run(`
      INSERT INTO machinery (
        name, category, capacity, price, unit, image, location,
        supplier, rating, in_stock, year, condition, description,
        specifications, features
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `, [
      name, category || null, capacity || null, price, unit || 'piece',
      image || null, location || null, supplier || null, rating || 0,
      in_stock !== undefined ? in_stock : true, year || null, condition || null,
      description || null,
      specifications ? JSON.stringify(specifications) : null,
      features ? JSON.stringify(features) : null
    ]);

    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error creating machinery:', error);
    res.status(500).json({ error: 'Failed to create machinery' });
  }
});

// Seed machinery from hardcoded data (one-time migration)
app.post('/api/admin/seed/machinery', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const machineryData = [
      {
        name: "Injection Molding Machine 150T",
        category: "Injection Molding",
        capacity: "150 Ton",
        price: 2500000,
        unit: "piece",
        image: "/images/injection-molding.svg",
        location: "Mumbai",
        supplier: "MachTech Industries",
        rating: 4.6,
        in_stock: true,
        year: 2023,
        condition: "New",
        description: "High-precision injection molding machine suitable for automotive and consumer goods manufacturing",
        specifications: { clampingForce: "150 Ton", shotSize: "500g", injectionPressure: "2000 bar", plattenSize: "600x600mm" },
        features: ["Servo motor drive system", "Touch screen control panel", "Energy efficient heating", "Automatic lubrication system"]
      },
      {
        name: "Blow Molding Machine 5L",
        category: "Blow Molding",
        capacity: "5 Liter",
        price: 1800000,
        unit: "piece",
        image: "/images/blow-molding.svg",
        location: "Delhi",
        supplier: "Blow Tech Solutions",
        rating: 4.4,
        in_stock: true,
        year: 2022,
        condition: "New",
        description: "Automatic blow molding machine for PET bottles and containers up to 5 liters",
        specifications: { maxBottleVolume: "5 Liter", cavities: "4", cycleTime: "8 seconds", airPressure: "40 bar" },
        features: ["Automatic preform loading", "Infrared heating system", "Quality control sensors", "Easy mold changeover"]
      },
      {
        name: "Extrusion Line HDPE Pipe",
        category: "Extrusion",
        capacity: "200mm Diameter",
        price: 3200000,
        unit: "piece",
        image: "/images/extruder.svg",
        location: "Chennai",
        supplier: "Extrusion Masters",
        rating: 4.7,
        in_stock: true,
        year: 2023,
        condition: "New",
        description: "Complete HDPE pipe extrusion line with cooling and cutting systems",
        specifications: { pipeSize: "20-200mm", extruderSize: "90mm", lineSpeed: "0.5-8 m/min", coolingLength: "6 meters" },
        features: ["Automatic diameter control", "Vacuum calibration tank", "Planetary cutting system", "PLC control system"]
      },
      {
        name: "Thermoforming Machine",
        category: "Thermoforming",
        capacity: "600x400mm",
        price: 1200000,
        unit: "piece",
        image: "/images/thermoforming.svg",
        location: "Bangalore",
        supplier: "Thermo Solutions Ltd",
        rating: 4.3,
        in_stock: true,
        year: 2022,
        condition: "Used",
        description: "Automatic thermoforming machine for packaging and disposable products",
        specifications: { formingArea: "600x400mm", materialThickness: "0.2-2mm", cycleTime: "15 seconds", heatingZones: "6" },
        features: ["Pneumatic forming system", "Automatic trim removal", "Digital temperature control", "Quick mold change system"]
      },
      {
        name: "Rotomolding Machine",
        category: "Rotomolding",
        capacity: "3000L",
        price: 2800000,
        unit: "piece",
        image: "/images/rotomold-machine.svg",
        location: "Pune",
        supplier: "Roto Tech Industries",
        rating: 4.5,
        in_stock: false,
        year: 2021,
        condition: "Used",
        description: "Multi-arm rotomolding machine for large containers and tanks",
        specifications: { maxCapacity: "3000 Liter", arms: "3", ovenTemp: "350°C", coolingTime: "30 min" },
        features: ["Independent arm control", "Gas heating system", "Water spray cooling", "Safety interlock system"]
      },
      {
        name: "Film Blowing Machine",
        category: "Film Blowing",
        capacity: "1200mm Width",
        price: 2200000,
        unit: "piece",
        image: "/images/film-machine.svg",
        location: "Ahmedabad",
        supplier: "Film Tech Corp",
        rating: 4.2,
        in_stock: true,
        year: 2023,
        condition: "New",
        description: "High-speed film blowing machine for LDPE and HDPE films",
        specifications: { filmWidth: "1200mm", extruderSize: "65mm", outputRate: "80 kg/hr", layFlatWidth: "600mm" },
        features: ["Auto bubble control", "Corona treatment system", "Automatic winding", "Thickness control system"]
      },
      {
        name: "Granulator Machine",
        category: "Recycling",
        capacity: "500 kg/hr",
        price: 450000,
        unit: "piece",
        image: "/images/granulator.svg",
        location: "Mumbai",
        supplier: "Recycle Tech Solutions",
        rating: 4.4,
        in_stock: true,
        year: 2022,
        condition: "New",
        description: "Heavy-duty granulator for plastic waste recycling and size reduction",
        specifications: { capacity: "500 kg/hr", rotorDiameter: "400mm", screenSize: "8-20mm", motorPower: "37 kW" },
        features: ["Hardened steel blades", "Sound enclosure", "Magnetic separator", "Dust collection system"]
      },
      {
        name: "Washing Line Complete",
        category: "Recycling",
        capacity: "1000 kg/hr",
        price: 1500000,
        unit: "piece",
        image: "/images/washing-line.svg",
        location: "Delhi",
        supplier: "Clean Tech Industries",
        rating: 4.6,
        in_stock: true,
        year: 2023,
        condition: "New",
        description: "Complete plastic washing line for PET bottle recycling",
        specifications: { capacity: "1000 kg/hr", washingStages: "3", waterConsumption: "2 m³/hr", dryingTemp: "180°C" },
        features: ["Label removal system", "Hot wash tank", "Friction washer", "Centrifugal dryer"]
      }
    ];

    let inserted = 0;
    let skipped = 0;

    for (const machine of machineryData) {
      try {
        // Check if machinery already exists by name
        const existing = await db.get('SELECT id FROM machinery WHERE name = ?', [machine.name]);
        if (existing) {
          skipped++;
          continue;
        }

        const result = await db.run(`
          INSERT INTO machinery (
            name, category, capacity, price, unit, image, location,
            supplier, rating, in_stock, year, condition, description,
            specifications, features
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING id
        `, [
          machine.name, machine.category, machine.capacity, machine.price, machine.unit,
          machine.image, machine.location, machine.supplier, machine.rating, machine.in_stock,
          machine.year, machine.condition, machine.description,
          machine.specifications ? JSON.stringify(machine.specifications) : null,
          machine.features ? JSON.stringify(machine.features) : null
        ]);

        if (result && result.lastID) {
          inserted++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Error inserting ${machine.name}:`, error.message);
        skipped++;
      }
    }

    res.json({ 
      success: true, 
      message: `Migration complete: ${inserted} inserted, ${skipped} skipped`,
      inserted,
      skipped
    });
  } catch (error) {
    console.error('Error seeding machinery:', error);
    res.status(500).json({ error: 'Failed to seed machinery' });
  }
});

// Chat Permission endpoints
app.post('/api/chat-permissions/request', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { firebase_uid } = req.user;
    const { seller_uid, seller_name, machinery_id } = req.body;

    if (!seller_uid || !machinery_id) {
      return res.status(400).json({ error: 'seller_uid and machinery_id are required' });
    }

    // Get requester name
    const requester = await db.get('SELECT display_name FROM users WHERE firebase_uid = ?', [firebase_uid]);
    const requester_name = requester?.display_name || 'Unknown';

    // Check if request already exists
    const existing = await db.get(
      'SELECT id, status FROM chat_permissions WHERE requester_uid = ? AND seller_uid = ? AND machinery_id = ?',
      [firebase_uid, seller_uid, machinery_id]
    );

    if (existing) {
      if (existing.status === 'approved') {
        return res.json({ success: true, message: 'Permission already approved', permission_id: existing.id });
      }
      return res.json({ success: true, message: 'Request already pending', permission_id: existing.id });
    }

    // Create new request
    const result = await db.run(`
      INSERT INTO chat_permissions (requester_uid, requester_name, seller_uid, seller_name, machinery_id, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
      RETURNING id
    `, [firebase_uid, requester_name, seller_uid, seller_name, machinery_id]);

    res.json({ success: true, permission_id: result.lastID, message: 'Chat permission request sent to admin' });
  } catch (error) {
    console.error('Error requesting chat permission:', error);
    res.status(500).json({ error: 'Failed to request chat permission' });
  }
});

app.get('/api/admin/chat-permissions', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { status } = req.query;
    let query = `
      SELECT cp.*, m.name as machinery_name, m.image as machinery_image
      FROM chat_permissions cp
      LEFT JOIN machinery m ON cp.machinery_id = m.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE cp.status = ?';
      params.push(status);
    }

    query += ' ORDER BY cp.requested_at DESC';
    const permissions = await db.all(query, params);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching chat permissions:', error);
    res.status(500).json({ error: 'Failed to fetch chat permissions' });
  }
});

app.put('/api/admin/chat-permissions/:id/approve', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { approved, admin_uid } = req.body;

    const permission = await db.get('SELECT * FROM chat_permissions WHERE id = ?', [id]);
    if (!permission) {
      return res.status(404).json({ error: 'Permission request not found' });
    }

    if (approved) {
      // Approve permission
      await db.run(`
        UPDATE chat_permissions 
        SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = ?
        WHERE id = ?
      `, [admin_uid || 'admin', id]);

      // Create or update machinery conversation
      await db.run(`
        INSERT INTO machinery_conversations (machinery_id, seller_uid, buyer_uid, permission_granted)
        VALUES (?, ?, ?, TRUE)
        ON CONFLICT (machinery_id, seller_uid, buyer_uid) 
        DO UPDATE SET permission_granted = TRUE
      `, [permission.machinery_id, permission.seller_uid, permission.requester_uid]);
    } else {
      // Reject permission
      await db.run(`
        UPDATE chat_permissions 
        SET status = 'rejected', revoked_at = CURRENT_TIMESTAMP, revoked_by = ?
        WHERE id = ?
      `, [admin_uid || 'admin', id]);
    }

    res.json({ success: true, message: approved ? 'Permission approved' : 'Permission rejected' });
  } catch (error) {
    console.error('Error updating chat permission:', error);
    res.status(500).json({ error: 'Failed to update chat permission' });
  }
});

app.put('/api/admin/chat-permissions/:id/revoke', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { admin_uid } = req.body;

    const permission = await db.get('SELECT * FROM chat_permissions WHERE id = ?', [id]);
    if (!permission) {
      return res.status(404).json({ error: 'Permission request not found' });
    }

    // Revoke permission
    await db.run(`
      UPDATE chat_permissions 
      SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP, revoked_by = ?
      WHERE id = ?
    `, [admin_uid || 'admin', id]);

    // Update machinery conversation
    await db.run(`
      UPDATE machinery_conversations 
      SET permission_granted = FALSE
      WHERE machinery_id = ? AND seller_uid = ? AND buyer_uid = ?
    `, [permission.machinery_id, permission.seller_uid, permission.requester_uid]);

    res.json({ success: true, message: 'Permission revoked' });
  } catch (error) {
    console.error('Error revoking chat permission:', error);
    res.status(500).json({ error: 'Failed to revoke chat permission' });
  }
});

// Admin can view all conversations
app.get('/api/admin/conversations', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const conversations = await db.all(`
      SELECT c.*, u1.display_name as job_owner_name, u2.display_name as participant_name, j.title as job_title
      FROM conversations c
      LEFT JOIN users u1 ON c.job_owner_uid = u1.firebase_uid
      LEFT JOIN users u2 ON c.participant_uid = u2.firebase_uid
      LEFT JOIN jobs j ON c.job_id = j.id
      ORDER BY c.last_message_time DESC
    `);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching admin conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/api/admin/machinery-conversations', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const conversations = await db.all(`
      SELECT mc.*, m.name as machinery_name, m.image as machinery_image,
             u1.display_name as seller_name, u2.display_name as buyer_name
      FROM machinery_conversations mc
      LEFT JOIN machinery m ON mc.machinery_id = m.id
      LEFT JOIN users u1 ON mc.seller_uid = u1.firebase_uid
      LEFT JOIN users u2 ON mc.buyer_uid = u2.firebase_uid
      ORDER BY mc.last_message_time DESC
    `);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching admin machinery conversations:', error);
    res.status(500).json({ error: 'Failed to fetch machinery conversations' });
  }
});

app.get('/api/admin/conversations/:conversationId/messages', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { conversationId } = req.params;
    const messages = await db.all(`
      SELECT * FROM conversation_messages
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `, [conversationId]);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.get('/api/admin/machinery-conversations/:conversationId/messages', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { conversationId } = req.params;
    const messages = await db.all(`
      SELECT * FROM machinery_messages
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `, [conversationId]);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching machinery conversation messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Helpers for cart
const getUserIdByFirebaseUid = async (db, firebaseUid) => {
  try {
    const rows = await db.all('SELECT id FROM users WHERE firebase_uid = ?', [firebaseUid]);
    return rows[0]?.id || null;
  } catch (error) {
    console.error('[getUserIdByFirebaseUid] Error:', error);
    throw error;
  }
};

const getUserPermissions = async (db, firebaseUid) => {
  try {
    const user = await db.get(
      'SELECT can_chat, can_sell, can_buy, is_seller_approved, role FROM users WHERE firebase_uid = ?',
      [firebaseUid]
    );
    if (!user) return null;
    return {
      can_chat: user.can_chat === true || user.role === 'ADMIN',
      can_sell: user.can_sell === true || user.role === 'ADMIN',
      can_buy: user.can_buy === true || user.role === 'ADMIN',
      is_seller_approved: user.is_seller_approved === true || user.role === 'ADMIN',
      role: user.role
    };
  } catch (error) {
    console.error('[getUserPermissions] Error:', error);
    return null;
  }
};

const checkProductApproval = async (db, productId) => {
  try {
    const product = await db.get('SELECT is_approved FROM products WHERE id = ?', [productId]);
    return product?.is_approved === true;
  } catch (error) {
    console.error('[checkProductApproval] Error:', error);
    return false;
  }
};

const checkMachineryApproval = async (db, machineryId) => {
  try {
    const machinery = await db.get('SELECT is_approved FROM machinery WHERE id = ?', [machineryId]);
    return machinery?.is_approved === true;
  } catch (error) {
    console.error('[checkMachineryApproval] Error:', error);
    return false;
  }
};

const getOrCreateCartId = async (db, userId) => {
  const existing = await db.get('SELECT id FROM carts WHERE user_id = ?', [userId]);
  if (existing?.id) return existing.id;
  const result = await db.run('INSERT INTO carts (user_id) VALUES (?) RETURNING id', [userId]);
  return result.lastID;
};

// Cart endpoints
app.get('/api/cart', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { firebase_uid } = req.query;
    const uid = req.user?.uid || firebase_uid;
    if (!uid) return res.status(400).json({ error: 'firebase_uid required' });
    const userId = await getUserIdByFirebaseUid(db, uid);
    if (!userId) return res.status(404).json({ error: 'User not found' });
    const cartId = await getOrCreateCartId(db, userId);
    const items = await db.all(`
      SELECT ci.id, ci.qty, ci.price_snapshot, p.id as product_id, p.name, p.image, p.category
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at DESC
    `, [cartId]);
    res.json({ cartId, items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post('/api/cart/items', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { firebase_uid, product_id, qty } = req.body;
    if (!firebase_uid || !product_id || !qty || qty <= 0) {
      return res.status(400).json({ error: 'firebase_uid, product_id, qty required' });
    }
    if (req.user?.uid && req.user.uid !== firebase_uid) return res.status(403).json({ error: 'Forbidden' });
    
    // Check if user has permission to buy
    const permissions = await getUserPermissions(db, firebase_uid);
    if (!permissions || !permissions.can_buy) {
      return res.status(403).json({ error: 'Buying permission not approved. Please contact admin for approval.' });
    }
    
    // Check if product is approved
    const isProductApproved = await checkProductApproval(db, product_id);
    if (!isProductApproved) {
      return res.status(403).json({ error: 'This product is pending admin approval and cannot be purchased yet.' });
    }
    
    const userId = await getUserIdByFirebaseUid(db, firebase_uid);
    if (!userId) return res.status(404).json({ error: 'User not found' });
    const cartId = await getOrCreateCartId(db, userId);
    const product = await db.get('SELECT price FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const priceSnapshot = Number(product.price);
    // If item exists, update qty; else insert
    const existing = await db.get('SELECT id, qty FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, product_id]);
    if (existing?.id) {
      await db.run('UPDATE cart_items SET qty = ?, price_snapshot = ? WHERE id = ?', [existing.qty + qty, priceSnapshot, existing.id]);
      return res.json({ success: true, id: existing.id });
    }
    const result = await db.run('INSERT INTO cart_items (cart_id, product_id, qty, price_snapshot) VALUES (?, ?, ?, ?) RETURNING id', [cartId, product_id, qty, priceSnapshot]);
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error adding cart item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

app.patch('/api/cart/items/:id', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { qty } = req.body;
    if (qty === undefined) return res.status(400).json({ error: 'qty required' });
    if (qty <= 0) {
      await db.run('DELETE FROM cart_items WHERE id = ?', [id]);
      return res.json({ success: true, deleted: true });
    }
    await db.run('UPDATE cart_items SET qty = ? WHERE id = ?', [qty, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/cart/items/:id', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    await db.run('DELETE FROM cart_items WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Checkout endpoint: creates order from cart, empties cart
app.post('/api/checkout', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { firebase_uid, address, paymentMethod } = req.body;
    if (!firebase_uid) return res.status(400).json({ error: 'firebase_uid required' });
    if (req.user?.uid && req.user.uid !== firebase_uid) return res.status(403).json({ error: 'Forbidden' });
    
    // Check if user has permission to buy
    const permissions = await getUserPermissions(db, firebase_uid);
    if (!permissions || !permissions.can_buy) {
      return res.status(403).json({ error: 'Buying permission not approved. Please contact admin for approval.' });
    }
    
    const userId = await getUserIdByFirebaseUid(db, firebase_uid);
    if (!userId) return res.status(404).json({ error: 'User not found' });
    const cartId = await getOrCreateCartId(db, userId);
    const items = await db.all('SELECT * FROM cart_items WHERE cart_id = ?', [cartId]);
    if (items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    
    // Verify all products in cart are approved
    for (const it of items) {
      const isApproved = await checkProductApproval(db, it.product_id);
      if (!isApproved) {
        return res.status(403).json({ error: `Product ${it.product_id} is pending admin approval and cannot be purchased.` });
      }
    }
    
    const total = items.reduce((sum, it) => sum + Number(it.price_snapshot) * it.qty, 0);
    const orderResult = await db.run('INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?) RETURNING id', [userId, total, 'created']);
    const orderId = orderResult.lastID;
    for (const it of items) {
      await db.run('INSERT INTO order_items (order_id, product_id, qty, price_snapshot) VALUES (?, ?, ?, ?)', [orderId, it.product_id, it.qty, it.price_snapshot]);
    }
    // Empty cart
    await db.run('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    res.json({ success: true, orderId, total, address, paymentMethod });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Admin orders and reports
app.get('/api/admin/orders', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    const offset = (page - 1) * pageSize;
    const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?', [pageSize, offset]);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/admin/reports', async (req, res) => {
  try {
    const db = await initDB();
    const userCountRows = await db.all('SELECT COUNT(*) as count FROM users');
    const productCountRows = await db.all('SELECT COUNT(*) as count FROM products');
    const orderCountRows = await db.all('SELECT COUNT(*) as count FROM orders');
    
    const userCount = userCountRows[0]?.count || 0;
    const productCount = productCountRows[0]?.count || 0;
    const orderCount = orderCountRows[0]?.count || 0;
    const revenueRows = await db.all('SELECT COALESCE(SUM(total),0) as total FROM orders');
    const revenue = revenueRows[0]?.total || 0;
    const recentOrders = await db.all('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
    res.json({
      users: userCount,
      products: productCount,
      orders: orderCount,
      revenue: revenue,
      recentOrders
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
});

// Messages endpoints
app.post('/api/messages', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { sender_uid, receiver_uid, product_id, body } = req.body;
    if (!sender_uid || !receiver_uid || !body || !body.trim()) {
      return res.status(400).json({ error: 'sender_uid, receiver_uid, body required' });
    }
    if (req.user?.uid && req.user.uid !== sender_uid) return res.status(403).json({ error: 'Forbidden' });
    
    // Check if sender has permission to chat
    const senderPermissions = await getUserPermissions(db, sender_uid);
    if (!senderPermissions || !senderPermissions.can_chat) {
      return res.status(403).json({ error: 'Chat permission not approved. Please contact admin for approval.' });
    }
    
    // Check if sender has chatted before (required for chat access)
    const hasChatted = await hasUserChattedBefore(db, sender_uid);
    if (!hasChatted) {
      return res.status(403).json({ error: 'You need to have chatted with someone before. Please request chat access from admin first.' });
    }
    
    // Check if receiver has permission to chat
    const receiverPermissions = await getUserPermissions(db, receiver_uid);
    if (!receiverPermissions || !receiverPermissions.can_chat) {
      return res.status(403).json({ error: 'The recipient does not have chat permission approved.' });
    }
    
    const senderId = await getUserIdByFirebaseUid(db, sender_uid);
    const receiverId = await getUserIdByFirebaseUid(db, receiver_uid);
    if (!senderId || !receiverId) return res.status(404).json({ error: 'Users not found' });
    const result = await db.run('INSERT INTO messages (sender_id, receiver_id, product_id, body) VALUES (?, ?, ?, ?) RETURNING id', [senderId, receiverId, product_id || null, body.trim()]);
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/messages/thread', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { user_uid, peer_uid, product_id } = req.query;
    if (!user_uid || !peer_uid) return res.status(400).json({ error: 'user_uid and peer_uid required' });
    if (req.user?.uid && req.user.uid !== user_uid && req.user.uid !== peer_uid) return res.status(403).json({ error: 'Forbidden' });
    const userId = await getUserIdByFirebaseUid(db, user_uid);
    const peerId = await getUserIdByFirebaseUid(db, peer_uid);
    if (!userId || !peerId) return res.status(404).json({ error: 'Users not found' });
    const msgs = await db.all(`
      SELECT * FROM messages
      WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
        AND (COALESCE(product_id, -1) = COALESCE(?, -1))
      ORDER BY created_at ASC
    `, [userId, peerId, peerId, userId, product_id ? Number(product_id) : null]);
    res.json(msgs);
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages/read', requireAuth, async (req, res) => {
  try {
    const db = await initDB();
    const { user_uid, peer_uid } = req.body;
    const userId = await getUserIdByFirebaseUid(db, user_uid);
    const peerId = await getUserIdByFirebaseUid(db, peer_uid);
    if (!userId || !peerId) return res.status(404).json({ error: 'Users not found' });
    await db.run('UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE receiver_id = ? AND sender_id = ?', [userId, peerId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Helper to check if user has chatted before
const hasUserChattedBefore = async (db, firebaseUid) => {
  try {
    const userId = await getUserIdByFirebaseUid(db, firebaseUid);
    if (!userId) return false;
    const message = await db.get(
      'SELECT id FROM messages WHERE sender_id = ? OR receiver_id = ? LIMIT 1',
      [userId, userId]
    );
    return !!message;
  } catch (error) {
    console.error('[hasUserChattedBefore] Error:', error);
    return false;
  }
};

// Chat request endpoints
app.post('/api/chat/request', async (req, res) => {
  try {
    const db = await initDB();
    const { user_uid, user_name, user_email, job_id, reason } = req.body;
    
    if (!user_uid) {
      return res.status(400).json({ error: 'user_uid is required' });
    }
    
    // Check if request already exists
    const existing = await db.get(
      'SELECT id FROM chat_requests WHERE user_uid = ? AND job_id = ? AND status = ?',
      [user_uid, job_id || null, 'pending']
    );
    
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending chat request for this job' });
    }
    
    const result = await db.run(
      'INSERT INTO chat_requests (user_uid, user_name, user_email, job_id, reason, status) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      [user_uid, user_name || null, user_email || null, job_id || null, reason || null, 'pending']
    );
    
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error creating chat request:', error);
    res.status(500).json({ error: 'Failed to create chat request' });
  }
});

// Admin get all chat requests
app.get('/api/admin/chat-requests', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { status } = req.query;
    let query = `
      SELECT cr.*, j.title as job_title, j.client as job_client
      FROM chat_requests cr
      LEFT JOIN jobs j ON cr.job_id = j.id
    `;
    const params = [];
    
    if (status) {
      query += ' WHERE cr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY cr.requested_at DESC';
    const requests = await db.all(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching chat requests:', error);
    res.status(500).json({ error: 'Failed to fetch chat requests' });
  }
});

// Admin approve/deny chat request
app.put('/api/admin/chat-requests/:id', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or rejected' });
    }
    
    const request = await db.get('SELECT * FROM chat_requests WHERE id = ?', [id]);
    if (!request) {
      return res.status(404).json({ error: 'Chat request not found' });
    }
    
    // Update request status
    await db.run(
      'UPDATE chat_requests SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, notes = ? WHERE id = ?',
      [status, 'admin', notes || null, id]
    );
    
    // If approved, enable chat permission for the user
    if (status === 'approved') {
      await db.run(
        'UPDATE users SET can_chat = TRUE WHERE firebase_uid = ?',
        [request.user_uid]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating chat request:', error);
    res.status(500).json({ error: 'Failed to update chat request' });
  }
});

// Forum endpoints
app.get('/api/forum/posts', async (req, res) => {
  try {
    const db = await initDB();
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    const search = (req.query.search || '').toLowerCase();
    const offset = (page - 1) * pageSize;
    
    // Get posts with user information
    let posts = await db.all(`
      SELECT fp.*, u.firebase_uid, u.display_name, u.email
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      ORDER BY fp.created_at DESC 
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);
    
    if (search) {
      posts = posts.filter(p => 
        (p.title && p.title.toLowerCase().includes(search)) || 
        (p.content && p.content.toLowerCase().includes(search))
      );
    }
    res.json(posts);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/forum/posts', async (req, res) => {
  try {
    const db = await initDB();
    const { user_uid, title, content } = req.body;
    
    console.log('[Forum Post] Request received:', { user_uid, title: title?.substring(0, 50), hasContent: !!content });
    
    if (!user_uid || !title || !title.trim() || !content || !content.trim()) {
      console.log('[Forum Post] Validation failed:', { user_uid: !!user_uid, title: !!title, content: !!content });
      return res.status(400).json({ error: 'user_uid, title, and content are required' });
    }
    
    // Get or create user by firebase_uid
    let userId = await getUserIdByFirebaseUid(db, user_uid);
    console.log('[Forum Post] User lookup result:', { user_uid, userId });
    
    if (!userId) {
      // Create user if doesn't exist (for Firebase users)
      try {
        // Check if email already exists (to avoid unique constraint violation)
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [`${user_uid}@forum.user`]);
        if (existingUser) {
          userId = existingUser.id;
          console.log('[Forum Post] Found existing user by email:', userId);
        } else {
          // Try to insert with role column, fallback to without if column doesn't exist
          let result;
          try {
            result = await db.run(
              'INSERT INTO users (firebase_uid, email, display_name, role) VALUES (?, ?, ?, ?) RETURNING id',
              [user_uid, `${user_uid}@forum.user`, 'Forum User', 'USER']
            );
          } catch (roleError) {
            // If role column doesn't exist, insert without it
            const errorMsg = roleError.message || roleError.toString() || '';
            if (errorMsg.includes('role') || (errorMsg.includes('column') && errorMsg.includes('does not exist'))) {
              console.log('[Forum Post] Role column not found, inserting without role');
              result = await db.run(
                'INSERT INTO users (firebase_uid, email, display_name) VALUES (?, ?, ?) RETURNING id',
                [user_uid, `${user_uid}@forum.user`, 'Forum User']
              );
            } else {
              throw roleError;
            }
          }
          userId = result.lastID;
          console.log('[Forum Post] Created new user:', userId);
        }
      } catch (userError) {
        console.error('[Forum Post] Error creating user:', userError);
        // Try to get user again in case of race condition
        userId = await getUserIdByFirebaseUid(db, user_uid);
        if (!userId) {
          return res.status(500).json({ error: `Failed to create user: ${userError.message}` });
        }
      }
    }
    
    if (!userId) {
      return res.status(500).json({ error: 'Failed to get or create user' });
    }
    
    const result = await db.run('INSERT INTO forum_posts (user_id, title, content) VALUES (?, ?, ?) RETURNING id', [userId, title.trim(), content.trim()]);
    console.log('[Forum Post] Post created successfully:', result.lastID);
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('[Forum Post] Error creating forum post:', error);
    console.error('[Forum Post] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: `Failed to create post: ${error.message || 'Unknown error'}` });
  }
});

app.get('/api/forum/posts/:id/comments', async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const comments = await db.all(`
      SELECT fc.*, u.firebase_uid, u.display_name, u.email
      FROM forum_comments fc
      LEFT JOIN users u ON fc.user_id = u.id
      WHERE fc.post_id = ?
      ORDER BY fc.created_at ASC
    `, [id]);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/forum/posts/:id/comments', async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const { user_uid, content } = req.body;
    
    console.log('[Forum Comment] Request received:', { postId: id, user_uid, hasContent: !!content });
    
    if (!user_uid || !content || !content.trim()) {
      return res.status(400).json({ error: 'user_uid and content are required' });
    }
    
    // Verify post exists
    const post = await db.get('SELECT id FROM forum_posts WHERE id = ?', [id]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Get or create user by firebase_uid
    let userId = await getUserIdByFirebaseUid(db, user_uid);
    console.log('[Forum Comment] User lookup result:', { user_uid, userId });
    
    if (!userId) {
      try {
        // Check if email already exists (to avoid unique constraint violation)
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [`${user_uid}@forum.user`]);
        if (existingUser) {
          userId = existingUser.id;
          console.log('[Forum Comment] Found existing user by email:', userId);
        } else {
          // Try to insert with role column, fallback to without if column doesn't exist
          let result;
          try {
            result = await db.run(
              'INSERT INTO users (firebase_uid, email, display_name, role) VALUES (?, ?, ?, ?) RETURNING id',
              [user_uid, `${user_uid}@forum.user`, 'Forum User', 'USER']
            );
          } catch (roleError) {
            // If role column doesn't exist, insert without it
            const errorMsg = roleError.message || roleError.toString() || '';
            if (errorMsg.includes('role') || (errorMsg.includes('column') && errorMsg.includes('does not exist'))) {
              console.log('[Forum Comment] Role column not found, inserting without role');
              result = await db.run(
                'INSERT INTO users (firebase_uid, email, display_name) VALUES (?, ?, ?) RETURNING id',
                [user_uid, `${user_uid}@forum.user`, 'Forum User']
              );
            } else {
              throw roleError;
            }
          }
          userId = result.lastID;
          console.log('[Forum Comment] Created new user:', userId);
        }
      } catch (userError) {
        console.error('[Forum Comment] Error creating user:', userError);
        // Try to get user again in case of race condition
        userId = await getUserIdByFirebaseUid(db, user_uid);
        if (!userId) {
          return res.status(500).json({ error: `Failed to create user: ${userError.message}` });
        }
      }
    }
    
    if (!userId) {
      return res.status(500).json({ error: 'Failed to get or create user' });
    }
    
    const result = await db.run('INSERT INTO forum_comments (post_id, user_id, content) VALUES (?, ?, ?) RETURNING id', [id, userId, content.trim()]);
    console.log('[Forum Comment] Comment created successfully:', result.lastID);
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('[Forum Comment] Error creating comment:', error);
    console.error('[Forum Comment] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ error: `Failed to create comment: ${error.message || 'Unknown error'}` });
  }
});

// Admin get all forum posts
app.get('/api/admin/forum/posts', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    // Get all posts without pagination for admin panel
    const posts = await db.all(`
      SELECT fp.*, u.firebase_uid, u.display_name, u.email,
             (SELECT COUNT(*) FROM forum_comments WHERE post_id = fp.id) as comment_count
      FROM forum_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      ORDER BY fp.created_at DESC
    `);
    
    res.json(posts || []);
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ error: 'Failed to fetch forum posts' });
  }
});

// Admin delete forum post endpoint
app.delete('/api/admin/forum/posts/:id', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const postId = Number(id);
    
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    
    // Comments will be deleted automatically due to CASCADE
    const result = await db.run('DELETE FROM forum_posts WHERE id = ?', [postId]);
    if (result.changes > 0) {
      res.json({ success: true, message: 'Post deleted successfully' });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({ error: 'Failed to delete forum post: ' + error.message });
  }
});

// Admin get all forum comments
app.get('/api/admin/forum/comments', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    // Get all comments without pagination for admin panel
    const comments = await db.all(`
      SELECT fc.*, u.firebase_uid, u.display_name, u.email, fp.title as post_title
      FROM forum_comments fc
      LEFT JOIN users u ON fc.user_id = u.id
      LEFT JOIN forum_posts fp ON fc.post_id = fp.id
      ORDER BY fc.created_at DESC
    `);
    
    res.json(comments || []);
  } catch (error) {
    console.error('Error fetching forum comments:', error);
    res.status(500).json({ error: 'Failed to fetch forum comments' });
  }
});

// Admin delete forum comment endpoint
app.delete('/api/admin/forum/comments/:id', adminLimiter, async (req, res) => {
  try {
    const db = await initDB();
    const { id } = req.params;
    const commentId = Number(id);
    
    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }
    
    const result = await db.run('DELETE FROM forum_comments WHERE id = ?', [commentId]);
    if (result.changes > 0) {
      res.json({ success: true, message: 'Comment deleted successfully' });
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } catch (error) {
    console.error('Error deleting forum comment:', error);
    res.status(500).json({ error: 'Failed to delete forum comment: ' + error.message });
  }
});

// Seed-only endpoint to create products (used by scripts/seed.js)
app.post('/api/admin/seed/product', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const db = await initDB();
    const { name, price, category, image } = req.body;
    if (!name || !name.trim() || price === undefined) {
      return res.status(400).json({ error: 'name and price required' });
    }
    const result = await db.run('INSERT INTO products (name, price, category, image) VALUES (?, ?, ?, ?) RETURNING id', [name.trim(), Number(price), category || null, image || null]);
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error seeding product:', error);
    res.status(500).json({ error: 'Failed to seed product' });
  }
});

// Seed-only endpoint to create users
app.post('/api/admin/seed/user', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const db = await initDB();
    const { firebase_uid, email, display_name, photo_url } = req.body;
    if (!firebase_uid || !email) return res.status(400).json({ error: 'firebase_uid and email required' });
    const exists = await db.get('SELECT id FROM users WHERE firebase_uid = ? OR email = ?', [firebase_uid, email]);
    if (exists?.id) return res.json({ success: true, id: exists.id, existed: true });
    const result = await db.run('INSERT INTO users (firebase_uid, email, display_name, photo_url) VALUES (?, ?, ?, ?) RETURNING id', [firebase_uid, email, display_name || null, photo_url || null]);
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error seeding user:', error);
    res.status(500).json({ error: 'Failed to seed user' });
  }
});

// Testimonials endpoints
app.get('/api/testimonials', async (req, res) => {
  try {
    const database = await initDB();
    const testimonials = await database.all(`
      SELECT * FROM testimonials 
      WHERE active = TRUE 
      ORDER BY created_at DESC
    `);
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.post('/api/testimonials', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    let { name, company, image, testimonial, rating } = req.body;

    // Basic validation
    if (!name || !name.trim() || !company || !company.trim() || !image || !image.trim() || !testimonial || !testimonial.trim()) {
      return res.status(400).json({ error: 'Missing required fields: name, company, image, testimonial' });
    }
    const normalizedRating = Math.max(1, Math.min(5, Number(rating || 5)));
    
    const result = await database.run(`
      INSERT INTO testimonials (name, company, image, testimonial, rating)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id
    `, [name.trim(), company.trim(), image.trim(), testimonial.trim(), normalizedRating]);
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('testimonials_updated');
    }
    
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

app.put('/api/testimonials/:id', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    const { id } = req.params;
    let { name, company, image, testimonial, rating } = req.body;

    // Basic validation
    if (!name || !name.trim() || !company || !company.trim() || !image || !image.trim() || !testimonial || !testimonial.trim()) {
      return res.status(400).json({ error: 'Missing required fields: name, company, image, testimonial' });
    }
    const normalizedRating = Math.max(1, Math.min(5, Number(rating || 5)));
    
    await database.run(`
      UPDATE testimonials 
      SET name = ?, company = ?, image = ?, testimonial = ?, rating = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name.trim(), company.trim(), image.trim(), testimonial.trim(), normalizedRating, id]);
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('testimonials_updated');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

app.delete('/api/testimonials/:id', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    const { id } = req.params;
    
    await database.run('DELETE FROM testimonials WHERE id = ?', [id]);
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('testimonials_updated');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// Banners endpoints
app.get('/api/banners', async (req, res) => {
  try {
    const database = await initDB();
    const banners = await database.all(`
      SELECT * FROM banners 
      WHERE active = TRUE 
      ORDER BY created_at DESC
    `);
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

app.post('/api/banners', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    let { title, image, active } = req.body;

    // Basic validation
    if (!title || !title.trim() || !image || !image.trim()) {
      return res.status(400).json({ error: 'Missing required fields: title, image' });
    }
    const normalizedActive = active === undefined ? true : !!active;
    
    const result = await database.run(`
      INSERT INTO banners (title, image, active)
      VALUES (?, ?, ?)
      RETURNING id
    `, [title.trim(), image.trim(), normalizedActive]);
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('banners_updated');
    }
    
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

app.put('/api/banners/:id', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    const { id } = req.params;
    let { title, image, active } = req.body;

    // Basic validation
    if (!title || !title.trim() || !image || !image.trim()) {
      return res.status(400).json({ error: 'Missing required fields: title, image' });
    }
    const normalizedActive = active === undefined ? true : !!active;
    
    await database.run(`
      UPDATE banners 
      SET title = ?, image = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title.trim(), image.trim(), normalizedActive, id]);
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('banners_updated');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

app.delete('/api/banners/:id', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    const { id } = req.params;
    
    await database.run('DELETE FROM banners WHERE id = ?', [id]);
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('banners_updated');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// Sponsors endpoints
app.get('/api/sponsors', async (req, res) => {
  try {
    const database = await initDB();
    const sponsors = await database.all(`
      SELECT * FROM sponsors 
      WHERE active = TRUE 
      ORDER BY created_at DESC
    `);
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// Admin endpoint to get all sponsors (including inactive)
app.get('/api/admin/sponsors', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    const sponsors = await database.all(`
      SELECT * FROM sponsors 
      ORDER BY created_at DESC
    `);
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors for admin:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});


app.post('/api/sponsors', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    let { name, logo, website, active } = req.body;
    // Apply defaults to avoid empty UI cards
    if (!name || !name.trim()) name = 'New Sponsor';
    if (!logo || !logo.trim()) logo = '/placeholder-banner.svg';
    // Default to true; ensure boolean for PostgreSQL
    const normalizedActive = active === undefined ? true : !!active;
    
    const result = await database.run(`
      INSERT INTO sponsors (name, logo, website, active)
      VALUES (?, ?, ?, ?)
      RETURNING id
    `, [name, logo, website, normalizedActive]);
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('sponsors_updated');
    }
    
    res.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    res.status(500).json({ error: 'Failed to create sponsor' });
  }
});

app.put('/api/sponsors/:id', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    const { id } = req.params;
    const { name, logo, website, active } = req.body;
    // Ensure boolean for PostgreSQL
    const normalizedActive = !!active;
    
    await database.run(`
      UPDATE sponsors 
      SET name = ?, logo = ?, website = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, logo, website, normalizedActive, id]);
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('sponsors_updated');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

app.delete('/api/sponsors/:id', adminLimiter, async (req, res) => {
  try {
    const database = await initDB();
    const { id } = req.params;
    
    await database.run('DELETE FROM sponsors WHERE id = ?', [id]);
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('sponsors_updated');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
});

// API root endpoint (for testing connectivity)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'B2B Plastics SRM API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      jobs: '/api/jobs',
      auth: '/api/auth/login'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Readiness check: validates DB connectivity
app.get('/api/readyz', async (req, res) => {
  try {
    const db = await initDB();
    await db.all('SELECT 1');
    res.json({ status: 'READY', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Readiness check failed:', error);
    res.status(500).json({ status: 'NOT_READY' });
  }
});

// Create HTTP server and Socket.IO instance
let server = null;
let io = null;

function startServer() {
  server = createServer(app);
  io = new Server(server, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  // WebSocket connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Make io available globally for emitting events
  global.io = io;

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server accessible at http://localhost:${PORT} and on your network IP`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };