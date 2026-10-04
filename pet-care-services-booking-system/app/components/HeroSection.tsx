'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Sparkles,
  Building2
} from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-x-clip bg-gradient-to-b from-rose-50/50 via-slate-50/30 to-white pt-8 pb-14 sm:pt-14 sm:pb-24">
      {/* Soft background ambient gradient circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-rose-200/20 via-pink-100/30 to-amber-100/20 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Text Content */}
        <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-5">
          
          {/* Subtle Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white border border-rose-200/80 shadow-xs text-[11px] sm:text-xs font-bold text-rose-700 animate-fade-in max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span className="truncate">Modern Pet Care & Clinic Booking Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2] sm:leading-[1.15]">
            Delight Pet Owners with <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500">Seamless Care & Boarding</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-xs sm:text-sm sm:leading-relaxed max-w-2xl mx-auto font-medium px-2 sm:px-0">
            The all-in-one reservation system for veterinary clinics, pet spas, grooming salons, and overnight pet hotels. Instant booking confirmation with zero friction.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-2.5 sm:gap-3 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/booking"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Book Appointment</span>
              <ChevronRight className="w-4 h-4 opacity-80 shrink-0" />
            </Link>

            <Link
              href="/boarding"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Explore Pet Hotel</span>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </Link>
          </div>

          {/* Trust Chips */}
          <div className="pt-2 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-[11px] sm:text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" /> Real-time confirmation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" /> Multi-species support
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" /> Live Admin Dashboard
            </span>
          </div>

        </div>

        {/* Hero Visual Showcase */}
        <div className="mt-8 sm:mt-14 relative max-w-4xl mx-auto">
          
          {/* Main Hero Image with subtle modern frame */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl sm:shadow-2xl bg-white group">
            <div className="aspect-[16/10] sm:aspect-[16/9] w-full relative">
              <Image 
                src="/images/pet-hero-banner.jpg" 
                alt="Happy Golden Retriever and Calico Cat at modern pet clinic"
                fill
                priority
                className="object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            </div>
            
            {/* Subtle bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating Feature Card 1 (Bottom Left - Desktop & Tablet) */}
          <div className="hidden sm:flex absolute -bottom-5 left-8 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xl items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-slate-900">
                <span>4.9 / 5.0 Rating</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Loved by 1,200+ Pet Parents</p>
            </div>
          </div>

          {/* Floating Feature Card 2 (Bottom Right - Desktop & Tablet) */}
          <div className="hidden sm:flex absolute -bottom-5 right-8 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xl items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="font-black text-xs sm:text-sm text-slate-900">
                Verified Certified Care
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Certified Vets & Experienced Groomers</p>
            </div>
          </div>

          {/* Mobile Bottom Trust Row (Below Image on Mobile so nothing overlaps or gets clipped) */}
          <div className="grid grid-cols-2 gap-2 mt-3 sm:hidden">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs text-slate-900 leading-tight">4.9 / 5.0</div>
                <div className="text-[10px] text-slate-500 font-medium truncate">1,200+ Parents</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <div className="font-black text-xs text-slate-900 leading-tight truncate">Certified Care</div>
                <div className="text-[10px] text-slate-500 font-medium truncate">Vets & Groomers</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
