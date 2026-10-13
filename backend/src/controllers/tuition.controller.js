const tuitionService = require('../services/tuition.service');
const { successResponse } = require('../utils/apiResponse');

/**
 * Controller xử lý thanh toán, xác nhận và báo cáo học phí
 */

// Sinh viên tạo giao dịch thanh toán
const createPayment = async (req, res, next) => {
  try {
    req.context = 'PAYMENT';
    const { maHocPhi, soTien, phuongThuc } = req.body;

    const result = await tuitionService.processPayment({
      maHocPhi,
      soTien,
      phuongThuc,
      ownerMaSV: req.user.vaiTro === 'SINH_VIEN' ? req.user.maSV : null
    });

    return res.status(201).json(
      successResponse(result)
    );
  } catch (err) {
    next(err);
  }
};

// Xác nhận thanh toán (DAO_TAO hoặc QUAN_TRI)
const confirmPayment = async (req, res, next) => {
  try {
    req.context = 'PAYMENT';
    const { id } = req.params;
    // Lấy mã tài khoản từ token đã được decode bởi middleware
    const maTaiKhoan = req.user ? req.user.maTaiKhoan : (req.body.maTaiKhoanXacNhan || 1);

    const result = await tuitionService.confirmPayment(id, maTaiKhoan);

    return res.status(200).json(
      successResponse(result)
    );
  } catch (err) {
    next(err);
  }
};

// Từ chối thanh toán (DAO_TAO hoặc QUAN_TRI)
const rejectPayment = async (req, res, next) => {
  try {
    req.context = 'PAYMENT';
    const { id } = req.params;
    const maTaiKhoan = req.user ? req.user.maTaiKhoan : (req.body.maTaiKhoanXacNhan || 1);

    const result = await tuitionService.rejectPayment(id, maTaiKhoan);

    return res.status(200).json(
      successResponse(result)
    );
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách giao dịch chờ xác nhận
const getPendingPayments = async (req, res, next) => {
  try {
    const { maLop } = req.query;
    const list = await tuitionService.getPendingPayments({ maLop });
    return res.status(200).json(
      successResponse(list)
    );
  } catch (err) {
    next(err);
  }
};

const getTuitionReport = async (req, res, next) => {
  try {
    const { maHocKy, trangThai } = req.query;
    const result = await tuitionService.getTuitionReport({ maHocKy, trangThai });

    return res.status(200).json(
      successResponse(result)
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPayment,
  confirmPayment,
  rejectPayment,
  getPendingPayments,
  getTuitionReport
};
