'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the online slot booking work?',
      a: 'Simply select your desired service (Grooming, Neuter, Vet Consultation, etc.), pick your preferred date and available time slot, and enter your pet details. If a date & time slot is already booked by another customer, it will be automatically disabled on the calendar in real-time!'
    },
    {
      q: 'What should I prepare before bringing my pet for Neuter or Spay Surgery?',
      a: 'Pets undergoing surgery should fast from food for 8–12 hours before the procedure (water is allowed until 2 hours prior). Pre-anesthetic blood screening is performed onsite before any anesthesia is administered.'
    },
    {
      q: 'Can I choose a specific groomer or vet?',
      a: 'Yes! You can specify your preferred vet or master groomer in the Special Notes section during booking, or request them upon check-in.'
    },
    {
      q: 'How long does a Full Grooming or Potong Bulu haircut take?',
      a: 'A standard Full Pamper Grooming or Potong Bulu haircut typically takes between 45 to 60 minutes, depending on coat condition and pet cooperation.'
    },
    {
      q: 'What happens if I need to cancel or reschedule my appointment?',
      a: 'You can view and cancel your appointment anytime using the "My Bookings" button on our top navigation bar. Cancelling immediately unlocks your date & time slot for other pet parents.'
    }
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 relative z-10 bg-white border-t border-pink-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions ❓
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Have Questions? We Have Answers.
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Everything you need to know about booking, surgery prep, and grooming.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-pink-100 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-extrabold text-slate-900 hover:text-rose-600 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-rose-500 transition-transform ${isOpen ? 'rotate-180 bg-rose-100' : 'bg-rose-50'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-pink-100/60 mt-1 font-medium">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
