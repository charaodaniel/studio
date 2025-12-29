
'use client';

import { Howl } from 'howler';
import { useCallback, useMemo, useEffect, useState } from 'react';

export const useNotificationSound = () => {
  const [sound, setSound] = useState<Howl | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // This prevents the "window is not defined" error during server-side rendering.
    const soundInstance = new Howl({
      src: ['https://cdn.freesound.org/previews/253/253886_3234390-lq.mp3'],
      html5: true, // Recommended for cross-origin audio
      volume: 0.5, // Adjust volume as needed
    });
    
    setSound(soundInstance);

    // Cleanup function to unload the sound when the component unmounts
    return () => {
      soundInstance.unload();
    };
  }, []); // Empty dependency array means this runs only once on mount.

  const playNotification = useCallback(() => {
    if (sound && !sound.playing()) {
      sound.play();
    }
  }, [sound]);

  return { playNotification };
};
