/**
 * Xử lý logic Đăng ký tín chỉ, Thời khóa biểu và Bảng điểm Sinh viên
 */

let currentPage = 1;
let currentFilterType = 'PLAN'; // 'PLAN' | 'OTHER' | 'ALL'
let courseSearchDebounceTimer = null;

// Hàm chuyển tab lọc môn học theo kế hoạch
function switchCourseFilter(type) {
  currentFilterType = type;
  document.querySelectorAll('.segmented-filter .segmented-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === type);
  });
  loadAvailableCourses(1);
}

// Xử lý ô tìm kiếm học phần có debounce
function handleCourseSearchInput(val) {
  clearTimeout(courseSearchDebounceTimer);
  courseSearchDebounceTimer = setTimeout(() => {
    loadAvailableCourses(1);
  }, 300);
}

// 1. Tải danh sách môn học mở đăng ký
async function loadAvailableCourses(page = 1) {
  currentPage = page;
  const user = api.getCurrentUser();
  const tbody = document.getElementById('courses-tbody');
  const paginationElem = document.getElementById('courses-pagination');
  const maKhoa = document.getElementById('filter-khoa')?.value || '';
  const searchInput = document.getElementById('course-search-input')?.value.trim() 
    || document.getElementById('filter-search')?.value.trim() 
    || '';

  tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Đang tải danh sách môn học...</td></tr>`;

  try {
    const data = await api.get('/courses/available', {
      page: currentPage,
      pageSize: 8,
      maKhoa,
      search: searchInput,
      type: currentFilterType,
      maSV: user ? user.maSV : undefined
    });

    if (!data.items || data.items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--color-text-muted);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display: block; margin: 0 auto 0.5rem auto; color: #94A3B8;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div>Không tìm thấy lớp học phần phù hợp theo bộ lọc hiện tại.</div>
          </td>
        </tr>
      `;
      paginationElem.innerHTML = '';
      return;
    }

    tbody.innerHTML = data.items.map(course => {
      const isFull = course.siSoHienTai >= course.soLuongToiDa;
      const percent = Math.min(100, Math.round((course.siSoHienTai / course.soLuongToiDa) * 100));
      const planBadge = course.laTheoKeHoach
        ? `<span class="badge badge-primary" style="font-size: 0.6875rem;">Theo kế hoạch</span>`
        : `<span class="badge" style="background: #E2E8F0; color: #475569; font-size: 0.6875rem;">Ngoài kế hoạch</span>`;

      return `
        <tr>
          <td class="cell-nowrap"><strong>${course.maLHP}</strong></td>
          <td>
            <div style="font-weight: 600;">${course.tenMonHoc}</div>
            <div style="display: flex; gap: 0.375rem; align-items: center; margin-top: 2px;">
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">${course.tenLHP}</span>
              ${planBadge}
            </div>
          </td>
          <td class="cell-nowrap" style="text-align: center;"><span class="badge badge-info">${course.soTinChi} TC</span></td>
          <td class="cell-nowrap">${course.tenGiangVien}</td>
          <td class="cell-nowrap">Thứ ${course.thu}, Tiết ${course.tietBatDau}-${course.tietBatDau + course.soTiet - 1} (${course.phongHoc})</td>
          <td style="min-width: 130px;">
            <div style="font-size: 0.8125rem; font-weight: 600; display: flex; justify-content: space-between;">
              <span>${course.siSoHienTai}/${course.soLuongToiDa}</span>
              <span style="color: ${isFull ? '#DC2626' : 'inherit'}">${percent}%</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar ${isFull ? 'full' : ''}" style="width: ${percent}%;"></div>
            </div>
          </td>
          <td class="cell-nowrap" style="text-align: center;">
            <button class="btn btn-sm ${isFull ? 'btn-secondary' : 'btn-primary'}" 
              onclick="handleRegister('${course.maLHP}')" ${isFull ? 'disabled' : ''}>
              ${isFull ? 'Hết chỗ' : 'Đăng ký'}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Render component phân trang chuẩn UI/UX Pro Max
    renderPagination({
      containerId: 'courses-pagination',
      page: data.page,
      pageSize: data.pageSize,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      pageSizeOptions: [4, 8, 16],
      onPageChange: (newPage, newPageSize) => {
        loadAvailableCourses(newPage, newPageSize);
      }
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-danger-text); padding: 2rem;">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
  }
}

// 2. Xử lý Đăng ký tín chỉ
async function handleRegister(maLHP) {
  const user = api.getCurrentUser();
  if (!user || !user.maSV) {
    showToast('Không xác định được mã sinh viên.', 'danger');
    return;
  }

  try {
    const res = await api.post('/registrations', {
      maSV: user.maSV,
      maLHP,
      tinChiToiDa: 25
    });

    showToast(`Đăng ký thành công lớp ${maLHP}!`, 'success');
    loadAvailableCourses(currentPage);
    loadMyRegistrations();
    loadSchedule();
    loadGrades();
  } catch (err) {
    // Hiển thị thông báo lỗi nghiệp vụ chi tiết
    showToast(`Không thể đăng ký: ${err.message}`, 'danger');
  }
}

// 3. Tải danh sách các môn sinh viên đã đăng ký trong kỳ
async function loadMyRegistrations() {
  const user = api.getCurrentUser();
  if (!user || !user.maSV) return;

  const tbody = document.getElementById('my-courses-tbody');
  const countElem = document.getElementById('my-courses-count');

  try {
    const list = await api.get('/registrations/my-courses', { maSV: user.maSV });

    let totalCredits = 0;
    if (list && list.length > 0) {
      tbody.innerHTML = list.map(c => {
        totalCredits += c.soTinChi;
        return `
          <tr>
            <td class="cell-nowrap"><strong>${c.maLHP}</strong></td>
            <td>${c.tenMonHoc}</td>
            <td class="cell-nowrap" style="text-align: center;"><span class="badge badge-info">${c.soTinChi} TC</span></td>
            <td class="cell-nowrap">${c.tenGiangVien}</td>
            <td class="cell-nowrap">Thứ ${c.thu}, Tiết ${c.tietBatDau}-${c.tietBatDau + c.soTiet - 1} (${c.phongHoc})</td>
            <td class="cell-nowrap" style="text-align: center;">${renderStatusBadge(c.trangThai || 'REGISTERED')}</td>
            <td class="cell-nowrap" style="text-align: center;">
              <button class="btn btn-sm btn-danger" onclick="handleCancel(${c.maDangKy}, '${c.maLHP}')">
                Hủy môn
              </button>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted); padding: 1.5rem;">Chưa có học phần nào được đăng ký trong học kỳ này.</td></tr>`;
    }

    if (countElem) {
      countElem.textContent = `${list.length} môn (${totalCredits} tín chỉ)`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: var(--color-danger-text); padding: 1rem;">Lỗi: ${err.message}</td></tr>`;
  }
}

