jest.mock('../src/config/db', () => {
  const requests = [];
  const pool = { request: () => {
    const request = { input: jest.fn().mockReturnThis(), query: jest.fn(async (sqlText) => {
      requests.push(sqlText);
      return { recordset: requests.length === 1 ? [{ TotalItems: 0 }] : [] };
    }) };
    return request;
  }};
  return { getPool: jest.fn(async () => pool), sql: { Int: 'Int', VarChar: () => 'VarChar', NVarChar: () => 'NVarChar' }, __requests: requests };
});

const courseRepository = require('../src/repositories/course.repository');
const db = require('../src/config/db');

describe('course plan filtering', () => {
  test('matches curriculum by the student and derives expected term from academic year', async () => {
    await courseRepository.findAvailableCourses({ maHocKy: 7, maSV: 42, type: 'PLAN' });
    const sql = db.__requests.join('\n');
    expect(sql).toContain('sv.MaCTDT = ctdt.MaCTDT');
    expect(sql).toContain('ctdt.NamTuyenSinh');
    expect(sql).toContain('hk.NgayBatDau');
    expect(sql).not.toContain('ctm.HocKyDuKien = lhp.MaHocKy');
  });
});
