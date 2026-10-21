const { errorResponse } = require('../utils/apiResponse');
const { validationMessage } = require('../utils/validationMessage');

/**
 * Middleware validate request payload qua Zod schema
 * @param {import('zod').ZodSchema} schema - Schema định nghĩa cấu trúc dữ liệu
 * @param {'body' | 'query' | 'params'} source - Vị trí dữ liệu cần kiểm tra
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req.validated = { ...req.validated, [source]: parsed };
      if (source === 'query') return next();
      if (source === 'params') {
        req.params = parsed;
        return next();
      }
      if (req[source] && typeof req[source] === 'object') {
        for (const key of Object.keys(req[source])) {
          delete req[source][key];
        }
        Object.assign(req[source], parsed);
      } else {
        req[source] = parsed;
      }
      next();
    } catch (err) {
      const issues = err.issues || err.errors;
      if (issues && Array.isArray(issues)) {
        // Format danh sách lỗi từ Zod
        const errors = issues.map(e => ({
          field: e.path.join('.') || source,
          message: validationMessage(e, source)
        }));
        return res.status(400).json(errorResponse(errors));
      }
      return res.status(400).json(errorResponse({
        field: source,
        message: 'Dữ liệu đầu vào không hợp lệ.'
      }));
    }
  };
};

module.exports = {
  validate
};
