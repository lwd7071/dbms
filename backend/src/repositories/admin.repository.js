const { getPool, sql, getRequestActorId } = require('../config/db');

/**
 * Repository xử lý các tác vụ quản trị hệ thống
 */

// Lấy danh sách tài khoản người dùng từ View V_TaiKhoanNguoiDung có phân trang
const getUsersList = async (filters = {}) => {
  const pool=await getPool(), page=Math.max(1,parseInt(filters.page)||1), pageSize=Math.min(100,Math.max(1,parseInt(filters.pageSize)||10));
  const result=await pool.request().input('VaiTro',sql.VarChar(20),filters.vaiTro||null).input('TrangThai',sql.VarChar(20),filters.trangThai||null)
    .input('MaLop',sql.VarChar(20),filters.maLop||null).input('Search',sql.NVarChar(100),filters.search||null)
    .input('Offset',sql.Int,(page-1)*pageSize).input('PageSize',sql.Int,pageSize).execute('dbo.SP_App_Admin_Users_List');
  const totalItems=result.recordsets?.[0]?.[0]?.TotalItems||0;
  const items=(result.recordsets?.[1]||[]).map(r=>({maTaiKhoan:r.MaTaiKhoan,username:r.Username,vaiTro:r.VaiTro,trangThai:r.TrangThai,maLop:r.MaLop||null,
    tenLop:r.TenLopSinhVien||null,hoTen:r.HoTenSinhVien||r.HoTenGiangVien||'Quản trị viên',email:r.EmailSinhVien||r.EmailGiangVien||'admin@edu.vn',ngayTao:r.NgayTao,lanDangNhapCuoi:r.LanDangNhapCuoi}));
  return {items,page,pageSize,totalItems,totalPages:Math.ceil(totalItems/pageSize)};
};
const updateUserStatus = async (username,status,actor) => {
  const pool=await getPool();
  await pool.request().input('Username',sql.VarChar(50),username).input('TrangThai',sql.VarChar(20),status)
    .input('ActorMaTaiKhoan',sql.Int,actor.maTaiKhoan).execute('dbo.SP_App_Admin_UserStatus');
  return {username,trangThai:status};
};
const getCurriculums = async filters => {
  const pool=await getPool();
  const f=typeof filters==='string'?{maKhoa:filters}:filters||{};
  const result=await pool.request().input('MaKhoa',sql.VarChar(10),f.maKhoa||null).input('MaNganh',sql.VarChar(10),f.maNganh||null)
    .input('NamTuyenSinh',sql.SmallInt,f.namTuyenSinh?Number(f.namTuyenSinh):null).input('MaCTDT',sql.VarChar(24),f.maCTDT||null)
    .input('TuKhoaMonHoc',sql.NVarChar(100),f.tuKhoaMonHoc||null).input('MaMonTienQuyet',sql.VarChar(15),f.maMonTienQuyet||null)
    .input('HocKyDuKien',sql.TinyInt,f.hocKyDuKien?Number(f.hocKyDuKien):null).execute('dbo.SP_App_Admin_Curriculums_List');
  return result.recordset.map(r=>({maCTDT:r.MaCTDT,tenCTDT:r.TenCTDT,maNganh:r.MaNganh,nganh:r.Nganh,khoaHoc:r.KhoaHoc,namTuyenSinh:r.NamTuyenSinh,
    tongTinChiYeuCau:r.TongTinChiYeuCau,thoiGianDaoTao:r.ThoiGianDaoTao,trangThai:Boolean(r.TrangThaiCTDT),maKhoa:r.MaKhoa,tenKhoa:r.TenKhoa,
    maKhoaMon:r.MaKhoaMon,tenKhoaMon:r.TenKhoaMon,maMonHoc:r.MaMonHoc,tenMonHoc:r.TenMonHoc,soTinChi:r.SoTinChi,soTietLyThuyet:r.SoTietLyThuyet,
    soTietThucHanh:r.SoTietThucHanh,moTa:r.MoTa,trangThaiMon:r.TrangThaiMon===null||r.TrangThaiMon===undefined?null:Boolean(r.TrangThaiMon),
    hocKyDuKien:r.HocKyDuKien,loaiMon:r.LoaiMon,thuTu:r.ThuTu,hocPhanTienQuyet:r.HocPhanTienQuyet,
    hocPhanTienQuyetChiTiet:r.HocPhanTienQuyetChiTiet?JSON.parse(r.HocPhanTienQuyetChiTiet):[]}));
};
const getCurriculumOptions = async ({maKhoa,namTuyenSinh}={}) => {
  const pool=await getPool();
  const result=await pool.request().input('MaKhoa',sql.VarChar(10),maKhoa||null)
    .input('NamTuyenSinh',sql.SmallInt,namTuyenSinh?Number(namTuyenSinh):null).execute('dbo.SP_App_Admin_CurriculumOptions');
  return result.recordset.map(r=>({maCTDT:r.MaCTDT,tenCTDT:r.TenCTDT,khoaHoc:r.KhoaHoc,namTuyenSinh:r.NamTuyenSinh,maKhoa:r.MaKhoa}));
};
const getCurriculumPrograms = async () => {
  const pool=await getPool();
  const result=await pool.request().execute('dbo.SP_App_Admin_CurriculumPrograms_List');
  return result.recordset.map(mapCurriculumProgram);
};
const mapCurriculumProgram = row => row ? ({
  maCTDT: row.MaCTDT, maNganh: row.MaNganh, nganh: row.TenNganh,
  maKhoa: row.MaKhoa, tenKhoa: row.TenKhoa, tenCTDT: row.TenCTDT,
  khoaHoc: row.KhoaHoc, namTuyenSinh: row.NamTuyenSinh,
  tongTinChiYeuCau: row.TongTinChiYeuCau, thoiGianDaoTao: row.ThoiGianDaoTao,
  trangThai: Boolean(row.TrangThai)
}) : null;

