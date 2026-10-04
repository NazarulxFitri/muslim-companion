'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  BedDouble, 
  Moon, 
  Info,
  Check,
  Building2
} from 'lucide-react';
import { CHECK_IN_TIMES } from '../data/boardingData';
import { BoardingBooking, PetType, RoomType, BoardingRoomOption, BoardingAddon, BoardingPetTypeConfig } from '../types/boarding';
import { saveBoardingBooking } from '../services/boardingService';
import { 
  subscribeToBoardingRooms, 
  subscribeToBoardingPetTypes, 
  subscribeToBoardingAddons 
} from '../services/boardingManagement';

export default function BoardingWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Dynamic Room Packages, Accepted Pet Types, and Addons from Admin
  const [boardingRooms, setBoardingRooms] = useState<BoardingRoomOption[]>([]);
  const [boardingPetTypes, setBoardingPetTypes] = useState<BoardingPetTypeConfig[]>([]);
  const [boardingAddons, setBoardingAddons] = useState<BoardingAddon[]>([]);

  // Form State
  const [selectedRoomId, setSelectedRoomId] = useState<RoomType>('deluxe');
  const [petType, setPetType] = useState<PetType>('cat');
  
  // Date calculation defaults: Tomorrow to 3 days later
  const defaultCheckIn = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const defaultCheckOut = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkInDate, setCheckInDate] = useState<string>(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(defaultCheckOut);
  const [checkInTime, setCheckInTime] = useState<string>('11:00 AM');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['addon-live-webcam']);

  // Pet & Owner Details
  const [petName, setPetName] = useState<string>('');
  const [petBreed, setPetBreed] = useState<string>('');
  const [petAge, setPetAge] = useState<string>('');
  const [dietaryReqs, setDietaryReqs] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerPhone, setOwnerPhone] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');

  // Confirmation State
  const [createdBooking, setCreatedBooking] = useState<BoardingBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Subscribe to live admin configuration
  useEffect(() => {
    const unsubRooms = subscribeToBoardingRooms((rooms) => {
      setBoardingRooms(rooms);
      if (rooms.length > 0 && !rooms.some(r => r.id === selectedRoomId)) {
        setSelectedRoomId(rooms[0].id);
      }
    });

    const unsubPets = subscribeToBoardingPetTypes((pets) => {
      const activePets = pets.filter(p => p.enabled !== false);
      setBoardingPetTypes(activePets);
      if (activePets.length > 0 && !activePets.some(p => p.id === petType)) {
        setPetType(activePets[0].id);
      }
    });

    const unsubAddons = subscribeToBoardingAddons((addons) => {
      setBoardingAddons(addons);
    });

    return () => {
      unsubRooms();
      unsubPets();
      unsubAddons();
    };
  }, []);

  // Boarding suites tailored specifically for selected pet species (dog vs cat vs rabbit etc.)
  const availableRoomsForPet = useMemo(() => {
    const filtered = boardingRooms.filter((r) => (r.targetPetType || '').toLowerCase() === petType.toLowerCase());
    return filtered.length > 0 ? filtered : boardingRooms;
  }, [boardingRooms, petType]);

  // Sync selectedRoomId whenever petType changes or rooms load
  useEffect(() => {
    if (availableRoomsForPet.length > 0) {
      if (!availableRoomsForPet.some(r => r.id === selectedRoomId)) {
        setSelectedRoomId(availableRoomsForPet[0].id);
      }
    }
  }, [petType, availableRoomsForPet, selectedRoomId]);

  // Calculations
  const room = availableRoomsForPet.find((r) => r.id === selectedRoomId) || availableRoomsForPet[0] || boardingRooms[0] || {
    id: 'standard',
    targetPetType: petType,
    name: 'Standard Suite',
    pricePerNight: 35,
    description: '',
    image: '🏡',
    features: []
  };

  const numberOfNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  const basePrice = room.pricePerNight * numberOfNights;

  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, addonId) => {
      const item = boardingAddons.find((a) => a.id === addonId);
      if (!item) return sum;
      return sum + (item.perNight ? item.price * numberOfNights : item.price);
    }, 0);
  }, [selectedAddons, numberOfNights, boardingAddons]);

  const grandTotal = basePrice + addonsTotal;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNextToStep2 = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextToStep3 = () => {
    if (!checkInDate || !checkOutDate) {
      setErrorMsg('Please select valid check-in and check-out dates.');
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setErrorMsg('Check-out date must be after check-in date.');
      return;
    }
    setErrorMsg('');
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !ownerPhone || !petName) {
      setErrorMsg('Please complete all required fields (Owner Name, Phone, and Pet Name).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `HOTEL-${new Date().getFullYear()}-${randomDigits}`;

    const newBooking: BoardingBooking = {
      id: `brd_${Date.now()}`,
      bookingRef,
      roomType: room.id,
      roomName: room.name,
      pricePerNight: room.pricePerNight,
      checkInDate,
      checkOutDate,
      checkInTime,
      numberOfNights,
      petType,
      petName,
      petBreed,
      petAge,
      dietaryReqs,
      specialNotes,
      ownerName,
      ownerPhone,
      ownerEmail,
      selectedAddons,
      totalPrice: grandTotal,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    const success = await saveBoardingBooking(newBooking);
    setIsSubmitting(false);

    if (success) {
      setCreatedBooking(newBooking);
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMsg('Failed to save booking. Please try again.');
    }
  };

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-rose-50 to-white border-b border-pink-100 py-10 px-4 mb-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold mb-3">
            <Building2 className="w-4 h-4 text-rose-600" />
            <span>Pet Hotel & Luxury Boarding Resort</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Reserve Your Pet&apos;s Hotel Suite 🏨
          </h1>
          <p className="mt-2 text-slate-600 text-sm max-w-xl mx-auto">
            Separately scheduled date-range booking system with 24/7 video monitoring, climate-controlled rooms & luxury pampering.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Stepper Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-rose-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />

            {/* Steps */}
            {[
              { num: 1, title: 'Choose Suite' },
              { num: 2, title: 'Dates & Addons' },
              { num: 3, title: 'Pet & Owner' },
              { num: 4, title: 'Hotel Ticket' }
            ].map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs ${
                      isDone
                        ? 'bg-rose-500 text-white'
                        : isCurrent
                        ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isDone ? <Check className="w-5 h-5" /> : step.num}
                  </div>
                  <span
                    className={`text-xs mt-2 font-semibold ${
                      isCurrent || isDone ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Select Room Suite & Pet Species */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Choose Pet Type */}
            <div>
              <label className="block text-sm font-extrabold text-slate-900 mb-3">
                1. Select Pet Species
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {boardingPetTypes.map((pt) => {
                  const active = petType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setPetType(pt.id)}
                      className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                        active
                          ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                          : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="text-3xl">{pt.icon}</span>
                      <span className="text-xs font-extrabold text-slate-900">{pt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Choose Room Suite tailored to Pet Species */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>2. Select Boarding Suite</span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 capitalize">
                    For {petType}
                  </span>
                </label>
                <span className="text-xs font-bold text-slate-500">All prices per night (RM)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {availableRoomsForPet.map((rm) => {
                  const active = selectedRoomId === rm.id;
                  return (
                    <div
                      key={rm.id}
                      onClick={() => setSelectedRoomId(rm.id)}
                      className={`cursor-pointer rounded-2xl border-2 p-5 transition-all relative flex flex-col justify-between ${
                        active
                          ? 'border-rose-500 bg-white shadow-md ring-2 ring-rose-500/20'
                          : 'border-slate-200 bg-white hover:border-rose-200 hover:shadow-xs'
                      }`}
                    >
                      {rm.badge && (
                        <span className={`absolute -top-3 left-4 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          rm.popular ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'
                        }`}>
                          {rm.badge}
                        </span>
                      )}

                      <div>
                        <div className="text-3xl mb-2">{rm.image}</div>
                        <h3 className="font-extrabold text-slate-900 text-base">{rm.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                          {rm.description}
                        </p>

                        <div className="mb-4">
                          <span className="text-2xl font-black text-rose-600">RM {rm.pricePerNight}</span>
                          <span className="text-xs text-slate-400 font-bold"> / night</span>
                        </div>

                        <ul className="space-y-2 border-t border-slate-100 pt-3">
                          {rm.features.map((feat, idx) => (
                            <li key={idx} className="flex items-center text-[11px] text-slate-600 gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        className={`mt-6 w-full py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                          active
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {active ? 'Selected Suite ✓' : 'Choose Suite'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNextToStep2}
                className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Continue to Dates & Addons</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Check-In / Check-Out Dates & Addons */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-bold block uppercase tracking-wider">Selected Suite</span>
                <span className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  {room.image} {room.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-rose-600">RM {room.pricePerNight}</span>
                <span className="text-xs text-slate-500 font-bold block">/ night</span>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>Check-In Date</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <span>Check-Out Date</span>
                </label>
                <input
                  type="date"
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Night Summary Banner */}
            <div className="bg-rose-50/70 border border-pink-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Total Stay Duration</span>
                  <span className="text-sm font-bold text-rose-700">
                    {numberOfNights} {numberOfNights === 1 ? 'Night' : 'Nights'} ({checkInDate} → {checkOutDate})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-bold block">Base Room Price</span>
                <span className="text-lg font-black text-slate-900">RM {basePrice}</span>
              </div>
            </div>

            {/* Check-in Dropoff Time */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Preferred Check-In Arrival Time</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CHECK_IN_TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCheckInTime(t)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      checkInTime === t
                        ? 'border-rose-500 bg-rose-500 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Boarding Addons */}
            <div>
              <label className="block text-sm font-extrabold text-slate-900 mb-3">
                Enhance Your Pet Stay (Optional Add-ons)
              </label>
              <div className="space-y-3">
                {boardingAddons.map((addon) => {
                  const selected = selectedAddons.includes(addon.id);
                  const priceText = addon.perNight
                    ? `RM ${addon.price} / night`
                    : `RM ${addon.price} flat fee`;

                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                        selected
                          ? 'border-rose-500 bg-rose-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          selected ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">{addon.name}</span>
                          <span className="text-[11px] text-slate-500">{addon.description}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-rose-600 shrink-0 ml-4">
                        {priceText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>{room.name} ({numberOfNights} nights x RM {room.pricePerNight})</span>
                <span>RM {basePrice}</span>
              </div>
              {addonsTotal > 0 && (
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Selected Addons</span>
                  <span>RM {addonsTotal}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-black">
                <span>Estimated Total</span>
                <span className="text-rose-400 text-xl font-black">RM {grandTotal}</span>
              </div>
            </div>

            {/* Nav Buttons */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextToStep3}
                className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Continue to Pet & Owner Info</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pet & Owner Info */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmitBooking} className="space-y-6">
            {/* Pet Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Pet Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luna"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Breed (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Persian / Golden Retriever"
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pet Age (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Years"
                    value={petAge}
                    onChange={(e) => setPetAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dietary / Food Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wet food twice a day, 1 scoop kibble at night"
                  value={dietaryReqs}
                  onChange={(e) => setDietaryReqs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Care or Medical Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Shy around large dogs, allergic to chicken treats"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Owner Contact Info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-rose-500" />
                <span>Owner Contact Info</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmad Razak"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 012-3456789"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email (Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ahmad@example.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
              <span>{room.name} ({numberOfNights} Nights)</span>
              <span className="text-rose-600 text-base font-black">Total: RM {grandTotal}</span>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Reserving Suite...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Hotel Boarding Reservation (RM {grandTotal})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Hotel Confirmation Card */}
        {currentStep === 4 && createdBooking && (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Hotel Reservation Confirmed! 🎉</h2>
              <p className="text-slate-500 text-xs mt-1">
                Your pet&apos;s luxury suite has been reserved. Please keep your Hotel Pass reference below.
              </p>
            </div>

            {/* Digital Hotel Ticket */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-xl text-left relative overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-2 text-xs font-black flex justify-between items-center -mx-6 -mt-6 mb-5">
                <span>🏨 PAWS & WHISKERS PET RESORT</span>
                <span className="bg-rose-500 text-white px-2.5 py-0.5 rounded-full text-[10px]">
                  CONFIRMED
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Booking Reference</span>
                    <span className="text-lg font-black text-rose-600">{createdBooking.bookingRef}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Stay</span>
                    <span className="text-sm font-extrabold text-slate-900">{createdBooking.numberOfNights} Nights</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Check-In Date</span>
                    <span className="text-xs font-extrabold text-slate-900">{createdBooking.checkInDate}</span>
                    <span className="text-[10px] text-slate-500 block">at {createdBooking.checkInTime}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Check-Out Date</span>
                    <span className="text-xs font-extrabold text-slate-900">{createdBooking.checkOutDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pet Name & Type</span>
                    <span className="text-xs font-extrabold text-slate-900">{createdBooking.petName} ({createdBooking.petType.toUpperCase()})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suite Category</span>
                    <span className="text-xs font-extrabold text-slate-900">{createdBooking.roomName}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Owner</span>
                    <span className="text-xs font-bold text-slate-800">{createdBooking.ownerName} ({createdBooking.ownerPhone})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Paid / Due</span>
                    <span className="text-lg font-black text-rose-600">RM {createdBooking.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <a
                href="/"
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all"
              >
                Return to Homepage
              </a>
              <button
                type="button"
                onClick={() => {
                  setCreatedBooking(null);
                  setCurrentStep(1);
                }}
                className="px-6 py-3 rounded-xl bg-rose-500 text-white font-extrabold text-xs hover:bg-rose-600 transition-all"
              >
                Book Another Suite
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
