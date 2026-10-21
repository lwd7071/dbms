const app = require('../src/app');
const { closePool, getPool, sql } = require('../src/config/db');
const { requestAs } = require('./helpers/tokens');
const { createTuitionFixture } = require('./helpers/tuition-fixture');

describe('Anti-spam pending payment flow', () => {
  let fixture;

  beforeAll(async () => {
    fixture = await createTuitionFixture({ total: 1000000 });
    const created = await requestAs(app, 'student', fixture.maSV)
      .post('/api/payments')
      .send({ maHocPhi: fixture.maHocPhi, soTien: 100000, phuongThuc: 'CHUYEN_KHOAN' });
    expect(created.status).toBe(201);
  });

  afterAll(async () => {
    try {
      if (fixture) await fixture.cleanup();
    } finally {
      await closePool();
    }
  });

  it('returns pending-payment totals for the fixture student', async () => {
    const response = await requestAs(app, 'student', fixture.maSV)
      .get(`/api/students/${fixture.maSV}/tuition`);
    expect(response.status).toBe(200);
    expect(response.body.isSuccess).toBe(true);
    const tuition = response.body.data.find(item => item.maHocPhi === fixture.maHocPhi);
    expect(tuition).toMatchObject({ hasPendingPayment: true, soGiaoDichChoDuyet: 1, soTienChoDuyet: 100000 });
  });

  it('rejects a second payment request while one is pending', async () => {
    const response = await requestAs(app, 'student', fixture.maSV)
      .post('/api/payments')
      .send({ maHocPhi: fixture.maHocPhi, soTien: 50000, phuongThuc: 'CHUYEN_KHOAN' });
    expect(response.status).toBe(409);
    expect(response.body.errors[0].message).toContain('chờ duyệt');
  });

  it('rejects an invalid class filter before listing pending payments', async () => {
    const response = await requestAs(app, 'admin')
      .get(`/api/payments/pending?maLop=${'x'.repeat(21)}`);
    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('maLop');
  });

  it('allows only one concurrent pending payment request for the same tuition record', async () => {
    const raceFixture = await createTuitionFixture({ total: 1000000 });
    try {
      const responses = await Promise.all([
        requestAs(app, 'student', raceFixture.maSV).post('/api/payments')
          .send({ maHocPhi: raceFixture.maHocPhi, soTien: 100000, phuongThuc: 'CHUYEN_KHOAN' }),
        requestAs(app, 'student', raceFixture.maSV).post('/api/payments')
          .send({ maHocPhi: raceFixture.maHocPhi, soTien: 100000, phuongThuc: 'CHUYEN_KHOAN' })
      ]);

      expect(responses.map(response => response.status).sort()).toEqual([201, 409]);
      const pool = await getPool();
      const result = await pool.request()
        .input('MaHocPhi', sql.Int, raceFixture.maHocPhi)
        .query("SELECT COUNT(*) AS PendingCount FROM dbo.CHITIETTHANHTOAN WHERE MaHocPhi = @MaHocPhi AND TrangThai = 'CHO_XAC_NHAN'");
      expect(result.recordset[0].PendingCount).toBe(1);
    } finally {
      await raceFixture.cleanup();
    }
  });
});
