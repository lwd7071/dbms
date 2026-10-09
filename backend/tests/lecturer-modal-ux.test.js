const fs = require('fs');
const path = require('path');

describe('Lecturer Modal UX & Scroll Performance (/ui-ux-pro-max)', () => {
  const cssPath = path.resolve(__dirname, '../../frontend/css/styles.css');
  const htmlPath = path.resolve(__dirname, '../../frontend/portal-lecturer.html');
  const jsPath = path.resolve(__dirname, '../../frontend/js/lecturer.js');

  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  it('CSS modal-dialog có giới hạn max-height và flexbox để ngăn chặn tràn màn hình / đơ cứng', () => {
    expect(cssContent).toMatch(/\.modal-dialog\s*\{[^}]*max-height/i);
    expect(cssContent).toMatch(/\.modal-dialog\s*\{[^}]*display:\s*flex/i);
  });

  it('CSS modal-body có overflow-y: auto và flex co giãn để cuộn độc lập mượt mà', () => {
    expect(cssContent).toMatch(/\.modal-body\s*\{[^}]*overflow-y:\s*auto/i);
    expect(cssContent).toMatch(/\.modal-body\s*\{[^}]*flex:/i);
  });

  it('CSS hỗ trợ modal-table-sticky thead th với position: sticky để cố định tiêu đề cột khi cuộn', () => {
    expect(cssContent).toMatch(/\.modal-table-sticky\s+thead\s+th\s*\{[^}]*position:\s*sticky/i);
  });

  it('portal-lecturer.html có thanh tìm kiếm sinh viên và bộ lọc lớp sinh hoạt trong modal', () => {
    expect(htmlContent).toContain('id="classStudentSearchInput"');
    expect(htmlContent).toContain('id="classStudentClassFilter"');
    expect(htmlContent).toContain('class="table modal-table-sticky"');
  });

  it('frontend/js/lecturer.js hỗ trợ lọc tức thời, đóng khi click backdrop và bấm ESC', () => {
    expect(jsContent).toContain('filterClassStudents');
    expect(jsContent).toContain('closeClassStudentsModal');
    expect(jsContent).toMatch(/Escape/i);
  });
});
