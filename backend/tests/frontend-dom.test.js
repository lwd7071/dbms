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
