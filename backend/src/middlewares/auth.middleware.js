const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');

const JWT_SECRET = process.env.JWT_SECRET || 'dbms330284_super_secret_jwt_key_2026';

/**
 * Middleware xác thực Bearer JWT token
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(
      errorResponse({
        field: 'auth',
        message: 'Yêu cầu đăng nhập để truy cập tài nguyên này.'
      })
    );
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(
      errorResponse({
        field: 'token',
        message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.'
      })
    );
  }
};

/**
 * Middleware kiểm tra quyền truy cập theo vai trò (Role-Based Access Control)
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.vaiTro)) {
      return res.status(403).json(
        errorResponse({
          field: 'permission',
          message: 'Bạn không có quyền truy cập vào chức năng này.'
        })
      );
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
