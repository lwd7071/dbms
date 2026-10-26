const { getPool, sql } = require('../config/db');

/**
 * Repository thao tác giao dịch Thanh toán học phí, Xác nhận thanh toán và Báo cáo tài chính
 */

// 1. Tạo giao dịch thanh toán mới ở trạng thái CHO_XAC_NHAN
const createPayment = async (maHocPhi, soTien, phuongThuc = 'CHUYEN_KHOAN', ownerMaSV = null, actorMaTaiKhoan) => {
  const pool = await getPool();
  const result = await pool.request().input('MaHocPhi',sql.Int,maHocPhi).input('SoTien',sql.Decimal(18,2),soTien)
    .input('PhuongThuc',sql.VarChar(20),phuongThuc).input('OwnerMaSV',sql.Int,ownerMaSV).input('ActorMaTaiKhoan',sql.Int,actorMaTaiKhoan)
    .execute('dbo.SP_App_Tuition_CreatePayment');
  const row=result.recordset[0];
  return { payment:{maThanhToan:row.MaThanhToan,maHocPhi:row.MaHocPhi,soTien:Number(row.SoTien),phuongThuc:row.PhuongThuc,trangThai:row.TrangThai,ngayThanhToan:row.NgayThanhToan},
    tuition:{maHocPhi:row.MaHocPhi,maSV:row.MaSV,maHocKy:row.MaHocKy,tongTien:Number(row.TongTien),soTienDaThanhToan:Number(row.SoTienDaThanhToan),
      soTienConLai:Number(row.SoTienConLai),trangThai:row.TrangThaiHocPhi,ngayCapNhat:row.NgayCapNhat} };
};

// 2. Xác nhận thanh toán qua SP_XacNhanThanhToan (Dành cho DAO_TAO hoặc QUAN_TRI)
const confirmPayment = async (maThanhToan, maTaiKhoanXacNhan) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('MaThanhToan', sql.BigInt, maThanhToan)
    .input('MaTaiKhoanXacNhan', sql.Int, maTaiKhoanXacNhan)
    .execute('dbo.SP_App_Tuition_ConfirmPayment');

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
    .execute('dbo.SP_App_Tuition_RejectPayment');

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
  const pool=await getPool();
  const result=await pool.request().input('MaLop',sql.VarChar(20),filters.maLop||null).execute('dbo.SP_App_Tuition_PendingPayments');
  return result.recordset.map(r=>({maThanhToan:r.MaThanhToan,maHocPhi:r.MaHocPhi,soTien:Number(r.SoTien),phuongThuc:r.PhuongThuc,trangThai:r.TrangThai,
    ngayThanhToan:r.NgayThanhToan,maSV:r.MaSV,maSinhVien:r.MaSinhVien,hoTenSinhVien:r.HoTenSinhVien,maLop:r.MaLop||null,
    tenLop:r.TenLopSinhVien||null,tenHocKy:r.TenHocKy,namHoc:r.NamHoc}));
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