const getCurriculumProgramRow = async (executor,maCTDT) => {
  const result=await new sql.Request(executor).input('MaCTDT',sql.VarChar(24),maCTDT).execute('dbo.SP_App_Admin_CurriculumProgram_Get');
  return result.recordset[0]||null;
};
const formatCurriculumCohort = (startYear, duration) => `${startYear}-${Number(startYear) + Number(duration)}`;

const createCurriculumProgram = async data => {
  const pool=await getPool();
  await pool.request().input('MaCTDT',sql.VarChar(24),data.maCTDT).input('MaNganh',sql.VarChar(10),data.maNganh)
    .input('TenCTDT',sql.NVarChar(150),data.tenCTDT).input('NamTuyenSinh',sql.SmallInt,data.namTuyenSinh)
    .input('TongTinChiYeuCau',sql.Int,data.tongTinChiYeuCau).input('ThoiGianDaoTao',sql.Int,data.thoiGianDaoTao)
    .input('TrangThai',sql.Bit,data.trangThai??true).input('ActorMaTaiKhoan',sql.Int,getRequestActorId()).execute('dbo.SP_App_Admin_CurriculumProgram_Create');
  return mapCurriculumProgram(await getCurriculumProgramRow(pool,data.maCTDT));
};
const updateCurriculumProgram = async (maCTDT,data) => {
  const pool=await getPool();
  const current=await getCurriculumProgramRow(pool,maCTDT);
  if(!current) throw Object.assign(new Error('Không tìm thấy chương trình đào tạo.'),{status:404,field:'maCTDT'});
  try {
    await pool.request().input('MaCTDT',sql.VarChar(24),maCTDT).input('MaNganh',sql.VarChar(10),data.maNganh)
      .input('TenCTDT',sql.NVarChar(150),data.tenCTDT).input('NamTuyenSinh',sql.SmallInt,data.namTuyenSinh)
      .input('TongTinChiYeuCau',sql.Int,data.tongTinChiYeuCau).input('ThoiGianDaoTao',sql.Int,data.thoiGianDaoTao)
      .input('TrangThai',sql.Bit,data.trangThai??true).input('ActorMaTaiKhoan',sql.Int,getRequestActorId()).execute('dbo.SP_App_Admin_CurriculumProgram_Update');
  } catch(err) { if(err.number===51008) err.curriculumProgramField=data.maNganh!==current.MaNganh?'maNganh':'namTuyenSinh'; throw err; }
  return mapCurriculumProgram(await getCurriculumProgramRow(pool,maCTDT));
};
const deleteCurriculumProgram = async maCTDT => {
  const pool=await getPool();
  await pool.request().input('MaCTDT',sql.VarChar(24),maCTDT).input('ActorMaTaiKhoan',sql.Int,getRequestActorId()).execute('dbo.SP_App_Admin_CurriculumProgram_Delete');
  return {maCTDT,deleted:true};
};
const getDashboardStats = async () => {
  const pool=await getPool();
  const row=(await pool.request().execute('dbo.SP_App_Admin_Dashboard')).recordset[0]||{};
  return {tongSinhVien:Number(row.TongSinhVien||0),tongLopSinhHoat:Number(row.TongLopSinhHoat||0),tongLopHocPhan:Number(row.TongLopHocPhan||0),
    tongLuotDangKy:Number(row.TongLuotDangKy||0),tongHocPhiPhaiThu:Number(row.TongHocPhiPhaiThu||0),tongTienDaThu:Number(row.TongTienDaThu||0),soGiaoDichChoXacNhan:Number(row.SoGiaoDichChoXacNhan||0)};
};
const getStudentsList = async (filters = {}) => {
  const pool=await getPool(),page=Math.max(1,parseInt(filters.page)||1),pageSize=Math.min(100,Math.max(1,parseInt(filters.pageSize)||10));
  const result=await pool.request().input('MaKhoa',sql.VarChar(10),filters.maKhoa||null).input('MaLop',sql.VarChar(20),filters.maLop||null)
    .input('TrangThai',sql.VarChar(20),filters.trangThai||null).input('Search',sql.NVarChar(100),filters.search||null)
    .input('Offset',sql.Int,(page-1)*pageSize).input('PageSize',sql.Int,pageSize).execute('dbo.SP_App_Admin_Students_List');
  const totalItems=result.recordsets?.[0]?.[0]?.TotalItems||0;
  const items=(result.recordsets?.[1]||[]).map(r=>({maSV:r.MaSV,maSinhVien:r.MaSinhVien,hoTen:r.HoTen,ngaySinh:r.NgaySinh,email:r.Email,soDienThoai:r.SoDienThoai,maKhoa:r.MaKhoa,tenKhoa:r.TenKhoa,maLop:r.MaLop||null,tenLop:r.TenLop||null,maCTDT:r.MaCTDT,trangThai:r.TrangThai,ngayTao:r.NgayTao}));
  return {items,page,pageSize,totalItems,totalPages:Math.ceil(totalItems/pageSize)};
};
const getAllClasses = async (filters = {}) => {
  const pool=await getPool(),page=Math.max(1,parseInt(filters.page)||1),pageSize=Math.min(100,Math.max(1,parseInt(filters.pageSize)||10));
  const result=await pool.request().input('MaHocKy',sql.Int,filters.maHocKy?Number(filters.maHocKy):null).input('Search',sql.NVarChar(100),filters.search||null)
    .input('Offset',sql.Int,(page-1)*pageSize).input('PageSize',sql.Int,pageSize).execute('dbo.SP_App_Admin_Classes_List');
  const totalItems=result.recordsets?.[0]?.[0]?.TotalItems||0;
  const items=(result.recordsets?.[1]||[]).map(r=>({maLHP:r.MaLHP,tenLHP:r.TenLHP,maMonHoc:r.MaMonHoc,tenMonHoc:r.TenMonHoc,soTinChi:r.SoTinChi,maHocKy:r.MaHocKy,tenHocKy:r.TenHocKy,namHoc:r.NamHoc,hoTenGiangVien:r.HoTenGiangVien||'Chưa phân công',soLuongToiDa:r.SoLuongToiDa,siSoHienTai:r.SiSoHienTai,trangThai:r.TrangThai,thu:r.Thu,tietBatDau:r.TietBatDau,soTiet:r.SoTiet,phongHoc:r.PhongHoc,schedules:r.Schedules?JSON.parse(r.Schedules):[]}));
  return {items,page,pageSize,totalItems,totalPages:Math.ceil(totalItems/pageSize)};
};
const getRegistrationsList = async (filters = {}) => {
  const pool=await getPool(),page=Math.max(1,parseInt(filters.page)||1),pageSize=Math.min(100,Math.max(1,parseInt(filters.pageSize)||10));
  const result=await pool.request().input('MaSV',sql.Int,filters.maSV?Number(filters.maSV):null).input('MaSinhVien',sql.VarChar(20),filters.maSinhVien||null)
    .input('MaLHP',sql.VarChar(20),filters.maLHP||null).input('MaLop',sql.VarChar(20),filters.maLop||null)
    .input('TrangThai',sql.VarChar(20),filters.trangThai||null).input('Search',sql.NVarChar(100),filters.search||null)
    .input('Offset',sql.Int,(page-1)*pageSize).input('PageSize',sql.Int,pageSize).execute('dbo.SP_App_Admin_Registrations_List');
  const totalItems=result.recordsets?.[0]?.[0]?.TotalItems||0;
  const items=(result.recordsets?.[1]||[]).map(r=>({maDangKy:r.MaDangKy,maSV:r.MaSV,maSinhVien:r.MaSinhVien,hoTenSinhVien:r.HoTenSinhVien,maLop:r.MaLop||null,tenLop:r.TenLopSinhVien||null,maLHP:r.MaLHP,tenMonHoc:r.TenMonHoc,soTinChi:r.SoTinChi,ngayDangKy:r.NgayDangKy,trangThai:r.TrangThai}));
  return {items,page,pageSize,totalItems,totalPages:Math.ceil(totalItems/pageSize)};
};
const getAuditLogs = async (filters = {}) => {
  const pool=await getPool(),page=Math.max(1,parseInt(filters.page)||1),pageSize=Math.min(100,Math.max(1,parseInt(filters.pageSize||filters.limit)||10));
  const result=await pool.request().input('MaTaiKhoan',sql.Int,filters.maTaiKhoan?Number(filters.maTaiKhoan):null)
    .input('TuNgay',sql.Date,filters.tuNgay||null).input('DenNgay',sql.Date,filters.denNgay||null)
    .input('Offset',sql.Int,(page-1)*pageSize).input('PageSize',sql.Int,pageSize).execute('dbo.SP_App_Admin_AuditLogs');
  const totalItems=result.recordsets?.[0]?.[0]?.TotalItems||0;
  const items=(result.recordsets?.[1]||[]).map(r=>({maLog:r.MaLog,maTaiKhoan:r.MaTaiKhoan,username:r.Username||'Hệ thống/Khách',vaiTro:r.VaiTro||'SYSTEM',thoiGian:r.ThoiGian,hanhDong:r.HanhDong,tenBang:r.TenBang,khoaBanGhi:r.KhoaBanGhi,noiDungCu:r.NoiDungCu,noiDungMoi:r.NoiDungMoi}));
  return {items,page,pageSize,totalItems,totalPages:Math.ceil(totalItems/pageSize)};
};
const createStudent = async data => {
  const pool=await getPool();
  const result=await pool.request().input('MaSinhVien',sql.VarChar(20),data.maSinhVien).input('HoTen',sql.NVarChar(100),data.hoTen)
    .input('NgaySinh',sql.Date,data.ngaySinh||null).input('Email',sql.VarChar(254),data.email||null).input('SoDienThoai',sql.VarChar(20),data.soDienThoai||null)
    .input('MaKhoa',sql.VarChar(10),data.maKhoa).input('MaLop',sql.VarChar(20),data.maLop||null).input('MaCTDT',sql.VarChar(24),data.maCTDT)
    .input('TrangThai',sql.VarChar(20),data.trangThai||'DANG_HOC').input('ActorMaTaiKhoan',sql.Int,getRequestActorId()).execute('dbo.SP_App_Admin_Student_Create');
  const r=result.recordset[0];
  return {maSV:r.MaSV,maSinhVien:r.MaSinhVien,hoTen:r.HoTen,ngaySinh:r.NgaySinh,email:r.Email,soDienThoai:r.SoDienThoai,maKhoa:r.MaKhoa,maLop:r.MaLop,maCTDT:r.MaCTDT,trangThai:r.TrangThai,ngayTao:r.NgayTao};
};
const updateStudent = async (maSV,data) => {
  const pool=await getPool();
  const result=await pool.request().input('MaSV',sql.Int,maSV).input('HoTen',sql.NVarChar(100),data.hoTen??null)
    .input('NgaySinh',sql.Date,data.ngaySinh||null).input('Email',sql.VarChar(254),data.email||null).input('SoDienThoai',sql.VarChar(20),data.soDienThoai||null)
    .input('MaKhoa',sql.VarChar(10),data.maKhoa??null).input('MaLop',sql.VarChar(20),data.maLop??null).input('MaCTDT',sql.VarChar(24),data.maCTDT??null)
    .input('TrangThai',sql.VarChar(20),data.trangThai??null).input('HasNgaySinh',sql.Bit,data.ngaySinh!==undefined)
    .input('HasEmail',sql.Bit,data.email!==undefined).input('HasSoDienThoai',sql.Bit,data.soDienThoai!==undefined)
    .input('HasMaKhoa',sql.Bit,data.maKhoa!==undefined).input('HasMaLop',sql.Bit,data.maLop!==undefined)
    .input('HasMaCTDT',sql.Bit,data.maCTDT!==undefined).input('HasTrangThai',sql.Bit,data.trangThai!==undefined)
    .input('ActorMaTaiKhoan',sql.Int,getRequestActorId()).execute('dbo.SP_App_Admin_Student_Update');
  const r=result.recordset[0];
  return {maSV:r.MaSV,maSinhVien:r.MaSinhVien,hoTen:r.HoTen,ngaySinh:r.NgaySinh,email:r.Email,soDienThoai:r.SoDienThoai,maKhoa:r.MaKhoa,maLop:r.MaLop,maCTDT:r.MaCTDT,trangThai:r.TrangThai,ngayTao:r.NgayTao};
};
const deleteStudent = async maSV => {
  const pool=await getPool();
  const result=await pool.request().input('MaSV',sql.Int,maSV).input('ActorMaTaiKhoan',sql.Int,getRequestActorId()).execute('dbo.SP_App_Admin_Student_Delete');
  const action=result.recordset[0]?.action;
  if(action==='SOFT_DELETE') return {success:true,action,message:'Sinh viên đã có lịch sử học tập hoặc học phí nên được chuyển sang trạng thái thôi học.'};
  if(action==='HARD_DELETE') return {success:true,action,message:'Đã xóa hoàn toàn hồ sơ sinh viên thành công.'};
  throw Object.assign(new Error(`Không tìm thấy sinh viên có ID ${maSV}.`),{status:404});
};
const getCourses = async () => {
  const pool=await getPool();
  const result=await pool.request().execute('dbo.SP_App_Admin_Course_List');
  return result.recordset;
};
const createCourse = async d => {
  const pool=await getPool();
  await pool.request().input('MaMonHoc',sql.VarChar(15),d.maMonHoc).input('MaKhoa',sql.VarChar(10),d.maKhoa)
    .input('TenMonHoc',sql.NVarChar(150),d.tenMonHoc).input('SoTinChi',sql.TinyInt,d.soTinChi)
    .input('SoTietLyThuyet',sql.SmallInt,d.soTietLyThuyet).input('SoTietThucHanh',sql.SmallInt,d.soTietThucHanh)
    .input('MoTa',sql.NVarChar(500),d.moTa||null).input('TrangThai',sql.Bit,d.trangThai??true).execute('dbo.SP_App_Admin_Course_Create');
  return {maMonHoc:d.maMonHoc,...d};
};
const updateCourse = async (id,d) => {
  const pool=await getPool();
  const result=await pool.request().input('MaMonHoc',sql.VarChar(15),id).input('MaKhoa',sql.VarChar(10),d.maKhoa)
    .input('TenMonHoc',sql.NVarChar(150),d.tenMonHoc).input('SoTinChi',sql.TinyInt,d.soTinChi)
    .input('SoTietLyThuyet',sql.SmallInt,d.soTietLyThuyet).input('SoTietThucHanh',sql.SmallInt,d.soTietThucHanh)
    .input('MoTa',sql.NVarChar(500),d.moTa||null).input('TrangThai',sql.Bit,d.trangThai??true).execute('dbo.SP_App_Admin_Course_Update');
  if(!result.recordset[0]?.changed) throw Object.assign(new Error('Không tìm thấy môn học.'),{status:404});
  return {maMonHoc:id,...d};
};
const deleteCourse = async id => {
  const pool=await getPool();
  const result=await pool.request().input('MaMonHoc',sql.VarChar(15),id).execute('dbo.SP_App_Admin_Course_Delete');
  if(!result.recordset[0]?.changed) throw Object.assign(new Error('Không tìm thấy môn học.'),{status:404});
  return {maMonHoc:id,deleted:true};
};

