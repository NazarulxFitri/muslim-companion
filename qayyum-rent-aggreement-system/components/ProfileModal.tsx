'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { X, UserCheck, CreditCard, Phone, MapPin, Mail, Shield } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { isProfileModalOpen, setProfileModalOpen, currentProfile, setAuthenticatedUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    icNumber: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    if (currentProfile) {
      const rawIc = (currentProfile.icNumber || '').replace(/\D/g, '').slice(0, 12);
      const rawPhone = (currentProfile.phone || '').replace('+60', '').replace(/\D/g, '');
      setFormData({
        name: currentProfile.name || '',
        icNumber: rawIc,
        phone: rawPhone,
        email: currentProfile.email || '',
        address: currentProfile.address || '',
      });
    }
  }, [currentProfile, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (!currentProfile) return;

    const cleanedIc = formData.icNumber.replace(/\D/g, '');
    if (cleanedIc.length !== 12) {
      setErrorMsg('Malaysian IC Number must contain exactly 12 numeric digits (e.g. 900101145521).');
      setLoading(false);
      return;
    }

    const cleanedPhoneDigits = formData.phone.replace(/\D/g, '');
    if (!cleanedPhoneDigits || cleanedPhoneDigits.length < 8) {
      setErrorMsg('Please enter a valid phone number after +60.');
      setLoading(false);
      return;
    }

    const formattedPhone = `+60${cleanedPhoneDigits}`;

    try {
      const updatedProfile: UserProfile = {
        ...currentProfile,
        name: formData.name,
        icNumber: cleanedIc,
        phone: formattedPhone,
        address: formData.address,
      };

      // If authenticated with real Firebase Auth UID, update Firestore document
      if (currentProfile.uid && !currentProfile.uid.startsWith('lender-') && !currentProfile.uid.startsWith('borrower-')) {
        const userRef = doc(db, 'users', currentProfile.uid);
        await updateDoc(userRef, {
          name: formData.name,
          icNumber: cleanedIc,
          phone: formattedPhone,
          address: formData.address,
        });
      }

      setAuthenticatedUser(updatedProfile);
      setSuccessMsg('Profile updated successfully in Firestore!');
      setTimeout(() => {
        setProfileModalOpen(false);
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit User Profile</h2>
              <p className="text-xs text-slate-400">IC & Personal Legal Identity</p>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name (as per IC)</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Malaysian IC Number <span className="text-slate-400 font-normal">(12 Digits, Numbers Only)</span>
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                maxLength={12}
                value={formData.icNumber}
                onChange={(e) => setFormData({ ...formData, icNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                placeholder="900101145521"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (Read-Only)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-slate-950/70 border border-slate-800 text-slate-400 rounded-xl pl-9 pr-3 py-2.5 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Phone Number <span className="text-slate-400 font-normal">(Numbers Only)</span>
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-700 focus-within:border-blue-500 bg-slate-800">
              <div className="bg-slate-900 border-r border-slate-700 px-3 py-2.5 text-xs font-bold text-blue-400 flex items-center gap-1.5 shrink-0">
                <Phone className="w-3.5 h-3.5" />
                <span>+60</span>
              </div>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="123456789"
                className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setProfileModalOpen(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
