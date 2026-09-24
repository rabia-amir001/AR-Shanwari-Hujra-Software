const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow local requests (no origin, e.g. packaged Electron app loaded via file://)
    // or requests from the dev server
    if (!origin || origin === 'null' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  }
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Health Check / DB Type Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    db_type: db.getType(),
    timestamp: new Date().toISOString()
  });
});

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await db.authenticateUser(username, password);
    if (user) {
      await db.logUserLogin(user).catch(err => console.error('Error logging user login:', err));
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USERS MANAGEMENT (Admin Only) ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newUser = await db.createUser({ name, username, password, role });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, password, role } = req.body;
  try {
    const updated = await db.updateUser(id, { name, username, password, role });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteUser(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN LOGIN HISTORY AUDIT ---
app.get('/api/admin/login-history', async (req, res) => {
  try {
    const logs = await db.getLoginHistory();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIES MANAGEMENT ---
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await db.getCategories();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const newCat = await db.createCategory(name);
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const updated = await db.updateCategory(id, name);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteCategory(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- UNITS MANAGEMENT ---
app.get('/api/units', async (req, res) => {
  try {
    const units = await db.getUnits();
    res.json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/units', async (req, res) => {
  const { name, is_default } = req.body;
  if (!name) return res.status(400).json({ error: 'Unit name is required' });

  try {
    const newUnit = await db.createUnit({ name, is_default });
    res.status(201).json(newUnit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/units/:id', async (req, res) => {
  const { id } = req.params;
  const { name, is_default } = req.body;
  if (!name) return res.status(400).json({ error: 'Unit name is required' });

  try {
    const updated = await db.updateUnit(id, { name, is_default });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/units/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteUnit(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTS MANAGEMENT ---
app.get('/api/products', async (req, res) => {
  try {
    const prods = await db.getProducts();
    res.json(prods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price, category, stock, unit, available, image, urdu, cost_price, low_stock_threshold } = req.body;
  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  try {
    const newProd = await db.createProduct({
      name,
      price: parseFloat(price),
      category,
      stock: parseFloat(stock || 0),
      unit: unit || 'Piece',
      available: available !== undefined ? available : 1,
      image: image || '',
      urdu: urdu || '',
      cost_price: parseFloat(cost_price || 0),
      low_stock_threshold: parseFloat(low_stock_threshold !== undefined ? low_stock_threshold : 10)
    });
    res.status(201).json(newProd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, category, stock, unit, available, image, urdu, cost_price, low_stock_threshold } = req.body;
  try {
    const updated = await db.updateProduct(id, {
      name,
      price: parseFloat(price),
      category,
      stock: parseFloat(stock),
      unit,
      available: parseInt(available),
      image,
      urdu,
      cost_price: parseFloat(cost_price || 0),
      low_stock_threshold: parseFloat(low_stock_threshold !== undefined ? low_stock_threshold : 10)
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteProduct(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TABLES MANAGEMENT ---
app.get('/api/tables', async (req, res) => {
  try {
    const tbls = await db.getTables();
    res.json(tbls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tables', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Table name is required' });

  try {
    const newTbl = await db.createTable(name);
    res.status(201).json(newTbl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tables/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    await db.updateTableStatus(id, status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tables/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteTable(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS & TRANSACTIONS ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const details = await db.getOrderDetails(id);
    res.json(details);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { order, items } = req.body;
  if (!order || !items || !items.length) {
    return res.status(400).json({ error: 'Order details and items are required' });
  }

  try {
    const savedOrder = await db.createOrder(order, items);
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    await db.updateOrderStatus(id, status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteOrder(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk delete orders
app.post('/api/orders/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array is required' });
  }
  try {
    for (const id of ids) {
      await db.deleteOrder(id);
    }
    res.json({ success: true, deleted: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDER ITEMS & SALES AGGREGATION ---
app.get('/api/order-items', async (req, res) => {
  try {
    const items = await db.getOrderItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INVENTORY LOGS ---
app.get('/api/inventory/logs', async (req, res) => {
  try {
    const logs = await db.getInventoryLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/logs', async (req, res) => {
  const { product_name, type, quantity, note, user, reason, order_id } = req.body;
  if (!product_name || !type || quantity === undefined) {
    return res.status(400).json({ error: 'Product name, type, and quantity are required' });
  }

  try {
    const newLog = await db.logInventoryChange({
      product_name,
      type,
      quantity: parseFloat(quantity),
      note: note || '',
      user: user || 'Admin',
      reason: reason || '',
      order_id: order_id || null
    });
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/quick-adjust', async (req, res) => {
  const { product_id, product_name, type, quantity, note, user, reason, cost_price, low_stock_threshold } = req.body;
  if (!product_name || !type || quantity === undefined) {
    return res.status(400).json({ error: 'Product name, type, and quantity are required' });
  }

  try {
    // If product threshold or cost price updated, update product
    if (product_id && (cost_price !== undefined || low_stock_threshold !== undefined)) {
      const prods = await db.getProducts();
      const p = prods.find(item => item.id === parseInt(product_id));
      if (p) {
        await db.updateProduct(p.id, {
          ...p,
          cost_price: cost_price !== undefined ? parseFloat(cost_price) : (p.cost_price || 0),
          low_stock_threshold: low_stock_threshold !== undefined ? parseFloat(low_stock_threshold) : (p.low_stock_threshold || 10)
        });
      }
    }

    const newLog = await db.logInventoryChange({
      product_name,
      type,
      quantity: parseFloat(quantity),
      note: note || '',
      user: user || 'Admin',
      reason: reason || ''
    });
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS MANAGEMENT ---
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settings = await db.updateSettings(req.body);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS BACKUP & RESTORE ---
app.get('/api/settings/backup', (req, res) => {
  try {
    const dbType = db.getType();
    const filePath = dbType === 'json' ? db.getJsonDbPath() : db.getDbPath();
    if (require('fs').existsSync(filePath)) {
      res.download(filePath, dbType === 'json' ? 'ar_shinwari_backup.json' : 'ar_shinwari_backup.db');
    } else {
      res.status(404).json({ error: 'Database file not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/validate-backup', async (req, res) => {
  const { fileData } = req.body;
  if (!fileData) {
    return res.status(400).json({ error: 'No file data received' });
  }

  try {
    const base64Data = fileData.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const result = await db.validateBackupBuffer(buffer);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/settings/restore', async (req, res) => {
  const { fileData } = req.body;
  if (!fileData) {
    return res.status(400).json({ error: 'No file data received' });
  }

  try {
    const base64Data = fileData.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    await db.restoreDatabase(buffer);
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REPORTS TOP PRODUCTS ---
app.get('/api/reports/top-products', async (req, res) => {
  try {
    const list = await db.getTopProducts();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REFUNDS / RETURNS MANAGEMENT ---
app.get('/api/refunds', async (req, res) => {
  try {
    const list = await db.getRefunds();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/refunds', async (req, res) => {
  const { order_id, type, amount, reason } = req.body;
  if (!order_id || !type || amount === undefined) {
    return res.status(400).json({ error: 'Order ID, type, and amount are required' });
  }
  try {
    const newRefund = await db.createRefund({
      order_id: parseInt(order_id),
      type,
      amount: parseFloat(amount),
      reason: reason || ''
    });
    res.status(201).json(newRefund);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- LEGACY MENU MIGRATION & PORTABLE BACKUP ---
app.get('/api/migration/detect', async (req, res) => {
  try {
    const result = await db.detectLegacyData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/migration/import', async (req, res) => {
  try {
    const result = await db.migrateLegacyData(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/migration/export-menu', async (req, res) => {
  try {
    const menuPackage = await db.exportPortableMenu();
    const fileName = `AR_Shinwari_Menu_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(JSON.stringify(menuPackage, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/migration/import-menu', async (req, res) => {
  const { menuPackage, mode } = req.body;
  try {
    const result = await db.importPortableMenu(menuPackage, mode);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INVENTORY RESET TO ZERO ---
app.post('/api/inventory/reset', async (req, res) => {
  try {
    const result = await db.resetInventoryStock(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/restore-snapshot', async (req, res) => {
  const { snapshotFile } = req.body;
  if (!snapshotFile) {
    return res.status(400).json({ error: 'Snapshot file path required.' });
  }
  try {
    const result = await db.restoreInventorySnapshot(snapshotFile);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- INVENTORY LEDGER & RECONCILIATION ---
app.post('/api/inventory/opening-stock', async (req, res) => {
  try {
    const result = await db.setOpeningStock(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/add-stock', async (req, res) => {
  try {
    const result = await db.addStock(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/waste', async (req, res) => {
  try {
    const result = await db.recordWastage(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/adjust', async (req, res) => {
  try {
    const result = await db.adjustStock(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/reconcile', async (req, res) => {
  try {
    const result = await db.reconcileInventory(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`AR Shinwari POS backend listening on port ${PORT} (bound to 127.0.0.1)`);
}).on('error', (err) => {
  console.error('Backend server failed to start or port conflict:', err);
});

// Global exception and rejection handlers to prevent backend server crash
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception in backend server:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Promise Rejection in backend server at:', promise, 'reason:', reason);
});

// Handle graceful shutdown inside Electron
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Backend server closed.');
  });
});

