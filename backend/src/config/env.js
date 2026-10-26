const requiredVariables = [
  'DB_USER', 'DB_PASSWORD',
  'DB_STUDENT_USER', 'DB_STUDENT_PASSWORD',
  'DB_LECTURER_USER', 'DB_LECTURER_PASSWORD',
  'DB_TRAINING_USER', 'DB_TRAINING_PASSWORD',
  'DB_ADMIN_USER', 'DB_ADMIN_PASSWORD',
  'JWT_SECRET'
];

const assertRequiredEnvironment = (env = process.env) => {
  const missing = requiredVariables.filter(name => !env[name] || !env[name].trim());
  if (missing.length) {
    throw new Error(`Thiếu cấu hình bắt buộc: ${missing.join(', ')}. Hãy khai báo các biến này trong backend/.env.`);
  }
};

module.exports = { assertRequiredEnvironment };
