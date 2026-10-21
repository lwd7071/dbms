const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');
const authRepo = require('../repositories/auth.repository');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware xác thực Bearer JWT token
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(
      errorResponse({
        field: 'auth',
        message: 'Yêu cầu đăng nhập để truy cập tài nguyên này.'
      })
    );
  }

  const token = authHeader.slice('Bearer '.length).trim();
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json(
      errorResponse({
        field: 'token',
        message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.'
      })
    );
  }

  if (!Number.isSafeInteger(decoded.maTaiKhoan) || decoded.maTaiKhoan <= 0) {
    return res.status(401).json(errorResponse({
      field: 'token',
      message: 'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.'
    }));
  }

  const account = await authRepo.findById(decoded.maTaiKhoan);
  if (!account || account.TrangThai !== 'ACTIVE') {
    return res.status(401).json(errorResponse({
      field: 'taiKhoan',
      message: 'Tài khoản đã bị khóa hoặc vô hiệu hóa. Vui lòng đăng nhập lại.'
    }));
  }

  req.user = {
    maTaiKhoan: account.MaTaiKhoan,
    username: account.Username,
    vaiTro: account.VaiTro,
    trangThai: account.TrangThai,
    maSV: account.MaSV,
    maSinhVien: account.MaSinhVien,
    maGV: account.MaGV,
    maGiangVien: account.MaGiangVien,
    maLop: account.MaLop || null,
    tenLop: account.TenLopSV || null,
    hoTen: account.HoTenSinhVien || account.HoTenGiangVien || account.Username
  };
  return next();
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

const authorizeCourseStudentQuery = (req, res, next) => {
  if (req.user?.vaiTro !== 'SINH_VIEN') return next();
  if (req.query.maSV !== undefined && String(req.query.maSV) !== String(req.user.maSV)) {
    return res.status(403).json(errorResponse({
      field: 'permission',
      message: 'Không thể tra cứu kế hoạch học tập của sinh viên khác.'
    }));
  }
  req.courseMaSV = req.user.maSV;
  return next();
};

const authorizeLecturerRecord = (req, res, next) => {
  if (req.user?.vaiTro !== 'GIANG_VIEN' || String(req.user.maGV) !== String(req.params.id)) {
    return res.status(403).json(errorResponse({
      field: 'permission',
      message: 'Bạn không có quyền truy cập hồ sơ giảng viên này.'
    }));
  }
  return next();
};

module.exports = {
  verifyToken,
  authorizeRoles,
  authorizeStudentRecord,
  authorizeMyStudentId,
  authorizeLecturerRecord,
  authorizeCourseStudentQuery
};
