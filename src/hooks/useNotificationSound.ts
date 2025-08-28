
import { Howl } from 'howler';
import { useCallback } from 'react';

// It's a good practice to load the sound once and reuse the instance.
// This check ensures it only runs on the client-side.
const sound = typeof window !== 'undefined' 
    ? new Howl({
        src: ['/sounds/notification.mp3'],
        volume: 0.5, // Adjust volume as needed
      })
    : null;

export const useNotificationSound = () => {
  const playNotification = useCallback(() => {
    if (sound) {
      sound.play();
    }
  }, []);

  return { playNotification };
};
