const apiUrl = 'https://shopinventoryapp-production.up.railway.app/api';

let products = [];
let transactions = [];
let editingProductId = null;
let editingMode = null; // 'price' or 'quantity'
let isFilterVisible = false;

// --- DOM Elements ---
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const loadingIndicator = document.getElementById('loading-indicator');
const pageTitle = document.getElementById('page-title');
const sections = {
  products: document.getElementById('products-section'),
  addProduct: document.getElementById('add-product-section'),
  purchase: document.getElementById('purchase-section'),
  transactions: document.getElementById('transactions-section'),
  summary: document.getElementById('summary-section'),
};

// --- Initialize Sidebar State ---
function initSidebar() {
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
    sidebar.classList.remove('open');
  } else {
    sidebar.classList.remove('collapsed');
    if (window.innerWidth <= 1024) {
      sidebar.classList.remove('open');
    } else {
      sidebar.classList.add('open');
    }
  }

  // Mobile menu toggle
  let mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (!mobileMenuBtn) {
    mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.id = 'mobile-menu-btn';
    mobileMenuBtn.className = 'md:hidden fixed top-4 right-4 z-50 bg-white p-3 rounded-md shadow-md';
    mobileMenuBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    `;
    document.body.appendChild(mobileMenuBtn);
  }

  mobileMenuBtn.onclick = (e) => {
    e.stopPropagation(); // Prevent triggering document click
    toggleSidebar();
  };

  // Prevent clicks inside sidebar from closing it
  sidebar.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  function updateMobileMenuBtn() {
    if (window.innerWidth <= 1024) {
      mobileMenuBtn.style.display = sidebar.classList.contains('open') ? 'none' : 'block';
    } else {
      mobileMenuBtn.style.display = 'none';
    }
  }

  sidebar.addEventListener('transitionend', updateMobileMenuBtn);
  window.addEventListener('resize', updateMobileMenuBtn);
  window.updateMobileMenuBtn = updateMobileMenuBtn;
  updateMobileMenuBtn();
}

// --- Toggle Sidebar ---
function toggleSidebar() {
  if (sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
  window.updateMobileMenuBtn();
}

function openSidebar() {
  sidebar.classList.add('open');
  sidebar.classList.remove('collapsed');
  localStorage.setItem('sidebarCollapsed', 'false');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebar.classList.add('collapsed');
  localStorage.setItem('sidebarCollapsed', 'true');
}

toggleSidebarBtn.onclick = (e) => {
  e.stopPropagation();
  toggleSidebar();
};

// --- Show Loading Indicator ---
function showLoading() {
  loadingIndicator.classList.remove('hidden');
  loadingIndicator.style.opacity = '1';
  loadingIndicator.style.transition = 'opacity 0.3s ease';
}

// --- Hide Loading Indicator ---
function hideLoading() {
  loadingIndicator.style.opacity = '0';
  setTimeout(() => {
    loadingIndicator.classList.add('hidden');
    loadingIndicator.style.opacity = '1'; // Reset for next use
  }, 300);
}

// --- Navigation ---
function showSection(section) {
  Object.values(sections).forEach((sec) => {
    sec.classList.add('hidden');
    sec.classList.remove('fade-in');
  });

  const titles = {
    products: 'Products',
    addProduct: 'Add Product',
    purchase: 'Purchase Products',
    transactions: 'Transaction History',
    summary: 'Sales Summary',
  };
  pageTitle.textContent = titles[section];

  sections[section].classList.remove('hidden');
  setTimeout(() => {
    sections[section].classList.add('fade-in');
  }, 10);

  localStorage.setItem('activeSection', section);
}

// --- Render Functions ---
function renderProducts() {
  sections.products.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800">Products Inventory</h2>
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-500">${products.length} products</div>
          <button id="nav-add-product-btn" class="btn-primary px-3 py-1.5 text-sm">
            Add Product
          </button>
        </div>
      </div>
      <div id="product-list" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"></div>
    </div>
  `;
  renderProductList();

  document.getElementById('nav-add-product-btn').onclick = () => {
    showSection('addProduct');
    renderAddProduct();
    setActiveNav('nav-add-product');
    localStorage.setItem('activeNav', 'nav-add-product');
    if (window.innerWidth <= 1024) {
      closeSidebar();
      window.updateMobileMenuBtn();
    }
  };
}

