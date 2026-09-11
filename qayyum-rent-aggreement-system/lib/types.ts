export type UserRole = 'LENDER' | 'BORROWER';

export type LoanStatus = 
  | 'DRAFT'
  | 'PENDING_BORROWER_SIGNATURE'
  | 'PENDING_LENDER_SIGNATURE'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface DigitalSignature {
  signedBy: string; // User Name
  signedByEmail: string;
  role: UserRole;
  signatureDataUrl: string; // Base64 signature canvas or styled text signature
  timestamp: string;
  ipAddress?: string;
}

export interface PaymentRecord {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNo?: string;
  notes?: string;
  createdBy: string; // email or name
  createdAt: string;
}

export interface LoanAgreement {
  id: string;
  title: string;
  
  // Lender Details
  lenderName: string;
  lenderIc: string;
  lenderEmail: string;
  lenderPhone: string;
  lenderAddress: string;

  // Borrower Details
  borrowerName: string;
  borrowerIc: string;
  borrowerEmail: string;
  borrowerPhone: string;
  borrowerAddress: string;

  // Financial Terms
  principalAmount: number; // e.g. 5000 (MYR)
  interestRate: number; // Percentage per annum or total, e.g. 0 or 5%
  totalAmountPayable: number;
  repaymentStartDate?: string; // YYYY-MM-DD (e.g. 2026-09-01)
  repaymentDueDate: string; // YYYY-MM-DD
  installmentFrequency: 'LUMP_SUM' | 'MONTHLY' | 'WEEKLY';
  monthlyInstallmentAmount?: number; // e.g. 120 MYR/month
  tenureMonths?: number; // e.g. 42 months

  // Special terms / legal purpose
  purpose?: string;
  governingLaw: string; // e.g. "Laws of Malaysia (Contracts Act 1950)"
  specialConditions?: string;

  // Status & Signatures
  status: LoanStatus;
  lenderSignature?: DigitalSignature;
  borrowerSignature?: DigitalSignature;
  
  // Amounts tracked
  amountPaid: number;
  remainingBalance: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  icNumber: string;
  phone: string;
  address: string;
  role: UserRole; // Default primary role
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'SIGNATURE_REQUEST' | 'PAYMENT_REMINDER' | 'PAYMENT_RECEIVED' | 'LOAN_ACTIVATED' | 'LOAN_COMPLETED';
  loanId?: string;
  read: boolean;
  createdAt: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
}
