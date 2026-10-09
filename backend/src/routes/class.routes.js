const express = require('express');
const router = express.Router();
const classController = require('../controllers/class.controller');

router.get('/', classController.getAll);
router.get('/:id', classController.getDetail);
router.get('/:id/tuition-report', classController.getTuitionReport);

module.exports = router;
