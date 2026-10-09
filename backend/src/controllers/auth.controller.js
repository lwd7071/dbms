const authService = require('../services/auth.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Controller xử lý các yêu cầu liên quan đến xác thực người dùng
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    return res.status(200).json(
      successResponse(result)
    );
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  // Trả về thông tin user đã giải mã từ middleware verifyToken
  return res.status(200).json(
    successResponse({
      user: req.user
    })
  );
};

module.exports = {
  login,
  getMe
};
