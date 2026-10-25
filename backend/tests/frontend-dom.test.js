const fs = require('fs');
const path = require('path');
const vm = require('vm');

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this.value = '';
    this.hidden = false;
    this.textContent = '';
    this.innerHTML = '';
    this.labels = [];
    this.listeners = {};
    this.classes = new Set();
    this.classList = {
      add: name => this.classes.add(name),
      remove: name => this.classes.delete(name),
      contains: name => this.classes.has(name),
      toggle: (name, force) => {
        if (force === undefined ? !this.classes.has(name) : force) this.classes.add(name);
        else this.classes.delete(name);
      }
    };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  removeAttribute(name) { delete this.attributes[name]; }
  appendChild(child) { this.children.push(child); return child; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  focus() { this.focused = true; }
  remove() { this.removed = true; }
}

function loadScript(file, elements = {}) {
  const documentListeners = {};
  const document = {
    body: new FakeElement('body'),
    getElementById: id => elements[id] || null,
    createElement: tag => new FakeElement(tag),
    addEventListener(name, callback) { documentListeners[name] = callback; },
    querySelector: selector => elements.__selectors?.[selector] || null,
    querySelectorAll: selector => {
      if (selector === '[data-required-role]') return elements.__roleRestrictedNodes || [];
      if (selector === '.tab-group.open') return (elements.__tabGroups || []).filter(group => group.classList.contains('open'));
      if (selector === '.tab-dropdown-btn') return elements.__dropdownButtons || [];
      return [];
    }
  };
  const window = { location: { origin: 'http://localhost:5000' } };
  const context = vm.createContext({ window, document, localStorage: {}, setTimeout() {} });
  const source = fs.readFileSync(path.join(__dirname, '../../frontend/js', file), 'utf8');
  vm.runInContext(source, context, { filename: file });
  return { context, document, window, documentListeners };
}

