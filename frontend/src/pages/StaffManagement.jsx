import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Key, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function StaffManagement() {
  const { showToast, ToastContainerEl } = useToast();
  const [users, setUsers] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentId, setCurrentId] = useState(null);

  // Form inputs
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Cashier');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [list, logs] = await Promise.all([
        api.getUsers(),
        api.getLoginHistory().catch(() => [])
      ]);
      setUsers(list);
      setLoginLogs(logs);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setName('');
    setUsername('');
    setPassword('');
    setRole('Cashier');
    setModalMode('add');
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setName(user.name);
    setUsername(user.username);
    setPassword(''); // Leave blank unless changing password
    setRole(user.role);
    setCurrentId(user.id);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name, username, role };
    if (password) payload.password = password;

    try {
      if (modalMode === 'add') {
        if (!password) return showToast('Password is required for new accounts.', 'warning');
        payload.password = password;
        await api.createUser(payload);
        showToast('User created successfully.', 'success');
      } else {
        await api.updateUser(currentId, payload);
        showToast('User updated successfully.', 'success');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      showToast(`Error saving user: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (id === 1) return showToast('Cannot delete the root administrator account.', 'warning');
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.deleteUser(id);
      fetchUsers();
      showToast('User deleted.', 'success');
    } catch (err) {
      showToast(`Error deleting user: ${err.message}`, 'error');
    }
  };

  return (
    <>
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Staff & Security Management</h1>
          <p style={styles.subtitle}>Manage system users, passwords, and restrict roles (Cashiers only get POS access).</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleOpenAdd} style={styles.addBtn}>
            <Plus size={16} /> Add Staff Member
          </button>
          <button onClick={fetchUsers} style={styles.refreshBtn} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.tableSection}>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>User ID</th>
                  <th style={styles.th}>Full Name</th>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Role / Permission</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={styles.tableRow}>
                    <td style={{ ...styles.td, fontWeight: '700' }}>#{user.id}</td>
                    <td style={styles.td}>{user.name}</td>
                    <td style={styles.td}>{user.username}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: user.role === 'Admin' ? '#FFEBEE' : user.role === 'Manager' ? '#FFF3E0' : '#E3F2FD',
                        color: user.role === 'Admin' ? '#C62828' : user.role === 'Manager' ? '#E65100' : '#1565C0',
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actionsGrid}>
                        <button onClick={() => handleOpenEdit(user)} style={styles.editBtn} title="Edit Staff / Reset Password">
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)} 
                          style={{ ...styles.deleteBtn, opacity: user.id === 1 ? 0.3 : 1 }}
                          disabled={user.id === 1}
                          title="Delete Staff"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.activitySection}>
          <h2 style={styles.sectionTitle}>Login Activity Log</h2>
          <div style={styles.logList}>
            {loginLogs.map(log => (
              <div key={log.id} style={styles.logCard}>
                <div style={styles.logHeader}>
                  <span style={styles.logName}>{log.name}</span>
                  <span style={styles.logTime}>{log.login_time}</span>
                </div>
                <div style={styles.logMeta}>
                  <span>@{log.username}</span> • <span style={{
                    backgroundColor: log.role === 'Admin' ? '#FFEBEE' : log.role === 'Manager' ? '#FFF3E0' : '#E3F2FD',
                    color: log.role === 'Admin' ? '#C62828' : log.role === 'Manager' ? '#E65100' : '#1565C0',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>{log.role}</span>
                </div>
              </div>
            ))}
            {loginLogs.length === 0 && (
              <p style={{ textAlign: 'center', padding: '20px 0', color: '#7A695E', fontSize: '13px' }}>
                No logins recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* EDIT/ADD MODAL */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700' }}>{modalMode === 'add' ? 'Create Staff Profile' : 'Edit Staff Profile'}</h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.modalBody}>
              <div style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                    autoFocus
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Login Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    {modalMode === 'add' ? 'Password' : 'New Password (leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    placeholder="••••••••"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={styles.input}
                    disabled={currentId === 1}
                  >
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Manager">Manager (POS Only)</option>
                    <option value="Cashier">Cashier/Salesman (POS Only)</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.confirmBtn}>Save User</button>
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
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    borderRadius: '10px',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(198, 40, 40, 0.2)',
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
  },
  contentGrid: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
  },
  tableSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid #EFE6DA',
  },
  activitySection: {
    width: '350px',
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
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  logCard: {
    border: '1px solid #EFE6DA',
    borderRadius: '10px',
    padding: '12px',
    backgroundColor: '#FAF6F0',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  logName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1F130B',
  },
  logTime: {
    fontSize: '10px',
    color: '#7A695E',
  },
  logMeta: {
    fontSize: '11px',
    color: '#7A695E',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
  },
  actionsGrid: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#FAF6F0',
    border: '1px solid #EFE6DA',
    borderRadius: '6px',
    padding: '6px',
    color: '#7A695E',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
    border: '1px solid #FFCDD2',
    borderRadius: '6px',
    padding: '6px',
    color: '#C62828',
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
    fontSize: '11px',
    fontWeight: '700',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
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
    padding: '8px 20px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    borderRadius: '6px',
    fontWeight: '600',
  }
};
