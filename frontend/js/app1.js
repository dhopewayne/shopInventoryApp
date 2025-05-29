const apiUrl = 'http://localhost:5000/api';
let products = [];
let transactions = [];
let editingProductId = null;
let editingMode = null; // 'price' or 'quantity'

// --- Navigation ---
const sections = {
  products: document.getElementById('products-section'),
  addProduct: document.getElementById('add-product-section'),
  purchase: document.getElementById('purchase-section'),
  transactions: document.getElementById('transactions-section'),
  summary: document.getElementById('summary-section'),
};

function showSection(section) {
  Object.values(sections).forEach(sec => sec.classList.add('hidden'));
  sections[section].classList.remove('hidden');
}

// --- Loader ---
function showLoader() {
  document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
  document.getElementById('loader').classList.add('hidden');
}

// --- Sidebar Toggle ---
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');

function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
  const isCollapsed = sidebar.classList.contains('collapsed');
  localStorage.setItem('sidebarCollapsed', isCollapsed);
  toggleSidebarBtn.innerHTML = isCollapsed ? '<i class="fas fa-bars text-xl"></i>' : '<i class="fas fa-times text-xl"></i>';
}

// Load sidebar state from localStorage
function initSidebar() {
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
    toggleSidebarBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
  } else {
    toggleSidebarBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
  }
}

toggleSidebarBtn.onclick = toggleSidebar;

// --- Render Functions ---
function renderProducts() {
  sections.products.innerHTML = `
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Products List</h2>
    <div id="product-list" class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"></div>
  `;
  renderProductList();
}

function renderAddProduct() {
  sections.addProduct.innerHTML = `
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Add Product</h2>
    <form id="product-form" class="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label for="product-name" class="block text-sm font-medium text-gray-700">Product Name</label>
        <input type="text" id="product-name" placeholder="Product Name" required class="w-full p-3 border rounded-lg mt-1">
      </div>
      <div>
        <label for="product-price" class="block text-sm font-medium text-gray-700">Price</label>
        <input type="number" id="product-price" placeholder="Price" required step="0.01" min="0" class="w-full p-3 border rounded-lg mt-1">
      </div>
      <div>
        <label for="product-quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
        <input type="number" id="product-quantity" placeholder="Quantity" required min="0" class="w-full p-3 border rounded-lg mt-1">
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">Add Product</button>
    </form>
  `;
  document.getElementById('product-form').onsubmit = addProduct;
}

function renderProductList() {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  productList.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product-item flex flex-col justify-between';
    let stockStatus = '';
    if (product.quantity <= 0) {
      stockStatus = `<span class="text-red-600 font-semibold">Out of Stock</span>`;
    } else if (product.quantity < 10) {
      stockStatus = `<span class="text-orange-500 font-semibold">${product.name} stock is low</span>`;
    }
    div.innerHTML = `
      <div>
        <h3 class="text-lg font-semibold text-gray-800">${product.name}</h3>
        <p class="text-gray-600">Price: $${product.price.toFixed(2)}</p>
        <p class="text-gray-600">Quantity: ${product.quantity} ${stockStatus}</p>
      </div>
      <div class="flex flex-wrap gap-2 mt-4" id="actions-${product._id}">
        <button class="add-quantity-button bg-green-500 text-white px-4 py-2 rounded-lg">Add Quantity</button>
        <button class="edit-price-button bg-yellow-500 text-white px-4 py-2 rounded-lg">Edit Price</button>
        <button class="delete-button bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
      </div>
    `;
    // Add Quantity
    div.querySelector('.add-quantity-button').onclick = () => {
      showInlineAddQuantityForm(product);
    };
    // Edit Price
    div.querySelector('.edit-price-button').onclick = () => {
      showInlineEditForm(product, 'price');
    };
    // Delete
    div.querySelector('.delete-button').onclick = () => deleteProduct(product._id);
    productList.appendChild(div);
  });
}

