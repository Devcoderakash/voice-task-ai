import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel
}) {
  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-900/50 rounded-2xl shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 id="confirm-delete-title" className="text-base font-bold text-slate-900 dark:text-white">
              Delete Task Confirmation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{taskTitle}"</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/25 transition focus:ring-2 focus:ring-rose-500/50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
