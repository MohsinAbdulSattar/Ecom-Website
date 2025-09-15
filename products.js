// Fetch products from backend API
async function fetchProducts() {
  try {
    const res = await fetch("http://localhost:3000/api/products"); // Express API
    const products = await res.json();

    const container = document.getElementById("products-container");
    container.innerHTML = "";

    products.forEach(p => {
      container.innerHTML += `
        <div class="col-md-4 product-item" data-category="${p.category || 'All'}" data-name="${p.name}">
          <div class="card product-card">
            <img src="${p.image_url}" class="card-img-top" alt="${p.name}">
            <div class="card-body text-center">
              <h5 class="card-title">${p.name}</h5>
              <p class="card-text">PKR ${p.price}</p>
              <button class="btn-gradient btn-add-to-cart"
                data-id="sku-${p.id}"
                data-name="${p.name}"
                data-price="${p.price}"
                data-image="${p.image_url}">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    });

    // Reapply filters after loading
    applyFilters();
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

// Run when page loads
document.addEventListener("DOMContentLoaded", fetchProducts);
