const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { getPool, sql, closePool } = require('../src/config/db');

const suffix = Date.now().toString(36).slice(-6).toUpperCase();
const facultyCode = `F${suffix}`;
const facultyName = `Khoa CRUD ${suffix}`;
const majorCode = `M${suffix}`;
const classCode = `L${suffix}`;
const curriculumCode = `CTDT_${suffix}`;

afterAll(async () => {
  try {
    const pool = await getPool();
    await pool.request().input('curriculum', sql.VarChar(24), curriculumCode).query('DELETE dbo.CHUONGTRINHDAOTAO WHERE MaCTDT=@curriculum');
    await requestAs(app, 'training').delete(`/api/admin/homeroom-classes/${classCode}`);
    await requestAs(app, 'training').delete(`/api/admin/majors/${majorCode}`);
    await requestAs(app, 'training').delete(`/api/admin/faculties/${facultyCode}`);
  } finally { await closePool(); }
});

describe('admin faculty and major CRUD', () => {
  it('creates a faculty through the admin API', async () => {
    const response = await requestAs(app, 'training').post('/api/admin/faculties').send({
      maKhoa: facultyCode,
      tenKhoa: facultyName,
      email: `crud-${suffix.toLowerCase()}@university.edu.vn`,
      soDienThoai: '02838123456',
      trangThai: true
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ maKhoa: facultyCode, tenKhoa: facultyName, trangThai: true });
  });

  it('requires an authorized role to create a faculty', async () => {
    const response = await request(app).post('/api/admin/faculties').send({
      maKhoa: facultyCode, tenKhoa: facultyName
    });
    expect(response.status).toBe(401);
    expect((await requestAs(app, 'student').post('/api/admin/faculties').send({ maKhoa: facultyCode, tenKhoa: facultyName })).status).toBe(403);
  });

  it('updates a faculty and allows status changes', async () => {
    const updated = await requestAs(app, 'admin').put(`/api/admin/faculties/${facultyCode}`).send({
      tenKhoa: `${facultyName} đã sửa`, email: null, soDienThoai: null, trangThai: false
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ maKhoa: facultyCode, tenKhoa: `${facultyName} đã sửa`, trangThai: false });

  });

  it('creates and edits a major', async () => {
    const created = await requestAs(app, 'training').post('/api/admin/majors').send({
      maNganh: majorCode, maKhoa: facultyCode, tenNganh: `Ngành CRUD ${suffix}`, moTa: null, trangThai: true
    });
    expect(created.status).toBe(201);
    const facultyDelete = await requestAs(app, 'training').delete(`/api/admin/faculties/${facultyCode}`);
    expect(facultyDelete.status).toBe(409);
    expect(facultyDelete.body.errors[0]).toMatchObject({ field: 'maKhoa', message: expect.stringContaining('tham chiếu') });

    const updated = await requestAs(app, 'training').put(`/api/admin/majors/${majorCode}`).send({
      maKhoa: facultyCode, tenNganh: `Ngành CRUD ${suffix} sửa`, moTa: 'Đã cập nhật', trangThai: false
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ maNganh: majorCode, tenNganh: `Ngành CRUD ${suffix} sửa`, trangThai: false });

  });

  it('blocks deleting a major referenced by a curriculum and allows it after unlinking', async () => {
    const pool = await getPool();
    await pool.request().input('curriculum', sql.VarChar(24), curriculumCode)
      .input('major', sql.VarChar(10), majorCode).input('name', sql.NVarChar(150), `CTĐT test ${suffix}`)
      .query(`INSERT dbo.CHUONGTRINHDAOTAO (MaCTDT,MaNganh,TenCTDT,KhoaHoc,NamTuyenSinh,TongTinChiYeuCau,ThoiGianDaoTao,TrangThai)
        VALUES (@curriculum,@major,@name,'K99',2099,120,4,1)`);
    const blocked = await requestAs(app, 'training').delete(`/api/admin/majors/${majorCode}`);
    expect(blocked.status).toBe(409);
    expect(blocked.body.errors[0]).toMatchObject({ field: 'maNganh', message: expect.stringContaining('chương trình đào tạo') });

    await pool.request().input('curriculum', sql.VarChar(24), curriculumCode).query('DELETE dbo.CHUONGTRINHDAOTAO WHERE MaCTDT=@curriculum');
    const deleted = await requestAs(app, 'training').delete(`/api/admin/majors/${majorCode}`);
    expect(deleted.status).toBe(200);
  });

  it('creates, edits, and deletes a homeroom class without students', async () => {
    const created = await requestAs(app, 'training').post('/api/admin/homeroom-classes').send({
      maLop: classCode, tenLop: `Lớp CRUD ${suffix}`, maKhoa: facultyCode, khoaHoc: 'K99', namNhapHoc: 2099, trangThai: true
    });
    expect(created.status).toBe(201);

    const updated = await requestAs(app, 'training').put(`/api/admin/homeroom-classes/${classCode}`).send({
      tenLop: `Lớp CRUD ${suffix} sửa`, maKhoa: facultyCode, khoaHoc: 'K99', namNhapHoc: 2099, trangThai: false
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ maLop: classCode, tenLop: `Lớp CRUD ${suffix} sửa`, trangThai: false });

    const deleted = await requestAs(app, 'training').delete(`/api/admin/homeroom-classes/${classCode}`);
    expect(deleted.status).toBe(200);
  });

  it('maps the database trigger to a helpful conflict when deleting a class with students', async () => {
    const classes = await requestAs(app, 'training').get('/api/classes');
    expect(classes.status).toBe(200);
    const occupied = classes.body.data.find(row => Number(row.soLuongSV || 0) > 0);
    expect(occupied).toBeTruthy();

    const invalidEdit = await requestAs(app, 'training').put(`/api/admin/homeroom-classes/${occupied.maLop}`).send({
      tenLop: occupied.tenLop, maKhoa: occupied.maKhoa, khoaHoc: occupied.khoaHoc,
      namNhapHoc: occupied.namNhapHoc + 1, trangThai: occupied.trangThai
    });
    expect(invalidEdit.status).toBe(409);
    expect(invalidEdit.body.errors[0]).toMatchObject({ field: 'maKhoa', message: expect.stringContaining('CTĐT') });

    const response = await requestAs(app, 'training').delete(`/api/admin/homeroom-classes/${occupied.maLop}`);
    expect(response.status).toBe(409);
    expect(response.body.errors[0]).toMatchObject({ field: 'maLop', message: expect.stringContaining('sinh viên') });
  });

  it('deletes the faculty after its test major and class have been removed', async () => {
    const response = await requestAs(app, 'admin').delete(`/api/admin/faculties/${facultyCode}`);
    expect(response.status).toBe(200);
    expect(response.body.data.deleted).toBe(true);
  });
});
