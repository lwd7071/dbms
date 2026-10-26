const { getPool, sql } = require('../config/db');

/**
 * Repository tra cứu danh mục Khoa
 */
const getFaculties = async ({ activeOnly }) => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT MaKhoa, TenKhoa, Email, SoDienThoai, TrangThai
    FROM dbo.KHOA
    ${activeOnly ? 'WHERE TrangThai = 1' : ''}
    ORDER BY TenKhoa ASC
  `);

  return result.recordset.map(row => ({
    maKhoa: row.MaKhoa,
    tenKhoa: row.TenKhoa,
    email: row.Email,
    soDienThoai: row.SoDienThoai,
    trangThai: row.TrangThai
  }));
};

const getAllFaculties = () => getFaculties({ activeOnly: true });
const getAllFacultiesForStaff = () => getFaculties({ activeOnly: false });

const getMajorsForStaff = async ({ maKhoa } = {}) => {
  const pool = await getPool();
  const request = pool.request();
  const facultyFilter = maKhoa ? 'WHERE n.MaKhoa = @MaKhoa' : '';
  if (maKhoa) request.input('MaKhoa', sql.VarChar(10), maKhoa);
  const result = await request.query(`
    SELECT n.MaNganh, n.TenNganh, n.MaKhoa, k.TenKhoa, n.MoTa, n.TrangThai
    FROM dbo.NGANH n
    INNER JOIN dbo.KHOA k ON k.MaKhoa = n.MaKhoa
    ${facultyFilter}
    ORDER BY k.TenKhoa, n.TenNganh;
  `);

  return result.recordset.map(row => ({
    maNganh: row.MaNganh,
    tenNganh: row.TenNganh,
    maKhoa: row.MaKhoa,
    tenKhoa: row.TenKhoa,
    moTa: row.MoTa,
    trangThai: row.TrangThai
  }));
};

const createFaculty = async d => {
  const pool = await getPool();
  await pool.request().input('MaKhoa', sql.VarChar(10), d.maKhoa).input('TenKhoa', sql.NVarChar(100), d.tenKhoa)
    .input('Email', sql.VarChar(100), d.email || null).input('SoDienThoai', sql.VarChar(15), d.soDienThoai || null)
    .input('TrangThai', sql.Bit, d.trangThai ?? true)
    .query('INSERT dbo.KHOA (MaKhoa,TenKhoa,Email,SoDienThoai,TrangThai) VALUES (@MaKhoa,@TenKhoa,@Email,@SoDienThoai,@TrangThai)');
  return { ...d, trangThai: d.trangThai ?? true };
};

const updateFaculty = async (id, d) => {
  const pool = await getPool();
  const result = await pool.request().input('MaKhoa', sql.VarChar(10), id).input('TenKhoa', sql.NVarChar(100), d.tenKhoa)
    .input('Email', sql.VarChar(100), d.email || null).input('SoDienThoai', sql.VarChar(15), d.soDienThoai || null)
    .input('TrangThai', sql.Bit, d.trangThai ?? true)
    .query('UPDATE dbo.KHOA SET TenKhoa=@TenKhoa,Email=@Email,SoDienThoai=@SoDienThoai,TrangThai=@TrangThai WHERE MaKhoa=@MaKhoa; SELECT @@ROWCOUNT AS affected;');
  if (!result.recordset[0].affected) throw Object.assign(new Error('Không tìm thấy khoa.'), { status: 404, field: 'maKhoa' });
  return { maKhoa: id, ...d, trangThai: d.trangThai ?? true };
};

const deleteFaculty = async id => {
  const pool = await getPool();
  const result = await pool.request().input('MaKhoa', sql.VarChar(10), id)
    .query('DELETE dbo.KHOA WHERE MaKhoa=@MaKhoa; SELECT @@ROWCOUNT AS affected;');
  if (!result.recordset[0].affected) throw Object.assign(new Error('Không tìm thấy khoa.'), { status: 404, field: 'maKhoa' });
  return { maKhoa: id, deleted: true };
};

const createMajor = async d => {
  const pool = await getPool();
  await pool.request().input('MaNganh', sql.VarChar(10), d.maNganh).input('MaKhoa', sql.VarChar(10), d.maKhoa)
    .input('TenNganh', sql.NVarChar(100), d.tenNganh).input('MoTa', sql.NVarChar(500), d.moTa || null)
    .input('TrangThai', sql.Bit, d.trangThai ?? true)
    .query('INSERT dbo.NGANH (MaNganh,MaKhoa,TenNganh,MoTa,TrangThai) VALUES (@MaNganh,@MaKhoa,@TenNganh,@MoTa,@TrangThai)');
  return { ...d, trangThai: d.trangThai ?? true };
};

const updateMajor = async (id, d) => {
  const pool = await getPool();
  const result = await pool.request().input('MaNganh', sql.VarChar(10), id).input('MaKhoa', sql.VarChar(10), d.maKhoa)
    .input('TenNganh', sql.NVarChar(100), d.tenNganh).input('MoTa', sql.NVarChar(500), d.moTa || null)
    .input('TrangThai', sql.Bit, d.trangThai ?? true)
    .query('UPDATE dbo.NGANH SET MaKhoa=@MaKhoa,TenNganh=@TenNganh,MoTa=@MoTa,TrangThai=@TrangThai WHERE MaNganh=@MaNganh; SELECT @@ROWCOUNT AS affected;');
  if (!result.recordset[0].affected) throw Object.assign(new Error('Không tìm thấy ngành.'), { status: 404, field: 'maNganh' });
  return { maNganh: id, ...d, trangThai: d.trangThai ?? true };
};

const deleteMajor = async id => {
  const pool = await getPool();
  const result = await pool.request().input('MaNganh', sql.VarChar(10), id)
    .query('DELETE dbo.NGANH WHERE MaNganh=@MaNganh; SELECT @@ROWCOUNT AS affected;');
  if (!result.recordset[0].affected) throw Object.assign(new Error('Không tìm thấy ngành.'), { status: 404, field: 'maNganh' });
  return { maNganh: id, deleted: true };
};

module.exports = {
  getAllFaculties,
  getAllFacultiesForStaff,
  getMajorsForStaff,
  createFaculty, updateFaculty, deleteFaculty,
  createMajor, updateMajor, deleteMajor
};
