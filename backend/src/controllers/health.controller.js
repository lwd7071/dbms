const { successResponse } = require('../utils/apiResponse');
const { getAuthPool } = require('../config/db');

/**
 * Controller kiểm tra trạng thái hoạt động của hệ thống
 */

// Slice 1: Kiểm tra Express web server độc lập (không chạm DB)
const getAppHealth = (req, res) => {
  return res.status(200).json(
    successResponse({
      status: 'UP',
      timestamp: new Date().toISOString()
    })
  );
};

// Slice 2: Kiểm tra kết nối mssql Connection Pool đến SQL Server
const getDbHealth = async (req, res, next) => {
  try {
    const pool = await getAuthPool();
    const result = await pool.request().query('SELECT @@VERSION AS ServerVersion, DB_NAME() AS CurrentDatabase');

    return res.status(200).json(
      successResponse({
        status: 'UP',
        database: result.recordset[0].CurrentDatabase,
        serverVersion: result.recordset[0].ServerVersion
      })
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAppHealth,
  getDbHealth
};