describe('frontend DOM feedback and untrusted text', () => {
  test('admin faculty directory renders all fields and handles optional contact details', async () => {
    const elements = Object.fromEntries(['adminFacultiesContainer', 'adminFacultyCount'].map(id => [id, new FakeElement('div')]));
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    let requestedPath;
    context.api = {
      get: async path => {
        requestedPath = path;
        return [
          { maKhoa: 'CNTT', tenKhoa: 'Khoa Công nghệ Thông tin', email: 'cntt@example.edu.vn', soDienThoai: '0281234567', trangThai: true },
          { maKhoa: 'TEST', tenKhoa: 'Khoa thử nghiệm', email: null, soDienThoai: null, trangThai: false }
        ];
      }
    };

    await context.loadAdminFaculties();

    expect(requestedPath).toBe('/admin/faculties');
    expect(elements.adminFacultyCount.textContent).toBe('2 khoa');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('CNTT');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('Khoa Công nghệ Thông tin');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('cntt@example.edu.vn');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('0281234567');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('Đang hoạt động');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('Ngừng hoạt động');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('>-</td>');
  });

  test('admin faculty directory keeps a clear empty state', async () => {
    const elements = Object.fromEntries(['adminFacultiesContainer', 'adminFacultyCount'].map(id => [id, new FakeElement('div')]));
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = { get: async () => [] };

    await context.loadAdminFaculties();

    expect(elements.adminFacultyCount.textContent).toBe('0 khoa');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('Chưa có khoa nào trong hệ thống.');
  });

  test('admin faculty directory shows a useful error state when loading fails', async () => {
    const elements = Object.fromEntries(['adminFacultiesContainer', 'adminFacultyCount'].map(id => [id, new FakeElement('div')]));
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = { get: async () => { throw new Error('Không kết nối được'); } };

    await context.loadAdminFaculties();

    expect(elements.adminFacultyCount.textContent).toBe('Không tải được');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('role="alert"');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('Không kết nối được');
  });

  test('admin faculty tab opens the directory and is inside the staff-only portal', () => {
    const pane = new FakeElement('section');
    const { context } = loadScript('admin.js', {
      'tab-faculties': pane,
      adminFacultiesContainer: new FakeElement('div'),
      adminFacultyCount: new FakeElement('span')
    });
    let requestedPath;
    context.api = { get: path => { requestedPath = path; return Promise.resolve([]); } };
    const portal = fs.readFileSync(path.join(__dirname, '../../frontend/portal-admin.html'), 'utf8');

    context.switchAdminTab('faculties');

    expect(pane.classList.contains('active')).toBe(true);
    expect(requestedPath).toBe('/admin/faculties');
    expect(portal).toContain("switchAdminTab('faculties', this)");
    expect(portal).toContain("requireAuth(['QUAN_TRI', 'DAO_TAO'])");
  });

  test('faculty directory switches to labeled rows on narrow screens', () => {
    const css = fs.readFileSync(path.join(__dirname, '../../frontend/css/styles.css'), 'utf8');

    expect(css).toMatch(/\.faculty-directory-table\s*\{[^}]*table-layout:\s*fixed/s);
    expect(css).toContain('@media (max-width: 768px)');
    expect(css).toContain('.faculty-directory-table td::before');
    expect(css).toContain('content: attr(data-label)');
    expect(css).toContain('grid-template-columns: minmax(6.5rem, 0.38fr) minmax(0, 1fr)');
    expect(css).toMatch(/\.faculty-directory-table td:first-child,\s*\.faculty-directory-table td:last-child\s*\{\s*width:\s*100%;/s);
  });

  test('curriculum program choices follow the selected intake year', async () => {
    const ids = ['adminCurriculumContainer', 'curriculumResultCount', 'filterCurriculumFaculty', 'filterCurriculumYear', 'filterCurriculumProgram', 'filterCurriculumTerm'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.startsWith('filter') ? 'select' : 'div')]));
    const { context } = loadScript('admin.js', elements);
    const catalog = [
      { maKhoa: 'CNTT', tenKhoa: 'Khoa Công nghệ Thông tin', namTuyenSinh: 2023, maCTDT: 'CTDT_MMT_23', tenCTDT: 'Mạng Máy tính Chuẩn', khoaHoc: '2023-2027', thoiGianDaoTao: 4, hocKyDuKien: 1 },
      { maKhoa: 'CNTT', tenKhoa: 'Khoa Công nghệ Thông tin', namTuyenSinh: 2024, maCTDT: 'CTDT_MMT_24', tenCTDT: 'Mạng Máy tính Chuẩn', khoaHoc: '2024-2028', thoiGianDaoTao: 4, hocKyDuKien: 1 }
    ];
    context.api = { get: async (_path, filters = {}) => catalog.filter(item => Object.entries(filters).every(([key, value]) => !value || String(item[key]) === String(value))) };
    context.escapeHtml = value => String(value ?? '');

    await context.loadAdminCurriculums();
    elements.filterCurriculumFaculty.value = 'CNTT';
    elements.filterCurriculumYear.value = '2024';
    await context.loadAdminCurriculums();

    expect(elements.filterCurriculumProgram.innerHTML).toContain('CTDT_MMT_24');
    expect(elements.filterCurriculumProgram.innerHTML).not.toContain('CTDT_MMT_23');

    elements.filterCurriculumYear.value = '2023';
    await context.loadAdminCurriculums();
    elements.filterCurriculumProgram.value = 'CTDT_MMT_23';
    elements.filterCurriculumYear.value = '2024';
    await context.loadAdminCurriculums();
    expect(elements.filterCurriculumProgram.value).toBe('');
    expect(elements.curriculumResultCount.textContent).toBe('1 chương trình');
  });

  test('admin curriculum rows show the complete subject details and prerequisite level', async () => {
    const ids = ['adminCurriculumContainer', 'curriculumResultCount', 'filterCurriculumFaculty', 'filterCurriculumYear', 'filterCurriculumProgram', 'filterCurriculumTerm'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.startsWith('filter') ? 'select' : 'div')]));
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = { get: async () => [{
      maKhoa: 'CNTT', tenKhoa: 'Công nghệ thông tin', maKhoaMon: 'CNTT', tenKhoaMon: 'Công nghệ thông tin',
      maCTDT: 'CTDT1', tenCTDT: 'Chương trình mẫu', khoaHoc: '2024-2028', namTuyenSinh: 2024, nganh: 'Kỹ thuật phần mềm',
      maMonHoc: 'CS101', tenMonHoc: 'Nhập môn lập trình', soTinChi: 3, soTietLyThuyet: 30, soTietThucHanh: 15,
      moTa: 'Môn học nhập môn', trangThaiMon: true, trangThai: true, hocKyDuKien: 1,
      loaiMon: 'TU_CHON', thuTu: 2, hocPhanTienQuyet: null,
      hocPhanTienQuyetChiTiet: [{ maMonHoc: 'CS001', tenMonHoc: 'Cơ sở máy tính', mucDo: 'KHUYEN_NGHI' }]
    }] };

    await context.loadAdminCurriculums();

    expect(elements.adminCurriculumContainer.innerHTML).toContain('30 tiết');
    expect(elements.adminCurriculumContainer.innerHTML).toContain('15 tiết');
    expect(elements.adminCurriculumContainer.innerHTML).toContain('Môn học nhập môn');
    expect(elements.adminCurriculumContainer.innerHTML).toContain('Tự chọn');
    expect(elements.adminCurriculumContainer.innerHTML).toContain('Thứ tự: 2');
    expect(elements.adminCurriculumContainer.innerHTML).toContain('Khuyến nghị');
    expect(elements.adminCurriculumContainer.innerHTML).toContain('Trạng thái môn');
  });

  test('student semester view renders all course attributes and handles missing optional details', async () => {
    const elements = Object.fromEntries(['studentCurriculumStatus', 'studentCurriculumSummary', 'studentCurriculumTerm', 'studentCurriculumCourses'].map(id => [id, new FakeElement(id === 'studentCurriculumTerm' ? 'select' : 'div')]));
    const { context, window } = loadScript('student.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = {
      getCurrentUser: () => ({ maSV: 7 }),
      get: async () => ({
        trangThai: true,
        hocKy: [{ hocKyDuKien: 1, monHoc: [
          { maMonHoc: 'CS101', tenMonHoc: 'Nhập môn lập trình', maKhoaMon: 'CNTT', tenKhoaMon: 'Công nghệ thông tin', soTinChi: 3, soTietLyThuyet: 30, soTietThucHanh: 15, moTa: 'Môn học nhập môn', trangThaiMon: true, loaiMon: 'BAT_BUOC', thuTu: 1, hocPhanTienQuyetChiTiet: [{ maMonHoc: 'CS001', tenMonHoc: 'Cơ sở máy tính', mucDo: 'BAT_BUOC' }] },
          { maMonHoc: 'CS102', tenMonHoc: 'Nhập môn tự chọn', soTinChi: 2, loaiMon: 'TU_CHON', thuTu: 2, hocPhanTienQuyetChiTiet: [{ maMonHoc: 'CS002', tenMonHoc: 'Đại cương', mucDo: 'KHUYEN_NGHI' }] }
        ] }]
      })
    };

    await window.loadStudentCurriculum();
    elements.studentCurriculumTerm.value = '1';
    window.renderStudentCurriculumTerm();

    expect(elements.studentCurriculumCourses.innerHTML).toContain('Khoa phụ trách');
    expect(elements.studentCurriculumCourses.innerHTML).toContain('Lý thuyết: 30 tiết');
    expect(elements.studentCurriculumCourses.innerHTML).toContain('Thực hành: 15 tiết');
    expect(elements.studentCurriculumCourses.innerHTML).toContain('Môn học nhập môn');
    expect(elements.studentCurriculumCourses.innerHTML).toContain('Bắt buộc');
    expect(elements.studentCurriculumCourses.innerHTML).toContain('Tự chọn');
    expect(elements.studentCurriculumCourses.innerHTML).toContain('Khuyến nghị');
    expect(elements.studentCurriculumCourses.innerHTML).toContain('Thứ tự: 2');
    expect(elements.studentCurriculumCourses.innerHTML).toContain('—');
    expect(elements.studentCurriculumCourses.innerHTML).not.toContain('undefined');
  });

  test('empty curriculum semester keeps its empty-state message', async () => {
    const elements = Object.fromEntries(['studentCurriculumStatus', 'studentCurriculumSummary', 'studentCurriculumTerm', 'studentCurriculumCourses'].map(id => [id, new FakeElement(id === 'studentCurriculumTerm' ? 'select' : 'div')]));
    const { context, window } = loadScript('student.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = { getCurrentUser: () => ({ maSV: 7 }), get: async () => ({ trangThai: true, hocKy: [{ hocKyDuKien: 2, monHoc: [] }] }) };

    await window.loadStudentCurriculum();
    elements.studentCurriculumTerm.value = '2';
    window.renderStudentCurriculumTerm();

    expect(elements.studentCurriculumCourses.innerHTML).toContain('Học kỳ này chưa có môn học trong chương trình.');
  });

  test('curriculum details fit the viewport and stack as labeled values on narrow screens', () => {
    const css = fs.readFileSync(path.join(__dirname, '../../frontend/css/styles.css'), 'utf8');
    expect(css).toMatch(/\.curriculum-table-wrap\s*\{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/\.curriculum-detail-table\s*\{[^}]*table-layout:\s*fixed/s);
    expect(css).toContain('@media (max-width: 900px)');
    expect(css).toContain('content: attr(data-label)');
    expect(css).toContain('grid-template-columns: minmax(0, 1fr)');
  });

  test('student curriculum summary separates the title, program code, labeled facts, and metrics', () => {
    const { window, context } = loadScript('student.js');
    context.escapeHtml = value => String(value ?? '');
    const summary = window.renderStudentCurriculumSummary({
      tenCTDT: 'Kỹ thuật Phần mềm Chuẩn',
      maCTDT: 'CTDT_KTPM_CQ',
      nganh: 'Kỹ thuật phần mềm',
      tenKhoa: 'Khoa Kỹ thuật Phần mềm',
      khoaHoc: '2023-2027',
      namTuyenSinh: 2023,
      tongTinChiYeuCau: 135,
      thoiGianDaoTao: 4
    });

    expect(summary).toContain('<h3 class="curriculum-program-name">Kỹ thuật Phần mềm Chuẩn</h3>');
    expect(summary).toContain('<span>Mã CTĐT</span><code>CTDT_KTPM_CQ</code>');
    expect(summary).toContain('<dt>Khóa học</dt><dd>2023-2027</dd>');
    expect(summary).not.toContain('(2023)');
    expect(summary).toContain('Tín chỉ yêu cầu');
    expect(summary).toContain('135');
    expect(summary).toContain('4 năm');
  });

  test('status and role helpers present localized labels instead of internal codes', () => {
    const { window } = loadScript('api.js');

    expect(window.formatStatusBadge('DISABLED').text).toBe('Đã vô hiệu hóa');
    expect(window.formatRoleBadge('DAO_TAO').text).toBe('Cán bộ Đào tạo');
  });

  test('admin navigation hides restricted items for training staff and keeps them visible for administrators', () => {
    const auditLink = new FakeElement('button');
    auditLink.dataset.requiredRole = 'QUAN_TRI';
    const auditPane = new FakeElement('section');
    auditPane.dataset.requiredRole = 'QUAN_TRI';
    const accountLink = new FakeElement('button');
    const elements = { __roleRestrictedNodes: [auditLink, auditPane] };
    const { context } = loadScript('admin.js', elements);

    context.setAdminNavigationRole('DAO_TAO');
    expect(auditLink.hidden).toBe(true);
    expect(auditPane.hidden).toBe(true);
    expect(accountLink.hidden).toBe(false);

    context.setAdminNavigationRole('QUAN_TRI');
    expect(auditLink.hidden).toBe(false);
    expect(auditPane.hidden).toBe(false);
  });

  test('admin dropdown exposes expanded state and Escape closes it and restores focus', () => {
    const group = new FakeElement('div');
    group.classList.add('open');
    const button = new FakeElement('button');
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-controls', 'admin-system-menu');
    group.querySelector = () => button;
    const { window, documentListeners } = loadScript('admin.js', {
      __tabGroups: [group],
      __dropdownButtons: [button],
      __selectors: { '.tab-group[data-group="system"]': group }
    });

    window.toggleTabDropdown('system');
    expect(button.attributes['aria-expanded']).toBe('false');
    window.toggleTabDropdown('system');
    expect(button.attributes['aria-expanded']).toBe('true');
    documentListeners.keydown({ key: 'Escape' });
    expect(group.classList.contains('open')).toBe(false);
    expect(button.attributes['aria-expanded']).toBe('false');
    expect(button.focused).toBe(true);
  });

  test('network failures are shown in Vietnamese instead of browser error text', async () => {
    const { context } = loadScript('api.js');
    context.localStorage = { getItem: () => null };
    context.URLSearchParams = URLSearchParams;
    context.fetch = () => Promise.reject(new TypeError('Failed to fetch'));

    await expect(vm.runInContext(`api.get('/admin/users')`, context))
      .rejects.toMatchObject({ message: 'Không thể hoàn tất yêu cầu. Vui lòng kiểm tra kết nối và thử lại.' });
  });

  test('technical API validation text is replaced with a readable Vietnamese field message', async () => {
    const { context } = loadScript('api.js');
    context.localStorage = { getItem: () => null };
    context.URLSearchParams = URLSearchParams;
    context.fetch = async () => ({
      ok: false,
      status: 400,
      json: async () => ({
        isSuccess: false,
        errors: [{ field: 'vaiTro', message: 'Invalid option: expected one of "SINH_VIEN"' }]
      })
    });

    const error = await vm.runInContext(`api.get('/admin/users')`, context).catch(reason => reason);
    expect(error.message).toBe('Vai trò tài khoản chưa hợp lệ hoặc hệ thống chưa thể xử lý. Vui lòng kiểm tra lại và thử lại.');
    expect(error.errors[0].message).toBe(error.message);
    expect(error.message).not.toMatch(/Invalid option|expected|SINH_VIEN/);
  });

  test('empty API errors use a clear Vietnamese fallback message', async () => {
    const { context } = loadScript('api.js');
    context.localStorage = { getItem: () => null };
    context.URLSearchParams = URLSearchParams;
    context.fetch = async () => ({ ok: false, status: 500, json: async () => ({ isSuccess: false, errors: [] }) });

    const error = await vm.runInContext(`api.get('/admin/users')`, context).catch(reason => reason);
    expect(error.message).toBe('Yêu cầu chưa được xử lý. Vui lòng thử lại sau.');
  });

  test('toast displays hostile text literally and announces errors accessibly', () => {
    const { context, document } = loadScript('api.js');
    vm.runInContext(`showToast('<img src=x onerror=alert(1)>\\nfailed', 'danger')`, context);

    const container = document.body.children[0];
    const toast = container.children[0];
    const content = toast.children[0];
    expect(content.textContent).toBe('<img src=x onerror=alert(1)>\nfailed');
    expect(content.innerHTML).toBe('');
    expect(toast.attributes.role).toBe('alert');
    expect(toast.attributes['aria-live']).toBe('assertive');
  });

  test('student API validation is inline, summarized, focused, and preserves entered values', () => {
    const ids = ['studentFormErrors', 'studentFormErrorsList', 'studentFormMSSV', 'studentFormMSSV-error'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.includes('error') ? 'small' : 'div')]));
    elements.studentFormMSSV.value = '<script>draft</script>';
    elements.studentFormMSSV.labels = [{ textContent: 'Mã sinh viên' }];
    const { context } = loadScript('admin.js', elements);
    vm.runInContext(`showStudentFormErrors([{ field: 'maSinhVien', message: '<b>đã tồn tại</b>' }], 'Lỗi')`, context);

    expect(elements.studentFormMSSV.value).toBe('<script>draft</script>');
    expect(elements.studentFormMSSV.attributes['aria-invalid']).toBe('true');
    expect(elements.studentFormMSSV.attributes['aria-describedby']).toBe('studentFormMSSV-error');
    expect(elements['studentFormMSSV-error'].textContent).toBe('<b>đã tồn tại</b>');
    expect(elements.studentFormErrors.hidden).toBe(false);
    expect(elements.studentFormErrors.focused).toBe(true);
    expect(elements.studentFormErrorsList.children[0].children[0].textContent).toBe('Mã sinh viên: <b>đã tồn tại</b>');
  });

  test('unknown API fields are not exposed as internal field names in form summaries', () => {
    const ids = ['studentFormErrors', 'studentFormErrorsList'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement()]));
    const { context } = loadScript('admin.js', elements);
    vm.runInContext(`showStudentFormErrors([{ field: 'server', message: 'Không thể lưu.' }], 'Lỗi')`, context);

    expect(elements.studentFormErrorsList.children[0].textContent).toBe('Thông tin: Không thể lưu.');
  });

  test('account list shows a clear Vietnamese message when filtered accounts cannot load', async () => {
    const container = new FakeElement();
    const { context } = loadScript('admin.js', { adminUsersContainer: container });
    context.api = { get: async () => { throw new Error('Vai trò tài khoản không hợp lệ. Vui lòng chọn lại.'); } };

    await context.loadAdminUsers();

    expect(container.textContent).toBe('Không thể tải danh sách tài khoản. Vai trò tài khoản không hợp lệ. Vui lòng chọn lại.');
  });
});
