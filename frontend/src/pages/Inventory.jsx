import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { getReceiptInnerHtml, getReceiptStyles } from '../utils/receiptGenerator';
import { 
  Package, Boxes, DollarSign, TrendingUp, AlertTriangle, 
  AlertCircle, Plus, Search, Calendar, Download, 
  Eye, RefreshCw, Layers, FileText, ShoppingBag, ArrowUpRight, 
  ArrowDownRight, X, ExternalLink, ArrowUpDown, Sparkles,
  RotateCcw, ShieldAlert, Trash2, ShieldCheck
} from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Inventory() {
  const { showToast, ToastContainerEl } = useToast();

  // Core Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState('stock_table'); 
  // 'stock_table' | 'product_sales' | 'rankings' | 'category_sales' | 'movements' | 'alerts' | 'reports'

  // Date Range Filter States
  const [datePeriod, setDatePeriod] = useState('all_time'); // Default to all_time so total sold starts at zero and tracks all sales day by day
  // 'today' | 'yesterday' | 'day_before_yesterday' | 'last7' | 'last30' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'all_time' | 'custom'
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All'); // 'All' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [tableSortColumn, setTableSortColumn] = useState('periodSoldQty');
  const [tableSortDirection, setTableSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Matrix View Filters & Sort
  const [matrixSortColumn, setMatrixSortColumn] = useState('periodSoldQty');
  const [matrixSortDirection, setMatrixSortDirection] = useState('desc');

  // Rankings Sorting
  const [rankingsSort, setRankingsSort] = useState('most_sold'); // 'most_sold' | 'highest_revenue' | 'highest_orders' | 'least_sold'

  // Movements Audit Log Filter
  const [movementTypeFilter, setMovementTypeFilter] = useState('All');
  const [movementProductFilter, setMovementProductFilter] = useState('All');

  // Modals States
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);

  const [selectedOrderForView, setSelectedOrderForView] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [showQuickAdjustModal, setShowQuickAdjustModal] = useState(false);
  const [adjustTargetProduct, setAdjustTargetProduct] = useState(null);
  const [adjustActionType, setAdjustActionType] = useState('Stock In'); // 'Opening Stock', 'Stock In', 'Stock Out', 'Adjustment'
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Purchase');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustCostPrice, setAdjustCostPrice] = useState('');
  const [adjustThreshold, setAdjustThreshold] = useState('');

  // Reset Inventory Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetScope, setResetScope] = useState('all'); // 'all' | 'category' | 'products'
  const [resetCategory, setResetCategory] = useState('All');
  const [resetSelectedProdIds, setResetSelectedProdIds] = useState([]);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetReason, setResetReason] = useState('Manual Inventory Reset');
  const [resettingLoading, setResettingLoading] = useState(false);
  const [lastResetSnapshot, setLastResetSnapshot] = useState(null);
  const [resetSearchQuery, setResetSearchQuery] = useState('');

  // Inventory Reconciliation States
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcileReport, setReconcileReport] = useState(null);
  const [reconcileLoading, setReconcileLoading] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchEverything();
  }, []);

  const fetchEverything = async () => {
    setLoading(true);
    try {
      const [prodList, orderList, itemsList, logsList, catsList, refundsList, sysSettings] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getOrders().catch(() => []),
        api.getOrderItems().catch(() => []),
        api.getInventoryLogs().catch(() => []),
        api.getCategories().catch(() => []),
        api.getRefunds().catch(() => []),
        api.getSettings().catch(() => ({}))
      ]);

      setProducts(prodList || []);
      setOrders(orderList || []);
      setOrderItems(itemsList || []);
      setLogs(logsList || []);
      setCategories(catsList || []);
      setRefunds(refundsList || []);
      setSettings(sysSettings || {});
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      showToast(`Error loading data: ${err.message}`, 'error');
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
    if (datePeriod === 'all_time') {
      return { start: '1970-01-01', end: '2099-12-31', label: 'All Time' };
    }
    // Custom
    return { 
      start: customStartDate || todayStr, 
      end: customEndDate || todayStr, 
      label: `Custom: ${customStartDate} → ${customEndDate}` 
    };
  }, [datePeriod, customStartDate, customEndDate]);

  // Pre-index completed orders (strictly excluding Cancelled, Held, Draft)
  const completedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Completed');
  }, [orders]);

  const completedOrdersMap = useMemo(() => {
    const map = new Map();
    completedOrders.forEach(o => map.set(o.id, o));
    return map;
  }, [completedOrders]);

  // Calculate Product-by-Product Aggregated Metrics
  const productAnalyticsData = useMemo(() => {
    const { start, end } = dateRangeBounds;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    
    const yDate = new Date();
    yDate.setDate(yDate.getDate() - 1);
    const yesterdayStr = yDate.toISOString().slice(0, 10);

    const dbDate = new Date();
    dbDate.setDate(dbDate.getDate() - 2);
    const dayBeforeStr = dbDate.toISOString().slice(0, 10);

    const l7Date = new Date();
    l7Date.setDate(l7Date.getDate() - 6);
    const last7Str = l7Date.toISOString().slice(0, 10);

    const l30Date = new Date();
    l30Date.setDate(l30Date.getDate() - 29);
    const last30Str = l30Date.toISOString().slice(0, 10);

    return products.map(prod => {
      const prodName = prod.name;
      const prodId = prod.id;
      const currentStock = parseFloat(prod.stock) || 0;
      const costPrice = parseFloat(prod.cost_price) || 0;
      const salePrice = parseFloat(prod.price) || 0;
      const lowThreshold = parseFloat(prod.low_stock_threshold !== undefined ? prod.low_stock_threshold : 10);

      let periodSoldQty = 0;
      let periodRevenue = 0;
      let todaySoldQty = 0;
      let todayRevenue = 0;
      let yesterdaySoldQty = 0;
      let yesterdayRevenue = 0;
      let dayBeforeSoldQty = 0;
      let dayBeforeRevenue = 0;
      let last7SoldQty = 0;
      let last7Revenue = 0;
      let last30SoldQty = 0;
      let last30Revenue = 0;
      let allTimeSoldQty = 0;
      let allTimeRevenue = 0;
      let lastSoldTime = null;

      const orderReferences = [];
      const distinctOrdersSet = new Set();

      orderItems.forEach(item => {
        if (item.product_id === prodId || item.product_name === prodName) {
          const parentOrder = completedOrdersMap.get(item.order_id);
          if (parentOrder && parentOrder.created_at) {
            const orderDateStr = parentOrder.created_at.substring(0, 10);
            const itemQty = parseFloat(item.quantity) || 0;
            const itemSubtotal = parseFloat(item.subtotal) || (itemQty * (parseFloat(item.price) || salePrice));

            allTimeSoldQty += itemQty;
            allTimeRevenue += itemSubtotal;
            distinctOrdersSet.add(parentOrder.id);

            if (!lastSoldTime || parentOrder.created_at > lastSoldTime) {
              lastSoldTime = parentOrder.created_at;
            }

            if (orderDateStr === todayStr) {
              todaySoldQty += itemQty;
              todayRevenue += itemSubtotal;
            }
            if (orderDateStr === yesterdayStr) {
              yesterdaySoldQty += itemQty;
              yesterdayRevenue += itemSubtotal;
            }
            if (orderDateStr === dayBeforeStr) {
              dayBeforeSoldQty += itemQty;
              dayBeforeRevenue += itemSubtotal;
            }
            if (orderDateStr >= last7Str && orderDateStr <= todayStr) {
              last7SoldQty += itemQty;
              last7Revenue += itemSubtotal;
            }
            if (orderDateStr >= last30Str && orderDateStr <= todayStr) {
              last30SoldQty += itemQty;
              last30Revenue += itemSubtotal;
            }
            if (orderDateStr >= start && orderDateStr <= end) {
              periodSoldQty += itemQty;
              periodRevenue += itemSubtotal;
              orderReferences.push({
                order_id: parentOrder.id,
                date: parentOrder.created_at,
                quantity: itemQty,
                unit_price: parseFloat(item.price) || salePrice,
                subtotal: itemSubtotal,
                order_type: parentOrder.order_type,
                customer_name: parentOrder.customer_name || 'Walk-in',
                payment_method: parentOrder.payment_method || 'Cash'
              });
            }
          }
        }
      });

      // 1. Gather all logs for this product
      const prodLogs = logs.filter(l => l.product_name === prodName);

      let periodAdded = 0;
      let periodWastage = 0;
      let periodAdjusted = 0;
      let periodReturned = 0;
      let todayAdded = 0;

      // Inflows and Outflows prior to start date
      let priorInflows = 0;
      let priorOutflows = 0;
      let priorAdjustments = 0;
      let initialOpeningLog = 0;

      prodLogs.forEach(l => {
        const logDateStr = l.date ? l.date.substring(0, 10) : '';
        const logQty = parseFloat(l.quantity) || 0;

        if (logDateStr < start) {
          if (l.type === 'Opening Stock' || l.reason === 'Opening Stock') {
            initialOpeningLog = logQty;
            priorInflows = logQty;
            priorOutflows = 0;
            priorAdjustments = 0;
          } else if (l.type === 'Stock In') {
            priorInflows += logQty;
          } else if (l.type === 'Stock Out') {
            priorOutflows += logQty;
          } else if (l.type === 'Adjustment') {
            if (l.reason === 'Inventory Reset') {
              priorInflows = 0;
              priorOutflows = 0;
              priorAdjustments = 0;
            } else if (l.after_stock !== undefined && l.before_stock !== undefined) {
              priorAdjustments += (parseFloat(l.after_stock) - parseFloat(l.before_stock));
            } else {
              priorAdjustments += logQty;
            }
          }
        } else if (logDateStr >= start && logDateStr <= end) {
          if (logDateStr === todayStr && l.type === 'Stock In' && l.reason !== 'Refund' && l.reason !== 'Return') {
            todayAdded += logQty;
          }

          if (l.type === 'Opening Stock' || l.reason === 'Opening Stock') {
            initialOpeningLog = logQty;
          } else if (l.type === 'Stock In') {
            if (l.reason === 'Refund' || l.reason === 'Return' || (l.note && l.note.toLowerCase().includes('return')) || (l.note && l.note.toLowerCase().includes('refund'))) {
              periodReturned += logQty;
            } else {
              periodAdded += logQty;
            }
          } else if (l.type === 'Stock Out') {
            if (l.reason === 'Waste' || l.reason === 'Wastage' || l.reason === 'Damaged' || l.reason === 'Damage' || l.reason === 'Expired' || l.reason === 'Staff Meal' || l.reason === 'Kitchen Loss' || (l.note && l.note.toLowerCase().includes('waste')) || (l.note && l.note.toLowerCase().includes('damage'))) {
              periodWastage += logQty;
            }
          } else if (l.type === 'Adjustment') {
            if (l.reason === 'Inventory Reset') {
              periodAdjusted -= (parseFloat(l.before_stock) || currentStock);
            } else if (l.after_stock !== undefined && l.before_stock !== undefined) {
              periodAdjusted += (parseFloat(l.after_stock) - parseFloat(l.before_stock));
            } else {
              periodAdjusted += logQty;
            }
          }
        }
      });

      // Core Mathematical Ledger Relationship:
      // Opening Stock + Stock Added + Returns - Sold (Period) - Wastage ± Adjustments = Current Stock
      let openingStock = 0;
      if (datePeriod === 'all_time') {
        // For All-Time: Opening Stock is the initial setup baseline, or reconstructed backward
        openingStock = initialOpeningLog > 0 ? initialOpeningLog : Math.max(0, currentStock + periodSoldQty + periodWastage - periodAdded - periodReturned - periodAdjusted);
      } else {
        // For Date Periods: Opening is stock at instant before period start
        openingStock = Math.max(0, currentStock + periodSoldQty + periodWastage - periodAdded - periodReturned - periodAdjusted);
      }

      // Closing Stock matches live physical stock perfectly
      const closingStock = currentStock;

      const netSold = Math.max(0, periodSoldQty - periodReturned);
      const estimatedCost = costPrice * periodSoldQty;
      const profit = costPrice > 0 ? (periodRevenue - estimatedCost) : null;
      const profitMarginPct = (costPrice > 0 && periodRevenue > 0) ? Math.round((profit / periodRevenue) * 100) : null;

      let status = 'in_stock';
      if (currentStock <= 0) status = 'out_of_stock';
      else if (currentStock <= lowThreshold) status = 'low_stock';

      return {
        ...prod,
        currentStock,
        costPrice,
        salePrice,
        lowThreshold,
        openingStock,
        periodSoldQty,
        periodRevenue,
        periodAdded,
        periodReturned,
        periodWastage,
        periodAdjusted,
        netSold,
        todaySoldQty,
        todayRevenue,
        yesterdaySoldQty,
        yesterdayRevenue,
        dayBeforeSoldQty,
        dayBeforeRevenue,
        last7SoldQty,
        last7Revenue,
        last30SoldQty,
        last30Revenue,
        todayAdded,
        allTimeSoldQty,
        allTimeRevenue,
        orderCount: distinctOrdersSet.size,
        profit,
        profitMarginPct,
        status,
        lastSoldTime,
        orderReferences: orderReferences.sort((a, b) => b.order_id - a.order_id)
      };
    });
  }, [products, orderItems, completedOrdersMap, logs, dateRangeBounds, datePeriod]);

  // Overall Global Summary Cards Metrics
  const summaryCards = useMemo(() => {
    let totalProducts = products.length;
    let totalStockUnits = 0;
    let totalStockValue = 0;
    let totalSoldInPeriod = 0;
    let totalRevenueInPeriod = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalAddedToday = 0;
    let totalSoldToday = 0;
    let totalRevenueToday = 0;

    productAnalyticsData.forEach(p => {
      totalStockUnits += p.currentStock;
      totalStockValue += p.currentStock * (p.costPrice > 0 ? p.costPrice : p.salePrice);
      totalSoldInPeriod += p.periodSoldQty;
      totalRevenueInPeriod += p.periodRevenue;
      totalAddedToday += p.todayAdded;
      totalSoldToday += p.todaySoldQty;
      totalRevenueToday += p.todayRevenue;

      if (p.status === 'out_of_stock') outOfStockCount++;
      else if (p.status === 'low_stock') lowStockCount++;
    });

    return {
      totalProducts,
      totalStockUnits,
      totalStockValue,
      totalSoldInPeriod,
      totalRevenueInPeriod,
      lowStockCount,
      outOfStockCount,
      totalAddedToday,
      totalSoldToday,
      totalRevenueToday
    };
  }, [products, productAnalyticsData]);

  // Filter & Sort Table Products (Stock Reconciliation Tab)
  const filteredTableProducts = useMemo(() => {
    let list = productAnalyticsData.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.urdu && p.urdu.includes(searchQuery)) ||
                          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (stockStatusFilter !== 'All' && p.status !== stockStatusFilter) return false;
      return true;
    });

    list.sort((a, b) => {
      let valA = a[tableSortColumn];
      let valB = b[tableSortColumn];

      if (typeof valA === 'string') {
        return tableSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
      return tableSortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [productAnalyticsData, searchQuery, selectedCategory, stockStatusFilter, tableSortColumn, tableSortDirection]);

  // Matrix Table Filter & Sort
  const filteredMatrixProducts = useMemo(() => {
    let list = productAnalyticsData.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.urdu && p.urdu.includes(searchQuery)) ||
                          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchSearch) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      return true;
    });

    list.sort((a, b) => {
      let valA = a[matrixSortColumn];
      let valB = b[matrixSortColumn];

      if (typeof valA === 'string') {
        return matrixSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
      return matrixSortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [productAnalyticsData, searchQuery, selectedCategory, matrixSortColumn, matrixSortDirection]);

  // Category Sales Breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {};
    productAnalyticsData.forEach(p => {
      const cat = p.category || 'Uncategorized';
      if (!map[cat]) {
        map[cat] = {
          name: cat,
          productsCount: 0,
          periodSoldQty: 0,
          periodRevenue: 0,
          currentStockUnits: 0,
          stockValue: 0
        };
      }
      map[cat].productsCount += 1;
      map[cat].periodSoldQty += p.periodSoldQty;
      map[cat].periodRevenue += p.periodRevenue;
      map[cat].currentStockUnits += p.currentStock;
      map[cat].stockValue += p.currentStock * (p.costPrice > 0 ? p.costPrice : p.salePrice);
    });

    const totalRev = Object.values(map).reduce((acc, c) => acc + c.periodRevenue, 0);
    return Object.values(map).map(c => ({
      ...c,
      sharePct: totalRev > 0 ? Math.round((c.periodRevenue / totalRev) * 100) : 0
    })).sort((a, b) => b.periodRevenue - a.periodRevenue);
  }, [productAnalyticsData]);

  // Top Sellers & Slow Movers
  const { topSellers, slowMovers } = useMemo(() => {
    const sorted = [...productAnalyticsData];
    if (rankingsSort === 'most_sold') {
      sorted.sort((a, b) => b.periodSoldQty - a.periodSoldQty);
    } else if (rankingsSort === 'highest_revenue') {
      sorted.sort((a, b) => b.periodRevenue - a.periodRevenue);
    } else if (rankingsSort === 'highest_orders') {
      sorted.sort((a, b) => b.orderCount - a.orderCount);
    } else if (rankingsSort === 'least_sold') {
      sorted.sort((a, b) => a.periodSoldQty - b.periodSoldQty);
    }

    const top = sorted.filter(p => p.periodSoldQty > 0).slice(0, 15);
    const slow = sorted.filter(p => p.periodSoldQty === 0 || p.periodSoldQty <= 2).slice(0, 15);
    return { topSellers: top, slowMovers: slow };
  }, [productAnalyticsData, rankingsSort]);
  const filteredMovementLogs = useMemo(() => {
    return logs.filter(l => {
      if (movementTypeFilter !== 'All' && l.type !== movementTypeFilter) return false;
      if (movementProductFilter !== 'All' && l.product_name !== movementProductFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const pName = (l.product_name || '').toLowerCase();
        const note = (l.note || '').toLowerCase();
        const reason = (l.reason || '').toLowerCase();
        if (!pName.includes(q) && !note.includes(q) && !reason.includes(q)) return false;
      }
      return true;
    });
  }, [logs, movementTypeFilter, movementProductFilter, searchQuery]);

  // Handlers
  const handleSortHeader = (col) => {
    if (tableSortColumn === col) {
      setTableSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setTableSortColumn(col);
      setTableSortDirection('desc');
    }
  };

  const handleMatrixSortHeader = (col) => {
    if (matrixSortColumn === col) {
      setMatrixSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setMatrixSortColumn(col);
      setMatrixSortDirection('desc');
    }
  };

  const handleOpenQuickAdjust = (prod = null, defaultAction = 'Stock In') => {
    const target = prod || products[0];
    if (!target) return;
    setAdjustTargetProduct(target);
    setAdjustActionType(defaultAction);
    setAdjustQty('');
    setAdjustReason(defaultAction === 'Stock In' ? 'Purchase' : defaultAction === 'Stock Out' ? 'Waste' : defaultAction === 'Opening Stock' ? 'Opening Stock' : 'Physical Count Correction');
    setAdjustNote('');
    setAdjustCostPrice(target.cost_price || 0);
    setAdjustThreshold(target.low_stock_threshold !== undefined ? target.low_stock_threshold : 10);
    setShowQuickAdjustModal(true);
  };

  const handleQuickAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustTargetProduct || adjustQty === '') return;

    try {
      const qtyNum = parseFloat(adjustQty);
      if (isNaN(qtyNum)) {
        showToast('Please enter a valid numeric quantity.', 'error');
        return;
      }

      if (adjustActionType === 'Opening Stock') {
        await api.setOpeningStock({
          productId: adjustTargetProduct.id,
          productName: adjustTargetProduct.name,
          openingQty: qtyNum,
          user: 'Admin',
          note: adjustNote || 'Initial Opening Stock Setup'
        });
        showToast(`Set Opening Stock for "${adjustTargetProduct.name}" to ${qtyNum}`, 'success');
      } else if (adjustActionType === 'Stock In') {
        await api.addStock({
          productId: adjustTargetProduct.id,
          productName: adjustTargetProduct.name,
          quantity: qtyNum,
          reason: adjustReason || 'Purchase',
          note: adjustNote || 'Inward Stock Addition',
          user: 'Admin',
          cost_price: parseFloat(adjustCostPrice) || 0,
          low_stock_threshold: parseFloat(adjustThreshold) || 10
        });
        showToast(`Added +${qtyNum} stock to "${adjustTargetProduct.name}"`, 'success');
      } else if (adjustActionType === 'Stock Out') {
        await api.recordWastage({
          productId: adjustTargetProduct.id,
          productName: adjustTargetProduct.name,
          quantity: qtyNum,
          reason: adjustReason || 'Waste',
          note: adjustNote || 'Kitchen Wastage',
          user: 'Admin'
        });
        showToast(`Recorded -${qtyNum} wastage for "${adjustTargetProduct.name}"`, 'success');
      } else { // Adjustment
        await api.adjustStock({
          productId: adjustTargetProduct.id,
          productName: adjustTargetProduct.name,
          newQuantity: qtyNum,
          reason: adjustReason || 'Physical Count Correction',
          note: adjustNote || 'Physical Count Correction',
          user: 'Admin',
          cost_price: parseFloat(adjustCostPrice) || 0,
          low_stock_threshold: parseFloat(adjustThreshold) || 10
        });
        showToast(`Adjusted physical stock of "${adjustTargetProduct.name}" to ${qtyNum}`, 'success');
      }

      setShowQuickAdjustModal(false);
      await fetchEverything();
    } catch (err) {
      showToast(`Failed to update stock: ${err.message}`, 'error');
    }
  };

  // Reconciliation Handlers
  const handleOpenReconcileModal = async () => {
    try {
      setReconcileLoading(true);
      setShowReconcileModal(true);
      const rep = await api.reconcileInventory();
      setReconcileReport(rep);
    } catch (err) {
      showToast(`Failed to audit reconciliation: ${err.message}`, 'error');
    } finally {
      setReconcileLoading(false);
    }
  };

  const handleExecuteReconcile = async () => {
    try {
      setReconcileLoading(true);
      const rep = await api.reconcileInventory({ autoCorrect: true });
      setReconcileReport(rep);
      showToast(`Successfully reconciled ${rep.correctedCount} products with ledger.`, 'success');
      await fetchEverything();
    } catch (err) {
      showToast(`Reconciliation failed: ${err.message}`, 'error');
    } finally {
      setReconcileLoading(false);
    }
  };

  const handleOpenProductDetails = (prod) => {
    const enriched = productAnalyticsData.find(p => p.id === prod.id) || prod;
    setSelectedProductDetails(enriched);
    setShowProductDetailModal(true);
  };

  const handleOpenOrderModal = async (orderId) => {
    try {
      const details = await api.getOrderDetails(orderId);
      if (details && details.order) {
        setSelectedOrderForView(details);
        setShowOrderModal(true);
      }
    } catch (err) {
      showToast(`Could not load order details: ${err.message}`, 'error');
    }
  };

  const handleExportCSV = (reportType) => {
    let rows = [];
    let filename = `inventory_${reportType}_${dateRangeBounds.start}_to_${dateRangeBounds.end}.csv`;

    if (reportType === 'stock') {
      rows.push(['Product Name', 'Category', 'Unit', 'Opening Stock', 'Stock Added', 'Sold (Period)', 'Returned', 'Net Sold', 'Wastage', 'Adjustments', 'Current Stock', 'Total Sold (All Time)', 'Sale Price', 'Period Revenue', 'Status', 'Last Sold']);
      productAnalyticsData.forEach(p => {
        rows.push([
          `"${p.name}"`,
          `"${p.category}"`,
          `"${p.unit}"`,
          p.openingStock,
          p.periodAdded,
          p.periodSoldQty,
          p.periodReturned,
          p.netSold,
          p.periodWastage,
          p.periodAdjusted,
          p.currentStock,
          p.allTimeSoldQty,
          p.salePrice,
          p.periodRevenue,
          `"${p.status}"`,
          `"${p.lastSoldTime || 'Never'}"`
        ]);
      });
    } else if (reportType === 'matrix') {
      rows.push(['Product Name', 'Category', 'Unit', 'Today Sold', 'Yesterday Sold', 'Day Before Sold', 'Last 7 Days Sold', 'Last 30 Days Sold', 'All Time Sold', 'All Time Revenue', 'Orders Count', 'Last Sold']);
      productAnalyticsData.forEach(p => {
        rows.push([
          `"${p.name}"`,
          `"${p.category}"`,
          `"${p.unit}"`,
          p.todaySoldQty,
          p.yesterdaySoldQty,
          p.dayBeforeSoldQty,
          p.last7SoldQty,
          p.last30SoldQty,
          p.allTimeSoldQty,
          p.allTimeRevenue,
          p.orderCount,
          `"${p.lastSoldTime || 'Never'}"`
        ]);
      });
    } else if (reportType === 'movements') {
      rows.push(['Date Time', 'Product Name', 'Movement Type', 'Quantity', 'Before Stock', 'After Stock', 'User/Staff', 'Reason', 'Note']);
      filteredMovementLogs.forEach(l => {
        rows.push([
          `"${l.date}"`,
          `"${l.product_name}"`,
          `"${l.type}"`,
          l.quantity,
          l.before_stock !== undefined ? l.before_stock : '',
          l.after_stock !== undefined ? l.after_stock : '',
          `"${l.user || 'System'}"`,
          `"${l.reason || ''}"`,
          `"${l.note || ''}"`
        ]);
      });
    } else if (reportType === 'sales') {
      rows.push(['Product Name', 'Category', 'Unit', 'Quantity Sold', 'Sale Price', 'Total Revenue', 'Cost Price', 'Profit']);
      productAnalyticsData.forEach(p => {
        rows.push([
          `"${p.name}"`,
          `"${p.category}"`,
          `"${p.unit}"`,
          p.periodSoldQty,
          p.salePrice,
          p.periodRevenue,
          p.costPrice,
          p.profit !== null ? p.profit : 'N/A'
        ]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${reportType} report successfully.`, 'success');
  };

  // --- RESET INVENTORY HANDLERS ---
  const handleSingleProductReset = async (prod) => {
    if (!prod) return;
    const confirmed = window.confirm(`Reset current stock of "${prod.name}" from ${prod.currentStock || prod.stock || 0} to 0?\n\nThis will NOT delete sales history, orders, or reports.`);
    if (!confirmed) return;
    try {
      setLoading(true);
      const res = await api.resetInventoryStock({
        scope: 'products',
        productIds: [prod.id],
        user: 'Admin',
        reason: `Single product reset for ${prod.name}`
      });
      showToast(`Reset ${prod.name} stock to 0. Snapshot saved.`, 'success');
      setLastResetSnapshot(res.snapshotFile);
      if (showProductDetailModal) setShowProductDetailModal(false);
      await fetchEverything();
    } catch (err) {
      showToast(`Failed to reset stock: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetInventorySubmit = async (e) => {
    e.preventDefault();
    if (resetConfirmText.trim().toUpperCase() !== 'RESET') {
      showToast('Please type RESET in the confirmation box to proceed.', 'error');
      return;
    }
    if (resetScope === 'products' && resetSelectedProdIds.length === 0) {
      showToast('Please select at least one product to reset.', 'error');
      return;
    }
    try {
      setResettingLoading(true);
      const res = await api.resetInventoryStock({
        scope: resetScope,
        categoryName: resetCategory,
        productIds: resetSelectedProdIds,
        user: 'Admin',
        reason: resetReason || 'Manual Inventory Reset'
      });
      showToast(`Successfully reset ${res.affectedCount} products (${res.previousTotalStock} units) to 0.`, 'success');
      setLastResetSnapshot(res.snapshotFile);
      setShowResetModal(false);
      setResetConfirmText('');
      setResetSelectedProdIds([]);
      await fetchEverything();
    } catch (err) {
      showToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setResettingLoading(false);
    }
  };

  const handleRestoreSnapshot = async () => {
    if (!lastResetSnapshot) return;
    const confirmed = window.confirm('Restore pre-reset stock quantities from the most recent snapshot?\n\nThis will revert current stock back to the state before the reset.');
    if (!confirmed) return;
    try {
      setLoading(true);
      const res = await api.restoreInventorySnapshot(lastResetSnapshot);
      showToast(`Restored ${res.restoredCount} products from previous snapshot.`, 'success');
      setLastResetSnapshot(null);
      await fetchEverything();
    } catch (err) {
      showToast(`Restore failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Inventory &amp; Stock Intelligence</h1>
          <p style={styles.subtitle}>
            Accurate product-by-product sales tracking, live stock reconciliation, multi-period velocity, and POS deduction analytics.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {lastResetSnapshot && (
            <button 
              type="button"
              onClick={handleRestoreSnapshot}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFF8E1',
                color: '#F57F17',
                border: '1px solid #FFE082',
                padding: '8px 12px',
                borderRadius: '7px',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              title="Revert the most recent inventory reset"
            >
              <RotateCcw size={13} /> Undo Last Reset
            </button>
          )}

          <button 
            type="button"
            onClick={() => {
              setResetScope('all');
              setResetConfirmText('');
              setResetSelectedProdIds([]);
              setShowResetModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFF5F5',
              color: '#C62828',
              border: '1px solid #FFCDD2',
              padding: '8px 12px',
              borderRadius: '7px',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Safely reset current physical stock to 0 without touching sales history"
          >
            <RotateCcw size={13} /> Reset Stock to Zero
          </button>

          <button 
            type="button"
            onClick={handleOpenReconcileModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#E8F5E9',
              color: '#2E7D32',
              border: '1px solid #C8E6C9',
              padding: '8px 12px',
              borderRadius: '7px',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer'
            }}
            title="Audit and synchronize stock differences against ledger history"
          >
            <ShieldCheck size={13} /> Reconcile Stock
          </button>

          <button 
            type="button"
            onClick={() => handleOpenQuickAdjust()}
            style={styles.primaryActionBtn}
          >
            <Plus size={15} /> Quick Stock Adjust
          </button>
          
          <button 
            type="button"
            onClick={fetchEverything}
            style={styles.refreshBtn}
            title="Refresh All Data"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME 4x2 SUMMARY KPI CARDS */}
      <div style={styles.summaryGrid}>
        {/* Row 1 */}
        <div style={styles.summaryCard}>
          <div style={styles.cardTop}>
            <span style={styles.cardLabel}>Total Products</span>
            <Boxes size={15} color="#7A695E" />
          </div>
          <div style={styles.cardValue}>{summaryCards.totalProducts}</div>
          <div style={styles.cardSub}>Active dishes in catalog</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.cardTop}>
            <span style={styles.cardLabel}>Current Stock Units</span>
            <Package size={15} color="#2E7D32" />
          </div>
          <div style={{ ...styles.cardValue, color: '#2E7D32' }}>{summaryCards.totalStockUnits}</div>
          <div style={styles.cardSub}>Units in physical storage</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.cardTop}>
            <span style={styles.cardLabel}>Sold Today</span>
            <ShoppingBag size={15} color="#1565C0" />
          </div>
          <div style={{ ...styles.cardValue, color: '#1565C0' }}>{summaryCards.totalSoldToday} Units</div>
          <div style={styles.cardSub}>Total individual items sold today</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.cardTop}>
            <span style={styles.cardLabel}>Sales Revenue Today</span>
            <DollarSign size={15} color="#00695C" />
          </div>
          <div style={{ ...styles.cardValue, color: '#00695C' }}>Rs {summaryCards.totalRevenueToday.toLocaleString()}</div>
          <div style={styles.cardSub}>Completed today's orders</div>
        </div>

        {/* Row 2 */}
        <div style={styles.summaryCard}>
          <div style={styles.cardTop}>
            <span style={styles.cardLabel}>Stock Added Today</span>
            <ArrowUpRight size={15} color="#2E7D32" />
          </div>
          <div style={{ ...styles.cardValue, color: '#2E7D32' }}>+{summaryCards.totalAddedToday} Units</div>
          <div style={styles.cardSub}>Inward supplier stock</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.cardTop}>
            <span style={styles.cardLabel}>Period Revenue</span>
            <TrendingUp size={15} color="#E65100" />
          </div>
          <div style={{ ...styles.cardValue, color: '#E65100' }}>Rs {summaryCards.totalRevenueInPeriod.toLocaleString()}</div>
          <div style={styles.cardSub}>{summaryCards.totalSoldInPeriod} units sold in period</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.cardTop}>
            <span style={styles.cardLabel}>Low Stock Alerts</span>
            <AlertTriangle size={15} color={summaryCards.lowStockCount > 0 ? '#F57F17' : '#7A695E'} />
          </div>
          <div style={{ ...styles.cardValue, color: summaryCards.lowStockCount > 0 ? '#F57F17' : '#1F130B' }}>
            {summaryCards.lowStockCount}
          </div>
          <div style={styles.cardSub}>At/below configured threshold</div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.cardTop}>
            <span style={styles.cardLabel}>Out of Stock</span>
            <AlertCircle size={15} color={summaryCards.outOfStockCount > 0 ? '#C62828' : '#7A695E'} />
          </div>
          <div style={{ ...styles.cardValue, color: summaryCards.outOfStockCount > 0 ? '#C62828' : '#1F130B' }}>
            {summaryCards.outOfStockCount}
          </div>
          <div style={styles.cardSub}>0 units remaining</div>
        </div>
      </div>

      {/* 3. MULTI-PERIOD FILTER BAR */}
      <div style={styles.filterBarCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#7A695E', textTransform: 'uppercase', marginRight: '4px' }}>
            Period:
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
            { id: 'all_time', label: 'All Time' },
            { id: 'custom', label: 'Custom' }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setDatePeriod(p.id)}
              style={{
                ...styles.periodPillBtn,
                ...(datePeriod === p.id ? styles.periodPillBtnActive : {})
              }}
            >
              {p.label}
            </button>
          ))}

          {datePeriod === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={styles.datePickerInput}
              />
              <span style={{ color: '#7A695E', fontSize: '11px' }}>→</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={styles.datePickerInput}
              />
            </div>
          )}
        </div>

        <div style={styles.activeRangeBadge}>
          Active Period: <strong>{dateRangeBounds.label}</strong>
        </div>
      </div>

      {/* 4. SUB-VIEW NAVIGATION TABS */}
      <div style={styles.subViewTabNav}>
        {[
          { id: 'stock_table', label: 'Product Stock & Reconciliation', icon: Layers },
          { id: 'product_sales', label: 'Date-Wise Sales Matrix', icon: Calendar },
          { id: 'rankings', label: 'Top Sellers & Slow Movers', icon: Sparkles },
          { id: 'category_sales', label: 'Category Sales Breakdown', icon: TrendingUp },
          { id: 'movements', label: 'Stock Movement Audit Log', icon: FileText },
          { id: 'alerts', label: 'Stock Alerts', icon: AlertTriangle },
          { id: 'reports', label: 'Reports & Export', icon: Download }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.subViewTabBtn,
                ...(activeTab === tab.id ? styles.subViewTabBtnActive : {})
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 5. TAB CONTENT */}

      {/* TAB 1: PRODUCT STOCK & RECONCILIATION TABLE */}
      {activeTab === 'stock_table' && (
        <div style={styles.card}>
          <div style={styles.tableControlHeader}>
            <div style={styles.searchBox}>
              <Search size={13} color="#7A695E" />
              <input
                type="text"
                placeholder="Search product, category, or Urdu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="All">All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              <button 
                type="button" 
                onClick={() => handleExportCSV('stock')} 
                style={styles.exportBtn}
                title="Download CSV"
              >
                <Download size={13} /> Export Stock CSV
              </button>
            </div>
          </div>

          <div style={styles.tableScrollWrapper}>
            <table style={styles.masterTable}>
              <thead>
                <tr>
                  <th style={styles.th} onClick={() => handleSortHeader('name')}>
                    Product <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={styles.th} onClick={() => handleSortHeader('category')}>
                    Category <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={styles.th}>Unit</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Opening</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Added</th>
                  <th style={{ ...styles.th, textAlign: 'right', backgroundColor: '#E3F2FD', color: '#0D47A1' }} onClick={() => handleSortHeader('periodSoldQty')}>
                    Sold (Period) <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Returned</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Wastage</th>
                  <th style={{ ...styles.th, textAlign: 'right', backgroundColor: '#E8F5E9', color: '#1B5E20' }} onClick={() => handleSortHeader('currentStock')}>
                    Current Stock <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right' }} onClick={() => handleSortHeader('allTimeSoldQty')}>
                    Total Sold (All-Time) <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right' }} onClick={() => handleSortHeader('periodRevenue')}>
                    Revenue <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={styles.th}>Last Sold</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTableProducts.map(p => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {p.image ? (
                          <img src={p.image} alt={p.name} style={{ width: '26px', height: '26px', borderRadius: '4px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '26px', height: '26px', borderRadius: '4px', backgroundColor: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A695E' }}>
                            <Package size={13} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '700', color: '#1F130B', fontSize: '13px' }}>
                            {p.name} <span style={{ fontSize: '10px', color: '#7A695E', fontWeight: 'normal' }}>#{p.id}</span>
                          </div>
                          {p.urdu && <div style={{ fontSize: '11px', color: '#E28F46', fontWeight: '600' }}>{p.urdu}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>{p.category || 'General'}</span>
                    </td>
                    <td style={{ ...styles.td, color: '#7A695E', fontSize: '12px' }}>{p.unit || 'Piece'}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#7A695E' }}>{p.openingStock}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: p.periodAdded > 0 ? '#2E7D32' : '#7A695E', fontWeight: p.periodAdded > 0 ? '700' : 'normal' }}>
                      {p.periodAdded > 0 ? `+${p.periodAdded}` : '0'}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: p.periodSoldQty > 0 ? '#1565C0' : '#7A695E', backgroundColor: p.periodSoldQty > 0 ? '#F4F9FF' : 'transparent' }}>
                      {p.periodSoldQty}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: p.periodReturned > 0 ? '#E65100' : '#7A695E' }}>
                      {p.periodReturned > 0 ? `-${p.periodReturned}` : '0'}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: p.periodWastage > 0 ? '#C62828' : '#7A695E' }}>
                      {p.periodWastage > 0 ? `-${p.periodWastage}` : '0'}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: p.currentStock <= 0 ? '#C62828' : p.currentStock <= p.lowThreshold ? '#F57F17' : '#2E7D32', backgroundColor: '#F8FBF8' }}>
                      {p.currentStock}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#1F130B' }}>
                      {p.allTimeSoldQty}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#00695C' }}>
                      Rs {p.periodRevenue.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, fontSize: '11px', color: '#7A695E', whiteSpace: 'nowrap' }}>
                      {p.lastSoldTime ? p.lastSoldTime.substring(0, 16) : 'Never'}
                    </td>
                    <td style={styles.td}>
                      {p.status === 'out_of_stock' && <span style={styles.statusOutBadge}>Out of Stock</span>}
                      {p.status === 'low_stock' && <span style={styles.statusLowBadge}>Low ({p.currentStock}≤{p.lowThreshold})</span>}
                      {p.status === 'in_stock' && <span style={styles.statusInBadge}>In Stock</span>}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenProductDetails(p)}
                          style={styles.iconBtn}
                          title="View Sales History & Analytics"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickAdjust(p)}
                          style={styles.adjustPillBtn}
                          title="Adjust Stock"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTableProducts.length === 0 && (
                  <tr>
                    <td colSpan={14} style={{ textAlign: 'center', padding: '24px', color: '#7A695E' }}>
                      No product inventory records match your search query.
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredTableProducts.length > 0 && (
                <tfoot>
                  <tr style={{ backgroundColor: '#FAF6F0', fontWeight: '800', borderTop: '2px solid var(--border-color)' }}>
                    <td style={{ ...styles.td, color: '#1F130B' }} colSpan={3}>
                      Total ({filteredTableProducts.length} items):
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      {filteredTableProducts.reduce((sum, p) => sum + p.openingStock, 0)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#2E7D32' }}>
                      +{filteredTableProducts.reduce((sum, p) => sum + p.periodAdded, 0)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#1565C0', backgroundColor: '#E3F2FD' }}>
                      {filteredTableProducts.reduce((sum, p) => sum + p.periodSoldQty, 0)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#E65100' }}>
                      -{filteredTableProducts.reduce((sum, p) => sum + p.periodReturned, 0)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#C62828' }}>
                      -{filteredTableProducts.reduce((sum, p) => sum + p.periodWastage, 0)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#2E7D32', backgroundColor: '#E8F5E9' }}>
                      {filteredTableProducts.reduce((sum, p) => sum + p.currentStock, 0)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#1F130B' }}>
                      {filteredTableProducts.reduce((sum, p) => sum + p.allTimeSoldQty, 0)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#00695C' }}>
                      Rs {filteredTableProducts.reduce((sum, p) => sum + p.periodRevenue, 0).toLocaleString()}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DATE-WISE PRODUCT SALES MATRIX TABLE */}
      {activeTab === 'product_sales' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Date-Wise Product Sales Comparison Matrix</h2>
              <p style={{ fontSize: '12px', color: '#7A695E' }}>
                Compare actual items sold across Today, Yesterday, Day Before Yesterday, Last 7 Days, Last 30 Days, and All-Time.
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => handleExportCSV('matrix')} 
              style={styles.exportBtn}
            >
              <Download size={13} /> Export Matrix CSV
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ ...styles.searchBox, width: '260px' }}>
              <Search size={13} color="#7A695E" />
              <input
                type="text"
                placeholder="Filter matrix products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.selectFilter}
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div style={styles.tableScrollWrapper}>
            <table style={styles.masterTable}>
              <thead>
                <tr>
                  <th style={styles.th} onClick={() => handleSortMatrixHeader('name')}>
                    Product <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={styles.th} onClick={() => handleSortMatrixHeader('category')}>
                    Category <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={styles.th}>Unit</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#1565C0' }} onClick={() => handleSortMatrixHeader('todaySoldQty')}>
                    Today <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#5D4037' }} onClick={() => handleSortMatrixHeader('yesterdaySoldQty')}>
                    Yesterday <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right' }} onClick={() => handleSortMatrixHeader('dayBeforeSoldQty')}>
                    Day Before <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right' }} onClick={() => handleSortMatrixHeader('last7SoldQty')}>
                    Last 7 Days <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right' }} onClick={() => handleSortMatrixHeader('last30SoldQty')}>
                    Last 30 Days <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right', fontWeight: '800', color: '#C62828' }} onClick={() => handleSortMatrixHeader('allTimeSoldQty')}>
                    All Time Sold <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#00695C' }} onClick={() => handleSortMatrixHeader('allTimeRevenue')}>
                    All Time Revenue <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                  </th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Orders Count</th>
                  <th style={styles.th}>Last Sold</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatrixProducts.map(p => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '700', color: '#1F130B' }}>{p.name}</div>
                      {p.urdu && <div style={{ fontSize: '11px', color: '#E28F46' }}>{p.urdu}</div>}
                    </td>
                    <td style={styles.td}><span style={styles.categoryBadge}>{p.category}</span></td>
                    <td style={{ ...styles.td, color: '#7A695E', fontSize: '12px' }}>{p.unit}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: p.todaySoldQty > 0 ? '#1565C0' : '#7A695E', backgroundColor: p.todaySoldQty > 0 ? '#F4F9FF' : 'transparent' }}>
                      {p.todaySoldQty}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: p.yesterdaySoldQty > 0 ? '#5D4037' : '#7A695E' }}>
                      {p.yesterdaySoldQty}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#7A695E' }}>
                      {p.dayBeforeSoldQty}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>
                      {p.last7SoldQty}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>
                      {p.last30SoldQty}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#C62828', backgroundColor: '#FFF9F6' }}>
                      {p.allTimeSoldQty}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#00695C' }}>
                      Rs {p.allTimeRevenue.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#7A695E' }}>
                      {p.orderCount} orders
                    </td>
                    <td style={{ ...styles.td, fontSize: '11px', color: '#7A695E', whiteSpace: 'nowrap' }}>
                      {p.lastSoldTime ? p.lastSoldTime.substring(0, 16) : 'Never'}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenProductDetails(p)}
                        style={styles.iconBtn}
                        title="Sales Invoices & Breakdown"
                      >
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#FAF6F0', fontWeight: '800', borderTop: '2px solid var(--border-color)' }}>
                  <td colSpan={3} style={{ ...styles.td, color: '#1F130B' }}>Total:</td>
                  <td style={{ ...styles.td, textAlign: 'right', color: '#1565C0' }}>
                    {filteredMatrixProducts.reduce((sum, p) => sum + p.todaySoldQty, 0)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', color: '#5D4037' }}>
                    {filteredMatrixProducts.reduce((sum, p) => sum + p.yesterdaySoldQty, 0)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', color: '#7A695E' }}>
                    {filteredMatrixProducts.reduce((sum, p) => sum + p.dayBeforeSoldQty, 0)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    {filteredMatrixProducts.reduce((sum, p) => sum + p.last7SoldQty, 0)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    {filteredMatrixProducts.reduce((sum, p) => sum + p.last30SoldQty, 0)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', color: '#C62828' }}>
                    {filteredMatrixProducts.reduce((sum, p) => sum + p.allTimeSoldQty, 0)}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right', color: '#00695C' }}>
                    Rs {filteredMatrixProducts.reduce((sum, p) => sum + p.allTimeRevenue, 0).toLocaleString()}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TOP SELLERS & SLOW MOVERS */}
      {activeTab === 'rankings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#7A695E', textTransform: 'uppercase' }}>Rank By:</span>
            {[
              { id: 'most_sold', label: 'Most Units Sold' },
              { id: 'highest_revenue', label: 'Highest Revenue' },
              { id: 'highest_orders', label: 'Number of Orders' },
              { id: 'least_sold', label: 'Lowest Units Sold' }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRankingsSort(r.id)}
                style={{
                  ...styles.periodPillBtn,
                  ...(rankingsSort === r.id ? styles.periodPillBtnActive : {})
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={{ ...styles.sectionTitle, color: '#2E7D32' }}>🔥 Top Selling Products</h3>
                <span style={{ fontSize: '11px', color: '#7A695E' }}>Ranked for selected period</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topSellers.map((p, idx) => (
                  <div key={p.id} style={styles.rankingRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ ...styles.rankBadge, backgroundColor: idx < 3 ? '#C62828' : '#1F130B' }}>#{idx + 1}</span>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1F130B', fontSize: '13px' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#7A695E' }}>{p.category} • Rs {p.salePrice} each • {p.orderCount} orders</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', color: '#1565C0', fontSize: '13px' }}>{p.periodSoldQty} {p.unit} sold</div>
                      <div style={{ fontWeight: '600', color: '#00695C', fontSize: '11px' }}>Rs {p.periodRevenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {topSellers.length === 0 && <p style={{ color: '#7A695E', textAlign: 'center', padding: '16px 0', fontSize: '12px' }}>No sales recorded in this period.</p>}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={{ ...styles.sectionTitle, color: '#E65100' }}>🐢 Slow Moving / Inactive Products</h3>
                <span style={{ fontSize: '11px', color: '#7A695E' }}>≤ 2 sold in period</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {slowMovers.map(p => (
                  <div key={p.id} style={styles.rankingRow}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1F130B', fontSize: '13px' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#7A695E' }}>
                        Current Stock: <strong>{p.currentStock} {p.unit}</strong> • Last Sold: {p.lastSoldTime ? p.lastSoldTime.substring(0, 10) : 'Never'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: '#C62828', fontSize: '12px' }}>{p.periodSoldQty} sold</div>
                      <div style={{ fontSize: '11px', color: '#7A695E' }}>Rs {p.periodRevenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {slowMovers.length === 0 && <p style={{ color: '#7A695E', textAlign: 'center', padding: '16px 0', fontSize: '12px' }}>All catalog items are selling steadily!</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORY SALES BREAKDOWN */}
      {activeTab === 'category_sales' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Category-Wise Sales &amp; Stock Breakdown</h2>
              <p style={{ fontSize: '12px', color: '#7A695E' }}>Sales volume, revenue contributions, and available inventory per category.</p>
            </div>
          </div>

          <div style={styles.tableScrollWrapper}>
            <table style={styles.masterTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Category</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Dishes in Catalog</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#1565C0' }}>Units Sold (Period)</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#00695C' }}>Sales Revenue</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Revenue Share</th>
                  <th style={{ ...styles.th, textAlign: 'right', color: '#2E7D32' }}>Current Stock Units</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Stock Valuation</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map(c => (
                  <tr key={c.name} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#1F130B' }}>
                      <span style={styles.categoryBadge}>{c.name}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#7A695E' }}>{c.productsCount}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#1565C0' }}>
                      {c.periodSoldQty}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#00695C' }}>
                      Rs {c.periodRevenue.toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <div style={{ width: '45px', height: '6px', backgroundColor: '#EFE6DA', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.sharePct}%`, height: '100%', backgroundColor: '#00695C' }}></div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '700' }}>{c.sharePct}%</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#2E7D32' }}>
                      {c.currentStockUnits}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#7A695E' }}>
                      Rs {c.stockValue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STOCK MOVEMENT HISTORY & AUDIT LOG */}
      {activeTab === 'movements' && (
        <div style={styles.card}>
          <div style={styles.tableControlHeader}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="All">All Movement Types</option>
                <option value="Stock In">Stock In (Purchase/Inward)</option>
                <option value="Stock Out">Stock Out (Sale/Wastage)</option>
                <option value="Adjustment">Adjustment</option>
              </select>

              <select
                value={movementProductFilter}
                onChange={(e) => setMovementProductFilter(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="All">All Products</option>
                {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <button 
              type="button" 
              onClick={() => handleExportCSV('movements')} 
              style={styles.exportBtn}
            >
              <Download size={13} /> Export Ledger CSV
            </button>
          </div>

          <div style={styles.tableScrollWrapper}>
            <table style={styles.masterTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Date &amp; Time</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Type</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Quantity</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Before</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>After</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Reference</th>
                  <th style={styles.th}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovementLogs.map(l => {
                  const orderIdMatch = l.note ? l.note.match(/Order #(\d+)/) : null;
                  const orderId = orderIdMatch ? orderIdMatch[1] : null;

                  return (
                    <tr key={l.id} style={styles.tr}>
                      <td style={{ ...styles.td, whiteSpace: 'nowrap', fontSize: '11px', color: '#7A695E' }}>
                        {l.date}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700' }}>{l.product_name}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.logBadge,
                          backgroundColor: l.type === 'Stock In' ? '#E8F5E9' : l.type === 'Stock Out' ? '#FFEBEE' : '#FFF3E0',
                          color: l.type === 'Stock In' ? '#2E7D32' : l.type === 'Stock Out' ? '#C62828' : '#E65100'
                        }}>
                          {l.type}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: l.type === 'Stock In' ? '#2E7D32' : '#C62828' }}>
                        {l.type === 'Stock In' ? `+${l.quantity}` : `-${l.quantity}`}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', color: '#7A695E' }}>
                        {l.before_stock !== undefined ? l.before_stock : '—'}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#1F130B' }}>
                        {l.after_stock !== undefined ? l.after_stock : '—'}
                      </td>
                      <td style={styles.td}>{l.user || 'Admin'}</td>
                      <td style={styles.td}>
                        {orderId ? (
                          <button
                            type="button"
                            onClick={() => handleOpenOrderModal(orderId)}
                            style={styles.orderLinkBtn}
                            title="Open Invoice Slip"
                          >
                            <ExternalLink size={11} /> Invoice #{orderId}
                          </button>
                        ) : (
                          <span>{l.reason || 'Manual Adjustment'}</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, fontSize: '11px', color: '#7A695E', fontStyle: 'italic' }}>
                        {l.note || '—'}
                      </td>
                    </tr>
                  );
                })}
                {filteredMovementLogs.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: '#7A695E' }}>
                      No inventory movements recorded for this time window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: STOCK ALERTS */}
      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Active Stock Warnings &amp; Action Required</h2>
                <p style={{ fontSize: '12px', color: '#7A695E' }}>Restock urgent ingredients and menu items before service rush.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              <div style={{ ...styles.alertBox, borderColor: '#C62828', backgroundColor: '#FFF9F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C62828', fontWeight: '800', fontSize: '13px' }}>
                  <AlertCircle size={16} /> Out of Stock ({productAnalyticsData.filter(p => p.status === 'out_of_stock').length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  {productAnalyticsData.filter(p => p.status === 'out_of_stock').map(p => (
                    <div key={p.id} style={styles.alertItemRow}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1F130B', fontSize: '13px' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#7A695E' }}>Threshold: {p.lowThreshold}</div>
                      </div>
                      <button onClick={() => handleOpenQuickAdjust(p)} style={styles.adjustPillBtn}>Restock Now</button>
                    </div>
                  ))}
                  {productAnalyticsData.filter(p => p.status === 'out_of_stock').length === 0 && (
                    <p style={{ color: '#2E7D32', fontSize: '12px' }}>No products are currently out of stock.</p>
                  )}
                </div>
              </div>

              <div style={{ ...styles.alertBox, borderColor: '#F57F17', backgroundColor: '#FFFDF6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F57F17', fontWeight: '800', fontSize: '13px' }}>
                  <AlertTriangle size={16} /> Low Stock Warnings ({productAnalyticsData.filter(p => p.status === 'low_stock').length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  {productAnalyticsData.filter(p => p.status === 'low_stock').map(p => (
                    <div key={p.id} style={styles.alertItemRow}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1F130B', fontSize: '13px' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: '#F57F17', fontWeight: '700' }}>Only {p.currentStock} {p.unit} left (≤ {p.lowThreshold})</div>
                      </div>
                      <button onClick={() => handleOpenQuickAdjust(p)} style={styles.adjustPillBtn}>Add Stock</button>
                    </div>
                  ))}
                  {productAnalyticsData.filter(p => p.status === 'low_stock').length === 0 && (
                    <p style={{ color: '#2E7D32', fontSize: '12px' }}>All items are comfortably stocked.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Inventory Reports &amp; Data Exports</h2>
              <p style={{ fontSize: '12px', color: '#7A695E' }}>Download spreadsheets for accounting, inventory audits, and suppliers.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div style={styles.reportBox}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1F130B' }}>Product Stock Report</h3>
              <p style={{ fontSize: '12px', color: '#7A695E', marginTop: '4px', lineHeight: '1.4' }}>
                Opening stock, additions, sold quantity, returns, closing balance, and revenue.
              </p>
              <button 
                type="button" 
                onClick={() => handleExportCSV('stock')} 
                style={{ ...styles.reportDownloadBtn, marginTop: '10px' }}
              >
                <Download size={13} /> Download Stock CSV
              </button>
            </div>

            <div style={styles.reportBox}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1F130B' }}>Date-Wise Sales Matrix</h3>
              <p style={{ fontSize: '12px', color: '#7A695E', marginTop: '4px', lineHeight: '1.4' }}>
                Multi-day sales comparison matrix across Today, Yesterday, Day Before, 7D, 30D, and All-Time.
              </p>
              <button 
                type="button" 
                onClick={() => handleExportCSV('matrix')} 
                style={{ ...styles.reportDownloadBtn, marginTop: '10px' }}
              >
                <Download size={13} /> Download Matrix CSV
              </button>
            </div>

            <div style={styles.reportBox}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1F130B' }}>Stock Movement Audit Log</h3>
              <p style={{ fontSize: '12px', color: '#7A695E', marginTop: '4px', lineHeight: '1.4' }}>
                Chronological ledger of stock events with before/after balances.
              </p>
              <button 
                type="button" 
                onClick={() => handleExportCSV('movements')} 
                style={{ ...styles.reportDownloadBtn, marginTop: '10px' }}
              >
                <Download size={13} /> Download Ledger CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: PRODUCT DEEP-DIVE DETAILS */}
      {showProductDetailModal && selectedProductDetails && (
        <div style={styles.modalOverlay} onClick={() => setShowProductDetailModal(false)}>
          <div style={{ ...styles.modalCard, maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ fontWeight: '800', fontSize: '16px', color: '#1F130B' }}>
                  {selectedProductDetails.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#7A695E' }}>
                  Category: {selectedProductDetails.category} • SKU/ID: #{selectedProductDetails.id} {selectedProductDetails.urdu ? `• ${selectedProductDetails.urdu}` : ''}
                </p>
              </div>
              <button onClick={() => setShowProductDetailModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '74vh', overflowY: 'auto' }}>
              
              {/* Top Quick Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                <div style={styles.deepCard}>
                  <span style={styles.deepLabel}>Current Stock</span>
                  <strong style={{ fontSize: '16px', color: selectedProductDetails.currentStock <= 0 ? '#C62828' : '#2E7D32' }}>
                    {selectedProductDetails.currentStock} {selectedProductDetails.unit}
                  </strong>
                </div>

                <div style={styles.deepCard}>
                  <span style={styles.deepLabel}>Sold in Period</span>
                  <strong style={{ fontSize: '16px', color: '#1565C0' }}>
                    {selectedProductDetails.periodSoldQty} {selectedProductDetails.unit}
                  </strong>
                </div>

                <div style={styles.deepCard}>
                  <span style={styles.deepLabel}>Period Revenue</span>
                  <strong style={{ fontSize: '16px', color: '#00695C' }}>
                    Rs {selectedProductDetails.periodRevenue.toLocaleString()}
                  </strong>
                </div>

                <div style={styles.deepCard}>
                  <span style={styles.deepLabel}>Total Sold (All-Time)</span>
                  <strong style={{ fontSize: '16px', color: '#C62828' }}>
                    {selectedProductDetails.allTimeSoldQty} {selectedProductDetails.unit}
                  </strong>
                </div>

                <div style={styles.deepCard}>
                  <span style={styles.deepLabel}>All-Time Revenue</span>
                  <strong style={{ fontSize: '16px', color: '#1F130B' }}>
                    Rs {selectedProductDetails.allTimeRevenue.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Inventory Reconciliation Box */}
              <div style={{ backgroundColor: '#FAF6F0', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1F130B', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Inventory Reconciliation Formula
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '6px', textAlign: 'center' }}>
                  <div style={{ padding: '6px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #EFE6DA' }}>
                    <div style={{ fontSize: '10px', color: '#7A695E' }}>Opening</div>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{selectedProductDetails.openingStock}</div>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #EFE6DA' }}>
                    <div style={{ fontSize: '10px', color: '#2E7D32' }}>+ Added</div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#2E7D32' }}>+{selectedProductDetails.periodAdded}</div>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #EFE6DA' }}>
                    <div style={{ fontSize: '10px', color: '#E65100' }}>+ Returns</div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#E65100' }}>+{selectedProductDetails.periodReturned}</div>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #EFE6DA' }}>
                    <div style={{ fontSize: '10px', color: '#1565C0' }}>- Sold</div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#1565C0' }}>-{selectedProductDetails.periodSoldQty}</div>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #EFE6DA' }}>
                    <div style={{ fontSize: '10px', color: '#C62828' }}>- Wastage</div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#C62828' }}>-{selectedProductDetails.periodWastage}</div>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: '#E8F5E9', borderRadius: '6px', border: '1px solid #C8E6C9' }}>
                    <div style={{ fontSize: '10px', color: '#1B5E20', fontWeight: '700' }}>= Current</div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#1B5E20' }}>{selectedProductDetails.currentStock}</div>
                  </div>
                </div>
              </div>

              {/* Multi-Period Sales Velocity */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1F130B', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Multi-Period Sales Velocity
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>Sold Today</div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#1565C0' }}>{selectedProductDetails.todaySoldQty} {selectedProductDetails.unit}</div>
                    <div style={{ fontSize: '10px', color: '#7A695E' }}>Rs {selectedProductDetails.todayRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>Sold Yesterday</div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#5D4037' }}>{selectedProductDetails.yesterdaySoldQty} {selectedProductDetails.unit}</div>
                    <div style={{ fontSize: '10px', color: '#7A695E' }}>Rs {selectedProductDetails.yesterdayRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>Day Before</div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#1F130B' }}>{selectedProductDetails.dayBeforeSoldQty} {selectedProductDetails.unit}</div>
                    <div style={{ fontSize: '10px', color: '#7A695E' }}>Rs {selectedProductDetails.dayBeforeRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>Last 7 Days</div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#1F130B' }}>{selectedProductDetails.last7SoldQty} {selectedProductDetails.unit}</div>
                    <div style={{ fontSize: '10px', color: '#7A695E' }}>Rs {selectedProductDetails.last7Revenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>Last 30 Days</div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#1F130B' }}>{selectedProductDetails.last30SoldQty} {selectedProductDetails.unit}</div>
                    <div style={{ fontSize: '10px', color: '#7A695E' }}>Rs {selectedProductDetails.last30Revenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Financial Performance */}
              <div style={{ backgroundColor: '#FAF6F0', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1F130B', marginBottom: '6px', textTransform: 'uppercase' }}>Financial Analytics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>Sale Price</div>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>Rs {selectedProductDetails.salePrice}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>Cost Price</div>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{selectedProductDetails.costPrice > 0 ? `Rs ${selectedProductDetails.costPrice}` : 'Not set'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>Completed Orders</div>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{selectedProductDetails.orderCount} orders</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>Last Sold Timestamp</div>
                    <div style={{ fontWeight: '700', fontSize: '12px', color: '#1F130B' }}>
                      {selectedProductDetails.lastSoldTime ? selectedProductDetails.lastSoldTime.substring(0, 16) : 'Never'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Sales Invoices for this product */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1F130B', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Completed Sales Invoices ({selectedProductDetails.orderReferences.length} orders in period)
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <table style={styles.masterTable}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Order #</th>
                        <th style={styles.th}>Date &amp; Time</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Customer</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Qty</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Unit Price</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Revenue</th>
                        <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProductDetails.orderReferences.map(o => (
                        <tr key={o.order_id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: '700' }}>#{o.order_id}</td>
                          <td style={{ ...styles.td, fontSize: '11px', color: '#7A695E' }}>{o.date}</td>
                          <td style={styles.td}><span style={styles.categoryBadge}>{o.order_type}</span></td>
                          <td style={styles.td}>{o.customer_name}</td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#1565C0' }}>{o.quantity}</td>
                          <td style={{ ...styles.td, textAlign: 'right', color: '#7A695E' }}>Rs {o.unit_price}</td>
                          <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: '#00695C' }}>Rs {o.subtotal}</td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenOrderModal(o.order_id)}
                              style={styles.iconBtn}
                              title="View Invoice Slip"
                            >
                              <ExternalLink size={11} /> Bill
                            </button>
                          </td>
                        </tr>
                      ))}
                      {selectedProductDetails.orderReferences.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '14px', color: '#7A695E', fontSize: '12px' }}>
                            No completed orders found for this product in selected date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div style={{ ...styles.modalFooter, padding: '10px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleSingleProductReset(selectedProductDetails)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#FFF5F5',
                  color: '#C62828',
                  border: '1px solid #FFCDD2',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                title="Reset this product's current stock to 0"
              >
                <RotateCcw size={12} /> Reset Stock to 0
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowProductDetailModal(false)} style={styles.subtleBtn}>Close</button>
                <button 
                  onClick={() => {
                    setShowProductDetailModal(false);
                    handleOpenQuickAdjust(selectedProductDetails);
                  }} 
                  style={styles.primaryActionBtn}
                >
                  Adjust Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK ADJUST MODAL */}
      {showQuickAdjustModal && adjustTargetProduct && (
        <div style={styles.modalOverlay} onClick={() => setShowQuickAdjustModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ fontWeight: '800', fontSize: '15px', color: '#1F130B' }}>
                  Manage Stock: {adjustTargetProduct.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#7A695E' }}>
                  Live Stock: <strong>{adjustTargetProduct.stock || 0} {adjustTargetProduct.unit}</strong>
                </span>
              </div>
              <button onClick={() => setShowQuickAdjustModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleQuickAdjustSubmit} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Stock Operation</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {[
                    { id: 'Opening Stock', label: 'Set Opening Stock', reason: 'Opening Stock' },
                    { id: 'Stock In', label: 'Add Stock (+)', reason: 'Purchase' },
                    { id: 'Adjustment', label: 'Adjust Stock (Override)', reason: 'Physical Count Correction' },
                    { id: 'Stock Out', label: 'Record Wastage (-)', reason: 'Waste' }
                  ].map(op => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setAdjustActionType(op.id);
                        setAdjustReason(op.reason);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        border: adjustActionType === op.id ? '2px solid #C62828' : '1px solid var(--border-color)',
                        backgroundColor: adjustActionType === op.id ? '#FFF5F5' : '#FFFFFF',
                        color: adjustActionType === op.id ? '#C62828' : '#1F130B',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {adjustActionType === 'Opening Stock' ? 'Opening Stock Quantity (Baseline)' :
                   adjustActionType === 'Adjustment' ? 'New Exact Stock Level (Override)' :
                   adjustActionType === 'Stock In' ? 'Add Quantity (+)' : 'Wastage Quantity (-)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 100"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  style={styles.input}
                  autoFocus
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Reason / Audit Type</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  style={styles.selectInput}
                >
                  {adjustActionType === 'Opening Stock' && (
                    <>
                      <option value="Opening Stock">Initial Opening Stock Setup</option>
                      <option value="Opening Stock Calibration">Opening Stock Calibration</option>
                    </>
                  )}
                  {adjustActionType === 'Stock In' && (
                    <>
                      <option value="Purchase">Purchase / Supplier Inward</option>
                      <option value="Stock Added">General Stock Addition</option>
                      <option value="Return">Customer Return Received</option>
                      <option value="Correction">Positive Audit Correction</option>
                    </>
                  )}
                  {adjustActionType === 'Stock Out' && (
                    <>
                      <option value="Waste">Kitchen Wastage / Prep Loss</option>
                      <option value="Damaged">Damaged / Spoiled Goods</option>
                      <option value="Expired">Expired Stock</option>
                      <option value="Staff Meal">Staff Meal / Food Tasting</option>
                      <option value="Correction">Negative Audit Correction</option>
                    </>
                  )}
                  {adjustActionType === 'Adjustment' && (
                    <>
                      <option value="Physical Count Correction">Physical Stock Audit Count</option>
                      <option value="Discrepancy Correction">Discrepancy Reconciliation</option>
                      <option value="Damaged Stock Correction">Damaged Stock Correction</option>
                    </>
                  )}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Batch #12, Supplier receipt"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Low Stock Threshold</label>
                  <input
                    type="number"
                    value={adjustThreshold}
                    onChange={(e) => setAdjustThreshold(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cost Price (Rs)</label>
                  <input
                    type="number"
                    value={adjustCostPrice}
                    onChange={(e) => setAdjustCostPrice(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowQuickAdjustModal(false)} style={styles.subtleBtn}>Cancel</button>
                <button type="submit" style={styles.primaryActionBtn}>Record Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ORDER RECEIPT PREVIEW MODAL */}
      {showOrderModal && selectedOrderForView && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '400px', padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#FAF6F0' }}>
              <h3 style={{ fontWeight: '800', fontSize: '14px' }}>
                Invoice #{selectedOrderForView.order.id}
              </h3>
              <button onClick={() => setShowOrderModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={{ maxHeight: '68vh', overflowY: 'auto', padding: '14px', backgroundColor: '#F5F5F5' }}>
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
                  dangerouslySetInnerHTML={{ __html: getReceiptInnerHtml(selectedOrderForView, settings, settings.paper_size || '80mm') }}
                />
              </div>
            </div>

            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', backgroundColor: '#FFFFFF' }}>
              <button onClick={() => setShowOrderModal(false)} style={styles.primaryActionBtn}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RESET INVENTORY TO ZERO MODAL */}
      {showResetModal && (
        <div style={styles.modalOverlay} onClick={() => setShowResetModal(false)}>
          <div style={{ ...styles.modalCard, maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, borderBottom: '1px solid #FFCDD2', backgroundColor: '#FFF5F5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="#C62828" />
                <div>
                  <h3 style={{ fontWeight: '800', fontSize: '16px', color: '#C62828', margin: 0 }}>
                    Reset Stock to Zero
                  </h3>
                  <span style={{ fontSize: '11px', color: '#7A695E' }}>
                    Safe, transactional stock reset with automatic rollback snapshot
                  </span>
                </div>
              </div>
              <button onClick={() => setShowResetModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleResetInventorySubmit} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Important Safety Notice */}
              <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '8px', padding: '10px 14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#2E7D32', marginBottom: '2px' }}>
                  ✓ Safety Guarantee: Sales History Is Preserved
                </div>
                <div style={{ fontSize: '11px', color: '#388E3C', lineHeight: '1.4' }}>
                  This operation resets <strong>physical Current Stock to 0</strong>. It will <strong>NOT</strong> delete or alter past sales, orders, revenue, refunds, waste, or previous movements.
                </div>
              </div>

              {/* Scope Selection */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Reset Scope</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'all', label: 'All Products' },
                    { id: 'category', label: 'By Category' },
                    { id: 'products', label: 'Select Products' }
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setResetScope(s.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: resetScope === s.id ? '2px solid #C62828' : '1px solid var(--border-color)',
                        backgroundColor: resetScope === s.id ? '#FFF5F5' : '#FFFFFF',
                        color: resetScope === s.id ? '#C62828' : '#7A695E',
                        cursor: 'pointer'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scope Detail: Category */}
              {resetScope === 'category' && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Select Category to Reset</label>
                  <select
                    value={resetCategory}
                    onChange={(e) => setResetCategory(e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Scope Detail: Selected Products */}
              {resetScope === 'products' && (
                <div style={styles.inputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={styles.label}>Select Products ({resetSelectedProdIds.length} selected)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setResetSelectedProdIds(products.map(p => p.id))}
                        style={{ fontSize: '11px', color: '#1565C0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetSelectedProdIds([])}
                        style={{ fontSize: '11px', color: '#7A695E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Search product to select..."
                    value={resetSearchQuery}
                    onChange={(e) => setResetSearchQuery(e.target.value)}
                    style={{ ...styles.input, marginBottom: '6px' }}
                  />
                  <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', backgroundColor: '#FAFAFA' }}>
                    {products
                      .filter(p => p.name.toLowerCase().includes(resetSearchQuery.toLowerCase()))
                      .map(p => {
                        const isChecked = resetSelectedProdIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '5px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              backgroundColor: isChecked ? '#FFF5F5' : 'transparent',
                              marginBottom: '2px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) setResetSelectedProdIds([...resetSelectedProdIds, p.id]);
                                  else setResetSelectedProdIds(resetSelectedProdIds.filter(id => id !== p.id));
                                }}
                              />
                              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1F130B' }}>{p.name}</span>
                            </div>
                            <span style={{ fontSize: '11px', color: (parseFloat(p.stock) || 0) > 0 ? '#2E7D32' : '#7A695E', fontWeight: '700' }}>
                              Stock: {p.stock || 0} {p.unit}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Audit Reason */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Audit Note / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Month-end physical count calibration"
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  style={styles.input}
                />
              </div>

              {/* Type RESET Confirmation Box */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <label style={{ ...styles.label, color: '#C62828', fontWeight: '800' }}>
                  Confirmation: Type "RESET" in uppercase to proceed
                </label>
                <input
                  type="text"
                  required
                  placeholder="Type RESET"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  style={{
                    ...styles.input,
                    borderColor: resetConfirmText.trim().toUpperCase() === 'RESET' ? '#2E7D32' : '#C62828',
                    backgroundColor: '#FFFFFF',
                    fontWeight: '800',
                    letterSpacing: '1px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={styles.subtleBtn}
                  disabled={resettingLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetConfirmText.trim().toUpperCase() !== 'RESET' || resettingLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: resetConfirmText.trim().toUpperCase() === 'RESET' ? '#C62828' : '#E0E0E0',
                    color: resetConfirmText.trim().toUpperCase() === 'RESET' ? '#FFFFFF' : '#9E9E9E',
                    padding: '8px 16px',
                    borderRadius: '7px',
                    fontWeight: '800',
                    fontSize: '12px',
                    border: 'none',
                    cursor: resetConfirmText.trim().toUpperCase() === 'RESET' ? 'pointer' : 'not-allowed'
                  }}
                >
                  {resettingLoading ? <RefreshCw size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                  {resettingLoading ? 'Resetting Stock...' : 'Confirm Reset to Zero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RECONCILE INVENTORY MODAL */}
      {showReconcileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowReconcileModal(false)}>
          <div style={{ ...styles.modalCard, maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.modalHeader, backgroundColor: '#E8F5E9', borderBottom: '1px solid #C8E6C9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#2E7D32" />
                <div>
                  <h3 style={{ fontWeight: '800', fontSize: '16px', color: '#1B5E20', margin: 0 }}>
                    Inventory Ledger Reconciliation &amp; Audit
                  </h3>
                  <span style={{ fontSize: '11px', color: '#388E3C' }}>
                    Compare Stored Physical Stock vs Calculated Ledger Transactions
                  </span>
                </div>
              </div>
              <button onClick={() => setShowReconcileModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reconcileLoading && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ color: '#2E7D32', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: '#7A695E' }}>Auditing complete inventory ledger...</p>
                </div>
              )}

              {!reconcileLoading && reconcileReport && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div style={{ backgroundColor: '#FAF6F0', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F130B' }}>{reconcileReport.totalProductsChecked}</div>
                      <div style={{ fontSize: '11px', color: '#7A695E', fontWeight: '700' }}>Products Checked</div>
                    </div>
                    <div style={{ backgroundColor: reconcileReport.discrepanciesFound > 0 ? '#FFF5F5' : '#E8F5E9', padding: '10px', borderRadius: '8px', border: `1px solid ${reconcileReport.discrepanciesFound > 0 ? '#FFCDD2' : '#C8E6C9'}`, textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: reconcileReport.discrepanciesFound > 0 ? '#C62828' : '#2E7D32' }}>{reconcileReport.discrepanciesFound}</div>
                      <div style={{ fontSize: '11px', color: reconcileReport.discrepanciesFound > 0 ? '#C62828' : '#2E7D32', fontWeight: '700' }}>Discrepancies Found</div>
                    </div>
                    <div style={{ backgroundColor: '#E8F5E9', padding: '10px', borderRadius: '8px', border: '1px solid #C8E6C9', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#2E7D32' }}>{reconcileReport.correctedCount}</div>
                      <div style={{ fontSize: '11px', color: '#2E7D32', fontWeight: '700' }}>Synchronized</div>
                    </div>
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <table style={styles.masterTable}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Product</th>
                          <th style={{ ...styles.th, textAlign: 'right' }}>Stored Stock</th>
                          <th style={{ ...styles.th, textAlign: 'right' }}>Ledger Stock</th>
                          <th style={{ ...styles.th, textAlign: 'right' }}>Difference</th>
                          <th style={{ ...styles.th, textAlign: 'right' }}>Total Sold</th>
                          <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(reconcileReport.products || []).map(p => (
                          <tr key={p.productId} style={{ backgroundColor: p.hasDiscrepancy ? '#FFF8E1' : 'transparent' }}>
                            <td style={{ ...styles.td, fontWeight: '700' }}>{p.productName}</td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>{p.storedStock}</td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#2E7D32' }}>{p.calculatedStock}</td>
                            <td style={{ ...styles.td, textAlign: 'right', fontWeight: '800', color: p.discrepancy !== 0 ? (p.discrepancy > 0 ? '#C62828' : '#E65100') : '#2E7D32' }}>
                              {p.discrepancy > 0 ? `+${p.discrepancy}` : p.discrepancy}
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right', color: '#1565C0', fontWeight: '700' }}>{p.totalSold}</td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                              {p.isCorrected ? (
                                <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>Synchronized</span>
                              ) : p.hasDiscrepancy ? (
                                <span style={{ backgroundColor: '#FFE082', color: '#F57F17', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>Discrepancy</span>
                              ) : (
                                <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>✓ Balanced</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px', backgroundColor: '#FAF6F0' }}>
              <button
                type="button"
                onClick={() => setShowReconcileModal(false)}
                style={styles.subtleBtn}
              >
                Close
              </button>
              {reconcileReport && reconcileReport.discrepanciesFound > 0 && (
                <button
                  type="button"
                  onClick={handleExecuteReconcile}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#2E7D32',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '7px',
                    fontWeight: '800',
                    fontSize: '12px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  disabled={reconcileLoading}
                >
                  <ShieldCheck size={14} /> Auto-Reconcile &amp; Synchronize All
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {ToastContainerEl}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px 24px',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#FAF6F0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1F130B',
  },
  subtitle: {
    fontSize: '13px',
    color: '#7A695E',
    marginTop: '2px',
  },
  primaryActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    padding: '8px 14px',
    borderRadius: '7px',
    fontWeight: '700',
    fontSize: '12px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(198, 40, 40, 0.2)',
  },
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '7px',
    padding: '8px',
    color: '#7A695E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '14px',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '12px 14px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '82px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  cardValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1F130B',
    margin: '2px 0',
  },
  cardSub: {
    fontSize: '11px',
    color: '#7A695E',
  },
  filterBarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '8px 14px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '14px',
    boxShadow: 'var(--shadow-sm)',
  },
  periodPillBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#7A695E',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  periodPillBtnActive: {
    backgroundColor: '#1F130B !important',
    color: '#FFFFFF !important',
    borderColor: '#1F130B !important',
  },
  datePickerInput: {
    padding: '3px 6px',
    fontSize: '11px',
    borderRadius: '5px',
    border: '1px solid var(--border-color)',
    outline: 'none',
  },
  activeRangeBadge: {
    fontSize: '11px',
    color: '#7A695E',
    backgroundColor: '#FAF6F0',
    padding: '3px 8px',
    borderRadius: '5px',
    border: '1px solid var(--border-color)',
  },
  subViewTabNav: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#FFFFFF',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    marginBottom: '14px',
  },
  subViewTabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#7A695E',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  subViewTabBtnActive: {
    backgroundColor: '#C62828 !important',
    color: '#FFFFFF !important',
    boxShadow: '0 2px 6px rgba(198, 40, 40, 0.2)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px 18px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#1F130B',
  },
  tableControlHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '12px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FAF6F0',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    minWidth: '240px',
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '12px',
    color: '#1F130B',
    outline: 'none',
    width: '100%',
  },
  selectFilter: {
    padding: '5px 8px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FAF6F0',
    color: '#1F130B',
    outline: 'none',
    cursor: 'pointer',
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#FAF6F0',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '5px 9px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1F130B',
    cursor: 'pointer',
  },
  tableScrollWrapper: {
    overflowX: 'auto',
  },
  masterTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '8px 10px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#7A695E',
    textAlign: 'left',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#FAF6F0',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '8px 10px',
    fontSize: '12px',
    color: '#1F130B',
    verticalAlign: 'middle',
  },
  categoryBadge: {
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 5px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
  },
  statusInBadge: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #A5D6A7',
    textTransform: 'uppercase',
  },
  statusLowBadge: {
    backgroundColor: '#FFF8E1',
    color: '#F57F17',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #FFE082',
    textTransform: 'uppercase',
  },
  statusOutBadge: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #FFCDD2',
    textTransform: 'uppercase',
  },
  adjustPillBtn: {
    backgroundColor: '#1F130B',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5px',
    padding: '3px 7px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  iconBtn: {
    backgroundColor: '#FAF6F0',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    padding: '3px 6px',
    fontSize: '11px',
    color: '#7A695E',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  compareCard: {
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#FAF6F0',
    border: '1px solid var(--border-color)',
  },
  rankingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    backgroundColor: '#FAF6F0',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
  },
  rankBadge: {
    color: '#FFFFFF',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '800',
  },
  logBadge: {
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 5px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  orderLinkBtn: {
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
    border: '1px solid #BBDEFB',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
  },
  alertBox: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  alertItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: '6px 10px',
    borderRadius: '5px',
    border: '1px solid var(--border-color)',
  },
  reportBox: {
    padding: '14px',
    backgroundColor: '#FAF6F0',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  reportDownloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  },
  deepCard: {
    padding: '8px 10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  deepLabel: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '440px',
    boxShadow: 'var(--shadow-lg)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    padding: '14px 18px',
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    fontSize: '15px',
    cursor: 'pointer',
    color: '#7A695E',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '7px 10px',
    fontSize: '12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    color: '#1F130B',
    outline: 'none',
  },
  selectInput: {
    width: '100%',
    padding: '7px 10px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    color: '#1F130B',
    outline: 'none',
    cursor: 'pointer',
  },
  subtleBtn: {
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    border: '1px solid var(--border-color)',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  }
};
