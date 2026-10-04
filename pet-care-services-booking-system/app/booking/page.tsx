'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  QrCode, 
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFAULT_TIME_SLOTS } from '../data/petServices';
import { PetBooking, PetService } from '../types/booking';
import { subscribeToBookings, saveBooking, isSlotBooked, getOffsetDateString } from '../services/bookingService';
import { subscribeToServices, subscribeToPetTypes, PetTypeConfig } from '../services/serviceManagement';

function BookingPageContent() {
  const searchParams = useSearchParams();
  const initialServiceFromUrl = searchParams.get('service');

  const [activeBookings, setActiveBookings] = useState<PetBooking[]>([]);
  const [services, setServices] = useState<PetService[]>([]);
  const [petTypes, setPetTypes] = useState<PetTypeConfig[]>([]);

  const [step, setStep] = useState<number>(1);

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedPetType, setSelectedPetType] = useState<string>('');

  const [selectedDate, setSelectedDate] = useState<string>(getOffsetDateString(1));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  const [petName, setPetName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerPhone, setOwnerPhone] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  const [completedBooking, setCompletedBooking] = useState<PetBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const unsubBookings = subscribeToBookings((data) => setActiveBookings(data));
    const unsubServices = subscribeToServices((data) => {
      setServices(data);
      if (data.length > 0 && !selectedServiceId) {
        setSelectedServiceId(initialServiceFromUrl || data[0].id);
      }
    });
    const unsubPetTypes = subscribeToPetTypes((data) => {
      setPetTypes(data);
      if (data.length > 0 && !selectedPetType) {
        setSelectedPetType(data[0].id);
      }
    });

    return () => {
      unsubBookings();
      unsubServices();
      unsubPetTypes();
    };
  }, []);

  const currentService = services.find(s => s.id === selectedServiceId) || services[0] || {
    id: 'default',
    name: 'Pet Care Service',
    price: 35,
    durationMinutes: 45,
    description: '',
    category: 'grooming'
  };

  const availableDates = Array.from({ length: 10 }).map((_, i) => {
    const dStr = getOffsetDateString(i);
    const dateObj = new Date(dStr);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = dateObj.getDate();
    return {
      dateString: dStr,
      dayName,
      monthName,
      dayNum,
      isToday: i === 0
    };
  });

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!petName || !ownerName || !ownerPhone || !selectedDate || !selectedTimeSlot) {
      setErrorMessage('Please fill in all required fields (Pet Name, Owner Name, WhatsApp Phone, Date & Time).');
      return;
    }

    if (isSlotBooked(activeBookings, selectedDate, selectedTimeSlot)) {
      setErrorMessage(`Sorry! Time slot ${selectedTimeSlot} on ${selectedDate} was just booked. Please pick another slot.`);
      return;
    }

    setIsSubmitting(true);

    const bookingRef = `PET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: PetBooking = {
      id: `booking-${Date.now()}`,
      bookingRef,
      serviceId: currentService.id,
      serviceName: currentService.name,
      servicePrice: currentService.price,
      category: currentService.category,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      petType: selectedPetType as any,
      petName,
      petBreed: 'Not specified',
      petAge: '1 Year',
      specialNotes,
      ownerName,
      ownerPhone,
      ownerEmail: 'N/A',
      totalPrice: currentService.price,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    const success = await saveBooking(newBooking);

    if (success) {
      setCompletedBooking(newBooking);
      setStep(4);

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti error:', err);
      }
    } else {
      setErrorMessage('Failed to save booking. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-white text-slate-800 flex flex-col justify-between selection:bg-rose-100 selection:text-rose-700">
      
      <Navbar />

      <div className="flex-1 bg-gradient-to-b from-rose-50/40 via-white to-pink-50/20 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Stepper Header */}
          <div className="mb-8 bg-white p-6 rounded-3xl border border-pink-100 shadow-xs">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pet Appointment Booking 🐾
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Step {step === 4 ? 3 : step} of 3 — {step === 1 ? 'Choose Service' : step === 2 ? 'Choose Date & Time' : step === 3 ? 'Fill Details' : 'Confirmed'}
              </p>
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-3 gap-2 text-center relative max-w-xl mx-auto">
              <div
                onClick={() => step > 1 && step < 4 && setStep(1)}
                className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  step === 1 ? 'text-rose-600 font-black' : step > 1 ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                  step === 1 ? 'bg-rose-500 text-white shadow-xs scale-110' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                </div>
                <span className="text-xs">1. Choose Service</span>
              </div>

              <div
                onClick={() => step > 2 && step < 4 && setStep(2)}
                className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  step === 2 ? 'text-rose-600 font-black' : step > 2 ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                  step === 2 ? 'bg-rose-500 text-white shadow-xs scale-110' : step > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                </div>
                <span className="text-xs">2. Date & Time</span>
              </div>

              <div
                className={`flex flex-col items-center gap-1.5 transition-all ${
                  step === 3 ? 'text-rose-600 font-black' : step === 4 ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                  step === 3 ? 'bg-rose-500 text-white shadow-xs scale-110' : step === 4 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step === 4 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                </div>
                <span className="text-xs">3. Fill Details</span>
              </div>
            </div>

            <div className="w-full max-w-xl mx-auto bg-pink-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className={`h-full bg-rose-500 transition-all duration-300 ${
                step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'
              }`} />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm">
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-1">Step 1: Choose Service & Pet Type</h2>
                  <p className="text-xs text-slate-500 font-medium">Select your pet species and the service you need.</p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold tracking-wider text-rose-600 mb-2">
                    Pet Species
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {petTypes.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedPetType(item.id)}
                        className={`p-3.5 rounded-2xl border text-center transition-all text-xs font-extrabold ${
                          selectedPetType === item.id
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs scale-105'
                            : 'bg-white border-pink-100 text-slate-700 hover:bg-rose-50'
                        }`}
                      >
                        {item.label} {item.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold tracking-wider text-rose-600 mb-2">
                    Select Service
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map((serv) => (
                      <div
                        key={serv.id}
                        onClick={() => setSelectedServiceId(serv.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                          selectedServiceId === serv.id
                            ? 'bg-rose-50 border-rose-400 shadow-xs'
                            : 'bg-white border-pink-100 hover:border-pink-200'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{serv.name}</div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{serv.description}</p>
                          <span className="text-xs font-black text-rose-600 mt-2 block">RM {serv.price} • ~{serv.durationMinutes >= 1440 ? '24h' : `${serv.durationMinutes}m`}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${selectedServiceId === serv.id ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300'}`}>
                          {selectedServiceId === serv.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-white bg-rose-500 hover:bg-rose-600 shadow-md flex items-center gap-2"
                  >
                    <span>Next: Choose Date & Time</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-1">Step 2: Choose Date & Time Slot</h2>
                  <p className="text-xs text-slate-500 font-medium">Grayed-out slots are already taken in real-time.</p>
                </div>

                <div>
                  <label className="text-xs uppercase font-extrabold tracking-wider text-rose-600 flex items-center gap-1.5 mb-2">
                    <CalendarIcon className="w-4 h-4 text-rose-500" />
                    Select Date
                  </label>

                  <div className="grid grid-cols-5 gap-2 overflow-x-auto pb-1">
                    {availableDates.map((item) => (
                      <button
                        key={item.dateString}
                        type="button"
                        onClick={() => {
                          setSelectedDate(item.dateString);
                          setSelectedTimeSlot('');
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                          selectedDate === item.dateString
                            ? 'bg-rose-500 text-white border-rose-500 font-black shadow-xs scale-105'
                            : 'bg-white border-pink-100 text-slate-700 hover:bg-rose-50'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">{item.dayName}</span>
                        <span className="text-lg font-black my-0.5">{item.dayNum}</span>
                        <span className="text-[10px] font-medium opacity-90">{item.monthName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase font-extrabold tracking-wider text-rose-600 flex items-center gap-1.5 mb-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    Available Time Slots ({selectedDate})
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {DEFAULT_TIME_SLOTS.map((slot) => {
                      const booked = isSlotBooked(activeBookings, selectedDate, slot.time);
                      const isSelected = selectedTimeSlot === slot.time;

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={booked}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                            booked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60 line-through'
                              : isSelected
                              ? 'bg-rose-500 text-white border-rose-500 font-extrabold shadow-xs scale-105'
                              : 'bg-white border-pink-100 text-slate-700 hover:border-rose-300 hover:bg-rose-50'
                          }`}
                        >
                          <span className="text-sm font-extrabold">{slot.time}</span>
                          {booked ? (
                            <span className="text-[10px] font-bold text-slate-400 no-underline">Booked</span>
                          ) : (
                            <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-emerald-600'}`}>Available</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">Selected Service</span>
                    <span className="font-extrabold text-slate-900 text-sm">{currentService.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block font-medium">Price</span>
                    <span className="font-black text-rose-600 text-base">RM {currentService.price}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-white text-slate-700 border border-pink-200 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <button
                    type="button"
                    disabled={!selectedTimeSlot}
                    onClick={() => {
                      if (!selectedTimeSlot) return;
                      setStep(3);
                    }}
                    className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
                      selectedTimeSlot
                        ? 'text-white bg-rose-500 hover:bg-rose-600 shadow-md cursor-pointer'
                        : 'text-slate-400 bg-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <span>Next: Fill Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <form onSubmit={handleConfirmBooking} className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-1">Step 3: Fill Details & Confirm</h2>
                  <p className="text-xs text-slate-500 font-medium">Provide your pet name and WhatsApp contact number.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Pet Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Milo, Fluffy"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-slate-900 text-xs focus:border-rose-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Owner Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmad Razak"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-slate-900 text-xs focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +60 12-345 6789"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-slate-900 text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Special Instructions (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Any haircut style preferences, sensitive skin notes..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-slate-900 text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-between text-xs mt-4">
                  <div>
                    <div className="font-extrabold text-rose-700">Appointment Summary</div>
                    <div className="text-slate-600 mt-0.5 font-medium">{currentService.name} • {selectedDate} @ {selectedTimeSlot}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Total</span>
                    <span className="text-xl font-black text-rose-600">RM {currentService.price}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-pink-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 rounded-2xl font-bold text-xs bg-white text-slate-700 border border-pink-200 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-2xl font-black text-xs sm:text-sm text-white bg-rose-500 hover:bg-rose-600 shadow-md flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Confirming...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Confirm & Lock Appointment 🐾</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4 */}
            {step === 4 && completedBooking && (
              <div className="space-y-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 border border-rose-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900">Booking Confirmed! 🎉</h2>
                  <p className="text-xs text-slate-500 mt-1">Ref ID: <span className="font-mono font-bold text-rose-600">{completedBooking.bookingRef}</span></p>
                </div>

                <div className="p-6 rounded-3xl bg-white border-2 border-rose-200 text-left space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                    <span className="font-extrabold text-rose-600 text-xs uppercase">PAWS & WHISKERS PET CLINIC</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{completedBooking.bookingRef}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Service</span>
                      <span className="font-bold text-slate-900">{completedBooking.serviceName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pet Name</span>
                      <span className="font-bold text-slate-900">{completedBooking.petName} ({String(completedBooking.petType).toUpperCase()})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Date & Time</span>
                      <span className="font-bold text-rose-600">{completedBooking.date} @ {completedBooking.timeSlot}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Owner</span>
                      <span className="font-bold text-slate-900">{completedBooking.ownerName}</span>
                    </div>
                  </div>

                  <div className="border-t border-pink-100 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-9 h-9 text-slate-800" />
                      <span className="text-[10px] text-emerald-600 font-bold">Status: CONFIRMED</span>
                    </div>
                    <span className="text-xl font-black text-rose-600">RM {completedBooking.totalPrice}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handlePrint}
                    className="px-5 py-2.5 rounded-2xl font-bold text-xs bg-white text-slate-700 border border-pink-200 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Pass
                  </button>

                  <Link
                    href="/"
                    className="px-6 py-2.5 rounded-2xl font-black text-xs text-white bg-rose-500 hover:bg-rose-600"
                  >
                    Return to Home 🐾
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      <Footer />

    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-500">Loading booking page...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
