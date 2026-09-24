const fs = require('fs');
const path = require('path');

let dbType = 'sqlite';
let dbInstance = null;

// Determine writable user data directory
let userDataPath = __dirname;
try {
  const { app } = require('electron');
  if (app) {
    if (app.isPackaged) {
      // In production/packaged mode, store next to the executable to remain portable and persistent
      userDataPath = path.dirname(app.getPath('exe'));
    } else {
      // In development mode, use the project workspace directory
      userDataPath = __dirname;
    }
  }
} catch (e) {
  userDataPath = __dirname;
}

const dbPath = path.join(userDataPath, 'ar_shinwari.db');
const jsonDbPath = path.join(userDataPath, 'ar_shinwari_db.json');

// Auto-migration: if the database file exists in old AppData folder but not in target path, copy it over!
try {
  const { app } = require('electron');
  if (app) {
    const oldAppDataDir = app.getPath('userData');
    const oldDbPath = path.join(oldAppDataDir, 'ar_shinwari.db');
    const oldJsonDbPath = path.join(oldAppDataDir, 'ar_shinwari_db.json');

    if (fs.existsSync(oldDbPath) && !fs.existsSync(dbPath)) {
      console.log(`Migrating SQLite DB from ${oldDbPath} to ${dbPath}`);
      fs.copyFileSync(oldDbPath, dbPath);
    }
    if (fs.existsSync(oldJsonDbPath) && !fs.existsSync(jsonDbPath)) {
      console.log(`Migrating JSON DB from ${oldJsonDbPath} to ${jsonDbPath}`);
      fs.copyFileSync(oldJsonDbPath, jsonDbPath);
    }
  }
} catch (err) {
  console.error('Database migration check failed:', err);
}

// Default Seed Data
const defaultCategories = ['Barbeque', 'Sajji', 'Mutton Karahi', 'Chicken Karahi', 'Beef Karahi', 'BBQ Deals', 'Sides & Dal', 'Drinks'];

const defaultUnits = [
  { id: 1, name: 'Piece', is_default: 1 },
  { id: 2, name: 'Plate', is_default: 0 },
  { id: 3, name: 'KG', is_default: 0 },
  { id: 4, name: 'Gram', is_default: 0 },
  { id: 5, name: 'Litre', is_default: 0 },
  { id: 6, name: 'Bottle', is_default: 0 },
  { id: 7, name: 'Pack', is_default: 0 },
  { id: 8, name: 'Half', is_default: 0 },
  { id: 9, name: 'Full', is_default: 0 },
  { id: 10, name: 'Deal', is_default: 0 }
];

const defaultUsers = [
  { id: 1, name: 'Owner / Admin', username: 'admin', password: '123', role: 'Admin' },
  { id: 2, name: 'Cashier Ali', username: 'cashier', password: '123', role: 'Cashier' },
  { id: 3, name: 'Manager Khan', username: 'manager', password: '123', role: 'Manager' }
];

const defaultTables = [
  { id: 1, name: 'Table 1', status: 'Available' },
  { id: 2, name: 'Table 2', status: 'Available' },
  { id: 3, name: 'Table 3', status: 'Available' },
  { id: 4, name: 'Table 4', status: 'Available' },
  { id: 5, name: 'Table 5', status: 'Available' },
  { id: 6, name: 'Table 6', status: 'Available' },
  { id: 7, name: 'Table 7', status: 'Available' },
  { id: 8, name: 'Table 8', status: 'Available' }
];

