const request = require('supertest');
const app = require('../src/app');
const { closePool } = require('../src/config/db');

describe('Slice 3: Authentication & Profile Endpoints', () => {
  afterAll(async () => {
    await closePool();
  });

  describe('POST /api/auth/login', () => {
    it('đăng nhập thành công với tài khoản Quản trị viên (admin / 123456)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toMatchObject({
        username: 'admin',
        vaiTro: 'QUAN_TRI',
        trangThai: 'ACTIVE'
      });
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('đăng nhập thành công với tài khoản Sinh viên (sv_23000001 / 123456)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'sv_23000001', password: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.user).toMatchObject({
        username: 'sv_23000001',
        vaiTro: 'SINH_VIEN',
        hoTen: 'Vũ Thảo Quân'
      });
      expect(res.body.data.user).toHaveProperty('maSV');
      expect(res.body.data.user).toHaveProperty('maSinhVien', '23000001');
    });

    it('từ chối đăng nhập khi sai mật khẩu (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'password');
    });

    it('từ chối đăng nhập khi tài khoản bị khóa (sv_23000495 là LOCKED) (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'sv_23000495', password: '123456' });

      expect(res.status).toBe(403);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'taiKhoan');
      expect(res.body.errors[0].message).toContain('khóa');
    });

    it('báo lỗi 400 Bad Request khi thiếu trường bắt buộc', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: '' });

      expect(res.status).toBe(400);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/auth/me', () => {
    it('lấy thông tin thành công khi có token hợp lệ', async () => {
      // Đăng nhập lấy token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: '123456' });

      const token = loginRes.body.data.token;

      // Gọi API /me
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.isSuccess).toBe(true);
      expect(meRes.body.data.user.username).toBe('admin');
    });

    it('báo lỗi 401 khi không gửi token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.isSuccess).toBe(false);
    });
  });
});
