const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authRepo = require('../repositories/auth.repository');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Service xử lý nghiệp vụ xác thực đăng nhập
 */
const login = async (username, password) => {
  // 1. Tìm tài khoản trong CSDL
  const account = await authRepo.findByUsername(username);
  if (!account) {
    const error = new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
    error.status = 401;
    error.field = 'password';
    throw error;
  }

  // 2. Băm mật khẩu theo chuẩn SHA-256 hex thường (khớp 100% DB)
  const hashInput = crypto.createHash('sha256').update(password).digest('hex');
  if (hashInput.toLowerCase() !== account.PasswordHash.toLowerCase()) {
    const error = new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
    error.status = 401;
    error.field = 'password';
    throw error;
  }

  // 3. Kiểm tra trạng thái tài khoản
  if (account.TrangThai !== 'ACTIVE') {
    const error = new Error('Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa.');
    error.status = 403;
    error.field = 'taiKhoan';
    throw error;
  }

  // 4. Cập nhật thời điểm đăng nhập cuối
  await authRepo.updateLastLogin(account.MaTaiKhoan);

  // 5. Chuẩn bị payload thông tin người dùng
  const userPayload = {
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

  // 6. Ký JWT token
  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '24h' });

  return {
    token,
    user: userPayload
  };
};

module.exports = {
  login
};
