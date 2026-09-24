import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getReceiptHtml } from '../utils/receiptGenerator';
import { 
  Search, Calendar, Download, Eye, Printer, X, RefreshCw, 
  DollarSign, CreditCard, TrendingUp, Wallet, Users, Trash2, CheckSquare
} from 'lucide-react';
import { useToast } from '../components/Toast';

export default function SalesHistory() {
  const { showToast, ToastContainerEl } = useToast();
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({ address: '', phone: '', delivery_phone: '' });
  const [loading, setLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filters State
  const [dateRangeType, setDateRangeType] = useState('Today'); // Today, Yesterday, Last7Days, Custom, All
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Completed'); // Completed, Cancelled, All

  useEffect(() => {
    fetchData();
    const savedUser = localStorage.getItem('ar_pos_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setIsAdmin(u.role === 'Admin');
    }
  }, []);

  // --- Bulk Selection State ---
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSingle = async (orderId) => {
    const confirmDelete = window.confirm(`Delete Invoice #${orderId}? This cannot be undone.`);
    if (!confirmDelete) return;
    try {
      await api.deleteOrder(orderId);
      setSelectedIds(prev => { const n = new Set(prev); n.delete(orderId); return n; });
      fetchData();
    } catch (err) {
      showToast('Failed to delete invoice: ' + err.message, 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const confirmDelete = window.confirm(`Delete ${selectedIds.size} selected invoice(s)? This cannot be undone.`);
    if (!confirmDelete) return;
    try {
      await api.deleteBulkOrders(Array.from(selectedIds));
      setSelectedIds(new Set());
      fetchData();
    } catch (err) {
      showToast('Failed to bulk delete: ' + err.message, 'error');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [list, data] = await Promise.all([
        api.getOrders(),
        api.getSettings().catch(() => null)
      ]);
      setOrders(list);
      if (data) setSettings(data);
    } catch (err) {
      console.error('Error fetching sales history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preset Date range handlers
  const handleDatePreset = (preset) => {
    setDateRangeType(preset);
    const today = new Date().toISOString().slice(0, 10);
    
    if (preset === 'Today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'Yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yestStr = yesterday.toISOString().slice(0, 10);
      setStartDate(yestStr);
      setEndDate(yestStr);
    } else if (preset === 'Last7Days') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      setStartDate(lastWeek.toISOString().slice(0, 10));
      setEndDate(today);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(o => {
    // 1. Date Range Filter
    if (dateRangeType !== 'All') {
      if (!o.created_at) return false;
      const orderDate = o.created_at.substring(0, 10); // "YYYY-MM-DD"
      if (orderDate < startDate || orderDate > endDate) return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;

    // 3. Order Type Filter
    if (orderTypeFilter !== 'All' && o.order_type !== orderTypeFilter) return false;

    // 4. Payment Method Filter
    if (paymentMethodFilter !== 'All' && o.payment_method !== paymentMethodFilter) return false;

    // 5. Search Query (Invoice ID or Customer Name or Phone)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchId = String(o.id).includes(query);
      const matchName = o.customer_name && o.customer_name.toLowerCase().includes(query);
      const matchPhone = o.customer_phone && o.customer_phone.includes(query);
      if (!matchId && !matchName && !matchPhone) return false;
    }

    return true;
  });

  // Calculate totals for filtered orders
  const getFilteredTotals = () => {
    let completedCount = 0;
    let totalRevenue = 0;
    let totalDiscounts = 0;
    let cashTotal = 0;
    let cardTotal = 0;
    let digitalTotal = 0; // Easypaisa / JazzCash

    filteredOrders.forEach(o => {
      if (o.status === 'Completed') {
        completedCount++;
        totalRevenue += parseFloat(o.total || 0);
        totalDiscounts += parseFloat(o.discount_amount || 0);

        if (o.payment_method === 'Cash') {
          cashTotal += parseFloat(o.total || 0);
        } else if (o.payment_method === 'Card') {
          cardTotal += parseFloat(o.total || 0);
        } else if (o.payment_method === 'Easypaisa' || o.payment_method === 'JazzCash') {
          digitalTotal += parseFloat(o.total || 0);
        } else if (o.payment_method === 'Mixed') {
          try {
            const details = JSON.parse(o.payment_details || '{}');
            cashTotal += parseFloat(details.cash || 0);
            cardTotal += parseFloat(details.card || 0);
          } catch (e) {}
        }
      }
    });

    return {
      count: completedCount,
      revenue: Math.round(totalRevenue),
      discounts: Math.round(totalDiscounts),
      cash: Math.round(cashTotal),
      card: Math.round(cardTotal),
      digital: Math.round(digitalTotal)
    };
  };

  const stats = getFilteredTotals();

  // Export report to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return showToast('No orders to export.', 'warning');

    const headers = [
      'Invoice ID', 'Date & Time', 'Order Type', 'Customer Name', 
      'Customer Phone', 'Payment Method', 'Subtotal (Rs)', 
      'Discount (Rs)', 'GST Tax (Rs)', 'Service Charges (Rs)', 
      'Delivery Charges (Rs)', 'Grand Total (Rs)', 'Status', 'Cashier'
    ];

    const rows = filteredOrders.map(o => [
      o.id,
      o.created_at,
      o.order_type,
      o.customer_name || 'Walk-in',
      o.customer_phone || '',
      o.payment_method,
      o.subtotal,
      o.discount_amount,
      o.tax_amount,
      o.service_charges,
      o.delivery_charges,
      o.total,
      o.status,
      o.created_by || ''
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ar_sales_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Bill Modal Handler
  const handleOpenDetailModal = async (orderId) => {
    try {
      const details = await api.getOrderDetails(orderId);
      setSelectedOrderDetails(details);
      setShowDetailModal(true);
    } catch (err) {
      showToast(`Error loading details: ${err.message}`, 'error');
    }
  };

  // Reprint Receipt
  const handlePrint = async (receipt) => {
    // Load printer options from database settings
    const printerName = settings.default_printer || 'System Default';
    const paperSize = settings.paper_size || '80mm';

    const receiptHtml = getReceiptHtml(receipt, settings, paperSize);

    // Spool print task silently in background using Electron native API
    if (window.electronAPI && typeof window.electronAPI.printReceipt === 'function') {
      try {
        const printSettings = {
          deviceName: printerName,
          paperSize: paperSize,
          customWidth: settings.custom_width || 80,
          topMargin: settings.top_margin || 0,
          bottomMargin: settings.bottom_margin || 0,
          copies: 1
        };
        const res = await window.electronAPI.printReceipt(receiptHtml, printerName, paperSize, printSettings);
        if (res.success) {
          showToast('Bill sent to printer.', 'success');
        } else {
          showToast(`Print failed: ${res.error || 'Check print queue'}`, 'error');
        }
      } catch (err) {
        showToast(`Print failed: ${err.message}`, 'error');
      }
    } else {
      // Fallback for web browser testing
      console.log('Spooling fallback print on browser window...');
      const printWindow = window.open('', '_blank', 'width=350,height=600');
      if (printWindow) {
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      } else {
        showToast('Browser blocked pop-up print window.', 'error');
      }
    }
  };

  return (
    <>
    <div style={styles.container} className="animate-fade-in">
      {/* Header Row */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Sales Invoices History</h1>
          <p style={styles.subtitle}>Audit daily orders, analyze revenue shares, print full bills, and export CSV reports.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} style={styles.exportBtn}>
            <Download size={16} /> Export CSV Report
          </button>
          <button onClick={fetchData} style={styles.refreshBtn}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Date Presets and Custom Filters */}
      <div style={styles.filterSection}>
        <div style={styles.presetsRow}>
          {['Today', 'Yesterday', 'Last7Days', 'All'].map(preset => (
            <button 
              key={preset}
              onClick={() => handleDatePreset(preset)}
              style={{
                ...styles.presetBtn,
                ...(dateRangeType === preset ? styles.presetBtnActive : {})
              }}
            >
              {preset === 'Last7Days' ? 'Last 7 Days' : preset}
            </button>
          ))}
          <button 
            onClick={() => setDateRangeType('Custom')}
            style={{ ...styles.presetBtn, ...(dateRangeType === 'Custom' ? styles.presetBtnActive : {}) }}
          >
            Custom Range
          </button>
        </div>

        {dateRangeType === 'Custom' && (
          <div style={styles.customDateRow}>
            <div style={styles.dateField}>
              <label style={styles.dateLabel}>Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>
            <div style={styles.dateField}>
              <label style={styles.dateLabel}>End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>
          </div>
        )}

        <div style={styles.filtersGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.filterLabel}>Search Invoice</label>
            <div style={styles.searchBox}>
              <Search size={16} color="#7A695E" />
              <input 
                type="text" 
                placeholder="Bill #, Name, or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.filterInput}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.filterLabel}>Order Type</label>
            <select 
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="All">All Types</option>
              <option value="Dine-In">Dine-In</option>
              <option value="Takeaway">Takeaway</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.filterLabel}>Payment Method</label>
            <select 
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="All">All Payments</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Easypaisa">Easypaisa</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.filterLabel}>Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled/Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Totals Summary Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconContainer, backgroundColor: '#E8F5E9', color: '#2E7D32' }}><DollarSign size={20} /></div>
          <div>
            <span style={styles.statLabel}>Completed Revenue</span>
            <h3 style={styles.statValue}>Rs {stats.revenue}</h3>
            <span style={styles.statSub}>Tickets: {stats.count}</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconContainer, backgroundColor: '#E3F2FD', color: '#1565C0' }}><DollarSign size={20} /></div>
          <div>
            <span style={styles.statLabel}>Cash Payments</span>
            <h3 style={{ ...styles.statValue, color: '#1565C0' }}>Rs {stats.cash}</h3>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconContainer, backgroundColor: '#FFF3E0', color: '#E65100' }}><CreditCard size={20} /></div>
          <div>
            <span style={styles.statLabel}>Card Payments</span>
            <h3 style={{ ...styles.statValue, color: '#E65100' }}>Rs {stats.card}</h3>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.iconContainer, backgroundColor: '#FFEBEE', color: '#C62828' }}><Wallet size={20} /></div>
          <div>
            <span style={styles.statLabel}>Digital Payments</span>
            <h3 style={{ ...styles.statValue, color: '#C62828' }}>Rs {stats.digital}</h3>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div style={styles.tableSection}>
        {/* Bulk Action Toolbar - shown when items are selected */}
        {isAdmin && selectedIds.size > 0 && (
          <div style={styles.bulkToolbar}>
            <span style={styles.bulkCount}>
              <CheckSquare size={16} />
              {selectedIds.size} invoice{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <button onClick={handleBulkDelete} style={styles.bulkDeleteBtn}>
              <Trash2 size={14} />
              Delete Selected ({selectedIds.size})
            </button>
            <button onClick={() => setSelectedIds(new Set())} style={styles.bulkClearBtn}>
              <X size={14} /> Clear
            </button>
          </div>
        )}
        <div style={styles.tableContainer}>
          {filteredOrders.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px 0', color: '#7A695E' }}>No matching invoices found.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  {isAdmin && (
                    <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={toggleSelectAll}
                        title="Select All"
                        style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      />
                    </th>
                  )}
                  <th style={styles.th}>Invoice #</th>
                  <th style={styles.th}>Date & Time</th>
                  <th style={styles.th}>Customer Details</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Grand Total</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Cashier</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr 
                    key={order.id} 
                    style={{
                      ...styles.tableRow,
                      backgroundColor: selectedIds.has(order.id) ? '#FFF3E0' : 'transparent'
                    }}
                  >
                    {isAdmin && (
                      <td style={{ ...styles.td, textAlign: 'center', width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order.id)}
                          onChange={() => toggleSelect(order.id)}
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                      </td>
                    )}
                    <td style={{ ...styles.td, fontWeight: '700' }}>#{order.id}</td>
                    <td style={{ ...styles.td, fontSize: '12px' }}>{order.created_at}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '600' }}>{order.customer_name || 'Walk-in'}</div>
                      {order.customer_phone && <span style={{ fontSize: '11px', color: '#7A695E' }}>Ph: {order.customer_phone}</span>}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: order.order_type === 'Dine-In' ? '#E3F2FD' : order.order_type === 'Takeaway' ? '#E8F5E9' : '#FFF3E0',
                        color: order.order_type === 'Dine-In' ? '#1565C0' : order.order_type === 'Takeaway' ? '#2E7D32' : '#E65100',
                      }}>{order.order_type}</span>
                    </td>
                    <td style={styles.td}>{order.payment_method}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#C62828' }}>Rs {order.total}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: order.status === 'Completed' ? '#E8F5E9' : '#FFEBEE',
                        color: order.status === 'Completed' ? '#2E7D32' : '#C62828',
                      }}>{order.status}</span>
                    </td>
                    <td style={styles.td}>{order.created_by || '-'}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actionsGrid}>
                        <button 
                          onClick={() => handleOpenDetailModal(order.id)} 
                          style={styles.actionBtn}
                          title="View Receipt"
                        >
                          <Eye size={14} />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteSingle(order.id)} 
                            style={styles.deleteRowBtn}
                            title="Delete Invoice"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* FULL INVOICE RECEIPT MODAL */}
      {showDetailModal && selectedOrderDetails && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={styles.receiptPreviewCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>Order Details - Invoice #{selectedOrderDetails.order.id}</h3>
              <button onClick={() => setShowDetailModal(false)} style={styles.closeModalBtn}><X size={18} /></button>
            </div>

            <div style={styles.receiptPreviewScrollArea}>
              <div style={styles.receiptPaper}>
                {settings.logo && (
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <img src={settings.logo} alt="Logo" style={{ maxHeight: '55px', maxWidth: '110px', objectFit: 'contain' }} />
                  </div>
                )}
                <h3 style={{ textAlign: 'center', margin: '0 0 5px 0', fontWeight: '800', fontFamily: 'monospace' }}>{settings.restaurant_name || 'AR SHINWARI HUJRA'}</h3>
                <p style={{ textAlign: 'center', fontSize: '9px', margin: '0 0 10px 0', fontFamily: 'monospace', lineHeight: '1.3' }}>
                  {settings.address || 'Near Dunya Palace Hotel, Mor Sambrial'}<br />
                  Ph: {settings.phone || '0300-0333128'}<br />
                  {selectedOrderDetails.order.order_type === 'Delivery' && settings.delivery_phone ? `Delivery: ${settings.delivery_phone}` : ''}
                </p>
                
                <hr style={{ borderTop: '1px dashed #000', borderBottom: 'none', margin: '5px 0' }} />
                {selectedOrderDetails.order.order_type === 'Dine-In' ? (
                  <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', margin: '5px 0', fontFamily: 'monospace' }}>
                    {selectedOrderDetails.order.customer_name}
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center', margin: '5px 0', fontFamily: 'monospace' }}>
                    {selectedOrderDetails.order.order_type}
                  </div>
                )}
                <hr style={{ borderTop: '1px dashed #000', borderBottom: 'none', margin: '5px 0' }} />

                 <div style={{ fontSize: '10px', margin: '5px 0', fontFamily: 'monospace', lineHeight: '1.4' }}>
                  Order: #{selectedOrderDetails.order.id}<br />
                  Date: {selectedOrderDetails.order.created_at || ''}<br />
                  {selectedOrderDetails.order.customer_name && 
                   selectedOrderDetails.order.customer_name.trim() !== '' && 
                   selectedOrderDetails.order.customer_name.toLowerCase() !== 'walk-in' && 
                   !selectedOrderDetails.order.customer_name.toLowerCase().startsWith('table') && (
                    <>Customer: {selectedOrderDetails.order.customer_name}<br /></>
                  )}
                  {selectedOrderDetails.order.customer_phone && selectedOrderDetails.order.customer_phone.trim() !== '' && (
                    <>Phone: {selectedOrderDetails.order.customer_phone}<br /></>
                  )}
                  {selectedOrderDetails.order.delivery_address && selectedOrderDetails.order.delivery_address.trim() !== '' && (
                    <>Address: {selectedOrderDetails.order.delivery_address}<br /></>
                  )}
                  {selectedOrderDetails.order.rider_name && selectedOrderDetails.order.rider_name.trim() !== '' && (
                    <>Rider: {selectedOrderDetails.order.rider_name}<br /></>
                  )}
                </div>
                
                <hr style={{ borderTop: '1px dashed #000', borderBottom: 'none', margin: '5px 0' }} />
                <table style={{ fontSize: '10px', width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px dashed #000' }}>
                      <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Item</th>
                      <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Qty</th>
                      <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderDetails.items.map(item => (
                      <tr key={item.id}>
                        <td style={{ padding: '3px 0', verticalAlign: 'top' }}>
                          <strong>{item.product_name}</strong>
                        </td>
                        <td style={{ textAlign: 'center', padding: '3px 0', verticalAlign: 'top' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '3px 0', verticalAlign: 'top' }}>Rs {item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <hr style={{ borderTop: '1px dashed #000', borderBottom: 'none', margin: '5px 0' }} />
                <div style={{ fontSize: '10px', fontFamily: 'monospace', lineHeight: '1.4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>Rs {selectedOrderDetails.order.subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GST ({selectedOrderDetails.order.tax_rate || 0}%):</span>
                    <span>Rs {Math.round(selectedOrderDetails.order.tax_amount || 0)}</span>
                  </div>
                  {selectedOrderDetails.order.discount_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Discount:</span>
                      <span>Rs {selectedOrderDetails.order.discount_amount}</span>
                    </div>
                  )}
                  {selectedOrderDetails.order.service_charges > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Service:</span>
                      <span>Rs {selectedOrderDetails.order.service_charges}</span>
                    </div>
                  )}
                  {selectedOrderDetails.order.order_type === 'Delivery' && selectedOrderDetails.order.delivery_charges > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Delivery Charges:</span>
                      <span>Rs {selectedOrderDetails.order.delivery_charges}</span>
                    </div>
                  )}
                  <hr style={{ borderTop: '1px dotted #000', borderBottom: 'none', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
                    <span>TOTAL:</span>
                    <span>Rs {selectedOrderDetails.order.total}</span>
                  </div>
                </div>
                
                <hr style={{ borderTop: '1px dashed #000', borderBottom: 'none', margin: '5px 0' }} />
                <p style={{ textAlign: 'center', fontSize: '9px', margin: '10px 0 0 0', fontFamily: 'monospace' }}>
                  Thank you for dining with us!<br/>
                  Developed by Rana Zohaik (03275716901)
                </p>
              </div>
            </div>

            <div style={styles.modalFooter}>
              {isAdmin && (
                <button 
                  onClick={async () => {
                    const confirmDelete = window.confirm("Are you sure you want to delete this invoice? This will wipe the order from database.");
                    if (!confirmDelete) return;
                    try {
                      await api.deleteOrder(selectedOrderDetails.order.id);
                      showToast("Invoice deleted successfully.", "success");
                      setShowDetailModal(false);
                      fetchData(); // refresh list
                    } catch (err) {
                      showToast("Failed to delete invoice: " + err.message, "error");
                    }
                  }} 
                  style={{ ...styles.modalSubmitBtn, backgroundColor: '#D32F2F', marginRight: 'auto' }}
                >
                  Delete Invoice
                </button>
              )}
              <button onClick={() => setShowDetailModal(false)} style={styles.modalCancelBtn}>Close</button>
              <button 
                onClick={() => handlePrint(selectedOrderDetails)} 
                style={styles.modalSubmitBtn}
              >
                <Printer size={14} style={{ marginRight: '4px' }} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    {ToastContainerEl}
    </>
  );
}

const styles = {
  container: {
    padding: '30px',
    height: '100%',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#1F130B',
  },
  subtitle: {
    fontSize: '14px',
    color: '#7A695E',
    marginTop: '4px',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#2E7D32',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
    border: 'none',
  },
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '10px',
    padding: '12px',
    color: '#7A695E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  presetsRow: {
    display: 'flex',
    gap: '8px',
  },
  presetBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '6px',
    border: '1px solid #EFE6DA',
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    cursor: 'pointer',
  },
  presetBtnActive: {
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    borderColor: '#C62828',
  },
  customDateRow: {
    display: 'flex',
    gap: '16px',
    backgroundColor: '#FAF6F0',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #EFE6DA',
  },
  dateField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dateLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  dateInput: {
    padding: '6px 10px',
    fontSize: '13px',
    border: '1px solid #EFE6DA',
    borderRadius: '6px',
    outline: 'none',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
    padding: '6px 10px',
    gap: '8px',
  },
  filterInput: {
    border: 'none',
    padding: 0,
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  },
  filterSelect: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid #EFE6DA',
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: '#7A695E',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#2E7D32',
    marginTop: '2px',
  },
  statSub: {
    fontSize: '11px',
    color: '#7A695E',
    marginTop: '2px',
    display: 'block',
  },
  tableSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid #EFE6DA',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeadRow: {
    borderBottom: '2px solid #EFE6DA',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid #F6EFE6',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#1F130B',
    verticalAlign: 'middle',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    display: 'inline-block',
  },
  actionsGrid: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
  },
  actionBtn: {
    backgroundColor: '#FAF6F0',
    border: '1px solid #EFE6DA',
    borderRadius: '6px',
    padding: '6px',
    color: '#7A695E',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteRowBtn: {
    backgroundColor: '#FFEBEE',
    border: '1px solid #FFCDD2',
    borderRadius: '6px',
    padding: '6px',
    color: '#C62828',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s',
  },
  bulkToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#1F130B',
    color: '#FFFFFF',
    padding: '10px 16px',
    borderRadius: '10px',
    marginBottom: '12px',
    fontSize: '13px',
    fontWeight: '600',
  },
  bulkCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#FAF6F0',
    flex: 1,
  },
  bulkDeleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#D32F2F',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  bulkClearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '7px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
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
    zIndex: 1000,
  },
  receiptPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '360px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
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
    cursor: 'pointer',
  },
  receiptPreviewScrollArea: {
    padding: '16px',
    overflowY: 'auto',
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    cursor: 'pointer',
    border: 'none',
  },
  modalSubmitBtn: {
    padding: '8px 16px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
  }
};
