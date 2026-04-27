"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiInfo, FiAlertCircle, FiBell } from 'react-icons/fi';
import { Haptics } from '@/lib/utils/haptics';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // 📳 Mobile Haptics
    if (type === 'success') Haptics.success();
    else if (type === 'error' || type === 'warning') Haptics.error();
    else Haptics.light();
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-80 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 flex gap-3 items-start dir-rtl text-right"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                t.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                t.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                t.type === 'error' ? 'bg-rose-100 text-rose-600' :
                'bg-primary/10 text-primary'
              }`}>
                {t.type === 'success' ? <FiCheckCircle size={20} /> : 
                 t.type === 'warning' ? <FiAlertCircle size={20} /> :
                 t.type === 'error' ? <FiAlertCircle size={20} /> :
                 <FiBell size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm leading-tight">{t.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.message}</p>
              </div>
              <button 
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <FiX size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
