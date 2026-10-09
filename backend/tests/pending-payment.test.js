const request = require('supertest');
const app = require('../src/app');
const { closePool } = require('../src/config/db');

describe('Anti-Spam Pending Payment Flow (TDD)', () => {
  afterAll(async () => {
    await closePool();
  });

  describe('GET /api/students/:id/tuition - Pending payment info', () => {
    it('trả về trường hasPendingPayment, soGiaoDichChoDuyet và soTienChoDuyet cho từng hồ sơ học phí', async () => {
      const res = await request(app).get('/api/students/1/tuition');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const hp5168 = res.body.data.find(h => h.maHocPhi === 5168);
      expect(hp5168).toBeDefined();
      expect(hp5168).toHaveProperty('hasPendingPayment');
      expect(hp5168).toHaveProperty('soGiaoDichChoDuyet');
      expect(hp5168).toHaveProperty('soTienChoDuyet');

      // MaHocPhi 5168 trong DB đang có 1 giao dịch chờ duyệt
      expect(hp5168.hasPendingPayment).toBe(true);
      expect(hp5168.soGiaoDichChoDuyet).toBeGreaterThan(0);
      expect(hp5168.soTienChoDuyet).toBeGreaterThan(0);
    });
  });

  describe('POST /api/payments - Anti-spam check', () => {
    it('từ chối tạo thêm giao dịch khi hồ sơ học phí đang có giao dịch CHO_XAC_NHAN (409 Conflict)', async () => {
      // MaHocPhi 5168 đang có giao dịch CHO_XAC_NHAN
      const res = await request(app)
        .post('/api/payments')
        .send({
          maHocPhi: 5168,
          soTien: 100000,
          phuongThuc: 'CHUYEN_KHOAN'
        });

      expect(res.status).toBe(409);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0].message).toContain('chờ duyệt');
    });
  });
});
