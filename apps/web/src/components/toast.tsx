'use client';

import { create } from 'zustand';
import { useEffect, useRef, useState, useCallback } from 'react';

// ── Toast Types ─────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// ── Toast Store (Zustand) ───────────────────

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// ── Convenience helpers ─────────────────────

export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'success', title, message, duration: 4000 }),
  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'error', title, message, duration: 6000 }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'warning', title, message, duration: 5000 }),
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'info', title, message, duration: 4000 }),
};

// ── Icon config ─────────────────────────────

const toastConfig: Record<ToastType, { icon: string; bg: string; border: string; color: string }> =
  {
    success: { icon: '✓', bg: '#f0fdf4', border: '#10B981', color: '#059669' },
    error: { icon: '✕', bg: '#fef2f2', border: '#EF4444', color: '#DC2626' },
    warning: { icon: '⚠', bg: '#fffbeb', border: '#F59E0B', color: '#D97706' },
    info: { icon: 'ℹ', bg: '#eff6ff', border: '#3B82F6', color: '#2563EB' },
  };

// ── Single Toast Item ───────────────────────

function ToastItem({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onClose, 250);
  }, [onClose]);

  useEffect(() => {
    const dur = t.duration ?? 4000;
    timerRef.current = setTimeout(dismiss, dur);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [t.duration, dismiss]);

  const cfg = toastConfig[t.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 18px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `4px solid ${cfg.border}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        minWidth: '320px',
        maxWidth: '420px',
        animation: exiting ? 'toastOut 0.25s forwards' : 'toastIn 0.3s ease-out',
        cursor: 'pointer',
      }}
      onClick={dismiss}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: cfg.border,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {cfg.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: cfg.color,
            marginBottom: t.message ? 2 : 0,
          }}
        >
          {t.title}
        </div>
        {t.message && (
          <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4 }}>{t.message}</div>
        )}
      </div>
      <button
        style={{
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: 0,
          lineHeight: 1,
        }}
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

// ── Toast Container ─────────────────────────

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onClose={() => removeToast(t.id)} />
          </div>
        ))}
      </div>
    </>
  );
}
