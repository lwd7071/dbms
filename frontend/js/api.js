/**
 * API Client bọc HTTP Fetch cho Web Demo DBMS330284
 * Thống nhất Envelope: { isSuccess, data, errors }
 */

const API_BASE_URL = window.location.origin.includes('localhost:5000') 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = {
  // Lấy Auth Token từ localStorage
  getToken() {
    return localStorage.getItem('token');
  },

  // Lưu thông tin phiên đăng nhập
  setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Xóa phiên đăng nhập
  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Lấy User hiện tại
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Định dạng số tiền VNĐ
  formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) return '0 đ';
    return Number(value).toLocaleString('vi-VN') + ' đ';
  },

  // Phương thức gọi HTTP Request chung
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok || !data.isSuccess) {
        // Thu thập thông báo lỗi
        let errorMsg = 'Đã có lỗi xảy ra.';
        if (data.errors && data.errors.length > 0) {
          errorMsg = data.errors.map(e => e.message).join('\n');
        }
        
        // Nếu lỗi 401 chưa đăng nhập
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          this.clearSession();
          window.location.href = 'index.html';
        }

        const error = new Error(errorMsg);
        error.status = response.status;
        error.errors = data.errors || [];
        throw error;
      }

      return data.data;
    } catch (err) {
      throw err;
    }
  },

  get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  },

  // Cache danh mục
  _faculties: null,
  _semesters: null,
  _currentSemester: null,

  async getFaculties() {
    if (this._faculties) return this._faculties;
    try {
      this._faculties = await this.get('/faculties');
      return this._faculties;
    } catch (e) {
      console.error('Lỗi tải danh mục khoa:', e);
      return [];
    }
  },

  async getSemesters() {
    if (this._semesters) return this._semesters;
    try {
      this._semesters = await this.get('/semesters');
      return this._semesters;
    } catch (e) {
      console.error('Lỗi tải danh mục học kỳ:', e);
      return [];
    }
  },

  async getCurrentSemester() {
    if (this._currentSemester) return this._currentSemester;
    try {
      this._currentSemester = await this.get('/semesters/current');
      return this._currentSemester;
    } catch (e) {
      console.error('Lỗi tải học kỳ hiện tại:', e);
      return null;
    }
  },

  async getClasses(filters = {}) {
    try {
      return await this.get('/classes', filters);
    } catch (e) {
      console.error('Lỗi tải danh mục lớp sinh hoạt:', e);
      return [];
    }
  }
};

/**
 * Đổ động danh mục lớp sinh hoạt vào thẻ select (UI/UX Pro Max)
 */
async function populateClasses(selectElementOrId, options = {}) {
  const { maKhoa = '', namNhapHoc = '', defaultText = '-- Tất cả lớp sinh hoạt --' } = options;
  const select = typeof selectElementOrId === 'string' ? document.getElementById(selectElementOrId) : selectElementOrId;
  if (!select) return;

  const currentVal = select.value;
  select.disabled = true;
  select.innerHTML = `<option value="">Đang tải danh sách lớp...</option>`;

  const classes = await api.getClasses({ maKhoa, namNhapHoc });
  select.innerHTML = `<option value="">${defaultText}</option>`;

  if (classes && classes.length > 0) {
    classes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.maLop;
      opt.textContent = `${c.maLop} - ${c.tenLop} (${c.soLuongSV} SV)`;
      if (c.maLop === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }
  select.disabled = false;
}

/**
 * Đổ động danh mục khoa vào thẻ select (UI/UX Pro Max Loading & Accessible)
 */
async function populateFaculties(selectElementOrId, defaultText = '-- Tất cả các khoa --') {
  const select = typeof selectElementOrId === 'string' ? document.getElementById(selectElementOrId) : selectElementOrId;
  if (!select) return;

  const currentVal = select.value;
  select.disabled = true;
  select.innerHTML = `<option value="">Đang tải danh mục khoa...</option>`;

  const faculties = await api.getFaculties();
  select.innerHTML = `<option value="">${defaultText}</option>`;

  if (faculties && faculties.length > 0) {
    faculties.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.maKhoa;
      opt.textContent = `${f.tenKhoa} (${f.maKhoa})`;
      if (f.maKhoa === currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  }
  select.disabled = false;
}

/**
 * Đổ động danh mục học kỳ vào thẻ select
 */
async function populateSemesters(selectElementOrId, defaultText = '-- Tất cả học kỳ --') {
  const select = typeof selectElementOrId === 'string' ? document.getElementById(selectElementOrId) : selectElementOrId;
  if (!select) return;

  const currentVal = select.value;
  select.disabled = true;
  select.innerHTML = `<option value="">Đang tải học kỳ...</option>`;

  const semesters = await api.getSemesters();
  select.innerHTML = `<option value="">${defaultText}</option>`;

  if (semesters && semesters.length > 0) {
    semesters.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.maHocKy;
      opt.textContent = `${s.tenHocKy} (${s.namHoc})${s.trangThai === 'DANG_MO' ? ' • [Hiện tại]' : ''}`;
      if (String(s.maHocKy) === String(currentVal)) opt.selected = true;
      select.appendChild(opt);
    });
  }
  select.disabled = false;
}

