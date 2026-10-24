// frontend/js/student.js
// Quản lý Dashboard Tổng quan và Hồ sơ cá nhân của Sinh viên

function getStudentTermNumber(namHoc, tenHocKy, khoaHoc) {
  const cohortStartYear = Number(String(khoaHoc || '').match(/\d{4}/)?.[0]);
  const academicStartYear = Number(String(namHoc || '').match(/\d{4}/)?.[0]);
  const termInYear = Number(String(tenHocKy || '').match(/(?:học kỳ|hk)\s*(\d+)/i)?.[1]);
  if (!cohortStartYear || !academicStartYear || ![1, 2].includes(termInYear)) return null;

  const termNumber = (academicStartYear - cohortStartYear) * 2 + termInYear;
  return termNumber >= 1 && termNumber <= 8 ? termNumber : null;
}

function formatStudentSemesterLabel(semester, khoaHoc) {
  const termNumber = getStudentTermNumber(semester.namHoc, semester.tenHocKy, khoaHoc);
  return termNumber ? `Học kỳ ${termNumber}` : `${escapeHtml(semester.namHoc)} - ${escapeHtml(semester.tenHocKy)}`;
}

let currentStudentStudyTermLabel = null;

function applyCurrentStudentStudyTermLabel() {
  if (!currentStudentStudyTermLabel) return;
  document.querySelectorAll('.semester-badge, .dynamic-semester-name').forEach(element => {
    element.textContent = currentStudentStudyTermLabel;
  });
}

