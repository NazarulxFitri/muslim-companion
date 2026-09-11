'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAppStore } from '@/lib/store';
import { LoanStatus, LoanAgreement, UserProfile } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LoanAgreementDocument } from '@/components/LoanAgreementDocument';
import { CreateLoanModal } from '@/components/CreateLoanModal';
import { PaymentModal } from '@/components/PaymentModal';
import { NotificationCenter } from '@/components/NotificationCenter';
import { AuthModal } from '@/components/AuthModal';
import { ProfileModal } from '@/components/ProfileModal';
import { 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  DollarSign, 
  AlertCircle, 
  UserCheck, 
  ChevronRight, 
  ArrowUpRight, 
  FileCheck, 
  Calendar,
  Layers,
  Building2,
  Wallet,
  Shield,
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function Dashboard() {
  const { 
    currentProfile, 
    activeRole, 
    isAuthenticated,
    authLoading,
    loans, 
    payments,
    selectedLoanId, 
    setSelectedLoanId, 
    setCreateModalOpen, 
    setPaymentModalOpen,
    setAuthModalOpen,
    setAuthenticatedUser
  } = useAppStore();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Subscribe to Firebase Auth in React Lifecycle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const profileData: UserProfile = {
          uid: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User Account',
          email: user.email || '',
          icNumber: '900101145521',
          phone: '+60123456789',
          address: 'Kuala Lumpur, Malaysia',
          role: 'LENDER'
        };

        // Unlock dashboard INSTANTLY in 0ms
        setAuthenticatedUser(profileData, false);

        // Background sync Firestore
        getDoc(doc(db, 'users', user.uid)).then((userDoc) => {
          if (userDoc.exists()) {
            useAppStore.setState((state) => ({
              currentProfile: { ...profileData, ...(userDoc.data() as UserProfile) }
            }));
          }
        }).catch(() => {});
      } else {
        useAppStore.setState({
          currentProfile: null,
          isAuthenticated: false,
          authLoading: false
        });
      }
    });

    return () => unsubscribe();
  }, [setAuthenticatedUser]);

  const isLender = activeRole === 'LENDER';

  // Loading Screen while Firebase Auth restores session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-400">Loading PinjamLegal Engine...</p>
      </div>
    );
  }

  // AUTHENTICATION GATE: If user is not logged in, show Auth Landing / Login Page
  if (!isAuthenticated || !currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col font-sans">
        
        {/* Simple Header */}
        <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">
                Pinjam<span className="text-blue-400">Legal</span>
              </span>
              <p className="text-[11px] text-slate-400">Malaysian P2P Loan Agreement System</p>
            </div>
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs p-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            title="Sign In / Register"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Sign In / Register</span>
          </button>
        </header>

        {/* Hero Landing */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-8">
          
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Governed by Contracts Act 1950 (Malaysia)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white max-w-3xl leading-tight tracking-tight">
            Legally Binding <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Peer-to-Peer Loan</span> Agreements
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Draft, sign, and manage personal loan agreements with legal validity, automated repayment notifications, and complete digital signature audit records.
          </p>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
            >
              <LogIn className="w-5 h-5" />
              <span>Get Started & Sign In</span>
            </button>
          </div>

          {/* Core Advantages Grid */}
          <div className="w-full pt-12 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Why PinjamLegal?</h2>
              <p className="text-xl font-bold text-white">Built for Complete Legal Clarity & Peace of Mind</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              
              {/* Advantage 1: Dual-Party Signed Document */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 p-6 rounded-3xl space-y-3.5 transition-all shadow-xl">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Dual-Party Signed & Binding Contracts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fully executed and digitally signed by both Lender and Borrower with legal validity, verified IC identification, and timestamped audit trails.
                </p>
              </div>

              {/* Advantage 2: Automated Notification Reminders */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 p-6 rounded-3xl space-y-3.5 transition-all shadow-xl">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Automated Repayment Reminders</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated scheduled alerts notify borrowers before installment due dates so neither party ever has to manually ask or chase for repayments.
                </p>
              </div>

              {/* Advantage 3: Protected Under Malaysian Law */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 p-6 rounded-3xl space-y-3.5 transition-all shadow-xl">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Protected Under Malaysian Law</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Drafted under the Contracts Act 1950 of Malaysia, providing clear legal framework, transparent interest terms, and legally enforceable protection.
                </p>
              </div>

            </div>
          </div>

        </main>

        <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
          PinjamLegal • Malaysian Peer-to-Peer Loan Agreement System
        </footer>

        <AuthModal />
      </div>
    );
  }

  // Filter loans relevant to current authenticated user
  const relevantLoans = loans.filter((loan) => {
    if (isLender) {
      return loan.lenderEmail === currentProfile.email || loan.lenderName === currentProfile.name;
    } else {
      return loan.borrowerEmail === currentProfile.email || loan.borrowerName === currentProfile.name;
    }
  });

  const filteredLoans = relevantLoans.filter((loan) => {
    if (statusFilter === 'PENDING') return loan.status.includes('PENDING');
    if (statusFilter === 'ACTIVE') return loan.status === 'ACTIVE';
    if (statusFilter === 'COMPLETED') return loan.status === 'COMPLETED';
    return true;
  });

  const selectedLoan = loans.find((l) => l.id === selectedLoanId) || loans[0];

  // Calculate Summary Stats
  const totalPrincipal = relevantLoans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalRemaining = relevantLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const pendingCount = relevantLoans.filter((l) => l.status.includes('PENDING')).length;
  const activeCount = relevantLoans.filter((l) => l.status === 'ACTIVE').length;

  const handleOpenDocument = (loanId: string) => {
    setSelectedLoanId(loanId);
    setIsDocumentModalOpen(true);
  };

  const handleOpenPaymentForLoan = (loanId: string) => {
    setSelectedLoanId(loanId);
    setPaymentModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 selection:bg-blue-500 selection:text-white ${
      isLender 
        ? 'bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950 text-slate-100' 
        : 'bg-gradient-to-b from-emerald-950 via-slate-950 to-slate-950 text-slate-100'
    }`}>
      
      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner / User Persona Indicator - DYNAMIC THEME */}
        <div className={`relative overflow-hidden border rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-500 ${
          isLender 
            ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border-blue-400/50 shadow-blue-900/50' 
            : 'bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 border-emerald-400/50 shadow-emerald-900/50'
        }`}>
          <div className={`absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
            isLender ? 'bg-cyan-500/25' : 'bg-emerald-500/25'
          }`} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 border shadow-md ${
                  isLender 
                    ? 'bg-blue-500/20 text-blue-200 border-blue-400/50 shadow-blue-500/20'
                    : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50 shadow-emerald-500/20'
                }`}>
                  {isLender ? (
                    <>
                      <Building2 className="w-4 h-4 text-cyan-300" />
                      LENDER (Creditor)
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 text-emerald-300" />
                      BORROWER (Debtor)
                    </>
                  )}
                </span>
                <span className="text-xs text-slate-300 font-mono">• Active Authenticated Session</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2.5 tracking-tight">
                Welcome back, {currentProfile.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                {isLender
                  ? 'Lender: Issue legally-enforceable peer-to-peer loan agreements, specify start dates, and track portfolio repayments.'
                  : 'Borrower: Review loan contracts sent to you, digitally sign agreements, and manage your payment schedule.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isLender && (
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/40 flex items-center space-x-2 cursor-pointer border border-blue-400/40"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Loan Agreement</span>
                </button>
              )}

              <button
                onClick={() => setPaymentModalOpen(true)}
                className={`font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all shadow-lg flex items-center space-x-2 cursor-pointer text-white border ${
                  isLender
                    ? 'bg-slate-900/80 hover:bg-slate-800 border-blue-400/40 text-blue-200'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/40 border-emerald-400/40'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className={`p-5 rounded-2xl shadow-xl transition-all border ${
            isLender 
              ? 'bg-blue-950/40 border-blue-800/50 hover:border-blue-500/60' 
              : 'bg-emerald-950/40 border-emerald-800/50 hover:border-emerald-500/60'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>{isLender ? 'Total Amount Lent' : 'Total Amount Borrowed'}</span>
              <DollarSign className={`w-4 h-4 ${isLender ? 'text-cyan-400' : 'text-emerald-400'}`} />
            </div>
            <p className={`text-2xl font-extrabold font-mono ${isLender ? 'text-cyan-300' : 'text-emerald-300'}`}>
              RM {totalPrincipal.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Across {relevantLoans.length} total agreements</p>
          </div>

          <div className={`p-5 rounded-2xl shadow-xl transition-all border ${
            isLender ? 'bg-slate-900/80 border-blue-900/40' : 'bg-slate-900/80 border-emerald-900/40'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Outstanding Balance</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">
              RM {totalRemaining.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">{activeCount} active ongoing loans</p>
          </div>

          <div className={`p-5 rounded-2xl shadow-xl transition-all border ${
            isLender ? 'bg-slate-900/80 border-blue-900/40' : 'bg-slate-900/80 border-emerald-900/40'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Pending Signatures</span>
              <FileCheck className={`w-4 h-4 ${isLender ? 'text-blue-400' : 'text-emerald-400'}`} />
            </div>
            <p className={`text-2xl font-extrabold font-mono ${isLender ? 'text-blue-400' : 'text-emerald-400'}`}>
              {pendingCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Requires digital signature</p>
          </div>

          <div className={`p-5 rounded-2xl shadow-xl transition-all border ${
            isLender ? 'bg-slate-900/80 border-blue-900/40' : 'bg-slate-900/80 border-emerald-900/40'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Compliance Framework</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4" /> Contracts Act 1950
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Legally sound & enforceable</p>
          </div>

        </div>

        {/* Loan List & Filter Tabs */}
        <div className={`rounded-3xl p-6 shadow-2xl border space-y-6 transition-all ${
          isLender 
            ? 'bg-blue-950/20 border-blue-900/40' 
            : 'bg-emerald-950/20 border-emerald-900/40'
        }`}>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className={`w-5 h-5 ${isLender ? 'text-cyan-400' : 'text-emerald-400'}`} />
                Loan Agreements ({filteredLoans.length})
              </h2>
              <p className="text-xs text-slate-400">Select any agreement to view legal contract or record payments</p>
            </div>

            {/* Filter Pills */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === filter
                      ? isLender
                        ? 'bg-blue-600/40 text-cyan-300 border border-blue-400/40 shadow-sm'
                        : 'bg-emerald-600/40 text-emerald-300 border border-emerald-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLoans.length === 0 ? (
              <div className="col-span-full text-center py-16 text-slate-500 space-y-3">
                <FileText className={`w-12 h-12 mx-auto ${isLender ? 'text-blue-500/40' : 'text-emerald-500/40'}`} />
                <p className="text-sm font-semibold text-slate-300">No agreements found in your account.</p>
                {isLender && (
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Your First Agreement</span>
                  </button>
                )}
              </div>
            ) : (
              filteredLoans.map((loan) => {
                const isPendingMySignature = 
                  (activeRole === 'BORROWER' && !loan.borrowerSignature) ||
                  (activeRole === 'LENDER' && !loan.lenderSignature);

                return (
                  <div
                    key={loan.id}
                    className={`bg-slate-900/90 border rounded-2xl p-5 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden ${
                      isPendingMySignature 
                        ? 'border-amber-500/60 bg-slate-900/95 shadow-amber-500/10' 
                        : isLender
                        ? 'border-blue-900/50 hover:border-blue-500/50'
                        : 'border-emerald-900/50 hover:border-emerald-500/50'
                    }`}
                  >
                    {isPendingMySignature && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase px-3 py-0.5 rounded-bl-xl shadow-md">
                        Action Required: Sign Now
                      </div>
                    )}

                    <div className="space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                          isLender
                            ? 'text-cyan-400 bg-blue-950/80 border-blue-500/30'
                            : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30'
                        }`}>
                          {loan.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          loan.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : loan.status === 'COMPLETED'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {loan.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-100 line-clamp-1">
                        {loan.title}
                      </h3>

                      <div className="text-xs text-slate-400 space-y-1">
                        <p><span className="text-slate-500">Lender:</span> <strong className="text-slate-200">{loan.lenderName}</strong></p>
                        <p><span className="text-slate-500">Borrower:</span> <strong className="text-slate-200">{loan.borrowerName}</strong></p>
                      </div>

                      {/* Amounts */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs font-mono">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-sans">Principal</p>
                          <p className="font-bold text-slate-200">RM {loan.principalAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-sans">Remaining</p>
                          <p className="font-extrabold text-amber-400">RM {loan.remainingBalance.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Due Date & Interest */}
                      <div className="flex flex-col gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <span className={`flex items-center gap-1 font-semibold ${isLender ? 'text-cyan-400' : 'text-emerald-400'}`}>
                            <Calendar className="w-3.5 h-3.5" /> Start: {loan.repaymentStartDate || 'Immediate'}
                          </span>
                          <span>Due: {loan.repaymentDueDate}</span>
                        </div>
                        {loan.monthlyInstallmentAmount && (
                          <div className="text-right text-slate-300 font-semibold">
                            RM {loan.monthlyInstallmentAmount.toLocaleString()} / month ({loan.tenureMonths || Math.ceil(loan.totalAmountPayable / loan.monthlyInstallmentAmount)} mos)
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex gap-2">
                      <button
                        onClick={() => handleOpenDocument(loan.id)}
                        className={`flex-1 text-slate-200 text-xs font-semibold py-2 rounded-xl border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          isLender
                            ? 'bg-blue-950/50 hover:bg-blue-900/60 border-blue-800/50'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                        }`}
                      >
                        <FileText className={`w-3.5 h-3.5 ${isLender ? 'text-cyan-400' : 'text-emerald-400'}`} />
                        View Agreement
                      </button>

                      {loan.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleOpenPaymentForLoan(loan.id)}
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-500/30 transition-colors cursor-pointer"
                          title="Record Repayment"
                        >
                          Pay
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950/80 text-center text-xs text-slate-500">
        <p>PinjamLegal • Malaysian Peer-to-Peer Loan Agreement & Payment Management System</p>
        <p className="text-[10px] text-slate-600 mt-1">Built with Next.js, Firebase & PWA Web Push Alerts</p>
      </footer>

      {/* Full Document View Modal */}
      {isDocumentModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex justify-center">
          <div className="max-w-4xl w-full my-auto relative">
            <button
              onClick={() => setIsDocumentModalOpen(false)}
              className="absolute -top-10 right-0 bg-slate-800 text-slate-300 hover:text-white px-3 py-1 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              ✕ Close Document
            </button>
            <LoanAgreementDocument loan={selectedLoan} onClose={() => setIsDocumentModalOpen(false)} />
          </div>
        </div>
      )}

      {/* App Modals, Toast Container & Notification Drawer */}
      <CreateLoanModal />
      <PaymentModal />
      <NotificationCenter />
      <AuthModal />
      <ProfileModal />

    </div>
  );
}
