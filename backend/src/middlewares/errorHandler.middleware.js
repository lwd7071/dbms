const { errorResponse } = require('../utils/apiResponse');
const { mapSqlError } = require('../utils/errorMapper');

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Nếu lỗi đến từ SQL Server
  if (err.number) {
    const mapped = mapSqlError(err, req.context || '');
    if (mapped.status >= 500) {
      console.error('💥 SQL Server Internal Error:', err);
    }
    return res.status(mapped.status).json(errorResponse({
      field: mapped.field,
      message: mapped.message
    }));
  }

  // Nếu lỗi HTTP thông thường hoặc lỗi logic
  const status = err.status || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ.';
  const field = err.field || 'server';

  // Chỉ in log với lỗi hệ thống 500 hoặc chưa kiểm soát
  if (status >= 500) {
    console.error('💥 Unhandled Internal Error:', err);
  }

  return res.status(status).json(errorResponse({
    field,
    message
  }));
};

module.exports = {
  errorHandler
};
