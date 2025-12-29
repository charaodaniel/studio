
import { Howl } from 'howler';
import { useCallback, useMemo } from 'react';

export const useNotificationSound = () => {
  // useMemo ensures the Howl instance is created only once per component lifecycle.
  const sound = useMemo(() => {
    // This check ensures it only runs on the client-side.
    if (typeof window === 'undefined') return null;

    return new Howl({
      src: ['https://cdn.freesound.org/previews/253/253886_3234390-lq.mp3'],
      html5: true, // Recommended for cross-origin audio
      volume: 0.5, // Adjust volume as needed
    });
  }, []); // Empty dependency array means this runs only once.

  const playNotification = useCallback(() => {
    if (sound && !sound.playing()) {
      sound.play();
    }
  }, [sound]);

  return { playNotification };
};