/**
 * Cập nhật động học kỳ hiện tại trên toàn bộ giao diện (Header badges, title)
 */
async function updateCurrentSemesterBadges() {
  const current = await api.getCurrentSemester();
  if (!current) return;
  const displayText = `${current.tenHocKy} (${current.namHoc})`;

  document.querySelectorAll('.semester-badge').forEach(el => {
    el.textContent = displayText;
  });

  document.querySelectorAll('.dynamic-semester-name').forEach(el => {
    el.textContent = displayText;
  });
}

/**
 * Hiển thị Toast thông báo trên giao diện
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'alert-toast';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type === 'error' ? 'danger' : type}`;
  toast.innerHTML = `<div>${message.replace(/\n/g, '<br>')}</div>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 300ms ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global helpers
function formatCurrency(val) {
  return api.formatCurrency(val);
}

/**
 * Render component Phân trang chuẩn UI/UX Pro Max
 * Hỗ trợ WCAG, SVG icons ngữ nghĩa, chọn kích thước trang linh hoạt
 */
function renderPagination({
  containerId,
  page = 1,
  pageSize = 10,
  totalItems = 0,
  totalPages = 1,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange
}) {
  const container = typeof containerId === 'string' 
    ? document.getElementById(containerId) 
    : containerId;
  if (!container) return;

  if (totalItems <= 0) {
    container.innerHTML = '';
    return;
  }

  const startItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, totalItems);

  // Tính các số trang cần hiển thị thông minh với ellipsis
  const pagesToShow = [];
  const delta = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pagesToShow.push(i);
    } else if (pagesToShow[pagesToShow.length - 1] !== '...') {
      pagesToShow.push('...');
    }
  }

  // SVG Icons
  const iconFirst = `<svg viewBox="0 0 24 24"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>`;
  const iconPrev = `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
  const iconNext = `<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
  const iconLast = `<svg viewBox="0 0 24 24"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>`;

  const selectId = `pag-size-${Math.random().toString(36).substring(2, 7)}`;

  let html = `
    <div class="pagination-wrapper" role="navigation" aria-label="Phân trang dữ liệu">
      <div class="pagination-left">
        <div class="pagination-summary">
          Hiển thị <strong>${startItem} - ${endItem}</strong> trong <strong>${totalItems}</strong> bản ghi
        </div>
        <div class="pagination-size-wrapper">
          <label for="${selectId}" style="font-size: 0.8125rem;">Kích thước:</label>
          <select id="${selectId}" class="pagination-size-select" aria-label="Số bản ghi mỗi trang">
            ${pageSizeOptions.map(size => `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size} / trang</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" data-page="1" ${page <= 1 ? 'disabled' : ''} title="Trang đầu" aria-label="Trang đầu">
          ${iconFirst}
        </button>
        <button class="pagination-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''} title="Trang trước" aria-label="Trang trước">
          ${iconPrev}
        </button>
  `;

  pagesToShow.forEach(p => {
    if (p === '...') {
      html += `<span class="pagination-ellipsis">...</span>`;
    } else {
      const isActive = p === page;
      html += `
        <button class="pagination-btn ${isActive ? 'active' : ''}" data-page="${p}" ${isActive ? 'aria-current="page"' : ''}>
          ${p}
        </button>
      `;
    }
  });

  html += `
        <button class="pagination-btn" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''} title="Trang sau" aria-label="Trang sau">
          ${iconNext}
        </button>
        <button class="pagination-btn" data-page="${totalPages}" ${page >= totalPages ? 'disabled' : ''} title="Trang cuối" aria-label="Trang cuối">
          ${iconLast}
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Gắn sự kiện click đổi trang
  const buttons = container.querySelectorAll('.pagination-btn[data-page]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPage = parseInt(btn.getAttribute('data-page'));
      if (targetPage && targetPage !== page && targetPage >= 1 && targetPage <= totalPages) {
        if (typeof onPageChange === 'function') {
          onPageChange(targetPage, pageSize);
        }
      }
    });
  });

  // Gắn sự kiện đổi pageSize
  const select = container.querySelector('.pagination-size-select');
  if (select) {
    select.addEventListener('change', (e) => {
      const newPageSize = parseInt(e.target.value);
      if (newPageSize && typeof onPageChange === 'function') {
        onPageChange(1, newPageSize);
      }
    });
  }
}

