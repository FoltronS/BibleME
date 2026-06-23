import { Locale } from './types';

// ID → canonical name + known aliases
// Matching normalizes to lowercase, strips periods and extra spaces
const BOOK_ALIASES: Record<string, string[]> = {
  // Old Testament
  GEN:  ['Genesis', 'Gen'],
  EXO:  ['Exodus', 'Exo', 'Ex'],
  LEV:  ['Leviticus', 'Lev'],
  NUM:  ['Numbers', 'Num', 'Numb'],
  DEU:  ['Deuteronomy', 'Deut', 'Deu', 'Dt'],
  JOS:  ['Joshua', 'Josh', 'Jos'],
  JDG:  ['Judges', 'Judg', 'Jdg'],
  RUT:  ['Ruth', 'Rut'],
  '1SA': ['1 Samuel', '1 Sam', '1Sa'],
  '2SA': ['2 Samuel', '2 Sam', '2Sa'],
  '1KI': ['1 Kings', '1 Kgs', '1Ki'],
  '2KI': ['2 Kings', '2 Kgs', '2Ki'],
  '1CH': ['1 Chronicles', '1 Chron', '1Ch'],
  '2CH': ['2 Chronicles', '2 Chron', '2Ch'],
  EZR:  ['Ezra', 'Ezr'],
  NEH:  ['Nehemiah', 'Neh'],
  EST:  ['Esther', 'Esth', 'Est'],
  JOB:  ['Job'],
  PSA:  ['Psalms', 'Psalm', 'Psa', 'Ps'],
  PRO:  ['Proverbs', 'Prov', 'Pro', 'Prv'],
  ECC:  ['Ecclesiastes', 'Eccles', 'Eccl', 'Ecc'],
  SNG:  ['Song of Solomon', 'Song of Songs', 'Song', 'Sos', 'Sng'],
  ISA:  ['Isaiah', 'Isa'],
  JER:  ['Jeremiah', 'Jer'],
  LAM:  ['Lamentations', 'Lam'],
  EZK:  ['Ezekiel', 'Ezek', 'Ezk'],
  DAN:  ['Daniel', 'Dan'],
  HOS:  ['Hosea', 'Hos'],
  JOL:  ['Joel', 'Jol'],
  AMO:  ['Amos', 'Amo'],
  OBA:  ['Obadiah', 'Obad', 'Oba'],
  JON:  ['Jonah', 'Jon'],
  MIC:  ['Micah', 'Mic'],
  NAM:  ['Nahum', 'Nah', 'Nam'],
  HAB:  ['Habakkuk', 'Hab'],
  ZEP:  ['Zephaniah', 'Zeph', 'Zep'],
  HAG:  ['Haggai', 'Hag'],
  ZEC:  ['Zechariah', 'Zech', 'Zec'],
  MAL:  ['Malachi', 'Mal'],
  // New Testament
  MAT:  ['Matthew', 'Matt', 'Mat', 'Mt'],
  MRK:  ['Mark', 'Mrk', 'Mk'],
  LUK:  ['Luke', 'Luk', 'Lk'],
  JHN:  ['John', 'Jhn', 'Jn'],
  ACT:  ['Acts', 'Act'],
  ROM:  ['Romans', 'Rom'],
  '1CO': ['1 Corinthians', '1 Cor', '1Co'],
  '2CO': ['2 Corinthians', '2 Cor', '2Co'],
  GAL:  ['Galatians', 'Gal'],
  EPH:  ['Ephesians', 'Eph'],
  PHP:  ['Philippians', 'Phil', 'Php'],
  COL:  ['Colossians', 'Col'],
  '1TH': ['1 Thessalonians', '1 Thess', '1Th'],
  '2TH': ['2 Thessalonians', '2 Thess', '2Th'],
  '1TI': ['1 Timothy', '1 Tim', '1Ti'],
  '2TI': ['2 Timothy', '2 Tim', '2Ti'],
  TIT:  ['Titus', 'Tit'],
  PHM:  ['Philemon', 'Phlm', 'Phm'],
  HEB:  ['Hebrews', 'Heb'],
  JAS:  ['James', 'Jas'],
  '1PE': ['1 Peter', '1 Pet', '1Pe'],
  '2PE': ['2 Peter', '2 Pet', '2Pe'],
  '1JN': ['1 John', '1 Jn', '1Jn'],
  '2JN': ['2 John', '2 Jn', '2Jn'],
  '3JN': ['3 John', '3 Jn', '3Jn'],
  JUD:  ['Jude', 'Jud'],
  REV:  ['Revelation', 'Revelations', 'Rev'],
};

