'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Building2, 
  LayoutDashboard, 
  Smartphone, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function PlatformFeatures() {
  const features = [
    {
      icon: CalendarCheck,
      color: 'rose',
      title: 'Frictionless Appointment Booking',
      description: 'Pet owners choose services, select dates, pick available hourly slots, and submit pet details in under 60 seconds.',
      badge: 'Client-Facing'
    },
    {
      icon: Building2,
      color: 'amber',
      title: 'Dedicated Pet Hotel Boarding',
      description: 'Full multi-night boarding module with room suites, check-in/out scheduling, automated night calculator, and stay logs.',
      badge: 'Overnight Stays'
    },
    {
      icon: LayoutDashboard,
      color: 'blue',
      title: 'Real-time Executive Dashboard',
      description: 'Manage bookings live, update service rates on the fly, track gross sales, and manage pet species from a unified console.',
      badge: 'Business Control'
    },
    {
      icon: Smartphone,
      color: 'emerald',
      title: 'Mobile-Optimized & Fast',
      description: 'Tailored for smartphone pet parents on the go with touch-friendly controls, instant feedback, and clean receipt summaries.',
      badge: '100% Responsive'
    }
  ];

  return (
    <section className="py-12 sm:py-20 bg-slate-50/70 border-t border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] font-bold text-rose-700 mb-2.5 sm:mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Turnkey Software Solution</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Everything Your Pet Care Business Needs
          </h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm font-medium px-2 sm:px-0">
            Designed specifically for pet shops, grooming salons, veterinary practices, and pet boarding hotels.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-105 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3.5 sm:pt-4 mt-3.5 sm:mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-rose-600">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500 shrink-0" />
                  <span>Ready out of the box</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner Card promoting purchasing/customizing the system */}
        <div className="mt-8 sm:mt-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-700/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] sm:text-[11px] font-bold">
              Live Interactive Showcase
            </span>
            <h3 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
              Test Both Customer & Admin Experience Now
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              Create a test booking on the client page, then immediately view it sync in real-time in the executive dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/booking"
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>Test Customer Flow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/admin-secret-dashboard"
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>Explore Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
