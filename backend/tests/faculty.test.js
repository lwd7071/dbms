const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { closePool } = require('../src/config/db');

describe('Metadata: Faculty Endpoints', () => {
  afterAll(async () => {
    await closePool();
  });

  describe('GET /api/faculties', () => {
    it('lấy danh sách tất cả các khoa đang hoạt động trong CSDL', async () => {
      const res = await requestAs(app, "student", 1).get('/api/faculties');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(6);

      const codes = res.body.data.map(f => f.maKhoa);
      expect(codes).toContain('CNTT');
      expect(codes).toContain('ATTT');
      expect(codes).toContain('HTTT');
      expect(codes).toContain('KHMT');
      expect(codes).toContain('KTPM');
      expect(codes).toContain('MMT');

      const firstItem = res.body.data[0];
      expect(firstItem).toHaveProperty('maKhoa');
      expect(firstItem).toHaveProperty('tenKhoa');
    });
  });
});