// 4. Hủy đăng ký môn học
async function handleCancel(maDangKy, maLHP) {
  if (!confirm(`Bạn có chắc chắn muốn hủy đăng ký lớp học phần ${maLHP}?`)) return;

  const user = api.getCurrentUser();
  try {
    await api.delete(`/registrations/${maDangKy}`, { maSV: user.maSV });
    showToast(`Đã hủy học phần ${maLHP} thành công.`, 'success');
    loadAvailableCourses(currentPage);
    loadMyRegistrations();
    loadSchedule();
    loadGrades();
  } catch (err) {
    showToast(`Hủy thất bại: ${err.message}`, 'danger');
  }
}

// 5. Tải Thời khóa biểu tuần
async function loadSchedule() {
  const user = api.getCurrentUser();
  if (!user || !user.maSV) return;

  const container = document.getElementById('timetable-container');
  try {
    const semester = await api.getCurrentSemester();
    if (!semester) {
      container.innerHTML = `<div class="empty-state" role="status" style="padding: 1.5rem; color: var(--color-text-muted);">Chưa có học kỳ hiện tại. Thời khóa biểu sẽ hiển thị khi nhà trường mở học kỳ.</div>`;
      return;
    }
    const list = await api.get(`/students/${user.maSV}/schedule`, { maHocKy: semester.maHocKy });

    // Xây dựng ma trận 10 tiết x 6 ngày (Thứ 2 đến Thứ 7)
    let gridHtml = `
      <div class="timetable-grid">
        <div class="timetable-header">Tiết</div>
        <div class="timetable-header">Thứ 2</div>
        <div class="timetable-header">Thứ 3</div>
        <div class="timetable-header">Thứ 4</div>
        <div class="timetable-header">Thứ 5</div>
        <div class="timetable-header">Thứ 6</div>
        <div class="timetable-header">Thứ 7</div>
    `;

    for (let period = 1; period <= 10; period++) {
      gridHtml += `<div class="timetable-cell timetable-time">Tiết ${period}</div>`;
      for (let day = 2; day <= 7; day++) {
        // Tìm môn học vào Thứ `day` và Tiết `period`
        const course = list.find(c => c.thu === day && period >= c.tietBatDau && period < c.tietBatDau + c.soTiet);
        if (course) {
          if (period === course.tietBatDau) {
            gridHtml += `
              <div class="timetable-cell timetable-slot occupied" style="grid-row: span ${course.soTiet};">
                <div class="slot-title">${course.tenMonHoc}</div>
                <div class="slot-room">Phòng: ${course.phongHoc}</div>
                <div class="slot-room">GV: ${course.hoTenGiangVien}</div>
              </div>
            `;
          }
          // Các tiết tiếp theo trong span không render div để CSS grid merge
        } else {
          // Kiểm tra xem tiết hiện tại có bị môn trước chiếm không
          const coveringCourse = list.find(c => c.thu === day && period > c.tietBatDau && period < c.tietBatDau + c.soTiet);
          if (!coveringCourse) {
            gridHtml += `<div class="timetable-cell timetable-slot"></div>`;
          }
        }
      }
    }

    gridHtml += `</div>`;
    container.innerHTML = gridHtml;
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 1rem;">Lỗi tải thời khóa biểu: ${err.message}</div>`;
  }
}

