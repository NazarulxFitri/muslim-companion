export type PetType = string;

export type RoomType = string;

export interface BoardingRoomOption {
  id: string;
  targetPetType: string; // e.g. 'dog' | 'cat' | 'rabbit' | 'other'
  name: string;
  pricePerNight: number;
  description: string;
  badge?: string;
  popular?: boolean;
  image: string;
  features: string[];
}

export interface BoardingAddon {
  id: string;
  name: string;
  price: number;
  perNight: boolean;
  description: string;
}

export interface BoardingPetTypeConfig {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

export interface BoardingBooking {
  id: string;
  bookingRef: string; // e.g. BRD-2026-8812
  roomType: RoomType;
  roomName: string;
  pricePerNight: number;
  
  // Date range & Time
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  checkInTime: string; // e.g. "10:00 AM"
  numberOfNights: number;

  // Pet Info
  petType: PetType;
  petName: string;
  petBreed?: string;
  petAge?: string;
  dietaryReqs?: string;
  specialNotes?: string;

  // Owner Info
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;

  // Pricing & Addons
  selectedAddons?: string[];
  totalPrice: number;
  status: 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  createdAt: string; // ISO string
}
