const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const { closePool } = require('../src/config/db');

describe('Admin Class Detail Modal & Filter Sync (/tdd & /ui-ux-pro-max)', () => {
  const adminJsPath = path.resolve(__dirname, '../../frontend/js/admin.js');
  const portalHtmlPath = path.resolve(__dirname, '../../frontend/portal-admin.html');

  let adminJsContent = '';
  let portalHtmlContent = '';

  beforeAll(() => {
    adminJsContent = fs.readFileSync(adminJsPath, 'utf8');
    portalHtmlContent = fs.readFileSync(portalHtmlPath, 'utf8');
  });

  afterAll(async () => {
    await closePool();
  });

  describe('Lát cắt 1: Backend API GET /api/classes/:id trả về cấu trúc chuẩn', () => {
    it('trả về chi tiết lớp kèm mảng sinh viên và soLuongSV (200 OK)', async () => {
      const res = await request(app).get('/api/classes/ATTT25_01');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('maLop', 'ATTT25_01');
      expect(res.body.data).toHaveProperty('tenLop');
      expect(res.body.data).toHaveProperty('tenKhoa');
      expect(res.body.data).toHaveProperty('students');
      expect(Array.isArray(res.body.data.students)).toBe(true);
      expect(res.body.data.students.length).toBeGreaterThanOrEqual(40);
      expect(res.body.data).toHaveProperty('soLuongSV');
      expect(res.body.data.soLuongSV).toBe(res.body.data.students.length);
    });
  });

  describe('Lát cắt 2: Frontend admin.js hiển thị đúng sĩ số và không bị crash', () => {
    it('thẻ card lớp sử dụng soLuongSV thay vì siSo bị undefined', () => {
      expect(adminJsContent).toMatch(/c\.soLuongSV/);
      expect(adminJsContent).not.toMatch(/<span>\$\{c\.siSo \|\| 0\} sinh viên<\/span>/);
    });

    it('viewClassDetailModal xử lý an toàn dữ liệu lớp không bị crash', () => {
      expect(adminJsContent).toMatch(/const\s+lop\s*=\s*data\.lop\s*\|\|\s*data/);
    });

    it('đồng bộ đúng ID bộ lọc Khoa và Năm nhập học với HTML', () => {
      expect(adminJsContent).toContain('filterAdminClassShKhoa');
      expect(adminJsContent).toContain('filterAdminClassShNam');
    });

    it('hỗ trợ tìm kiếm tức thì sinh viên trong lớp và đóng bằng ESC', () => {
      expect(adminJsContent).toContain('filterClassStudentsAdmin');
      expect(adminJsContent).toContain('adminClassStudentSearchInput');
      expect(adminJsContent).toMatch(/Escape/);
      expect(adminJsContent).toContain('closeClassDetailModal');
    });
  });

  describe('Lát cắt 3: Frontend portal-admin.html đồng bộ nạp khoa và cấu trúc modal UI/UX Pro Max', () => {
    it('khởi tạo trang nạp khoa động vào filterAdminClassShKhoa', () => {
      expect(portalHtmlContent).toContain("populateFaculties('filterAdminClassShKhoa'");
    });

    it('modal adminClassDetailModal có cấu trúc đầy đủ chuẩn UI/UX Pro Max', () => {
      expect(portalHtmlContent).toContain('id="adminClassDetailModal"');
      expect(portalHtmlContent).toContain('id="adminClassDetailBody"');
      expect(portalHtmlContent).toContain('id="adminClassStudentCountBadge"');
    });
  });
});
