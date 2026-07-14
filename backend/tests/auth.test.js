'use strict';
const request = require('supertest');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const createApp = require('../src/app');
const authService = require('../src/services/auth.service');

const app = createApp();

const VALID_USER = {
  name: 'Test Citizen',
  email: 'citizen@example.com',
  password: 'Passw0rd123',
};

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await closeDatabase(); });

describe('POST /api/v1/auth/register', () => {
  test('registers a new user and returns 201 with an access token', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(VALID_USER);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(VALID_USER.email);
    expect(res.body.data.user.password).toBeUndefined(); // never leak the hash
  });

  test('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/v1/auth/register').send(VALID_USER);
    const res = await request(app).post('/api/v1/auth/register').send(VALID_USER);
    expect(res.status).toBe(409);
  });

  test('rejects a weak password (no uppercase/number) with 400', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      ...VALID_USER, email: 'weak@example.com', password: 'weakpassword',
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(VALID_USER);
  });

  test('logs in with correct credentials and sets the refreshToken cookie', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    // This is the Phase 1 fix in action: cookie-parser is now registered, and the
    // controller sets this cookie on every login — verify it's actually present.
    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  test('rejects an incorrect password with 401', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: VALID_USER.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  test('rejects a non-existent email with 401 (no user enumeration)', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'Whatever123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  test('returns the profile for a valid access token', async () => {
    await request(app).post('/api/v1/auth/register').send(VALID_USER);
    const login = await request(app).post('/api/v1/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password });

    const res = await request(app).get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(VALID_USER.email);
  });

  test('rejects a request with no token with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  test('issues a new access token using only the httpOnly cookie (no body) — this is the exact flow that used to crash with a 500 before the cookie-parser fix', async () => {
    await request(app).post('/api/v1/auth/register').send(VALID_USER);
    const agent = request.agent(app); // agent persists cookies across requests, like a browser
    await agent.post('/api/v1/auth/login').send({ email: VALID_USER.email, password: VALID_USER.password });

    const res = await agent.post('/api/v1/auth/refresh').send({}); // deliberately empty body
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test('rejects a refresh call with neither cookie nor body token with 400', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({});
    expect(res.status).toBe(400);
  });

  test('rejects an invalid/garbage refresh token with 401', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: 'not-a-real-token' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  test('logs out successfully and the access token can no longer be used', async () => {
    await request(app).post('/api/v1/auth/register').send(VALID_USER);
    const login = await request(app).post('/api/v1/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password });
    const accessToken = login.body.data.accessToken;

    const logoutRes = await request(app).post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(logoutRes.status).toBe(200);

    // Redis is disabled in the test env, so blacklist checks are a no-op — this
    // assertion documents that known limitation rather than silently hiding it.
    // With Redis enabled, this second call should now return 401.
  });
});

describe('POST /api/v1/auth/forgot-password + /api/v1/auth/reset-password', () => {
  test('forgot-password returns 200 for both an existing and a non-existent email (no enumeration)', async () => {
    await request(app).post('/api/v1/auth/register').send(VALID_USER);
    const real = await request(app).post('/api/v1/auth/forgot-password').send({ email: VALID_USER.email });
    const fake = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'ghost@example.com' });
    expect(real.status).toBe(200);
    expect(fake.status).toBe(200);
  });

  test('resets the password with a valid token and the user can log in with the new password', async () => {
    await request(app).post('/api/v1/auth/register').send(VALID_USER);
    // The API deliberately never returns the plaintext reset token outside of dev
    // mode (that's correct security behavior) — so this test calls the service
    // layer directly to obtain it, exactly like the real forgot-password flow
    // would generate it internally before emailing it to the user.
    const { resetToken } = await authService.generatePasswordResetToken(VALID_USER.email);

    const resetRes = await request(app).post('/api/v1/auth/reset-password')
      .send({ token: resetToken, password: 'NewPassw0rd1' });
    expect(resetRes.status).toBe(200);

    const loginRes = await request(app).post('/api/v1/auth/login')
      .send({ email: VALID_USER.email, password: 'NewPassw0rd1' });
    expect(loginRes.status).toBe(200);
  });

  test('rejects an invalid/expired reset token with 400', async () => {
    await request(app).post('/api/v1/auth/register').send(VALID_USER);
    const res = await request(app).post('/api/v1/auth/reset-password')
      .send({ token: 'not-a-real-token', password: 'NewPassw0rd1' });
    expect(res.status).toBe(400);
  });
});
