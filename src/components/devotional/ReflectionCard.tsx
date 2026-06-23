'use client';

import { useTranslations } from 'next-intl';
import { TtsButton } from './TtsButton';

const PRAYER_HEADERS = ['Doa', 'DOA', 'Prayer', 'PRAYER', 'Pray', '祷告', '祈祷', 'Amen', 'Gebet', 'Prière'];

interface Parsed {
  title: string;
  body: string[];
  prayerHeader: string;
  prayer: string[];
}

function parseDevotion(content: string): Parsed {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  let title = '';
  const body: string[] = [];
  let prayerHeader = '';
  const prayer: string[] = [];
  let inPrayer = false;
  let bodyStarted = false;

  for (const line of lines) {
    // Prayer section
    if (PRAYER_HEADERS.includes(line) || /^(Doa|Prayer|祷告)\s*:/i.test(line)) {
      inPrayer = true;
      prayerHeader = line.replace(/\s*:.*$/, '');
      continue;
    }

    if (inPrayer) {
      prayer.push(line);
      continue;
    }

    // First short line (<=100 chars) before body = title
    if (!bodyStarted && line.length <= 100 && !title) {
      title = line;
      continue;
    }

    bodyStarted = true;
    body.push(line);
  }

  return { title, body, prayerHeader, prayer };
}

export function ReflectionCard({ content }: { content: string }) {
  const t = useTranslations('home');
  const { title, body, prayerHeader, prayer } = parseDevotion(content);

  return (
    <div className="bg-ivory rounded-2xl p-6 shadow-sm">
      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-soft-gold">
            {t('reflectionTitle')}
          </p>
          <div className="w-8 h-px bg-soft-gold mt-1" />
        </div>
        <TtsButton text={content} />
      </div>

      {/* Title */}
      {title && (
        <h3 className="font-[family-name:var(--font-playfair)] text-[#2C2420] text-xl font-bold leading-snug mb-4">
          {title}
        </h3>
      )}

      {/* Body paragraphs */}
      <div className="space-y-3 mb-4">
        {body.map((para, i) => (
          <p key={i} className="text-[#2C2420] text-[15px] font-semibold leading-relaxed text-justify">
            {para}
          </p>
        ))}
      </div>

      {/* Prayer section */}
      {(prayerHeader || prayer.length > 0) && (
        <div className="mt-4">
          <div className="w-8 h-px bg-soft-gold/60 mb-3" />
          {prayerHeader && (
            <p className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-soft-gold mb-2">
              {prayerHeader}
            </p>
          )}
          <blockquote className="border-l-2 border-soft-gold/50 pl-4 space-y-2">
            {prayer.map((line, i) => (
              <p key={i} className="text-warm-gray text-[14px] font-medium leading-relaxed italic">
                {line}
              </p>
            ))}
          </blockquote>
        </div>
      )}
    </div>
  );
}
