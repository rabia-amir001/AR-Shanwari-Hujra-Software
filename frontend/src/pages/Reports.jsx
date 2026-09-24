import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, Calendar, RefreshCw, Download, ChevronDown } from 'lucide-react';

// Helper: get local YYYY-MM-DD for a date
const localDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Date filter
  const [datePeriod, setDatePeriod] = useState('today');
  const [customStart, setCustomStart] = useState(localDateStr(new Date()));
  const [customEnd, setCustomEnd] = useState(localDateStr(new Date()));
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [ordersList, itemsList] = await Promise.all([
        api.getOrders(),
        api.getOrderItems().catch(() => [])
      ]);
      setOrders(ordersList || []);
      setOrderItems(itemsList || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute date range bounds
  const dateRange = useMemo(() => {
    const now = new Date();
    const today = localDateStr(now);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = localDateStr(yesterday);

    switch (datePeriod) {
      case 'today':
        return { start: today, end: today, label: `Today (${today})` };
      case 'yesterday':
        return { start: yesterdayStr, end: yesterdayStr, label: `Yesterday (${yesterdayStr})` };
      case 'last7': {
        const d = new Date(now);
        d.setDate(now.getDate() - 6);
        const s = localDateStr(d);
        return { start: s, end: today, label: `Last 7 Days (${s} → ${today})` };
      }
      case 'last30': {
        const d = new Date(now);
        d.setDate(now.getDate() - 29);
        const s = localDateStr(d);
        return { start: s, end: today, label: `Last 30 Days (${s} → ${today})` };
      }
      case 'this_month': {
        const d = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: localDateStr(d), end: today, label: `This Month` };
      }
      case 'last_month': {
        const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const last = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: localDateStr(first), end: localDateStr(last), label: `Last Month` };
      }
      case 'all_time':
        return { start: '1970-01-01', end: '2099-12-31', label: 'All Time' };
      case 'custom':
        return { start: customStart, end: customEnd, label: `${customStart} → ${customEnd}` };
      default:
        return { start: today, end: today, label: `Today (${today})` };
    }
  }, [datePeriod, customStart, customEnd]);

  // Filter orders strictly by date range
  const periodOrders = useMemo(() => {
    const { start, end } = dateRange;
    return orders.filter(o => {
      if (o.status !== 'Completed') return false;
      if (!o.created_at) return false;
      const d = o.created_at.substring(0, 10);
      return d >= start && d <= end;
    });
  }, [orders, dateRange]);

  // Build completedOrdersMap for this period
  const periodOrdersMap = useMemo(() => {
    const m = new Map();
    periodOrders.forEach(o => m.set(o.id, o));
    return m;
  }, [periodOrders]);

  // Aggregate totals from period orders
  const totals = useMemo(() => {
    let gross = 0, net = 0, disc = 0, tax = 0, service = 0, delivery = 0;
    const typeStats = {
      'Dine-In': { revenue: 0, count: 0 },
      'Takeaway': { revenue: 0, count: 0 },
      'Delivery': { revenue: 0, count: 0 }
    };

    periodOrders.forEach(o => {
      gross += parseFloat(o.subtotal || 0) + parseFloat(o.tax_amount || 0)
             + parseFloat(o.service_charges || 0) + parseFloat(o.delivery_charges || 0);
      net += parseFloat(o.total || 0);
      disc += parseFloat(o.discount_amount || 0);
      tax += parseFloat(o.tax_amount || 0);
      service += parseFloat(o.service_charges || 0);
      delivery += parseFloat(o.delivery_charges || 0);
      const t = o.order_type || 'Dine-In';
      if (typeStats[t]) {
        typeStats[t].revenue += parseFloat(o.total || 0);
        typeStats[t].count += 1;
      }
    });

    return {
      gross: Math.round(gross),
      net: Math.round(net),
      disc: Math.round(disc),
      tax: Math.round(tax),
      service: Math.round(service),
      delivery: Math.round(delivery),
      count: periodOrders.length,
      typeStats
    };
  }, [periodOrders]);

  // Top products from period order items
  const topProducts = useMemo(() => {
    const map = {};
    orderItems.forEach(item => {
      if (!periodOrdersMap.has(item.order_id)) return;
      const name = item.product_name || 'Unknown';
      if (!map[name]) map[name] = { name, qty: 0, revenue: 0, orders: 0 };
      map[name].qty += parseFloat(item.quantity) || 0;
      map[name].revenue += parseFloat(item.subtotal) || 0;
      map[name].orders += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [orderItems, periodOrdersMap]);

  // Cancelled count in same period
  const cancelledCount = useMemo(() => {
    const { start, end } = dateRange;
    return orders.filter(o => {
      if (o.status !== 'Cancelled') return false;
      const d = (o.created_at || '').substring(0, 10);
      return d >= start && d <= end;
    }).length;
  }, [orders, dateRange]);

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Report Period', dateRange.label],
      ['Generated At', new Date().toLocaleString()],
      [],
      ['SUMMARY'],
      ['Gross Revenue', totals.gross],
      ['Net Revenue', totals.net],
      ['Discounts Given', totals.disc],
      ['Tax Collected', totals.tax],
      ['Service Charges', totals.service],
      ['Delivery Charges', totals.delivery],
      ['Completed Orders', totals.count],
      ['Cancelled Orders', cancelledCount],
      [],
      ['SALES BY CHANNEL'],
      ['Channel', 'Orders', 'Revenue'],
      ...Object.entries(totals.typeStats).map(([type, s]) => [type, s.count, s.revenue]),
      [],
      ['TOP SELLING ITEMS'],
      ['Rank', 'Product Name', 'Qty Sold', 'Revenue'],
      ...topProducts.map((p, i) => [i + 1, `"${p.name}"`, p.qty, Math.round(p.revenue)])
    ];

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${dateRange.start}_to_${dateRange.end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const DATE_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'all_time', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const totalRevPct = (typeRev) =>
    totals.net > 0 ? Math.round((typeRev / totals.net) * 100) : 0;

  return (
    <div style={s.container} className="animate-fade-in">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Reports & Analytics</h1>
          <p style={s.subtitle}>
            Real-time restaurant performance — {dateRange.label}
          </p>
        </div>
        <div style={s.headerActions}>
          <div style={s.datePickerWrap}>
            <button
              style={s.dateBtn}
              onClick={() => setShowDateDropdown(v => !v)}
            >
              <Calendar size={14} />
              {DATE_OPTIONS.find(o => o.value === datePeriod)?.label}
              <ChevronDown size={13} />
            </button>
            {showDateDropdown && (
              <div style={s.dropdown}>
                {DATE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    style={{
                      ...s.dropdownItem,
                      ...(datePeriod === opt.value ? s.dropdownItemActive : {})
                    }}
                    onClick={() => {
                      setDatePeriod(opt.value);
                      setShowDateDropdown(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
                {datePeriod === 'custom' && (
                  <div style={s.customRange}>
                    <input
                      type="date"
                      style={s.dateInput}
                      value={customStart}
                      onChange={e => setCustomStart(e.target.value)}
                    />
                    <span style={{ fontSize: 12, color: '#7A695E' }}>to</span>
                    <input
                      type="date"
                      style={s.dateInput}
                      value={customEnd}
                      onChange={e => setCustomEnd(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={handleExportCSV} style={s.exportBtn}>
            <Download size={14} />
            Export CSV
          </button>

          <button onClick={fetchReportData} style={s.refreshBtn} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={s.loadingState}>Loading real-time data...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={s.cardsGrid}>
            <div style={s.card}>
              <div style={s.cardIcon} data-color="green">Rs</div>
              <div>
                <div style={s.cardLabel}>Net Revenue</div>
                <div style={{ ...s.cardValue, color: '#2E7D32' }}>
                  Rs {totals.net.toLocaleString()}
                </div>
                <div style={s.cardSub}>Gross: Rs {totals.gross.toLocaleString()}</div>
              </div>
            </div>

            <div style={s.card}>
              <BarChart3 size={20} color="#1565C0" />
              <div>
                <div style={s.cardLabel}>Completed Orders</div>
                <div style={{ ...s.cardValue, color: '#1565C0' }}>
                  {totals.count}
                </div>
                <div style={s.cardSub}>Cancelled: {cancelledCount}</div>
              </div>
            </div>

            <div style={s.card}>
              <TrendingUp size={20} color="#C62828" />
              <div>
                <div style={s.cardLabel}>Discounts Given</div>
                <div style={{ ...s.cardValue, color: '#C62828' }}>
                  Rs {totals.disc.toLocaleString()}
                </div>
                <div style={s.cardSub}>Tax: Rs {totals.tax.toLocaleString()}</div>
              </div>
            </div>

            <div style={s.card}>
              <Calendar size={20} color="#E65100" />
              <div>
                <div style={s.cardLabel}>Avg. Order Value</div>
                <div style={{ ...s.cardValue, color: '#E65100' }}>
                  Rs {totals.count > 0 ? Math.round(totals.net / totals.count).toLocaleString() : 0}
                </div>
                <div style={s.cardSub}>
                  Service: Rs {totals.service} | Delivery: Rs {totals.delivery}
                </div>
              </div>
            </div>
          </div>

          <div style={s.twoCol}>
            {/* Top Selling Items */}
            <div style={s.panel}>
              <h3 style={s.panelTitle}>
                Top Selling Items
                <span style={s.periodBadge}>{dateRange.label}</span>
              </h3>
              {topProducts.length === 0 ? (
                <div style={s.emptyState}>No sales recorded in this period.</div>
              ) : (
                <div style={s.list}>
                  {topProducts.map((p, i) => (
                    <div key={p.name} style={s.listRow}>
                      <div style={s.listLeft}>
                        <span style={s.rank}>#{i + 1}</span>
                        <span style={s.itemName}>{p.name}</span>
                      </div>
                      <div style={s.listRight}>
                        <span style={s.qtyBadge}>{p.qty} sold</span>
                        <span style={s.revBadge}>Rs {Math.round(p.revenue).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sales by Channel */}
            <div style={s.panel}>
              <h3 style={s.panelTitle}>
                Sales by Channel
                <span style={s.periodBadge}>{dateRange.label}</span>
              </h3>
              <div style={s.channels}>
                {Object.entries(totals.typeStats).map(([type, stat]) => {
                  const pct = totalRevPct(stat.revenue);
                  const colors = {
                    'Dine-In': '#1565C0',
                    'Takeaway': '#2E7D32',
                    'Delivery': '#E65100'
                  };
                  return (
                    <div key={type} style={s.channelRow}>
                      <div style={s.channelHeader}>
                        <span style={{ fontWeight: 700, color: colors[type] }}>{type}</span>
                        <span style={s.channelStats}>
                          {stat.count} orders · Rs {Math.round(stat.revenue).toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div style={s.barTrack}>
                        <div
                          style={{
                            ...s.barFill,
                            width: `${pct}%`,
                            backgroundColor: colors[type]
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Revenue breakdown box */}
              <div style={s.breakdownBox}>
                <div style={s.breakdownRow}>
                  <span style={s.bLabel}>Gross Revenue</span>
                  <span style={s.bValue}>Rs {totals.gross.toLocaleString()}</span>
                </div>
                <div style={s.breakdownRow}>
                  <span style={s.bLabel}>Discounts</span>
                  <span style={{ ...s.bValue, color: '#C62828' }}>- Rs {totals.disc.toLocaleString()}</span>
                </div>
                <div style={s.breakdownRow}>
                  <span style={s.bLabel}>Tax Collected</span>
                  <span style={{ ...s.bValue, color: '#1565C0' }}>+ Rs {totals.tax.toLocaleString()}</span>
                </div>
                <div style={{ ...s.breakdownRow, borderTop: '1px solid #EFE6DA', paddingTop: 10, marginTop: 4 }}>
                  <span style={{ ...s.bLabel, fontWeight: 800, color: '#1F130B' }}>Net Revenue</span>
                  <span style={{ ...s.bValue, fontWeight: 800, color: '#2E7D32' }}>Rs {totals.net.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  container: {
    padding: '28px 30px',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#FAF6F0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: '#1F130B',
    margin: 0
  },
  subtitle: {
    fontSize: 13,
    color: '#7A695E',
    marginTop: 4
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    position: 'relative'
  },
  datePickerWrap: {
    position: 'relative'
  },
  dateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    backgroundColor: '#fff',
    border: '1px solid #EFE6DA',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: '#1F130B',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 42,
    backgroundColor: '#fff',
    border: '1px solid #EFE6DA',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    zIndex: 1000,
    minWidth: 200,
    padding: 6,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  dropdownItem: {
    padding: '8px 12px',
    fontSize: 13,
    color: '#1F130B',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    borderRadius: 8,
    width: '100%'
  },
  dropdownItemActive: {
    backgroundColor: '#FAF6F0',
    fontWeight: 700,
    color: '#8B4513'
  },
  customRange: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '8px 10px',
    borderTop: '1px solid #EFE6DA',
    marginTop: 4
  },
  dateInput: {
    padding: '6px 8px',
    border: '1px solid #EFE6DA',
    borderRadius: 8,
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box'
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    backgroundColor: '#2E7D32',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },
  refreshBtn: {
    padding: '8px 10px',
    backgroundColor: '#fff',
    border: '1px solid #EFE6DA',
    borderRadius: 10,
    color: '#7A695E',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  loadingState: {
    textAlign: 'center',
    padding: '60px 0',
    color: '#7A695E',
    fontSize: 15
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 18,
    marginBottom: 24
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #EFE6DA',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14
  },
  cardIcon: {
    fontSize: 16,
    fontWeight: 800,
    color: '#2E7D32'
  },
  cardLabel: {
    fontSize: 12,
    color: '#7A695E',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 4
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 800,
    margin: '2px 0'
  },
  cardSub: {
    fontSize: 11,
    color: '#7A695E'
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    border: '1px solid #EFE6DA',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1F130B',
    marginBottom: 16,
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  periodBadge: {
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    padding: '3px 8px',
    borderRadius: 6,
    border: '1px solid #EFE6DA'
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px 0',
    color: '#7A695E',
    fontSize: 14
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  listRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottom: '1px solid #F6EFE6'
  },
  listLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  rank: {
    fontSize: 11,
    fontWeight: 700,
    color: '#7A695E',
    backgroundColor: '#FAF6F0',
    padding: '3px 7px',
    borderRadius: 5
  },
  itemName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1F130B'
  },
  listRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2
  },
  qtyBadge: {
    fontSize: 12,
    color: '#7A695E'
  },
  revBadge: {
    fontSize: 13,
    fontWeight: 700,
    color: '#2E7D32'
  },
  channels: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    marginBottom: 20
  },
  channelRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7
  },
  channelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  channelStats: {
    fontSize: 12,
    color: '#7A695E'
  },
  barTrack: {
    width: '100%',
    height: 9,
    backgroundColor: '#FAF6F0',
    borderRadius: 5,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    transition: 'width 0.3s ease'
  },
  breakdownBox: {
    backgroundColor: '#FAF6F0',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bLabel: {
    fontSize: 13,
    color: '#7A695E',
    fontWeight: 500
  },
  bValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1F130B'
  }
};
