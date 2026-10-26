const requestAs = require('./helpers/tokens').requestAs;
const app = require('../src/app');
const { getFixturePool, closePool, sql } = require('../src/config/db');
const { createTuitionFixture } = require('./helpers/tuition-fixture');

describe('Payment confirmation, RBAC, and tuition totals', () => {
  jest.setTimeout(25000);
  let pool;
  let partialFixture;
  let unpaidFixture;
  let multiFixture;
  let createdPaymentId;
  let partialPaymentId;
  let fullPaymentId;
  let rejectedPaymentId;

  beforeAll(async () => {
    pool = await getFixturePool();
    partialFixture = await createTuitionFixture({ total: 8550000, paid: 4275000 });
    unpaidFixture = await createTuitionFixture({ total: 8640000 });
    multiFixture = await createTuitionFixture({ total: 7800000 });
  });

  afterAll(async () => {
    try {
      for (const fixture of [partialFixture, unpaidFixture, multiFixture]) {
        if (fixture) await fixture.cleanup();
      }
    } finally {
      await closePool();
    }
  });

  it('creates a pending student payment without changing paid tuition', async () => {
    const response = await requestAs(app, 'student', partialFixture.maSV)
      .post('/api/payments')
      .send({ maHocPhi: partialFixture.maHocPhi, soTien: 300000, phuongThuc: 'CHUYEN_KHOAN' });
    expect(response.status).toBe(201);
    expect(response.body.data.payment.trangThai).toBe('CHO_XAC_NHAN');
    createdPaymentId = response.body.data.payment.maThanhToan;

    const check = await pool.request().input('MaHocPhi', sql.Int, partialFixture.maHocPhi)
      .query('SELECT SoTienDaThanhToan FROM dbo.HOCPHI WHERE MaHocPhi = @MaHocPhi');
    expect(Number(check.recordset[0].SoTienDaThanhToan)).toBe(4275000);
  });

  it('blocks students and lecturers from confirming a payment', async () => {
    const student = await requestAs(app, 'student', partialFixture.maSV)
      .post(`/api/payments/${createdPaymentId}/confirm`);
    expect(student.status).toBe(403);

    const lecturer = await requestAs(app, 'lecturer', 2)
      .post(`/api/payments/${createdPaymentId}/confirm`);
    expect(lecturer.status).toBe(403);
  });

  it('lets training staff confirm the payment and updates the tuition total', async () => {
    const response = await requestAs(app, 'training')
      .post(`/api/payments/${createdPaymentId}/confirm`);
    expect(response.status).toBe(200);
    expect(response.body.data.payment.trangThai).toBe('DA_XAC_NHAN');
    expect(Number(response.body.data.tuition.soTienDaThanhToan)).toBe(4575000);
  });

  it('marks the tuition fully paid after the remaining balance is confirmed', async () => {
    const created = await requestAs(app, 'student', partialFixture.maSV)
      .post('/api/payments')
      .send({ maHocPhi: partialFixture.maHocPhi, soTien: 3975000, phuongThuc: 'CHUYEN_KHOAN' });
    expect(created.status).toBe(201);
    fullPaymentId = created.body.data.payment.maThanhToan;

    const confirmed = await requestAs(app, 'training').post(`/api/payments/${fullPaymentId}/confirm`);
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.data.tuition.trangThai).toBe('PAID');
    expect(Number(confirmed.body.data.tuition.soTienConLai)).toBe(0);
  });

  it('supports partial payment and rejection without counting rejected money', async () => {
    const partial = await requestAs(app, 'student', unpaidFixture.maSV)
      .post('/api/payments')
      .send({ maHocPhi: unpaidFixture.maHocPhi, soTien: 100000, phuongThuc: 'TIEN_MAT' });
    expect(partial.status).toBe(201);
    partialPaymentId = partial.body.data.payment.maThanhToan;
    const confirmed = await requestAs(app, 'admin').post(`/api/payments/${partialPaymentId}/confirm`);
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.data.tuition.trangThai).toBe('PARTIAL');

    const rejected = await requestAs(app, 'student', unpaidFixture.maSV)
      .post('/api/payments')
      .send({ maHocPhi: unpaidFixture.maHocPhi, soTien: 50000, phuongThuc: 'TIEN_MAT' });
    expect(rejected.status).toBe(201);
    rejectedPaymentId = rejected.body.data.payment.maThanhToan;
    const rejectedResult = await requestAs(app, 'training').post(`/api/payments/${rejectedPaymentId}/reject`);
    expect(rejectedResult.status).toBe(200);
    expect(rejectedResult.body.data.payment.trangThai).toBe('TU_CHOI');

    const total = await pool.request().input('MaHocPhi', sql.Int, unpaidFixture.maHocPhi)
      .query('SELECT SoTienDaThanhToan FROM dbo.HOCPHI WHERE MaHocPhi = @MaHocPhi');
    expect(Number(total.recordset[0].SoTienDaThanhToan)).toBe(100000);
  });

  it('rejects repeated confirmation and overpayment', async () => {
    const repeated = await requestAs(app, 'training').post(`/api/payments/${createdPaymentId}/confirm`);
    expect(repeated.status).toBe(409);

    const rejectedAgain = await requestAs(app, 'training').post(`/api/payments/${rejectedPaymentId}/confirm`);
    expect(rejectedAgain.status).toBe(409);

    const overpaid = await requestAs(app, 'student', unpaidFixture.maSV)
      .post('/api/payments')
      .send({ maHocPhi: unpaidFixture.maHocPhi, soTien: 999999999, phuongThuc: 'CHUYEN_KHOAN' });
    expect(overpaid.status).toBe(409);
  });

  it('recalculates tuition correctly for multi-row payment updates', async () => {
    const inserted = await pool.request()
      .input('MaHocPhi', sql.Int, multiFixture.maHocPhi)
      .query(`
        DECLARE @Created TABLE (MaThanhToan BIGINT);
        INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, PhuongThuc, TrangThai)
        OUTPUT INSERTED.MaThanhToan INTO @Created
        VALUES (@MaHocPhi, 10000, 'TIEN_MAT', 'CHO_XAC_NHAN'),
               (@MaHocPhi, 20000, 'TIEN_MAT', 'CHO_XAC_NHAN');
        SELECT MaThanhToan FROM @Created;
      `);
    const [first, second] = inserted.recordset.map(row => row.MaThanhToan);
    await pool.request()
      .input('First', sql.BigInt, first)
      .input('Second', sql.BigInt, second)
      .query("UPDATE dbo.CHITIETTHANHTOAN SET TrangThai = 'DA_XAC_NHAN', MaTaiKhoanXacNhan = 1, NgayXacNhan = SYSUTCDATETIME() WHERE MaThanhToan IN (@First, @Second)");
    const total = await pool.request().input('MaHocPhi', sql.Int, multiFixture.maHocPhi)
      .query('SELECT SoTienDaThanhToan FROM dbo.HOCPHI WHERE MaHocPhi = @MaHocPhi');
    expect(Number(total.recordset[0].SoTienDaThanhToan)).toBe(30000);
    await pool.request().input('First', sql.BigInt, first).input('Second', sql.BigInt, second)
      .query('DELETE FROM dbo.CHITIETTHANHTOAN WHERE MaThanhToan IN (@First, @Second)');
  });

  it('returns the tuition report to authorized staff', async () => {
    const response = await requestAs(app, 'admin').get('/api/admin/reports/tuition').query({ maHocKy: 1 });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
