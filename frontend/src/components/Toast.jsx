import React, { useState, useCallback, useEffect, useRef } from 'react';

// ──────────────────────────────────────────────────────────────
//  Toast Component  –  Non-blocking feedback for all admin pages
//  Usage:
//    const { showToast, ToastContainer } = useToast();
//    showToast('Changes saved!', 'success');   // 'success' | 'error' | 'warning' | 'info'
//    …render <ToastContainer /> anywhere in the JSX
// ──────────────────────────────────────────────────────────────

const TOAST_DURATION = 3500; // ms

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const COLORS = {
  success: { bg: '#1B5E20', border: '#2E7D32', icon: '#A5D6A7' },
  error:   { bg: '#B71C1C', border: '#C62828', icon: '#FFCDD2' },
  warning: { bg: '#E65100', border: '#EF6C00', icon: '#FFE0B2' },
  info:    { bg: '#1565C0', border: '#1976D2', icon: '#BBDEFB' },
};

function ToastItem({ id, message, type, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const exitTimerRef = useRef(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    exitTimerRef.current = setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, TOAST_DURATION);
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(exitTimerRef.current);
    };
  }, [dismiss]);

  const colors = COLORS[type] || COLORS.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        minWidth: '280px',
        maxWidth: '380px',
        cursor: 'pointer',
        transform: exiting ? 'translateX(420px)' : 'translateX(0)',
        opacity: exiting ? 0 : 1,
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
        animation: 'toastSlideIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards',
      }}
      onClick={dismiss}
      role="alert"
    >
      {/* Icon badge */}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '900',
        color: colors.icon,
        flexShrink: 0,
      }}>
        {ICONS[type] || ICONS.info}
      </div>

      {/* Message */}
      <span style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: '1.4',
        flex: 1,
      }}>
        {message}
      </span>

      {/* Dismiss X */}
      <span style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '700',
        flexShrink: 0,
      }}>✕</span>
    </div>
  );
}

// Container that renders all toasts stacked at bottom-right
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(420px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 9999,
        pointerEvents: 'none', // Let clicks fall through to the page normally
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem id={t.id} message={t.message} type={t.type} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </>
  );
}

// Hook — returns showToast function and the ToastContainer element
let _toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++_toastId;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ToastContainerEl = <ToastContainer toasts={toasts} onDismiss={dismissToast} />;

  return { showToast, ToastContainerEl };
}
