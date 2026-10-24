const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv').config({ quiet: true });
const app = require('../src/app');

const JWT_SECRET = process.env.JWT_SECRET;
const token = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

describe('Protected academic API access', () => {
  it('requires a session before reading a student profile', async () => {
    const response = await request(app).get('/api/students/1/profile');

    expect(response.status).toBe(401);
    expect(response.body.isSuccess).toBe(false);
  });

  it('builds the authenticated user from the active database account, not stale JWT claims', async () => {
    const staleToken = token({
      maTaiKhoan: 1,
      vaiTro: 'SINH_VIEN',
      maSV: 999999,
      hoTen: 'Tên đã cũ'
    });
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${staleToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      maTaiKhoan: 1,
      vaiTro: 'QUAN_TRI',
      username: 'admin'
    });
    expect(response.body.data.user.maSV).toBeNull();
  });

  it('rejects a signed token that has no database account id', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token({ vaiTro: 'QUAN_TRI' })}`);

    expect(response.status).toBe(401);
    expect(response.body.errors[0].field).toBe('token');
  });

  it('revokes an existing session after its account is locked', async () => {
    const lockedAccountToken = token({ maTaiKhoan: 862, vaiTro: 'SINH_VIEN', maSV: 833 });
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${lockedAccountToken}`);

    expect(response.status).toBe(401);
    expect(response.body.errors[0].field).toBe('taiKhoan');
  });

  it('prevents a student from reading another student profile', async () => {
    const studentToken = token({ maTaiKhoan: 30, vaiTro: 'SINH_VIEN', maSV: 1 });
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
    const studentToken = token({ maTaiKhoan: 30, vaiTro: 'SINH_VIEN', maSV: 1 });
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

  it.each([
    '/api/classes',
    '/api/courses/available',
    '/api/faculties',
    '/api/semesters'
  ])('requires a session before reading %s', async path => {
    const response = await request(app).get(path);
    expect(response.status).toBe(401);
    expect(response.body.isSuccess).toBe(false);
  });

  it('prevents a student from querying another student curriculum', async () => {
    const studentToken = token({ maTaiKhoan: 30, vaiTro: 'SINH_VIEN', maSV: 1 });
    const response = await request(app)
      .get('/api/courses/available')
      .query({ maHocKy: 7, maSV: 2, type: 'PLAN' })
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
    expect(response.body.isSuccess).toBe(false);
  });

  it('prevents a student from viewing another student curriculum plan', async () => {
    const studentToken = token({ maTaiKhoan: 30, vaiTro: 'SINH_VIEN', maSV: 1 });
    const response = await request(app)
      .get('/api/students/2/curriculum')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
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