const courseParameters = (request,maCTDT,course,placement,prerequisites) => request
  .input('MaCTDT',sql.VarChar(24),maCTDT).input('MaMonHoc',sql.VarChar(15),course.maMonHoc)
  .input('MaKhoa',sql.VarChar(10),course.maKhoa).input('TenMonHoc',sql.NVarChar(150),course.tenMonHoc)
  .input('SoTinChi',sql.TinyInt,course.soTinChi).input('SoTietLyThuyet',sql.SmallInt,course.soTietLyThuyet)
  .input('SoTietThucHanh',sql.SmallInt,course.soTietThucHanh).input('MoTa',sql.NVarChar(500),course.moTa||null)
  .input('TrangThai',sql.Bit,course.trangThai??true).input('HocKyDuKien',sql.TinyInt,placement.hocKyDuKien)
  .input('LoaiMon',sql.VarChar(20),placement.loaiMon).input('ThuTu',sql.SmallInt,placement.thuTu??null)
  .input('PrerequisitesJson',sql.NVarChar(sql.MAX),JSON.stringify(prerequisites||[]));
const createCurriculumCourse = async (maCTDT,{course,placement,prerequisites=[]}) => {
  const pool=await getPool();
  await courseParameters(pool.request(),maCTDT,course,placement,prerequisites).execute('dbo.SP_App_Admin_CurriculumCourse_Create');
  return {maCTDT,...course,...placement,prerequisites};
};
const updateCurriculumCourse = async (maCTDT,maMonHoc,{course,placement,prerequisites=[]}) => {
  const pool=await getPool();
  await courseParameters(pool.request(),maCTDT,{...course,maMonHoc},placement,prerequisites).execute('dbo.SP_App_Admin_CurriculumCourse_Update');
  return {maCTDT,maMonHoc,...course,...placement,prerequisites};
};
const deleteCurriculumCourse = async (maCTDT,maMonHoc) => {
  const pool=await getPool();
  const result=await pool.request().input('MaCTDT',sql.VarChar(24),maCTDT).input('MaMonHoc',sql.VarChar(15),maMonHoc).execute('dbo.SP_App_Admin_CurriculumCourse_Delete');
  if(!result.recordset[0]?.changed) throw Object.assign(new Error('Không tìm thấy môn trong chương trình đào tạo.'),{status:404});
  return {maCTDT,maMonHoc,removedFromCurriculum:true};
};