// Inline edit form for price or quantity
function showInlineEditForm(product, mode) {
  const actionsDiv = document.getElementById(`actions-${product._id}`);
  if (!actionsDiv) return;
  actionsDiv.innerHTML = `
    <form id="inline-edit-form-${product._id}" class="flex flex-col space-y-3 w-full">
      <input type="number" id="inline-edit-value-${product._id}" 
        placeholder="New ${mode === 'price' ? 'Price' : 'Quantity'}" 
        required min="0" step="0.01"
        class="p-2 border rounded-lg"
        value="${mode === 'price' ? product.price : product.quantity}">
      <div class="flex gap-2">
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Edit</button>
        <button type="button" class="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500" id="cancel-inline-edit-${product._id}">Cancel</button>
      </div>
    </form>
  `;
  document.getElementById(`inline-edit-form-${product._id}`).onsubmit = async (e) => {
    e.preventDefault();
    showLoader();
    const value = document.getElementById(`inline-edit-value-${product._id}`).value;
    try {
      if (mode === 'price') {
        await fetch(`${apiUrl}/products/${product._id}/price`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price: parseFloat(value) }),
        });
      } else {
        const diff = parseInt(value) - product.quantity;
        await fetch(`${apiUrl}/products/${product._id}/quantity`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: diff }),
        });
      }
      await fetchProducts();
    } catch (error) {
      alert('Failed to update product.');
    } finally {
      hideLoader();
    }
  };
  document.getElementById(`cancel-inline-edit-${product._id}`).onclick = () => {
    renderProducts();
  };
}

