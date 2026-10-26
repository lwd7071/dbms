const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { getFixturePool, closePool, sql } = require('../src/config/db');

describe('Admin class schedule management', () => {
  const suffix = String(Date.now()).slice(-7);
  const classIds = [`Z${suffix}A`, `Z${suffix}B`, `Z${suffix}C`];
  let pool;
  let semesterId;
  let firstScheduleId;
  let classesCreated = [];

  beforeAll(async () => {
    pool = await getFixturePool();
    const semester = await pool.request().query('SELECT TOP (1) MaHocKy FROM dbo.HOCKY ORDER BY MaHocKy');
    semesterId = semester.recordset[0].MaHocKy;
  });

  afterAll(async () => {
    if (classesCreated.length) {
      await pool.request().input('a', sql.VarChar(20), classIds[0]).input('b', sql.VarChar(20), classIds[1])
        .input('c', sql.VarChar(20), classIds[2])
        .query(`UPDATE dbo.LOPHOCPHAN SET TrangThai='DA_KHOA' WHERE MaLHP IN (@a, @b, @c);
          DELETE dbo.DANGKYTINCHI WHERE MaLHP IN (@a, @b, @c);
          DELETE dbo.LICHHOC WHERE MaLHP IN (@a, @b, @c);
          DELETE dbo.LOPHOCPHAN WHERE MaLHP IN (@a, @b, @c);`);
    }
    await closePool();
  });

  it('creates, updates and deletes schedules while database constraints reject room conflicts', async () => {
    const admin = requestAs(app, 'training');
    for (const id of classIds.slice(0, 2)) {
      const created = await admin.post('/api/admin/classes').send({
        maLHP: id, maMonHoc: 'NMLT', maHocKy: semesterId, tenLHP: `Test ${id}`, soLuongToiDa: 20
      });
      expect(created.status).toBe(201);
      classesCreated.push(id);
    }

    const first = await admin.post(`/api/admin/classes/${classIds[0]}/schedules`).send({
      thu: 2, tietBatDau: 1, soTiet: 2, phongHoc: 'P-TEST-01'
    });
    expect(first.status).toBe(201);
    firstScheduleId = first.body.data.maLichHoc;

    const collision = await admin.post(`/api/admin/classes/${classIds[1]}/schedules`).send({
      thu: 2, tietBatDau: 2, soTiet: 2, phongHoc: 'P-TEST-01'
    });
    expect(collision.status).toBe(409);
    expect(collision.body.errors[0].field).toBe('phongHoc');

    const updated = await admin.put(`/api/admin/classes/${classIds[0]}/schedules/${firstScheduleId}`).send({
      thu: 3, tietBatDau: 4, soTiet: 2, phongHoc: 'P-TEST-02'
    });
    expect(updated.status).toBe(200);
    const rows = await admin.get('/api/admin/classes').query({ search: classIds[0] });
    expect(rows.body.data.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ maLHP: classIds[0], thu: 3, tietBatDau: 4, phongHoc: 'P-TEST-02' })
    ]));

    const classPayload = {
      maMonHoc: 'NMLT', maHocKy: semesterId, tenLHP: `Test ${classIds[0]}`, soLuongToiDa: 20,
      schedules: [{ thu: 3, tietBatDau: 4, soTiet: 2, phongHoc: 'P-TEST-02' }]
    };
    expect((await admin.put(`/api/admin/classes/${classIds[0]}`).send({ ...classPayload, trangThai: 'MO_DANG_KY' })).status).toBe(200);
    firstScheduleId = (await admin.get(`/api/admin/classes/${classIds[0]}`)).body.data.schedules[0].maLichHoc;
    const lastSchedule = await admin.delete(`/api/admin/classes/${classIds[0]}/schedules/${firstScheduleId}`);
    expect(lastSchedule.status).toBe(409);
    expect(lastSchedule.body.errors[0].field).toBe('lichHoc');
    expect((await admin.put(`/api/admin/classes/${classIds[0]}`).send({ ...classPayload, trangThai: 'DA_KHOA' })).status).toBe(200);
    firstScheduleId = (await admin.get(`/api/admin/classes/${classIds[0]}`)).body.data.schedules[0].maLichHoc;

    expect((await admin.delete(`/api/admin/classes/${classIds[0]}/schedules/${firstScheduleId}`)).status).toBe(200);

    const noScheduleOpen = await admin.put(`/api/admin/classes/${classIds[1]}`).send({
      maMonHoc: 'NMLT', maHocKy: semesterId, tenLHP: `Test ${classIds[1]}`, soLuongToiDa: 20, trangThai: 'MO_DANG_KY', schedules: []
    });
    expect(noScheduleOpen.status).toBe(409);
    expect(noScheduleOpen.body.errors[0]).toMatchObject({ field: 'lichHoc' });

    const students = await pool.request().query('SELECT TOP (2) MaSV FROM dbo.SINHVIEN ORDER BY MaSV');
    expect(students.recordset).toHaveLength(2);
    for (const student of students.recordset) {
      await pool.request().input('student', sql.Int, student.MaSV).input('classId', sql.VarChar(20), classIds[1])
        .query("INSERT dbo.DANGKYTINCHI (MaSV, MaLHP, TrangThai) VALUES (@student, @classId, 'REGISTERED')");
    }
    const lowerCapacity = await admin.put(`/api/admin/classes/${classIds[1]}`).send({
      maMonHoc: 'NMLT', maHocKy: semesterId, tenLHP: `Test ${classIds[1]}`, soLuongToiDa: 1,
      trangThai: 'DA_KHOA', schedules: []
    });
    expect(lowerCapacity.status).toBe(409);
    expect(lowerCapacity.body.errors[0]).toMatchObject({ field: 'siSo', message: expect.stringContaining('ngưỡng sĩ số') });
    const refuseHistoryDelete = await admin.delete(`/api/admin/classes/${classIds[1]}`);
    expect(refuseHistoryDelete.status).toBe(409);
    expect(refuseHistoryDelete.body.errors[0]).toMatchObject({ field: 'maLHP', message: expect.stringContaining('lịch sử đăng ký') });
  });

  it('creates an open class with its schedule atomically and deletes its schedules with the class', async () => {
    const admin = requestAs(app, 'training');
    const id = classIds[2];
    const created = await admin.post('/api/admin/classes').send({
      maLHP: id, maMonHoc: 'NMLT', maHocKy: semesterId, tenLHP: `Test ${id}`, soLuongToiDa: 20,
      trangThai: 'MO_DANG_KY', schedules: [{ thu: 4, tietBatDau: 3, soTiet: 2, phongHoc: `R${suffix}` }]
    });
    expect(created.status).toBe(201);
    classesCreated.push(id);

    const deleted = await admin.delete(`/api/admin/classes/${id}`);
    expect(deleted.status).toBe(200);
    classesCreated = classesCreated.filter(classId => classId !== id);
    const remaining = await pool.request().input('id', sql.VarChar(20), id).query(`
      SELECT (SELECT COUNT(*) FROM dbo.LOPHOCPHAN WHERE MaLHP=@id) AS ClassCount,
        (SELECT COUNT(*) FROM dbo.LICHHOC WHERE MaLHP=@id) AS ScheduleCount;
    `);
    expect(remaining.recordset[0]).toEqual({ ClassCount: 0, ScheduleCount: 0 });
  });
});
