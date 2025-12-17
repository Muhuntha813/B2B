const request = require('supertest')
const { app, startServer } = require('../index')

describe('Auth and protected endpoints', () => {
  let server
  beforeAll(() => {
    server = startServer()
  })
  afterAll((done) => {
    if (server && server.close) server.close(done)
    else done()
  })

  it('logs in and accesses admin stats', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' })
      .expect(200)
    expect(loginRes.body.token).toBeDefined()
    const token = loginRes.body.token

    await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
})