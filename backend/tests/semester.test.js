const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { closePool } = require('../src/config/db');

describe('Metadata: Semester Endpoints', () => {
  afterAll(async () => {
    await closePool();
  });

  describe('GET /api/semesters', () => {
    it('lấy danh sách tất cả các học kỳ trong hệ thống', async () => {
      const res = await requestAs(app, "student", 1).get('/api/semesters');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const firstItem = res.body.data[0];
      expect(firstItem).toHaveProperty('maHocKy');
      expect(firstItem).toHaveProperty('tenHocKy');
      expect(firstItem).toHaveProperty('namHoc');
      expect(firstItem).toHaveProperty('trangThai');
    });
  });

  describe('GET /api/semesters/current', () => {
    it('lấy thông tin học kỳ hiện tại đang mở đăng ký', async () => {
      const res = await requestAs(app, "student", 1).get('/api/semesters/current');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('maHocKy');
      expect(res.body.data).toHaveProperty('tenHocKy');
      expect(res.body.data).toHaveProperty('namHoc');
      expect(res.body.data).toHaveProperty('trangThai');
      expect(res.body.data.trangThai).toBe('DANG_MO');
    });
  });
});
