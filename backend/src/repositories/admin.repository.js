const { getPool, sql } = require('../config/db');

/**
 * Repository xử lý các tác vụ quản trị hệ thống
 */

// Lấy danh sách tài khoản người dùng từ View V_TaiKhoanNguoiDung có phân trang
const getUsersList = async (filters = {}) => {
  const pool = await getPool();
  const page = Math.max(1, parseInt(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 10));
  const { vaiTro, trangThai, maLop, search } = filters;
  const request = pool.request();

  request.input('Offset', sql.Int, (page - 1) * pageSize);
  request.input('PageSize', sql.Int, pageSize);

  let whereClause = ` WHERE 1=1 `;

  if (vaiTro) {
    whereClause += ` AND VaiTro = @VaiTro `;
    request.input('VaiTro', sql.VarChar(20), vaiTro);
  }

  if (trangThai) {
    whereClause += ` AND TrangThai = @TrangThai `;
    request.input('TrangThai', sql.VarChar(20), trangThai);
  }

  if (maLop) {
    whereClause += ` AND MaLop = @MaLop `;
    request.input('MaLop', sql.VarChar(20), maLop);
  }

  if (search) {
    whereClause += ` AND (Username LIKE @Search OR HoTenSinhVien LIKE @Search OR HoTenGiangVien LIKE @Search) `;
    request.input('Search', sql.NVarChar(100), `%${search}%`);
  }

  // Đếm tổng số tài khoản
  const countQuery = `
    SELECT COUNT(*) AS TotalItems
    FROM dbo.V_TaiKhoanNguoiDung
    ${whereClause};
  `;
  const countResult = await request.query(countQuery);
  const totalItems = countResult.recordset[0]?.TotalItems || 0;

  // Lấy dữ liệu trang
  const dataQuery = `
    SELECT
      MaTaiKhoan,
      Username,
      VaiTro,
      TrangThai,
      MaSV,
      MaSinhVien,
      HoTenSinhVien,
      EmailSinhVien,
      MaLop,
      TenLopSinhVien,
      MaGV,
      MaGiangVien,
      HoTenGiangVien,
      EmailGiangVien,
      NgayTao,
      LanDangNhapCuoi
    FROM dbo.V_TaiKhoanNguoiDung
    ${whereClause}
    ORDER BY MaTaiKhoan DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
  `;
  const dataResult = await request.query(dataQuery);

  const items = dataResult.recordset.map(r => ({
    maTaiKhoan: r.MaTaiKhoan,
    username: r.Username,
    vaiTro: r.VaiTro,
    trangThai: r.TrangThai,
    maLop: r.MaLop || null,
    tenLop: r.TenLopSinhVien || null,
    hoTen: r.HoTenSinhVien || r.HoTenGiangVien || 'Quản trị viên',
    email: r.EmailSinhVien || r.EmailGiangVien || 'admin@edu.vn',
    ngayTao: r.NgayTao,
    lanDangNhapCuoi: r.LanDangNhapCuoi
  }));

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize)
  };
};

// Cập nhật trạng thái tài khoản (ACTIVE / LOCKED)
const updateUserStatus = async (username, status) => {
  const pool = await getPool();
  await pool
    .request()
    .input('Username', sql.VarChar(50), username)
    .input('TrangThai', sql.VarChar(20), status)
    .query(`
      UPDATE dbo.TAIKHOAN
      SET TrangThai = @TrangThai
      WHERE Username = @Username;
    `);

  return { username, trangThai: status };
};

