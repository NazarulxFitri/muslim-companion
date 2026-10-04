'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  PawPrint, 
  Building2, 
  Shield, 
  Menu, 
  X, 
  Sparkles,
  Phone,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-xs">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-18">
          
          {/* Brand Logo */}
          <Link 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-2 sm:space-x-2.5 min-w-0 group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-white" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 block leading-tight truncate">
                Paws & Whiskers
              </span>
              <span className="hidden sm:block text-[10px] text-rose-600 font-bold leading-none mt-0.5">
                Pet Care & Hotel Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation & Action Buttons */}
          <div className="hidden md:flex items-center space-x-2.5">
            <a
              href="/#services"
              className="text-xs font-bold text-slate-600 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Services & Rates
            </a>

            {/* Pet Boarding Button */}
            <Link
              href="/boarding"
              className="px-3.5 py-2 rounded-xl font-bold text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Pet Hotel</span>
            </Link>

            {/* Admin Console Quick Link */}
            <Link
              href="/admin-secret-dashboard"
              className="px-3 py-2 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70 transition-all flex items-center gap-1.5"
              title="Preview Executive Admin Console"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Demo</span>
            </Link>

            {/* Book Service Link */}
            <Link
              href="/booking"
              className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-600/20 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
            >
              <PawPrint className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>
          </div>

          {/* Mobile Right Action Area (Compact & Never Overflows) */}
          <div className="flex md:hidden items-center space-x-1.5 shrink-0">
            {/* Compact Book Button on Mobile */}
            <Link
              href="/booking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-xs flex items-center gap-1 transition-all"
            >
              <PawPrint className="w-3 h-3" />
              <span>Book</span>
            </Link>

            {/* Mobile Hamburger / Close Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              aria-label="Toggle navigation menu"
              className="p-1.5 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-slate-100 active:bg-slate-200 transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-900" />
              ) : (
                <Menu className="w-5 h-5 text-slate-800" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Slide-Down Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/90 bg-white/98 backdrop-blur-xl shadow-xl animate-fade-in">
          <div className="px-4 pt-3 pb-5 space-y-2.5">
            
            {/* Primary Action 1: Book Appointment */}
            <Link
              href="/booking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-rose-900 hover:bg-rose-100/80 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <PawPrint className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-rose-950">Book Pet Appointment</div>
                  <div className="text-[11px] text-rose-700/80 font-medium">Grooming, Checkups & Surgeries</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-600 shrink-0" />
            </Link>

            {/* Primary Action 2: Pet Hotel Boarding */}
            <Link
              href="/boarding"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-950 hover:bg-amber-100/70 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Pet Hotel Boarding</div>
                  <div className="text-[11px] text-slate-500 font-medium">Dog & Cat Suites, 24/7 Care</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
            </Link>

            {/* Quick Links Group */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="/#services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800 text-center block transition-all"
              >
                <div className="text-xs font-bold">Services & Rates</div>
                <div className="text-[10px] text-slate-500">Live pricing menu</div>
              </a>

              <Link
                href="/admin-secret-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800 text-center block transition-all"
              >
                <div className="text-xs font-bold flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-slate-600" />
                  <span>Admin Demo</span>
                </div>
                <div className="text-[10px] text-slate-500">Live console preview</div>
              </Link>
            </div>

            {/* Compact Quick Contact Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-rose-500" /> +60 3-8000 7387
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> 9am - 8pm Daily
              </span>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
