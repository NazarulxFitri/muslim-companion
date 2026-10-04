'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Search, 
  Trash2, 
  Plus, 
  Clock, 
  Edit, 
  ArrowLeft,
  Lock,
  User,
  Key,
  LogOut,
  AlertCircle,
  Scissors,
  PawPrint,
  Heart,
  TrendingUp,
  CheckCircle2,
  PieChart,
  BarChart3,
  ShoppingBag,
  Building2,
  ShieldCheck,
  Sparkles,
  BedDouble,
  Check,
  X,
  Package,
  Sliders,
  DollarSign
} from 'lucide-react';
import { PetBooking, PetService, ServiceCategory } from '../types/booking';
import { subscribeToBookings, updateBookingStatus, deleteBooking, clearAllBookings } from '../services/bookingService';
import { 
  BoardingBooking, 
  BoardingRoomOption, 
  BoardingAddon, 
  BoardingPetTypeConfig 
} from '../types/boarding';
import { 
  subscribeToBoardingBookings, 
  updateBoardingStatus, 
  deleteBoardingBooking, 
  clearAllBoardingBookings 
} from '../services/boardingService';
import { 
  subscribeToServices, 
  saveService, 
  deleteService, 
  subscribeToPetTypes, 
  savePetTypes, 
  PetTypeConfig 
} from '../services/serviceManagement';
import {
  subscribeToBoardingRooms,
  saveBoardingRoom,
  deleteBoardingRoom,
  clearAllBoardingRooms,
  resetBoardingRoomsToDefault,
  subscribeToBoardingPetTypes,
  saveBoardingPetTypes,
  subscribeToBoardingAddons,
  saveBoardingAddon,
  deleteBoardingAddon
} from '../services/boardingManagement';

const AUTH_STORAGE_KEY = 'pet_care_admin_auth_v1';

