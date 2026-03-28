import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const show = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 3.5s
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 3500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border max-w-sm transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${
        toast.type === 'success'
          ? 'bg-white border-emerald-200 text-stone-800'
          : 'bg-white border-red-200 text-stone-800'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-500 flex-shrink-0" />
      )}
      <p className="font-body text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-stone-400 hover:text-stone-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    {toasts.map((t) => (
      <Toast key={t.id} toast={t} onDismiss={onDismiss} />
    ))}
  </div>
);

export default Toast;
