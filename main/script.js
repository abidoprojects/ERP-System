/**
 * Script SQL Stored Procedure Sales System - Core Logic v2.5
 * Refined & Functional Procedures: LG01, FG01, CR01 integrated.
 */

const AUTH_KEY = "135790";
const COMPANY_ACCOUNT_CODE = "455678";

const WHOLESALE_FACTOR = 0.70

const TAX_CONFIG = {
    'Vehicle': {
        
        tiers: [
            { limit: 500000,  rate: 45 },  
            { limit: 1000000, rate: 80 },  // between 40k - 1M %80
            { limit: Infinity, rate: 220 } // 1M or more %220
        ],
        kdv: 20,
        description: "Vehicles"
    },
    'Electronics': { 
        otv: 25, 
        kdv: 20, 
        description: "Electronics" 
    },
    'Accessories': { otv: 0, kdv: 20, description: "Accessories" },
    'Others':      { otv: 0, kdv: 10, description: "Others" }
};

let users = JSON.parse(localStorage.getItem('users')) || [
  { id: 1, name: "Ali", username: "ali", password: "1234", businessAcc: "BA1001" }
];

let currentUser = null;

// Application Boot
window.onload = () => {
  setupInitialData();
  startLiveClock();
};

function setupInitialData() {
 
 const masterData = [
    // --- VEHICLES (SCT/ÖTV Test Grupları) ---
    { id: 'P001', type: 'Vehicle', name: 'Mercedes-Benz S-Class', price: 1500000 }, // %220 Dilimi
    { id: 'P002', type: 'Vehicle', name: 'Tesla Model S Plaid', price: 950000 },    // %80 Dilimi
    { id: 'P004', type: 'Vehicle', name: 'Fiat Egea Cross', price: 420000 },       // %45 Dilimi
    { id: 'P011', type: 'Vehicle', name: 'Porsche 911 Turbo S', price: 2800000 },  // Ultra Lüks %220
    { id: 'P012', type: 'Vehicle', name: 'Yamaha YZF-R1', price: 250000 },         // Motosiklet Segmenti
    { id: 'P013', type: 'Vehicle', name: 'Volkswagen Golf R', price: 750000 },     // %80 Dilimi

    // --- ELECTRONICS (%25 SCT/ÖTV Sabit) ---
    { id: 'P003', type: 'Electronics', name: 'iPhone 15 Pro Max', price: 1800 },
    { id: 'P007', type: 'Electronics', name: 'Nvidia RTX 5090 Ti', price: 2500 },
    { id: 'P014', type: 'Electronics', name: 'MacBook Pro M3 Max', price: 3500 },
    { id: 'P015', type: 'Electronics', name: 'Sony PlayStation 5 Pro', price: 800 },
    { id: 'P016', type: 'Electronics', name: 'Samsung Odyssey Neo G9', price: 1200 },
    { id: 'P017', type: 'Electronics', name: 'Dyson V15 Detect', price: 700 },

    // --- ACCESSORIES (%0 SCT/ÖTV) ---
    { id: 'P009', type: 'Accessories', name: 'Rolex Submariner', price: 12000 },
    { id: 'P018', type: 'Accessories', name: 'Ray-Ban Wayfarer', price: 250 },
    { id: 'P019', type: 'Accessories', name: 'Apple Watch Ultra 2', price: 900 },
    { id: 'P020', type: 'Accessories', name: 'Gucci Leather Belt', price: 450 },

    // --- OTHERS (%0 SCT/ÖTV - %10 VAT/KDV) ---
    { id: 'P010', type: 'Others', name: 'Starlink Kit V2', price: 500 },
    { id: 'P021', type: 'Others', name: 'Solar Panel Array (1kW)', price: 1500 },
    { id: 'P022', type: 'Others', name: 'Office Membership (Annual)', price: 3000 },
    { id: 'P023', type: 'Others', name: 'Premium Cloud Storage (Lifetime)', price: 200 }
];

  if(!localStorage.getItem('productMaster')) {
      localStorage.setItem('productMaster', JSON.stringify(masterData));
  }

  if(!localStorage.getItem('companyAccount')) {
      localStorage.setItem('companyAccount', JSON.stringify({ balance: 2000000 }));
  }
  
  if(!localStorage.getItem('trades')) {
      localStorage.setItem('trades', JSON.stringify([]));
  }
  
  
  if(!localStorage.getItem('inventoryItems')) {
      localStorage.setItem('inventoryItems', JSON.stringify([]));
  }
    
}

