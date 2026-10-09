const regService = require('../services/registration.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Controller xử lý các request giao dịch đăng ký tín chỉ
 */
const createRegistration = async (req, res, next) => {
  try {
    const maSV = req.body.maSV || (req.user && req.user.maSV);
    const { maLHP, tinChiToiDa } = req.body;

    const result = await regService.registerCourse({
      maSV,
      maLHP,
      tinChiToiDa
    });

    return res.status(201).json(
      successResponse(result)
    );
  } catch (err) {
    next(err);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await regService.cancelRegistration(id, req.body);

    return res.status(200).json(
      successResponse(result)
    );
  } catch (err) {
    next(err);
  }
};

const getMyRegistrations = async (req, res, next) => {
  try {
    const maSV = req.query.maSV || (req.user && req.user.maSV);
    if (!maSV) {
      return res.status(400).json(
        errorResponse({
          field: 'maSV',
          message: 'Mã sinh viên là bắt buộc.'
        })
      );
    }

    const result = await regService.getStudentRegistrations(maSV, req.query.maHocKy);

    return res.status(200).json(
      successResponse(result)
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRegistration,
  cancelRegistration,
  getMyRegistrations
};
