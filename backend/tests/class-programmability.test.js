const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { getPool, closePool, sql } = require('../src/config/db');

describe('Administrative Class Programmability TDD (Views, Functions, Triggers, SP)', () => {
  let pool;
  let tokenDaoTao;

  beforeAll(async () => {
    pool = await getPool();

    // Lấy token vai trò DAO_TAO
    const resLogin = await requestAs(app, "training", 1)
      .post('/api/auth/login')
      .send({ username: 'daotao01', password: '123' + '456' });
    tokenDaoTao = resLogin.body.data.token;
  });

  afterAll(async () => {
    await closePool();
  });

  describe('Vertical Slice 1: View V_DanhSachLopSinhHoat & Function FN_DemSiSoLopSinhHoat', () => {
    it('Function FN_DemSiSoLopSinhHoat trả về chính xác sĩ số của lớp', async () => {
      const res = await pool.request()
        .input('MaLop', sql.VarChar(20), 'CNTT23_01')
        .query('SELECT dbo.FN_DemSiSoLopSinhHoat(@MaLop) AS SiSo');

      expect(res.recordset[0].SiSo).toBe(42);
    });

    it('View V_DanhSachLopSinhHoat cung cấp đầy đủ thông tin 36 lớp sinh hoạt', async () => {
      const res = await pool.request()
        .query('SELECT COUNT(*) AS TongSoLop, SUM(SiSoThucTe) AS TongSinhVien FROM dbo.V_DanhSachLopSinhHoat');

      expect(res.recordset[0].TongSoLop).toBe(36);
      expect(Number(res.recordset[0].TongSinhVien)).toBe(1500);
    });
  });

  describe('Vertical Slice 2: Trigger TR_LOP_Audit ghi nhận lịch sử vào LOGHOATDONG', () => {
    const testMaLop = `T${Date.now()}`;

    afterEach(async () => {
      try {
        await pool.request()
          .input('MaLop', sql.VarChar(20), testMaLop)
          .query('DELETE FROM dbo.LOP WHERE MaLop = @MaLop');
      } catch (e) {
        // ignore
      }
    });

    it('Tự động ghi log khi INSERT và DELETE trên bảng LOP', async () => {
      // 1. INSERT lớp mới
      await pool.request()
        .input('MaLop', sql.VarChar(20), testMaLop)
        .input('TenLop', sql.NVarChar(100), 'Lớp Test Audit')
        .input('MaKhoa', sql.VarChar(10), 'CNTT')
        .input('KhoaHoc', sql.VarChar(20), '2025-2029')
        .input('NamNhapHoc', sql.Int, 2025)
        .query(`
          INSERT INTO dbo.LOP (MaLop, TenLop, MaKhoa, KhoaHoc, NamNhapHoc, TrangThai)
          VALUES (@MaLop, @TenLop, @MaKhoa, @KhoaHoc, @NamNhapHoc, 1);
        `);

      // Kiểm tra có log INSERT
      const logInsert = await pool.request()
        .input('MaLop', sql.VarChar(20), testMaLop)
        .query("SELECT TOP 1 * FROM dbo.LOGHOATDONG WHERE TenBang = 'LOP' AND KhoaBanGhi = @MaLop AND HanhDong = 'INSERT' ORDER BY ThoiGian DESC");

      expect(logInsert.recordset.length).toBe(1);
      expect(logInsert.recordset[0].NoiDungMoi).toContain('Lớp Test Audit');

      // 2. DELETE lớp
      await pool.request()
        .input('MaLop', sql.VarChar(20), testMaLop)
        .query('DELETE FROM dbo.LOP WHERE MaLop = @MaLop');

      // Kiểm tra có log DELETE
      const logDelete = await pool.request()
        .input('MaLop', sql.VarChar(20), testMaLop)
        .query("SELECT TOP 1 * FROM dbo.LOGHOATDONG WHERE TenBang = 'LOP' AND KhoaBanGhi = @MaLop AND HanhDong = 'DELETE' ORDER BY ThoiGian DESC");

      expect(logDelete.recordset.length).toBe(1);
    });
  });

  describe('Vertical Slice 3: Trigger TR_LOP_KiemTraXoa ngăn chặn xóa lớp đang có sinh viên', () => {
    it('Chặn xóa lớp CNTT23_01 và ném mã lỗi 51007', async () => {
      let errorThrown = null;
      try {
        await pool.request()
          .query("DELETE FROM dbo.LOP WHERE MaLop = 'CNTT23_01'");
      } catch (err) {
        errorThrown = err;
      }

      expect(errorThrown).not.toBeNull();
      expect(errorThrown.number).toBe(51007);
      expect(errorThrown.message).toContain('Không thể xóa lớp sinh hoạt đang có sinh viên trực thuộc');
    });
  });

  describe('Vertical Slice 4: Stored Procedure SP_ThongKeHocPhiTheoLop', () => {
    it('Trả về báo cáo tài chính chi tiết theo lớp và học kỳ', async () => {
      const res = await pool.request()
        .input('MaLop', sql.VarChar(20), 'CNTT23_01')
        .input('MaHocKy', sql.Int, 7)
        .execute('dbo.SP_ThongKeHocPhiTheoLop');

      const data = res.recordset[0];
      expect(data).toBeDefined();
      expect(data.MaLop).toBe('CNTT23_01');
      expect(data.TongSoSinhVien).toBe(42);
      expect(data.SoSinhVienCoHocPhi).toBe(42);
      expect(Number(data.TongTienPhaiThu)).toBeGreaterThan(0);
      expect(data.SoSV_DaHoanThanh + data.SoSV_NopMotPhan + data.SoSV_ChuaNop).toBe(42);
    });

    it('Ném lỗi 51008 nếu mã lớp không tồn tại', async () => {
      let errorThrown = null;
      try {
        await pool.request()
          .input('MaLop', sql.VarChar(20), 'LOP_KHONG_TON_TAI')
          .input('MaHocKy', sql.Int, 7)
          .execute('dbo.SP_ThongKeHocPhiTheoLop');
      } catch (err) {
        errorThrown = err;
      }

      expect(errorThrown).not.toBeNull();
      expect(errorThrown.number).toBe(51008);
    });
  });

  describe('Vertical Slice 5: API Endpoint GET /api/classes/:maLop/tuition-report', () => {
    it('DAO_TAO có thể lấy báo cáo học phí của lớp qua API', async () => {
      const res = await requestAs(app, "training", 1)
        .get('/api/classes/CNTT23_01/tuition-report?maHocKy=7')
        .set('Authorization', `Bearer ${tokenDaoTao}`);

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.maLop).toBe('CNTT23_01');
      expect(res.body.data.tongSoSinhVien).toBe(42);
      expect(res.body.data.tongTienPhaiThu).toBeGreaterThan(0);
    });

    it('Trả về 404 nếu mã lớp không tồn tại', async () => {
      const res = await requestAs(app, "training", 1)
        .get('/api/classes/LOP_KHONG_TON_TAI/tuition-report')
        .set('Authorization', `Bearer ${tokenDaoTao}`);

      expect(res.status).toBe(404);
      expect(res.body.isSuccess).toBe(false);
    });
  });
});
