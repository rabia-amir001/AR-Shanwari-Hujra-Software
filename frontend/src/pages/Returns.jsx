import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RefreshCw, RotateCcw, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Returns() {
  const { showToast, ToastContainerEl } = useToast();
  const [orders, setOrders] = useState([]);
  const [returnHistory, setReturnHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Return dialog control
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnType, setReturnType] = useState('Full Return'); // Full Return, Partial Return
  const [refundAmount, setRefundAmount] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchReturnsData();
  }, []);

  const fetchReturnsData = async () => {
    setLoading(true);
    try {
      const [ordersList, refundsList] = await Promise.all([
        api.getOrders(),
        api.getRefunds()
      ]);
      // Only completed orders can be refunded/returned
      setOrders(ordersList.filter(o => o.status === 'Completed'));
      setReturnHistory(refundsList || []);
    } catch (err) {
      console.error('Error fetching orders for returns:', err);
      showToast(`Error fetching returns: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturn = (order) => {
    setSelectedOrder(order);
    setReturnType('Full Return');
    setRefundAmount(order.total);
    setReason('');
    setShowModal(true);
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!selectedOrder || refundAmount <= 0) return showToast('Please enter a valid refund amount.', 'warning');

    try {
      await api.createRefund({
        order_id: selectedOrder.id,
        type: returnType,
        amount: parseFloat(refundAmount),
        reason: reason
      });
      setShowModal(false);
      fetchReturnsData();
      showToast('Refund processed, stock restored, and order status updated.', 'success');
    } catch (err) {
      showToast(`Error processing return: ${err.message}`, 'error');
    }
  };

  const handleDeleteReturn = async (id) => {
    if (!window.confirm('Are you sure you want to delete this refund audit log? This will only remove the log record.')) return;
    try {
      await api.deleteRefund(id);
      fetchReturnsData();
      showToast('Refund audit log deleted.', 'success');
    } catch (err) {
      showToast(`Error deleting refund log: ${err.message}`, 'error');
    }
  };

  return (
    <>
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Returns & Refunds Management</h1>
          <p style={styles.subtitle}>Process order returns, execute full or partial client refunds, and review audit history.</p>
        </div>
        <button onClick={fetchReturnsData} style={styles.refreshBtn} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={styles.contentGrid}>
        {/* Active Completed Orders list */}
        <div style={styles.tableSection}>
          <h2 style={styles.sectionTitle}>Completed Invoices</h2>
          <div style={styles.tableContainer}>
            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px 0', color: '#7A695E' }}>No completed orders found.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Total</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={styles.tableRow}>
                      <td style={{ ...styles.td, fontWeight: '700' }}>#{o.id}</td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600' }}>{o.customer_name || 'Walk-in'}</div>
                        <span style={{ fontSize: '11px', color: '#7A695E' }}>{o.created_at}</span>
                      </td>
                      <td style={styles.td}>{o.order_type}</td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#C62828' }}>Rs {o.total}</td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button onClick={() => handleOpenReturn(o)} style={styles.returnBtn}>
                          <RotateCcw size={14} /> Process Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Return History Log */}
        <div style={styles.historySection}>
          <h2 style={styles.sectionTitle}>Recent Return Audits</h2>
          <div style={styles.historyList}>
            {returnHistory.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px 0', color: '#7A695E' }}>No return records yet.</p>
            ) : (
              returnHistory.map(rf => (
                <div key={rf.id} style={styles.historyCard}>
                  <div style={styles.historyTop}>
                    <span style={{ fontWeight: '700', color: '#1F130B' }}>Invoice #{rf.order_id}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={styles.refundAmountBadge}>- Rs {rf.amount}</span>
                      <button 
                        onClick={() => handleDeleteReturn(rf.id)} 
                        style={{ border: 'none', background: 'none', color: '#C62828', cursor: 'pointer', padding: '2px' }}
                        title="Delete log"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#7A695E', marginTop: '4px' }}>
                    Type: <strong>{rf.type}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#7A695E', fontStyle: 'italic', marginTop: '2px' }}>
                    "{rf.reason || 'No reason provided'}"
                  </div>
                  <div style={{ fontSize: '10px', color: '#BCAAA4', marginTop: '6px' }}>
                    {rf.created_at}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RETURN PROCESSING MODAL */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>Process Refund (Invoice #{selectedOrder?.id})</h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleSubmitReturn} style={styles.modalBody}>
              <div style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Refund Type</label>
                  <select
                    value={returnType}
                    onChange={(e) => {
                      setReturnType(e.target.value);
                      if (e.target.value === 'Full Return') setRefundAmount(selectedOrder.total);
                    }}
                    style={styles.input}
                  >
                    <option value="Full Return">Full Return (Rs {selectedOrder?.total})</option>
                    <option value="Partial Return">Partial Return (Custom amount)</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Refund Amount (Rs)</label>
                  <input
                    type="number"
                    max={selectedOrder?.total}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value || 0))}
                    style={styles.input}
                    disabled={returnType === 'Full Return'}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Return Reason / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Defective food quality, double bill error"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={styles.input}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.confirmBtn}>Execute Refund</button>
              </div>
            </form>
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
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '10px',
    padding: '10px',
    color: '#7A695E',
    cursor: 'pointer',
  },
  contentGrid: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
  },
  tableSection: {
    flex: 1.4,
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid #EFE6DA',
  },
  historySection: {
    flex: 1,
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
    padding: '16px',
    fontSize: '14px',
    color: '#1F130B',
    verticalAlign: 'middle',
  },
  returnBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    border: '1px solid #FFCDD2',
    padding: '8px 12px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  historyCard: {
    backgroundColor: '#FAF6F0',
    borderRadius: '10px',
    padding: '14px',
    border: '1px solid #EFE6DA',
  },
  historyTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refundAmountBadge: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '12px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '450px',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #EFE6DA',
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#7A695E',
  },
  modalBody: {
    padding: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#FAF6F0',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  cancelBtn: {
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    border: '1px solid #EFE6DA',
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  confirmBtn: {
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(198, 40, 40, 0.2)',
  },
};
