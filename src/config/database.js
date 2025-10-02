import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database configuration
let db = null

// Initialize SQLite database
const initDB = async () => {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, '../../database.sqlite'),
      driver: sqlite3.Database
    })
  }
  return db
}

// Create connection pool equivalent
export const pool = {
  async execute(query, params = []) {
    const database = await initDB()
    if (query.trim().toUpperCase().startsWith('SELECT')) {
      const rows = await database.all(query, params)
      return [rows]
    } else {
      const result = await database.run(query, params)
      return [{ insertId: result.lastID, affectedRows: result.changes }]
    }
  },
  async getConnection() {
    const database = await initDB()
    return {
      async execute(query, params = []) {
        if (query.trim().toUpperCase().startsWith('SELECT')) {
          const rows = await database.all(query, params)
          return [rows]
        } else {
          const result = await database.run(query, params)
          return [{ insertId: result.lastID, affectedRows: result.changes }]
        }
      },
      release() {
        // SQLite doesn't need connection release
      }
    }
  }
}

// Database initialization function
export const initializeDatabase = async () => {
  try {
    console.log('Initializing SQLite database...')
    
    // Create tables
    await createTables()
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

const createTables = async () => {
  const database = await initDB()
  
  try {
    // Create users table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firebase_uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        provider TEXT DEFAULT 'google',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `)

    // Create user_sessions table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

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
        unit TEXT DEFAULT 'pieces',
        budget REAL NOT NULL,
        location TEXT NOT NULL,
        client TEXT NOT NULL,
        deadline DATE NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        specifications TEXT,
        estimated_duration TEXT,
        status TEXT DEFAULT 'Open',
        bids_received INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        posted_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Create indexes
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)`)
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)`)
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)`)
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_jobs_firebase_uid ON jobs(firebase_uid)`)
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category)`)
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)`)
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)`)
    await database.exec(`CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date)`)

    console.log('All tables created successfully')
  } catch (error) {
    console.error('Error creating tables:', error)
    throw error
  }
}

// User database operations
export const userOperations = {
  // Create or update user
  async createOrUpdateUser(userData) {
    try {
      const { firebaseUid, email, displayName, photoUrl, provider = 'google' } = userData
      
      const [result] = await pool.execute(`
        INSERT INTO users (firebase_uid, email, display_name, photo_url, provider, last_login)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
        display_name = VALUES(display_name),
        photo_url = VALUES(photo_url),
        last_login = NOW(),
        updated_at = NOW()
      `, [firebaseUid, email, displayName, photoUrl, provider])
      
      return result
    } catch (error) {
      console.error('Error creating/updating user:', error)
      throw error
    }
  },
  
  // Get user by Firebase UID
  async getUserByFirebaseUid(firebaseUid) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE firebase_uid = ? AND is_active = TRUE',
        [firebaseUid]
      )
      return rows[0] || null
    } catch (error) {
      console.error('Error getting user by Firebase UID:', error)
      throw error
    }
  },
  
  // Get user by email
  async getUserByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      )
      return rows[0] || null
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw error
    }
  },
  
  // Update last login
  async updateLastLogin(firebaseUid) {
    try {
      await pool.execute(
        'UPDATE users SET last_login = NOW() WHERE firebase_uid = ?',
        [firebaseUid]
      )
    } catch (error) {
      console.error('Error updating last login:', error)
      throw error
    }
  }
}

// Job database operations
export const jobOperations = {
  // Create a new job
  async createJob(jobData, firebaseUid) {
    const database = await initDB()
    
    try {
      // Get user ID from firebase_uid
      const userRows = await database.all(
        'SELECT id FROM users WHERE firebase_uid = ?',
        [firebaseUid]
      )
      
      if (userRows.length === 0) {
        throw new Error('User not found')
      }
      
      const userId = userRows[0].id
      
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
      ])
      
      return result.lastID
    } catch (error) {
      console.error('Error creating job:', error)
      throw error
    }
  },

  // Get all jobs
  async getAllJobs() {
    const database = await initDB()
    
    try {
      const rows = await database.all(`
        SELECT j.*, u.display_name as user_name, u.email as user_email
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        ORDER BY j.posted_date DESC
      `)
      
      // Parse JSON fields
      return rows.map(job => ({
        ...job,
        requirements: job.requirements ? JSON.parse(job.requirements) : {},
        specifications: job.specifications ? JSON.parse(job.specifications) : []
      }))
    } catch (error) {
      console.error('Error getting all jobs:', error)
      throw error
    }
  },

  // Get job by ID
  async getJobById(jobId) {
    const database = await initDB()
    
    try {
      const job = await database.get(`
        SELECT j.*, u.display_name as user_name, u.email as user_email
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        WHERE j.id = ?
      `, [jobId])
      
      if (!job) {
        return null
      }
      
      return {
        ...job,
        requirements: job.requirements ? JSON.parse(job.requirements) : {},
        specifications: job.specifications ? JSON.parse(job.specifications) : []
      }
    } catch (error) {
      console.error('Error getting job by ID:', error)
      throw error
    }
  },

  // Get jobs by user
  async getJobsByUser(firebaseUid) {
    const database = await initDB()
    
    try {
      const rows = await database.all(`
        SELECT j.*, u.display_name as user_name, u.email as user_email
        FROM jobs j
        LEFT JOIN users u ON j.user_id = u.id
        WHERE j.firebase_uid = ?
        ORDER BY j.posted_date DESC
      `, [firebaseUid])
      
      // Parse JSON fields
      return rows.map(job => ({
        ...job,
        requirements: job.requirements ? JSON.parse(job.requirements) : {},
        specifications: job.specifications ? JSON.parse(job.specifications) : []
      }))
    } catch (error) {
      console.error('Error getting jobs by user:', error)
      throw error
    }
  },

  // Update job
  async updateJob(jobId, updateData) {
    const database = await initDB()
    
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
      ])
      
      return result.changes > 0
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  },

  // Delete job
  async deleteJob(jobId) {
    const database = await initDB()
    
    try {
      const result = await database.run('DELETE FROM jobs WHERE id = ?', [jobId])
      return result.changes > 0
    } catch (error) {
      console.error('Error deleting job:', error)
      throw error
    }
  }
}

export default pool