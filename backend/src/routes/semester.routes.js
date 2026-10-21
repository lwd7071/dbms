const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semester.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken, authorizeRoles('SINH_VIEN', 'GIANG_VIEN', 'DAO_TAO', 'QUAN_TRI'));

// GET /api/semesters/current - Lấy học kỳ hiện tại đang mở
router.get('/current', semesterController.getCurrentSemester);

// GET /api/semesters - Lấy toàn bộ học kỳ
router.get('/', semesterController.getSemesters);

module.exports = router;
