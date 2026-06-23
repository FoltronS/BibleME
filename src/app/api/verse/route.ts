import { NextRequest, NextResponse } from 'next/server';
import { aiComplete } from '@/lib/ai-client';
import { fetchVerse, fetchAlkitabVerse } from '@/lib/bible-api';
import { BIBLE_MAP, parseVerseReference } from '@/lib/bible-ids';
import { verseSelectionPrompt, verifyVersePrompt } from '@/lib/prompts';
import { Locale, VerseData } from '@/lib/types';

const FALLBACK_PASSAGE = 'JHN.3.16';
const FALLBACKS = ['JHN.3.16', 'ROM.8.28', 'ISA.41.10', 'PHP.4.13'];

async function fetchBibleVerse(locale: Locale, passageId: string): Promise<VerseData> {
  if (locale === 'id') return fetchAlkitabVerse(passageId);
  return fetchVerse(BIBLE_MAP[locale].bibleId, passageId);
}

async function fetchWithFallbacks(locale: Locale, passageId: string): Promise<VerseData | undefined> {
  try {
    return await fetchBibleVerse(locale, passageId);
  } catch (err) {
    console.error(`[verse] Primary fetch failed for ${passageId}:`, err);
    for (const fb of FALLBACKS) {
      try { return await fetchBibleVerse(locale, fb); } catch { /* try next */ }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { struggle, locale, passageId: cachedPassageId } = (await req.json()) as {
      struggle: string;
      locale: Locale;
      passageId?: string;
    };

    // Step 1: Get passageId — reuse cached one if switching language, otherwise ask AI
    let passageId: string;
    if (cachedPassageId) {
      passageId = cachedPassageId;
      console.log(`[verse] Reusing passageId: ${passageId}`);
    } else {
      let aiRaw: string;
      try {
        aiRaw = await aiComplete({
          messages: [
            { role: 'system', content: verseSelectionPrompt(struggle) },
            { role: 'user', content: 'Pick a verse for today.' },
          ],
          temperature: 0.9,
          maxTokens: 50,
        });
      } catch (err) {
        console.error('[verse] Step 1 (AI verse selection) failed:', err);
        throw err;
      }
      passageId = parseVerseReference(aiRaw.trim()) ?? FALLBACK_PASSAGE;
      console.log(`[verse] AI picked: "${aiRaw.trim()}" → ${passageId}`);
    }

    // Step 2: Fetch verse text
    let verse = await fetchWithFallbacks(locale, passageId);
    if (!verse) {
      console.error('[verse] Step 2 (Bible API fetch) failed for all fallbacks. locale:', locale, 'BIBLE_API_KEY set:', !!process.env.BIBLE_API_KEY);
      throw new Error('All Bible API fallbacks failed');
    }

    // Step 3: Verify relevance (skip if reusing cached passageId — already verified)
    if (!cachedPassageId) {
      let verifyRaw: string;
      try {
        verifyRaw = await aiComplete({
          messages: [
            { role: 'system', content: verifyVersePrompt(struggle, verse.reference, verse.content) },
            { role: 'user', content: 'Verify.' },
          ],
          temperature: 0.3,
          maxTokens: 30,
        });
      } catch (err) {
        console.error('[verse] Step 3 (AI verification) failed:', err);
        throw err;
      }
      const verifyTrimmed = verifyRaw.trim();

      if (verifyTrimmed.toUpperCase() === 'YES') {
        console.log(`[verse] ✓ Accepted: ${passageId}`);
      } else {
        const suggestedId = parseVerseReference(verifyTrimmed);
        console.log(`[verse] ✗ Rejected: ${passageId} — AI suggested: "${verifyTrimmed}" → ${suggestedId ?? 'unparseable, keeping original'}`);
        if (suggestedId && suggestedId !== passageId) {
          try {
            verse = await fetchBibleVerse(locale, suggestedId);
            passageId = suggestedId;
            console.log(`[verse] → Switched to: ${passageId}`);
          } catch {
            console.warn('[verse] Suggested verse fetch failed, keeping original');
          }
        }
      }
    }

    return NextResponse.json({ verse, passageId });
  } catch (error) {
    console.error('[verse] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch verse' }, { status: 500 });
  }
}
