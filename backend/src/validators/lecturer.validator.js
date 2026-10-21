const { z } = require('zod');

const gradeItemSchema = z.object({
  maDangKy: z.preprocess(
    value => typeof value === 'string' && value.trim() !== '' ? Number(value) : value,
    z.number().int().positive('Mã đăng ký phải là số nguyên dương.')
  ),
  diemQuaTrinh: z.number().min(0).max(10).nullable().optional(),
  diemGiuaKy: z.number().min(0).max(10).nullable().optional(),
  diemCuoiKy: z.number().min(0).max(10).nullable().optional()
}).refine(data => ['diemQuaTrinh', 'diemGiuaKy', 'diemCuoiKy'].some(key => key in data), {
  message: 'Mỗi dòng phải gửi ít nhất một thành phần điểm.'
});

const updateGradesSchema = z.object({
  grades: z.array(gradeItemSchema).min(1, 'Danh sách điểm không được rỗng')
}).superRefine((data, context) => {
  const seen = new Set();
  data.grades.forEach((grade, index) => {
    if (seen.has(grade.maDangKy)) {
      context.addIssue({
        code: 'custom',
        path: ['grades', index, 'maDangKy'],
        message: 'Mã đăng ký không được lặp lại trong cùng một lần lưu.'
      });
    }
    seen.add(grade.maDangKy);
  });
});

module.exports = {
  updateGradesSchema
};
