const request = require('supertest')
const { app } = require('../index.js')

describe('Health and readiness endpoints', () => {
  test('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health')
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('status', 'OK')
  })

  test('GET /api/readyz returns READY or server error', async () => {
    const res = await request(app).get('/api/readyz')
    expect([200, 500]).toContain(res.statusCode)
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty('status', 'READY')
    }
  })
})