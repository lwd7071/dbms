/**
 * Quản lý xác thực, Quick Login Demo và kiểm tra quyền
 */

// Hàm xử lý đăng nhập thông thường
async function handleLogin(username, password) {
  try {
    const data = await api.post('/auth/login', { username, password });
    api.setSession(data.token, data.user);

    showToast(`Đăng nhập thành công! Xin chào ${data.user.hoTen}`, 'success');

    // Điều hướng theo Role
    setTimeout(() => {
      if (data.user.vaiTro === 'SINH_VIEN') {
        window.location.href = 'portal-student.html';
      } else if (data.user.vaiTro === 'GIANG_VIEN') {
        window.location.href = 'portal-lecturer.html';
      } else {
        window.location.href = 'portal-admin.html';
      }
    }, 600);
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

// Hàm điền nhanh thông tin tài khoản demo vào form
function fillQuickLogin(username, password) {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  if (usernameInput && passwordInput) {
    usernameInput.value = username;
    passwordInput.value = password;
    showToast(`Đã chọn tài khoản demo: ${username}`, 'info');
  }
}

// Hàm đăng xuất
function logout() {
  api.clearSession();
  window.location.href = 'index.html';
}

// Kiểm tra quyền truy cập ở các trang portal
function requireAuth(allowedRoles = []) {
  const user = api.getCurrentUser();
  const token = api.getToken();

  if (!token || !user) {
    api.clearSession();
    window.location.href = 'index.html';
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.vaiTro)) {
    alert('Bạn không có quyền truy cập vào cổng thông tin này.');
    if (user.vaiTro === 'SINH_VIEN') {
      window.location.href = 'portal-student.html';
    } else if (user.vaiTro === 'GIANG_VIEN') {
      window.location.href = 'portal-lecturer.html';
    } else {
      window.location.href = 'portal-admin.html';
    }
    return null;
  }

  // Cập nhật thông tin Header
  const userNameElem = document.getElementById('header-user-name');
  const userRoleElem = document.getElementById('header-user-role');
  if (userNameElem) userNameElem.textContent = user.hoTen;
  if (userRoleElem) {
    userRoleElem.textContent = user.vaiTro === 'SINH_VIEN'
      ? `MSSV: ${user.maSinhVien || user.username}`
      : `Vai trò: ${user.vaiTro} (${user.username})`;
  }

  return user;
}

// Global Auth Object
const auth = {
  login: handleLogin,
  logout: logout,
  getUser: () => api.getCurrentUser(),
  guard: (role) => {
    const roles = Array.isArray(role) ? role : (role ? [role === 'STUDENT' ? 'SINH_VIEN' : (role === 'ADMIN' ? 'QUAN_TRI' : role)] : []);
    return requireAuth(roles);
  }
};

window.auth = auth;
window.handleLogin = handleLogin;
window.fillQuickLogin = fillQuickLogin;
window.logout = logout;
window.requireAuth = requireAuth;
