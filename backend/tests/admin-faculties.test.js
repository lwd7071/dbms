const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { getFixturePool, sql, closePool } = require('../src/config/db');

const testFacultyCode = `TST${Date.now().toString(36).slice(-6)}`;

beforeAll(async () => {
  const pool = await getFixturePool();
  await pool.request()
    .input('MaKhoa', sql.VarChar(10), testFacultyCode)
    .input('TenKhoa', sql.NVarChar(100), 'Khoa thử nghiệm ngừng hoạt động')
    .query(`
      INSERT INTO dbo.KHOA (MaKhoa, TenKhoa, TrangThai)
      VALUES (@MaKhoa, @TenKhoa, 0)
    `);
});

afterAll(async () => {
  try {
    const pool = await getFixturePool();
    await pool.request().input('MaKhoa', sql.VarChar(10), testFacultyCode)
      .query('DELETE FROM dbo.KHOA WHERE MaKhoa = @MaKhoa');
  } finally {
    await closePool();
  }
});

describe('GET /api/admin/faculties', () => {
  test.each(['training', 'admin'])('%s can view every faculty and its status', async role => {
    const response = await requestAs(app, role).get('/api/admin/faculties');

    expect(response.status).toBe(200);
    const faculty = response.body.data.find(item => item.maKhoa === testFacultyCode);
    expect(faculty).toMatchObject({
      maKhoa: testFacultyCode,
      tenKhoa: 'Khoa thử nghiệm ngừng hoạt động',
      email: null,
      soDienThoai: null,
      trangThai: false
    });
    expect(response.body.data.some(item => item.trangThai === true)).toBe(true);
  });

  test.each(['student', 'lecturer'])('%s cannot view the staff faculty list', async role => {
    const response = await requestAs(app, role).get('/api/admin/faculties');

    expect(response.status).toBe(403);
  });

  test('requires authentication', async () => {
    const response = await request(app).get('/api/admin/faculties');

    expect(response.status).toBe(401);
  });
});
