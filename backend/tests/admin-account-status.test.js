const app = require('../src/app');
const { closePool, getPool } = require('../src/config/db');
const { requestAs } = require('./helpers/tokens');
const { createStudentAccount, cleanupStudentAccount } = require('./helpers/student-account');

describe('Admin account status API', () => {
  let pool;
  let student;
  let testAccount;

  beforeAll(async () => {
    pool = await getPool();
    student = await requestAs(app, 'admin').post('/api/admin/students').send({
      maSinhVien: `STA${Date.now()}`,
      hoTen: 'Sinh viên kiểm thử trạng thái',
      maKhoa: 'CNTT',
      maCTDT: 'CTDT_CNTT_CQ'
    });
    expect(student.status).toBe(201);
    testAccount = await createStudentAccount(pool, student.body.data.maSV);
  });

  afterAll(async () => {
    try {
      if (testAccount) await cleanupStudentAccount(pool, student.body.data.maSV, testAccount.maTaiKhoan);
    } finally {
      await closePool();
    }
  });

  it('rejects status values outside ACTIVE and LOCKED as input errors', async () => {
    const response = await requestAs(app, 'admin')
      .patch('/api/admin/users/no_such_account_for_test/status')
      .send({ trangThai: 'DISABLED' });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].field).toBe('trangThai');
    expect(response.body.errors[0].message).toBe('Trạng thái tài khoản không hợp lệ. Vui lòng chọn lại.');
    expect(response.body.errors[0].message).not.toMatch(/ACTIVE|LOCKED|DISABLED/);
  });

  it('returns not found when the target username does not exist', async () => {
    const response = await requestAs(app, 'admin')
      .patch('/api/admin/users/no_such_account_for_test/status')
      .send({ trangThai: 'LOCKED' });

    expect(response.status).toBe(404);
  });

  it('rejects invalid pagination and write ids before reaching a repository', async () => {
    const query = await requestAs(app, 'admin').get('/api/admin/users').query({ page: '0' });
    expect(query.status).toBe(400);
    expect(query.body.errors[0].field).toBe('page');

    const id = await requestAs(app, 'admin').delete('/api/admin/students/not-a-number');
    expect(id.status).toBe(400);
    expect(id.body.errors[0].field).toBe('id');
  });

  it('locks an account, immediately revokes its session, and permits staff to unlock it', async () => {
    const before = await requestAs(app, 'student', student.body.data.maSV).get('/api/auth/me');
    expect(before.status).toBe(200);

    const locked = await requestAs(app, 'admin')
      .patch(`/api/admin/users/${testAccount.username}/status`)
      .send({ trangThai: 'LOCKED' });
    expect(locked.status).toBe(200);
    expect(locked.body.data.trangThai).toBe('LOCKED');

    const revoked = await requestAs(app, 'student', student.body.data.maSV).get('/api/auth/me');
    expect(revoked.status).toBe(401);

    const unlocked = await requestAs(app, 'admin')
      .patch(`/api/admin/users/${testAccount.username}/status`)
      .send({ trangThai: 'ACTIVE' });
    expect(unlocked.status).toBe(200);
    expect(unlocked.body.data.trangThai).toBe('ACTIVE');
    expect((await requestAs(app, 'student', student.body.data.maSV).get('/api/auth/me')).status).toBe(200);
  });

  it('prevents training staff from locking a privileged account', async () => {
    const response = await requestAs(app, 'training')
      .patch('/api/admin/users/admin/status')
      .send({ trangThai: 'LOCKED' });

    expect(response.status).toBe(403);
    expect(response.body.errors[0].field).toBe('permission');
  });
});
