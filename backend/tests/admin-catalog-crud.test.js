const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { getPool, closePool, sql } = require('../src/config/db');

describe('Admin catalog CRUD', () => {
  const suffix = String(Date.now()).slice(-8);
  const courseId = `T${suffix}`;
  const classId = `T${suffix}`;
  let pool;
  let courseCreated = false;
  let classCreated = false;

  beforeAll(async () => { pool = await getPool(); });
  afterAll(async () => {
    if (classCreated) await pool.request().input('id', sql.VarChar(20), classId).query('DELETE dbo.LOPHOCPHAN WHERE MaLHP=@id');
    if (courseCreated) await pool.request().input('id', sql.VarChar(15), courseId).query('DELETE dbo.MONHOC WHERE MaMonHoc=@id');
    await closePool();
  });

  it('creates, updates, lists, and deletes a course and class-section it owns', async () => {
    const admin = requestAs(app, 'admin', 1);
    const course = await admin.post('/api/admin/courses').send({
      maMonHoc: courseId, maKhoa: 'CNTT', tenMonHoc: 'Môn kiểm thử tạm', soTinChi: 2,
      soTietLyThuyet: 30, soTietThucHanh: 0, moTa: 'Fixture tự dọn'
    });
    expect(course.status).toBe(201);
    courseCreated = true;

    const courseUpdate = await admin.put(`/api/admin/courses/${courseId}`).send({
      maKhoa: 'CNTT', tenMonHoc: 'Môn kiểm thử đã sửa', soTinChi: 3,
      soTietLyThuyet: 30, soTietThucHanh: 15, moTa: null, trangThai: true
    });
    expect(courseUpdate.status).toBe(200);
    const courses = await admin.get('/api/admin/courses');
    expect(courses.body.data.some(row => row.maMonHoc === courseId)).toBe(true);

    const section = await admin.post('/api/admin/classes').send({
      maLHP: classId, maMonHoc: courseId, maHocKy: 7, tenLHP: 'Lớp kiểm thử tạm', soLuongToiDa: 20
    });
    expect(section.status).toBe(201);
    classCreated = true;
    const sectionUpdate = await admin.put(`/api/admin/classes/${classId}`).send({
      maMonHoc: courseId, maHocKy: 7, tenLHP: 'Lớp kiểm thử đã sửa', soLuongToiDa: 25,
      trangThai: 'MO_DANG_KY'
    });
    expect(sectionUpdate.status).toBe(409);
    expect(sectionUpdate.body.errors[0].field).toBe('lichHoc');
    expect((await admin.delete(`/api/admin/classes/${classId}`)).status).toBe(200);
    classCreated = false;
    expect((await admin.delete(`/api/admin/courses/${courseId}`)).status).toBe(200);
    courseCreated = false;
  });

  it('rejects invalid catalog input and unauthenticated writes', async () => {
    const invalid = await requestAs(app, 'admin', 1).post('/api/admin/courses').send({ maMonHoc: 'BAD' });
    expect(invalid.status).toBe(400);
    const anonymous = await require('supertest')(app).post('/api/admin/classes').send({});
    expect(anonymous.status).toBe(401);
  });
});
