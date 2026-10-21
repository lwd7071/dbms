const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { getPool, closePool, sql } = require('../src/config/db');

describe('Admin Student CRUD APIs (/api/admin/students)', () => {
  let pool;
  const testMSSV = `T${Date.now()}`;
  let createdMaSV = null;
  let duplicateMaSV = null;

  beforeAll(async () => {
    pool = await getPool();
  });

  afterAll(async () => {
    for (const maSV of [createdMaSV, duplicateMaSV].filter(Boolean)) {
      await pool.request()
        .input('MaSV', sql.Int, maSV)
        .query('DELETE FROM dbo.SINHVIEN WHERE MaSV = @MaSV');
    }
    await closePool();
  });

  // TEST 1 (Tracer Bullet): Thêm mới sinh viên thành công (201 Created)
  it('thêm mới sinh viên hợp lệ thành công (201 Created)', async () => {
    const payload = {
      maSinhVien: testMSSV,
      hoTen: 'Lê Hoàng Minh',
      ngaySinh: '2005-05-15',
      email: `sv_${testMSSV}@student.edu.vn`,
      soDienThoai: '0988776655',
      maKhoa: 'CNTT',
      maCTDT: 'CTDT_CNTT_CQ',
      maLop: 'CNTT23_01',
      trangThai: 'DANG_HOC'
    };

    const res = await requestAs(app, "admin", 1)
      .post('/api/admin/students')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data).toHaveProperty('maSV');
    expect(res.body.data.maSinhVien).toBe(testMSSV);
    expect(res.body.data.hoTen).toBe('Lê Hoàng Minh');
    createdMaSV = res.body.data.maSV;
  });

  // TEST 2: Từ chối khi trùng mã sinh viên (409 Conflict)
  it('từ chối khi trùng mã sinh viên đã tồn tại (409 Conflict)', async () => {
    const duplicateMSSV = `D${Date.now()}`;
    const initial = await requestAs(app, 'admin').post('/api/admin/students').send({
      maSinhVien: duplicateMSSV,
      hoTen: 'Sinh viên fixture trùng MSSV',
      maKhoa: 'CNTT',
      maCTDT: 'CTDT_CNTT_CQ',
      maLop: 'CNTT23_01'
    });
    expect(initial.status).toBe(201);
    duplicateMaSV = initial.body.data.maSV;

    const payload = {
      maSinhVien: duplicateMSSV,
      hoTen: 'Người Trùng Mã',
      maKhoa: 'CNTT',
      maCTDT: 'CTDT_CNTT_CQ',
      maLop: 'CNTT23_01'
    };

    const res = await requestAs(app, "admin", 1)
      .post('/api/admin/students')
      .send(payload);

    expect([400, 409]).toContain(res.status);
    expect(res.body.isSuccess).toBe(false);
    expect(res.body.errors[0].field).toBe('maSinhVien');
  });

  it('rejects impossible calendar dates before sending them to SQL Server', async () => {
    const res = await requestAs(app, 'admin')
      .post('/api/admin/students')
      .send({
        maSinhVien: `D${Date.now()}`,
        hoTen: 'Ngày không hợp lệ',
        ngaySinh: '2025-02-30',
        maKhoa: 'CNTT',
        maCTDT: 'CTDT_CNTT_CQ'
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe('ngaySinh');
  });

  it('returns 404 when updating a student record that does not exist', async () => {
    const res = await requestAs(app, 'admin')
      .put('/api/admin/students/2147483647')
      .send({ hoTen: 'Không tồn tại' });
    expect(res.status).toBe(404);
  });

  it('returns 404 when deleting a student record that does not exist', async () => {
    const res = await requestAs(app, 'admin')
      .delete('/api/admin/students/2147483647');
    expect(res.status).toBe(404);
  });

  // TEST 3: Cập nhật thông tin sinh viên (200 OK)
  it('cập nhật thông tin sinh viên thành công (200 OK)', async () => {
    expect(createdMaSV).not.toBeNull();

    const payload = {
      hoTen: 'Lê Hoàng Minh (Đã Cập Nhật)',
      email: `updated_${testMSSV}@student.edu.vn`,
      soDienThoai: '0911223344',
      maKhoa: 'CNTT',
      maCTDT: 'CTDT_CNTT_CQ',
      maLop: 'CNTT23_01',
      trangThai: 'DANG_HOC'
    };

    const res = await requestAs(app, "admin", 1)
      .put(`/api/admin/students/${createdMaSV}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data.hoTen).toBe('Lê Hoàng Minh (Đã Cập Nhật)');
  });

  // TEST 4: Xóa mềm / chuyển trạng thái thôi học (200 OK)
  it('xóa mềm chuyển trạng thái sinh viên sang THOI_HOC (200 OK)', async () => {
    expect(createdMaSV).not.toBeNull();

    const res = await requestAs(app, "admin", 1)
      .delete(`/api/admin/students/${createdMaSV}`);

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);

    // Kiểm tra trạng thái trong DB đã chuyển thành THOI_HOC hoặc đã xóa
    const check = await pool.request()
      .input('MaSV', sql.Int, createdMaSV)
      .query('SELECT TrangThai FROM dbo.SINHVIEN WHERE MaSV = @MaSV');

    if (check.recordset.length > 0) {
      expect(check.recordset[0].TrangThai).toBe('THOI_HOC');
    }
  });
});
