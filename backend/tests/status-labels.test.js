const fs = require('fs');
const path = require('path');

describe('Status Labels Vietnamese Localization (TDD Verification)', () => {
  const apiJsPath = path.resolve(__dirname, '../../frontend/js/api.js');
  let apiJsContent = '';
  let formatStatusBadge;
  let renderStatusBadge;

  beforeAll(() => {
    apiJsContent = fs.readFileSync(apiJsPath, 'utf8');

    // Tạo sandbox thực thi an toàn để lấy hàm formatStatusBadge từ frontend/js/api.js
    const context = {
      window: { location: { origin: 'http://localhost:5000' } },
      document: { querySelectorAll: () => [], getElementById: () => null }
    };
    try {
      const scriptFn = new Function('window', 'document', `${apiJsContent}; return { formatStatusBadge: window.formatStatusBadge, renderStatusBadge: window.renderStatusBadge };`);
      const exported = scriptFn(context.window, context.document);
      formatStatusBadge = exported.formatStatusBadge;
      renderStatusBadge = exported.renderStatusBadge;
    } catch (e) {
      console.error(e);
    }
  });

  describe('Lát cắt 1: formatStatusBadge helper function', () => {
    it('định nghĩa hàm formatStatusBadge và renderStatusBadge trong api.js', () => {
      expect(typeof formatStatusBadge).toBe('function');
      expect(typeof renderStatusBadge).toBe('function');
    });

    it('chuyển đổi trạng thái Lớp học phần: DA_KHOA -> Đã khóa (badge-warning)', () => {
      const res = formatStatusBadge('DA_KHOA');
      expect(res.text).toBe('Đã khóa');
      expect(res.badgeClass).toBe('badge-warning');
    });

    it('chuyển đổi trạng thái Đăng ký tín chỉ: REGISTERED -> Đã đăng ký, CANCELLED -> Đã hủy', () => {
      const reg = formatStatusBadge('REGISTERED');
      expect(reg.text).toBe('Đã đăng ký');
      expect(reg.badgeClass).toBe('badge-success');

      const cancel = formatStatusBadge('CANCELLED');
      expect(cancel.text).toBe('Đã hủy');
      expect(cancel.badgeClass).toBe('badge-danger');
    });

    it('chuyển đổi trạng thái Sinh viên: DANG_HOC -> Đang học, BAO_LUU -> Bảo lưu', () => {
      const stud = formatStatusBadge('DANG_HOC');
      expect(stud.text).toBe('Đang học');
      expect(stud.badgeClass).toBe('badge-success');

      const leave = formatStatusBadge('BAO_LUU');
      expect(leave.text).toBe('Bảo lưu');
      expect(leave.badgeClass).toBe('badge-warning');
    });

    it('chuyển đổi trạng thái Tài khoản và Học phí: ACTIVE, PAID, PARTIAL', () => {
      const active = formatStatusBadge('ACTIVE');
      expect(active.text).toBe('Hoạt động');

      const paid = formatStatusBadge('PAID');
      expect(paid.text).toBe('Đã thanh toán');

      const partial = formatStatusBadge('PARTIAL');
      expect(partial.text).toBe('Thanh toán 1 phần');
    });

    it('hàm renderStatusBadge trả về chuỗi thẻ span badge hoàn chỉnh', () => {
      const html = renderStatusBadge('DA_KHOA');
      expect(html).toContain('class="badge badge-warning"');
      expect(html).toContain('Đã khóa');
    });
  });

  describe('Lát cắt 2 & 3: Frontend Portals Localization Verification', () => {
    const studentJsContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/js/student.js'), 'utf8');
    const adminJsContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/js/admin.js'), 'utf8');
    const lecturerJsContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/js/lecturer.js'), 'utf8');
    const adminHtmlContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/portal-admin.html'), 'utf8');

    it('student.js không hiển thị mã thô DANG_HOC, ACTIVE mà dùng renderStatusBadge', () => {
      expect(studentJsContent).toContain('renderStatusBadge');
      expect(studentJsContent).not.toMatch(/>\$\{profile\.trangThai\}<\/span>/);
    });

    it('admin.js áp dụng renderStatusBadge cho Sinh viên, Lớp học phần, Đăng ký và Tài khoản', () => {
      expect(adminJsContent).toContain('renderStatusBadge(s.trangThai)');
      expect(adminJsContent).toContain('renderStatusBadge(c.trangThai)');
      expect(adminJsContent).toContain('renderStatusBadge(r.trangThai)');
      expect(adminJsContent).toContain('renderStatusBadge(u.trangThai)');
    });

    it('lecturer.js áp dụng renderStatusBadge cho Lớp học phần', () => {
      expect(lecturerJsContent).toContain('renderStatusBadge(c.trangThai)');
    });

    it('portal-admin.html dropdown options hiển thị tiếng Việt có dấu chuẩn mực', () => {
      expect(adminHtmlContent).toContain('>Đã đăng ký<');
      expect(adminHtmlContent).toContain('>Đã hủy<');
      expect(adminHtmlContent).not.toContain('Da dang ky');
      expect(adminHtmlContent).not.toContain('(REGISTERED)');
    });
  });
});