// 1. Tải dữ liệu Dashboard Tổng quan
async function loadStudentDashboard() {
  const user = api.getCurrentUser();
  if (!user || !user.maSV) return;

  const dashboardContainer = document.getElementById('studentDashboardContent');
  if (!dashboardContainer) return;

  try {
    // Tải song song thông tin hồ sơ, bảng điểm, công nợ học phí, môn đã đăng ký và học kỳ hiện tại
    const [profile, gradesData, tuitionList, myRegs, curSemester] = await Promise.all([
      api.get(`/students/${user.maSV}/profile`).catch(() => null),
      api.get(`/students/${user.maSV}/grades`).catch(() => ({ summary: { gpa: 0, tongTinChiTichLuy: 0 }, grades: [] })),
      api.get(`/students/${user.maSV}/tuition`).catch(() => []),
      api.get('/registrations/my-courses').catch(() => []),
      api.getCurrentSemester().catch(() => null)
    ]);

    // Tính toán chỉ số tín chỉ đã đăng ký học kỳ hiện tại
    const regCourses = (myRegs && myRegs.courses) || [];
    const creditsThisSemester = regCourses.reduce((sum, c) => sum + (c.soTinChi || 0), 0);

    // Tính toán công nợ học phí
    let totalTuition = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    (tuitionList || []).forEach(t => {
      totalTuition += t.tongTien || 0;
      totalPaid += t.soTienDaThanhToan || 0;
      totalRemaining += t.soTienConLai || 0;
    });

    let tuitionStatusBadge = '<span class="badge badge-success">Đã hoàn tất</span>';
    if (totalRemaining > 0) {
      tuitionStatusBadge = totalPaid > 0 
        ? '<span class="badge badge-warning">Nộp một phần</span>' 
        : '<span class="badge badge-danger">Chưa nộp</span>';
    }

    const gpa = gradesData.summary ? gradesData.summary.gpa : 0;
    const totalCredits = gradesData.summary ? gradesData.summary.tongTinChiTichLuy : 0;
    const semesterDisplay = curSemester ? `${escapeHtml(curSemester.tenHocKy)} (${escapeHtml(curSemester.namHoc)})` : 'Học kỳ hiện tại';
    const currentStudyTerm = curSemester
      ? getStudentTermNumber(curSemester.namHoc, curSemester.tenHocKy, profile?.khoaHoc)
      : null;
    const studyTermLabel = currentStudyTerm ? `Học kỳ ${currentStudyTerm}` : 'Học kỳ hiện tại';
    if (currentStudyTerm) {
      currentStudentStudyTermLabel = studyTermLabel;
      applyCurrentStudentStudyTermLabel();
    }

    dashboardContainer.innerHTML = `
      <!-- Welcome Banner Compact -->
      <div class="welcome-banner" style="background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary)); color: white; padding: 0.65rem 1.15rem; border-radius: var(--radius-md); margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.15rem;">
            Xin chào, ${escapeHtml(profile ? profile.hoTen : user.hoTen)}!
          </h2>
          <p style="font-size: 0.8125rem; opacity: 0.9; margin: 0;">
            MSSV: <strong>${escapeHtml(profile ? profile.maSinhVien : user.username)}</strong> | Lớp: <strong>${escapeHtml(profile ? (profile.tenLop || profile.maLop || 'Chưa xếp lớp') : 'Chưa xếp lớp')}</strong> | Khoa: <strong>${escapeHtml(profile ? (profile.tenKhoa || profile.maKhoa || 'Chưa cập nhật') : 'Chưa cập nhật')}</strong> | Trạng thái: ${renderStatusBadge(profile ? profile.trangThai : 'DANG_HOC')}
          </p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.15); padding: 0.4rem 0.875rem; border-radius: var(--radius-sm); text-align: right;">
          <div style="font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9;">Học kỳ hiện tại</div>
          <div style="font-size: 0.9375rem; font-weight: 700;">${currentStudyTerm ? studyTermLabel : semesterDisplay}</div>
        </div>
      </div>

      <!-- KPI Summary Cards (4 Columns Grid) -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">GPA Tích Lũy</div>
          <div class="summary-value" style="color: var(--color-primary);">${gpa.toFixed(2)}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">Thang điểm 10</div>
        </div>

        <div class="summary-card">
          <div class="summary-label">Tổng Tín Chỉ Tích Lũy</div>
          <div class="summary-value">${totalCredits} <span style="font-size: 0.8125rem; font-weight: normal; color: var(--color-text-muted);">TC</span></div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">Các môn đạt chuẩn</div>
        </div>

        <div class="summary-card">
          <div class="summary-label">Đăng Ký ${studyTermLabel}</div>
          <div class="summary-value" style="color: #0284C7;">${creditsThisSemester} <span style="font-size: 0.8125rem; font-weight: normal; color: var(--color-text-muted);">TC</span></div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">Đã đăng ký ${regCourses.length} môn học</div>
        </div>

        <div class="summary-card">
          <div class="summary-label">Học Phí Còn Phải Nộp</div>
          <div class="summary-value" style="color: ${totalRemaining > 0 ? '#DC2626' : '#16A34A'}; font-size: 1.25rem;">
            ${api.formatCurrency(totalRemaining)}
          </div>
          <div style="margin-top: 0.15rem;">${tuitionStatusBadge}</div>
        </div>
      </div>

      <!-- Bento Grid: Thông báo & Lối tắt tác vụ (Zero-Scroll Fit) -->
      <div class="dashboard-bento">
        
        <!-- Cột 1: Thông báo & Nhắc nhở học vụ -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header" style="padding: 0.65rem 1rem;">
            <h3 class="card-title" style="font-size: 0.875rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Thông báo & Trạng thái học vụ
            </h3>
          </div>
          <div class="card-body" style="padding: 0.75rem 1rem;">
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="padding: 0.5rem 0.75rem; border-left: 3px solid #3B82F6; background: var(--color-surface-hover); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
                <div style="font-weight: 600; font-size: 0.8125rem; color: var(--color-primary-dark);">Hệ thống Đăng ký Tín chỉ ${studyTermLabel} đang mở</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">
                  Hạn đăng ký đến 23:59 ngày 31/10/2026. Sinh viên kiểm tra kỹ thời khóa biểu để tránh trùng lịch.
                </div>
              </div>
              <div style="padding: 0.5rem 0.75rem; border-left: 3px solid ${totalRemaining > 0 ? '#DC2626' : '#16A34A'}; background: var(--color-surface-hover); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
                <div style="font-weight: 600; font-size: 0.8125rem; color: ${totalRemaining > 0 ? '#DC2626' : '#16A34A'};">
                  ${totalRemaining > 0 ? 'Nhắc nhở công nợ học phí' : 'Hoàn thành học phí'}
                </div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">
                  ${totalRemaining > 0 ? `Còn phải nộp ${api.formatCurrency(totalRemaining)}. Vui lòng tạo yêu cầu thanh toán sớm.` : 'Bạn đã thanh toán đầy đủ học phí cho học kỳ này.'}
                </div>
              </div>
              <div style="padding: 0.5rem 0.75rem; border-left: 3px solid #F59E0B; background: var(--color-surface-hover); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
                <div style="font-weight: 600; font-size: 0.8125rem; color: #B45309;">Quy trình duyệt thanh toán</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">
                  Giao dịch tạo sẽ ở trạng thái <code>CHO_XAC_NHAN</code> cho đến khi Ban Đào tạo đối soát và duyệt.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột 2: Lối tắt chức năng nhanh dạng 2x2 grid -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header" style="padding: 0.65rem 1rem;">
            <h3 class="card-title" style="font-size: 0.875rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              Lối tắt chức năng học vụ
            </h3>
          </div>
          <div class="card-body" style="padding: 0.75rem 1rem;">
            <div class="dashboard-shortcuts">
              
              <button class="shortcut-btn" onclick="window.switchTab('registration')">
                <span class="shortcut-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </span>
                <span class="shortcut-info">
                  <span class="shortcut-title">Đăng ký học phần</span>
                  <span class="shortcut-desc">Đăng ký môn ${studyTermLabel.toLowerCase()}</span>
                </span>
              </button>

              <button class="shortcut-btn" onclick="window.switchTab('schedule')">
                <span class="shortcut-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                  </svg>
                </span>
                <span class="shortcut-info">
                  <span class="shortcut-title">Thời khóa biểu</span>
                  <span class="shortcut-desc">Lịch học tuần tiết 1-10</span>
                </span>
              </button>

              <button class="shortcut-btn" onclick="window.switchTab('grades')">
                <span class="shortcut-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </span>
                <span class="shortcut-info">
                  <span class="shortcut-title">Kết quả học tập</span>
                  <span class="shortcut-desc">Bảng điểm & GPA</span>
                </span>
              </button>

              <button class="shortcut-btn" onclick="window.switchTab('payment')">
                <span class="shortcut-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                </span>
                <span class="shortcut-info">
                  <span class="shortcut-title">Thanh toán học phí</span>
                  <span class="shortcut-desc">Nộp học phí online</span>
                </span>
              </button>

            </div>
          </div>
        </div>

      </div>
    `;
  } catch (err) {
    dashboardContainer.innerHTML = `<div style="color: var(--color-danger-text); padding: 2rem; text-align: center;">Không thể tải bảng tổng quan. ${escapeHtml(err.message)}</div>`;
  }
}

