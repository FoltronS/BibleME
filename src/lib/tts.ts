import { Locale } from './types';

const LOCALE_TO_LANG: Record<Locale, string> = {
  id: 'id-ID',
  en: 'en-US',
  zh: 'zh-CN',
};

// Preferred voice names in priority order, per locale
const PREFERRED_VOICES: Record<Locale, string[]> = {
  en: ['Microsoft Zira', 'Microsoft Zira Desktop', 'Zira'],
  id: ['Microsoft Gadis', 'Microsoft Gadis Desktop', 'Gadis'],
  zh: ['Microsoft Yaoyao', 'Microsoft Yaoyao Desktop', 'Yaoyao'],
};

function pickVoice(locale: Locale): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  for (const name of PREFERRED_VOICES[locale]) {
    const match = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
    if (match) return match;
  }
  return null;
}

// Indonesian number words
const ID_ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
const ID_TEENS = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
const ID_TENS = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];

function numberToIndonesian(n: number): string {
  if (n === 0) return 'nol';
  if (n < 10) return ID_ONES[n];
  if (n < 20) return ID_TEENS[n - 10];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ID_TENS[tens] + (ones ? ' ' + ID_ONES[ones] : '');
  }
  if (n < 200) return 'seratus' + (n % 100 ? ' ' + numberToIndonesian(n % 100) : '');
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    return ID_ONES[hundreds] + ' ratus' + (rest ? ' ' + numberToIndonesian(rest) : '');
  }
  return String(n);
}

// Chinese number words
const ZH_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

function numberToChinese(n: number): string {
  if (n < 10) return ZH_DIGITS[n];
  if (n < 20) return (n === 10 ? '十' : '十' + ZH_DIGITS[n % 10]);
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ZH_DIGITS[tens] + '十' + (ones ? ZH_DIGITS[ones] : '');
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    return ZH_DIGITS[hundreds] + '百' + (rest < 10 && rest > 0 ? '零' + ZH_DIGITS[rest] : rest ? numberToChinese(rest) : '');
  }
  return String(n);
}

// Indonesian Bible book abbreviations
const ID_BOOK_ABBREVS: Record<string, string> = {
  'Kej.': 'Kejadian', 'Kel.': 'Keluaran', 'Im.': 'Imamat', 'Bil.': 'Bilangan',
  'Ul.': 'Ulangan', 'Yos.': 'Yosua', 'Hak.': 'Hakim-hakim', 'Rut': 'Rut',
  'Mzm.': 'Mazmur', 'Ams.': 'Amsal', 'Pkh.': 'Pengkhotbah', 'Kid.': 'Kidung Agung',
  'Yes.': 'Yesaya', 'Yer.': 'Yeremia', 'Rat.': 'Ratapan', 'Yeh.': 'Yehezkiel',
  'Dan.': 'Daniel', 'Hos.': 'Hosea', 'Yl.': 'Yoel', 'Am.': 'Amos',
  'Ob.': 'Obaja', 'Yun.': 'Yunus', 'Mi.': 'Mikha', 'Nah.': 'Nahum',
  'Hab.': 'Habakuk', 'Zef.': 'Zefanya', 'Hag.': 'Hagai', 'Za.': 'Zakharia',
  'Mal.': 'Maleakhi', 'Mat.': 'Matius', 'Mrk.': 'Markus', 'Luk.': 'Lukas',
  'Yoh.': 'Yohanes', 'Kis.': 'Kisah Para Rasul', 'Rm.': 'Roma',
  'Gal.': 'Galatia', 'Ef.': 'Efesus', 'Flp.': 'Filipi', 'Kol.': 'Kolose',
  'Flm.': 'Filemon', 'Ibr.': 'Ibrani', 'Yak.': 'Yakobus',
  'Why.': 'Wahyu',
};

function cleanIndonesian(text: string): string {
  let result = text;

  // Expand book abbreviations
  for (const [abbr, full] of Object.entries(ID_BOOK_ABBREVS)) {
    result = result.replace(new RegExp(abbr.replace('.', '\\.'), 'g'), full);
  }

  // Bible verse references: "29:11" → "dua puluh sembilan ayat sebelas"
  result = result.replace(/(\d+):(\d+)/g, (_match, chapter, verse) => {
    return numberToIndonesian(parseInt(chapter)) + ' ayat ' + numberToIndonesian(parseInt(verse));
  });

  // Remaining standalone numbers
  result = result.replace(/\b(\d+)\b/g, (_match, num) => {
    return numberToIndonesian(parseInt(num));
  });

  // Honorific suffixes with hyphen: -Mu, -Ku, -Nya → mu, ku, nya
  result = result.replace(/-Mu\b/g, 'mu');
  result = result.replace(/-Ku\b/g, 'ku');
  result = result.replace(/-Nya\b/g, 'nya');
  // Honorific suffixes without hyphen (camelCase): rencanaMu → rencanamu
  result = result.replace(/([a-z])(Mu)\b/g, '$1mu');
  result = result.replace(/([a-z])(Ku)\b/g, '$1ku');
  result = result.replace(/([a-z])(Nya)\b/g, '$1nya');

  // ALL-CAPS words that should not be read as acronyms
  result = result.replace(/\bTUHAN\b/g, 'Tuhan');
  result = result.replace(/\bALLAH\b/g, 'Allah');

  // Fix "oa" vowel sequence mispronounced as "ua" by Indonesian TTS
  result = result.replace(/\bberdoa\b/gi, 'ber dok a');
  result = result.replace(/\bdoaku\b/gi, 'dok aku');
  result = result.replace(/\bdoamu\b/gi, 'dok amu');
  result = result.replace(/\bdoanya\b/gi, 'dok anya');
  result = result.replace(/\bdoa\b/gi, 'dok a');

  result = result.replace(/\bbibly\b/gi, 'bai bli');

  return result;
}

function cleanChinese(text: string): string {
  let result = text;

  // Bible verse references: "3:16" → "，三章十六节" (leading comma = natural pause)
  result = result.replace(/(\d+):(\d+)/g, (_match, chapter, verse) => {
    return '，' + numberToChinese(parseInt(chapter)) + '章' + numberToChinese(parseInt(verse)) + '节';
  });

  // Remaining standalone numbers
  result = result.replace(/\b(\d+)\b/g, (_match, num) => {
    return numberToChinese(parseInt(num));
  });

  return result;
}

function cleanEnglish(text: string): string {
  let result = text;
  result = result.replace(/\bLORD\b/g, 'Lord');
  // Bible verse references: "30:21" → "30, 21" (colon is read literally by Zira)
  result = result.replace(/(\d+):(\d+)/g, '$1, $2');
  return result;
}

export function cleanForTts(text: string, locale: Locale): string {
  switch (locale) {
    case 'id': return cleanIndonesian(text);
    case 'zh': return cleanChinese(text);
    case 'en': return cleanEnglish(text);
    default: return text;
  }
}

export function speak(text: string, locale: Locale, speed: number): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const cleaned = cleanForTts(text, locale);
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = LOCALE_TO_LANG[locale];
  utterance.rate = speed;

  const voice = pickVoice(locale);
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