// Roman numeral prefix → Arabic digit
const ROMAN_PREFIX: Record<string, string> = {
  'iii': '3', 'ii': '2', 'i': '1',
};

function norm(s: string): string {
  return (
    s
      // Roman numeral book prefix: "II Kings" → "2 Kings", "III John" → "3 John"
      // Must come before lowercasing so we can match uppercase roman numerals
      .replace(/^(III|II|I)\s+/i, (_, r) => ROMAN_PREFIX[r.toLowerCase()] + ' ')
      .toLowerCase()
      .replace(/\./g, '')          // strip periods: "Josh." → "Josh"
      .replace(/\s+/g, ' ')        // collapse whitespace
      .trim()
  );
}

// Build reverse lookup at module load time: normalized alias → book ID
const ALIAS_TO_ID: Map<string, string> = new Map();
for (const [id, aliases] of Object.entries(BOOK_ALIASES)) {
  for (const alias of aliases) {
    ALIAS_TO_ID.set(norm(alias), id);
  }
}

/**
 * Parse a human-readable verse reference like "Proverbs 15:1" or "1 Corinthians 13:4-7"
 * into an api.bible passage ID like "PRO.15.1" or "1CO.13.4-1CO.13.7".
 *
 * Matching strategy:
 *   1. Exact match after normalization
 *   2. Prefix match — input starts with a known alias (min 3 chars) to handle
 *      unexpected suffixes like "Prov." → "prov" matching "pro"
 */
export function parseVerseReference(ref: string): string | null {
  const match = ref.trim().match(/^(.+?)\s+(\d+)[:\.](\d+)(?:\s*[-–]\s*(\d+))?/);
  if (!match) return null;

  const [, bookRaw, chapter, verseStart, verseEnd] = match;
  const bookNorm = norm(bookRaw);

  // 1. Exact match
  let bookId = ALIAS_TO_ID.get(bookNorm) ?? null;

  // 2. Prefix match — find the longest alias that the input starts with
  if (!bookId) {
    let bestLen = 0;
    for (const [alias, id] of ALIAS_TO_ID) {
      if (alias.length >= 3 && bookNorm.startsWith(alias) && alias.length > bestLen) {
        bookId = id;
        bestLen = alias.length;
      }
    }
  }

  if (!bookId) return null;

  return verseEnd
    ? `${bookId}.${chapter}.${verseStart}-${bookId}.${chapter}.${verseEnd}`
    : `${bookId}.${chapter}.${verseStart}`;
}

// Bible IDs from api.bible (used for en and zh)
export const BIBLE_MAP: Record<string, { bibleId: string; name: string }> = {
  en: { bibleId: '63097d2a0a2f7db3-01', name: 'NKJV' },
  zh: { bibleId: '7ea794434e9ea7ee-01', name: 'OCCB' },
};

// api.bible ID → canonical full name (first alias in BOOK_ALIASES)
const API_BIBLE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(BOOK_ALIASES).map(([id, aliases]) => [id, aliases[0]])
);

