const jwt = require('jsonwebtoken');
const request = require('supertest');
require('dotenv').config({ quiet: true });

const JWT_SECRET = process.env.JWT_SECRET;
const token = payload => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
const testStudentAccounts = new Map();
const studentAccountId = maSV => testStudentAccounts.get(Number(maSV)) || (Number(maSV) + 29);
const registerStudentAccount = (maSV, maTaiKhoan) => testStudentAccounts.set(Number(maSV), Number(maTaiKhoan));
const removeStudentAccount = maSV => testStudentAccounts.delete(Number(maSV));
const studentToken = (maSV = 1) => token({ maTaiKhoan: studentAccountId(maSV), vaiTro: 'SINH_VIEN', maSV });
const lecturerToken = (maGV = 1) => token({ maTaiKhoan: Number(maGV) + 4, vaiTro: 'GIANG_VIEN', maGV });
const trainingToken = () => token({ vaiTro: 'DAO_TAO', maTaiKhoan: 3 });
const adminToken = () => token({ vaiTro: 'QUAN_TRI', maTaiKhoan: 1 });

const requestAs = (app, role, id = 1) => {
  const tokens = {
    student: studentToken,
    lecturer: lecturerToken,
    training: trainingToken,
    admin: adminToken
  };
  const authorization = `Bearer ${tokens[role](id)}`;
  return Object.fromEntries(['get', 'post', 'put', 'patch', 'delete'].map(method => [
    method,
    (...args) => request(app)[method](...args).set('Authorization', authorization)
  ]));
};

module.exports = {
  studentToken,
  lecturerToken,
  trainingToken,
  adminToken,
  registerStudentAccount,
  removeStudentAccount,
  requestAs
};
