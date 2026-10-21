const { getPool, sql } = require('../../src/config/db');
const { createStudentAccount, cleanupStudentAccount } = require('./student-account');

let nextFixture = 0;

const createTuitionFixture = async ({ total, paid = 0 }) => {
  const pool = await getPool();
  const suffix = `${Date.now()}${nextFixture++}`;
  const maSinhVien = `PAY${suffix}`;
  const fee = await pool.request()
    .input('Active', sql.VarChar(20), 'ACTIVE')
    .query('SELECT TOP 1 MaMucHocPhi, MaHocKy, DonGiaTinChi FROM dbo.MUCHOCPHI WHERE TrangThai = @Active ORDER BY MaMucHocPhi');
  if (!fee.recordset.length) throw new Error('No active tuition rate available for the test fixture.');

  const createdStudent = await pool.request()
    .input('MaSinhVien', sql.VarChar(20), maSinhVien)
    .input('HoTen', sql.NVarChar(100), 'Sinh viên kiểm thử học phí')
    .input('MaKhoa', sql.VarChar(10), 'CNTT')
    .input('MaCTDT', sql.VarChar(24), 'CTDT_CNTT_CQ')
    .query("DECLARE @Created TABLE (MaSV INT); INSERT INTO dbo.SINHVIEN (MaSinhVien, HoTen, MaKhoa, MaCTDT, TrangThai) OUTPUT INSERTED.MaSV INTO @Created VALUES (@MaSinhVien, @HoTen, @MaKhoa, @MaCTDT, 'DANG_HOC'); SELECT MaSV FROM @Created;");
  const maSV = createdStudent.recordset[0].MaSV;
  const account = await createStudentAccount(pool, maSV);
  const rate = fee.recordset[0];
  const soTinChi = 4;
  const donGiaTinChi = Number(total) / soTinChi;
  const createdTuition = await pool.request()
    .input('MaSV', sql.Int, maSV)
    .input('MaHocKy', sql.Int, rate.MaHocKy)
    .input('MaMucHocPhi', sql.Int, rate.MaMucHocPhi)
    .input('SoTinChi', sql.Int, soTinChi)
    .input('DonGiaTinChi', sql.Decimal(12, 2), donGiaTinChi)
    .input('TongTien', sql.Decimal(14, 2), total)
    .query('DECLARE @Created TABLE (MaHocPhi INT); INSERT INTO dbo.HOCPHI (MaSV, MaHocKy, MaMucHocPhi, SoTinChi, DonGiaTinChi, TongTien) OUTPUT INSERTED.MaHocPhi INTO @Created VALUES (@MaSV, @MaHocKy, @MaMucHocPhi, @SoTinChi, @DonGiaTinChi, @TongTien); SELECT MaHocPhi FROM @Created;');
  const maHocPhi = createdTuition.recordset[0].MaHocPhi;

  if (paid > 0) {
    await pool.request()
      .input('MaHocPhi', sql.Int, maHocPhi)
      .input('SoTien', sql.Decimal(14, 2), paid)
      .input('MaTaiKhoan', sql.Int, 1)
      .query("INSERT INTO dbo.CHITIETTHANHTOAN (MaHocPhi, SoTien, PhuongThuc, TrangThai, MaTaiKhoanXacNhan, NgayXacNhan) VALUES (@MaHocPhi, @SoTien, 'CHUYEN_KHOAN', 'DA_XAC_NHAN', @MaTaiKhoan, SYSUTCDATETIME())");
  }

  return {
    maSV,
    maHocPhi,
    async cleanup() {
      await pool.request().input('MaHocPhi', sql.Int, maHocPhi).query('DELETE FROM dbo.CHITIETTHANHTOAN WHERE MaHocPhi = @MaHocPhi');
      await pool.request().input('MaHocPhi', sql.Int, maHocPhi).query('DELETE FROM dbo.HOCPHI WHERE MaHocPhi = @MaHocPhi');
      await cleanupStudentAccount(pool, maSV, account.maTaiKhoan);
    }
  };
};

module.exports = { createTuitionFixture };
