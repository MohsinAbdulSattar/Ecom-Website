/* =========================
   Simple Cart (localStorage)
   Key: 'ecom_cart'
========================= */

// Helpers
const CART_KEY = 'ecom_cart';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function currencyPKR(n) {
    // Format like PKR 5,499
    try {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n);
    } catch {
        // Fallback
        return `PKR ${Number(n).toLocaleString()}`;
    }
}

// Add item
function addToCart(item) {
    const cart = getCart();
    const idx = cart.findIndex(p => p.id === item.id);
    if (idx > -1) {
        cart[idx].qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    saveCart(cart);
    inform(`Added: ${item.name}`);
    updateCartBadge();
}

// Remove single item (by id)
function removeFromCart(id) {
    const cart = getCart().filter(p => p.id !== id);
    saveCart(cart);
    renderCartTable();
    updateCartBadge();
}

// Update qty (by id)
function setQty(id, qty) {
    const cart = getCart();
    const idx = cart.findIndex(p => p.id === id);
    if (idx > -1) {
        cart[idx].qty = Math.max(1, qty);
        saveCart(cart);
        renderCartTable();
        updateCartBadge();
    }
}

// Clear cart
function clearCart() {
    localStorage.removeItem(CART_KEY);
    renderCartTable();
    updateCartBadge();
}

// UI helpers
function inform(msg) {
    // lightweight feedback: small bubble top-right
    let el = document.getElementById('cart-info-bubble');
    if (!el) {
        el = document.createElement('div');
        el.id = 'cart-info-bubble';
        el.style.position = 'fixed';
        el.style.top = '16px';
        el.style.right = '16px';
        el.style.zIndex = '9999';
        el.style.padding = '10px 14px';
        el.style.borderRadius = '8px';
        el.style.background = 'linear-gradient(135deg, #c1975a, #8c6239)';
        el.style.color = '#fff';
        el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(() => (el.style.opacity = '0'), 1200);
}

function updateCartBadge() {
    const badge = document.querySelector('[data-cart-count]');
    if (!badge) return;
    const cart = getCart();
    const count = cart.reduce((sum, p) => sum + p.qty, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

// Hook "Add to Cart" buttons (on products page)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add-to-cart');
    if (!btn) return;

    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price, 10) || 0;
    const image = btn.dataset.image || '';

    addToCart({ id, name, price, image });
});

// ===== Cart page rendering (cart.html) =====
function renderCartTable() {
    const tableBody = document.getElementById('cart-tbody');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (!tableBody || !subtotalEl || !totalEl) return; // not on cart page

    const cart = getCart();
    tableBody.innerHTML = '';

    if (cart.length === 0) {
        tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">Your cart is empty.</td>
      </tr>
    `;
        subtotalEl.textContent = currencyPKR(0);
        totalEl.textContent = currencyPKR(0);
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const line = item.price * item.qty;
        subtotal += line;

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${item.image}" alt="${item.name}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;">
          <div>
            <div class="fw-semibold">${item.name}</div>
            <small class="text-muted">${item.id}</small>
          </div>
        </div>
      </td>
      <td>${currencyPKR(item.price)}</td>
      <td>
        <div class="d-inline-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary btn-qty-dec" data-id="${item.id}">–</button>
          <input type="number" class="form-control form-control-sm qty-input" data-id="${item.id}" value="${item.qty}" min="1" style="width:72px;">
          <button class="btn btn-sm btn-outline-secondary btn-qty-inc" data-id="${item.id}">+</button>
        </div>
      </td>
      <td>${currencyPKR(line)}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger btn-remove" data-id="${item.id}">Remove</button>
      </td>
    `;
        tableBody.appendChild(tr);
    });

    const shipping = 0; // tweak later if needed
    const total = subtotal + shipping;

    subtotalEl.textContent = currencyPKR(subtotal);
    totalEl.textContent = currencyPKR(total);
}

// Cart table events (qty + remove + clear)
document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-qty-inc')) {
        const id = e.target.dataset.id;
        const cart = getCart();
        const it = cart.find(p => p.id === id);
        if (it) setQty(id, it.qty + 1);
    }

    if (e.target.matches('.btn-qty-dec')) {
        const id = e.target.dataset.id;
        const cart = getCart();
        const it = cart.find(p => p.id === id);
        if (it) setQty(id, Math.max(1, it.qty - 1));
    }

    if (e.target.matches('.btn-remove')) {
        const id = e.target.dataset.id;
        removeFromCart(id);
    }

    if (e.target.matches('#btn-clear-cart')) {
        clearCart();
    }
});

// Render cart if we're on cart.html
document.addEventListener('DOMContentLoaded', () => {
    renderCartTable();
    updateCartBadge();
});
