const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');

describe('student curriculum API contract', () => {
  const admin = () => requestAs(app, 'admin');

  test('filters curriculum options by faculty and intake year', async () => {
    const response = await admin().get('/api/admin/curriculum-options').query({ maKhoa: 'CNTT', namTuyenSinh: 2024 });
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every(item => item.maKhoa === 'CNTT' && item.namTuyenSinh === 2024)).toBe(true);
  });

  test('rejects malformed curriculum filters before querying SQL Server', async () => {
    const response = await admin().get('/api/admin/curriculum-options').query({ namTuyenSinh: 'not-a-year' });
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('namTuyenSinh');
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