function startLiveClock() {
  const clockEl = document.getElementById('liveClock');
  setInterval(() => {
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString('en-US', { hour12: false });
  }, 1000);
}

// --- AUTHENTICATION ---
function loginFlow() {
  const user = prompt("Username:");
  const pass = prompt("Password:");
  const found = users.find(u => u.username === user && u.password === pass);

  if(found) {
    currentUser = found;
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('sidebar').style.display = 'flex';
    document.getElementById('mainWrapper').style.display = 'flex';
    document.getElementById('welcomeUser').innerText = `Welcome, ${found.name}`;
    updateDashboardStats();
  } else {
    alert("Authentication Failed!");
  }
}

function registerFlow() {

  const fullName = prompt("Enter Full Name:");
  if (!fullName) return;

  let username = prompt("Choose Username:").trim().toLowerCase();
  if (users.find(u => u.username === username)) { 
    alert("User already exists in sys.users table."); 
    return; 
  }

  const password = prompt("Set Password:");

  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "In which city were you born?",
    "What is the name of your first school?",
    "What was your first car's model?"
  ];

  const questionMenu = securityQuestions.map((q, i) => `${i + 1}- ${q}`).join("\n");
  const choice = prompt(`Security Question:\n\n${questionMenu}`);

  const questionIdx = parseInt(choice) - 1;

  if (isNaN(questionIdx) || !securityQuestions[questionIdx]) {
    alert("Invalid selection. Procedure aborted.");
    return;
  }

  const secretQuestion = securityQuestions[questionIdx];
  const secretAnswer = prompt(`Secret Answer:\n"${secretQuestion}"`).trim().toLowerCase();

  if (!secretAnswer) {
    alert("Secret answer is required for account recovery.");
    return;
  }
  const nextId = users.length + 1;
  users.push({ 
    id: nextId, 
    name: fullName, 
    username, 
    password, 
    businessAcc: 'BA'+(1000+nextId), 
    secretQuestion, 
    secretAnswer 
  });

  localStorage.setItem('users', JSON.stringify(users));
  alert("SUCCESS: Account provisioned with recovery challenge.");
}

function forgotFlow() {
  let username = prompt("Username for reset:").trim().toLowerCase();
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) { alert("User not found."); return; }
  const answer = prompt(`Security Answer: ${users[idx].secretQuestion}`);
  if (answer && answer.trim().toLowerCase() === users[idx].secretAnswer) {
    const newPass = prompt("Enter New Password:");
    users[idx].password = newPass;
    localStorage.setItem('users', JSON.stringify(users));
    alert("Success: Password updated.");
  } else { alert("Access Denied."); }
}

function logout() { location.reload(); }

// --- DASHBOARD ---
function updateDashboardStats() {
  const acc = JSON.parse(localStorage.getItem('companyAccount')) || { balance: 2000000 };
  const trades = JSON.parse(localStorage.getItem('trades')) || [];
  const inv = JSON.parse(localStorage.getItem('inventoryItems')) || [];

  // AC01
  document.getElementById('dash-balance').innerText = `$${acc.balance.toLocaleString()}`;

  const pendingCount = trades.filter(t => t.status === 'Ordered' || t.status === 'Shipped').length;
  document.getElementById('dash-orders').innerText = pendingCount;

  const totalStock = inv.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('dash-inventory').innerText = totalStock;
}

// --- PROCEDURE ENGINE ---
function runCode() {
  const code = document.getElementById('activityInput').value.toUpperCase();
  handleActivityCode(code);
}

function handleActivityCode(code) {
  const display = document.getElementById('dynamicContent');
  display.innerHTML = `<p style="color:var(--text-dim)"><i class="fas fa-spinner fa-spin"></i> Executing: ${code}...</p>`;

  setTimeout(() => {
    switch(code) {
      case 'MM03': showInventory(display); break;
      case 'MN23': showProductCatalog(display); break;
      case 'CR01': createOrderSP(display); break;
      case 'UP01': manageOrders(display); break;
      case 'AC01': showCompanyAccount(display); break;
      case 'LG01': renderLogisticsMap(display); break;
      case 'FG01': renderFinancialAnalysis(display); break;
      case 'SL01': postSaleSP(display); break; 

      default:
        display.innerHTML = `<p style="color:var(--danger)"><i class="fas fa-exclamation-triangle"></i> Procedure '${code}' not found.</p>`;
    }
  }, 400);
}

