// frontend/js/admin.js
// Quản lý nghiệp vụ Báo cáo Tài chính Học vụ, Xác nhận thanh toán và Quản trị

let adminTuitionReportData = [];
let pendingPaymentsData = [];
let studentCurriculumOptions = null;
let adminNavigationRole = null;
let adminCurriculumCatalog = null;
let adminCurriculumPrograms = null;
let curriculumProgramEditorTrigger = null;

function setAdminNavigationRole(role) {
  adminNavigationRole = role;
  document.querySelectorAll('[data-required-role]').forEach(element => {
    element.hidden = element.dataset.requiredRole !== role;
  });
}

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
                  <div style="font-weight: 600;">${escapeHtml(p.hoTenSinhVien)}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${escapeHtml(p.maSinhVien)} (ID #${escapeHtml(p.maSV)})</div>
                </td>
                <td class="cell-nowrap">
                  <span class="badge badge-info">${escapeHtml(p.tenLop || p.maLop || '-')}</span>
                </td>
                <td class="cell-nowrap">${escapeHtml(p.tenHocKy)} (${escapeHtml(p.namHoc)})</td>
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
                    <button class="btn btn-sm btn-success" data-confirm-payment="${escapeHtml(p.maThanhToan)}">
                      Xác nhận
                    </button>
                    <button class="btn btn-sm btn-danger" data-reject-payment="${escapeHtml(p.maThanhToan)}">
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
    container.onclick = event => {
      const confirmButton = event.target.closest('[data-confirm-payment]');
      const rejectButton = event.target.closest('[data-reject-payment]');
      if (confirmButton) confirmPaymentAdmin(Number(confirmButton.dataset.confirmPayment));
      if (rejectButton) rejectPaymentAdmin(Number(rejectButton.dataset.rejectPayment));
    };
  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--color-danger-text);">
        Không thể tải danh sách giao dịch chờ xác nhận. ${escapeHtml(err.message)}
      </div>
    `;
  }
}

// 2. Xác nhận giao dịch thanh toán
async function confirmPaymentAdmin(maThanhToan) {
  if (!confirm(`Bạn có chắc chắn muốn XÁC NHẬN giao dịch #${maThanhToan} thành công?`)) return;

  try {
    const res = await api.post(`/payments/${maThanhToan}/confirm`);
    showToast(`Đã xác nhận giao dịch #${maThanhToan} thành công! Trạng thái học phí: ${formatStatusBadge(res.tuition.trangThai).text}.`, 'success');
    await loadPendingPayments();
    await loadTuitionReport();
  } catch (err) {
    showToast(`Không thể xác nhận giao dịch. ${err.message}`, 'danger');
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
    showToast(`Không thể từ chối giao dịch. ${err.message}`, 'danger');
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
        Không thể tải báo cáo học phí. ${err.message || 'Vui lòng kiểm tra kết nối và thử lại.'}
      </div>
    `;
    showToast(err.message || 'Không thể tải báo cáo học phí. Vui lòng thử lại sau.', 'danger');
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
                  <td><strong>${escapeHtml(r.tenHocKy)}</strong></td>
                  <td>${escapeHtml(r.namHoc)}</td>
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
    showToast('Vui lòng nhập mã sinh viên.', 'warning');
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
          Kết quả học phí: ${escapeHtml(list[0].hoTenSinhVien)} (${escapeHtml(list[0].maSinhVien)})
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
                  <td><strong>${escapeHtml(item.tenHocKy)}</strong> (${escapeHtml(item.namHoc)})</td>
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
                      <button class="btn btn-primary btn-sm" data-collect-payment="${escapeHtml(item.maHocPhi)}" data-student-name="${escapeHtml(item.hoTenSinhVien)}" data-amount="${escapeHtml(item.soTienConLai)}">
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
    resultContainer.onclick = event => {
      const button = event.target.closest('[data-collect-payment]');
      if (button) openAdminCollectPayment(Number(button.dataset.collectPayment), button.dataset.studentName, Number(button.dataset.amount));
    };
  } catch (err) {
    resultContainer.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--color-danger-text);">
        Không thể tra cứu thông tin sinh viên. ${err.message || 'Vui lòng kiểm tra thông tin và thử lại.'}
      </div>
    `;
    showToast(err.message || 'Không thể tra cứu thông tin sinh viên. Vui lòng thử lại sau.', 'danger');
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
    showToast('Vui lòng nhập số tiền thu lớn hơn 0.', 'warning');
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

    showToast(`Thu tiền và xác nhận thành công ${api.formatCurrency(amount)}! Trạng thái học phí: ${formatStatusBadge(confirmRes.tuition.trangThai).text}.`, 'success');
    closeAdminPaymentModal();

    await searchStudentTuitionAdmin();
    await loadTuitionReport();
  } catch (err) {
    showToast(err.message || 'Không thể ghi nhận khoản thu. Vui lòng thử lại sau.', 'danger');
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
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Không thể tải bảng tổng quan. ${escapeHtml(err.message)}</div>`;
  }
}

// ==========================================
// 7. QUẢN LÝ SINH VIÊN
// ==========================================
let studentClassOptionsRequest = 0;
let studentListRequest = 0;

async function onStudentKhoaChange() {
  const faculty = document.getElementById('filterStudentKhoa');
  const classSelect = document.getElementById('filterStudentLop');
  const feedback = document.getElementById('studentClassFilterStatus');
  const retryButton = document.getElementById('retryStudentClassesBtn');
  if (!classSelect) return;
  const requestId = ++studentClassOptionsRequest;
  const previousClass = classSelect.value;
  classSelect.disabled = true;
  classSelect.innerHTML = '<option value="">Đang tải danh sách lớp...</option>';
  if (feedback) feedback.textContent = '';
  if (retryButton) retryButton.hidden = true;
  try {
    const classes = await api.get('/classes', faculty?.value ? { maKhoa: faculty.value } : {});
    if (requestId !== studentClassOptionsRequest) return;
    classSelect.innerHTML = '<option value="">-- Tất cả lớp sinh hoạt --</option>';
    (classes || []).forEach(item => {
      const option = document.createElement('option');
      option.value = item.maLop;
      option.textContent = `${item.maLop} - ${item.tenLop} (${item.soLuongSV} SV)`;
      classSelect.appendChild(option);
    });
    classSelect.value = (classes || []).some(item => item.maLop === previousClass) ? previousClass : '';
    classSelect.disabled = false;
    await loadAdminStudents();
  } catch (error) {
    if (requestId !== studentClassOptionsRequest) return;
    classSelect.innerHTML = '<option value="">-- Không tải được danh sách lớp --</option>';
    classSelect.value = '';
    classSelect.disabled = true;
    if (feedback) feedback.textContent = `Không thể tải danh sách lớp. ${error.message}`;
    if (retryButton) retryButton.hidden = false;
    await loadAdminStudents();
  }
}

async function loadAdminStudents(page = 1, pageSize = 10) {
  const container = document.getElementById('adminStudentsContainer');
  if (!container) return;

  const search = document.getElementById('searchStudentInput')?.value || '';
  const maKhoa = document.getElementById('filterStudentKhoa')?.value || '';
  const maLop = document.getElementById('filterStudentLop')?.value || '';
  const trangThai = document.getElementById('filterStudentStatus')?.value || '';
  const requestId = ++studentListRequest;

  container.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải danh sách sinh viên...</div>`;

  try {
    const data = await api.get('/admin/students', { search, maKhoa, maLop, trangThai, page, pageSize });
    if (requestId !== studentListRequest) return;
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
              <th style="width: 220px; text-align: center;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(s => {
              const studentJson = escapeHtml(JSON.stringify(s));
              return `
              <tr>
                <td class="cell-nowrap"><strong>${escapeHtml(s.maSinhVien)}</strong></td>
                <td class="cell-nowrap"><strong>${escapeHtml(s.hoTen)}</strong></td>
                <td class="cell-nowrap"><span class="badge badge-info">${escapeHtml(s.tenLop || s.maLop || '-')}</span></td>
                <td class="cell-nowrap">${escapeHtml(s.tenKhoa)}</td>
                <td class="cell-nowrap">${escapeHtml(s.email || '-')}</td>
                <td class="cell-nowrap">${escapeHtml(s.soDienThoai || '-')}</td>
                <td class="cell-nowrap" style="text-align: center;">${renderStatusBadge(s.trangThai)}</td>
                <td class="cell-nowrap" style="text-align: center;">
                  <button class="btn btn-secondary btn-sm js-view-student" data-id="${escapeHtml(s.maSV)}" data-mssv="${escapeHtml(s.maSinhVien)}" data-name="${escapeHtml(s.hoTen)}" title="Xem chi tiết & học phí">
                    Chi tiết
                  </button>
                  <button class="btn btn-primary btn-sm js-edit-student" data-student="${studentJson}" title="Chỉnh sửa thông tin">
                    Sửa
                  </button>
                  <button class="btn btn-danger btn-sm js-delete-student" data-id="${escapeHtml(s.maSV)}" data-name="${escapeHtml(s.hoTen)}" data-mssv="${escapeHtml(s.maSinhVien)}" title="Xóa hoặc cho thôi học">
                    Xóa
                  </button>
                </td>
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
      <div id="admin-students-pagination"></div>
    `;

    container.onclick = event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.matches('.js-view-student')) viewStudentDetailModal(Number(button.dataset.id), button.dataset.mssv, button.dataset.name);
      if (button.matches('.js-edit-student')) openStudentModal('edit', JSON.parse(button.dataset.student));
      if (button.matches('.js-delete-student')) confirmDeleteStudent(Number(button.dataset.id), button.dataset.name, button.dataset.mssv);
    };

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
    if (requestId !== studentListRequest) return;
    container.textContent = `Không thể tải danh sách sinh viên. ${err.message}`;
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
    body.innerHTML = `<div style="color: var(--color-danger-text); padding: 1rem;">Không thể tải thông tin sinh viên. ${escapeHtml(err.message)}</div>`;
  }
}

function closeStudentDetailModal() {
  const modal = document.getElementById('adminStudentDetailModal');
  if (modal) modal.classList.remove('show');
}

// ==========================================
// 7.1. CRUD SINH VIÊN (THÊM, SỬA, XÓA) - UI/UX PRO MAX
// ==========================================
async function openStudentModal(mode = 'create', student = null) {
  const modal = document.getElementById('adminStudentFormModal');
  const title = document.getElementById('adminStudentFormTitle');
  const form = document.getElementById('adminStudentForm');
  const mssvInput = document.getElementById('studentFormMSSV');
  const khoaSelect = document.getElementById('studentFormKhoa');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('studentFormMaSV').value = '';

  await populateFaculties('studentFormKhoa', '-- Chọn khoa --');

  if (mode === 'create') {
    title.textContent = 'Thêm sinh viên mới';
    mssvInput.readOnly = false;
    document.getElementById('studentFormTrangThai').value = 'DANG_HOC';
    document.getElementById('studentFormLop').innerHTML = '<option value="">-- Chưa phân lớp --</option>';
    document.getElementById('studentFormMaCTDT').innerHTML = '<option value="">-- Chọn khoa trước --</option>';
  } else if (mode === 'edit' && student) {
    title.textContent = `Chỉnh sửa sinh viên: ${student.hoTen} (${student.maSinhVien})`;
    document.getElementById('studentFormMaSV').value = student.maSV;
    mssvInput.value = student.maSinhVien;
    mssvInput.readOnly = true;
    document.getElementById('studentFormHoTen').value = student.hoTen;
    document.getElementById('studentFormNgaySinh').value = student.ngaySinh ? String(student.ngaySinh).substring(0, 10) : '';
    document.getElementById('studentFormEmail').value = student.email || '';
    document.getElementById('studentFormSDT').value = student.soDienThoai || '';
    document.getElementById('studentFormTrangThai').value = student.trangThai || 'DANG_HOC';
    khoaSelect.value = student.maKhoa || '';

    await onStudentFormKhoaChange(student.maLop);
    await updateStudentCurriculumOptions(student.maCTDT);
  }

  modal.classList.add('show');
}

