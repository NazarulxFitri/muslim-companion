export type PetType = 'dog' | 'cat' | 'rabbit' | 'other';

export type ServiceCategory = 'grooming' | 'vet' | 'surgery' | 'spa_boarding';

export interface PetService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  durationMinutes: number;
  badge?: string;
  popular?: boolean;
  features: string[];
  iconName: string; // Lucide icon name representation
}

export interface BookingAddon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface PetBooking {
  id: string;
  bookingRef: string; // e.g. PET-2026-8942
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  category: ServiceCategory;
  
  // Date & Time
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  
  // Pet Details
  petType: PetType;
  petName: string;
  petBreed: string;
  petAge: string;
  specialNotes?: string;
  
  // Owner Details
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  
  // Financials & Status
  selectedAddons?: string[];
  totalPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string; // ISO string
}

export interface AvailableTimeSlot {
  time: string; // "09:00 AM"
  available: boolean;
  bookedByRef?: string;
  period: 'morning' | 'afternoon' | 'evening';
}
