const { getPool, sql } = require('../config/db');

const getSchedule = async (maSV, maHocKy) => {
  const pool = await getPool();
  const result = await pool.request().input('MaSV',sql.Int,maSV).input('MaHocKy',sql.Int,maHocKy)
    .execute('dbo.SP_App_Student_Schedule');
  return result.recordset.map(r => ({ maSV:r.MaSV,maSinhVien:r.MaSinhVien,hoTenSinhVien:r.HoTenSinhVien,maHocKy:r.MaHocKy,namHoc:r.NamHoc,
    tenHocKy:r.TenHocKy,maLHP:r.MaLHP,maMonHoc:r.MaMonHoc,tenMonHoc:r.TenMonHoc,tenLHP:r.TenLHP,hoTenGiangVien:r.HoTenGiangVien||'Chưa phân công',
    thu:r.Thu,tietBatDau:r.TietBatDau,soTiet:r.SoTiet,phongHoc:r.PhongHoc }));
};
const getGrades = async (maSV, maHocKy) => {
  const pool = await getPool();
  const result = await pool.request().input('MaSV',sql.Int,maSV).input('MaHocKy',sql.Int,maHocKy).execute('dbo.SP_App_Student_Grades');
  return result.recordset.map(r => ({ maDangKy:Number(r.MaDangKy),maSV:r.MaSV,maHocKy:r.MaHocKy,namHoc:r.NamHoc,tenHocKy:r.TenHocKy,maLHP:r.MaLHP,
    maMonHoc:r.MaMonHoc,tenMonHoc:r.TenMonHoc,soTinChi:r.SoTinChi,diemQuaTrinh:r.DiemQuaTrinh!==null?Number(r.DiemQuaTrinh):null,
    diemGiuaKy:r.DiemGiuaKy!==null?Number(r.DiemGiuaKy):null,diemCuoiKy:r.DiemCuoiKy!==null?Number(r.DiemCuoiKy):null,
    diemTongKet:r.DiemTongKet!==null?Number(r.DiemTongKet):null,diemChu:r.DiemChu,ketQua:r.KetQua }));
};
const getTuition = async maSV => {
  const pool = await getPool();
  const result = await pool.request().input('MaSV',sql.Int,maSV).execute('dbo.SP_App_Student_Tuition');
  return result.recordset.map(r => ({ maHocPhi:r.MaHocPhi,maSV:r.MaSV,maHocKy:r.MaHocKy,namHoc:r.NamHoc,tenHocKy:r.TenHocKy,
    soTinChi:r.SoTinChi,donGiaTinChi:Number(r.DonGiaTinChi),tongTien:Number(r.TongTien),soTienDaThanhToan:Number(r.SoTienDaThanhToan),
    soTienConLai:Number(r.SoTienConLai),trangThai:r.TrangThai,ngayCapNhat:r.NgayCapNhat,soGiaoDichChoDuyet:Number(r.SoGiaoDichChoDuyet||0),
    soTienChoDuyet:Number(r.SoTienChoDuyet||0),hasPendingPayment:Number(r.SoGiaoDichChoDuyet||0)>0 }));
};
const getPaymentHistory = async (maSV, options={}) => {
  const pool = await getPool();
  const page=Math.max(1,parseInt(options.page)||1),pageSize=Math.min(100,Math.max(1,parseInt(options.pageSize)||10));
  const result=await pool.request().input('MaSV',sql.Int,maSV).input('Offset',sql.Int,(page-1)*pageSize).input('PageSize',sql.Int,pageSize)
    .execute('dbo.SP_App_Student_PaymentHistory');
  const totalItems=result.recordsets?.[0]?.[0]?.TotalItems||0;
  const items=(result.recordsets?.[1]||[]).map(r=>({maThanhToan:r.MaThanhToan,maHocPhi:r.MaHocPhi,soTien:Number(r.SoTien),phuongThuc:r.PhuongThuc,
    trangThai:r.TrangThai,ngayThanhToan:r.NgayThanhToan,ngayXacNhan:r.NgayXacNhan,tenHocKy:r.TenHocKy,namHoc:r.NamHoc}));
  return {items,page,pageSize,totalItems,totalPages:Math.ceil(totalItems/pageSize)};
};
const getStudentProfile = async maSV => {
  const pool=await getPool();
  const result=await pool.request().input('MaSV',sql.Int,maSV).execute('dbo.SP_App_Student_Profile');
  const r=result.recordset[0]; if(!r)return null;
  return {maSV:r.MaSV,maSinhVien:r.MaSinhVien,hoTen:r.HoTen,ngaySinh:r.NgaySinh,email:r.Email,soDienThoai:r.SoDienThoai,maKhoa:r.MaKhoa,
    tenKhoa:r.TenKhoa,maLop:r.MaLop||null,tenLop:r.TenLop||null,khoaHoc:r.KhoaHoc||null,trangThai:r.TrangThai,ngayTao:r.NgayTao,
    username:r.Username,vaiTro:r.VaiTro,trangThaiTaiKhoan:r.TrangThaiTaiKhoan,lanDangNhapCuoi:r.LanDangNhapCuoi};
};
const getStudentCurriculum = async maSV => {
  const pool=await getPool();
  const result=await pool.request().input('MaSV',sql.Int,maSV).execute('dbo.SP_App_Student_Curriculum');
  return result.recordset;
};
module.exports={getSchedule,getGrades,getTuition,getPaymentHistory,getStudentProfile,getStudentCurriculum};