function closeStudentFormModal() {
  const modal = document.getElementById('adminStudentFormModal');
  if (modal) modal.classList.remove('show');
}

async function onStudentFormKhoaChange(preselectedLop = '') {
  const khoaSelect = document.getElementById('studentFormKhoa');
  const lopSelect = document.getElementById('studentFormLop');
  if (!khoaSelect || !lopSelect) return;

  const maKhoa = khoaSelect.value;
  if (!maKhoa) {
    lopSelect.innerHTML = '<option value="">-- Chọn khoa trước --</option>';
    return;
  }

  try {
    const classes = await api.getClasses();
    const filtered = classes.filter(c => c.maKhoa === maKhoa);
    lopSelect.innerHTML = '<option value="">-- Chưa phân lớp --</option>' +
      filtered.map(c => `<option value="${escapeHtml(c.maLop)}" data-year="${escapeHtml(c.namNhapHoc)}">${escapeHtml(c.tenLop || c.maLop)}</option>`).join('');

    if (preselectedLop) lopSelect.value = preselectedLop;
    await updateStudentCurriculumOptions();
  } catch (err) {
    lopSelect.innerHTML = '<option value="">Không thể tải danh sách lớp</option>';
  }
}

async function updateStudentCurriculumOptions(preselectedMaCTDT = '') {
  const select = document.getElementById('studentFormMaCTDT');
  const faculty = document.getElementById('studentFormKhoa')?.value || '';
  const classSelect = document.getElementById('studentFormLop');
  if (!select) return;
  const year = classSelect?.selectedOptions?.[0]?.dataset?.year || '';
  try {
    if (!studentCurriculumOptions) studentCurriculumOptions = await api.get('/admin/curriculum-options');
    const options = studentCurriculumOptions.filter(item => item.maKhoa === faculty && (!year || Number(item.namTuyenSinh) === Number(year)));
    select.innerHTML = '<option value="">-- Chọn chương trình đào tạo --</option>' + options.map(item =>
      `<option value="${escapeHtml(item.maCTDT)}">${escapeHtml(item.tenCTDT)} · Khóa ${escapeHtml(item.namTuyenSinh)}</option>`
    ).join('');
    if (preselectedMaCTDT) select.value = preselectedMaCTDT;
  } catch (err) {
    select.innerHTML = '<option value="">Không thể tải chương trình đào tạo</option>';
  }
}

function onStudentFormClassChange() {
  updateStudentCurriculumOptions();
}