/**
 * Từ điển chuẩn hóa trạng thái hệ thống sang Tiếng Việt có dấu (UI/UX Pro Max)
 */
const STATUS_DICTIONARY = {
  // Lớp học phần
  'DA_KHOA': { text: 'Đã khóa', badgeClass: 'badge-warning' },
  'MO_DANG_KY': { text: 'Mở đăng ký', badgeClass: 'badge-success' },
  'DANG_MO': { text: 'Đang mở lớp', badgeClass: 'badge-info' },
  'DA_HUY': { text: 'Đã hủy lớp', badgeClass: 'badge-danger' },

  // Đăng ký tín chỉ
  'REGISTERED': { text: 'Đã đăng ký', badgeClass: 'badge-success' },
  'CANCELLED': { text: 'Đã hủy', badgeClass: 'badge-danger' },

  // Sinh viên
  'DANG_HOC': { text: 'Đang học', badgeClass: 'badge-success' },
  'BAO_LUU': { text: 'Bảo lưu', badgeClass: 'badge-warning' },
  'BUOC_THOI_HOC': { text: 'Buộc thôi học', badgeClass: 'badge-danger' },
  'TOT_NGHIEP': { text: 'Tốt nghiệp', badgeClass: 'badge-info' },

  // Tài khoản
  'ACTIVE': { text: 'Hoạt động', badgeClass: 'badge-success' },
  'LOCKED': { text: 'Đã khóa', badgeClass: 'badge-danger' },
  'INACTIVE': { text: 'Tạm khóa', badgeClass: 'badge-warning' },

  // Học phí & Thanh toán
  'PAID': { text: 'Đã thanh toán', badgeClass: 'badge-success' },
  'DA_THANH_TOAN': { text: 'Đã thanh toán', badgeClass: 'badge-success' },
  'PARTIAL': { text: 'Thanh toán 1 phần', badgeClass: 'badge-warning' },
  'UNPAID': { text: 'Chưa thanh toán', badgeClass: 'badge-danger' },
  'CHUA_THANH_TOAN': { text: 'Chưa thanh toán', badgeClass: 'badge-danger' },

  // Giao dịch
  'DA_XAC_NHAN': { text: 'Đã xác nhận', badgeClass: 'badge-success' },
  'CHO_XAC_NHAN': { text: 'Chờ xác nhận', badgeClass: 'badge-warning' },
  'TU_CHOI': { text: 'Bị từ chối', badgeClass: 'badge-danger' },
  'SUCCESS': { text: 'Thành công', badgeClass: 'badge-success' },
  'PENDING': { text: 'Chờ xử lý', badgeClass: 'badge-warning' },
  'FAILED': { text: 'Thất bại', badgeClass: 'badge-danger' },

  // Học kỳ
  'DA_DONG': { text: 'Đã đóng', badgeClass: 'badge-secondary' }
};

