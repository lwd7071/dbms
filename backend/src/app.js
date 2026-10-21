const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const { errorResponse } = require('./utils/apiResponse');

const app = express();

// Middleware cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ frontend tĩnh
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend')));

// Định tuyến API chính
app.use('/api', apiRoutes);

// Bắt route không tồn tại (404)
app.use((req, res) => {
  res.status(404).json(errorResponse({
    field: 'route',
    message: 'Chức năng bạn yêu cầu không tồn tại.'
  }));
});

// Middleware xử lý lỗi tập trung
app.use(errorHandler);

module.exports = app;
