const { z } = require('zod');

const accountStatusSchema = z.object({
  trangThai: z.enum(['ACTIVE', 'LOCKED'], {
    error: 'Trạng thái tài khoản không hợp lệ. Vui lòng chọn lại.'
  })
});

const usernameParamsSchema = z.object({
  username: z.string().trim().min(1).max(50).regex(/^[\w.-]+$/)
});

module.exports = { accountStatusSchema, usernameParamsSchema };
