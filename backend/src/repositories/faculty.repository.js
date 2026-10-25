const { getPool } = require('../config/db');

/**
 * Repository tra cứu danh mục Khoa
 */
const getFaculties = async ({ activeOnly }) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT MaKhoa, TenKhoa, Email, SoDienThoai, TrangThai
    FROM dbo.KHOA
    ${activeOnly ? 'WHERE TrangThai = 1' : ''}
    ORDER BY TenKhoa ASC
  `);

  return result.recordset.map(row => ({
    maKhoa: row.MaKhoa,
    tenKhoa: row.TenKhoa,
    email: row.Email,
    soDienThoai: row.SoDienThoai,
    trangThai: row.TrangThai
  }));
};

const getAllFaculties = () => getFaculties({ activeOnly: true });
const getAllFacultiesForStaff = () => getFaculties({ activeOnly: false });

module.exports = {
  getAllFaculties,
  getAllFacultiesForStaff
};
