import { VerseData } from './types';
import { API_BIBLE_TO_ALKITAB, getBookFullName } from './bible-ids';

const BASE = 'https://rest.api.bible/v1/bibles';
const ALKITAB_BASE = 'https://mayicu.id/api/alkitab/v1';
const ALKITAB_VERSION = 'tb'; // Terjemahan Baru

function cleanContent(raw: string): string {
  return raw
    .replace(/\[\d+\]/g, '')   // remove verse number tags [16]
    .replace(/\s*\]\s*$/g, '') // remove trailing ]
    .replace(/\[/g, '')        // remove any remaining [
    .replace(/\s+/g, ' ')
    .trim();
}

function isRange(passageId: string): boolean {
  // Range format: BOOK.CHAPTER.VERSE-BOOK.CHAPTER.VERSE
  return passageId.includes('-');
}

/**
 * Parse passageId (e.g. "PRO.15.1" or "1CO.13.4-1CO.13.7") into parts.
 */
function parsePassageId(passageId: string): { bookId: string; chapter: string; verseStart: string; verseEnd?: string } | null {
  // Single: BOOK.CHAPTER.VERSE
  const single = passageId.match(/^([A-Z1-3]+)\.(\d+)\.(\d+)$/);
  if (single) return { bookId: single[1], chapter: single[2], verseStart: single[3] };

  // Range: BOOK.CHAPTER.VERSE-BOOK.CHAPTER.VERSE (same book/chapter assumed)
  const range = passageId.match(/^([A-Z1-3]+)\.(\d+)\.(\d+)-[A-Z1-3]+\.\d+\.(\d+)$/);
  if (range) return { bookId: range[1], chapter: range[2], verseStart: range[3], verseEnd: range[4] };

  return null;
}

type AlkitabVerse = { number: number; text: string };

/**
 * Some books (e.g. Psalms) count the heading as verse 1, shifting all other
 * verse numbers by +1.  The API embeds the canonical verse number in the text
 * as "(chapter-verse)" so we use that to detect and correct the offset.
 *
 * Strategy:
 *  1. Fetch the requested verse directly.
 *  2. Check the leading embedded marker in the returned text.
 *  3. If it matches what we asked for → strip the marker and return.
 *  4. If it doesn't match → fetch the full chapter (1–500) and scan each
 *     entry for the "(chapter-targetVerse)" marker, then extract only that
 *     span of text (up to the next marker).
 */

/** Strip ALL "(chapter-N)" embedded markers from a text string. */
function stripEmbeddedMarkers(text: string): string {
  return text.replace(/\(\d+-\d+\)\s*/g, '').trim();
}

/**
 * Extract a single canonical verse from a full chapter array by scanning
 * for the embedded "(chapter-targetVerse)" marker.
 */
function extractVerseFromChapter(
  chapter: number,
  targetVerse: number,
  chapterData: AlkitabVerse[]
): string | null {
  if (targetVerse === 1) {
    // Verse 1 has no leading marker — it's the text before the first "(chapter-N)" in entry #1
    const entry = chapterData.find(v => v.number === 1);
    if (!entry) return null;
    const firstMarker = entry.text.match(/\(\d+-\d+\)/);
    const text = firstMarker?.index !== undefined
      ? entry.text.slice(0, firstMarker.index).trim()
      : entry.text.trim();
    return text || null;
  }

  const markerRe = new RegExp(`\\(${chapter}-${targetVerse}\\)\\s*`);
  for (const entry of chapterData) {
    const m = entry.text.match(markerRe);
    if (!m || m.index === undefined) continue;
    // Extract from after the marker until the next "(chapter-N)" or end
    let content = entry.text.slice(m.index + m[0].length);
    const nextMarker = content.match(/\(\d+-\d+\)/);
    if (nextMarker?.index !== undefined) content = content.slice(0, nextMarker.index);
    return content.trim();
  }
  return null;
}

/**
 * Fetch verse from mayicu.id Alkitab API (Indonesian).
 * Handles the verse-numbering offset present in books like Psalms.
 */
