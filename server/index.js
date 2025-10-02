const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Database configuration
let db = null;

// Initialize SQLite database
const initDB = async () => {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });
  }
  return db;
};

// Initialize database and create tables
const initializeDatabase = async () => {
  try {
    console.log('Initializing SQLite database...');
    const database = await initDB();
    
    // Create users table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firebase_uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create jobs table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        firebase_uid TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        material TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        budget REAL NOT NULL,
        location TEXT NOT NULL,
        client TEXT NOT NULL,
        deadline DATE,
        description TEXT,
        requirements TEXT,
        specifications TEXT,
        estimated_duration TEXT,
        status TEXT DEFAULT 'active',
        bids_received INTEGER DEFAULT 0,
        rating REAL DEFAULT NULL,
        posted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create conversations table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        job_owner_uid TEXT NOT NULL,
        participant_uid TEXT NOT NULL,
        job_title TEXT NOT NULL,
        last_message TEXT,
        last_message_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        UNIQUE(job_id, job_owner_uid, participant_uid)
      )
    `);

    // Create messages table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender_uid TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    // Create testimonials table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        image TEXT NOT NULL,
        testimonial TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create banners table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        image TEXT NOT NULL,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sponsors table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo TEXT NOT NULL,
        website TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default testimonials if table is empty
    const testimonialCount = await database.get('SELECT COUNT(*) as count FROM testimonials');
    if (testimonialCount.count === 0) {
      await database.exec(`
        INSERT INTO testimonials (name, company, image, testimonial, rating) VALUES
        ('Rajesh Kumar', 'Kumar Plastics Ltd.', '/placeholder-avatar.svg', 'Excellent platform for finding quality machinery. Found the perfect injection molding machine for our production line.', 5),
        ('Priya Sharma', 'Sharma Industries', '/placeholder-avatar.svg', 'Great experience sourcing raw materials. The suppliers are reliable and the quality is consistently good.', 5),
        ('Amit Patel', 'Patel Manufacturing', '/placeholder-avatar.svg', 'The B2B platform has revolutionized our procurement process. Highly recommended for plastic industry professionals.', 5),
        ('Sunita Reddy', 'Reddy Polymers', '/placeholder-avatar.svg', 'Outstanding service and quality products. The platform connects us with the best suppliers in the industry.', 5)
      `);
    }

    // Insert default banners if table is empty
    const bannerCount = await database.get('SELECT COUNT(*) as count FROM banners');
    if (bannerCount.count === 0) {
      await database.exec(`
        INSERT INTO banners (title, image) VALUES
        ('Welcome to B2B Plastics SRM', '/placeholder-banner.svg'),
        ('Quality Machinery & Materials', '/placeholder-banner.svg')
      `);
    }

    // Insert default sponsors if table is empty
    const sponsorCount = await database.get('SELECT COUNT(*) as count FROM sponsors');
    if (sponsorCount.count === 0) {
      await database.exec(`
        INSERT INTO sponsors (name, logo, website) VALUES
        ('PlasticTech Solutions', '/placeholder-banner.svg', 'https://plastictechsolutions.com'),
        ('Industrial Partners', '/placeholder-banner.svg', 'https://industrialpartners.com')
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
    const database = await initDB();
    try {
      await database.run(`
        INSERT OR REPLACE INTO users (firebase_uid, email, display_name, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
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
    const database = await initDB();
    try {
      const rows = await database.all(`
        SELECT j.*, u.display_name as user_name, u.email as user_email, j.firebase_uid as owner_uid
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        ORDER BY j.posted_date DESC
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
        INSERT INTO messages (conversation_id, sender_uid, sender_name, message)
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
        SELECT * FROM messages 
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
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase().catch(console.error);

// Routes
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await jobOperations.getAllJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { jobData, user } = req.body;
    
    // Register user if not exists
    if (user) {
      await userOperations.createOrUpdateUser(user.uid, user.email, user.displayName);
    }
    
    const jobId = await jobOperations.createJob(jobData, user?.uid);
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

// Admin endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const database = await initDB();
    const users = await database.all(`
      SELECT id, firebase_uid, email, display_name, created_at, last_login
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const database = await initDB();
    const { userId } = req.params;
    
    // Delete user's jobs first (due to foreign key constraint)
    await database.run('DELETE FROM jobs WHERE user_id = ?', [userId]);
    
    // Delete user's conversations and messages
    await database.run(`
      DELETE FROM messages 
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

app.get('/api/admin/stats', async (req, res) => {
  try {
    const database = await initDB();
    
    const [userCount] = await database.all('SELECT COUNT(*) as count FROM users');
    const [jobCount] = await database.all('SELECT COUNT(*) as count FROM jobs');
    const [conversationCount] = await database.all('SELECT COUNT(*) as count FROM conversations');
    const [messageCount] = await database.all('SELECT COUNT(*) as count FROM messages');
    
    res.json({
      totalUsers: userCount.count,
      totalJobs: jobCount.count,
      totalConversations: conversationCount.count,
      totalMessages: messageCount.count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Testimonials endpoints
app.get('/api/testimonials', async (req, res) => {
  try {
    const database = await initDB();
    const testimonials = await database.all(`
      SELECT * FROM testimonials 
      WHERE active = 1 
      ORDER BY created_at DESC
    `);
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.post('/api/testimonials', async (req, res) => {
  try {
    const database = await initDB();
    const { name, company, image, testimonial, rating } = req.body;
    
    const result = await database.run(`
      INSERT INTO testimonials (name, company, image, testimonial, rating)
      VALUES (?, ?, ?, ?, ?)
    `, [name, company, image, testimonial, rating || 5]);
    
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

app.put('/api/testimonials/:id', async (req, res) => {
  try {
    const database = await initDB();
    const { id } = req.params;
    const { name, company, image, testimonial, rating } = req.body;
    
    await database.run(`
      UPDATE testimonials 
      SET name = ?, company = ?, image = ?, testimonial = ?, rating = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, company, image, testimonial, rating, id]);
    
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

app.delete('/api/testimonials/:id', async (req, res) => {
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
      WHERE active = 1 
      ORDER BY created_at DESC
    `);
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

app.post('/api/banners', async (req, res) => {
  try {
    const database = await initDB();
    const { title, image } = req.body;
    
    const result = await database.run(`
      INSERT INTO banners (title, image)
      VALUES (?, ?)
    `, [title, image]);
    
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

app.put('/api/banners/:id', async (req, res) => {
  try {
    const database = await initDB();
    const { id } = req.params;
    const { title, image } = req.body;
    
    await database.run(`
      UPDATE banners 
      SET title = ?, image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, image, id]);
    
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

app.delete('/api/banners/:id', async (req, res) => {
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
      WHERE active = 1 
      ORDER BY created_at DESC
    `);
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// Admin: fetch all sponsors regardless of active status
app.get('/api/admin/sponsors', async (req, res) => {
  try {
    const database = await initDB();
    const sponsors = await database.all(`
      SELECT * FROM sponsors 
      ORDER BY created_at DESC
    `);
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching all sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

app.post('/api/sponsors', async (req, res) => {
  try {
    const database = await initDB();
    let { name, logo, website, active } = req.body;
    // Apply defaults to avoid empty UI cards
    if (!name || !name.trim()) name = 'New Sponsor';
    if (!logo || !logo.trim()) logo = '/placeholder-banner.svg';
    const normalizedActive = typeof active === 'number' ? active : (active ? 1 : 1);
    
    const result = await database.run(`
      INSERT INTO sponsors (name, logo, website, active)
      VALUES (?, ?, ?, ?)
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

app.put('/api/sponsors/:id', async (req, res) => {
  try {
    const database = await initDB();
    const { id } = req.params;
    const { name, logo, website, active } = req.body;
    const normalizedActive = typeof active === 'number' ? active : (active ? 1 : 0);
    
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

app.delete('/api/sponsors/:id', async (req, res) => {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});