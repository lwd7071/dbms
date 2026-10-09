// frontend/js/admin.js
// Quản lý nghiệp vụ Báo cáo Tài chính Học vụ, Xác nhận thanh toán và Quản trị

let adminTuitionReportData = [];
let pendingPaymentsData = [];

// Khởi tạo trang Admin
async function initAdminPortal() {
  await loadPendingPayments();
  await loadTuitionReport();
}

// 1. Tải danh sách các giao dịch chờ xác nhận (CHO_XAC_NHAN)
async function loadPendingPayments() {
  const container = document.getElementById('pendingPaymentsContainer');
  const countBadge = document.getElementById('pendingCountBadge');
  if (!container) return;

  const maLop = document.getElementById('filterPendingLop')?.value || '';

  container.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
      Đang tải danh sách giao dịch chờ duyệt...
    </div>
  `;

  try {
    const params = {};
    if (maLop) params.maLop = maLop;

    const list = await api.get('/payments/pending', params);
    pendingPaymentsData = list || [];

    if (countBadge) {
      countBadge.textContent = `${pendingPaymentsData.length} giao dịch`;
    }

    if (pendingPaymentsData.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--color-text-muted); background: var(--color-surface); border-radius: var(--radius-md);">
          Hiện tại không có giao dịch nào đang chờ xác nhận.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table" style="min-width: 1050px;">
          <thead>
            <tr>
              <th style="width: 90px;">Mã GD</th>
              <th style="min-width: 160px;">Sinh viên</th>
              <th style="min-width: 180px;">Lớp sinh hoạt</th>
              <th style="min-width: 150px;">Học kỳ</th>
              <th style="width: 140px; text-align: right;">Số tiền</th>
              <th style="width: 130px; text-align: center;">Phương thức</th>
              <th style="min-width: 160px;">Thời gian tạo</th>
              <th style="width: 120px; text-align: center;">Trạng thái</th>
              <th style="width: 160px; text-align: center;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${pendingPaymentsData.map(p => `
              <tr>
                <td class="cell-nowrap"><strong>#${p.maThanhToan}</strong></td>
                <td class="cell-nowrap">
                  <div style="font-weight: 600;">${p.hoTenSinhVien}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${p.maSinhVien} (ID #${p.maSV})</div>
                </td>
                <td class="cell-nowrap">
                  <span class="badge badge-info">${p.tenLop || p.maLop || '-'}</span>
                </td>
                <td class="cell-nowrap">${p.tenHocKy} (${p.namHoc})</td>
                <td class="cell-nowrap" style="text-align: right; font-weight: 700; font-family: monospace; color: var(--color-primary-dark);">
                  ${api.formatCurrency(p.soTien)}
                </td>
                <td class="cell-nowrap" style="text-align: center;"><span class="badge badge-info">${p.phuongThuc === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Tiền mặt'}</span></td>
                <td class="cell-nowrap">${new Date(p.ngayThanhToan).toLocaleString('vi-VN')}</td>
                <td class="cell-nowrap" style="text-align: center;">
                  <span class="badge badge-warning">Chờ xác nhận</span>
                </td>
                <td class="cell-nowrap" style="text-align: center;">
                  <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button class="btn btn-sm btn-success" onclick="confirmPaymentAdmin(${p.maThanhToan})">
                      Xác nhận
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="rejectPaymentAdmin(${p.maThanhToan})">
                      Từ chối
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--color-danger-text);">
        Lỗi tải giao dịch: ${err.message}
      </div>
    `;
  }
}

// 2. Xác nhận giao dịch thanh toán
async function confirmPaymentAdmin(maThanhToan) {
  if (!confirm(`Bạn có chắc chắn muốn XÁC NHẬN giao dịch #${maThanhToan} thành công?`)) return;

  try {
    const res = await api.post(`/payments/${maThanhToan}/confirm`);
    showToast(`Đã xác nhận giao dịch #${maThanhToan} thành công! Học phí mới: ${res.tuition.trangThai}`, 'success');
    await loadPendingPayments();
    await loadTuitionReport();
  } catch (err) {
    showToast(`Xác nhận thất bại: ${err.message}`, 'danger');
  }
}

// 3. Từ chối giao dịch thanh toán
async function rejectPaymentAdmin(maThanhToan) {
  if (!confirm(`Bạn có chắc chắn muốn TỪ CHỐI giao dịch #${maThanhToan}?`)) return;

  try {
    await api.post(`/payments/${maThanhToan}/reject`);
    showToast(`Đã từ chối giao dịch #${maThanhToan}.`, 'warning');
    await loadPendingPayments();
  } catch (err) {
    showToast(`Từ chối thất bại: ${err.message}`, 'danger');
  }
}

// 4. Tải dữ liệu báo cáo tài chính từ SP_ThongKeHocPhi
async function loadTuitionReport() {
  const container = document.getElementById('adminReportContainer');
  if (!container) return;

  const hocKyFilter = document.getElementById('filterReportHocKy')?.value || '';
  const trangThaiFilter = document.getElementById('filterReportStatus')?.value || '';

  container.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
      Đang gọi Stored Procedure <code>SP_ThongKeHocPhi</code>...
    </div>
  `;

  try {
    const params = {};
    if (hocKyFilter) params.maHocKy = hocKyFilter;
    if (trangThaiFilter) params.trangThai = trangThaiFilter;

    const data = await api.get('/admin/reports/tuition', params);
    adminTuitionReportData = data || [];
    renderTuitionReport(adminTuitionReportData);
  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--color-danger-text);">
        Lỗi khi trích xuất báo cáo: ${err.message || 'Lỗi kết nối'}
      </div>
    `;
    showToast(err.message || 'Lỗi báo cáo', 'danger');
  }
}

