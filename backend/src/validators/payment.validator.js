const { z } = require('zod');

// Schema validate thanh toán học phí
const createPaymentSchema = z.object({
  maHocPhi: z
    .number({ required_error: 'Mã học phí là bắt buộc.' })
    .int('Mã học phí phải là số nguyên.')
    .positive('Mã học phí không hợp lệ.'),
  soTien: z
    .number({ required_error: 'Số tiền thanh toán là bắt buộc.' })
    .positive('Số tiền thanh toán phải lớn hơn 0.'),
  phuongThuc: z
    .enum(['CHUYEN_KHOAN', 'TIEN_MAT', 'THE_NGAN_HANG', 'VI_DIEN_TU'], {
      errorMap: () => ({ message: 'Phương thức thanh toán phải là CHUYEN_KHOAN, TIEN_MAT, THE_NGAN_HANG hoặc VI_DIEN_TU.' })
    })
    .default('CHUYEN_KHOAN')
});

// Schema validate tra cứu báo cáo học phí của phòng Đào tạo
const tuitionReportQuerySchema = z.object({
  maHocKy: z
    .preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().int().positive().optional()),
  trangThai: z
    .enum(['UNPAID', 'PARTIAL', 'PAID'], {
      errorMap: () => ({ message: 'Trạng thái học phí phải là UNPAID, PARTIAL hoặc PAID.' })
    })
    .optional()
});

module.exports = {
  createPaymentSchema,
  tuitionReportQuerySchema
};