function renderAddProduct() {
  sections.addProduct.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Add New Product</h2>
      <form id="product-form" class="space-y-4">
        <div>
          <label for="product-name" class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input type="text" id="product-name" placeholder="Enter product name" required 
            class="input-field w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="product-price" class="block text-sm font-medium text-gray-700 mb-1">Price (Gh₵)</label>
            <input type="number" id="product-price" placeholder="0.00" required step="0.01" min="0" 
              class="input-field w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label for="product-quantity" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input type="number" id="product-quantity" placeholder="0" required min="0" 
              class="input-field w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        <button type="submit" class="btn-primary w-full p-3 rounded-lg font-medium">
          Add Product
        </button>
      </form>
    </div>
  `;
  document.getElementById('product-form').onsubmit = addProduct;
}

function renderProductList() {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  productList.innerHTML = '';

  if (products.length === 0) {
    productList.innerHTML = `
      <div class="col-span-full text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7h16" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">No products found</h3>
        <p class="mt-1 text-gray-500">Add your first product to get started</p>
      </div>
    `;
    return;
  }

  products.forEach((product) => {
    const div = document.createElement('div');
    div.className = 'product-item';

    let stockStatus = '';
    if (product.quantity <= 0) {
      stockStatus = `<span class="badge badge-danger">Out of Stock</span>`;
    } else if (product.quantity < 10) {
      stockStatus = `<span class="badge badge-warning">Low Stock (${product.quantity})</span>`;
    } else {
      stockStatus = `<span class="badge badge-success">In Stock (${product.quantity})</span>`;
    }

    div.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold text-gray-800 uppercase">${product.name}</h3>
          <p class="text-xl font-bold text-blue-600 mt-1">Gh₵${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div class="mt-2">${stockStatus}</div>
        </div>
        <div class="flex space-x-2">
          <button class="edit-price-button text-blue-500 hover:text-blue-700" title="Edit Price">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="edit-quantity-button text-green-500 hover:text-green-700" title="Edit Quantity">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button class="delete-button text-red-500 hover:text-red-700" title="Delete Product">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div id="actions-${product._id}" class="mt-4"></div>
    `;

    div.querySelector('.edit-price-button').onclick = () => showInlineEditForm(product, 'price');
    div.querySelector('.edit-quantity-button').onclick = () => showInlineEditForm(product, 'quantity');
    div.querySelector('.delete-button').onclick = () => deleteProduct(product._id);

    productList.appendChild(div);
  });
}

function showInlineEditForm(product, mode) {
  const actionsDiv = document.getElementById(`actions-${product._id}`);
  if (!actionsDiv) return;

  const isPrice = mode === 'price';
  const step = isPrice ? '0.01' : '1';
  const label = isPrice ? 'Price (Gh₵)' : 'Quantity to Add';

  actionsDiv.innerHTML = `
    <form id="inline-edit-form-${product._id}" class="bg-${isPrice ? 'blue' : 'green'}-50 p-4 rounded-lg">
      <h4 class="text-sm font-medium text-${isPrice ? 'blue' : 'green'}-800 mb-2">
        Editing ${isPrice ? 'Price' : 'Quantity'} for ${product.name}
      </h4>
      <div class="flex items-end space-x-2">
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-500 mb-1">${label}</label>
          <input type="number" id="inline-edit-value-${product._id}" 
            placeholder="Enter ${isPrice ? 'new price' : 'quantity to add'}" 
            required min="0" step="${step}"
            class="input-field w-full p-2 border rounded focus:ring-2 focus:ring-${isPrice ? 'blue' : 'green'}-500 focus:border-${isPrice ? 'blue' : 'green'}-500"
            value="">
        </div>
        <button type="submit" class="btn-${isPrice ? 'primary' : 'success'} px-3 py-2 text-sm">
          Update ${isPrice ? 'Price' : 'Quantity'}
        </button>
        <button type="button" class="bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300" id="cancel-inline-edit-${product._id}">
          Cancel
        </button>
      </div>
    </form>
  `;

  document.getElementById(`inline-edit-form-${product._id}`).onsubmit = async (e) => {
    e.preventDefault();
    const value = document.getElementById(`inline-edit-value-${product._id}`).value;

    showLoading();
    try {
      if (isPrice) {
        await fetch(`${apiUrl}/products/${product._id}/price`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price: parseFloat(value) }),
        });
      } else {
        await fetch(`${apiUrl}/products/${product._id}/quantity`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: parseInt(value) }),
        });
      }
      await fetchProducts();
      await fetchTransactions();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product.');
    } finally {
      hideLoading();
    }
  };

  document.getElementById(`cancel-inline-edit-${product._id}`).onclick = () => {
    renderProducts();
  };
}

