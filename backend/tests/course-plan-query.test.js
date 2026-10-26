const mockCalls = [];
jest.mock('../src/config/db', () => {
  const pool = { request: () => {
    const inputs = {};
    const request = {
      input(name, _type, value) { inputs[name] = value; return request; },
      execute: jest.fn(async procedure => {
        mockCalls.push({ procedure, inputs: { ...inputs } });
        return { recordsets: [[{ TotalItems: 0 }], []] };
      })
    };
    return request;
  }};
  return { getPool: jest.fn(async () => pool), sql: { Int: 'Int', VarChar: () => 'VarChar', NVarChar: () => 'NVarChar' } };
});
const courseRepository = require('../src/repositories/course.repository');

describe('course plan procedure parameters', () => {
  test('passes the student plan filter and pagination to the SQL procedure', async () => {
    await courseRepository.findAvailableCourses({ maHocKy: 7, maSV: 42, type: 'PLAN', page: 2, pageSize: 10 });
    expect(mockCalls[0]).toEqual({
      procedure: 'dbo.SP_App_Course_ListAvailable',
      inputs: { MaHocKy: 7, MaKhoa: null, Search: null, Type: 'PLAN', MaSV: 42, Offset: 10, PageSize: 10 }
    });
  });
});
