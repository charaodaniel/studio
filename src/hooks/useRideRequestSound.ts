
'use client';

import { Howl } from 'howler';
import { useCallback, useMemo } from 'react';

export const useRideRequestSound = () => {
    // useMemo ensures the Howl instance is created only once.
    const sound = useMemo(() => {
        if (typeof window === 'undefined') return null;
        
        return new Howl({
            src: ['/olha-a-mensagem.mp3'], // Assumes the file is in the /public directory
            html5: true,
            volume: 0.8,
            loop: true, // Loop the sound
        });
    }, []);

    const playRideRequestSound = useCallback(() => {
        if (sound && !sound.playing()) {
            sound.play();
        }
    }, [sound]);

    const stopRideRequestSound = useCallback(() => {
        if (sound && sound.playing()) {
            sound.stop();
        }
    }, [sound]);

    return { playRideRequestSound, stopRideRequestSound };
};
