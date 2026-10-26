const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');

describe('Admin course-management request validation', () => {
  it('rejects malformed faculty, major, and homeroom class inputs before database access', async () => {
    const faculty = await requestAs(app, 'training').post('/api/admin/faculties').send({ maKhoa: 'bad code', tenKhoa: '' });
    const major = await requestAs(app, 'training').post('/api/admin/majors').send({ maNganh: 'N01', maKhoa: '', tenNganh: 'Ngành' });
    const homeroomClass = await requestAs(app, 'training').post('/api/admin/homeroom-classes').send({ maLop: 'LOP01', maKhoa: 'CNTT', tenLop: 'Lớp hợp lệ', khoaHoc: 'K25', namNhapHoc: 2025.5 });

    expect(faculty.status).toBe(400);
    expect(faculty.body.errors.some(error => error.field.includes('maKhoa'))).toBe(true);
    expect(major.status).toBe(400);
    expect(major.body.errors.some(error => error.field.includes('maKhoa'))).toBe(true);
    expect(homeroomClass.status).toBe(400);
    expect(homeroomClass.body.errors.some(error => error.field.includes('namNhapHoc'))).toBe(true);
  });

  it('rejects invalid curriculum placement before accessing the database', async () => {
    const response = await requestAs(app, 'training').post('/api/admin/curriculums/CTDT_CNTT_CQ/courses').send({
      course: {
        maMonHoc: 'NEW101', maKhoa: 'CNTT', tenMonHoc: 'Môn mới', soTinChi: 3,
        soTietLyThuyet: 30, soTietThucHanh: 0
      },
      placement: { hocKyDuKien: 0, loaiMon: 'BAT_BUOC', thuTu: -1 },
      prerequisites: []
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: expect.stringContaining('hocKyDuKien') })
    ]));
  });

  it('keeps curriculum management protected from anonymous writes', async () => {
    const response = await require('supertest')(app).post('/api/admin/curriculums/CTDT_CNTT_CQ/courses').send({});
    expect(response.status).toBe(401);
  });

  it('allows both training and admin roles while rejecting unrelated roles', async () => {
    expect((await requestAs(app, 'training').get('/api/admin/lecturers/options')).status).toBe(200);
    expect((await requestAs(app, 'admin').get('/api/admin/lecturers/options')).status).toBe(200);
    expect((await requestAs(app, 'student').get('/api/admin/lecturers/options')).status).toBe(403);
  });

  it('rejects a course as its own prerequisite before database writes', async () => {
    const response = await requestAs(app, 'training').post('/api/admin/curriculums/CTDT_CNTT_CQ/courses').send({
      course: { maMonHoc: 'SELF101', maKhoa: 'CNTT', tenMonHoc: 'Môn tự tiên quyết', soTinChi: 3, soTietLyThuyet: 30, soTietThucHanh: 0 },
      placement: { hocKyDuKien: 1, loaiMon: 'BAT_BUOC', thuTu: 1 },
      prerequisites: [{ maMonTienQuyet: 'SELF101', mucDo: 'BAT_BUOC' }]
    });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toContain('prerequisites');
  });

  it('rejects unsupported prerequisite levels before database writes', async () => {
    const response = await requestAs(app, 'training').post('/api/admin/curriculums/CTDT_CNTT_CQ/courses').send({
      course: { maMonHoc: 'LEVEL101', maKhoa: 'CNTT', tenMonHoc: 'Môn mức tiên quyết', soTinChi: 3, soTietLyThuyet: 30, soTietThucHanh: 0 },
      placement: { hocKyDuKien: 1, loaiMon: 'BAT_BUOC', thuTu: 1 },
      prerequisites: [{ maMonTienQuyet: 'NMLT', mucDo: 'OPTIONAL' }]
    });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toContain('prerequisites');
  });

  it('rejects a schedule extending beyond period 12 before database writes', async () => {
    const response = await requestAs(app, 'training').post('/api/admin/classes').send({
      maLHP: 'INVALID-SCHEDULE', maMonHoc: 'NMLT', maHocKy: 7, tenLHP: 'Lớp sai lịch', soLuongToiDa: 20,
      schedules: [{ thu: 2, tietBatDau: 10, soTiet: 6, phongHoc: 'A101' }]
    });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toContain('soTiet');
  });

  it('validates lecturer status values before querying the database', async () => {
    const response = await requestAs(app, 'training').get('/api/admin/lecturers/options').query({ trangThai: 'ACTIVE' });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toContain('trangThai');
  });

  it('rejects an inverted audit date range before querying the database', async () => {
    const response = await requestAs(app, 'admin').get('/api/admin/audit-logs').query({ tuNgay: '2026-10-20', denNgay: '2026-10-01' });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toContain('denNgay');
  });
});
