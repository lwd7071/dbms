const { authorizeMyStudentId } = require('../src/middlewares/auth.middleware');

describe('authorizeMyStudentId', () => {
  it('allows a student GET request without a request body', () => {
    const req = {
      user: { vaiTro: 'SINH_VIEN', maSV: 42 },
      query: { maSV: '42' }
    };
    const next = jest.fn();

    expect(() => authorizeMyStudentId(req, {}, next)).not.toThrow();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
