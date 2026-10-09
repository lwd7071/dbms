const request = require('supertest');
const app = require('../src/app');
const { closePool } = require('../src/config/db');

describe('Health & System Endpoints', () => {
  afterAll(async () => {
    // Đóng connection pool sau khi chạy xong test
    await closePool();
  });

  describe('Slice 1: GET /api/health', () => {
    it('trả về 200 OK và status UP mà không gọi DB', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('status', 'UP');
      expect(res.body.data).toHaveProperty('timestamp');
      expect(res.body.errors).toEqual([]);
    });
  });

  describe('Slice 2: GET /api/health/db', () => {
    it('trả về 200 OK và xác nhận kết nối thành công tới SQL Server DBMS330284', async () => {
      const res = await request(app).get('/api/health/db');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('status', 'UP');
      expect(res.body.data).toHaveProperty('database', 'DBMS330284');
      expect(res.body.data).toHaveProperty('serverVersion');
      expect(res.body.errors).toEqual([]);
    });
  });
});
