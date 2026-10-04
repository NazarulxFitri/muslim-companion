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
import { BoardingBooking } from '../types/boarding';

const LOCAL_STORAGE_KEY = 'pet_boarding_bookings_cache_v1';

function getLocalCache(): BoardingBooking[] {
  if (typeof window === 'undefined') return [];
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cached) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(cached);
  } catch (e) {
    console.warn('LocalStorage boarding error:', e);
    return [];
  }
}

function saveLocalCache(bookings: BoardingBooking[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.warn('LocalStorage boarding write error:', e);
  }
}

/**
 * Subscribe to real-time Boarding Bookings
 */
export function subscribeToBoardingBookings(onUpdate: (bookings: BoardingBooking[]) => void): () => void {
  onUpdate(getLocalCache());

  try {
    const boardingCol = collection(db, 'boardingBookings');
    const q = query(boardingCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreBookings: BoardingBooking[] = [];
        snapshot.forEach((docSnap) => {
          firestoreBookings.push(docSnap.data() as BoardingBooking);
        });

        saveLocalCache(firestoreBookings);
        onUpdate(firestoreBookings);
      },
      (error) => {
        console.warn('Firestore boarding snapshot error (using local cache):', error);
        onUpdate(getLocalCache());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Firebase boarding error, using local state:', err);
    return () => {};
  }
}

/**
 * Save new Boarding Booking
 */
export async function saveBoardingBooking(booking: BoardingBooking): Promise<boolean> {
  const current = getLocalCache();
  const updated = [booking, ...current];
  saveLocalCache(updated);

  try {
    const docRef = doc(db, 'boardingBookings', booking.id);
    await setDoc(docRef, booking);
    return true;
  } catch (err) {
    console.warn('Firestore boarding save failed, saved to local cache:', err);
    return true;
  }
}

/**
 * Update boarding status
 */
export async function updateBoardingStatus(
  bookingId: string, 
  status: 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
): Promise<boolean> {
  const current = getLocalCache();
  const updated = current.map((b) => (b.id === bookingId ? { ...b, status } : b));
  saveLocalCache(updated);

  try {
    const docRef = doc(db, 'boardingBookings', bookingId);
    await updateDoc(docRef, { status });
    return true;
  } catch (err) {
    console.warn('Firestore boarding update failed, updated local cache:', err);
    return true;
  }
}

/**
 * Delete boarding booking record
 */
export async function deleteBoardingBooking(bookingId: string): Promise<boolean> {
  const current = getLocalCache();
  const updated = current.filter((b) => b.id !== bookingId);
  saveLocalCache(updated);

  try {
    const docRef = doc(db, 'boardingBookings', bookingId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Firestore boarding delete failed:', err);
    return true;
  }
}

/**
 * Clear all boarding bookings
 */
export async function clearAllBoardingBookings(): Promise<boolean> {
  saveLocalCache([]);

  try {
    const boardingCol = collection(db, 'boardingBookings');
    const snapshot = await getDocs(boardingCol);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'boardingBookings', docSnap.id));
    }
    return true;
  } catch (err) {
    console.warn('Firestore clear all boarding error:', err);
    return true;
  }
}
