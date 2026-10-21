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

    it('thông báo bằng tiếng Việt khi người dùng mở chức năng không tồn tại', async () => {
      const res = await request(app).get('/api/chuc-nang-khong-ton-tai');

      expect(res.status).toBe(404);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toMatchObject({
        field: 'route',
        message: 'Chức năng bạn yêu cầu không tồn tại.'
      });
      expect(res.body.errors[0].message).not.toContain('/api/');
    });

    it('không trả thông báo kỹ thuật khi nội dung JSON gửi lên bị lỗi cú pháp', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"username":');

      expect(res.status).toBe(400);
      expect(res.body.errors[0].message).toBe('Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra lại rồi thử lại.');
      expect(res.body.errors[0].message).not.toMatch(/Unexpected|JSON|position|token/i);
    });
  });

  describe('Slice 2: GET /api/health/db', () => {
    it('trả về 200 OK và xác nhận kết nối thành công tới SQL Server DBMS330284', async () => {
      const res = await request(app).get('/api/health/db');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('status', 'UP');
      expect(res.body.data).toHaveProperty('database', process.env.DB_NAME || 'DBMS330284');
      expect(res.body.data).toHaveProperty('serverVersion');
      expect(res.body.errors).toEqual([]);
    });
  });
});
