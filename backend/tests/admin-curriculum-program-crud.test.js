const app = require('../src/app');
const request = require('supertest');
const { requestAs } = require('./helpers/tokens');
const { getFixturePool, closePool, sql } = require('../src/config/db');
const suffix = Date.now().toString(36).slice(-6).toUpperCase();
const programCode = `CTDT_${suffix}`;
const deletionProgramCode = `DEL_${suffix}`;
const programName = `CTĐT CRUD ${suffix}`;
let programCreated = false;
let deletionProgramCreated = false;

afterAll(async () => {
  try {
    if (programCreated || deletionProgramCreated) {
      const pool = await getFixturePool();
      await pool.request().input('id', sql.VarChar(24), programCode).input('deleteId', sql.VarChar(24), deletionProgramCode)
        .query('DELETE dbo.CTDT_MONHOC WHERE MaCTDT IN (@id,@deleteId); DELETE dbo.CHUONGTRINHDAOTAO WHERE MaCTDT IN (@id,@deleteId);');
    }
  } finally { await closePool(); }
});

describe('Admin curriculum program CRUD', () => {
  it('lists each curriculum program once with its major and faculty metadata', async () => {
    const response = await requestAs(app, 'training').get('/api/admin/curriculum-programs');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        maCTDT: 'CTDT_CNTT_CQ', maNganh: 'N01', nganh: 'Công nghệ thông tin',
        maKhoa: 'CNTT', tenKhoa: expect.any(String), tenCTDT: expect.any(String),
        namTuyenSinh: 2023, khoaHoc: '2023-2027', tongTinChiYeuCau: 135,
        thoiGianDaoTao: 4, trangThai: true
      })
    ]));
    expect(response.body.data.filter(program => program.maCTDT === 'CTDT_CNTT_CQ')).toHaveLength(1);
  });

  it('requires an authorized role and rejects invalid program data', async () => {
    expect((await request(app).get('/api/admin/curriculum-programs')).status).toBe(401);
    expect((await requestAs(app, 'student').get('/api/admin/curriculum-programs')).status).toBe(403);
    expect((await requestAs(app, 'student').post('/api/admin/curriculum-programs').send({
      maCTDT: programCode, maNganh: 'N01', tenCTDT: programName,
      namTuyenSinh: 2099, tongTinChiYeuCau: 120, thoiGianDaoTao: 4
    })).status).toBe(403);

    const invalid = await requestAs(app, 'training').post('/api/admin/curriculum-programs').send({
      maCTDT: programCode, maNganh: 'N01', tenCTDT: programName,
      namTuyenSinh: 1999, tongTinChiYeuCau: 0, thoiGianDaoTao: 0, trangThai: true
    });
    expect(invalid.status).toBe(400);
    expect(invalid.body.errors.map(error => error.field)).toEqual(expect.arrayContaining(['namTuyenSinh', 'tongTinChiYeuCau', 'thoiGianDaoTao']));

    const missingMajor = await requestAs(app, 'training').post('/api/admin/curriculum-programs').send({
      maCTDT: programCode, maNganh: 'N999', tenCTDT: programName,
      namTuyenSinh: 2099, tongTinChiYeuCau: 120, thoiGianDaoTao: 4
    });
    expect(missingMajor.status).toBe(409);
    expect(missingMajor.body.errors[0]).toMatchObject({ field: 'maNganh', message: expect.stringContaining('không tồn tại') });
  });

  it('creates and updates a program with a cohort label derived from year and duration', async () => {
    const admin = requestAs(app, 'training');
    const created = await admin.post('/api/admin/curriculum-programs').send({
      maCTDT: programCode, maNganh: 'N01', tenCTDT: programName,
      namTuyenSinh: 2099, tongTinChiYeuCau: 120, thoiGianDaoTao: 3, trangThai: true
    });
    expect(created.status).toBe(201);
    programCreated = true;
    expect(created.body.data).toMatchObject({ maCTDT: programCode, khoaHoc: '2099-2102', thoiGianDaoTao: 3 });
    const duplicate = await admin.post('/api/admin/curriculum-programs').send({
      maCTDT: programCode, maNganh: 'N01', tenCTDT: `${programName} trùng`,
      namTuyenSinh: 2099, tongTinChiYeuCau: 120, thoiGianDaoTao: 3
    });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.errors[0]).toMatchObject({ field: 'maCTDT' });

    const updated = await admin.put(`/api/admin/curriculum-programs/${programCode}`).send({
      maNganh: 'N01', tenCTDT: `${programName} đã sửa`, namTuyenSinh: 2099,
      tongTinChiYeuCau: 125, thoiGianDaoTao: 4, trangThai: false
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({
      maCTDT: programCode, tenCTDT: `${programName} đã sửa`, khoaHoc: '2099-2103',
      tongTinChiYeuCau: 125, trangThai: false
    });
  });

  it('maps the student consistency trigger when a linked program changes its major or intake year', async () => {
    const admin = requestAs(app, 'training');
    const before = (await admin.get('/api/admin/curriculum-programs')).body.data.find(program => program.maCTDT === 'CTDT_CNTT_CQ');
    expect(before).toBeTruthy();

    const changedMajor = await admin.put('/api/admin/curriculum-programs/CTDT_CNTT_CQ').send({
      maNganh: 'N06', tenCTDT: before.tenCTDT, namTuyenSinh: before.namTuyenSinh,
      tongTinChiYeuCau: before.tongTinChiYeuCau, thoiGianDaoTao: before.thoiGianDaoTao,
      trangThai: before.trangThai
    });
    expect(changedMajor.status).toBe(409);
    expect(changedMajor.body.errors[0]).toMatchObject({ field: 'maNganh', message: expect.stringContaining('sinh viên') });

    const changedYear = await admin.put('/api/admin/curriculum-programs/CTDT_CNTT_CQ').send({
      maNganh: before.maNganh, tenCTDT: before.tenCTDT, namTuyenSinh: 2100,
      tongTinChiYeuCau: before.tongTinChiYeuCau, thoiGianDaoTao: before.thoiGianDaoTao,
      trangThai: before.trangThai
    });
    expect(changedYear.status).toBe(409);
    expect(changedYear.body.errors[0]).toMatchObject({ field: 'namTuyenSinh', message: expect.stringContaining('năm lớp') });

    const after = (await admin.get('/api/admin/curriculum-programs')).body.data.find(program => program.maCTDT === 'CTDT_CNTT_CQ');
    expect(after).toMatchObject({ maNganh: before.maNganh, namTuyenSinh: before.namTuyenSinh, khoaHoc: before.khoaHoc });
  });

  it('updates non-trigger fields on a program with students without touching trigger columns', async () => {
    const admin = requestAs(app, 'training');
    const before = (await admin.get('/api/admin/curriculum-programs')).body.data.find(program => program.maCTDT === 'CTDT_CNTT_CQ');
    const changed = await admin.put('/api/admin/curriculum-programs/CTDT_CNTT_CQ').send({
      maNganh: before.maNganh, tenCTDT: `${before.tenCTDT} tạm`, namTuyenSinh: before.namTuyenSinh,
      tongTinChiYeuCau: before.tongTinChiYeuCau, thoiGianDaoTao: before.thoiGianDaoTao,
      trangThai: before.trangThai
    });
    expect(changed.status).toBe(200);
    expect(changed.body.data.tenCTDT).toBe(`${before.tenCTDT} tạm`);

    const restored = await admin.put('/api/admin/curriculum-programs/CTDT_CNTT_CQ').send({
      maNganh: before.maNganh, tenCTDT: before.tenCTDT, namTuyenSinh: before.namTuyenSinh,
      tongTinChiYeuCau: before.tongTinChiYeuCau, thoiGianDaoTao: before.thoiGianDaoTao,
      trangThai: before.trangThai
    });
    expect(restored.status).toBe(200);
  });

  it('blocks deleting a program with student records and removes only its course placements otherwise', async () => {
    const admin = requestAs(app, 'training');
    const protectedDelete = await admin.delete('/api/admin/curriculum-programs/CTDT_CNTT_CQ');
    expect(protectedDelete.status).toBe(409);
    expect(protectedDelete.body.errors[0]).toMatchObject({ field: 'maCTDT', message: expect.stringContaining('sinh viên') });

    const created = await admin.post('/api/admin/curriculum-programs').send({
      maCTDT: deletionProgramCode, maNganh: 'N01', tenCTDT: `CTĐT xóa ${suffix}`,
      namTuyenSinh: 2098, tongTinChiYeuCau: 120, thoiGianDaoTao: 4, trangThai: true
    });
    expect(created.status).toBe(201);
    deletionProgramCreated = true;
    const pool = await getFixturePool();
    await pool.request().input('id', sql.VarChar(24), deletionProgramCode)
      .query("INSERT dbo.CTDT_MONHOC (MaCTDT,MaMonHoc,HocKyDuKien,LoaiMon,ThuTu) VALUES (@id,'NMLT',1,'BAT_BUOC',1)");

    const deleted = await admin.delete(`/api/admin/curriculum-programs/${deletionProgramCode}`);
    expect(deleted.status).toBe(200);
    const course = await pool.request().query("SELECT 1 AS found FROM dbo.MONHOC WHERE MaMonHoc='NMLT'");
    const placement = await pool.request().input('id', sql.VarChar(24), deletionProgramCode)
      .query('SELECT 1 AS found FROM dbo.CTDT_MONHOC WHERE MaCTDT=@id');
    expect(course.recordset).toHaveLength(1);
    expect(placement.recordset).toHaveLength(0);
  });
});