export async function fetchAlkitabVerse(passageId: string): Promise<VerseData> {
  const parts = parsePassageId(passageId);
  if (!parts) throw new Error(`Cannot parse passageId: ${passageId}`);

  const { bookId, chapter: chapterStr, verseStart: verseStartStr, verseEnd: verseEndStr } = parts;
  const chapter = parseInt(chapterStr);
  const verseStart = parseInt(verseStartStr);
  const verseEnd = verseEndStr ? parseInt(verseEndStr) : undefined;

  const bookCode = API_BIBLE_TO_ALKITAB[bookId] ?? bookId.charAt(0).toUpperCase() + bookId.slice(1).toLowerCase();
  const fullName = getBookFullName(bookCode, 'id');
  const reference = verseEnd
    ? `${fullName} ${chapter}:${verseStart}-${verseEnd}`
    : `${fullName} ${chapter}:${verseStart}`;

  const path = verseEnd
    ? `${ALKITAB_BASE}/${ALKITAB_VERSION}/${bookCode}/${chapter}/${verseStart}/${verseEnd}`
    : `${ALKITAB_BASE}/${ALKITAB_VERSION}/${bookCode}/${chapter}/${verseStart}`;

  const res = await fetch(path);
  if (!res.ok) throw new Error(`Alkitab API error (${res.status})`);
  const raw: AlkitabVerse[] = await res.json();

  // Check embedded marker in the first returned entry
  const firstText = raw[0]?.text ?? '';
  const embeddedMatch = firstText.match(/^\((\d+)-(\d+)\)/);
  const embeddedVerse = embeddedMatch ? parseInt(embeddedMatch[2]) : null;

  // No leading marker → verse is correct (most NT books have no embedded markers)
  // Leading marker matches → correct
  // Leading marker doesn't match → offset detected (e.g. Psalms heading shifts numbering)
  const isCorrect = embeddedVerse === null || embeddedVerse === verseStart;

  if (isCorrect) {
    let content: string;
    if (raw.length === 1) {
      let text = firstText;
      if (verseStart === 1) {
        // Cut off at the start of the next embedded verse
        const nextMarker = text.match(/\(\d+-\d+\)/);
        if (nextMarker?.index !== undefined) text = text.slice(0, nextMarker.index);
      } else {
        // Strip leading marker, cut off at next
        text = text.replace(/^\(\d+-\d+\)\s*/, '');
        const nextMarker = text.match(/\(\d+-\d+\)/);
        if (nextMarker?.index !== undefined) text = text.slice(0, nextMarker.index);
      }
      content = text.trim();
    } else {
      content = raw.map(v => stripEmbeddedMarkers(v.text)).join(' ');
    }
    return { reference, content, copyright: '' };
  }

  // Offset detected — fetch full chapter and scan by embedded marker
  console.log(`[alkitab] Verse offset detected for ${chapter}:${verseStart}, fetching full chapter`);
  const chapterRes = await fetch(`${ALKITAB_BASE}/${ALKITAB_VERSION}/${bookCode}/${chapter}/1/500`);
  if (!chapterRes.ok) throw new Error(`Alkitab chapter fetch error (${chapterRes.status})`);
  const chapterData: AlkitabVerse[] = await chapterRes.json();

  let content: string;
  if (!verseEnd) {
    const found = extractVerseFromChapter(chapter, verseStart, chapterData);
    if (!found) throw new Error(`Could not locate ${chapter}:${verseStart} in chapter data`);
    content = found;
  } else {
    const parts: string[] = [];
    for (let v = verseStart; v <= verseEnd; v++) {
      const found = extractVerseFromChapter(chapter, v, chapterData);
      if (found) parts.push(found);
    }
    content = parts.join(' ');
  }

  return { reference, content, copyright: '' };
}

export async function fetchVerse(bibleId: string, passageId: string): Promise<VerseData> {
  const apiKey = (process.env.BIBLE_API_KEY || '').trim().replace(/\s+/g, '');
  const headers = { 'api-key': apiKey };

  if (isRange(passageId)) {
    // Use /passages/ endpoint for multi-verse ranges
    const url = `${BASE}/${bibleId}/passages/${passageId}?content-type=text&include-titles=false&include-verse-numbers=false`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Bible API passages error (${res.status}): ${await res.text()}`);
    }
    const data = await res.json();
    return {
      reference: data.data?.reference || passageId,
      content: cleanContent(data.data?.content || ''),
      copyright: data.data?.copyright || '',
    };
  } else {
    // Use /verses/ endpoint for single verse — more reliable
    const url = `${BASE}/${bibleId}/verses/${passageId}?content-type=text&include-titles=false&include-verse-numbers=false`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Bible API verses error (${res.status}): ${await res.text()}`);
    }
    const data = await res.json();
    return {
      reference: data.data?.reference || passageId,
      content: cleanContent(data.data?.content || ''),
      copyright: data.data?.copyright || '',
    };
  }
}