const schedulesJson = schedules => JSON.stringify((schedules||[]).map(({thu,tietBatDau,soTiet,phongHoc})=>({thu,tietBatDau,soTiet,phongHoc})));
const createClass = async d => {
  const pool=await getPool();
  const status=d.trangThai||'DA_KHOA';
  await pool.request().input('MaLHP',sql.VarChar(20),d.maLHP).input('MaMonHoc',sql.VarChar(15),d.maMonHoc)
    .input('MaHocKy',sql.Int,d.maHocKy).input('MaGiangVien',sql.Int,d.maGiangVien??null).input('TenLHP',sql.NVarChar(100),d.tenLHP)
    .input('SoLuongToiDa',sql.Int,d.soLuongToiDa).input('TrangThai',sql.VarChar(20),status)
    .input('SchedulesJson',sql.NVarChar(sql.MAX),schedulesJson(d.schedules)).execute('dbo.SP_App_Admin_Class_Create');
  return {...d,trangThai:status};
};
const updateClass = async (id,d) => {
  const pool=await getPool();
  const result=await pool.request().input('MaLHP',sql.VarChar(20),id).input('MaMonHoc',sql.VarChar(15),d.maMonHoc)
    .input('MaHocKy',sql.Int,d.maHocKy).input('MaGiangVien',sql.Int,d.maGiangVien??null).input('TenLHP',sql.NVarChar(100),d.tenLHP)
    .input('SoLuongToiDa',sql.Int,d.soLuongToiDa).input('TrangThai',sql.VarChar(20),d.trangThai||null)
    .input('SchedulesJson',sql.NVarChar(sql.MAX),Array.isArray(d.schedules)?schedulesJson(d.schedules):null).execute('dbo.SP_App_Admin_Class_Update');
  return {maLHP:id,...d,trangThai:d.trangThai||result.recordset?.[0]?.trangThai};
};
const deleteClass = async id => {
  const pool=await getPool();
  await pool.request().input('MaLHP',sql.VarChar(20),id).execute('dbo.SP_App_Admin_Class_Delete');
  return {maLHP:id,deleted:true};
};
const getClassSection = async id => {
  const pool=await getPool();
  const result=await pool.request().input('MaLHP',sql.VarChar(20),id).execute('dbo.SP_App_Admin_Class_Get');
  const row=result.recordset[0];
  if(!row) throw Object.assign(new Error('Không tìm thấy lớp học phần.'),{status:404});
  return {...row,schedules:row.schedules?JSON.parse(row.schedules):[]};
};

