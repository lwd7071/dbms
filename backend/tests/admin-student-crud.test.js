const request = require('supertest');
const app = require('../src/app');
const { getPool, closePool, sql } = require('../src/config/db');

describe('Admin Student CRUD APIs (/api/admin/students)', () => {
  let pool;
  const testMSSV = '24119999';
  let createdMaSV = null;

  beforeAll(async () => {
    pool = await getPool();
    // Dọn dẹp dữ liệu test cũ nếu có
    await pool.request()
      .input('MaSinhVien', sql.VarChar(20), testMSSV)
      .query('DELETE FROM dbo.SINHVIEN WHERE MaSinhVien = @MaSinhVien');
  });

  afterAll(async () => {
    if (createdMaSV) {
      await pool.request()
        .input('MaSV', sql.Int, createdMaSV)
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
      email: 'sv_24119999@student.edu.vn',
      soDienThoai: '0988776655',
      maKhoa: 'CNTT',
      maLop: 'CNTT23_01',
      trangThai: 'DANG_HOC'
    };

    const res = await request(app)
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
    const payload = {
      maSinhVien: testMSSV,
      hoTen: 'Người Trùng Mã',
      maKhoa: 'CNTT',
      maLop: 'CNTT23_01'
    };

    const res = await request(app)
      .post('/api/admin/students')
      .send(payload);

    expect([400, 409]).toContain(res.status);
    expect(res.body.isSuccess).toBe(false);
  });

  // TEST 3: Cập nhật thông tin sinh viên (200 OK)
  it('cập nhật thông tin sinh viên thành công (200 OK)', async () => {
    expect(createdMaSV).not.toBeNull();

    const payload = {
      hoTen: 'Lê Hoàng Minh (Đã Cập Nhật)',
      email: 'minh_updated@student.edu.vn',
      soDienThoai: '0911223344',
      maKhoa: 'CNTT',
      maLop: 'CNTT23_01',
      trangThai: 'DANG_HOC'
    };

    const res = await request(app)
      .put(`/api/admin/students/${createdMaSV}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data.hoTen).toBe('Lê Hoàng Minh (Đã Cập Nhật)');
  });

  // TEST 4: Xóa mềm / chuyển trạng thái thôi học (200 OK)
  it('xóa mềm chuyển trạng thái sinh viên sang THOI_HOC (200 OK)', async () => {
    expect(createdMaSV).not.toBeNull();

    const res = await request(app)
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