function renderPurchase() {
  sections.purchase.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm p-6 max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Purchase Products</h2>
      <form id="purchase-form" class="space-y-4">
        <div>
          <label for="purchase-product" class="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
          <select id="purchase-product" required class="input-field w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">-- Select a product --</option>
            ${products
              .filter((p) => p.quantity > 0)
              .map(
                (p) => `
              <option value="${p._id}">${p.name} - Gh₵${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${p.quantity} available)</option>
            `
              )
              .join('')}
          </select>
        </div>
        <div>
          <label for="purchase-quantity" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input type="number" id="purchase-quantity" placeholder="Enter quantity" required min="1" 
            class="input-field w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <button type="submit" class="btn-primary w-full p-3 rounded-lg font-medium">
          Process Purchase
        </button>
      </form>
    </div>
  `;
  document.getElementById('purchase-form').onsubmit = processPurchase;
}

function renderTransactions(filteredList = null, filterType = '', filterDate = '') {
  const list = filteredList || transactions;
  const totalCount = transactions.length;
  const filteredCount = list.length;
  const filteredTotalPrice = list.reduce((sum, t) => sum + (t.totalPrice || 0), 0);

  sections.transactions.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
        <div>
          <h2 class="text-2xl font-semibold text-gray-800">
            Transaction History
            <span class="text-base text-gray-500 font-normal ml-2">
              (${filteredCount} shown${filterType || filterDate ? `, Total: Gh₵${filteredTotalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''})
            </span>
          </h2>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-500">
            Total Transactions: ${totalCount}
          </div>
          <button id="show-filter-btn" class="btn-primary px-4 py-2 text-sm ${isFilterVisible ? 'hidden' : ''}">
            Show Filter
          </button>
          <button id="hide-filter-btn" class="btn-secondary px-4 py-2 text-sm ${isFilterVisible ? '' : 'hidden'}">
            Hide Filter
          </button>
        </div>
      </div>
      
      <form id="filter-form" class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 ${isFilterVisible ? '' : 'hidden'}">
        <div>
          <label for="filter-start" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input type="date" id="filter-start" class="input-field w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
          <label for="filter-end" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input type="date" id="filter-end" class="input-field w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
          <label for="filter-type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select id="filter-type" class="input-field w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="update quantity">Update Quantity</option>
            <option value="add">Add</option>
            <option value="edit">Edit</option>
            <option value="delete">Delete</option>
          </select>
        </div>
        <div class="flex items-end">
          <button type="button" id="filter-btn" class="btn-primary w-full p-2 rounded font-medium">
            Filter
          </button>
        </div>
      </form>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody id="transaction-list" class="bg-white divide-y divide-gray-200"></tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('show-filter-btn').onclick = () => {
    isFilterVisible = true;
    renderTransactions(filteredList, filterType, filterDate);
  };
  document.getElementById('hide-filter-btn').onclick = () => {
    isFilterVisible = false;
    renderTransactions(filteredList, filterType, filterDate);
  };
  document.getElementById('filter-btn').onclick = filterTransactions;
  renderTransactionList(list, filterType, filterDate);
}

