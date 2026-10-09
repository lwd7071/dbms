const request = require('supertest');
const app = require('../src/app');
const { closePool } = require('../src/config/db');

describe('Student Academic Views Endpoints (GET /api/students/:id/...)', () => {
  afterAll(async () => {
    await closePool();
  });

  describe('GET /api/students/:id/schedule', () => {
    it('lấy thời khóa biểu của sinh viên 1 trong học kỳ 7', async () => {
      const res = await request(app)
        .get('/api/students/1/schedule')
        .query({ maHocKy: 7 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const item = res.body.data[0];
      expect(item).toHaveProperty('maSV', 1);
      expect(item).toHaveProperty('tenMonHoc');
      expect(item).toHaveProperty('thu');
      expect(item).toHaveProperty('tietBatDau');
      expect(item).toHaveProperty('phongHoc');
    });
  });

  describe('GET /api/students/:id/grades', () => {
    it('lấy bảng điểm chi tiết kèm GPA, tổng tín chỉ và cấu trúc phân theo từng học kỳ', async () => {
      const res = await request(app).get('/api/students/1/grades');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('grades');
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data.summary).toHaveProperty('tongTinChiTichLuy');
      expect(res.body.data.summary).toHaveProperty('gpa');
      expect(typeof res.body.data.summary.gpa).toBe('number');
      expect(res.body.data.summary.tongTinChiTichLuy).toBeGreaterThan(0);

      // Kiểm tra mảng phân nhóm theo từng học kỳ
      expect(res.body.data).toHaveProperty('semesters');
      expect(Array.isArray(res.body.data.semesters)).toBe(true);
      expect(res.body.data.semesters.length).toBeGreaterThan(0);

      const sem = res.body.data.semesters[0];
      expect(sem).toHaveProperty('maHocKy');
      expect(sem).toHaveProperty('tenHocKy');
      expect(sem).toHaveProperty('namHoc');
      expect(sem).toHaveProperty('soTinChiDangKy');
      expect(sem).toHaveProperty('soTinChiDat');
      expect(sem).toHaveProperty('diemTrungBinhHocKy');
      expect(sem).toHaveProperty('diemTrungBinhTichLuy');
      expect(sem).toHaveProperty('xepLoaiHocKy');
      expect(sem).toHaveProperty('grades');
      expect(sem.diemTrungBinhHocKy === null || typeof sem.diemTrungBinhHocKy === 'number').toBe(true);

      // Xác nhận học kỳ gần nhất (mới nhất) phải nằm ở đầu danh sách
      if (res.body.data.semesters.length > 1) {
        const firstSem = res.body.data.semesters[0];
        const lastSem = res.body.data.semesters[res.body.data.semesters.length - 1];
        expect(firstSem.maHocKy).toBeGreaterThan(lastSem.maHocKy);
      }
    });

    it('hiển thị các môn đã đăng ký trong học kỳ hiện tại với trạng thái ĐANG HỌC và điểm null', async () => {
      const res = await request(app).get('/api/students/1/grades');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);

      // Học kỳ đầu tiên (mới nhất) phải là học kỳ 7
      const latestSem = res.body.data.semesters[0];
      expect(latestSem.maHocKy).toBe(7);
      expect(latestSem.grades.length).toBeGreaterThan(0);

      // Tất cả môn trong học kỳ 7 chưa có điểm phải có kết quả 'ĐANG HỌC' và điểm null
      const inProgressGrade = latestSem.grades[0];
      expect(inProgressGrade.ketQua).toBe('ĐANG HỌC');
      expect(inProgressGrade.diemTongKet).toBeNull();
      expect(latestSem.diemTrungBinhHocKy).toBeNull();
      expect(latestSem.xepLoaiHocKy).toBe('Đang học');
      expect(latestSem.soTinChiDangKy).toBeGreaterThan(0);
      expect(latestSem.soTinChiDat).toBe(0);
    });

    it('lọc bảng điểm theo học kỳ cụ thể khi truyền maHocKy', async () => {
      const res = await request(app)
        .get('/api/students/1/grades')
        .query({ maHocKy: 1 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.semesters.length).toBe(1);
      expect(res.body.data.semesters[0].maHocKy).toBe(1);
    });
  });

  describe('GET /api/students/:id/tuition', () => {
    it('lấy hồ sơ học phí của sinh viên 1', async () => {
      const res = await request(app).get('/api/students/1/tuition');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      if (res.body.data.length > 0) {
        const item = res.body.data[0];
        expect(item).toHaveProperty('maHocPhi');
        expect(item).toHaveProperty('tongTien');
        expect(item).toHaveProperty('soTienDaThanhToan');
        expect(item).toHaveProperty('soTienConLai');
        expect(item).toHaveProperty('trangThai');
      }
    });
  });

  describe('GET /api/students/:id/payments', () => {
    it('lấy lịch sử thanh toán của sinh viên có phân trang và metadata', async () => {
      const res = await request(app)
        .get('/api/students/1/payments')
        .query({ page: 1, pageSize: 5 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('pageSize', 5);
      expect(res.body.data).toHaveProperty('totalItems');
      expect(res.body.data).toHaveProperty('totalPages');

      if (res.body.data.items.length > 0) {
        const item = res.body.data.items[0];
        expect(item).toHaveProperty('maThanhToan');
        expect(item).toHaveProperty('soTien');
        expect(item).toHaveProperty('phuongThuc');
        expect(item).toHaveProperty('trangThai');
      }
    });
  });

  describe('GET /api/students/:id/profile', () => {
    it('lấy thông tin hồ sơ chi tiết của sinh viên 1', async () => {
      const res = await request(app).get('/api/students/1/profile');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('maSV', 1);
      expect(res.body.data).toHaveProperty('maSinhVien');
      expect(res.body.data).toHaveProperty('hoTen');
      expect(res.body.data).toHaveProperty('tenKhoa');
      expect(res.body.data).toHaveProperty('username');
    });

    it('trả về 404 nếu không tìm thấy sinh viên', async () => {
      const res = await request(app).get('/api/students/999999/profile');
      expect(res.status).toBe(404);
      expect(res.body.isSuccess).toBe(false);
    });
  });
});
