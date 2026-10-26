const mockPoolIdentities = new Map();
const createdPools = [];

jest.mock('mssql', () => ({
  ConnectionPool: jest.fn().mockImplementation(config => {
    const expected = mockPoolIdentities.get(config.user);
    const pool = {
      config,
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      request: jest.fn(() => ({
        query: jest.fn().mockResolvedValue({ recordset: [expected] })
      }))
    };
    createdPools.push(pool);
    return pool;
  })
}));

const sql = require('mssql');
const { getAuthPool, getRolePool, closeAllPools } = require('../src/config/db');

const roleUsers = {
  SINH_VIEN: 'dbms_student',
  GIANG_VIEN: 'dbms_lecturer',
  DAO_TAO: 'dbms_training',
  QUAN_TRI: 'dbms_admin'
};

const addIdentity = (user, activeRole = null) => mockPoolIdentities.set(user, {
  databaseUser: user,
  sinhVien: activeRole === 'SINH_VIEN' ? 1 : 0,
  giangVien: activeRole === 'GIANG_VIEN' ? 1 : 0,
  daoTao: activeRole === 'DAO_TAO' ? 1 : 0,
  quanTri: activeRole === 'QUAN_TRI' ? 1 : 0,
  dbOwner: 0,
  dbDataReader: 0,
  dbDataWriter: 0,
  sysadmin: 0
});

beforeEach(() => {
  process.env.DB_USER = 'dbms_app';
  process.env.DB_PASSWORD = 'auth-secret';
  process.env.DB_STUDENT_USER = roleUsers.SINH_VIEN;
  process.env.DB_STUDENT_PASSWORD = 'student-secret';
  process.env.DB_LECTURER_USER = roleUsers.GIANG_VIEN;
  process.env.DB_LECTURER_PASSWORD = 'lecturer-secret';
  process.env.DB_TRAINING_USER = roleUsers.DAO_TAO;
  process.env.DB_TRAINING_PASSWORD = 'training-secret';
  process.env.DB_ADMIN_USER = roleUsers.QUAN_TRI;
  process.env.DB_ADMIN_PASSWORD = 'admin-secret';
  addIdentity('dbms_app');
  Object.entries(roleUsers).forEach(([role, user]) => addIdentity(user, role));
  createdPools.length = 0;
  sql.ConnectionPool.mockClear();
});

afterEach(async () => {
  await closeAllPools();
  mockPoolIdentities.clear();
});

describe('SQL role pools', () => {
  test('connects each web role through its own least-privilege SQL principal', async () => {
    const pool = await getRolePool('DAO_TAO');

    expect(pool.config.user).toBe('dbms_training');
    expect(pool.config.pool).toMatchObject({ min: 0, max: 5 });
    expect(sql.ConnectionPool).toHaveBeenCalledTimes(1);
  });

  test('reuses one connection pool for concurrent requests of the same role', async () => {
    const [first, second] = await Promise.all([
      getRolePool('SINH_VIEN'),
      getRolePool('SINH_VIEN')
    ]);

    expect(first).toBe(second);
    expect(sql.ConnectionPool).toHaveBeenCalledTimes(1);
  });

  test('rejects a SQL login mapped to the wrong database role', async () => {
    addIdentity('dbms_admin', 'DAO_TAO');

    await expect(getRolePool('QUAN_TRI'))
      .rejects.toThrow(/QUAN_TRI/);
    expect(createdPools[0].close).toHaveBeenCalled();
  });

  test('uses the restricted auth principal for login and token checks', async () => {
    const pool = await getAuthPool();

    expect(pool.config.user).toBe('dbms_app');
    expect(pool).toBe(await getAuthPool());
    expect(sql.ConnectionPool).toHaveBeenCalledTimes(1);
  });
});
