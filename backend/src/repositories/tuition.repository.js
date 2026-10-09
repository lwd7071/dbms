const { getPool, sql } = require('../config/db');

/**
 * Repository thao tác giao dịch Thanh toán học phí, Xác nhận thanh toán và Báo cáo tài chính
 */

// 1. Tạo giao dịch thanh toán mới ở trạng thái CHO_XAC_NHAN
const createPayment = async (maHocPhi, soTien, phuongThuc = 'CHUYEN_KHOAN') => {
  const pool = await getPool();

  // Kiểm tra hồ sơ học phí và số tiền nộp so với tổng nợ
  const checkTuition = await pool
    .request()
    .input('MaHocPhi', sql.Int, maHocPhi)
    .query(`
      SELECT 
        MaHocPhi, MaSV, MaHocKy, TongTien,
        SoTienDaThanhToan, (TongTien - SoTienDaThanhToan) AS SoTienConLai,
        TrangThai
      FROM dbo.HOCPHI
      WHERE MaHocPhi = @MaHocPhi;
    `);

  if (checkTuition.recordset.length === 0) {
    const err = new Error('Hồ sơ học phí không tồn tại trong hệ thống.');
    err.status = 404;
    err.field = 'maHocPhi';
    throw err;
  }

  const currentTuition = checkTuition.recordset[0];
  if (Number(soTien) > Number(currentTuition.SoTienConLai)) {
    const err = new Error('Tổng số tiền thanh toán không được vượt quá số dư học phí còn lại.');
    err.status = 409;
    err.field = 'soTien';
    throw err;
  }

  // Kiểm tra chống spam: Không cho phép tạo thêm yêu cầu khi đang có giao dịch chờ duyệt
  const checkPending = await pool
    .request()
    .input('MaHocPhi', sql.Int, maHocPhi)
    .query(`
      SELECT COUNT(*) AS SoLuongPending, ISNULL(SUM(SoTien), 0) AS TongTienPending
      FROM dbo.CHITIETTHANHTOAN
      WHERE MaHocPhi = @MaHocPhi AND TrangThai = 'CHO_XAC_NHAN';
    `);

  if (checkPending.recordset[0]?.SoLuongPending > 0) {
    const err = new Error('Hồ sơ học phí này đang có yêu cầu nộp tiền chờ duyệt. Vui lòng chờ Cán bộ Đào tạo xác nhận trước khi gửi yêu cầu mới.');
    err.status = 409;
    err.field = 'maHocPhi';
    throw err;
  }

  // Thực thi lệnh insert qua bảng tạm để tương thích với AFTER Trigger
  const insertResult = await pool
    .request()
    .input('MaHocPhi', sql.Int, maHocPhi)
    .input('SoTien', sql.Decimal(18, 2), soTien)
    .input('PhuongThuc', sql.VarChar(20), phuongThuc)
    .query(`
      DECLARE @Inserted TABLE (
        MaThanhToan BIGINT,
        MaHocPhi INT,
        SoTien DECIMAL(18, 2),
        PhuongThuc VARCHAR(20),
        TrangThai VARCHAR(20),
        NgayThanhToan DATETIME2
      );

      INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, PhuongThuc, TrangThai, NgayThanhToan)
      OUTPUT 
        INSERTED.MaThanhToan, 
        INSERTED.MaHocPhi, 
        INSERTED.SoTien, 
        INSERTED.PhuongThuc, 
        INSERTED.TrangThai, 
        INSERTED.NgayThanhToan
      INTO @Inserted
      VALUES (@MaHocPhi, @SoTien, @PhuongThuc, 'CHO_XAC_NHAN', SYSUTCDATETIME());

      SELECT TOP 1 * FROM @Inserted;
    `);

  const paymentRecord = insertResult.recordset[0];

  // Lấy lại trạng thái của bảng HOCPHI (lúc này chưa đổi vì payment ở trạng thái CHO_XAC_NHAN)
  const updatedTuitionResult = await pool
    .request()
    .input('MaHocPhi', sql.Int, maHocPhi)
    .query(`
      SELECT 
        MaHocPhi, MaSV, MaHocKy, TongTien,
        SoTienDaThanhToan, (TongTien - SoTienDaThanhToan) AS SoTienConLai,
        TrangThai, NgayCapNhat
      FROM dbo.HOCPHI
      WHERE MaHocPhi = @MaHocPhi;
    `);

  const tuitionRecord = updatedTuitionResult.recordset[0];

  return {
    payment: {
      maThanhToan: paymentRecord.MaThanhToan,
      maHocPhi: paymentRecord.MaHocPhi,
      soTien: Number(paymentRecord.SoTien),
      phuongThuc: paymentRecord.PhuongThuc,
      trangThai: paymentRecord.TrangThai,
      ngayThanhToan: paymentRecord.NgayThanhToan
    },
    tuition: {
      maHocPhi: tuitionRecord.MaHocPhi,
      maSV: tuitionRecord.MaSV,
      maHocKy: tuitionRecord.MaHocKy,
      tongTien: Number(tuitionRecord.TongTien),
      soTienDaThanhToan: Number(tuitionRecord.SoTienDaThanhToan),
      soTienConLai: Number(tuitionRecord.SoTienConLai),
      trangThai: tuitionRecord.TrangThai,
      ngayCapNhat: tuitionRecord.NgayCapNhat
    }
  };
};

