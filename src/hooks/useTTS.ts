'use client';

import { useState, useCallback, useEffect } from 'react';
import { speak, stopSpeaking, isTtsSupported } from '@/lib/tts';
import { Locale } from '@/lib/types';

export function useTTS(locale: Locale, speed: number) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isTtsSupported());
  }, []);

  const toggle = useCallback(
    (text: string) => {
      if (isSpeaking) {
        stopSpeaking();
        setIsSpeaking(false);
      } else {
        speak(text, locale, speed);
        setIsSpeaking(true);

        // Listen for end of speech
        const checkInterval = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsSpeaking(false);
            clearInterval(checkInterval);
          }
        }, 200);
      }
    },
    [isSpeaking, locale, speed]
  );

  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, toggle, stop, supported };
}