async function handleSaveStudent(event) {
  event.preventDefault();
  clearStudentFormErrors();
  const maSV = document.getElementById('studentFormMaSV').value;
  const isEdit = Boolean(maSV);

  const payload = {
    maSinhVien: document.getElementById('studentFormMSSV').value.trim(),
    hoTen: document.getElementById('studentFormHoTen').value.trim(),
    ngaySinh: document.getElementById('studentFormNgaySinh').value || null,
    email: document.getElementById('studentFormEmail').value.trim() || null,
    soDienThoai: document.getElementById('studentFormSDT').value.trim() || null,
    maKhoa: document.getElementById('studentFormKhoa').value,
    maCTDT: document.getElementById('studentFormMaCTDT').value,
    maLop: document.getElementById('studentFormLop').value || null,
    trangThai: document.getElementById('studentFormTrangThai').value
  };

  const submitBtn = document.getElementById('btnSubmitStudentForm');
  const originalText = submitBtn ? submitBtn.textContent : 'Lưu hồ sơ';

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Đang lưu...';
    }

    if (isEdit) {
      await api.put(`/admin/students/${maSV}`, payload);
      showToast(`Đã cập nhật sinh viên ${payload.hoTen} thành công!`, 'success');
    } else {
      await api.post('/admin/students', payload);
      showToast(`Đã thêm mới sinh viên ${payload.hoTen} (${payload.maSinhVien}) thành công!`, 'success');
    }

    closeStudentFormModal();
    await loadAdminStudents();
  } catch (err) {
    showStudentFormErrors(err.errors || [], err.message);
    showToast(`Không thể lưu hồ sơ sinh viên. ${err.message}`, 'danger');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

const STUDENT_FORM_FIELDS = {
  maSinhVien: 'studentFormMSSV', hoTen: 'studentFormHoTen', ngaySinh: 'studentFormNgaySinh',
  email: 'studentFormEmail', soDienThoai: 'studentFormSDT', maKhoa: 'studentFormKhoa', maLop: 'studentFormLop', maCTDT: 'studentFormMaCTDT',
  unique: 'studentFormMSSV', username: 'studentFormMSSV'
};
const STUDENT_FORM_FIELD_LABELS = {
  maSinhVien: 'Mã sinh viên', hoTen: 'Họ tên', ngaySinh: 'Ngày sinh', email: 'Email',
  soDienThoai: 'Số điện thoại', maKhoa: 'Khoa', maLop: 'Lớp sinh hoạt', maCTDT: 'Chương trình đào tạo',
  unique: 'Mã sinh viên', username: 'Tên đăng nhập'
};

function clearStudentFormErrors() {
  const summary = document.getElementById('studentFormErrors');
  if (summary) summary.hidden = true;
  const list = document.getElementById('studentFormErrorsList');
  if (list) list.replaceChildren();
  Object.values(STUDENT_FORM_FIELDS).forEach(id => {
    const input = document.getElementById(id);
    const inline = document.getElementById(`${id}-error`);
    if (input) { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
    if (inline) inline.textContent = '';
  });
}

function showStudentFormErrors(errors, fallbackMessage) {
  const summary = document.getElementById('studentFormErrors');
  const list = document.getElementById('studentFormErrorsList');
  if (!summary || !list) return;
  const visibleErrors = [];
  for (const item of errors) {
    const field = String(item.field || '').split('.').pop();
    const inputId = STUDENT_FORM_FIELDS[field];
    const message = String(item.message || fallbackMessage || 'Dữ liệu không hợp lệ.');
    const input = inputId && document.getElementById(inputId);
    const inline = inputId && document.getElementById(`${inputId}-error`);
    if (input && inline) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', `${inputId}-error`);
      inline.textContent = message;
    }
    visibleErrors.push({ input, label: input?.labels?.[0]?.textContent?.trim() || STUDENT_FORM_FIELD_LABELS[field] || 'Thông tin', message });
  }
  if (!visibleErrors.length) visibleErrors.push({ label: 'Lỗi', message: fallbackMessage || 'Không thể lưu hồ sơ sinh viên.' });
  list.replaceChildren(...visibleErrors.map(({ input, label, message }) => {
    const li = document.createElement('li');
    if (input) {
      const link = document.createElement('a');
      link.href = `#${input.id}`;
      link.textContent = `${label}: ${message}`;
      link.addEventListener('click', () => input.focus());
      li.append(link);
    } else li.textContent = `${label}: ${message}`;
    return li;
  }));
  summary.hidden = false;
  summary.focus();
}

async function confirmDeleteStudent(maSV, hoTen, maSinhVien) {
  if (!confirm(`Bạn có chắc chắn muốn xóa/chuyển trạng thái thôi học cho sinh viên "${hoTen}" (${maSinhVien})?`)) {
    return;
  }

  try {
    const res = await api.delete(`/admin/students/${maSV}`);
    showToast(res.message || `Đã xử lý hồ sơ sinh viên ${maSinhVien} thành công!`, 'success');
    await loadAdminStudents();
  } catch (err) {
    showToast(`Không thể xử lý hồ sơ sinh viên. ${err.message}`, 'danger');
  }
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
              <th style="width: 150px; text-align: center;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(c => {
              const percent = Math.min(100, Math.round((c.siSoHienTai / c.soLuongToiDa) * 100));
              const isFull = c.siSoHienTai >= c.soLuongToiDa;
              const schedules = c.schedules || (c.thu ? [{ thu: c.thu, tietBatDau: c.tietBatDau, soTiet: c.soTiet, phongHoc: c.phongHoc }] : []);
              const schedule = schedules.length ? schedules.map(item => `Thứ ${escapeHtml(item.thu)}, tiết ${escapeHtml(item.tietBatDau)}-${escapeHtml(item.tietBatDau + item.soTiet - 1)} (${escapeHtml(item.phongHoc)})`).join('<br>') : 'Chưa xếp lịch';

              return `
                <tr>
                  <td class="cell-nowrap"><strong>${escapeHtml(c.maLHP)}</strong></td>
                  <td>
                    <div style="font-weight: 600;">${escapeHtml(c.tenMonHoc)}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted);">${escapeHtml(c.tenLHP)}</div>
                  </td>
                  <td class="cell-nowrap" style="text-align: center;"><span class="badge badge-info">${c.soTinChi} TC</span></td>
                  <td class="cell-nowrap">${escapeHtml(c.hoTenGiangVien)}</td>
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
                  <td class="cell-nowrap" style="text-align:center;">
                    <button type="button" class="btn btn-secondary btn-sm js-edit-class" onclick="openClassSectionModal('edit', '${escapeHtml(c.maLHP)}')" aria-label="Sửa lớp ${escapeHtml(c.maLHP)}">Sửa</button>
                    <button type="button" class="btn btn-danger btn-sm js-delete-class" onclick="deleteClassSection('${escapeHtml(c.maLHP)}')" aria-label="Xóa lớp ${escapeHtml(c.maLHP)}">Xóa</button>
                  </td>
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
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Không thể tải danh sách lớp học phần. ${escapeHtml(err.message)}</div>`;
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
  const maSinhVien = document.getElementById('filterRegStudentCode')?.value.trim() || '';
  const maLHP = document.getElementById('filterRegCourseSection')?.value.trim() || '';

  container.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải danh sách đăng ký tín chỉ...</div>`;

  try {
    const data = await api.get('/admin/registrations', { search, maSinhVien, maLHP, maLop, trangThai, page, pageSize });
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
                  <strong>${escapeHtml(r.hoTenSinhVien)}</strong>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${escapeHtml(r.maSinhVien)} (ID #${escapeHtml(r.maSV)})</div>
                </td>
                <td class="cell-nowrap">
                  <span class="badge badge-info">${escapeHtml(r.tenLop || r.maLop || '-')}</span>
                </td>
                <td class="cell-nowrap"><strong>${r.maLHP}</strong></td>
                <td>${escapeHtml(r.tenMonHoc)}</td>
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
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Không thể tải danh sách đăng ký. ${escapeHtml(err.message)}</div>`;
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
                <td class="cell-nowrap"><code>${escapeHtml(u.username)}</code></td>
                <td class="cell-nowrap"><strong>${escapeHtml(u.hoTen)}</strong></td>
                <td class="cell-nowrap">
                  ${u.maLop ? `<span class="badge badge-info">${escapeHtml(u.tenLop || u.maLop)}</span>` : '<span style="color: var(--color-text-muted);">-</span>'}
                </td>
                <td class="cell-nowrap">${escapeHtml(u.email)}</td>
                <td class="cell-nowrap" style="text-align: center;">${renderRoleBadge(u.vaiTro)}</td>
                <td class="cell-nowrap" style="text-align: center;">
                  ${renderStatusBadge(u.trangThai)}
                </td>
                <td class="cell-nowrap">${u.lanDangNhapCuoi ? new Date(u.lanDangNhapCuoi).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</td>
                <td class="cell-nowrap" style="text-align: center;">
                  ${u.trangThai === 'ACTIVE' ? `
                    <button class="btn btn-danger btn-sm js-toggle-user" data-username="${escapeHtml(u.username)}" data-status="LOCKED">
                      Khóa
                    </button>
                  ` : `
                    <button class="btn btn-success btn-sm js-toggle-user" data-username="${escapeHtml(u.username)}" data-status="ACTIVE">
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

    container.onclick = event => {
      const button = event.target.closest('.js-toggle-user');
      if (button) toggleUserStatus(button.dataset.username, button.dataset.status);
    };

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
    container.textContent = `Không thể tải danh sách tài khoản. ${err.message}`;
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
    showToast(`Không thể cập nhật trạng thái tài khoản. ${err.message}`, 'danger');
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
    const data = await api.get('/admin/audit-logs', {
      maTaiKhoan: document.getElementById('filterAuditAccount')?.value || '',
      tuNgay: document.getElementById('filterAuditFrom')?.value || '',
      denNgay: document.getElementById('filterAuditTo')?.value || '', page, pageSize
    });
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
                <td class="cell-nowrap"><strong>${escapeHtml(l.username)}</strong> <span style="font-size: 0.75rem; color: var(--color-text-muted);">(${escapeHtml(userRoleLabel)})</span></td>
                  <td class="cell-nowrap"><span class="badge ${actionInfo.badgeClass}">${actionInfo.text}</span></td>
                  <td class="cell-nowrap"><span class="badge badge-secondary" title="${escapeHtml(l.tenBang)}">${tableLabel}</span></td>
                  <td class="cell-nowrap">${l.khoaBanGhi ? `<code>${escapeHtml(l.khoaBanGhi)}</code>` : '-'}</td>
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
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Không thể tải nhật ký hoạt động. ${escapeHtml(err.message)}</div>`;
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
                  <span style="font-family: monospace; font-weight: 700; font-size: 1.05rem; color: var(--color-primary-dark);">${escapeHtml(c.maLop)}</span>
                </div>
                <span class="badge badge-info">${escapeHtml(c.khoaHoc || ('K' + (c.namNhapHoc % 100)))}</span>
              </div>
              <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-text);">
                ${escapeHtml(c.tenLop)}
              </h4>
              <div style="font-size: 0.8125rem; color: var(--color-text-muted); line-height: 1.6;">
                <div>Khoa: <strong style="color: var(--color-text);">${escapeHtml(c.tenKhoa)}</strong></div>
                <div>Năm nhập học: <strong>${escapeHtml(c.namNhapHoc)}</strong></div>
              </div>
            </div>
            <div class="homeroom-class-footer" style="padding: 0.75rem 1.25rem; background: var(--color-surface-hover); border-top: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.8125rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>${c.soLuongSV ?? c.siSo ?? 0} sinh viên</span>
              </div>
              <div class="homeroom-class-actions">
                <button class="btn btn-secondary btn-sm js-view-admin-class" data-class-id="${escapeHtml(c.maLop)}">Danh sách SV</button>
                <button class="btn btn-secondary btn-sm" type="button" onclick="openDepartmentEditor('class','edit','${escapeHtml(c.maLop)}')" aria-label="Sửa lớp ${escapeHtml(c.maLop)}">Sửa</button>
                <button class="btn btn-danger btn-sm" type="button" onclick="deleteDepartmentEntity('class','${escapeHtml(c.maLop)}')" aria-label="Xóa lớp ${escapeHtml(c.maLop)}">Xóa</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    container.onclick = event => {
      const button = event.target.closest('.js-view-admin-class');
      if (button) viewClassDetailModal(button.dataset.classId);
    };
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem;">Không thể tải danh sách lớp sinh hoạt. ${escapeHtml(err.message)}</div>`;
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
          <div>Mã lớp: <strong>${escapeHtml(lop.maLop)}</strong> &bull; Khoa: <strong>${escapeHtml(lop.tenKhoa)}</strong></div>
          <div style="font-size: 0.8125rem; color: var(--color-text-muted);">Khóa học: ${escapeHtml(lop.khoaHoc || '-')} &bull; Năm nhập học: ${escapeHtml(lop.namNhapHoc || '-')}</div>
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
    body.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem; text-align: center;">Không thể tải thông tin lớp. ${escapeHtml(err.message)}</div>`;
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
            <td class="cell-nowrap"><strong>${escapeHtml(s.maSinhVien)}</strong></td>
            <td class="cell-nowrap"><strong>${escapeHtml(s.hoTen)}</strong></td>
            <td class="cell-nowrap">${s.ngaySinh ? new Date(s.ngaySinh).toLocaleDateString('vi-VN') : '-'}</td>
            <td class="cell-nowrap">${escapeHtml(s.email || '-')}</td>
            <td class="cell-nowrap">${escapeHtml(s.soDienThoai || '-')}</td>
            <td class="cell-nowrap" style="text-align: center;">${renderStatusBadge(s.trangThai)}</td>
            <td class="cell-nowrap" style="text-align: center;">
              <button class="btn btn-secondary btn-sm js-view-class-student" data-id="${escapeHtml(s.maSV)}" data-mssv="${escapeHtml(s.maSinhVien)}" data-name="${escapeHtml(s.hoTen)}">
                Hồ sơ
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  container.onclick = event => {
    const button = event.target.closest('.js-view-class-student');
    if (button) {
      closeClassDetailModal();
      viewStudentDetailModal(Number(button.dataset.id), button.dataset.mssv, button.dataset.name);
    }
  };
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
  document.querySelectorAll('.tab-group.open').forEach(g => setTabDropdownOpen(g, false));

  // Toggle nhóm hiện tại
  if (!isOpen) {
    setTabDropdownOpen(targetGroup, true);
  } else {
    setTabDropdownOpen(targetGroup, false);
  }
}

function setTabDropdownOpen(group, isOpen) {
  group.classList.toggle('open', isOpen);
  const button = group.querySelector('.tab-dropdown-btn');
  if (button) button.setAttribute('aria-expanded', String(isOpen));
}

let adminEditorTrigger = null;
let curriculumPrerequisiteDrafts = [];
let classScheduleDrafts = [];

const curriculumCourseFields = {
  'course.maMonHoc': 'curriculumCourseMaMonHoc',
  'course.maKhoa': 'curriculumCourseMaKhoa', 'course.tenMonHoc': 'curriculumCourseTenMonHoc',
  'course.soTinChi': 'curriculumCourseSoTinChi', 'course.soTietLyThuyet': 'curriculumCourseSoTietLyThuyet',
  'course.soTietThucHanh': 'curriculumCourseSoTietThucHanh', 'placement.hocKyDuKien': 'curriculumCourseHocKy',
  'placement.loaiMon': 'curriculumCourseLoaiMon', 'placement.thuTu': 'curriculumCourseThuTu',
  'prerequisites': 'curriculumPrerequisiteSelect', 'chuTrinh': 'curriculumPrerequisiteSelect',
  'unique': 'curriculumCourseMaMonHoc', 'foreignKey': 'curriculumCourseMaMonHoc'
};

function showAdminEditorErrors(summaryId, listId, errors, message, fieldMap) {
  const summary = document.getElementById(summaryId);
  const list = document.getElementById(listId);
  if (!summary || !list) return;
  list.replaceChildren();
  const entries = errors.length ? errors : [{ field: 'server', message }];
  for (const error of entries) {
    const item = document.createElement('li');
    const field = String(error.field || 'server').split('.').pop();
    const inputId = fieldMap[error.field] || fieldMap[field];
    const input = inputId && document.getElementById(inputId);
    const label = input?.labels?.[0]?.textContent || (field === 'chuTrinh' ? 'Môn tiên quyết' : 'Thông tin');
    item.textContent = `${label}: ${error.message || message}`;
    list.appendChild(item);
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', `${inputId}-error`);
      let inline = document.getElementById(`${inputId}-error`);
      if (!inline && input.parentElement) {
        inline = document.createElement('small');
        inline.id = `${inputId}-error`;
        inline.className = 'field-error';
        input.parentElement.appendChild(inline);
      }
      if (inline) inline.textContent = error.message || message || 'Dữ liệu không hợp lệ.';
    }
  }
  summary.hidden = false;
  summary.focus();
}

function clearAdminEditorErrors(summaryId, listId, fieldMap = {}) {
  const summary = document.getElementById(summaryId);
  const list = document.getElementById(listId);
  if (summary) summary.hidden = true;
  if (list) list.replaceChildren();
  [...new Set(Object.values(fieldMap))].forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
    const inline = document.getElementById(`${inputId}-error`);
    if (inline) inline.textContent = '';
  });
}

async function openCurriculumCourseModal({ mode = 'create', maCTDT, maMonHoc } = {}) {
  const modal = document.getElementById('adminCurriculumCourseModal');
  if (!modal || !maCTDT) return showToast('Hãy chọn một chương trình đào tạo trước.', 'warning');
  try {
    const [courses, faculties] = await Promise.all([api.get('/admin/courses'), api.get('/admin/faculties')]);
    let item = mode === 'edit' ? adminCurriculumCatalog?.find(row => row.maCTDT === maCTDT && row.maMonHoc === maMonHoc) : null;
    if (mode === 'edit' && !item) item = (await api.get('/admin/curriculums', { maCTDT })).find(row => row.maMonHoc === maMonHoc);
    if (mode === 'edit' && !item) return showToast('Không tìm thấy môn trong chương trình đào tạo.', 'danger');

    adminEditorTrigger = document.activeElement;
    document.getElementById('curriculumCourseFormTitle').textContent = mode === 'edit' ? 'Chỉnh sửa môn trong CTĐT' : 'Thêm môn vào CTĐT';
    document.getElementById('curriculumCourseMaCTDT').value = maCTDT;
    document.getElementById('curriculumCourseOriginalId').value = item?.maMonHoc || '';
    const code = document.getElementById('curriculumCourseMaMonHoc');
    code.value = item?.maMonHoc || '';
    code.readOnly = mode === 'edit';
    const faculty = document.getElementById('curriculumCourseMaKhoa');
    faculty.innerHTML = '<option value="">-- Chọn khoa --</option>' + faculties.map(row => `<option value="${escapeHtml(row.maKhoa)}">${escapeHtml(row.tenKhoa)} (${escapeHtml(row.maKhoa)})</option>`).join('');
    faculty.value = item?.maKhoaMon || '';
    document.getElementById('curriculumCourseTenMonHoc').value = item?.tenMonHoc || '';
    document.getElementById('curriculumCourseSoTinChi').value = item?.soTinChi ?? '';
    document.getElementById('curriculumCourseSoTietLyThuyet').value = item?.soTietLyThuyet ?? '';
    document.getElementById('curriculumCourseSoTietThucHanh').value = item?.soTietThucHanh ?? '';
    document.getElementById('curriculumCourseMoTa').value = item?.moTa || '';
    document.getElementById('curriculumCourseTrangThai').value = String(item?.trangThaiMon ?? true);
    document.getElementById('curriculumCourseHocKy').value = item?.hocKyDuKien ?? 1;
    document.getElementById('curriculumCourseLoaiMon').value = item?.loaiMon || 'BAT_BUOC';
    document.getElementById('curriculumCourseThuTu').value = item?.thuTu ?? '';
    const prerequisiteSelect = document.getElementById('curriculumPrerequisiteSelect');
    prerequisiteSelect.innerHTML = '<option value="">-- Chọn môn --</option>' + courses.filter(row => row.maMonHoc !== maMonHoc).map(row => `<option value="${escapeHtml(row.maMonHoc)}">${escapeHtml(row.maMonHoc)} · ${escapeHtml(row.tenMonHoc)}</option>`).join('');
    curriculumPrerequisiteDrafts = (item?.hocPhanTienQuyetChiTiet || []).map(row => ({ maMonTienQuyet: row.maMonHoc, tenMonHoc: row.tenMonHoc, mucDo: row.mucDo }));
    renderCurriculumPrerequisiteDrafts();
    clearAdminEditorErrors('curriculumCourseFormErrors', 'curriculumCourseFormErrorsList', curriculumCourseFields);
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    code.focus();
  } catch (error) {
    showToast(`Không thể mở biểu mẫu môn học. ${error.message}`, 'danger');
  }
}

