const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set JSON headers by default
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Request failed on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Authentication
  login: (username, password) => 
    request('/auth/login', {
      method: 'POST',
      body: { username, password }
    }),

  // Products
  getProducts: () => request('/products'),
  createProduct: (product) => 
    request('/products', {
      method: 'POST',
      body: product
    }),
  updateProduct: (id, product) => 
    request(`/products/${id}`, {
      method: 'PUT',
      body: product
    }),
  deleteProduct: (id) => 
    request(`/products/${id}`, {
      method: 'DELETE'
    }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (name) => 
    request('/categories', {
      method: 'POST',
      body: { name }
    }),
  updateCategory: (id, name) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: { name }
    }),
  deleteCategory: (id) => 
    request(`/categories/${id}`, {
      method: 'DELETE'
    }),

  // Units
  getUnits: () => request('/units'),
  createUnit: (unit) =>
    request('/units', {
      method: 'POST',
      body: unit
    }),
  updateUnit: (id, unit) =>
    request(`/units/${id}`, {
      method: 'PUT',
      body: unit
    }),
  deleteUnit: (id) =>
    request(`/units/${id}`, {
      method: 'DELETE'
    }),

  // Tables
  getTables: () => request('/tables'),
  createTable: (name) => 
    request('/tables', {
      method: 'POST',
      body: { name }
    }),
  updateTableStatus: (id, status) => 
    request(`/tables/${id}/status`, {
      method: 'PUT',
      body: { status }
    }),
  deleteTable: (id) => 
    request(`/tables/${id}`, {
      method: 'DELETE'
    }),

  // Orders
  getOrders: () => request('/orders'),
  getOrderDetails: (id) => request(`/orders/${id}`),
  createOrder: (order, items) => 
    request('/orders', {
      method: 'POST',
      body: { order, items }
    }),
  updateOrderStatus: (id, status) => 
    request(`/orders/${id}/status`, {
      method: 'PUT',
      body: { status }
    }),
  deleteOrder: (id) => 
    request(`/orders/${id}`, {
      method: 'DELETE'
    }),
  deleteBulkOrders: (ids) =>
    request('/orders/bulk-delete', {
      method: 'POST',
      body: { ids }
    }),

  // Order Items
  getOrderItems: () => request('/order-items'),

  // Inventory
  getInventoryLogs: () => request('/inventory/logs'),
  createInventoryLog: (log) => 
    request('/inventory/logs', {
      method: 'POST',
      body: log
    }),
  quickAdjustStock: (payload) =>
    request('/inventory/quick-adjust', {
      method: 'POST',
      body: payload
    }),

  // Staff Users
  getUsers: () => request('/users'),
  createUser: (user) => 
    request('/users', {
      method: 'POST',
      body: user
    }),
  updateUser: (id, user) => 
    request(`/users/${id}`, {
      method: 'PUT',
      body: user
    }),
  deleteUser: (id) => 
    request(`/users/${id}`, {
      method: 'DELETE'
    }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (settings) => 
    request('/settings', {
      method: 'PUT',
      body: settings
    }),
  validateBackup: (fileData) =>
    request('/settings/validate-backup', {
      method: 'POST',
      body: { fileData }
    }),
  restoreDatabase: (fileData) =>
    request('/settings/restore', {
      method: 'POST',
      body: { fileData }
    }),

  // Reports
  getTopProducts: () => request('/reports/top-products'),

  // Login Logs
  getLoginHistory: () => request('/admin/login-history'),

  // Refunds / Returns
  getRefunds: () => request('/refunds'),
  createRefund: (refund) => 
    request('/refunds', {
      method: 'POST',
      body: refund
    }),
  deleteRefund: (id) => 
    request(`/refunds/${id}`, {
      method: 'DELETE'
    }),

  // Inventory Reset & Ledger
  setOpeningStock: (payload) =>
    request('/inventory/opening-stock', {
      method: 'POST',
      body: payload
    }),
  addStock: (payload) =>
    request('/inventory/add-stock', {
      method: 'POST',
      body: payload
    }),
  recordWastage: (payload) =>
    request('/inventory/waste', {
      method: 'POST',
      body: payload
    }),
  adjustStock: (payload) =>
    request('/inventory/adjust', {
      method: 'POST',
      body: payload
    }),
  reconcileInventory: (payload = {}) =>
    request('/inventory/reconcile', {
      method: 'POST',
      body: payload
    }),
  resetInventoryStock: (payload) =>
    request('/inventory/reset', {
      method: 'POST',
      body: payload
    }),
  restoreInventorySnapshot: (snapshotFile) =>
    request('/inventory/restore-snapshot', {
      method: 'POST',
      body: { snapshotFile }
    }),

  // Legacy Migration & Portable Menu Transfer
  detectLegacyPOS: () => request('/migration/detect'),
  importLegacyPOS: (payload) =>
    request('/migration/import', {
      method: 'POST',
      body: payload
    }),
  exportPortableMenu: () => request('/migration/export-menu'),
  importPortableMenu: (menuPackage, mode = 'menu_only') =>
    request('/migration/import-menu', {
      method: 'POST',
      body: { menuPackage, mode }
    })
};
