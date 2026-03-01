import { useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';

const sounds = {
  engine: '/assets/sounds/engine.mp3',
  gearshift: '/assets/sounds/gearshift.mp3',
  nitro: '/assets/sounds/nitro.mp3',
  countdown: '/assets/sounds/countdown.mp3',
  correct: '/assets/sounds/correct.mp3',
  wrong: '/assets/sounds/wrong.mp3',
  finish: '/assets/sounds/finish.mp3'
};

export function useAudio() {
  const soundsRef = useRef({});
  const enabledRef = useRef(true);

  useEffect(() => {
    // Preload sounds
    Object.entries(sounds).forEach(([key, src]) => {
      soundsRef.current[key] = new Howl({
        src: [src],
        volume: 0.5,
        preload: true
      });
    });

    return () => {
      Object.values(soundsRef.current).forEach(sound => sound.unload());
    };
  }, []);

  const play = useCallback((soundName, options = {}) => {
    if (!enabledRef.current) return;
    
    const sound = soundsRef.current[soundName];
    if (sound) {
      if (options.loop) sound.loop(true);
      if (options.volume) sound.volume(options.volume);
      sound.play();
    }
  }, []);

  const stop = useCallback((soundName) => {
    const sound = soundsRef.current[soundName];
    if (sound) {
      sound.stop();
    }
  }, []);

  const stopAll = useCallback(() => {
    Object.values(soundsRef.current).forEach(sound => sound.stop());
  }, []);

  const setEnabled = useCallback((enabled) => {
    enabledRef.current = enabled;
    if (!enabled) stopAll();
  }, [stopAll]);

  return { play, stop, stopAll, setEnabled };
}