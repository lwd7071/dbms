const { sql } = require('../config/db');

const getFaculties = async (pool, activeOnly) => {
  const result = await pool.request().input('ActiveOnly', sql.Bit, activeOnly).execute('dbo.SP_App_Faculty_List');
  return result.recordset.map(row => ({ maKhoa: row.MaKhoa, tenKhoa: row.TenKhoa, email: row.Email, soDienThoai: row.SoDienThoai, trangThai: row.TrangThai }));
};
const getAllFaculties = pool => getFaculties(pool, true);
const getAllFacultiesForStaff = pool => getFaculties(pool, false);
const getMajorsForStaff = async (pool, { maKhoa } = {}) => {
  const result = await pool.request().input('MaKhoa', sql.VarChar(10), maKhoa || null).execute('dbo.SP_App_Faculty_ListMajors');
  return result.recordset.map(row => ({ maNganh: row.MaNganh, tenNganh: row.TenNganh, maKhoa: row.MaKhoa, tenKhoa: row.TenKhoa, moTa: row.MoTa, trangThai: row.TrangThai }));
};
const createFaculty = async (pool, d) => {
  await pool.request().input('MaKhoa', sql.VarChar(10), d.maKhoa).input('TenKhoa', sql.NVarChar(100), d.tenKhoa)
    .input('Email', sql.VarChar(100), d.email || null).input('SoDienThoai', sql.VarChar(15), d.soDienThoai || null)
    .input('TrangThai', sql.Bit, d.trangThai ?? true).execute('dbo.SP_App_Faculty_Create');
  return { ...d, trangThai: d.trangThai ?? true };
};
const updateFaculty = async (pool, id, d) => {
  const result = await pool.request().input('MaKhoa', sql.VarChar(10), id).input('TenKhoa', sql.NVarChar(100), d.tenKhoa)
    .input('Email', sql.VarChar(100), d.email || null).input('SoDienThoai', sql.VarChar(15), d.soDienThoai || null)
    .input('TrangThai', sql.Bit, d.trangThai ?? true).execute('dbo.SP_App_Faculty_Update');
  if (!result.recordset[0]?.affected) throw Object.assign(new Error('Không tìm thấy khoa.'), { status: 404, field: 'maKhoa' });
  return { maKhoa: id, ...d, trangThai: d.trangThai ?? true };
};
const deleteFaculty = async (pool, id) => {
  const result = await pool.request().input('MaKhoa', sql.VarChar(10), id).execute('dbo.SP_App_Faculty_DeleteFaculty');
  if (!result.recordset[0]?.affected) throw Object.assign(new Error('Không tìm thấy khoa.'), { status: 404, field: 'maKhoa' });
  return { maKhoa: id, deleted: true };
};
const createMajor = async (pool, d) => {
  await pool.request().input('MaNganh', sql.VarChar(10), d.maNganh).input('MaKhoa', sql.VarChar(10), d.maKhoa)
    .input('TenNganh', sql.NVarChar(100), d.tenNganh).input('MoTa', sql.NVarChar(500), d.moTa || null)
    .input('TrangThai', sql.Bit, d.trangThai ?? true).execute('dbo.SP_App_Major_Create');
  return { ...d, trangThai: d.trangThai ?? true };
};
const updateMajor = async (pool, id, d) => {
  const result = await pool.request().input('MaNganh', sql.VarChar(10), id).input('MaKhoa', sql.VarChar(10), d.maKhoa)
    .input('TenNganh', sql.NVarChar(100), d.tenNganh).input('MoTa', sql.NVarChar(500), d.moTa || null)
    .input('TrangThai', sql.Bit, d.trangThai ?? true).execute('dbo.SP_App_Major_Update');
  if (!result.recordset[0]?.affected) throw Object.assign(new Error('Không tìm thấy ngành.'), { status: 404, field: 'maNganh' });
  return { maNganh: id, ...d, trangThai: d.trangThai ?? true };
};
const deleteMajor = async (pool, id) => {
  const result = await pool.request().input('MaNganh', sql.VarChar(10), id).execute('dbo.SP_App_Major_Delete');
  if (!result.recordset[0]?.affected) throw Object.assign(new Error('Không tìm thấy ngành.'), { status: 404, field: 'maNganh' });
  return { maNganh: id, deleted: true };
};
module.exports = { getAllFaculties, getAllFacultiesForStaff, getMajorsForStaff, createFaculty, updateFaculty, deleteFaculty, createMajor, updateMajor, deleteMajor };
