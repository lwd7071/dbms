const fs = require('fs');
const path = require('path');

describe('Student Dashboard Layout & CSS (TDD Verification)', () => {
  const cssPath = path.resolve(__dirname, '../../frontend/css/styles.css');
  const studentJsPath = path.resolve(__dirname, '../../frontend/js/student.js');

  let cssContent = '';
  let studentJsContent = '';

  beforeAll(() => {
    cssContent = fs.readFileSync(cssPath, 'utf8');
    studentJsContent = fs.readFileSync(studentJsPath, 'utf8');
  });

  describe('CSS Rule Integrity for Dashboard', () => {
    it('chứa định nghĩa class .summary-cards với display: grid', () => {
      // Phải có định nghĩa .summary-cards để không bị rớt dòng thành single column
      expect(cssContent).toMatch(/\.summary-cards\s*\{[^}]*display:\s*grid/);
    });

    it('có cấu hình 4 cột trên desktop cho .summary-cards', () => {
      // Grid template columns repeat(4, ...) hoặc 4 columns layout
      expect(cssContent).toMatch(/\.summary-cards\s*\{[^}]*grid-template-columns:[^}]*repeat\(\s*4/);
    });

    it('có class .dashboard-compact-grid hoặc bento layout cho hàng dưới', () => {
      expect(cssContent).toMatch(/\.dashboard-bento/);
    });
  });

  describe('Student Dashboard Structure in student.js', () => {
    it('render 4 thẻ KPI trong container .summary-cards', () => {
      expect(studentJsContent).toContain('summary-cards');
      expect(studentJsContent).toContain('GPA Tích Lũy');
      expect(studentJsContent).toContain('Tổng Tín Chỉ Tích Lũy');
      expect(studentJsContent).toContain('Học Phí Còn Phải Nộp');
    });

    it('sử dụng layout bento 2 cột cho thông báo và lối tắt thao tác', () => {
      expect(studentJsContent).toContain('dashboard-bento');
    });

    it('có khối lối tắt nhanh học vụ dạng lưới tiện ích gọn gàng', () => {
      expect(studentJsContent).toContain('dashboard-shortcuts');
    });

    it('file student.js không chứa lỗi cú pháp JavaScript', () => {
      expect(() => {
        new Function(studentJsContent);
      }).not.toThrow();
    });
  });
});