function openCurriculumCourseFromButton(button) {
  return openCurriculumCourseModal({ mode: 'edit', maCTDT: button.dataset.maCtdt, maMonHoc: button.dataset.maMonHoc });
}

function renderCurriculumPrerequisiteDrafts() {
  const list = document.getElementById('curriculumPrerequisiteList');
  if (!list) return;
  list.innerHTML = curriculumPrerequisiteDrafts.map((row, index) => `<li><span><code>${escapeHtml(row.maMonTienQuyet)}</code> · ${escapeHtml(row.tenMonHoc || row.maMonTienQuyet)} — ${row.mucDo === 'BAT_BUOC' ? 'Bắt buộc' : 'Khuyến nghị'}</span><button class="btn btn-secondary btn-sm" type="button" onclick="removeCurriculumPrerequisite(${index})" aria-label="Gỡ môn tiên quyết ${escapeHtml(row.maMonTienQuyet)}">Gỡ</button></li>`).join('') || '<li>Chưa có môn tiên quyết.</li>';
}

function addCurriculumPrerequisite() {
  const id = document.getElementById('curriculumPrerequisiteSelect')?.value;
  if (!id) return;
  const courseId = document.getElementById('curriculumCourseMaMonHoc')?.value.trim();
  if (id === courseId) return showToast('Môn học không thể tự làm tiên quyết cho chính nó.', 'danger');
  if (curriculumPrerequisiteDrafts.some(row => row.maMonTienQuyet === id)) return showToast('Môn tiên quyết này đã có trong danh sách.', 'warning');
  const option = [...document.getElementById('curriculumPrerequisiteSelect').options].find(row => row.value === id);
  curriculumPrerequisiteDrafts.push({ maMonTienQuyet: id, tenMonHoc: option?.textContent?.split(' · ').slice(1).join(' · ') || id, mucDo: document.getElementById('curriculumPrerequisiteLevel').value });
  renderCurriculumPrerequisiteDrafts();
}

function removeCurriculumPrerequisite(index) {
  curriculumPrerequisiteDrafts.splice(index, 1);
  renderCurriculumPrerequisiteDrafts();
}

