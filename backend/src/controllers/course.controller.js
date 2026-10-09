const courseService = require('../services/course.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Controller xử lý các request liên quan đến môn học và lớp học phần
 */
const getAvailableCourses = async (req, res, next) => {
  try {
    const result = await courseService.getAvailableCourses(req.query);

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
