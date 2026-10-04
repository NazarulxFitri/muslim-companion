'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export default function ReviewsSection() {
  const reviews = [
    {
      name: 'Farah Nadia & Milo (Golden Retriever)',
      rating: 5,
      service: 'Full Pamper Grooming 🛁',
      date: '2 days ago',
      comment: 'Super easy to book an online slot! Milo came home smelling divine and his coat was so fluffy. Dr. Sarah was extremely friendly and gentle.',
      verified: true
    },
    {
      name: 'Kevin Leong & Oyen (Tabby Cat)',
      rating: 5,
      service: 'Neuter Surgery Care 🏥',
      date: '1 week ago',
      comment: 'I was nervous about getting Oyen neutered, but the pre-op checkup and recovery care gave me peace of mind. He recovered completely in 3 days!',
      verified: true
    },
    {
      name: 'Siti Aminah & Fluffy (Persian Cat)',
      rating: 5,
      service: 'Potong Bulu & Haircut ✂️',
      date: '2 weeks ago',
      comment: 'Aiman did a magnificent lion cut styling for Fluffy. Very gentle with nervous cats. Best pet shop in town hands down!',
      verified: true
    }
  ];

  return (
    <section id="reviews" className="py-16 sm:py-24 relative z-10 bg-rose-50/30 border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-rose-200 text-rose-600 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            850+ Verified Reviews ⭐
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Loved By Pets & Pet Parents 💕
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Here is what our verified pet parents have to say about their experience with us.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-pink-100 hover:border-pink-300 transition-all duration-300 shadow-xs hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-pink-200" />
                </div>

                <p className="text-slate-700 text-sm italic leading-relaxed mb-6 font-medium">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-pink-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{rev.name}</h4>
                  <span className="text-rose-500 font-bold block mt-0.5">{rev.service}</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block font-medium">{rev.date}</span>
                  <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-[11px] mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
