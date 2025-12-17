// Seed demo data via API endpoints
import fetch from 'node-fetch'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api'

async function seed() {
  try {
    // Ensure backend is up
    const ready = await fetch(`${API_BASE_URL}/readyz`)
    console.log('Readiness:', ready.status)

    // Seed sponsors
    const sponsors = [
      { name: 'PlastiCorp', logo: 'https://via.placeholder.com/150', website: 'https://plasticorp.example', active: true },
      { name: 'EcoResin', logo: 'https://via.placeholder.com/150', website: 'https://ecoresin.example', active: true }
    ]
    for (const s of sponsors) {
      const res = await fetch(`${API_BASE_URL}/sponsors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s)
      })
      console.log('Seed sponsor', s.name, res.status)
    }

    // Seed banners
    const banners = [
      { title: 'Welcome to B2B Plastics', subtitle: 'Find suppliers fast', image: 'https://via.placeholder.com/600x200', active: true },
      { title: 'Quality Materials', subtitle: 'Trusted partners', image: 'https://via.placeholder.com/600x200', active: true }
    ]
    for (const b of banners) {
      const res = await fetch(`${API_BASE_URL}/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b)
      })
      console.log('Seed banner', b.title, res.status)
    }

    // Seed testimonials
    const testimonials = [
      { name: 'Jane Doe', company: 'PlastiCorp', testimonial: 'Great marketplace!', rating: 5, image: 'https://via.placeholder.com/128' },
      { name: 'John Smith', company: 'EcoResin', testimonial: 'Easy to use and reliable.', rating: 5, image: 'https://via.placeholder.com/128' }
    ]
    for (const t of testimonials) {
      const res = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t)
      })
      console.log('Seed testimonial', t.name, res.status)
    }

    // Seed simple products
    const products = [
      { name: 'HDPE Granules - Natural', price: 120.00, category: 'Material', image: '/placeholder-banner.svg' },
      { name: 'Injection Molding Machine 150T', price: 550000.00, category: 'Machinery', image: '/placeholder-banner.svg' },
      { name: 'PP Granules - Black', price: 95.00, category: 'Material', image: '/placeholder-banner.svg' }
    ]
    for (const p of products) {
      const res = await fetch(`${API_BASE_URL}/admin/seed/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      })
      console.log('Seed product', p.name, res.status)
    }

    // Seed a simple forum post and comment if at least one user exists
    // Ensure demo users exist
    const users = [
      { firebase_uid: 'demo-user-uid', email: 'demo@example.com', display_name: 'Demo User', role: 'USER', password: 'user123' },
      { firebase_uid: 'admin-user-uid', email: 'admin@example.com', display_name: 'Admin User', role: 'ADMIN', password: 'admin123' },
      { firebase_uid: 'seller-user-uid', email: 'seller@example.com', display_name: 'Seller User', role: 'USER', password: 'user123' }
    ]
    for (const u of users) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/seed/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(u)
        })
        console.log('Seed user', u.email, res.status)
      } catch {}
    }

    // Seed a forum post
    try {
      await fetch(`${API_BASE_URL}/forum/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getAdminToken()}` },
        body: JSON.stringify({ user_uid: 'demo-user-uid', title: 'Welcome to the Forum', content: 'Discuss plastics manufacturing trends, tips, and questions here.' })
      })
    } catch (e) {}

    // Helper: get admin JWT for seeding protected endpoints
    async function getAdminToken() {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
        })
        const data = await res.json()
        return data.token
      } catch (e) { return '' }
    }

    console.log('Seeding completed.')
  } catch (err) {
    console.error('Seeding error:', err)
    process.exitCode = 1
  }
}

seed()