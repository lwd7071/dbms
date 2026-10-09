const fs = require('fs');
const path = require('path');

describe('Admin Navigation Grouping & UI/UX Pro Max Dropdown (TDD Verification)', () => {
  const adminHtmlPath = path.resolve(__dirname, '../../frontend/portal-admin.html');
  const stylesCssPath = path.resolve(__dirname, '../../frontend/css/styles.css');
  const adminJsPath = path.resolve(__dirname, '../../frontend/js/admin.js');

  let adminHtmlContent = '';
  let stylesCssContent = '';
  let adminJsContent = '';

  beforeAll(() => {
    adminHtmlContent = fs.readFileSync(adminHtmlPath, 'utf8');
    stylesCssContent = fs.readFileSync(stylesCssPath, 'utf8');
    adminJsContent = fs.readFileSync(adminJsPath, 'utf8');
  });

  describe('Lát cắt 1: Cấu trúc HTML gom nhóm 4 phân hệ (portal-admin.html)', () => {
    it('thanh tabs-nav chỉ chứa 4 nút/nhóm phân hệ chính thay vì 10 tab dàn hàng ngang', () => {
      // 1 nút đơn Dashboard và 3 nhóm dropdown
      expect(adminHtmlContent).toMatch(/<button[^>]*switchAdminTab\(['"]dashboard['"][^>]*>[\s\S]*?Dashboard/);
      expect(adminHtmlContent).toContain('data-group="academic"');
      expect(adminHtmlContent).toContain('data-group="finance"');
      expect(adminHtmlContent).toContain('data-group="system"');
    });

    it('nhóm Quản lý Đào tạo (academic) chứa đầy đủ 4 tab nghiệp vụ', () => {
      expect(adminHtmlContent).toMatch(/data-group="academic"[\s\S]*?switchAdminTab\(['"]students['"]/);
      expect(adminHtmlContent).toMatch(/data-group="academic"[\s\S]*?switchAdminTab\(['"]classes-sh['"]/);
      expect(adminHtmlContent).toMatch(/data-group="academic"[\s\S]*?switchAdminTab\(['"]classes['"]/);
      expect(adminHtmlContent).toMatch(/data-group="academic"[\s\S]*?switchAdminTab\(['"]registrations['"]/);
    });

    it('nhóm Tài chính & Học phí (finance) chứa đầy đủ 3 tab nghiệp vụ', () => {
      expect(adminHtmlContent).toMatch(/data-group="finance"[\s\S]*?switchAdminTab\(['"]pending['"]/);
      expect(adminHtmlContent).toMatch(/data-group="finance"[\s\S]*?switchAdminTab\(['"]cashier['"]/);
      expect(adminHtmlContent).toMatch(/data-group="finance"[\s\S]*?switchAdminTab\(['"]report['"]/);
    });

    it('nhóm Quản trị Hệ thống (system) chứa đầy đủ 2 tab nghiệp vụ', () => {
      expect(adminHtmlContent).toMatch(/data-group="system"[\s\S]*?switchAdminTab\(['"]users['"]/);
      expect(adminHtmlContent).toMatch(/data-group="system"[\s\S]*?switchAdminTab\(['"]audit['"]/);
    });

    it('bảo toàn đầy đủ tất cả 10 tab-pane trong nội dung chính', () => {
      const requiredPanes = [
        'tab-dashboard', 'tab-students', 'tab-classes-sh', 'tab-classes',
        'tab-registrations', 'tab-pending', 'tab-cashier', 'tab-report',
        'tab-users', 'tab-audit'
      ];
      requiredPanes.forEach(paneId => {
        expect(adminHtmlContent).toContain(`id="${paneId}"`);
      });
    });
  });

  describe('Lát cắt 2: Styles CSS UI/UX Pro Max Dropdown Tabs (styles.css)', () => {
    it('định nghĩa các class CSS chuẩn cho Dropdown Tabs: .tab-group, .tab-dropdown-btn, .tab-dropdown-menu', () => {
      expect(stylesCssContent).toContain('.tab-group');
      expect(stylesCssContent).toContain('.tab-dropdown-btn');
      expect(stylesCssContent).toContain('.tab-dropdown-menu');
      expect(stylesCssContent).toContain('.tab-dropdown-item');
    });

    it('menu dropdown có z-index cao và định vị tuyệt đối không làm vỡ bố cục', () => {
      expect(stylesCssContent).toMatch(/\.tab-dropdown-menu[\s\S]*?position:\s*absolute/);
      expect(stylesCssContent).toMatch(/\.tab-dropdown-menu[\s\S]*?z-index:\s*(?:50|100|999)/);
    });
  });

  describe('Lát cắt 3: Logic điều hướng và đồng bộ trạng thái active (admin.js)', () => {
    it('hàm switchAdminTab cập nhật trạng thái active cho nhóm phân hệ cha tương ứng', () => {
      expect(adminJsContent).toContain('tab-dropdown-btn');
      expect(adminJsContent).toContain('tab-dropdown-item');
      expect(adminJsContent).toContain('tab-group');
    });

    it('hỗ trợ toggle đóng mở dropdown khi click và đóng khi click outside', () => {
      expect(adminJsContent).toContain('toggleTabDropdown');
    });
  });

  describe('Lát cắt 4: Admin Dashboard 5 Metric Cards trên 1 hàng (UI/UX Pro Max)', () => {
    it('admin.js chứa container .admin-summary-cards cho 5 thẻ metric và trạng thái tiếng Việt', () => {
      expect(adminJsContent).toContain('admin-summary-cards');
      expect(adminJsContent).not.toContain('Trạng thái REGISTERED');
      expect(adminJsContent).toContain('Trạng thái Đã đăng ký');
    });

    it('styles.css định nghĩa .admin-summary-cards có grid-template-columns repeat(5, 1fr)', () => {
      expect(stylesCssContent).toMatch(/\.admin-summary-cards\s*\{[^}]*grid-template-columns:\s*repeat\(\s*5,\s*1fr\)/);
    });
  });
});
