import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import POS from './pages/POS';
import Dashboard from './pages/Dashboard';
import TableManagement from './pages/TableManagement';
import ProductManagement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import StaffManagement from './pages/StaffManagement';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Returns from './pages/Returns';
import SalesHistory from './pages/SalesHistory';
import DataExport from './pages/DataExport';
import { api } from './services/api';

import { 
  Flame, Receipt, LayoutDashboard, Layout, Utensils, History, 
  Boxes, BarChart3, Settings as SettingsIcon, LogOut, Users, FileDown,
  Database, Sparkles, CheckCircle2, FolderUp
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('POS'); // Default view
  const [salesSubView, setSalesSubView] = useState('Invoices'); // 'Invoices' or 'Returns'
  const [menuSubView, setMenuSubView] = useState('Products'); // 'Products' or 'Categories'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [settings, setSettings] = useState({ logo: null, restaurant_name: 'AR Shinwari Hujra' });

  // First-Run Legacy POS Migration States
  const [legacyDetected, setLegacyDetected] = useState(null);
  const [showLegacyModal, setShowLegacyModal] = useState(false);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(1.0);

  useEffect(() => {
    const savedZoom = localStorage.getItem('ar_pos_zoom_level');
    if (savedZoom) {
      const z = parseFloat(savedZoom);
      if (!isNaN(z)) {
        setZoomLevel(z);
        if (window.electronAPI && typeof window.electronAPI.setZoomFactor === 'function') {
          try {
            window.electronAPI.setZoomFactor(z);
          } catch (e) {
            console.error('Electron zoom error:', e);
          }
        } else {
          document.body.style.zoom = z;
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoomLevel((currentZoom) => {
            const nextZoom = Math.min(currentZoom + 0.1, 2.0);
            localStorage.setItem('ar_pos_zoom_level', String(nextZoom));
            if (window.electronAPI && typeof window.electronAPI.setZoomFactor === 'function') {
              try {
                window.electronAPI.setZoomFactor(nextZoom);
              } catch (err) {}
            } else {
              document.body.style.zoom = nextZoom;
            }
            return nextZoom;
          });
        } else if (e.key === '-') {
          e.preventDefault();
          setZoomLevel((currentZoom) => {
            const nextZoom = Math.max(currentZoom - 0.1, 0.5);
            localStorage.setItem('ar_pos_zoom_level', String(nextZoom));
            if (window.electronAPI && typeof window.electronAPI.setZoomFactor === 'function') {
              try {
                window.electronAPI.setZoomFactor(nextZoom);
              } catch (err) {}
            } else {
              document.body.style.zoom = nextZoom;
            }
            return nextZoom;
          });
        } else if (e.key === '0') {
          e.preventDefault();
          setZoomLevel(1.0);
          localStorage.setItem('ar_pos_zoom_level', '1.0');
          if (window.electronAPI && typeof window.electronAPI.setZoomFactor === 'function') {
            try {
              window.electronAPI.setZoomFactor(1.0);
            } catch (err) {}
          } else {
            document.body.style.zoom = 1.0;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  useEffect(() => {
    // Check session: First check active tab session, then persistent remembered session
    let savedUser = sessionStorage.getItem('ar_pos_user');
    const isRemembered = localStorage.getItem('ar_pos_remember_me') === 'true';
    if (!savedUser && isRemembered) {
      savedUser = localStorage.getItem('ar_pos_user');
    }

    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        // Validate session against active users in database
        api.getUsers().then(usersList => {
          const exists = usersList.some(userObj => userObj.username === u.username && userObj.role === u.role);
          if (!exists) {
            sessionStorage.removeItem('ar_pos_user');
            localStorage.removeItem('ar_pos_user');
            localStorage.removeItem('ar_pos_remember_me');
            setUser(null);
            alert('Your staff account has been deleted or deactivated.');
          } else {
            setUser(u);
            setCurrentView(u.role === 'Admin' ? 'Dashboard' : 'POS');
          }
        }).catch(err => {
          // Keep session in case of temporary offline mode
          console.warn('Could not validate staff session with server, keeping session:', err);
          setUser(u);
          setCurrentView(u.role === 'Admin' ? 'Dashboard' : 'POS');
        });
      } catch (err) {
        sessionStorage.removeItem('ar_pos_user');
        localStorage.removeItem('ar_pos_user');
        localStorage.removeItem('ar_pos_remember_me');
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      api.getSettings().then(s => {
        if (s) setSettings(s);
      }).catch(err => console.error('Error fetching settings in App.jsx:', err));
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'Admin') {
      const isDismissed = localStorage.getItem('ar_legacy_migration_dismissed') === 'true';
      if (!isDismissed) {
        api.detectLegacyPOS().then(data => {
          if (data && data.detected && data.counts && (data.counts.products > 0 || data.counts.categories > 0)) {
            setLegacyDetected(data);
            setShowLegacyModal(true);
          }
        }).catch(() => {});
      }
    }
  }, [user]);

  const handleImportLegacyData = async (mode = 'menu_only') => {
    if (!legacyDetected) return;
    try {
      setMigrationLoading(true);
      const res = await api.importLegacyPOS({
        sourcePath: legacyDetected.sourcePath,
        mode,
        duplicateHandling: 'merge'
      });
      setMigrationResult(res);
      localStorage.setItem('ar_legacy_migration_dismissed', 'true');
    } catch (err) {
      alert(`Migration failed: ${err.message}`);
    } finally {
      setMigrationLoading(false);
    }
  };

  const handleDismissLegacyModal = () => {
    localStorage.setItem('ar_legacy_migration_dismissed', 'true');
    setShowLegacyModal(false);
  };

  useEffect(() => {
    // Auto-collapse sidebar in POS/Register for Admin
    if (currentView === 'POS') {
      setSidebarOpen(false);
    }
  }, [currentView]);

  const handleLoginSuccess = (u, remember = true) => {
    setUser(u);
    if (remember) {
      localStorage.setItem('ar_pos_user', JSON.stringify(u));
      localStorage.setItem('ar_pos_remember_me', 'true');
      sessionStorage.removeItem('ar_pos_user');
    } else {
      sessionStorage.setItem('ar_pos_user', JSON.stringify(u));
      localStorage.removeItem('ar_pos_user');
      localStorage.removeItem('ar_pos_remember_me');
    }
    setCurrentView(u.role === 'Admin' ? 'Dashboard' : 'POS');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  // If not logged in, show login page
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // --- RENDER CONTENT BY VIEW ---
  const renderContentView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'POS':
        return <POS currentUser={user} />;
      case 'Tables':
        return <TableManagement />;
      case 'Menu':
        return (
          <div style={styles.subViewContainer}>
            <div style={styles.subViewHeader}>
              <button 
                onClick={() => setMenuSubView('Products')}
                style={{ ...styles.subTab, ...(menuSubView === 'Products' ? styles.subTabActive : {}) }}
              >
                Products List
              </button>
              <button 
                onClick={() => setMenuSubView('Categories')}
                style={{ ...styles.subTab, ...(menuSubView === 'Categories' ? styles.subTabActive : {}) }}
              >
                Categories list
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {menuSubView === 'Products' ? <ProductManagement /> : <CategoryManagement />}
            </div>
          </div>
        );
      case 'Sales':
        return (
          <div style={styles.subViewContainer}>
            <div style={styles.subViewHeader}>
              <button 
                onClick={() => setSalesSubView('Invoices')}
                style={{ ...styles.subTab, ...(salesSubView === 'Invoices' ? styles.subTabActive : {}) }}
              >
                Order Invoices
              </button>
              <button 
                onClick={() => setSalesSubView('Returns')}
                style={{ ...styles.subTab, ...(salesSubView === 'Returns' ? styles.subTabActive : {}) }}
              >
                Refunded returns
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {salesSubView === 'Invoices' ? <SalesHistory /> : <Returns />}
            </div>
          </div>
        );
      case 'Inventory':
        return <Inventory />;
      case 'Staff':
        return <StaffManagement />;
      case 'Reports':
        return <Reports />;
      case 'DataExport':
        return <DataExport />;
      case 'Settings':
        return <Settings />;
      default:
        return <POS currentUser={user} />;
    }
  };

  // --- RENDER SHELL BASED ON ROLE ---
  const isAdmin = user.role === 'Admin';

  if (!isAdmin) {
    // Non-Admin (Cashier/Manager) Layout - POS screen only, no sidebar navigation
    return (
      <div style={styles.appShell}>
        {/* Simple Operator Top Header */}
        <div style={styles.cashierHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: settings.logo ? 'transparent' : '#FFEBEE', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Flame size={16} color="#C62828" fill="#C62828" />
              )}
            </div>
            <span style={{ fontWeight: '800', fontSize: '14px', color: '#1F130B' }}>{settings.restaurant_name || 'AR Shinwari Hujra'} POS Terminal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: '#7A695E', fontWeight: '600' }}>
              Cashier: <strong style={{ color: '#1F130B' }}>{user.name}</strong> ({user.role})
            </span>
            <button onClick={handleLogout} style={styles.cashierLogoutBtn}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <POS currentUser={user} />
        </div>

        {/* Non-blocking Sign Out Modal */}
        {showLogoutConfirm && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <h3 style={{ fontWeight: '700', color: '#1F130B' }}>Sign Out Confirmation</h3>
              </div>
              <div style={styles.modalBody}>
                <p style={{ color: '#7A695E', fontSize: '14px', lineHeight: '1.5' }}>
                  Are you sure you want to sign out from the POS system?
                </p>
              </div>
              <div style={styles.modalFooter}>
                <button 
                  onClick={() => setShowLogoutConfirm(false)} 
                  style={styles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    sessionStorage.removeItem('ar_pos_user');
                    localStorage.removeItem('ar_pos_user');
                    localStorage.removeItem('ar_pos_remember_me');
                    setUser(null);
                  }} 
                  style={styles.modalSubmitBtn}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin Layout - Full Sidebar + Navigation
  return (
    <div style={styles.appShell}>
      {/* Sidebar navigation */}
      <div style={{ ...styles.sidebar, width: sidebarOpen ? '240px' : '0px', display: sidebarOpen ? 'flex' : 'none' }}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{
              ...styles.logoCircle,
              backgroundColor: settings.logo ? 'transparent' : '#C62828',
              boxShadow: settings.logo ? 'none' : '0 4px 12px rgba(198, 40, 40, 0.3)',
              overflow: 'hidden'
            }}>
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Flame size={20} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </div>
            <div>
              <h2 style={styles.brandName}>{settings.restaurant_name || 'AR Shinwari'}</h2>
              <p style={styles.brandSub}>Hujra POS</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#A8998F',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Collapse Menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation items */}
        <div style={styles.navMenu}>
          <button 
            onClick={() => setCurrentView('Dashboard')}
            style={{ ...styles.navItem, ...(currentView === 'Dashboard' ? styles.navItemActive : {}) }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('POS')}
            style={{ ...styles.navItem, ...(currentView === 'POS' ? styles.navItemActive : {}) }}
          >
            <Receipt size={18} /> POS / Register
          </button>
          <button 
            onClick={() => setCurrentView('Tables')}
            style={{ ...styles.navItem, ...(currentView === 'Tables' ? styles.navItemActive : {}) }}
          >
            <Layout size={18} /> Tables Layout
          </button>
          <button 
            onClick={() => setCurrentView('Menu')}
            style={{ ...styles.navItem, ...(currentView === 'Menu' ? styles.navItemActive : {}) }}
          >
            <Utensils size={18} /> Menu Catalog
          </button>
          <button 
            onClick={() => setCurrentView('Sales')}
            style={{ ...styles.navItem, ...(currentView === 'Sales' ? styles.navItemActive : {}) }}
          >
            <History size={18} /> Sales History
          </button>
          <button 
            onClick={() => setCurrentView('Inventory')}
            style={{ ...styles.navItem, ...(currentView === 'Inventory' ? styles.navItemActive : {}) }}
          >
            <Boxes size={18} /> Inventory Stock
          </button>
          <button 
            onClick={() => setCurrentView('Staff')}
            style={{ ...styles.navItem, ...(currentView === 'Staff' ? styles.navItemActive : {}) }}
          >
            <Users size={18} /> Staff Profiles
          </button>
          <button 
            onClick={() => setCurrentView('Reports')}
            style={{ ...styles.navItem, ...(currentView === 'Reports' ? styles.navItemActive : {}) }}
          >
            <BarChart3 size={18} /> Sales Reports
          </button>
          <button 
            onClick={() => setCurrentView('DataExport')}
            style={{ ...styles.navItem, ...(currentView === 'DataExport' ? styles.navItemActive : {}) }}
          >
            <FileDown size={18} /> Data Export
          </button>
          <button 
            onClick={() => setCurrentView('Settings')}
            style={{ ...styles.navItem, ...(currentView === 'Settings' ? styles.navItemActive : {}) }}
          >
            <SettingsIcon size={18} /> POS Settings
          </button>
        </div>

        {/* Sidebar Footer */}
        <div style={styles.sidebarFooter}>
          <div style={styles.restaurantInfo}>
            <p style={{ fontWeight: '700', fontSize: '11px', color: '#FAF6F0' }}>AR Shinwari Hujra</p>
            <p style={{ fontSize: '9px', color: '#A8998F', marginTop: '2px' }}>Mor Sambrial</p>
            <p style={{ fontSize: '9px', color: '#A8998F' }}>0300-0333128</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>

      {/* Main content right pane */}
      <div style={{ ...styles.mainContent, marginLeft: sidebarOpen ? '240px' : '0px', display: 'flex', flexDirection: 'column' }}>
        {!sidebarOpen && (
          <div style={{
            height: '44px',
            flexShrink: 0,
            backgroundColor: '#1F130B',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            <button 
              onClick={() => setSidebarOpen(true)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                width: '34px',
                height: '34px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title="Open Menu"
            >
              <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>☰</span>
            </button>
            <span style={{ color: '#FAF6F0', fontWeight: '700', fontSize: '14px', letterSpacing: '-0.2px' }}>
              {settings.restaurant_name || 'AR Shinwari'} — POS
            </span>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {renderContentView()}
        </div>
      </div>

      {/* Non-blocking Sign Out Modal */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontWeight: '700', color: '#1F130B' }}>Sign Out Confirmation</h3>
            </div>
            <div style={styles.modalBody}>
              <p style={{ color: '#7A695E', fontSize: '14px', lineHeight: '1.5' }}>
                Are you sure you want to sign out from the POS system?
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  sessionStorage.removeItem('ar_pos_user');
                  localStorage.removeItem('ar_pos_user');
                  localStorage.removeItem('ar_pos_remember_me');
                  setUser(null);
                }} 
                style={styles.modalSubmitBtn}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Detected Legacy POS Migration Modal */}
      {showLegacyModal && legacyDetected && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '520px', width: '92%' }}>
            <div style={{ ...styles.modalHeader, backgroundColor: '#FAF6F0', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} color="#C62828" />
                <div>
                  <h3 style={{ fontWeight: '800', color: '#1F130B', margin: 0, fontSize: '16px' }}>
                    Previous POS Data Found
                  </h3>
                  <span style={{ fontSize: '11px', color: '#7A695E' }}>
                    Existing catalog detected on this computer
                  </span>
                </div>
              </div>
              <button 
                onClick={handleDismissLegacyModal}
                style={{ background: 'none', border: 'none', fontSize: '16px', color: '#7A695E', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!migrationResult ? (
                <>
                  <p style={{ color: '#4A3B32', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                    We found an existing POS menu and configuration on this PC. You can automatically import the complete menu without manually re-entering products.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', backgroundColor: '#FAF6F0', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#C62828' }}>{legacyDetected.counts.categories}</div>
                      <div style={{ fontSize: '11px', color: '#7A695E', fontWeight: '700' }}>Categories</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#1F130B' }}>{legacyDetected.counts.products}</div>
                      <div style={{ fontSize: '11px', color: '#7A695E', fontWeight: '700' }}>Products</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#2E7D32' }}>{legacyDetected.counts.units}</div>
                      <div style={{ fontSize: '11px', color: '#7A695E', fontWeight: '700' }}>Units</div>
                    </div>
                  </div>

                  {legacyDetected.sampleProducts && legacyDetected.sampleProducts.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#7A695E' }}>
                      <strong>Sample items found:</strong> {legacyDetected.sampleProducts.join(', ')}...
                    </div>
                  )}

                  <div style={{ backgroundColor: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#2E7D32' }}>
                    ✓ <strong>Safe Migration:</strong> An automatic pre-migration backup will be created before importing.
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <CheckCircle2 size={40} color="#2E7D32" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ fontWeight: '800', fontSize: '16px', color: '#1F130B', margin: '0 0 6px' }}>
                    Menu Imported Successfully!
                  </h4>
                  <p style={{ fontSize: '12px', color: '#7A695E', margin: '0 0 14px' }}>
                    Imported {migrationResult.imported.products} products, {migrationResult.imported.categories} categories, and {migrationResult.imported.units} units into the new POS.
                  </p>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px', backgroundColor: '#FAF6F0' }}>
              {!migrationResult ? (
                <>
                  <button 
                    type="button"
                    onClick={handleDismissLegacyModal}
                    style={styles.modalCancelBtn}
                    disabled={migrationLoading}
                  >
                    Start Fresh
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleImportLegacyData('menu_only')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#C62828',
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: '7px',
                      fontWeight: '700',
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    disabled={migrationLoading}
                  >
                    {migrationLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    {migrationLoading ? 'Importing Menu...' : 'Import Previous Menu'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowLegacyModal(false);
                    setCurrentView('POS');
                    window.location.reload();
                  }}
                  style={{
                    backgroundColor: '#2E7D32',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '7px',
                    fontWeight: '700',
                    fontSize: '12px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Open POS Menu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  appShell: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#FAF6F0',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1F130B', // Dark espresso brown
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    borderRight: '1px solid rgba(239, 230, 218, 0.05)',
  },
  brand: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid rgba(239, 230, 218, 0.05)',
  },
  logoCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#C62828', // Crimson Red
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(198, 40, 40, 0.3)',
  },
  brandName: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-0.3px',
  },
  brandSub: {
    fontSize: '11px',
    color: '#A8998F',
    fontWeight: '500',
  },
  navMenu: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#A8998F',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    width: '100%',
  },
  navItemActive: {
    backgroundColor: '#C62828', // Crimson active rounded background
    color: '#FFFFFF',
  },
  sidebarFooter: {
    padding: '16px 12px',
    borderTop: '1px solid rgba(239, 230, 218, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  restaurantInfo: {
    padding: '0 8px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#A8998F',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    width: '100%',
  },
  mainContent: {
    flex: 1,
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    transition: 'margin-left 0.2s ease',
  },
  cashierHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #EFE6DA',
    height: '48px',
    flexShrink: 0,
  },
  cashierLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFEBEE',
    border: '1px solid #FFCDD2',
    color: '#C62828',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  subViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  subViewHeader: {
    display: 'flex',
    backgroundColor: '#FFFFFF',
    padding: '12px 24px 0 24px',
    borderBottom: '1px solid #EFE6DA',
    gap: '20px',
    flexShrink: 0,
  },
  subTab: {
    fontSize: '13px',
    fontWeight: '700',
    padding: '12px 4px',
    color: '#7A695E',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
  },
  subTabActive: {
    color: '#C62828',
    borderColor: '#C62828',
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
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '400px',
    boxShadow: '0 10px 30px rgba(31, 19, 11, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #EFE6DA',
  },
  modalBody: {
    padding: '20px',
  },
  modalFooter: {
    padding: '14px 20px',
    borderTop: '1px solid #EFE6DA',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    backgroundColor: '#FBF8F4',
  },
  modalCancelBtn: {
    padding: '8px 16px',
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
  }
};
