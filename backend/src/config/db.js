/**
 * Cấu hình MSSQL Connection Pool kết nối CSDL DBMS330284
 */
const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME || 'DBMS330284',
  user: process.env.DB_USER || 'dbms_user',
  password: process.env.DB_PASSWORD || 'DbmsPassword@2026',
  options: {
    encrypt: false, // Local SQL Server không bắt buộc mã hóa SSL
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000
  },
  connectionTimeout: 15000,
  requestTimeout: 15000
};

let pool = null;

/**
 * Lấy pool hiện tại hoặc khởi tạo pool mới
 */
const getPool = async () => {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('✅ Kết nối SQL Server DBMS330284 thành công.');
    } catch (err) {
      console.error('❌ Lỗi kết nối SQL Server:', err.message);
      pool = null;
      throw err;
    }
  }
  return pool;
};

/**
 * Đóng kết nối pool (dùng khi tắt server hoặc kết thúc unit test)
 */
const closePool = async () => {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('🔌 Đã đóng kết nối SQL Server Connection Pool.');
  }
};

module.exports = {
  sql,
  getPool,
  closePool
};