// Hiển thị báo cáo và bảng KPI
function renderTuitionReport(data) {
  const container = document.getElementById('adminReportContainer');
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--color-text-muted); background: var(--color-surface); border-radius: var(--radius-md);">
        Không tìm thấy dữ liệu thống kê cho bộ lọc đã chọn.
      </div>
    `;
    return;
  }

  // Thống kê tổng hợp
  let totalPhaiThu = 0;
  let totalDaThu = 0;
  let totalConLai = 0;
  let totalHoSo = 0;

  data.forEach(item => {
    totalPhaiThu += item.tongTienPhaiThu || 0;
    totalDaThu += item.tongTienDaThu || 0;
    totalConLai += item.tongTienConLai || 0;
    totalHoSo += item.soHoSoHocPhi || 0;
  });

  const rateDaThu = totalPhaiThu > 0 ? ((totalDaThu / totalPhaiThu) * 100).toFixed(1) : 0;

  const kpisHtml = `
    <div class="summary-cards" style="margin-bottom: 1.5rem;">
      <div class="summary-card">
        <div class="summary-label">Tổng hồ sơ học phí</div>
        <div class="summary-value" style="font-size: 1.5rem;">
          ${totalHoSo.toLocaleString('vi-VN')}
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Tổng tiền phải thu</div>
        <div class="summary-value" style="font-size: 1.5rem;">
          ${api.formatCurrency(totalPhaiThu)}
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Đã thu thực tế (${rateDaThu}%)</div>
        <div class="summary-value" style="font-size: 1.5rem; color: #16A34A;">
          ${api.formatCurrency(totalDaThu)}
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Công nợ tồn đọng</div>
        <div class="summary-value" style="font-size: 1.5rem; color: #DC2626;">
          ${api.formatCurrency(totalConLai)}
        </div>
      </div>
    </div>
  `;

  const tableHtml = `
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>Học kỳ</th>
            <th>Năm học</th>
            <th style="text-align: right;">Số hồ sơ</th>
            <th style="text-align: right;">Phải thu</th>
            <th style="text-align: right;">Đã thu</th>
            <th style="text-align: right;">Còn lại</th>
            <th style="text-align: center;">Chưa thanh toán</th>
            <th style="text-align: center;">Thanh toán 1 phần</th>
            <th style="text-align: center;">Đã hoàn thành</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(r => `
            <tr>
              <td><strong>${r.tenHocKy}</strong></td>
              <td>${r.namHoc}</td>
              <td style="text-align: right; font-family: monospace;">${r.soHoSoHocPhi}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 600;">${api.formatCurrency(r.tongTienPhaiThu)}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 600; color: #16A34A;">${api.formatCurrency(r.tongTienDaThu)}</td>
              <td style="text-align: right; font-family: monospace; font-weight: 700; color: ${r.tongTienConLai > 0 ? '#DC2626' : 'inherit'};">
                ${api.formatCurrency(r.tongTienConLai)}
              </td>
              <td style="text-align: center;"><span class="badge badge-danger">${r.soUNPAID}</span></td>
              <td style="text-align: center;"><span class="badge badge-warning">${r.soPARTIAL}</span></td>
              <td style="text-align: center;"><span class="badge badge-success">${r.soPAID}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = kpisHtml + tableHtml;
}

// 5. Tìm kiếm học phí của sinh viên theo mã SV (Quầy thu tiền)
async function searchStudentTuitionAdmin() {
  const input = document.getElementById('searchMaSV');
  const resultContainer = document.getElementById('adminStudentTuitionResult');
  if (!input || !resultContainer) return;

  const maSV = input.value.trim();
  if (!maSV) {
    showToast('Vui lòng nhập Mã SV (ID)', 'warning');
    return;
  }

  resultContainer.innerHTML = `
    <div style="text-align: center; padding: 1.5rem; color: var(--color-text-muted);">
      Đang tìm kiếm hồ sơ học phí của sinh viên #${maSV}...
    </div>
  `;

  try {
    const list = await api.get(`/students/${maSV}/tuition`);

    if (!list || list.length === 0) {
      resultContainer.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--color-text-muted);">
          Không tìm thấy hồ sơ học phí cho sinh viên ID #${maSV}.
        </div>
      `;
      return;
    }

    resultContainer.innerHTML = `
      <div style="margin-top: 1.25rem;">
        <h4 style="font-size: 0.9375rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--color-primary-dark);">
          Kết quả học phí: ${list[0].hoTenSinhVien} (${list[0].maSinhVien})
        </h4>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Học kỳ</th>
                <th style="text-align: right;">Tín chỉ</th>
                <th style="text-align: right;">Học phí</th>
                <th style="text-align: right;">Đã nộp</th>
                <th style="text-align: right;">Còn nợ</th>
                <th>Trạng thái</th>
                <th style="text-align: center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(item => `
                <tr>
                  <td><strong>${item.tenHocKy}</strong> (${item.namHoc})</td>
                  <td style="text-align: right; font-family: monospace;">${item.soTinChi}</td>
                  <td style="text-align: right; font-family: monospace;">${api.formatCurrency(item.tongTien)}</td>
                  <td style="text-align: right; font-family: monospace; color: #16A34A;">${api.formatCurrency(item.soTienDaThanhToan)}</td>
                  <td style="text-align: right; font-family: monospace; font-weight: 700; color: ${item.soTienConLai > 0 ? '#DC2626' : 'inherit'};">
                    ${api.formatCurrency(item.soTienConLai)}
                  </td>
                  <td>
                    ${renderStatusBadge(item.trangThai)}
                  </td>
                  <td style="text-align: center;">
                    ${item.soTienConLai > 0 ? `
                      <button class="btn btn-primary btn-sm" onclick="openAdminCollectPayment(${item.maHocPhi}, '${item.hoTenSinhVien}', ${item.soTienConLai})">
                        Thu trực tiếp & Duyệt
                      </button>
                    ` : `<span style="color: #16A34A; font-size: 0.75rem; font-weight: 600;">Đã hoàn thành</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    resultContainer.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--color-danger-text);">
        Lỗi tra cứu: ${err.message || 'Không thể tra cứu sinh viên'}
      </div>
    `;
    showToast(err.message || 'Lỗi tra cứu', 'danger');
  }
}

// Mở modal thu tiền cho admin
function openAdminCollectPayment(maHocPhi, hoTen, conLai) {
  const modal = document.getElementById('adminPaymentModal');
  if (!modal) return;

  document.getElementById('adminPaymentInfo').innerHTML = `
    Học sinh: <strong>${hoTen}</strong> | Hồ sơ HP: <strong>#${maHocPhi}</strong><br>
    Số tiền còn nợ: <strong style="color: #DC2626;">${api.formatCurrency(conLai)}</strong>
  `;

  document.getElementById('adminPaymentMaHocPhi').value = maHocPhi;
  const inputAmount = document.getElementById('adminPaymentAmount');
  inputAmount.value = conLai;
  inputAmount.max = conLai;

  modal.classList.add('show');
}

