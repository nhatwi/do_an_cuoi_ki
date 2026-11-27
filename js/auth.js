// Hàm hiển thị thông báo Bootstrap Alert gọn gàng
function showAlert(elementId, message, type = "danger") {
  const alertEl = document.getElementById(elementId);
  if (!alertEl) return;
  alertEl.className = `alert alert-${type}`;
  alertEl.textContent = message;
  alertEl.classList.remove("d-none");
}

// 1. XỬ LÝ ĐĂNG KÝ TÀI KHOẢN
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const fullname = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    if (password !== confirmPassword) {
      return showAlert("authAlert", "Mật khẩu nhập lại không khớp!", "danger");
    }

    const users = JSON.parse(localStorage.getItem("techstore_users")) || [];
    if (users.some(u => u.email === email)) {
      return showAlert("authAlert", "Email này đã được đăng ký trước đó!", "warning");
    }

    users.push({ fullname, email, password });
    localStorage.setItem("techstore_users", JSON.stringify(users));

    registerForm.reset();
    showAlert("authAlert", "Đăng ký thành công! Mời bạn chuyển sang tab Đăng nhập.", "success");
    // Tự động chuyển sang tab Đăng nhập
    bootstrap.Tab.getOrCreateInstance(document.getElementById("login-tab")).show();
  });
}

// 2. XỬ LÝ ĐĂNG NHẬP
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const users = JSON.parse(localStorage.getItem("techstore_users")) || [];
    const matchedUser = users.find(u => u.email === email && u.password === password);

    if (!matchedUser) {
      return showAlert("authAlert", "Sai email hoặc mật khẩu! Vui lòng kiểm tra lại.", "danger");
    }

    localStorage.setItem("techstore_currentUser", JSON.stringify(matchedUser));
    showAlert("authAlert", `Chào mừng ${matchedUser.fullname}! Đang chuyển hướng...`, "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  });
}

// 3. XỬ LÝ TRANG ACCOUNT & ĐỔI MẬT KHẨU
function initAccountPage() {
  const notLoggedInBox = document.getElementById("notLoggedInBox");
  const accountContentBox = document.getElementById("accountContentBox");
  if (!notLoggedInBox || !accountContentBox) return;

  const currentUser = JSON.parse(localStorage.getItem("techstore_currentUser"));
  if (!currentUser) {
    notLoggedInBox.classList.remove("d-none");
    return;
  }

  accountContentBox.classList.remove("d-none");
  document.getElementById("accFullName").textContent = currentUser.fullname;
  document.getElementById("accEmail").textContent = currentUser.email;

  // Nút Đăng xuất
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("techstore_currentUser");
    alert("Đã đăng xuất!");
    window.location.href = "auth.html";
  });

  // Form Đổi mật khẩu
  const changePassForm = document.getElementById("changePasswordForm");
  changePassForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    const oldPass = document.getElementById("oldPassword").value;
    const newPass = document.getElementById("newPassword").value;
    const confirmNewPass = document.getElementById("confirmNewPassword").value;

    if (oldPass !== currentUser.password) {
      return showAlert("changePassAlert", "Mật khẩu hiện tại không chính xác!", "danger");
    }
    if (newPass !== confirmNewPass) {
      return showAlert("changePassAlert", "Mật khẩu mới xác nhận không trùng khớp!", "danger");
    }

    // Cập nhật mật khẩu trong cả danh sách users lẫn currentUser
    const users = JSON.parse(localStorage.getItem("techstore_users")) || [];
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) {
      users[idx].password = newPass;
      localStorage.setItem("techstore_users", JSON.stringify(users));
    }
    currentUser.password = newPass;
    localStorage.setItem("techstore_currentUser", JSON.stringify(currentUser));

    changePassForm.reset();
    showAlert("changePassAlert", "Đổi mật khẩu thành công!", "success");
  });
}

// 4. ĐỒNG BỘ TÊN NGƯỜI DÙNG LÊN THANH MENU Ở MỌI TRANG
function updateAuthNavbar() {
  const navBtn = document.getElementById("navAuthBtn");
  const currentUser = JSON.parse(localStorage.getItem("techstore_currentUser"));
  if (navBtn && currentUser) {
    navBtn.innerHTML = `<i class="bi bi-person-check-fill"></i> Xin chào, ${currentUser.fullname}`;
    navBtn.href = "account.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateAuthNavbar();
  initAccountPage();
});