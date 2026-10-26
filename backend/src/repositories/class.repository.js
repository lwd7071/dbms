const { getPool, sql, getRequestActorId } = require('../config/db');

const classRepository = {
  async createHomeroomClass(d) {
    const pool = await getPool();
    await pool.request().input('MaLop', sql.VarChar(20), d.maLop).input('TenLop', sql.NVarChar(100), d.tenLop)
      .input('MaKhoa', sql.VarChar(10), d.maKhoa).input('KhoaHoc', sql.VarChar(20), d.khoaHoc)
      .input('NamNhapHoc', sql.Int, d.namNhapHoc).input('TrangThai', sql.Bit, d.trangThai ?? true)
      .input('ActorMaTaiKhoan', sql.Int, getRequestActorId())
      .execute('dbo.SP_App_Class_CreateHomeroom');
    return { ...d, trangThai: d.trangThai ?? true };
  },
  async updateHomeroomClass(id, d) {
    const pool = await getPool();
    const result = await pool.request().input('MaLop', sql.VarChar(20), id).input('TenLop', sql.NVarChar(100), d.tenLop)
      .input('MaKhoa', sql.VarChar(10), d.maKhoa).input('KhoaHoc', sql.VarChar(20), d.khoaHoc)
      .input('NamNhapHoc', sql.Int, d.namNhapHoc).input('TrangThai', sql.Bit, d.trangThai ?? true)
      .input('ActorMaTaiKhoan', sql.Int, getRequestActorId())
      .execute('dbo.SP_App_Class_UpdateHomeroom');
    if (!result.recordset[0]?.affected) throw Object.assign(new Error('Không tìm thấy lớp sinh hoạt.'), { status: 404, field: 'maLop' });
    return { maLop: id, ...d, trangThai: d.trangThai ?? true };
  },
  async deleteHomeroomClass(id) {
    const pool = await getPool();
    const result = await pool.request().input('MaLop', sql.VarChar(20), id)
      .input('ActorMaTaiKhoan', sql.Int, getRequestActorId()).execute('dbo.SP_App_Class_DeleteHomeroom');
    if (!result.recordset[0]?.affected) throw Object.assign(new Error('Không tìm thấy lớp sinh hoạt.'), { status: 404, field: 'maLop' });
    return { maLop: id, deleted: true };
  },
  async findAll({ maKhoa, namNhapHoc } = {}) {
    const pool = await getPool();
    const result = await pool.request().input('MaKhoa', sql.VarChar(10), maKhoa || null)
      .input('NamNhapHoc', sql.Int, namNhapHoc ? Number.parseInt(namNhapHoc, 10) : null)
      .execute('dbo.SP_App_Class_ListHomerooms');
    return result.recordset;
  },
  async findById(maLop) {
    const pool = await getPool();
    const result = await pool.request().input('MaLop', sql.VarChar(20), maLop).execute('dbo.SP_App_Class_GetHomeroom');
    if (!result.recordsets?.[0]?.length) return null;
    const info = result.recordsets[0][0];
    info.students = result.recordsets[1] || [];
    info.soLuongSV = info.students.length;
    return info;
  },
  async getTuitionReport(maLop, maHocKy) {
    const pool = await getPool();
    const result = await pool.request().input('MaLop', sql.VarChar(20), maLop)
      .input('MaHocKy', sql.Int, maHocKy ? Number.parseInt(maHocKy, 10) : null)
      .execute('dbo.SP_ThongKeHocPhiTheoLop');
    const row = result.recordset?.[0];
    if (!row) return null;
    return { maLop: row.MaLop, tenLop: row.TenLop, tenKhoa: row.TenKhoa, maHocKy: row.MaHocKy,
      tenHocKy: row.TenHocKy, namHoc: row.NamHoc, tongSoSinhVien: row.TongSoSinhVien,
      soSinhVienCoHocPhi: row.SoSinhVienCoHocPhi, tongTienPhaiThu: row.TongTienPhaiThu,
      tongTienDaThu: row.TongTienDaThu, tongTienConNo: row.TongTienConNo,
      soSV_DaHoanThanh: row.SoSV_DaHoanThanh, soSV_NopMotPhan: row.SoSV_NopMotPhan, soSV_ChuaNop: row.SoSV_ChuaNop };
  }
};

module.exports = classRepository;
