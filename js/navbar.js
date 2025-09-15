// navbar.js
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user')); // from login
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    const userNameSpan = document.getElementById('userName');

    if (!userMenu) return; // Safety check: if navbar not present, skip

    if (user && user.name) {
        // ✅ Logged in
        if (userNameSpan) {
            userNameSpan.textContent = user.name;
        }

        if (document.getElementById('logoutBtn')) {
            document.getElementById('logoutBtn').addEventListener('click', () => {
                localStorage.removeItem('user');
                alert('👋 Logged out successfully');
                window.location.href = 'login.html';
            });
        }

    } else {
        // ❌ Not logged in → Replace with Login/Register
        userMenu.innerHTML = `
      <a class="nav-link" href="login.html">Login</a> |
      <a class="nav-link" href="register.html">Register</a>
    `;
    }
});
