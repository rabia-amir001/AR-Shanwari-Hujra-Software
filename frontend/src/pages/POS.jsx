import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../services/api';
import { getReceiptHtml, getReceiptInnerHtml, getReceiptStyles } from '../utils/receiptGenerator';
import { 
  Search, Trash2, Plus, Minus, Receipt, Clock, Users, Bike, ShoppingBag, 
  ChevronRight, AlertCircle, Printer, X, CreditCard, DollarSign, Wallet, Edit2, Eye, Utensils
} from 'lucide-react';

export default function POS({ currentUser }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [settings, setSettings] = useState({ tax_rate: 0.0, service_charges: 0 }); // Default tax 0%

  const menuAppearance = useMemo(() => {
    if (settings && settings.menu_appearance) {
      try {
        if (typeof settings.menu_appearance === 'string') {
          return JSON.parse(settings.menu_appearance);
        }
        return settings.menu_appearance;
      } catch (e) {}
    }
    return {
      name_language: 'bilingual',
      language_order: 'en_above_ur',
      name_position: 'overlay',
      show_image: true,
      image_size: 'medium',
      image_shape: 'rounded',
      image_border_radius: 8,
      image_fit: 'cover',
      image_spacing: 6,
      card_bg_color: '#FFFFFF',
      card_border_color: '#EFE6DA',
      product_name_color: '#1F130B',
      urdu_name_color: '#E28F46',
      price_color: '#C62828',
      category_btn_shape: 'rounded',
      category_active_color: '#1F130B',
      category_font_size: 11,
      show_price: true,
      price_position: 'bottom',
      price_font_size: 13,
      price_font_weight: '700',
      currency_symbol: 'Rs',
      currency_position: 'prefix',
      visible_elements: { image: true, name_en: true, name_ur: true, price: true, unit: true }
    };
  }, [settings]);
  
  // UI States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('Dine-In'); // Dine-In, Takeaway, Delivery
  
  // Dine-In details (in checkout modal)
  const [selectedTableId, setSelectedTableId] = useState('');
  
  // Takeaway details (in checkout modal)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Delivery details (in checkout modal, all optional)
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [riderName, setRiderName] = useState('');
  
  // Order Basket
  const [cart, setCart] = useState([]);
  const [activeDiscountRate, setActiveDiscountRate] = useState(0.0);
  const [activeTaxRate, setActiveTaxRate] = useState(0.0);
  const [categorySidebarOpen, setCategorySidebarOpen] = useState(() => localStorage.getItem('ar_pos_category_sidebar') !== 'false');
  const [serviceCharges, setServiceCharges] = useState(0);
  const [heldOrders, setHeldOrders] = useState([]);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [extraDetails, setExtraDetails] = useState('');
  
  // Custom dialog overlay states to avoid native dialog window freezes
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showHoldInputModal, setShowHoldInputModal] = useState(false);
  const [holdRefValue, setHoldRefValue] = useState('');
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, Card, Easypaisa, JazzCash, Mixed
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [mixedCashAmount, setMixedCashAmount] = useState(0);
  const [mixedCardAmount, setMixedCardAmount] = useState(0);
  
  // Split Bill Modal
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

  // Recent Orders Modal States
  const [showRecentOrdersModal, setShowRecentOrdersModal] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [recentSearchQuery, setRecentSearchQuery] = useState('');
  const [recentOrderTypeFilter, setRecentOrderTypeFilter] = useState('All');
  
  // Receipt Printing state
  const [receiptToPrint, setReceiptToPrint] = useState(null);
  const [printCopies, setPrintCopies] = useState(1);
  
  const printAreaRef = useRef(null);

  const getTaxesList = () => {
    try {
      if (settings.taxes) {
        return JSON.parse(settings.taxes);
      }
    } catch (e) {
      console.error('Error parsing taxes settings:', e);
    }
    return [
      { name: 'No Tax (0%)', rate: 0.0 },
      { name: 'Punjab GST Dining (16%)', rate: 16.0 },
      { name: 'Punjab GST Card (5%)', rate: 5.0 },
      { name: 'KPK GST Dining (15%)', rate: 15.0 },
      { name: 'Sindh GST Dining (13%)', rate: 13.0 }
    ];
  };

  const getDiscountsList = () => {
    try {
      if (settings.discounts) {
        return JSON.parse(settings.discounts);
      }
    } catch (e) {
      console.error('Error parsing discounts settings:', e);
    }
    return [
      { name: 'No Discount (0%)', rate: 0.0 },
      { name: 'Special Discount (5%)', rate: 5.0 },
      { name: '10% Discount', rate: 10.0 },
      { name: '15% Discount', rate: 15.0 },
      { name: '20% Discount', rate: 20.0 }
    ];
  };

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const prodList = await api.getProducts();
      setProducts(prodList.filter(p => p.available === 1));

      const catList = await api.getCategories();
      setCategories(catList);

      const tblList = await api.getTables();
      setTables(tblList);

      const sysSettings = await api.getSettings();
      if (sysSettings) {
        setSettings(sysSettings);
        setActiveTaxRate(parseFloat(sysSettings.tax_rate) || 0.0);
      }

      // Sanitize held orders from localStorage against active products and tables
      const saved = localStorage.getItem('held_orders');
      if (saved) {
        try {
          let parsed = JSON.parse(saved);
          let changed = false;

          parsed = parsed.map(order => {
            // 1. Table Sanitization
            if (order.table_id) {
              const tblExists = tblList.some(t => t.id === parseInt(order.table_id));
              if (!tblExists) {
                order.table_id = null;
                order.customer_name = 'Walk-in';
                changed = true;
              }
            }

            // 2. Products Sanitization
            const initialCount = order.items.length;
            order.items = order.items.filter(item => {
              return prodList.some(p => p.id === parseInt(item.product_id));
            });

            if (order.items.length !== initialCount) {
              changed = true;
              // Recalculate totals
              order.subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const discAmt = order.discount_rate > 0 ? (order.subtotal * order.discount_rate / 100) : (order.discount_amount || 0);
              const taxAmt = order.tax_rate > 0 ? ((order.subtotal - discAmt) * order.tax_rate / 100) : 0;
              order.discount_amount = discAmt;
              order.tax_amount = taxAmt;
              order.items_count = order.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
              order.total = order.subtotal - discAmt + taxAmt + (order.service_charges || 0) + (order.delivery_charges || 0);
            }

            return order;
          }).filter(order => order.items.length > 0);

          if (changed) {
            localStorage.setItem('held_orders', JSON.stringify(parsed));
          }
          setHeldOrders(parsed);
        } catch (e) {
          console.error('Error parsing held_orders:', e);
          localStorage.removeItem('held_orders');
          setHeldOrders([]);
        }
      } else {
        setHeldOrders([]);
      }
    } catch (err) {
      console.error('Error loading POS initial data:', err);
    }
  };

  const saveHeldOrders = (orders) => {
    localStorage.setItem('held_orders', JSON.stringify(orders));
    setHeldOrders(orders);
  };

  // Add Item to Cart
  const handleAddToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      const newQty = (parseFloat(existing.quantity) || 0) + 1;
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: newQty, subtotal: newQty * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        urdu: product.urdu || '',
        price: product.price,
        quantity: 1,
        subtotal: product.price
      }]);
    }
  };

  // Modify Qty (+ / -)
  const handleUpdateQty = (productId, change) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const currentQty = parseFloat(item.quantity) || 0;
        const newQty = currentQty + change;
        if (newQty <= 0) return null;
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }).filter(Boolean));
  };

  // Direct manual type quantity change
  const handleDirectQtyChange = (productId, value) => {
    if (value === '') {
      setCart(cart.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: '', subtotal: 0 }
          : item
      ));
      return;
    }

    const qty = parseFloat(value);
    if (isNaN(qty) || qty < 0) return;

    setCart(cart.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: qty, subtotal: qty * item.price }
        : item
    ));
  };

  // Validate qty on input blur
  const handleQtyBlur = (productId, value) => {
    const qty = parseFloat(value);
    if (isNaN(qty) || qty <= 0) {
      setCart(cart.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: 1, subtotal: item.price }
          : item
      ));
    }
  };

  // Remove Item
  const handleRemoveItem = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  // Billing calculation formulas
  const getSubtotal = () => cart.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);
  const getTaxAmount = () => (getSubtotal() * (activeTaxRate / 100));
  const getDiscountAmount = () => (getSubtotal() * (activeDiscountRate / 100));
  const getTotal = () => {
    const sub = getSubtotal();
    const tax = getTaxAmount();
    const disc = getDiscountAmount();
    const sCharges = parseFloat(serviceCharges || 0);
    const delCharges = parseFloat(deliveryCharges || 0);
    return Math.max(0, Math.round(sub + tax + sCharges + delCharges - disc));
  };

  // Discard order
  const handleCancelOrder = () => {
    if (cart.length > 0) {
      setShowDiscardConfirm(true);
    } else {
      resetPOS();
    }
  };

  const resetPOS = () => {
    setCart([]);
    setActiveDiscountRate(0.0);
    setServiceCharges(0);
    setExtraDetails('');
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setDeliveryCharges(0);
    setRiderName('');
    setSelectedTableId('');
    setPrintCopies(1);
    setActiveTaxRate(parseFloat(settings.tax_rate) || 0.0);
    setPaymentMethod('Cash');
    setReceivedAmount(0);
    setMixedCashAmount(0);
    setMixedCardAmount(0);
  };

  // Hold Order - Launches modal overlay
  const handleHoldOrder = () => {
    if (!cart.length) return alert('Cannot hold an empty order.');
    
    let defaultRef = '';
    if (selectedTableId) {
      const tbl = tables.find(t => t.id === parseInt(selectedTableId));
      if (tbl) defaultRef = tbl.name;
    } else if (customerName) {
      defaultRef = customerName;
    }
    
    setHoldRefValue(defaultRef);
    setShowHoldInputModal(true);
  };

  // Submit Hold Order from custom modal overlay
  const submitHoldOrder = (e) => {
    if (e) e.preventDefault();
    const refText = holdRefValue.trim() || `Order #${Date.now().toString().slice(-4)}`;
    
    let effectiveOrderType = 'Takeaway';
    if (selectedTableId) {
      effectiveOrderType = 'Dine-In';
    } else if (deliveryAddress || riderName || parseFloat(deliveryCharges || 0) > 0) {
      effectiveOrderType = 'Delivery';
    }

    const newHeld = {
      id: Date.now(),
      hold_reference: refText,
      orderType: effectiveOrderType,
      selectedTableId,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryCharges,
      riderName,
      extraDetails,
      cart,
      activeDiscountRate,
      activeTaxRate,
      serviceCharges,
      total: getTotal(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };

    const updated = [...heldOrders, newHeld];
    saveHeldOrders(updated);
    
    // Set table status to Reserved
    if (selectedTableId) {
      api.updateTableStatus(selectedTableId, 'Reserved').then(() => fetchInitialData());
    }

    alert(`Order held successfully under reference: "${refText}"`);
    resetPOS();
    setShowHoldInputModal(false);
  };

  // Resume (Load) Order
  const handleResumeOrder = (held) => {
    setOrderType(held.orderType || 'Takeaway');
    setSelectedTableId(held.selectedTableId || '');
    setCustomerName(held.customerName || '');
    setCustomerPhone(held.customerPhone || '');
    setDeliveryAddress(held.deliveryAddress || '');
    setDeliveryCharges(held.deliveryCharges || 0);
    setRiderName(held.riderName || '');
    setExtraDetails(held.extraDetails || '');
    setCart(held.cart);
    setActiveDiscountRate(held.activeDiscountRate || 0.0);
    setActiveTaxRate(held.activeTaxRate !== undefined ? held.activeTaxRate : (parseFloat(settings.tax_rate) || 0.0));
    setServiceCharges(held.serviceCharges || 0);
    
    const updated = heldOrders.filter(o => o.id !== held.id);
    saveHeldOrders(updated);
    setShowHeldModal(false);
  };

  // Recent Orders Modal Handlers
  const handleOpenRecentOrders = async () => {
    try {
      const list = await api.getOrders();
      setRecentOrders(list);
      setSelectedOrderDetails(null);
      setShowRecentOrdersModal(true);
    } catch (err) {
      alert('Error loading recent orders: ' + err.message);
    }
  };

  const handleSelectRecentOrder = async (orderId) => {
    try {
      const details = await api.getOrderDetails(orderId);
      setSelectedOrderDetails(details);
    } catch (err) {
      alert('Error fetching order details: ' + err.message);
    }
  };

  const getDailySalesSummary = () => {
    const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const todayOrders = recentOrders.filter(o => o.created_at && o.created_at.startsWith(todayStr));

    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const cashRevenue = todayOrders.filter(o => o.payment_method === 'Cash').reduce((sum, o) => sum + (o.total || 0), 0);
    const cardRevenue = todayOrders.filter(o => o.payment_method === 'Card').reduce((sum, o) => sum + (o.total || 0), 0);
    const digitalRevenue = todayOrders.filter(o => ['Easypaisa', 'JazzCash'].includes(o.payment_method)).reduce((sum, o) => sum + (o.total || 0), 0);
    
    let mixedCash = 0;
    let mixedCard = 0;
    todayOrders.filter(o => o.payment_method === 'Mixed').forEach(o => {
      try {
        const details = JSON.parse(o.payment_details || '{}');
        mixedCash += parseFloat(details.cash || 0);
        mixedCard += parseFloat(details.card || 0);
      } catch (e) {}
    });

    return {
      count: totalOrders,
      revenue: totalRevenue,
      cash: cashRevenue + mixedCash,
      card: cardRevenue + mixedCard,
      digital: digitalRevenue
    };
  };

  // Open Payment modal
  const handleOpenPayment = () => {
    if (!cart.length) return alert('Order basket is empty.');
    const total = getTotal();
    setReceivedAmount(total);
    setMixedCashAmount(Math.round(total / 2));
    setMixedCardAmount(Math.round(total / 2));
    setShowPaymentModal(true);
  };

  // Checkout transaction
  const handleCheckout = async () => {
    const subtotal = getSubtotal();
    const taxAmount = getTaxAmount();
    const discountAmount = getDiscountAmount();
    const total = getTotal();

    // Determine order type and table name (all fields strictly optional)
    let effectiveOrderType = 'Takeaway';
    let tName = '';
    if (selectedTableId) {
      effectiveOrderType = 'Dine-In';
      const tbl = tables.find(t => t.id === parseInt(selectedTableId));
      if (tbl) {
        tName = tbl.name;
      }
    } else if (deliveryAddress || riderName || parseFloat(deliveryCharges || 0) > 0) {
      effectiveOrderType = 'Delivery';
    }

    let cName = customerName;
    if (!cName) {
      if (effectiveOrderType === 'Dine-In' && tName) {
        cName = tName.toLowerCase().startsWith('table') ? tName : `Table ${tName}`;
      } else {
        cName = 'Walk-in';
      }
    }

    // Verify negative stock policy if disallowed
    if (settings.allow_negative_stock === false || settings.allow_negative_stock === 'false') {
      for (const item of cart) {
        const p = products.find(prod => prod.id === parseInt(item.product_id || item.id));
        const availableStock = p ? (p.stock || 0) : 0;
        if (item.quantity > availableStock) {
          alert(`Insufficient stock available for "${item.name}".\nAvailable in stock: ${availableStock}\nRequested: ${item.quantity}\n\nPlease adjust quantity or enable 'Allow Negative Stock' in Settings.`);
          return;
        }
      }
    }

    const paymentDetailsObj = {};
    if (paymentMethod === 'Mixed') {
      paymentDetailsObj.cash = parseFloat(mixedCashAmount);
      paymentDetailsObj.card = parseFloat(mixedCardAmount);
    } else {
      paymentDetailsObj[paymentMethod] = total;
    }

    const orderData = {
      order_type: effectiveOrderType,
      table_id: selectedTableId ? parseInt(selectedTableId) : null,
      customer_name: cName,
      customer_phone: customerPhone || null,
      delivery_address: deliveryAddress || null,
      delivery_charges: parseFloat(deliveryCharges || 0),
      rider_name: riderName || null,
      items_count: cart.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0), 0),
      subtotal: subtotal,
      tax_rate: activeTaxRate,
      tax_amount: taxAmount,
      discount_rate: activeDiscountRate,
      discount_amount: discountAmount,
      service_charges: parseFloat(serviceCharges || 0),
      total: total,
      payment_method: paymentMethod,
      payment_details: JSON.stringify(paymentDetailsObj),
      status: 'Completed',
      created_by: currentUser.name
    };

    try {
      const response = await api.createOrder(orderData, cart);
      
      const receiptData = {
        id: response.id,
        ...orderData,
        table_name: tName,
        customer_name: cName,
        items: cart,
        date: new Date().toLocaleString(),
        isCompleted: true,
        received_amount: receivedAmount,
        change_returned: Math.max(0, receivedAmount - total)
      };

      setPrintCopies(1);
      setReceiptToPrint(receiptData);
      setShowPaymentModal(false);
    } catch (error) {
      alert(`Failed to save order: ${error.message}`);
    }
  };

  // Reprint / Print Bill Receipt Handler
  const handlePrintReceipt = async (receipt, copiesToPrint = 1) => {
    const numCopies = Math.max(1, parseInt(copiesToPrint) || 1);
    const printerName = settings.default_printer || 'System Default';
    const paperSize = settings.paper_size || '80mm';

    const receiptHtml = getReceiptHtml(receipt, settings, paperSize);

    // Spool print task in background using Electron native API
    try {
      if (window.electronAPI && typeof window.electronAPI.printReceipt === 'function') {
        const printSettings = {
          deviceName: printerName,
          paperSize: paperSize,
          customWidth: settings.custom_width || 80,
          topMargin: settings.top_margin || 0,
          bottomMargin: settings.bottom_margin || 0,
          copies: 1
        };
        for (let i = 0; i < numCopies; i++) {
          const res = await window.electronAPI.printReceipt(receiptHtml, printerName, paperSize, printSettings);
          if (!res.success) {
            alert(`Print failed: ${res.error || 'Check print queue'}`);
            break;
          }
        }
      } else {
        // Fallback for web browser testing
        console.log(`Spooling fallback print on browser window (${numCopies} copies)...`);
        for (let i = 0; i < numCopies; i++) {
          const printWindow = window.open('', '_blank', 'width=350,height=600');
          if (printWindow) {
            printWindow.document.write(receiptHtml);
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
          } else {
            alert('Browser blocked pop-up print window.');
            break;
          }
        }
      }
    } catch (err) {
      console.error('Printing error:', err);
      alert(`Print error: ${err.message}`);
    } finally {
      // Auto-reset number of copies to 1 after print action
      setPrintCopies(1);
    }
  };

  // Get Category Tabs in configured order
  const getOrderedCategories = () => {
    if (!categories.length) return [];
    try {
      if (settings.category_order) {
        const order = typeof settings.category_order === 'string' ? JSON.parse(settings.category_order) : settings.category_order;
        if (Array.isArray(order) && order.length > 0) {
          const ordered = [];
          order.forEach(id => {
            const c = categories.find(cat => cat.id === id || cat.name === id);
            if (c) ordered.push(c);
          });
          categories.forEach(cat => {
            if (!ordered.some(o => o.id === cat.id)) ordered.push(cat);
          });
          return ordered;
        }
      }
    } catch (e) {
      console.error('Error parsing category_order:', e);
    }
    return categories;
  };

  // Filter and sort products according to settings
  const filteredProducts = (() => {
    let prods = products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.urdu && p.urdu.includes(searchQuery));
      return matchesCategory && matchesSearch;
    });

    const mode = settings.menu_sorting_mode || 'manual';
    if (mode === 'az') {
      prods.sort((a, b) => a.name.localeCompare(b.name));
    } else if (mode === 'za') {
      prods.sort((a, b) => b.name.localeCompare(a.name));
    } else if (mode === 'price_asc') {
      prods.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (mode === 'price_desc') {
      prods.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (mode === 'newest') {
      prods.sort((a, b) => b.id - a.id);
    } else if (mode === 'oldest') {
      prods.sort((a, b) => a.id - b.id);
    } else if (mode === 'manual' && settings.product_order) {
      try {
        const order = typeof settings.product_order === 'string' ? JSON.parse(settings.product_order) : settings.product_order;
        if (Array.isArray(order) && order.length > 0) {
          const ordered = [];
          order.forEach(id => {
            const p = prods.find(item => item.id === id);
            if (p) ordered.push(p);
          });
          prods.forEach(p => {
            if (!ordered.some(o => o.id === p.id)) ordered.push(p);
          });
          return ordered;
        }
      } catch (e) {
        console.error('Error parsing product_order:', e);
      }
    }
    return prods;
  })();

  return (
    <div style={styles.container}>
      {/* LEFT COLUMN: Order Panel (TALL & spacious cart receipt table - compact) */}
      <div style={styles.orderPanel}>
        
        {/* COMPACT Search box (occupied less space) */}
        <div style={styles.leftSearchBox}>
          <Search size={14} color="#7A695E" />
          <input
            type="text"
            placeholder="Scan/Search product by name/code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.leftSearchInput}
          />
        </div>

        {/* SPACIOUS Basket Cart Table */}
        <div style={styles.cartScrollArea}>
          {cart.length === 0 ? (
            <div style={styles.emptyCartBox}>
              <Receipt size={42} color="#D4C5B9" />
              <p style={{ marginTop: '8px', fontSize: '13px', color: '#7A695E', fontWeight: '500' }}>
                Add items to begin invoice
              </p>
            </div>
          ) : (
            <table style={styles.cartTable}>
              <thead style={styles.cartTableHead}>
                <tr>
                  <th style={{ ...styles.thCell, textAlign: 'left', borderRadius: '6px 0 0 6px' }}>Product</th>
                  <th style={styles.thCell}>Price</th>
                  <th style={styles.thCell}>Qty</th>
                  <th style={{ ...styles.thCell, textAlign: 'right' }}>Total</th>
                  <th style={{ ...styles.thCell, textAlign: 'center', borderRadius: '0 6px 6px 0' }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.product_id} style={styles.cartRow}>
                    <td style={{ textAlign: 'left', padding: '8px 0' }}>
                      <div style={styles.cartItemName}>{item.product_name}</div>
                      {item.urdu && <span style={styles.cartItemUrdu} className="urdu-text">{item.urdu}</span>}
                    </td>
                    <td style={styles.cartCell}>Rs {item.price}</td>
                    <td style={styles.cartCell}>
                      <div style={styles.qtyBox}>
                        <button onClick={() => handleUpdateQty(item.product_id, -1)} style={styles.qtyBtn}><Minus size={10} /></button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleDirectQtyChange(item.product_id, e.target.value)}
                          onBlur={(e) => handleQtyBlur(item.product_id, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          style={styles.qtyNumericInput}
                        />
                        <button onClick={() => handleUpdateQty(item.product_id, 1)} style={styles.qtyBtn}><Plus size={10} /></button>
                      </div>
                    </td>
                    <td style={{ ...styles.cartCell, textAlign: 'right', fontWeight: '600' }}>Rs {item.subtotal}</td>
                    <td style={{ ...styles.cartCell, textAlign: 'center' }}>
                      <button onClick={() => handleRemoveItem(item.product_id)} style={styles.deleteBtn}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* REDUCED & COMPACT Billing summary area */}
        <div style={styles.totalsSummaryArea}>
          <div style={styles.summaryGridRow}>
            <span>Items: <strong style={{ color: '#1F130B' }}>{cart.reduce((acc, i) => acc + (parseFloat(i.quantity) || 0), 0)}</strong></span>
            <span>Total: <strong style={{ color: '#1F130B' }}>Rs {getSubtotal()}</strong></span>
          </div>

          <div style={styles.summaryGridRow}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Order Tax:
              <select
                value={activeTaxRate}
                onChange={(e) => setActiveTaxRate(parseFloat(e.target.value) || 0)}
                style={{
                  border: '1px solid #EFE6DA',
                  borderRadius: '6px',
                  padding: '2px 4px',
                  fontSize: '11px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  color: '#1F130B',
                  fontWeight: '600',
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
              >
                {getTaxesList().map((t, idx) => (
                  <option key={idx} value={t.rate}>
                    {t.name} ({t.rate}%)
                  </option>
                ))}
              </select>
            </span>
            <span>Rs {Math.round(getTaxAmount())}</span>
          </div>

          <div style={styles.summaryGridRow}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Discount:
              <select
                value={activeDiscountRate}
                onChange={(e) => setActiveDiscountRate(parseFloat(e.target.value) || 0)}
                style={{
                  border: '1px solid #EFE6DA',
                  borderRadius: '6px',
                  padding: '2px 4px',
                  fontSize: '11px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  color: '#1F130B',
                  fontWeight: '600',
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
              >
                {getDiscountsList().map((d, idx) => (
                  <option key={idx} value={d.rate}>
                    {d.name} ({d.rate}%)
                  </option>
                ))}
              </select>
            </span>
            <span>Rs {Math.round(getDiscountAmount())}</span>
          </div>

          {parseFloat(deliveryCharges || 0) > 0 && (
            <div style={styles.summaryGridRow}>
              <span>Delivery Charges:</span>
              <span>Rs {deliveryCharges}</span>
            </div>
          )}

          {/* Compact visual bar for total payable */}
          <div style={styles.totalPayableBar}>
            <span>Total Payable:</span>
            <span style={{ fontSize: '16px', fontWeight: '800' }}>Rs {getTotal()}</span>
          </div>
        </div>

        {/* BOTTOM ACTION PANEL */}
        <div style={styles.actionButtonsGrid}>
          {/* Column 1: Hold & Cancel */}
          <div style={styles.actionCol}>
            <button onClick={handleHoldOrder} style={{ ...styles.actionBtn, backgroundColor: '#E28F46', color: '#FFF' }}>
              Hold
            </button>
            <button onClick={handleCancelOrder} style={{ ...styles.actionBtn, backgroundColor: '#D32F2F', color: '#FFF' }}>
              Cancel
            </button>
          </div>

          {/* Column 2: Order & Bill */}
          <div style={styles.actionCol}>
            <button onClick={handleOpenPayment} style={{ ...styles.actionBtn, backgroundColor: '#1E88E5', color: '#FFF' }}>
              Order
            </button>
            <button 
              onClick={() => {
                if (cart.length > 0) {
                  let tName = '';
                  if (selectedTableId) {
                    const tbl = tables.find(t => t.id === parseInt(selectedTableId));
                    if (tbl) tName = tbl.name;
                  }
                  const previewReceipt = {
                    id: 'PREVIEW',
                    order_type: selectedTableId ? 'Dine-In' : (deliveryAddress || riderName || parseFloat(deliveryCharges || 0) > 0 ? 'Delivery' : 'Takeaway'),
                    customer_name: customerName || (tName ? (tName.toLowerCase().startsWith('table') ? tName : `Table ${tName}`) : 'Walk-in'),
                    customer_phone: customerPhone || null,
                    delivery_address: deliveryAddress || null,
                    rider_name: riderName || null,
                    table_name: tName || null,
                    items_count: cart.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0), 0),
                    subtotal: getSubtotal(),
                    tax_rate: activeTaxRate,
                    tax_amount: getTaxAmount(),
                    discount_amount: getDiscountAmount(),
                    service_charges: serviceCharges,
                    delivery_charges: parseFloat(deliveryCharges || 0),
                    total: getTotal(),
                    items: cart,
                    date: new Date().toLocaleString(),
                    isCompleted: false
                  };
                  setPrintCopies(1);
                  setReceiptToPrint(previewReceipt);
                } else alert('Cart is empty.');
              }}
              style={{ ...styles.actionBtn, backgroundColor: '#1E88E5', color: '#FFF' }}
            >
              Bill
            </button>
          </div>

          {/* Column 3: Tall Payment Button */}
          <button onClick={handleOpenPayment} style={styles.tallPaymentBtn}>
            Payment
          </button>
        </div>

        {/* Split bill trigger */}
        {cart.length > 0 && (
          <button onClick={() => setShowSplitModal(true)} style={styles.splitBillTextBtn}>
            Split Invoice Total
          </button>
        )}
      </div>

      {/* RIGHT COLUMN: Product display catalog */}
      <div style={styles.catalogPanel}>
        {/* Main Content Area */}
        <div style={styles.catalogMain}>
          {/* Top Actions Row: Show Categories, Holds, Recent Bills */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <button 
              type="button"
              onClick={() => {
                const nextVal = !categorySidebarOpen;
                setCategorySidebarOpen(nextVal);
                localStorage.setItem('ar_pos_category_sidebar', String(nextVal));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: categorySidebarOpen ? '#FAF6F0' : '#FFFFFF',
                color: '#1F130B',
                border: '1px solid #EFE6DA',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <span>🍴 {categorySidebarOpen ? 'Hide Categories' : 'Show Categories'}</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setShowHeldModal(true)} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: '#7A695E',
                  border: '1px solid #EFE6DA',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Clock size={14} />
                <span>Holds ({heldOrders.length})</span>
              </button>
              
              <button 
                type="button"
                onClick={handleOpenRecentOrders} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#1E88E5',
                  color: '#FFFFFF',
                  border: '1px solid #1E88E5',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Receipt size={14} />
                <span>Recent Bills</span>
              </button>
            </div>
          </div>

          {/* Product cards grid */}
          <div style={{
            ...styles.catalogGrid,
            display: 'grid',
            gridTemplateColumns: menuAppearance.grid_columns === 'custom'
              ? `repeat(${menuAppearance.grid_custom_columns || 4}, minmax(0, 1fr))`
              : menuAppearance.grid_columns && menuAppearance.grid_columns !== 'auto'
              ? `repeat(${menuAppearance.grid_columns}, minmax(0, 1fr))`
              : `repeat(auto-fill, minmax(${menuAppearance.card_min_width || 140}px, 1fr))`,
            columnGap: `${menuAppearance.card_gap_x || 10}px`,
            rowGap: `${menuAppearance.card_gap_y || 10}px`,
            justifyItems: menuAppearance.grid_alignment || 'stretch'
          }}>
            {filteredProducts.map(prod => {
              const imgHeight = menuAppearance.image_size === 'compact' ? '55px' : menuAppearance.image_size === 'large' ? '110px' : menuAppearance.image_size === 'full' ? '135px' : menuAppearance.image_size === 'custom' ? `${menuAppearance.image_height || 80}px` : '80px';
              const imgRadius = menuAppearance.image_shape === 'square' ? '0px' : menuAppearance.image_shape === 'pill' ? '20px' : menuAppearance.image_shape === 'circle' ? '50%' : `${menuAppearance.image_border_radius || 8}px`;
              const priceStr = menuAppearance.currency_position === 'suffix' ? `${prod.price} ${menuAppearance.currency_symbol || 'Rs'}` : `${menuAppearance.currency_symbol || 'Rs'} ${prod.price}`;
              const cardShadowVal = menuAppearance.card_shadow === 'none' ? 'none' : menuAppearance.card_shadow === 'lg' ? 'var(--shadow-lg)' : menuAppearance.card_shadow === 'md' ? 'var(--shadow-md)' : 'var(--shadow-sm)';

              return (
                <div 
                  key={prod.id} 
                  style={{
                    ...styles.productTile,
                    width: menuAppearance.card_width_type === 'custom' ? `${menuAppearance.card_width || 175}px` : 'auto',
                    height: menuAppearance.card_height_type === 'custom' ? `${menuAppearance.card_height || 220}px` : 'auto',
                    backgroundColor: menuAppearance.card_bg_color || '#FFFFFF',
                    border: menuAppearance.card_border_on !== false ? `${menuAppearance.card_border_width || 1}px ${menuAppearance.card_border_style || 'solid'} ${menuAppearance.card_border_color || '#EFE6DA'}` : 'none',
                    borderRadius: `${menuAppearance.card_border_radius || 10}px`,
                    padding: `${menuAppearance.card_padding_top ?? 8}px ${menuAppearance.card_padding_right ?? 8}px ${menuAppearance.card_padding_bottom ?? 8}px ${menuAppearance.card_padding_left ?? 8}px`,
                    boxShadow: cardShadowVal,
                    gap: `${menuAppearance.image_spacing || 6}px`
                  }}
                  onClick={() => handleAddToCart(prod)}
                >
                  {/* Name Above Image option */}
                  {menuAppearance.name_position === 'above_image' && (
                    <div style={{ width: '100%', textAlign: menuAppearance.name_en_align || 'center' }}>
                      {menuAppearance.name_language !== 'ur' && (
                        <div style={{ fontSize: `${menuAppearance.name_en_font_size || 12}px`, fontWeight: menuAppearance.name_en_font_weight || '700', color: menuAppearance.product_name_color || '#1F130B', lineHeight: '1.25', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {prod.name}
                        </div>
                      )}
                      {menuAppearance.name_language !== 'en' && prod.urdu && (
                        <div style={{ fontSize: `${menuAppearance.name_ur_font_size || 12}px`, fontWeight: menuAppearance.name_ur_font_weight || '700', color: menuAppearance.urdu_name_color || '#E28F46', marginTop: '2px', lineHeight: '1.25', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', textAlign: menuAppearance.name_ur_align || 'center' }}>
                          {prod.urdu}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Image */}
                  {menuAppearance.show_image !== false && (
                    <div style={{
                      ...styles.productImageContainer,
                      height: imgHeight,
                      borderRadius: imgRadius,
                      position: 'relative'
                    }}>
                      {prod.image && (prod.image.startsWith('/') || prod.image.startsWith('data:image')) ? (
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          style={{
                            ...styles.productImg,
                            borderRadius: imgRadius,
                            objectFit: menuAppearance.image_fit || 'cover'
                          }} 
                        />
                      ) : (
                        <div style={styles.productPlaceholderEmoji}>
                          <Utensils size={28} color="#7A695E" />
                        </div>
                      )}
                      
                      {/* English/Urdu Name Bottom Overlay on Image */}
                      {menuAppearance.name_position === 'overlay' && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
                          color: '#FFFFFF',
                          padding: '6px 4px',
                          fontSize: `${menuAppearance.name_en_font_size || 11}px`,
                          fontWeight: '700',
                          lineHeight: '1.25',
                          textAlign: menuAppearance.name_en_align || 'center',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word'
                        }}>
                          {menuAppearance.language_order === 'ur_above_en' && menuAppearance.name_language === 'bilingual' && prod.urdu
                            ? prod.urdu 
                            : prod.name}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Name Below Image option */}
                  {menuAppearance.name_position === 'below_image' && (
                    <div style={{ width: '100%', textAlign: menuAppearance.name_en_align || 'center', minHeight: '34px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {menuAppearance.language_order === 'ur_above_en' ? (
                        <>
                          {menuAppearance.name_language !== 'en' && prod.urdu && (
                            <div style={{ fontSize: `${menuAppearance.name_ur_font_size || 11}px`, fontWeight: menuAppearance.name_ur_font_weight || '700', color: menuAppearance.urdu_name_color || '#E28F46', lineHeight: '1.25', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', textAlign: menuAppearance.name_ur_align || 'center' }}>
                              {prod.urdu}
                            </div>
                          )}
                          {menuAppearance.name_language !== 'ur' && (
                            <div style={{ fontSize: `${menuAppearance.name_en_font_size || 11}px`, fontWeight: menuAppearance.name_en_font_weight || '800', color: menuAppearance.product_name_color || '#1F130B', marginTop: '1px', lineHeight: '1.25', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', textAlign: menuAppearance.name_en_align || 'center' }}>
                              {prod.name}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {menuAppearance.name_language !== 'ur' && (
                            <div style={{ fontSize: `${menuAppearance.name_en_font_size || 11}px`, fontWeight: menuAppearance.name_en_font_weight || '800', color: menuAppearance.product_name_color || '#1F130B', lineHeight: '1.25', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', textAlign: menuAppearance.name_en_align || 'center' }}>
                              {prod.name}
                            </div>
                          )}
                          {menuAppearance.name_language !== 'en' && prod.urdu && (
                            <div style={{ fontSize: `${menuAppearance.name_ur_font_size || 11}px`, fontWeight: menuAppearance.name_ur_font_weight || '700', color: menuAppearance.urdu_name_color || '#E28F46', marginTop: '1px', lineHeight: '1.25', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', textAlign: menuAppearance.name_ur_align || 'center' }}>
                              {prod.urdu}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Overlay secondary Urdu below image if overlay mode */}
                  {menuAppearance.name_position === 'overlay' && menuAppearance.name_language === 'bilingual' && prod.urdu && (
                    <p style={{
                      fontSize: `${menuAppearance.name_ur_font_size || 11}px`,
                      color: menuAppearance.urdu_name_color || '#E28F46',
                      fontWeight: menuAppearance.name_ur_font_weight || '700',
                      marginTop: '2px',
                      lineHeight: '1.25',
                      textAlign: menuAppearance.name_ur_align || 'center',
                      width: '100%',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }} className="urdu-text" title={prod.urdu}>
                      {menuAppearance.language_order === 'ur_above_en' ? prod.name : prod.urdu}
                    </p>
                  )}

                  {/* Real Stock & Product Code display */}
                  {(menuAppearance.show_stock || menuAppearance.show_product_code) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#7A695E', fontWeight: '700', width: '100%', padding: '0 2px' }}>
                      {menuAppearance.show_product_code && <span>#{prod.id}</span>}
                      {menuAppearance.show_stock && (
                        <span style={{ color: (prod.stock || 0) <= (prod.low_stock_threshold || 5) ? '#C62828' : '#2E7D32' }}>
                          Stock: {prod.stock !== undefined ? prod.stock : 'N/A'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price & Unit Display on Card */}
                  {menuAppearance.show_price !== false && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 2px' }}>
                      <span style={{
                        fontSize: `${menuAppearance.price_font_size || 12}px`,
                        fontWeight: menuAppearance.price_font_weight || '700',
                        color: menuAppearance.price_color || '#C62828'
                      }}>
                        {priceStr}
                      </span>
                      {menuAppearance.visible_elements?.unit !== false && prod.unit && (
                        <span style={{ fontSize: '10px', color: menuAppearance.unit_color || '#7A695E', fontWeight: '600' }}>
                          /{prod.unit}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div style={styles.emptySearchBox}>
                <AlertCircle size={32} color="#7A695E" />
                <p>No catalog products match your query.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Sidebar Navigation (Far Right) */}
        {categorySidebarOpen && (
          <div style={styles.categorySidebar}>
            <button
              onClick={() => setActiveCategory('All')}
              style={{
                ...styles.catSidebarBtn,
                borderRadius: menuAppearance.category_btn_shape === 'pill' ? '20px' : menuAppearance.category_btn_shape === 'square' ? '0px' : '6px',
                fontSize: `${menuAppearance.category_font_size || 11}px`,
                backgroundColor: activeCategory === 'All' ? (menuAppearance.category_active_bg || '#1F130B') : (menuAppearance.category_btn_bg || '#FFFFFF'),
                color: activeCategory === 'All' ? (menuAppearance.category_active_color || '#FFFFFF') : (menuAppearance.category_btn_color || '#1F130B')
              }}
            >
              All
            </button>
            {getOrderedCategories().map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                style={{
                  ...styles.catSidebarBtn,
                  borderRadius: menuAppearance.category_btn_shape === 'pill' ? '20px' : menuAppearance.category_btn_shape === 'square' ? '0px' : '6px',
                  fontSize: `${menuAppearance.category_font_size || 11}px`,
                  backgroundColor: activeCategory === cat.name ? (menuAppearance.category_active_bg || '#1F130B') : (menuAppearance.category_btn_bg || '#FFFFFF'),
                  color: activeCategory === cat.name ? (menuAppearance.category_active_color || '#FFFFFF') : (menuAppearance.category_btn_color || '#1F130B')
                }}
              >
                <span style={{ fontWeight: '700', textTransform: 'capitalize' }}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DISCARD ORDER CONFIRMATION MODAL */}
      {showDiscardConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowDiscardConfirm(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700', color: '#1F130B' }}>Discard Order</h3>
              <button onClick={() => setShowDiscardConfirm(false)} style={styles.closeModalBtn}><X size={18} /></button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ color: '#7A695E', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to discard the current order? This will empty the cart.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button 
                onClick={() => setShowDiscardConfirm(false)} 
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  resetPOS();
                  setShowDiscardConfirm(false);
                }} 
                style={styles.modalSubmitBtn}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOLD ORDER REFERENCE INPUT MODAL */}
      {showHoldInputModal && (
        <div style={styles.modalOverlay} onClick={() => setShowHoldInputModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700', color: '#1F130B' }}>Hold Bill Reference</h3>
              <button onClick={() => setShowHoldInputModal(false)} style={styles.closeModalBtn}><X size={18} /></button>
            </div>
            <form onSubmit={submitHoldOrder}>
              <div style={styles.modalBody}>
                <div style={styles.modalInputGroup}>
                  <label style={styles.modalLabel}>Enter a reference or name for this held bill (e.g. customer name, table #, note):</label>
                  <input
                    type="text"
                    value={holdRefValue}
                    onChange={(e) => setHoldRefValue(e.target.value)}
                    style={styles.modalInputField}
                    placeholder="e.g. Table 4, Zohaik, etc."
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button 
                  type="button" 
                  onClick={() => setShowHoldInputModal(false)} 
                  style={styles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.modalSubmitBtn}
                >
                  Hold Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHECKOUT PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>Order Details & Checkout</h3>
              <button onClick={() => setShowPaymentModal(false)} style={styles.closeModalBtn}><X size={18} /></button>
            </div>

            <div style={styles.modalBody}>
              
              {/* --- ORDER DETAILS SECTION --- */}
              <div style={styles.checkoutMetaSection}>
                <h4 style={styles.modalSubTitle}>Order Details</h4>
                
                {/* Table Number Dropdown at the Top */}
                <div style={styles.modalInputGroup}>
                  <label style={styles.modalLabel}>TABLE NUMBER</label>
                  <select 
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    style={styles.modalSelectField}
                  >
                    <option value="">-- Select Table --</option>
                    {tables.map(tbl => (
                      <option 
                        key={tbl.id} 
                        value={tbl.id}
                        disabled={tbl.status === 'Occupied' && selectedTableId !== String(tbl.id)}
                      >
                        {tbl.name} {tbl.status === 'Occupied' ? '(Occupied)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Name | Phone Number */}
                <div style={{ ...styles.fieldsGridCompactModal, marginTop: '8px' }}>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.modalLabel}>CUSTOMER NAME</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={styles.modalInputField}
                      autoFocus
                    />
                  </div>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.modalLabel}>PHONE NUMBER</label>
                    <input
                      type="text"
                      placeholder="Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={styles.modalInputField}
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div style={{ ...styles.modalInputGroup, marginTop: '8px' }}>
                  <label style={styles.modalLabel}>DELIVERY ADDRESS</label>
                  <input
                    type="text"
                    placeholder="House / Street / Area"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    style={styles.modalInputField}
                  />
                </div>

                {/* Rider Assigned | Delivery Charges */}
                <div style={{ ...styles.fieldsGridCompactModal, marginTop: '8px' }}>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.modalLabel}>RIDER ASSIGNED</label>
                    <input
                      type="text"
                      placeholder="e.g. Asif"
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                      style={styles.modalInputField}
                    />
                  </div>
                  <div style={styles.modalInputGroup}>
                    <label style={styles.modalLabel}>DELIVERY CHARGES (RS)</label>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={deliveryCharges === '' ? '' : deliveryCharges}
                      onChange={(e) => setDeliveryCharges(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                      style={styles.modalInputField}
                    />
                  </div>
                </div>
              </div>

              {/* Due amount info banner */}
              <div style={styles.amountBanner}>
                <p style={{ fontSize: '11px', color: '#7A695E', fontWeight: '700', textTransform: 'uppercase' }}>Grand Total Due</p>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#C62828' }}>Rs {getTotal()}</h2>
              </div>

              {/* Payment Type Grid */}
              <div style={{ marginTop: '12px' }}>
                <label style={styles.modalLabel}>Payment Method</label>
                <div style={styles.methodGrid}>
                  {['Cash', 'Card', 'Easypaisa', 'JazzCash', 'Mixed'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        ...styles.methodBtn,
                        ...(paymentMethod === method ? styles.methodBtnActive : {})
                      }}
                      type="button"
                    >
                      {method === 'Cash' && <DollarSign size={16} />}
                      {method === 'Card' && <CreditCard size={16} />}
                      {method === 'Easypaisa' && <Wallet size={16} />}
                      {method === 'JazzCash' && <Wallet size={16} />}
                      {method === 'Mixed' && <Users size={16} />}
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash entries */}
              {paymentMethod === 'Cash' && (
                <div style={{ marginTop: '12px' }}>
                  <label style={styles.modalLabel}>Amount Received</label>
                  <input
                    type="number"
                    value={receivedAmount === '' ? '' : receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                    onFocus={(e) => e.target.select()}
                    style={styles.modalInput}
                  />

                  {/* Quick cash keys */}
                  <div style={styles.presetButtonsGrid}>
                    {[500, 1000, 2000, 5000].map(val => (
                      <button 
                        key={val} 
                        onClick={() => setReceivedAmount(val)} 
                        style={styles.presetBtn}
                        type="button"
                      >
                        Rs {val}
                      </button>
                    ))}
                    <button onClick={() => setReceivedAmount(getTotal())} style={styles.presetBtn} type="button">Exact</button>
                  </div>

                  <div style={styles.changeBanner}>
                    <span>Cash Return:</span>
                    <span style={{ fontWeight: '800', color: '#2E7D32', fontSize: '16px' }}>
                      Rs {Math.max(0, (parseFloat(receivedAmount) || 0) - getTotal())}
                    </span>
                  </div>
                </div>
              )}

              {/* Mixed Payment entries */}
              {paymentMethod === 'Mixed' && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={styles.modalLabel}>Cash Portion</label>
                    <input
                      type="number"
                      value={mixedCashAmount === '' ? '' : mixedCashAmount}
                      onChange={(e) => {
                        const str = e.target.value;
                        const val = str === '' ? 0 : parseFloat(str) || 0;
                        setMixedCashAmount(str === '' ? '' : val);
                        setMixedCardAmount(Math.max(0, getTotal() - val));
                      }}
                      onFocus={(e) => e.target.select()}
                      style={styles.modalInput}
                    />
                  </div>
                  <div>
                    <label style={styles.modalLabel}>Card Portion</label>
                    <input
                      type="number"
                      value={mixedCardAmount === '' ? '' : mixedCardAmount}
                      onChange={(e) => {
                        const str = e.target.value;
                        const val = str === '' ? 0 : parseFloat(str) || 0;
                        setMixedCardAmount(str === '' ? '' : val);
                        setMixedCashAmount(Math.max(0, getTotal() - val));
                      }}
                      onFocus={(e) => e.target.select()}
                      style={styles.modalInput}
                    />
                  </div>
                  <div style={styles.changeBanner}>
                    <span>Total Accounted:</span>
                    <span style={{ fontWeight: '700' }}>
                      Rs {(parseFloat(mixedCashAmount) || 0) + (parseFloat(mixedCardAmount) || 0)} / Rs {getTotal()}
                    </span>
                  </div>
                </div>
              )}

              {/* Digital transfers */}
              {(paymentMethod === 'Card' || paymentMethod === 'Easypaisa' || paymentMethod === 'JazzCash') && (
                <div style={styles.digitalInfoBox}>
                  <p>Process QR scan/POS machine card transaction.</p>
                  <p style={{ fontSize: '11px', color: '#7A695E', marginTop: '4px' }}>Once approved, click complete below to finish sale.</p>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowPaymentModal(false)} style={styles.modalCancelBtn}>Cancel</button>
              <button 
                onClick={handleCheckout} 
                style={styles.modalSubmitBtn}
                disabled={paymentMethod === 'Mixed' && (parseFloat(mixedCashAmount) + parseFloat(mixedCardAmount) !== getTotal())}
              >
                Complete Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELD BILLS DIALOG */}
      {showHeldModal && (
        <div style={styles.modalOverlay} onClick={() => setShowHeldModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>Held Bills</h3>
              <button onClick={() => setShowHeldModal(false)} style={styles.closeModalBtn}><X size={18} /></button>
            </div>

            <div style={styles.modalBody}>
              {heldOrders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#7A695E', padding: '20px 0' }}>No held bills.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {heldOrders.map(order => (
                    <div key={order.id} style={styles.suspendedRowCard}>
                      <div>
                        <span style={styles.suspendedRowBadge}>{order.orderType}</span>
                        <strong style={{ marginLeft: '6px', fontSize: '12px' }}>"{order.hold_reference}"</strong>
                        {order.selectedTableId && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#7A695E' }}>(Table {tables.find(t => t.id === parseInt(order.selectedTableId))?.name})</span>}
                        <div style={{ fontSize: '11px', color: '#7A695E', marginTop: '2px' }}>
                          Items: {order.cart.reduce((acc, i) => acc + (parseFloat(i.quantity) || 0), 0)} • Total: Rs {order.total} • {order.time}
                        </div>
                      </div>
                      <button onClick={() => handleResumeOrder(order)} style={styles.suspendedRowBtn}>
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SPLIT BILL DIALOG */}
      {showSplitModal && (
        <div style={styles.modalOverlay} onClick={() => setShowSplitModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>Split Bill Total</h3>
              <button onClick={() => setShowSplitModal(false)} style={styles.closeModalBtn}><X size={18} /></button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.amountBanner}>
                <p>Full Total</p>
                <h2>Rs {getTotal()}</h2>
              </div>
              <div style={{ marginTop: '16px' }}>
                <label style={styles.modalLabel}>Number of Splits</label>
                <input
                  type="number"
                  min="2"
                  value={splitCount}
                  onChange={(e) => setSplitCount(parseInt(e.target.value || 2))}
                  onFocus={(e) => e.target.select()}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.splitResultsBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Each Split Amount:</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#C62828' }}>
                    Rs {Math.round(getTotal() / (splitCount || 2))}
                  </span>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowSplitModal(false)} style={styles.modalCancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {receiptToPrint && (
        <div style={styles.modalOverlay}>
          <div className="receipt-preview-card">
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>Receipt Bill Preview</h3>
              <button
                onClick={() => {
                  setReceiptToPrint(null);
                  setPrintCopies(1);
                  resetPOS();
                  fetchInitialData();
                }}
                style={styles.closeModalBtn}
              >
                <X size={18} />
              </button>
            </div>
            <div className="receipt-preview-scroll">
              {/* Mock Paper Thermal Receipt */}
              <div 
                className="thermal-receipt"
                style={{
                  backgroundColor: '#FFFFFF',
                  margin: '0 auto',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  boxSizing: 'border-box',
                }}
              >
                <style dangerouslySetInnerHTML={{ __html: getReceiptStyles(settings.paper_size || '80mm', false, settings) }} />
                <div 
                  dangerouslySetInnerHTML={{ __html: getReceiptInnerHtml(receiptToPrint, settings, settings.paper_size || '80mm') }}
                />
              </div>
            </div>

            <div className="receipt-preview-footer">
              <button
                type="button"
                className="receipt-footer-btn-close"
                onClick={() => {
                  setReceiptToPrint(null);
                  setPrintCopies(1);
                  resetPOS();
                  fetchInitialData();
                }}
              >
                Close &amp; New Order
              </button>

              {/* Inline Number of Copies Control positioned between the two buttons */}
              <div className="receipt-footer-copies-box">
                <button 
                  type="button" 
                  onClick={() => setPrintCopies(prev => Math.max(1, (parseInt(prev) || 1) - 1))}
                  className="receipt-footer-copies-btn"
                  title="Decrease Copies"
                >
                  <Minus size={13} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={printCopies}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setPrintCopies('');
                    } else {
                      const parsed = parseInt(val);
                      setPrintCopies(isNaN(parsed) || parsed < 1 ? 1 : parsed);
                    }
                  }}
                  onBlur={() => {
                    if (!printCopies || parseInt(printCopies) < 1) {
                      setPrintCopies(1);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  className="receipt-footer-copies-input"
                />
                <button 
                  type="button" 
                  onClick={() => setPrintCopies(prev => (parseInt(prev) || 1) + 1)}
                  className="receipt-footer-copies-btn"
                  title="Increase Copies"
                >
                  <Plus size={13} />
                </button>
              </div>

              <button 
                type="button"
                className="receipt-footer-btn-print"
                onClick={() => {
                  const copies = Math.max(1, parseInt(printCopies) || 1);
                  const targetReceipt = receiptToPrint;
                  setReceiptToPrint(null);
                  setPrintCopies(1);
                  resetPOS();
                  fetchInitialData();
                  if (targetReceipt) {
                    handlePrintReceipt(targetReceipt, copies);
                  }
                }} 
              >
                🖨️ Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECENT ORDERS & DAILY sales summary MODAL */}
      {showRecentOrdersModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRecentOrdersModal(false)}>
          <div style={styles.recentOrdersModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>Recent Bills & Daily record</h3>
              <button onClick={() => setShowRecentOrdersModal(false)} style={styles.closeModalBtn}><X size={18} /></button>
            </div>

            <div style={styles.recentOrdersModalBody}>
              {/* Left Column: Daily sales summary + filters + bills list */}
              <div style={styles.recentLeftPane}>
                
                {/* Daily record card */}
                <div style={styles.dailyRecordBox}>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '3px' }}>
                    Daily Sales Summary
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '12px' }}>
                    <div>Total Orders: <strong>{getDailySalesSummary().count}</strong></div>
                    <div>Daily Revenue: <strong>Rs {getDailySalesSummary().revenue}</strong></div>
                    <div>Cash Revenue: <span style={{ color: '#E8F5E9' }}>Rs {getDailySalesSummary().cash}</span></div>
                    <div>Card Revenue: <span style={{ color: '#E3F2FD' }}>Rs {getDailySalesSummary().card}</span></div>
                  </div>
                </div>

                {/* Filters Row */}
                <div style={styles.recentFiltersBox}>
                  <select 
                    value={recentOrderTypeFilter} 
                    onChange={(e) => setRecentOrderTypeFilter(e.target.value)}
                    style={styles.recentFilterSelect}
                  >
                    <option value="All">All Types</option>
                    <option value="Dine-In">Dine-In</option>
                    <option value="Takeaway">Takeaway</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search by Bill # / Name"
                    value={recentSearchQuery}
                    onChange={(e) => setRecentSearchQuery(e.target.value)}
                    style={styles.recentFilterInput}
                  />
                </div>

                {/* Orders List */}
                <div style={styles.recentOrdersList}>
                  {recentOrders.filter(o => {
                    const matchesType = recentOrderTypeFilter === 'All' || o.order_type === recentOrderTypeFilter;
                    const matchesSearch = !recentSearchQuery || 
                      String(o.id).includes(recentSearchQuery) || 
                      (o.customer_name && o.customer_name.toLowerCase().includes(recentSearchQuery.toLowerCase())) ||
                      (o.customer_phone && o.customer_phone.includes(recentSearchQuery));
                    return matchesType && matchesSearch;
                  }).length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px 0', fontSize: '12px', color: '#7A695E' }}>No bills found.</p>
                  ) : (
                    recentOrders.filter(o => {
                      const matchesType = recentOrderTypeFilter === 'All' || o.order_type === recentOrderTypeFilter;
                      const matchesSearch = !recentSearchQuery || 
                        String(o.id).includes(recentSearchQuery) || 
                        (o.customer_name && o.customer_name.toLowerCase().includes(recentSearchQuery.toLowerCase())) ||
                        (o.customer_phone && o.customer_phone.includes(recentSearchQuery));
                      return matchesType && matchesSearch;
                    }).map(order => (
                      <div 
                        key={order.id} 
                        style={{
                          ...styles.recentOrderRow,
                          ...(selectedOrderDetails?.order?.id === order.id ? styles.recentOrderRowActive : {})
                        }}
                        onClick={() => handleSelectRecentOrder(order.id)}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>Invoice #{order.id}</div>
                          <div style={{ fontSize: '11px', color: '#7A695E', marginTop: '2px' }}>
                            {order.order_type} • {order.customer_name} • {order.created_at ? order.created_at.slice(11, 16) : ''}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '800', color: '#C62828' }}>Rs {order.total}</div>
                          <div style={{ fontSize: '10px', color: '#7A695E' }}>{order.payment_method}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Order Bill Receipt Preview */}
              <div style={styles.recentRightPane}>
                {selectedOrderDetails ? (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px', backgroundColor: '#F5F5F5' }}>
                      <div 
                        className="thermal-receipt"
                        style={{
                          backgroundColor: '#FFFFFF',
                          margin: '0 auto',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          boxSizing: 'border-box',
                        }}
                      >
                        <style dangerouslySetInnerHTML={{ __html: getReceiptStyles(settings.paper_size || '80mm', false, settings) }} />
                        <div 
                          dangerouslySetInnerHTML={{ __html: getReceiptInnerHtml(selectedOrderDetails, settings, settings.paper_size || '80mm') }}
                        />
                      </div>
                    </div>
                    <div style={{ ...styles.modalFooter, borderTop: '1px solid #EFE6DA', paddingTop: '10px' }}>
                      <button 
                        onClick={() => {
                          // Adapt order details object to receiptToPrint schema
                          handlePrintReceipt({
                            id: selectedOrderDetails.order.id,
                            order_type: selectedOrderDetails.order.order_type,
                            customer_name: selectedOrderDetails.order.customer_name,
                            customer_phone: selectedOrderDetails.order.customer_phone,
                            delivery_address: selectedOrderDetails.order.delivery_address,
                            rider_name: selectedOrderDetails.order.rider_name,
                            table_name: selectedOrderDetails.order.customer_name, // table name is stored in customer name for Dine-In database
                            subtotal: selectedOrderDetails.order.subtotal,
                            tax_rate: selectedOrderDetails.order.tax_rate,
                            tax_amount: selectedOrderDetails.order.tax_amount,
                            discount_amount: selectedOrderDetails.order.discount_amount,
                            service_charges: selectedOrderDetails.order.service_charges,
                            delivery_charges: selectedOrderDetails.order.delivery_charges,
                            total: selectedOrderDetails.order.total,
                            created_by: selectedOrderDetails.order.created_by,
                            date: selectedOrderDetails.order.created_at,
                            items: selectedOrderDetails.items.map(i => ({
                              product_id: i.product_id,
                              product_name: i.product_name,
                              quantity: i.quantity,
                              subtotal: i.price * i.quantity
                            }))
                          });
                        }} 
                        style={styles.modalSubmitBtn}
                      >
                        Reprint Bill
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#7A695E', fontSize: '13px' }}>
                    Select a bill invoice from the left panel to load receipt details.
                  </div>
                )}
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button onClick={() => setShowRecentOrdersModal(false)} style={styles.modalCancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPACT STYLING TO MAXIMIZE HEIGHT AND TIGHTEN SUMMARY AREA
const styles = {
  container: {
    display: 'flex',
    height: '100%',
    width: '100%',
    backgroundColor: '#FAF6F0',
    overflow: 'hidden',
  },
  
  // LEFT COLUMN: Cart Billing Panel (Clean, compact top, maximized middle, thin bottom)
  orderPanel: {
    width: '410px',
    backgroundColor: '#FFFFFF',
    boxShadow: '4px 0 20px rgba(31, 19, 11, 0.03)',
    borderRight: '1px solid #EFE6DA',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    height: '100%',
    flexShrink: 0,
    zIndex: 5,
  },
  customerRow: {
    // Removed to make space
  },
  fieldSelect: {
    width: '100%',
    padding: '6px 8px',
    fontSize: '12px',
    border: '1px solid #EFE6DA',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
  },
  iconActionBtn: {
    display: 'none',
  },
  branchLabel: {
    // Removed to make space
  },
  leftSearchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
    padding: '6px 10px',
    gap: '6px',
    marginBottom: '6px',
  },
  leftSearchInput: {
    border: 'none',
    padding: 0,
    fontSize: '13px',
    backgroundColor: 'transparent',
    outline: 'none',
    flex: 1,
  },
  extraDetailsInput: {
    width: '100%',
    padding: '6px 10px',
    fontSize: '13px',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
    marginBottom: '6px',
  },
  leftDynamicInputs: {
    // Hidden
  },

  // Basket cart table area - TALL & spacious
  cartScrollArea: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '6px',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
  },
  emptyCartBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '20px',
    color: '#7A695E',
  },
  cartTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  cartTableHead: {
    backgroundColor: '#1565C0',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  thCell: {
    padding: '8px 10px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cartRow: {
    borderBottom: '1px solid #F6EFE6',
  },
  cartCell: {
    padding: '6px 8px',
    fontSize: '12px',
    verticalAlign: 'middle',
    textAlign: 'center',
  },
  cartItemName: {
    fontWeight: '700',
    color: '#1F130B',
    fontSize: '12px',
  },
  cartItemUrdu: {
    fontSize: '10px',
    color: '#E28F46',
    display: 'block',
    fontWeight: '600',
  },
  qtyBox: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#FAF6F0',
    borderRadius: '6px',
    padding: '2px',
  },
  qtyBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '4px',
    width: '16px',
    height: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#1F130B',
  },
  qtyNumericInput: {
    width: '44px',
    border: '1px solid #EFE6DA',
    borderRadius: '4px',
    padding: '2px 0',
    fontSize: '11px',
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    outline: 'none',
  },
  deleteBtn: {
    color: '#C62828',
    backgroundColor: 'transparent',
    border: 'none',
  },

  // REDUCED & COMPACT Billing summary area
  totalsSummaryArea: {
    backgroundColor: '#FBF9F6',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
    padding: '4px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: '4px',
  },
  summaryGridRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#7A695E',
    fontWeight: '600',
  },
  inlineSummaryInput: {
    width: '50px',
    padding: '1px 3px',
    fontSize: '11px',
    marginLeft: '3px',
    textAlign: 'right',
    border: '1px solid #EFE6DA',
    borderRadius: '4px',
  },
  totalPayableBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C2833',
    color: '#FFFFFF',
    padding: '6px 10px',
    borderRadius: '5px',
    marginTop: '2px',
    fontWeight: '700',
    fontSize: '12px',
  },

  // Bottom action buttons grid
  actionButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1.1fr 0.9fr',
    gap: '6px',
  },
  actionCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  actionBtn: {
    flex: 1,
    padding: '8px 0',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tallPaymentBtn: {
    gridColumn: '3',
    height: '100%',
    backgroundColor: '#2E7D32',
    color: '#FFFFFF',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '800',
    textTransform: 'uppercase',
    boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)',
  },
  splitBillTextBtn: {
    fontSize: '10px',
    color: '#7A695E',
    backgroundColor: 'transparent',
    border: 'none',
    textDecoration: 'underline',
    textAlign: 'center',
    marginTop: '4px',
  },

  // RIGHT COLUMN: Catalog Display
  catalogPanel: {
    flex: 1,
    height: '100%',
    display: 'flex',
  },
  catalogMain: {
    flex: 1,
    padding: '12px 12px 12px 16px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  catalogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  catalogTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1F130B',
  },
  catalogSubtitle: {
    fontSize: '12px',
    color: '#7A695E',
  },
  typeSelectorRow: {
    display: 'flex',
    backgroundColor: '#EFE6DA',
    padding: '3px',
    borderRadius: '8px',
    gap: '2px',
  },
  typeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#7A695E',
    backgroundColor: 'transparent',
    border: 'none',
  },
  typeBadgeActive: {
    backgroundColor: '#C62828',
    color: '#FFFFFF',
  },
  catalogSearchRow: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
    padding: '8px 12px',
    gap: '8px',
    marginBottom: '12px',
  },
  catalogSearchInput: {
    flex: 1,
    border: 'none',
    padding: 0,
    fontSize: '13px',
    backgroundColor: 'transparent',
    outline: 'none',
  },
  heldIndicatorBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#FAF6F0',
    border: '1px solid #EFE6DA',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#7A695E',
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
    paddingBottom: '20px',
  },
  
  // Product tiles (compact cards with images)
  productTile: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '10px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.15s ease',
  },
  productImageContainer: {
    width: '100%',
    height: '105px',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#FAF6F0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '6px',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productPlaceholderEmoji: {
    fontSize: '24px',
  },
  tileName: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1F130B',
    textAlign: 'center',
    lineHeight: '1.2',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
  },
  tileUrdu: {
    fontSize: '10px',
    color: '#E28F46',
    fontWeight: '600',
    marginTop: '1px',
  },
  tilePriceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '6px',
    fontSize: '10px',
  },
  tilePrice: {
    fontWeight: '800',
    color: '#C62828',
  },
  tileStock: {
    color: '#7A695E',
  },
  emptySearchBox: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '30px 0',
    color: '#7A695E',
    gap: '6px',
  },

  // Category sidebar
  categorySidebar: {
    width: '100px',
    backgroundColor: '#FFFFFF',
    borderLeft: '1px solid #EFE6DA',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 6px',
    overflowY: 'auto',
    flexShrink: 0,
  },
  catSidebarBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 2px',
    borderRadius: '8px',
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    border: '1px solid transparent',
    textAlign: 'center',
  },
  catSidebarBtnActive: {
    backgroundColor: '#1F130B',
    color: '#FFFFFF',
    borderColor: '#1F130B',
  },

  // MODALS
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(31, 19, 11, 0.4)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '430px',
    boxShadow: 'var(--shadow-lg)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #EFE6DA',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeModalBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#7A695E',
  },
  modalBody: {
    padding: '16px',
    overflowY: 'auto',
    flex: 1,
  },
  checkoutMetaSection: {
    backgroundColor: '#FAF6F0',
    border: '1px solid #EFE6DA',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '12px',
  },
  modalSubTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1F130B',
    textTransform: 'uppercase',
    marginBottom: '8px',
    borderBottom: '1px solid #EFE6DA',
    paddingBottom: '4px',
  },
  modalInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  modalSelectField: {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #EFE6DA',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
  },
  fieldsGridCompactModal: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  modalInputField: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #EFE6DA',
    borderRadius: '6px',
    width: '100%',
    pointerEvents: 'auto', // Explicitly allow pointer click events
    position: 'relative',
    zIndex: 10,
  },
  amountBanner: {
    backgroundColor: '#FAF6F0',
    padding: '10px',
    borderRadius: '10px',
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#7A695E',
    marginBottom: '4px',
  },
  modalInput: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    border: '1px solid #EFE6DA',
    borderRadius: '6px',
    pointerEvents: 'auto',
    position: 'relative',
    zIndex: 10,
  },
  methodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
  },
  methodBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '10px 4px',
    borderRadius: '8px',
    border: '1px solid #EFE6DA',
    backgroundColor: '#FFFFFF',
    color: '#7A695E',
    fontSize: '11px',
    fontWeight: '700',
  },
  methodBtnActive: {
    borderColor: '#C62828',
    backgroundColor: 'rgba(198, 40, 40, 0.05)',
    color: '#C62828',
  },
  presetButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '4px',
    marginTop: '6px',
  },
  presetBtn: {
    fontSize: '10px',
    padding: '6px 2px',
    backgroundColor: '#FAF6F0',
    border: '1px solid #EFE6DA',
    borderRadius: '4px',
    fontWeight: '600',
    color: '#7A695E',
  },
  changeBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: '10px 12px',
    borderRadius: '6px',
    marginTop: '12px',
    fontSize: '13px',
  },
  digitalInfoBox: {
    marginTop: '12px',
    backgroundColor: '#FAF6F0',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '12px',
    border: '1px dashed #EFE6DA',
  },
  modalFooter: {
    padding: '14px 16px',
    borderTop: '1px solid #EFE6DA',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  modalCancelBtn: {
    padding: '8px 14px',
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    borderRadius: '6px',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    padding: '8px 16px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    borderRadius: '6px',
    fontWeight: '600',
  },
  suspendedRowCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
  },
  suspendedRowBadge: {
    fontSize: '9px',
    fontWeight: '700',
    textTransform: 'uppercase',
    padding: '2px 4px',
    borderRadius: '3px',
    backgroundColor: '#EFE6DA',
    color: '#7A695E',
  },
  suspendedRowBtn: {
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  },
  splitResultsBox: {
    marginTop: '12px',
    backgroundColor: '#FAF6F0',
    padding: '12px',
    borderRadius: '8px',
  },
  recentOrdersHeaderBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#1E88E5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(30, 136, 229, 0.2)',
    marginLeft: '6px',
  },
  receiptPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '430px',
    maxWidth: '92vw',
    boxShadow: 'var(--shadow-lg)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  receiptPreviewScrollArea: {
    padding: '16px',
    overflowY: 'auto',
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  copiesInlineControl: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#FAF6F0',
    borderRadius: '8px',
    border: '1px solid #EFE6DA',
    padding: '2px 4px',
    gap: '2px',
  },
  copiesStepperBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '4px',
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#1F130B',
    cursor: 'pointer',
  },
  copiesNumberInput: {
    width: '32px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'transparent',
    outline: 'none',
    color: '#1F130B',
  },
  receiptPaper: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: '16px',
    border: '1px solid #E0E0E0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    fontFamily: 'monospace',
    color: '#000000',
    fontSize: '11px',
    lineHeight: '1.4',
  },
  recentOrdersModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '85vw',
    height: '85vh',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  recentOrdersModalBody: {
    padding: '16px',
    display: 'flex',
    gap: '16px',
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FAF6F0',
  },
  recentLeftPane: {
    width: '40%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
  },
  recentRightPane: {
    width: '60%',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #EFE6DA',
    padding: '16px',
    overflowY: 'auto',
    height: '100%',
  },
  dailyRecordBox: {
    backgroundColor: '#1F130B',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '12px',
    boxShadow: 'var(--shadow-sm)',
  },
  recentFiltersBox: {
    display: 'flex',
    gap: '8px',
  },
  recentFilterSelect: {
    width: '35%',
    padding: '6px 8px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid #EFE6DA',
  },
  recentFilterInput: {
    width: '65%',
    padding: '6px 8px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid #EFE6DA',
  },
  recentOrdersList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  recentOrderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  recentOrderRowActive: {
    borderColor: '#C62828',
    backgroundColor: 'rgba(198, 40, 40, 0.03)',
    boxShadow: '0 2px 8px rgba(198, 40, 40, 0.08)',
  }
};
