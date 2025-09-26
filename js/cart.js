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
        cart.push({ ...item, qty: 1, maxQty: item.maxQty || item.quantity || 0 });
    }

    saveCart(cart);
    inform(`Added: ${item.name}`);
    // showToast(`✅ Added: ${item.name}`, "success");
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
// Update qty (by id)
function setQty(id, qty) {
    const cart = getCart();
    const idx = cart.findIndex(p => p.id === id);

    if (idx > -1) {
        const item = cart[idx];
        const maxQty = parseInt(item.maxQty || item.quantity || 0, 10);

        // 🔍 DEBUG: see what's going on
        console.log('[setQty] id=', id, 'requested=', qty, 'current=', item.qty, 'maxQty=', maxQty, 'item=', item);

        if (qty < 1) {
            qty = 1; // never negative or zero
        }
        if (maxQty > 0 && qty > maxQty) {
            alert("⚠️ Stock limit reached!");
            qty = maxQty;
        }

        cart[idx].qty = qty;
        saveCart(cart);
        renderCartTable();
        updateCartBadge();
    } else {
        console.warn('[setQty] Item not found in cart for id:', id, getCart());
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
// Hook "Add to Cart" buttons (on products page) with stock check
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add-to-cart');
    if (!btn) return;

    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price, 10) || 0;
    const image = btn.dataset.image || '';
    const maxQty = parseInt(btn.dataset.qty, 10) || 0; // <-- from products.html

    let cart = getCart();
    let item = cart.find(p => p.id === id);

    if (item) {
        if (item.qty >= item.maxQty) {   // use item.maxQty
            alert("⚠️ Not enough stock available!");
            return;
        }
        item.qty++;
    } else {
        if (maxQty <= 0) {
            alert("⚠️ Item is out of stock!");
            return;
        }
        cart.push({ id, name, price, image, qty: 1, maxQty });
    }

    saveCart(cart);
    inform(`Added: ${name}`);
    // showToast(`✅ Added: ${name}`, "success");
    updateCartBadge();
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

        if (it) {
            const maxQty = parseInt(it.maxQty || it.quantity || 0, 10);
            console.log('[inc-click]', { id, currentQty: it.qty, maxQty, item: it }); // 🔍
            if (maxQty && (it.qty + 1) > maxQty) {
                alert(`⚠️ Only ${maxQty} in stock!`);
                // showToast({ title: 'Stock limit', message: 'Not enough stock available', variant: 'warn' });
                return;
            }
            setQty(id, it.qty + 1);
        }
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
// Handle manual qty input in cart
document.addEventListener('input', (e) => {
    if (e.target.matches('.qty-input')) {
        const id = e.target.dataset.id;
        const raw = parseInt(e.target.value, 10);
        const cart = getCart();
        const it = cart.find(p => p.id === id);
        if (!it) return;

        const maxQty = parseInt(it.maxQty || it.quantity || 0, 10);
        let qty = isNaN(raw) ? 1 : raw;
        if (qty < 1) qty = 1;
        if (maxQty > 0 && qty > maxQty) qty = maxQty;

        // Update field immediately for UX
        e.target.value = qty;

        // Update cart
        setQty(id, qty);
    }
});

document.addEventListener('change', (e) => {
    if (e.target.matches('.qty-input')) {
        const id = e.target.dataset.id;
        const raw = parseInt(e.target.value, 10);
        const cart = getCart();
        const it = cart.find(p => p.id === id);
        if (!it) return;

        const maxQty = parseInt(it.maxQty || it.quantity || 0, 10);
        let qty = isNaN(raw) ? 1 : raw;
        if (qty < 1) qty = 1;
        if (maxQty > 0 && qty > maxQty) qty = maxQty;

        e.target.value = qty;
        setQty(id, qty);
    }
});

// Render cart if we're on cart.html
document.addEventListener('DOMContentLoaded', () => {
    renderCartTable();
    updateCartBadge();
});
