const requestAs = require('./helpers/tokens').requestAs;
const app = require('../src/app');
const { getFixturePool, closePool, sql } = require('../src/config/db');

describe('Lecturer Grade Management APIs', () => {
  let pool;
  const maLHP = 'LHP_HK1_ANHVAN1_01';
  const maSinhVienPrefix = `G${Date.now()}`;
  const maSVs = [];
  const maDangKys = [];

  beforeAll(async () => {
    pool = await getFixturePool();
    for (let index = 0; index < 2; index++) {
      const created = await requestAs(app, 'admin').post('/api/admin/students').send({
        maSinhVien: `${maSinhVienPrefix}${index}`,
        hoTen: `Sinh viên kiểm thử điểm ${index + 1}`,
        maKhoa: 'CNTT',
        maCTDT: 'CTDT_CNTT_CQ',
        trangThai: 'DANG_HOC'
      });
      expect(created.status).toBe(201);
      maSVs.push(created.body.data.maSV);
      const registration = await pool.request()
        .input('MaSV', sql.Int, created.body.data.maSV)
        .input('MaLHP', sql.VarChar(20), maLHP)
        .query("DECLARE @Created TABLE (MaDangKy BIGINT); INSERT INTO dbo.DANGKYTINCHI (MaSV, MaLHP, TrangThai) OUTPUT INSERTED.MaDangKy INTO @Created VALUES (@MaSV, @MaLHP, 'REGISTERED'); SELECT MaDangKy FROM @Created;");
      maDangKys.push(registration.recordset[0].MaDangKy);
    }
  });

  afterAll(async () => {
    try {
      if (maDangKys.length) {
        await pool.request()
          .input('MaDangKy1', sql.BigInt, maDangKys[0])
          .input('MaDangKy2', sql.BigInt, maDangKys[1])
          .query('DELETE FROM dbo.DIEMSO WHERE MaDangKy IN (@MaDangKy1, @MaDangKy2)');
      }
      for (const maSV of maSVs) {
        await pool.request().input('MaSV', sql.Int, maSV).query('DELETE FROM dbo.DANGKYTINCHI WHERE MaSV = @MaSV');
        await pool.request().input('MaSV', sql.Int, maSV).query('DELETE FROM dbo.SINHVIEN WHERE MaSV = @MaSV');
      }
    } finally {
      await closePool();
    }
  });

  it('updates a grade for a class assigned to this lecturer', async () => {
    const response = await requestAs(app, 'lecturer', 2)
      .put(`/api/lecturers/classes/${maLHP}/grades`)
      .send({ grades: [{ maDangKy: maDangKys[0], diemQuaTrinh: 8.5, diemGiuaKy: 7.5, diemCuoiKy: 9 }] });

    expect(response.status).toBe(200);
    expect(response.body.data.updatedCount).toBe(1);
    const check = await pool.request().input('MaDangKy', sql.BigInt, maDangKys[0])
      .query('SELECT DiemQuaTrinh, DiemGiuaKy, DiemCuoiKy, DiemTongKet FROM dbo.V_BangDiemChiTiet WHERE MaDangKy = @MaDangKy');
    expect(check.recordset).toHaveLength(1);
    expect(Number(check.recordset[0].DiemTongKet)).toBe(8.45);
  });

  it('rejects grades outside the 0–10 range and an empty batch', async () => {
    const invalid = await requestAs(app, 'lecturer', 2)
      .put(`/api/lecturers/classes/${maLHP}/grades`)
      .send({ grades: [{ maDangKy: maDangKys[0], diemQuaTrinh: 12 }] });
    expect(invalid.status).toBe(400);

    const empty = await requestAs(app, 'lecturer', 2)
      .put(`/api/lecturers/classes/${maLHP}/grades`)
      .send({ grades: [] });
    expect(empty.status).toBe(400);
  });

  it('rejects malformed class identifiers before querying SQL Server', async () => {
    const response = await requestAs(app, 'lecturer', 2)
      .put('/api/lecturers/classes/bad%20id/grades')
      .send({ grades: [{ maDangKy: maDangKys[0], diemQuaTrinh: 8 }] });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('maLHP');
  });

  it('preserves grade components omitted from a partial update', async () => {
    const lecturer = requestAs(app, 'lecturer', 2);
    await lecturer.put(`/api/lecturers/classes/${maLHP}/grades`)
      .send({ grades: [{ maDangKy: maDangKys[0], diemQuaTrinh: 7, diemGiuaKy: 8, diemCuoiKy: 9 }] });

    const response = await lecturer.put(`/api/lecturers/classes/${maLHP}/grades`)
      .send({ grades: [{ maDangKy: maDangKys[0], diemQuaTrinh: 8.5 }] });

    expect(response.status).toBe(200);
    const check = await pool.request().input('MaDangKy', sql.BigInt, maDangKys[0])
      .query('SELECT DiemQuaTrinh, DiemGiuaKy, DiemCuoiKy FROM dbo.DIEMSO WHERE MaDangKy = @MaDangKy');
    expect(check.recordset[0]).toMatchObject({
      DiemQuaTrinh: 8.5,
      DiemGiuaKy: 8,
      DiemCuoiKy: 9
    });
  });

  it('allows clearing one grade and rejects duplicate registration ids before writing', async () => {
    const lecturer = requestAs(app, 'lecturer', 2);
    const cleared = await lecturer.put(`/api/lecturers/classes/${maLHP}/grades`)
      .send({ grades: [{ maDangKy: maDangKys[0], diemGiuaKy: null }] });
    expect(cleared.status).toBe(200);

    const duplicate = await lecturer.put(`/api/lecturers/classes/${maLHP}/grades`)
      .send({ grades: [
        { maDangKy: maDangKys[0], diemQuaTrinh: 7 },
        { maDangKy: maDangKys[0], diemCuoiKy: 8 }
      ] });
    expect(duplicate.status).toBe(400);
    expect(duplicate.body.errors[0].field).toBe('grades.1.maDangKy');

    const check = await pool.request().input('MaDangKy', sql.BigInt, maDangKys[0])
      .query('SELECT DiemQuaTrinh, DiemGiuaKy, DiemCuoiKy FROM dbo.DIEMSO WHERE MaDangKy = @MaDangKy');
    expect(check.recordset[0].DiemGiuaKy).toBeNull();
  });

  it('updates multiple test-owned registrations in one batch', async () => {
    const response = await requestAs(app, 'lecturer', 2)
      .put(`/api/lecturers/classes/${maLHP}/grades`)
      .send({ grades: [
        { maDangKy: maDangKys[0], diemQuaTrinh: 9, diemGiuaKy: 8, diemCuoiKy: 8.5 },
        { maDangKy: maDangKys[1], diemQuaTrinh: 7, diemGiuaKy: 6.5, diemCuoiKy: 8 }
      ] });
    expect(response.status).toBe(200);
    expect(response.body.data.updatedCount).toBe(2);
  });
});
