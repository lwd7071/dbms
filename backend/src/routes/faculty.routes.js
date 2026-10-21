const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken, authorizeRoles('SINH_VIEN', 'GIANG_VIEN', 'DAO_TAO', 'QUAN_TRI'));

// GET /api/faculties - Lấy danh sách toàn bộ khoa
router.get('/', facultyController.getFaculties);

module.exports = router;