// Inline form for adding quantity
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
    showLoader();
    const value = parseInt(document.getElementById(`inline-add-quantity-value-${product._id}`).value);
    if (isNaN(value) || value <= 0) {
      alert('Enter a valid quantity to add.');
      hideLoader();
      return;
    }
    try {
      await fetch(`${apiUrl}/products/${product._id}/quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: value }),
      });
      await fetchProducts();
      await fetchTransactions();
    } catch (error) {
      alert('Failed to add quantity.');
    } finally {
      hideLoader();
    }
  };
  document.getElementById(`cancel-inline-add-quantity-${product._id}`).onclick = () => {
    renderProducts();
  };
}

function renderPurchase() {
  sections.purchase.innerHTML = `
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Purchase Product</h2>
    <form id="purchase-form" class="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label for="purchase-product" class="block text-sm font-medium text-gray-700">Select Product</label>
        <select id="purchase-product" required class="w-full p-3 border rounded-lg mt-1">
          <option value="">Select Product</option>
          ${products.filter(p => p.quantity > 0).map(p => `<option value="${p._id}">${p.name} ($${p.price.toFixed(2)})</option>`).join('')}
        </select>
      </div>
      <div>
        <label for="purchase-quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
        <input type="number" id="purchase-quantity" placeholder="Quantity" required min="1" class="w-full p-3 border rounded-lg mt-1">
      </div>
      <button type="submit" class="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">Purchase</button>
    </form>
  `;
  document.getElementById('purchase-form').onsubmit = processPurchase;
}

function renderTransactions() {
  sections.transactions.innerHTML = `
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Transaction History</h2>
    <form id="filter-form" class="mb-6 flex flex-wrap gap-4 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label for="filter-start" class="block text-sm font-medium text-gray-700">Start Date</label>
        <input type="date" id="filter-start" class="p-3 border rounded-lg mt-1">
      </div>
      <div>
        <label for="filter-end" class="block text-sm font-medium text-gray-700">End Date</label>
        <input type="date" id="filter-end" class="p-3 border rounded-lg mt-1">
      </div>
      <div>
        <label for="filter-type" class="block text-sm font-medium text-gray-700">Transaction Type</label>
        <select id="filter-type" class="p-3 border rounded-lg mt-1">
          <option value="">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="update quantity">Update Quantity</option>
          <option value="add">Add</option>
          <option value="edit">Edit</option>
          <option value="delete">Delete</option>
        </select>
      </div>
      <button type="button" id="filter-btn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-6">Filter</button>
    </form>
    <ul id="transaction-list" class="space-y-3"></ul>
  `;
  document.getElementById('filter-btn').onclick = filterTransactions;
  renderTransactionList(transactions);
}

function renderTransactionList(list, filterType = '', filterDate = '') {
  const ul = document.getElementById('transaction-list');
  if (!ul) return;
  ul.innerHTML = '';
  if (list.length === 0) {
    let msg = 'There is no transaction made';
    if (filterType && filterDate) {
      msg = `There is no ${filterType} made on ${filterDate}`;
    } else if (filterType) {
      msg = `There is no ${filterType} made`;
    } else if (filterDate) {
      msg = `There is no transaction made on ${filterDate}`;
    }
    const li = document.createElement('li');
    li.className = 'p-4 bg-white rounded-lg shadow text-center text-gray-500';
    li.textContent = msg;
    ul.appendChild(li);
    return;
  }
  list.forEach(t => {
    const li = document.createElement('li');
    li.className = 'p-4 bg-white rounded-lg shadow';
    let text = '';
    if (t.type === 'purchase') {
      text = `PURCHASE - ${t.productName} - Qty: ${t.quantity} - $${t.totalPrice} - ${new Date(t.timestamp).toLocaleString()}`;
    } else if (t.type === 'update quantity') {
      text = `UPDATE QUANTITY - ${t.productName} - Qty Added: ${t.quantity} - New Total: ${t.quantityAvailable ?? 'N/A'} - ${new Date(t.timestamp).toLocaleString()}`;
    } else if (t.type === 'add') {
      text = `ADD - ${t.productName} - Qty Added: ${t.quantity} - ${new Date(t.timestamp).toLocaleString()}`;
    } else if (t.type === 'edit') {
      if (typeof t.oldPrice !== 'undefined' && typeof t.newPrice !== 'undefined') {
        text = `EDIT PRICE - ${t.productName} - Old Price: $${t.oldPrice} - New Price: $${t.newPrice} - ${new Date(t.timestamp).toLocaleString()}`;
      } else if (typeof t.quantity !== 'undefined') {
        text = `EDIT QUANTITY - ${t.productName} - Qty Changed: ${t.quantity} - ${new Date(t.timestamp).toLocaleString()}`;
      } else {
        text = `EDIT - ${t.productName} - ${new Date(t.timestamp).toLocaleString()}`;
      }
    } else if (t.type === 'delete') {
      text = `DELETE - ${t.productName} - Qty at Deletion: ${t.quantity} - ${new Date(t.timestamp).toLocaleString()}`;
    }
    li.textContent = text;
    ul.appendChild(li);
  });
}

function renderSummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todaySales = transactions.filter(t => t.type === 'purchase' && new Date(t.timestamp) >= today && new Date(t.timestamp) < tomorrow);
  const totalSales = todaySales.reduce((sum, t) => sum + (t.totalPrice || 0), 0);
  sections.summary.innerHTML = `
    <h2 class="text-2xl font-semibold mb-6 text-gray-800">Today's Sales Summary</h2>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <p class="text-gray-600">Total Sales: <span class="font-semibold text-blue-600">$${totalSales.toFixed(2)}</span></p>
      <p class="text-gray-600 mt-2">Total Transactions: <span class="font-semibold text-blue-600">${todaySales.length}</span></p>
    </div>
  `;
}

// --- API Functions ---
async function fetchProducts() {
  showLoader();
  try {
    const res = await fetch(`${apiUrl}/products`);
    products = await res.json();
    renderProducts();
    renderPurchase();
  } catch (error) {
    alert('Failed to fetch products.');
  } finally {
    hideLoader();
  }
}

async function fetchTransactions() {
  showLoader();
  try {
    const res = await fetch(`${apiUrl}/transactions`);
    transactions = await res.json();
    renderTransactions();
    renderSummary();
  } catch (error) {
    alert('Failed to fetch transactions.');
  } finally {
    hideLoader();
  }
}

// --- Product CRUD ---
async function addProduct(e) {
  e.preventDefault();
  showLoader();
  const name = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  const quantity = parseInt(document.getElementById('product-quantity').value);
  if (!name || isNaN(price) || isNaN(quantity)) {
    alert('Fill all fields correctly.');
    hideLoader();
    return;
  }
  try {
    const res = await fetch(`${apiUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, quantity }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || 'Failed to add product.');
      hideLoader();
      return;
    }
    editingProductId = null;
    editingMode = null;
    await fetchProducts();
  } catch (error) {
    alert('Failed to add product.');
  } finally {
    hideLoader();
  }
}