const getLecturerOptions = async ({maKhoa,trangThai}={}) => {
  const pool=await getPool();
  const result=await pool.request().input('MaKhoa',sql.VarChar(10),maKhoa||null)
    .input('TrangThai',sql.VarChar(20),trangThai||null).execute('dbo.SP_App_Admin_LecturerOptions');
  return result.recordset;
};
const createClassSchedule = async (classId,data) => {
  const pool=await getPool();
  const result=await pool.request().input('MaLHP',sql.VarChar(20),classId).input('Thu',sql.TinyInt,data.thu)
    .input('TietBatDau',sql.TinyInt,data.tietBatDau).input('SoTiet',sql.TinyInt,data.soTiet)
    .input('PhongHoc',sql.VarChar(20),data.phongHoc).execute('dbo.SP_App_Admin_ClassSchedule_Create');
  return {maLichHoc:result.recordset[0].MaLichHoc,maLHP:classId,...data};
};
const updateClassSchedule = async (classId,scheduleId,data) => {
  const pool=await getPool();
  const result=await pool.request().input('MaLHP',sql.VarChar(20),classId).input('MaLichHoc',sql.Int,Number(scheduleId))
    .input('Thu',sql.TinyInt,data.thu).input('TietBatDau',sql.TinyInt,data.tietBatDau).input('SoTiet',sql.TinyInt,data.soTiet)
    .input('PhongHoc',sql.VarChar(20),data.phongHoc).execute('dbo.SP_App_Admin_ClassSchedule_Update');
  if(!result.recordset[0]?.changed) throw Object.assign(new Error('Không tìm thấy lịch học của lớp.'),{status:404});
  return {maLichHoc:Number(scheduleId),maLHP:classId,...data};
};
const deleteClassSchedule = async (classId,scheduleId) => {
  const pool=await getPool();
  const result=await pool.request().input('MaLHP',sql.VarChar(20),classId).input('MaLichHoc',sql.Int,Number(scheduleId)).execute('dbo.SP_App_Admin_ClassSchedule_Delete');
  if(!result.recordset[0]?.changed) throw Object.assign(new Error('Không tìm thấy lịch học của lớp.'),{status:404});
  return {maLichHoc:Number(scheduleId),maLHP:classId,deleted:true};
};

module.exports = {
  getUsersList,
  updateUserStatus,
  getCurriculums,
  getCurriculumOptions,
  getCurriculumPrograms,
  createCurriculumProgram, updateCurriculumProgram, deleteCurriculumProgram,
  getDashboardStats,
  getStudentsList,
  getAllClasses, getClassSection, getLecturerOptions,
  getCourses, createCourse, updateCourse, deleteCourse,
  createCurriculumCourse, updateCurriculumCourse, deleteCurriculumCourse,
  createClass, updateClass, deleteClass, createClassSchedule, updateClassSchedule, deleteClassSchedule,
  getRegistrationsList,
  getAuditLogs,
  createStudent,
  updateStudent,
  deleteStudent
};