/**
 * Từ điển vai trò người dùng hệ thống
 */
const ROLE_DICTIONARY = {
  'SINH_VIEN': { text: 'Sinh viên', badgeClass: 'badge-info' },
  'GIANG_VIEN': { text: 'Giảng viên', badgeClass: 'badge-primary' },
  'DAO_TAO': { text: 'Cán bộ Đào tạo', badgeClass: 'badge-warning' },
  'QUAN_TRI': { text: 'Quản trị viên', badgeClass: 'badge-danger' },
  'SYSTEM': { text: 'Hệ thống', badgeClass: 'badge-secondary' }
};

/**
 * Từ điển hành động ghi log audit
 */
const AUDIT_ACTION_DICTIONARY = {
  'INSERT': { text: 'Thêm mới', badgeClass: 'badge-success' },
  'UPDATE': { text: 'Cập nhật', badgeClass: 'badge-warning' },
  'DELETE': { text: 'Xóa', badgeClass: 'badge-danger' }
};

/**
 * Từ điển tên bảng CSDL sang tiếng Việt
 */
const AUDIT_TABLE_DICTIONARY = {
  'TAIKHOAN': 'Tài khoản người dùng',
  'SINHVIEN': 'Sinh viên',
  'GIANGVIEN': 'Giảng viên',
  'DANGKYTINCHI': 'Đăng ký tín chỉ',
  'HOCPHI': 'Học phí',
  'CHITIETTHANHTOAN': 'Thanh toán học phí',
  'LOPHOCPHAN': 'Lớp học phần',
  'MONHOC': 'Môn học',
  'DIEMSO': 'Điểm số',
  'LICHHOC': 'Lịch học',
  'LOP': 'Lớp sinh hoạt',
  'KHOA': 'Khoa',
  'HOCKY': 'Học kỳ',
  'CHUONGTRINHDAOTAO': 'Chương trình đào tạo'
};

/**
 * Từ điển tên trường dữ liệu sang tiếng Việt
 */
const AUDIT_FIELD_DICTIONARY = {
  'Username': 'Tên đăng nhập',
  'VaiTro': 'Vai trò',
  'TrangThai': 'Trạng thái',
  'LanDangNhapCuoi': 'Lần đăng nhập cuối',
  'NgayTao': 'Ngày tạo',
  'MaSV': 'Mã sinh viên',
  'MaSinhVien': 'MSSV',
  'HoTen': 'Họ và tên',
  'Email': 'Email',
  'SoDienThoai': 'Số điện thoại',
  'NgaySinh': 'Ngày sinh',
  'MaKhoa': 'Khoa',
  'MaLop': 'Lớp sinh hoạt',
  'MaGV': 'Mã giảng viên',
  'MaGiangVien': 'Mã GV',
  'MaLHP': 'Mã lớp HP',
  'TenLHP': 'Tên lớp HP',
  'MaHocPhi': 'Mã học phí',
  'SoTienDaThanhToan': 'Số tiền đã nộp',
  'SoTienConLai': 'Số tiền còn lại',
  'TongTien': 'Tổng tiền',
  'SoTien': 'Số tiền',
  'PhuongThuc': 'Phương thức',
  'DiemChuyenCan': 'Điểm quá trình',
  'DiemGiuaKy': 'Điểm giữa kỳ',
  'DiemCuoiKy': 'Điểm cuối kỳ',
  'DiemTongKet': 'Điểm tổng kết',
  'DiemChu': 'Điểm chữ',
  'KetQua': 'Kết quả',
  'SiSoToiDa': 'Sĩ số tối đa'
};

