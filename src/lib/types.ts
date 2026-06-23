export type Locale = 'id' | 'en' | 'zh';

export interface UserProfile {
  nickname: string;
  struggle: string;
  locale: Locale;
  ttsSpeed: number;
}

export interface VerseData {
  reference: string;
  content: string;
  copyright: string;
}

// Content for a single language
export interface LocaleDevotional {
  verse: VerseData;
  devotion: string;
  letter: string;
}

// Multi-language cache stored in localStorage
export interface DevotionalCache {
  date: string;
  struggleHash: string;
  passageId?: string;          // shared across all locales — same verse, different translations
  locales: Partial<Record<Locale, LocaleDevotional>>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
