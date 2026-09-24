import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { exportToCsv, exportToJson } from '../utils/csvExporter';
import { 
  Download, FileSpreadsheet, FileText, Database, Calendar, 
  TrendingUp, TrendingDown, Layers, Boxes, Users, ShoppingBag, 
  DollarSign, Search, RefreshCw, CheckCircle2, AlertCircle, 
  ArrowRight, Sparkles, Filter, Clock, CreditCard, PieChart,
  ArrowUpRight, ArrowDownRight, Activity, ShieldCheck, Tag
} from 'lucide-react';

export default function DataExport() {
  // Navigation Section / Subtab
  const [activeSection, setActiveSection] = useState('sales'); 
  // 'sales' | 'comparison' | 'product_history' | 'payments' | 'inventory' | 'movements' | 'orders' | 'products' | 'categories_units' | 'staff' | 'system_export'

  // Raw Database States
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  // Period Filter States
  const [datePeriod, setDatePeriod] = useState('today'); 
  // 'today' | 'yesterday' | 'day_before_yesterday' | 'last7' | 'last30' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All');
  const [selectedStaff, setSelectedStaff] = useState('All');
  const [selectedMovementType, setSelectedMovementType] = useState('All');
  
  // Product Daily History Selector
  const [selectedHistoryProductId, setSelectedHistoryProductId] = useState('');

  // Export Progress State
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0, title: '' });

  // Initial Fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        ordersList, 
        itemsList, 
        prodsList, 
        catsList, 
        unitsList, 
        logsList, 
        usersList, 
        refundsList,
        sysSettings
      ] = await Promise.all([
        api.getOrders().catch(() => []),
        api.getOrderItems().catch(() => []),
        api.getProducts().catch(() => []),
        api.getCategories().catch(() => []),
        api.getUnits().catch(() => []),
        api.getInventoryLogs().catch(() => []),
        api.getUsers().catch(() => []),
        api.getRefunds().catch(() => []),
        api.getSettings().catch(() => ({}))
      ]);

      setOrders(ordersList || []);
      setOrderItems(itemsList || []);
      setProducts(prodsList || []);
      setCategories(catsList || []);
      setUnits(unitsList || []);
      setInventoryLogs(logsList || []);
      setUsers(usersList || []);
      setRefunds(refundsList || []);
      setSettings(sysSettings || {});

      if (prodsList && prodsList.length > 0 && !selectedHistoryProductId) {
        setSelectedHistoryProductId(String(prodsList[0].id));
      }
    } catch (err) {
      console.error('Error fetching system data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Date Range Bounds Calculator
  const dateRangeBounds = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const getFormatted = (d) => d.toISOString().slice(0, 10);

    if (datePeriod === 'today') {
      return { start: todayStr, end: todayStr, label: 'Today (' + todayStr + ')' };
    }
    if (datePeriod === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = getFormatted(y);
      return { start: yStr, end: yStr, label: 'Yesterday (' + yStr + ')' };
    }
    if (datePeriod === 'day_before_yesterday') {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      const dStr = getFormatted(d);
      return { start: dStr, end: dStr, label: 'Day Before Yesterday (' + dStr + ')' };
    }
    if (datePeriod === 'last7') {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return { start: getFormatted(d), end: todayStr, label: 'Last 7 Days (' + getFormatted(d) + ' → ' + todayStr + ')' };
    }
    if (datePeriod === 'last30') {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      return { start: getFormatted(d), end: todayStr, label: 'Last 30 Days (' + getFormatted(d) + ' → ' + todayStr + ')' };
    }
    if (datePeriod === 'this_week') {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      return { start: getFormatted(monday), end: todayStr, label: 'This Week (' + getFormatted(monday) + ' → ' + todayStr + ')' };
    }
    if (datePeriod === 'last_week') {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day - 6;
      const lastMonday = new Date(d.setDate(diff));
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastSunday.getDate() + 6);
      return { start: getFormatted(lastMonday), end: getFormatted(lastSunday), label: 'Last Week (' + getFormatted(lastMonday) + ' → ' + getFormatted(lastSunday) + ')' };
    }
    if (datePeriod === 'this_month') {
      const d = new Date();
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      return { start: getFormatted(firstDay), end: todayStr, label: 'This Month (' + getFormatted(firstDay) + ' → ' + todayStr + ')' };
    }
    if (datePeriod === 'last_month') {
      const d = new Date();
      const firstDay = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth(), 0);
      return { start: getFormatted(firstDay), end: getFormatted(lastDay), label: 'Last Month (' + getFormatted(firstDay) + ' → ' + getFormatted(lastDay) + ')' };
    }
    // Custom
    return { 
      start: customStartDate || todayStr, 
      end: customEndDate || todayStr, 
      label: `${customStartDate} → ${customEndDate}` 
    };
  }, [datePeriod, customStartDate, customEndDate]);

  // Pre-index completed orders
  const completedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Completed');
  }, [orders]);

  const completedOrdersMap = useMemo(() => {
    const map = new Map();
    completedOrders.forEach(o => map.set(o.id, o));
    return map;
  }, [completedOrders]);

  // Filtered Orders for the Selected Date Range
  const filteredOrders = useMemo(() => {
    const { start, end } = dateRangeBounds;
    return orders.filter(o => {
      if (!o.created_at) return false;
      const orderDate = o.created_at.substring(0, 10);
      if (orderDate < start || orderDate > end) return false;
      if (selectedPaymentMethod !== 'All' && o.payment_method !== selectedPaymentMethod) return false;
      if (selectedStaff !== 'All' && o.created_by !== selectedStaff) return false;
      return true;
    });
  }, [orders, dateRangeBounds, selectedPaymentMethod, selectedStaff]);

  const filteredCompletedOrders = useMemo(() => {
    return filteredOrders.filter(o => o.status === 'Completed');
  }, [filteredOrders]);

  // Order Items for the filtered completed orders
  const filteredOrderItems = useMemo(() => {
    const orderIdSet = new Set(filteredCompletedOrders.map(o => o.id));
    return orderItems.filter(item => orderIdSet.has(item.order_id));
  }, [filteredCompletedOrders, orderItems]);

  // Sales Summary Calculation for the period
  const salesSummary = useMemo(() => {
    let totalOrders = filteredCompletedOrders.length;
    let totalItemsSold = 0;
    let grossSales = 0;
    let totalDiscounts = 0;
    let totalTax = 0;
    let totalDeliveryCharges = 0;
    let netSales = 0;
    let cashSales = 0;
    let cardSales = 0;
    let easypaisaSales = 0;
    let jazzcashSales = 0;
    let mixedSales = 0;

    filteredCompletedOrders.forEach(o => {
      const sub = parseFloat(o.subtotal) || 0;
      const disc = parseFloat(o.discount_amount) || 0;
      const tax = parseFloat(o.tax_amount) || 0;
      const del = parseFloat(o.delivery_charges) || 0;
      const tot = parseFloat(o.total) || 0;
      const count = parseInt(o.items_count) || 0;

      grossSales += sub;
      totalDiscounts += disc;
      totalTax += tax;
      totalDeliveryCharges += del;
      netSales += tot;
      totalItemsSold += count;

      const method = (o.payment_method || '').toLowerCase();
      if (method === 'cash') cashSales += tot;
      else if (method === 'card') cardSales += tot;
      else if (method === 'easypaisa') easypaisaSales += tot;
      else if (method === 'jazzcash') jazzcashSales += tot;
      else if (method === 'mixed') mixedSales += tot;
      else cashSales += tot;
    });

    const cancelledCount = filteredOrders.filter(o => o.status === 'Cancelled').length;
    const refundsCount = refunds.filter(r => {
      if (!r.date) return false;
      const rDate = r.date.substring(0, 10);
      return rDate >= dateRangeBounds.start && rDate <= dateRangeBounds.end;
    }).length;

    return {
      totalOrders,
      totalItemsSold,
      grossSales,
      totalDiscounts,
      totalTax,
      totalDeliveryCharges,
      netSales,
      cashSales,
      cardSales,
      easypaisaSales,
      jazzcashSales,
      mixedSales,
      cancelledCount,
      refundsCount
    };
  }, [filteredCompletedOrders, filteredOrders, refunds, dateRangeBounds]);

  // Product-by-Product Aggregated Sales in the Selected Period
  const productSalesTable = useMemo(() => {
    const agg = {};

    filteredOrderItems.forEach(item => {
      const key = item.product_name || `prod_${item.product_id}`;
      if (!agg[key]) {
        const prodMatch = products.find(p => p.id === item.product_id || p.name === item.product_name);
        agg[key] = {
          product_id: item.product_id,
          product_name: item.product_name,
          category: prodMatch ? prodMatch.category : 'General',
          unit: prodMatch ? prodMatch.unit : 'Piece',
          unit_price: parseFloat(item.price) || 0,
          quantity_sold: 0,
          revenue: 0
        };
      }
      agg[key].quantity_sold += parseFloat(item.quantity) || 0;
      agg[key].revenue += parseFloat(item.subtotal) || 0;
    });

    let list = Object.values(agg);

    if (selectedCategory !== 'All') {
      list = list.filter(item => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => item.product_name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
    }

    return list.sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrderItems, products, selectedCategory, searchQuery]);

  // 3-Day Comparison Matrix (Today vs Yesterday vs Day Before Yesterday)
  const comparisonMatrix = useMemo(() => {
    const getDayMetrics = (dateOffset) => {
      const d = new Date();
      d.setDate(d.getDate() - dateOffset);
      const dStr = d.toISOString().slice(0, 10);
      const dayOrders = completedOrders.filter(o => o.created_at && o.created_at.substring(0, 10) === dStr);
      const ordersCount = dayOrders.length;
      const itemsCount = dayOrders.reduce((sum, o) => sum + (parseInt(o.items_count) || 0), 0);
      const totalSales = dayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const avgOrder = ordersCount > 0 ? Math.round(totalSales / ordersCount) : 0;
      return { dateStr: dStr, ordersCount, itemsCount, totalSales, avgOrder };
    };

    const today = getDayMetrics(0);
    const yesterday = getDayMetrics(1);
    const dayBefore = getDayMetrics(2);

    const diffSales = today.totalSales - yesterday.totalSales;
    const diffOrders = today.ordersCount - yesterday.ordersCount;
    const diffItems = today.itemsCount - yesterday.itemsCount;

    return { today, yesterday, dayBefore, diffSales, diffOrders, diffItems };
  }, [completedOrders]);

  // Single Product Daily History (Today, Yesterday, Day Before, and 7-day breakdown)
  const selectedProductHistory = useMemo(() => {
    if (!selectedHistoryProductId) return null;
    const prodId = parseInt(selectedHistoryProductId);
    const prod = products.find(p => p.id === prodId);
    if (!prod) return null;

    const prodItems = orderItems.filter(item => item.product_id === prodId || item.product_name === prod.name);

    const getDailyMetricsForProd = (dateOffset) => {
      const d = new Date();
      d.setDate(d.getDate() - dateOffset);
      const dStr = d.toISOString().slice(0, 10);

      let qty = 0;
      let rev = 0;
      const orderIds = new Set();

      prodItems.forEach(item => {
        const order = completedOrdersMap.get(item.order_id);
        if (order && order.created_at && order.created_at.substring(0, 10) === dStr) {
          qty += parseFloat(item.quantity) || 0;
          rev += parseFloat(item.subtotal) || 0;
          orderIds.add(item.order_id);
        }
      });

      return { dateStr: dStr, qty, rev, ordersCount: orderIds.size };
    };

    const todayStats = getDailyMetricsForProd(0);
    const yesterdayStats = getDailyMetricsForProd(1);
    const dayBeforeStats = getDailyMetricsForProd(2);

    // 7-day breakdown list
    const last7DaysList = [];
    for (let i = 0; i < 7; i++) {
      last7DaysList.push(getDailyMetricsForProd(i));
    }

    return {
      product: prod,
      todayStats,
      yesterdayStats,
      dayBeforeStats,
      last7DaysList
    };
  }, [selectedHistoryProductId, products, orderItems, completedOrdersMap]);

  // Payment Breakdown Summary
  const paymentBreakdownList = useMemo(() => {
    const map = {
      Cash: { name: 'Cash', count: 0, total: 0 },
      Card: { name: 'Card', count: 0, total: 0 },
      Easypaisa: { name: 'Easypaisa', count: 0, total: 0 },
      JazzCash: { name: 'JazzCash', count: 0, total: 0 },
      Mixed: { name: 'Mixed', count: 0, total: 0 }
    };

    filteredCompletedOrders.forEach(o => {
      const method = o.payment_method || 'Cash';
      if (!map[method]) {
        map[method] = { name: method, count: 0, total: 0 };
      }
      map[method].count += 1;
      map[method].total += parseFloat(o.total) || 0;
    });

    return Object.values(map);
  }, [filteredCompletedOrders]);

  // Inventory Table with stock movements, sales reconciliation & valuation
  const inventoryReportTable = useMemo(() => {
    return products.map(prod => {
      const currentStock = parseFloat(prod.stock) || 0;
      const costPrice = parseFloat(prod.cost_price) || 0;
      const salePrice = parseFloat(prod.price) || 0;
      const threshold = parseFloat(prod.low_stock_threshold !== undefined ? prod.low_stock_threshold : 10);
      const inventoryValue = currentStock * (costPrice > 0 ? costPrice : salePrice);

      // Movements in period for this product
      let stockAdded = 0;
      let stockSold = 0;
      let stockReturned = 0;
      let wastage = 0;
      let adjustments = 0;
      let allTimeSold = 0;

      // Real sold from completed orders
      orderItems.forEach(item => {
        if (item.product_id === prod.id || item.product_name === prod.name) {
          const parentOrder = completedOrdersMap.get(item.order_id);
          if (parentOrder && parentOrder.created_at) {
            const orderDate = parentOrder.created_at.substring(0, 10);
            const qty = parseFloat(item.quantity) || 0;
            allTimeSold += qty;
            if (orderDate >= dateRangeBounds.start && orderDate <= dateRangeBounds.end) {
              stockSold += qty;
            }
          }
        }
      });

      inventoryLogs.forEach(log => {
        if (log.product_name === prod.name && log.date) {
          const logDate = log.date.substring(0, 10);
          if (logDate >= dateRangeBounds.start && logDate <= dateRangeBounds.end) {
            const qty = parseFloat(log.quantity) || 0;
            if (log.type === 'Stock In') {
              if (log.reason === 'Refund' || log.reason === 'Return' || (log.note && log.note.toLowerCase().includes('return')) || (log.note && log.note.toLowerCase().includes('refund'))) {
                stockReturned += qty;
              } else {
                stockAdded += qty;
              }
            } else if (log.type === 'Stock Out') {
              if (log.reason === 'Waste' || log.reason === 'Wastage' || log.reason === 'Damaged' || log.reason === 'Damage' || log.reason === 'Expired' || log.reason === 'Staff Meal' || log.reason === 'Kitchen Loss' || (log.note && log.note.toLowerCase().includes('waste')) || (log.note && log.note.toLowerCase().includes('damage'))) {
                wastage += qty;
              }
            } else if (log.type === 'Adjustment') {
              adjustments += qty;
            }
          }
        }
      });

      const openingStock = Math.max(0, currentStock + stockSold + wastage - stockAdded - stockReturned - adjustments);
      const netSold = Math.max(0, stockSold - stockReturned);

      let status = 'In Stock';
      if (currentStock <= 0) status = 'Out of Stock';
      else if (currentStock <= threshold) status = 'Low Stock';

      return {
        id: prod.id,
        name: prod.name,
        urdu: prod.urdu || '',
        category: prod.category,
        unit: prod.unit || 'Piece',
        openingStock,
        stockAdded,
        stockSold,
        stockReturned,
        netSold,
        wastage,
        adjustments,
        currentStock,
        allTimeSold,
        threshold,
        status,
        costPrice,
        salePrice,
        inventoryValue
      };
    });
  }, [products, orderItems, completedOrdersMap, inventoryLogs, dateRangeBounds]);

  // Filtered Inventory Movements Ledger
  const filteredMovementLogs = useMemo(() => {
    return inventoryLogs.filter(log => {
      if (!log.date) return false;
      const logDate = log.date.substring(0, 10);
      if (logDate < dateRangeBounds.start || logDate > dateRangeBounds.end) return false;
      if (selectedMovementType !== 'All' && log.type !== selectedMovementType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (log.product_name || '').toLowerCase().includes(q) || (log.reason || '').toLowerCase().includes(q) || (log.user || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [inventoryLogs, dateRangeBounds, selectedMovementType, searchQuery]);

  // --- CSV & JSON EXPORT HANDLERS ---

  const triggerExport = async (type) => {
    setExporting(true);
    const dateStamp = new Date().toISOString().slice(0, 10);

    try {
      if (type === 'sales_summary') {
        const headers = [
          { key: 'metric', label: 'Metric' },
          { key: 'value', label: 'Value' }
        ];
        const rows = [
          { metric: 'Period Filter', value: dateRangeBounds.label },
          { metric: 'Start Date', value: dateRangeBounds.start },
          { metric: 'End Date', value: dateRangeBounds.end },
          { metric: 'Total Orders', value: salesSummary.totalOrders },
          { metric: 'Items Sold', value: salesSummary.totalItemsSold },
          { metric: 'Gross Sales (Rs)', value: salesSummary.grossSales },
          { metric: 'Total Discounts (Rs)', value: salesSummary.totalDiscounts },
          { metric: 'Tax Collected (Rs)', value: salesSummary.totalTax },
          { metric: 'Delivery Charges (Rs)', value: salesSummary.totalDeliveryCharges },
          { metric: 'Net Revenue (Rs)', value: salesSummary.netSales },
          { metric: 'Cash Sales (Rs)', value: salesSummary.cashSales },
          { metric: 'Card Sales (Rs)', value: salesSummary.cardSales },
          { metric: 'Easypaisa Sales (Rs)', value: salesSummary.easypaisaSales },
          { metric: 'JazzCash Sales (Rs)', value: salesSummary.jazzcashSales },
          { metric: 'Mixed Sales (Rs)', value: salesSummary.mixedSales },
          { metric: 'Cancelled Orders', value: salesSummary.cancelledCount },
          { metric: 'Refund Count', value: salesSummary.refundsCount }
        ];
        await exportToCsv({
          filename: `AR_Shinwari_Sales_Summary_${dateStamp}`,
          headers,
          rows
        });
      } else if (type === 'product_sales') {
        const headers = [
          { key: 'product_name', label: 'Product Name' },
          { key: 'category', label: 'Category' },
          { key: 'unit', label: 'Unit' },
          { key: 'unit_price', label: 'Unit Price (Rs)' },
          { key: 'quantity_sold', label: 'Quantity Sold' },
          { key: 'revenue', label: 'Total Revenue (Rs)' }
        ];
        await exportToCsv({
          filename: `AR_Shinwari_Product_Sales_${dateStamp}`,
          headers,
          rows: productSalesTable,
          onProgress: (cur, tot) => setExportProgress({ current: cur, total: tot, title: 'Product Sales CSV' })
        });
      } else if (type === 'orders') {
        const headers = [
          { key: 'id', label: 'Order ID' },
          { key: 'created_at', label: 'Date & Exact Time' },
          { key: 'order_type', label: 'Order Type' },
          { key: 'customer_name', label: 'Customer' },
          { key: 'customer_phone', label: 'Phone' },
          { key: 'delivery_address', label: 'Delivery Address' },
          { key: 'items_count', label: 'Items Count' },
          { key: 'subtotal', label: 'Subtotal (Rs)' },
          { key: 'discount_amount', label: 'Discount (Rs)' },
          { key: 'tax_amount', label: 'Tax (Rs)' },
          { key: 'delivery_charges', label: 'Delivery Charges (Rs)' },
          { key: 'total', label: 'Grand Total (Rs)' },
          { key: 'payment_method', label: 'Payment Method' },
          { key: 'status', label: 'Status' },
          { key: 'created_by', label: 'Cashier / Staff' }
        ];
        await exportToCsv({
          filename: `AR_Shinwari_Orders_${dateStamp}`,
          headers,
          rows: filteredOrders,
          onProgress: (cur, tot) => setExportProgress({ current: cur, total: tot, title: 'Orders CSV' })
        });
      } else if (type === 'inventory') {
        const headers = [
          { key: 'id', label: 'Product ID' },
          { key: 'name', label: 'Product Name' },
          { key: 'urdu', label: 'Urdu Name' },
          { key: 'category', label: 'Category' },
          { key: 'unit', label: 'Unit' },
          { key: 'openingStock', label: 'Opening Stock' },
          { key: 'stockAdded', label: 'Stock Added' },
          { key: 'stockSold', label: 'Sold (Period)' },
          { key: 'stockReturned', label: 'Returned' },
          { key: 'netSold', label: 'Net Sold' },
          { key: 'wastage', label: 'Wastage / Loss' },
          { key: 'adjustments', label: 'Adjustments' },
          { key: 'currentStock', label: 'Current Stock' },
          { key: 'allTimeSold', label: 'Total Sold (All Time)' },
          { key: 'threshold', label: 'Low Stock Level' },
          { key: 'status', label: 'Stock Status' },
          { key: 'costPrice', label: 'Cost Price (Rs)' },
          { key: 'salePrice', label: 'Sale Price (Rs)' },
          { key: 'inventoryValue', label: 'Total Valuation (Rs)' }
        ];
        await exportToCsv({
          filename: `AR_Shinwari_Inventory_Valuation_${dateStamp}`,
          headers,
          rows: inventoryReportTable
        });
      } else if (type === 'movements') {
        const headers = [
          { key: 'id', label: 'Movement ID' },
          { key: 'date', label: 'Exact Timestamp' },
          { key: 'product_name', label: 'Product' },
          { key: 'type', label: 'Movement Type' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'before_stock', label: 'Before Quantity' },
          { key: 'after_stock', label: 'After Quantity' },
          { key: 'user', label: 'Staff / User' },
          { key: 'reason', label: 'Reason' },
          { key: 'order_id', label: 'Order #' },
          { key: 'note', label: 'Notes' }
        ];
        await exportToCsv({
          filename: `AR_Shinwari_Inventory_Ledger_${dateStamp}`,
          headers,
          rows: filteredMovementLogs,
          onProgress: (cur, tot) => setExportProgress({ current: cur, total: tot, title: 'Inventory Ledger CSV' })
        });
      } else if (type === 'products_catalog') {
        const headers = [
          { key: 'id', label: 'Product ID' },
          { key: 'name', label: 'English Name' },
          { key: 'urdu', label: 'Urdu Name' },
          { key: 'category', label: 'Category' },
          { key: 'unit', label: 'Unit' },
          { key: 'price', label: 'Sale Price (Rs)' },
          { key: 'cost_price', label: 'Cost Price (Rs)' },
          { key: 'stock', label: 'Current Stock' },
          { key: 'low_stock_threshold', label: 'Low Stock Alert' },
          { key: 'available', label: 'Available (1=Yes, 0=No)' }
        ];
        await exportToCsv({
          filename: `AR_Shinwari_Catalog_Products_${dateStamp}`,
          headers,
          rows: products
        });
      } else if (type === 'categories_units') {
        const headers = [
          { key: 'type', label: 'Record Type' },
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'extra', label: 'Default / Status' }
        ];
        const rows = [
          ...categories.map(c => ({ type: 'Category', id: c.id, name: c.name, extra: 'Active' })),
          ...units.map(u => ({ type: 'Measurement Unit', id: u.id, name: u.name, extra: u.is_default ? 'Default Unit' : 'Standard' }))
        ];
        await exportToCsv({
          filename: `AR_Shinwari_Categories_Units_${dateStamp}`,
          headers,
          rows
        });
      } else if (type === 'staff_export') {
        const headers = [
          { key: 'id', label: 'Staff ID' },
          { key: 'name', label: 'Full Name' },
          { key: 'username', label: 'Username' },
          { key: 'role', label: 'Assigned Role' }
        ];
        // Ensure passwords and hashes are strictly omitted
        const safeStaff = users.map(u => ({
          id: u.id,
          name: u.name,
          username: u.username,
          role: u.role
        }));
        await exportToCsv({
          filename: `AR_Shinwari_Staff_Profiles_${dateStamp}`,
          headers,
          rows: safeStaff
        });
      } else if (type === 'complete_system_json') {
        // Complete System Snapshot strictly omitting secrets
        const bundle = {
          export_metadata: {
            restaurant_name: settings.restaurant_name || 'AR Shinwari Hujra',
            exported_at: new Date().toISOString(),
            version: '2.0.0'
          },
          summary: salesSummary,
          categories,
          units,
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            urdu: p.urdu,
            price: p.price,
            cost_price: p.cost_price,
            stock: p.stock,
            unit: p.unit,
            category: p.category,
            available: p.available
          })),
          staff: users.map(u => ({ id: u.id, name: u.name, username: u.username, role: u.role })),
          orders: completedOrders,
          order_items: orderItems,
          inventory_movements: inventoryLogs,
          refunds
        };
        exportToJson({
          filename: `AR_Shinwari_Complete_Business_Data_${dateStamp}`,
          data: bundle
        });
      }
    } catch (err) {
      alert(`Export error: ${err.message}`);
    } finally {
      setExporting(false);
      setExportProgress({ current: 0, total: 0, title: '' });
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* 1. TOP HEADER */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={24} color="#C62828" />
            <h1 style={styles.title}>Data Export &amp; Reports Center</h1>
          </div>
          <p style={styles.subtitle}>View, filter, analyze and export complete 100% real restaurant POS data.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button"
            onClick={fetchAllData} 
            style={styles.refreshBtn}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
          
          <button
            type="button"
            onClick={() => triggerExport('complete_system_json')}
            style={styles.masterExportBtn}
          >
            <Database size={15} /> Export Complete System Data (JSON)
          </button>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION TABS */}
      <div style={styles.mainNavTabs}>
        {[
          { id: 'sales', label: 'Sales & Daily Reports', icon: TrendingUp },
          { id: 'comparison', label: '3-Day Comparison', icon: Activity },
          { id: 'product_history', label: 'Product Daily History', icon: Sparkles },
          { id: 'payments', label: 'Payment Method Breakdown', icon: CreditCard },
          { id: 'inventory', label: 'Inventory & Valuation', icon: Boxes },
          { id: 'movements', label: 'Stock Movement Ledger', icon: FileText },
          { id: 'orders', label: 'Orders & Invoices', icon: ShoppingBag },
          { id: 'products', label: 'Products Catalog', icon: Tag },
          { id: 'categories_units', label: 'Categories & Units', icon: Layers },
          { id: 'staff', label: 'Staff Profiles', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              style={{
                ...styles.mainNavTabBtn,
                ...(activeSection === tab.id ? styles.mainNavTabBtnActive : {})
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. PERIOD FILTER BAR (for Date-dependent views) */}
      {['sales', 'comparison', 'product_history', 'payments', 'inventory', 'movements', 'orders'].includes(activeSection) && (
        <div style={styles.filterCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#7A695E', textTransform: 'uppercase', marginRight: '4px' }}>
              Select Period:
            </span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'day_before_yesterday', label: 'Day Before Yesterday' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'last30', label: 'Last 30 Days' },
              { id: 'this_week', label: 'This Week' },
              { id: 'last_week', label: 'Last Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'custom', label: 'Custom Range' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDatePeriod(p.id)}
                style={{
                  ...styles.periodBtn,
                  ...(datePeriod === p.id ? styles.periodBtnActive : {})
                }}
              >
                {p.label}
              </button>
            ))}

            {datePeriod === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={styles.dateInput}
                />
                <span style={{ color: '#7A695E', fontSize: '12px' }}>→</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
            )}
          </div>

          <div style={styles.activePeriodBadge}>
            Showing: <strong>{dateRangeBounds.label}</strong>
          </div>
        </div>
      )}

      {/* 4. CONTENT SECTIONS */}

      {/* SECTION 1: SALES & DAILY REPORTS */}
      {activeSection === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sales Summary KPI Cards */}
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Total Orders</span>
              <div style={styles.kpiValue}>{salesSummary.totalOrders.toLocaleString()}</div>
              <span style={styles.kpiSub}>{salesSummary.cancelledCount} cancelled orders</span>
            </div>

            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Total Items Sold</span>
              <div style={styles.kpiValue}>{salesSummary.totalItemsSold.toLocaleString()}</div>
              <span style={styles.kpiSub}>Dishes / portions</span>
            </div>

            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Gross Sales</span>
              <div style={{ ...styles.kpiValue, color: '#1F130B' }}>Rs {salesSummary.grossSales.toLocaleString()}</div>
              <span style={styles.kpiSub}>Before discounts</span>
            </div>

            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Discounts Given</span>
              <div style={{ ...styles.kpiValue, color: '#C62828' }}>-Rs {salesSummary.totalDiscounts.toLocaleString()}</div>
              <span style={styles.kpiSub}>Customer deductions</span>
            </div>

            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Tax Collected (GST)</span>
              <div style={{ ...styles.kpiValue, color: '#1E88E5' }}>Rs {salesSummary.totalTax.toLocaleString()}</div>
              <span style={styles.kpiSub}>Govt tax liability</span>
            </div>

            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Net POS Revenue</span>
              <div style={{ ...styles.kpiValue, color: '#2E7D32' }}>Rs {salesSummary.netSales.toLocaleString()}</div>
              <span style={styles.kpiSub}>Actual cashflow</span>
            </div>
          </div>

          {/* Payment Method Breakdown Badges */}
          <div style={{ ...styles.card, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontWeight: '800', fontSize: '13px', color: '#1F130B' }}>Payment Breakdown for Selected Period</div>
              <button onClick={() => triggerExport('sales_summary')} style={styles.downloadCsvBtn}>
                <Download size={13} /> Download Sales Summary CSV
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <div style={styles.payBox}>
                <span style={{ fontSize: '11px', color: '#7A695E' }}>Cash Sales</span>
                <strong style={{ fontSize: '14px', color: '#1F130B' }}>Rs {salesSummary.cashSales.toLocaleString()}</strong>
              </div>
              <div style={styles.payBox}>
                <span style={{ fontSize: '11px', color: '#7A695E' }}>Card Sales</span>
                <strong style={{ fontSize: '14px', color: '#1E88E5' }}>Rs {salesSummary.cardSales.toLocaleString()}</strong>
              </div>
              <div style={styles.payBox}>
                <span style={{ fontSize: '11px', color: '#7A695E' }}>Easypaisa</span>
                <strong style={{ fontSize: '14px', color: '#2E7D32' }}>Rs {salesSummary.easypaisaSales.toLocaleString()}</strong>
              </div>
              <div style={styles.payBox}>
                <span style={{ fontSize: '11px', color: '#7A695E' }}>JazzCash</span>
                <strong style={{ fontSize: '14px', color: '#D32F2F' }}>Rs {salesSummary.jazzcashSales.toLocaleString()}</strong>
              </div>
              <div style={styles.payBox}>
                <span style={{ fontSize: '11px', color: '#7A695E' }}>Mixed Payment</span>
                <strong style={{ fontSize: '14px', color: '#E28F46' }}>Rs {salesSummary.mixedSales.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Product-by-Product Sales Table */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Product-by-Product Sales Performance</h3>
                <p style={styles.cardSub}>Individual item sales velocity, unit price, and generated revenue.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={styles.searchWrap}>
                  <Search size={14} color="#7A695E" />
                  <input
                    type="text"
                    placeholder="Search dish name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                <button onClick={() => triggerExport('product_sales')} style={styles.downloadCsvBtn}>
                  <Download size={13} /> Download Product Sales CSV
                </button>
              </div>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Product Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Unit</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Unit Price</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Qty Sold</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {productSalesTable.map((item, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{item.product_name}</strong>
                      </td>
                      <td style={styles.td}>{item.category}</td>
                      <td style={styles.td}>{item.unit}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>Rs {item.unit_price}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>{item.quantity_sold}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#2E7D32' }}>Rs {item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  {productSalesTable.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '30px', color: '#7A695E' }}>
                        No sales recorded for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: 3-DAY COMPARISON (Today vs Yesterday vs Day Before Yesterday) */}
      {activeSection === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>3-Day Comparative Sales Matrix</h3>
                <p style={styles.cardSub}>Compare performance between Today, Yesterday, and Day Before Yesterday.</p>
              </div>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Performance Metric</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Today ({comparisonMatrix.today.dateStr})</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Yesterday ({comparisonMatrix.yesterday.dateStr})</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Day Before ({comparisonMatrix.dayBefore.dateStr})</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Variance (Today vs Yesterday)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Total Sales Revenue</strong></td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#2E7D32' }}>Rs {comparisonMatrix.today.totalSales.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>Rs {comparisonMatrix.yesterday.totalSales.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>Rs {comparisonMatrix.dayBefore.totalSales.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: comparisonMatrix.diffSales >= 0 ? '#2E7D32' : '#C62828' }}>
                      {comparisonMatrix.diffSales >= 0 ? `+Rs ${comparisonMatrix.diffSales.toLocaleString()}` : `-Rs ${Math.abs(comparisonMatrix.diffSales).toLocaleString()}`}
                    </td>
                  </tr>

                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Completed Orders</strong></td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800' }}>{comparisonMatrix.today.ordersCount}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>{comparisonMatrix.yesterday.ordersCount}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{comparisonMatrix.dayBefore.ordersCount}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: comparisonMatrix.diffOrders >= 0 ? '#2E7D32' : '#C62828' }}>
                      {comparisonMatrix.diffOrders >= 0 ? `+${comparisonMatrix.diffOrders}` : `${comparisonMatrix.diffOrders}`}
                    </td>
                  </tr>

                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Total Items / Portions Sold</strong></td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800' }}>{comparisonMatrix.today.itemsCount}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>{comparisonMatrix.yesterday.itemsCount}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>{comparisonMatrix.dayBefore.itemsCount}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: comparisonMatrix.diffItems >= 0 ? '#2E7D32' : '#C62828' }}>
                      {comparisonMatrix.diffItems >= 0 ? `+${comparisonMatrix.diffItems}` : `${comparisonMatrix.diffItems}`}
                    </td>
                  </tr>

                  <tr style={styles.tr}>
                    <td style={styles.td}><strong>Average Order Value (AOV)</strong></td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800' }}>Rs {comparisonMatrix.today.avgOrder}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>Rs {comparisonMatrix.yesterday.avgOrder}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>Rs {comparisonMatrix.dayBefore.avgOrder}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      Rs {comparisonMatrix.today.avgOrder - comparisonMatrix.yesterday.avgOrder}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PRODUCT DAILY HISTORY EXPLORER */}
      {activeSection === 'product_history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Product Daily History Explorer</h3>
                <p style={styles.cardSub}>Select any catalog dish to view its exact day-by-day sales history.</p>
              </div>

              <div style={{ minWidth: '260px' }}>
                <select
                  value={selectedHistoryProductId}
                  onChange={(e) => setSelectedHistoryProductId(e.target.value)}
                  style={{ ...styles.selectInput, width: '100%', padding: '8px 12px', fontSize: '13px' }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Rs {p.price})</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProductHistory && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 3 Snapshot Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={styles.historyCard}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#7A695E' }}>Today ({selectedProductHistory.todayStats.dateStr})</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F130B', margin: '4px 0' }}>
                      {selectedProductHistory.todayStats.qty} {selectedProductHistory.product.unit}s Sold
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#2E7D32' }}>
                      Rs {selectedProductHistory.todayStats.rev.toLocaleString()} revenue ({selectedProductHistory.todayStats.ordersCount} orders)
                    </div>
                  </div>

                  <div style={styles.historyCard}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#7A695E' }}>Yesterday ({selectedProductHistory.yesterdayStats.dateStr})</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F130B', margin: '4px 0' }}>
                      {selectedProductHistory.yesterdayStats.qty} {selectedProductHistory.product.unit}s Sold
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#2E7D32' }}>
                      Rs {selectedProductHistory.yesterdayStats.rev.toLocaleString()} revenue ({selectedProductHistory.yesterdayStats.ordersCount} orders)
                    </div>
                  </div>

                  <div style={styles.historyCard}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#7A695E' }}>Day Before Yesterday ({selectedProductHistory.dayBeforeStats.dateStr})</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F130B', margin: '4px 0' }}>
                      {selectedProductHistory.dayBeforeStats.qty} {selectedProductHistory.product.unit}s Sold
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#2E7D32' }}>
                      Rs {selectedProductHistory.dayBeforeStats.rev.toLocaleString()} revenue ({selectedProductHistory.dayBeforeStats.ordersCount} orders)
                    </div>
                  </div>
                </div>

                {/* 7-Day Table */}
                <div style={{ marginTop: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1F130B', marginBottom: '8px' }}>
                    Last 7 Days Breakdown for {selectedProductHistory.product.name}
                  </h4>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Quantity Sold</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Revenue (Rs)</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Orders Containing Item</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProductHistory.last7DaysList.map((row, idx) => (
                        <tr key={idx} style={styles.tr}>
                          <td style={styles.td}><strong>{row.dateStr}</strong></td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>{row.qty} {selectedProductHistory.product.unit}</td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#2E7D32' }}>Rs {row.rev.toLocaleString()}</td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>{row.ordersCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: PAYMENT BREAKDOWN REPORT */}
      {activeSection === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Payment Method Reconciliation Report</h3>
                <p style={styles.cardSub}>Reconciliation of cash, credit card, EasyPaisa, and JazzCash transactions.</p>
              </div>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Payment Method</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Transaction Count</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Total Volume (Rs)</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentBreakdownList.map((p, idx) => {
                    const totalVolume = salesSummary.netSales || 1;
                    const pct = ((p.total / totalVolume) * 100).toFixed(1);
                    return (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>
                          <strong>{p.name}</strong>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>{p.count}</td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#2E7D32' }}>Rs {p.total.toLocaleString()}</td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>{pct}%</td>
                      </tr>
                    );
                  })}
                  <tr style={{ ...styles.tr, backgroundColor: '#FAF6F0' }}>
                    <td style={{ ...styles.td, fontWeight: '800' }}>Total Reconciled Volume</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800' }}>{salesSummary.totalOrders}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '900', color: '#2E7D32' }}>Rs {salesSummary.netSales.toLocaleString()}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800' }}>100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: INVENTORY & VALUATION */}
      {activeSection === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Inventory Stock &amp; Valuation Report</h3>
                <p style={styles.cardSub}>Live product stock quantities, thresholds, sales, and total stock asset valuation.</p>
              </div>

              <button onClick={() => triggerExport('inventory')} style={styles.downloadCsvBtn}>
                <Download size={13} /> Download Inventory CSV
              </button>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Unit</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Current Stock</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Sold in Period</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Stock Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Cost Price</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Sale Price</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Stock Value</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReportTable.map(prod => (
                    <tr key={prod.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{prod.name}</strong> {prod.urdu && <span style={{ color: '#7A695E', fontSize: '11px' }}>({prod.urdu})</span>}
                      </td>
                      <td style={styles.td}>{prod.category}</td>
                      <td style={styles.td}>{prod.unit}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>{prod.currentStock}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{prod.stockSold}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '800',
                          backgroundColor: prod.status === 'In Stock' ? '#E8F5E9' : prod.status === 'Low Stock' ? '#FFF9C4' : '#FFEBEE',
                          color: prod.status === 'In Stock' ? '#2E7D32' : prod.status === 'Low Stock' ? '#F57F17' : '#C62828'
                        }}>
                          {prod.status}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>Rs {prod.costPrice}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>Rs {prod.salePrice}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#1F130B' }}>Rs {prod.inventoryValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: STOCK MOVEMENT LEDGER */}
      {activeSection === 'movements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Inventory Movement Audit Ledger</h3>
                <p style={styles.cardSub}>Audited transaction log of all Stock In, Stock Out, Sales, Refunds, and Corrections.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={selectedMovementType}
                  onChange={(e) => setSelectedMovementType(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="All">All Movement Types</option>
                  <option value="Stock In">Stock In</option>
                  <option value="Stock Out">Stock Out (Sale)</option>
                  <option value="Adjustment">Adjustment</option>
                </select>

                <button onClick={() => triggerExport('movements')} style={styles.downloadCsvBtn}>
                  <Download size={13} /> Download Ledger CSV
                </button>
              </div>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Type</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Quantity</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Before</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>After</th>
                    <th style={styles.th}>Staff</th>
                    <th style={styles.th}>Reason / Order #</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovementLogs.map((log, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontSize: '11px', color: '#7A695E' }}>{log.date}</td>
                      <td style={styles.td}><strong>{log.product_name}</strong></td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '800',
                          backgroundColor: log.type === 'Stock In' ? '#E8F5E9' : log.type === 'Stock Out' ? '#FFEBEE' : '#FFF9C4',
                          color: log.type === 'Stock In' ? '#2E7D32' : log.type === 'Stock Out' ? '#C62828' : '#F57F17'
                        }}>
                          {log.type}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>{log.quantity}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{log.before_stock !== undefined && log.before_stock !== null ? log.before_stock : '—'}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>{log.after_stock !== undefined && log.after_stock !== null ? log.after_stock : '—'}</td>
                      <td style={styles.td}>{log.user || 'Admin'}</td>
                      <td style={styles.td}>
                        {log.reason} {log.order_id ? <span style={{ color: '#1E88E5', fontWeight: '700' }}>#{log.order_id}</span> : ''}
                      </td>
                    </tr>
                  ))}
                  {filteredMovementLogs.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ ...styles.td, textAlign: 'center', padding: '30px', color: '#7A695E' }}>
                        No inventory movements recorded in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: ORDERS EXPORT */}
      {activeSection === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Complete Sales Orders Register</h3>
                <p style={styles.cardSub}>Detailed record of all dining, takeaway, and delivery sales invoices.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  style={styles.selectInput}
                >
                  <option value="All">All Payment Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Mixed">Mixed</option>
                </select>

                <button onClick={() => triggerExport('orders')} style={styles.downloadCsvBtn}>
                  <Download size={13} /> Download Orders CSV
                </button>
              </div>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Order #</th>
                    <th style={styles.th}>Date &amp; Time</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Customer</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Items</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Total (Rs)</th>
                    <th style={styles.th}>Payment</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Cashier</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id} style={styles.tr}>
                      <td style={styles.td}><strong>#{o.id}</strong></td>
                      <td style={{ ...styles.td, fontSize: '11px', color: '#7A695E' }}>{o.created_at}</td>
                      <td style={styles.td}>{o.order_type}</td>
                      <td style={styles.td}>{o.customer_name || 'Walk-in'}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>{o.items_count}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#2E7D32' }}>Rs {o.total}</td>
                      <td style={styles.td}>{o.payment_method}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '800',
                          backgroundColor: o.status === 'Completed' ? '#E8F5E9' : '#FFEBEE',
                          color: o.status === 'Completed' ? '#2E7D32' : '#C62828'
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={styles.td}>{o.created_by || 'Admin'}</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ ...styles.td, textAlign: 'center', padding: '30px', color: '#7A695E' }}>
                        No orders found for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8: PRODUCTS CATALOG */}
      {activeSection === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Complete Menu Products Catalog</h3>
                <p style={styles.cardSub}>Export all dishes, prices, units, and inventory configurations.</p>
              </div>

              <button onClick={() => triggerExport('products_catalog')} style={styles.downloadCsvBtn}>
                <Download size={13} /> Download Products CSV
              </button>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Dish Name (English)</th>
                    <th style={styles.th}>Urdu Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Unit</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Sale Price</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Cost Price</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod.id} style={styles.tr}>
                      <td style={styles.td}>#{prod.id}</td>
                      <td style={styles.td}><strong>{prod.name}</strong></td>
                      <td style={{ ...styles.td, color: '#7A695E' }}>{prod.urdu || '—'}</td>
                      <td style={styles.td}>{prod.category}</td>
                      <td style={styles.td}>{prod.unit}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700' }}>Rs {prod.price}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>Rs {prod.cost_price || 0}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800' }}>{prod.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 9: CATEGORIES & UNITS */}
      {activeSection === 'categories_units' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Menu Categories ({categories.length})</h3>
                <p style={styles.cardSub}>Active dish classifications.</p>
              </div>
            </div>
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Category Name</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id} style={styles.tr}>
                      <td style={styles.td}>#{c.id}</td>
                      <td style={styles.td}><strong>{c.name}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Measurement Units ({units.length})</h3>
                <p style={styles.cardSub}>Dynamic portion units.</p>
              </div>
              <button onClick={() => triggerExport('categories_units')} style={styles.downloadCsvBtn}>
                <Download size={13} /> Export CSV
              </button>
            </div>
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Unit Name</th>
                    <th style={styles.th}>Default</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map(u => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>#{u.id}</td>
                      <td style={styles.td}><strong>{u.name}</strong></td>
                      <td style={styles.td}>{u.is_default ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 10: STAFF PROFILES */}
      {activeSection === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Staff Profiles &amp; Operator Directory</h3>
                <p style={styles.cardSub}>Security audit: Authentication passwords and secrets are strictly excluded from all exports.</p>
              </div>

              <button onClick={() => triggerExport('staff_export')} style={styles.downloadCsvBtn}>
                <Download size={13} /> Download Staff CSV
              </button>
            </div>

            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Staff Full Name</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Assigned Role</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={styles.tr}>
                      <td style={styles.td}>#{u.id}</td>
                      <td style={styles.td}><strong>{u.name}</strong></td>
                      <td style={styles.td}>{u.username}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: u.role === 'Admin' ? '#EDE7F6' : '#E1F5FE',
                          color: u.role === 'Admin' ? '#512DA8' : '#0288D1'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={styles.td}><span style={{ color: '#2E7D32', fontWeight: '700' }}>Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT PROGRESS MODAL */}
      {exporting && (
        <div style={styles.modalOverlay}>
          <div style={styles.progressCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Download size={24} color="#C62828" className="animate-bounce" />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1F130B' }}>
                  {exportProgress.title || 'Preparing Data Export...'}
                </h3>
                <p style={{ fontSize: '12px', color: '#7A695E', marginTop: '2px' }}>
                  Processing {exportProgress.current.toLocaleString()} / {exportProgress.total.toLocaleString()} records
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 30px',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#FAF6F0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1F130B',
  },
  subtitle: {
    fontSize: '13px',
    color: '#7A695E',
    marginTop: '3px',
  },
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1F130B',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  masterExportBtn: {
    backgroundColor: '#1F130B',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#FFFFFF',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  mainNavTabs: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '8px',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
  },
  mainNavTabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    color: '#7A695E',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  mainNavTabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: 'var(--border-color)',
    color: '#C62828',
    boxShadow: 'var(--shadow-sm)',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '12px 16px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
  },
  periodBtn: {
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    cursor: 'pointer',
  },
  periodBtnActive: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
    color: '#FFFFFF',
  },
  dateInput: {
    padding: '4px 8px',
    fontSize: '11px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FAF6F0',
  },
  activePeriodBadge: {
    fontSize: '12px',
    color: '#1F130B',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '12px',
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '14px 16px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1F130B',
    margin: '4px 0 2px 0',
  },
  kpiSub: {
    fontSize: '11px',
    color: '#A8998F',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#1F130B',
  },
  cardSub: {
    fontSize: '12px',
    color: '#7A695E',
    marginTop: '2px',
  },
  downloadCsvBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFF9F6',
    border: '1px solid #FFCDD2',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#C62828',
    cursor: 'pointer',
  },
  payBox: {
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: '#FAF6F0',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FAF6F0',
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '12px',
    color: '#1F130B',
    width: '140px',
  },
  selectInput: {
    padding: '6px 10px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FAF6F0',
    color: '#1F130B',
    outline: 'none',
  },
  tableScroll: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#7A695E',
    textAlign: 'left',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#FAF6F0',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '10px 12px',
    fontSize: '13px',
    color: '#1F130B',
  },
  historyCard: {
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FAF6F0',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '280px',
  }
};
