const { getPool, sql } = require('../config/db');

/**
 * Repository xử lý dữ liệu cho Giảng viên
 */

// Lấy lịch dạy theo tuần của Giảng viên
const getLecturerSchedule = async (maGV, maHocKy = null) => {
  const pool = await getPool();
  const request = pool.request();
  request.input('MaGV', sql.Int, maGV);

  let query = `
    SELECT 
      lhp.MaLHP,
      lhp.TenLHP,
      lhp.MaMonHoc,
      mh.TenMonHoc,
      mh.SoTinChi,
      hk.MaHocKy,
      hk.NamHoc,
      hk.TenHocKy,
      lh.MaLichHoc,
      lh.Thu,
      lh.TietBatDau,
      lh.SoTiet,
      lh.PhongHoc
    FROM dbo.LOPHOCPHAN lhp
    INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
    INNER JOIN dbo.HOCKY hk ON lhp.MaHocKy = hk.MaHocKy
    INNER JOIN dbo.LICHHOC lh ON lhp.MaLHP = lh.MaLHP
    WHERE lhp.MaGiangVien = @MaGV
  `;

  if (maHocKy) {
    query += ` AND lhp.MaHocKy = @MaHocKy`;
    request.input('MaHocKy', sql.Int, maHocKy);
  }

  query += ` ORDER BY lh.Thu, lh.TietBatDau`;
  const result = await request.query(query);

  return result.recordset.map(r => ({
    maLHP: r.MaLHP,
    tenLHP: r.TenLHP,
    maMonHoc: r.MaMonHoc,
    tenMonHoc: r.TenMonHoc,
    soTinChi: r.SoTinChi,
    maHocKy: r.MaHocKy,
    namHoc: r.NamHoc,
    tenHocKy: r.TenHocKy,
    thu: r.Thu,
    tietBatDau: r.TietBatDau,
    soTiet: r.SoTiet,
    phongHoc: r.PhongHoc
  }));
};

// Lấy danh sách các lớp học phần do Giảng viên phụ trách kèm sĩ số thực tế
const getLecturerClasses = async (maGV) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaGV', sql.Int, maGV)
    .query(`
      SELECT 
        lhp.MaLHP,
        lhp.TenLHP,
        lhp.MaMonHoc,
        mh.TenMonHoc,
        mh.SoTinChi,
        hk.TenHocKy,
        hk.NamHoc,
        lhp.SoLuongToiDa,
        ISNULL(dk.SiSoHienTai, 0) AS SiSoHienTai,
        lhp.TrangThai
      FROM dbo.LOPHOCPHAN lhp
      INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
      INNER JOIN dbo.HOCKY hk ON lhp.MaHocKy = hk.MaHocKy
      OUTER APPLY (
        SELECT COUNT(*) AS SiSoHienTai
        FROM dbo.DANGKYTINCHI d
        WHERE d.MaLHP = lhp.MaLHP AND d.TrangThai = 'REGISTERED'
      ) dk
      WHERE lhp.MaGiangVien = @MaGV
      ORDER BY hk.MaHocKy DESC, lhp.MaLHP ASC;
    `);

  return result.recordset.map(r => ({
    maLHP: r.MaLHP,
    tenLHP: r.TenLHP,
    maMonHoc: r.MaMonHoc,
    tenMonHoc: r.TenMonHoc,
    soTinChi: r.SoTinChi,
    tenHocKy: r.TenHocKy,
    namHoc: r.NamHoc,
    soLuongToiDa: r.SoLuongToiDa,
    siSoHienTai: r.SiSoHienTai,
    trangThai: r.TrangThai
  }));
};

// Lấy danh sách sinh viên và điểm trong một lớp học phần
const getClassStudents = async (maLHP) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaLHP', sql.VarChar(30), maLHP)
    .query(`
      SELECT 
        dk.MaDangKy,
        sv.MaSV,
        sv.MaSinhVien,
        sv.HoTen AS HoTenSinhVien,
        COALESCE(l.TenLop, sv.MaLop) AS LopHoc,
        sv.MaLop,
        bd.DiemQuaTrinh,
        bd.DiemGiuaKy,
        bd.DiemCuoiKy,
        bd.DiemTongKet,
        bd.DiemChu,
        bd.KetQua
      FROM dbo.DANGKYTINCHI dk
      INNER JOIN dbo.SINHVIEN sv ON dk.MaSV = sv.MaSV
      LEFT JOIN dbo.LOP l ON sv.MaLop = l.MaLop
      LEFT JOIN dbo.V_BangDiemChiTiet bd ON bd.MaDangKy = dk.MaDangKy
      WHERE dk.MaLHP = @MaLHP AND dk.TrangThai = 'REGISTERED'
      ORDER BY sv.MaSinhVien ASC;
    `);

  return result.recordset.map(r => ({
    maDangKy: r.MaDangKy,
    maSV: r.MaSV,
    maSinhVien: r.MaSinhVien,
    hoTen: r.HoTenSinhVien,
    lopHoc: r.LopHoc || r.maLop || '',
    maLop: r.MaLop,
    diemQuaTrinh: r.DiemQuaTrinh !== null ? Number(r.DiemQuaTrinh) : null,
    diemGiuaKy: r.DiemGiuaKy !== null ? Number(r.DiemGiuaKy) : null,
    diemCuoiKy: r.DiemCuoiKy !== null ? Number(r.DiemCuoiKy) : null,
    diemTongKet: r.DiemTongKet !== null ? Number(r.DiemTongKet) : null,
    diemChu: r.DiemChu,
    ketQua: r.KetQua
  }));
};

// Cập nhật điểm cho sinh viên trong lớp học phần (UPSERT vào bảng DIEMSO)
const updateClassGrades = async (maLHP, grades) => {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    let updatedCount = 0;
    for (const g of grades) {
      const request = new sql.Request(transaction);
      request.input('MaDangKy', sql.BigInt, g.maDangKy);
      request.input('DiemQuaTrinh', sql.Decimal(4, 2), g.diemQuaTrinh !== undefined ? g.diemQuaTrinh : null);
      request.input('DiemGiuaKy', sql.Decimal(4, 2), g.diemGiuaKy !== undefined ? g.diemGiuaKy : null);
      request.input('DiemCuoiKy', sql.Decimal(4, 2), g.diemCuoiKy !== undefined ? g.diemCuoiKy : null);

      await request.query(`
        IF EXISTS (SELECT 1 FROM dbo.DIEMSO WHERE MaDangKy = @MaDangKy)
        BEGIN
          UPDATE dbo.DIEMSO
          SET DiemQuaTrinh = @DiemQuaTrinh,
              DiemGiuaKy = @DiemGiuaKy,
              DiemCuoiKy = @DiemCuoiKy
          WHERE MaDangKy = @MaDangKy;
        END
        ELSE
        BEGIN
          INSERT INTO dbo.DIEMSO (MaDangKy, DiemQuaTrinh, DiemGiuaKy, DiemCuoiKy, TyTrongQT, TyTrongGK, TyTrongCK)
          VALUES (@MaDangKy, @DiemQuaTrinh, @DiemGiuaKy, @DiemCuoiKy, 20, 30, 50);
        END
      `);
      updatedCount++;
    }

    await transaction.commit();
    return { updatedCount };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

module.exports = {
  getLecturerSchedule,
  getLecturerClasses,
  getClassStudents,
  updateClassGrades
};
