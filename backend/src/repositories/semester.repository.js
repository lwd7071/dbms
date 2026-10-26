const { getPool } = require('../config/db');
const mapSemester = row => ({ maHocKy: row.MaHocKy, tenHocKy: row.TenHocKy, namHoc: row.NamHoc, trangThai: row.TrangThai });

const getAllSemesters = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('dbo.SP_App_Semester_List');
  return result.recordset.map(mapSemester);
};
const getCurrentSemester = async () => {
  const pool = await getPool();
  const result = await pool.request().execute('dbo.SP_App_Semester_Current');
  return result.recordset[0] ? mapSemester(result.recordset[0]) : null;
};
module.exports = { getAllSemesters, getCurrentSemester };
