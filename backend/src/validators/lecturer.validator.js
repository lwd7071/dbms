const { z } = require('zod');

const gradeItemSchema = z.object({
  maDangKy: z.union([z.number(), z.string()]).transform(val => Number(val)),
  diemQuaTrinh: z.union([z.number(), z.null()]).optional(),
  diemGiuaKy: z.union([z.number(), z.null()]).optional(),
  diemCuoiKy: z.union([z.number(), z.null()]).optional()
}).refine(data => {
  const check = (val) => val === null || val === undefined || (val >= 0 && val <= 10);
  return check(data.diemQuaTrinh) && check(data.diemGiuaKy) && check(data.diemCuoiKy);
}, { message: 'Điểm số phải nằm trong khoảng từ 0.0 đến 10.0' });

const updateGradesSchema = z.object({
  grades: z.array(gradeItemSchema).min(1, 'Danh sách điểm không được rỗng')
});

module.exports = {
  updateGradesSchema
};
