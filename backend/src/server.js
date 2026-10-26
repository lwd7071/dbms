require('dotenv').config();
const app = require('./app');
const { getAuthPool, getRolePool, closeAllPools } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Kiểm tra kết nối CSDL trước khi mở port
    await getAuthPool();
    await Promise.all(['SINH_VIEN', 'GIANG_VIEN', 'DAO_TAO', 'QUAN_TRI'].map(getRolePool));

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📡 Healthcheck API: http://localhost:${PORT}/api/health`);
      console.log(`💾 DB Healthcheck:  http://localhost:${PORT}/api/health/db`);
    });
  } catch (err) {
    console.error('❌ Không thể khởi động server (kiểm tra cấu hình bắt buộc và kết nối SQL Server):', err.message);
    await closeAllPools();
    process.exit(1);
  }
};

const shutdown = async () => { await closeAllPools(); process.exit(0); };
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
startServer();
