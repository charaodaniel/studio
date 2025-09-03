
import { Howl } from 'howler';
import { useCallback } from 'react';

// It's a good practice to load the sound once and reuse the instance.
// This check ensures it only runs on the client-side.
// Loading from a public URL to ensure the file is always available.
const sound = typeof window !== 'undefined' 
    ? new Howl({
        src: ['https://cdn.freesound.org/previews/253/253886_3234390-lq.mp3'],
        html5: true, // Recommended for cross-origin audio
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