function closeCurriculumCourseModal() {
  const modal = document.getElementById('adminCurriculumCourseModal');
  if (modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
  adminEditorTrigger?.focus?.();
  adminEditorTrigger = null;
}

async function handleSaveCurriculumCourse(event) {
  event.preventDefault();
  clearAdminEditorErrors('curriculumCourseFormErrors', 'curriculumCourseFormErrorsList', curriculumCourseFields);
  const maCTDT = document.getElementById('curriculumCourseMaCTDT').value;
  const originalId = document.getElementById('curriculumCourseOriginalId').value;
  const course = {
    maMonHoc: document.getElementById('curriculumCourseMaMonHoc').value.trim(),
    maKhoa: document.getElementById('curriculumCourseMaKhoa').value,
    tenMonHoc: document.getElementById('curriculumCourseTenMonHoc').value.trim(),
    soTinChi: Number(document.getElementById('curriculumCourseSoTinChi').value),
    soTietLyThuyet: Number(document.getElementById('curriculumCourseSoTietLyThuyet').value),
    soTietThucHanh: Number(document.getElementById('curriculumCourseSoTietThucHanh').value),
    moTa: document.getElementById('curriculumCourseMoTa').value.trim() || null,
    trangThai: document.getElementById('curriculumCourseTrangThai').value === 'true'
  };
  const payload = {
    course,
    placement: {
      hocKyDuKien: Number(document.getElementById('curriculumCourseHocKy').value),
      loaiMon: document.getElementById('curriculumCourseLoaiMon').value,
      thuTu: document.getElementById('curriculumCourseThuTu').value ? Number(document.getElementById('curriculumCourseThuTu').value) : null
    },
    prerequisites: curriculumPrerequisiteDrafts.map(({ maMonTienQuyet, mucDo }) => ({ maMonTienQuyet, mucDo }))
  };
  const button = document.getElementById('btnSaveCurriculumCourse');
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Đang lưu…';
  try {
    if (originalId) await api.put(`/admin/curriculums/${maCTDT}/courses/${originalId}`, payload);
    else await api.post(`/admin/curriculums/${maCTDT}/courses`, payload);
    adminCurriculumCatalog = null;
    closeCurriculumCourseModal();
    showToast('Đã lưu môn học và chương trình đào tạo.', 'success');
    await loadAdminCurriculums();
  } catch (error) {
    showAdminEditorErrors('curriculumCourseFormErrors', 'curriculumCourseFormErrorsList', error.errors || [], error.message, curriculumCourseFields);
    showToast(`Không thể lưu môn học. ${error.message}`, 'danger');
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function removeCurriculumCourse(maCTDT, maMonHoc) {
  if (!window.confirm(`Gỡ môn ${maMonHoc} khỏi CTĐT này? Môn vẫn còn trong danh mục và CTĐT khác.`)) return;
  try {
    await api.delete(`/admin/curriculums/${maCTDT}/courses/${maMonHoc}`);
    adminCurriculumCatalog = null;
    showToast('Đã gỡ môn khỏi chương trình đào tạo.', 'success');
    await loadAdminCurriculums();
  } catch (error) { showToast(`Không thể gỡ môn. ${error.message}`, 'danger'); }
}

const curriculumProgramFields = {
  maCTDT: 'curriculumProgramMaCTDT', maNganh: 'curriculumProgramMaNganh',
  tenCTDT: 'curriculumProgramTenCTDT', namTuyenSinh: 'curriculumProgramNamTuyenSinh',
  tongTinChiYeuCau: 'curriculumProgramTongTinChi', thoiGianDaoTao: 'curriculumProgramThoiGianDaoTao'
};

async function openCurriculumProgramModal({ mode = 'create', maCTDT = '' } = {}) {
  const modal = document.getElementById('adminCurriculumProgramModal');
  if (!modal) return;
  try {
    let item = null;
    if (mode === 'edit') {
      if (!adminCurriculumPrograms) adminCurriculumPrograms = await api.get('/admin/curriculum-programs');
      item = adminCurriculumPrograms.find(program => program.maCTDT === maCTDT);
      if (!item) return showToast('Không tìm thấy chương trình đào tạo. Hãy tải lại danh sách.', 'danger');
    }
    adminDepartmentMajors = await api.get('/admin/majors');
    const majorSelect = document.getElementById('curriculumProgramMaNganh');
    majorSelect.innerHTML = '<option value="">-- Chọn ngành --</option>' + adminDepartmentMajors.map(major =>
      `<option value="${escapeHtml(major.maNganh)}">${escapeHtml(major.tenNganh)} · ${escapeHtml(major.tenKhoa)}${major.trangThai ? '' : ' (Ngừng hoạt động)'}</option>`
    ).join('');
    document.getElementById('curriculumProgramFormTitle').textContent = mode === 'edit' ? 'Chỉnh sửa CTĐT' : 'Tạo CTĐT';
    document.getElementById('curriculumProgramOriginalId').value = item?.maCTDT || '';
    const code = document.getElementById('curriculumProgramMaCTDT');
    code.value = item?.maCTDT || '';
    code.readOnly = mode === 'edit';
    majorSelect.value = item?.maNganh || '';
    document.getElementById('curriculumProgramTenCTDT').value = item?.tenCTDT || '';
    document.getElementById('curriculumProgramNamTuyenSinh').value = item?.namTuyenSinh ?? '';
    document.getElementById('curriculumProgramTongTinChi').value = item?.tongTinChiYeuCau ?? '';
    document.getElementById('curriculumProgramThoiGianDaoTao').value = item?.thoiGianDaoTao ?? '';
    document.getElementById('curriculumProgramTrangThai').value = String(item?.trangThai ?? true);
    updateCurriculumCohortPreview();
    clearAdminEditorErrors('curriculumProgramFormErrors', 'curriculumProgramFormErrorsList', curriculumProgramFields);
    curriculumProgramEditorTrigger = document.activeElement;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    (mode === 'edit' ? document.getElementById('curriculumProgramTenCTDT') : code).focus();
  } catch (error) {
    showToast(`Không thể mở biểu mẫu CTĐT. ${error.message}`, 'danger');
  }
}

function updateCurriculumCohortPreview() {
  const year = Number(document.getElementById('curriculumProgramNamTuyenSinh')?.value);
  const duration = Number(document.getElementById('curriculumProgramThoiGianDaoTao')?.value);
  const preview = document.getElementById('curriculumProgramKhoaHoc');
  if (preview) preview.value = year >= 2000 && duration > 0 ? `${year}-${year + duration}` : '';
}

function openSelectedCurriculumProgramEditor() {
  const maCTDT = document.getElementById('filterCurriculumProgram')?.value;
  return openCurriculumProgramModal({ mode: 'edit', maCTDT });
}

function closeCurriculumProgramModal() {
  const modal = document.getElementById('adminCurriculumProgramModal');
  if (modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
  curriculumProgramEditorTrigger?.focus?.();
  curriculumProgramEditorTrigger = null;
}

function resetCurriculumProgramFilters(selectedId = '') {
  ['filterCurriculumFaculty', 'filterCurriculumMajor', 'filterCurriculumYear', 'filterCurriculumTerm',
    'filterCurriculumCourseSearch', 'filterCurriculumPrerequisiteSearch'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
  const program = document.getElementById('filterCurriculumProgram');
  if (program) program.value = selectedId;
  const prerequisite = document.getElementById('filterCurriculumPrerequisiteSearch');
  if (prerequisite) delete prerequisite.dataset.selectedCode;
}

async function handleSaveCurriculumProgram(event) {
  event.preventDefault();
  clearAdminEditorErrors('curriculumProgramFormErrors', 'curriculumProgramFormErrorsList', curriculumProgramFields);
  const originalId = document.getElementById('curriculumProgramOriginalId').value;
  const maCTDT = document.getElementById('curriculumProgramMaCTDT').value.trim();
  const payload = {
    maNganh: document.getElementById('curriculumProgramMaNganh').value,
    tenCTDT: document.getElementById('curriculumProgramTenCTDT').value.trim(),
    namTuyenSinh: Number(document.getElementById('curriculumProgramNamTuyenSinh').value),
    tongTinChiYeuCau: Number(document.getElementById('curriculumProgramTongTinChi').value),
    thoiGianDaoTao: Number(document.getElementById('curriculumProgramThoiGianDaoTao').value),
    trangThai: document.getElementById('curriculumProgramTrangThai').value === 'true'
  };
  const button = document.getElementById('btnSaveCurriculumProgram');
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Đang lưu…';
  try {
    if (originalId) await api.put(`/admin/curriculum-programs/${encodeURIComponent(originalId)}`, payload);
    else await api.post('/admin/curriculum-programs', { maCTDT, ...payload });
    adminCurriculumCatalog = null;
    adminCurriculumPrograms = null;
    resetCurriculumProgramFilters(maCTDT);
    closeCurriculumProgramModal();
    showToast('Đã lưu chương trình đào tạo.', 'success');
    await loadAdminCurriculums();
  } catch (error) {
    showAdminEditorErrors('curriculumProgramFormErrors', 'curriculumProgramFormErrorsList', error.errors || [], error.message, curriculumProgramFields);
    showToast(`Không thể lưu CTĐT. ${error.message}`, 'danger');
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function deleteSelectedCurriculumProgram() {
  const maCTDT = document.getElementById('filterCurriculumProgram')?.value;
  const item = adminCurriculumPrograms?.find(program => program.maCTDT === maCTDT);
  if (!item) return showToast('Hãy chọn một chương trình đào tạo trước.', 'warning');
  if (!window.confirm(`Xóa “${item.tenCTDT}” (${maCTDT})? Liên kết môn trong CTĐT sẽ bị gỡ, môn vẫn còn trong danh mục. Chỉ xóa được khi không còn hồ sơ sinh viên liên kết.`)) return;
  try {
    await api.delete(`/admin/curriculum-programs/${encodeURIComponent(maCTDT)}`);
    adminCurriculumCatalog = null;
    adminCurriculumPrograms = null;
    resetCurriculumProgramFilters();
    showToast('Đã xóa chương trình đào tạo.', 'success');
    await loadAdminCurriculums();
  } catch (error) {
    showToast(`Không thể xóa CTĐT. ${error.message}`, 'danger');
  }
}

let adminCourseOptions = [];
let adminSemesterOptions = [];
let adminLecturerOptions = [];
let lecturerOptionsRequest = 0;

async function loadClassLecturerOptions(selectedId = null) {
  const lecturer = document.getElementById('classFormMaGiangVien');
  if (!lecturer) return;
  const requestId = ++lecturerOptionsRequest;
  const previous = selectedId ?? lecturer.value;
  const maKhoa = document.getElementById('classFormLecturerFaculty')?.value || '';
  const trangThai = document.getElementById('classFormLecturerStatus')?.value || '';
  lecturer.disabled = true;
  try {
    const options = await api.get('/admin/lecturers/options', { maKhoa, trangThai });
    if (requestId !== lecturerOptionsRequest) return;
    adminLecturerOptions = options || [];
    const lecturerStatusLabel = { DANG_CONG_TAC: 'Đang công tác', TAM_NGHI: 'Tạm nghỉ', NGHI_VIEC: 'Nghỉ việc' };
    lecturer.innerHTML = '<option value="">Chưa phân công</option>' + adminLecturerOptions.map(row => `<option value="${row.maGV}">${escapeHtml(row.hoTen)} · ${escapeHtml(row.maKhoa)} · ${lecturerStatusLabel[row.trangThai] || escapeHtml(row.trangThai)}</option>`).join('');
    lecturer.value = adminLecturerOptions.some(row => String(row.maGV) === String(previous)) ? String(previous) : '';
    lecturer.disabled = false;
  } catch (error) {
    if (requestId !== lecturerOptionsRequest) return;
    lecturer.innerHTML = '<option value="">Không tải được giảng viên</option>';
    lecturer.value = '';
    lecturer.disabled = true;
    showToast(`Không thể tải danh sách giảng viên. ${error.message}`, 'danger');
  }
}

async function openClassSectionModal(mode = 'create', maLHP = '') {
  const modal = document.getElementById('adminClassFormModal');
  if (!modal) return;
  try {
    [adminCourseOptions, adminSemesterOptions] = await Promise.all([
      api.get('/admin/courses'), api.getSemesters()
    ]);
    const item = mode === 'edit' ? await api.get(`/admin/classes/${maLHP}`) : null;
    adminEditorTrigger = document.activeElement;
    document.getElementById('classFormTitle').textContent = mode === 'edit' ? 'Chỉnh sửa lớp học phần' : 'Tạo lớp học phần';
    document.getElementById('classFormOriginalId').value = item?.maLHP || '';
    const id = document.getElementById('classFormMaLHP');
    id.value = item?.maLHP || '';
    id.readOnly = mode === 'edit';
    const course = document.getElementById('classFormMaMonHoc');
    course.innerHTML = '<option value="">-- Chọn môn học --</option>' + adminCourseOptions.map(row => `<option value="${escapeHtml(row.maMonHoc)}">${escapeHtml(row.maMonHoc)} · ${escapeHtml(row.tenMonHoc)}</option>`).join('');
    course.value = item?.maMonHoc || '';
    const semester = document.getElementById('classFormMaHocKy');
    semester.innerHTML = '<option value="">-- Chọn học kỳ --</option>' + adminSemesterOptions.map(row => `<option value="${row.maHocKy}">${escapeHtml(row.tenHocKy)} · ${escapeHtml(row.namHoc)}</option>`).join('');
    semester.value = item?.maHocKy ?? '';
    const lecturerFaculty = document.getElementById('classFormLecturerFaculty');
    if (lecturerFaculty) {
      const faculties = await api.get('/admin/faculties');
      lecturerFaculty.innerHTML = '<option value="">Tất cả khoa</option>' + faculties.map(row => `<option value="${escapeHtml(row.maKhoa)}">${escapeHtml(row.tenKhoa)} (${escapeHtml(row.maKhoa)})</option>`).join('');
      lecturerFaculty.value = '';
    }
    const lecturerStatus = document.getElementById('classFormLecturerStatus');
    if (lecturerStatus) lecturerStatus.value = '';
    await loadClassLecturerOptions(item?.maGiangVien ?? '');
    document.getElementById('classFormTenLHP').value = item?.tenLHP || '';
    document.getElementById('classFormSoLuongToiDa').value = item?.soLuongToiDa ?? 50;
    document.getElementById('classFormTrangThai').value = item?.trangThai || 'DA_KHOA';
    classScheduleDrafts = (item?.schedules || []).map(row => ({ ...row }));
    renderClassScheduleDrafts();
    clearAdminEditorErrors('classFormErrors', 'classFormErrorsList', classFormFields);
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    id.focus();
  } catch (error) { showToast(`Không thể mở biểu mẫu lớp học phần. ${error.message}`, 'danger'); }
}

function addClassScheduleDraft() {
  const schedule = {
    thu: Number(document.getElementById('classScheduleDay').value),
    tietBatDau: Number(document.getElementById('classScheduleStart').value),
    soTiet: Number(document.getElementById('classScheduleCount').value),
    phongHoc: document.getElementById('classScheduleRoom').value.trim()
  };
  if (!schedule.phongHoc || schedule.tietBatDau + schedule.soTiet - 1 > 12) return showToast('Hãy nhập phòng học và khoảng tiết kết thúc không muộn hơn tiết 12.', 'warning');
  classScheduleDrafts.push(schedule);
  renderClassScheduleDrafts();
}

function renderClassScheduleDrafts() {
  const list = document.getElementById('classScheduleDraftList');
  if (!list) return;
  list.innerHTML = classScheduleDrafts.map((item, index) => `<li><span>Thứ ${escapeHtml(item.thu)}, tiết ${escapeHtml(item.tietBatDau)}-${escapeHtml(item.tietBatDau + item.soTiet - 1)} · ${escapeHtml(item.phongHoc)}</span><button type="button" class="btn btn-secondary btn-sm" onclick="removeClassScheduleDraft(${index})" aria-label="Gỡ buổi học thứ ${escapeHtml(item.thu)}">Gỡ</button></li>`).join('') || '<li>Chưa xếp lịch.</li>';
}

function removeClassScheduleDraft(index) {
  classScheduleDrafts.splice(index, 1);
  renderClassScheduleDrafts();
}

function closeClassSectionModal() {
  const modal = document.getElementById('adminClassFormModal');
  if (modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
  adminEditorTrigger?.focus?.();
  adminEditorTrigger = null;
}

const classFormFields = {
  maLHP: 'classFormMaLHP', maMonHoc: 'classFormMaMonHoc', maHocKy: 'classFormMaHocKy',
  maGiangVien: 'classFormMaGiangVien', tenLHP: 'classFormTenLHP', soLuongToiDa: 'classFormSoLuongToiDa',
  phongHoc: 'classScheduleRoom', thu: 'classScheduleDay', tietBatDau: 'classScheduleStart',
  soTiet: 'classScheduleCount', lichHoc: 'classScheduleRoom', siSo: 'classFormSoLuongToiDa'
};

async function handleSaveClassSection(event) {
  event.preventDefault();
  clearAdminEditorErrors('classFormErrors', 'classFormErrorsList', classFormFields);
  const originalId = document.getElementById('classFormOriginalId').value;
  const maLHP = document.getElementById('classFormMaLHP').value.trim();
  const payload = {
    maLHP,
    maMonHoc: document.getElementById('classFormMaMonHoc').value,
    maHocKy: Number(document.getElementById('classFormMaHocKy').value),
    maGiangVien: document.getElementById('classFormMaGiangVien').value ? Number(document.getElementById('classFormMaGiangVien').value) : null,
    tenLHP: document.getElementById('classFormTenLHP').value.trim(),
    soLuongToiDa: Number(document.getElementById('classFormSoLuongToiDa').value),
    trangThai: document.getElementById('classFormTrangThai').value,
    schedules: classScheduleDrafts.map(({ thu, tietBatDau, soTiet, phongHoc }) => ({ thu, tietBatDau, soTiet, phongHoc }))
  };
  const button = document.getElementById('btnSaveClassForm');
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Đang lưu…';
  try {
    if (originalId) await api.put(`/admin/classes/${originalId}`, payload);
    else await api.post('/admin/classes', payload);
    closeClassSectionModal();
    showToast('Đã lưu lớp học phần và lịch học.', 'success');
    await loadAdminClasses();
  } catch (error) {
    showAdminEditorErrors('classFormErrors', 'classFormErrorsList', error.errors || [], error.message, classFormFields);
    showToast(`Không thể lưu lớp học phần. ${error.message}`, 'danger');
  } finally { button.disabled = false; button.textContent = originalText; }
}

async function deleteClassSection(maLHP) {
  if (!window.confirm(`Xóa lớp ${maLHP} và các lịch học? Lớp có lịch sử đăng ký không thể xóa.`)) return;
  try {
    await api.delete(`/admin/classes/${maLHP}`);
    showToast('Đã xóa lớp học phần.', 'success');
    await loadAdminClasses();
  } catch (error) { showToast(`Không thể xóa lớp học phần. ${error.message}`, 'danger'); }
}

let curriculumListRequest = 0;
async function loadAdminCurriculums() {
  const container = document.getElementById('adminCurriculumContainer');
  if (!container) return;
  const count = document.getElementById('curriculumResultCount');
  const requestId = ++curriculumListRequest;
  try {
    if (!adminCurriculumCatalog || !adminCurriculumPrograms) {
      const [catalog, programs] = await Promise.all([
        adminCurriculumCatalog || api.get('/admin/curriculums'),
        adminCurriculumPrograms || api.get('/admin/curriculum-programs')
      ]);
      adminCurriculumCatalog = catalog;
      adminCurriculumPrograms = programs;
    }
    if (requestId !== curriculumListRequest) return;
    const setOptions = (id, label, options) => {
      const select = document.getElementById(id);
      if (!select) return '';
      const selected = select.value;
      select.innerHTML = `<option value="">${label}</option>` + options.map(({ value, text }) => `<option value="${escapeHtml(value)}">${escapeHtml(text)}</option>`).join('');
      select.value = options.some(option => String(option.value) === selected) ? selected : '';
      return select.value;
    };
    const faculties = [...new Map(adminCurriculumPrograms.map(item => [item.maKhoa, item])).values()];
    const maKhoa = setOptions('filterCurriculumFaculty', '-- Tất cả khoa --', faculties.map(item => ({ value: item.maKhoa, text: `${item.tenKhoa} (${item.maKhoa})` })));
    const facultyRows = adminCurriculumPrograms.filter(item => !maKhoa || item.maKhoa === maKhoa);
    const majors = [...new Map(facultyRows.map(item => [item.maNganh, item])).values()];
    const maNganh = setOptions('filterCurriculumMajor', '-- Tất cả ngành --', majors.map(item => ({ value: item.maNganh, text: `${item.nganh} (${item.maNganh})` })));
    const majorRows = facultyRows.filter(item => !maNganh || item.maNganh === maNganh);
    const years = [...new Set(majorRows.map(item => item.namTuyenSinh))].sort((a, b) => b - a);
    const namTuyenSinh = setOptions('filterCurriculumYear', '-- Tất cả khóa tuyển sinh --', years.map(year => ({ value: year, text: `Khóa ${year}` })));
    const yearRows = majorRows.filter(item => !namTuyenSinh || String(item.namTuyenSinh) === namTuyenSinh);
    const maCTDT = setOptions('filterCurriculumProgram', '-- Tất cả chương trình --', yearRows.map(item => ({ value: item.maCTDT, text: `${item.tenCTDT} (${item.khoaHoc})` })));
    const curriculumRows = adminCurriculumCatalog.filter(item => yearRows.some(program => program.maCTDT === item.maCTDT));
    const maxTerms = Math.max(0, ...yearRows.map(item => Number(item.thoiGianDaoTao) || 0)) * 2;
    const terms = Array.from({ length: maxTerms }, (_, index) => index + 1);
    setOptions('filterCurriculumTerm', '-- Tất cả học kỳ --', terms.map(term => ({ value: term, text: `Học kỳ ${term}` })));
    const hocKyDuKien = document.getElementById('filterCurriculumTerm')?.value || '';
    const scopedCourseRows = curriculumRows.filter(item => item.maMonHoc && (!hocKyDuKien || String(item.hocKyDuKien) === String(hocKyDuKien)));
    const prerequisites = [...new Map(scopedCourseRows.flatMap(item => item.hocPhanTienQuyetChiTiet || []).map(item => [item.maMonHoc, item])).values()];
    const prerequisiteInput = document.getElementById('filterCurriculumPrerequisiteSearch');
    const prerequisiteOptions = document.getElementById('curriculumPrerequisiteOptions');
    const filterFeedback = document.getElementById('curriculumFilterFeedback');
    const previouslySelectedPrerequisite = prerequisiteInput?.dataset.selectedCode || '';
    if (prerequisiteOptions) {
      prerequisiteOptions.innerHTML = prerequisites.map(item => `<option value="${escapeHtml(item.maMonHoc)} · ${escapeHtml(item.tenMonHoc)}"></option>`).join('');
    }
    if (previouslySelectedPrerequisite && !prerequisites.some(item => item.maMonHoc === previouslySelectedPrerequisite)) {
      prerequisiteInput.value = '';
      delete prerequisiteInput.dataset.selectedCode;
    }
    const prerequisiteSearchText = prerequisiteInput?.value.trim() || '';
    const normalize = value => String(value || '').trim().toLocaleLowerCase('vi');
    const selectedPrerequisite = prerequisiteSearchText
      ? prerequisites.find(item => [item.maMonHoc, item.tenMonHoc, `${item.maMonHoc} · ${item.tenMonHoc}`].some(value => normalize(value) === normalize(prerequisiteSearchText)))
      : null;
    if (prerequisiteSearchText && !selectedPrerequisite) {
      if (filterFeedback) filterFeedback.textContent = 'Hãy chọn một môn tiên quyết trong danh sách gợi ý.';
      return;
    }
    if (filterFeedback) filterFeedback.textContent = '';
    if (prerequisiteInput) {
      if (selectedPrerequisite) prerequisiteInput.dataset.selectedCode = selectedPrerequisite.maMonHoc;
      else delete prerequisiteInput.dataset.selectedCode;
    }
    const filters = {
      maKhoa: document.getElementById('filterCurriculumFaculty')?.value || '',
      maNganh: document.getElementById('filterCurriculumMajor')?.value || '',
      namTuyenSinh: document.getElementById('filterCurriculumYear')?.value || '',
      maCTDT: document.getElementById('filterCurriculumProgram')?.value || '',
      hocKyDuKien,
      tuKhoaMonHoc: document.getElementById('filterCurriculumCourseSearch')?.value.trim() || '',
      maMonTienQuyet: selectedPrerequisite?.maMonHoc || ''
    };
    const addCourseButton = document.getElementById('addCurriculumCourseBtn');
    const addCourseHint = document.getElementById('addCurriculumCourseHint');
    const selectedProgram = yearRows.find(item => item.maCTDT === filters.maCTDT);
    const editProgramButton = document.getElementById('editCurriculumProgramBtn');
    const deleteProgramButton = document.getElementById('deleteCurriculumProgramBtn');
    if (addCourseButton) addCourseButton.disabled = !filters.maCTDT;
    if (editProgramButton) editProgramButton.hidden = !selectedProgram;
    if (deleteProgramButton) deleteProgramButton.hidden = !selectedProgram;
    if (addCourseHint) {
      addCourseHint.textContent = selectedProgram
        ? `Đang chọn: ${selectedProgram.tenCTDT} (${selectedProgram.maCTDT}).`
        : 'Chọn một chương trình đào tạo ở bộ lọc bên dưới để bật thao tác thêm môn.';
    }
    container.innerHTML = '<div style="text-align:center;padding:1.5rem;">Đang tải chương trình đào tạo...</div>';
    const rows = Object.values(filters).some(Boolean) ? await api.get('/admin/curriculums', filters) : adminCurriculumCatalog;
    if (requestId !== curriculumListRequest) return;
    const resultPrograms = new Set(rows.map(item => item.maCTDT));
    count.textContent = `${resultPrograms.size} chương trình`;
    if (!rows.length) {
      container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--color-text-muted);">Không tìm thấy chương trình phù hợp.</div>';
      return;
    }
    const showProgramContext = !filters.maCTDT;
    const showTermContext = !filters.hocKyDuKien;
    const columns = [
      ...(showProgramContext ? [{ label: 'Chương trình', weight: 11 }] : []),
      ...(showTermContext ? [{ label: 'Học kỳ', weight: 6 }] : []),
      { label: 'Môn học', weight: 16 }, { label: 'Khoa phụ trách', weight: 9 }, { label: 'Khối lượng', weight: 8 },
      { label: 'Mô tả', weight: 12 }, { label: 'Học phần tiên quyết', weight: 12 }, { label: 'Loại môn / thứ tự', weight: 8 },
      { label: 'Trạng thái môn', weight: 6 }, { label: 'Trạng thái CTĐT', weight: 6 }, { label: 'Thao tác', weight: 6 }
    ];
    const totalWeight = columns.reduce((total, column) => total + column.weight, 0);
    const prerequisiteContent = item => {
      const prerequisites = item.hocPhanTienQuyetChiTiet || [];
      if (!prerequisites.length) return item.hocPhanTienQuyet ? escapeHtml(item.hocPhanTienQuyet) : '—';
      return `<ul class="curriculum-prerequisite-list">${prerequisites.map(prerequisite => {
        const level = prerequisite.mucDo === 'BAT_BUOC' ? 'Bắt buộc' : prerequisite.mucDo === 'KHUYEN_NGHI' ? 'Khuyến nghị' : 'Chưa xác định';
        return `<li><span><code>${escapeHtml(prerequisite.maMonHoc)}</code> · ${escapeHtml(prerequisite.tenMonHoc)}</span><small>${level}</small></li>`;
      }).join('')}</ul>`;
    };
    const emptyRows = rows.filter(item => !item.maMonHoc).map(item => `<tr class="curriculum-empty-row"><td colspan="${columns.length}">CTĐT <strong>${escapeHtml(item.tenCTDT)}</strong>${filters.hocKyDuKien ? ` · Học kỳ ${escapeHtml(filters.hocKyDuKien)}` : ''}: chưa có môn học trong kỳ này.</td></tr>`).join('');
    const courseRows = rows.filter(item => item.maMonHoc).map(item => {
      const cells = [
        ...(showProgramContext ? [{ label: 'Chương trình', value: `<strong>${escapeHtml(item.tenCTDT)}</strong><br><code>${escapeHtml(item.maCTDT)}</code><br><small>${escapeHtml(item.khoaHoc)}</small>` }] : []),
        ...(showTermContext ? [{ label: 'Học kỳ', value: item.hocKyDuKien ? `Học kỳ ${escapeHtml(item.hocKyDuKien)}` : '—' }] : []),
        { label: 'Môn học', value: `<code>${escapeHtml(item.maMonHoc)}</code><strong>${escapeHtml(item.tenMonHoc)}</strong>` },
        { label: 'Khoa phụ trách', value: item.tenKhoaMon ? `${escapeHtml(item.tenKhoaMon)}<br><small>${escapeHtml(item.maKhoaMon)}</small>` : '—' },
        { label: 'Khối lượng', value: `<strong>${escapeHtml(item.soTinChi ?? '—')} tín chỉ</strong><small>Lý thuyết: ${escapeHtml(item.soTietLyThuyet ?? '—')} tiết<br>Thực hành: ${escapeHtml(item.soTietThucHanh ?? '—')} tiết</small>` },
        { label: 'Mô tả', value: item.moTa ? escapeHtml(item.moTa) : '—' },
        { label: 'Học phần tiên quyết', value: prerequisiteContent(item) },
        { label: 'Loại môn / thứ tự', value: `<span class="badge ${item.loaiMon === 'BAT_BUOC' ? 'badge-info' : 'badge-warning'}">${item.loaiMon === 'BAT_BUOC' ? 'Bắt buộc' : item.loaiMon === 'TU_CHON' ? 'Tự chọn' : '—'}</span><small>Thứ tự: ${escapeHtml(item.thuTu ?? '—')}</small>` },
        { label: 'Trạng thái môn', value: item.trangThaiMon === null || item.trangThaiMon === undefined ? '—' : `<span class="badge ${item.trangThaiMon ? 'badge-success' : 'badge-warning'}">${item.trangThaiMon ? 'Đang áp dụng' : 'Ngừng áp dụng'}</span>` },
        { label: 'Trạng thái CTĐT', value: `<span class="badge ${item.trangThai ? 'badge-success' : 'badge-warning'}">${item.trangThai ? 'Đang áp dụng' : 'Ngừng áp dụng'}</span>` },
        { label: 'Thao tác', value: `<button type="button" class="btn btn-secondary btn-sm" data-ma-ctdt="${escapeHtml(item.maCTDT)}" data-ma-mon-hoc="${escapeHtml(item.maMonHoc)}" onclick="openCurriculumCourseFromButton(this)" aria-label="Chỉnh sửa ${escapeHtml(item.tenMonHoc)}">Sửa</button> <button type="button" class="btn btn-danger btn-sm" onclick="removeCurriculumCourse('${escapeHtml(item.maCTDT)}', '${escapeHtml(item.maMonHoc)}')" aria-label="Gỡ ${escapeHtml(item.tenMonHoc)} khỏi CTĐT">Gỡ</button>` }
      ];
      return `<tr>${cells.map(cell => `<td data-label="${cell.label}">${cell.value}</td>`).join('')}</tr>`;
    }).join('');
    container.innerHTML = `<table class="table curriculum-detail-table"><colgroup>${columns.map(column => `<col style="width:${(column.weight / totalWeight * 100).toFixed(2)}%">`).join('')}</colgroup><thead><tr>${columns.map(column => `<th>${column.label}</th>`).join('')}</tr></thead><tbody>${emptyRows}${courseRows}</tbody></table>`;
  } catch (error) {
    count.textContent = 'Không tải được';
    container.innerHTML = `<div style="text-align:center;padding:1.5rem;color:var(--color-danger-text);">Không thể tải chương trình đào tạo. ${escapeHtml(error.message)}</div>`;
  }
}

let adminDepartmentFaculties = [];
let adminDepartmentMajors = [];

async function loadAdminFaculties() {
  const container = document.getElementById('adminFacultiesContainer');
  const count = document.getElementById('adminFacultyCount');
  if (!container) return;

  container.innerHTML = '<div class="faculty-directory-message" role="status">Đang tải danh sách khoa...</div>';
  if (count) count.textContent = 'Đang tải...';

  try {
    const faculties = await api.get('/admin/faculties');
    adminDepartmentFaculties = faculties;
    if (count) count.textContent = `${faculties.length} khoa`;

    const facultyFilter = document.getElementById('adminMajorFacultyFilter');
    if (facultyFilter) {
      const selected = facultyFilter.value;
      facultyFilter.innerHTML = '<option value="">Tất cả khoa</option>' + faculties.map(faculty =>
        `<option value="${escapeHtml(faculty.maKhoa)}">${escapeHtml(faculty.tenKhoa)} (${escapeHtml(faculty.maKhoa)})</option>`
      ).join('');
      facultyFilter.value = faculties.some(faculty => faculty.maKhoa === selected) ? selected : '';
      if (!facultyFilter.dataset.majorFilterBound) {
        facultyFilter.addEventListener('change', () => loadAdminMajors());
        facultyFilter.dataset.majorFilterBound = 'true';
      }
    }

    if (faculties.length === 0) {
      container.innerHTML = '<div class="faculty-directory-message" role="status">Chưa có khoa nào trong hệ thống.</div>';
    } else {
      const rows = faculties.map(faculty => `
        <tr>
          <td data-label="Mã khoa"><code>${escapeHtml(faculty.maKhoa)}</code></td>
          <td data-label="Tên khoa"><strong>${escapeHtml(faculty.tenKhoa)}</strong></td>
          <td data-label="Email">${faculty.email ? escapeHtml(faculty.email) : '-'}</td>
          <td data-label="Số điện thoại">${faculty.soDienThoai ? escapeHtml(faculty.soDienThoai) : '-'}</td>
          <td data-label="Trạng thái"><span class="badge ${faculty.trangThai ? 'badge-success' : 'badge-warning'}">${faculty.trangThai ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span></td>
          <td data-label="Thao tác"><button class="btn btn-secondary btn-sm" type="button" onclick="openDepartmentEditor('faculty','edit','${escapeHtml(faculty.maKhoa)}')" aria-label="Sửa khoa ${escapeHtml(faculty.maKhoa)}">Sửa</button> <button class="btn btn-danger btn-sm" type="button" onclick="deleteDepartmentEntity('faculty','${escapeHtml(faculty.maKhoa)}')" aria-label="Xóa khoa ${escapeHtml(faculty.maKhoa)}">Xóa</button></td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="faculty-table-wrap">
          <table class="table faculty-directory-table">
            <thead><tr><th>Mã khoa</th><th>Tên khoa</th><th>Email</th><th>Số điện thoại</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }
  } catch (error) {
    if (count) count.textContent = 'Không tải được';
    container.innerHTML = `<div class="faculty-directory-message faculty-directory-error" role="alert">Không thể tải danh sách khoa. ${escapeHtml(error.message)}</div>`;
  }

  await loadAdminMajors();
}

async function loadAdminMajors() {
  const container = document.getElementById('adminMajorsContainer');
  const count = document.getElementById('adminMajorCount');
  if (!container) return;

  const facultyFilter = document.getElementById('adminMajorFacultyFilter');
  const maKhoa = facultyFilter?.value || '';
  container.setAttribute('aria-busy', 'true');
  container.innerHTML = '<div class="faculty-directory-message" role="status">Đang tải danh sách ngành...</div>';
  if (count) count.textContent = 'Đang tải...';

  try {
    const majors = await api.get('/admin/majors', maKhoa ? { maKhoa } : {});
    adminDepartmentMajors = majors;
    if (count) {
      const selectedLabel = facultyFilter?.selectedOptions?.[0]?.textContent;
      count.textContent = `${majors.length} ngành${maKhoa && selectedLabel ? ` · ${selectedLabel}` : ''}`;
    }
    if (majors.length === 0) {
      container.innerHTML = `<div class="faculty-directory-message" role="status">${maKhoa ? 'Khoa này chưa có ngành.' : 'Chưa có ngành nào trong hệ thống.'}</div>`;
      return;
    }

    const rows = majors.map(major => `
      <tr>
        <td data-label="Mã ngành"><code>${escapeHtml(major.maNganh)}</code></td>
        <td data-label="Tên ngành"><strong>${escapeHtml(major.tenNganh)}</strong></td>
        <td data-label="Khoa">${escapeHtml(major.tenKhoa)} <code>(${escapeHtml(major.maKhoa)})</code></td>
        <td data-label="Mô tả">${major.moTa ? escapeHtml(major.moTa) : '-'}</td>
        <td data-label="Trạng thái"><span class="badge ${major.trangThai ? 'badge-success' : 'badge-warning'}">${major.trangThai ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span></td>
        <td data-label="Thao tác"><button class="btn btn-secondary btn-sm" type="button" onclick="openDepartmentEditor('major','edit','${escapeHtml(major.maNganh)}')" aria-label="Sửa ngành ${escapeHtml(major.maNganh)}">Sửa</button> <button class="btn btn-danger btn-sm" type="button" onclick="deleteDepartmentEntity('major','${escapeHtml(major.maNganh)}')" aria-label="Xóa ngành ${escapeHtml(major.maNganh)}">Xóa</button></td>
      </tr>
    `).join('');
    container.innerHTML = `
      <div class="faculty-table-wrap">
        <table class="table faculty-directory-table">
          <thead><tr><th>Mã ngành</th><th>Tên ngành</th><th>Khoa</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } catch (error) {
    if (count) count.textContent = 'Không tải được';
    container.innerHTML = `<div class="faculty-directory-message faculty-directory-error" role="alert">Không thể tải danh sách ngành. ${escapeHtml(error.message)}</div>`;
  } finally {
    container.setAttribute('aria-busy', 'false');
  }
}

const departmentFieldMap = {
  maKhoa: 'adminDepartmentCode', tenKhoa: 'adminDepartmentName', email: 'adminDepartmentEmail', soDienThoai: 'adminDepartmentPhone',
  maNganh: 'adminDepartmentCode', tenNganh: 'adminDepartmentName', maLop: 'adminDepartmentCode', tenLop: 'adminDepartmentName',
  maKhoaFaculty: 'adminDepartmentFaculty', foreignKey: 'adminDepartmentFaculty', khoaHoc: 'adminDepartmentCohort',
  namNhapHoc: 'adminDepartmentYear', unique: 'adminDepartmentCode'
};

async function openDepartmentEditor(type, mode = 'create', id = '') {
  const modal = document.getElementById('adminDepartmentModal');
  if (!modal) return;
  try {
    if (type !== 'faculty' && !adminDepartmentFaculties.length) adminDepartmentFaculties = await api.get('/admin/faculties');
    const collections = { faculty: adminDepartmentFaculties, major: adminDepartmentMajors, class: allAdministrativeClasses };
    const recordKeys = { faculty: 'maKhoa', major: 'maNganh', class: 'maLop' };
    const recordKey = recordKeys[type];
    const item = mode === 'edit' ? collections[type]?.find(row => row[recordKey] === id) : null;
    const displayName = type === 'faculty' ? item?.tenKhoa : type === 'major' ? item?.tenNganh : item?.tenLop;
    if (mode === 'edit' && !item) throw new Error('Không tìm thấy dữ liệu cần chỉnh sửa. Hãy tải lại danh sách.');
    const labels = ['adminDepartmentFacultyLabel', 'adminDepartmentEmailLabel', 'adminDepartmentPhoneLabel', 'adminDepartmentDescriptionLabel', 'adminDepartmentCohortLabel', 'adminDepartmentYearLabel'];
    labels.forEach(labelId => { const label = document.getElementById(labelId); if (label) label.hidden = true; });
    const show = (...ids) => ids.forEach(labelId => { const label = document.getElementById(labelId); if (label) label.hidden = false; });
    if (type === 'faculty') show('adminDepartmentEmailLabel', 'adminDepartmentPhoneLabel');
    if (type === 'major') show('adminDepartmentFacultyLabel', 'adminDepartmentDescriptionLabel');
    if (type === 'class') show('adminDepartmentFacultyLabel', 'adminDepartmentCohortLabel', 'adminDepartmentYearLabel');
    document.getElementById('adminDepartmentTitle').textContent = `${mode === 'edit' ? 'Chỉnh sửa' : 'Thêm'} ${type === 'faculty' ? 'khoa' : type === 'major' ? 'ngành' : 'lớp sinh hoạt'}`;
    document.getElementById('adminDepartmentSectionTitle').textContent = type === 'faculty' ? 'Thông tin khoa' : type === 'major' ? 'Thông tin ngành' : 'Thông tin lớp sinh hoạt';
    document.getElementById('adminDepartmentType').value = type;
    document.getElementById('adminDepartmentOriginalId').value = item ? item[recordKey] : '';
    const code = document.getElementById('adminDepartmentCode');
    code.value = item ? item[recordKey] : '';
    code.readOnly = mode === 'edit';
    document.getElementById('adminDepartmentCodeLabel').firstChild.textContent = type === 'faculty' ? 'Mã khoa' : type === 'major' ? 'Mã ngành' : 'Mã lớp sinh hoạt';
    document.getElementById('adminDepartmentNameLabel').firstChild.textContent = type === 'faculty' ? 'Tên khoa' : type === 'major' ? 'Tên ngành' : 'Tên lớp sinh hoạt';
    document.getElementById('adminDepartmentName').value = displayName || '';
    const faculty = document.getElementById('adminDepartmentFaculty');
    faculty.required = type !== 'faculty';
    faculty.innerHTML = '<option value="">-- Chọn khoa --</option>' + adminDepartmentFaculties.map(row => `<option value="${escapeHtml(row.maKhoa)}">${escapeHtml(row.tenKhoa)} (${escapeHtml(row.maKhoa)})</option>`).join('');
    faculty.value = item?.maKhoa || '';
    document.getElementById('adminDepartmentEmail').value = item?.email || '';
    document.getElementById('adminDepartmentPhone').value = item?.soDienThoai || '';
    document.getElementById('adminDepartmentDescription').value = item?.moTa || '';
    const cohort = document.getElementById('adminDepartmentCohort');
    cohort.required = type === 'class';
    cohort.value = item?.khoaHoc || '';
    const year = document.getElementById('adminDepartmentYear');
    year.required = type === 'class';
    year.value = item?.namNhapHoc || '';
    document.getElementById('adminDepartmentStatus').value = String(item?.trangThai ?? true);
    clearAdminEditorErrors('adminDepartmentErrors', 'adminDepartmentErrorsList', departmentFieldMap);
    adminEditorTrigger = document.activeElement;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    const focusTarget = document.getElementById(mode === 'edit' ? 'adminDepartmentName' : 'adminDepartmentCode');
    setTimeout(() => focusTarget.focus(), 0);
  } catch (error) { showToast(`Không thể mở biểu mẫu. ${error.message}`, 'danger'); }
}

function closeDepartmentEditor() {
  const modal = document.getElementById('adminDepartmentModal');
  if (modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
  adminEditorTrigger?.focus?.();
  adminEditorTrigger = null;
}

async function handleSaveDepartment(event) {
  event.preventDefault();
  const type = document.getElementById('adminDepartmentType').value;
  const originalId = document.getElementById('adminDepartmentOriginalId').value;
  const code = document.getElementById('adminDepartmentCode').value.trim();
  const status = document.getElementById('adminDepartmentStatus').value === 'true';
  let endpoint = type === 'faculty' ? '/admin/faculties' : type === 'major' ? '/admin/majors' : '/admin/homeroom-classes';
  let payload;
  if (type === 'faculty') payload = { maKhoa: code, tenKhoa: document.getElementById('adminDepartmentName').value.trim(), email: document.getElementById('adminDepartmentEmail').value.trim() || null, soDienThoai: document.getElementById('adminDepartmentPhone').value.trim() || null, trangThai: status };
  else if (type === 'major') payload = { maNganh: code, maKhoa: document.getElementById('adminDepartmentFaculty').value, tenNganh: document.getElementById('adminDepartmentName').value.trim(), moTa: document.getElementById('adminDepartmentDescription').value.trim() || null, trangThai: status };
  else payload = { maLop: code, maKhoa: document.getElementById('adminDepartmentFaculty').value, tenLop: document.getElementById('adminDepartmentName').value.trim(), khoaHoc: document.getElementById('adminDepartmentCohort').value.trim(), namNhapHoc: Number(document.getElementById('adminDepartmentYear').value), trangThai: status };
  const button = document.getElementById('btnSaveDepartment');
  const label = button.textContent;
  button.disabled = true;
  button.textContent = 'Đang lưu…';
  try {
    if (originalId) {
      delete payload[type === 'faculty' ? 'maKhoa' : type === 'major' ? 'maNganh' : 'maLop'];
      await api.put(`${endpoint}/${encodeURIComponent(originalId)}`, payload);
    } else await api.post(endpoint, payload);
    closeDepartmentEditor();
    showToast('Đã lưu thông tin.', 'success');
    if (type === 'class') await loadAdminAdministrativeClasses();
    else await loadAdminFaculties();
  } catch (error) {
    const fieldMap = { ...departmentFieldMap, maKhoa: type === 'faculty' ? 'adminDepartmentCode' : 'adminDepartmentFaculty' };
    showAdminEditorErrors('adminDepartmentErrors', 'adminDepartmentErrorsList', error.errors || [], error.message, fieldMap);
    showToast(`Không thể lưu thông tin. ${error.message}`, 'danger');
  } finally { button.disabled = false; button.textContent = label; }
}

async function deleteDepartmentEntity(type, id) {
  const recordKey = { faculty: 'maKhoa', major: 'maNganh', class: 'maLop' }[type];
  const item = (type === 'faculty' ? adminDepartmentFaculties : type === 'major' ? adminDepartmentMajors : allAdministrativeClasses)
    .find(row => row[recordKey] === id);
  const title = (type === 'faculty' ? item?.tenKhoa : type === 'major' ? item?.tenNganh : item?.tenLop) || id;
  const classHasStudents = type === 'class' && Number(item?.soLuongSV || item?.siSo || 0) > 0;
  const warning = type === 'faculty' ? ' Nếu còn ngành, môn học, lớp, sinh viên hoặc giảng viên, hệ thống sẽ từ chối xóa.'
    : type === 'major' ? ' Nếu còn chương trình đào tạo, hệ thống sẽ từ chối xóa.'
      : classHasStudents ? ` Lớp đang có ${item.soLuongSV || item.siSo} sinh viên; trigger CSDL sẽ chặn xóa.` : ' Chỉ xóa được khi không còn sinh viên trực thuộc.';
  if (!window.confirm(`Xóa ${title}?${warning}`)) return;
  const endpoint = type === 'faculty' ? '/admin/faculties' : type === 'major' ? '/admin/majors' : '/admin/homeroom-classes';
  try {
    await api.delete(`${endpoint}/${encodeURIComponent(id)}`);
    showToast('Đã xóa bản ghi.', 'success');
    if (type === 'class') await loadAdminAdministrativeClasses(); else await loadAdminFaculties();
  } catch (error) { showToast(`Không thể xóa. ${error.message}`, 'danger'); }
}

function switchAdminTab(tabName, clickedBtn) {
  const restrictedTab = document.querySelector(`[data-tab-name="${tabName}"][data-required-role]`);
  if (restrictedTab && restrictedTab.dataset.requiredRole !== adminNavigationRole) return;

  // 1. Reset active tất cả nút và menu items
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-dropdown-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-dropdown-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.tab-group.open').forEach(g => setTabDropdownOpen(g, false));

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
  } else if (tabName === 'curriculums') {
    loadAdminCurriculums();
  } else if (tabName === 'faculties') {
    loadAdminFaculties();
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
    document.querySelectorAll('.tab-group.open').forEach(g => setTabDropdownOpen(g, false));
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const courseModal = document.getElementById('adminCurriculumCourseModal');
    const curriculumProgramModal = document.getElementById('adminCurriculumProgramModal');
    const classModal = document.getElementById('adminClassFormModal');
    const departmentModal = document.getElementById('adminDepartmentModal');
    if (courseModal?.classList.contains('show')) { closeCurriculumCourseModal(); return; }
    if (curriculumProgramModal?.classList.contains('show')) { closeCurriculumProgramModal(); return; }
    if (classModal?.classList.contains('show')) { closeClassSectionModal(); return; }
    if (departmentModal?.classList.contains('show')) { closeDepartmentEditor(); return; }
    const openGroups = [...document.querySelectorAll('.tab-group.open')];
    openGroups.forEach(g => setTabDropdownOpen(g, false));
    const trigger = openGroups[0]?.querySelector('.tab-dropdown-btn');
    if (trigger) trigger.focus();
    return;
  }
  if (e.key === 'Tab') {
    const modal = ['adminCurriculumCourseModal', 'adminCurriculumProgramModal', 'adminClassFormModal', 'adminDepartmentModal']
      .map(id => document.getElementById(id)).find(element => element?.classList.contains('show'));
    const dialog = modal?.querySelector('.admin-editor-dialog');
    const focusable = dialog ? [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(element => element.getAttribute('aria-hidden') !== 'true' && !element.closest('[hidden]')) : [];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      e.preventDefault();
      first.focus();
    }
  }
});

document.addEventListener('click', e => {
  if (e.target?.id === 'adminCurriculumCourseModal') closeCurriculumCourseModal();
  if (e.target?.id === 'adminCurriculumProgramModal') closeCurriculumProgramModal();
  if (e.target?.id === 'adminClassFormModal') closeClassSectionModal();
  if (e.target?.id === 'adminDepartmentModal') closeDepartmentEditor();
});

// Xuất các hàm ra Global Window
window.initAdminPortal = initAdminPortal;
window.toggleTabDropdown = toggleTabDropdown;
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
window.loadAdminCurriculums = loadAdminCurriculums;
window.openCurriculumCourseModal = openCurriculumCourseModal;
window.openCurriculumCourseFromButton = openCurriculumCourseFromButton;
window.closeCurriculumCourseModal = closeCurriculumCourseModal;
window.handleSaveCurriculumCourse = handleSaveCurriculumCourse;
window.addCurriculumPrerequisite = addCurriculumPrerequisite;
window.removeCurriculumPrerequisite = removeCurriculumPrerequisite;
window.removeCurriculumCourse = removeCurriculumCourse;
window.openCurriculumProgramModal = openCurriculumProgramModal;
window.openSelectedCurriculumProgramEditor = openSelectedCurriculumProgramEditor;
window.closeCurriculumProgramModal = closeCurriculumProgramModal;
window.updateCurriculumCohortPreview = updateCurriculumCohortPreview;
window.handleSaveCurriculumProgram = handleSaveCurriculumProgram;
window.deleteSelectedCurriculumProgram = deleteSelectedCurriculumProgram;
window.loadAdminFaculties = loadAdminFaculties;
window.loadAdminMajors = loadAdminMajors;
window.openDepartmentEditor = openDepartmentEditor;
window.closeDepartmentEditor = closeDepartmentEditor;
window.handleSaveDepartment = handleSaveDepartment;
window.deleteDepartmentEntity = deleteDepartmentEntity;
window.viewStudentDetailModal = viewStudentDetailModal;
window.closeStudentDetailModal = closeStudentDetailModal;
window.openStudentModal = openStudentModal;
window.closeStudentFormModal = closeStudentFormModal;
window.onStudentFormKhoaChange = onStudentFormKhoaChange;
window.onStudentFormClassChange = onStudentFormClassChange;
window.handleSaveStudent = handleSaveStudent;
window.confirmDeleteStudent = confirmDeleteStudent;

window.loadAdminAdministrativeClasses = loadAdminAdministrativeClasses;
window.viewClassDetailModal = viewClassDetailModal;
window.closeClassDetailModal = closeClassDetailModal;
window.filterClassStudentsAdmin = filterClassStudentsAdmin;
window.loadAdminClasses = loadAdminClasses;
window.openClassSectionModal = openClassSectionModal;
window.closeClassSectionModal = closeClassSectionModal;
window.handleSaveClassSection = handleSaveClassSection;
window.addClassScheduleDraft = addClassScheduleDraft;
window.removeClassScheduleDraft = removeClassScheduleDraft;
window.deleteClassSection = deleteClassSection;
window.loadAdminRegistrations = loadAdminRegistrations;
window.loadAdminUsers = loadAdminUsers;
window.toggleUserStatus = toggleUserStatus;
window.loadAdminAuditLogs = loadAdminAuditLogs;

window.toggleTabDropdown = toggleTabDropdown;
window.switchAdminTab = switchAdminTab;
window.setAdminNavigationRole = setAdminNavigationRole;
