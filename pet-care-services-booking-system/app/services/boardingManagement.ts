import { db } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { BoardingRoomOption, BoardingAddon, BoardingPetTypeConfig } from '../types/boarding';
import { BOARDING_ROOMS as DEFAULT_ROOMS, BOARDING_ADDONS as DEFAULT_ADDONS } from '../data/boardingData';

const BOARDING_ROOMS_CACHE_KEY = 'pet_care_dynamic_boarding_rooms_v3';
const BOARDING_PETS_CACHE_KEY = 'pet_care_dynamic_boarding_pets_v3';
const BOARDING_ADDONS_CACHE_KEY = 'pet_care_dynamic_boarding_addons_v3';
const BOARDING_INITIALIZED_KEY = 'pet_care_boarding_init_v3';

export const DEFAULT_BOARDING_PETS: BoardingPetTypeConfig[] = [
  { id: 'dog', label: 'Dog / Canine', icon: '🐶', enabled: true },
  { id: 'cat', label: 'Cat / Feline', icon: '🐱', enabled: true },
  { id: 'rabbit', label: 'Rabbit / Bunny', icon: '🐰', enabled: true },
  { id: 'other', label: 'Other Exotic Pet', icon: '🐾', enabled: true }
];

// ==========================================
// 1. BOARDING ROOMS / PACKAGES MANAGEMENT
// ==========================================

function getBoardingRoomsCache(): BoardingRoomOption[] {
  if (typeof window === 'undefined') return DEFAULT_ROOMS;
  try {
    const cached = localStorage.getItem(BOARDING_ROOMS_CACHE_KEY);
    if (!cached) {
      localStorage.setItem(BOARDING_ROOMS_CACHE_KEY, JSON.stringify(DEFAULT_ROOMS));
      return DEFAULT_ROOMS;
    }
    return JSON.parse(cached);
  } catch (e) {
    return DEFAULT_ROOMS;
  }
}

function saveBoardingRoomsCache(rooms: BoardingRoomOption[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOARDING_ROOMS_CACHE_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.warn(e);
  }
}

export function subscribeToBoardingRooms(onUpdate: (rooms: BoardingRoomOption[]) => void): () => void {
  onUpdate(getBoardingRoomsCache());

  try {
    const colRef = collection(db, 'boardingRooms');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: BoardingRoomOption[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as BoardingRoomOption);
        });

        saveBoardingRoomsCache(items);
        onUpdate(items);
      },
      (err) => {
        console.warn('Firestore boardingRooms error:', err);
        onUpdate(getBoardingRoomsCache());
      }
    );

    return unsubscribe;
  } catch (err) {
    return () => {};
  }
}

export async function seedInitialBoardingRooms() {
  try {
    for (const room of DEFAULT_ROOMS) {
      await setDoc(doc(db, 'boardingRooms', room.id), room);
    }
  } catch (e) {
    console.warn('Seed boarding rooms error:', e);
  }
}

export async function saveBoardingRoom(room: BoardingRoomOption): Promise<boolean> {
  const current = getBoardingRoomsCache();
  const index = current.findIndex(r => r.id === room.id);
  let updated: BoardingRoomOption[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = room;
  } else {
    updated = [...current, room];
  }
  saveBoardingRoomsCache(updated);

  try {
    const docRef = doc(db, 'boardingRooms', room.id);
    await setDoc(docRef, room);
    return true;
  } catch (err) {
    console.warn('Firestore boardingRoom save failed:', err);
    return true;
  }
}

export async function deleteBoardingRoom(roomId: string): Promise<boolean> {
  // Mark as initialized so empty state doesn't trigger re-seed
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOARDING_INITIALIZED_KEY, 'true');
  }

  const current = getBoardingRoomsCache();
  const updated = current.filter(r => r.id !== roomId);
  saveBoardingRoomsCache(updated);

  try {
    const docRef = doc(db, 'boardingRooms', roomId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    return true;
  }
}

export async function clearAllBoardingRooms(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOARDING_INITIALIZED_KEY, 'true');
    localStorage.setItem(BOARDING_ROOMS_CACHE_KEY, JSON.stringify([]));
  }
  try {
    const colRef = collection(db, 'boardingRooms');
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (err) {
    console.warn('Clear boarding rooms error:', err);
    return true;
  }
}

export async function resetBoardingRoomsToDefault(): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOARDING_INITIALIZED_KEY, 'true');
    localStorage.setItem(BOARDING_ROOMS_CACHE_KEY, JSON.stringify(DEFAULT_ROOMS));
  }
  try {
    const colRef = collection(db, 'boardingRooms');
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    for (const room of DEFAULT_ROOMS) {
      await setDoc(doc(db, 'boardingRooms', room.id), room);
    }
    return true;
  } catch (err) {
    console.warn('Reset boarding rooms error:', err);
    return true;
  }
}

