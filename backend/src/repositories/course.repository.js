const { getPool, sql } = require('../config/db');

/**
 * Repository tra cứu lớp học phần và tính sĩ số động
 */

// Lấy mã học kỳ đang mở mặc định
const getDefaultOpenSemester = async () => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT TOP 1 MaHocKy, TenHocKy, NamHoc
    FROM dbo.HOCKY
    WHERE TrangThai = 'DANG_MO'
    ORDER BY MaHocKy DESC
  `);

  if (result.recordset.length > 0) {
    return result.recordset[0].MaHocKy;
  }

  // Fallback: Lấy học kỳ mới nhất có lớp học phần mở đăng ký
  const fallbackResult = await pool.request().query(`
    SELECT TOP 1 MaHocKy
    FROM dbo.LOPHOCPHAN
    WHERE TrangThai = 'MO_DANG_KY'
    ORDER BY MaHocKy DESC
  `);

  return fallbackResult.recordset[0] ? fallbackResult.recordset[0].MaHocKy : 7;
};

// Tra cứu danh sách lớp học phần mở đăng ký kèm phân trang
const findAvailableCourses = async ({ maHocKy, maKhoa, search, type, maSV, page = 1, pageSize = 10 }) => {
  const pool = await getPool();
  const request = pool.request();

  request.input('MaHocKy', sql.Int, maHocKy);
  request.input('Offset', sql.Int, (page - 1) * pageSize);
  request.input('PageSize', sql.Int, pageSize);

  if (maSV) {
    request.input('MaSV', sql.Int, maSV);
  } else {
    request.input('MaSV', sql.Int, null);
  }

  let whereClause = `
    WHERE lhp.MaHocKy = @MaHocKy 
      AND lhp.TrangThai = 'MO_DANG_KY'
  `;

  if (maKhoa) {
    whereClause += ` AND mh.MaKhoa = @MaKhoa`;
    request.input('MaKhoa', sql.VarChar(10), maKhoa);
  }

  if (search) {
    whereClause += ` AND (lhp.MaLHP LIKE @Search OR lhp.TenLHP LIKE @Search OR mh.TenMonHoc LIKE @Search OR mh.MaMonHoc LIKE @Search)`;
    request.input('Search', sql.NVarChar(100), `%${search}%`);
  }

  // Điều kiện lọc theo kế hoạch CTĐT của sinh viên
  const planSubquery = `
    EXISTS (
      SELECT 1 
      FROM dbo.CTDT_MONHOC ctm
      INNER JOIN dbo.CHUONGTRINHDAOTAO ctdt ON ctm.MaCTDT = ctdt.MaCTDT
      INNER JOIN dbo.SINHVIEN sv ON sv.MaCTDT = ctdt.MaCTDT
      INNER JOIN dbo.HOCKY hk ON hk.MaHocKy = lhp.MaHocKy
      WHERE sv.MaSV = @MaSV 
        AND ctm.MaMonHoc = lhp.MaMonHoc 
        AND ctm.HocKyDuKien =
          ((YEAR(hk.NgayBatDau) - CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 1 ELSE 0 END
            - ctdt.NamTuyenSinh) * 2)
          + CASE WHEN hk.TenHocKy LIKE N'%2%' THEN 2 ELSE 1 END
    )
  `;

  if (maSV && type === 'PLAN') {
    whereClause += ` AND ${planSubquery}`;
  } else if (maSV && type === 'OTHER') {
    whereClause += ` AND NOT ${planSubquery}`;
  }

  // 1. Query lấy tổng số bản ghi khớp bộ lọc
  const countQuery = `
    SELECT COUNT(*) AS TotalItems
    FROM dbo.LOPHOCPHAN lhp
    INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
    ${whereClause}
  `;
  const countResult = await request.query(countQuery);
  const totalItems = countResult.recordset[0]?.TotalItems || 0;

  // 2. Query lấy danh sách LHP có phân trang và tính sĩ số động
  const dataQuery = `
    SELECT 
      lhp.MaLHP,
      lhp.TenLHP,
      lhp.MaMonHoc,
      mh.TenMonHoc,
      mh.SoTinChi,
      lhp.SoLuongToiDa,
      ISNULL(dk.SiSoHienTai, 0) AS SiSoHienTai,
      CASE 
        WHEN @MaSV IS NOT NULL AND ${planSubquery} THEN 1 
        ELSE 0 
      END AS LaTheoKeHoach,
      gv.HoTen AS TenGiangVien,
      lh.Thu,
      lh.TietBatDau,
      lh.SoTiet,
      lh.PhongHoc
    FROM dbo.LOPHOCPHAN lhp
    INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
    LEFT JOIN dbo.GIANGVIEN gv ON lhp.MaGiangVien = gv.MaGV
    OUTER APPLY (
      SELECT TOP 1 Thu, TietBatDau, SoTiet, PhongHoc
      FROM dbo.LICHHOC lh
      WHERE lh.MaLHP = lhp.MaLHP
      ORDER BY Thu, TietBatDau
    ) lh
    OUTER APPLY (
      SELECT COUNT(*) AS SiSoHienTai
      FROM dbo.DANGKYTINCHI d
      WHERE d.MaLHP = lhp.MaLHP AND d.TrangThai = 'REGISTERED'
    ) dk
    ${whereClause}
    ORDER BY lhp.MaLHP
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
  `;

  const dataResult = await request.query(dataQuery);

  return {
    items: dataResult.recordset.map(row => ({
      maLHP: row.MaLHP,
      tenLHP: row.TenLHP,
      maMonHoc: row.MaMonHoc,
      tenMonHoc: row.TenMonHoc,
      soTinChi: row.SoTinChi,
      soLuongToiDa: row.SoLuongToiDa,
      siSoHienTai: Number(row.SiSoHienTai),
      laTheoKeHoach: Boolean(row.LaTheoKeHoach),
      tenGiangVien: row.TenGiangVien || 'Chưa phân công',
      thu: row.Thu,
      tietBatDau: row.TietBatDau,
      soTiet: row.SoTiet,
      phongHoc: row.PhongHoc || 'TBA'
    })),
    totalItems
  };
};

module.exports = {
  getDefaultOpenSemester,
  findAvailableCourses
};
