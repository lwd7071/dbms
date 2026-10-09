/**
 * Chuẩn hóa cấu trúc JSON response theo spec.md
 */

// Response thành công
const successResponse = (data = null, meta = null) => {
  const response = {
    isSuccess: true,
    data,
    errors: []
  };

  // Nếu có phân trang
  if (meta) {
    response.data = {
      items: data,
      page: meta.page,
      pageSize: meta.pageSize,
      totalItems: meta.totalItems,
      totalPages: meta.totalPages
    };
  }

  return response;
};

// Response thất bại
const errorResponse = (errors = []) => {
  return {
    isSuccess: false,
    data: null,
    errors: Array.isArray(errors) ? errors : [errors]
  };
};

module.exports = {
  successResponse,
  errorResponse
};
