import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Delete',
  isLoading = false,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-md p-6 animate-fade-up shadow-2xl">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-white text-lg mb-1">{title}</h3>
          <p className="text-stone-400 text-sm font-body leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-stone-400 hover:text-white text-sm font-body transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-body font-medium rounded-lg transition-colors"
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
