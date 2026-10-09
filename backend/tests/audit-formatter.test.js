const fs = require('fs');
const path = require('path');

describe('Audit Trail & Role Localization Formatter (TDD Verification)', () => {
  const apiJsPath = path.resolve(__dirname, '../../frontend/js/api.js');
  let formatRoleBadge;
  let renderRoleBadge;
  let formatAuditAction;
  let formatAuditTable;
  let formatAuditContent;

  beforeAll(() => {
    const apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
    const context = {
      window: { location: { origin: 'http://localhost:5000' } },
      document: { querySelectorAll: () => [], getElementById: () => null }
    };
    try {
      const scriptFn = new Function('window', 'document', `
        ${apiJsContent}; 
        return { 
          formatRoleBadge: window.formatRoleBadge,
          renderRoleBadge: window.renderRoleBadge,
          formatAuditAction: window.formatAuditAction,
          formatAuditTable: window.formatAuditTable,
          formatAuditContent: window.formatAuditContent
        };
      `);
      const exported = scriptFn(context.window, context.document);
      formatRoleBadge = exported.formatRoleBadge;
      renderRoleBadge = exported.renderRoleBadge;
      formatAuditAction = exported.formatAuditAction;
      formatAuditTable = exported.formatAuditTable;
      formatAuditContent = exported.formatAuditContent;
    } catch (e) {
      console.error('Lỗi khởi tạo sandbox:', e);
    }
  });

  describe('Lát cắt 1: formatRoleBadge & formatAuditAction helpers', () => {
    it('định nghĩa đầy đủ các hàm formatter trong window', () => {
      expect(typeof formatRoleBadge).toBe('function');
      expect(typeof renderRoleBadge).toBe('function');
      expect(typeof formatAuditAction).toBe('function');
      expect(typeof formatAuditTable).toBe('function');
      expect(typeof formatAuditContent).toBe('function');
    });

    it('chuyển đổi vai trò hệ thống sang Tiếng Việt có dấu chuẩn', () => {
      expect(formatRoleBadge('SINH_VIEN').text).toBe('Sinh viên');
      expect(formatRoleBadge('SINH_VIEN').badgeClass).toBe('badge-info');

      expect(formatRoleBadge('GIANG_VIEN').text).toBe('Giảng viên');
      expect(formatRoleBadge('GIANG_VIEN').badgeClass).toBe('badge-primary');

      expect(formatRoleBadge('DAO_TAO').text).toBe('Cán bộ Đào tạo');
      expect(formatRoleBadge('DAO_TAO').badgeClass).toBe('badge-warning');

      expect(formatRoleBadge('QUAN_TRI').text).toBe('Quản trị viên');
      expect(formatRoleBadge('QUAN_TRI').badgeClass).toBe('badge-danger');

      expect(formatRoleBadge('SYSTEM').text).toBe('Hệ thống');
    });

    it('renderRoleBadge trả về thẻ HTML span badge chuẩn ngữ nghĩa', () => {
      const html = renderRoleBadge('SINH_VIEN');
      expect(html).toContain('class="badge badge-info"');
      expect(html).toContain('Sinh viên');
    });

    it('chuyển đổi hành động Audit sang Tiếng Việt', () => {
      expect(formatAuditAction('INSERT').text).toBe('Thêm mới');
      expect(formatAuditAction('INSERT').badgeClass).toBe('badge-success');

      expect(formatAuditAction('UPDATE').text).toBe('Cập nhật');
      expect(formatAuditAction('UPDATE').badgeClass).toBe('badge-warning');

      expect(formatAuditAction('DELETE').text).toBe('Xóa');
      expect(formatAuditAction('DELETE').badgeClass).toBe('badge-danger');
    });

    it('chuyển đổi tên bảng CSDL sang Tiếng Việt thân thiện', () => {
      expect(formatAuditTable('TAIKHOAN')).toContain('Tài khoản');
      expect(formatAuditTable('DANGKYTINCHI')).toContain('Đăng ký tín chỉ');
      expect(formatAuditTable('HOCPHI')).toContain('Học phí');
      expect(formatAuditTable('CHITIETTHANHTOAN')).toContain('Thanh toán học phí');
    });
  });

  describe('Lát cắt 2: formatAuditContent chuyển đổi JSON sang ngôn ngữ đọc hiểu', () => {
    it('UPDATE: phát hiện và format trường thay đổi giữa nội dung cũ và mới', () => {
      const oldJson = JSON.stringify({ Username: 'admin', TrangThai: 'ACTIVE' });
      const newJson = JSON.stringify({ Username: 'admin', TrangThai: 'LOCKED' });

      const html = formatAuditContent('UPDATE', oldJson, newJson);
      expect(html).toContain('Trạng thái');
      expect(html).toContain('Hoạt động');
      expect(html).toContain('Đã khóa');
      expect(html).toContain('→');
    });

    it('UPDATE: format trường thời gian Lần đăng nhập cuối dễ nhìn', () => {
      const oldJson = JSON.stringify({ Username: 'admin', LanDangNhapCuoi: '2026-10-09T07:00:00.000Z' });
      const newJson = JSON.stringify({ Username: 'admin', LanDangNhapCuoi: '2026-10-09T14:56:27.000Z' });

      const html = formatAuditContent('UPDATE', oldJson, newJson);
      expect(html).toContain('Lần đăng nhập cuối');
      expect(html).toContain('→');
      expect(html).toContain('<summary');
      expect(html).toContain('Chi tiết JSON gốc');
    });

    it('INSERT: format thông tin tạo mới thành ngôn ngữ tự nhiên tiếng Việt', () => {
      const newJson = JSON.stringify({
        Username: 'sv_25001500',
        VaiTro: 'SINH_VIEN',
        TrangThai: 'ACTIVE'
      });

      const html = formatAuditContent('INSERT', null, newJson);
      expect(html).toContain('Tạo mới');
      expect(html).toContain('Tên đăng nhập: <strong>sv_25001500</strong>');
      expect(html).toContain('Vai trò: <strong>Sinh viên</strong>');
      expect(html).toContain('Trạng thái: <strong>Hoạt động</strong>');
    });

    it('DELETE: format thông tin xóa bản ghi bằng tiếng Việt', () => {
      const oldJson = JSON.stringify({ Username: 'sv_deleted', HoTen: 'Nguyễn Văn X' });
      const html = formatAuditContent('DELETE', oldJson, null);
      expect(html).toContain('Xóa bản ghi');
      expect(html).toContain('sv_deleted');
    });

    it('xử lý chuỗi JSON không hợp lệ an toàn, không ném ngoại lệ', () => {
      expect(() => {
        const res = formatAuditContent('UPDATE', 'INVALID_JSON', '{bad_json}');
        expect(res).toBeTruthy();
      }).not.toThrow();
    });
  });

  describe('Lát cắt 3: Rà soát không còn sót mã thô tiếng Anh trong giao diện', () => {
    const adminJsContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/js/admin.js'), 'utf8');
    const adminHtmlContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/portal-admin.html'), 'utf8');
    const tuitionJsContent = fs.readFileSync(path.resolve(__dirname, '../../frontend/js/tuition.js'), 'utf8');

    it('admin.js bảng báo cáo học phí không còn <th>UNPAID</th>, <th>PARTIAL</th>, <th>PAID</th>', () => {
      expect(adminJsContent).not.toContain('<th>UNPAID</th>');
      expect(adminJsContent).not.toContain('<th>PARTIAL</th>');
      expect(adminJsContent).not.toContain('<th>PAID</th>');
      expect(adminJsContent).toContain('Chưa thanh toán');
      expect(adminJsContent).toContain('Thanh toán 1 phần');
      expect(adminJsContent).toContain('Đã hoàn thành');
    });

    it('admin.js bảng tài khoản người dùng hiển thị vai trò tiếng Việt', () => {
      expect(adminJsContent).toContain('renderRoleBadge(u.vaiTro)');
    });

    it('admin.js bảng nhật ký hoạt động áp dụng formatAuditContent và tiếng Việt', () => {
      expect(adminJsContent).toContain('formatAuditAction(l.hanhDong)');
      expect(adminJsContent).toContain('formatAuditTable(l.tenBang)');
      expect(adminJsContent).toContain('formatAuditContent(l.hanhDong, l.noiDungCu, l.noiDungMoi)');
    });

    it('portal-admin.html bộ lọc vai trò và trạng thái không còn mã thô tiếng Anh', () => {
      expect(adminHtmlContent).not.toContain('<option value="SINH_VIEN">SINH_VIEN</option>');
      expect(adminHtmlContent).not.toContain('<option value="ACTIVE">Hoạt động (ACTIVE)</option>');
      expect(adminHtmlContent).not.toContain('<option value="UNPAID">Chưa nộp (UNPAID)</option>');
    });

    it('tuition.js không còn dính các chuỗi (UNPAID), (PARTIAL), (PAID)', () => {
      expect(tuitionJsContent).not.toContain('(UNPAID)');
      expect(tuitionJsContent).not.toContain('(PARTIAL)');
      expect(tuitionJsContent).not.toContain('(PAID)');
    });
  });
});