// Lấy cấu trúc khung Chương trình Đào tạo từ View V_CauTrucChuongTrinhDaoTao
const getCurriculums = async (maKhoa = null) => {
  const pool = await getPool();
  const request = pool.request();

  let query = `
    SELECT TOP 200
      MaCTDT,
      TenCTDT,
      Nganh,
      KhoaHoc,
      MaKhoa,
      TenKhoa,
      MaMonHoc,
      TenMonHoc,
      SoTinChi,
      HocKyDuKien,
      LoaiMon,
      ThuTu
    FROM dbo.V_CauTrucChuongTrinhDaoTao
    WHERE 1=1
  `;

  if (maKhoa) {
    query += ` AND MaKhoa = @MaKhoa`;
    request.input('MaKhoa', sql.VarChar(20), maKhoa);
  }

  query += ` ORDER BY MaCTDT, HocKyDuKien, ThuTu`;
  const result = await request.query(query);

  return result.recordset.map(r => ({
    maCTDT: r.MaCTDT,
    tenCTDT: r.TenCTDT,
    nganh: r.Nganh,
    khoaHoc: r.KhoaHoc,
    maKhoa: r.MaKhoa,
    tenKhoa: r.TenKhoa,
    maMonHoc: r.MaMonHoc,
    tenMonHoc: r.TenMonHoc,
    soTinChi: r.SoTinChi,
    hocKyDuKien: r.HocKyDuKien,
    loaiMon: r.LoaiMon,
    thuTu: r.ThuTu
  }));
};

