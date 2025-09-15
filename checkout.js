// checkout.js

(function () {
    if (typeof getCart !== 'function') {
        console.warn('cart.js not loaded before checkout.js');
        return;
    }

    const itemsWrap = document.getElementById('checkout-items');
    const elSubtotal = document.getElementById('co-subtotal');
    const elShipping = document.getElementById('co-shipping');
    const elDiscount = document.getElementById('co-discount');
    const elTotal = document.getElementById('co-total');

    const promoInput = document.getElementById('promoInput');
    const promoBtn = document.getElementById('btn-apply-promo');
    const placeBtn = document.getElementById('btn-place-order');
    const form = document.getElementById('checkout-form');

    let promoValue = 0; // PKR amount discount
    const SHIPPING_FLAT = 0; // set to e.g. 299 if you want

    function renderSummary() {
        const cart = getCart();
        updateCartBadge();

        // Items list
        if (itemsWrap) {
            if (!cart.length) {
                itemsWrap.innerHTML = `<div class="text-muted">Your cart is empty.</div>`;
            } else {
                itemsWrap.innerHTML = cart.map(it => `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center gap-2">
              <img src="${it.image}" alt="${it.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #e6d4b6">
              <div>
                <div class="fw-semibold">${it.name}</div>
                <div class="text-muted">x${it.qty}</div>
              </div>
            </div>
            <div>${currencyPKR(it.price * it.qty)}</div>
          </div>
        `).join('');
            }
        }

        // Totals
        const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
        const shipping = cart.length ? SHIPPING_FLAT : 0;
        const discount = Math.min(promoValue, subtotal); // cap
        const total = Math.max(0, subtotal + shipping - discount);

        if (elSubtotal) elSubtotal.textContent = currencyPKR(subtotal);
        if (elShipping) elShipping.textContent = currencyPKR(shipping);
        if (elDiscount) elDiscount.textContent = '-' + currencyPKR(discount).replace('PKR', 'PKR ');
        if (elTotal) elTotal.textContent = currencyPKR(total);
    }

    // Promo: demo codes
    //  LUXE10  -> flat PKR 1000 off
    //  LUXE20  -> flat PKR 2000 off
    function applyPromo(code) {
        const c = (code || '').trim().toUpperCase();
        if (c === 'LUXE10') { promoValue = 1000; return { ok: true, msg: 'PKR 1,000 discount applied' }; }
        if (c === 'LUXE20') { promoValue = 2000; return { ok: true, msg: 'PKR 2,000 discount applied' }; }
        promoValue = 0;
        return { ok: false, msg: 'Invalid promo code' };
    }

    if (promoBtn) {
        promoBtn.addEventListener('click', () => {
            const { ok, msg } = applyPromo(promoInput.value);
            alert(msg);
            renderSummary();
        });
    }

    // Place order (mock)
    if (placeBtn) {
        placeBtn.addEventListener('click', () => {
            const cart = getCart();
            if (!cart.length) {
                alert('Your cart is empty.');
                return;
            }
            // Basic shipping validation
            if (!form) return;
            const data = new FormData(form);
            const required = ['fullName', 'phone', 'address', 'city', 'postal'];
            for (const k of required) {
                if (!String(data.get(k) || '').trim()) {
                    alert('Please fill all shipping fields.');
                    return;
                }
            }

            // Fake order id
            const orderId = 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase();

            // Persist a tiny receipt (optional)
            const receipt = {
                id: orderId,
                items: cart,
                promo: promoValue,
                ts: Date.now()
            };
            localStorage.setItem('last_order_receipt', JSON.stringify(receipt));

            // Clear cart
            localStorage.removeItem('ecom_cart');

            // Go to success page
            window.location.href = 'order-success.html?id=' + encodeURIComponent(orderId);
        });
    }

    document.addEventListener('DOMContentLoaded', renderSummary);
    renderSummary();
})();
