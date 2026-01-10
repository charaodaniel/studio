
'use client';

import { Howl } from 'howler';
import { useCallback, useState, useEffect } from 'react';

export const useNotificationSound = () => {
  const [sound, setSound] = useState<Howl | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    // This prevents the "window is not defined" error during server-side rendering.
    // O link antigo (freesound) estava quebrado (404), substituído por um link funcional.
    const soundInstance = new Howl({
      src: ['https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg'],
      html5: true, 
      volume: 0.5,
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
