const express = require('express');
const router = express.Router();
const classController = require('../controllers/class.controller');
const { verifyToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(verifyToken, authorizeRoles('DAO_TAO', 'QUAN_TRI'));

router.get('/', classController.getAll);
router.get('/:id', classController.getDetail);
router.get('/:id/tuition-report', classController.getTuitionReport);

module.exports = router;
