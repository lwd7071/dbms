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
let changedGradeIds = new Set();

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

let currentOpenMaLHP = null;

// 3. Xem danh sách sinh viên và bảng điểm trong lớp (UI/UX Pro Max)
async function viewClassStudents(maLHP, tenMonHoc) {
  const modal = document.getElementById('classStudentsModal');
  const titleElem = document.getElementById('classStudentsModalTitle');
  const countBadge = document.getElementById('classStudentsCountBadge');
  const searchInput = document.getElementById('classStudentSearchInput');
  const classFilter = document.getElementById('classStudentClassFilter');
  const tbody = document.getElementById('classStudentsTbody');
  if (!modal || !tbody) return;

  currentOpenMaLHP = maLHP;

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
    changedGradeIds = new Set();

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

// Tính điểm tổng kết và điểm chữ realtime
function calculateGrade(qt, gk, ck) {
  if (qt === null || gk === null || ck === null || isNaN(qt) || isNaN(gk) || isNaN(ck)) {
    return { diemTongKet: null, diemChu: '-' };
  }
  const total = Number((qt * 0.2 + gk * 0.3 + ck * 0.5).toFixed(2));
  let letter = 'F';
  if (total >= 8.5) letter = 'A';
  else if (total >= 8.0) letter = 'B+';
  else if (total >= 7.0) letter = 'B';
  else if (total >= 6.5) letter = 'C+';
  else if (total >= 5.5) letter = 'C';
  else if (total >= 5.0) letter = 'D+';
  else if (total >= 4.0) letter = 'D';
  else letter = 'F';
  return { diemTongKet: total, diemChu: letter };
}

// Xử lý khi giảng viên nhập điểm vào ô input
function onGradeInputChange(inputElem, maDangKy, field) {
  const valStr = inputElem.value.trim();
  const val = valStr === '' ? null : Number(valStr);

  if (val !== null && (isNaN(val) || val < 0 || val > 10)) {
    inputElem.style.borderColor = '#DC2626';
    inputElem.style.backgroundColor = '#FEF2F2';
  } else {
    inputElem.style.borderColor = '';
    inputElem.style.backgroundColor = '';
  }

  const strId = String(maDangKy);
  const student = currentClassStudents.find(s => String(s.maDangKy) === strId);
  if (student) {
    changedGradeIds.add(strId);
    student[field] = val;
    const { diemTongKet, diemChu } = calculateGrade(student.diemQuaTrinh, student.diemGiuaKy, student.diemCuoiKy);
    student.diemTongKet = diemTongKet;
    student.diemChu = diemChu;

    const totalEl = document.getElementById(`total-grade-${strId}`);
    const letterEl = document.getElementById(`letter-grade-${strId}`);
    if (totalEl) totalEl.textContent = diemTongKet !== null ? diemTongKet.toFixed(2) : '-';
    if (letterEl) {
      letterEl.innerHTML = diemChu !== '-' 
        ? `<span class="badge ${diemChu === 'F' ? 'badge-danger' : 'badge-neutral'}">${diemChu}</span>`
        : '-';
    }
  }
}

// Hàm render bảng sinh viên với ô input điểm
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
    summaryElem.textContent = `Hiển thị ${students.length} sinh viên. Nhập điểm và bấm Lưu bảng điểm.`;
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
      <td class="cell-nowrap" style="text-align: center;">
        <input 
          type="number" 
          class="form-control form-control-sm" 
          min="0" max="10" step="0.1" 
          style="width: 75px; text-align: right; display: inline-block; font-family: monospace; font-size: 0.8125rem;"
          value="${s.diemQuaTrinh !== null && s.diemQuaTrinh !== undefined ? s.diemQuaTrinh : ''}"
          oninput="onGradeInputChange(this, '${s.maDangKy}', 'diemQuaTrinh')"
          placeholder="-"
        >
      </td>
      <td class="cell-nowrap" style="text-align: center;">
        <input 
          type="number" 
          class="form-control form-control-sm" 
          min="0" max="10" step="0.1" 
          style="width: 75px; text-align: right; display: inline-block; font-family: monospace; font-size: 0.8125rem;"
          value="${s.diemGiuaKy !== null && s.diemGiuaKy !== undefined ? s.diemGiuaKy : ''}"
          oninput="onGradeInputChange(this, '${s.maDangKy}', 'diemGiuaKy')"
          placeholder="-"
        >
      </td>
      <td class="cell-nowrap" style="text-align: center;">
        <input 
          type="number" 
          class="form-control form-control-sm" 
          min="0" max="10" step="0.1" 
          style="width: 75px; text-align: right; display: inline-block; font-family: monospace; font-size: 0.8125rem;"
          value="${s.diemCuoiKy !== null && s.diemCuoiKy !== undefined ? s.diemCuoiKy : ''}"
          oninput="onGradeInputChange(this, '${s.maDangKy}', 'diemCuoiKy')"
          placeholder="-"
        >
      </td>
      <td class="cell-nowrap" style="text-align: right; font-weight: 700; font-family: monospace; color: var(--color-primary);" id="total-grade-${s.maDangKy}">
        ${s.diemTongKet !== null && s.diemTongKet !== undefined ? Number(s.diemTongKet).toFixed(2) : '-'}
      </td>
      <td class="cell-nowrap" style="text-align: center; font-weight: 600;" id="letter-grade-${s.maDangKy}">
        ${s.diemChu && s.diemChu !== 'null' ? `<span class="badge ${s.diemChu === 'F' ? 'badge-danger' : 'badge-neutral'}">${s.diemChu}</span>` : '-'}
      </td>
    </tr>
  `).join('');
}

// Lưu bảng điểm cả lớp lên backend API
async function saveClassGrades() {
  if (!currentOpenMaLHP) return;
  const saveBtn = document.getElementById('btnSaveClassGrades');
  const originalText = saveBtn ? saveBtn.innerHTML : '💾 Lưu bảng điểm';

  const changedStudents = currentClassStudents.filter(s => changedGradeIds.has(String(s.maDangKy)));
  if (changedStudents.length === 0) {
    showToast('Chưa có điểm nào thay đổi để lưu', 'info');
    return;
  }

  const invalidGrades = changedStudents.some(s => {
    const check = v => v === null || v === undefined || (!isNaN(v) && v >= 0 && v <= 10);
    return !check(s.diemQuaTrinh) || !check(s.diemGiuaKy) || !check(s.diemCuoiKy);
  });

  if (invalidGrades) {
    showToast('Vui lòng kiểm tra lại: Điểm số phải từ 0.0 đến 10.0', 'warning');
    return;
  }

  const payload = {
    grades: changedStudents.map(s => ({
      maDangKy: Number(s.maDangKy),
      diemQuaTrinh: s.diemQuaTrinh !== null && s.diemQuaTrinh !== undefined ? Number(s.diemQuaTrinh) : null,
      diemGiuaKy: s.diemGiuaKy !== null && s.diemGiuaKy !== undefined ? Number(s.diemGiuaKy) : null,
      diemCuoiKy: s.diemCuoiKy !== null && s.diemCuoiKy !== undefined ? Number(s.diemCuoiKy) : null
    }))
  };

  if (payload.grades.length === 0) {
    showToast('Lớp chưa có sinh viên nào để lưu điểm', 'info');
    return;
  }

  try {
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '⏳ Đang lưu...';
    }

    const res = await api.put(`/lecturers/classes/${currentOpenMaLHP}/grades`, payload);
    showToast(`Đã lưu thành công điểm của ${res.updatedCount || payload.grades.length} sinh viên!`, 'success');
    changedGradeIds.clear();

    // Tải lại danh sách sinh viên từ server để đồng bộ chính xác dữ liệu tính từ CSDL
    const refreshed = await api.get(`/lecturers/classes/${currentOpenMaLHP}/students`);
    currentClassStudents = Array.isArray(refreshed) ? refreshed : [];
    filterClassStudents();
  } catch (err) {
    showToast(`Lỗi khi lưu bảng điểm: ${err.message}`, 'danger');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  }
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
window.onGradeInputChange = onGradeInputChange;
window.saveClassGrades = saveClassGrades;

