const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { closePool } = require('../src/config/db');

describe('Administrative Classes Management APIs (GET /api/classes)', () => {
  afterAll(async () => {
    await closePool();
  });

  it('lấy danh sách toàn bộ 36 lớp sinh hoạt có sĩ số động (200 OK)', async () => {
    const res = await requestAs(app, "training", 1).get('/api/classes');

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(36);

    const firstClass = res.body.data[0];
    expect(firstClass).toHaveProperty('maLop');
    expect(firstClass).toHaveProperty('tenLop');
    expect(firstClass).toHaveProperty('maKhoa');
    expect(firstClass).toHaveProperty('khoaHoc');
    expect(firstClass).toHaveProperty('namNhapHoc');
    expect(firstClass).toHaveProperty('soLuongSV');
    expect(firstClass.soLuongSV).toBeGreaterThanOrEqual(40);
  });

  it('lọc lớp sinh hoạt theo khoa maKhoa=CNTT (200 OK)', async () => {
    const res = await requestAs(app, "training", 1).get('/api/classes?maKhoa=CNTT');

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data.length).toBe(6);
    expect(res.body.data.every((c) => c.maKhoa === 'CNTT')).toBe(true);
  });

  it('lọc lớp sinh hoạt theo năm nhập học namNhapHoc=2023 (200 OK)', async () => {
    const res = await requestAs(app, "training", 1).get('/api/classes?namNhapHoc=2023');

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data.length).toBe(12);
    expect(res.body.data.every((c) => c.namNhapHoc === 2023)).toBe(true);
  });

  it('lấy thông tin chi tiết một lớp và danh sách sinh viên (200 OK)', async () => {
    const res = await requestAs(app, "training", 1).get('/api/classes/CNTT23_01');

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data.maLop).toBe('CNTT23_01');
    expect(res.body.data).toHaveProperty('tenLop');
    expect(Array.isArray(res.body.data.students)).toBe(true);
    expect(res.body.data.students.length).toBeGreaterThanOrEqual(40);
    expect(res.body.data.students[0]).toHaveProperty('maSinhVien');
    expect(res.body.data.students[0]).toHaveProperty('hoTen');
  });

  it('báo lỗi 404 khi không tìm thấy lớp sinh hoạt', async () => {
    const res = await requestAs(app, "training", 1).get('/api/classes/KHONG_TON_TAI');

    expect(res.status).toBe(404);
    expect(res.body.isSuccess).toBe(false);
  });
});
