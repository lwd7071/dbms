const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');

describe('student curriculum API contract', () => {
  const admin = () => requestAs(app, 'admin');

  test('returns the authenticated student curriculum grouped by expected semester', async () => {
    const response = await requestAs(app, 'student', 1).get('/api/students/1/curriculum');
    expect(response.status).toBe(200);
    expect(response.body.data.maCTDT).toBeTruthy();
    expect(response.body.data.hocKy.length).toBeGreaterThan(0);
    expect(response.body.data.hocKy[0]).toEqual(expect.objectContaining({ hocKyDuKien: 1, monHoc: expect.any(Array) }));
    expect(response.body.data.hocKy[0].monHoc[0]).toHaveProperty('hocPhanTienQuyet');
  });

  test('filters curriculum options by faculty and intake year', async () => {
    const response = await admin().get('/api/admin/curriculum-options').query({ maKhoa: 'CNTT', namTuyenSinh: 2024 });
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every(item => item.maKhoa === 'CNTT' && item.namTuyenSinh === 2024)).toBe(true);
  });

  test('returns curriculum courses with faculty, cohort, program, and expected-term filters', async () => {
    const response = await admin().get('/api/admin/curriculums').query({
      maKhoa: 'CNTT', namTuyenSinh: 2024, maCTDT: 'CTDT_CNTT_CQ_24', hocKyDuKien: 1
    });
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data.every(item => item.maKhoa === 'CNTT' && item.namTuyenSinh === 2024 && item.maCTDT === 'CTDT_CNTT_CQ_24'))
      .toBe(true);
    expect(response.body.data.every(item => Object.hasOwn(item, 'hocPhanTienQuyet'))).toBe(true);
  });

  test('does not truncate the complete curriculum catalog at 200 course rows', async () => {
    const response = await admin().get('/api/admin/curriculums');
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(200);
  });

  test('rejects malformed curriculum filters before querying SQL Server', async () => {
    const response = await admin().get('/api/admin/curriculum-options').query({ namTuyenSinh: 'not-a-year' });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('namTuyenSinh');
  });

  test('rejects an invalid expected semester filter', async () => {
    const response = await admin().get('/api/admin/curriculums').query({ hocKyDuKien: 'not-a-term' });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('hocKyDuKien');
  });

  test('rejects assigning a curriculum from another intake year than the class', async () => {
    const response = await admin().post('/api/admin/students').send({
      maSinhVien: `CUR${Date.now()}`,
      hoTen: 'Sai khóa CTĐT',
      maKhoa: 'CNTT',
      maLop: 'CNTT23_01',
      maCTDT: 'CTDT_CNTT_CQ_24'
    });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('maCTDT');
  });
});