export default function AdminSecretDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active sidebar tab: overview, bookings, boarding, boardingPackages, services, petTypes
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'boarding' | 'boardingPackages' | 'services' | 'petTypes'>('overview');

  // Real-time state
  const [bookings, setBookings] = useState<PetBooking[]>([]);
  const [boardingBookings, setBoardingBookings] = useState<BoardingBooking[]>([]);
  const [services, setServices] = useState<PetService[]>([]);
  const [petTypes, setPetTypes] = useState<PetTypeConfig[]>([]);

  // Boarding Setup Real-time state
  const [boardingRooms, setBoardingRooms] = useState<BoardingRoomOption[]>([]);
  const [boardingPetTypes, setBoardingPetTypes] = useState<BoardingPetTypeConfig[]>([]);
  const [boardingAddons, setBoardingAddons] = useState<BoardingAddon[]>([]);

  // Search & Filter (Normal Bookings)
  const [searchBooking, setSearchBooking] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Search & Filter (Boarding Bookings)
  const [searchBoarding, setSearchBoarding] = useState('');
  const [boardingStatusFilter, setBoardingStatusFilter] = useState<'all' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'>('all');

  // Service Edit / Add Form Modal
  const [editingService, setEditingService] = useState<PetService | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Boarding Room Edit / Add Form Modal
  const [editingBoardingRoom, setEditingBoardingRoom] = useState<BoardingRoomOption | null>(null);
  const [roomFeaturesInput, setRoomFeaturesInput] = useState('');
  const [isBoardingRoomModalOpen, setIsBoardingRoomModalOpen] = useState(false);

  // Boarding Addon Edit / Add Modal
  const [editingAddon, setEditingAddon] = useState<BoardingAddon | null>(null);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);

  // New Pet Type input state (Clinic)
  const [newPetLabel, setNewPetLabel] = useState('');
  const [newPetIcon, setNewPetIcon] = useState('🐾');

  // New Pet Type input state (Boarding)
  const [newBoardingPetLabel, setNewBoardingPetLabel] = useState('');
  const [newBoardingPetIcon, setNewBoardingPetIcon] = useState('🐾');

  // Species filter for boarding suites (all, dog, cat, rabbit, other...)
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubBookings = subscribeToBookings((data) => setBookings(data));
    const unsubBoarding = subscribeToBoardingBookings((data) => setBoardingBookings(data));
    const unsubServices = subscribeToServices((data) => setServices(data));
    const unsubPetTypes = subscribeToPetTypes((data) => setPetTypes(data));

    const unsubRooms = subscribeToBoardingRooms((data) => setBoardingRooms(data));
    const unsubBoardingPets = subscribeToBoardingPetTypes((data) => setBoardingPetTypes(data));
    const unsubAddons = subscribeToBoardingAddons((data) => setBoardingAddons(data));

    return () => {
      unsubBookings();
      unsubBoarding();
      unsubServices();
      unsubPetTypes();
      unsubRooms();
      unsubBoardingPets();
      unsubAddons();
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (usernameInput === 'admin' && passwordInput === 'password') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      }
    } else {
      setLoginError('Invalid username or password. (Use: admin / password)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  // Filtered Normal Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.ownerName.toLowerCase().includes(searchBooking.toLowerCase()) ||
      b.petName.toLowerCase().includes(searchBooking.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchBooking.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchBooking.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Boarding Bookings
  const filteredBoardingBookings = boardingBookings.filter((b) => {
    const matchesSearch = 
      b.ownerName.toLowerCase().includes(searchBoarding.toLowerCase()) ||
      b.petName.toLowerCase().includes(searchBoarding.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchBoarding.toLowerCase()) ||
      b.roomName.toLowerCase().includes(searchBoarding.toLowerCase());

    const matchesStatus = boardingStatusFilter === 'all' || b.status === boardingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Infographics Data (Service + Boarding)
  const validServiceBookings = bookings.filter(b => b.status !== 'cancelled');
  const validBoardingBookings = boardingBookings.filter(b => b.status !== 'cancelled');
  
  const serviceRevenue = validServiceBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const boardingRevenue = validBoardingBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const grandTotalRevenue = serviceRevenue + boardingRevenue;

  const totalOrders = bookings.length + boardingBookings.length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length + boardingBookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length + boardingBookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length + boardingBookings.filter(b => b.status === 'cancelled').length;
  
  const totalValidCount = validServiceBookings.length + validBoardingBookings.length;
  const avgOrderValue = totalValidCount > 0 ? Math.round(grandTotalRevenue / totalValidCount) : 0;

  // Species infographic breakdown
  const speciesCounts: Record<string, number> = {};
  [...validServiceBookings, ...validBoardingBookings].forEach(b => {
    const sp = String(b.petType || 'Other').toUpperCase();
    speciesCounts[sp] = (speciesCounts[sp] || 0) + 1;
  });

  // -------------------------
  // Handlers: Clinic Services
  // -------------------------
  const handleSaveServiceForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name || editingService.price <= 0) return;

    await saveService(editingService);
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const handleOpenAddService = () => {
    setEditingService({
      id: `service-${Date.now()}`,
      name: '',
      category: 'grooming',
      description: '',
      price: 30,
      durationMinutes: 45,
      features: ['Professional Care'],
      iconName: 'Scissors'
    });
    setIsServiceModalOpen(true);
  };

  const handleAddPetType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetLabel) return;
    const newId = newPetLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
    const updated = [...petTypes, { id: newId, label: newPetLabel, icon: newPetIcon || '🐾' }];
    await savePetTypes(updated);
    setNewPetLabel('');
  };

  const handleDeletePetType = async (id: string) => {
    if (confirm('Delete this pet species for clinic services?')) {
      const updated = petTypes.filter(p => p.id !== id);
      await savePetTypes(updated);
    }
  };

  // -------------------------
  // Handlers: Boarding Setup
  // -------------------------
  const handleOpenAddBoardingRoom = () => {
    const defaultSpecies = selectedSpeciesFilter === 'all' ? 'dog' : selectedSpeciesFilter;
    setEditingBoardingRoom({
      id: `room-${Date.now()}`,
      targetPetType: defaultSpecies,
      name: '',
      pricePerNight: defaultSpecies === 'dog' ? 65 : defaultSpecies === 'cat' ? 50 : 35,
      description: '',
      badge: 'Comfort Stay',
      popular: false,
      image: defaultSpecies === 'dog' ? '🐶' : defaultSpecies === 'cat' ? '🐱' : '🏨',
      features: ['Private Climate-Controlled Cabin', 'Daily WhatsApp Updates', '2x Play Sessions']
    });
    setRoomFeaturesInput('Private Climate-Controlled Cabin\nDaily WhatsApp Updates\n2x Play Sessions');
    setIsBoardingRoomModalOpen(true);
  };

  const handleOpenEditBoardingRoom = (room: BoardingRoomOption) => {
    setEditingBoardingRoom({ ...room, targetPetType: room.targetPetType || 'dog' });
    setRoomFeaturesInput((room.features || []).join('\n'));
    setIsBoardingRoomModalOpen(true);
  };

  const handleSaveBoardingRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoardingRoom || !editingBoardingRoom.name || editingBoardingRoom.pricePerNight <= 0) return;

    const parsedFeatures = roomFeaturesInput
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const roomToSave: BoardingRoomOption = {
      ...editingBoardingRoom,
      features: parsedFeatures.length > 0 ? parsedFeatures : ['Standard Hotel Care']
    };

    await saveBoardingRoom(roomToSave);
    setIsBoardingRoomModalOpen(false);
    setEditingBoardingRoom(null);
  };

  const handleDeleteBoardingRoom = async (roomId: string) => {
    if (confirm('Are you sure you want to delete this boarding suite package?')) {
      await deleteBoardingRoom(roomId);
    }
  };

  // Toggle accepted pet species for hotel
  const handleToggleBoardingPet = async (petId: string) => {
    const updated = boardingPetTypes.map(p => {
      if (p.id === petId) {
        return { ...p, enabled: !p.enabled };
      }
      return p;
    });
    await saveBoardingPetTypes(updated);
  };

  const handleAddBoardingPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardingPetLabel) return;
    const newId = newBoardingPetLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
    const updated = [
      ...boardingPetTypes,
      { id: newId, label: newBoardingPetLabel, icon: newBoardingPetIcon || '🐾', enabled: true }
    ];
    await saveBoardingPetTypes(updated);
    setNewBoardingPetLabel('');
  };

  // Addon Handlers
  const handleOpenAddAddon = () => {
    setEditingAddon({
      id: `addon-${Date.now()}`,
      name: '',
      price: 10,
      perNight: true,
      description: ''
    });
    setIsAddonModalOpen(true);
  };

  const handleSaveAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddon || !editingAddon.name || editingAddon.price < 0) return;
    await saveBoardingAddon(editingAddon);
    setIsAddonModalOpen(false);
    setEditingAddon(null);
  };

  const handleDeleteAddon = async (addonId: string) => {
    if (confirm('Delete this boarding add-on?')) {
      await deleteBoardingAddon(addonId);
    }
  };

  // ==========================================
  // LOGIN SCREEN (SLEEK PROFESSIONAL DARK THEME)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#090D16] text-slate-100 flex items-center justify-center p-4 selection:bg-rose-500/30 selection:text-rose-200 relative overflow-hidden">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative w-full max-w-sm bg-[#111726]/90 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fade-in">
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/50 mx-auto border border-rose-400/20">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] font-semibold text-rose-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Restricted Access
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">Admin Executive Portal</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Paws & Whiskers Management Console</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-2 text-left animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-900/30 transition-all cursor-pointer mt-2"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
            Demo Credentials: <span className="font-mono text-slate-300 font-semibold">admin</span> / <span className="font-mono text-slate-300 font-semibold">password</span>
          </div>

        </div>
      </main>
    );
  }

  // ==========================================
  // LOGGED IN: PROFESSIONAL SLATE DASHBOARD
  // ==========================================
  return (
    <main className="min-h-screen bg-[#090D16] text-slate-200 flex flex-col md:flex-row selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* PROFESSIONAL DARK SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0E1422] border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 shadow-xl z-10">
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white font-bold shadow-md shadow-rose-950/60 border border-rose-400/20">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-black text-sm text-white block leading-tight tracking-tight">Admin Console</span>
              <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Paws & Whiskers
              </span>
            </div>
          </div>

          {/* Navigation Links Grouped into Data & Operations vs Configuration */}
          <nav className="space-y-6 text-xs font-semibold">
            
            {/* GROUP 1: LIVE DATA & OPERATIONS */}
            <div className="space-y-1.5">
              <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3 text-slate-500" />
                <span>Live Operations & Data</span>
              </div>

              {/* Overview & Analytics */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className={`w-4 h-4 ${activeTab === 'overview' ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>Overview & Analytics</span>
                </div>
              </button>

              {/* Service Bookings */}
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>Service Bookings</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'bookings' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {bookings.length}
                </span>
              </button>

              {/* Hotel Reservations */}
              <button
                onClick={() => setActiveTab('boarding')}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'boarding'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className={`w-4 h-4 ${activeTab === 'boarding' ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>Hotel Reservations</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'boarding' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {boardingBookings.length}
                </span>
              </button>
            </div>

            {/* GROUP 2: SYSTEM CONFIGURATION & CATALOG */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
              <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-slate-500" />
                <span>System Configuration</span>
              </div>

              {/* Hotel Suites & Rates */}
              <button
                onClick={() => setActiveTab('boardingPackages')}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'boardingPackages'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BedDouble className={`w-4 h-4 ${activeTab === 'boardingPackages' ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>Hotel Suites & Rates</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'boardingPackages' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {boardingRooms.length}
                </span>
              </button>

              {/* Clinic Services & Rates */}
              <button
                onClick={() => setActiveTab('services')}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Scissors className={`w-4 h-4 ${activeTab === 'services' ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>Clinic Services & Rates</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'services' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {services.length}
                </span>
              </button>

              {/* Clinic Pet Species */}
              <button
                onClick={() => setActiveTab('petTypes')}
                className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'petTypes'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PawPrint className={`w-4 h-4 ${activeTab === 'petTypes' ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>Clinic Pet Species</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'petTypes' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {petTypes.length}
                </span>
              </button>
            </div>

          </nav>

        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-6 border-t border-slate-800/80 space-y-2">
          <Link
            href="/"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-2 border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4 text-rose-400" />
            <span>Back to Main Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/50 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* SLEEK MAIN CONTENT AREA */}
      <div className="flex-1 p-6 sm:p-8 max-w-6xl overflow-y-auto">
        
        {/* TAB 0: OVERVIEW & INFOGRAPHICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Dashboard Overview & Analytics
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Real-time monitoring of revenue streams, hourly treatments, and hotel boarding stays.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111726] border border-slate-800 text-xs text-slate-300 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Enabled
              </div>
            </div>

            {/* Top 4 Infographic Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Revenue */}
              <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800/80 shadow-md space-y-2 hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">RM {grandTotalRevenue}</div>
                <p className="text-[11px] text-emerald-400/90 font-medium">Services (RM {serviceRevenue}) + Hotel (RM {boardingRevenue})</p>
              </div>

              {/* Card 2: Total Orders */}
              <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800/80 shadow-md space-y-2 hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">{totalOrders}</div>
                <p className="text-[11px] text-slate-400 font-medium">Services ({bookings.length}) • Hotel Boarding ({boardingBookings.length})</p>
              </div>

              {/* Card 3: Pending Confirmed */}
              <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800/80 shadow-md space-y-2 hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Upcoming</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">{confirmedCount}</div>
                <p className="text-[11px] text-amber-400/90 font-medium">Confirmed appointments & stays</p>
              </div>

              {/* Card 4: Completed */}
              <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800/80 shadow-md space-y-2 hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white tracking-tight">{completedCount}</div>
                <p className="text-[11px] text-sky-400/90 font-medium">Completed treatments & check-outs</p>
              </div>

            </div>

            {/* Infographics Breakdown Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sales Metrics Card */}
              <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800/80 shadow-md space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-rose-400" />
                  Sales Metrics Breakdown
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-800/80">
                    <span className="text-slate-400 font-medium">Average Order Value (AOV):</span>
                    <span className="font-bold text-white text-sm">RM {avgOrderValue}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 border-b border-slate-800/80">
                    <span className="text-slate-400 font-medium">Service Revenue:</span>
                    <span className="font-bold text-emerald-400 text-sm">RM {serviceRevenue}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 border-b border-slate-800/80">
                    <span className="text-slate-400 font-medium">Boarding Hotel Revenue:</span>
                    <span className="font-bold text-rose-400 text-sm">RM {boardingRevenue}</span>
                  </div>

                  <div className="flex justify-between items-center py-2.5 border-b border-slate-800/80">
                    <span className="text-slate-400 font-medium">Cancelled Reservations:</span>
                    <span className="font-bold text-rose-400 text-sm">{cancelledCount} Cancelled</span>
                  </div>
                </div>
              </div>

              {/* Bookings by Pet Species Infographic */}
              <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800/80 shadow-md space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-rose-400" />
                  Bookings by Pet Species
                </h3>

                {Object.keys(speciesCounts).length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    No active pet bookings recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {Object.entries(speciesCounts).map(([species, count]) => {
                      const pct = Math.round((count / totalValidCount) * 100);
                      return (
                        <div key={species} className="space-y-1.5">
                          <div className="flex justify-between font-semibold text-slate-200">
                            <span>{species}</span>
                            <span className="text-slate-400">{count} Bookings ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 1: STANDARD SERVICE BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Hourly Service Bookings</h1>
                <p className="text-xs text-slate-400 font-medium mt-1">Customer grooming, vet checkups, and surgical appointments.</p>
              </div>

              {bookings.length > 0 && (
                <button
                  onClick={async () => {
                    if (confirm('Clear ALL hourly service bookings from Firestore?')) await clearAllBookings();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  Clear All Service Bookings
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="bg-[#111726] p-4 rounded-2xl border border-slate-800/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search owner, pet, or REF..."
                  value={searchBooking}
                  onChange={(e) => setSearchBooking(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {st} ({st === 'all' ? bookings.length : bookings.filter(b => b.status === st).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#111726] rounded-3xl border border-slate-800/80 shadow-md overflow-hidden">
              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30 text-rose-400" />
                  <p className="text-sm font-bold text-slate-300">No service bookings found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0D121F] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800/80">
                      <tr>
                        <th className="p-4">Ref & Service</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Pet & Owner</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-bold text-rose-400 block">{b.bookingRef}</span>
                            <span className="font-bold text-white text-sm">{b.serviceName}</span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-200 block">{b.date}</span>
                            <span className="text-slate-400 font-medium">{b.timeSlot}</span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-200 block">{b.petName} ({String(b.petType).toUpperCase()})</span>
                            <span className="text-slate-400">{b.ownerName} • {b.ownerPhone}</span>
                          </td>

                          <td className="p-4 font-black text-rose-400 text-sm">
                            RM {b.totalPrice}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : b.status === 'completed'
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20 line-through'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>

                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => updateBookingStatus(b.id, 'completed')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 transition-colors cursor-pointer"
                              >
                                Complete
                              </button>
                            )}

                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={() => deleteBooking(b.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PET HOTEL BOARDING RESERVATIONS */}
        {activeTab === 'boarding' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Pet Hotel Boarding Reservations</h1>
                <p className="text-xs text-slate-400 font-medium mt-1">Manage customer overnight stays, check-in dates, and suites.</p>
              </div>

              {boardingBookings.length > 0 && (
                <button
                  onClick={async () => {
                    if (confirm('Clear ALL pet hotel boarding reservations from Firestore?')) await clearAllBoardingBookings();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  Clear All Boarding Reservations
                </button>
              )}
            </div>

            {/* Filter Bar */}
            <div className="bg-[#111726] p-4 rounded-2xl border border-slate-800/80 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search suite, owner, or HOTEL ref..."
                  value={searchBoarding}
                  onChange={(e) => setSearchBoarding(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(['all', 'confirmed', 'checked_in', 'completed', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setBoardingStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      boardingStatusFilter === st
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {st.replace('_', ' ')} ({st === 'all' ? boardingBookings.length : boardingBookings.filter(b => b.status === st).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#111726] rounded-3xl border border-slate-800/80 shadow-md overflow-hidden">
              {filteredBoardingBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30 text-rose-400" />
                  <p className="text-sm font-bold text-slate-300">No hotel boarding reservations found.</p>
                  <p className="text-xs mt-1 text-slate-500">Reservations placed by pet owners on `/boarding` will appear here in real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0D121F] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800/80">
                      <tr>
                        <th className="p-4">Ref & Room Suite</th>
                        <th className="p-4">Stay Dates</th>
                        <th className="p-4">Pet & Owner</th>
                        <th className="p-4">Nights / Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredBoardingBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-bold text-rose-400 block">{b.bookingRef}</span>
                            <span className="font-bold text-white text-sm">{b.roomName}</span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-200 block">{b.checkInDate} → {b.checkOutDate}</span>
                            <span className="text-slate-400 font-medium">Check-In: {b.checkInTime}</span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-200 block">{b.petName} ({String(b.petType).toUpperCase()})</span>
                            <span className="text-slate-400">{b.ownerName} • {b.ownerPhone}</span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-300 block">{b.numberOfNights} Nights</span>
                            <span className="font-black text-rose-400 text-sm">RM {b.totalPrice}</span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : b.status === 'checked_in'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : b.status === 'completed'
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20 line-through'
                              }`}
                            >
                              {b.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => updateBoardingStatus(b.id, 'checked_in')}
                                className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 transition-colors cursor-pointer"
                              >
                                Check In
                              </button>
                            )}

                            {(b.status === 'confirmed' || b.status === 'checked_in') && (
                              <button
                                onClick={() => updateBoardingStatus(b.id, 'completed')}
                                className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 transition-colors cursor-pointer"
                              >
                                Check Out
                              </button>
                            )}

                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => updateBoardingStatus(b.id, 'cancelled')}
                                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              onClick={() => deleteBoardingBooking(b.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2.5: HOTEL SUITES, RATES & ACCEPTED PETS CONFIGURATION */}
        {activeTab === 'boardingPackages' && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <BedDouble className="w-6 h-6 text-rose-400" />
                  Pet Hotel Suites & Rates Configuration
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Setup room packages, nightly pricing, accepted pet species for hotel stays, and add-on amenities.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  onClick={async () => {
                    if (confirm('Reset hotel suites to 4 clean defaults (2 Dog, 2 Cat)?')) {
                      await resetBoardingRoomsToDefault();
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  title="Reset to 4 clean default suites"
                >
                  Reset Clean Defaults
                </button>

                <button
                  onClick={async () => {
                    if (confirm('Clear ALL hotel room suites?')) {
                      await clearAllBoardingRooms();
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                >
                  Clear All
                </button>

                <button
                  onClick={handleOpenAddBoardingRoom}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Suite</span>
                </button>
              </div>
            </div>

            {/* 1. SUITES & ROOM PACKAGES LIST (CATEGORIZED BY SPECIES) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Package className="w-4 h-4 text-rose-400" />
                    Species-Tailored Room Suites & Rates
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dogs, Cats, and Rabbits each have distinct packages, spaces, and nightly rates.
                  </p>
                </div>
              </div>

              {/* Species Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedSpeciesFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSpeciesFilter === 'all'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  All Suites ({boardingRooms.length})
                </button>
                {boardingPetTypes.map((pt) => {
                  const count = boardingRooms.filter(r => (r.targetPetType || '').toLowerCase() === pt.id.toLowerCase()).length;
                  const active = selectedSpeciesFilter === pt.id;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => setSelectedSpeciesFilter(pt.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{pt.icon}</span>
                      <span>{pt.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        active ? 'bg-white/25 text-white' : 'bg-slate-700/60 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Suites Grid */}
              {(() => {
                const filteredRooms = boardingRooms.filter(r => {
                  if (selectedSpeciesFilter === 'all') return true;
                  return (r.targetPetType || '').toLowerCase() === selectedSpeciesFilter.toLowerCase();
                });

                if (filteredRooms.length === 0) {
                  return (
                    <div className="p-8 rounded-3xl bg-[#111726] border border-slate-800/80 text-center text-slate-400 text-xs">
                      No suites configured for this species yet. Click &quot;Add Boarding Suite&quot; to create one!
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRooms.map((room) => (
                      <div 
                        key={room.id}
                        className="p-5 rounded-3xl bg-[#111726] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700/80 transition-all relative"
                      >
                        {room.badge && (
                          <span className="absolute -top-2.5 right-4 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                            {room.badge}
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">{room.image || '🏨'}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                {room.targetPetType || 'dog'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-black text-rose-400 block">
                                RM {room.pricePerNight}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase">per night</span>
                            </div>
                          </div>

                          <h3 className="font-extrabold text-base text-white">{room.name}</h3>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{room.description}</p>
                          
                          {/* Features list preview */}
                          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Included Amenities:</span>
                            {(room.features || []).slice(0, 3).map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span className="truncate">{feat}</span>
                              </div>
                            ))}
                            {(room.features || []).length > 3 && (
                              <span className="text-[10px] text-slate-500 italic block">
                                +{(room.features || []).length - 3} more amenities
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditBoardingRoom(room)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700/60 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit Suite & Price
                          </button>

                          <button
                            onClick={() => handleDeleteBoardingRoom(room.id)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete suite"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* 2. ACCEPTED PET SPECIES FOR HOTEL BOARDING */}
            <div className="space-y-4 pt-6 border-t border-slate-800/80">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-rose-400" />
                  Accepted Pet Species for Hotel Stays
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Toggle which pets are accepted for overnight hotel check-ins. Disabled species will be hidden on the boarding booking wizard.
                </p>
              </div>

              {/* Add Custom Boarding Pet Form */}
              <div className="bg-[#111726] p-4 rounded-2xl border border-slate-800/80 shadow-md">
                <form onSubmit={handleAddBoardingPet} className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="New Boarding Species (e.g. Guinea Pig)..."
                    value={newBoardingPetLabel}
                    onChange={(e) => setNewBoardingPetLabel(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none flex-1 min-w-[200px] max-w-xs transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Emoji (🐹)"
                    value={newBoardingPetIcon}
                    onChange={(e) => setNewBoardingPetIcon(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none w-20 text-center transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/50 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Allowed Pet
                  </button>
                </form>
              </div>

              {/* Grid of Boarding Pets with Toggle Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {boardingPetTypes.map((pt) => {
                  const isAccepted = pt.enabled !== false;
                  return (
                    <div 
                      key={pt.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isAccepted 
                          ? 'bg-[#111726] border-slate-800/80 shadow-md' 
                          : 'bg-slate-900/40 border-slate-800/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{pt.icon}</span>
                        <div>
                          <span className="font-bold text-xs text-white block leading-tight">{pt.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {pt.id}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isAccepted ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {isAccepted ? 'Accepted' : 'Not Accepted'}
                        </span>

                        <button
                          onClick={() => handleToggleBoardingPet(pt.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isAccepted
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isAccepted ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. BOARDING ADD-ONS & AMENITIES */}
            <div className="space-y-4 pt-6 border-t border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-rose-400" />
                    Boarding Add-ons & Amenities ({boardingAddons.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Optional extras pet parents can add to their reservation (e.g., HD Camera stream, organic snacks, departure bath).
                  </p>
                </div>

                <button
                  onClick={handleOpenAddAddon}
                  className="px-3.5 py-2 rounded-xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-400" />
                  <span>Add Extra Add-on</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {boardingAddons.map((addon) => (
                  <div key={addon.id} className="p-4 rounded-2xl bg-[#111726] border border-slate-800/80 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-rose-400">
                          RM {addon.price}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                          {addon.perNight ? 'Per Night' : 'Flat Fee'}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-white leading-snug">{addon.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{addon.description}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingAddon({ ...addon });
                          setIsAddonModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/60 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteAddon(addon.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete addon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: SERVICES MANAGEMENT (CLINIC) */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Services & Pricing</h1>
                <p className="text-xs text-slate-400 font-medium mt-1">Configure service catalogue, categories, and real-time rates.</p>
              </div>

              <button
                onClick={handleOpenAddService}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <div key={s.id} className="p-5 rounded-3xl bg-[#111726] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700/80 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {s.category}
                      </span>
                      <span className="text-lg font-black text-rose-400">RM {s.price}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-white">{s.name}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{s.description}</p>
                    
                    <div className="mt-3 text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Duration: {s.durationMinutes} mins</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingService(s);
                        setIsServiceModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Price / Info
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm(`Delete service "${s.name}"?`)) await deleteService(s.id);
                      }}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: CLINIC PET SPECIES MANAGEMENT */}
        {activeTab === 'petTypes' && (
          <div className="space-y-6 animate-fade-in">
            
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Clinic Allowed Pet Species</h1>
              <p className="text-xs text-slate-400 font-medium mt-1">Species selectable during hourly customer booking.</p>
            </div>

            <div className="bg-[#111726] p-6 rounded-3xl border border-slate-800/80 shadow-md space-y-4">
              <form onSubmit={handleAddPetType} className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Species Name (e.g. Bird)..."
                  value={newPetLabel}
                  onChange={(e) => setNewPetLabel(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none flex-1 min-w-[200px] max-w-xs transition-colors"
                />
                <input
                  type="text"
                  placeholder="Emoji (🦜)"
                  value={newPetIcon}
                  onChange={(e) => setNewPetIcon(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none w-20 text-center transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/50 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Species
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {petTypes.map((pt) => (
                <div key={pt.id} className="p-4 rounded-2xl bg-[#111726] border border-slate-800/80 shadow-md flex items-center justify-between hover:border-slate-700/80 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{pt.icon}</span>
                    <span className="font-bold text-sm text-white">{pt.label}</span>
                  </div>

                  <button
                    onClick={() => handleDeletePetType(pt.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete species"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* --------------------------------------------- */}
      {/* MODAL 1: Edit / Add Boarding Suite Package    */}
      {/* --------------------------------------------- */}
      {isBoardingRoomModalOpen && editingBoardingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111726] rounded-3xl p-6 max-w-lg w-full border border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-rose-400" />
              {editingBoardingRoom.id.startsWith('room-') ? 'Add New Boarding Suite' : 'Edit Boarding Suite & Price'}
            </h3>

            <form onSubmit={handleSaveBoardingRoom} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Pet Species</label>
                <select
                  value={editingBoardingRoom.targetPetType || 'dog'}
                  onChange={(e) => setEditingBoardingRoom({ ...editingBoardingRoom, targetPetType: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white focus:border-rose-500 focus:outline-none transition-colors cursor-pointer capitalize"
                >
                  {boardingPetTypes.map((pt) => (
                    <option key={pt.id} value={pt.id} className="bg-[#0B0F19] text-white">
                      {pt.icon} {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Suite Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deluxe Glass Suite"
                    value={editingBoardingRoom.name}
                    onChange={(e) => setEditingBoardingRoom({ ...editingBoardingRoom, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Emoji / Icon</label>
                  <input
                    type="text"
                    required
                    placeholder="🏰"
                    value={editingBoardingRoom.image}
                    onChange={(e) => setEditingBoardingRoom({ ...editingBoardingRoom, image: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white text-center text-sm focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price Per Night (RM)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingBoardingRoom.pricePerNight}
                    onChange={(e) => setEditingBoardingRoom({ ...editingBoardingRoom, pricePerNight: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Highlight Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Most Popular"
                    value={editingBoardingRoom.badge || ''}
                    onChange={(e) => setEditingBoardingRoom({ ...editingBoardingRoom, badge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Suite Description</label>
                <textarea
                  rows={2}
                  placeholder="Spacious glass cabin with multi-level tree & orthopedic bedding..."
                  value={editingBoardingRoom.description}
                  onChange={(e) => setEditingBoardingRoom({ ...editingBoardingRoom, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Included Amenities & Features (One per line)
                </label>
                <textarea
                  rows={4}
                  placeholder={"Private 24/7 Air-Conditioned Cabin\nDaily WhatsApp Photo & Video\n2x Daily Playground Session"}
                  value={roomFeaturesInput}
                  onChange={(e) => setRoomFeaturesInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none font-mono text-xs transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBoardingRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-950/50 transition-colors cursor-pointer"
                >
                  Save Suite Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* MODAL 2: Edit / Add Boarding Add-on           */}
      {/* --------------------------------------------- */}
      {isAddonModalOpen && editingAddon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111726] rounded-3xl p-6 max-w-md w-full border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white">
              {editingAddon.id.startsWith('addon-') && !editingAddon.name ? 'Add Boarding Add-on' : 'Edit Boarding Add-on'}
            </h3>

            <form onSubmit={handleSaveAddon} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Add-on Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24/7 HD Webcam Access"
                  value={editingAddon.name}
                  onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price (RM)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingAddon.price}
                    onChange={(e) => setEditingAddon({ ...editingAddon, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pricing Scheme</label>
                  <select
                    value={editingAddon.perNight ? 'perNight' : 'flat'}
                    onChange={(e) => setEditingAddon({ ...editingAddon, perNight: e.target.value === 'perNight' })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white focus:border-rose-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="perNight">Per Night</option>
                    <option value="flat">Flat Fee (One-off)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Stream live video feed directly to pet owner's mobile..."
                  value={editingAddon.description}
                  onChange={(e) => setEditingAddon({ ...editingAddon, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-950/50 transition-colors cursor-pointer"
                >
                  Save Add-on
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* MODAL 3: Edit / Add Clinic Hourly Service     */}
      {/* --------------------------------------------- */}
      {isServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111726] rounded-3xl p-6 max-w-md w-full border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white">
              {editingService.id.startsWith('service-') ? 'Add New Service' : 'Edit Service & Pricing'}
            </h3>

            <form onSubmit={handleSaveServiceForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price (RM)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    required
                    value={editingService.durationMinutes}
                    onChange={(e) => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value as ServiceCategory })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white focus:border-rose-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="grooming" className="bg-[#0B0F19] text-white">Grooming</option>
                  <option value="vet" className="bg-[#0B0F19] text-white">Veterinary Medical</option>
                  <option value="surgery" className="bg-[#0B0F19] text-white">Surgery & Neuter</option>
                  <option value="spa_boarding" className="bg-[#0B0F19] text-white">Spa & Hotel Boarding</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-950/50 transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
