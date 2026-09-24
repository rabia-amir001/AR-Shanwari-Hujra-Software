import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layout, Plus, Trash2, ArrowRightLeft, Merge, Info, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function TableManagement() {
  const { showToast, ToastContainerEl } = useToast();
  const [tables, setTables] = useState([]);
  const [tableName, setTableName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Transfer table modal/state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');

  // Merge table state
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSource, setMergeSource] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const list = await api.getTables();
      setTables(list);
    } catch (err) {
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!tableName) return;

    try {
      await api.createTable(tableName);
      setTableName('');
      fetchTables();
      showToast('Table added successfully!', 'success');
    } catch (err) {
      showToast(`Error creating table: ${err.message}`, 'error');
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;

    try {
      await api.deleteTable(id);
      fetchTables();
      showToast('Table deleted successfully.', 'success');
    } catch (err) {
      showToast(`Error deleting table: ${err.message}`, 'error');
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Available' ? 'Reserved' : currentStatus === 'Reserved' ? 'Occupied' : 'Available';
    try {
      await api.updateTableStatus(id, nextStatus);
      fetchTables();
    } catch (err) {
      showToast(`Error updating table status: ${err.message}`, 'error');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferFrom || !transferTo) return showToast('Please select both source and destination tables.', 'warning');

    try {
      await api.updateTableStatus(transferFrom, 'Available');
      await api.updateTableStatus(transferTo, 'Occupied');
      
      const orders = await api.getOrders();
      const activeOrder = orders.find(o => o.table_id === parseInt(transferFrom) && (o.status === 'Kitchen' || o.status === 'Ready'));
      if (activeOrder) {
        showToast(`Transferred Order #${activeOrder.id} from Table ${tables.find(t => t.id === parseInt(transferFrom))?.name} to Table ${tables.find(t => t.id === parseInt(transferTo))?.name}`, 'success');
      } else {
        showToast('Table status transferred successfully.', 'success');
      }
      
      setShowTransferModal(false);
      setTransferFrom('');
      setTransferTo('');
      fetchTables();
    } catch (err) {
      showToast(`Error transferring table: ${err.message}`, 'error');
    }
  };

  const handleMergeSubmit = async (e) => {
    e.preventDefault();
    if (!mergeSource || !mergeTarget) return showToast('Select both tables.', 'warning');

    try {
      await api.updateTableStatus(mergeSource, 'Available');
      await api.updateTableStatus(mergeTarget, 'Occupied');
      showToast(`Merged Table ${tables.find(t => t.id === parseInt(mergeSource))?.name} into Table ${tables.find(t => t.id === parseInt(mergeTarget))?.name}.`, 'success');
      setShowMergeModal(false);
      setMergeSource('');
      setMergeTarget('');
      fetchTables();
    } catch (err) {
      showToast(`Error merging tables: ${err.message}`, 'error');
    }
  };

  return (
    <>
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Table Management</h1>
          <p style={styles.subtitle}>Configure layout, transfer orders, and monitor table availability.</p>
        </div>
        <div style={styles.btnRow}>
          <button onClick={() => setShowTransferModal(true)} style={styles.actionBtn}>
            <ArrowRightLeft size={16} /> Transfer Table
          </button>
          <button onClick={() => setShowMergeModal(true)} style={styles.actionBtn}>
            <Merge size={16} /> Merge Tables
          </button>
          <button onClick={fetchTables} style={styles.refreshBtn} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* Left: Table Status Layout Grid */}
        <div style={styles.layoutSection}>
          <h2 style={styles.sectionTitle}>Visual Layout Map</h2>
          
          <div style={styles.tableGrid}>
            {tables.map(tbl => {
              const statusColor = tbl.status === 'Available' ? '#2E7D32' : tbl.status === 'Reserved' ? '#E65100' : '#C62828';
              const statusBg = tbl.status === 'Available' ? '#E8F5E9' : tbl.status === 'Reserved' ? '#FFF3E0' : '#FFEBEE';
              
              return (
                <div key={tbl.id} style={styles.tableCard}>
                  <div style={styles.tableIconContainer}>
                    <Layout size={32} color={statusColor} />
                  </div>
                  <h3 style={styles.tableName}>{tbl.name}</h3>
                  <button 
                    onClick={() => handleUpdateStatus(tbl.id, tbl.status)}
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: statusBg,
                      color: statusColor,
                    }}
                  >
                    {tbl.status}
                  </button>

                  <div style={styles.cardActions}>
                    <button 
                      onClick={() => handleDeleteTable(tbl.id)}
                      style={styles.deleteBtn}
                      title="Delete Table"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Add new Table Form */}
        <div style={styles.sidebarSection}>
          <div style={styles.formCard}>
            <h2 style={styles.sectionTitle}>Add New Table</h2>
            <form onSubmit={handleAddTable} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Table Label</label>
                <input
                  type="text"
                  placeholder="e.g. Table 9, Family Cabin 1"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.submitBtn}>
                <Plus size={16} /> Create Table
              </button>
            </form>
          </div>

          <div style={styles.infoCard}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Info size={18} color="#E28F46" />
              <h4 style={{ fontWeight: '700', color: '#1F130B' }}>Quick Tip</h4>
            </div>
            <p style={{ fontSize: '13px', color: '#7A695E', marginTop: '8px', lineHeight: '1.4' }}>
              Click on a table's status badge in the map layout to manually toggle its availability status (Available ➔ Reserved ➔ Occupied ➔ Available).
            </p>
          </div>
        </div>
      </div>

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTransferModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>Transfer Table Order</h3>
              <button onClick={() => setShowTransferModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleTransferSubmit} style={styles.modalBody}>
              <div style={styles.modalInputGroup}>
                <label style={styles.label}>Transfer From (Active Table)</label>
                <select 
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">-- Select Source Table --</option>
                  {tables.filter(t => t.status === 'Occupied').map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ ...styles.modalInputGroup, marginTop: '16px' }}>
                <label style={styles.label}>Transfer To (Available Table)</label>
                <select 
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">-- Select Destination Table --</option>
                  {tables.filter(t => t.status === 'Available').map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowTransferModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.confirmBtn}>Execute Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERGE MODAL */}
      {showMergeModal && (
        <div style={styles.modalOverlay} onClick={() => setShowMergeModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>Merge Tables</h3>
              <button onClick={() => setShowMergeModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleMergeSubmit} style={styles.modalBody}>
              <div style={styles.modalInputGroup}>
                <label style={styles.label}>Merge From (Source Table - will become Available)</label>
                <select 
                  value={mergeSource}
                  onChange={(e) => setMergeSource(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">-- Select Source --</option>
                  {tables.filter(t => t.status === 'Occupied').map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ ...styles.modalInputGroup, marginTop: '16px' }}>
                <label style={styles.label}>Merge Into (Destination Table - will remain Occupied)</label>
                <select 
                  value={mergeTarget}
                  onChange={(e) => setMergeTarget(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">-- Select Destination --</option>
                  {tables.filter(t => t.status === 'Occupied' && String(t.id) !== mergeSource).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowMergeModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.confirmBtn}>Execute Merge</button>
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
  btnRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  actionBtn: {
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
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '10px',
    padding: '10px',
    color: '#7A695E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentGrid: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
  },
  layoutSection: {
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
  tableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '20px',
  },
  tableCard: {
    border: '1px solid #EFE6DA',
    borderRadius: '12px',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
  },
  tableIconContainer: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    backgroundColor: '#FAF6F0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '10px',
  },
  tableName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1F130B',
    marginBottom: '8px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    border: 'none',
  },
  cardActions: {
    marginTop: '12px',
    display: 'flex',
    gap: '12px',
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    color: '#D32F2F',
  },
  sidebarSection: {
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid #EFE6DA',
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
    width: '100%',
  },
  submitBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#F59E0B',
    color: '#1F130B',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
  },
  infoCard: {
    backgroundColor: '#FAF6F0',
    borderRadius: '16px',
    padding: '20px',
    border: '1px dashed #EFE6DA',
  },

  // MODALS
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(31, 19, 11, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '400px',
    boxShadow: 'var(--shadow-lg)',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #EFE6DA',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    fontSize: '24px',
    background: 'none',
    border: 'none',
    color: '#7A695E',
  },
  modalBody: {
    padding: '20px',
  },
  modalInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '24px',
  },
  cancelBtn: {
    padding: '8px 16px',
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    borderRadius: '6px',
    fontWeight: '600',
  },
  confirmBtn: {
    padding: '8px 16px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    borderRadius: '6px',
    fontWeight: '600',
  }
};
