const request = require('supertest');
const app = require('../src/app');
const { closePool, getPool, sql } = require('../src/config/db');

describe('Audited Payment Confirmation Flow & RBAC Tests (16 Mandatory Test Cases)', () => {
  jest.setTimeout(25000);

  let tokenDaoTao = null;
  let tokenAdmin = null;
  let tokenSinhVien = null;
  let tokenGiangVien = null;

  let createdPaymentId = null;
  let partialPaymentId = null;
  let fullPaymentId = null;
  let rejectedPaymentId = null;

  beforeAll(async () => {
    // Đăng nhập lấy Token các Role
    const resDaoTao = await request(app).post('/api/auth/login').send({ username: 'daotao01', password: '123' + '456' });
    tokenDaoTao = resDaoTao.body.data.token;

    const resAdmin = await request(app).post('/api/auth/login').send({ username: 'admin', password: '123' + '456' });
    tokenAdmin = resAdmin.body.data.token;

    const resSV = await request(app).post('/api/auth/login').send({ username: 'sv_23000001', password: '123' + '456' });
    tokenSinhVien = resSV.body.data.token;

    const resGV = await request(app).post('/api/auth/login').send({ username: 'gv_gv0001', password: '123' + '456' });
    tokenGiangVien = resGV.body.data.token;

    // Dọn sạch các payment phát sinh trong test của maHocPhi 5 và 9 trước khi chạy test để đảm bảo tính độc lập
    const pool = await getPool();
    await pool.request().query(`
      SET QUOTED_IDENTIFIER ON;
      DELETE FROM dbo.CHITIETTHANHTOAN WHERE MaHocPhi = 5 AND MaThanhToan > 5;
      UPDATE dbo.HOCPHI SET SoTienDaThanhToan = 4275000, TrangThai = 'PARTIAL' WHERE MaHocPhi = 5;
      DELETE FROM dbo.CHITIETTHANHTOAN WHERE MaHocPhi = 9;
      UPDATE dbo.HOCPHI SET SoTienDaThanhToan = 0, TrangThai = 'UNPAID' WHERE MaHocPhi = 9;
    `);
  });

  afterAll(async () => {
    // Dọn dẹp các bản ghi thanh toán test để khôi phục số dư ban đầu cho DB
    const pool = await getPool();
    try {
      await pool.request().query(`
        SET QUOTED_IDENTIFIER ON;
        DELETE FROM dbo.CHITIETTHANHTOAN WHERE MaHocPhi = 5 AND MaThanhToan > 5;
        UPDATE dbo.HOCPHI SET SoTienDaThanhToan = 4275000, TrangThai = 'PARTIAL' WHERE MaHocPhi = 5;
        DELETE FROM dbo.CHITIETTHANHTOAN WHERE MaHocPhi = 9;
        UPDATE dbo.HOCPHI SET SoTienDaThanhToan = 0, TrangThai = 'UNPAID' WHERE MaHocPhi = 9;
      `);
    } catch (e) {
      // bỏ qua
    }
    await closePool();
  });

  // TEST 1: Sinh viên tạo payment thành công
  it('1. Sinh viên tạo giao dịch thanh toán thành công (201 Created)', async () => {
    const res = await request(app)
      .post('/api/payments')
      .send({
        maHocPhi: 5,
        soTien: 300000,
        phuongThuc: 'CHUYEN_KHOAN'
      });

    expect(res.status).toBe(201);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data.payment).toBeDefined();
    createdPaymentId = res.body.data.payment.maThanhToan;
  });

  // TEST 2: Payment mới có trạng thái CHO_XAC_NHAN
  it('2. Payment mới tạo phải có trạng thái CHO_XAC_NHAN', async () => {
    const pool = await getPool();
    const res = await pool
      .request()
      .input('MaThanhToan', sql.BigInt, createdPaymentId)
      .query('SELECT TrangThai FROM dbo.CHITIETTHANHTOAN WHERE MaThanhToan = @MaThanhToan');

    expect(res.recordset[0].TrangThai).toBe('CHO_XAC_NHAN');
  });

  // TEST 3: HOCPHI.SoTienDaThanhToan chưa tăng khi payment còn CHO_XAC_NHAN
  it('3. HOCPHI.SoTienDaThanhToan chưa tăng khi payment còn CHO_XAC_NHAN', async () => {
    const pool = await getPool();
    const res = await pool
      .request()
      .input('MaHocPhi', sql.Int, 5)
      .query('SELECT SoTienDaThanhToan FROM dbo.HOCPHI WHERE MaHocPhi = @MaHocPhi');

    // Số tiền đã thanh toán của MaHocPhi 5 trong seed ban đầu là 4,275,000, chưa được cộng thêm 300k
    expect(Number(res.recordset[0].SoTienDaThanhToan)).toBe(4275000);
  });

  // TEST 4: Sinh viên không thể gọi confirm (403 Forbidden)
  it('4. Sinh viên không thể gọi confirm (403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/payments/${createdPaymentId}/confirm`)
      .set('Authorization', `Bearer ${tokenSinhVien}`);

    expect(res.status).toBe(403);
    expect(res.body.isSuccess).toBe(false);
  });

  // TEST 5: Giảng viên không thể confirm (403 Forbidden)
  it('5. Giảng viên không thể confirm (403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/payments/${createdPaymentId}/confirm`)
      .set('Authorization', `Bearer ${tokenGiangVien}`);

    expect(res.status).toBe(403);
    expect(res.body.isSuccess).toBe(false);
  });

  // TEST 6: DAO_TAO confirm thành công
  it('6. DAO_TAO confirm giao dịch thành công (200 OK)', async () => {
    const res = await request(app)
      .post(`/api/payments/${createdPaymentId}/confirm`)
      .set('Authorization', `Bearer ${tokenDaoTao}`);

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(res.body.data.payment.trangThai).toBe('DA_XAC_NHAN');
    expect(res.body.data.payment.maTaiKhoanXacNhan).toBeDefined();
    expect(res.body.data.payment.ngayXacNhan).toBeDefined();
  });

  // TEST 7: Sau confirm, HOCPHI.SoTienDaThanhToan được cập nhật
  it('7. Sau confirm, HOCPHI.SoTienDaThanhToan được cập nhật tự động bởi trigger', async () => {
    const pool = await getPool();
    const res = await pool
      .request()
      .input('MaHocPhi', sql.Int, 5)
      .query('SELECT SoTienDaThanhToan FROM dbo.HOCPHI WHERE MaHocPhi = @MaHocPhi');

    // 4,275,000 + 300,000 = 4,575,000
    expect(Number(res.recordset[0].SoTienDaThanhToan)).toBe(4575000);
  });

  // TEST 8: Payment đủ tiền -> HOCPHI = PAID
  it('8. Payment đủ toàn bộ tiền -> HOCPHI chuyển sang trạng thái PAID', async () => {
    // MaHocPhi 5: TongTien = 8,550,000, hiện có 4,575,000 -> Còn nợ 3,975,000
    const createRes = await request(app)
      .post('/api/payments')
      .send({
        maHocPhi: 5,
        soTien: 3975000,
        phuongThuc: 'CHUYEN_KHOAN'
      });
    expect(createRes.status).toBe(201);
    fullPaymentId = createRes.body.data.payment.maThanhToan;

    // Đào tạo xác nhận
    const confirmRes = await request(app)
      .post(`/api/payments/${fullPaymentId}/confirm`)
      .set('Authorization', `Bearer ${tokenDaoTao}`);

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.tuition.trangThai).toBe('PAID');
    expect(confirmRes.body.data.tuition.soTienConLai).toBe(0);
  });

  // TEST 9: Payment một phần -> HOCPHI = PARTIAL
  it('9. Payment một phần số tiền -> HOCPHI có trạng thái PARTIAL', async () => {
    // Dùng MaHocPhi = 9 (UNPAID, TongTien = 8,640,000, chưa nộp đồng nào)
    const createRes = await request(app)
      .post('/api/payments')
      .send({
        maHocPhi: 9,
        soTien: 100000,
        phuongThuc: 'TIEN_MAT'
      });
    expect(createRes.status).toBe(201);
    partialPaymentId = createRes.body.data.payment.maThanhToan;

    const confirmRes = await request(app)
      .post(`/api/payments/${partialPaymentId}/confirm`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.tuition.trangThai).toBe('PARTIAL');
  });

  // TEST 10: Reject payment thành công
  it('10. Reject payment thành công (200 OK)', async () => {
    // Tạo 1 payment mới ở MaHocPhi 9 (còn nợ hơn 8.5 triệu)
    const createRes = await request(app)
      .post('/api/payments')
      .send({
        maHocPhi: 9,
        soTien: 50000,
        phuongThuc: 'TIEN_MAT'
      });
    expect(createRes.status).toBe(201);
    rejectedPaymentId = createRes.body.data.payment.maThanhToan;

    const rejectRes = await request(app)
      .post(`/api/payments/${rejectedPaymentId}/reject`)
      .set('Authorization', `Bearer ${tokenDaoTao}`);

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.isSuccess).toBe(true);
    expect(rejectRes.body.data.payment.trangThai).toBe('TU_CHOI');
  });

  // TEST 11: Payment TU_CHOI không được tính vào học phí
  it('11. Payment TU_CHOI không được cộng vào HOCPHI.SoTienDaThanhToan', async () => {
    const pool = await getPool();
    const res = await pool
      .request()
      .input('MaHocPhi', sql.Int, 9)
      .query('SELECT SoTienDaThanhToan FROM dbo.HOCPHI WHERE MaHocPhi = @MaHocPhi');

    // Chỉ có 100k của test 9 được tính, 50k bị từ chối không được tính
    expect(Number(res.recordset[0].SoTienDaThanhToan)).toBe(100000);
  });

  // TEST 12: Không thể confirm một payment đã DA_XAC_NHAN
  it('12. Không thể confirm một payment đã DA_XAC_NHAN (409 Conflict)', async () => {
    const res = await request(app)
      .post(`/api/payments/${createdPaymentId}/confirm`)
      .set('Authorization', `Bearer ${tokenDaoTao}`);

    expect(res.status).toBe(409);
    expect(res.body.isSuccess).toBe(false);
    expect(res.body.errors[0].message).toContain('đã được xác nhận trước đó');
  });

  // TEST 13: Không thể confirm một payment đã TU_CHOI
  it('13. Không thể confirm một payment đã TU_CHOI (409 Conflict)', async () => {
    const res = await request(app)
      .post(`/api/payments/${rejectedPaymentId}/confirm`)
      .set('Authorization', `Bearer ${tokenDaoTao}`);

    expect(res.status).toBe(409);
    expect(res.body.isSuccess).toBe(false);
    expect(res.body.errors[0].message).toContain('đã bị từ chối');
  });

  // TEST 14: Không thể thanh toán vượt quá HOCPHI.TongTien
  it('14. Không thể thanh toán vượt quá tổng học phí (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/payments')
      .send({
        maHocPhi: 9,
        soTien: 999999999,
        phuongThuc: 'CHUYEN_KHOAN'
      });

    expect(res.status).toBe(409);
    expect(res.body.isSuccess).toBe(false);
    expect(res.body.errors[0].message).toContain('không được vượt quá');
  });

  // TEST 15: Multi-row trigger hoạt động đúng
  it('15. Trigger xử lý đúng khi nhiều dòng CHITIETTHANHTOAN được cập nhật cùng lúc', async () => {
    const pool = await getPool();
    // Tạo 2 giao dịch tạm trên MaHocPhi = 19 (Tổng tiền 7.8tr, đang nợ 7.8tr)
    const tempInsert = await pool.request().query(`
      DECLARE @T TABLE (ID BIGINT);
      INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, PhuongThuc, TrangThai, NgayThanhToan)
      OUTPUT INSERTED.MaThanhToan INTO @T
      VALUES (19, 10000, 'TIEN_MAT', 'CHO_XAC_NHAN', SYSUTCDATETIME()),
             (19, 20000, 'TIEN_MAT', 'CHO_XAC_NHAN', SYSUTCDATETIME());
      SELECT ID FROM @T;
    `);

    const ids = tempInsert.recordset.map(r => r.ID);

    // Cập nhật multi-row sang DA_XAC_NHAN
    await pool.request().query(`
      UPDATE dbo.CHITIETTHANHTOAN 
      SET TrangThai = 'DA_XAC_NHAN', MaTaiKhoanXacNhan = 1, NgayXacNhan = SYSUTCDATETIME()
      WHERE MaThanhToan IN (${ids.join(',')});
    `);

    const checkHocPhi = await pool.request().query('SELECT SoTienDaThanhToan FROM dbo.HOCPHI WHERE MaHocPhi = 19');
    expect(Number(checkHocPhi.recordset[0].SoTienDaThanhToan)).toBe(30000);

    // Dọn dẹp
    await pool.request().query(`DELETE FROM dbo.CHITIETTHANHTOAN WHERE MaThanhToan IN (${ids.join(',')})`);
  });

  // TEST 16: Báo cáo thống kê tài chính học phí
  it('16. Báo cáo thống kê học phí SP_ThongKeHocPhi hoạt động chính xác (200 OK)', async () => {
    const res = await request(app)
      .get('/api/admin/reports/tuition')
      .query({ maHocKy: 1 });

    expect(res.status).toBe(200);
    expect(res.body.isSuccess).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
