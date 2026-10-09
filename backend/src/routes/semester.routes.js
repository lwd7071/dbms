const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semester.controller');

// GET /api/semesters/current - Lấy học kỳ hiện tại đang mở
router.get('/current', semesterController.getCurrentSemester);

// GET /api/semesters - Lấy toàn bộ học kỳ
router.get('/', semesterController.getSemesters);

module.exports = router;