function formatStatusBadge(code) {
  if (!code) return { text: 'Chưa cập nhật', badgeClass: 'badge-secondary' };
  const normalized = String(code).trim().toUpperCase();
  return STATUS_DICTIONARY[normalized] || { text: code, badgeClass: 'badge-secondary' };
}

function renderStatusBadge(code) {
  const { text, badgeClass } = formatStatusBadge(code);
  return `<span class="badge ${badgeClass}">${text}</span>`;
}

function formatRoleBadge(role) {
  if (!role) return { text: 'Không rõ', badgeClass: 'badge-secondary' };
  const normalized = String(role).trim().toUpperCase();
  return ROLE_DICTIONARY[normalized] || { text: role, badgeClass: 'badge-secondary' };
}

function renderRoleBadge(role) {
  const { text, badgeClass } = formatRoleBadge(role);
  return `<span class="badge ${badgeClass}">${text}</span>`;
}

function formatAuditAction(action) {
  if (!action) return { text: 'Khác', badgeClass: 'badge-secondary' };
  const normalized = String(action).trim().toUpperCase();
  return AUDIT_ACTION_DICTIONARY[normalized] || { text: action, badgeClass: 'badge-secondary' };
}

function formatAuditTable(tableName) {
  if (!tableName) return '-';
  const normalized = String(tableName).trim().toUpperCase();
  return AUDIT_TABLE_DICTIONARY[normalized] || tableName;
}

/**
 * Định dạng một giá trị trường dữ liệu trong Audit
 */
function formatAuditValue(key, val) {
  if (val === null || val === undefined) return '<span style="color: #94A3B8;">(trống)</span>';

  // Chuỗi ISO Date
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleString('vi-VN');
  }

  // Tiền tệ
  if (/Tien|Amount/i.test(key) && typeof val === 'number') {
    return formatCurrency(val);
  }

  // Trạng thái hoặc Vai trò
  const strVal = String(val).trim().toUpperCase();
  if (STATUS_DICTIONARY[strVal]) return STATUS_DICTIONARY[strVal].text;
  if (ROLE_DICTIONARY[strVal]) return ROLE_DICTIONARY[strVal].text;

  return String(val);
}

/**
 * Format chuỗi JSON Audit Trail sang ngôn ngữ tự nhiên người đọc hiểu (UI/UX Pro Max)
 */
