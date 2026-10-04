'use client';

import React from 'react';
import { Camera, Heart } from 'lucide-react';

export default function PetGallery() {
  const galleryItems = [
    {
      id: 'g1',
      petName: 'Milo the Golden',
      service: 'Full Pamper Grooming 🚿',
      tag: 'Grooming Magic',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      emoji: '🐕',
      description: 'Silky smooth golden coat with fluff blowout and sanitary detailing.'
    },
    {
      id: 'g2',
      petName: 'Luna the Persian Cat',
      service: 'Potong Bulu & Lion Cut ✂️',
      tag: 'Styling Cut',
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      emoji: '🐱',
      description: 'Precision teddy bear cut & de-matting for ultimate feline comfort.'
    },
    {
      id: 'g3',
      petName: 'Oyen & Friends',
      service: 'Neuter Surgery Care 🏥',
      tag: 'Safe Surgery',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      emoji: '🏥',
      description: 'Sterile procedure with quick recovery and zero-stress post-op check.'
    },
    {
      id: 'g4',
      petName: 'Coco the Poodle',
      service: 'Hydrotherapy Bubble Spa 🫧',
      tag: 'Relaxation Spa',
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      emoji: '🫧',
      description: 'Dead sea mineral mud bath with soothing coat aromatherapy.'
    },
    {
      id: 'g5',
      petName: 'Barnaby the Bunny',
      service: 'Vet Health Checkup 🩺',
      tag: 'Exotic Care',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      emoji: '🐰',
      description: 'Comprehensive dental inspection, weight check & nutritional advice.'
    },
    {
      id: 'g6',
      petName: 'Bella & Teddy',
      service: 'Luxury Hotel Boarding 🏨',
      tag: '5-Star Stay',
      color: 'bg-sky-100 text-sky-800 border-sky-200',
      emoji: '🏨',
      description: 'Spacious climate-controlled suite with 24/7 web camera monitor.'
    }
  ];

  return (
    <section id="gallery" className="py-16 sm:py-24 relative z-10 bg-rose-50/40 border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-rose-200 text-rose-600 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs">
            <Camera className="w-3.5 h-3.5 text-rose-500" />
            Happy Pet Transformations 📸
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Loved Guests & Cute Smiles
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Take a peek at our happy fur babies after their pampering sessions!
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-3xl bg-white border border-pink-100/90 overflow-hidden hover:border-pink-300 transition-all duration-300 hover:-translate-y-1.5 shadow-xs hover:shadow-lg flex flex-col justify-between"
            >
              {/* Header Visual Box */}
              <div className="h-44 bg-gradient-to-br from-pink-100/60 to-rose-100/60 p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-20 transform group-hover:scale-110 transition-transform">
                  {item.emoji}
                </div>
                
                <span className={`self-start px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${item.color}`}>
                  {item.tag}
                </span>

                <div className="relative z-10">
                  <div className="text-3xl mb-1">{item.emoji}</div>
                  <h3 className="text-xl font-black text-slate-900">{item.petName}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="text-xs uppercase font-extrabold tracking-wider text-rose-600 mb-1">{item.service}</div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                
                <div className="mt-4 pt-4 border-t border-pink-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-rose-600 font-bold">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>Verified Guest</span>
                  </div>
                  <span className="font-semibold">100% Happy Tail Wags</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
