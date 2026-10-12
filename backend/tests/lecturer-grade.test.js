const request = require('supertest');
const app = require('../src/app');
const { getPool, closePool, sql } = require('../src/config/db');

describe('Lecturer Grade Management APIs (PUT /api/lecturers/classes/:maLHP/grades)', () => {
  let pool;

  beforeAll(async () => {
    pool = await getPool();
  });

  afterAll(async () => {
    await closePool();
  });

  // TEST 1 (Tracer Bullet): Giảng viên cập nhật điểm thành công (200 OK)
  it('giảng viên cập nhật điểm của sinh viên trong lớp thành công (200 OK)', async () => {
    const maLHP = 'LHP_HK1_ANHVAN1_01';
    const maDangKy = 10837;

    const payload = {
      grades: [
        {
          maDangKy: maDangKy,
          diemQuaTrinh: 8.5,
          diemGiuaKy: 7.5,
          diemCuoiKy: 9.0
        }
      ]
    };

    const res = await request(app)
      .put(`/api/lecturers/classes/${maLHP}/grades`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data).toHaveProperty('updatedCount', 1);

    // Kiểm tra dữ liệu thực tế trong DB qua view V_BangDiemChiTiet
    const dbCheck = await pool.request()
      .input('MaDangKy', sql.BigInt, maDangKy)
      .query('SELECT DiemQuaTrinh, DiemGiuaKy, DiemCuoiKy, DiemTongKet FROM dbo.V_BangDiemChiTiet WHERE MaDangKy = @MaDangKy');

    expect(dbCheck.recordset.length).toBe(1);
    const row = dbCheck.recordset[0];
    expect(Number(row.DiemQuaTrinh)).toBe(8.5);
    expect(Number(row.DiemGiuaKy)).toBe(7.5);
    expect(Number(row.DiemCuoiKy)).toBe(9.0);
    expect(Number(row.DiemTongKet)).toBe(8.45);
  });

  // TEST 2: Từ chối khi điểm số vượt quá 10 hoặc nhỏ hơn 0 (400 Bad Request)
  it('từ chối khi điểm số không nằm trong khoảng 0.0 đến 10.0 (400 Bad Request)', async () => {
    const maLHP = 'LHP_HK1_ANHVAN1_01';
    const payload = {
      grades: [
        {
          maDangKy: 10837,
          diemQuaTrinh: 12.0 // Sai quy định
        }
      ]
    };

    const res = await request(app)
      .put(`/api/lecturers/classes/${maLHP}/grades`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.isSuccess).toBe(false);
  });

  // TEST 3: Từ chối khi danh sách điểm rỗng (400 Bad Request)
  it('từ chối khi danh sách điểm rỗng (400 Bad Request)', async () => {
    const maLHP = 'LHP_HK1_ANHVAN1_01';
    const res = await request(app)
      .put(`/api/lecturers/classes/${maLHP}/grades`)
      .send({ grades: [] });

    expect(res.status).toBe(400);
    expect(res.body.isSuccess).toBe(false);
  });

  // TEST 4: Cập nhật nhiều sinh viên trong một batch thành công (200 OK)
  it('cập nhật nhiều sinh viên cùng lúc thành công (200 OK)', async () => {
    const maLHP = 'LHP_HK1_ANHVAN1_01';
    const payload = {
      grades: [
        { maDangKy: 10837, diemQuaTrinh: 9.0, diemGiuaKy: 8.0, diemCuoiKy: 8.5 },
        { maDangKy: 13891, diemQuaTrinh: 7.0, diemGiuaKy: 6.5, diemCuoiKy: 8.0 }
      ]
    };

    const res = await request(app)
      .put(`/api/lecturers/classes/${maLHP}/grades`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data.updatedCount).toBe(2);
  });
});