function formatAuditContent(hanhDong, noiDungCu, noiDungMoi) {
  let oldObj = null;
  let newObj = null;

  try { if (noiDungCu) oldObj = typeof noiDungCu === 'string' ? JSON.parse(noiDungCu) : noiDungCu; } catch (e) {}
  try { if (noiDungMoi) newObj = typeof noiDungMoi === 'string' ? JSON.parse(noiDungMoi) : noiDungMoi; } catch (e) {}

  // Fallback nếu không thể parse
  if (!oldObj && !newObj) {
    if (noiDungMoi) return `<span>${noiDungMoi}</span>`;
    if (noiDungCu) return `<span style="color: var(--color-danger-text);">${noiDungCu}</span>`;
    return '<span style="color: var(--color-text-muted);">-</span>';
  }

  let htmlResult = '';
  const actionNorm = String(hanhDong || '').toUpperCase();

  if (actionNorm === 'UPDATE' && oldObj && newObj) {
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
    const diffKeys = allKeys.filter(k => {
      return JSON.stringify(oldObj[k]) !== JSON.stringify(newObj[k]);
    });

    if (diffKeys.length > 0) {
      htmlResult = `
        <div class="audit-diff-list" style="display: flex; flex-direction: column; gap: 4px;">
          ${diffKeys.map(k => {
            const fieldLabel = AUDIT_FIELD_DICTIONARY[k] || k;
            const oldValFormatted = formatAuditValue(k, oldObj[k]);
            const newValFormatted = formatAuditValue(k, newObj[k]);
            return `
              <div class="audit-diff-item" style="font-size: 0.8125rem; line-height: 1.4;">
                <span class="audit-field-name" style="font-weight: 600; color: #475569;">${fieldLabel}:</span>
                <span class="audit-old-val" style="color: #94A3B8; text-decoration: line-through; margin: 0 4px;">${oldValFormatted}</span>
                <span class="audit-arrow" style="color: #64748B; font-weight: 700;">→</span>
                <span class="audit-new-val" style="color: #16A34A; font-weight: 600; margin-left: 4px;">${newValFormatted}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      const idKey = Object.keys(newObj).find(k => /Ma|Id|User/i.test(k)) || Object.keys(newObj)[0];
      htmlResult = `
        <div style="font-size: 0.8125rem; color: #475569;">
          Cập nhật bản ghi ${idKey ? `<strong>${idKey}: ${newObj[idKey]}</strong>` : ''}
        </div>
      `;
    }
  } else if (actionNorm === 'INSERT' && newObj) {
    const entries = Object.entries(newObj).slice(0, 5);
    htmlResult = `
      <div style="font-size: 0.8125rem; line-height: 1.5; color: #1E293B;">
        <span style="font-weight: 600; color: #16A34A;">Tạo mới:</span>
        ${entries.map(([k, v]) => {
          const label = AUDIT_FIELD_DICTIONARY[k] || k;
          return `${label}: <strong>${formatAuditValue(k, v)}</strong>`;
        }).join(' • ')}
        ${Object.keys(newObj).length > 5 ? ' ...' : ''}
      </div>
    `;
  } else if (actionNorm === 'DELETE' && oldObj) {
    const entries = Object.entries(oldObj).slice(0, 5);
    htmlResult = `
      <div style="font-size: 0.8125rem; line-height: 1.5; color: #DC2626;">
        <span style="font-weight: 600;">Xóa bản ghi:</span>
        ${entries.map(([k, v]) => {
          const label = AUDIT_FIELD_DICTIONARY[k] || k;
          return `${label}: <strong>${formatAuditValue(k, v)}</strong>`;
        }).join(' • ')}
      </div>
    `;
  } else {
    const targetObj = newObj || oldObj;
    const entries = Object.entries(targetObj).slice(0, 4);
    htmlResult = `
      <div style="font-size: 0.8125rem; line-height: 1.4;">
        ${entries.map(([k, v]) => `${AUDIT_FIELD_DICTIONARY[k] || k}: <strong>${formatAuditValue(k, v)}</strong>`).join(' • ')}
      </div>
    `;
  }

  // Tùy chọn thu gọn xem JSON gốc (UI/UX Pro Max)
  const rawJson = noiDungMoi || noiDungCu;
  if (rawJson) {
    htmlResult += `
      <details style="margin-top: 6px; font-size: 0.72rem;">
        <summary style="cursor: pointer; color: var(--color-text-muted); user-select: none;">Chi tiết JSON gốc</summary>
        <pre style="margin-top: 4px; padding: 6px 8px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; max-height: 120px; overflow: auto; font-family: monospace; font-size: 0.72rem; color: #334155;">${typeof rawJson === 'object' ? JSON.stringify(rawJson, null, 2) : rawJson}</pre>
      </details>
    `;
  }

  return htmlResult;
}

window.api = api;
window.apiClient = api;
window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.renderPagination = renderPagination;
window.formatStatusBadge = formatStatusBadge;
window.renderStatusBadge = renderStatusBadge;
window.formatRoleBadge = formatRoleBadge;
window.renderRoleBadge = renderRoleBadge;
window.formatAuditAction = formatAuditAction;
window.formatAuditTable = formatAuditTable;
window.formatAuditContent = formatAuditContent;
window.populateClasses = populateClasses;
window.populateFaculties = populateFaculties;
window.populateSemesters = populateSemesters;
