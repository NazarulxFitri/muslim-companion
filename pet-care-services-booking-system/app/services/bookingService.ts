import { db } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { PetBooking } from '../types/booking';

const LOCAL_STORAGE_KEY = 'pet_care_bookings_cache_v2';

export function getOffsetDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

// Initial sample bookings set to EMPTY as requested by user
export const INITIAL_PRESEEDED_BOOKINGS: PetBooking[] = [];

function getLocalCache(): PetBooking[] {
  if (typeof window === 'undefined') return [];
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cached) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(cached);
  } catch (e) {
    console.warn('LocalStorage error:', e);
    return [];
  }
}

function saveLocalCache(bookings: PetBooking[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn('LocalStorage write error:', e);
  }
}

/**
 * Subscribe to real-time Firestore bookings updates
 */
export function subscribeToBookings(onUpdate: (bookings: PetBooking[]) => void): () => void {
  onUpdate(getLocalCache());

  try {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreBookings: PetBooking[] = [];
        snapshot.forEach((docSnap) => {
          firestoreBookings.push(docSnap.data() as PetBooking);
        });

        saveLocalCache(firestoreBookings);
        onUpdate(firestoreBookings);
      },
      (error) => {
        console.warn('Firestore snapshot error (using local cache mode):', error);
        onUpdate(getLocalCache());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firebase error, using local state:', err);
    return () => {};
  }
}

/**
 * Save new booking to Firestore and local state
 */
export async function saveBooking(booking: PetBooking): Promise<boolean> {
  const current = getLocalCache();
  const updated = [booking, ...current];
  saveLocalCache(updated);

  try {
    const docRef = doc(db, 'bookings', booking.id);
    await setDoc(docRef, booking);
    return true;
  } catch (err) {
    console.warn('Firestore save failed, saved to local cache:', err);
    return true;
  }
}

/**
 * Update booking status (confirmed, completed, cancelled)
 */
export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'completed' | 'cancelled'): Promise<boolean> {
  const current = getLocalCache();
  const updated = current.map((b) => (b.id === bookingId ? { ...b, status } : b));
  saveLocalCache(updated);

  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, { status });
    return true;
  } catch (err) {
    console.warn('Firestore update failed, updated local cache:', err);
    return true;
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<boolean> {
  return updateBookingStatus(bookingId, 'cancelled');
}

/**
 * Delete a booking record
 */
export async function deleteBooking(bookingId: string): Promise<boolean> {
  const current = getLocalCache();
  const updated = current.filter((b) => b.id !== bookingId);
  saveLocalCache(updated);

  try {
    const docRef = doc(db, 'bookings', bookingId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore delete failed:', err);
    return true;
  }
}

/**
 * Clear all bookings
 */
export async function clearAllBookings(): Promise<boolean> {
  saveLocalCache([]);

  try {
    const bookingsCol = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsCol);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'bookings', docSnap.id));
    }
    return true;
  } catch (err) {
    console.warn('Firestore clear all error:', err);
    return true;
  }
}

/**
 * Check if a time slot is booked
 */
export function isSlotBooked(bookings: PetBooking[], date: string, timeSlot: string): boolean {
  return bookings.some(
    (b) => b.date === date && b.timeSlot === timeSlot && b.status !== 'cancelled'
  );
}