async function updateProduct(e) {
  e.preventDefault();
  showLoader();
  const price = parseFloat(document.getElementById('product-price').value);
  const quantity = parseInt(document.getElementById('product-quantity').value);
  try {
    if (editingMode === 'price') {
      if (isNaN(price)) {
        alert('Enter a valid price.');
        hideLoader();
        return;
      }
      await fetch(`${apiUrl}/products/${editingProductId}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });
    } else if (editingMode === 'quantity') {
      if (isNaN(quantity)) {
        alert('Enter a valid quantity.');
        hideLoader();
        return;
      }
      const prod = products.find(p => p._id === editingProductId);
      const diff = quantity - prod.quantity;
      await fetch(`${apiUrl}/products/${editingProductId}/quantity`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: diff }),
      });
    }
    editingProductId = null;
    editingMode = null;
    await fetchProducts();
  } catch (error) {
    alert('Failed to update product.');
  } finally {
    hideLoader();
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  showLoader();
  try {
    await fetch(`${apiUrl}/products/${id}/request`, { method: 'DELETE' });
    await fetchProducts();
  } catch (error) {
    alert('Failed to delete product.');
  } finally {
    hideLoader();
  }
}

// --- Purchase ---
async function processPurchase(e) {
  e.preventDefault();
  showLoader();
  const productId = document.getElementById('purchase-product').value;
  const quantity = parseInt(document.getElementById('purchase-quantity').value);
  if (!productId || isNaN(quantity) || quantity < 1) {
    alert('Select a product and enter a valid quantity.');
    hideLoader();
    return;
  }
  try {
    const res = await fetch(`${apiUrl}/transactions/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || 'Failed to process purchase.');
      hideLoader();
      return;
    }
    alert('Purchase successful!');
    await fetchProducts();
    await fetchTransactions();
  } catch (error) {
    alert('Failed to process purchase.');
  } finally {
    hideLoader();
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
    filtered = filtered.filter(t => {
      const d = new Date(t.timestamp);
      return d >= startDate && d <= endDate;
    });
    filterDate = `${start} to ${end}`;
  }
  if (type) {
    filtered = filtered.filter(t => t.type === type);
    filterType = type;
  }
  renderTransactionList(filtered, filterType, filterDate);
}

// --- Navigation Events ---
document.getElementById('nav-products').onclick = () => {
  showSection('products');
  renderProducts();
};
document.getElementById('nav-add-product').onclick = () => {
  showSection('addProduct');
  renderAddProduct();
};
document.getElementById('nav-purchase').onclick = () => {
  showSection('purchase');
  renderPurchase();
};
document.getElementById('nav-transactions').onclick = () => {
  showSection('transactions');
  renderTransactions();
};
document.getElementById('nav-summary').onclick = () => {
  showSection('summary');
  renderSummary();
};

// --- Initial Load ---
window.addEventListener('DOMContentLoaded', async () => {
  initSidebar();
  showSection('products');
  await fetchProducts();
  await fetchTransactions();
});