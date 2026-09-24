import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Check, X, RefreshCw, Utensils, Search, Filter } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function ProductManagement() {
  const { showToast, ToastContainerEl } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Edit / Add Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentId, setCurrentId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('Piece');
  const [available, setAvailable] = useState(1);
  const [image, setImage] = useState('');
  const [urdu, setUrdu] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const translateToUrdu = async (englishText) => {
    if (!englishText || urdu) return;
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|ur`);
      if (response.ok) {
        const data = await response.json();
        if (data.responseData && data.responseData.translatedText) {
          const transText = data.responseData.translatedText;
          if (!/[a-zA-Z]/.test(transText)) {
            setUrdu(transText);
          }
        }
      }
    } catch (err) {
      console.warn('Urdu translation API failed:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodList, catList, unitList] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getUnits()
      ]);
      setProducts(prodList || []);
      setCategories(catList || []);
      setUnits(unitList || []);
      if (catList && catList.length > 0 && !category) {
        setCategory(catList[0].name);
      }
      if (unitList && unitList.length > 0) {
        const defUnit = unitList.find(u => u.is_default) || unitList[0];
        setUnit(defUnit.name);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast(`Error fetching dishes: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setCostPrice('0');
    setLowStockThreshold('10');
    setCategory(categories[0]?.name || '');
    const defUnit = units.find(u => u.is_default) || units[0];
    setUnit(defUnit ? defUnit.name : 'Piece');
    setAvailable(1);
    setImage('');
    setUrdu('');
    setCurrentId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setName(prod.name);
    setPrice(String(prod.price));
    setCostPrice(prod.cost_price !== undefined ? String(prod.cost_price) : '0');
    setLowStockThreshold(prod.low_stock_threshold !== undefined ? String(prod.low_stock_threshold) : '10');
    setCategory(prod.category);
    setUnit(prod.unit || 'Piece');
    setAvailable(prod.available);
    setImage(prod.image || '');
    setUrdu(prod.urdu || '');
    setCurrentId(prod.id);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      return showToast('Please enter a product name.', 'warning');
    }
    if (price === '' || isNaN(parseFloat(price))) {
      return showToast('Please enter a valid price.', 'warning');
    }

    const productData = {
      name: name.trim(),
      price: parseFloat(price),
      cost_price: parseFloat(costPrice) || 0,
      low_stock_threshold: parseFloat(lowStockThreshold) || 10,
      category: category || (categories[0]?.name || 'General'),
      unit: unit || 'Piece',
      available: parseInt(available) || 1,
      image,
      urdu: urdu.trim()
    };

    try {
      if (modalMode === 'add') {
        await api.createProduct({ ...productData, stock: 0 });
        showToast('Product added successfully!', 'success');
      } else {
        await api.updateProduct(currentId, productData);
        showToast('Product updated successfully!', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast(`Error saving product: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      fetchData();
      showToast('Product deleted.', 'success');
    } catch (err) {
      showToast(`Error deleting product: ${err.message}`, 'error');
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        (p.urdu && p.urdu.includes(q)) || 
        (p.category && p.category.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategoryFilter, searchQuery]);

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Menu &amp; Product Management</h1>
          <p style={styles.subtitle}>Add dishes, adjust pricing, toggle item availability, and write Urdu translations.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleOpenAdd} style={styles.addBtn}>
            <Plus size={16} /> Add Product
          </button>
          <button onClick={fetchData} style={styles.refreshBtn} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={styles.filterToolbar}>
        <div style={styles.searchBox}>
          <Search size={15} color="#7A695E" />
          <input
            type="text"
            placeholder="Search dish by English name, Urdu, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A695E' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="#7A695E" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            style={styles.categoryFilterSelect}
          >
            <option value="All">All Categories ({products.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name} ({products.filter(p => p.category === c.name).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div style={styles.tableSection}>
        <div style={styles.tableContainer}>
          {filteredProducts.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px 0', color: '#7A695E' }}>
              {products.length === 0 ? 'No products configured.' : 'No dishes match your search criteria.'}
            </p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>English Name</th>
                  <th style={styles.th}>Urdu Subtitle</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Cost</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Available</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(prod => (
                  <tr key={prod.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      {prod.image && (prod.image.startsWith('data:') || prod.image.startsWith('/')) ? (
                        <img src={prod.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#FAF6F0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #EFE6DA' }}>
                          <Utensils size={18} color="#7A695E" />
                        </div>
                      )}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700' }}>{prod.name}</td>
                    <td style={{ ...styles.td, color: '#E28F46', fontWeight: '600' }} className="urdu-text">{prod.urdu || '-'}</td>
                    <td style={styles.td}>{prod.category}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#C62828' }}>Rs {prod.price}</td>
                    <td style={{ ...styles.td, color: '#7A695E' }}>{prod.cost_price ? `Rs ${prod.cost_price}` : '-'}</td>
                    <td style={styles.td}>{prod.unit}</td>
                    <td style={styles.td}>
                      {prod.available === 1 ? (
                        <span style={{ ...styles.badge, backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                          <Check size={12} /> Active
                        </span>
                      ) : (
                        <span style={{ ...styles.badge, backgroundColor: '#FFEBEE', color: '#C62828' }}>
                          <X size={12} /> Out of Stock
                        </span>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actionsGrid}>
                        <button onClick={() => handleOpenEdit(prod)} style={styles.editBtn} title="Edit Product">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(prod.id)} style={styles.deleteBtn} title="Delete Product">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* EDIT / ADD MODAL */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '800', color: '#1F130B' }}>{modalMode === 'add' ? 'Add Dish to Menu' : 'Edit Dish Details'}</h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.modalBody}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>English Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={(e) => translateToUrdu(e.target.value)}
                    style={styles.input}
                    placeholder="e.g. Chicken Seekh Kabab"
                    autoFocus
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Urdu Translation (Sub-Text)</label>
                  <input
                    type="text"
                    value={urdu}
                    onChange={(e) => setUrdu(e.target.value)}
                    style={{ ...styles.input, textAlign: 'right' }}
                    placeholder="چکن سیخ کباب"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Sale Price (Rs) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    style={styles.input}
                    placeholder="e.g. 320"
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cost Price (Rs) <span style={{ fontSize: '11px', color: '#7A695E', fontWeight: 'normal' }}>(Optional for Profit Analytics)</span></label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    style={styles.input}
                    placeholder="0"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={styles.input}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={styles.input}
                  >
                    {units.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Low Stock Warning Threshold</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    style={styles.input}
                    placeholder="10"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Dish Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ ...styles.input, padding: '6px' }}
                  />
                  {image && (
                    <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {image.startsWith('data:') || image.startsWith('/') ? (
                        <img src={image} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #EFE6DA' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#FAF6F0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #EFE6DA' }}>
                          <Utensils size={18} color="#7A695E" />
                        </div>
                      )}
                      <button 
                        type="button" 
                        onClick={() => setImage('')} 
                        style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Status / Availability</label>
                  <select
                    value={available}
                    onChange={(e) => setAvailable(parseInt(e.target.value))}
                    style={styles.input}
                  >
                    <option value={1}>Available / Active</option>
                    <option value={0}>Out of Stock / Inactive</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.confirmBtn}>Save Dish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ToastContainerEl}
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
    marginBottom: '16px',
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
    marginTop: '2px',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow: '0 2px 8px rgba(198, 40, 40, 0.2)',
    cursor: 'pointer',
    border: 'none',
  },
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#7A695E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  filterToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 12px',
    flex: 1,
    minWidth: '260px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    color: '#1F130B',
    width: '100%',
    padding: 0,
  },
  categoryFilterSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1F130B',
    cursor: 'pointer',
    outline: 'none',
  },
  tableSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 8px rgba(31, 19, 11, 0.04)',
    overflow: 'hidden',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#FAF6F0',
    borderBottom: '1px solid var(--border-color)',
  },
  th: {
    padding: '12px 14px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#7A695E',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
  },
  td: {
    padding: '12px 14px',
    fontSize: '13px',
    color: '#1F130B',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  },
  actionsGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
  },
  editBtn: {
    backgroundColor: '#FAF6F0',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px',
    color: '#1F130B',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
    border: '1px solid #FFCDD2',
    borderRadius: '6px',
    padding: '6px',
    color: '#C62828',
    cursor: 'pointer',
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
    borderRadius: '14px',
    width: '90%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(31, 19, 11, 0.12)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#7A695E',
  },
  modalBody: {
    padding: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
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
    padding: '8px 12px',
    fontSize: '13px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#FFFFFF',
    color: '#1F130B',
    outline: 'none',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '14px',
  },
  cancelBtn: {
    backgroundColor: '#FAF6F0',
    color: '#7A695E',
    border: '1px solid var(--border-color)',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  confirmBtn: {
    backgroundColor: '#C62828',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(198, 40, 40, 0.25)',
  }
};
