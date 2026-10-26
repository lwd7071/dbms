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
  test('student faculty change reloads matching classes and preserves only a valid class', async () => {
    const elements = Object.fromEntries(['filterStudentKhoa', 'filterStudentLop', 'studentClassFilterStatus', 'retryStudentClassesBtn', 'adminStudentsContainer', 'searchStudentInput', 'filterStudentStatus'].map(id => [id, new FakeElement('div')]));
    elements.filterStudentKhoa.value = 'CNTT';
    elements.filterStudentLop.value = 'ATTT25_01';
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    const calls = [];
    context.api = { get: async (path, params) => {
      calls.push([path, params]);
      if (path === '/classes') return [{ maLop: 'CNTT25_01', tenLop: 'CNTT 2025', soLuongSV: 20 }];
      if (path === '/admin/students') return { items: [] };
      throw new Error('unexpected path');
    }};

    await context.onStudentKhoaChange();

    expect(calls[0]).toEqual(['/classes', { maKhoa: 'CNTT' }]);
    expect(elements.filterStudentLop.value).toBe('');
    expect(elements.filterStudentLop.children.map(option => option.value)).toEqual(['CNTT25_01']);
    expect(calls[1][1]).toEqual(expect.objectContaining({ maKhoa: 'CNTT', maLop: '', trangThai: '' }));
  });

  test('student faculty change keeps a class that still belongs to the selected faculty', async () => {
    const elements = Object.fromEntries(['filterStudentKhoa', 'filterStudentLop', 'studentClassFilterStatus', 'retryStudentClassesBtn', 'adminStudentsContainer', 'searchStudentInput', 'filterStudentStatus'].map(id => [id, new FakeElement('div')]));
    elements.filterStudentKhoa.value = 'CNTT';
    elements.filterStudentLop.value = 'CNTT25_01';
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = { get: async path => path === '/classes' ? [{ maLop: 'CNTT25_01', tenLop: 'CNTT 2025', soLuongSV: 20 }] : { items: [] } };
    await context.onStudentKhoaChange();
    expect(elements.filterStudentLop.value).toBe('CNTT25_01');
  });

  test('rapid faculty changes ignore an older class response', async () => {
    const elements = Object.fromEntries(['filterStudentKhoa', 'filterStudentLop', 'studentClassFilterStatus', 'adminStudentsContainer', 'searchStudentInput', 'filterStudentStatus'].map(id => [id, new FakeElement('div')]));
    elements.filterStudentKhoa.value = 'CNTT';
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    const pending = [];
    context.api = { get: async path => path === '/classes' ? new Promise(resolve => pending.push(resolve)) : { items: [] } };
    const older = context.onStudentKhoaChange();
    elements.filterStudentKhoa.value = 'ATTT';
    const newer = context.onStudentKhoaChange();
    pending[1]([{ maLop: 'ATTT25_01', tenLop: 'ATTT 2025', soLuongSV: 10 }]);
    await newer;
    pending[0]([{ maLop: 'CNTT25_01', tenLop: 'CNTT 2025', soLuongSV: 20 }]);
    await older;
    expect(elements.filterStudentLop.children.map(option => option.value)).toEqual(['ATTT25_01']);
  });

  test('student list sends status and rejects stale class options after a failed class load', async () => {
    const elements = Object.fromEntries(['filterStudentKhoa', 'filterStudentLop', 'studentClassFilterStatus', 'retryStudentClassesBtn', 'adminStudentsContainer', 'searchStudentInput', 'filterStudentStatus'].map(id => [id, new FakeElement('div')]));
    elements.filterStudentKhoa.value = 'CNTT';
    elements.filterStudentLop.value = 'OLD';
    elements.filterStudentStatus.value = 'DANG_HOC';
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    const calls = [];
    context.api = { get: async (path, params) => {
      calls.push([path, params]);
      if (path === '/classes') throw new Error('network');
      return { items: [] };
    }};
    await context.onStudentKhoaChange();
    expect(elements.filterStudentLop.value).toBe('');
    expect(elements.studentClassFilterStatus.textContent).toContain('Không thể tải');
    expect(elements.retryStudentClassesBtn.hidden).toBe(false);
    expect(calls.at(-1)[1]).toEqual(expect.objectContaining({ trangThai: 'DANG_HOC', maLop: '' }));
  });

  test('registration and audit filters are sent as exact query parameters', async () => {
    const elements = Object.fromEntries(['adminRegistrationsContainer', 'searchRegInput', 'filterRegStatus', 'filterRegLop', 'filterRegStudentCode', 'filterRegCourseSection', 'adminAuditLogsContainer', 'filterAuditAccount', 'filterAuditFrom', 'filterAuditTo'].map(id => [id, new FakeElement('div')]));
    elements.filterRegStudentCode.value = '24110202';
    elements.filterRegCourseSection.value = 'ATTT25_01';
    elements.filterAuditAccount.value = '18';
    elements.filterAuditFrom.value = '2026-10-01';
    elements.filterAuditTo.value = '2026-10-26';
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.renderPagination = () => {};
    const calls = [];
    context.api = { get: async (path, params) => {
      calls.push([path, params]);
      return { items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };
    }};
    await context.loadAdminRegistrations();
    await context.loadAdminAuditLogs();
    expect(calls[0]).toEqual(['/admin/registrations', expect.objectContaining({ maSinhVien: '24110202', maLHP: 'ATTT25_01' })]);
    expect(calls[1]).toEqual(['/admin/audit-logs', expect.objectContaining({ maTaiKhoan: '18', tuNgay: '2026-10-01', denNgay: '2026-10-26' })]);
  });

  test('admin filter toolbar wraps and controls shrink within mobile viewport', () => {
    const css = fs.readFileSync(path.join(__dirname, '../../frontend/css/styles.css'), 'utf8');
    expect(css).toMatch(/\.toolbar\s*\{[^}]*flex-wrap:\s*wrap/s);
    expect(css).toMatch(/@media \(max-width: 768px\)\s*\{[^}]*\.toolbar \.form-control\s*\{[^}]*max-width:\s*100%/s);
    expect(css).toMatch(/#studentClassFilterStatus:not\(:empty\)[^{]*\{[^}]*overflow-wrap:\s*anywhere/s);
  });


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

  test('faculty and major directories expose edit and delete actions for each row', async () => {
    const elements = {
      adminFacultiesContainer: new FakeElement('div'), adminFacultyCount: new FakeElement('span'),
      adminMajorFacultyFilter: new FakeElement('select'), adminMajorsContainer: new FakeElement('div'), adminMajorCount: new FakeElement('span')
    };
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = { get: async path => path === '/admin/faculties'
      ? [{ maKhoa: 'CNTT', tenKhoa: 'Công nghệ thông tin', trangThai: true }]
      : [{ maNganh: 'KTPM', tenNganh: 'Kỹ thuật phần mềm', maKhoa: 'CNTT', trangThai: true }] };

    await context.loadAdminFaculties();

    expect(elements.adminFacultiesContainer.innerHTML).toContain('Sửa khoa CNTT');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('Xóa khoa CNTT');
    expect(elements.adminMajorsContainer.innerHTML).toContain('Sửa ngành KTPM');
    expect(elements.adminMajorsContainer.innerHTML).toContain('Xóa ngành KTPM');
  });

  test('homeroom class cards expose edit and delete actions and preserve student count', async () => {
    const elements = {
      adminAdministrativeClassesContainer: new FakeElement('div'),
      filterAdminClassShKhoa: new FakeElement('select'), filterAdminClassShNam: new FakeElement('select')
    };
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = { get: async () => [{ maLop: 'CNTT25_01', tenLop: 'CNTT khóa 2025', maKhoa: 'CNTT', tenKhoa: 'Công nghệ thông tin', khoaHoc: 'K25', namNhapHoc: 2025, soLuongSV: 23, trangThai: true }] };

    await context.loadAdminAdministrativeClasses();

    expect(elements.adminAdministrativeClassesContainer.innerHTML).toContain('Sửa lớp CNTT25_01');
    expect(elements.adminAdministrativeClassesContainer.innerHTML).toContain('Xóa lớp CNTT25_01');
    expect(elements.adminAdministrativeClassesContainer.innerHTML).toContain('23 sinh viên');
  });

  test('department editor sends the major update payload and reloads the directory', async () => {
    const elements = Object.fromEntries([
      'adminDepartmentType', 'adminDepartmentOriginalId', 'adminDepartmentCode', 'adminDepartmentStatus',
      'adminDepartmentFaculty', 'adminDepartmentName', 'adminDepartmentEmail', 'adminDepartmentPhone',
      'adminDepartmentDescription', 'adminDepartmentCohort', 'adminDepartmentYear', 'btnSaveDepartment', 'adminDepartmentModal'
    ].map(id => [id, new FakeElement(id === 'adminDepartmentModal' ? 'div' : 'input')]));
    elements.adminDepartmentType.value = 'major';
    elements.adminDepartmentOriginalId.value = 'KTPM';
    elements.adminDepartmentCode.value = 'KTPM';
    elements.adminDepartmentStatus.value = 'false';
    elements.adminDepartmentFaculty.value = 'CNTT';
    elements.adminDepartmentName.value = 'Kỹ thuật phần mềm cập nhật';
    elements.adminDepartmentDescription.value = 'Mô tả mới';
    elements.btnSaveDepartment.textContent = 'Lưu';
    const { context } = loadScript('admin.js', elements);
    context.showToast = () => {};
    const calls = [];
    context.api = { put: async (...args) => calls.push(args) };

    await context.handleSaveDepartment({ preventDefault() {} });

    expect(calls).toEqual([['/admin/majors/KTPM', {
      maKhoa: 'CNTT', tenNganh: 'Kỹ thuật phần mềm cập nhật', moTa: 'Mô tả mới', trangThai: false
    }]]);
  });

  test('opens the editor for a major loaded through the selected faculty filter', async () => {
    const editorIds = [
      'adminDepartmentModal', 'adminDepartmentTitle', 'adminDepartmentSectionTitle', 'adminDepartmentType',
      'adminDepartmentOriginalId', 'adminDepartmentCode', 'adminDepartmentCodeLabel', 'adminDepartmentNameLabel',
      'adminDepartmentName', 'adminDepartmentFaculty', 'adminDepartmentEmail', 'adminDepartmentPhone',
      'adminDepartmentDescription', 'adminDepartmentCohort', 'adminDepartmentYear', 'adminDepartmentStatus',
      'adminDepartmentErrors', 'adminDepartmentErrorsList', 'adminDepartmentFacultyLabel', 'adminDepartmentDescriptionLabel'
    ];
    const elements = Object.fromEntries(editorIds.map(id => [id, new FakeElement(id.endsWith('Label') ? 'label' : 'div')]));
    Object.assign(elements, {
      adminMajorFacultyFilter: new FakeElement('select'),
      adminMajorsContainer: new FakeElement('div'), adminMajorCount: new FakeElement('span')
    });
    elements.adminDepartmentCodeLabel.firstChild = { textContent: '' };
    elements.adminDepartmentNameLabel.firstChild = { textContent: '' };
    elements.adminMajorFacultyFilter.value = 'CNTT';
    const { context } = loadScript('admin.js', elements);
    const toasts = [];
    context.escapeHtml = value => String(value ?? '');
    context.showToast = (...args) => toasts.push(args);
    context.api = { get: async path => path === '/admin/majors'
      ? [{ maNganh: 'N01', tenNganh: 'Công nghệ thông tin', maKhoa: 'CNTT', tenKhoa: 'Khoa CNTT', trangThai: true }]
      : [{ maKhoa: 'CNTT', tenKhoa: 'Khoa CNTT', trangThai: true }] };

    await context.loadAdminMajors();
    await context.openDepartmentEditor('major', 'edit', 'N01');

    expect(elements.adminDepartmentModal.classList.contains('show')).toBe(true);
    expect(elements.adminDepartmentCode.value).toBe('N01');
    expect(elements.adminDepartmentName.value).toBe('Công nghệ thông tin');
    expect(toasts).toEqual([]);
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

  test('faculty directory loads all majors and reloads them when the faculty filter changes', async () => {
    const elements = {
      adminFacultiesContainer: new FakeElement('div'),
      adminFacultyCount: new FakeElement('span'),
      adminMajorFacultyFilter: new FakeElement('select'),
      adminMajorsContainer: new FakeElement('div'),
      adminMajorCount: new FakeElement('span')
    };
    const { context, window } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    const calls = [];
    context.api = { get: async (path, params) => {
      calls.push({ path, params });
      if (path === '/admin/faculties') return [{ maKhoa: 'CNTT', tenKhoa: 'Công nghệ thông tin', trangThai: true }];
      return params?.maKhoa
        ? [{ maNganh: 'KTPM', tenNganh: 'Kỹ thuật phần mềm', maKhoa: 'CNTT', tenKhoa: 'Công nghệ thông tin', moTa: null, trangThai: true }]
        : [{ maNganh: 'HTTT', tenNganh: 'Hệ thống thông tin', maKhoa: 'CNTT', tenKhoa: 'Công nghệ thông tin', moTa: 'Ngành thử nghiệm', trangThai: false }];
    } };

    await window.loadAdminFaculties();

    expect(calls).toEqual([
      { path: '/admin/faculties', params: undefined },
      { path: '/admin/majors', params: {} }
    ]);
    expect(elements.adminMajorFacultyFilter.innerHTML).toContain('CNTT');
    expect(elements.adminMajorsContainer.innerHTML).toContain('Hệ thống thông tin');
    expect(elements.adminMajorCount.textContent).toContain('1 ngành');

    elements.adminMajorFacultyFilter.value = 'CNTT';
    await elements.adminMajorFacultyFilter.listeners.change();

    expect(calls[2]).toEqual({ path: '/admin/majors', params: { maKhoa: 'CNTT' } });
    expect(elements.adminMajorsContainer.innerHTML).toContain('Kỹ thuật phần mềm');
    expect(elements.adminFacultiesContainer.innerHTML).toContain('Công nghệ thông tin');
  });

  test('major directory explains when the selected faculty has no majors', async () => {
    const elements = {
      adminMajorFacultyFilter: new FakeElement('select'),
      adminMajorsContainer: new FakeElement('div'),
      adminMajorCount: new FakeElement('span')
    };
    elements.adminMajorFacultyFilter.value = 'CNTT';
    const { context, window } = loadScript('admin.js', elements);
    context.api = { get: async () => [] };

    await window.loadAdminMajors();

    expect(elements.adminMajorCount.textContent).toContain('0 ngành');
    expect(elements.adminMajorsContainer.innerHTML).toContain('Khoa này chưa có ngành.');
    expect(elements.adminMajorsContainer.attributes['aria-busy']).toBe('false');
  });

  test('major directory shows an accessible error when loading fails', async () => {
    const elements = {
      adminMajorFacultyFilter: new FakeElement('select'),
      adminMajorsContainer: new FakeElement('div'),
      adminMajorCount: new FakeElement('span')
    };
    const { context, window } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = { get: async () => { throw new Error('Không kết nối được'); } };

    await window.loadAdminMajors();

    expect(elements.adminMajorCount.textContent).toBe('Không tải được');
    expect(elements.adminMajorsContainer.innerHTML).toContain('role="alert"');
    expect(elements.adminMajorsContainer.innerHTML).toContain('Không kết nối được');
    expect(elements.adminMajorsContainer.attributes['aria-busy']).toBe('false');
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
    expect(portal).toContain('<span>Khoa / Ngành</span>');
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
    const ids = ['adminCurriculumContainer', 'curriculumResultCount', 'filterCurriculumFaculty', 'filterCurriculumMajor', 'filterCurriculumYear', 'filterCurriculumProgram', 'filterCurriculumTerm'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.startsWith('filter') ? 'select' : 'div')]));
    const { context } = loadScript('admin.js', elements);
    const catalog = [
      { maKhoa: 'CNTT', maNganh: 'N01', nganh: 'Mạng máy tính', tenKhoa: 'Khoa Công nghệ Thông tin', namTuyenSinh: 2023, maCTDT: 'CTDT_MMT_23', tenCTDT: 'Mạng Máy tính Chuẩn', khoaHoc: '2023-2027', thoiGianDaoTao: 4, hocKyDuKien: 1 },
      { maKhoa: 'CNTT', maNganh: 'N01', nganh: 'Mạng máy tính', tenKhoa: 'Khoa Công nghệ Thông tin', namTuyenSinh: 2024, maCTDT: 'CTDT_MMT_24', tenCTDT: 'Mạng Máy tính Chuẩn', khoaHoc: '2024-2028', thoiGianDaoTao: 4, hocKyDuKien: 1 }
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

  test('curriculum major and prerequisite selections cascade and are sent to the API', async () => {
    const ids = ['adminCurriculumContainer', 'curriculumResultCount', 'filterCurriculumFaculty', 'filterCurriculumMajor', 'filterCurriculumYear', 'filterCurriculumProgram', 'filterCurriculumTerm', 'filterCurriculumPrerequisiteSearch', 'curriculumPrerequisiteOptions', 'curriculumFilterFeedback'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.startsWith('filter') ? 'select' : 'div')]));
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    const catalog = [
      { maKhoa: 'CNTT', tenKhoa: 'CNTT', maNganh: 'N01', nganh: 'Mạng máy tính', namTuyenSinh: 2024, maCTDT: 'CTDT1', tenCTDT: 'CTĐT 1', khoaHoc: '2024-2028', thoiGianDaoTao: 4, hocKyDuKien: 1, maMonHoc: 'CS101', hocPhanTienQuyetChiTiet: [{ maMonHoc: 'CS001', tenMonHoc: 'Cơ sở máy tính' }] },
      { maKhoa: 'ATTT', tenKhoa: 'ATTT', maNganh: 'N02', nganh: 'An toàn thông tin', namTuyenSinh: 2024, maCTDT: 'CTDT2', tenCTDT: 'CTĐT 2', khoaHoc: '2024-2028', thoiGianDaoTao: 4, hocKyDuKien: 1, maMonHoc: 'AT101', hocPhanTienQuyetChiTiet: [{ maMonHoc: 'AT001', tenMonHoc: 'Cơ sở ATTT' }] }
    ];
    const calls = [];
    context.api = { get: async (_path, filters = {}) => {
      calls.push(filters);
      return catalog.filter(item => Object.entries(filters).every(([key, value]) => !value || String(item[key]) === String(value)));
    }};
    await context.loadAdminCurriculums();
    elements.filterCurriculumFaculty.value = 'CNTT';
    elements.filterCurriculumMajor.value = 'N01';
    elements.filterCurriculumPrerequisiteSearch.value = 'CS001 · Cơ sở máy tính';
    await context.loadAdminCurriculums();

    expect(elements.filterCurriculumMajor.innerHTML).toContain('N01');
    expect(elements.filterCurriculumMajor.innerHTML).not.toContain('N02');
    expect(calls.at(-1)).toEqual(expect.objectContaining({ maKhoa: 'CNTT', maNganh: 'N01', maMonTienQuyet: 'CS001' }));
  });

  test('course search and prerequisite search stay together and send distinct filters', async () => {
    const ids = ['adminCurriculumContainer', 'curriculumResultCount', 'filterCurriculumFaculty', 'filterCurriculumMajor', 'filterCurriculumYear', 'filterCurriculumProgram', 'filterCurriculumTerm', 'filterCurriculumCourseSearch', 'filterCurriculumPrerequisiteSearch', 'curriculumPrerequisiteOptions', 'curriculumFilterFeedback'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.includes('filterCurriculum') || id === 'filterCurriculumTerm' ? 'select' : 'div')]));
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    const catalog = [
      { maKhoa: 'ATTT', tenKhoa: 'ATTT', maNganh: 'N06', nganh: 'An toàn thông tin', namTuyenSinh: 2025, maCTDT: 'CTDT_ATTT25', tenCTDT: 'An toàn thông tin Chuẩn', khoaHoc: '2025-2029', thoiGianDaoTao: 4, hocKyDuKien: 3, maMonHoc: 'AT301', tenMonHoc: 'An toàn mạng', hocPhanTienQuyetChiTiet: [{ maMonHoc: 'NMLT', tenMonHoc: 'Nhập môn lập trình' }] },
      { maKhoa: 'ATTT', tenKhoa: 'ATTT', maNganh: 'N06', nganh: 'An toàn thông tin', namTuyenSinh: 2025, maCTDT: 'CTDT_ATTT25', tenCTDT: 'An toàn thông tin Chuẩn', khoaHoc: '2025-2029', thoiGianDaoTao: 4, hocKyDuKien: 2, maMonHoc: 'AT201', tenMonHoc: 'Mật mã học', hocPhanTienQuyetChiTiet: [{ maMonHoc: 'CSDL', tenMonHoc: 'Cơ sở dữ liệu' }] }
    ];
    const calls = [];
    context.api = { get: async (_path, filters = {}) => {
      calls.push(filters);
      return catalog.filter(row => Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (key === 'tuKhoaMonHoc') return `${row.maMonHoc} ${row.tenMonHoc}`.toLowerCase().includes(String(value).toLowerCase());
        if (key === 'maMonTienQuyet') return row.hocPhanTienQuyetChiTiet.some(item => item.maMonHoc === value);
        return String(row[key]) === String(value);
      }));
    }};
    await context.loadAdminCurriculums();
    elements.filterCurriculumProgram.value = 'CTDT_ATTT25';
    elements.filterCurriculumTerm.value = '3';
    await context.loadAdminCurriculums();
    expect(elements.curriculumPrerequisiteOptions.innerHTML).toContain('NMLT');
    expect(elements.curriculumPrerequisiteOptions.innerHTML).not.toContain('CSDL');

    elements.filterCurriculumCourseSearch.value = 'AT301';
    elements.filterCurriculumPrerequisiteSearch.value = 'NMLT · Nhập môn lập trình';
    await context.loadAdminCurriculums();
    expect(calls.at(-1)).toEqual(expect.objectContaining({ tuKhoaMonHoc: 'AT301', maMonTienQuyet: 'NMLT', maCTDT: 'CTDT_ATTT25', hocKyDuKien: '3' }));
    expect(elements.adminCurriculumContainer.innerHTML).toContain('An toàn mạng');
    const portal = fs.readFileSync(path.join(__dirname, '../../frontend/portal-admin.html'), 'utf8');
    const courseFilterSection = portal.slice(portal.indexOf('class="curriculum-course-filters"'), portal.indexOf('id="adminCurriculumContainer"'));
    expect(courseFilterSection).toContain('filterCurriculumTerm');
    expect(courseFilterSection).toContain('filterCurriculumCourseSearch');
    expect(courseFilterSection).toContain('filterCurriculumPrerequisiteSearch');
    expect(courseFilterSection).toContain('Tìm môn trong chương trình');
    expect(courseFilterSection).toContain('Môn tiên quyết của môn trong danh sách');
    expect(courseFilterSection).not.toContain('id="filterCurriculumPrerequisite"');
    const css = fs.readFileSync(path.join(__dirname, '../../frontend/css/styles.css'), 'utf8');
    expect(css).toMatch(/\.curriculum-course-filter-controls\s*\{[^}]*display:\s*grid/s);
    expect(css).toContain('.curriculum-course-filter-controls {\n    grid-template-columns: minmax(0, 1fr);');

    const previousResult = elements.adminCurriculumContainer.innerHTML;
    const requestCount = calls.length;
    elements.filterCurriculumPrerequisiteSearch.value = 'không có trong gợi ý';
    await context.loadAdminCurriculums();
    expect(elements.curriculumFilterFeedback.textContent).toContain('chọn một môn tiên quyết');
    expect(calls).toHaveLength(requestCount);
    expect(elements.adminCurriculumContainer.innerHTML).toBe(previousResult);
  });

  test('curriculum action stays in the card header and program filters use a responsive grid', () => {
    const portal = fs.readFileSync(path.join(__dirname, '../../frontend/portal-admin.html'), 'utf8');
    const curriculumPane = portal.slice(portal.indexOf('id="tab-curriculums"'));
    const headerStart = curriculumPane.indexOf('<div class="card-header">');
    const bodyStart = curriculumPane.indexOf('<div class="card-body">', headerStart);
    const addButton = curriculumPane.indexOf('id="addCurriculumCourseBtn"');
    const css = fs.readFileSync(path.join(__dirname, '../../frontend/css/styles.css'), 'utf8');

    expect(addButton).toBeGreaterThan(headerStart);
    expect(addButton).toBeLessThan(bodyStart);
    expect(css).toMatch(/\.curriculum-program-filters\s*\{[^}]*display:\s*grid/s);
    expect(css).toContain('.curriculum-program-filters {\n    grid-template-columns: minmax(0, 1fr);');
    expect(css).toMatch(/\.curriculum-course-filter-controls\s*\{[^}]*align-items:\s*start/s);
    expect(css).toMatch(/\.curriculum-course-filter-controls \.btn\s*\{[^}]*align-self:\s*center/s);
    expect(css).toMatch(/\.curriculum-header-actions\s+\.btn\[hidden\]\s*\{\s*display:\s*none\s*!important;/s);
  });

  test('explains why adding a course requires selecting one curriculum program', async () => {
    const ids = ['adminCurriculumContainer', 'curriculumResultCount', 'filterCurriculumFaculty', 'filterCurriculumMajor', 'filterCurriculumYear', 'filterCurriculumProgram', 'filterCurriculumTerm', 'addCurriculumCourseBtn', 'addCurriculumCourseHint'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.startsWith('filter') ? 'select' : 'div')]));
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.api = { get: async () => [{
      maKhoa: 'CNTT', tenKhoa: 'Khoa CNTT', maNganh: 'N01', nganh: 'Công nghệ thông tin',
      maCTDT: 'CTDT1', tenCTDT: 'CTĐT mẫu', khoaHoc: '2024-2028', namTuyenSinh: 2024,
      trangThai: true, thoiGianDaoTao: 4
    }] };

    await context.loadAdminCurriculums();
    expect(elements.addCurriculumCourseBtn.disabled).toBe(true);
    expect(elements.addCurriculumCourseHint.textContent).toContain('Chọn một chương trình đào tạo');

    elements.filterCurriculumProgram.value = 'CTDT1';
    await context.loadAdminCurriculums();
    expect(elements.addCurriculumCourseBtn.disabled).toBe(false);
    expect(elements.addCurriculumCourseHint.textContent).toContain('CTĐT mẫu');
  });

  test('shows edit and delete actions only after selecting one curriculum program', async () => {
    const ids = ['adminCurriculumContainer', 'curriculumResultCount', 'filterCurriculumFaculty', 'filterCurriculumMajor', 'filterCurriculumYear', 'filterCurriculumProgram', 'filterCurriculumTerm', 'editCurriculumProgramBtn', 'deleteCurriculumProgramBtn'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.startsWith('filter') ? 'select' : 'div')]));
    elements.editCurriculumProgramBtn.hidden = true;
    elements.deleteCurriculumProgramBtn.hidden = true;
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    const program = {
      maCTDT: 'CTDT1', maNganh: 'N01', nganh: 'Công nghệ thông tin', maKhoa: 'CNTT', tenKhoa: 'Khoa CNTT',
      tenCTDT: 'CTĐT mẫu', khoaHoc: '2024-2028', namTuyenSinh: 2024,
      tongTinChiYeuCau: 135, thoiGianDaoTao: 4, trangThai: true
    };
    context.api = { get: async path => path === '/admin/curriculum-programs' ? [program] : [{
      ...program, maMonHoc: 'CS101', tenMonHoc: 'Nhập môn lập trình', hocKyDuKien: 1,
      hocPhanTienQuyetChiTiet: []
    }] };

    await context.loadAdminCurriculums();
    expect(elements.editCurriculumProgramBtn.hidden).toBe(true);
    expect(elements.deleteCurriculumProgramBtn.hidden).toBe(true);

    elements.filterCurriculumProgram.value = 'CTDT1';
    await context.loadAdminCurriculums();
    expect(elements.editCurriculumProgramBtn.hidden).toBe(false);
    expect(elements.deleteCurriculumProgramBtn.hidden).toBe(false);
  });

  test('edits program metadata, previews the cohort label, and connects trigger errors to the major field', async () => {
    const fieldIds = ['curriculumProgramMaCTDT', 'curriculumProgramMaNganh', 'curriculumProgramTenCTDT', 'curriculumProgramNamTuyenSinh', 'curriculumProgramTongTinChi', 'curriculumProgramThoiGianDaoTao', 'curriculumProgramTrangThai', 'curriculumProgramKhoaHoc'];
    const editorIds = ['adminCurriculumProgramModal', 'curriculumProgramFormTitle', 'curriculumProgramOriginalId', 'curriculumProgramFormErrors', 'curriculumProgramFormErrorsList', 'btnSaveCurriculumProgram', ...fieldIds];
    const elements = Object.fromEntries(editorIds.map(id => [id, new FakeElement(id === 'curriculumProgramMaNganh' || id === 'curriculumProgramTrangThai' ? 'select' : 'div')]));
    elements.curriculumProgramMaNganh.labels = [{ textContent: 'Ngành' }];
    elements.btnSaveCurriculumProgram.textContent = 'Lưu CTĐT';
    const { context } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    context.showToast = () => {};
    const program = {
      maCTDT: 'CTDT1', maNganh: 'N01', nganh: 'Công nghệ thông tin', maKhoa: 'CNTT', tenKhoa: 'Khoa CNTT',
      tenCTDT: 'CTĐT mẫu', khoaHoc: '2024-2028', namTuyenSinh: 2024,
      tongTinChiYeuCau: 135, thoiGianDaoTao: 4, trangThai: true
    };
    const calls = [];
    context.api = {
      get: async path => path === '/admin/curriculum-programs' ? [program] : [{ maNganh: 'N01', tenNganh: 'Công nghệ thông tin', tenKhoa: 'Khoa CNTT', trangThai: true }],
      put: async (...args) => { calls.push(args); throw Object.assign(new Error('Trigger không khớp.'), { errors: [{ field: 'maNganh', message: 'Sinh viên đang thuộc khoa khác.' }] }); }
    };

    await context.openCurriculumProgramModal({ mode: 'edit', maCTDT: 'CTDT1' });
    expect(elements.adminCurriculumProgramModal.classList.contains('show')).toBe(true);
    expect(elements.curriculumProgramMaCTDT.readOnly).toBe(true);
    expect(elements.curriculumProgramKhoaHoc.value).toBe('2024-2028');
    await context.handleSaveCurriculumProgram({ preventDefault() {} });

    expect(calls).toEqual([['/admin/curriculum-programs/CTDT1', {
      maNganh: 'N01', tenCTDT: 'CTĐT mẫu', namTuyenSinh: 2024,
      tongTinChiYeuCau: 135, thoiGianDaoTao: 4, trangThai: true
    }]]);
    expect(elements.curriculumProgramMaNganh.attributes['aria-invalid']).toBe('true');
    expect(elements.curriculumProgramMaNganh.attributes['aria-describedby']).toBe('curriculumProgramMaNganh-error');
    expect(elements.curriculumProgramFormErrorsList.children[0].textContent).toContain('Ngành: Sinh viên đang thuộc khoa khác.');
  });

  test('admin curriculum rows show the complete subject details and prerequisite level', async () => {
    const ids = ['adminCurriculumContainer', 'curriculumResultCount', 'filterCurriculumFaculty', 'filterCurriculumMajor', 'filterCurriculumYear', 'filterCurriculumProgram', 'filterCurriculumTerm'];
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

  test('curriculum course editor loads faculty and prerequisite options before opening', async () => {
    const ids = ['adminCurriculumCourseModal', 'curriculumCourseFormTitle', 'curriculumCourseMaCTDT', 'curriculumCourseOriginalId',
      'curriculumCourseMaMonHoc', 'curriculumCourseMaKhoa', 'curriculumCourseTenMonHoc', 'curriculumCourseSoTinChi',
      'curriculumCourseSoTietLyThuyet', 'curriculumCourseSoTietThucHanh', 'curriculumCourseMoTa', 'curriculumCourseTrangThai',
      'curriculumCourseHocKy', 'curriculumCourseLoaiMon', 'curriculumCourseThuTu', 'curriculumPrerequisiteSelect',
      'curriculumPrerequisiteList', 'curriculumCourseFormErrors', 'curriculumCourseFormErrorsList'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.includes('Select') || id.includes('Khoa') || id.includes('TrangThai') || id.includes('LoaiMon') ? 'select' : 'div')]));
    const { context, window } = loadScript('admin.js', elements);
    const calls = [];
    context.showToast = (...args) => calls.push(['toast', ...args]);
    context.escapeHtml = value => String(value ?? '');
    context.api = { get: async path => {
      calls.push(path);
      if (path === '/admin/courses') return [{ maMonHoc: 'NMLT', tenMonHoc: 'Nhập môn lập trình' }];
      if (path === '/admin/faculties') return [{ maKhoa: 'CNTT', tenKhoa: 'Công nghệ thông tin' }];
      return [];
    } };

    await window.openCurriculumCourseModal({ mode: 'create', maCTDT: 'CTDT_CNTT_CQ' });

    expect(calls).toEqual(['/admin/courses', '/admin/faculties']);
    expect(elements.adminCurriculumCourseModal.classList.contains('show')).toBe(true);
    expect(elements.curriculumCourseFormTitle.textContent).toContain('Thêm môn');
    expect(elements.curriculumCourseMaKhoa.innerHTML).toContain('CNTT');
    expect(elements.curriculumPrerequisiteSelect.innerHTML).toContain('NMLT');
  });

  test('course editor sends the composite payload and shows field-level API errors', async () => {
    const ids = ['adminCurriculumCourseModal', 'curriculumCourseMaCTDT', 'curriculumCourseOriginalId', 'curriculumCourseMaMonHoc',
      'curriculumCourseMaKhoa', 'curriculumCourseTenMonHoc', 'curriculumCourseSoTinChi', 'curriculumCourseSoTietLyThuyet',
      'curriculumCourseSoTietThucHanh', 'curriculumCourseMoTa', 'curriculumCourseTrangThai', 'curriculumCourseHocKy',
      'curriculumCourseLoaiMon', 'curriculumCourseThuTu', 'curriculumCourseFormErrors', 'curriculumCourseFormErrorsList',
      'curriculumCourseSoTinChi-error', 'btnSaveCurriculumCourse'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id === 'curriculumCourseSoTinChi-error' ? 'small' : 'div')]));
    elements.curriculumCourseMaCTDT.value = 'CTDT_TEST';
    elements.curriculumCourseMaMonHoc.value = 'CS101';
    elements.curriculumCourseMaKhoa.value = 'CNTT';
    elements.curriculumCourseTenMonHoc.value = 'Cấu trúc dữ liệu';
    elements.curriculumCourseSoTinChi.value = '3';
    elements.curriculumCourseSoTietLyThuyet.value = '30';
    elements.curriculumCourseSoTietThucHanh.value = '15';
    elements.curriculumCourseMoTa.value = '';
    elements.curriculumCourseTrangThai.value = 'true';
    elements.curriculumCourseHocKy.value = '2';
    elements.curriculumCourseLoaiMon.value = 'BAT_BUOC';
    elements.curriculumCourseThuTu.value = '4';
    const { window, context } = loadScript('admin.js', elements);
    let sent;
    context.showToast = () => {};
    context.api = { post: async (path, payload) => {
      sent = { path, payload };
      throw { message: 'Lỗi dữ liệu', errors: [{ field: 'course.soTinChi', message: 'Số tín chỉ không hợp lệ.' }] };
    } };

    await window.handleSaveCurriculumCourse({ preventDefault() {} });

    expect(sent.path).toBe('/admin/curriculums/CTDT_TEST/courses');
    expect(sent.payload).toMatchObject({
      course: { maMonHoc: 'CS101', maKhoa: 'CNTT', soTinChi: 3 },
      placement: { hocKyDuKien: 2, loaiMon: 'BAT_BUOC', thuTu: 4 },
      prerequisites: []
    });
    expect(elements.curriculumCourseFormErrors.hidden).toBe(false);
    expect(elements.curriculumCourseSoTinChi.attributes['aria-invalid']).toBe('true');
    expect(elements.curriculumCourseSoTinChi.attributes['aria-describedby']).toBe('curriculumCourseSoTinChi-error');
    expect(elements['curriculumCourseSoTinChi-error'].textContent).toBe('Số tín chỉ không hợp lệ.');
  });

  test('admin class list exposes edit and delete actions per section', async () => {
    const container = new FakeElement('div');
    const { context } = loadScript('admin.js', { adminClassesContainer: container });
    context.api = { get: async () => ({
      items: [{ maLHP: 'LHP-TEST', tenLHP: 'Lớp thử', maMonHoc: 'NMLT', tenMonHoc: 'Nhập môn lập trình',
        soTinChi: 3, hoTenGiangVien: 'Chưa phân công', maHocKy: 1, tenHocKy: 'HK1', namHoc: '2026-2027',
        soLuongToiDa: 30, siSoHienTai: 0, trangThai: 'DA_KHOA', schedules: [] }],
      page: 1, pageSize: 10, totalItems: 1, totalPages: 1
    }) };
    context.renderPagination = () => {};
    context.renderStatusBadge = value => String(value);
    context.escapeHtml = value => String(value ?? '');

    await context.loadAdminClasses();

    expect(container.innerHTML).toContain('js-edit-class');
    expect(container.innerHTML).toContain('js-delete-class');
  });

  test('class editor loads course, semester, lecturer and schedule data before opening', async () => {
    const ids = ['adminClassFormModal', 'classFormTitle', 'classFormOriginalId', 'classFormMaLHP', 'classFormMaMonHoc',
      'classFormMaHocKy', 'classFormMaGiangVien', 'classFormTenLHP', 'classFormSoLuongToiDa', 'classFormTrangThai',
      'classScheduleDraftList', 'classFormErrors', 'classFormErrorsList'];
    const elements = Object.fromEntries(ids.map(id => [id, new FakeElement(id.startsWith('classFormMaMon') || id.includes('HocKy') || id.includes('GiangVien') || id.includes('TrangThai') ? 'select' : 'div')]));
    const { context, window } = loadScript('admin.js', elements);
    context.escapeHtml = value => String(value ?? '');
    const calls = [];
    context.api = {
      get: async path => {
        calls.push(path);
        if (path === '/admin/courses') return [{ maMonHoc: 'NMLT', tenMonHoc: 'Nhập môn lập trình' }];
        if (path === '/admin/lecturers/options') return [{ maGV: 4, hoTen: 'Giảng viên thử', maKhoa: 'CNTT' }];
        if (path === '/admin/classes/LHP1') return { maLHP: 'LHP1', maMonHoc: 'NMLT', maHocKy: 7, maGiangVien: 4,
          tenLHP: 'Lớp 1', soLuongToiDa: 30, trangThai: 'DA_KHOA', schedules: [{ thu: 2, tietBatDau: 3, soTiet: 2, phongHoc: 'A101' }] };
        return [];
      },
      getSemesters: async () => [{ maHocKy: 7, tenHocKy: 'Học kỳ 1', namHoc: '2026-2027' }]
    };

    await window.openClassSectionModal('edit', 'LHP1');

    expect(calls).toEqual(['/admin/courses', '/admin/classes/LHP1', '/admin/lecturers/options']);
    expect(elements.adminClassFormModal.classList.contains('show')).toBe(true);
    expect(elements.classFormMaGiangVien.innerHTML).toContain('Giảng viên thử');
    expect(elements.classScheduleDraftList.innerHTML).toContain('A101');
  });
});
