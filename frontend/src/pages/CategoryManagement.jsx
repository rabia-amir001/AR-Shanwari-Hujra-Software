import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, RefreshCw, Check, X } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function CategoryManagement() {
  const { showToast, ToastContainerEl } = useToast();
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const list = await api.getCategories();
      setCategories(list || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      showToast(`Error loading categories: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return showToast('Please enter a category name.', 'warning');

    try {
      await api.createCategory(newCatName.trim());
      setNewCatName('');
      fetchCategories();
      showToast('Category added successfully!', 'success');
    } catch (err) {
      showToast(`Error creating category: ${err.message}`, 'error');
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (id) => {
    if (!editingName.trim()) return showToast('Category name cannot be empty.', 'warning');
    try {
      await api.updateCategory(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
      fetchCategories();
      showToast('Category updated successfully!', 'success');
    } catch (err) {
      showToast(`Error updating category: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All products under it will remain.')) return;
    try {
      await api.deleteCategory(id);
      fetchCategories();
      showToast('Category deleted.', 'success');
    } catch (err) {
      showToast(`Error deleting category: ${err.message}`, 'error');
    }
  };

  return (
    <>
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Category Management</h1>
          <p style={styles.subtitle}>Define dish categories (e.g. BBQ, Karahi, Dessert, Drinks) for POS classification.</p>
        </div>
        <button onClick={fetchCategories} style={styles.refreshBtn} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={styles.contentGrid}>
        {/* Left: Category list */}
        <div style={styles.listSection}>
          <h2 style={styles.sectionTitle}>Active Categories</h2>
          <div style={styles.listContainer}>
            {categories.map(cat => (
              <div key={cat.id} style={styles.categoryRow}>
                {editingId === cat.id ? (
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSaveEdit(cat.id); }} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
                  >
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      style={{ ...styles.input, padding: '6px 10px', fontSize: '13px' }}
                      autoFocus
                    />
                    <button type="submit" style={styles.saveEditBtn} title="Save">
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={handleCancelEdit} style={styles.cancelEditBtn} title="Cancel">
                      <X size={14} />
                    </button>
                  </form>
                ) : (
                  <>
                    <span style={styles.categoryName}>{cat.name}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleStartEdit(cat)} style={styles.editBtn} title="Rename Category">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} style={styles.deleteBtn} title="Delete Category">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <p style={{ textAlign: 'center', padding: '20px 0', color: '#7A695E' }}>No categories registered.</p>
            )}
          </div>
        </div>

        {/* Right: Add new Category */}
        <div style={styles.formSection}>
          <div style={styles.formCard}>
            <h2 style={styles.sectionTitle}>Create Category</h2>
            <form onSubmit={handleCreate} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g., Starters, Platter Deals"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.submitBtn}>
                <Plus size={16} /> Add Category
              </button>
            </form>
          </div>
        </div>
      </div>
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
  listSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1F130B',
    marginBottom: '20px',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  categoryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    backgroundColor: '#FAF6F0',
    borderRadius: '10px',
    border: '1px solid #EFE6DA',
  },
  categoryName: {
    fontWeight: '600',
    fontSize: '15px',
    color: '#1F130B',
  },
  editBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EFE6DA',
    borderRadius: '8px',
    padding: '8px',
    color: '#1F130B',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
    border: '1px solid #FFCDD2',
    borderRadius: '8px',
    padding: '8px',
    color: '#C62828',
    cursor: 'pointer',
  },
  saveEditBtn: {
    backgroundColor: '#E8F5E9',
    border: '1px solid #C8E6C9',
    borderRadius: '6px',
    padding: '6px 10px',
    color: '#2E7D32',
    cursor: 'pointer',
  },
  cancelEditBtn: {
    backgroundColor: '#FAF6F0',
    border: '1px solid #EFE6DA',
    borderRadius: '6px',
    padding: '6px 10px',
    color: '#7A695E',
    cursor: 'pointer',
  },
  formSection: {
    width: '380px',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
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
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14px',
    marginTop: '10px',
    boxShadow: '0 4px 12px rgba(198, 40, 40, 0.2)',
    cursor: 'pointer',
  },
};
