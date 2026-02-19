// ===== VARIABLES =====
let products = [];
let cart = [];

const productsDiv = document.getElementById("products");
const cartDiv = document.getElementById("cart-items");
const totalSpan = document.getElementById("total");

// ===== FETCH PRODUCTS FROM BACKEND =====
async function fetchProducts() {
  const res = await fetch("http://localhost:3000/products");
  products = await res.json();

  // Images manually add kar rahe (kyunki backend me image field nahi hai)
  products.forEach(p => {
    p.image = `images/p${p.id}.jpg`;
  });

  renderProducts();
}

// ===== DYNAMIC PRICE FUNCTION =====
function getDynamicPrice(product) {
  return product.basePrice + (product.demand * 10);
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  productsDiv.innerHTML = "";
  products.forEach(p => {
    const price = getDynamicPrice(p);
    productsDiv.innerHTML += `
      <div class="product">
        <img src="${p.image}" style="width:150px;height:150px;object-fit:cover;">
        <h4>${p.name}</h4>
        <p>Price: ₹${price}</p>
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

  totalSpan.innerText = total;
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

// ===== ADMIN PANEL =====
document.addEventListener("DOMContentLoaded", function() {

  const adminBtn = document.createElement("button");
  adminBtn.innerText = "Admin Login";
  adminBtn.style.position = "absolute";
  adminBtn.style.top = "20px";
  adminBtn.style.right = "20px";
  document.body.appendChild(adminBtn);

  const adminPanel = document.createElement("div");
  adminPanel.style.display = "none";
  adminPanel.style.position = "fixed";
  adminPanel.style.top = "5%";
  adminPanel.style.left = "5%";
  adminPanel.style.width = "90%";
  adminPanel.style.height = "90%";
  adminPanel.style.background = "#f5f5f5";
  adminPanel.style.border = "2px solid #333";
  adminPanel.style.padding = "20px";
  adminPanel.style.overflowY = "auto";
  adminPanel.style.zIndex = 100;

  adminPanel.innerHTML = `
    <button id="close-admin" style="float:right;background:red;color:white;">Close</button>
    <h2>Admin Panel</h2>
    <table id="admin-table" border="1" width="100%">
      <tr>
        <th>Name</th>
        <th>Base Price</th>
        <th>Demand</th>
        <th>Action</th>
      </tr>
    </table>
  `;

  document.body.appendChild(adminPanel);

  adminBtn.addEventListener("click", () => {
    const password = prompt("Enter Admin Password:");
    if (password === "Admin123") {
      adminPanel.style.display = "block";
      generateAdminTable();
    } else {
      alert("Wrong Password");
    }
  });

  document.getElementById("close-admin").addEventListener("click", () => {
    adminPanel.style.display = "none";
  });

  function generateAdminTable() {
    const table = document.getElementById("admin-table");
    table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());

    products.forEach(p => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.name}</td>
        <td><input type="number" id="price-${p.id}" value="${p.basePrice}"></td>
        <td><input type="number" id="demand-${p.id}" value="${p.demand}"></td>
        <td><button onclick="updateProduct(${p.id})">Update</button></td>
      `;
      table.appendChild(row);
    });
  }

  window.updateProduct = async function(id) {

    const price = Number(document.getElementById(`price-${id}`).value);
    const demand = Number(document.getElementById(`demand-${id}`).value);

    await fetch("http://localhost:3000/update-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, basePrice: price, demand })
    });

    alert("Updated Successfully");

    await fetchProducts(); // refresh from backend
  }

});

// ===== INITIAL LOAD =====
fetchProducts();