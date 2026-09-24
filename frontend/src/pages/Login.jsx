import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Flame, Lock, User, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [restaurantName, setRestaurantName] = useState('AR Shinwari Hujra');

  useEffect(() => {
    api.getSettings().then(s => {
      if (s) {
        if (s.logo) setLogo(s.logo);
        if (s.restaurant_name) setRestaurantName(s.restaurant_name);
      }
    }).catch(err => console.error("Error loading logo for login:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await api.login(username, password);
      onLoginSuccess(user, rememberMe);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Amber Glow */}
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      <div style={styles.card} className="animate-fade-in">
        <div style={styles.header}>
          <div style={{
            ...styles.logoContainer,
            backgroundColor: logo ? 'transparent' : '#D32F2F',
            boxShadow: logo ? 'none' : '0 8px 24px rgba(211, 47, 47, 0.4)',
            overflow: 'hidden'
          }}>
            {logo ? (
              <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Flame size={36} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </div>
          <h1 style={styles.title}>{restaurantName}</h1>
          <p style={styles.subtitle}>Restaurant Management & POS</p>
        </div>

        {error && (
          <div style={styles.errorContainer}>
            <AlertCircle size={18} color="#D32F2F" />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          {/* Remember Me Option */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 12px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', color: '#D6C8BE', fontSize: '13px' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#D32F2F', cursor: 'pointer' }}
                disabled={loading}
              />
              <span>Remember Me</span>
            </label>
            <span style={{ fontSize: '11px', color: '#8C7B70' }}>Keep me logged in</span>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>© 2026 AR Shinwari Hujra Sambrial</p>
          <p style={{ marginTop: '4px', fontSize: '11px', opacity: 0.6 }}>Developed by Rana Zohaik</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0F0906', // Deep espresso dark background
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(211, 47, 47, 0.25) 0%, transparent 70%)',
    top: '-10%',
    left: '-10%',
  },
  glow2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
    bottom: '-10%',
    right: '-10%',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '400px',
    padding: '40px',
    borderRadius: '24px',
    backgroundColor: 'rgba(31, 19, 11, 0.65)', // Semitransparent dark brown
    border: '1px solid rgba(239, 230, 218, 0.08)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
  },
  logoContainer: {
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    backgroundColor: '#D32F2F',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
    boxShadow: '0 8px 24px rgba(211, 47, 47, 0.4)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '-0.5px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '13px',
    color: '#A8998F',
    marginTop: '4px',
    textAlign: 'center',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    border: '1px solid rgba(211, 47, 47, 0.2)',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  errorText: {
    color: '#FF8A80',
    fontSize: '13px',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#D4C9C1',
    letterSpacing: '0.2px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#A8998F',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#F59E0B', // Vibrant amber
    color: '#1F130B',
    fontSize: '15px',
    fontWeight: '700',
    borderRadius: '12px',
    border: 'none',
    marginTop: '10px',
    boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)',
    transition: 'all 0.2s ease',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    color: '#7A695E',
    fontSize: '12px',
  }
};
