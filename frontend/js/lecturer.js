// frontend/js/lecturer.js
// Quản lý nghiệp vụ cho Giảng viên (Lịch dạy, Danh sách lớp, Bảng điểm sinh viên lớp)

let currentLecturerClasses = [];

// Khởi tạo Cổng Giảng viên
async function initLecturerPortal() {
  const user = api.getCurrentUser();
  if (!user || !user.maGV) return;

  await loadLecturerClasses(user.maGV);
  await loadLecturerSchedule(user.maGV);
}

// 1. Tải danh sách các lớp học phần phụ trách
async function loadLecturerClasses(maGV) {
  const tbody = document.getElementById('lecturer-classes-tbody');
  const countElem = document.getElementById('lecturer-classes-count');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Đang tải danh sách lớp học phần...</td></tr>`;

  try {
    const list = await api.get(`/lecturers/${maGV}/classes`);
    currentLecturerClasses = list || [];

    if (countElem) {
      countElem.textContent = `${currentLecturerClasses.length} lớp học phần`;
    }

    if (currentLecturerClasses.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">Giảng viên chưa được phân công lớp học phần nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = currentLecturerClasses.map(c => {
      const isFull = c.siSoHienTai >= c.soLuongToiDa;
      const percent = Math.min(100, Math.round((c.siSoHienTai / c.soLuongToiDa) * 100));

      return `
        <tr>
          <td class="cell-nowrap"><strong>${c.maLHP}</strong></td>
          <td>
            <div style="font-weight: 600;">${c.tenMonHoc}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">${c.tenLHP}</div>
          </td>
          <td class="cell-nowrap" style="text-align: center;"><span class="badge badge-info">${c.soTinChi} TC</span></td>
          <td class="cell-nowrap">${c.tenHocKy} (${c.namHoc})</td>
          <td style="min-width: 140px;">
            <div style="font-size: 0.8125rem; font-weight: 600; display: flex; justify-content: space-between;">
              <span>${c.siSoHienTai}/${c.soLuongToiDa} SV</span>
              <span style="color: ${isFull ? '#DC2626' : 'inherit'}">${percent}%</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar ${isFull ? 'full' : ''}" style="width: ${percent}%;"></div>
            </div>
          </td>
          <td class="cell-nowrap" style="text-align: center;">
            ${renderStatusBadge(c.trangThai)}
          </td>
          <td class="cell-nowrap" style="text-align: center;">
            <button class="btn btn-sm btn-secondary" onclick="viewClassStudents('${c.maLHP}', '${c.tenMonHoc}')">
              Danh sách SV
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color: var(--color-danger-text); padding: 1.5rem; text-align: center;">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
  }
}

// 2. Tải lịch giảng dạy theo tuần
async function loadLecturerSchedule(maGV) {
  const container = document.getElementById('lecturer-timetable-container');
  if (!container) return;

  try {
    const list = await api.get(`/lecturers/${maGV}/schedule`);

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
        const course = list.find(c => c.thu === day && period >= c.tietBatDau && period < c.tietBatDau + c.soTiet);
        if (course) {
          if (period === course.tietBatDau) {
            gridHtml += `
              <div class="timetable-cell timetable-slot occupied" style="grid-row: span ${course.soTiet}; background-color: #EFF6FF; border-left: 3px solid var(--color-primary);">
                <div class="slot-title">${course.tenMonHoc}</div>
                <div class="slot-room" style="font-weight: 600;">Lớp: ${course.maLHP}</div>
                <div class="slot-room">Phòng: ${course.phongHoc}</div>
              </div>
            `;
          }
        } else {
          const covering = list.find(c => c.thu === day && period > c.tietBatDau && period < c.tietBatDau + c.soTiet);
          if (!covering) {
            gridHtml += `<div class="timetable-cell timetable-slot"></div>`;
          }
        }
      }
    }

    gridHtml += `</div>`;
    container.innerHTML = gridHtml;
  } catch (err) {
    container.innerHTML = `<div style="color: var(--color-danger-text); padding: 1.5rem; text-align: center;">Lỗi tải lịch dạy: ${err.message}</div>`;
  }
}

let currentClassStudents = [];

// Khởi tạo sự kiện đóng modal (Escape và click ngoài backdrop)
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeClassStudentsModal();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('classStudentsModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeClassStudentsModal();
        }
      });
    }
  });
}

