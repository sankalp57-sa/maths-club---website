// ============================================================
// MathClub Nexus — Confirmation Dialog
// ============================================================

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-panel border-cyan-500/30 rounded-3xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle size={20} />
              </div>
            )}
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-cyan-400 hover:bg-cyan-300 text-[#050B16] shadow-[0_0_15px_rgba(0,217,245,0.4)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
