require('dotenv').config();
const app = require('./app');
const { getPool } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Kiểm tra kết nối CSDL trước khi mở port
    await getPool();

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📡 Healthcheck API: http://localhost:${PORT}/api/health`);
      console.log(`💾 DB Healthcheck:  http://localhost:${PORT}/api/health/db`);
    });
  } catch (err) {
    console.error('❌ Không thể khởi động server (kiểm tra cấu hình bắt buộc và kết nối SQL Server):', err.message);
    process.exit(1);
  }
};

startServer();