// 2. Tải thông tin Hồ sơ cá nhân (Tab Profile)
async function loadStudentProfile() {
  const user = api.getCurrentUser();
  if (!user || !user.maSV) return;

  const profileContainer = document.getElementById('studentProfileContent');
  if (!profileContainer) return;

  profileContainer.innerHTML = `<div style="text-align: center; padding: 2rem;">Đang tải thông tin hồ sơ...</div>`;

  try {
    const profile = await api.get(`/students/${user.maSV}/profile`);
    if (!profile) {
      profileContainer.innerHTML = `<div style="color: var(--color-danger-text); padding: 1.5rem;">Không tìm thấy thông tin hồ sơ sinh viên.</div>`;
      return;
    }

    const birthDate = profile.ngaySinh ? new Date(profile.ngaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
    const createdAt = profile.ngayTao ? new Date(profile.ngayTao).toLocaleDateString('vi-VN') : '-';
    const lastLogin = profile.lanDangNhapCuoi ? new Date(profile.lanDangNhapCuoi).toLocaleString('vi-VN') : 'Lần đầu đăng nhập';

    profileContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        
        <!-- Thẻ 1: Thông tin học vụ & Sinh viên -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Hồ sơ học vụ sinh viên
            </h3>
            ${renderStatusBadge(profile.trangThai)}
          </div>
          <div class="card-body">
            <table class="table" style="font-size: 0.875rem;">
              <tbody>
                <tr>
                  <td style="width: 140px; color: var(--color-text-muted); font-weight: 600;">Mã số sinh viên:</td>
                  <td><strong>${escapeHtml(profile.maSinhVien)}</strong> (ID: #${escapeHtml(profile.maSV)})</td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Họ và tên:</td>
                  <td><strong>${escapeHtml(profile.hoTen)}</strong></td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Ngày sinh:</td>
                  <td>${birthDate}</td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Lớp sinh hoạt:</td>
                  <td><strong>${escapeHtml(profile.tenLop || profile.maLop || 'Chưa cập nhật')}</strong> (Mã lớp: <code>${escapeHtml(profile.maLop || '-')}</code>)</td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Khóa học:</td>
                  <td>${escapeHtml(profile.khoaHoc || '-')}</td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Khoa trực thuộc:</td>
                  <td><strong>${escapeHtml(profile.tenKhoa)}</strong> (${escapeHtml(profile.maKhoa)})</td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Email học vụ:</td>
                  <td>${escapeHtml(profile.email || 'Chưa cập nhật')}</td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Số điện thoại:</td>
                  <td>${escapeHtml(profile.soDienThoai || 'Chưa cập nhật')}</td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Ngày nhập học:</td>
                  <td>${createdAt}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Thẻ 2: Thông tin tài khoản đăng nhập -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Tài khoản hệ thống
            </h3>
            ${renderStatusBadge(profile.trangThaiTaiKhoan || 'ACTIVE')}
          </div>
          <div class="card-body">
            <table class="table" style="font-size: 0.875rem;">
              <tbody>
                <tr>
                  <td style="width: 140px; color: var(--color-text-muted); font-weight: 600;">Tên đăng nhập:</td>
                  <td><code>${escapeHtml(profile.username)}</code></td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Vai trò:</td>
                  <td><span class="badge badge-info">${escapeHtml(profile.vaiTro)}</span></td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Trạng thái tài khoản:</td>
                  <td>${profile.trangThaiTaiKhoan === 'ACTIVE' ? '<span style="color: #16A34A; font-weight: 600;">Hoạt động bình thường</span>' : '<span style="color: #DC2626; font-weight: 600;">Đã bị khóa</span>'}</td>
                </tr>
                <tr>
                  <td style="color: var(--color-text-muted); font-weight: 600;">Lần đăng nhập cuối:</td>
                  <td>${lastLogin}</td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border-subtle); display: flex; gap: 0.75rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="showToast('Vui lòng liên hệ Phòng Đào tạo để đổi mật khẩu quản trị', 'info')">
                Đổi mật khẩu
              </button>
              <button class="btn btn-danger btn-sm" onclick="logout()">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
  } catch (err) {
    profileContainer.innerHTML = `<div style="color: var(--color-danger-text); padding: 1.5rem;">Không thể tải hồ sơ sinh viên. ${escapeHtml(err.message)}</div>`;
  }
}

let studentCurriculumData = null;

async function loadStudentCurriculum() {
  const user = api.getCurrentUser();
  const status = document.getElementById('studentCurriculumStatus');
  const summary = document.getElementById('studentCurriculumSummary');
  const select = document.getElementById('studentCurriculumTerm');
  const courses = document.getElementById('studentCurriculumCourses');
  if (!user?.maSV || !status || !summary || !select || !courses) return;
  status.textContent = 'Đang tải...';
  courses.innerHTML = '<div style="text-align:center;padding:1.5rem;">Đang tải chương trình đào tạo...</div>';
  try {
    studentCurriculumData = await api.get(`/students/${user.maSV}/curriculum`);
    const program = studentCurriculumData;
    status.textContent = program.trangThai ? 'Đang áp dụng' : 'Ngừng áp dụng';
    status.className = `badge ${program.trangThai ? 'badge-success' : 'badge-warning'}`;
    summary.innerHTML = renderStudentCurriculumSummary(program);
    select.innerHTML = program.hocKy.map(term => `<option value="${term.hocKyDuKien}">Học kỳ ${term.hocKyDuKien}</option>`).join('');
    renderStudentCurriculumTerm();
  } catch (error) {
    status.textContent = 'Chưa có dữ liệu';
    summary.textContent = '';
    select.innerHTML = '';
    courses.innerHTML = `<div style="text-align:center;padding:1.5rem;color:var(--color-text-muted);">${escapeHtml(error.message)}</div>`;
  }
}

function renderStudentCurriculumSummary(program) {
  return `
    <div class="curriculum-program-heading">
      <div class="curriculum-program-identity">
        <h3 class="curriculum-program-name">${escapeHtml(program.tenCTDT)}</h3>
        <div class="curriculum-program-code"><span>Mã CTĐT</span><code>${escapeHtml(program.maCTDT)}</code></div>
      </div>
    </div>
    <dl class="curriculum-program-facts">
      <div><dt>Ngành</dt><dd>${escapeHtml(program.nganh || 'Chưa cập nhật')}</dd></div>
      <div><dt>Khoa</dt><dd>${escapeHtml(program.tenKhoa || 'Chưa cập nhật')}</dd></div>
      <div><dt>Khóa học</dt><dd>${escapeHtml(program.khoaHoc || 'Chưa cập nhật')}</dd></div>
    </dl>
    <div class="curriculum-program-metrics">
      <div class="curriculum-program-metric"><span>Tín chỉ yêu cầu</span><strong>${escapeHtml(program.tongTinChiYeuCau ?? '—')}</strong></div>
      <div class="curriculum-program-metric"><span>Thời gian đào tạo</span><strong>${program.thoiGianDaoTao ? `${escapeHtml(program.thoiGianDaoTao)} năm` : '—'}</strong></div>
    </div>`;
}

function renderStudentCurriculumTerm() {
  const courses = document.getElementById('studentCurriculumCourses');
  const termNo = Number(document.getElementById('studentCurriculumTerm')?.value);
  const term = studentCurriculumData?.hocKy.find(item => item.hocKyDuKien === termNo);
  if (!courses || !term) return;
  if (!term.monHoc.length) {
    courses.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--color-text-muted);">Học kỳ này chưa có môn học trong chương trình.</div>';
    return;
  }
  courses.innerHTML = `<table class="table" style="min-width:850px"><thead><tr><th>STT</th><th>Mã học phần</th><th>Tên môn học</th><th>Số tín chỉ</th><th>Học phần tiên quyết</th></tr></thead><tbody>${term.monHoc.map((course, index) => `<tr><td>${index + 1}</td><td><code>${escapeHtml(course.maMonHoc)}</code></td><td>${escapeHtml(course.tenMonHoc)}</td><td>${course.soTinChi}</td><td>${course.hocPhanTienQuyet ? escapeHtml(course.hocPhanTienQuyet) : '—'}</td></tr>`).join('')}</tbody></table>`;
}

window.loadStudentDashboard = loadStudentDashboard;
window.loadStudentProfile = loadStudentProfile;
window.loadStudentCurriculum = loadStudentCurriculum;
window.renderStudentCurriculumTerm = renderStudentCurriculumTerm;
window.renderStudentCurriculumSummary = renderStudentCurriculumSummary;
window.applyCurrentStudentStudyTermLabel = applyCurrentStudentStudyTermLabel;
