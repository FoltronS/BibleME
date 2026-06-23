'use client';

import { useState, useCallback, useEffect } from 'react';
import { startListening, stopListening, isAsrSupported } from '@/lib/asr';
import { Locale } from '@/lib/types';

export function useASR(locale: Locale) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isAsrSupported());
  }, []);

  const start = useCallback(() => {
    setIsListening(true);
    setTranscript('');
    startListening(
      locale,
      (text) => setTranscript(text),
      () => setIsListening(false),
    );
  }, [locale]);

  const stop = useCallback(() => {
    stopListening();
    setIsListening(false);
  }, []);

  return { isListening, transcript, start, stop, supported };
}
