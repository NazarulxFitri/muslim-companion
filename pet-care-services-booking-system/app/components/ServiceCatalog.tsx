'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Scissors, 
  Sparkles, 
  Stethoscope, 
  HeartPulse, 
  ShieldCheck, 
  Bath, 
  Home, 
  Clock, 
  ArrowRight,
  Tag
} from 'lucide-react';
import { PetService } from '../types/booking';
import { subscribeToServices } from '../services/serviceManagement';

const ICON_MAP: Record<string, React.ElementType> = {
  Scissors,
  Sparkles,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Bath,
  Home
};

export default function ServiceCatalog() {
  const [services, setServices] = useState<PetService[]>([]);

  useEffect(() => {
    const unsub = subscribeToServices((data) => setServices(data));
    return () => unsub();
  }, []);

  return (
    <section id="services" className="py-12 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] font-bold text-rose-700 mb-2.5 sm:mb-3">
            <Tag className="w-3.5 h-3.5" />
            <span>Interactive Service Menu</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Comprehensive Pet Care Services & Rates
          </h2>
          <p className="mt-2 text-slate-600 text-xs sm:text-sm font-medium px-2 sm:px-0">
            Live prices synchronized from the admin dashboard. Select any service to begin booking.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service) => {
            const IconComponent = ICON_MAP[service.iconName] || Scissors;

            return (
              <div
                key={service.id}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold group-hover:scale-105 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-rose-600 block leading-tight">
                        RM {service.price}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center gap-1.5 mt-3.5 sm:mt-4 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Est: {service.durationMinutes >= 1440 ? '24 Hours' : `${service.durationMinutes} Minutes`}</span>
                  </div>
                </div>

                <Link
                  href={`/booking?service=${service.id}`}
                  className="mt-5 sm:mt-6 w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all group-hover:shadow-md active:scale-95"
                >
                  <span>Select & Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
