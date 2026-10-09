const request = require('supertest');
const app = require('../src/app');
const { closePool } = require('../src/config/db');

describe('Lecturer Portal APIs (/api/lecturers)', () => {
  afterAll(async () => {
    await closePool();
  });

  it('lấy danh sách lớp học phần giảng viên phụ trách (200 OK)', async () => {
    // Giảng viên MaGV = 1 (hoặc giảng viên có lớp)
    const res = await request(app).get('/api/lecturers/1/classes');

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const firstClass = res.body.data[0];
      expect(firstClass).toHaveProperty('maLHP');
      expect(firstClass).toHaveProperty('tenLHP');
      expect(firstClass).toHaveProperty('soLuongToiDa');
      expect(firstClass).toHaveProperty('siSoHienTai');
    }
  });

  it('lấy lịch dạy theo tuần của giảng viên (200 OK)', async () => {
    const res = await request(app).get('/api/lecturers/1/schedule');

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const schedule = res.body.data[0];
      expect(schedule).toHaveProperty('maLHP');
      expect(schedule).toHaveProperty('thu');
      expect(schedule).toHaveProperty('tietBatDau');
      expect(schedule).toHaveProperty('soTiet');
      expect(schedule).toHaveProperty('phongHoc');
    }
  });

  it('lấy danh sách sinh viên lớp học phần bao gồm thông tin lớp sinh hoạt hợp lệ (200 OK)', async () => {
    const res = await request(app).get('/api/lecturers/classes/LHP_HK7_DEVOPS_01/students');

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const firstStudent = res.body.data[0];
    expect(firstStudent).toHaveProperty('maDangKy');
    expect(firstStudent).toHaveProperty('maSinhVien');
    expect(firstStudent).toHaveProperty('hoTen');
    expect(firstStudent).toHaveProperty('lopHoc');
    // Đảm bảo lopHoc không bị undefined/null và là chuỗi tên hoặc mã lớp sinh hoạt
    expect(typeof firstStudent.lopHoc).toBe('string');
    expect(firstStudent.lopHoc.length).toBeGreaterThan(0);
  });

  it('trả về danh sách rỗng khi lớp học phần không có sinh viên (200 OK)', async () => {
    const res = await request(app).get('/api/lecturers/classes/LHP_NOT_EXIST/students');

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});
