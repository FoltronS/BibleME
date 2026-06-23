import { Locale } from './types';

const LOCALE_TO_LANG: Record<Locale, string> = {
  id: 'id-ID',
  en: 'en-US',
  zh: 'zh-CN',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let recognition: any = null;

export function isAsrSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function startListening(
  locale: Locale,
  onTranscript: (text: string) => void,
  onEnd: () => void
): void {
  if (!isAsrSupported()) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = LOCALE_TO_LANG[locale];
  recognition.continuous = true;      // keep listening until user stops
  recognition.interimResults = true;  // show text as user speaks

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    // Concatenate all results (final + interim) into one string
    let fullTranscript = '';
    for (let i = 0; i < event.results.length; i++) {
      fullTranscript += event.results[i][0].transcript;
    }
    onTranscript(fullTranscript.trim());
  };

  recognition.onend = onEnd;
  recognition.onerror = () => onEnd();

  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}
