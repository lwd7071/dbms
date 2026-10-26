const { errorResponse } = require('../utils/apiResponse');
const { mapSqlError } = require('../utils/errorMapper');

const isReadableVietnameseMessage = message => /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừữựýỳỷỹỵ]/i.test(message)
  && !/\b(Invalid|expected|received|Exception|TypeError|SyntaxError|SELECT|INSERT|UPDATE|DELETE|SQL|dbo)\b/i.test(message)
  && !/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/.test(message);

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Nếu lỗi đến từ SQL Server
  if (err.number || err.code) {
    const mapped = mapSqlError(err, req.context || '');
    if (mapped.status >= 500 || err.number === 229 || err.number === 230) {
      console.error('💥 SQL Server Internal Error:', err);
    }
    return res.status(mapped.status).json(errorResponse({
      field: mapped.field,
      message: mapped.message
    }));
  }

  // Nếu lỗi HTTP thông thường hoặc lỗi logic
  const status = err.status || 500;
  const clientMessage = typeof err.message === 'string' && isReadableVietnameseMessage(err.message)
    ? err.message
    : 'Yêu cầu chưa được xử lý. Vui lòng kiểm tra lại thông tin.';
  const message = status >= 500
    ? 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.'
    : err.type === 'entity.parse.failed'
      ? 'Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra lại rồi thử lại.'
      : err.type === 'entity.too.large'
        ? 'Dữ liệu gửi lên vượt quá dung lượng cho phép.'
        : clientMessage;
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
