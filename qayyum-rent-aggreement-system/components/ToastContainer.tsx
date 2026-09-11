'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'SUCCESS';
        const isError = toast.type === 'ERROR';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/60 text-emerald-300 shadow-emerald-950/80 ring-1 ring-emerald-500/30'
                : isError
                ? 'bg-slate-900/95 border-rose-500/60 text-rose-300 shadow-rose-950/80 ring-1 ring-rose-500/30'
                : 'bg-slate-900/95 border-blue-500/60 text-blue-300 shadow-blue-950/80 ring-1 ring-blue-500/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
              <span className="leading-snug text-slate-100 text-xs font-bold">{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors ml-3 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

