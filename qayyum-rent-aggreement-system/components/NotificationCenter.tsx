'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { 
  X, 
  Bell, 
  Clock, 
  CheckCheck, 
  Send, 
  AlertTriangle, 
  Calendar, 
  FileSignature 
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { 
    isNotificationCenterOpen, 
    setNotificationCenterOpen, 
    notifications, 
    markNotificationAsRead, 
    triggerTestReminder,
    selectedLoanId,
    loans
  } = useAppStore();

  if (!isNotificationCenterOpen) return null;

  const currentLoanId = selectedLoanId || loans[0]?.id || 'LN-2026-001';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl text-slate-100 animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Notifications & Alerts</h2>
              <p className="text-[11px] text-slate-400">Scheduled reminders & status changes</p>
            </div>
          </div>
          <button
            onClick={() => setNotificationCenterOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Web Push Notification Test Triggers Box */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Simulation Controls
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Test Reminders for {currentLoanId}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              onClick={() => triggerTestReminder(currentLoanId, '1_MONTH')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded-lg border border-slate-700 transition-colors font-medium cursor-pointer"
            >
              1 Month Due
            </button>
            <button
              onClick={() => triggerTestReminder(currentLoanId, '1_WEEK')}
              className="bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 py-1.5 px-2 rounded-lg border border-amber-500/30 transition-colors font-medium cursor-pointer"
            >
              1 Week Due
            </button>
            <button
              onClick={() => triggerTestReminder(currentLoanId, '1_DAY')}
              className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 py-1.5 px-2 rounded-lg border border-rose-500/30 transition-colors font-medium cursor-pointer"
            >
              1 Day Due 🔥
            </button>
          </div>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-100 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${n.read ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'}`} />
                    <h3 className="text-xs font-bold text-slate-200">{n.title}</h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-xs mt-1.5 text-slate-300 leading-relaxed">{n.message}</p>

                {n.loanId && (
                  <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
                    {n.loanId}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
