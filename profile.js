/* Demo profile storage (LOCAL ONLY – not secure) */
const USER_KEY = 'ecom_user'; // { name, email, avatarDataUrl }
const USER_PASS_KEY = 'ecom_user_password'; // plain text demo only

function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || {}; }
  catch { return {}; }
}
function saveUser(u) {
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}

/* Dom refs */
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const avatarPreview = document.getElementById('avatarPreview');
const avatarInput = document.getElementById('avatarInput');
const btnRemoveAvatar = document.getElementById('btnRemoveAvatar');

const displayName = document.getElementById('displayName');
const displayEmail = document.getElementById('displayEmail');

const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const btnDeleteAccount = document.getElementById('btnDeleteAccount');

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  const u = getUser();
  nameInput.value = u.name || '';
  emailInput.value = u.email || '';
  displayName.textContent = u.name || 'Your Name';
  displayEmail.textContent = u.email || 'you@example.com';
  if (u.avatarDataUrl) avatarPreview.src = u.avatarDataUrl;
});

/* Save profile (name/email) */
profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const u = getUser();
  u.name = nameInput.value.trim();
  u.email = emailInput.value.trim();
  saveUser(u);

  displayName.textContent = u.name || 'Your Name';
  displayEmail.textContent = u.email || 'you@example.com';

  toast('Profile updated');
});

/* Avatar change */
avatarInput?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const u = getUser();
    u.avatarDataUrl = reader.result;
    saveUser(u);
    avatarPreview.src = u.avatarDataUrl;
    toast('Avatar updated');
  };
  reader.readAsDataURL(file);
});

/* Remove avatar */
btnRemoveAvatar?.addEventListener('click', () => {
  const u = getUser();
  delete u.avatarDataUrl;
  saveUser(u);
  avatarPreview.src = 'https://via.placeholder.com/200x200?text=Avatar';
  toast('Avatar removed');
});

/* Change password (demo only) */
passwordForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!newPassword.value) return toast('Enter a new password');
  if (newPassword.value !== confirmPassword.value) return toast('Passwords do not match');

  // Demo store (PLAIN TEXT). Replace with real API later.
  localStorage.setItem(USER_PASS_KEY, newPassword.value);
  newPassword.value = '';
  confirmPassword.value = '';
  toast('Password updated (demo)');
});

/* Delete local account */
btnDeleteAccount.addEventListener('click', () => {
  if (!confirm('This will remove your profile (local only) and keep the page demo working. Continue?')) return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_PASS_KEY);
  // Optionally also clear cart:
  // localStorage.removeItem('ecom_cart');
  toast('Local account removed');
  setTimeout(() => location.href = 'index.html', 800);
});

/* Tiny toast */
function toast(msg) {
  let el = document.getElementById('profile-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'profile-toast';
    el.style.position = 'fixed';
    el.style.bottom = '18px';
    el.style.right = '18px';
    el.style.zIndex = '9999';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '10px';
    el.style.background = 'linear-gradient(135deg, #c1975a, #8c6239)';
    el.style.color = '#fff';
    el.style.boxShadow = '0 10px 24px rgba(0,0,0,.18)';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  el.style.transition = 'opacity .3s';
  setTimeout(() => el.style.opacity = '0', 1400);
}
