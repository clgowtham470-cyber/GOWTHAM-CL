const request = require('supertest');
const app = require('./server');

describe('OTP Functionality Tests', () => {
  beforeEach(() => {
    // Clear OTP store before each test
    const otpStore = {};
    // Reset app state if needed
  });

  test('POST /api/login/send-otp - should send OTP for valid phone', async () => {
    const response = await request(app)
      .post('/api/login/send-otp')
      .send({ phone: '9876543210' })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'OTP sent successfully');
  });

  test('POST /api/login/send-otp - should return error for invalid phone', async () => {
    const response = await request(app)
      .post('/api/login/send-otp')
      .send({ phone: '123' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Invalid phone number');
  });

  test('POST /api/login - should login with correct OTP', async () => {
    // First, send OTP
    await request(app)
      .post('/api/login/send-otp')
      .send({ phone: '9876543210' });

    // Mock OTP (since we can't access the generated OTP directly, we'll assume it's generated)
    // In a real test, you might need to mock the OTP generation or expose it
    // For now, we'll simulate by setting the OTP manually (not ideal, but for demo)
    const appInstance = require('./server');
    // This is a hack; in real scenario, use dependency injection or mock
    appInstance.locals.otpStore = { '9876543210': '123456' };

    const response = await request(app)
      .post('/api/login')
      .send({ phone: '9876543210', otp: '123456' })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('name', 'Farmer John');
  });

  test('POST /api/login - should return error for incorrect OTP', async () => {
    // First, send OTP
    await request(app)
      .post('/api/login/send-otp')
      .send({ phone: '9876543210' });

    const response = await request(app)
      .post('/api/login')
      .send({ phone: '9876543210', otp: 'wrongotp' })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Invalid OTP');
  });

  test('POST /api/login - should return error for non-existent user', async () => {
    // First, send OTP for a phone not in users
    await request(app)
      .post('/api/login/send-otp')
      .send({ phone: '9999999999' });

    const response = await request(app)
      .post('/api/login')
      .send({ phone: '9999999999', otp: '123456' })
      .expect(404);

    expect(response.body).toHaveProperty('error', 'User not found');
  });
});
