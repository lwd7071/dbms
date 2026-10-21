const requiredVariables = ['DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

const assertRequiredEnvironment = (env = process.env) => {
  const missing = requiredVariables.filter(name => !env[name] || !env[name].trim());
  if (missing.length) {
    throw new Error(`Thiếu cấu hình bắt buộc: ${missing.join(', ')}. Hãy khai báo các biến này trong backend/.env.`);
  }
};

module.exports = { assertRequiredEnvironment };
