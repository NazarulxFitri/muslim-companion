'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { X, DollarSign, CreditCard, Calendar, CheckCircle2 } from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { isPaymentModalOpen, setPaymentModalOpen, loans, recordPayment, selectedLoanId, currentProfile } = useAppStore();

  const activeLoan = loans.find((l) => l.id === selectedLoanId) || loans[0];

  const defaultAmount = activeLoan
    ? String(activeLoan.monthlyInstallmentAmount || activeLoan.remainingBalance)
    : '120';

  const [formData, setFormData] = useState({
    loanId: activeLoan?.id || '',
    amount: defaultAmount,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'DuitNow Online Transfer',
    referenceNo: 'MBB' + Math.floor(100000000 + Math.random() * 900000000),
    notes: activeLoan?.monthlyInstallmentAmount ? `Monthly installment payment (RM ${activeLoan.monthlyInstallmentAmount})` : 'Repayment installment transferred'
  });

  if (!isPaymentModalOpen || !activeLoan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid repayment amount.');
      return;
    }

    recordPayment({
      loanId: formData.loanId || activeLoan.id,
      amount: amountNum,
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      referenceNo: formData.referenceNo,
      notes: formData.notes,
      createdBy: currentProfile?.name || 'User'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Record Payment Repayment</h2>
              <p className="text-xs text-slate-400">Ref: <span className="font-mono text-emerald-400">{activeLoan.id}</span></p>
            </div>
          </div>
          <button
            onClick={() => setPaymentModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loan Balance Summary Card */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
          <div>
            <p className="text-slate-400">Total Contract Value</p>
            <p className="font-semibold text-slate-200">RM {activeLoan.totalAmountPayable.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Remaining Balance</p>
            <p className="font-extrabold text-amber-400 font-mono text-sm">
              RM {activeLoan.remainingBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Repayment Amount (RM)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-400">RM</span>
              <input
                type="number"
                step="0.01"
                required
                max={activeLoan.remainingBalance}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="DuitNow Online Transfer">DuitNow Transfer</option>
                <option value="Touch 'n Go eWallet">Touch 'n Go eWallet</option>
                <option value="Cash Payment">Cash Payment</option>
                <option value="Bank Deposit">Bank Deposit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Transaction Ref / Receipt No.</label>
            <input
              type="text"
              value={formData.referenceNo}
              onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
              placeholder="e.g. MBB202608271122"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Notes / Description</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Full settlement, installment payment"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Payment Log
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