// 2. Xác nhận thanh toán qua SP_XacNhanThanhToan (Dành cho DAO_TAO hoặc QUAN_TRI)
const confirmPayment = async (maThanhToan, maTaiKhoanXacNhan) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaThanhToan', sql.BigInt, maThanhToan)
    .input('MaTaiKhoanXacNhan', sql.Int, maTaiKhoanXacNhan)
    .execute('dbo.SP_XacNhanThanhToan');

  const row = result.recordset[0];
  return {
    payment: {
      maThanhToan: row.MaThanhToan,
      maHocPhi: row.MaHocPhi,
      soTien: Number(row.SoTien),
      phuongThuc: row.PhuongThuc,
      trangThai: row.TrangThaiThanhToan,
      ngayThanhToan: row.NgayThanhToan,
      maTaiKhoanXacNhan: row.MaTaiKhoanXacNhan,
      ngayXacNhan: row.NgayXacNhan
    },
    tuition: {
      maHocPhi: row.MaHocPhi,
      maSV: row.MaSV,
      tongTien: Number(row.TongTien),
      soTienDaThanhToan: Number(row.SoTienDaThanhToan),
      soTienConLai: Number(row.SoTienConLai),
      trangThai: row.TrangThaiHocPhi
    }
  };
};

// 3. Từ chối thanh toán qua SP_TuChoiThanhToan (Dành cho DAO_TAO hoặc QUAN_TRI)
const rejectPayment = async (maThanhToan, maTaiKhoanXacNhan) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaThanhToan', sql.BigInt, maThanhToan)
    .input('MaTaiKhoanXacNhan', sql.Int, maTaiKhoanXacNhan)
    .execute('dbo.SP_TuChoiThanhToan');

  const row = result.recordset[0];
  return {
    payment: {
      maThanhToan: row.MaThanhToan,
      maHocPhi: row.MaHocPhi,
      soTien: Number(row.SoTien),
      phuongThuc: row.PhuongThuc,
      trangThai: row.TrangThaiThanhToan,
      ngayThanhToan: row.NgayThanhToan,
      maTaiKhoanXacNhan: row.MaTaiKhoanXacNhan,
      ngayXacNhan: row.NgayXacNhan
    },
    tuition: {
      maHocPhi: row.MaHocPhi,
      maSV: row.MaSV,
      tongTien: Number(row.TongTien),
      soTienDaThanhToan: Number(row.SoTienDaThanhToan),
      soTienConLai: Number(row.SoTienConLai),
      trangThai: row.TrangThaiHocPhi
    }
  };
};

// 4. Lấy danh sách giao dịch chờ xác nhận (CHO_XAC_NHAN)
const getPendingPayments = async (filters = {}) => {
  const pool = await getPool();
  const { maLop } = filters;
  const request = pool.request();

  let query = `
    SELECT 
      ct.MaThanhToan,
      ct.MaHocPhi,
      ct.SoTien,
      ct.PhuongThuc,
      ct.TrangThai,
      ct.NgayThanhToan,
      hp.MaSV,
      sv.MaSinhVien,
      sv.HoTen AS HoTenSinhVien,
      sv.MaLop,
      l.TenLop AS TenLopSinhVien,
      hk.TenHocKy,
      hk.NamHoc
    FROM dbo.CHITIETTHANHTOAN ct
    INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi = hp.MaHocPhi
    INNER JOIN dbo.SINHVIEN sv ON hp.MaSV = sv.MaSV
    LEFT JOIN dbo.LOP l ON sv.MaLop = l.MaLop
    INNER JOIN dbo.HOCKY hk ON hp.MaHocKy = hk.MaHocKy
    WHERE ct.TrangThai = 'CHO_XAC_NHAN'
  `;

  if (maLop) {
    query += ` AND sv.MaLop = @MaLop `;
    request.input('MaLop', sql.VarChar(20), maLop);
  }

  query += ` ORDER BY ct.NgayThanhToan DESC;`;

  const result = await request.query(query);

  return result.recordset.map(r => ({
    maThanhToan: r.MaThanhToan,
    maHocPhi: r.MaHocPhi,
    soTien: Number(r.SoTien),
    phuongThuc: r.PhuongThuc,
    trangThai: r.TrangThai,
    ngayThanhToan: r.NgayThanhToan,
    maSV: r.MaSV,
    maSinhVien: r.MaSinhVien,
    hoTenSinhVien: r.HoTenSinhVien,
    maLop: r.MaLop || null,
    tenLop: r.TenLopSinhVien || null,
    tenHocKy: r.TenHocKy,
    namHoc: r.NamHoc
  }));
};

// 5. Gọi Stored Procedure SP_ThongKeHocPhi
const getTuitionReport = async (maHocKy = null, trangThai = null) => {
  const pool = await getPool();
  const request = pool.request();

  if (maHocKy) {
    request.input('MaHocKy', sql.Int, maHocKy);
  }
  if (trangThai) {
    request.input('TrangThai', sql.VarChar(20), trangThai);
  }

  const result = await request.execute('dbo.SP_ThongKeHocPhi');

  return result.recordset.map(r => ({
    maHocKy: r.MaHocKy,
    namHoc: r.NamHoc,
    tenHocKy: r.TenHocKy,
    soHoSoHocPhi: r.SoHoSoHocPhi,
    tongTienPhaiThu: Number(r.TongTienPhaiThu),
    tongTienDaThu: Number(r.TongTienDaThu),
    tongTienConLai: Number(r.TongTienConLai),
    soUNPAID: r.SoUNPAID,
    soPARTIAL: r.SoPARTIAL,
    soPAID: r.SoPAID
  }));
};

module.exports = {
  createPayment,
  confirmPayment,
  rejectPayment,
  getPendingPayments,
  getTuitionReport
};
