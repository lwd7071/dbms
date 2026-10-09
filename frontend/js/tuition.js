// frontend/js/tuition.js
// Module quản lý tra cứu học phí, tạo yêu cầu thanh toán và lịch sử giao dịch

let currentTuitionList = [];
let selectedTuition = null;

// Khởi tạo tab học phí cho sinh viên
async function initTuitionTab() {
  const user = api.getCurrentUser();
  if (!user || !user.maSV) return;
  await loadTuition(user.maSV);
  await loadPaymentHistory(user.maSV);
}

// 1. Tải danh sách công nợ học phí từ V_HocPhiSinhVien
async function loadTuition(maSV) {
  const container = document.getElementById('tuitionListContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
      Đang tải dữ liệu học phí...
    </div>
  `;

  try {
    const list = await api.get(`/students/${maSV}/tuition`);
    currentTuitionList = list || [];
    renderTuitionList(currentTuitionList);
  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--color-danger-text);">
        Không thể tải thông tin học phí: ${err.message || 'Lỗi kết nối máy chủ'}
      </div>
    `;
    showToast(err.message || 'Lỗi khi tải học phí', 'danger');
  }
}

// 2. Hiển thị danh sách học phí các học kỳ
function renderTuitionList(list) {
  const container = document.getElementById('tuitionListContainer');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: var(--color-text-muted);">
        Không tìm thấy hồ sơ học phí nào cho sinh viên này.
      </div>
    `;
    return;
  }

  // Tính tổng nợ toàn bộ
  let totalDue = 0;
  let totalRemaining = 0;
  let totalPaid = 0;

  list.forEach(item => {
    totalDue += item.tongTien || 0;
    totalRemaining += item.soTienConLai || 0;
    totalPaid += item.soTienDaThanhToan || 0;
  });

  const summaryHtml = `
    <div class="summary-cards" style="margin-bottom: 1.5rem;">
      <div class="summary-card">
        <div class="summary-label">Tổng học phí phát sinh</div>
        <div class="summary-value" style="font-size: 1.5rem;">
          ${api.formatCurrency(totalDue)}
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Đã thanh toán (Đã xác nhận)</div>
        <div class="summary-value" style="font-size: 1.5rem; color: #16A34A;">
          ${api.formatCurrency(totalPaid)}
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Còn phải nộp</div>
        <div class="summary-value" style="font-size: 1.5rem; color: ${totalRemaining > 0 ? '#DC2626' : '#16A34A'};">
          ${api.formatCurrency(totalRemaining)}
        </div>
      </div>
    </div>
  `;

  const cardsHtml = list.map(item => {
    let badgeClass = 'badge-danger';
    let badgeText = 'Chưa nộp';
    if (item.trangThai === 'PAID') {
      badgeClass = 'badge-success';
      badgeText = 'Đã hoàn tất';
    } else if (item.trangThai === 'PARTIAL') {
      badgeClass = 'badge-warning';
      badgeText = 'Nộp một phần';
    }

    const canPay = item.soTienConLai > 0;
    const hasPending = item.hasPendingPayment;

    return `
      <div style="background: var(--color-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
          <div>
            <span style="font-weight: 700; font-size: 1.05rem; color: var(--color-primary-dark);">
              ${item.tenHocKy} (${item.namHoc})
            </span>
            <div style="font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 2px;">
              Mã hồ sơ: HP#${item.maHocPhi} | Số tín chỉ: <strong>${item.soTinChi}</strong> | Đơn giá: ${api.formatCurrency(item.donGiaTinChi)}/TC
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge ${badgeClass}">${badgeText}</span>
            ${hasPending ? `
              <span class="badge badge-warning" style="display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Chờ duyệt (${item.soGiaoDichChoDuyet} GD)
              </span>
            ` : ''}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; font-size: 0.875rem;">
          <div>
            <span style="color: var(--color-text-muted);">Tổng số tiền:</span>
            <div style="font-weight: 600;">${api.formatCurrency(item.tongTien)}</div>
          </div>
          <div>
            <span style="color: var(--color-text-muted);">Đã đóng thực tế:</span>
            <div style="font-weight: 600; color: #16A34A;">${api.formatCurrency(item.soTienDaThanhToan)}</div>
          </div>
          <div>
            <span style="color: var(--color-text-muted);">Còn lại:</span>
            <div style="font-weight: 700; color: ${item.soTienConLai > 0 ? '#DC2626' : 'inherit'};">
              ${api.formatCurrency(item.soTienConLai)}
            </div>
          </div>
        </div>

        ${hasPending ? `
          <div style="margin-top: 0.85rem; padding: 0.65rem 0.85rem; background: rgba(234, 179, 8, 0.1); border-left: 3px solid #EAB308; border-radius: var(--radius-sm); font-size: 0.8125rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: #854D0E;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Đang có yêu cầu nộp <strong>${api.formatCurrency(item.soTienChoDuyet)}</strong> chờ Cán bộ Đào tạo đối soát và xác nhận.</span>
            </div>
            <span style="font-size: 0.75rem; color: #854D0E; font-weight: 600;">Trạng thái: Chờ duyệt</span>
          </div>
        ` : ''}

        ${hasPending ? `
          <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border-subtle);">
            <span style="font-size: 0.8125rem; color: var(--color-text-muted);">Đã tạo yêu cầu, không thể gửi thêm để tránh trùng lặp</span>
            <button class="btn btn-secondary" disabled style="opacity: 0.7; cursor: not-allowed; display: inline-flex; align-items: center; gap: 0.4rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Đang chờ duyệt
            </button>
          </div>
        ` : canPay ? `
          <div style="display: flex; justify-content: flex-end; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border-subtle);">
            <button class="btn btn-primary" onclick="openPaymentModal(${item.maHocPhi})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              Tạo yêu cầu nộp tiền
            </button>
          </div>
        ` : `
          <div style="margin-top: 0.75rem; text-align: right; font-size: 0.8125rem; color: #16A34A; font-weight: 600;">
            ✓ Học kỳ này đã hoàn thành nghĩa vụ tài chính
          </div>
        `}
      </div>
    `;
  }).join('');

  container.innerHTML = summaryHtml + cardsHtml;
}

// 3. Tải lịch sử các giao dịch thanh toán của sinh viên có phân trang
async function loadPaymentHistory(maSV, page = 1, pageSize = 5) {
  const container = document.getElementById('paymentHistoryContainer');
  if (!container) return;

  try {
    const data = await api.get(`/students/${maSV}/payments`, { page, pageSize });
    const list = data.items || [];

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--color-text-muted);">
          Chưa có giao dịch thanh toán nào được tạo.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table" style="min-width: 850px;">
          <thead>
            <tr>
              <th style="width: 100px;">Mã GD</th>
              <th style="min-width: 160px;">Học kỳ</th>
              <th style="width: 130px; text-align: right;">Số tiền</th>
              <th style="width: 120px;">Phương thức</th>
              <th style="min-width: 160px;">Thời gian tạo</th>
              <th style="min-width: 160px;">Thời gian duyệt</th>
              <th style="width: 130px; text-align: center;">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(p => {
              let badge = '<span class="badge badge-warning">Chờ xác nhận</span>';
              if (p.trangThai === 'DA_XAC_NHAN') {
                badge = '<span class="badge badge-success">Đã xác nhận</span>';
              } else if (p.trangThai === 'TU_CHOI') {
                badge = '<span class="badge badge-danger">Từ chối</span>';
              }

              return `
                <tr>
                  <td class="cell-nowrap"><strong>#${p.maThanhToan}</strong></td>
                  <td class="cell-nowrap">${p.tenHocKy} (${p.namHoc})</td>
                  <td class="cell-nowrap" style="text-align: right; font-weight: 600; font-family: monospace;">${api.formatCurrency(p.soTien)}</td>
                  <td class="cell-nowrap">${p.phuongThuc === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Tiền mặt'}</td>
                  <td class="cell-nowrap">${new Date(p.ngayThanhToan).toLocaleString('vi-VN')}</td>
                  <td class="cell-nowrap">${p.ngayXacNhan ? new Date(p.ngayXacNhan).toLocaleString('vi-VN') : '<span style="color: var(--color-text-muted);">-</span>'}</td>
                  <td class="cell-nowrap" style="text-align: center;">${badge}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div id="payment-history-pagination"></div>
    `;

    // Render component phân trang
    renderPagination({
      containerId: 'payment-history-pagination',
      page: data.page,
      pageSize: data.pageSize,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      pageSizeOptions: [5, 10, 20],
      onPageChange: (newPage, newPageSize) => {
        loadPaymentHistory(maSV, newPage, newPageSize);
      }
    });

  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 1rem;">Lỗi tải lịch sử: ${err.message}</div>`;
  }
}

