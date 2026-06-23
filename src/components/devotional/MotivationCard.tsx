'use client';

import { useTranslations } from 'next-intl';
import { TtsButton } from './TtsButton';

export function MotivationCard({ content }: { content: string }) {
  const t = useTranslations('home');

  const paragraphs = content.split('\n').filter((l) => l.trim());

  return (
    <div className="bg-ivory rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-soft-gold">
            {t('letterTitle')}
          </p>
          <div className="w-8 h-px bg-soft-gold mt-1" />
        </div>
        <TtsButton text={content} />
      </div>
      <div>
        {paragraphs.map((para, i) => (
          <p key={i} className="text-[#2C2420] text-[15px] font-semibold leading-relaxed mb-3 italic text-justify">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
