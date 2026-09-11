'use client';

import React, { useState } from 'react';
import { LoanAgreement } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { 
  FileCheck, 
  Printer, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  FileText 
} from 'lucide-react';

interface LoanAgreementDocumentProps {
  loan: LoanAgreement;
  onClose?: () => void;
}

export const LoanAgreementDocument: React.FC<LoanAgreementDocumentProps> = ({ loan, onClose }) => {
  const { currentProfile, activeRole, signLoanAgreement } = useAppStore();
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const canSign = 
    (activeRole === 'BORROWER' && !loan.borrowerSignature) ||
    (activeRole === 'LENDER' && !loan.lenderSignature);

  const handleSaveSignature = (signatureDataUrl: string) => {
    signLoanAgreement(loan.id, signatureDataUrl);
    setShowSignaturePad(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20">
              {loan.id}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
              loan.status === 'ACTIVE' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : loan.status === 'COMPLETED'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {loan.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-300 mt-1">{loan.title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {canSign && (
            <button
              onClick={() => setShowSignaturePad(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              Sign Agreement Now
            </button>
          )}

          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Signature Pad Modal Overlay */}
      {showSignaturePad && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <DigitalSignaturePad
            signerName={currentProfile?.name || 'Signer'}
            signerRole={activeRole}
            onSave={handleSaveSignature}
            onCancel={() => setShowSignaturePad(false)}
          />
        </div>
      )}

      {/* Main Legal Document Sheet */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-200 font-serif print:shadow-none print:border-none print:p-0">
        
        {/* Document Header */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-sans font-bold tracking-widest text-slate-500 uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Legally Binding Agreement (Malaysia)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 uppercase tracking-tight">
            PEER-TO-PEER LOAN AGREEMENT
          </h1>
          <p className="text-xs font-sans text-slate-600 mt-1">
            Executed pursuant to the Malaysian Contracts Act 1950 (Act 136)
          </p>
          <p className="text-xs font-mono text-slate-500 mt-2">
            Agreement Ref: <strong>{loan.id}</strong> | Date: <strong>{new Date(loan.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </p>
        </div>

        {/* Parties Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm font-sans">
          
          {/* Lender Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider mb-2 border-b pb-1 border-slate-200">
              <User className="w-4 h-4 text-blue-700" />
              Party A: The Lender
            </div>
            <p className="font-bold text-base text-slate-900">{loan.lenderName}</p>
            <p className="text-xs text-slate-600">IC / Passport: <span className="font-mono font-semibold">{loan.lenderIc}</span></p>
            <p className="text-xs text-slate-600">Phone: {loan.lenderPhone}</p>
            <p className="text-xs text-slate-600">Email: {loan.lenderEmail}</p>
            <p className="text-xs text-slate-600 mt-1 italic">Address: {loan.lenderAddress}</p>
          </div>

          {/* Borrower Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-2 border-b pb-1 border-slate-200">
              <User className="w-4 h-4 text-emerald-700" />
              Party B: The Borrower
            </div>
            <p className="font-bold text-base text-slate-900">{loan.borrowerName}</p>
            <p className="text-xs text-slate-600">IC / Passport: <span className="font-mono font-semibold">{loan.borrowerIc}</span></p>
            <p className="text-xs text-slate-600">Phone: {loan.borrowerPhone}</p>
            <p className="text-xs text-slate-600">Email: {loan.borrowerEmail}</p>
            <p className="text-xs text-slate-600 mt-1 italic">Address: {loan.borrowerAddress}</p>
          </div>

        </div>

        {/* Terms Clauses */}
        <div className="space-y-4 text-sm leading-relaxed text-slate-800">
          
          <h3 className="font-bold text-slate-950 border-b border-slate-300 pb-1 font-sans text-xs uppercase tracking-wider">
            1. Principal Loan Amount & Repayment Terms
          </h3>
          
          <div className="bg-slate-950 text-slate-100 p-5 rounded-xl font-sans my-3 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Principal Amount</p>
              <p className="text-xl font-extrabold text-emerald-400 font-mono">RM {loan.principalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Repayment Type</p>
              <p className="text-sm font-extrabold text-white font-sans mt-1">
                {loan.installmentFrequency === 'MONTHLY' ? 'Monthly Installments' : 'Lump Sum'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {loan.installmentFrequency === 'MONTHLY' ? 'Monthly Payment' : 'Total Payable'}
              </p>
              <p className="text-xl font-extrabold text-amber-400 font-mono">
                {loan.monthlyInstallmentAmount 
                  ? `RM ${loan.monthlyInstallmentAmount.toLocaleString()}/mo`
                  : `RM ${loan.totalAmountPayable.toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Start Date</p>
              <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">{loan.repaymentStartDate || 'Immediate'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Target End Date</p>
              <p className="text-base font-extrabold text-white font-mono mt-0.5">{loan.repaymentDueDate}</p>
            </div>
          </div>

          <p>
            <strong>1.1 Loan Provision:</strong> The Lender hereby agrees to advance the Principal Amount of <strong>RM {loan.principalAmount.toLocaleString()}</strong> to the Borrower, and the Borrower acknowledges receipt or pending disbursement thereof.
          </p>
          
          {loan.installmentFrequency === 'MONTHLY' && loan.monthlyInstallmentAmount ? (
            <p>
              <strong>1.2 Monthly Installment Schedule:</strong> The Borrower unconditionally promises to repay the loan in fixed monthly installments of <strong>RM {loan.monthlyInstallmentAmount.toLocaleString()} per month</strong> starting on <strong>{loan.repaymentStartDate || 'the agreed start date'}</strong> for an estimated tenure of <strong>{loan.tenureMonths || Math.ceil(loan.totalAmountPayable / loan.monthlyInstallmentAmount)} months</strong> until the Total Payable Amount of <strong>RM {loan.totalAmountPayable.toLocaleString()}</strong> is fully settled on or before <strong>{loan.repaymentDueDate}</strong>.
            </p>
          ) : (
            <p>
              <strong>1.2 Repayment Obligation:</strong> The Borrower unconditionally promises to repay the Total Payable Amount of <strong>RM {loan.totalAmountPayable.toLocaleString()}</strong> starting from <strong>{loan.repaymentStartDate || 'the agreed start date'}</strong> until final settlement on or before <strong>{loan.repaymentDueDate}</strong> in a single lump sum transfer.
            </p>
          )}

          <h3 className="font-bold text-slate-950 border-b border-slate-300 pb-1 font-sans text-xs uppercase tracking-wider pt-2">
            2. Purpose & Special Conditions
          </h3>
          <p>
            <strong>2.1 Loan Purpose:</strong> {loan.purpose || 'Personal financial assistance'}.
          </p>
          {loan.specialConditions && (
            <p>
              <strong>2.2 Special Terms:</strong> {loan.specialConditions}
            </p>
          )}

          <h3 className="font-bold text-slate-950 border-b border-slate-300 pb-1 font-sans text-xs uppercase tracking-wider pt-2">
            3. Governing Law & Dispute Resolution
          </h3>
          <p>
            <strong>3.1 Law of Malaysia:</strong> This agreement shall be governed by and construed in accordance with the laws of Malaysia (Contracts Act 1950). Both parties submit to the exclusive jurisdiction of Malaysian courts in the event of dispute or default.
          </p>

        </div>

        {/* Digital Signatures Box */}
        <div className="mt-10 pt-6 border-t-2 border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
          
          {/* Lender Signature Box */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 text-center relative">
            <p className="text-xs font-bold uppercase text-slate-600 mb-2">Lender Digital Signature</p>
            {loan.lenderSignature ? (
              <div className="space-y-2">
                <div className="h-20 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-2">
                  <img
                    src={loan.lenderSignature.signatureDataUrl}
                    alt="Lender Signature"
                    className="max-h-16 max-w-full object-contain"
                  />
                </div>
                <div className="text-[11px] text-slate-600 text-left bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                  <p className="font-bold text-emerald-950 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Signed by {loan.lenderSignature.signedBy}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Timestamp: {new Date(loan.lenderSignature.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                Pending Lender Signature
              </div>
            )}
          </div>

          {/* Borrower Signature Box */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 text-center relative">
            <p className="text-xs font-bold uppercase text-slate-600 mb-2">Borrower Digital Signature</p>
            {loan.borrowerSignature ? (
              <div className="space-y-2">
                <div className="h-20 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-2">
                  <img
                    src={loan.borrowerSignature.signatureDataUrl}
                    alt="Borrower Signature"
                    className="max-h-16 max-w-full object-contain"
                  />
                </div>
                <div className="text-[11px] text-slate-600 text-left bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                  <p className="font-bold text-emerald-950 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Signed by {loan.borrowerSignature.signedBy}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Timestamp: {new Date(loan.borrowerSignature.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                Pending Borrower Signature
              </div>
            )}
          </div>

        </div>

        {/* Footer Document Metadata */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
          Generated via PinjamLegal Digital Platform • Hash ID: {loan.id}-{new Date(loan.createdAt).getTime()}
        </div>

      </div>
    </div>
  );
};
