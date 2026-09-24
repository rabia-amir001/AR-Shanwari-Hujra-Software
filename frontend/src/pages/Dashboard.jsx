import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DollarSign, ClipboardList, Layout, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    ordersCount: 0,
    occupiedTables: 0,
    lowStockCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchStats();
    const savedUser = localStorage.getItem('ar_pos_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setIsAdmin(u.role === 'Admin');
    }

    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [orders, products, tables] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getTables()
      ]);

      // Today's Date String
      const todayStr = new Date().toISOString().substring(0, 10);
      
      const todayOrders = orders.filter(o => o.created_at && o.created_at.startsWith(todayStr));
      const sales = todayOrders.reduce((sum, o) => sum + (o.status === 'Completed' ? o.total : 0), 0);
      const activeTables = tables.filter(t => t.status === 'Occupied').length;
      const lowStock = products.filter(p => p.stock < 10).length;

      setStats({
        todaySales: sales,
        ordersCount: todayOrders.length,
        occupiedTables: activeTables,
        lowStockCount: lowStock
      });

      // Get last 5 orders of today only
      setRecentOrders(todayOrders.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(`Delete Invoice #${orderId}? This cannot be undone.`);
    if (!confirmDelete) return;
    try {
      await api.deleteOrder(orderId);
      fetchStats(); // refresh list & stats
    } catch (err) {
      alert('Failed to delete invoice: ' + err.message);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome back, Admin</h1>
          <p style={styles.subtitle}>Here is what is happening at AR Shinwari Hujra today.</p>
        </div>
        <button onClick={fetchStats} style={styles.refreshBtn} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Stats
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <div style={{ ...styles.iconContainer, backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={styles.cardLabel}>Today's Revenue</p>
            <h3 style={styles.cardValue}>Rs {stats.todaySales}</h3>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ ...styles.iconContainer, backgroundColor: '#E3F2FD', color: '#1565C0' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <p style={styles.cardLabel}>Today's Orders</p>
            <h3 style={styles.cardValue}>{stats.ordersCount}</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div style={styles.tableSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Recent Invoices</h2>
          {isAdmin && <span style={{ fontSize: '11px', color: '#7A695E', fontWeight: '600' }}>Admin: Click trash icon to delete an invoice</span>}
        </div>
        <div style={styles.tableContainer}>
          {recentOrders.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px 0', color: '#7A695E' }}>No orders placed today yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date & Time</th>
                  {isAdmin && <th style={{ ...styles.th, textAlign: 'center' }}>Delete</th>}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={styles.tableRow}>
                    <td style={{ ...styles.td, fontWeight: '700' }}>#{order.id}</td>
                    <td style={styles.td}>{order.customer_name}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: order.order_type === 'Dine-In' ? '#E3F2FD' : order.order_type === 'Takeaway' ? '#E8F5E9' : '#FFF3E0',
                        color: order.order_type === 'Dine-In' ? '#1565C0' : order.order_type === 'Takeaway' ? '#2E7D32' : '#E65100',
                      }}>{order.order_type}</span>
                    </td>
                    <td style={styles.td}>{order.payment_method}</td>
                    <td style={{ ...styles.td, fontWeight: '600' }}>Rs {order.total}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: order.status === 'Completed' ? '#E8F5E9' : '#FFEBEE',
                        color: order.status === 'Completed' ? '#2E7D32' : '#C62828',
                      }}>{order.status}</span>
                    </td>
                    <td style={{ ...styles.td, color: '#7A695E', fontSize: '12px' }}>{order.created_at}</td>
                    {isAdmin && (
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          style={styles.deleteBtn}
                          title={`Delete Invoice #${order.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
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
    marginBottom: '30px',
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
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#7A695E',
    boxShadow: 'var(--shadow-sm)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '40px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid #EFE6DA',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: '13px',
    color: '#7A695E',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1F130B',
    marginTop: '4px',
  },
  tableSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid #EFE6DA',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1F130B',
    marginBottom: '20px',
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
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    display: 'inline-block',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
    border: '1px solid #FFCDD2',
    borderRadius: '6px',
    padding: '6px',
    color: '#C62828',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  }
};
