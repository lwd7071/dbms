const express = require('express');
const router = express.Router();
const tuitionController = require('../controllers/tuition.controller');
const { validate } = require('../middlewares/validate.middleware');
const { createPaymentSchema } = require('../validators/payment.validator');
const { positiveIdParamsSchema, pendingPaymentsQuerySchema } = require('../validators/common.validator');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

// Sinh viên tạo yêu cầu của mình hoặc cán bộ tạo giao dịch thu tại quầy.
router.post('/', verifyToken, authorizeRoles('SINH_VIEN', 'DAO_TAO', 'QUAN_TRI'), validate(createPaymentSchema, 'body'), tuitionController.createPayment);

// Lấy danh sách giao dịch chờ xác nhận (Dành cho DAO_TAO hoặc QUAN_TRI)
router.get('/pending', verifyToken, authorizeRoles('DAO_TAO', 'QUAN_TRI'), validate(pendingPaymentsQuerySchema, 'query'), tuitionController.getPendingPayments);

// Xác nhận giao dịch thanh toán thành công (Chỉ DAO_TAO hoặc QUAN_TRI)
router.post('/:id/confirm', verifyToken, authorizeRoles('DAO_TAO', 'QUAN_TRI'), validate(positiveIdParamsSchema, 'params'), tuitionController.confirmPayment);

// Từ chối giao dịch thanh toán (Chỉ DAO_TAO hoặc QUAN_TRI)
router.post('/:id/reject', verifyToken, authorizeRoles('DAO_TAO', 'QUAN_TRI'), validate(positiveIdParamsSchema, 'params'), tuitionController.rejectPayment);

module.exports = router;
