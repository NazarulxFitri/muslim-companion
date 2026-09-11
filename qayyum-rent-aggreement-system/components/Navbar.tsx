'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { requestNotificationPermission } from '@/lib/notifications';
import { 
  FileText, 
  Bell, 
  Download, 
  Building2,
  Wallet,
  LogIn,
  LogOut,
  UserCheck,
  ShieldCheck,
  Menu,
  X,
  Pencil
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentProfile, 
    activeRole, 
    switchRole, 
    setAuthModalOpen,
    setProfileModalOpen,
    isAuthenticated,
    signOutUser
  } = useAppStore();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered:', reg.scope))
        .catch((err) => console.log('SW reg error:', err));
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      alert('✅ Web Push Notifications enabled! You will receive timely loan reminder alerts.');
    }
  };

  const isLender = activeRole === 'LENDER';

  return (
    <header className={`sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b text-slate-100 shadow-xl transition-colors duration-300 ${
      isLender ? 'border-blue-500/30' : 'border-emerald-500/30'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
              isLender 
                ? 'bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-blue-500/20 text-white' 
                : 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/20 text-slate-950'
            }`}>
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 font-extrabold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Pinjam<span className={isLender ? 'text-blue-400' : 'text-emerald-400'}>Legal</span>
                </span>
                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border transition-colors ${
                  isLender 
                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' 
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isLender ? 'LENDER' : 'BORROWER'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Legal Peer-to-Peer Loan Agreements</p>
            </div>
          </div>

          {/* Desktop Controls (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-3">

            {/* Push Notifications Enable */}
            {!notificationsEnabled && (
              <button
                onClick={handleEnableNotifications}
                className="flex items-center space-x-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Enable Browser Push Notifications for loan due dates"
              >
                <Bell className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>Enable Push Alerts</span>
              </button>
            )}

            {/* PWA Install Button */}
            {deferredPrompt && !isPwaInstalled && (
              <button
                onClick={handleInstallPwa}
                className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install PWA App</span>
              </button>
            )}

            {/* Role Switcher Pills */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => switchRole('LENDER')}
                className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeRole === 'LENDER'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Lender</span>
              </button>

              <button
                onClick={() => switchRole('BORROWER')}
                className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeRole === 'BORROWER'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Borrower</span>
              </button>
            </div>

            {/* Firebase Auth & Profile Controls */}
            {isAuthenticated && currentProfile ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center space-x-2 p-1.5 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer text-left"
                  title="Click to edit user profile & IC details"
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-slate-100 ${
                    isLender ? 'bg-blue-900/60 border-blue-400' : 'bg-emerald-900/60 border-emerald-400'
                  }`}>
                    {currentProfile.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{currentProfile.name}</p>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{currentProfile.icNumber}</p>
                  </div>
                </button>
                
                <button
                  onClick={signOutUser}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                  title="Sign out of Firebase account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                title="Log In / Register"
              >
                <LogIn className="w-4 h-4" />
                <span className="ml-1.5">Log In / Register</span>
              </button>
            )}

          </div>

          {/* Mobile Navigation Toggle (Visible on Mobile `< md`) */}
          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated && currentProfile ? (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
                aria-label="Toggle mobile menu"
              >
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold text-slate-100 ${
                  isLender ? 'bg-blue-900/60 border-blue-400' : 'bg-emerald-900/60 border-emerald-400'
                }`}>
                  {currentProfile.name?.charAt(0) || 'U'}
                </div>
                {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-200" /> : <Menu className="w-5 h-5 text-slate-200" />}
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-all shadow-md cursor-pointer"
                title="Log In / Register"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isMobileMenuOpen && isAuthenticated && currentProfile && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/98 backdrop-blur-xl px-4 py-4 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Profile Banner */}
          <div 
            onClick={() => { setProfileModalOpen(true); setIsMobileMenuOpen(false); }}
            className="flex items-center justify-between p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold text-slate-100 ${
                isLender ? 'bg-blue-900/60 border-blue-400' : 'bg-emerald-900/60 border-emerald-400'
              }`}>
                {currentProfile.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white">{currentProfile.name}</p>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">IC: {currentProfile.icNumber}</p>
              </div>
            </div>
            <div className="p-2 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl border border-blue-500/30 transition-colors" title="Edit Profile">
              <Pencil className="w-4 h-4" />
            </div>
          </div>

          {/* Mobile Role Switcher Buttons */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Switch Role Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { switchRole('LENDER'); setIsMobileMenuOpen(false); }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'LENDER'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/40 shadow-lg shadow-blue-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Lender</span>
              </button>

              <button
                onClick={() => { switchRole('BORROWER'); setIsMobileMenuOpen(false); }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRole === 'BORROWER'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Borrower</span>
              </button>
            </div>
          </div>

          {/* PWA & Notification Options */}
          <div className="space-y-2 pt-1 border-t border-slate-900">
            {!notificationsEnabled && (
              <button
                onClick={() => { handleEnableNotifications(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center space-x-2 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Enable Mobile Push Alerts</span>
              </button>
            )}

            {deferredPrompt && !isPwaInstalled && (
              <button
                onClick={() => { handleInstallPwa(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center space-x-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install PinjamLegal App</span>
              </button>
            )}
          </div>

          {/* Sign Out Action */}
          <div className="pt-2 border-t border-slate-900">
            <button
              onClick={() => { signOutUser(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 py-2.5 rounded-xl transition-colors cursor-pointer text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </button>
          </div>

        </div>
      )}

    </header>
  );
};
