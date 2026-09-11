'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { X, LogIn, UserPlus, Shield, User, Mail, Lock, Phone, MapPin, CreditCard, AlertTriangle, Key, CheckCircle } from 'lucide-react';
import { UserProfile, UserRole } from '@/lib/types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, setAuthenticatedUser, showToast } = useAppStore();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConfigError, setIsConfigError] = useState(false);
  const [activeFirebaseUser, setActiveFirebaseUser] = useState<any>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<UserRole>('LENDER');

  useEffect(() => {
    if (auth.currentUser) {
      setActiveFirebaseUser(auth.currentUser);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const parseAuthError = (err: any) => {
    console.error('Auth error:', err);
    if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
      setIsConfigError(true);
      return 'Firebase Authentication is not enabled in Firebase Console yet. Please enable "Email/Password" and/or "Google" in Firebase Console -> Authentication -> Sign-in method.';
    }
    setIsConfigError(false);
    return err.message || 'Authentication error occurred.';
  };

  const handleLocalFallback = () => {
    const cleanedIc = (icNumber.replace(/\D/g, '') || '900101145521').slice(0, 12);
    const cleanedPhoneDigits = phone.replace(/\D/g, '') || '123456789';
    const fallbackProfile: UserProfile = {
      uid: activeFirebaseUser?.uid || `user-${Date.now()}`,
      name: activeFirebaseUser?.displayName || fullName || (email ? email.split('@')[0] : 'Authenticated User'),
      email: activeFirebaseUser?.email || email || 'user@example.com',
      icNumber: cleanedIc,
      phone: `+60${cleanedPhoneDigits}`,
      address: address || 'Kuala Lumpur, Malaysia',
      role: role,
    };
    setAuthenticatedUser(fallbackProfile, true);
    setAuthModalOpen(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    setIsConfigError(false);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const profileData: UserProfile = {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Google User',
        email: user.email || '',
        icNumber: '900101145521',
        phone: '+60129876543',
        address: 'Kuala Lumpur, Malaysia',
        role: role,
      };

      // 1. INSTANTLY SET USER STATE IN REACT (No waiting for Firestore!)
      setAuthenticatedUser(profileData, true);
      setAuthModalOpen(false);

      // 2. Sync Firestore asynchronously in the background
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then((userDoc) => {
        if (userDoc.exists()) {
          useAppStore.setState({ currentProfile: { ...profileData, ...(userDoc.data() as UserProfile) } });
        } else {
          setDoc(userDocRef, profileData, { merge: true }).catch(() => {});
        }
      }).catch(() => {});

    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        showToast('Google Sign-In popup was closed.', 'INFO');
      } else {
        const msg = parseAuthError(err);
        setErrorMsg(msg);
        showToast(msg, 'ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setIsConfigError(false);

    if (!isValidEmail(email)) {
      const msg = 'Please enter a valid email address (e.g. name@domain.com).';
      setErrorMsg(msg);
      showToast(msg, 'ERROR');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const profileData: UserProfile = {
        uid: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email || email,
        icNumber: '900101145521',
        phone: '+60123456789',
        address: 'Kuala Lumpur, Malaysia',
        role: 'LENDER',
      };

      // 1. INSTANTLY SET USER STATE IN REACT
      setAuthenticatedUser(profileData, true);
      setAuthModalOpen(false);

      // 2. Sync Firestore asynchronously
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then((userDoc) => {
        if (userDoc.exists()) {
          useAppStore.setState({ currentProfile: { ...profileData, ...(userDoc.data() as UserProfile) } });
        } else {
          setDoc(userDocRef, profileData, { merge: true }).catch(() => {});
        }
      }).catch(() => {});

    } catch (err: any) {
      const msg = parseAuthError(err);
      setErrorMsg(msg);
      showToast(msg, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setIsConfigError(false);

    if (!isValidEmail(email)) {
      const msg = 'Please enter a valid email address (e.g. name@domain.com).';
      setErrorMsg(msg);
      showToast(msg, 'ERROR');
      setLoading(false);
      return;
    }

    const cleanedIc = icNumber.replace(/\D/g, '');
    if (cleanedIc.length !== 12) {
      const msg = 'Malaysian IC Number must contain exactly 12 digits (e.g. 900101145521).';
      setErrorMsg(msg);
      showToast(msg, 'ERROR');
      setLoading(false);
      return;
    }

    const cleanedPhoneDigits = phone.replace(/\D/g, '');
    if (!cleanedPhoneDigits || cleanedPhoneDigits.length < 8) {
      const msg = 'Please enter a valid phone number after +60.';
      setErrorMsg(msg);
      showToast(msg, 'ERROR');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const newProfile: UserProfile = {
        uid: user.uid,
        name: fullName,
        email: email,
        icNumber: cleanedIc,
        phone: `+60${cleanedPhoneDigits}`,
        address: address,
        role: role,
      };

      // 1. INSTANTLY SET USER STATE IN REACT
      setAuthenticatedUser(newProfile, true);
      setAuthModalOpen(false);

      // 2. Sync Firestore in background
      setDoc(doc(db, 'users', user.uid), newProfile, { merge: true }).catch(() => {});

    } catch (err: any) {
      const msg = parseAuthError(err);
      setErrorMsg(msg);
      showToast(msg, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'LOGIN' ? 'Account Login' : 'Create New Profile'}
              </h2>
              <p className="text-xs text-slate-400">Firebase Authenticated Access</p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 bg-slate-950 p-1.5 border-b border-slate-800">
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setErrorMsg(''); setIsConfigError(false); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'LOGIN' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>

          <button
            type="button"
            onClick={() => { setMode('REGISTER'); setErrorMsg(''); setIsConfigError(false); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'REGISTER' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Profile
          </button>
        </div>

        {/* Detected Existing Firebase User Alert */}
        {activeFirebaseUser && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Detected Authenticated Google User:
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono line-clamp-1">{activeFirebaseUser.email}</p>
            <button
              type="button"
              onClick={handleLocalFallback}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-md shadow-emerald-600/30"
            >
              <span>Unlock Dashboard with {activeFirebaseUser.displayName || activeFirebaseUser.email?.split('@')[0]}</span>
            </button>
          </div>
        )}

        {/* Form Error Alert & Firebase Config Helper */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>

            {isConfigError && (
              <div className="pt-2 border-t border-rose-500/20 text-[11px] text-slate-300 space-y-2">
                <p className="font-semibold text-amber-300">How to fix in Firebase Console:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Go to <strong className="text-white">console.firebase.google.com</strong></li>
                  <li>Select project <strong className="text-white">loan-agreement-3b446</strong></li>
                  <li>Click <strong className="text-white">Authentication &rarr; Sign-in method</strong></li>
                  <li>Enable both <strong className="text-emerald-400">Email/Password</strong> and <strong className="text-blue-400">Google</strong>.</li>
                </ol>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleLocalFallback}
                    className="w-full bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/40 text-amber-200 font-bold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Bypass & Unlock Dashboard Directly
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-6 pt-4">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or with email</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Logging in...' : 'Sign In to Account'}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="px-6 pb-6 space-y-3 max-h-[55vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name (as per IC)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mohd Nazarul Fitri"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Malaysian IC Number <span className="text-slate-400 font-normal">(12 Digits, Numbers Only)</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={icNumber}
                  onChange={(e) => setIcNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="900101145521"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-slate-400 font-normal">(Numbers Only)</span>
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-700 focus-within:border-emerald-500 bg-slate-800">
                <div className="bg-slate-900 border-r border-slate-700 px-3 py-2 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+60</span>
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456789"
                  className="w-full bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full legal residential address"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Profile...' : 'Complete Profile & Register'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