// 6. Tải Bảng điểm chi tiết phân theo từng học kỳ
async function loadGrades() {
  const user = api.getCurrentUser();
  if (!user || !user.maSV) return;

  const container = document.getElementById('grades-container');
  const semesterSelect = document.getElementById('filter-grade-semester');
  const gpaElem = document.getElementById('summary-gpa');
  const creditsElem = document.getElementById('summary-credits');

  const selectedSemester = semesterSelect ? semesterSelect.value : '';

  if (container) {
    container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">Đang tải bảng điểm...</div>`;
  }

  try {
    const data = await api.get(`/students/${user.maSV}/grades`, {
      maHocKy: selectedSemester || undefined
    });

    if (gpaElem) gpaElem.textContent = data.summary.gpa.toFixed(2);
    if (creditsElem) creditsElem.textContent = data.summary.tongTinChiTichLuy;

    // Cập nhật danh sách học kỳ vào dropdown nếu chưa có
    if (semesterSelect && semesterSelect.options.length <= 1 && data.semesters) {
      data.semesters.forEach(sem => {
        const opt = document.createElement('option');
        opt.value = sem.maHocKy;
        opt.textContent = `${sem.namHoc} - ${sem.tenHocKy}`;
        semesterSelect.appendChild(opt);
      });
    }

    if (!data.semesters || data.semesters.length === 0) {
      if (container) {
        container.innerHTML = `<div style="text-align: center; color: var(--color-text-muted); padding: 2rem;">Chưa có dữ liệu điểm học phần cho học kỳ này.</div>`;
      }
      return;
    }

    // Render từng học kỳ thành một Section Card độc lập
    const html = data.semesters.map(sem => {
      return `
        <div class="semester-grade-card">
          <div class="semester-grade-header">
            <div class="semester-grade-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
              </svg>
              ${sem.namHoc} - ${sem.tenHocKy}
            </div>
            <span class="badge badge-info">${sem.grades.length} môn học</span>
          </div>

          <div class="table-responsive">
            <table class="table" style="margin-bottom: 0; min-width: 850px;">
              <thead>
                <tr>
                  <th style="width: 100px;">Mã môn</th>
                  <th style="min-width: 180px;">Tên môn học</th>
                  <th style="width: 80px; text-align: center;">Số TC</th>
                  <th style="width: 90px; text-align: right;">Quá trình</th>
                  <th style="width: 90px; text-align: right;">Giữa kỳ</th>
                  <th style="width: 90px; text-align: right;">Cuối kỳ</th>
                  <th style="width: 100px; text-align: right;">Tổng kết</th>
                  <th style="width: 90px; text-align: center;">Điểm chữ</th>
                  <th style="width: 110px; text-align: center;">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                ${sem.grades.map(g => {
                  const isPassed = g.ketQua === 'ĐẠT';
                  const isInProgress = g.ketQua === 'ĐANG HỌC';
                  const resultBadge = isInProgress
                    ? `<span class="badge badge-info" style="font-weight: 600;">ĐANG HỌC</span>`
                    : `<span class="badge ${isPassed ? 'badge-success' : 'badge-danger'}">${g.ketQua || 'CHƯA CÓ'}</span>`;
                  return `
                    <tr>
                      <td class="cell-nowrap"><strong>${g.maMonHoc}</strong></td>
                      <td>${g.tenMonHoc}</td>
                      <td class="cell-nowrap" style="text-align: center;"><span class="badge badge-info">${g.soTinChi} TC</span></td>
                      <td class="cell-nowrap" style="text-align: right; font-family: monospace;">${g.diemQuaTrinh !== null && g.diemQuaTrinh !== undefined ? Number(g.diemQuaTrinh).toFixed(1) : '-'}</td>
                      <td class="cell-nowrap" style="text-align: right; font-family: monospace;">${g.diemGiuaKy !== null && g.diemGiuaKy !== undefined ? Number(g.diemGiuaKy).toFixed(1) : '-'}</td>
                      <td class="cell-nowrap" style="text-align: right; font-family: monospace;">${g.diemCuoiKy !== null && g.diemCuoiKy !== undefined ? Number(g.diemCuoiKy).toFixed(1) : '-'}</td>
                      <td class="cell-nowrap" style="text-align: right; font-family: monospace; font-weight: 700; color: var(--color-primary-dark); font-size: 0.9375rem;">
                        ${g.diemTongKet !== null && g.diemTongKet !== undefined ? Number(g.diemTongKet).toFixed(2) : '-'}
                      </td>
                      <td class="cell-nowrap" style="text-align: center;"><strong>${g.diemChu || '-'}</strong></td>
                      <td class="cell-nowrap" style="text-align: center;">
                        ${resultBadge}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Footer tóm tắt chỉ số học kỳ -->
          <div class="semester-summary-bar">
            <div class="semester-metrics">
              <span class="metric-item">Tín chỉ đăng ký: <strong>${sem.soTinChiDangKy} TC</strong></span>
              <span class="metric-item">Tín chỉ tích lũy kỳ: <strong>${sem.soTinChiDat} TC</strong></span>
            </div>
            <div class="semester-metrics">
              <span class="metric-item">Điểm TB học kỳ (GPA HK): ${sem.diemTrungBinhHocKy !== null ? `<span class="badge badge-info" style="font-size: 0.8125rem;">${sem.diemTrungBinhHocKy.toFixed(2)}</span>` : `<span class="badge badge-secondary" style="font-size: 0.8125rem;">Chưa có điểm</span>`}</span>
              <span class="metric-item">Điểm TB tích lũy: ${sem.diemTrungBinhTichLuy !== null ? `<span class="badge badge-primary" style="background: var(--color-primary); color: white; font-size: 0.8125rem;">${sem.diemTrungBinhTichLuy.toFixed(2)}</span>` : `<span class="badge badge-secondary" style="font-size: 0.8125rem;">Chưa có điểm</span>`}</span>
              <span class="metric-item">Xếp loại: <span class="badge ${sem.xepLoaiHocKy === 'Xuất sắc' || sem.xepLoaiHocKy === 'Giỏi' ? 'badge-success' : sem.xepLoaiHocKy === 'Khá' ? 'badge-info' : sem.xepLoaiHocKy === 'Đang học' ? 'badge-info' : 'badge-warning'}">${sem.xepLoaiHocKy}</span></span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (container) {
      container.innerHTML = html;
    }

  } catch (err) {
    if (container) {
      container.innerHTML = `<div style="color: var(--color-danger-text); padding: 1rem; text-align: center;">Lỗi tải bảng điểm: ${err.message}</div>`;
    }
  }
}
