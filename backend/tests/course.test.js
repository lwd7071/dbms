const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { closePool } = require('../src/config/db');

describe('Slice 4: Available Courses Endpoints', () => {
  afterAll(async () => {
    await closePool();
  });

  describe('GET /api/courses/available', () => {
    it('lấy danh sách lớp học phần mở đăng ký kèm phân trang và sĩ số tính động', async () => {
      const res = await requestAs(app, "student", 1)
        .get('/api/courses/available')
        .query({ maHocKy: 7, page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('pageSize', 10);
      expect(res.body.data).toHaveProperty('totalItems');
      expect(res.body.data).toHaveProperty('totalPages');

      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeLessThanOrEqual(10);

      const firstItem = res.body.data.items[0];
      expect(firstItem).toHaveProperty('maLHP');
      expect(firstItem).toHaveProperty('tenLHP');
      expect(firstItem).toHaveProperty('maMonHoc');
      expect(firstItem).toHaveProperty('tenMonHoc');
      expect(firstItem).toHaveProperty('soTinChi');
      expect(firstItem).toHaveProperty('soLuongToiDa');
      expect(firstItem).toHaveProperty('siSoHienTai'); // Sĩ số tính toán động
      expect(typeof firstItem.siSoHienTai).toBe('number');
    });

    it('tìm kiếm môn học theo từ khóa search (CSDL hoặc ANHVAN)', async () => {
      const res = await requestAs(app, "student", 1)
        .get('/api/courses/available')
        .query({ maHocKy: 7, search: 'ANHVAN' });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      res.body.data.items.forEach(item => {
        const match =
          item.maLHP.includes('ANHVAN') ||
          item.maMonHoc.includes('ANHVAN') ||
          item.tenMonHoc.toLowerCase().includes('tiếng anh');
        expect(match).toBe(true);
      });
    });

    it('lọc danh sách theo mã khoa (CNTT)', async () => {
      const res = await requestAs(app, "student", 1)
        .get('/api/courses/available')
        .query({ maHocKy: 7, maKhoa: 'CNTT', page: 1, pageSize: 5 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.pageSize).toBe(5);
    });

    it('lọc danh sách lớp học phần THEO KẾ HOẠCH (type=PLAN, maSV=1) chỉ trả về môn HK7 của sinh viên', async () => {
      const res = await requestAs(app, "student", 1)
        .get('/api/courses/available')
        .query({ maHocKy: 7, maSV: 1, type: 'PLAN' });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);

      // SV 1 thuộc ngành KTPM, các môn theo kế hoạch HK7 là MOBILE và TTNT
      res.body.data.items.forEach(item => {
        expect(['MOBILE', 'TTNT']).toContain(item.maMonHoc);
        expect(item.laTheoKeHoach).toBe(true);
      });
    });

    it('lọc danh sách lớp học phần NGOÀI KẾ HOẠCH (type=OTHER, maSV=1) không chứa môn HK7 của sinh viên', async () => {
      const res = await requestAs(app, "student", 1)
        .get('/api/courses/available')
        .query({ maHocKy: 7, maSV: 1, type: 'OTHER' });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);

      res.body.data.items.forEach(item => {
        expect(['MOBILE', 'TTNT']).not.toContain(item.maMonHoc);
        expect(item.laTheoKeHoach).toBe(false);
      });
    });

    it('từ chối tham số phân trang không hợp lệ (400 Bad Request)', async () => {
      const res = await requestAs(app, "student", 1)
        .get('/api/courses/available')
        .query({ page: -1 });

      expect(res.status).toBe(400);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.errors[0]).toHaveProperty('field', 'page');
    });
  });
});
