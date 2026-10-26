const { getAuthPool, sql } = require('../config/db');

/**
 * Repository thao tác bảng TAIKHOAN và liên kết SINHVIEN / GIANGVIEN
 */
const findByUsername = async (username, pool) => {
  pool = pool || await getAuthPool();
  const result = await pool.request().input('Username', sql.VarChar(50), username).execute('dbo.SP_App_Auth_FindByUsername');
  return result.recordset[0] || null;
};

const findById = async (maTaiKhoan, pool) => {
  pool = pool || await getAuthPool();
  const result = await pool.request().input('MaTaiKhoan', sql.Int, maTaiKhoan).execute('dbo.SP_App_Auth_FindById');
  return result.recordset[0] || null;
};

const updateLastLogin = async (maTaiKhoan, pool) => {
  pool = pool || await getAuthPool();
  await pool.request().input('MaTaiKhoan', sql.Int, maTaiKhoan).execute('dbo.SP_App_Auth_UpdateLastLogin');
};

module.exports = {
  findByUsername,
  findById,
  updateLastLogin
};
