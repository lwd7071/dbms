const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { getPool, closePool, sql } = require('../src/config/db');

describe('Admin curriculum course management', () => {
  const suffix = String(Date.now()).slice(-8);
  const courseId = `C${suffix}`;
  const otherCourseId = `D${suffix}`;
  let pool;
  let courseCreated = false;
  let otherCourseCreated = false;

  beforeAll(async () => { pool = await getPool(); });
  afterAll(async () => {
    await pool.request().input('a', sql.VarChar(15), courseId).input('b', sql.VarChar(15), otherCourseId)
      .query('DELETE dbo.MONHOCTIENQUYET WHERE MaMonHoc IN (@a,@b) OR MaMonTienQuyet IN (@a,@b)');
    await pool.request().input('a', sql.VarChar(15), courseId).input('b', sql.VarChar(15), otherCourseId)
      .query('DELETE dbo.CTDT_MONHOC WHERE MaMonHoc IN (@a,@b)');
    if (courseCreated) await pool.request().input('id', sql.VarChar(15), courseId).query('DELETE dbo.MONHOC WHERE MaMonHoc=@id');
    if (otherCourseCreated) await pool.request().input('id', sql.VarChar(15), otherCourseId).query('DELETE dbo.MONHOC WHERE MaMonHoc=@id');
    await closePool();
  });

  it('creates, updates, and removes a course in one curriculum without deleting its catalog entry', async () => {
    const admin = requestAs(app, 'training');
    const route = '/api/admin/curriculums/CTDT_CNTT_CQ/courses';
    const input = {
      course: {
        maMonHoc: courseId, maKhoa: 'CNTT', tenMonHoc: 'Môn CTĐT kiểm thử', soTinChi: 2,
        soTietLyThuyet: 30, soTietThucHanh: 0, moTa: 'Fixture tự dọn'
      },
      placement: { hocKyDuKien: 8, loaiMon: 'TU_CHON', thuTu: 30 },
      prerequisites: [{ maMonTienQuyet: 'NMLT', mucDo: 'BAT_BUOC' }]
    };

    const created = await admin.post(route).send(input);
    expect(created.status).toBe(201);
    courseCreated = true;
    let rows = await admin.get('/api/admin/curriculums').query({ maCTDT: 'CTDT_CNTT_CQ' });
    expect(rows.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        maMonHoc: courseId,
        hocKyDuKien: 8,
        loaiMon: 'TU_CHON',
        hocPhanTienQuyetChiTiet: [expect.objectContaining({ maMonHoc: 'NMLT', mucDo: 'BAT_BUOC' })]
      })
    ]));

    const otherCreated = await admin.post(route).send({
      course: { ...input.course, maMonHoc: otherCourseId, tenMonHoc: 'Môn vòng kiểm thử' },
      placement: { hocKyDuKien: 8, loaiMon: 'TU_CHON', thuTu: 32 }, prerequisites: []
    });
    expect(otherCreated.status).toBe(201);
    otherCourseCreated = true;
    const firstEdge = await admin.put(`${route}/${courseId}`).send({
      ...input, prerequisites: [{ maMonTienQuyet: otherCourseId, mucDo: 'BAT_BUOC' }]
    });
    expect(firstEdge.status).toBe(200);
    const cycle = await admin.put(`${route}/${otherCourseId}`).send({
      course: { ...input.course, maMonHoc: otherCourseId, tenMonHoc: 'Không được lưu do chu trình' },
      placement: { hocKyDuKien: 9, loaiMon: 'BAT_BUOC', thuTu: 33 },
      prerequisites: [{ maMonTienQuyet: courseId, mucDo: 'BAT_BUOC' }]
    });
    expect(cycle.status).toBe(409);
    expect(cycle.body.errors[0].field).toBe('chuTrinh');
    rows = await admin.get('/api/admin/curriculums').query({ maCTDT: 'CTDT_CNTT_CQ' });
    expect(rows.body.data.find(row => row.maMonHoc === otherCourseId)).toMatchObject({
      tenMonHoc: 'Môn vòng kiểm thử', hocKyDuKien: 8, loaiMon: 'TU_CHON', thuTu: 32, hocPhanTienQuyetChiTiet: []
    });

    const updated = await admin.put(`${route}/${courseId}`).send({
      ...input,
      course: { ...input.course, tenMonHoc: 'Môn CTĐT đã sửa', soTinChi: 3 },
      placement: { hocKyDuKien: 9, loaiMon: 'BAT_BUOC', thuTu: 31 },
      prerequisites: []
    });
    expect(updated.status).toBe(200);
    rows = await admin.get('/api/admin/curriculums').query({ maCTDT: 'CTDT_CNTT_CQ' });
    expect(rows.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ maMonHoc: courseId, tenMonHoc: 'Môn CTĐT đã sửa', soTinChi: 3, hocKyDuKien: 9, loaiMon: 'BAT_BUOC', hocPhanTienQuyetChiTiet: [] })
    ]));

    const removed = await admin.delete(`${route}/${courseId}`);
    expect(removed.status).toBe(200);
    rows = await admin.get('/api/admin/curriculums').query({ maCTDT: 'CTDT_CNTT_CQ' });
    expect(rows.body.data.some(row => row.maMonHoc === courseId)).toBe(false);
    expect((await admin.get('/api/admin/courses')).body.data.some(row => row.maMonHoc === courseId)).toBe(true);
    expect((await admin.get('/api/admin/courses')).body.data.some(row => row.maMonHoc === otherCourseId)).toBe(true);
  });
});