// Maps api.bible book ID → alkitab (mayicu.id) book code
// Only entries that differ are listed; same-code books use the fallback logic in fetchAlkitabVerse
export const API_BIBLE_TO_ALKITAB: Record<string, string> = {
  JDG: 'Jud',  RUT: 'Rth',
  '1SA': '1Sm', '2SA': '2Sm',
  PSA: 'Psm',  PRO: 'Prv',
  SNG: 'Sgs',  EZK: 'Eze',
  OBA: 'Obd',  NAM: 'Nah',
  JHN: 'Joh',  JAS: 'Jam',
  '1JN': '1Jo', '2JN': '2Jo', '3JN': '3Jo',
  JUD: 'Jde',
};

// alkitab code → api.bible ID (reverse of API_BIBLE_TO_ALKITAB)
const ALKITAB_TO_API_BIBLE: Record<string, string> = Object.fromEntries(
  Object.entries(API_BIBLE_TO_ALKITAB).map(([apiId, alkCode]) => [alkCode, apiId])
);

// Indonesian book names keyed by api.bible ID
const BOOK_ID_NAMES: Record<string, string> = {
  GEN: 'Kejadian',     EXO: 'Keluaran',       LEV: 'Imamat',
  NUM: 'Bilangan',     DEU: 'Ulangan',         JOS: 'Yosua',
  JDG: 'Hakim-hakim', RUT: 'Rut',             '1SA': '1 Samuel',
  '2SA': '2 Samuel',  '1KI': '1 Raja-raja',   '2KI': '2 Raja-raja',
  '1CH': '1 Tawarikh','2CH': '2 Tawarikh',    EZR: 'Ezra',
  NEH: 'Nehemia',     EST: 'Ester',            JOB: 'Ayub',
  PSA: 'Mazmur',      PRO: 'Amsal',            ECC: 'Pengkhotbah',
  SNG: 'Kidung Agung',ISA: 'Yesaya',           JER: 'Yeremia',
  LAM: 'Ratapan',     EZK: 'Yehezkiel',        DAN: 'Daniel',
  HOS: 'Hosea',       JOL: 'Yoel',             AMO: 'Amos',
  OBA: 'Obaja',       JON: 'Yunus',            MIC: 'Mikha',
  NAM: 'Nahum',       HAB: 'Habakuk',          ZEP: 'Zefanya',
  HAG: 'Hagai',       ZEC: 'Zakharia',         MAL: 'Maleakhi',
  MAT: 'Matius',      MRK: 'Markus',           LUK: 'Lukas',
  JHN: 'Yohanes',     ACT: 'Kisah Para Rasul', ROM: 'Roma',
  '1CO': '1 Korintus','2CO': '2 Korintus',    GAL: 'Galatia',
  EPH: 'Efesus',      PHP: 'Filipi',           COL: 'Kolose',
  '1TH': '1 Tesalonika','2TH': '2 Tesalonika','1TI': '1 Timotius',
  '2TI': '2 Timotius',TIT: 'Titus',            PHM: 'Filemon',
  HEB: 'Ibrani',      JAS: 'Yakobus',          '1PE': '1 Petrus',
  '2PE': '2 Petrus',  '1JN': '1 Yohanes',     '2JN': '2 Yohanes',
  '3JN': '3 Yohanes', JUD: 'Yudas',            REV: 'Wahyu',
};

/**
 * Given an api.bible book ID or an alkitab book code, return the book name.
 * Pass locale='id' to get the Indonesian name.
 */
export function getBookFullName(code: string, locale?: string): string {
  // Resolve to api.bible ID first
  let apiBibleId = API_BIBLE_TO_NAME[code] ? code : (ALKITAB_TO_API_BIBLE[code] ?? code.toUpperCase());

  if (locale === 'id' && BOOK_ID_NAMES[apiBibleId]) return BOOK_ID_NAMES[apiBibleId];
  if (API_BIBLE_TO_NAME[apiBibleId]) return API_BIBLE_TO_NAME[apiBibleId];
  return code;
}
