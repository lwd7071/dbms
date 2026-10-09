const courseRepo = require('../repositories/course.repository');

/**
 * Service xử lý nghiệp vụ danh mục lớp học phần
 */
const getAvailableCourses = async (filters) => {
  let { maHocKy, maKhoa, search, type, maSV, page = 1, pageSize = 10 } = filters;

  page = Number(page) || 1;
  pageSize = Number(pageSize) || 10;

  // Nếu không chỉ định học kỳ, lấy học kỳ đang mở mặc định
  if (!maHocKy) {
    maHocKy = await courseRepo.getDefaultOpenSemester();
  } else {
    maHocKy = Number(maHocKy);
  }

  const { items, totalItems } = await courseRepo.findAvailableCourses({
    maHocKy,
    maKhoa,
    search,
    type,
    maSV,
    page,
    pageSize
  });

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages
  };
};

module.exports = {
  getAvailableCourses
};
