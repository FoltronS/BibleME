'use client';

import { useTranslations } from 'next-intl';
import { VerseData } from '@/lib/types';
import { TtsButton } from './TtsButton';

export function VerseCard({ verse }: { verse: VerseData }) {
  const t = useTranslations('home');

  return (
    <div className="bg-ivory rounded-2xl p-6 shadow-sm">
      {/* Section label */}
      <div className="flex flex-col items-center mb-5">
        <p className="text-soft-gold text-xs font-semibold tracking-widest uppercase">
          {t('verseTitle')}
        </p>
        <div className="w-8 h-px bg-soft-gold mt-1" />
      </div>

      {/* Verse text — centered, italic */}
      <blockquote className="text-[#2C2420] text-[17px] font-semibold leading-relaxed italic text-center mb-5">
        {verse.content}
      </blockquote>

      {/* Reference + TTS */}
      <div className="flex items-center justify-between">
        <p className="text-soft-gold font-semibold text-sm">
          — {verse.reference}
        </p>
        <TtsButton text={`${verse.content}. ${verse.reference}`} />
      </div>

    </div>
  );
}
