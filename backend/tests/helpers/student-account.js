const crypto = require('crypto');
const { sql } = require('../../src/config/db');
const { registerStudentAccount, removeStudentAccount } = require('./tokens');

const createStudentAccount = async (pool, maSV) => {
  const username = `test_sv_${maSV}_${Date.now()}`.slice(0, 50);
  const passwordHash = crypto.createHash('sha256').update('test-only-password').digest('hex');
  const result = await pool.request()
    .input('Username', sql.VarChar(50), username)
    .input('PasswordHash', sql.VarChar(64), passwordHash)
    .input('MaSV', sql.Int, maSV)
    .query(`
      DECLARE @Created TABLE (MaTaiKhoan INT);
      INSERT INTO dbo.TAIKHOAN (Username, PasswordHash, VaiTro, TrangThai, MaSV)
      OUTPUT INSERTED.MaTaiKhoan INTO @Created
      VALUES (@Username, @PasswordHash, 'SINH_VIEN', 'ACTIVE', @MaSV);
      SELECT MaTaiKhoan FROM @Created;
    `);
  const account = { username, maTaiKhoan: result.recordset[0].MaTaiKhoan };
  registerStudentAccount(maSV, account.maTaiKhoan);
  return account;
};

const cleanupStudentAccount = async (pool, maSV, maTaiKhoan) => {
  await pool.request().input('MaTaiKhoan', sql.Int, maTaiKhoan)
    .query('DELETE FROM dbo.TAIKHOAN WHERE MaTaiKhoan = @MaTaiKhoan');
  await pool.request().input('MaSV', sql.Int, maSV)
    .query('DELETE FROM dbo.SINHVIEN WHERE MaSV = @MaSV');
  removeStudentAccount(maSV);
};

module.exports = { createStudentAccount, cleanupStudentAccount };
