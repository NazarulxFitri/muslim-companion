import { getMessagingInstance } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications not supported in this browser environment');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');

      // Try registering Firebase Messaging token
      const messaging = await getMessagingInstance();
      if (messaging) {
        try {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
          });
          if (token) {
            console.log('FCM Token generated:', token);
          }
        } catch (err) {
          console.info('FCM Token registration skipped (offline or default config):', err);
        }
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const subscribeToForegroundMessages = async (callback: (payload: unknown) => void) => {
  const messaging = await getMessagingInstance();
  if (messaging) {
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  }
};

export const sendLocalNotification = (title: string, options?: NotificationOptions) => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }
};
