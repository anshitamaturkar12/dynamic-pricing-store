let products = [
  { id:1, name:"Mouse", basePrice:900, demand:1 },
  { id:2, name:"Keyboard", basePrice:1500, demand:1 },
  { id:3, name:"Monitor", basePrice:12000, demand:1 },
  { id:4, name:"Printer", basePrice:9000, demand:1 },
  { id:5, name:"Headphones", basePrice:3000, demand:1 },
  { id:6, name:"Speaker", basePrice:4500, demand:1 },
  { id:7, name:"Webcam", basePrice:2500, demand:1 },
  { id:8, name:"Power Bank", basePrice:2000, demand:1 },
  { id:9, name:"Tablet", basePrice:18000, demand:1 },
  { id:10, name:"Router", basePrice:3500, demand:1 },
  { id:11, name:"Hard Disk", basePrice:6000, demand:1 },
  { id:12, name:"Pen Drive", basePrice:700, demand:1 },
  { id:13, name:"SSD", basePrice:5000, demand:1 },
  { id:14, name:"Camera", basePrice:30000, demand:1 },
  { id:15, name:"Charger", basePrice:1200, demand:1 },
  { id:16, name:"Tripod", basePrice:1800, demand:1 },
  { id:17, name:"Smart Watch", basePrice:8000, demand:1 },
  { id:18, name:"Earbuds", basePrice:4000, demand:1 },
  { id:19, name:"Microphone", basePrice:2500, demand:1 },
  { id:20, name:"Laptop Stand", basePrice:2000, demand:1 }
];

let cart = [];

const productsDiv = document.getElementById("products");
const cartDiv = document.getElementById("cart-items");
const totalSpan = document.getElementById("total");
const adminPanel = document.getElementById("admin-panel");
const adminTable = document.getElementById("admin-table");
const adminBtn = document.getElementById("admin-login-btn");
const closeAdmin = document.getElementById("close-admin");

function getDynamicPrice(product){
  return product.basePrice + product.demand * 10;
}

function renderProducts(){
  productsDiv.innerHTML = "";
  products.forEach(p => {
    const price = getDynamicPrice(p);
    productsDiv.innerHTML += `
      <div class="product">
        ${p.demand>=20?'<span class="badge">🔥 High Demand</span>':''}
        <img src="/static/images/p${p.id}.jpg" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>Price: ₹${price}</p>
        <p>Demand: ${p.demand}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
      </div>`;
  });
}

function addToCart(id){
  const p = products.find(pr=>pr.id===id);
  p.demand++;
  const price = getDynamicPrice(p);
  const item = cart.find(i=>i.id===id);
  if(item){ item.qty++; item.price = price; }
  else cart.push({id:p.id,name:p.name,price:price,qty:1});
  renderProducts();
  renderCart();
  showToast(`${p.name} added! ✅`);
}

function renderCart(){
  cartDiv.innerHTML="";
  let total=0;
  cart.forEach(i=>{
    total+=i.price*i.qty;
    cartDiv.innerHTML+=`
      <div class="cart-item">
        ${i.name} (₹${i.price} × ${i.qty})
        <button onclick="changeQty(${i.id},-1)">−</button>
        <button onclick="changeQty(${i.id},1)">+</button>
        <button onclick="removeItem(${i.id})">❌</button>
      </div>`;
  });
  totalSpan.innerText = total;
}

function changeQty(id,delta){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) removeItem(id);
  renderCart();
}

function removeItem(id){
  cart = cart.filter(i=>i.id!==id);
  renderCart();
}

function showToast(msg){
  const t = document.createElement("div");
  t.className="toast";
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

/* ================== ADMIN ================== */
adminBtn.addEventListener("click", ()=>{
  const pw = prompt("Enter Admin Password:");
  if(pw==="Admin123"){ adminPanel.style.display="block"; generateAdminTable(); }
  else alert("Wrong Password!");
});
closeAdmin.addEventListener("click", ()=>{ adminPanel.style.display="none"; });

function generateAdminTable(){
  adminTable.querySelectorAll("tr:not(:first-child)").forEach(r=>r.remove());
  products.forEach(p=>{
    const tr = document.createElement("tr");
    tr.innerHTML=`<td>${p.name}</td>
      <td><input type="number" id="price-${p.id}" value="${p.basePrice}"></td>
      <td><input type="number" id="demand-${p.id}" value="${p.demand}"></td>
      <td><button onclick="updateProduct(${p.id})">Update</button></td>`;
    adminTable.appendChild(tr);
  });
}

window.updateProduct = function(id){
  const price = Number(document.getElementById(`price-${id}`).value);
  const demand = Number(document.getElementById(`demand-${id}`).value);
  const p = products.find(x=>x.id===id);
  p.basePrice = price;
  p.demand = demand;
  alert(`${p.name} updated!`);
  renderProducts();
}

/* INITIAL RENDER */
renderProducts();
renderCart();