// ==========================================
// 2. ACCEPTED BOARDING PET TYPES
// ==========================================

function getBoardingPetTypesCache(): BoardingPetTypeConfig[] {
  if (typeof window === 'undefined') return DEFAULT_BOARDING_PETS;
  try {
    const cached = localStorage.getItem(BOARDING_PETS_CACHE_KEY);
    if (!cached) {
      localStorage.setItem(BOARDING_PETS_CACHE_KEY, JSON.stringify(DEFAULT_BOARDING_PETS));
      return DEFAULT_BOARDING_PETS;
    }
    return JSON.parse(cached);
  } catch (e) {
    return DEFAULT_BOARDING_PETS;
  }
}

function saveBoardingPetTypesCache(petTypes: BoardingPetTypeConfig[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOARDING_PETS_CACHE_KEY, JSON.stringify(petTypes));
  } catch (e) {
    console.warn(e);
  }
}

export function subscribeToBoardingPetTypes(onUpdate: (petTypes: BoardingPetTypeConfig[]) => void): () => void {
  onUpdate(getBoardingPetTypesCache());

  try {
    const colRef = collection(db, 'settings');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        let petTypesData = getBoardingPetTypesCache();
        snapshot.forEach((docSnap) => {
          if (docSnap.id === 'boardingPetTypes') {
            petTypesData = docSnap.data().list as BoardingPetTypeConfig[];
          }
        });
        saveBoardingPetTypesCache(petTypesData);
        onUpdate(petTypesData);
      },
      (err) => {
        onUpdate(getBoardingPetTypesCache());
      }
    );
    return unsubscribe;
  } catch (e) {
    return () => {};
  }
}

export async function saveBoardingPetTypes(petTypes: BoardingPetTypeConfig[]): Promise<boolean> {
  saveBoardingPetTypesCache(petTypes);
  try {
    const docRef = doc(db, 'settings', 'boardingPetTypes');
    await setDoc(docRef, { list: petTypes });
    return true;
  } catch (err) {
    return true;
  }
}

// ==========================================
// 3. BOARDING ADDONS & AMENITIES
// ==========================================

function getBoardingAddonsCache(): BoardingAddon[] {
  if (typeof window === 'undefined') return DEFAULT_ADDONS;
  try {
    const cached = localStorage.getItem(BOARDING_ADDONS_CACHE_KEY);
    if (!cached) {
      localStorage.setItem(BOARDING_ADDONS_CACHE_KEY, JSON.stringify(DEFAULT_ADDONS));
      return DEFAULT_ADDONS;
    }
    return JSON.parse(cached);
  } catch (e) {
    return DEFAULT_ADDONS;
  }
}

function saveBoardingAddonsCache(addons: BoardingAddon[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOARDING_ADDONS_CACHE_KEY, JSON.stringify(addons));
  } catch (e) {
    console.warn(e);
  }
}

export function subscribeToBoardingAddons(onUpdate: (addons: BoardingAddon[]) => void): () => void {
  onUpdate(getBoardingAddonsCache());

  try {
    const colRef = collection(db, 'boardingAddons');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: BoardingAddon[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as BoardingAddon);
        });

        saveBoardingAddonsCache(items);
        onUpdate(items);
      },
      (err) => {
        onUpdate(getBoardingAddonsCache());
      }
    );
    return unsubscribe;
  } catch (e) {
    return () => {};
  }
}

async function seedInitialBoardingAddons() {
  try {
    for (const addon of DEFAULT_ADDONS) {
      await setDoc(doc(db, 'boardingAddons', addon.id), addon);
    }
  } catch (e) {
    console.warn('Seed addons error:', e);
  }
}

export async function saveBoardingAddon(addon: BoardingAddon): Promise<boolean> {
  const current = getBoardingAddonsCache();
  const index = current.findIndex(a => a.id === addon.id);
  let updated: BoardingAddon[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = addon;
  } else {
    updated = [...current, addon];
  }
  saveBoardingAddonsCache(updated);

  try {
    const docRef = doc(db, 'boardingAddons', addon.id);
    await setDoc(docRef, addon);
    return true;
  } catch (err) {
    return true;
  }
}

export async function deleteBoardingAddon(addonId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pet_care_addons_init_v3', 'true');
  }
  const current = getBoardingAddonsCache();
  const updated = current.filter(a => a.id !== addonId);
  saveBoardingAddonsCache(updated);

  try {
    const docRef = doc(db, 'boardingAddons', addonId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    return true;
  }
}