// Mở modal thanh toán
function openPaymentModal(maHocPhi) {
  selectedTuition = currentTuitionList.find(t => t.maHocPhi === maHocPhi);
  if (!selectedTuition) return;

  if (selectedTuition.hasPendingPayment) {
    showToast('Hồ sơ học phí này đang có yêu cầu nộp tiền chờ duyệt đối soát.', 'warning');
    return;
  }

  const modal = document.getElementById('paymentModal');
  if (!modal) return;

  document.getElementById('modalTuitionInfo').innerHTML = `
    <strong>${selectedTuition.tenHocKy} (${selectedTuition.namHoc})</strong><br>
    Tổng học phí: ${api.formatCurrency(selectedTuition.tongTien)}<br>
    Đã thanh toán (xác nhận): ${api.formatCurrency(selectedTuition.soTienDaThanhToan)}<br>
    <span style="color: #DC2626; font-weight: 700;">Còn lại cần nộp: ${api.formatCurrency(selectedTuition.soTienConLai)}</span>
  `;

  const amountInput = document.getElementById('paymentAmount');
  amountInput.value = selectedTuition.soTienConLai;
  amountInput.max = selectedTuition.soTienConLai;

  modal.classList.add('show');
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  if (modal) modal.classList.remove('show');
  selectedTuition = null;
}

