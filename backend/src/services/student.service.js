const studentRepo = require('../repositories/student.repository');

/**
 * Service xử lý nghiệp vụ tra cứu học vụ của sinh viên
 */
const getSchedule = async (maSV, maHocKy) => {
  return await studentRepo.getSchedule(Number(maSV), maHocKy ? Number(maHocKy) : null);
};

const getGrades = async (maSV, maHocKy) => {
  const grades = await studentRepo.getGrades(Number(maSV), maHocKy ? Number(maHocKy) : null);

  // Tính GPA và tổng số tín chỉ tích lũy (những môn có KetQua = 'ĐẠT')
  let tongTinChiTichLuy = 0;
  let tongDiemNhanTinChi = 0;

  grades.forEach(g => {
    if (g.ketQua === 'ĐẠT' && g.diemTongKet !== null) {
      tongTinChiTichLuy += g.soTinChi;
      tongDiemNhanTinChi += g.diemTongKet * g.soTinChi;
    }
  });

  const gpa = tongTinChiTichLuy > 0 ? Number((tongDiemNhanTinChi / tongTinChiTichLuy).toFixed(2)) : 0;

  // Phân nhóm theo từng học kỳ
  const semesterMap = new Map();
  grades.forEach(g => {
    if (!semesterMap.has(g.maHocKy)) {
      semesterMap.set(g.maHocKy, {
        maHocKy: g.maHocKy,
        namHoc: g.namHoc,
        tenHocKy: g.tenHocKy,
        soTinChiDangKy: 0,
        soTinChiDat: 0,
        tongDiemHocKy: 0,
        tongTCDiemHocKy: 0,
        grades: []
      });
    }

    const sem = semesterMap.get(g.maHocKy);
    sem.grades.push(g);
    sem.soTinChiDangKy += g.soTinChi;

    if (g.ketQua === 'ĐẠT') {
      sem.soTinChiDat += g.soTinChi;
    }

    if (g.diemTongKet !== null) {
      sem.tongDiemHocKy += g.diemTongKet * g.soTinChi;
      sem.tongTCDiemHocKy += g.soTinChi;
    }
  });

  // Tính toán chỉ số cho từng học kỳ và tích lũy theo tiến trình
  let cumulativeCredits = 0;
  let cumulativePoints = 0;

  const semesters = Array.from(semesterMap.values()).map(sem => {
    const diemTrungBinhHocKy = sem.tongTCDiemHocKy > 0 
      ? Number((sem.tongDiemHocKy / sem.tongTCDiemHocKy).toFixed(2)) 
      : null;

    cumulativeCredits += sem.soTinChiDat;
    cumulativePoints += sem.tongDiemHocKy;
    const diemTrungBinhTichLuy = cumulativeCredits > 0
      ? Number((cumulativePoints / cumulativeCredits).toFixed(2))
      : null;

    // Xếp loại học lực học kỳ
    let xepLoaiHocKy = 'Đang học';
    if (diemTrungBinhHocKy !== null) {
      if (diemTrungBinhHocKy >= 9.0) xepLoaiHocKy = 'Xuất sắc';
      else if (diemTrungBinhHocKy >= 8.0) xepLoaiHocKy = 'Giỏi';
      else if (diemTrungBinhHocKy >= 7.0) xepLoaiHocKy = 'Khá';
      else if (diemTrungBinhHocKy >= 5.0) xepLoaiHocKy = 'Trung bình';
      else xepLoaiHocKy = 'Yếu';
    }

    return {
      maHocKy: sem.maHocKy,
      namHoc: sem.namHoc,
      tenHocKy: sem.tenHocKy,
      soTinChiDangKy: sem.soTinChiDangKy,
      soTinChiDat: sem.soTinChiDat,
      diemTrungBinhHocKy,
      diemTrungBinhTichLuy,
      xepLoaiHocKy,
      grades: sem.grades
    };
  });

  // Sắp xếp học kỳ gần nhất lên đầu (Recent first), các học kỳ trước kéo xuống dưới
  semesters.reverse();

  return {
    grades,
    semesters,
    summary: {
      tongTinChiTichLuy,
      gpa
    }
  };
};

const getTuition = async (maSV) => {
  return await studentRepo.getTuition(Number(maSV));
};

const getPaymentHistory = async (maSV, options = {}) => {
  return await studentRepo.getPaymentHistory(Number(maSV), options);
};

const getStudentProfile = async (maSV) => {
  return await studentRepo.getStudentProfile(Number(maSV));
};

module.exports = {
  getSchedule,
  getGrades,
  getTuition,
  getPaymentHistory,
  getStudentProfile
};