function closeAdminPaymentModal() {
  const modal = document.getElementById('adminPaymentModal');
  if (modal) modal.classList.remove('show');
}

// Admin thu tiền tại quầy và tự động xác nhận
async function submitAdminPayment() {
  const maHocPhi = parseInt(document.getElementById('adminPaymentMaHocPhi').value);
  const amount = parseFloat(document.getElementById('adminPaymentAmount').value);
  const phuongThuc = document.getElementById('adminPaymentMethod').value;

  if (isNaN(amount) || amount <= 0) {
    showToast('Vui lòng nhập số tiền thu hợp lệ (> 0)', 'warning');
    return;
  }

  const btn = document.getElementById('btnConfirmAdminPayment');
  btn.disabled = true;
  btn.innerHTML = 'Đang xử lý giao dịch...';

  try {
    // 1. Tạo giao dịch thanh toán
    const createRes = await api.post('/payments', {
      maHocPhi,
      soTien: amount,
      phuongThuc
    });

    const paymentId = createRes.payment.maThanhToan;

    // 2. Tự động xác nhận giao dịch luôn vì thu tại quầy
    const confirmRes = await api.post(`/payments/${paymentId}/confirm`);

    showToast(`Thu tiền và xác nhận thành công ${api.formatCurrency(amount)}! Trạng thái: ${confirmRes.tuition.trangThai}`, 'success');
    closeAdminPaymentModal();

    await searchStudentTuitionAdmin();
    await loadTuitionReport();
  } catch (err) {
    showToast(err.message || 'Thu tiền thất bại', 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Xác nhận thu tiền tại quầy';
  }
}

// ==========================================
// 6. DASHBOARD TỔNG QUAN
// ==========================================
async function loadAdminDashboard() {
  const container = document.getElementById('adminDashboardContent');
  if (!container) return;

  container.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải dữ liệu tổng quan quản trị...</div>`;

  try {
    const stats = await api.get('/admin/dashboard');

    container.innerHTML = `
      <!-- Welcome Banner -->
      <div class="welcome-banner" style="background: linear-gradient(135deg, var(--color-primary-dark), #1E40AF); color: white; padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 0.25rem;">
            Bảng Điều Khiển Quản Trị Đào Tạo
          </h2>
          <p style="font-size: 0.875rem; opacity: 0.9;">
            Giám sát thời gian thực: Sinh viên, Lớp học phần, Đăng ký tín chỉ & Tài chính học vụ.
          </p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.15); padding: 0.75rem 1.25rem; border-radius: var(--radius-sm); text-align: right;">
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9;">Năm học hiện tại</div>
          <div style="font-size: 1.15rem; font-weight: 700;">2025 - 2026</div>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="summary-cards admin-summary-cards" style="margin-bottom: 1.25rem;">
        <div class="summary-card" onclick="switchAdminTab('students')" style="cursor: pointer;">
          <div class="summary-label">Tổng Sinh Viên</div>
          <div class="summary-value" style="color: var(--color-primary);">${stats.tongSinhVien.toLocaleString('vi-VN')}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">Toàn hệ thống</div>
        </div>

        <div class="summary-card" onclick="switchAdminTab('classes-sh')" style="cursor: pointer;">
          <div class="summary-label">Lớp Sinh Hoạt</div>
          <div class="summary-value" style="color: #8B5CF6;">${(stats.tongLopSinhHoat || 36).toLocaleString('vi-VN')}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">3 khóa (K23 - K25)</div>
        </div>

        <div class="summary-card" onclick="switchAdminTab('classes')" style="cursor: pointer;">
          <div class="summary-label">Lớp Học Phần Mở</div>
          <div class="summary-value" style="color: #0284C7;">${stats.tongLopHocPhan.toLocaleString('vi-VN')}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">Học kỳ hiện tại</div>
        </div>

        <div class="summary-card" onclick="switchAdminTab('registrations')" style="cursor: pointer;">
          <div class="summary-label">Lượt Đăng Ký Tín Chỉ</div>
          <div class="summary-value" style="color: #16A34A;">${stats.tongLuotDangKy.toLocaleString('vi-VN')}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">Trạng thái Đã đăng ký</div>
        </div>

        <div class="summary-card" onclick="switchAdminTab('pending')" style="cursor: pointer;">
          <div class="summary-label">Giao Dịch Chờ Duyệt</div>
          <div class="summary-value" style="color: ${stats.soGiaoDichChoXacNhan > 0 ? '#DC2626' : '#16A34A'};">
            ${stats.soGiaoDichChoXacNhan}
          </div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">Cần kiểm tra đối soát</div>
        </div>
      </div>

      <!-- Doanh thu học phí tổng quan -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3 class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            Tổng Quan Tài Chính Thu Học Phí
          </h3>
          <span class="badge badge-info">Đồng bộ từ CSDL</span>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
            <div>
              <span style="color: var(--color-text-muted); font-size: 0.875rem;">Tổng tiền phải thu:</span>
              <div style="font-size: 1.5rem; font-weight: 700; margin-top: 0.25rem;">${api.formatCurrency(stats.tongHocPhiPhaiThu)}</div>
            </div>
            <div>
              <span style="color: var(--color-text-muted); font-size: 0.875rem;">Đã thu thực tế (đã xác nhận):</span>
              <div style="font-size: 1.5rem; font-weight: 700; color: #16A34A; margin-top: 0.25rem;">${api.formatCurrency(stats.tongTienDaThu)}</div>
            </div>
            <div>
              <span style="color: var(--color-text-muted); font-size: 0.875rem;">Công nợ tồn đọng:</span>
              <div style="font-size: 1.5rem; font-weight: 700; color: #DC2626; margin-top: 0.25rem;">
                ${api.formatCurrency(Math.max(0, stats.tongHocPhiPhaiThu - stats.tongTienDaThu))}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Lỗi tải Dashboard: ${err.message}</div>`;
  }
}

// ==========================================
// 7. QUẢN LÝ SINH VIÊN
// ==========================================
async function loadAdminStudents(page = 1, pageSize = 10) {
  const container = document.getElementById('adminStudentsContainer');
  if (!container) return;

  const search = document.getElementById('searchStudentInput')?.value || '';
  const maKhoa = document.getElementById('filterStudentKhoa')?.value || '';
  const maLop = document.getElementById('filterStudentLop')?.value || '';

  container.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải danh sách sinh viên...</div>`;

  try {
    const data = await api.get('/admin/students', { search, maKhoa, maLop, page, pageSize });
    const list = data.items || [];
    if (!list || list.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">Không tìm thấy sinh viên nào.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table" style="min-width: 1050px;">
          <thead>
            <tr>
              <th style="width: 110px;">Mã SV</th>
              <th style="min-width: 160px;">Họ và tên</th>
              <th style="min-width: 200px;">Lớp sinh hoạt</th>
              <th style="min-width: 180px;">Khoa</th>
              <th>Email</th>
              <th style="width: 120px;">Số điện thoại</th>
              <th style="width: 120px; text-align: center;">Trạng thái</th>
              <th style="width: 150px; text-align: center;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(s => `
              <tr>
                <td class="cell-nowrap"><strong>${s.maSinhVien}</strong></td>
                <td class="cell-nowrap"><strong>${s.hoTen}</strong></td>
                <td class="cell-nowrap"><span class="badge badge-info">${s.tenLop || s.maLop || '-'}</span></td>
                <td class="cell-nowrap">${s.tenKhoa}</td>
                <td class="cell-nowrap">${s.email || '-'}</td>
                <td class="cell-nowrap">${s.soDienThoai || '-'}</td>
                <td class="cell-nowrap" style="text-align: center;">${renderStatusBadge(s.trangThai)}</td>
                <td class="cell-nowrap" style="text-align: center;">
                  <button class="btn btn-secondary btn-sm" onclick="viewStudentDetailModal(${s.maSV}, '${s.maSinhVien}', '${s.hoTen}')">
                    Chi tiết & Học phí
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="admin-students-pagination"></div>
    `;

    renderPagination({
      containerId: 'admin-students-pagination',
      page: data.page,
      pageSize: data.pageSize,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      pageSizeOptions: [5, 10, 20, 50],
      onPageChange: (newPage, newPageSize) => {
        loadAdminStudents(newPage, newPageSize);
      }
    });
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Lỗi tải sinh viên: ${err.message}</div>`;
  }
}

// Xem chi tiết sinh viên trong modal
async function viewStudentDetailModal(maSV, maSinhVien, hoTen) {
  const modal = document.getElementById('adminStudentDetailModal');
  const title = document.getElementById('adminStudentDetailTitle');
  const body = document.getElementById('adminStudentDetailBody');
  if (!modal || !body) return;

  title.textContent = `Hồ sơ sinh viên: ${hoTen} (${maSinhVien})`;
  body.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải dữ liệu học vụ...</div>`;
  modal.classList.add('show');

  try {
    const [profile, tuition, grades] = await Promise.all([
      api.get(`/students/${maSV}/profile`).catch(() => null),
      api.get(`/students/${maSV}/tuition`).catch(() => []),
      api.get(`/students/${maSV}/grades`).catch(() => ({ summary: { gpa: 0, tongTinChiTichLuy: 0 }, grades: [] }))
    ]);

    body.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
        <div style="background: var(--color-surface-hover); padding: 0.875rem; border-radius: var(--radius-sm); font-size: 0.875rem; line-height: 1.6;">
          <strong>Thông tin cá nhân & Lớp:</strong><br>
          MSSV: <strong>${profile ? profile.maSinhVien : maSinhVien}</strong> (ID: #${maSV})<br>
          Họ tên: ${profile ? profile.hoTen : hoTen}<br>
          Lớp sinh hoạt: <strong>${profile ? (profile.tenLop || profile.maLop || '-') : '-'}</strong> (Khóa: ${profile ? (profile.khoaHoc || '-') : '-'})<br>
          Khoa: ${profile ? profile.tenKhoa : '-'}<br>
          Email: ${profile ? profile.email : '-'}<br>
          SĐT: ${profile ? profile.soDienThoai : '-'}
        </div>
        <div style="background: var(--color-surface-hover); padding: 0.875rem; border-radius: var(--radius-sm); font-size: 0.875rem; line-height: 1.6;">
          <strong>Kết quả & Tài khoản:</strong><br>
          GPA tích lũy: <strong style="color: var(--color-primary);">${grades.summary ? grades.summary.gpa.toFixed(2) : '0.00'}</strong><br>
          Tín chỉ tích lũy: <strong>${grades.summary ? grades.summary.tongTinChiTichLuy : 0} TC</strong><br>
          Tài khoản: <code>${profile ? profile.username : '-'}</code><br>
          Trạng thái TK: ${renderStatusBadge(profile ? profile.trangThaiTaiKhoan : 'ACTIVE')}
        </div>
      </div>

      <h4 style="font-size: 0.9375rem; font-weight: 700; margin: 1rem 0 0.5rem 0;">Tình trạng học phí:</h4>
      <div class="table-responsive">
        <table class="table" style="font-size: 0.8125rem;">
          <thead>
            <tr>
              <th>Học kỳ</th>
              <th style="text-align: right;">Phải nộp</th>
              <th style="text-align: right;">Đã trả</th>
              <th style="text-align: right;">Còn lại</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${(tuition || []).map(t => `
              <tr>
                <td>${t.tenHocKy} (${t.namHoc})</td>
                <td style="text-align: right;">${api.formatCurrency(t.tongTien)}</td>
                <td style="text-align: right; color: #16A34A;">${api.formatCurrency(t.soTienDaThanhToan)}</td>
                <td style="text-align: right; font-weight: 600; color: ${t.soTienConLai > 0 ? '#DC2626' : 'inherit'};">${api.formatCurrency(t.soTienConLai)}</td>
                <td>${renderStatusBadge(t.trangThai)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div style="color: var(--color-danger-text); padding: 1rem;">Lỗi tải thông tin: ${err.message}</div>`;
  }
}

function closeStudentDetailModal() {
  const modal = document.getElementById('adminStudentDetailModal');
  if (modal) modal.classList.remove('show');
}

// ==========================================
// 8. QUẢN LÝ LỚP HỌC PHẦN
// ==========================================
async function loadAdminClasses(page = 1, pageSize = 10) {
  const container = document.getElementById('adminClassesContainer');
  if (!container) return;

  const search = document.getElementById('searchClassInput')?.value || '';

  container.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải danh sách lớp học phần...</div>`;

  try {
    const data = await api.get('/admin/classes', { search, page, pageSize });
    const list = data.items || [];
    if (!list || list.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">Không tìm thấy lớp học phần nào.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table" style="min-width: 980px;">
          <thead>
            <tr>
              <th style="width: 120px;">Mã LHP</th>
              <th style="min-width: 220px;">Tên môn học & Lớp</th>
              <th style="width: 90px; text-align: center;">Số TC</th>
              <th style="min-width: 160px;">Giảng viên</th>
              <th style="min-width: 180px;">Lịch học & Phòng</th>
              <th style="width: 150px;">Sĩ số / Sức chứa</th>
              <th style="width: 120px; text-align: center;">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(c => {
              const percent = Math.min(100, Math.round((c.siSoHienTai / c.soLuongToiDa) * 100));
              const isFull = c.siSoHienTai >= c.soLuongToiDa;
              const schedule = c.thu ? `Thứ ${c.thu}, Tiết ${c.tietBatDau}-${c.tietBatDau + c.soTiet - 1} (${c.phongHoc})` : 'Chưa xếp lịch';

              return `
                <tr>
                  <td class="cell-nowrap"><strong>${c.maLHP}</strong></td>
                  <td>
                    <div style="font-weight: 600;">${c.tenMonHoc}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">${c.tenLHP}</div>
                  </td>
                  <td class="cell-nowrap" style="text-align: center;"><span class="badge badge-info">${c.soTinChi} TC</span></td>
                  <td class="cell-nowrap">${c.hoTenGiangVien}</td>
                  <td class="cell-nowrap">${schedule}</td>
                  <td style="min-width: 140px;">
                    <div style="font-size: 0.8125rem; font-weight: 600; display: flex; justify-content: space-between;">
                      <span>${c.siSoHienTai}/${c.soLuongToiDa}</span>
                      <span style="color: ${isFull ? '#DC2626' : 'inherit'};">${percent}%</span>
                    </div>
                    <div class="progress-container">
                      <div class="progress-bar ${isFull ? 'full' : ''}" style="width: ${percent}%;"></div>
                    </div>
                  </td>
                  <td class="cell-nowrap" style="text-align: center;">${renderStatusBadge(c.trangThai)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div id="admin-classes-pagination"></div>
    `;

    renderPagination({
      containerId: 'admin-classes-pagination',
      page: data.page,
      pageSize: data.pageSize,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      pageSizeOptions: [5, 10, 20, 50],
      onPageChange: (newPage, newPageSize) => {
        loadAdminClasses(newPage, newPageSize);
      }
    });
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Lỗi tải lớp học phần: ${err.message}</div>`;
  }
}

// ==========================================
// 9. QUẢN LÝ ĐĂNG KÝ TÍN CHỈ
// ==========================================
async function loadAdminRegistrations(page = 1, pageSize = 10) {
  const container = document.getElementById('adminRegistrationsContainer');
  if (!container) return;

  const search = document.getElementById('searchRegInput')?.value || '';
  const trangThai = document.getElementById('filterRegStatus')?.value || '';
  const maLop = document.getElementById('filterRegLop')?.value || '';

  container.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải danh sách đăng ký tín chỉ...</div>`;

  try {
    const data = await api.get('/admin/registrations', { search, trangThai, maLop, page, pageSize });
    const list = data.items || [];
    if (!list || list.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">Không tìm thấy dữ liệu đăng ký nào.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table" style="min-width: 1050px;">
          <thead>
            <tr>
              <th style="width: 90px;">Mã ĐK</th>
              <th style="min-width: 170px;">Sinh viên</th>
              <th style="min-width: 180px;">Lớp sinh hoạt</th>
              <th style="width: 120px;">Mã LHP</th>
              <th style="min-width: 200px;">Tên môn học</th>
              <th style="width: 90px; text-align: center;">Số TC</th>
              <th style="min-width: 170px;">Thời gian đăng ký</th>
              <th style="width: 120px; text-align: center;">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(r => `
              <tr>
                <td class="cell-nowrap">#${r.maDangKy}</td>
                <td class="cell-nowrap">
                  <strong>${r.hoTenSinhVien}</strong>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${r.maSinhVien} (ID #${r.maSV})</div>
                </td>
                <td class="cell-nowrap">
                  <span class="badge badge-info">${r.tenLop || r.maLop || '-'}</span>
                </td>
                <td class="cell-nowrap"><strong>${r.maLHP}</strong></td>
                <td>${r.tenMonHoc}</td>
                <td class="cell-nowrap" style="text-align: center;"><span class="badge badge-info">${r.soTinChi} TC</span></td>
                <td class="cell-nowrap">${new Date(r.ngayDangKy).toLocaleString('vi-VN')}</td>
                <td class="cell-nowrap" style="text-align: center;">
                  ${renderStatusBadge(r.trangThai)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="admin-registrations-pagination"></div>
    `;

    renderPagination({
      containerId: 'admin-registrations-pagination',
      page: data.page,
      pageSize: data.pageSize,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      pageSizeOptions: [5, 10, 20, 50],
      onPageChange: (newPage, newPageSize) => {
        loadAdminRegistrations(newPage, newPageSize);
      }
    });
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Lỗi tải đăng ký: ${err.message}</div>`;
  }
}

// ==========================================
// 10. QUẢN LÝ TÀI KHOẢN (V_TaiKhoanNguoiDung)
// ==========================================
async function loadAdminUsers(page = 1, pageSize = 10) {
  const container = document.getElementById('adminUsersContainer');
  if (!container) return;

  const vaiTro = document.getElementById('filterUserRole')?.value || '';
  const trangThai = document.getElementById('filterUserStatus')?.value || '';
  const maLop = document.getElementById('filterUserLop')?.value || '';
  const search = document.getElementById('searchUserInput')?.value || '';

  container.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải danh sách tài khoản...</div>`;

  try {
    const data = await api.get('/admin/users', { vaiTro, trangThai, search, maLop, page, pageSize });
    const list = data.items || [];
    if (!list || list.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">Không tìm thấy tài khoản nào.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table" style="min-width: 1050px;">
          <thead>
            <tr>
              <th style="width: 110px;">Username</th>
              <th style="min-width: 160px;">Họ và tên</th>
              <th style="min-width: 180px;">Lớp sinh hoạt</th>
              <th>Email</th>
              <th style="width: 120px; text-align: center;">Vai trò</th>
              <th style="width: 120px; text-align: center;">Trạng thái</th>
              <th style="min-width: 170px;">Lần đăng nhập cuối</th>
              <th style="width: 120px; text-align: center;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(u => `
              <tr>
                <td class="cell-nowrap"><code>${u.username}</code></td>
                <td class="cell-nowrap"><strong>${u.hoTen}</strong></td>
                <td class="cell-nowrap">
                  ${u.maLop ? `<span class="badge badge-info">${u.tenLop || u.maLop}</span>` : '<span style="color: var(--color-text-muted);">-</span>'}
                </td>
                <td class="cell-nowrap">${u.email}</td>
                <td class="cell-nowrap" style="text-align: center;">${renderRoleBadge(u.vaiTro)}</td>
                <td class="cell-nowrap" style="text-align: center;">
                  ${renderStatusBadge(u.trangThai)}
                </td>
                <td class="cell-nowrap">${u.lanDangNhapCuoi ? new Date(u.lanDangNhapCuoi).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</td>
                <td class="cell-nowrap" style="text-align: center;">
                  ${u.trangThai === 'ACTIVE' ? `
                    <button class="btn btn-danger btn-sm" onclick="toggleUserStatus('${u.username}', 'LOCKED')">
                      Khóa
                    </button>
                  ` : `
                    <button class="btn btn-success btn-sm" onclick="toggleUserStatus('${u.username}', 'ACTIVE')">
                      Mở khóa
                    </button>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="admin-users-pagination"></div>
    `;

    renderPagination({
      containerId: 'admin-users-pagination',
      page: data.page,
      pageSize: data.pageSize,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      pageSizeOptions: [5, 10, 20, 50],
      onPageChange: (newPage, newPageSize) => {
        loadAdminUsers(newPage, newPageSize);
      }
    });
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Lỗi tải tài khoản: ${err.message}</div>`;
  }
}

// Khóa hoặc mở khóa tài khoản
async function toggleUserStatus(username, newStatus) {
  const actionText = newStatus === 'LOCKED' ? 'KHÓA' : 'MỞ KHÓA';
  if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${username}"?`)) return;

  try {
    await api.patch(`/admin/users/${username}/status`, { trangThai: newStatus });
    showToast(`Đã ${actionText.toLowerCase()} tài khoản "${username}" thành công.`, 'success');
    await loadAdminUsers();
  } catch (err) {
    showToast(`Thao tác thất bại: ${err.message}`, 'danger');
  }
}

// ==========================================
// 11. AUDIT LOG (LOGHOATDONG)
// ==========================================
async function loadAdminAuditLogs(page = 1, pageSize = 10) {
  const container = document.getElementById('adminAuditLogsContainer');
  if (!container) return;

  container.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải nhật ký hoạt động hệ thống...</div>`;

  try {
    const data = await api.get('/admin/audit-logs', { page, pageSize });
    const list = data.items || [];
    if (!list || list.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">Chưa có nhật ký hoạt động nào.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table" style="font-size: 0.8125rem; min-width: 980px;">
          <thead>
            <tr>
              <th style="width: 80px;">Mã Log</th>
              <th style="width: 160px;">Thời gian</th>
              <th style="width: 150px;">Tài khoản</th>
              <th style="width: 110px;">Hành động</th>
              <th style="width: 140px;">Bảng tác động</th>
              <th style="width: 100px;">Khóa bản ghi</th>
              <th style="min-width: 280px;">Nội dung thay đổi</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(l => {
              const actionInfo = formatAuditAction(l.hanhDong);
              const tableLabel = formatAuditTable(l.tenBang);
              const userRoleLabel = formatRoleBadge(l.vaiTro).text;
              const diffContent = formatAuditContent(l.hanhDong, l.noiDungCu, l.noiDungMoi);

              return `
                <tr>
                  <td class="cell-nowrap"><strong>#${l.maLog}</strong></td>
                  <td class="cell-nowrap">${new Date(l.thoiGian).toLocaleString('vi-VN')}</td>
                  <td class="cell-nowrap"><strong>${l.username}</strong> <span style="font-size: 0.75rem; color: var(--color-text-muted);">(${userRoleLabel})</span></td>
                  <td class="cell-nowrap"><span class="badge ${actionInfo.badgeClass}">${actionInfo.text}</span></td>
                  <td class="cell-nowrap"><span class="badge badge-secondary" title="${l.tenBang}">${tableLabel}</span></td>
                  <td class="cell-nowrap">${l.khoaBanGhi ? `<code>${l.khoaBanGhi}</code>` : '-'}</td>
                  <td style="min-width: 280px; max-width: 450px;">
                    ${diffContent}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div id="admin-audit-logs-pagination"></div>
    `;

    renderPagination({
      containerId: 'admin-audit-logs-pagination',
      page: data.page,
      pageSize: data.pageSize,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      pageSizeOptions: [10, 20, 50],
      onPageChange: (newPage, newPageSize) => {
        loadAdminAuditLogs(newPage, newPageSize);
      }
    });
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Lỗi tải Audit Log: ${err.message}</div>`;
  }
}

// ==========================================
// 12. QUẢN LÝ LỚP SINH HOẠT (BẢNG LOP - 36 LỚP NIÊN CHẾ)
// ==========================================
let allAdministrativeClasses = [];

async function loadAdminAdministrativeClasses() {
  const container = document.getElementById('adminAdministrativeClassesContainer');
  if (!container) return;

  const search = document.getElementById('searchClassSHInput')?.value.trim().toLowerCase() || '';
  const maKhoa = document.getElementById('filterAdminClassShKhoa')?.value || '';
  const namNhapHoc = document.getElementById('filterAdminClassShNam')?.value || '';

  container.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải danh sách 36 lớp sinh hoạt...</div>`;

  try {
    const params = {};
    if (maKhoa) params.maKhoa = maKhoa;
    if (namNhapHoc) params.namNhapHoc = namNhapHoc;

    const list = await api.get('/classes', params);
    allAdministrativeClasses = list || [];

    let filtered = allAdministrativeClasses;
    if (search) {
      filtered = filtered.filter(c => 
        (c.maLop && c.maLop.toLowerCase().includes(search)) ||
        (c.tenLop && c.tenLop.toLowerCase().includes(search)) ||
        (c.tenKhoa && c.tenKhoa.toLowerCase().includes(search))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">Không tìm thấy lớp sinh hoạt nào phù hợp.</div>`;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
        ${filtered.map(c => `
          <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--color-border-subtle); transition: transform 0.15s ease, box-shadow 0.15s ease;">
            <div style="padding: 1rem 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                  <span style="font-family: monospace; font-weight: 700; font-size: 1.05rem; color: var(--color-primary-dark);">${c.maLop}</span>
                </div>
                <span class="badge badge-info">${c.khoaHoc || ('K' + (c.namNhapHoc % 100))}</span>
              </div>
              <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text);">
                ${c.tenLop}
              </h4>
              <div style="font-size: 0.8125rem; color: var(--color-text-muted); line-height: 1.6;">
                <div>Khoa: <strong style="color: var(--color-text);">${c.tenKhoa}</strong></div>
                <div>Năm nhập học: <strong>${c.namNhapHoc}</strong></div>
              </div>
            </div>
            <div style="padding: 0.75rem 1.25rem; background: var(--color-surface-hover); border-top: 1px solid var(--color-border-subtle); display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 0.8125rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>${c.soLuongSV ?? c.siSo ?? 0} sinh viên</span>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="viewClassDetailModal('${c.maLop}')">
                Danh sách SV &rarr;
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Lỗi tải lớp sinh hoạt: ${err.message}</div>`;
  }
}

let currentAdminClassStudents = [];
let currentAdminClassInfo = null;

// Khởi tạo sự kiện đóng modal chi tiết lớp (Escape và click ngoài backdrop)
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const classModal = document.getElementById('adminClassDetailModal');
      if (classModal && classModal.classList.contains('show')) {
        closeClassDetailModal();
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const classModal = document.getElementById('adminClassDetailModal');
    if (classModal) {
      classModal.addEventListener('click', (e) => {
        if (e.target === classModal) closeClassDetailModal();
      });
    }
  });
}

// Xem chi tiết lớp và danh sách sinh viên (UI/UX Pro Max)
async function viewClassDetailModal(maLop) {
  const modal = document.getElementById('adminClassDetailModal');
  const title = document.getElementById('adminClassDetailTitle');
  const countBadge = document.getElementById('adminClassStudentCountBadge');
  const body = document.getElementById('adminClassDetailBody');
  if (!modal || !body) return;

  // Khóa cuộn trang nền để cuộn modal mượt mà
  document.body.style.overflow = 'hidden';

  title.textContent = `Lớp sinh hoạt: ${maLop}`;
  if (countBadge) countBadge.textContent = 'Đang tải...';
  body.innerHTML = `<div style="text-align: center; padding: 2.5rem; color: var(--color-text-muted);">Đang tải danh sách sinh viên của lớp...</div>`;
  modal.classList.add('show');

  try {
    const data = await api.get(`/classes/${maLop}`);
    const lop = data.lop || data;
    currentAdminClassInfo = lop;
    currentAdminClassStudents = data.students || [];

    title.textContent = `${lop.tenLop} (${lop.maLop})`;
    if (countBadge) countBadge.textContent = `${currentAdminClassStudents.length} sinh viên`;

    body.innerHTML = `
      <div style="background: var(--color-surface-hover); padding: 0.875rem 1.25rem; border-radius: var(--radius-sm); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <div>Mã lớp: <strong>${lop.maLop}</strong> &bull; Khoa: <strong>${lop.tenKhoa}</strong></div>
          <div style="font-size: 0.8125rem; color: var(--color-text-muted);">Khóa học: ${lop.khoaHoc || '-'} &bull; Năm nhập học: ${lop.namNhapHoc || '-'}</div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <span class="badge badge-success" style="font-size: 0.875rem; padding: 0.35rem 0.75rem;">Sĩ số: ${lop.soLuongSV || currentAdminClassStudents.length} sinh viên</span>
        </div>
      </div>

      <!-- Thanh tìm kiếm tức thì sinh viên trong lớp -->
      <div style="margin-bottom: 1rem; position: relative;">
        <input 
          type="text" 
          id="adminClassStudentSearchInput" 
          class="form-control" 
          placeholder="Tìm kiếm theo MSSV, họ tên, email..." 
          style="padding-left: 2.25rem; font-size: 0.875rem;" 
          oninput="filterClassStudentsAdmin()"
        >
        <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none;">
          🔍
        </span>
      </div>

      <div id="adminClassStudentsTableContainer" class="table-responsive" style="max-height: 440px; overflow-y: auto;"></div>
    `;

    renderAdminClassStudentsTable(currentAdminClassStudents);
  } catch (err) {
    body.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem; text-align: center;">Lỗi tải chi tiết lớp: ${err.message}</div>`;
    if (countBadge) countBadge.textContent = 'Lỗi';
  }
}

// Render bảng sinh viên lớp
function renderAdminClassStudentsTable(students) {
  const container = document.getElementById('adminClassStudentsTableContainer');
  const countBadge = document.getElementById('adminClassStudentCountBadge');
  const summaryElem = document.getElementById('adminClassDetailFooterSummary');
  if (!container) return;

  if (countBadge) {
    if (students.length === currentAdminClassStudents.length) {
      countBadge.textContent = `${students.length} sinh viên`;
    } else {
      countBadge.textContent = `${students.length} / ${currentAdminClassStudents.length} sinh viên`;
    }
  }

  if (summaryElem) {
    summaryElem.textContent = `Hiển thị ${students.length} sinh viên. Cuộn chuột để xem chi tiết.`;
  }

  if (!students || students.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
        <div style="font-size: 1.25rem; margin-bottom: 0.5rem;">🔍 Không tìm thấy sinh viên</div>
        <div style="font-size: 0.875rem;">Không có sinh viên nào khớp với từ khóa tìm kiếm.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="table modal-table-sticky" style="font-size: 0.8125rem; min-width: 850px; margin-bottom: 0;">
      <thead>
        <tr>
          <th style="width: 50px; text-align: center;">#</th>
          <th style="width: 110px;">MSSV</th>
          <th style="min-width: 170px;">Họ và tên</th>
          <th style="width: 110px;">Ngày sinh</th>
          <th>Email</th>
          <th style="width: 120px;">SĐT</th>
          <th style="width: 120px; text-align: center;">Trạng thái</th>
          <th style="width: 90px; text-align: center;">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        ${students.map((s, idx) => `
          <tr>
            <td class="cell-nowrap" style="text-align: center; color: var(--color-text-muted);">${idx + 1}</td>
            <td class="cell-nowrap"><strong>${s.maSinhVien}</strong></td>
            <td class="cell-nowrap"><strong>${s.hoTen}</strong></td>
            <td class="cell-nowrap">${s.ngaySinh ? new Date(s.ngaySinh).toLocaleDateString('vi-VN') : '-'}</td>
            <td class="cell-nowrap">${s.email || '-'}</td>
            <td class="cell-nowrap">${s.soDienThoai || '-'}</td>
            <td class="cell-nowrap" style="text-align: center;">${renderStatusBadge(s.trangThai)}</td>
            <td class="cell-nowrap" style="text-align: center;">
              <button class="btn btn-secondary btn-sm" onclick="closeClassDetailModal(); viewStudentDetailModal(${s.maSV}, '${s.maSinhVien}', '${s.hoTen}');">
                Hồ sơ
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Lọc sinh viên trong lớp theo từ khóa
function filterClassStudentsAdmin() {
  const searchInput = document.getElementById('adminClassStudentSearchInput');
  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (!keyword) {
    renderAdminClassStudentsTable(currentAdminClassStudents);
    return;
  }

  const filtered = currentAdminClassStudents.filter(s => {
    const maSV = (s.maSinhVien || '').toLowerCase();
    const hoTen = (s.hoTen || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const sdt = (s.soDienThoai || '').toLowerCase();
    return maSV.includes(keyword) || hoTen.includes(keyword) || email.includes(keyword) || sdt.includes(keyword);
  });

  renderAdminClassStudentsTable(filtered);
}

function closeClassDetailModal() {
  const modal = document.getElementById('adminClassDetailModal');
  if (modal) modal.classList.remove('show');
  // Khôi phục cuộn trang nền
  document.body.style.overflow = '';
}

// ==========================================
// 12. ĐIỀU HƯỚNG TABS & GOM NHÓM DROPDOWN (UI/UX PRO MAX)
// ==========================================
function toggleTabDropdown(groupName, e) {
  if (e) e.stopPropagation();
  const targetGroup = document.querySelector(`.tab-group[data-group="${groupName}"]`);
  if (!targetGroup) return;

  const isOpen = targetGroup.classList.contains('open');
  // Đóng tất cả các nhóm khác
  document.querySelectorAll('.tab-group.open').forEach(g => g.classList.remove('open'));

  // Toggle nhóm hiện tại
  if (!isOpen) {
    targetGroup.classList.add('open');
  }
}

function switchAdminTab(tabName, clickedBtn) {
  // 1. Reset active tất cả nút và menu items
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-dropdown-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-dropdown-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.tab-group.open').forEach(g => g.classList.remove('open'));

  // 2. Chuyển đổi tab-pane
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  const activePane = document.getElementById(`tab-${tabName}`);
  if (activePane) activePane.classList.add('active');

  // 3. Highlight nút được chọn và nhóm cha tương ứng
  let targetElement = clickedBtn;
  if (!targetElement) {
    targetElement = document.querySelector(`.tab-btn[onclick*="'${tabName}'"], .tab-dropdown-item[onclick*="'${tabName}'"]`);
  }

  if (targetElement) {
    targetElement.classList.add('active');
    const parentGroup = targetElement.closest('.tab-group');
    if (parentGroup) {
      const parentBtn = parentGroup.querySelector('.tab-dropdown-btn');
      if (parentBtn) parentBtn.classList.add('active');
    }
  }

  // 4. Kích hoạt tải dữ liệu theo từng tab
  if (tabName === 'dashboard') {
    loadAdminDashboard();
  } else if (tabName === 'students') {
    loadAdminStudents();
  } else if (tabName === 'classes-sh') {
    loadAdminAdministrativeClasses();
  } else if (tabName === 'classes') {
    loadAdminClasses();
  } else if (tabName === 'registrations') {
    loadAdminRegistrations();
  } else if (tabName === 'pending') {
    loadPendingPayments();
  } else if (tabName === 'cashier') {
    // Tab quầy thu
  } else if (tabName === 'report') {
    loadTuitionReport();
  } else if (tabName === 'users') {
    loadAdminUsers();
  } else if (tabName === 'audit') {
    loadAdminAuditLogs();
  }
}

// Xử lý đóng dropdown khi click outside hoặc nhấn phím Escape
document.addEventListener('click', (e) => {
  if (!e.target.closest('.tab-group')) {
    document.querySelectorAll('.tab-group.open').forEach(g => g.classList.remove('open'));
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.tab-group.open').forEach(g => g.classList.remove('open'));
  }
});

// Xuất các hàm ra Global Window
window.initAdminPortal = initAdminPortal;
window.loadPendingPayments = loadPendingPayments;
window.confirmPaymentAdmin = confirmPaymentAdmin;
window.rejectPaymentAdmin = rejectPaymentAdmin;
window.loadTuitionReport = loadTuitionReport;
window.searchStudentTuitionAdmin = searchStudentTuitionAdmin;
window.openAdminCollectPayment = openAdminCollectPayment;
window.closeAdminPaymentModal = closeAdminPaymentModal;
window.submitAdminPayment = submitAdminPayment;

window.loadAdminDashboard = loadAdminDashboard;
window.loadAdminStudents = loadAdminStudents;
window.viewStudentDetailModal = viewStudentDetailModal;
window.closeStudentDetailModal = closeStudentDetailModal;
window.loadAdminAdministrativeClasses = loadAdminAdministrativeClasses;
window.viewClassDetailModal = viewClassDetailModal;
window.closeClassDetailModal = closeClassDetailModal;
window.filterClassStudentsAdmin = filterClassStudentsAdmin;
window.loadAdminClasses = loadAdminClasses;
window.loadAdminRegistrations = loadAdminRegistrations;
window.loadAdminUsers = loadAdminUsers;
window.toggleUserStatus = toggleUserStatus;
window.loadAdminAuditLogs = loadAdminAuditLogs;

window.toggleTabDropdown = toggleTabDropdown;
window.switchAdminTab = switchAdminTab;
