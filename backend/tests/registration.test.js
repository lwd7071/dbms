const request = require('supertest');
const app = require('../src/app');
const { closePool, getPool, sql } = require('../src/config/db');
const { requestAs } = require('./helpers/tokens');
const { createStudentAccount, cleanupStudentAccount } = require('./helpers/student-account');

describe('Registration & cancellation transaction endpoints', () => {
  jest.setTimeout(15000);
  let pool;
  let maSV;
  let testAccount;
  let maDangKy;
  const maSinhVien = `T${Date.now()}`;
  const studentRequest = () => requestAs(app, 'student', maSV);

  beforeAll(async () => {
    pool = await getPool();
    const created = await requestAs(app, 'admin').post('/api/admin/students').send({
      maSinhVien,
      hoTen: 'Sinh viên kiểm thử đăng ký',
      maKhoa: 'KTPM',
      maCTDT: 'CTDT_KTPM_CQ',
      trangThai: 'DANG_HOC'
    });
    expect(created.status).toBe(201);
    maSV = created.body.data.maSV;
    testAccount = await createStudentAccount(pool, maSV);

    // Seed only this test-owned student with an overlapping class.
    await pool.request()
      .input('MaSV', sql.Int, maSV)
      .input('MaLHP', sql.VarChar(20), 'LHP_HK7_MOBILE_02')
      .query("INSERT INTO dbo.DANGKYTINCHI (MaSV, MaLHP, TrangThai) VALUES (@MaSV, @MaLHP, 'REGISTERED')");
  });

  afterAll(async () => {
    try {
      if (maSV) {
        await pool.request().input('MaSV', sql.Int, maSV).query('DELETE FROM dbo.DANGKYTINCHI WHERE MaSV = @MaSV');
        if (testAccount) await cleanupStudentAccount(pool, maSV, testAccount.maTaiKhoan);
      }
    } finally {
      await closePool();
    }
  });

  it('rejects missing class input', async () => {
    const response = await studentRequest().post('/api/registrations').send({});
    expect(response.status).toBe(400);
    expect(response.body.errors[0]).toHaveProperty('field', 'maLHP');
  });

  it('rejects attempts to register another student', async () => {
    const response = await studentRequest().post('/api/registrations').send({ maSV: 999999, maLHP: 'LHP_HK7_NMLT_01' });
    expect(response.status).toBe(403);
  });

  it('registers a valid class and then rejects the same subject in the same semester', async () => {
    const created = await studentRequest().post('/api/registrations').send({ maLHP: 'LHP_HK7_ANHVAN1_01' });
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ maSV, maLHP: 'LHP_HK7_ANHVAN1_01', trangThai: 'REGISTERED' });
    maDangKy = created.body.data.maDangKy;

    const duplicate = await studentRequest().post('/api/registrations').send({ maLHP: 'LHP_HK7_ANHVAN1_02' });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.errors[0].field).toBe('maMonHoc');
  });

  it('rejects a schedule conflict and an unmet prerequisite', async () => {
    const conflict = await studentRequest().post('/api/registrations').send({ maLHP: 'LHP_HK7_UIUX_02' });
    expect(conflict.status).toBe(409);
    expect(conflict.body.errors[0].field).toBe('lichHoc');

    const prerequisite = await studentRequest().post('/api/registrations').send({ maLHP: 'LHP_HK7_ANHVAN2_01' });
    expect(prerequisite.status).toBe(409);
    expect(prerequisite.body.errors[0].field).toBe('tienQuyet');
  });

  it('keeps the credit cap inside SQL Server and exposes no client override parameter', async () => {
    const result = await pool.request().query(`
      SELECT
        SUM(CASE WHEN p.name = '@TinChiToiDa' THEN 1 ELSE 0 END) AS OverrideParameters,
        CASE WHEN m.definition LIKE '%> 25%' THEN 1 ELSE 0 END AS HasServerCap
      FROM sys.procedures p
      INNER JOIN sys.sql_modules m ON m.object_id = p.object_id
      WHERE p.object_id = OBJECT_ID('dbo.SP_DangKyTinChi')
      GROUP BY m.definition;
    `);
    expect(result.recordset[0].OverrideParameters || 0).toBe(0);
    expect(result.recordset[0].HasServerCap).toBe(1);
  });

  it('rejects a token that does not resolve to an active database account', async () => {
    const response = await requestAs(app, 'student', 999999)
      .post('/api/registrations').send({ maLHP: 'LHP_HK7_NMLT_01' });
    expect(response.status).toBe(401);
    expect(response.body.errors[0].field).toBe('taiKhoan');
  });

  it('cancels only the registration created by this test', async () => {
    expect(maDangKy).toBeDefined();
    const cancelled = await studentRequest().delete(`/api/registrations/${maDangKy}`).send({});
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.trangThai).toBe('CANCELLED');

    const repeated = await studentRequest().delete(`/api/registrations/${maDangKy}`).send({});
    expect(repeated.status).toBe(404);
  });
});
