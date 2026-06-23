'use client';

import { useTTS } from '@/hooks/useTTS';
import { useUser } from '@/context/user-context';

export function TtsButton({ text }: { text: string }) {
  const { locale, ttsSpeed } = useUser();
  const { isSpeaking, toggle, supported } = useTTS(locale, ttsSpeed);

  if (!supported) return null;

  return (
    <button
      onClick={() => toggle(text)}
      className={`rounded-full p-2 transition-colors ${
        isSpeaking ? 'bg-rose/20 text-rose-dark' : 'bg-sage/20 text-warm-gray hover:bg-sage/30'
      }`}
      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
    >
      {isSpeaking ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