// 1. Lấy chỉ số tổng quan cho Dashboard
const getDashboardStats = async () => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      (SELECT COUNT(*) FROM dbo.SINHVIEN) AS TongSinhVien,
      (SELECT COUNT(*) FROM dbo.LOP) AS TongLopSinhHoat,
      (SELECT COUNT(*) FROM dbo.LOPHOCPHAN) AS TongLopHocPhan,
      (SELECT COUNT(*) FROM dbo.DANGKYTINCHI WHERE TrangThai = 'REGISTERED') AS TongLuotDangKy,
      (SELECT ISNULL(SUM(TongTien), 0) FROM dbo.HOCPHI) AS TongHocPhiPhaiThu,
      (SELECT ISNULL(SUM(SoTienDaThanhToan), 0) FROM dbo.HOCPHI) AS TongTienDaThu,
      (SELECT COUNT(*) FROM dbo.CHITIETTHANHTOAN WHERE TrangThai = 'CHO_XAC_NHAN') AS SoGiaoDichChoXacNhan
  `);

  const row = result.recordset[0] || {};
  return {
    tongSinhVien: Number(row.TongSinhVien || 0),
    tongLopSinhHoat: Number(row.TongLopSinhHoat || 0),
    tongLopHocPhan: Number(row.TongLopHocPhan || 0),
    tongLuotDangKy: Number(row.TongLuotDangKy || 0),
    tongHocPhiPhaiThu: Number(row.TongHocPhiPhaiThu || 0),
    tongTienDaThu: Number(row.TongTienDaThu || 0),
    soGiaoDichChoXacNhan: Number(row.SoGiaoDichChoXacNhan || 0)
  };
};

// 2. Lấy danh sách sinh viên có phân trang
const getStudentsList = async (filters = {}) => {
  const pool = await getPool();
  const page = Math.max(1, parseInt(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 10));
  const { search, maKhoa, maLop, trangThai } = filters;
  const request = pool.request();

  request.input('Offset', sql.Int, (page - 1) * pageSize);
  request.input('PageSize', sql.Int, pageSize);

  let whereClause = ` WHERE 1=1 `;

  if (maKhoa) {
    whereClause += ` AND sv.MaKhoa = @MaKhoa `;
    request.input('MaKhoa', sql.VarChar(10), maKhoa);
  }

  if (maLop) {
    whereClause += ` AND sv.MaLop = @MaLop `;
    request.input('MaLop', sql.VarChar(20), maLop);
  }

  if (trangThai) {
    whereClause += ` AND sv.TrangThai = @TrangThai `;
    request.input('TrangThai', sql.VarChar(20), trangThai);
  }

  if (search) {
    whereClause += ` AND (sv.MaSinhVien LIKE @Search OR sv.HoTen LIKE @Search OR sv.Email LIKE @Search) `;
    request.input('Search', sql.NVarChar(100), `%${search}%`);
  }

  // 1. Đếm tổng số bản ghi
  const countQuery = `
    SELECT COUNT(*) AS TotalItems
    FROM dbo.SINHVIEN sv
    INNER JOIN dbo.KHOA k ON sv.MaKhoa = k.MaKhoa
    LEFT JOIN dbo.LOP l ON sv.MaLop = l.MaLop
    ${whereClause};
  `;
  const countResult = await request.query(countQuery);
  const totalItems = countResult.recordset[0]?.TotalItems || 0;

  // 2. Lấy trang dữ liệu
  const dataQuery = `
    SELECT
      sv.MaSV,
      sv.MaSinhVien,
      sv.HoTen,
      sv.NgaySinh,
      sv.Email,
      sv.SoDienThoai,
      sv.MaKhoa,
      k.TenKhoa,
      sv.MaLop,
      l.TenLop,
      sv.TrangThai,
      sv.NgayTao
    FROM dbo.SINHVIEN sv
    INNER JOIN dbo.KHOA k ON sv.MaKhoa = k.MaKhoa
    LEFT JOIN dbo.LOP l ON sv.MaLop = l.MaLop
    ${whereClause}
    ORDER BY sv.MaSV ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
  `;
  const dataResult = await request.query(dataQuery);

  const items = dataResult.recordset.map(r => ({
    maSV: r.MaSV,
    maSinhVien: r.MaSinhVien,
    hoTen: r.HoTen,
    ngaySinh: r.NgaySinh,
    email: r.Email,
    soDienThoai: r.SoDienThoai,
    maKhoa: r.MaKhoa,
    tenKhoa: r.TenKhoa,
    maLop: r.MaLop || null,
    tenLop: r.TenLop || null,
    trangThai: r.TrangThai,
    ngayTao: r.NgayTao
  }));

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize)
  };
};

// 3. Lấy danh sách tất cả lớp học phần có phân trang
const getAllClasses = async (filters = {}) => {
  const pool = await getPool();
  const page = Math.max(1, parseInt(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 10));
  const { maHocKy, search } = filters;
  const request = pool.request();

  request.input('Offset', sql.Int, (page - 1) * pageSize);
  request.input('PageSize', sql.Int, pageSize);

  let whereClause = ` WHERE 1=1 `;

  if (maHocKy) {
    whereClause += ` AND lhp.MaHocKy = @MaHocKy `;
    request.input('MaHocKy', sql.Int, maHocKy);
  }

  if (search) {
    whereClause += ` AND (lhp.MaLHP LIKE @Search OR mh.TenMonHoc LIKE @Search) `;
    request.input('Search', sql.NVarChar(100), `%${search}%`);
  }

  // Đếm tổng số bản ghi
  const countQuery = `
    SELECT COUNT(*) AS TotalItems
    FROM dbo.LOPHOCPHAN lhp
    INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
    INNER JOIN dbo.HOCKY hk ON lhp.MaHocKy = hk.MaHocKy
    ${whereClause};
  `;
  const countResult = await request.query(countQuery);
  const totalItems = countResult.recordset[0]?.TotalItems || 0;

  // Lấy dữ liệu trang
  const dataQuery = `
    SELECT
      lhp.MaLHP,
      lhp.TenLHP,
      mh.MaMonHoc,
      mh.TenMonHoc,
      mh.SoTinChi,
      hk.MaHocKy,
      hk.TenHocKy,
      hk.NamHoc,
      gv.HoTen AS HoTenGiangVien,
      lhp.SoLuongToiDa,
      lhp.TrangThai,
      (SELECT COUNT(*) FROM dbo.DANGKYTINCHI dk WHERE dk.MaLHP = lhp.MaLHP AND dk.TrangThai = 'REGISTERED') AS SiSoHienTai,
      lh.Thu,
      lh.TietBatDau,
      lh.SoTiet,
      lh.PhongHoc
    FROM dbo.LOPHOCPHAN lhp
    INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
    INNER JOIN dbo.HOCKY hk ON lhp.MaHocKy = hk.MaHocKy
    LEFT JOIN dbo.GIANGVIEN gv ON lhp.MaGiangVien = gv.MaGV
    LEFT JOIN dbo.LICHHOC lh ON lhp.MaLHP = lh.MaLHP
    ${whereClause}
    ORDER BY lhp.MaLHP ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
  `;
  const dataResult = await request.query(dataQuery);

  const items = dataResult.recordset.map(r => ({
    maLHP: r.MaLHP,
    tenLHP: r.TenLHP,
    maMonHoc: r.MaMonHoc,
    tenMonHoc: r.TenMonHoc,
    soTinChi: r.SoTinChi,
    maHocKy: r.MaHocKy,
    tenHocKy: r.TenHocKy,
    namHoc: r.NamHoc,
    hoTenGiangVien: r.HoTenGiangVien || 'Chưa phân công',
    soLuongToiDa: r.SoLuongToiDa,
    siSoHienTai: r.SiSoHienTai,
    trangThai: r.TrangThai,
    thu: r.Thu,
    tietBatDau: r.TietBatDau,
    soTiet: r.SoTiet,
    phongHoc: r.PhongHoc
  }));

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize)
  };
};

// 4. Lấy danh sách đăng ký tín chỉ có phân trang
const getRegistrationsList = async (filters = {}) => {
  const pool = await getPool();
  const page = Math.max(1, parseInt(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize) || 10));
  const { maSV, maLHP, maLop, trangThai, search } = filters;
  const request = pool.request();

  request.input('Offset', sql.Int, (page - 1) * pageSize);
  request.input('PageSize', sql.Int, pageSize);

  let whereClause = ` WHERE 1=1 `;

  if (maSV) {
    whereClause += ` AND dk.MaSV = @MaSV `;
    request.input('MaSV', sql.Int, maSV);
  }

  if (maLHP) {
    whereClause += ` AND dk.MaLHP = @MaLHP `;
    request.input('MaLHP', sql.VarChar(20), maLHP);
  }

  if (maLop) {
    whereClause += ` AND sv.MaLop = @MaLop `;
    request.input('MaLop', sql.VarChar(20), maLop);
  }

  if (trangThai) {
    whereClause += ` AND dk.TrangThai = @TrangThai `;
    request.input('TrangThai', sql.VarChar(20), trangThai);
  }

  if (search) {
    whereClause += ` AND (sv.MaSinhVien LIKE @Search OR sv.HoTen LIKE @Search OR dk.MaLHP LIKE @Search) `;
    request.input('Search', sql.NVarChar(100), `%${search}%`);
  }

  // Đếm tổng số bản ghi
  const countQuery = `
    SELECT COUNT(*) AS TotalItems
    FROM dbo.DANGKYTINCHI dk
    INNER JOIN dbo.SINHVIEN sv ON dk.MaSV = sv.MaSV
    INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP = lhp.MaLHP
    INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
    ${whereClause};
  `;
  const countResult = await request.query(countQuery);
  const totalItems = countResult.recordset[0]?.TotalItems || 0;

  // Lấy trang dữ liệu
  const dataQuery = `
    SELECT
      dk.MaDangKy,
      dk.MaSV,
      sv.MaSinhVien,
      sv.HoTen AS HoTenSinhVien,
      sv.MaLop,
      l.TenLop AS TenLopSinhVien,
      dk.MaLHP,
      mh.TenMonHoc,
      mh.SoTinChi,
      dk.NgayDangKy,
      dk.TrangThai
    FROM dbo.DANGKYTINCHI dk
    INNER JOIN dbo.SINHVIEN sv ON dk.MaSV = sv.MaSV
    LEFT JOIN dbo.LOP l ON sv.MaLop = l.MaLop
    INNER JOIN dbo.LOPHOCPHAN lhp ON dk.MaLHP = lhp.MaLHP
    INNER JOIN dbo.MONHOC mh ON lhp.MaMonHoc = mh.MaMonHoc
    ${whereClause}
    ORDER BY dk.MaDangKy DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
  `;
  const dataResult = await request.query(dataQuery);

  const items = dataResult.recordset.map(r => ({
    maDangKy: r.MaDangKy,
    maSV: r.MaSV,
    maSinhVien: r.MaSinhVien,
    hoTenSinhVien: r.HoTenSinhVien,
    maLop: r.MaLop || null,
    tenLop: r.TenLopSinhVien || null,
    maLHP: r.MaLHP,
    tenMonHoc: r.TenMonHoc,
    soTinChi: r.SoTinChi,
    ngayDangKy: r.NgayDangKy,
    trangThai: r.TrangThai
  }));

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize)
  };
};

// 5. Lấy nhật ký hoạt động hệ thống (LOGHOATDONG) có phân trang
const getAuditLogs = async (filters = {}) => {
  const pool = await getPool();
  const page = Math.max(1, parseInt(filters.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(filters.pageSize || filters.limit) || 10));
  const request = pool.request();

  request.input('Offset', sql.Int, (page - 1) * pageSize);
  request.input('PageSize', sql.Int, pageSize);

  // Đếm tổng số logs
  const countResult = await request.query(`SELECT COUNT(*) AS TotalItems FROM dbo.LOGHOATDONG`);
  const totalItems = countResult.recordset[0]?.TotalItems || 0;

  // Lấy dữ liệu trang
  const result = await request.query(`
    SELECT
      lg.MaLog,
      lg.MaTaiKhoan,
      tk.Username,
      tk.VaiTro,
      lg.ThoiGian,
      lg.HanhDong,
      lg.TenBang,
      lg.KhoaBanGhi,
      lg.NoiDungCu,
      lg.NoiDungMoi
    FROM dbo.LOGHOATDONG lg
    LEFT JOIN dbo.TAIKHOAN tk ON lg.MaTaiKhoan = tk.MaTaiKhoan
    ORDER BY lg.MaLog DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
  `);

  const items = result.recordset.map(r => ({
    maLog: r.MaLog,
    maTaiKhoan: r.MaTaiKhoan,
    username: r.Username || 'Hệ thống/Khách',
    vaiTro: r.VaiTro || 'SYSTEM',
    thoiGian: r.ThoiGian,
    hanhDong: r.HanhDong,
    tenBang: r.TenBang,
    khoaBanGhi: r.KhoaBanGhi,
    noiDungCu: r.NoiDungCu,
    noiDungMoi: r.NoiDungMoi
  }));

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize)
  };
};

// Thêm mới sinh viên
const createStudent = async (data) => {
  const pool = await getPool();
  const { maSinhVien, hoTen, ngaySinh, email, soDienThoai, maKhoa, maLop, trangThai } = data;

  // Kiểm tra trùng mã sinh viên
  const dupCheck = await pool.request()
    .input('MaSinhVien', sql.VarChar(20), maSinhVien)
    .query('SELECT MaSV FROM dbo.SINHVIEN WHERE MaSinhVien = @MaSinhVien');

  if (dupCheck.recordset.length > 0) {
    const error = new Error(`Mã sinh viên ${maSinhVien} đã tồn tại trong hệ thống.`);
    error.status = 409;
    throw error;
  }

  // Nếu có mã lớp, kiểm tra khoa của lớp phải khớp với khoa của sinh viên
  if (maLop) {
    const lopCheck = await pool.request()
      .input('MaLop', sql.VarChar(20), maLop)
      .query('SELECT MaKhoa FROM dbo.LOP WHERE MaLop = @MaLop');

    if (lopCheck.recordset.length > 0 && lopCheck.recordset[0].MaKhoa !== maKhoa) {
      const error = new Error(`Khoa của lớp sinh hoạt (${lopCheck.recordset[0].MaKhoa}) không khớp với khoa đã chọn (${maKhoa}).`);
      error.status = 400;
      throw error;
    }
  }

  const result = await pool.request()
    .input('MaSinhVien', sql.VarChar(20), maSinhVien)
    .input('HoTen', sql.NVarChar(100), hoTen)
    .input('NgaySinh', sql.Date, ngaySinh || null)
    .input('Email', sql.VarChar(254), email || null)
    .input('SoDienThoai', sql.VarChar(20), soDienThoai || null)
    .input('MaKhoa', sql.VarChar(10), maKhoa)
    .input('MaLop', sql.VarChar(20), maLop || null)
    .input('TrangThai', sql.VarChar(20), trangThai || 'DANG_HOC')
    .query(`
      DECLARE @OutputTable TABLE (
        MaSV INT,
        MaSinhVien VARCHAR(20),
        HoTen NVARCHAR(100),
        NgaySinh DATE,
        Email VARCHAR(254),
        SoDienThoai VARCHAR(20),
        MaKhoa VARCHAR(10),
        MaLop VARCHAR(20),
        TrangThai VARCHAR(20),
        NgayTao DATETIME2(0)
      );

      INSERT INTO dbo.SINHVIEN (MaSinhVien, HoTen, NgaySinh, Email, SoDienThoai, MaKhoa, MaLop, TrangThai)
      OUTPUT inserted.MaSV, inserted.MaSinhVien, inserted.HoTen, inserted.NgaySinh, inserted.Email, inserted.SoDienThoai, inserted.MaKhoa, inserted.MaLop, inserted.TrangThai, inserted.NgayTao
      INTO @OutputTable
      VALUES (@MaSinhVien, @HoTen, @NgaySinh, @Email, @SoDienThoai, @MaKhoa, @MaLop, @TrangThai);

      SELECT * FROM @OutputTable;
    `);

  const created = result.recordset[0];
  return {
    maSV: created.MaSV,
    maSinhVien: created.MaSinhVien,
    hoTen: created.HoTen,
    ngaySinh: created.NgaySinh,
    email: created.Email,
    soDienThoai: created.SoDienThoai,
    maKhoa: created.MaKhoa,
    maLop: created.MaLop,
    trangThai: created.TrangThai,
    ngayTao: created.NgayTao
  };
};

// Cập nhật thông tin sinh viên
const updateStudent = async (maSV, data) => {
  const pool = await getPool();
  const { hoTen, ngaySinh, email, soDienThoai, maKhoa, maLop, trangThai } = data;

  const curCheck = await pool.request()
    .input('MaSV', sql.Int, maSV)
    .query('SELECT * FROM dbo.SINHVIEN WHERE MaSV = @MaSV');

  if (curCheck.recordset.length === 0) {
    const error = new Error(`Không tìm thấy sinh viên có ID ${maSV}.`);
    error.status = 404;
    throw error;
  }

  const cur = curCheck.recordset[0];
  const finalKhoa = maKhoa || cur.MaKhoa;
  const finalLop = maLop !== undefined ? maLop : cur.MaLop;

  if (finalLop) {
    const lopCheck = await pool.request()
      .input('MaLop', sql.VarChar(20), finalLop)
      .query('SELECT MaKhoa FROM dbo.LOP WHERE MaLop = @MaLop');

    if (lopCheck.recordset.length > 0 && lopCheck.recordset[0].MaKhoa !== finalKhoa) {
      const error = new Error(`Khoa của lớp sinh hoạt (${lopCheck.recordset[0].MaKhoa}) không khớp với khoa (${finalKhoa}).`);
      error.status = 400;
      throw error;
    }
  }

  const result = await pool.request()
    .input('MaSV', sql.Int, maSV)
    .input('HoTen', sql.NVarChar(100), hoTen || cur.HoTen)
    .input('NgaySinh', sql.Date, ngaySinh !== undefined ? (ngaySinh || null) : cur.NgaySinh)
    .input('Email', sql.VarChar(254), email !== undefined ? (email || null) : cur.Email)
    .input('SoDienThoai', sql.VarChar(20), soDienThoai !== undefined ? (soDienThoai || null) : cur.SoDienThoai)
    .input('MaKhoa', sql.VarChar(10), finalKhoa)
    .input('MaLop', sql.VarChar(20), finalLop || null)
    .input('TrangThai', sql.VarChar(20), trangThai || cur.TrangThai)
    .query(`
      DECLARE @OutputTable TABLE (
        MaSV INT,
        MaSinhVien VARCHAR(20),
        HoTen NVARCHAR(100),
        NgaySinh DATE,
        Email VARCHAR(254),
        SoDienThoai VARCHAR(20),
        MaKhoa VARCHAR(10),
        MaLop VARCHAR(20),
        TrangThai VARCHAR(20),
        NgayTao DATETIME2(0)
      );

      UPDATE dbo.SINHVIEN
      SET HoTen = @HoTen,
          NgaySinh = @NgaySinh,
          Email = @Email,
          SoDienThoai = @SoDienThoai,
          MaKhoa = @MaKhoa,
          MaLop = @MaLop,
          TrangThai = @TrangThai
      OUTPUT inserted.MaSV, inserted.MaSinhVien, inserted.HoTen, inserted.NgaySinh, inserted.Email, inserted.SoDienThoai, inserted.MaKhoa, inserted.MaLop, inserted.TrangThai, inserted.NgayTao
      INTO @OutputTable
      WHERE MaSV = @MaSV;

      SELECT * FROM @OutputTable;
    `);

  const updated = result.recordset[0];
  return {
    maSV: updated.MaSV,
    maSinhVien: updated.MaSinhVien,
    hoTen: updated.HoTen,
    ngaySinh: updated.NgaySinh,
    email: updated.Email,
    soDienThoai: updated.SoDienThoai,
    maKhoa: updated.MaKhoa,
    maLop: updated.MaLop,
    trangThai: updated.TrangThai,
    ngayTao: updated.NgayTao
  };
};

// Xóa hoặc chuyển trạng thái thôi học
const deleteStudent = async (maSV) => {
  const pool = await getPool();

  const regCheck = await pool.request()
    .input('MaSV', sql.Int, maSV)
    .query(`
      SELECT 
        (SELECT COUNT(*) FROM dbo.DANGKYTINCHI WHERE MaSV = @MaSV) AS SoDangKy,
        (SELECT COUNT(*) FROM dbo.HOCPHI WHERE MaSV = @MaSV) AS SoHocPhi
    `);

  const { SoDangKy, SoHocPhi } = regCheck.recordset[0] || { SoDangKy: 0, SoHocPhi: 0 };

  if (SoDangKy > 0 || SoHocPhi > 0) {
    await pool.request()
      .input('MaSV', sql.Int, maSV)
      .query(`UPDATE dbo.SINHVIEN SET TrangThai = 'THOI_HOC' WHERE MaSV = @MaSV`);

    return {
      success: true,
      action: 'SOFT_DELETE',
      message: 'Sinh viên đã có lịch sử học tập/học phí, đã chuyển trạng thái sang THÔI HỌC.'
    };
  } else {
    await pool.request()
      .input('MaSV', sql.Int, maSV)
      .query(`DELETE FROM dbo.TAIKHOAN WHERE MaSV = @MaSV`);

    await pool.request()
      .input('MaSV', sql.Int, maSV)
      .query(`DELETE FROM dbo.SINHVIEN WHERE MaSV = @MaSV`);

    return {
      success: true,
      action: 'HARD_DELETE',
      message: 'Đã xóa hoàn toàn hồ sơ sinh viên thành công.'
    };
  }
};

module.exports = {
  getUsersList,
  updateUserStatus,
  getCurriculums,
  getDashboardStats,
  getStudentsList,
  getAllClasses,
  getRegistrationsList,
  getAuditLogs,
  createStudent,
  updateStudent,
  deleteStudent
};