// 3. Xem danh sách sinh viên và bảng điểm trong lớp (UI/UX Pro Max)
async function viewClassStudents(maLHP, tenMonHoc) {
  const modal = document.getElementById('classStudentsModal');
  const titleElem = document.getElementById('classStudentsModalTitle');
  const countBadge = document.getElementById('classStudentsCountBadge');
  const searchInput = document.getElementById('classStudentSearchInput');
  const classFilter = document.getElementById('classStudentClassFilter');
  const tbody = document.getElementById('classStudentsTbody');
  if (!modal || !tbody) return;

  // Khóa cuộn trang nền để trải nghiệm cuộn modal mượt mà
  document.body.style.overflow = 'hidden';

  titleElem.textContent = `Lớp ${maLHP} - ${tenMonHoc}`;
  if (countBadge) countBadge.textContent = 'Đang tải...';
  if (searchInput) searchInput.value = '';
  if (classFilter) classFilter.innerHTML = '<option value="">Tất cả lớp sinh hoạt</option>';

  tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--color-text-muted);">Đang tải danh sách sinh viên...</td></tr>`;
  modal.classList.add('show');

  try {
    const students = await api.get(`/lecturers/classes/${maLHP}/students`);
    currentClassStudents = Array.isArray(students) ? students : [];

    // Điền danh sách lớp sinh hoạt vào filter dropdown
    if (classFilter) {
      const distinctClasses = [...new Set(currentClassStudents.map(s => s.lopHoc || s.maLop).filter(Boolean))].sort();
      classFilter.innerHTML = '<option value="">Tất cả lớp sinh hoạt (' + distinctClasses.length + ' lớp)</option>' +
        distinctClasses.map(cls => `<option value="${cls}">${cls}</option>`).join('');
    }

    renderClassStudentsTable(currentClassStudents);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="color: var(--color-danger-text); padding: 2rem; text-align: center;">Lỗi tải: ${err.message}</td></tr>`;
    if (countBadge) countBadge.textContent = 'Lỗi';
  }
}

// Hàm render bảng sinh viên
function renderClassStudentsTable(students) {
  const tbody = document.getElementById('classStudentsTbody');
  const countBadge = document.getElementById('classStudentsCountBadge');
  const summaryElem = document.getElementById('classStudentsStatusSummary');
  if (!tbody) return;

  if (countBadge) {
    if (students.length === currentClassStudents.length) {
      countBadge.textContent = `${students.length} sinh viên`;
    } else {
      countBadge.textContent = `${students.length} / ${currentClassStudents.length} sinh viên`;
    }
  }

  if (summaryElem) {
    summaryElem.textContent = `Hiển thị ${students.length} sinh viên. Cuộn chuột để xem chi tiết.`;
  }

  if (!students || students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
          <div style="font-size: 1.25rem; margin-bottom: 0.5rem;">🔍 Không tìm thấy sinh viên</div>
          <div style="font-size: 0.875rem;">Không có sinh viên nào khớp với bộ lọc tìm kiếm.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = students.map((s, idx) => `
    <tr>
      <td class="cell-nowrap" style="text-align: center; color: var(--color-text-muted);">${idx + 1}</td>
      <td class="cell-nowrap"><strong>${s.maSinhVien}</strong></td>
      <td class="cell-nowrap" style="font-weight: 500;">${s.hoTen}</td>
      <td class="cell-nowrap">
        <span class="badge badge-info" style="font-size: 0.75rem;">
          ${s.lopHoc || s.maLop || '-'}
        </span>
      </td>
      <td class="cell-nowrap" style="text-align: right; font-family: monospace;">${s.diemQuaTrinh !== null ? s.diemQuaTrinh.toFixed(1) : '-'}</td>
      <td class="cell-nowrap" style="text-align: right; font-family: monospace;">${s.diemGiuaKy !== null ? s.diemGiuaKy.toFixed(1) : '-'}</td>
      <td class="cell-nowrap" style="text-align: right; font-family: monospace;">${s.diemCuoiKy !== null ? s.diemCuoiKy.toFixed(1) : '-'}</td>
      <td class="cell-nowrap" style="text-align: right; font-weight: 700; font-family: monospace; color: var(--color-primary);">${s.diemTongKet !== null ? s.diemTongKet.toFixed(2) : '-'}</td>
      <td class="cell-nowrap" style="text-align: center; font-weight: 600;">
        ${s.diemChu ? `<span class="badge ${s.diemChu === 'F' ? 'badge-danger' : 'badge-neutral'}">${s.diemChu}</span>` : '-'}
      </td>
    </tr>
  `).join('');
}

// Hàm lọc sinh viên tức thời
function filterClassStudents() {
  const searchInput = document.getElementById('classStudentSearchInput');
  const classFilter = document.getElementById('classStudentClassFilter');
  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedClass = classFilter ? classFilter.value.trim() : '';

  const filtered = currentClassStudents.filter(s => {
    const matchClass = !selectedClass || (s.lopHoc === selectedClass || s.maLop === selectedClass);
    if (!matchClass) return false;

    if (!keyword) return true;
    const maSV = (s.maSinhVien || '').toLowerCase();
    const hoTen = (s.hoTen || '').toLowerCase();
    const lopHoc = (s.lopHoc || '').toLowerCase();
    const maLop = (s.maLop || '').toLowerCase();

    return maSV.includes(keyword) || hoTen.includes(keyword) || lopHoc.includes(keyword) || maLop.includes(keyword);
  });

  renderClassStudentsTable(filtered);
}

function closeClassStudentsModal() {
  const modal = document.getElementById('classStudentsModal');
  if (modal) modal.classList.remove('show');
  // Khôi phục cuộn trang nền
  document.body.style.overflow = '';
}

window.initLecturerPortal = initLecturerPortal;
window.loadLecturerClasses = loadLecturerClasses;
window.loadLecturerSchedule = loadLecturerSchedule;
window.viewClassStudents = viewClassStudents;
window.closeClassStudentsModal = closeClassStudentsModal;
window.filterClassStudents = filterClassStudents;
