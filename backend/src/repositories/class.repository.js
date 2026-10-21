const { getPool } = require('../config/db');

/**
 * Repository thao tác bảng LOP và sinh viên trực thuộc
 */
const classRepository = {
  /**
   * Lấy danh sách lớp sinh hoạt kèm sĩ số tính động qua View V_DanhSachLopSinhHoat
   */
  async findAll({ maKhoa, namNhapHoc } = {}) {
    const pool = await getPool();
    let query = `
      SELECT 
        v.MaLop AS maLop,
        v.TenLop AS tenLop,
        v.MaKhoa AS maKhoa,
        v.TenKhoa AS tenKhoa,
        v.KhoaHoc AS khoaHoc,
        v.NamNhapHoc AS namNhapHoc,
        v.TrangThai AS trangThai,
        CAST(v.SiSoThucTe AS INT) AS soLuongSV
      FROM dbo.V_DanhSachLopSinhHoat v
      WHERE 1=1
    `;

    const request = pool.request();
    if (maKhoa) {
      query += ' AND v.MaKhoa = @maKhoa';
      request.input('maKhoa', maKhoa);
    }
    if (namNhapHoc) {
      query += ' AND v.NamNhapHoc = @namNhapHoc';
      request.input('namNhapHoc', parseInt(namNhapHoc, 10));
    }

    query += ' ORDER BY v.NamNhapHoc DESC, v.MaKhoa, v.MaLop';

    const result = await request.query(query);
    return result.recordset;
  },

  /**
   * Lấy chi tiết lớp sinh hoạt và danh sách sinh viên
   */
  async findById(maLop) {
    const pool = await getPool();

    // Thông tin lớp
    const classResult = await pool
      .request()
      .input('maLop', maLop)
      .query(`
        SELECT 
          l.MaLop AS maLop,
          l.TenLop AS tenLop,
          l.MaKhoa AS maKhoa,
          k.TenKhoa AS tenKhoa,
          l.KhoaHoc AS khoaHoc,
          l.NamNhapHoc AS namNhapHoc,
          l.TrangThai AS trangThai
        FROM dbo.LOP l
        INNER JOIN dbo.KHOA k ON l.MaKhoa = k.MaKhoa
        WHERE l.MaLop = @maLop
      `);

    if (classResult.recordset.length === 0) {
      return null;
    }

    const classInfo = classResult.recordset[0];

    // Danh sách sinh viên
    const studentsResult = await pool
      .request()
      .input('maLop', maLop)
      .query(`
        SELECT 
          sv.MaSV AS maSV,
          sv.MaCTDT AS maCTDT,
          sv.MaSinhVien AS maSinhVien,
          sv.HoTen AS hoTen,
          sv.NgaySinh AS ngaySinh,
          sv.Email AS email,
          sv.SoDienThoai AS soDienThoai,
          sv.TrangThai AS trangThai
        FROM dbo.SINHVIEN sv
        WHERE sv.MaLop = @maLop
        ORDER BY sv.MaSinhVien
      `);

    classInfo.students = studentsResult.recordset;
    classInfo.soLuongSV = studentsResult.recordset.length;
    return classInfo;
  },

  /**
   * Báo cáo tình hình học phí của lớp qua Stored Procedure SP_ThongKeHocPhiTheoLop
   */
  async getTuitionReport(maLop, maHocKy) {
    const pool = await getPool();
    const request = pool.request().input('MaLop', maLop);
    if (maHocKy) {
      request.input('MaHocKy', parseInt(maHocKy, 10));
    }

    const result = await request.execute('dbo.SP_ThongKeHocPhiTheoLop');
    if (!result.recordset || result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return {
      maLop: row.MaLop,
      tenLop: row.TenLop,
      tenKhoa: row.TenKhoa,
      maHocKy: row.MaHocKy,
      tenHocKy: row.TenHocKy,
      namHoc: row.NamHoc,
      tongSoSinhVien: row.TongSoSinhVien,
      soSinhVienCoHocPhi: row.SoSinhVienCoHocPhi,
      tongTienPhaiThu: row.TongTienPhaiThu,
      tongTienDaThu: row.TongTienDaThu,
      tongTienConNo: row.TongTienConNo,
      soSV_DaHoanThanh: row.SoSV_DaHoanThanh,
      soSV_NopMotPhan: row.SoSV_NopMotPhan,
      soSV_ChuaNop: row.SoSV_ChuaNop
    };
  }
};

module.exports = classRepository;
