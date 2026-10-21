const courseService = require('../services/course.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Controller xử lý các request liên quan đến môn học và lớp học phần
 */
const getAvailableCourses = async (req, res, next) => {
  try {
    const filters = { ...(req.validated?.query || req.query) };
    if (req.courseMaSV) filters.maSV = req.courseMaSV;
    const result = await courseService.getAvailableCourses(filters);

    return res.status(200).json(
      successResponse(result.items, {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages
      })
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailableCourses
};
