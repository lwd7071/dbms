const request = require('supertest');
const app = require('../src/app');
const { requestAs } = require('./helpers/tokens');
const { closePool } = require('../src/config/db');

describe('Admin Management Endpoints (GET & PATCH /api/admin/...)', () => {
  afterAll(async () => {
    await closePool();
  });

  it('chuyển lỗi thiếu trường bắt buộc thành hướng dẫn tiếng Việt dễ hiểu', async () => {
    const res = await requestAs(app, 'admin', 1)
      .post('/api/admin/students')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'maSinhVien', message: 'Mã sinh viên là bắt buộc.' }),
      expect.objectContaining({ field: 'hoTen', message: 'Họ tên là bắt buộc.' })
    ]));
    expect(JSON.stringify(res.body.errors)).not.toMatch(/Invalid input|expected|received/);
  });

  it('không hiển thị mã nội bộ của phương thức thanh toán khi gửi giá trị không hợp lệ', async () => {
    const res = await requestAs(app, 'admin', 1)
      .post('/api/payments')
      .send({ maHocPhi: 1, soTien: 10, phuongThuc: 'UNKNOWN_METHOD' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'phuongThuc', message: 'Phương thức thanh toán không hợp lệ. Vui lòng chọn lại.' })
    ]));
    expect(JSON.stringify(res.body.errors)).not.toMatch(/CHUYEN_KHOAN|TIEN_MAT|UNKNOWN_METHOD|Invalid option/);
  });

  it('giải thích bằng tiếng Việt khi trạng thái tài khoản gửi lên không hợp lệ', async () => {
    const res = await requestAs(app, 'admin', 1)
      .patch('/api/admin/users/no_such_account_for_test/status')
      .send({ trangThai: 'DISABLED' });

    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toMatchObject({
      field: 'trangThai',
      message: 'Trạng thái tài khoản không hợp lệ. Vui lòng chọn lại.'
    });
    expect(res.body.errors[0].message).not.toMatch(/ACTIVE|LOCKED|DISABLED/);
  });

  it('nêu rõ định dạng email không hợp lệ mà không lộ thông báo mặc định của validator', async () => {
    const res = await requestAs(app, 'admin', 1)
      .post('/api/admin/students')
      .send({
        maSinhVien: '20260001', hoTen: 'Sinh viên kiểm tra', email: 'khong-phai-email',
        maKhoa: 'CNTT', maCTDT: 'CTDT_CNTT_CQ'
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'email', message: 'Email không đúng định dạng' })
    ]));
    expect(JSON.stringify(res.body.errors)).not.toMatch(/Invalid|expected|received/);
  });

  it('diễn đạt rõ khi mã hồ sơ không phải số nguyên dương', async () => {
    const res = await requestAs(app, 'admin', 1)
      .put('/api/admin/students/0')
      .send({ hoTen: 'Tên hợp lệ' });

    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toMatchObject({
      field: 'id',
      message: 'Mã hồ sơ phải lớn hơn 0.'
    });
  });

  describe('GET /api/admin/dashboard', () => {
    it('lấy số liệu thống kê tổng quan cho Dashboard', async () => {
      const res = await requestAs(app, "admin", 1).get('/api/admin/dashboard');

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('tongSinhVien');
      expect(res.body.data).toHaveProperty('tongLopHocPhan');
      expect(res.body.data).toHaveProperty('tongLuotDangKy');
      expect(res.body.data).toHaveProperty('tongHocPhiPhaiThu');
      expect(res.body.data).toHaveProperty('tongTienDaThu');
      expect(res.body.data).toHaveProperty('soGiaoDichChoXacNhan');
      expect(res.body.data.tongSinhVien).toBeGreaterThan(0);
    });
  });

  describe('GET /api/admin/students', () => {
    it('lấy danh sách sinh viên có phân trang mặc định và trả về metadata', async () => {
      const res = await requestAs(app, "admin", 1)
        .get('/api/admin/students')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBe(10);
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('pageSize', 10);
      expect(res.body.data).toHaveProperty('totalItems');
      expect(res.body.data.totalItems).toBeGreaterThan(10);
      expect(res.body.data).toHaveProperty('totalPages');
      expect(res.body.data.totalPages).toBe(Math.ceil(res.body.data.totalItems / 10));

      const s = res.body.data.items[0];
      expect(s).toHaveProperty('maSV');
      expect(s).toHaveProperty('maSinhVien');
      expect(s).toHaveProperty('hoTen');
      expect(s).toHaveProperty('tenKhoa');
    });

    it('hỗ trợ chuyển trang page=2 không trùng dữ liệu với page=1', async () => {
      const page1Res = await requestAs(app, "admin", 1).get('/api/admin/students').query({ page: 1, pageSize: 10 });
      const page2Res = await requestAs(app, "admin", 1).get('/api/admin/students').query({ page: 2, pageSize: 10 });

      expect(page2Res.status).toBe(200);
      expect(page2Res.body.data.page).toBe(2);
      expect(page2Res.body.data.items.length).toBe(10);
      
      const page1Ids = page1Res.body.data.items.map(s => s.maSV);
      const page2Ids = page2Res.body.data.items.map(s => s.maSV);
      const intersection = page1Ids.filter(id => page2Ids.includes(id));
      expect(intersection.length).toBe(0);
    });

    it('hỗ trợ tìm kiếm theo từ khóa kết hợp phân trang', async () => {
      const res = await requestAs(app, "admin", 1)
        .get('/api/admin/students')
        .query({ search: '23000001', page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items[0].maSinhVien).toContain('23000001');
    });
  });

  describe('GET /api/admin/classes', () => {
    it('lấy danh sách lớp học phần có phân trang và metadata', async () => {
      const res = await requestAs(app, "admin", 1)
        .get('/api/admin/classes')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBe(10);
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('pageSize', 10);
      expect(res.body.data).toHaveProperty('totalItems');
      expect(res.body.data).toHaveProperty('totalPages');

      const c = res.body.data.items[0];
      expect(c).toHaveProperty('maLHP');
      expect(c).toHaveProperty('tenMonHoc');
      expect(c).toHaveProperty('soTinChi');
      expect(c).toHaveProperty('soLuongToiDa');
      expect(c).toHaveProperty('siSoHienTai');
    });

    it('chuyển trang page=2 không trùng bản ghi với page=1', async () => {
      const p1 = await requestAs(app, "admin", 1).get('/api/admin/classes').query({ page: 1, pageSize: 10 });
      const p2 = await requestAs(app, "admin", 1).get('/api/admin/classes').query({ page: 2, pageSize: 10 });

      expect(p2.status).toBe(200);
      expect(p2.body.data.page).toBe(2);
      expect(p2.body.data.items.length).toBe(10);

      const p1Ids = p1.body.data.items.map(c => c.maLHP);
      const p2Ids = p2.body.data.items.map(c => c.maLHP);
      const overlap = p1Ids.filter(id => p2Ids.includes(id));
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/admin/registrations', () => {
    it('lấy danh sách đăng ký tín chỉ có phân trang và metadata', async () => {
      const res = await requestAs(app, "admin", 1)
        .get('/api/admin/registrations')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBe(10);
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('pageSize', 10);
      expect(res.body.data).toHaveProperty('totalItems');
      expect(res.body.data).toHaveProperty('totalPages');

      const r = res.body.data.items[0];
      expect(r).toHaveProperty('maDangKy');
      expect(r).toHaveProperty('maSV');
      expect(r).toHaveProperty('maLHP');
      expect(r).toHaveProperty('trangThai');
    });

    it('chuyển trang page=2 không trùng bản ghi với page=1', async () => {
      const page1 = await requestAs(app, "admin", 1).get('/api/admin/registrations').query({ page: 1, pageSize: 10 });
      const page2 = await requestAs(app, "admin", 1).get('/api/admin/registrations').query({ page: 2, pageSize: 10 });

      expect(page2.status).toBe(200);
      expect(page2.body.data.page).toBe(2);
      expect(page2.body.data.items.length).toBe(10);

      const p1Ids = page1.body.data.items.map(r => r.maDangKy);
      const p2Ids = page2.body.data.items.map(r => r.maDangKy);
      const common = p1Ids.filter(id => p2Ids.includes(id));
      expect(common.length).toBe(0);
    });
  });

  describe('GET /api/admin/users', () => {
    it.each(['admin', 'training'])('cho phép %s tải danh sách với các bộ lọc mặc định để trống', async role => {
      const res = await requestAs(app, role, 1)
        .get('/api/admin/users')
        .query({ vaiTro: '', trangThai: '', maLop: '', search: '', page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('trả lỗi lọc tài khoản bằng tiếng Việt khi vai trò và trạng thái không hợp lệ', async () => {
      const res = await requestAs(app, 'admin', 1)
        .get('/api/admin/users')
        .query({ vaiTro: 'ROLE_UNKNOWN', trangThai: 'STATUS_UNKNOWN' });

      expect(res.status).toBe(400);
      expect(res.body.isSuccess).toBe(false);
      expect(res.body.data).toBeNull();
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ field: 'vaiTro', message: 'Vai trò tài khoản không hợp lệ. Vui lòng chọn một giá trị trong danh sách.' }),
        expect.objectContaining({ field: 'trangThai', message: 'Trạng thái không hợp lệ. Vui lòng chọn một giá trị trong danh sách.' })
      ]));
      expect(JSON.stringify(res.body.errors)).not.toMatch(/Invalid option|expected|SINH_VIEN|ACTIVE/);
    });

    it('trả thông báo tiếng Việt khi kích thước trang không phải số', async () => {
      const res = await requestAs(app, 'admin', 1)
        .get('/api/admin/users')
        .query({ pageSize: 'nhiều' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ field: 'pageSize', message: 'Số lượng mỗi trang phải là số hợp lệ.' })
      ]));
      expect(JSON.stringify(res.body.errors)).not.toMatch(/Invalid input|expected|received/);
    });

    it('nêu giới hạn hợp lệ khi kích thước trang vượt mức cho phép', async () => {
      const res = await requestAs(app, 'admin', 1)
        .get('/api/admin/users')
        .query({ pageSize: 101 });

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ field: 'pageSize', message: 'Số lượng mỗi trang không được lớn hơn 100.' })
      ]));
      expect(JSON.stringify(res.body.errors)).not.toMatch(/Too big|expected|maximum/);
    });

    it('lấy danh sách tài khoản có phân trang và metadata', async () => {
      const res = await requestAs(app, "admin", 1)
        .get('/api/admin/users')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBe(10);
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('pageSize', 10);
      expect(res.body.data).toHaveProperty('totalItems');
      expect(res.body.data).toHaveProperty('totalPages');

      const u = res.body.data.items[0];
      expect(u).toHaveProperty('username');
      expect(u).toHaveProperty('vaiTro');
      expect(u).toHaveProperty('trangThai');
    });

    it('chuyển trang page=2 không trùng username với page=1', async () => {
      const p1 = await requestAs(app, "admin", 1).get('/api/admin/users').query({ page: 1, pageSize: 10 });
      const p2 = await requestAs(app, "admin", 1).get('/api/admin/users').query({ page: 2, pageSize: 10 });

      expect(p2.status).toBe(200);
      expect(p2.body.data.page).toBe(2);
      expect(p2.body.data.items.length).toBe(10);

      const p1Users = p1.body.data.items.map(u => u.username);
      const p2Users = p2.body.data.items.map(u => u.username);
      const common = p1Users.filter(u => p2Users.includes(u));
      expect(common.length).toBe(0);
    });
  });

  describe('GET /api/admin/audit-logs', () => {
    it('từ chối cán bộ đào tạo khi gọi trực tiếp API nhật ký quản trị', async () => {
      const response = await requestAs(app, 'training').get('/api/admin/audit-logs');

      expect(response.status).toBe(403);
      expect(response.body.isSuccess).toBe(false);
      expect(response.body.errors[0].field).toBe('permission');
      expect(response.body.errors[0].message).toMatch(/quyền|phép/i);
    });

    it('lấy nhật ký hoạt động có phân trang và metadata', async () => {
      const res = await requestAs(app, "admin", 1)
        .get('/api/admin/audit-logs')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.isSuccess).toBe(true);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBe(10);
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('pageSize', 10);
      expect(res.body.data).toHaveProperty('totalItems');
      expect(res.body.data).toHaveProperty('totalPages');

      const log = res.body.data.items[0];
      expect(log).toHaveProperty('maLog');
      expect(log).toHaveProperty('hanhDong');
      expect(log).toHaveProperty('tenBang');
    });

    it('chuyển trang page=2 không trùng maLog với page=1', async () => {
      const p1 = await requestAs(app, "admin", 1).get('/api/admin/audit-logs').query({ page: 1, pageSize: 10 });
      const p2 = await requestAs(app, "admin", 1).get('/api/admin/audit-logs').query({ page: 2, pageSize: 10 });

      expect(p2.status).toBe(200);
      expect(p2.body.data.page).toBe(2);
      expect(p2.body.data.items.length).toBe(10);

      const p1Logs = p1.body.data.items.map(l => Number(l.maLog));
      const p2Logs = p2.body.data.items.map(l => Number(l.maLog));
      expect(p2Logs[0]).toBeLessThan(p1Logs[0]);
      expect(Math.min(...p2Logs)).toBeLessThan(Math.min(...p1Logs));
    });
  });
});
