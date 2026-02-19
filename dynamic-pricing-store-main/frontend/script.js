/// ===== VARIABLES =====
let products = [];
let cart = [];

const productsDiv = document.getElementById("products");
const cartDiv = document.getElementById("cart-items");
const totalSpan = document.getElementById("total");

// ===== ADD STYLE (Badge + Animation + Toast) =====
const style = document.createElement("style");
style.innerHTML = `
.product {
  position: relative;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 10px;
  transition: 0.3s;
}

.product:hover {
  transform: scale(1.03);
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: red;
  color: white;
  padding: 3px 8px;
  font-size: 12px;
  border-radius: 5px;
}

.price {
  font-weight: bold;
  transition: 0.3s;
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #333;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  z-index: 999;
  animation: fadeInOut 2s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(20px); }
}
`;
document.head.appendChild(style);

// ===== FETCH PRODUCTS =====
async function fetchProducts() {
  const res = await fetch("http://localhost:3000/products");
  products = await res.json();

  products.forEach(p => {
    p.image = `images/p${p.id}.jpg`;
  });

  renderProducts();
}

// ===== ULTRA SMOOTH DYNAMIC PRICE =====
function getDynamicPrice(product) {

  // 0.05% increase per demand
  let increase = product.basePrice * 0.0005 * product.demand;

  // max 10% cap
  let maxIncrease = product.basePrice * 0.10;

  if (increase > maxIncrease) increase = maxIncrease;

  return Math.round((product.basePrice + increase) * 100) / 100;
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  productsDiv.innerHTML = "";

  products.forEach(p => {
    const price = getDynamicPrice(p);

    productsDiv.innerHTML += `
      <div class="product">
        ${p.demand >= 20 ? '<span class="badge">🔥 High Demand</span>' : ''}
        <img src="${p.image}" style="width:150px;height:150px;object-fit:cover;">
        <h4>${p.name}</h4>
        <p class="price">Price: ₹${price}</p>
        <p>Demand: ${p.demand}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    `;
  });
}

// ===== ADD TO CART =====
function addToCart(id) {
  const product = products.find(p => p.id === id);
  product.demand++;

  const price = getDynamicPrice(product);

  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty++;
    item.price = price;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: price,
      qty: 1
    });
  }

  renderProducts();
  renderCart();
  showToast("Added to Cart ✅");
}

// ===== RENDER CART =====
function renderCart() {
  cartDiv.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    cartDiv.innerHTML += `
      <div class="cart-item">
        <span>${item.name} (₹${item.price} × ${item.qty})</span>
        <div>
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <button onclick="changeQty(${item.id}, 1)">+</button>
          <button onclick="removeItem(${item.id})">❌</button>
        </div>
      </div>
    `;
  });

  totalSpan.innerText = total.toFixed(2);
}

// ===== CHANGE QUANTITY =====
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeItem(id);
  }

  renderCart();
}

// ===== REMOVE ITEM =====
function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

// ===== TOAST FUNCTION =====
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// ===== INITIAL LOAD =====
fetchProducts();