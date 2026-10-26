process.env.JWT_SECRET = 'test-secret-for-role-binding';
const jwt = require('jsonwebtoken');
const mockAuthPool = { user: 'dbms_app' };
const mockRolePool = { user: 'dbms_training' };

jest.mock('../src/config/db', () => ({
  getAuthPool: jest.fn(async () => mockAuthPool),
  getRolePool: jest.fn(async role => {
    if (role !== 'DAO_TAO') throw new Error('unexpected pool role');
    return mockRolePool;
  }),
  runWithRequestPool: jest.fn((pool, actor, next) => next())
}));
jest.mock('../src/repositories/auth.repository', () => ({
  findById: jest.fn(async () => ({ MaTaiKhoan: 8, Username: 'staff', VaiTro: 'DAO_TAO', TrangThai: 'ACTIVE' }))
}));
const db = require('../src/config/db');
const authRepo = require('../src/repositories/auth.repository');
const { verifyToken } = require('../src/middlewares/auth.middleware');

test('binds request to the active database role, ignoring the role claimed in JWT', async () => {
  const token = jwt.sign({ maTaiKhoan: 8, vaiTro: 'SINH_VIEN' }, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  await verifyToken(req, res, next);

  expect(next).toHaveBeenCalledTimes(1);
  expect(req.user.vaiTro).toBe('DAO_TAO');
  expect(req.dbPool.user).toBe('dbms_training');
  expect(db.runWithRequestPool).toHaveBeenCalledWith(mockRolePool, req.user, next);
  expect(authRepo.findById).toHaveBeenCalledWith(8, { user: 'dbms_app' });
  expect(db.getRolePool).toHaveBeenCalledWith('DAO_TAO');
});
