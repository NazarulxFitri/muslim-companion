'use client';

import React from 'react';
import { Phone, MapPin, Clock, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-700 py-8 sm:py-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 text-xs mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-100">
          
          {/* Brand & Address */}
          <div>
            <div className="flex items-center gap-2 mb-2 font-black text-slate-900 text-sm">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
              <span>Paws & Whiskers 🐾</span>
            </div>
            <p className="text-slate-500 leading-relaxed font-medium">
              128 Pet Care Avenue, Petaling Jaya, Selangor
            </p>
          </div>

          {/* Contact */}
          <div>
            <span className="font-extrabold text-rose-600 block mb-2 uppercase tracking-wider text-[11px]">Contact & Hotline</span>
            <div className="space-y-1 text-slate-600 font-medium">
              <p>📞 Phone: +60 3-8000 7387 (PETS)</p>
              <p>💬 WhatsApp Booking Support</p>
            </div>
          </div>

          {/* Hours */}
          <div>
            <span className="font-extrabold text-rose-600 block mb-2 uppercase tracking-wider text-[11px]">Operating Hours</span>
            <div className="space-y-1 text-slate-600 font-medium">
              <p>Mon - Fri: 9:00 AM - 8:00 PM</p>
              <p>Sat - Sun: 9:00 AM - 6:00 PM</p>
            </div>
          </div>

        </div>

        <div className="text-center text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Paws & Whiskers Pet Care Booking System. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}
