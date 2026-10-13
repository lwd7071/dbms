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

const authorizeStudentRecord = (req, res, next) => {
  if (['DAO_TAO', 'QUAN_TRI'].includes(req.user?.vaiTro)) return next();

  if (req.user?.vaiTro !== 'SINH_VIEN' || String(req.user.maSV) !== String(req.params.id)) {
    return res.status(403).json(errorResponse({
      field: 'permission',
      message: 'Bạn không có quyền truy cập hồ sơ sinh viên này.'
    }));
  }

  return next();
};

const authorizeMyStudentId = (req, res, next) => {
  if (req.user?.vaiTro !== 'SINH_VIEN' || !req.user.maSV) {
    return res.status(403).json(errorResponse({
      field: 'permission',
      message: 'Chức năng này chỉ dành cho tài khoản sinh viên.'
    }));
  }

  if (req.body.maSV !== undefined && String(req.body.maSV) !== String(req.user.maSV)) {
    return res.status(403).json(errorResponse({
      field: 'permission',
      message: 'Không thể thao tác đăng ký thay cho sinh viên khác.'
    }));
  }

  if (req.query.maSV !== undefined && String(req.query.maSV) !== String(req.user.maSV)) {
    return res.status(403).json(errorResponse({
      field: 'permission',
      message: 'Không thể xem đăng ký của sinh viên khác.'
    }));
  }

  return next();
};

module.exports = {
  verifyToken,
  authorizeRoles,
  authorizeStudentRecord,
  authorizeMyStudentId
};
