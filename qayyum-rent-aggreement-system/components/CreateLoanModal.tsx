'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { X, PlusCircle, DollarSign, Calendar, User, FileText, Percent, Lock, Calculator, RefreshCw } from 'lucide-react';

export const CreateLoanModal: React.FC = () => {
  const { isCreateModalOpen, setCreateModalOpen, createLoan, currentProfile } = useAppStore();

  const [formData, setFormData] = useState({
    borrowerName: 'Siti Nurhaliza binti Osman',
    borrowerIc: '920720106642',
    borrowerEmail: 'siti.borrower@example.com',
    borrowerPhone: '178899001',
    borrowerAddress: 'B-12-08, Residensi Park, 57000 Bukit Jalil, KL',
    title: 'Personal Friendly Loan Agreement',
    principalAmount: '5000',
    interestRate: '0',
    repaymentStartDate: new Date().toISOString().split('T')[0],
    repaymentDueDate: '2027-12-31',
    installmentFrequency: 'MONTHLY' as 'LUMP_SUM' | 'MONTHLY',
    purpose: 'Personal support & financial assistance',
    specialConditions: 'Repayment to be paid monthly via online banking transfer to lender account.'
  });

  if (!isCreateModalOpen) return null;

  const principal = parseFloat(formData.principalAmount) || 0;
  const interest = parseFloat(formData.interestRate) || 0;
  const calculatedTotal = principal * (1 + interest / 100);

  // Calculate duration in months between Start Date and Target End Date
  const start = new Date(formData.repaymentStartDate);
  const end = new Date(formData.repaymentDueDate);
  
  let calculatedTenureMonths = 1;
  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    calculatedTenureMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (calculatedTenureMonths <= 0) calculatedTenureMonths = 1; // Minimum 1 month
  }

  // Auto-calculated monthly repayment amount
  const autoMonthlyRepayment = calculatedTenureMonths > 0 ? (calculatedTotal / calculatedTenureMonths) : calculatedTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(principal) || principal <= 0) {
      alert('Please enter a valid loan principal amount.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.borrowerEmail || !emailRegex.test(formData.borrowerEmail.trim())) {
      alert('Please enter a valid borrower email address (e.g. borrower@example.com).');
      return;
    }

    const cleanedIc = formData.borrowerIc.replace(/\D/g, '');
    if (cleanedIc.length !== 12) {
      alert('Borrower IC Number must contain exactly 12 numeric digits (e.g. 920720106642).');
      return;
    }

    const cleanedPhoneDigits = formData.borrowerPhone.replace(/\D/g, '');
    if (!cleanedPhoneDigits || cleanedPhoneDigits.length < 8) {
      alert('Please enter a valid borrower phone number after +60.');
      return;
    }

    createLoan({
      title: formData.title,
      borrowerName: formData.borrowerName,
      borrowerIc: cleanedIc,
      borrowerEmail: formData.borrowerEmail,
      borrowerPhone: `+60${cleanedPhoneDigits}`,
      borrowerAddress: formData.borrowerAddress,
      principalAmount: principal,
      interestRate: interest,
      repaymentStartDate: formData.repaymentStartDate,
      repaymentDueDate: formData.repaymentDueDate,
      installmentFrequency: formData.installmentFrequency,
      monthlyInstallmentAmount: formData.installmentFrequency === 'MONTHLY' ? parseFloat(autoMonthlyRepayment.toFixed(2)) : undefined,
      tenureMonths: formData.installmentFrequency === 'MONTHLY' ? calculatedTenureMonths : undefined,
      purpose: formData.purpose,
      specialConditions: formData.specialConditions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Loan Agreement</h2>
              <p className="text-xs text-slate-400">Lender: <span className="text-slate-200 font-medium">{currentProfile?.name || 'Lender'}</span></p>
            </div>
          </div>
          <button
            onClick={() => setCreateModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Agreement Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Agreement Title / Note
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Personal Friendly Loan Agreement"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Borrower Section */}
          <div className="border border-slate-800 bg-slate-950/40 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4" /> Borrower Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Borrower Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.borrowerName}
                  onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Borrower IC Number <span className="text-slate-500 font-normal">(12 Digits, Numbers Only)</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={formData.borrowerIc}
                  onChange={(e) => setFormData({ ...formData, borrowerIc: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                  placeholder="920720106642"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Borrower Email</label>
                <input
                  type="email"
                  required
                  value={formData.borrowerEmail}
                  onChange={(e) => setFormData({ ...formData, borrowerEmail: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Borrower Phone Number <span className="text-slate-500 font-normal">(Numbers Only)</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-700 focus-within:border-blue-500 bg-slate-800">
                  <div className="bg-slate-900 border-r border-slate-700 px-3 py-2 text-xs font-bold text-cyan-400 flex items-center shrink-0">
                    +60
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.borrowerPhone}
                    onChange={(e) => setFormData({ ...formData, borrowerPhone: e.target.value.replace(/\D/g, '') })}
                    placeholder="178899001"
                    className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Borrower Residential Address</label>
              <input
                type="text"
                required
                value={formData.borrowerAddress}
                onChange={(e) => setFormData({ ...formData, borrowerAddress: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Repayment Schedule Type */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Repayment Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, installmentFrequency: 'MONTHLY' })}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  formData.installmentFrequency === 'MONTHLY'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                Monthly Installment
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, installmentFrequency: 'LUMP_SUM' })}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  formData.installmentFrequency === 'LUMP_SUM'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Lump Sum (One-time)
              </button>
            </div>
          </div>

          {/* Financial & Schedule Dates Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            
            {/* Principal Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Principal Amount (RM)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">RM</span>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Interest Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="18"
                  step="0.5"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Repayment Start Date</label>
              <input
                type="date"
                required
                value={formData.repaymentStartDate}
                onChange={(e) => setFormData({ ...formData, repaymentStartDate: e.target.value })}
                className="w-full bg-slate-800 border border-emerald-500/40 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            {/* Target End Date */}
            <div>
              <label className="block text-xs font-semibold text-blue-400 mb-1">Target End Date</label>
              <input
                type="date"
                required
                value={formData.repaymentDueDate}
                onChange={(e) => setFormData({ ...formData, repaymentDueDate: e.target.value })}
                className="w-full bg-slate-800 border border-blue-500/40 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

          </div>

          {/* Auto-Calculated Monthly Repayment Summary Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Total Amount Payable:</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                RM {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {formData.installmentFrequency === 'MONTHLY' ? (
              <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 p-3.5 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    Auto-Calculated Monthly Repayment:
                  </span>
                  <span className="font-extrabold text-lg text-emerald-400 font-mono">
                    RM {autoMonthlyRepayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Duration: <strong>{calculatedTenureMonths} Month(s)</strong></span>
                  <span className="text-slate-500 italic flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-500" /> Derived from Start & End Date
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-300 text-[11px] flex justify-between">
                <span>Repayment Method: <strong>Lump Sum Single Payment</strong></span>
                <span>Due: <strong>{formData.repaymentDueDate}</strong></span>
              </div>
            )}
          </div>

          {/* Purpose & Special Terms */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Loan Purpose</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g. Friendly personal support"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Special Conditions / Payment Clause</label>
              <textarea
                rows={2}
                value={formData.specialConditions}
                onChange={(e) => setFormData({ ...formData, specialConditions: e.target.value })}
                placeholder="e.g. Borrower shall transfer calculated monthly amount on the 1st of every month via online banking."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Generate & Send Agreement
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