function fillFullAmount() {
  if (selectedTuition) {
    document.getElementById('paymentAmount').value = selectedTuition.soTienConLai;
  }
}

// Sinh viên gửi yêu cầu nộp tiền
async function submitPayment() {
  if (!selectedTuition) return;

  const amountInput = document.getElementById('paymentAmount');
  const methodSelect = document.getElementById('paymentMethod');
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    showToast('Vui lòng nhập số tiền hợp lệ (> 0 VNĐ)', 'warning');
    return;
  }

  const btnSubmit = document.getElementById('btnConfirmPayment');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = 'Đang gửi yêu cầu...';

  try {
    const data = await api.post('/payments', {
      maHocPhi: selectedTuition.maHocPhi,
      soTien: amount,
      phuongThuc: methodSelect.value
    });

    showToast(`Đã gửi yêu cầu thanh toán ${api.formatCurrency(amount)} thành công! Trạng thái: Chờ xác nhận từ Phòng Đào tạo.`, 'info');
    closePaymentModal();

    // Tải lại danh sách học phí và lịch sử giao dịch
    const user = api.getCurrentUser();
    if (user && user.maSV) {
      await loadTuition(user.maSV);
      await loadPaymentHistory(user.maSV);
    }
  } catch (err) {
    showToast(err.message || 'Tạo giao dịch thất bại', 'danger');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = 'Xác nhận tạo yêu cầu nộp tiền';
  }
}

window.initTuitionTab = initTuitionTab;
window.loadTuition = loadTuition;
window.loadPaymentHistory = loadPaymentHistory;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.fillFullAmount = fillFullAmount;
window.submitPayment = submitPayment;
