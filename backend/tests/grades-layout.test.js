const fs = require('fs');
const path = require('path');

describe('Student Grades Semester-Grouped Layout & UI/UX (TDD Verification)', () => {
  const htmlPath = path.resolve(__dirname, '../../frontend/portal-student.html');
  const cssPath = path.resolve(__dirname, '../../frontend/css/styles.css');
  const regJsPath = path.resolve(__dirname, '../../frontend/js/registration.js');

  let htmlContent = '';
  let cssContent = '';
  let regJsContent = '';

  beforeAll(() => {
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    cssContent = fs.readFileSync(cssPath, 'utf8');
    regJsContent = fs.readFileSync(regJsPath, 'utf8');
  });

  describe('HTML Markup Integrity', () => {
    it('chứa bộ lọc chọn học kỳ trong tab Kết quả học tập', () => {
      expect(htmlContent).toContain('filter-grade-semester');
    });

    it('chứa container grades-container để render danh sách học kỳ', () => {
      expect(htmlContent).toContain('grades-container');
    });
  });

  describe('CSS UI/UX Pro Max Classes', () => {
    it('chứa class .semester-grade-card cho khối từng học kỳ', () => {
      expect(cssContent).toMatch(/\.semester-grade-card\s*\{/);
    });

    it('chứa class .semester-summary-bar cho thanh tổng kết GPA và tín chỉ từng kỳ', () => {
      expect(cssContent).toMatch(/\.semester-summary-bar\s*\{/);
    });
  });
  describe('JS Logic in registration.js', () => {
    it('hàm loadGrades render theo từng học kỳ và hiển thị GPA học kỳ', () => {
      expect(regJsContent).toContain('diemTrungBinhHocKy');
      expect(regJsContent).toContain('soTinChiDangKy');
      expect(regJsContent).toContain('soTinChiDat');
      expect(regJsContent).toContain('diemTrungBinhTichLuy');
    });

    it('hỗ trợ hiển thị môn và học kỳ ở trạng thái ĐANG HỌC an toàn không crash toFixed', () => {
      expect(regJsContent).toContain('ĐANG HỌC');
      expect(regJsContent).toMatch(/diemTrungBinhHocKy\s*!==\s*null/);
    });

    it('file registration.js không chứa lỗi cú pháp JavaScript', () => {
      expect(() => {
        new Function(regJsContent);
      }).not.toThrow();
    });
  });
});
