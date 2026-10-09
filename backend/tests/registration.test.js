const request = require('supertest');
const app = require('../src/app');
const { closePool } = require('../src/config/db');

describe('Slice 5, 6 & 7: Registration & Cancellation Transaction Endpoints', () => {
  jest.setTimeout(15000);
  let createdMaDangKy = null;

  beforeAll(async () => {
    const { getPool } = require('../src/config/db');
    const pool = await getPool();
    await pool.request().query(`
      DELETE FROM dbo.DANGKYTINCHI 
      WHERE MaSV = 1 AND MaLHP IN ('LHP_HK7_ANHVAN1_01', 'LHP_HK7_ANHVAN1_02', 'LHP_HK7_NMLT_01')
    `);
  });

  afterAll(async () => {
    // Dọn dẹp nếu còn bản ghi chưa hủy
    try {
      const { getPool } = require('../src/config/db');
      const pool = await getPool();
      await pool.request().query(`
        DELETE FROM dbo.DANGKYTINCHI 
        WHERE MaSV = 1 AND MaLHP IN ('LHP_HK7_ANHVAN1_01', 'LHP_HK7_ANHVAN1_02', 'LHP_HK7_NMLT_01')
      `);
    } catch (_) {}
    await closePool();
  });

  describe('Validation Input (POST /api/registrations)', () => {
    it('báo lỗi 400 Bad Request khi thiếu maSV', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({ maLHP: 'LHP_HK7_ANHVAN1_01' });

      expect(res.status).toBe(400);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'maSV');
    });

    it('báo lỗi 400 Bad Request khi thiếu maLHP', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({ maSV: 1 });

      expect(res.status).toBe(400);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'maLHP');
    });
  });

  describe('Core Registration & Error Mapping via SP_DangKyTinChi', () => {
    it('đăng ký thành công lớp học phần hợp lệ (201 Created)', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({
          maSV: 1,
          maLHP: 'LHP_HK7_ANHVAN1_01',
          tinChiToiDa: 25
        });

      expect(res.status).toBe(201);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('maDangKy');
      expect(res.body.data).toHaveProperty('maSV', 1);
      expect(res.body.data).toHaveProperty('maLHP', 'LHP_HK7_ANHVAN1_01');
      expect(res.body.data).toHaveProperty('trangThai', 'REGISTERED');

      createdMaDangKy = res.body.data.maDangKy;
    });

    it('từ chối khi sinh viên đã đăng ký môn học này trong kỳ (409 Conflict - Mã 50007)', async () => {
      // SV 1 đã đăng ký LHP_HK7_ANHVAN1_01 ở test trước, thử đăng ký lại LHP_HK7_ANHVAN1_02 (cùng môn ANHVAN1)
      const res = await request(app)
        .post('/api/registrations')
        .send({
          maSV: 1,
          maLHP: 'LHP_HK7_ANHVAN1_02',
          tinChiToiDa: 25
        });

      expect(res.status).toBe(409);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'maMonHoc');
      expect(res.body.errors[0].message).toContain('đã đăng ký môn học này');
    });

    it('từ chối khi trùng lịch học với thời khóa biểu hiện tại (409 Conflict - Mã 50009)', async () => {
      // SV 1 có lớp LHP_HK7_MOBILE_02 học Thứ 3 tiết 1-3. Lớp LHP_HK7_HDH_02 cũng học Thứ 3 tiết 1-3
      const res = await request(app)
        .post('/api/registrations')
        .send({
          maSV: 1,
          maLHP: 'LHP_HK7_HDH_02',
          tinChiToiDa: 25
        });

      expect(res.status).toBe(409);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'lichHoc');
      expect(res.body.errors[0].message).toContain('trùng');
    });

    it('từ chối khi sinh viên chưa hoàn thành môn tiên quyết (409 Conflict - Mã 50008)', async () => {
      // Môn ANHVAN2 yêu cầu tiên quyết ANHVAN1, SV 1 chưa từng hoàn thành ANHVAN1 ở các kỳ trước
      const res = await request(app)
        .post('/api/registrations')
        .send({
          maSV: 1,
          maLHP: 'LHP_HK7_ANHVAN2_01',
          tinChiToiDa: 25
        });

      expect(res.status).toBe(409);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'tienQuyet');
      expect(res.body.errors[0].message).toContain('tiên quyết');
    });

    it('từ chối khi vượt quá số tín chỉ tối đa trong học kỳ (409 Conflict - Mã 50010)', async () => {
      // SV 1 có 16 tín chỉ (12 cũ + 4 môn ANHVAN1 vừa đăng ký), giới hạn tinChiToiDa = 15
      const res = await request(app)
        .post('/api/registrations')
        .send({
          maSV: 1,
          maLHP: 'LHP_HK7_NMLT_01',
          tinChiToiDa: 15
        });

      expect(res.status).toBe(409);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'tinChi');
      expect(res.body.errors[0].message).toContain('tín chỉ tối đa');
    });

    it('từ chối khi sinh viên không tồn tại trong hệ thống (404 Not Found - Mã 50001)', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({
          maSV: 999999,
          maLHP: 'LHP_HK7_NMLT_01',
          tinChiToiDa: 25
        });

      expect(res.status).toBe(404);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'maSV');
      expect(res.body.errors[0].message).toContain('không tồn tại');
    });
  });

  describe('Cancellation via SP_HuyDangKy (DELETE /api/registrations/:id)', () => {
    it('hủy đăng ký học phần vừa tạo thành công (200 OK)', async () => {
      expect(createdMaDangKy).not.toBeNull();

      const res = await request(app)
        .delete(`/api/registrations/${createdMaDangKy}`)
        .send({ maSV: 1 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('trangThai', 'CANCELLED');
    });

    it('từ chối khi không tìm thấy đăng ký REGISTERED để hủy (404 Not Found - Mã 50021)', async () => {
      // Hủy lại chính mã đăng ký đã bị CANCELLED
      const res = await request(app)
        .delete(`/api/registrations/${createdMaDangKy}`)
        .send({ maSV: 1 });

      expect(res.status).toBe(404);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'maDangKy');
    });
  });
});