// MM03: Inventory
function showInventory(container) {
  const inv = JSON.parse(localStorage.getItem('inventoryItems')) || [];
  
  let html = `<h3><i class="fas fa-warehouse"></i> Inventory Report (TR-Tax Mode)</h3>
    <table class="inventory-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Product</th>
          <th>Stock</th>
          <th>TaxBase</th>
          <th>Sale Price (SCT+VAT Included)</th>
        </tr>
      </thead>
      <tbody>`;

  inv.forEach(i => {
   
    const taxInfo = calculateTurkishTax(i.salePrice, i.type);
    
    html += `
      <tr>
        <td><span class="badge">${i.type}</span></td>
        <td><b>${i.name}</b></td>
        <td>${i.quantity} Adet</td>
        <td>$${i.salePrice.toLocaleString()}</td>
        <td style="color:var(--primary); font-weight:700;">$${taxInfo.finalPrice.toLocaleString()}</td>
      </tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// MN23: Orders
function showOrders(container) {
  const trades = JSON.parse(localStorage.getItem('trades')) || [];
  if(!trades.length) return container.innerHTML = "<h3>No Records Found.</h3>";
  let html = `<h3>Transaction Logs</h3><table><thead><tr><th>Order ID</th><th>Product</th><th>Status</th></tr></thead><tbody>`;
  trades.forEach(t => { html += `<tr><td>${t.orderId}</td><td>${t.type}</td><td><span style="color:var(--primary)">${t.status}</span></td></tr>`; });
  container.innerHTML = html + `</tbody></table>`;
}

// MN23: Product Catalog with Direct Action
function showProductCatalog(container, filterType = null) {
  const products = JSON.parse(localStorage.getItem('productMaster'));
  
  if (products.length === 0) {
      container.innerHTML = "<h3>Error: Product Master not initialized. Please reload.</h3>";
      return;
  }
  
  if (!filterType) {
    
    const categories = [
        { id: 'Vehicle', icon: 'fa-car' },
        { id: 'Electronics', icon: 'fa-microchip' },
        { id: 'Accessories', icon: 'fa-headphones' },
        { id: 'Others', icon: 'fa-tags' }
    ];

    container.innerHTML = `
        <h3><i class="fas fa-book"></i> Master Catalog (MN23)</h3>
        <div class="category-grid">
            ${categories.map(cat => `
                <div class="category-card" onclick="showProductCatalog(document.getElementById('dynamicContent'), '${cat.id}')">
                    <i class="fas ${cat.icon}"></i>
                    <span>${cat.id.toUpperCase()}</span>
                </div>
            `).join('')}
        </div>
    `;
    return;
  }

  const filteredProducts = products.filter(p => p.type === filterType);

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3><i class="fas fa-folder-open"></i> ${filterType} List</h3>
        <button class="execute-btn" onclick="showProductCatalog(document.getElementById('dynamicContent'))">BACK</button>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            ${filteredProducts.map(p => `
                <tr>
                    <td style="font-family:monospace; color:var(--primary)">${p.id}</td>
                    <td><b>${p.name}</b></td>
                    <td>$${p.price.toLocaleString()}</td>
                    <td>
                        <button class="execute-btn" style="padding:4px 10px; font-size:0.7rem;" 
                                onclick="createOrderSP(document.getElementById('dynamicContent'), 'quantity', '${p.id}')">
                            QUICK ORDER
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
  `;
}

// CR01: In-Page Order Creation Flow 
function createOrderSP(container, step = 'category', selectedProduct = null) {
  const products = JSON.parse(localStorage.getItem('productMaster'));

  
  if (step === 'category') {
    const categories = ['Vehicle', 'Electronics', 'Accessories', 'Others'];
    container.innerHTML = `
        <h3><i class="fas fa-cart-plus"></i> Create Order (CR01)</h3>
        <p style="color:var(--text-dim); margin-bottom:20px;">Step 1: Select Business Category</p>
        <div class="category-grid">
            ${categories.map(cat => `
                <div class="category-card" onclick="createOrderSP(document.getElementById('dynamicContent'), 'product', '${cat}')">
                    <span>${cat.toUpperCase()}</span>
                </div>
            `).join('')}
        </div>
    `;
    return;
  }


  if (step === 'product') {
    const filtered = products.filter(p => p.type === selectedProduct);
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3><i class="fas fa-list"></i> Select Product from ${selectedProduct}</h3>
            <button class="execute-btn" onclick="createOrderSP(document.getElementById('dynamicContent'), 'category')">BACK</button>
        </div>
        <div class="category-grid" style="grid-template-columns: 1fr 1fr;">
            ${filtered.map(p => `
                <div class="category-card" style="padding:15px;" onclick="createOrderSP(document.getElementById('dynamicContent'), 'quantity', '${p.id}')">
                    <span style="font-size:0.8rem;">${p.name}</span>
                    <small style="color:var(--primary)">$${p.price.toLocaleString()}</small>
                </div>
            `).join('')}
        </div>
    `;
    return;
  }


  if (step === 'quantity') {
    const product = products.find(p => p.id === selectedProduct);
    container.innerHTML = `
        <h3><i class="fas fa-check-double"></i> Finalize Order</h3>
        <div class="order-form">
            <div style="text-align:center; margin-bottom:10px;">
                <h4 style="color:var(--primary)">${product.name}</h4>
                <p style="font-size:0.8rem;">Unit Price: $${product.price.toLocaleString()}</p>
            </div>
            
            <label class="order-label">Quantity (Whole Numbers)</label>
            <input type="number" id="orderQty" class="order-input" placeholder="0" min="1" step="1">
            
            <button class="execute-btn" style="width:100%; padding:12px;" onclick="finalizeOrderProcess('${product.id}')">
                Confirm Order
            </button>
            <button class="secondary" style="width:100%; border:none; background:none; color:var(--text-dim);" onclick="createOrderSP(document.getElementById('dynamicContent'), 'category')">CANCEL</button>
        </div>
    `;
  }
}
function getOtvRate(category, basePrice) {
    const config = TAX_CONFIG[category];

    if (!config) {
        return 0; 
    }
    
    
    if (config.tiers) {
        const tier = config.tiers.find(t => basePrice <= t.limit);
        return tier ? tier.rate : 220; 
    }
    
    return config.otv || 0;
}

function calculateTurkishTax(basePrice, category) {
    const config = TAX_CONFIG[category] || TAX_CONFIG['Others'];
    
    const currentOtvRate = getOtvRate(category, basePrice);

    const otvAmount = basePrice * (currentOtvRate / 100);
    const priceWithOTV = basePrice + otvAmount;

    const kdvAmount = priceWithOTV * (config.kdv / 100);
    
    const finalPrice = priceWithOTV + kdvAmount;

    return {
        base: basePrice,
        otvRate: currentOtvRate,
        otvAmount: otvAmount,
        kdvRate: config.kdv,
        kdvAmount: kdvAmount,
        finalPrice: finalPrice
    };
}

function finalizeOrderProcess(productId) {
    const products = JSON.parse(localStorage.getItem('productMaster'));
    const product = products.find(p => p.id === productId);
    const qty = parseInt(document.getElementById('orderQty').value);

    if (isNaN(qty) || qty <= 0) {
        alert("Invalid quantity.");
        return;
    }

    
    const unitCost = product.price * WHOLESALE_FACTOR; 
    const totalOrderCost = qty * unitCost;

    const acc = JSON.parse(localStorage.getItem('companyAccount')) || { balance: 2000000 };
    
    if (acc.balance < totalOrderCost) {
        alert(`Insufficient Balance! \nCost: $${totalOrderCost.toLocaleString()}\nBalance: $${acc.balance.toLocaleString()}`);
        return;
    }

    acc.balance -= totalOrderCost;
    localStorage.setItem('companyAccount', JSON.stringify(acc));

    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    const newOrder = {
        orderId: 'ORD-' + Math.floor(Math.random()*1000),
        type: product.name,
        category: product.type,
        quantity: qty,
        price: product.price, 
        cost: unitCost,       
        status: 'Ordered',
        orderDate: new Date().toISOString().split('T')[0]
    };
    trades.push(newOrder);
    localStorage.setItem('trades', JSON.stringify(trades));

    alert(`Order Proceeded\nPaid to the Producer: $${totalOrderCost.toLocaleString()}`);
    updateDashboardStats();
    handleActivityCode('UP01');
}

// AC01: Finance
function showCompanyAccount(container) {
  const code = prompt("Company Code:");
  if (code !== COMPANY_ACCOUNT_CODE) { container.innerHTML = "<h3>ACCESS DENIED</h3>"; return; }
  const acc = JSON.parse(localStorage.getItem('companyAccount')) || { balance: 50000, receivables: [{ name: 'Tech Supplies', amount: 8500 }], payables: [] };
  container.innerHTML = `<div class="stat-card" style="text-align:center"><h3>Treasury Balance</h3><div class="stat-value">$${acc.balance.toLocaleString()}</div></div>`;
}


// LG01: Google Maps Logistics Integration
function renderLogisticsMap(container) {
    container.innerHTML = `
        <h3><i class="fas fa-network-wired"></i> Full Fleet Network (LG01)</h3>
        <div id="map" style="width:100%; height:450px; border-radius:15px; border: 1px solid var(--border); z-index:1;"></div>
        <div style="margin-top:10px; display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-dim);">
            <span><i class="fas fa-circle" style="color:#10b981"></i> Storage</span>
            <span><i class="fas fa-circle" style="color:#3b82f6"></i> Active Delivery</span>
            <span><i class="fas fa-circle" style="color:#f59e0b"></i> Hub</span>
            <span id="route-info">Initializing Network...</span>
        </div>
    `;

    setTimeout(() => {
        if (L.DomUtil.get('map')._leaflet_id) { L.DomUtil.get('map')._leaflet_id = null; }
        if (window.fleetInterval) clearInterval(window.fleetInterval);
        
        const map = L.map('map').setView([41.02, 28.95], 10);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OSM'
        }).addTo(map);

        const units = [
            { lat: 41.0345, lng: 28.8123, name: "UNIT-01 (Main Storage)", color: "#10b981" },
            { lat: 41.0000, lng: 29.0800, name: "UNIT-02 (Customer Home)", color: "#3b82f6" },
            { lat: 41.0452, lng: 28.9888, name: "UNIT-03 (Regional Hub)", color: "#f59e0b" },
            { lat: 41.0400, lng: 28.6800, name: "UNIT-04 (Customs Office)", color: "#ef4444" } 
        ];

        const homeIcon = L.divIcon({
            html: '<i class="fas fa-house-chimney" style="color:#3b82f6; font-size: 22px;"></i>',
            className: 'custom-div-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        units.forEach((u, index) => {
            if (index === 1) {
               
                L.marker([u.lat, u.lng], { icon: homeIcon }).addTo(map).bindPopup(`<b>${u.name}</b>`);
            } else {
               
                L.circleMarker([u.lat, u.lng], {
                    radius: 8,
                    fillColor: u.color,
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map).bindPopup(`<b>${u.name}</b>`);
            }
        });

        const deliveryVehicle = L.circleMarker([units[0].lat, units[0].lng], {
            radius: 6,
            fillColor: "#3b82f6",
            color: "#fff",
            weight: 2,
            fillOpacity: 1,
            zIndexOffset: 1000
        }).addTo(map);

       
        const control = L.Routing.control({
            waypoints: [
                L.latLng(units[0].lat, units[0].lng),
                L.latLng(units[1].lat, units[1].lng)
            ],
            lineOptions: { styles: [{ color: '#3b82f6', opacity: 0.3, weight: 4, dashArray: '10, 10' }] },
            createMarker: function() { return null; }, 
            addWaypoints: false,
            show: false 
        }).addTo(map);

        control.on('routesfound', function(e) {
            const routes = e.routes;
            const routeCoords = routes[0].coordinates;
            const summary = routes[0].summary;
            
            document.getElementById('route-info').innerHTML = 
                `<i class="fas fa-road"></i> ${(summary.totalDistance / 1000).toFixed(1)} km | <i class="fas fa-clock"></i> ${Math.round(summary.totalTime / 60)} min`;

            let i = 0;
            if (window.fleetInterval) clearInterval(window.fleetInterval);

            window.fleetInterval = setInterval(() => {
                if (i < routeCoords.length) {
                    deliveryVehicle.setLatLng([routeCoords[i].lat, routeCoords[i].lng]);
                    i++;
                } else {
                    clearInterval(window.fleetInterval);
                    deliveryVehicle.bindPopup("<b style='color:#3b82f6'>SUCCESS</b><br>Package delivered!").openPopup();
                }
            }, 1200); 
        });

        map.invalidateSize();
    }, 200);
}

