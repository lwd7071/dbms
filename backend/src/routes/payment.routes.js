const express = require('express');
const router = express.Router();
const tuitionController = require('../controllers/tuition.controller');
const { validate } = require('../middlewares/validate.middleware');
const { createPaymentSchema } = require('../validators/payment.validator');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

// Sinh viên hoặc người dùng tạo giao dịch thanh toán (trạng thái ban đầu: CHO_XAC_NHAN)
router.post('/', validate(createPaymentSchema, 'body'), tuitionController.createPayment);

// Lấy danh sách giao dịch chờ xác nhận (Dành cho DAO_TAO hoặc QUAN_TRI)
router.get('/pending', verifyToken, authorizeRoles('DAO_TAO', 'QUAN_TRI'), tuitionController.getPendingPayments);

// Xác nhận giao dịch thanh toán thành công (Chỉ DAO_TAO hoặc QUAN_TRI)
router.post('/:id/confirm', verifyToken, authorizeRoles('DAO_TAO', 'QUAN_TRI'), tuitionController.confirmPayment);

// Từ chối giao dịch thanh toán (Chỉ DAO_TAO hoặc QUAN_TRI)
router.post('/:id/reject', verifyToken, authorizeRoles('DAO_TAO', 'QUAN_TRI'), tuitionController.rejectPayment);

module.exports = router;
