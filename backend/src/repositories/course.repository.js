const { getPool, sql } = require('../config/db');

const getDefaultOpenSemester = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('dbo.SP_App_Course_DefaultOpenSemester');
  return result.recordset[0]?.MaHocKy ?? 7;
};

const findAvailableCourses = async ({ maHocKy, maKhoa, search, type, maSV, page = 1, pageSize = 10 }) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('MaHocKy', sql.Int, maHocKy)
    .input('MaKhoa', sql.VarChar(10), maKhoa || null)
    .input('Search', sql.NVarChar(100), search || null)
    .input('Type', sql.VarChar(10), type || null)
    .input('MaSV', sql.Int, maSV || null)
    .input('Offset', sql.Int, (page - 1) * pageSize)
    .input('PageSize', sql.Int, pageSize)
    .execute('dbo.SP_App_Course_ListAvailable');
  const rows = result.recordsets?.[1] || [];
  return {
    items: rows.map(row => ({
      maLHP: row.MaLHP, tenLHP: row.TenLHP, maMonHoc: row.MaMonHoc, tenMonHoc: row.TenMonHoc,
      soTinChi: row.SoTinChi, soLuongToiDa: row.SoLuongToiDa, siSoHienTai: Number(row.SiSoHienTai),
      laTheoKeHoach: Boolean(row.LaTheoKeHoach), tenGiangVien: row.TenGiangVien || 'Chưa phân công',
      thu: row.Thu, tietBatDau: row.TietBatDau, soTiet: row.SoTiet, phongHoc: row.PhongHoc || 'TBA'
    })),
    totalItems: result.recordsets?.[0]?.[0]?.TotalItems || 0
  };
};
module.exports = { getDefaultOpenSemester, findAvailableCourses };