const defaultProducts = [
  // BBQ
  { name: 'Chicken Kabab', price: 300, category: 'Barbeque', stock: 0, unit: 'Piece', available: 1, image: '/images/bbq_grill.png', urdu: 'چکن کباب' },
  { name: 'Beef Kabab', price: 300, category: 'Barbeque', stock: 0, unit: 'Piece', available: 1, image: '/images/bbq_grill.png', urdu: 'بیف کباب' },
  { name: 'Hara Bhara Kabab', price: 320, category: 'Barbeque', stock: 0, unit: 'Piece', available: 1, image: '/images/bbq_grill.png', urdu: 'ہرا بھرا کباب' },
  { name: 'Gola Kabab', price: 350, category: 'Barbeque', stock: 0, unit: 'Piece', available: 1, image: '/images/bbq_grill.png', urdu: 'گولا کباب' },
  { name: 'Reshmi Kabab', price: 350, category: 'Barbeque', stock: 0, unit: 'Piece', available: 1, image: '/images/bbq_grill.png', urdu: 'ریشمی کباب' },
  { name: 'Lebanese Kabab', price: 450, category: 'Barbeque', stock: 0, unit: 'Piece', available: 1, image: '/images/bbq_grill.png', urdu: 'لبنانی کباب' },
  { name: 'Tikka Boti (7Pc)', price: 450, category: 'Barbeque', stock: 0, unit: 'Plate', available: 1, image: '/images/bbq_grill.png', urdu: 'تکہ بوٹی' },
  { name: 'Wings (7Pc)', price: 450, category: 'Barbeque', stock: 0, unit: 'Plate', available: 1, image: '/images/bbq_grill.png', urdu: 'ونگز' },
  { name: 'Leg Piece', price: 500, category: 'Barbeque', stock: 0, unit: 'Piece', available: 1, image: '/images/bbq_grill.png', urdu: 'لیگ پیس' },
  { name: 'Chest Piece', price: 500, category: 'Barbeque', stock: 0, unit: 'Piece', available: 1, image: '/images/bbq_grill.png', urdu: 'چیسٹ پیس' },
  { name: 'Achari Boti (7Pc)', price: 500, category: 'Barbeque', stock: 0, unit: 'Plate', available: 1, image: '/images/bbq_grill.png', urdu: 'اچاری بوٹی' },
  { name: 'Malai Boti (6Pc)', price: 550, category: 'Barbeque', stock: 0, unit: 'Plate', available: 1, image: '/images/bbq_grill.png', urdu: 'ملائی بوٹی' },
  { name: 'Haryali Boti (6Pc)', price: 600, category: 'Barbeque', stock: 0, unit: 'Plate', available: 1, image: '/images/bbq_grill.png', urdu: 'ہریالی بوٹی' },
  { name: 'Shish Touk Boti (6Pc)', price: 600, category: 'Barbeque', stock: 0, unit: 'Plate', available: 1, image: '/images/bbq_grill.png', urdu: 'شیش طاووق بوٹی' },

  // Sajji
  { name: 'Sajji Half', price: 450, category: 'Sajji', stock: 0, unit: 'Piece', available: 1, image: '/images/sajji_rice.png', urdu: 'سجّی ہاف' },
  { name: 'Sajji Full', price: 750, category: 'Sajji', stock: 0, unit: 'Piece', available: 1, image: '/images/sajji_rice.png', urdu: 'سجّی فل' },
  { name: 'Sajji Half + Rice', price: 800, category: 'Sajji', stock: 0, unit: 'Plate', available: 1, image: '/images/sajji_rice.png', urdu: 'سجّی ہاف + چاول' },
  { name: 'Sajji Full + Rice', price: 1400, category: 'Sajji', stock: 0, unit: 'Plate', available: 1, image: '/images/sajji_rice.png', urdu: 'سجّی فل + چاول' },
  { name: 'Extra Rice Single', price: 200, category: 'Sajji', stock: 0, unit: 'Plate', available: 1, image: '/images/sajji_rice.png', urdu: 'اضافی چاول سنگل' },
  { name: 'Extra Rice Double', price: 250, category: 'Sajji', stock: 0, unit: 'Plate', available: 1, image: '/images/sajji_rice.png', urdu: 'اضافی چاول ڈبل' },

  // Mutton Karahi
  { name: 'Shinwari Lahori Mutton Karahi Half', price: 2600, category: 'Mutton Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'شنواری لاہوری مٹن کڑاہی ہاف' },
  { name: 'Shinwari Lahori Mutton Karahi Full', price: 4400, category: 'Mutton Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'شنواری لاہوری مٹن کڑاہی فل' },
  { name: 'Shinwari Mutton Karahi Half', price: 2800, category: 'Mutton Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'شنواری مٹن کڑاہی ہاف' },
  { name: 'Shinwari Mutton Karahi Full', price: 4800, category: 'Mutton Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'شنواری مٹن کڑاہی فل' },
  { name: 'Mutton Charsi Tikka Half', price: 2600, category: 'Mutton Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'مٹن چرسی تکہ ہاف' },
  { name: 'Mutton Charsi Tikka Full', price: 4400, category: 'Mutton Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'مٹن چرسی تکہ فل' },

  // Chicken Karahi
  { name: 'Chicken White Boneless Half', price: 1400, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن وائٹ بون لیس ہاف' },
  { name: 'Chicken White Boneless Full', price: 2400, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن وائٹ بون لیس فل' },
  { name: 'Chicken Lahori Karahi Half', price: 1100, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن لاہوری کڑاہی ہاف' },
  { name: 'Chicken Lahori Karahi Full', price: 2000, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن لاہوری کڑاہی فل' },
  { name: 'Chicken Kabab Karahi Half', price: 1600, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن کباب کڑاہی ہاف' },
  { name: 'Chicken Kabab Karahi Full', price: 2800, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن کباب کڑاہی فل' },
  { name: 'Chicken Tikka Charsi Karahi Half', price: 1500, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن تکہ چرسی کڑاہی ہاف' },
  { name: 'Chicken Tikka Charsi Karahi Full', price: 2600, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن تکہ چرسی کڑاہی فل' },
  { name: 'Chicken Malai Boti Charsi Half', price: 1600, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن ملائی بوٹی چرسی ہاف' },
  { name: 'Chicken Malai Boti Charsi Full', price: 3000, category: 'Chicken Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'چکن ملائی بوٹی چرسی فل' },

  // Beef Karahi
  { name: 'Beef White Boneless Half', price: 1600, category: 'Beef Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'بیف وائٹ بون لیس ہاف' },
  { name: 'Beef White Boneless Full', price: 3000, category: 'Beef Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'بیف وائٹ بون لیس فل' },
  { name: 'Beef Boneless Karahi Half', price: 1400, category: 'Beef Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'بیف بون لیس کڑاہی ہاف' },
  { name: 'Beef Boneless Karahi Full', price: 2600, category: 'Beef Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'بیف بون لیس کڑاہی فل' },
  { name: 'Beef Kabab Karahi Half', price: 1500, category: 'Beef Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'بیف کباب کڑاہی ہاف' },
  { name: 'Beef Kabab Karahi Full', price: 2800, category: 'Beef Karahi', stock: 0, unit: 'KG', available: 1, image: '/images/shinwari_karahi.png', urdu: 'بیف کباب کڑاہی فل' },

  // Sides & Dal
  { name: 'Daal Chana Half', price: 250, category: 'Sides & Dal', stock: 0, unit: 'Plate', available: 1, image: '/images/shinwari_karahi.png', urdu: 'دال چنا ہاف' },
  { name: 'Daal Chana Full', price: 350, category: 'Sides & Dal', stock: 0, unit: 'Plate', available: 1, image: '/images/shinwari_karahi.png', urdu: 'دال چنا فل' },
  { name: 'Mix Sabzi Half', price: 250, category: 'Sides & Dal', stock: 0, unit: 'Plate', available: 1, image: '/images/shinwari_karahi.png', urdu: 'مکس سبزی ہاف' },
  { name: 'Mix Sabzi Full', price: 350, category: 'Sides & Dal', stock: 0, unit: 'Plate', available: 1, image: '/images/shinwari_karahi.png', urdu: 'مکس سبزی فل' },
  { name: 'Daal Kabab Masala', price: 850, category: 'Sides & Dal', stock: 0, unit: 'Plate', available: 1, image: '/images/shinwari_karahi.png', urdu: 'دال کباب مصالحہ' },
  { name: 'Raita', price: 100, category: 'Sides & Dal', stock: 0, unit: 'Piece', available: 1, image: '/images/shinwari_karahi.png', urdu: 'رائتہ' },
  { name: 'Green Salad', price: 150, category: 'Sides & Dal', stock: 0, unit: 'Piece', available: 1, image: '/images/shinwari_karahi.png', urdu: 'گرین سلاد' },
  { name: 'Sada Roti (Per Head)', price: 100, category: 'Sides & Dal', stock: 0, unit: 'Piece', available: 1, image: '/images/shinwari_karahi.png', urdu: 'سادہ روٹی' },
  { name: 'Disposable', price: 10, category: 'Sides & Dal', stock: 0, unit: 'Piece', available: 1, image: '/images/shinwari_karahi.png', urdu: 'ڈسپوزایبل' },

  // Drinks
  { name: 'Soft Drink 250ml', price: 100, category: 'Drinks', stock: 0, unit: 'Piece', available: 1, image: '/images/cold_drink.png', urdu: 'سافٹ ڈرنک' },
  { name: 'Soft Drink 1.5 Litre', price: 250, category: 'Drinks', stock: 0, unit: 'Piece', available: 1, image: '/images/cold_drink.png', urdu: 'سافٹ ڈرنک ۱.۵ لیٹر' },

  // Deals
  { name: 'BBQ Deal #1 (1 Person)', price: 650, category: 'BBQ Deals', stock: 0, unit: 'Deal', available: 1, image: '/images/bbq_grill.png', urdu: 'ڈیل نمبر ۱' },
  { name: 'BBQ Deal #2 (1 Person)', price: 700, category: 'BBQ Deals', stock: 0, unit: 'Deal', available: 1, image: '/images/bbq_grill.png', urdu: 'ڈیل نمبر ۲' },
  { name: 'BBQ Deal #3 (1 Person)', price: 800, category: 'BBQ Deals', stock: 0, unit: 'Deal', available: 1, image: '/images/bbq_grill.png', urdu: 'ڈیل نمبر ۳' },
  { name: 'BBQ Deal #4 (1 Person)', price: 900, category: 'BBQ Deals', stock: 0, unit: 'Deal', available: 1, image: '/images/bbq_grill.png', urdu: 'ڈیل نمبر ۴' },
  { name: 'BBQ Deal #5 (2 Persons)', price: 2400, category: 'BBQ Deals', stock: 0, unit: 'Deal', available: 1, image: '/images/bbq_grill.png', urdu: 'ڈیل نمبر ۵' },
  { name: 'BBQ Deal #6 (2 Persons)', price: 2100, category: 'BBQ Deals', stock: 0, unit: 'Deal', available: 1, image: '/images/bbq_grill.png', urdu: 'ڈیل نمبر ۶' },
  { name: 'BBQ Deal #7 (3 Persons)', price: 3200, category: 'BBQ Deals', stock: 0, unit: 'Deal', available: 1, image: '/images/bbq_grill.png', urdu: 'ڈیل نمبر ۷' }
];

// Initialise Database JSON Fallback Driver
class JsonDbDriver {
  constructor() {
    this.data = {
      users: [],
      categories: [],
      units: [],
      products: [],
      tables: [],
      orders: [],
      order_items: [],
      inventory_logs: [],
      login_history: [],
      refunds: [],
      settings: {
        restaurant_name: 'AR Shinwari Hujra',
        address: 'Near Dunya Palace Hotel, Mor Sambrial',
        phone: '0300-0333128',
        delivery_phone: '0304-9665555',
        tax_rate: 0.0,
        service_charges: 0,
        discounts: JSON.stringify([
          { id: 1, name: 'No Discount (0%)', rate: 0.0, type: 'percent', is_default: true, enabled: true },
          { id: 2, name: 'Special Discount (5%)', rate: 5.0, type: 'percent', is_default: false, enabled: true },
          { id: 3, name: '10% Discount', rate: 10.0, type: 'percent', is_default: false, enabled: true },
          { id: 4, name: '15% Discount', rate: 15.0, type: 'percent', is_default: false, enabled: true },
          { id: 5, name: '20% Discount', rate: 20.0, type: 'percent', is_default: false, enabled: true }
        ]),
        taxes: JSON.stringify([
          { id: 1, name: 'No Tax (0%)', rate: 0.0, is_default: true, enabled: true },
          { id: 2, name: 'Punjab GST Dining (16%)', rate: 16.0, is_default: false, enabled: true },
          { id: 3, name: 'Punjab GST Card (5%)', rate: 5.0, is_default: false, enabled: true },
          { id: 4, name: 'KPK GST Dining (15%)', rate: 15.0, is_default: false, enabled: true },
          { id: 5, name: 'Sindh GST Dining (13%)', rate: 13.0, is_default: false, enabled: true }
        ]),
        payment_qr_code: '',
        paper_width: '80mm',
        custom_width: '80',
        header_font_size: '16',
        body_font_size: '12',
        footer_font_size: '10',
        line_spacing: '1.2',
        item_spacing: '4',
        top_margin: '0',
        bottom_margin: '5',
        left_margin: '0',
        right_margin: '0',
        padding_left_right: '3',
        logo_width: '100',
        logo_height: '50',
        qr_code_width: '120',
        qr_code_height: '120',
        char_spacing: '0',
        auto_scaling: 'true',
        print_density: 'Medium'
      }
    };
    this.load();
  }

  load() {
    if (fs.existsSync(jsonDbPath)) {
      try {
        const fileContent = fs.readFileSync(jsonDbPath, 'utf8');
        this.data = JSON.parse(fileContent);
        if (!this.data.refunds) this.data.refunds = [];
        if (!this.data.units || this.data.units.length === 0) {
          this.data.units = [...defaultUnits];
        }
      } catch (err) {
        console.error('Error reading JSON DB file, using empty state:', err);
        this.seed();
      }
    } else {
      this.seed();
    }
  }

  save() {
    try {
      fs.writeFileSync(jsonDbPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing to JSON DB file:', err);
    }
  }

  seed() {
    console.log('Seeding JSON DB with default records...');
    this.data.users = [...defaultUsers];
    this.data.categories = defaultCategories.map((c, i) => ({ id: i + 1, name: c }));
    this.data.units = [...defaultUnits];
    this.data.tables = [...defaultTables];
    this.data.products = defaultProducts.map((p, i) => ({ id: i + 1, ...p, stock: 0 }));
    this.data.orders = [];
    this.data.order_items = [];
    this.data.inventory_logs = [];
    this.data.login_history = [];
    this.data.refunds = [];
    this.save();
  }
}


// Check and Initialize SQLite or JSON Fallback
let jsonDb = null;
try {
  const sqlite3 = require('sqlite3').verbose();
  dbInstance = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('SQLite connection error. Falling back to JSON Database.', err);
      setupJsonDb();
    } else {
      console.log('Connected to SQLite Database.');
      // Enforce SQLite Foreign Key constraints
      dbInstance.run(`PRAGMA foreign_keys = ON;`);
      initializeSqliteTables();
    }
  });
} catch (e) {
  console.warn('sqlite3 module not available or compilation failed. Falling back to JSON database.');
  setupJsonDb();
}

function setupJsonDb() {
  dbType = 'json';
  jsonDb = new JsonDbDriver();
}

// Initialize SQLite tables if they do not exist
function initializeSqliteTables() {
  dbInstance.serialize(() => {
    // Enable Write-Ahead Logging (WAL) mode for better concurrency and write performance
    dbInstance.run(`PRAGMA journal_mode=WAL;`);
    // Set busy timeout to 5000ms to allow concurrent write queries to wait instead of locking out
    dbInstance.run(`PRAGMA busy_timeout = 5000;`);

    // Users Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )`);

    // Categories Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )`);

    // Units Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      is_default INTEGER DEFAULT 0
    )`);

    // Products Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      category TEXT,
      stock REAL DEFAULT 0,
      unit TEXT DEFAULT 'Piece',
      available INTEGER DEFAULT 1,
      image TEXT,
      urdu TEXT,
      cost_price REAL DEFAULT 0,
      low_stock_threshold REAL DEFAULT 10
    )`);

    // Tables Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      status TEXT DEFAULT 'Available'
    )`);

    // Orders Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_type TEXT,
      table_id INTEGER NULL,
      customer_name TEXT NULL,
      customer_phone TEXT NULL,
      delivery_address TEXT NULL,
      delivery_charges REAL DEFAULT 0,
      rider_name TEXT NULL,
      items_count INTEGER,
      subtotal REAL,
      tax_rate REAL DEFAULT 0.0,
      tax_amount REAL DEFAULT 0,
      discount_rate REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      service_charges REAL DEFAULT 0,
      total REAL,
      payment_method TEXT,
      payment_details TEXT,
      status TEXT DEFAULT 'Completed',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT
    )`);

    // Order Items Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      product_name TEXT,
      price REAL,
      quantity REAL,
      subtotal REAL
    )`);

    // Inventory Logs Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      type TEXT,
      quantity REAL,
      note TEXT,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      before_stock REAL,
      after_stock REAL,
      order_id INTEGER,
      user TEXT,
      reason TEXT
    )`);

    // Settings Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

    // Login History Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS login_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      username TEXT,
      role TEXT,
      login_time TEXT
    )`);

    // Refunds Table
    dbInstance.run(`CREATE TABLE IF NOT EXISTS refunds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      type TEXT,
      amount REAL,
      reason TEXT,
      date TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Safe Column Migrations
    dbInstance.run(`ALTER TABLE products ADD COLUMN cost_price REAL DEFAULT 0;`, () => {});
    dbInstance.run(`ALTER TABLE products ADD COLUMN low_stock_threshold REAL DEFAULT 10;`, () => {});
    dbInstance.run(`ALTER TABLE inventory_logs ADD COLUMN before_stock REAL;`, () => {});
    dbInstance.run(`ALTER TABLE inventory_logs ADD COLUMN after_stock REAL;`, () => {});
    dbInstance.run(`ALTER TABLE inventory_logs ADD COLUMN order_id INTEGER;`, () => {});
    dbInstance.run(`ALTER TABLE inventory_logs ADD COLUMN user TEXT;`, () => {});
    dbInstance.run(`ALTER TABLE inventory_logs ADD COLUMN reason TEXT;`, () => {});

    // Performance Indexes for fast reporting and queries
    dbInstance.run(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);`, () => {});
    dbInstance.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`, () => {});
    dbInstance.run(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);`, () => {});
    dbInstance.run(`CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);`, () => {});
    dbInstance.run(`CREATE INDEX IF NOT EXISTS idx_inventory_logs_date ON inventory_logs(date);`, () => {});
    dbInstance.run(`CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_name ON inventory_logs(product_name);`, () => {});
    dbInstance.run(`CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);`, () => {});

    // Check if we need to seed
    dbInstance.get(`SELECT count(*) as count FROM users`, (err, row) => {
      if (!err && row.count === 0) {
        seedSqliteData();
      }
    });

    dbInstance.get(`SELECT count(*) as count FROM units`, (err, row) => {
      if (!err && (!row || row.count === 0)) {
        const stmtUnit = dbInstance.prepare(`INSERT OR IGNORE INTO units (name, is_default) VALUES (?, ?)`);
        defaultUnits.forEach(u => stmtUnit.run(u.name, u.is_default));
        stmtUnit.finalize();
      }
    });
  });
}

function seedSqliteData() {
  console.log('Seeding SQLite Database...');
  dbInstance.serialize(() => {
    // Seed Users
    const stmtUser = dbInstance.prepare(`INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)`);
    defaultUsers.forEach(u => stmtUser.run(u.name, u.username, u.password, u.role));
    stmtUser.finalize();

    // Seed Categories
    const stmtCat = dbInstance.prepare(`INSERT INTO categories (name) VALUES (?)`);
    defaultCategories.forEach(c => stmtCat.run(c));
    stmtCat.finalize();

    // Seed Units
    const stmtUnit = dbInstance.prepare(`INSERT OR IGNORE INTO units (name, is_default) VALUES (?, ?)`);
    defaultUnits.forEach(u => stmtUnit.run(u.name, u.is_default));
    stmtUnit.finalize();

    // Seed Tables
    const stmtTab = dbInstance.prepare(`INSERT INTO tables (name, status) VALUES (?, ?)`);
    defaultTables.forEach(t => stmtTab.run(t.name, t.status));
    stmtTab.finalize();

    // Seed Products
    const stmtProd = dbInstance.prepare(`INSERT INTO products (name, price, category, stock, unit, available, image, urdu, cost_price, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    defaultProducts.forEach(p => stmtProd.run(p.name, p.price, p.category, p.stock, p.unit, p.available, p.image, p.urdu, 0, 10));
    stmtProd.finalize();

    // Seed Settings
    const stmtSetting = dbInstance.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`);
    stmtSetting.run('restaurant_name', 'AR Shinwari Hujra');
    stmtSetting.run('address', 'Near Dunya Palace Hotel, Mor Sambrial');
    stmtSetting.run('phone', '0300-0333128');
    stmtSetting.run('delivery_phone', '0304-9665555');
    stmtSetting.run('tax_rate', '0.0');
    stmtSetting.run('service_charges', '0');
    stmtSetting.run('payment_qr_code', '');
    stmtSetting.run('paper_width', '80mm');
    stmtSetting.run('custom_width', '80');
    stmtSetting.run('header_font_size', '16');
    stmtSetting.run('body_font_size', '12');
    stmtSetting.run('footer_font_size', '10');
    stmtSetting.run('line_spacing', '1.2');
    stmtSetting.run('item_spacing', '4');
    stmtSetting.run('top_margin', '0');
    stmtSetting.run('bottom_margin', '5');
    stmtSetting.run('left_margin', '0');
    stmtSetting.run('right_margin', '0');
    stmtSetting.run('padding_left_right', '3');
    stmtSetting.run('logo_width', '100');
    stmtSetting.run('logo_height', '50');
    stmtSetting.run('qr_code_width', '120');
    stmtSetting.run('qr_code_height', '120');
    stmtSetting.run('char_spacing', '0');
    stmtSetting.run('auto_scaling', 'true');
    stmtSetting.run('print_density', 'Medium');
    stmtSetting.run('taxes', JSON.stringify([
      { id: 1, name: 'No Tax (0%)', rate: 0.0, is_default: true, enabled: true },
      { id: 2, name: 'Punjab GST Dining (16%)', rate: 16.0, is_default: false, enabled: true },
      { id: 3, name: 'Punjab GST Card (5%)', rate: 5.0, is_default: false, enabled: true },
      { id: 4, name: 'KPK GST Dining (15%)', rate: 15.0, is_default: false, enabled: true },
      { id: 5, name: 'Sindh GST Dining (13%)', rate: 13.0, is_default: false, enabled: true }
    ]));
    stmtSetting.run('discounts', JSON.stringify([
      { id: 1, name: 'No Discount (0%)', rate: 0.0, type: 'percent', is_default: true, enabled: true },
      { id: 2, name: 'Special Discount (5%)', rate: 5.0, type: 'percent', is_default: false, enabled: true },
      { id: 3, name: '10% Discount', rate: 10.0, type: 'percent', is_default: false, enabled: true },
      { id: 4, name: '15% Discount', rate: 15.0, type: 'percent', is_default: false, enabled: true },
      { id: 5, name: '20% Discount', rate: 20.0, type: 'percent', is_default: false, enabled: true }
    ]));
    stmtSetting.finalize();
    console.log('SQLite Seeding Completed.');
  });
}

// Promisified DB Operations Helper (works with both SQLite and JSON)
const db = {
  getType: () => dbType,
  getDbPath: () => dbPath,
  getJsonDbPath: () => jsonDbPath,

  // --- Users Operations ---
  getUsers: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.users);
      } else {
        dbInstance.all(`SELECT id, name, username, role FROM users`, [], (err, rows) => {
          if (err) reject(err); else resolve(rows);
        });
      }
    });
  },

  createUser: (user) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const id = jsonDb.data.users.length > 0 ? Math.max(...jsonDb.data.users.map(u => u.id)) + 1 : 1;
        const newUser = { id, ...user };
        jsonDb.data.users.push(newUser);
        jsonDb.save();
        resolve(newUser);
      } else {
        dbInstance.run(`INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)`, 
          [user.name, user.username, user.password, user.role], function(err) {
            if (err) reject(err); else resolve({ id: this.lastID, ...user });
        });
      }
    });
  },

  updateUser: (id, user) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const idx = jsonDb.data.users.findIndex(u => u.id === parseInt(id));
        if (idx !== -1) {
          jsonDb.data.users[idx] = { ...jsonDb.data.users[idx], ...user };
          jsonDb.save();
          resolve(jsonDb.data.users[idx]);
        } else reject(new Error('User not found'));
      } else {
        const query = user.password 
          ? `UPDATE users SET name = ?, username = ?, password = ?, role = ? WHERE id = ?`
          : `UPDATE users SET name = ?, username = ?, role = ? WHERE id = ?`;
        const params = user.password 
          ? [user.name, user.username, user.password, user.role, id]
          : [user.name, user.username, user.role, id];
        dbInstance.run(query, params, function(err) {
          if (err) reject(err); else resolve({ id, ...user });
        });
      }
    });
  },

  deleteUser: (id) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const initialLen = jsonDb.data.users.length;
        jsonDb.data.users = jsonDb.data.users.filter(u => u.id !== parseInt(id));
        if (jsonDb.data.users.length < initialLen) {
          jsonDb.save();
          resolve(true);
        } else reject(new Error('User not found'));
      } else {
        dbInstance.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
          if (err) reject(err); else resolve(true);
        });
      }
    });
  },

  authenticateUser: (username, password) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const user = jsonDb.data.users.find(u => u.username === username && u.password === password);
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else resolve(null);
      } else {
        dbInstance.get(`SELECT id, name, username, role FROM users WHERE username = ? AND password = ?`, 
          [username, password], (err, row) => {
            if (err) reject(err); else resolve(row || null);
        });
      }
    });
  },

  // --- Categories Operations ---
  getCategories: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.categories);
      } else {
        dbInstance.all(`SELECT * FROM categories`, [], (err, rows) => {
          if (err) reject(err); else resolve(rows);
        });
      }
    });
  },

  createCategory: (name) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const id = jsonDb.data.categories.length > 0 ? Math.max(...jsonDb.data.categories.map(c => c.id)) + 1 : 1;
        const newCat = { id, name };
        jsonDb.data.categories.push(newCat);
        jsonDb.save();
        resolve(newCat);
      } else {
        dbInstance.run(`INSERT INTO categories (name) VALUES (?)`, [name], function(err) {
          if (err) reject(err); else resolve({ id: this.lastID, name });
        });
      }
    });
  },

  updateCategory: (id, name) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const idx = jsonDb.data.categories.findIndex(c => c.id === parseInt(id));
        if (idx !== -1) {
          const oldName = jsonDb.data.categories[idx].name;
          jsonDb.data.categories[idx].name = name;
          // Cascade update to products
          jsonDb.data.products.forEach(p => {
            if (p.category === oldName) p.category = name;
          });
          jsonDb.save();
          resolve(jsonDb.data.categories[idx]);
        } else {
          reject(new Error('Category not found'));
        }
      } else {
        dbInstance.get(`SELECT name FROM categories WHERE id = ?`, [id], (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Category not found'));
          const oldName = row.name;
          dbInstance.serialize(() => {
            dbInstance.run(`BEGIN IMMEDIATE TRANSACTION;`);
            dbInstance.run(`UPDATE categories SET name = ? WHERE id = ?`, [name, id]);
            dbInstance.run(`UPDATE products SET category = ? WHERE category = ?`, [name, oldName]);
            dbInstance.run(`COMMIT;`, (errCommit) => {
              if (errCommit) {
                dbInstance.run(`ROLLBACK;`);
                reject(errCommit);
              } else {
                resolve({ id, name });
              }
            });
          });
        });
      }
    });
  },

  deleteCategory: (id) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const cat = jsonDb.data.categories.find(c => c.id === parseInt(id));
        if (cat) {
          jsonDb.data.categories = jsonDb.data.categories.filter(c => c.id !== parseInt(id));
          jsonDb.data.products.forEach(p => {
            if (p.category === cat.name) {
              p.category = '';
            }
          });
          jsonDb.save();
        }
        resolve(true);
      } else {
        dbInstance.get(`SELECT name FROM categories WHERE id = ?`, [id], (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(true);
          const catName = row.name;
          dbInstance.serialize(() => {
            dbInstance.run(`BEGIN IMMEDIATE TRANSACTION;`);
            dbInstance.run(`DELETE FROM categories WHERE id = ?`, [id]);
            dbInstance.run(`UPDATE products SET category = '' WHERE category = ?`, [catName]);
            dbInstance.run(`COMMIT;`, (errCommit) => {
              if (errCommit) {
                dbInstance.run(`ROLLBACK;`);
                reject(errCommit);
              } else {
                resolve(true);
              }
            });
          });
        });
      }
    });
  },

  // --- Dynamic Units Operations ---
  getUnits: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.units || defaultUnits);
      } else {
        dbInstance.all(`SELECT * FROM units ORDER BY is_default DESC, id ASC`, [], (err, rows) => {
          if (err) reject(err); else resolve(rows || []);
        });
      }
    });
  },

  createUnit: (unit) => {
    return new Promise((resolve, reject) => {
      const is_default = unit.is_default ? 1 : 0;
      if (dbType === 'json') {
        if (!jsonDb.data.units) jsonDb.data.units = [];
        if (is_default) {
          jsonDb.data.units.forEach(u => u.is_default = 0);
        }
        const id = jsonDb.data.units.length > 0 ? Math.max(...jsonDb.data.units.map(u => u.id)) + 1 : 1;
        const newUnit = { id, name: unit.name, is_default };
        jsonDb.data.units.push(newUnit);
        jsonDb.save();
        resolve(newUnit);
      } else {
        dbInstance.serialize(() => {
          dbInstance.run(`BEGIN IMMEDIATE TRANSACTION;`);
          if (is_default) {
            dbInstance.run(`UPDATE units SET is_default = 0;`);
          }
          dbInstance.run(`INSERT INTO units (name, is_default) VALUES (?, ?)`, [unit.name, is_default], function(err) {
            if (err) {
              dbInstance.run(`ROLLBACK;`);
              return reject(err);
            }
            const unitId = this.lastID;
            dbInstance.run(`COMMIT;`, (errCommit) => {
              if (errCommit) {
                dbInstance.run(`ROLLBACK;`);
                reject(errCommit);
              } else {
                resolve({ id: unitId, name: unit.name, is_default });
              }
            });
          });
        });
      }
    });
  },

  updateUnit: (id, unit) => {
    return new Promise((resolve, reject) => {
      const is_default = unit.is_default ? 1 : 0;
      if (dbType === 'json') {
        const idx = jsonDb.data.units.findIndex(u => u.id === parseInt(id));
        if (idx !== -1) {
          const oldName = jsonDb.data.units[idx].name;
          if (is_default) {
            jsonDb.data.units.forEach(u => u.is_default = 0);
          }
          jsonDb.data.units[idx] = { id: parseInt(id), name: unit.name, is_default };
          // Cascade to products
          if (unit.name && oldName !== unit.name) {
            jsonDb.data.products.forEach(p => {
              if (p.unit === oldName) p.unit = unit.name;
            });
          }
          jsonDb.save();
          resolve(jsonDb.data.units[idx]);
        } else reject(new Error('Unit not found'));
      } else {
        dbInstance.get(`SELECT name FROM units WHERE id = ?`, [id], (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Unit not found'));
          const oldName = row.name;
          dbInstance.serialize(() => {
            dbInstance.run(`BEGIN IMMEDIATE TRANSACTION;`);
            if (is_default) {
              dbInstance.run(`UPDATE units SET is_default = 0;`);
            }
            dbInstance.run(`UPDATE units SET name = ?, is_default = ? WHERE id = ?`, [unit.name, is_default, id]);
            if (unit.name && oldName !== unit.name) {
              dbInstance.run(`UPDATE products SET unit = ? WHERE unit = ?`, [unit.name, oldName]);
            }
            dbInstance.run(`COMMIT;`, (errCommit) => {
              if (errCommit) {
                dbInstance.run(`ROLLBACK;`);
                reject(errCommit);
              } else {
                resolve({ id: parseInt(id), name: unit.name, is_default });
              }
            });
          });
        });
      }
    });
  },

  deleteUnit: (id) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const u = jsonDb.data.units.find(item => item.id === parseInt(id));
        if (u) {
          const defaultUnit = jsonDb.data.units.find(item => item.is_default && item.id !== parseInt(id)) || jsonDb.data.units[0];
          const fallback = defaultUnit ? defaultUnit.name : 'Piece';
          jsonDb.data.units = jsonDb.data.units.filter(item => item.id !== parseInt(id));
          jsonDb.data.products.forEach(p => {
            if (p.unit === u.name) p.unit = fallback;
          });
          jsonDb.save();
        }
        resolve(true);
      } else {
        dbInstance.get(`SELECT name, is_default FROM units WHERE id = ?`, [id], (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(true);
          const unitName = row.name;
          dbInstance.get(`SELECT name FROM units WHERE is_default = 1 AND id != ? LIMIT 1`, [id], (errDef, defRow) => {
            const fallback = defRow ? defRow.name : 'Piece';
            dbInstance.serialize(() => {
              dbInstance.run(`BEGIN IMMEDIATE TRANSACTION;`);
              dbInstance.run(`DELETE FROM units WHERE id = ?`, [id]);
              dbInstance.run(`UPDATE products SET unit = ? WHERE unit = ?`, [fallback, unitName]);
              dbInstance.run(`COMMIT;`, (errCommit) => {
                if (errCommit) {
                  dbInstance.run(`ROLLBACK;`);
                  reject(errCommit);
                } else {
                  resolve(true);
                }
              });
            });
          });
        });
      }
    });
  },

  // --- Products Operations ---
  getProducts: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const prods = (jsonDb.data.products || []).map(p => ({
          ...p,
          stock: (p.stock !== undefined && p.stock !== null) ? parseFloat(p.stock) : 0,
          cost_price: parseFloat(p.cost_price || 0),
          low_stock_threshold: parseFloat(p.low_stock_threshold !== undefined ? p.low_stock_threshold : 10)
        }));
        resolve(prods);
      } else {
        dbInstance.all(`SELECT * FROM products`, [], (err, rows) => {
          if (err) reject(err); 
          else {
            const prods = (rows || []).map(p => ({
              ...p,
              stock: (p.stock !== undefined && p.stock !== null) ? parseFloat(p.stock) : 0,
              cost_price: parseFloat(p.cost_price || 0),
              low_stock_threshold: parseFloat(p.low_stock_threshold !== undefined ? p.low_stock_threshold : 10)
            }));
            resolve(prods);
          }
        });
      }
    });
  },

  getProductById: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const prods = await db.getProducts();
        const found = prods.find(p => p.id === parseInt(id));
        resolve(found || null);
      } catch (err) {
        reject(err);
      }
    });
  },

  getProductSalesQuantity: (productId) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const completedOrderIds = new Set((jsonDb.data.orders || []).filter(o => o.status === 'Completed').map(o => o.id));
        let totalSold = 0;
        (jsonDb.data.order_items || []).forEach(item => {
          if (completedOrderIds.has(item.order_id) && (item.product_id === parseInt(productId))) {
            totalSold += (parseFloat(item.quantity) || 0);
          }
        });
        resolve(totalSold);
      } else {
        dbInstance.get(
          `SELECT COALESCE(SUM(oi.quantity), 0) as totalSold 
           FROM order_items oi 
           JOIN orders o ON oi.order_id = o.id 
           WHERE oi.product_id = ? AND o.status = 'Completed'`,
          [productId],
          (err, row) => {
            if (err) reject(err);
            else resolve(parseFloat(row?.totalSold || 0));
          }
        );
      }
    });
  },

  createProduct: (prod) => {
    return new Promise((resolve, reject) => {
      const stock = (prod.stock !== undefined && prod.stock !== null && prod.stock !== '') ? parseFloat(prod.stock) : 0;
      const cost_price = parseFloat(prod.cost_price || 0);
      const low_stock_threshold = parseFloat(prod.low_stock_threshold !== undefined ? prod.low_stock_threshold : 10);
      if (dbType === 'json') {
        const id = jsonDb.data.products.length > 0 ? Math.max(...jsonDb.data.products.map(p => p.id)) + 1 : 1;
        const newProd = { id, ...prod, stock, cost_price, low_stock_threshold };
        jsonDb.data.products.push(newProd);
        jsonDb.save();
        resolve(newProd);
      } else {
        dbInstance.run(`INSERT INTO products (name, price, category, stock, unit, available, image, urdu, cost_price, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [prod.name, prod.price, prod.category, stock, prod.unit, prod.available, prod.image, prod.urdu, cost_price, low_stock_threshold], function(err) {
            if (err) reject(err); else resolve({ id: this.lastID, ...prod, stock, cost_price, low_stock_threshold });
        });
      }
    });
  },

  updateProduct: (id, prod) => {
    return new Promise((resolve, reject) => {
      const cost_price = parseFloat(prod.cost_price || 0);
      const low_stock_threshold = parseFloat(prod.low_stock_threshold !== undefined ? prod.low_stock_threshold : 10);
      if (dbType === 'json') {
        const idx = jsonDb.data.products.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) {
          const oldName = jsonDb.data.products[idx].name;
          jsonDb.data.products[idx] = { ...jsonDb.data.products[idx], ...prod, cost_price, low_stock_threshold };
          // Cascading rename in inventory logs
          jsonDb.data.inventory_logs.forEach(l => {
            if (l.product_name === oldName) {
              l.product_name = prod.name;
            }
          });
          jsonDb.save();
          resolve(jsonDb.data.products[idx]);
        } else reject(new Error('Product not found'));
      } else {
        dbInstance.get(`SELECT name FROM products WHERE id = ?`, [id], (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error('Product not found'));
          const oldName = row.name;
          dbInstance.serialize(() => {
            dbInstance.run('BEGIN IMMEDIATE TRANSACTION;');
            dbInstance.run(`UPDATE products SET name = ?, price = ?, category = ?, stock = ?, unit = ?, available = ?, image = ?, urdu = ?, cost_price = ?, low_stock_threshold = ? WHERE id = ?`,
              [prod.name, prod.price, prod.category, prod.stock, prod.unit, prod.available, prod.image, prod.urdu, cost_price, low_stock_threshold, id]);
            dbInstance.run(`UPDATE inventory_logs SET product_name = ? WHERE product_name = ?`, [prod.name, oldName]);
            dbInstance.run('COMMIT;', (errCommit) => {
              if (errCommit) {
                dbInstance.run('ROLLBACK;');
                reject(errCommit);
              } else {
                resolve({ id, ...prod, cost_price, low_stock_threshold });
              }
            });
          });
        });
      }
    });
  },

  deleteProduct: (id) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const prod = jsonDb.data.products.find(p => p.id === parseInt(id));
        if (prod) {
          jsonDb.data.products = jsonDb.data.products.filter(p => p.id !== parseInt(id));
          // Cascading deletion: remove product stock audit logs
          jsonDb.data.inventory_logs = jsonDb.data.inventory_logs.filter(l => l.product_name !== prod.name);
          jsonDb.save();
        }
        resolve(true);
      } else {
        dbInstance.get(`SELECT name FROM products WHERE id = ?`, [id], (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(true);
          const prodName = row.name;
          dbInstance.serialize(() => {
            dbInstance.run(`BEGIN IMMEDIATE TRANSACTION;`);
            dbInstance.run(`DELETE FROM products WHERE id = ?`, [id]);
            dbInstance.run(`DELETE FROM inventory_logs WHERE product_name = ?`, [prodName]);
            dbInstance.run(`COMMIT;`, (errCommit) => {
              if (errCommit) {
                dbInstance.run(`ROLLBACK;`);
                reject(errCommit);
              } else {
                resolve(true);
              }
            });
          });
        });
      }
    });
  },

  updateProductStock: (id, newStock) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const idx = jsonDb.data.products.findIndex(p => p.id === parseInt(id));
        if (idx !== -1) {
          jsonDb.data.products[idx].stock = newStock;
          jsonDb.save();
          resolve(jsonDb.data.products[idx]);
        } else reject(new Error('Product not found'));
      } else {
        dbInstance.run(`UPDATE products SET stock = ? WHERE id = ?`, [newStock, id], function(err) {
          if (err) reject(err); else resolve(true);
        });
      }
    });
  },

  // --- Tables Operations ---
  getTables: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.tables);
      } else {
        dbInstance.all(`SELECT * FROM tables`, [], (err, rows) => {
          if (err) reject(err); else resolve(rows);
        });
      }
    });
  },

  createTable: (name) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const id = jsonDb.data.tables.length > 0 ? Math.max(...jsonDb.data.tables.map(t => t.id)) + 1 : 1;
        const newTable = { id, name, status: 'Available' };
        jsonDb.data.tables.push(newTable);
        jsonDb.save();
        resolve(newTable);
      } else {
        dbInstance.run(`INSERT INTO tables (name, status) VALUES (?, ?)`, [name, 'Available'], function(err) {
          if (err) reject(err); else resolve({ id: this.lastID, name, status: 'Available' });
        });
      }
    });
  },

  updateTableStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const idx = jsonDb.data.tables.findIndex(t => t.id === parseInt(id));
        if (idx !== -1) {
          jsonDb.data.tables[idx].status = status;
          jsonDb.save();
          resolve(jsonDb.data.tables[idx]);
        } else reject(new Error('Table not found'));
      } else {
        dbInstance.run(`UPDATE tables SET status = ? WHERE id = ?`, [status, id], function(err) {
          if (err) reject(err); else resolve(true);
        });
      }
    });
  },

  deleteTable: (id) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        jsonDb.data.tables = jsonDb.data.tables.filter(t => t.id !== parseInt(id));
        // Cascading update: set order table references to null
        jsonDb.data.orders.forEach(o => {
          if (o.table_id === parseInt(id)) {
            o.table_id = null;
          }
        });
        jsonDb.save();
        resolve(true);
      } else {
        dbInstance.serialize(() => {
          dbInstance.run(`BEGIN IMMEDIATE TRANSACTION;`);
          dbInstance.run(`DELETE FROM tables WHERE id = ?`, [id]);
          dbInstance.run(`UPDATE orders SET table_id = NULL WHERE table_id = ?`, [id]);
          dbInstance.run(`COMMIT;`, (errCommit) => {
            if (errCommit) {
              dbInstance.run(`ROLLBACK;`);
              reject(errCommit);
            } else {
              resolve(true);
            }
          });
        });
      }
    });
  },

  // --- Orders & Invoices ---
  createOrder: (order, items) => {
    return new Promise((resolve, reject) => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const finalItems = (items && Array.isArray(items) && items.length > 0) ? items : ((order && Array.isArray(order.items)) ? order.items : []);

      if (dbType === 'json') {
        const orderId = jsonDb.data.orders.length > 0 ? Math.max(...jsonDb.data.orders.map(o => o.id)) + 1 : 1001; // Starts at #1001
        const newOrder = {
          id: orderId,
          ...order,
          created_at: order.created_at || nowStr
        };
        jsonDb.data.orders.push(newOrder);

        // Deduct stocks and add order items
        finalItems.forEach(item => {
          const itemId = jsonDb.data.order_items.length > 0 ? Math.max(...jsonDb.data.order_items.map(oi => oi.id)) + 1 : 1;
          jsonDb.data.order_items.push({
            id: itemId,
            order_id: orderId,
            ...item
          });

          // Deduct stock automatically
          const prodIdx = jsonDb.data.products.findIndex(p => p.id === parseInt(item.product_id));
          if (prodIdx !== -1) {
            const currentStock = jsonDb.data.products[prodIdx].stock || 0;
            const newStock = currentStock - item.quantity;
            jsonDb.data.products[prodIdx].stock = newStock;
            // Log inventory log
            const logId = jsonDb.data.inventory_logs.length > 0 ? Math.max(...jsonDb.data.inventory_logs.map(l => l.id)) + 1 : 1;
            jsonDb.data.inventory_logs.push({
              id: logId,
              product_name: item.product_name,
              type: 'Stock Out',
              quantity: item.quantity,
              before_stock: currentStock,
              after_stock: newStock,
              order_id: orderId,
              user: order.created_by || 'Cashier',
              reason: 'Sale',
              note: `Sale (Order #${orderId})`,
              date: nowStr
            });
          }
        });

        // If Dine-In order is completed/cancelled, free up the table. Otherwise (suspended/kitchen), occupy it
        if (order.order_type === 'Dine-In' && order.table_id) {
          const tableIdx = jsonDb.data.tables.findIndex(t => t.id === parseInt(order.table_id));
          if (tableIdx !== -1) {
            jsonDb.data.tables[tableIdx].status = (order.status === 'Completed' || order.status === 'Cancelled') ? 'Available' : 'Occupied';
          }
        }

        jsonDb.save();
        resolve({ id: orderId, ...newOrder });
      } else {
        dbInstance.serialize(() => {
          dbInstance.run('BEGIN IMMEDIATE TRANSACTION;', (err) => {
            if (err) return reject(err);
          });

          dbInstance.run(
            `INSERT INTO orders (order_type, table_id, customer_name, customer_phone, delivery_address, delivery_charges, rider_name, items_count, subtotal, tax_rate, tax_amount, discount_rate, discount_amount, service_charges, total, payment_method, payment_details, status, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [order.order_type, order.table_id, order.customer_name, order.customer_phone, order.delivery_address, order.delivery_charges, order.rider_name, order.items_count, order.subtotal, order.tax_rate, order.tax_amount, order.discount_rate, order.discount_amount, order.service_charges, order.total, order.payment_method, order.payment_details, order.status || 'Completed', order.created_at || nowStr, order.created_by],
            function(err) {
              if (err) {
                dbInstance.run('ROLLBACK;');
                return reject(err);
              }
              const orderId = this.lastID;
              let itemErrors = null;
              let processedItems = 0;

              const stmtItem = dbInstance.prepare(`INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)`);

              if (!finalItems || finalItems.length === 0) {
                finalizeOrderProcess();
                return;
              }

              finalItems.forEach(item => {
                stmtItem.run(orderId, item.product_id, item.product_name, item.price, item.quantity, item.subtotal, (errItem) => {
                  if (errItem) itemErrors = errItem;
                });

                // Read current stock first to capture before_stock
                dbInstance.get(`SELECT stock FROM products WHERE id = ?`, [item.product_id], (errGetStock, row) => {
                  if (errGetStock) itemErrors = errGetStock;
                  const beforeStock = row ? (parseFloat(row.stock) || 0) : 0;
                  const afterStock = beforeStock - parseFloat(item.quantity);

                  // Update stock level
                  dbInstance.run(`UPDATE products SET stock = ? WHERE id = ?`, [afterStock, item.product_id], (errStock) => {
                    if (errStock) itemErrors = errStock;

                    // Log inventory log with full audit trail
                    dbInstance.run(
                      `INSERT INTO inventory_logs (product_name, type, quantity, note, date, before_stock, after_stock, order_id, user, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                      [item.product_name, 'Stock Out', parseFloat(item.quantity), `Sale (Order #${orderId})`, nowStr, beforeStock, afterStock, orderId, order.created_by || 'Cashier', 'Sale'],
                      (errLog) => {
                        if (errLog) itemErrors = errLog;
                        processedItems++;
                        if (processedItems === finalItems.length) {
                          stmtItem.finalize((errFin) => {
                            if (errFin) itemErrors = errFin;
                            finalizeOrderProcess();
                          });
                        }
                      }
                    );
                  });
                });
              });

              function finalizeOrderProcess() {
                if (order.order_type === 'Dine-In' && order.table_id) {
                  const tblStatus = (order.status === 'Completed' || order.status === 'Cancelled') ? 'Available' : 'Occupied';
                  dbInstance.run(`UPDATE tables SET status = ? WHERE id = ?`, [tblStatus, order.table_id], (errTbl) => {
                    if (errTbl) itemErrors = errTbl;
                    commitOrderTx();
                  });
                } else {
                  commitOrderTx();
                }
              }

              function commitOrderTx() {
                if (itemErrors) {
                  dbInstance.run('ROLLBACK;');
                  return reject(itemErrors);
                }
                dbInstance.run('COMMIT;', (errCommit) => {
                  if (errCommit) {
                    dbInstance.run('ROLLBACK;');
                    return reject(errCommit);
                  }
                  resolve({ id: orderId, ...order });
                });
              }
            }
          );
        });
      }
    });
  },

  getOrders: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.orders);
      } else {
        dbInstance.all(`SELECT * FROM orders ORDER BY id DESC`, [], (err, rows) => {
          if (err) reject(err); else resolve(rows);
        });
      }
    });
  },

  getOrderDetails: (orderId) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const order = jsonDb.data.orders.find(o => o.id === parseInt(orderId));
        if (order) {
          const items = jsonDb.data.order_items.filter(oi => oi.order_id === parseInt(orderId));
          resolve({ order, items });
        } else reject(new Error('Order not found'));
      } else {
        dbInstance.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (err, order) => {
          if (err) return reject(err);
          if (!order) return reject(new Error('Order not found'));

          dbInstance.all(`SELECT * FROM order_items WHERE order_id = ?`, [orderId], (err, items) => {
            if (err) reject(err); else resolve({ order, items });
          });
        });
      }
    });
  },

  updateOrderStatus: (orderId, status) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const idx = jsonDb.data.orders.findIndex(o => o.id === parseInt(orderId));
        if (idx !== -1) {
          jsonDb.data.orders[idx].status = status;

          // Free up Table if Order gets Completed or Cancelled
          const order = jsonDb.data.orders[idx];
          if (order.order_type === 'Dine-In' && order.table_id) {
            const tableIdx = jsonDb.data.tables.findIndex(t => t.id === parseInt(order.table_id));
            if (tableIdx !== -1) {
              jsonDb.data.tables[tableIdx].status = (status === 'Completed' || status === 'Cancelled') ? 'Available' : 'Occupied';
            }
          }
          jsonDb.save();
          resolve(jsonDb.data.orders[idx]);
        } else reject(new Error('Order not found'));
      } else {
        dbInstance.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, orderId], function(err) {
          if (err) return reject(err);
          // Free table check
          dbInstance.get(`SELECT order_type, table_id FROM orders WHERE id = ?`, [orderId], (err, order) => {
            if (!err && order && order.order_type === 'Dine-In' && order.table_id) {
              const tblStatus = (status === 'Completed' || status === 'Cancelled') ? 'Available' : 'Occupied';
              dbInstance.run(`UPDATE tables SET status = ? WHERE id = ?`, [tblStatus, order.table_id]);
            }
            resolve(true);
          });
        });
      }
    });
  },

  deleteOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const order = jsonDb.data.orders.find(o => o.id === parseInt(orderId));
        if (order) {
          // Free up Table if Dine-In and it's not occupied by other active tickets
          if (order.order_type === 'Dine-In' && order.table_id) {
            const otherActive = jsonDb.data.orders.some(o => o.id !== parseInt(orderId) && o.table_id === order.table_id && o.status !== 'Completed' && o.status !== 'Cancelled');
            if (!otherActive) {
              const tIdx = jsonDb.data.tables.findIndex(t => t.id === order.table_id);
              if (tIdx !== -1) {
                jsonDb.data.tables[tIdx].status = 'Available';
              }
            }
          }
          jsonDb.data.orders = jsonDb.data.orders.filter(o => o.id !== parseInt(orderId));
          jsonDb.data.order_items = jsonDb.data.order_items.filter(i => i.order_id !== parseInt(orderId));
          if (jsonDb.data.refunds) {
            jsonDb.data.refunds = jsonDb.data.refunds.filter(r => r.order_id !== parseInt(orderId));
          }
          jsonDb.save();
        }
        resolve(true);
      } else {
        dbInstance.get(`SELECT order_type, table_id FROM orders WHERE id = ?`, [orderId], (err, order) => {
          if (err) return reject(err);
          dbInstance.serialize(() => {
            dbInstance.run('BEGIN IMMEDIATE TRANSACTION;', (errTx) => {
              if (errTx) return reject(errTx);
            });
            dbInstance.run(`DELETE FROM orders WHERE id = ?`, [orderId], (errDel) => {
              if (errDel) {
                dbInstance.run('ROLLBACK;');
                return reject(errDel);
              }
              dbInstance.run(`DELETE FROM order_items WHERE order_id = ?`, [orderId], (errDelItems) => {
                if (errDelItems) {
                  dbInstance.run('ROLLBACK;');
                  return reject(errDelItems);
                }
                dbInstance.run(`DELETE FROM refunds WHERE order_id = ?`, [orderId], (errDelRefunds) => {
                  if (errDelRefunds) {
                    dbInstance.run('ROLLBACK;');
                    return reject(errDelRefunds);
                  }
                  
                  // Release table check
                  if (order && order.order_type === 'Dine-In' && order.table_id) {
                    dbInstance.get(
                      `SELECT count(*) as count FROM orders WHERE table_id = ? AND status NOT IN ('Completed', 'Cancelled')`,
                      [order.table_id],
                      (errCheck, row) => {
                        if (!errCheck && row.count === 0) {
                          dbInstance.run(
                            `UPDATE tables SET status = 'Available' WHERE id = ?`,
                            [order.table_id],
                            (errTbl) => {
                              commitTx();
                            }
                          );
                        } else {
                          commitTx();
                        }
                      }
                    );
                  } else {
                    commitTx();
                  }

                  function commitTx() {
                    dbInstance.run('COMMIT;', (errCommit) => {
                      if (errCommit) {
                        dbInstance.run('ROLLBACK;');
                        return reject(errCommit);
                      }
                      resolve(true);
                    });
                  }
                });
              });
            });
          });
        });
      }
    });
  },

  // --- Order Items Operations ---
  getOrderItems: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.order_items || []);
      } else {
        dbInstance.all(`SELECT * FROM order_items`, [], (err, rows) => {
          if (err) reject(err); else resolve(rows || []);
        });
      }
    });
  },

  // --- Inventory Logs ---
  getInventoryLogs: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.inventory_logs);
      } else {
        dbInstance.all(`SELECT * FROM inventory_logs ORDER BY id DESC`, [], (err, rows) => {
          if (err) reject(err); else resolve(rows);
        });
      }
    });
  },

  logInventoryChange: (log) => {
    return new Promise((resolve, reject) => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      if (dbType === 'json') {
        const prodIdx = jsonDb.data.products.findIndex(p => p.name === log.product_name || p.id === parseInt(log.product_id));
        let beforeStock = 0;
        let afterStock = 0;
        if (prodIdx !== -1) {
          beforeStock = parseFloat(jsonDb.data.products[prodIdx].stock) || 0;
          const qty = parseFloat(log.quantity) || 0;
          if (log.type === 'Opening Stock' || log.reason === 'Opening Stock') {
            afterStock = qty;
          } else if (log.type === 'Stock In') {
            afterStock = beforeStock + qty;
          } else if (log.type === 'Stock Out') {
            afterStock = beforeStock - qty;
          } else { // Adjustment
            afterStock = (log.after_stock !== undefined) ? parseFloat(log.after_stock) : qty;
          }
          jsonDb.data.products[prodIdx].stock = afterStock;
          if (log.cost_price !== undefined) jsonDb.data.products[prodIdx].cost_price = parseFloat(log.cost_price) || 0;
          if (log.low_stock_threshold !== undefined) jsonDb.data.products[prodIdx].low_stock_threshold = parseFloat(log.low_stock_threshold) || 10;
        }

        const logId = jsonDb.data.inventory_logs.length > 0 ? Math.max(...jsonDb.data.inventory_logs.map(l => l.id)) + 1 : 1;
        const newLog = {
          id: logId,
          product_name: log.product_name,
          type: log.type || 'Stock In',
          quantity: parseFloat(log.quantity) || 0,
          before_stock: beforeStock,
          after_stock: afterStock,
          user: log.user || 'Admin',
          reason: log.reason || '',
          order_id: log.order_id || null,
          note: log.note || '',
          date: log.date || nowStr
        };
        jsonDb.data.inventory_logs.push(newLog);
        jsonDb.save();
        resolve(newLog);
      } else {
        dbInstance.serialize(() => {
          dbInstance.run('BEGIN IMMEDIATE TRANSACTION;', (err) => {
            if (err) return reject(err);
          });

          // Fetch current stock first
          const query = log.product_id ? `SELECT id, name, stock FROM products WHERE id = ?` : `SELECT id, name, stock FROM products WHERE name = ?`;
          const param = log.product_id || log.product_name;

          dbInstance.get(query, [param], (errProd, prodRow) => {
            if (errProd) {
              dbInstance.run('ROLLBACK;');
              return reject(errProd);
            }
            const beforeStock = prodRow ? (parseFloat(prodRow.stock) || 0) : 0;
            const targetProdName = prodRow ? prodRow.name : log.product_name;
            const targetProdId = prodRow ? prodRow.id : log.product_id;
            let afterStock = beforeStock;
            const qty = parseFloat(log.quantity) || 0;

            let updateQuery = '';
            let updateParams = [];
            if (log.type === 'Opening Stock' || log.reason === 'Opening Stock') {
              afterStock = qty;
              updateQuery = `UPDATE products SET stock = ? WHERE id = ?`;
              updateParams = [afterStock, targetProdId];
            } else if (log.type === 'Stock In') {
              afterStock = beforeStock + qty;
              updateQuery = `UPDATE products SET stock = stock + ? WHERE id = ?`;
              updateParams = [qty, targetProdId];
            } else if (log.type === 'Stock Out') {
              afterStock = beforeStock - qty;
              updateQuery = `UPDATE products SET stock = stock - ? WHERE id = ?`;
              updateParams = [qty, targetProdId];
            } else { // Adjustment
              afterStock = (log.after_stock !== undefined) ? parseFloat(log.after_stock) : qty;
              updateQuery = `UPDATE products SET stock = ? WHERE id = ?`;
              updateParams = [afterStock, targetProdId];
            }

            dbInstance.run(
              `INSERT INTO inventory_logs (product_name, type, quantity, note, date, before_stock, after_stock, user, reason, order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [targetProdName, log.type, qty, log.note || '', log.date || nowStr, beforeStock, afterStock, log.user || 'Admin', log.reason || '', log.order_id || null],
              function(errInsert) {
                if (errInsert) {
                  dbInstance.run('ROLLBACK;');
                  return reject(errInsert);
                }
                const logId = this.lastID;
                dbInstance.run(updateQuery, updateParams, (errUpdate) => {
                  if (errUpdate) {
                    dbInstance.run('ROLLBACK;');
                    return reject(errUpdate);
                  }

                  // Optional cost_price / threshold updates
                  if (log.cost_price !== undefined || log.low_stock_threshold !== undefined) {
                    dbInstance.run(
                      `UPDATE products SET cost_price = COALESCE(?, cost_price), low_stock_threshold = COALESCE(?, low_stock_threshold) WHERE id = ?`,
                      [log.cost_price !== undefined ? parseFloat(log.cost_price) : null, log.low_stock_threshold !== undefined ? parseFloat(log.low_stock_threshold) : null, targetProdId]
                    );
                  }

                  dbInstance.run('COMMIT;', (errCommit) => {
                    if (errCommit) {
                      dbInstance.run('ROLLBACK;');
                      return reject(errCommit);
                    }
                    resolve({ id: logId, product_name: targetProdName, type: log.type, quantity: qty, before_stock: beforeStock, after_stock: afterStock, date: log.date || nowStr });
                  });
                });
              }
            );
          });
        });
      }
    });
  },

  setOpeningStock: (data) => {
    return module.exports.logInventoryChange({
      product_id: data.productId,
      product_name: data.productName,
      type: 'Opening Stock',
      quantity: parseFloat(data.openingQty) || 0,
      reason: 'Opening Stock',
      note: data.note || 'Initial Opening Stock Setup',
      user: data.user || 'Admin',
      date: data.date
    });
  },

  addStock: (data) => {
    return module.exports.logInventoryChange({
      product_id: data.productId,
      product_name: data.productName,
      type: 'Stock In',
      quantity: parseFloat(data.quantity) || 0,
      reason: data.reason || 'Purchase',
      note: data.note || 'Inward Stock Addition',
      user: data.user || 'Admin',
      date: data.date,
      cost_price: data.cost_price,
      low_stock_threshold: data.low_stock_threshold
    });
  },

  recordWastage: (data) => {
    return module.exports.logInventoryChange({
      product_id: data.productId,
      product_name: data.productName,
      type: 'Stock Out',
      quantity: parseFloat(data.quantity) || 0,
      reason: data.reason || 'Waste',
      note: data.note || 'Kitchen / Prep Wastage',
      user: data.user || 'Admin',
      date: data.date
    });
  },

  adjustStock: (data) => {
    return module.exports.logInventoryChange({
      product_id: data.productId,
      product_name: data.productName,
      type: 'Adjustment',
      quantity: parseFloat(data.newQuantity) || 0,
      after_stock: parseFloat(data.newQuantity) || 0,
      reason: data.reason || 'Physical Count Correction',
      note: data.note || 'Physical Count Correction',
      user: data.user || 'Admin',
      date: data.date,
      cost_price: data.cost_price,
      low_stock_threshold: data.low_stock_threshold
    });
  },

  reconcileInventory: (options = {}) => {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await module.exports.getProducts();
        const logs = await module.exports.getInventoryLogs();
        const orders = await module.exports.getOrders();
        const orderItems = await module.exports.getOrderItems();

        const completedOrderIds = new Set(
          orders.filter(o => o.status === 'Completed').map(o => o.id)
        );

        const results = [];
        let discrepanciesFound = 0;
        let correctedCount = 0;

        for (const prod of products) {
          if (options.productIds && Array.isArray(options.productIds) && !options.productIds.includes(prod.id)) {
            continue;
          }

          const storedStock = parseFloat(prod.stock) || 0;
          const prodLogs = logs.filter(l => l.product_name === prod.name);

          // Calculate Ledger Running Total:
          // Inflows: Opening Stock + Stock In (Purchases/Additions + Returns/Refunds)
          // Outflows: Sales (Stock Out) + Wastage (Stock Out) + Inventory Resets
          // Adjustments: Delta between after and before
          let ledgerInflows = 0;
          let ledgerOutflows = 0;
          let ledgerAdjustments = 0;
          let totalSoldLedger = 0;
          let totalWastedLedger = 0;
          let totalAddedLedger = 0;
          let totalReturnedLedger = 0;
          let totalOpeningLedger = 0;

          // Process logs in chronological order (oldest to newest)
          const sortedLogs = [...prodLogs].sort((a, b) => (a.id || 0) - (b.id || 0));

          let calculatedStock = 0;
          let hasAnyLogs = sortedLogs.length > 0;

          sortedLogs.forEach(l => {
            const qty = parseFloat(l.quantity) || 0;
            if (l.type === 'Opening Stock' || l.reason === 'Opening Stock') {
              totalOpeningLedger += qty;
              calculatedStock = qty; // Reset baseline to opening stock
            } else if (l.type === 'Stock In') {
              if (l.reason === 'Return' || l.reason === 'Refund' || (l.note && l.note.toLowerCase().includes('return')) || (l.note && l.note.toLowerCase().includes('refund'))) {
                totalReturnedLedger += qty;
              } else {
                totalAddedLedger += qty;
              }
              calculatedStock += qty;
            } else if (l.type === 'Stock Out') {
              if (l.reason === 'Sale') {
                totalSoldLedger += qty;
              } else {
                totalWastedLedger += qty;
              }
              calculatedStock -= qty;
            } else if (l.type === 'Adjustment') {
              if (l.reason === 'Inventory Reset') {
                calculatedStock = 0;
              } else if (l.after_stock !== undefined && l.before_stock !== undefined) {
                calculatedStock = parseFloat(l.after_stock);
              } else {
                calculatedStock = qty;
              }
            }
          });

          // If no logs ever existed for this product, calculated stock is stored stock
          if (!hasAnyLogs) {
            calculatedStock = storedStock;
          }

          const diff = storedStock - calculatedStock;
          const hasDiscrepancy = Math.abs(diff) > 0.001;

          if (hasDiscrepancy) discrepanciesFound++;

          if (hasDiscrepancy && options.autoCorrect) {
            await module.exports.logInventoryChange({
              product_id: prod.id,
              product_name: prod.name,
              type: 'Adjustment',
              quantity: calculatedStock,
              after_stock: calculatedStock,
              reason: 'Discrepancy Reconciliation',
              note: `Reconciled stored stock (${storedStock}) to ledger calculated balance (${calculatedStock})`,
              user: options.user || 'Admin'
            });
            correctedCount++;
          }

          results.push({
            productId: prod.id,
            productName: prod.name,
            storedStock,
            calculatedStock,
            discrepancy: diff,
            hasDiscrepancy,
            totalAdded: totalAddedLedger,
            totalSold: totalSoldLedger,
            totalReturned: totalReturnedLedger,
            totalWasted: totalWastedLedger,
            totalOpening: totalOpeningLedger,
            isCorrected: hasDiscrepancy && options.autoCorrect
          });
        }

        resolve({
          products: results,
          discrepanciesFound,
          correctedCount,
          totalProductsChecked: results.length
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  // --- Settings Operations ---
  getSettings: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.settings);
      } else {
        dbInstance.all(`SELECT * FROM settings`, [], (err, rows) => {
          if (err) return reject(err);
          const settingsObj = {};
          rows.forEach(r => {
            let val = r.value;
            // Parse floats
            if (r.key === 'tax_rate' || r.key === 'service_charges') val = parseFloat(val);
            settingsObj[r.key] = val;
          });
          resolve(settingsObj);
        });
      }
    });
  },

  updateSettings: (settings) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        jsonDb.data.settings = { ...jsonDb.data.settings, ...settings };
        jsonDb.save();
        resolve(jsonDb.data.settings);
      } else {
        dbInstance.serialize(() => {
          dbInstance.run('BEGIN IMMEDIATE TRANSACTION;', (err) => {
            if (err) return reject(err);
          });
          const keys = Object.keys(settings);
          let completed = 0;
          let hasError = false;

          keys.forEach(k => {
            dbInstance.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [k, String(settings[k])], (err) => {
              if (err) hasError = err;
              completed++;
              if (completed === keys.length) {
                if (hasError) {
                  dbInstance.run('ROLLBACK;');
                  reject(hasError);
                } else {
                  dbInstance.run('COMMIT;', (errCommit) => {
                    if (errCommit) {
                      dbInstance.run('ROLLBACK;');
                      reject(errCommit);
                    } else {
                      resolve(settings);
                    }
                  });
                }
              }
            });
          });
        });
      }
    });
  },

  validateBackupBuffer: (buffer) => {
    return new Promise((resolve, reject) => {
      // 1. Try JSON inspection
      try {
        const text = buffer.toString('utf8');
        if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
          const parsed = JSON.parse(text);
          if (parsed.products || parsed.orders || parsed.settings) {
            return resolve({
              valid: true,
              type: 'json',
              counts: {
                products: (parsed.products || []).length,
                categories: (parsed.categories || []).length,
                units: (parsed.units || []).length,
                orders: (parsed.orders || []).length,
                tables: (parsed.tables || []).length,
                users: (parsed.users || []).length,
                inventory_logs: (parsed.inventory_logs || []).length
              }
            });
          }
        }
      } catch (e) {}

      // 2. Try SQLite inspection
      try {
        const sqlite3 = require('sqlite3').verbose();
        const tempTestPath = path.join(userDataPath, `temp_validate_${Date.now()}.db`);
        fs.writeFileSync(tempTestPath, buffer);
        const tempDb = new sqlite3.Database(tempTestPath, sqlite3.OPEN_READONLY, async (errOpen) => {
          if (errOpen) {
            try { fs.unlinkSync(tempTestPath); } catch(e){}
            return reject(new Error('Invalid SQLite database file: ' + errOpen.message));
          }

          const getCount = (table) => new Promise((res) => {
            tempDb.get(`SELECT count(*) as count FROM ${table}`, (err, row) => {
              res(err ? 0 : (row ? row.count : 0));
            });
          });

          const [products, categories, units, orders, tables, users, logs] = await Promise.all([
            getCount('products'),
            getCount('categories'),
            getCount('units'),
            getCount('orders'),
            getCount('tables'),
            getCount('users'),
            getCount('inventory_logs')
          ]);

          tempDb.close(() => {
            try { fs.unlinkSync(tempTestPath); } catch(e){}
            resolve({
              valid: true,
              type: 'sqlite',
              counts: {
                products,
                categories,
                units,
                orders,
                tables,
                users,
                inventory_logs: logs
              }
            });
          });
        });
      } catch (err) {
        reject(new Error('Unable to inspect backup file: ' + err.message));
      }
    });
  },

  restoreDatabase: (buffer) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        try {
          fs.writeFileSync(jsonDbPath, buffer);
          jsonDb.load();
          resolve();
        } catch (e) {
          reject(e);
        }
      } else {
        dbInstance.close((err) => {
          if (err) {
            console.error('Error closing database before restore:', err);
          }
          try {
            // Delete accompanying WAL/SHM files to prevent SQLite journal mismatch corruption in WAL mode
            const walPath = dbPath + '-wal';
            const shmPath = dbPath + '-shm';
            if (fs.existsSync(walPath)) {
              try { fs.unlinkSync(walPath); } catch (e) { console.error('Error deleting WAL file:', e); }
            }
            if (fs.existsSync(shmPath)) {
              try { fs.unlinkSync(shmPath); } catch (e) { console.error('Error deleting SHM file:', e); }
            }
            
            fs.writeFileSync(dbPath, buffer);
            const sqlite3 = require('sqlite3').verbose();
            dbInstance = new sqlite3.Database(dbPath, (err2) => {
              if (err2) reject(err2);
              else {
                console.log('SQLite reconnected after database restore.');
                resolve();
              }
            });
          } catch (e) {
            reject(e);
          }
        });
      }
    });
  },

  getTopProducts: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        const counts = {};
        jsonDb.data.order_items.forEach(item => {
          if (!counts[item.product_name]) {
            counts[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
          }
          counts[item.product_name].qty += parseFloat(item.quantity || 0);
          counts[item.product_name].revenue += parseFloat(item.subtotal || 0);
        });
        const sorted = Object.values(counts)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);
        resolve(sorted);
      } else {
        dbInstance.all(
          `SELECT product_name as name, SUM(quantity) as qty, SUM(subtotal) as revenue FROM order_items GROUP BY product_name ORDER BY qty DESC LIMIT 5`,
          [],
          (err, rows) => {
            if (err) reject(err); else resolve(rows || []);
          }
        );
      }
    });
  },

  logUserLogin: (user) => {
    return new Promise((resolve, reject) => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      if (dbType === 'json') {
        if (!jsonDb.data.login_history) jsonDb.data.login_history = [];
        const logId = jsonDb.data.login_history.length > 0 ? Math.max(...jsonDb.data.login_history.map(lh => lh.id)) + 1 : 1;
        jsonDb.data.login_history.push({
          id: logId,
          user_id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          login_time: nowStr
        });
        jsonDb.save();
        resolve(true);
      } else {
        dbInstance.run(
          `INSERT INTO login_history (user_id, name, username, role, login_time) VALUES (?, ?, ?, ?, ?)`,
          [user.id, user.name, user.username, user.role, nowStr],
          function(err) {
            if (err) reject(err); else resolve(true);
          }
        );
      }
    });
  },

  getLoginHistory: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.login_history || []);
      } else {
        dbInstance.all(`SELECT * FROM login_history ORDER BY id DESC LIMIT 50`, [], (err, rows) => {
          if (err) reject(err); else resolve(rows || []);
        });
      }
    });
  },

  // --- Refunds Operations (Real Returns Storage) ---
  getRefunds: () => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        resolve(jsonDb.data.refunds || []);
      } else {
        dbInstance.all(`SELECT * FROM refunds ORDER BY id DESC`, [], (err, rows) => {
          if (err) reject(err); else resolve(rows || []);
        });
      }
    });
  },

  createRefund: (refund) => {
    return new Promise((resolve, reject) => {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      if (dbType === 'json') {
        if (!jsonDb.data.refunds) jsonDb.data.refunds = [];
        const refundId = jsonDb.data.refunds.length > 0 ? Math.max(...jsonDb.data.refunds.map(r => r.id)) + 1 : 1;
        const newRefund = {
          id: refundId,
          ...refund,
          date: nowStr
        };
        jsonDb.data.refunds.push(newRefund);

        // Update order status to 'Cancelled'
        const oIdx = jsonDb.data.orders.findIndex(o => o.id === parseInt(refund.order_id));
        if (oIdx !== -1) {
          jsonDb.data.orders[oIdx].status = 'Cancelled';
          const order = jsonDb.data.orders[oIdx];

          // Free table
          if (order.order_type === 'Dine-In' && order.table_id) {
            const tIdx = jsonDb.data.tables.findIndex(t => t.id === parseInt(order.table_id));
            if (tIdx !== -1) {
              jsonDb.data.tables[tIdx].status = 'Available';
            }
          }
        }

        // Restore product stock & log inventory change
        const items = jsonDb.data.order_items.filter(oi => oi.order_id === parseInt(refund.order_id));
        items.forEach(item => {
          const pIdx = jsonDb.data.products.findIndex(p => p.id === parseInt(item.product_id));
          if (pIdx !== -1) {
            const beforeStock = parseFloat(jsonDb.data.products[pIdx].stock) || 0;
            const afterStock = beforeStock + parseFloat(item.quantity);
            jsonDb.data.products[pIdx].stock = afterStock;
            
            const logId = jsonDb.data.inventory_logs.length > 0 ? Math.max(...jsonDb.data.inventory_logs.map(l => l.id)) + 1 : 1;
            jsonDb.data.inventory_logs.push({
              id: logId,
              product_name: item.product_name,
              type: 'Stock In',
              quantity: parseFloat(item.quantity),
              before_stock: beforeStock,
              after_stock: afterStock,
              order_id: refund.order_id,
              user: 'Admin',
              reason: 'Refund',
              note: `Refund (Order #${refund.order_id})`,
              date: nowStr
            });
          }
        });

        jsonDb.save();
        resolve(newRefund);
      } else {
        dbInstance.serialize(() => {
          dbInstance.run('BEGIN IMMEDIATE TRANSACTION;', (err) => {
            if (err) return reject(err);
          });

          // Insert refund log
          dbInstance.run(
            `INSERT INTO refunds (order_id, type, amount, reason, date) VALUES (?, ?, ?, ?, ?)`,
            [refund.order_id, refund.type, refund.amount, refund.reason, nowStr],
            function(errRefund) {
              if (errRefund) {
                dbInstance.run('ROLLBACK;');
                return reject(errRefund);
              }
              const refundId = this.lastID;

              // Update order status to 'Cancelled'
              dbInstance.run(
                `UPDATE orders SET status = 'Cancelled' WHERE id = ?`,
                [refund.order_id],
                (errOrder) => {
                  if (errOrder) {
                    dbInstance.run('ROLLBACK;');
                    return reject(errOrder);
                  }

                  // Load order items to restore stock
                  dbInstance.all(
                    `SELECT product_id, product_name, quantity FROM order_items WHERE order_id = ?`,
                    [refund.order_id],
                    (errItems, items) => {
                      if (errItems) {
                        dbInstance.run('ROLLBACK;');
                        return reject(errItems);
                      }

                      let itemErrors = null;
                      let processed = 0;

                      if (!items || items.length === 0) {
                        finalizeRefund();
                        return;
                      }

                      items.forEach(item => {
                        dbInstance.get(`SELECT stock FROM products WHERE id = ?`, [item.product_id], (errGetStock, row) => {
                          if (errGetStock) itemErrors = errGetStock;
                          const beforeStock = row ? (parseFloat(row.stock) || 0) : 0;
                          const afterStock = beforeStock + parseFloat(item.quantity);

                          // Revert stock
                          dbInstance.run(
                            `UPDATE products SET stock = ? WHERE id = ?`,
                            [afterStock, item.product_id],
                            (errStock) => {
                              if (errStock) itemErrors = errStock;

                              // Log inventory log as 'Stock In' with before/after audit tracking
                              dbInstance.run(
                                `INSERT INTO inventory_logs (product_name, type, quantity, note, date, before_stock, after_stock, order_id, user, reason) VALUES (?, 'Stock In', ?, ?, ?, ?, ?, ?, 'Admin', 'Refund')`,
                                [item.product_name, parseFloat(item.quantity), `Refund (Order #${refund.order_id})`, nowStr, beforeStock, afterStock, refund.order_id],
                                (errLog) => {
                                  if (errLog) itemErrors = errLog;
                                  processed++;
                                  if (processed === items.length) {
                                    finalizeRefund();
                                  }
                                }
                              );
                            }
                          );
                        });
                      });

                      function finalizeRefund() {
                        if (itemErrors) {
                          dbInstance.run('ROLLBACK;');
                          return reject(itemErrors);
                        }

                        // Free table if Dine-In
                        dbInstance.get(
                          `SELECT order_type, table_id FROM orders WHERE id = ?`,
                          [refund.order_id],
                          (errTbl, order) => {
                            if (!errTbl && order && order.order_type === 'Dine-In' && order.table_id) {
                              dbInstance.run(
                                `UPDATE tables SET status = 'Available' WHERE id = ?`,
                                [order.table_id],
                                (errTblUpdate) => {
                                  completeCommit();
                                }
                              );
                            } else {
                              completeCommit();
                            }
                          }
                        );
                      }

                      function completeCommit() {
                        dbInstance.run('COMMIT;', (errCommit) => {
                          if (errCommit) {
                            dbInstance.run('ROLLBACK;');
                            return reject(errCommit);
                          }
                          resolve({ id: refundId, ...refund, date: nowStr });
                        });
                      }
                    }
                  );
                }
              );
            }
          );
        });
      }
    });
  },

  deleteRefund: (id) => {
    return new Promise((resolve, reject) => {
      if (dbType === 'json') {
        if (!jsonDb.data.refunds) jsonDb.data.refunds = [];
        jsonDb.data.refunds = jsonDb.data.refunds.filter(r => r.id !== parseInt(id));
        jsonDb.save();
        resolve(true);
      } else {
        dbInstance.run(`DELETE FROM refunds WHERE id = ?`, [id], function(err) {
          if (err) reject(err); else resolve(true);
        });
      }
    });
  },

  // --- LEGACY MENU MIGRATION & PORTABLE BACKUP ENGINE ---

  detectLegacyData: () => {
    return new Promise(async (resolve) => {
      const candidates = [];
      
      // Candidate 1: Check AppData / UserData paths
      try {
        const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : '/var/local');
        const localAppData = process.env.LOCALAPPDATA || appData;
        
        const possibleDirs = [
          path.join(appData, 'AR_Shanwari'),
          path.join(appData, 'ar_shanwari'),
          path.join(appData, 'pos-system'),
          path.join(appData, 'frontend'),
          path.join(localAppData, 'AR_Shanwari'),
          path.join(localAppData, 'Programs', 'ar_shanwari'),
          userDataPath,
          __dirname
        ];

        const possibleFilenames = [
          'pos.db',
          'pos_database.db',
          'database.sqlite',
          'ar_shinwari_legacy.db',
          'ar_shanwari.db',
          'pos_data.json',
          'pos_legacy.json',
          'pos_legacy.db',
          'ar_shinwari_db.json',
          'ar_shanwari_db.json',
          'pos_backup.json',
          'menu_backup.json'
        ];

        for (const dir of possibleDirs) {
          if (fs.existsSync(dir)) {
            for (const f of possibleFilenames) {
              const fullP = path.join(dir, f);
              if (fs.existsSync(fullP) && path.resolve(fullP) !== path.resolve(dbPath) && path.resolve(fullP) !== path.resolve(jsonDbPath)) {
                if (!candidates.includes(fullP)) candidates.push(fullP);
              }
            }
          }
        }
      } catch (e) {}

      // Inspect each candidate
      for (const candPath of candidates) {
        try {
          const stats = fs.statSync(candPath);
          if (stats.size > 100) {
            // Check if JSON
            if (candPath.endsWith('.json')) {
              const text = fs.readFileSync(candPath, 'utf8');
              if (text.trim().startsWith('{')) {
                const parsed = JSON.parse(text);
                const prods = parsed.products || [];
                const cats = parsed.categories || [];
                if (prods.length > 0 || cats.length > 0) {
                  const imageCount = prods.filter(p => p.image && p.image.trim() !== '').length;
                  return resolve({
                    detected: true,
                    sourcePath: candPath,
                    type: 'json',
                    counts: {
                      categories: cats.length,
                      products: prods.length,
                      images: imageCount,
                      units: (parsed.units || []).length,
                      tables: (parsed.tables || []).length
                    },
                    sampleProducts: prods.slice(0, 5).map(p => p.name)
                  });
                }
              }
            } else {
              // Check if SQLite
              const inspection = await new Promise((res) => {
                const sqlite3 = require('sqlite3').verbose();
                const tempDb = new sqlite3.Database(candPath, sqlite3.OPEN_READONLY, async (errOpen) => {
                  if (errOpen) return res(null);
                  try {
                    const getCount = (table) => new Promise((r) => {
                      tempDb.get(`SELECT count(*) as count FROM ${table}`, (err, row) => r(err ? 0 : (row ? row.count : 0)));
                    });
                    const [products, categories, units, tables] = await Promise.all([
                      getCount('products'),
                      getCount('categories'),
                      getCount('units'),
                      getCount('tables')
                    ]);

                    let sampleProds = [];
                    let imageCount = 0;
                    if (products > 0) {
                      sampleProds = await new Promise(r => {
                        tempDb.all(`SELECT name, image FROM products LIMIT 10`, [], (err, rows) => {
                          if (!err && rows) {
                            imageCount = rows.filter(rw => rw.image && rw.image.trim() !== '').length;
                            r(rows.map(rw => rw.name));
                          } else r([]);
                        });
                      });
                    }

                    tempDb.close(() => {
                      if (products > 0 || categories > 0) {
                        res({
                          detected: true,
                          sourcePath: candPath,
                          type: 'sqlite',
                          counts: { categories, products, images: imageCount, units, tables },
                          sampleProducts: sampleProds.slice(0, 5)
                        });
                      } else {
                        res(null);
                      }
                    });
                  } catch (e) {
                    tempDb.close(() => res(null));
                  }
                });
              });

              if (inspection) return resolve(inspection);
            }
          }
        } catch (e) {}
      }

      resolve({ detected: false });
    });
  },

  migrateLegacyData: (options = {}) => {
    return new Promise(async (resolve, reject) => {
      const { sourcePath, sourceData, mode = 'menu_only', duplicateHandling = 'merge' } = options;
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Step 1: Automatic Pre-Migration Backup
      const backupsDir = path.join(userDataPath, 'backups');
      if (!fs.existsSync(backupsDir)) {
        try { fs.mkdirSync(backupsDir, { recursive: true }); } catch (e) {}
      }
      const backupFile = path.join(backupsDir, `pre_migration_backup_${Date.now()}.${dbType === 'json' ? 'json' : 'db'}`);
      try {
        if (dbType === 'json') {
          fs.writeFileSync(backupFile, JSON.stringify(jsonDb.data, null, 2));
        } else if (fs.existsSync(dbPath)) {
          fs.copyFileSync(dbPath, backupFile);
        }
      } catch (errBackup) {
        console.error('Warning: Failed to create pre-migration backup:', errBackup);
      }

      // Step 2: Read source data
      let srcCategories = [];
      let srcProducts = [];
      let srcUnits = [];
      let srcTables = [];
      let srcSettings = {};

      try {
        if (sourceData) {
          srcCategories = sourceData.categories || [];
          srcProducts = sourceData.products || [];
          srcUnits = sourceData.units || [];
          srcTables = sourceData.tables || [];
          srcSettings = sourceData.settings || {};
        } else if (sourcePath) {
          if (sourcePath.endsWith('.json')) {
            const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
            srcCategories = raw.categories || [];
            srcProducts = raw.products || [];
            srcUnits = raw.units || [];
            srcTables = raw.tables || [];
            srcSettings = raw.settings || {};
          } else {
            // Read SQLite database
            const sqlite3 = require('sqlite3').verbose();
            const tempDb = new sqlite3.Database(sourcePath, sqlite3.OPEN_READONLY);
            const getAll = (sql) => new Promise((res) => {
              tempDb.all(sql, [], (err, rows) => res(err ? [] : (rows || [])));
            });

            srcCategories = await getAll(`SELECT * FROM categories`);
            srcProducts = await getAll(`SELECT * FROM products`);
            srcUnits = await getAll(`SELECT * FROM units`);
            srcTables = await getAll(`SELECT * FROM tables`);
            const settingsRows = await getAll(`SELECT * FROM settings`);
            settingsRows.forEach(r => { srcSettings[r.key] = r.value; });

            await new Promise(r => tempDb.close(r));
          }
        } else {
          return reject(new Error('No sourcePath or sourceData provided for migration.'));
        }

        let importedCategories = 0;
        let importedProducts = 0;
        let importedUnits = 0;
        let importedTables = 0;
        let importedImages = 0;
        const warnings = [];

        // Migrate in current DB
        const existingCats = await db.getCategories();
        const existingUnits = await db.getUnits();
        const existingProds = await db.getProducts();
        const existingTables = await db.getTables();

        // 1. Categories
        for (const cat of srcCategories) {
          const catName = typeof cat === 'string' ? cat : (cat?.name || '');
          if (catName && !existingCats.some(c => (c?.name || '').toLowerCase() === catName.toLowerCase())) {
            await db.createCategory(catName);
            importedCategories++;
          }
        }

        // 2. Units
        for (const u of srcUnits) {
          const uName = typeof u === 'string' ? u : (u?.name || '');
          if (uName && !existingUnits.some(eu => (eu?.name || '').toLowerCase() === uName.toLowerCase())) {
            await db.createUnit(uName);
            importedUnits++;
          }
        }

        // 3. Products
        for (const p of srcProducts) {
          try {
            const pName = p?.name;
            if (!pName) continue;

            const existing = existingProds.find(ep => (ep?.name || '').toLowerCase() === pName.toLowerCase());
            const price = parseFloat(p.price || 0);
            const cost_price = parseFloat(p.cost_price || 0);
            const low_stock_threshold = parseFloat(p.low_stock_threshold !== undefined ? p.low_stock_threshold : 10);
            const category = p.category || (existingCats[0] ? existingCats[0].name : 'General');
            const unit = p.unit || 'Piece';
            const available = p.available !== undefined ? p.available : 1;
            const image = p.image || '';
            const urdu = p.urdu || '';
            if (image) importedImages++;

            if (existing) {
              if (duplicateHandling === 'merge' || duplicateHandling === 'overwrite') {
                await db.updateProduct(existing.id, {
                  ...existing,
                  price,
                  cost_price: cost_price > 0 ? cost_price : (existing.cost_price || 0),
                  category,
                  unit,
                  available,
                  image: image || existing.image,
                  urdu: urdu || existing.urdu,
                  low_stock_threshold
                });
                importedProducts++;
              }
            } else {
              // New product starts with 0 stock by default
              const stock = mode === 'full' && p.stock !== undefined ? parseFloat(p.stock) : 0;
              await db.createProduct({
                name: pName,
                price,
                cost_price,
                low_stock_threshold,
                category,
                unit,
                available,
                image,
                urdu,
                stock
              });
              importedProducts++;
            }
          } catch (errP) {
            warnings.push(`Product ${p.name || 'Unknown'}: ${errP.message}`);
          }
        }

        // 4. Tables
        for (const t of srcTables) {
          const tNum = t.table_number || t.number || t.name;
          if (tNum && !existingTables.some(et => (et.table_number || et.name) === tNum)) {
            await db.createTable({
              table_number: tNum,
              capacity: t.capacity || 4,
              status: t.status || 'Available'
            });
            importedTables++;
          }
        }

        // 5. Compatible Appearance & Menu Settings
        if (srcSettings && Object.keys(srcSettings).length > 0) {
          const currentSettings = await db.getSettings();
          const mergedSettings = { ...currentSettings };
          const copyKeys = ['category_order', 'product_order', 'menu_appearance', 'restaurant_name', 'subtitle', 'address', 'phone', 'receipt_footer_msg', 'tax_inclusive'];
          copyKeys.forEach(k => {
            if (srcSettings[k] !== undefined && srcSettings[k] !== null && srcSettings[k] !== '') {
              mergedSettings[k] = srcSettings[k];
            }
          });
          await db.updateSettings(mergedSettings);
        }

        resolve({
          success: true,
          mode,
          backupFile,
          imported: {
            categories: importedCategories,
            products: importedProducts,
            units: importedUnits,
            tables: importedTables,
            images: importedImages
          },
          warnings
        });
      } catch (errMigrate) {
        reject(errMigrate);
      }
    });
  },

  exportPortableMenu: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const [categories, products, units, tables, settings] = await Promise.all([
          db.getCategories(),
          db.getProducts(),
          db.getUnits(),
          db.getTables(),
          db.getSettings()
        ]);

        const menuPackage = {
          version: '2.0',
          app: 'AR Shinwari Hujra POS',
          export_date: new Date().toISOString(),
          categories,
          products: products.map(p => ({
            name: p.name,
            urdu: p.urdu || '',
            price: parseFloat(p.price || 0),
            cost_price: parseFloat(p.cost_price || 0),
            low_stock_threshold: parseFloat(p.low_stock_threshold || 10),
            category: p.category,
            unit: p.unit || 'Piece',
            available: p.available !== undefined ? p.available : 1,
            image: p.image || ''
          })),
          units,
          tables,
          settings: {
            restaurant_name: settings.restaurant_name,
            subtitle: settings.subtitle,
            address: settings.address,
            phone: settings.phone,
            delivery_phone: settings.delivery_phone,
            category_order: settings.category_order,
            product_order: settings.product_order,
            menu_appearance: settings.menu_appearance,
            receipt_templates: settings.receipt_templates,
            taxes: settings.taxes,
            discounts: settings.discounts
          }
        };

        resolve(menuPackage);
      } catch (err) {
        reject(err);
      }
    });
  },

  validateMenuPackage: (pkg) => {
    if (!pkg || typeof pkg !== 'object') return { valid: false, error: 'Package must be a JSON object' };
    const data = pkg.data || pkg;
    if (!Array.isArray(data.products)) return { valid: false, error: 'Missing products array' };
    if (!Array.isArray(data.categories)) return { valid: false, error: 'Missing categories array' };
    return { valid: true, counts: { products: data.products.length, categories: data.categories.length, units: (data.units || []).length } };
  },

  exportPortableMenuPackage: async () => {
    const pkg = await db.exportPortableMenu();
    return { success: true, data: pkg };
  },

  importPortableMenuPackage: (menuPackage, options = {}) => {
    const data = menuPackage.data || menuPackage;
    const mode = typeof options === 'string' ? options : (options.mode || 'menu_only');
    return db.importPortableMenu(data, mode);
  },

  importPortableMenu: (menuPackage, mode = 'menu_only') => {
    return new Promise(async (resolve, reject) => {
      const data = menuPackage.data || menuPackage;
      if (!data || !data.products || !data.categories) {
        return reject(new Error('Invalid portable menu package: missing products or categories array.'));
      }
      try {
        const res = await db.migrateLegacyData({
          sourceData: data,
          mode,
          duplicateHandling: 'merge'
        });
        resolve(res);
      } catch (err) {
        reject(err);
      }
    });
  },

  // --- RESET INVENTORY TO ZERO WITH SNAPSHOT ROLLBACK ---

  resetInventoryStock: (options = {}) => {
    return new Promise(async (resolve, reject) => {
      const { scope = 'all', categoryName, productIds = [], selectedProductIds = [], user = 'Admin', reason = 'Manual Inventory Reset' } = options;
      const effectiveProductIds = productIds.length ? productIds : selectedProductIds;
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Create pre-reset snapshot
      const backupsDir = path.join(userDataPath, 'backups');
      if (!fs.existsSync(backupsDir)) {
        try { fs.mkdirSync(backupsDir, { recursive: true }); } catch (e) {}
      }
      const snapshotFile = path.join(backupsDir, `inventory_reset_snapshot_${Date.now()}.json`);

      try {
        const allProds = await db.getProducts();
        // Filter target products
        let targetProds = [];
        if (scope === 'all') {
          targetProds = allProds.filter(p => (parseFloat(p.stock) || 0) !== 0);
        } else if (scope === 'category') {
          targetProds = allProds.filter(p => p.category === categoryName && (parseFloat(p.stock) || 0) !== 0);
        } else if (scope === 'products') {
          const ids = effectiveProductIds.map(id => parseInt(id));
          targetProds = allProds.filter(p => ids.includes(p.id) && (parseFloat(p.stock) || 0) !== 0);
        }

        // Save exact snapshot of affected products
        const snapshotData = {
          date: nowStr,
          scope,
          categoryName,
          user,
          reason,
          products: targetProds.map(p => ({ id: p.id, name: p.name, stock: parseFloat(p.stock) || 0 }))
        };
        fs.writeFileSync(snapshotFile, JSON.stringify(snapshotData, null, 2), 'utf8');

        let previousTotalStock = 0;
        targetProds.forEach(p => { previousTotalStock += (parseFloat(p.stock) || 0); });

        const returnDetails = targetProds.map(p => ({ id: p.id, name: p.name, previousStock: parseFloat(p.stock) || 0 }));

        if (dbType === 'json') {
          targetProds.forEach(tp => {
            const beforeStock = parseFloat(tp.stock) || 0;
            const pIdx = jsonDb.data.products.findIndex(p => p.id === tp.id);
            if (pIdx !== -1) {
              jsonDb.data.products[pIdx].stock = 0;
            }
            const logId = jsonDb.data.inventory_logs.length > 0 ? Math.max(...jsonDb.data.inventory_logs.map(l => l.id)) + 1 : 1;
            jsonDb.data.inventory_logs.push({
              id: logId,
              product_name: tp.name,
              type: 'Adjustment',
              quantity: beforeStock,
              before_stock: beforeStock,
              after_stock: 0,
              user,
              reason: 'Inventory Reset',
              note: reason,
              date: nowStr
            });
          });
          jsonDb.save();
          resolve({
            success: true,
            affectedCount: targetProds.length,
            previousTotalStock,
            snapshotFile,
            snapshotId: snapshotFile,
            details: returnDetails
          });
        } else {
          dbInstance.serialize(() => {
            dbInstance.run('BEGIN IMMEDIATE TRANSACTION;', (errTx) => {
              if (errTx) return reject(errTx);

              let hasError = null;
              targetProds.forEach(tp => {
                if (hasError) return;
                const beforeStock = parseFloat(tp.stock) || 0;
                dbInstance.run(`UPDATE products SET stock = 0 WHERE id = ?`, [tp.id], (errU) => {
                  if (errU) hasError = errU;
                });
                dbInstance.run(
                  `INSERT INTO inventory_logs (product_name, type, quantity, note, date, before_stock, after_stock, user, reason) VALUES (?, 'Adjustment', ?, ?, ?, ?, 0, ?, 'Inventory Reset')`,
                  [tp.name, beforeStock, reason, nowStr, beforeStock, user],
                  (errL) => {
                    if (errL) hasError = errL;
                  }
                );
              });

              if (hasError) {
                dbInstance.run('ROLLBACK;');
                return reject(hasError);
              }

              dbInstance.run('COMMIT;', (errCommit) => {
                if (errCommit) {
                  dbInstance.run('ROLLBACK;');
                  return reject(errCommit);
                }
                resolve({
                  success: true,
                  affectedCount: targetProds.length,
                  previousTotalStock,
                  snapshotFile,
                  snapshotId: snapshotFile,
                  details: returnDetails
                });
              });
            });
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  resetInventoryToZero: (options = {}) => db.resetInventoryStock(options),

  restoreInventorySnapshot: (snapshotFile) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!fs.existsSync(snapshotFile)) {
          return reject(new Error('Snapshot file not found.'));
        }
        const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
        const productsToRestore = snapshot.products || [];
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

        if (dbType === 'json') {
          productsToRestore.forEach(p => {
            const idx = jsonDb.data.products.findIndex(pr => pr.id === p.id || pr.name === p.name);
            if (idx !== -1) {
              jsonDb.data.products[idx].stock = parseFloat(p.stock);
            }
          });
          jsonDb.save();
          resolve({ success: true, restoredCount: productsToRestore.length });
        } else {
          dbInstance.serialize(() => {
            dbInstance.run('BEGIN IMMEDIATE TRANSACTION;');
            productsToRestore.forEach(p => {
              dbInstance.run(`UPDATE products SET stock = ? WHERE id = ? OR name = ?`, [p.stock, p.id, p.name]);
              dbInstance.run(
                `INSERT INTO inventory_logs (product_name, type, quantity, note, date, before_stock, after_stock, user, reason) VALUES (?, 'Adjustment', ?, 'Snapshot Restored', ?, 0, ?, 'Admin', 'Inventory Rollback')`,
                [p.name, p.stock, nowStr, p.stock]
              );
            });
            dbInstance.run('COMMIT;', (err) => {
              if (err) {
                dbInstance.run('ROLLBACK;');
                reject(err);
              } else {
                resolve({ success: true, restoredCount: productsToRestore.length });
              }
            });
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  close: () => {
    return new Promise((resolve, reject) => {
      if (dbInstance) {
        dbInstance.close((err) => {
          if (err) {
            console.error('Error closing SQLite database connection:', err);
            reject(err);
          } else {
            console.log('SQLite database connection closed cleanly.');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
};

module.exports = db;
