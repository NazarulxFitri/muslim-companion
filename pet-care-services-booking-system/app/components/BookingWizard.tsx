'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Printer,
  QrCode,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PET_SERVICES, DEFAULT_TIME_SLOTS } from '../data/petServices';
import { PetBooking, PetType } from '../types/booking';
import { isSlotBooked, saveBooking, getOffsetDateString } from '../services/bookingService';

interface BookingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
  activeBookings: PetBooking[];
  onBookingSuccess: () => void;
}

export default function BookingWizard({
  isOpen,
  onClose,
  initialServiceId,
  activeBookings,
  onBookingSuccess
}: BookingWizardProps) {
  const [step, setStep] = useState<number>(1);
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || PET_SERVICES[0].id);
  const [petType, setPetType] = useState<PetType>('dog');
  
  const [selectedDate, setSelectedDate] = useState<string>(getOffsetDateString(1));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  const [petName, setPetName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerPhone, setOwnerPhone] = useState<string>('');

  const [completedBooking, setCompletedBooking] = useState<PetBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
    }
  }, [initialServiceId]);

  if (!isOpen) return null;

  const currentService = PET_SERVICES.find(s => s.id === selectedServiceId) || PET_SERVICES[0];

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
      setErrorMessage('Please complete all required fields (Pet Name, Owner Name, Phone, Date & Time).');
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
      petType,
      petName,
      petBreed: 'N/A',
      petAge: '1 Year',
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
      onBookingSuccess();

      try {
        confetti({
          particleCount: 80,
          spread: 60,
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
    <div className="fixed inset-[#0] z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-md bg-slate-900/40 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-pink-100 shadow-2xl overflow-hidden text-slate-800 my-auto">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-rose-50/80 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4.5 h-4.5 fill-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Book Pet Appointment</h2>
              <p className="text-xs text-slate-500 font-semibold">Step {step} of 3 — {step === 1 ? 'Select Service' : step === 2 ? 'Date & Time' : step === 3 ? 'Contact Info' : 'Confirmed'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white hover:bg-rose-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors border border-pink-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-pink-100/60 h-1.5 flex">
          <div className={`h-full bg-rose-500 transition-all duration-300 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="m-5 mb-0 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: SERVICE & PET TYPE */}
          {step === 1 && (
            <div className="space-y-5">
              
              {/* Pet Type */}
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-rose-600 mb-2">
                  1. Pet Species
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { type: 'dog', label: 'Dog 🐶' },
                    { type: 'cat', label: 'Cat 🐱' },
                    { type: 'rabbit', label: 'Rabbit 🐰' },
                    { type: 'other', label: 'Other 🐾' }
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setPetType(item.type as PetType)}
                      className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                        petType === item.type
                          ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                          : 'bg-white border-pink-100 text-slate-700 hover:bg-rose-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service List */}
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-rose-600 mb-2">
                  2. Select Service
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {PET_SERVICES.map((serv) => (
                    <div
                      key={serv.id}
                      onClick={() => setSelectedServiceId(serv.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedServiceId === serv.id
                          ? 'bg-rose-50 border-rose-400 shadow-xs'
                          : 'bg-white border-pink-100 hover:border-pink-200'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">{serv.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">~{serv.durationMinutes >= 1440 ? '24h' : `${serv.durationMinutes} mins`}</div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-rose-600">${serv.price}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedServiceId === serv.id ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300'}`}>
                          {selectedServiceId === serv.id && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: DATE & TIME SLOT PICKER */}
          {step === 2 && (
            <div className="space-y-5">
              
              {/* Date Horizontal Picker */}
              <div>
                <label className="text-xs uppercase font-extrabold tracking-wider text-rose-600 flex items-center gap-1.5 mb-2">
                  <CalendarIcon className="w-3.5 h-3.5" />
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
                      className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center ${
                        selectedDate === item.dateString
                          ? 'bg-rose-500 text-white border-rose-500 font-black shadow-xs scale-105'
                          : 'bg-white border-pink-100 text-slate-700 hover:bg-rose-50'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-90">{item.dayName}</span>
                      <span className="text-base font-black my-0.5">{item.dayNum}</span>
                      <span className="text-[9px] font-medium opacity-90">{item.monthName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="text-xs uppercase font-extrabold tracking-wider text-rose-600 flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  Select Time Slot ({selectedDate})
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const booked = isSlotBooked(activeBookings, selectedDate, slot.time);
                    const isSelected = selectedTimeSlot === slot.time;

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={booked}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                          booked
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60 line-through'
                            : isSelected
                            ? 'bg-rose-500 text-white border-rose-500 font-extrabold shadow-xs scale-105'
                            : 'bg-white border-pink-100 text-slate-700 hover:border-rose-300 hover:bg-rose-50'
                        }`}
                      >
                        <span className="text-xs font-extrabold">{slot.time}</span>
                        {booked ? (
                          <span className="text-[9px] font-bold text-slate-400 no-underline">Booked</span>
                        ) : (
                          <span className={`text-[9px] font-bold ${isSelected ? 'text-white' : 'text-emerald-600'}`}>Available</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: CONTACT DETAILS */}
          {step === 3 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Pet Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milo"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-slate-900 text-xs focus:border-rose-400 focus:outline-none"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-slate-900 text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">WhatsApp Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +60 12-345 6789"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-slate-900 text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs mt-4">
                <div>
                  <div className="font-extrabold text-slate-900">{currentService.name}</div>
                  <div className="text-slate-500 font-medium">{selectedDate} @ {selectedTimeSlot}</div>
                </div>
                <div className="text-right font-black text-rose-600 text-base">
                  ${currentService.price}
                </div>
              </div>

            </form>
          )}

          {/* STEP 4: TICKET CONFIRMATION */}
          {step === 4 && completedBooking && (
            <div className="space-y-4 text-center">
              
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 text-rose-600 border border-rose-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Booking Confirmed! 🎉</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ref: <span className="font-mono font-bold text-rose-600">{completedBooking.bookingRef}</span></p>
              </div>

              <div className="p-5 rounded-2xl bg-white border-2 border-rose-200 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-pink-100 pb-2.5">
                  <span className="font-extrabold text-rose-600 text-xs">PAWS & WHISKERS 🐾</span>
                  <span className="font-mono font-bold text-slate-700">{completedBooking.bookingRef}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Service</span>
                    <span className="font-bold text-slate-900">{completedBooking.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pet Name</span>
                    <span className="font-bold text-slate-900">{completedBooking.petName}</span>
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
                    <QrCode className="w-8 h-8 text-slate-800" />
                    <span className="text-[10px] text-emerald-600 font-bold">Status: CONFIRMED</span>
                  </div>
                  <span className="text-lg font-black text-rose-600">${completedBooking.totalPrice}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-white text-slate-700 border border-pink-200 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Pass
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl font-bold text-xs text-white bg-rose-500 hover:bg-rose-600"
                >
                  Done 🐾
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Controls */}
        {step < 4 && (
          <div className="px-6 py-3.5 bg-rose-50/60 border-t border-pink-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="px-3.5 py-2 rounded-xl font-bold text-xs bg-white text-slate-700 border border-pink-200 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              {step === 1 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 rounded-xl font-extrabold text-xs text-white bg-rose-500 hover:bg-rose-600 shadow-xs flex items-center gap-1"
                >
                  Pick Date & Time
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  disabled={!selectedTimeSlot}
                  onClick={() => {
                    if (!selectedTimeSlot) return;
                    setStep(3);
                  }}
                  className={`px-5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1 transition-all ${
                    selectedTimeSlot
                      ? 'text-white bg-rose-500 hover:bg-rose-600 shadow-xs cursor-pointer'
                      : 'text-slate-400 bg-slate-200 cursor-not-allowed'
                  }`}
                >
                  Enter Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="px-6 py-2 rounded-xl font-extrabold text-xs text-white bg-rose-500 hover:bg-rose-600 shadow-xs"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm & Get Pass 🐾'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
