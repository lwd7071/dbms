const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { getFixturePool, closePool, sql } = require('../src/config/db');

const suffix = Date.now().toString(36).slice(-6).toUpperCase();
const facultyCode = `F${suffix}`;
const emptyFacultyCode = `E${suffix}`;
const majorCode = `M${suffix}`;
let pool;

beforeAll(async () => {
  pool = await getFixturePool();
  await pool.request().input('faculty', sql.VarChar(10), facultyCode)
    .input('facultyName', sql.NVarChar(100), `Khoa test ${suffix}`)
    .query('INSERT dbo.KHOA (MaKhoa, TenKhoa, TrangThai) VALUES (@faculty, @facultyName, 1)');
  await pool.request().input('faculty', sql.VarChar(10), emptyFacultyCode)
    .input('facultyName', sql.NVarChar(100), `Khoa rỗng test ${suffix}`)
    .query('INSERT dbo.KHOA (MaKhoa, TenKhoa, TrangThai) VALUES (@faculty, @facultyName, 1)');
  await pool.request().input('major', sql.VarChar(10), majorCode).input('faculty', sql.VarChar(10), facultyCode)
    .input('majorName', sql.NVarChar(100), `Ngành test ${suffix}`).input('description', sql.NVarChar(500), 'Ngành ngừng hoạt động dùng để kiểm tra tra cứu.')
    .query('INSERT dbo.NGANH (MaNganh, MaKhoa, TenNganh, MoTa, TrangThai) VALUES (@major, @faculty, @majorName, @description, 0)');
});

afterAll(async () => {
  try {
    await pool.request().input('major', sql.VarChar(10), majorCode).query('DELETE dbo.NGANH WHERE MaNganh=@major');
    await pool.request().input('faculty', sql.VarChar(10), facultyCode).query('DELETE dbo.KHOA WHERE MaKhoa=@faculty');
    await pool.request().input('faculty', sql.VarChar(10), emptyFacultyCode).query('DELETE dbo.KHOA WHERE MaKhoa=@faculty');
  } finally {
    await closePool();
  }
});

describe('GET /api/admin/majors', () => {
  it('filters majors by faculty and includes inactive major details', async () => {
    const response = await requestAs(app, 'training').get('/api/admin/majors').query({ maKhoa: facultyCode });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([expect.objectContaining({
      maNganh: majorCode,
      tenNganh: `Ngành test ${suffix}`,
      maKhoa: facultyCode,
      tenKhoa: `Khoa test ${suffix}`,
      moTa: 'Ngành ngừng hoạt động dùng để kiểm tra tra cứu.',
      trangThai: false
    })]);
  });

  it('lists all majors, including inactive ones, when no faculty filter is selected', async () => {
    const response = await requestAs(app, 'training').get('/api/admin/majors');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ maNganh: majorCode, trangThai: false })]));
  });

  it('returns an empty list for a valid faculty with no majors', async () => {
    const response = await requestAs(app, 'training').get('/api/admin/majors').query({ maKhoa: emptyFacultyCode });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it.each(['training', 'admin'])('%s can view the major directory', async role => {
    const response = await requestAs(app, role).get('/api/admin/majors');

    expect(response.status).toBe(200);
  });

  it.each(['student', 'lecturer'])('%s cannot view the staff major directory', async role => {
    const response = await requestAs(app, role).get('/api/admin/majors');

    expect(response.status).toBe(403);
  });

  it('requires authentication and rejects malformed faculty codes', async () => {
    const anonymous = await request(app).get('/api/admin/majors');
    const malformed = await requestAs(app, 'training').get('/api/admin/majors').query({ maKhoa: 'BAD CODE!' });

    expect(anonymous.status).toBe(401);
    expect(malformed.status).toBe(400);
    expect(malformed.body.errors[0].field).toBe('maKhoa');
  });
});
