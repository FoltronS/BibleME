import { DevotionalCache, Locale, LocaleDevotional, UserProfile } from './types';

const PREFIX = 'bibleme_';

function get(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PREFIX + key);
}

function set(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFIX + key, value);
}

export function getProfile(): UserProfile {
  return {
    nickname: get('nickname') || '',
    struggle: get('struggle') || '',
    locale: (get('locale') as Locale) || 'id',
    ttsSpeed: parseFloat(get('tts_speed') || '1.2'),
  };
}

export function saveProfile(partial: Partial<UserProfile>): void {
  if (partial.nickname !== undefined) set('nickname', partial.nickname);
  if (partial.struggle !== undefined) set('struggle', partial.struggle);
  if (partial.locale !== undefined) set('locale', partial.locale);
  if (partial.ttsSpeed !== undefined) set('tts_speed', String(partial.ttsSpeed));
}

export function isOnboarded(): boolean {
  return !!get('nickname');
}

export function struggleHash(str: string): string {
  return str.slice(0, 30).replace(/\s+/g, '_');
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

// --- Devotional cache (multi-language) ---

function getRawCache(): DevotionalCache | null {
  const raw = get('devotional_cache');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveRawCache(cache: DevotionalCache): void {
  set('devotional_cache', JSON.stringify(cache));
}

function isCacheBaseValid(struggle: string): boolean {
  const cache = getRawCache();
  if (!cache) return false;
  return cache.date === today() && cache.struggleHash === struggleHash(struggle);
}

/** Check if a specific locale's content is already cached for today + struggle */
export function isLocaleCached(locale: Locale, struggle: string): boolean {
  if (!isCacheBaseValid(struggle)) return false;
  const cache = getRawCache();
  const entry = cache?.locales?.[locale];
  if (!entry) return false;
  // Guard against corrupted or empty content
  const corrupted =
    entry.devotion?.startsWith('{') ||
    entry.devotion?.includes('"devotion"') ||
    !entry.verse?.content ||
    !entry.devotion ||
    !entry.letter;
  return !corrupted;
}

/** Get cached content for a locale (returns null if not cached or invalid) */
export function getCachedLocale(locale: Locale, struggle: string): LocaleDevotional | null {
  if (!isLocaleCached(locale, struggle)) return null;
  return getRawCache()?.locales?.[locale] ?? null;
}

/** Save content for one locale, preserving other locales in the cache */
export function saveLocaleDevotional(locale: Locale, struggle: string, data: LocaleDevotional, passageId?: string): void {
  const existing = isCacheBaseValid(struggle) ? (getRawCache() ?? null) : null;

  const cache: DevotionalCache = {
    date: today(),
    struggleHash: struggleHash(struggle),
    passageId: passageId ?? existing?.passageId,
    locales: {
      ...(existing?.locales ?? {}),
      [locale]: data,
    },
  };
  saveRawCache(cache);
}

/** Get the cached passageId for today+struggle (to reuse across language switches) */
export function getCachedPassageId(struggle: string): string | null {
  if (!isCacheBaseValid(struggle)) return null;
  return getRawCache()?.passageId ?? null;
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
}
