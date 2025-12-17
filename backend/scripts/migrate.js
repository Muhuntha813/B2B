// Simple migration trigger using readiness endpoint
import fetch from 'node-fetch'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api'

async function migrate() {
  try {
    const res = await fetch(`${API_BASE_URL}/readyz`)
    if (res.ok) {
      console.log('Database is ready. Migrations applied (runtime init).')
    } else {
      const text = await res.text()
      console.error('Readiness check failed:', res.status, text)
      process.exitCode = 1
    }
  } catch (err) {
    console.error('Migration script error:', err)
    process.exitCode = 1
  }
}

migrate()