const { getPool } = require('../config/db');

/**
 * Repository tra cứu danh mục Học kỳ
 */
const getAllSemesters = async () => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT MaHocKy, TenHocKy, NamHoc, TrangThai
    FROM dbo.HOCKY
    ORDER BY MaHocKy DESC
  `);

  return result.recordset.map(row => ({
    maHocKy: row.MaHocKy,
    tenHocKy: row.TenHocKy,
    namHoc: row.NamHoc,
    trangThai: row.TrangThai
  }));
};

const getCurrentSemester = async () => {
  const pool = await getPool();
  // 1. Ưu tiên học kỳ có TrangThai = 'DANG_MO'
  let result = await pool.request().query(`
    SELECT TOP 1 MaHocKy, TenHocKy, NamHoc, TrangThai
    FROM dbo.HOCKY
    WHERE TrangThai = 'DANG_MO'
    ORDER BY MaHocKy DESC
  `);

  if (result.recordset.length > 0) {
    const row = result.recordset[0];
    return {
      maHocKy: row.MaHocKy,
      tenHocKy: row.TenHocKy,
      namHoc: row.NamHoc,
      trangThai: row.TrangThai
    };
  }

  // 2. Fallback: Học kỳ mới nhất có lớp học phần mở đăng ký
  result = await pool.request().query(`
    SELECT TOP 1 hk.MaHocKy, hk.TenHocKy, hk.NamHoc, hk.TrangThai
    FROM dbo.LOPHOCPHAN lhp
    INNER JOIN dbo.HOCKY hk ON lhp.MaHocKy = hk.MaHocKy
    WHERE lhp.TrangThai = 'MO_DANG_KY'
    ORDER BY hk.MaHocKy DESC
  `);

  if (result.recordset.length > 0) {
    const row = result.recordset[0];
    return {
      maHocKy: row.MaHocKy,
      tenHocKy: row.TenHocKy,
      namHoc: row.NamHoc,
      trangThai: row.TrangThai
    };
  }

  return null;
};

module.exports = {
  getAllSemesters,
  getCurrentSemester
};
