const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

const JWT_SECRET = process.env.JWT_SECRET || 'dbms330284_super_secret_jwt_key_2026';
const token = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

describe('Protected academic API access', () => {
  it('requires a session before reading a student profile', async () => {
    const response = await request(app).get('/api/students/1/profile');

    expect(response.status).toBe(401);
    expect(response.body.isSuccess).toBe(false);
  });

  it('prevents a student from reading another student profile', async () => {
    const studentToken = token({ vaiTro: 'SINH_VIEN', maSV: 1 });
    const response = await request(app)
      .get('/api/students/2/profile')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
    expect(response.body.isSuccess).toBe(false);
  });

  it('requires a student session before creating a registration', async () => {
    const response = await request(app)
      .post('/api/registrations')
      .send({ maLHP: 'LHP_HK7_NMLT_01' });

    expect(response.status).toBe(401);
    expect(response.body.isSuccess).toBe(false);
  });

  it('rejects a student trying to register as another student', async () => {
    const studentToken = token({ vaiTro: 'SINH_VIEN', maSV: 1 });
    const response = await request(app)
      .post('/api/registrations')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ maSV: 2, maLHP: 'LHP_HK7_NMLT_01' });

    expect(response.status).toBe(403);
  });

  it('requires an authorized staff session for admin APIs', async () => {
    const response = await request(app).get('/api/admin/dashboard');

    expect(response.status).toBe(401);
    expect(response.body.isSuccess).toBe(false);
  });

  it('requires a lecturer session before exposing class students and grades', async () => {
    const response = await request(app).get('/api/lecturers/classes/LHP_HK7_DEVOPS_01/students');

    expect(response.status).toBe(401);
    expect(response.body.isSuccess).toBe(false);
  });

  it('requires a signed-in user before creating a payment request', async () => {
    const response = await request(app)
      .post('/api/payments')
      .send({ maHocPhi: 1, soTien: 100, phuongThuc: 'CHUYEN_KHOAN' });

    expect(response.status).toBe(401);
    expect(response.body.isSuccess).toBe(false);
  });
});