// SL01: Direct Sale Procedure (Only for Delivered Items)
function postSaleSP(container) {
    const inv = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    
    if (inv.length === 0) {
        container.innerHTML = `
            <div class="placeholder-content">
                <i class="fas fa-warehouse fa-3x" style="opacity:0.1"></i>
                <h3>Inventory Empty</h3>
                <p>No delivered items available for sale.</p>
            </div>`;
        return;
    }

    let html = `
        <h3><i class="fas fa-cash-register"></i> Direct Sale (SL01)</h3>
        <p style="color:var(--text-dim); margin-bottom:20px;">Execute immediate sale from current stock.</p>
        <div class="category-grid">`;

    inv.forEach((item, index) => {
        html += `
            <div class="category-card" onclick="processSaleStepTwo('${index}')">
                <i class="fas fa-box"></i>
                <span style="font-size:0.8rem;">${item.name}</span>
                <small style="color:var(--primary)">Stock: ${item.quantity}</small>
                <small>$${item.salePrice.toLocaleString()}</small>
            </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function processSaleStepTwo(index) {
    const inv = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    const item = inv[index];
    const container = document.getElementById('dynamicContent');

    container.innerHTML = `
        <h3><i class="fas fa-cart-arrow-down"></i> Finalize Sale</h3>
        <div class="order-form">
            <div style="text-align:center;">
                <h4 style="color:var(--primary)">${item.name}</h4>
                <p>Available Stock: ${item.quantity}</p>
            </div>
            <label class="order-label">Quantity to Sell</label>
            <input type="number" id="saleQty" class="order-input" max="${item.quantity}" min="1" placeholder="Max: ${item.quantity}">
            <button class="execute-btn" style="width:100%" onclick="executeFinalSale('${index}')">
                CONFIRM SALE
            </button>
            <button class="secondary" style="width:100%; border:none; background:none; color:var(--text-dim);" onclick="handleActivityCode('SL01')">CANCEL</button>
        </div>
    `;
}

function executeFinalSale(index) {
    const inv = JSON.parse(localStorage.getItem('inventoryItems')) || [];
    const acc = JSON.parse(localStorage.getItem('companyAccount'));
    const item = inv[index];
    const qty = parseInt(document.getElementById('saleQty').value);

    if (isNaN(qty) || qty <= 0 || qty > item.quantity) {
        alert("Insufficient stock or invalid quantity.");
        return;
    }

    const tax = calculateTurkishTax(item.salePrice, item.type);
    const totalSaleAmount = tax.finalPrice * qty;

    acc.balance += totalSaleAmount;
    localStorage.setItem('companyAccount', JSON.stringify(acc));

    inv[index].quantity -= qty;
    if (inv[index].quantity === 0) inv.splice(index, 1);
    localStorage.setItem('inventoryItems', JSON.stringify(inv));

    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    trades.push({
        orderId: 'SALE-' + Math.floor(Math.random()*9000),
        type: item.name,
        category: item.type,
        quantity: qty,
        price: tax.finalPrice, 
        matrah: item.salePrice, 
        status: 'Delivered',
        orderDate: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('trades', JSON.stringify(trades));

    alert(`
        Tax Base Summary
        
        Base: $${(item.salePrice * qty).toLocaleString()}
        SCT Rate: %${tax.otvRate}
        VAT Rate: %${tax.kdvRate}
        
        Total Earned: $${totalSaleAmount.toLocaleString()}
    `);

    updateDashboardStats();
    handleActivityCode('SL01');
}


// FG01: Professional Financial Analysis Engine
function renderFinancialAnalysis(container) {
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    const activeTrades = trades.filter(t => t.status !== 'Canceled');

    const salesTrades = activeTrades.filter(t => t.orderId.startsWith('SALE-'));
    const orderTrades = activeTrades.filter(t => t.orderId.startsWith('ORD-'));

    const totalGrossInflow = salesTrades.reduce((sum, t) => sum + (t.price * t.quantity), 0);
    
    const totalNetRevenue = salesTrades.reduce((sum, t) => sum + ((t.matrah || t.price) * t.quantity), 0);

    const taxHeldInTrust = totalGrossInflow - totalNetRevenue;

    const totalMerchantCost = orderTrades.reduce((sum, t) => sum + (t.cost * t.quantity), 0);

    const netCommercialProfit = totalNetRevenue - totalMerchantCost;

    const maxVal = Math.max(totalNetRevenue, totalMerchantCost, netCommercialProfit, 1);

    container.innerHTML = `
        <h3><i class="fas fa-chart-pie"></i> Commercial P&L Statement (FG01)</h3>
        
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:25px;">
            <div class="stat-card" style="border-left: 4px solid #3b82f6;">
                <span class="nav-label">Gross Cash-In</span>
                <div class="stat-value" style="font-size:1.2rem;">$${totalGrossInflow.toLocaleString()}</div>
                <small style="color:var(--text-dim)">Total Collected</small>
            </div>
            
            <div class="stat-card" style="border-left: 4px solid #f59e0b;">
                <span class="nav-label">Tax Custody</span>
                <div class="stat-value" style="color:#f59e0b; font-size:1.2rem;">$${taxHeldInTrust.toLocaleString()}</div>
                <small style="color:var(--text-dim)">Due to State</small>
            </div>

            <div class="stat-card" style="border-left: 4px solid #ef4444;">
                <span class="nav-label">Goods Cost</span>
                <div class="stat-value" style="color:#ef4444; font-size:1.2rem;">$${totalMerchantCost.toLocaleString()}</div>
                <small style="color:var(--text-dim)">Paid to Factory</small>
            </div>

            <div class="stat-card" style="border-left: 4px solid var(--primary);">
                <span class="nav-label">Merchant Profit</span>
                <div class="stat-value" style="font-size:1.4rem;">$${netCommercialProfit.toLocaleString()}</div>
                <small style="color:var(--primary)">Your Pure Margin</small>
            </div>
        </div>

        <div class="card" style="background:rgba(16, 185, 129, 0.05); border: 1px solid var(--primary); padding: 20px;">
            <h4 style="margin-bottom:15px;"><i class="fas fa-coins"></i> Profit Analysis</h4>
            <p style="font-size:0.85rem; color:var(--text-dim); line-height:1.6;">
                You earned <b>$${netCommercialProfit.toLocaleString()}</b> by applying a markup on products. 
                The <b>$${taxHeldInTrust.toLocaleString()}</b> collected in taxes is currently held in your balance but belongs to the state.
            </p>
            <div style="margin-top:15px; display:flex; justify-content:space-between; align-items:center;">
                <span>Commercial Margin:</span>
                <b style="color:var(--primary); font-size:1.2rem;">${totalNetRevenue > 0 ? ((netCommercialProfit / totalNetRevenue) * 100).toFixed(1) : 0}%</b>
            </div>
        </div>
    `;
}

// Export System: Trades to CSV (Excel Compatible)
function exportTradesToCSV() {
    const trades = JSON.parse(localStorage.getItem('trades')) || [];
    
    if (trades.length === 0) {
        alert("SQL ERROR: No transaction data found to export.");
        return;
    }

    let csvHeader = [
        "Order ID", "Product", "Category", "Quantity", 
        "Base Price (Matrah)", "Factory Cost (0.7)", 
        "SCT Rate (%)", "VAT Rate (%)", 
        "Total Gross Amount", "Status", "Date"
    ].join(",");

    let csvRows = [csvHeader];

    trades.forEach(t => {
       
        const basePrice = t.matrah || t.price;
        const factoryCost = t.cost || (basePrice * WHOLESALE_FACTOR);
        
        const taxDetails = calculateTurkishTax(basePrice, t.category);
        
        const row = [
            t.orderId,
            `"${t.type}"`, 
            t.category || "General",
            t.quantity,
            basePrice.toFixed(2),
            factoryCost.toFixed(2),
            taxDetails.otvRate + "%",
            taxDetails.kdvRate + "%",
            (t.price * t.quantity).toFixed(2), 
            t.status,
            t.orderDate
        ];
        
        csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Trade_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click(); // Otomatik indir
    document.body.removeChild(link);
    
    console.log("SQL: Comprehensive CSV Audit Report generated.");
}

function manageOrders(container) {
  const trades = JSON.parse(localStorage.getItem('trades')) || [];
  
  if (trades.length === 0) {
    container.innerHTML = `
      <div class="placeholder-content">
        <i class="fas fa-clipboard-list fa-3x" style="opacity:0.2; margin-bottom:20px;"></i>
        <h3>No Orders Found</h3>
        <p>The sys.sales_orders table is currently empty.</p>
        <button class="execute-btn" style="margin-top:15px" onclick="handleActivityCode('CR01')">CREATE FIRST ORDER</button>
      </div>`;
    return;
  }

  let html = `
    <h3><i class="fas fa-list-check"></i> Order Management (Proc UP01)</h3>
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Item Description</th>
          <th>Qty</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>`;

  trades.forEach((t, index) => {
    html += `
      <tr>
        <td style="font-family:monospace; color:var(--primary)">${t.orderId}</td>
        <td><b>${t.type}</b> <br><small style="color:var(--text-dim)">${t.category || 'General'}</small></td>
        <td>${t.quantity}</td>
        <td><span class="badge" style="background:rgba(16, 185, 129, 0.1)">${t.status}</span></td>
        <td>
          <button class="execute-btn" style="padding:5px 10px; font-size:0.7rem;" onclick="updateOrderStatus(${index})">
            UPDATE
          </button>
        </td>
      </tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

// UP01: Update Order Status
function updateOrderStatus(index) {

  const trades = JSON.parse(localStorage.getItem('trades')) || [];
  const inv = JSON.parse(localStorage.getItem('inventoryItems')) || [];
  const acc = JSON.parse(localStorage.getItem('companyAccount'));
  
  const currentOrder = trades[index];

  if (currentOrder.status === "Delivered" || currentOrder.status === "Canceled") {
    alert(`Transaction Locked.\nOrder ${currentOrder.orderId} is finalized as [${currentOrder.status}].`);
    return;
  }

  const adminKey = prompt(`AUTH REQUIRED\nModify Order: ${currentOrder.orderId}\nEnter Auth Key:`);
  if (adminKey === null) return; // İptal basılırsa çık
  if (adminKey !== AUTH_KEY) {
    alert("Unauthorized Access.");
    return;
  }

  const statusChoice = prompt(
    `Order: ${currentOrder.orderId}\nItem: ${currentOrder.type}\n` +
    `----------------------------------\n` +
    `Select New Status:\n1-Ordered, 2-Shipped, 3-Delivered, 4-Canceled`
  );

  const statusMap = { "1": "Ordered", "2": "Shipped", "3": "Delivered", "4": "Canceled" };
  const newStatus = statusMap[statusChoice];

  if (!newStatus || newStatus === currentOrder.status) return;

  if (newStatus === "Canceled") {
     
      const refund = currentOrder.quantity * (currentOrder.cost || (currentOrder.price * WHOLESALE_FACTOR));
      acc.balance += refund;
      localStorage.setItem('companyAccount', JSON.stringify(acc));
      alert(`Refund Success: $${refund.toLocaleString()} returned to Company Balance.`);
  }

  if (newStatus === "Delivered") {
    const existingIdx = inv.findIndex(i => i.name === currentOrder.type && i.type === currentOrder.category);
    
    if (existingIdx !== -1) {
        inv[existingIdx].quantity += currentOrder.quantity;
    } else {
        inv.push({
            id: 'ITM-' + Math.floor(Math.random()*1000),
            type: currentOrder.category,
            name: currentOrder.type,
            quantity: currentOrder.quantity,
            salePrice: currentOrder.price, 
           
            cost: currentOrder.cost || (currentOrder.price * WHOLESALE_FACTOR) 
        });
    }
    localStorage.setItem('inventoryItems', JSON.stringify(inv));
    alert("SUCCESS: Stock entry completed. Record is now LOCKED.");
  }

  trades[index].status = newStatus;
  localStorage.setItem('trades', JSON.stringify(trades));
  
  updateDashboardStats();
  handleActivityCode('UP01');
  
 // script.js dosyasının EN SONU (tüm fonksiyonların dışı)

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        calculateTurkishTax: calculateTurkishTax, 
        WHOLESALE_FACTOR: WHOLESALE_FACTOR 
    };
}
