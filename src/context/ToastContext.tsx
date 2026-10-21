import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 4000) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, addToast: showToast }}>
      {children}
      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-20 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl shadow-premium border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-charcoal'
                : toast.type === 'error'
                ? 'bg-white/95 border-rose-200 text-charcoal'
                : toast.type === 'warning'
                ? 'bg-white/95 border-amber-300 text-charcoal'
                : 'bg-white/95 border-gold-300 text-charcoal'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'warning' && (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs leading-relaxed font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-charcoal-400 hover:text-charcoal p-0.5 rounded transition-colors"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
