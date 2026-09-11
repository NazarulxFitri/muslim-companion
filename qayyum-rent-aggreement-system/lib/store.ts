import { create } from 'zustand';
import { LoanAgreement, PaymentRecord, AppNotification, UserProfile, UserRole, LoanStatus, DigitalSignature, ToastItem } from './types';
import { auth, db } from './firebase';
import { signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AppState {
  currentProfile: UserProfile | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  authLoading: boolean;
  loans: LoanAgreement[];
  payments: PaymentRecord[];
  notifications: AppNotification[];
  toasts: ToastItem[];
  selectedLoanId: string | null;
  
  // Modal Visibility
  isCreateModalOpen: boolean;
  isPaymentModalOpen: boolean;
  isNotificationCenterOpen: boolean;
  isAuthModalOpen: boolean;
  isProfileModalOpen: boolean;
  
  // Actions
  switchRole: (role: UserRole) => void;
  setSelectedLoanId: (id: string | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  setPaymentModalOpen: (open: boolean) => void;
  setNotificationCenterOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  
  // Toast actions
  showToast: (message: string, type?: 'SUCCESS' | 'ERROR' | 'INFO') => void;
  removeToast: (id: string) => void;

  // Auth actions
  setAuthenticatedUser: (profile: UserProfile, notify?: boolean) => void;
  signOutUser: () => Promise<void>;
  
  // Data actions
  createLoan: (loanData: Partial<LoanAgreement>) => void;
  signLoanAgreement: (loanId: string, signatureDataUrl: string) => void;
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  triggerTestReminder: (loanId: string, alertTiming: '1_MONTH' | '1_WEEK' | '1_DAY') => void;
  resetAllRecords: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentProfile: null,
  activeRole: 'LENDER',
  isAuthenticated: false,
  authLoading: true,
  loans: [],
  payments: [],
  notifications: [],
  toasts: [],
  selectedLoanId: null,
  
  isCreateModalOpen: false,
  isPaymentModalOpen: false,
  isNotificationCenterOpen: false,
  isAuthModalOpen: false,
  isProfileModalOpen: false,

  showToast: (message, type = 'SUCCESS') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { id, message, type };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  switchRole: (role: UserRole) => {
    set({ activeRole: role });
    get().showToast(`Switched to ${role === 'LENDER' ? 'Lender' : 'Borrower'}`, 'INFO');
  },

  setSelectedLoanId: (id: string | null) => set({ selectedLoanId: id }),
  setCreateModalOpen: (open: boolean) => set({ isCreateModalOpen: open }),
  setPaymentModalOpen: (open: boolean) => set({ isPaymentModalOpen: open }),
  setNotificationCenterOpen: (open: boolean) => set({ isNotificationCenterOpen: open }),
  setAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open }),
  setProfileModalOpen: (open: boolean) => set({ isProfileModalOpen: open }),

  setAuthenticatedUser: (profile: UserProfile, notify = true) => {
    set({
      currentProfile: profile,
      activeRole: profile.role || 'LENDER',
      isAuthenticated: true,
      authLoading: false,
      isAuthModalOpen: false
    });
    if (notify) {
      get().showToast(`Welcome ${profile.name}! Login successful.`, 'SUCCESS');
    }
  },

  signOutUser: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
    set({
      currentProfile: null,
      activeRole: 'LENDER',
      isAuthenticated: false,
      authLoading: false,
      loans: [],
      payments: [],
      notifications: [],
      selectedLoanId: null,
    });
    get().showToast('Logged out successfully.', 'INFO');
  },

  createLoan: (loanData) => {
    const state = get();
    if (!state.currentProfile) {
      state.showToast('Failed to create loan: User not logged in.', 'ERROR');
      return;
    }

    const newId = `LN-2026-${String(state.loans.length + 1).padStart(3, '0')}`;
    const principal = Number(loanData.principalAmount || 0);
    const interest = Number(loanData.interestRate || 0);
    const totalPayable = principal + (principal * (interest / 100));

    const newLoan: LoanAgreement = {
      id: newId,
      title: loanData.title || `Loan for ${loanData.borrowerName}`,
      
      lenderName: state.currentProfile.name,
      lenderIc: state.currentProfile.icNumber,
      lenderEmail: state.currentProfile.email,
      lenderPhone: state.currentProfile.phone,
      lenderAddress: state.currentProfile.address,

      borrowerName: loanData.borrowerName || 'Borrower Name',
      borrowerIc: loanData.borrowerIc || '000000-00-0000',
      borrowerEmail: loanData.borrowerEmail || 'borrower@example.com',
      borrowerPhone: loanData.borrowerPhone || '+6012-0000000',
      borrowerAddress: loanData.borrowerAddress || 'Malaysia',

      principalAmount: principal,
      interestRate: interest,
      totalAmountPayable: totalPayable,
      repaymentStartDate: loanData.repaymentStartDate || new Date().toISOString().split('T')[0],
      repaymentDueDate: loanData.repaymentDueDate || '2026-12-31',
      installmentFrequency: loanData.installmentFrequency || 'LUMP_SUM',
      monthlyInstallmentAmount: loanData.monthlyInstallmentAmount,
      tenureMonths: loanData.tenureMonths,

      purpose: loanData.purpose || 'Personal friendly loan',
      governingLaw: 'Laws of Malaysia (Contracts Act 1950)',
      specialConditions: loanData.specialConditions || 'None',

      status: 'PENDING_BORROWER_SIGNATURE',
      lenderSignature: {
        signedBy: state.currentProfile.name,
        signedByEmail: state.currentProfile.email,
        role: 'LENDER',
        signatureDataUrl: loanData.lenderSignature?.signatureDataUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="cursive" font-size="24" fill="%231e3a8a">Lender Signed</text></svg>',
        timestamp: new Date().toISOString(),
        ipAddress: '203.106.12.44'
      },
      amountPaid: 0,
      remainingBalance: totalPayable,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      userId: loanData.borrowerEmail || 'borrower',
      title: 'New Loan Agreement Received',
      message: `${state.currentProfile.name} initiated a loan agreement for RM ${principal.toLocaleString()}. Please review and sign.`,
      type: 'SIGNATURE_REQUEST',
      loanId: newId,
      read: false,
      createdAt: new Date().toISOString()
    };

    set({
      loans: [newLoan, ...state.loans],
      selectedLoanId: newId,
      isCreateModalOpen: false,
      notifications: [newNotif, ...state.notifications]
    });

    state.showToast(`Loan agreement ${newId} created successfully!`, 'SUCCESS');
  },

  signLoanAgreement: (loanId: string, signatureDataUrl: string) => {
    const state = get();
    if (!state.currentProfile) {
      state.showToast('Failed to sign: User not logged in.', 'ERROR');
      return;
    }

    const updatedLoans = state.loans.map((loan) => {
      if (loan.id !== loanId) return loan;

      const signature: DigitalSignature = {
        signedBy: state.currentProfile!.name,
        signedByEmail: state.currentProfile!.email,
        role: state.activeRole,
        signatureDataUrl,
        timestamp: new Date().toISOString(),
        ipAddress: '175.143.60.12'
      };

      const isLender = state.activeRole === 'LENDER';
      const newLenderSig = isLender ? signature : loan.lenderSignature;
      const newBorrowerSig = !isLender ? signature : loan.borrowerSignature;

      const isFullySigned = Boolean(newLenderSig && newBorrowerSig);
      const newStatus: LoanStatus = isFullySigned ? 'ACTIVE' : (isLender ? 'PENDING_BORROWER_SIGNATURE' : 'PENDING_LENDER_SIGNATURE');

      return {
        ...loan,
        lenderSignature: newLenderSig,
        borrowerSignature: newBorrowerSig,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
    });

    const notifMessage = `${state.currentProfile.name} has digitally signed loan contract #${loanId}. Status is now ACTIVE.`;
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      userId: 'system',
      title: 'Agreement Signed & Activated',
      message: notifMessage,
      type: 'LOAN_ACTIVATED',
      loanId,
      read: false,
      createdAt: new Date().toISOString()
    };

    set({
      loans: updatedLoans,
      notifications: [newNotif, ...state.notifications]
    });

    state.showToast(`Agreement #${loanId} signed successfully!`, 'SUCCESS');
  },

  recordPayment: (paymentData) => {
    const state = get();
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `PAY-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updatedLoans = state.loans.map((loan) => {
      if (loan.id !== paymentData.loanId) return loan;

      const newAmountPaid = loan.amountPaid + paymentData.amount;
      const newRemaining = Math.max(0, loan.totalAmountPayable - newAmountPaid);
      const isPaidOff = newRemaining === 0;

      return {
        ...loan,
        amountPaid: newAmountPaid,
        remainingBalance: newRemaining,
        status: isPaidOff ? 'COMPLETED' as LoanStatus : loan.status,
        updatedAt: new Date().toISOString()
      };
    });

    const targetLoan = state.loans.find(l => l.id === paymentData.loanId);
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      userId: 'system',
      title: 'Payment Logged',
      message: `Payment of RM ${paymentData.amount.toLocaleString()} was logged for ${targetLoan?.id || 'Loan'}. Remaining: RM ${Math.max(0, (targetLoan?.totalAmountPayable || 0) - (targetLoan?.amountPaid || 0) - paymentData.amount).toLocaleString()}`,
      type: 'PAYMENT_RECEIVED',
      loanId: paymentData.loanId,
      read: false,
      createdAt: new Date().toISOString()
    };

    set({
      payments: [newPayment, ...state.payments],
      loans: updatedLoans,
      isPaymentModalOpen: false,
      notifications: [newNotif, ...state.notifications]
    });

    state.showToast(`Payment of RM ${paymentData.amount.toLocaleString()} logged successfully!`, 'SUCCESS');
  },

  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  },

  triggerTestReminder: (loanId: string, alertTiming: '1_MONTH' | '1_WEEK' | '1_DAY') => {
    const state = get();
    const loan = state.loans.find(l => l.id === loanId);
    if (!loan || !state.currentProfile) return;

    const timingLabel = alertTiming === '1_MONTH' ? '1 month' : alertTiming === '1_WEEK' ? '1 week' : '1 day';
    const title = `⏰ Payment Reminder (${timingLabel} due)`;
    const message = `Friendly reminder: Repayment of RM ${loan.remainingBalance.toLocaleString()} for "${loan.title}" is due on ${loan.repaymentDueDate} (${timingLabel} left).`;

    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      userId: state.currentProfile.uid,
      title,
      message,
      type: 'PAYMENT_REMINDER',
      loanId,
      read: false,
      createdAt: new Date().toISOString()
    };

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }

    set({
      notifications: [newNotif, ...state.notifications],
      isNotificationCenterOpen: true
    });

    state.showToast(`Test reminder sent for ${loanId}`, 'INFO');
  },

  resetAllRecords: () => {
    set({
      loans: [],
      payments: [],
      notifications: [],
      selectedLoanId: null,
      isCreateModalOpen: false,
      isPaymentModalOpen: false,
      isNotificationCenterOpen: false
    });
    get().showToast('All records cleared successfully.', 'INFO');
  }
}));

// Global Firebase Auth Listener initializer
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
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

      // Set user state (quietly on initial page restore, explicit toast triggered by AuthModal on user action)
      if (!useAppStore.getState().isAuthenticated) {
        useAppStore.getState().setAuthenticatedUser(profileData, false);
      }

      // Async background sync with Firestore
      getDoc(doc(db, 'users', user.uid)).then((userDoc) => {
        if (userDoc.exists()) {
          useAppStore.setState((state) => ({
            currentProfile: { ...profileData, ...(userDoc.data() as UserProfile) }
          }));
        }
      }).catch((err) => console.warn('Background Firestore sync notice:', err));
    } else {
      useAppStore.setState({
        currentProfile: null,
        isAuthenticated: false,
        authLoading: false
      });
    }
  });
}
