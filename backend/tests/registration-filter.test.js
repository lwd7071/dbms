const fs = require('fs');
const path = require('path');

describe('Registration Planned & Unplanned Course Filter UI/UX (TDD Verification)', () => {
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

  describe('HTML Toolbar & Markup', () => {
    it('chứa cụm segmented filter với 3 tabs Theo kế hoạch, Ngoài kế hoạch, Tất cả', () => {
      expect(htmlContent).toContain('segmented-plan-filter');
      expect(htmlContent).toContain('data-filter="PLAN"');
      expect(htmlContent).toContain('data-filter="OTHER"');
      expect(htmlContent).toContain('data-filter="ALL"');
    });

    it('chứa ô input tìm kiếm học phần course-search-input', () => {
      expect(htmlContent).toContain('course-search-input');
    });
  });

  describe('CSS UI/UX Pro Max Styles', () => {
    it('chứa styles cho .segmented-filter và .segmented-btn', () => {
      expect(cssContent).toMatch(/\.segmented-filter\s*\{/);
      expect(cssContent).toMatch(/\.segmented-btn\s*\{/);
    });

    it('chứa styles cho .course-search-wrapper', () => {
      expect(cssContent).toMatch(/\.course-search-wrapper\s*\{/);
    });
  });

  describe('JS Registration Logic', () => {
    it('mặc định filter type là PLAN và truyền maSV cùng type khi gọi API', () => {
      expect(regJsContent).toContain("currentFilterType = 'PLAN'");
      expect(regJsContent).toContain('type: currentFilterType');
      expect(regJsContent).toContain('maSV: user.maSV');
    });

    it('render nhãn phân loại Theo kế hoạch / Ngoài kế hoạch trên từng lớp học phần', () => {
      expect(regJsContent).toContain('laTheoKeHoach');
      expect(regJsContent).toContain('Theo kế hoạch');
    });

    it('file registration.js không có lỗi cú pháp JavaScript', () => {
      expect(() => {
        new Function(regJsContent);
      }).not.toThrow();
    });
  });
});
