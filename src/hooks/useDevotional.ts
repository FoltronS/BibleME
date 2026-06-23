'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocaleDevotional, Locale, VerseData } from '@/lib/types';
import { isLocaleCached, getCachedLocale, saveLocaleDevotional, getCachedPassageId } from '@/lib/storage';

export function useDevotional(nickname: string, struggle: string, locale: Locale) {
  const [verseData, setVerseData] = useState<{ verse: VerseData; passageId: string } | null>(null);
  const [data, setData] = useState<LocaleDevotional | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevotional = useCallback(async (signal: AbortSignal) => {
    setVerseLoading(true);
    setContentLoading(true);
    setError(null);
    setVerseData(null);
    setData(null);

    if (isLocaleCached(locale, struggle)) {
      const cached = getCachedLocale(locale, struggle);
      if (cached) {
        const passageId = getCachedPassageId(struggle) ?? '';
        setVerseData({ verse: cached.verse, passageId });
        setVerseLoading(false);
        setData(cached);
        setContentLoading(false);
        return;
      }
    }

    try {
      // Phase 1: Get verse (fast — AI picks + Bible API fetch)
      const cachedPassageId = getCachedPassageId(struggle);
      const verseRes = await fetch('/api/verse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ struggle, locale, passageId: cachedPassageId }),
        signal,
      });
      if (!verseRes.ok) throw new Error('Failed to fetch verse');
      const { verse, passageId } = await verseRes.json() as { verse: VerseData; passageId: string };

      if (signal.aborted) return;
      setVerseData({ verse, passageId });
      setVerseLoading(false);

      // Phase 2: Generate devotion + letter (slow — LLM content generation)
      const contentRes = await fetch('/api/devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, struggle, locale, verseReference: verse.reference, verseContent: verse.content }),
        signal,
      });
      if (!contentRes.ok) throw new Error('Failed to generate devotional');
      const { devotion, letter } = await contentRes.json() as { devotion: string; letter: string };

      if (signal.aborted) return;

      const localeData = { verse, devotion, letter };
      saveLocaleDevotional(locale, struggle, localeData, passageId);
      setData(localeData);
      setContentLoading(false);

    } catch (err) {
      if (signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Unknown error');
      setVerseLoading(false);
      setContentLoading(false);
    }
  }, [nickname, struggle, locale]);

  useEffect(() => {
    if (!nickname) return;
    const controller = new AbortController();
    fetchDevotional(controller.signal);
    return () => controller.abort();
  }, [nickname, fetchDevotional]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchDevotional(controller.signal);
  }, [fetchDevotional]);

  return { data, verseData, verseLoading, contentLoading, error, refetch };
}
