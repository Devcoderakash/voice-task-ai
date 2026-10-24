import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, Mic, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    voice: <Mic className="w-5 h-5 text-brand-500 shrink-0 animate-pulse" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-brand-900/60 shadow-xl dark:shadow-purple-950/40 rounded-xl max-w-md">
      {icons[toast.type] || icons.info}
      <div className="flex-1 pr-2">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {toast.title || 'Voice Task AI'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
