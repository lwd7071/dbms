const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dbms330284_super_secret_jwt_key_2026';
const token = payload => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

module.exports = {
  studentToken: (maSV = 1) => token({ vaiTro: 'SINH_VIEN', maSV }),
  lecturerToken: (maGV = 1) => token({ vaiTro: 'GIANG_VIEN', maGV }),
  trainingToken: () => token({ vaiTro: 'DAO_TAO', maTaiKhoan: 2 }),
  adminToken: () => token({ vaiTro: 'QUAN_TRI', maTaiKhoan: 1 })
};