function renderTransactionList(list, filterType = '', filterDate = '') {
  const tbody = document.getElementById('transaction-list');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (list.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
        ${filterType || filterDate ? `No matching transactions found${filterType ? ` for type "${filterType}"` : ''}${filterDate ? ` on ${filterDate}` : ''}` : 'No transactions recorded yet'}
      </td>
    `;
    tbody.appendChild(tr);
    return;
  }

  list.forEach((t) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50';

    let typeBadge = '';
    if (t.type === 'purchase') {
      typeBadge = '<span class="badge badge-success">PURCHASE</span>';
    } else if (t.type === 'update quantity') {
      typeBadge = '<span class="badge badge-warning">STOCK UPDATE</span>';
    } else if (t.type === 'add') {
      typeBadge = '<span class="badge badge-success">ADD</span>';
    } else if (t.type === 'edit') {
      typeBadge = '<span class="badge badge-warning">EDIT</span>';
    } else if (t.type === 'delete') {
      typeBadge = '<span class="badge badge-danger">DELETE</span>';
    }

    let details = '';
    if (t.type === 'purchase') {
      details = `Qty: ${t.quantity} • Total: Gh₵${(t.totalPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (t.type === 'update quantity') {
      details = `Qty Added: ${t.quantity} • New Total: ${t.quantityAvailable ?? 'N/A'}`;
    } else if (t.type === 'add') {
      details = `Qty Added: ${t.quantity}`;
    } else if (t.type === 'edit') {
      if (typeof t.oldPrice !== 'undefined' && typeof t.newPrice !== 'undefined') {
        details = `Price: Gh₵${Number(t.oldPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} → Gh₵${Number(t.newPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (typeof t.quantity !== 'undefined') {
        details = `Qty Changed: ${t.quantity}`;
      }
    } else if (t.type === 'delete') {
      details = `Qty at Deletion: ${t.quantity}`;
    }

    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">${typeBadge}</td>
      <td class="px-6 py-4 whitespace-nowrap font-medium">${t.productName}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${details}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(t.timestamp).toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySales = transactions.filter(
    (t) => t.type === 'purchase' && new Date(t.timestamp) >= today && new Date(t.timestamp) < tomorrow
  );

  const totalSales = todaySales.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
  const avgSale = todaySales.length > 0 ? totalSales / todaySales.length : 0;

  const grouped = {};
  todaySales.forEach((t) => {
    if (!grouped[t.productName]) {
      grouped[t.productName] = {
        productName: t.productName,
        quantity: 0,
        totalPrice: 0,
        latest: t.timestamp,
      };
    }
    grouped[t.productName].quantity += t.quantity;
    grouped[t.productName].totalPrice += t.totalPrice || 0;
    if (new Date(t.timestamp) > new Date(grouped[t.productName].latest)) {
      grouped[t.productName].latest = t.timestamp;
    }
  });

  const groupedArr = Object.values(grouped);

  sections.summary.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Today's Sales Summary</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-blue-50 p-6 rounded-lg">
          <div class="text-sm font-medium text-blue-600">Total Sales</div>
          <div class="text-3xl font-bold text-gray-900 mt-2">Gh₵${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div class="bg-green-50 p-6 rounded-lg">
          <div class="text-sm font-medium text-green-600">Total Transactions</div>
          <div class="text-3xl font-bold text-gray-900 mt-2">${todaySales.length}</div>
        </div>
        <div class="bg-purple-50 p-6 rounded-lg">
          <div class="text-sm font-medium text-purple-600">Average Sale</div>
          <div class="text-3xl font-bold text-gray-900 mt-2">Gh₵${avgSale.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Most Recent</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${groupedArr.length === 0
              ? `
              <tr>
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                  No transactions today
                </td>
              </tr>
            `
              : groupedArr
                  .map(
                    (g) => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap font-medium">${g.productName}</td>
                <td class="px-6 py-4 whitespace-nowrap">${g.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap">Gh₵${g.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${new Date(g.latest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </td>
              </tr>
            `
                  )
                  .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// --- API Functions ---
async function fetchProducts() {
  showLoading();
  try {
    const res = await fetch(`${apiUrl}/products`);
    products = await res.json();
    renderProducts();
    renderPurchase();
  } catch (error) {
    console.error('Error fetching products:', error);
    alert('Error fetching products.');
  } finally {
    hideLoading();
  }
}

async function fetchTransactions() {
  showLoading();
  try {
    const res = await fetch(`${apiUrl}/transactions`);
    transactions = await res.json();
    const activeSection = localStorage.getItem('activeSection') || 'products';
    if (activeSection === 'transactions') {
      renderTransactions();
    } else if (activeSection === 'summary') {
      renderSummary();
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    alert('Error fetching transactions.');
  } finally {
    hideLoading();
  }
}

// --- Product CRUD ---
async function addProduct(e) {
  e.preventDefault();

  const name = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  const quantity = parseInt(document.getElementById('product-quantity').value);

  if (!name || isNaN(price) || isNaN(quantity)) {
    alert('Please fill all fields with valid values.');
    return;
  }

  showLoading();
  try {
    const res = await fetch(`${apiUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, quantity }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || 'Failed to add product.');
      return;
    }

    document.getElementById('product-form').reset();
    await fetchProducts();
    await fetchTransactions();
  } catch (error) {
    console.error('Error adding product:', error);
    alert('An error occurred while adding the product.');
  } finally {
    hideLoading();
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  showLoading();
  try {
    await fetch(`${apiUrl}/products/${id}/request`, { method: 'DELETE' });
    await fetchProducts();
    await fetchTransactions();
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('An error occurred while deleting the product.');
  } finally {
    hideLoading();
  }
}

// --- Purchase ---
async function processPurchase(e) {
  e.preventDefault();

  const productId = document.getElementById('purchase-product').value;
  const quantity = parseInt(document.getElementById('purchase-quantity').value);

  if (!productId || isNaN(quantity) || quantity < 1) {
    alert('Please select a product and enter a valid quantity.');
    return;
  }

  showLoading();
  try {
    const res = await fetch(`${apiUrl}/transactions/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || 'Failed to process purchase.');
      return;
    }

    const product = products.find((p) => p._id === productId);
    alert(`Successfully purchased ${quantity} ${quantity === 1 ? 'unit' : 'units'} of ${product.name} for Gh₵${(quantity * product.price).toFixed(2)}`);

    document.getElementById('purchase-form').reset();
    await fetchProducts();
    await fetchTransactions();

    const activeSection = localStorage.getItem('activeSection');
    if (activeSection === 'transactions') {
      renderTransactions();
    } else if (activeSection === 'summary') {
      renderSummary();
    }
  } catch (error) {
    console.error('Error processing purchase:', error);
    alert('An error occurred while processing the purchase.');
  } finally {
    hideLoading();
  }
}

// --- Filter Transactions ---
function filterTransactions() {
  const start = document.getElementById('filter-start').value;
  const end = document.getElementById('filter-end').value;
  const type = document.getElementById('filter-type').value;

  let filtered = transactions;
  let filterType = '';
  let filterDate = '';

  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    filtered = filtered.filter((t) => {
      const d = new Date(t.timestamp);
      return d >= startDate && d <= endDate;
    });
    filterDate = `${start} to ${end}`;
  }

  if (type) {
    filtered = filtered.filter((t) => t.type === type);
    filterType = type;
  }

  renderTransactions(filtered, filterType, filterDate);
}

// --- Navigation Highlight and Auto-Collapse ---
const navButtons = ['nav-products', 'nav-add-product', 'nav-purchase', 'nav-transactions', 'nav-summary'];

function setActiveNav(id) {
  navButtons.forEach((btnId) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.classList.toggle('active', btnId === id);
    }
  });
}

// Attach navigation events
document.getElementById('nav-products').onclick = () => {
  showSection('products');
  renderProducts();
  setActiveNav('nav-products');
  localStorage.setItem('activeNav', 'nav-products');
  if (window.innerWidth <= 1024) {
    closeSidebar();
    window.updateMobileMenuBtn();
  }
};
document.getElementById('nav-add-product').onclick = () => {
  showSection('addProduct');
  renderAddProduct();
  setActiveNav('nav-add-product');
  localStorage.setItem('activeNav', 'nav-add-product');
  if (window.innerWidth <= 1024) {
    closeSidebar();
    window.updateMobileMenuBtn();
  }
};
document.getElementById('nav-purchase').onclick = () => {
  showSection('purchase');
  renderPurchase();
  setActiveNav('nav-purchase');
  localStorage.setItem('activeNav', 'nav-purchase');
  if (window.innerWidth <= 1024) {
    closeSidebar();
    window.updateMobileMenuBtn();
  }
};
document.getElementById('nav-transactions').onclick = () => {
  showSection('transactions');
  renderTransactions();
  setActiveNav('nav-transactions');
  localStorage.setItem('activeNav', 'nav-transactions');
  if (window.innerWidth <= 1024) {
    closeSidebar();
    window.updateMobileMenuBtn();
  }
};
document.getElementById('nav-summary').onclick = () => {
  showSection('summary');
  renderSummary();
  setActiveNav('nav-summary');
  localStorage.setItem('activeNav', 'nav-summary');
  if (window.innerWidth <= 1024) {
    closeSidebar();
    window.updateMobileMenuBtn();
  }
};

// Enhanced click-outside handler for tablet and phone
document.addEventListener('click', function (event) {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (
    window.innerWidth <= 1024 &&
    sidebar.classList.contains('open') &&
    !sidebar.contains(event.target) &&
    (!mobileMenuBtn || !mobileMenuBtn.contains(event.target))
  ) {
    closeSidebar();
    window.updateMobileMenuBtn();
  }
});

// --- Responsive: Close sidebar on resize ---
window.addEventListener('resize', () => {
  if (window.innerWidth > 1024) {
    openSidebar();
  } else {
    closeSidebar();
  }
});

// --- Initial Load ---
window.addEventListener('DOMContentLoaded', async () => {
  initSidebar();

  document.getElementById('copyright-year').textContent = new Date().getFullYear();

  const lastSection = localStorage.getItem('activeSection') || 'products';
  const lastNav = localStorage.getItem('activeNav') || 'nav-products';

  const validSections = ['products', 'addProduct', 'purchase', 'transactions', 'summary'];
  const activeSection = validSections.includes(lastSection) ? lastSection : 'products';
  const activeNav = navButtons.includes(lastNav) ? lastNav : 'nav-products';

  showSection(activeSection);
  setActiveNav(activeNav);

  if (activeSection === 'products') renderProducts();
  else if (activeSection === 'addProduct') renderAddProduct();
  else if (activeSection === 'purchase') renderPurchase();
  else if (activeSection === 'transactions') renderTransactions();
  else if (activeSection === 'summary') renderSummary();

  showLoading();
  try {
    await fetchProducts();
    await fetchTransactions();
  } catch (error) {
    console.error('Initial load error:', error);
  } finally {
    hideLoading();
  }
});

function showInlineAddQuantityForm(product) {
  const actionsDiv = document.getElementById(`actions-${product._id}`);
  if (!actionsDiv) return;
  actionsDiv.innerHTML = `
    <form id="inline-add-quantity-form-${product._id}" class="flex flex-col space-y-3 w-full">
      <input type="number" id="inline-add-quantity-value-${product._id}" 
        placeholder="Quantity to Add" 
        required min="1"
        class="p-2 border rounded-lg">
      <div class="flex gap-2">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Add</button>
        <button type="button" class="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500" id="cancel-inline-add-quantity-${product._id}">Cancel</button>
      </div>
    </form>
  `;
  document.getElementById(`inline-add-quantity-form-${product._id}`).onsubmit = async (e) => {
    e.preventDefault();
    const value = parseInt(document.getElementById(`inline-add-quantity-value-${product._id}`).value);
    if (isNaN(value) || value <= 0) {
      alert('Enter a valid quantity to add.');
      return;
    }

    showLoading();
    try {
      await fetch(`${apiUrl}/products/${product._id}/quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: value }),
      });
      await fetchProducts();
      await fetchTransactions();
    } catch (error) {
      console.error('Error adding quantity:', error);
      alert('Error adding quantity.');
    } finally {
      hideLoading();
    }
  };
  document.getElementById(`cancel-inline-add-quantity-${product._id}`).onclick = () => {
    renderProducts();
  };
}