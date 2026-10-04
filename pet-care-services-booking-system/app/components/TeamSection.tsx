'use client';

import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

export default function TeamSection() {
  const teamMembers = [
    {
      name: 'Dr. Sarah Farhana, DVM',
      role: 'Senior Veterinary Surgeon 🩺',
      experience: '12+ Years Exp.',
      specialty: 'Neuter & Spay Surgery, Internal Care',
      avatarEmoji: '👩‍⚕️',
      bio: 'Specialized in gentle laparoscopic surgery and pre-anesthetic safety protocols.'
    },
    {
      name: 'Dr. Kevin Tan, B.Vet.Med',
      role: 'Consulting Veterinarian 🩺',
      experience: '8+ Years Exp.',
      specialty: 'Dermatology, Dental Scaling, Vaccines',
      avatarEmoji: '👨‍⚕️',
      bio: 'Passionate about preventative health, dental scaling, and skin allergy treatments.'
    },
    {
      name: 'Aiman Hakim',
      role: 'Master Pet Groomer ✂️',
      experience: '10+ Years Exp.',
      specialty: 'Potong Bulu Styling & Show Haircuts',
      avatarEmoji: '✂️',
      bio: 'Asian fusion haircut specialist with gentle, stress-free handling techniques.'
    },
    {
      name: 'Nurul Huda',
      role: 'Spa & Hydrotherapy Lead 🫧',
      experience: '6+ Years Exp.',
      specialty: 'Feline Grooming & Hydrotherapy Spa',
      avatarEmoji: '🫧',
      bio: 'Certified cat handler specializing in soothing herbal baths & coat care.'
    }
  ];

  return (
    <section id="team" className="py-16 sm:py-24 relative z-10 bg-white border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs">
            <Award className="w-3.5 h-3.5" />
            Licensed Veterinary Specialists 🩺
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Meet Our Care Team
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Our certified vet surgeons and master groomers treat every pet with gentle, loving care.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-3xl bg-white border border-pink-100/90 hover:border-pink-300 transition-all duration-300 hover:-translate-y-1.5 shadow-xs hover:shadow-lg text-center flex flex-col justify-between"
            >
              <div>
                <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform shadow-xs">
                  {member.avatarEmoji}
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-rose-600 transition-colors">{member.name}</h3>
                <span className="text-xs text-rose-500 font-bold block mt-0.5">{member.role}</span>

                <span className="inline-block mt-3 px-3 py-1 rounded-full text-[10px] uppercase font-extrabold bg-pink-100/70 text-rose-700 border border-pink-200">
                  {member.experience}
                </span>

                <p className="text-slate-600 text-xs mt-3.5 leading-relaxed font-medium">
                  {member.bio}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-pink-100 text-[11px] text-slate-500 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{member.specialty}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
