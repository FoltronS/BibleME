'use client';

import { useTranslations } from 'next-intl';

export function DevotionalLoading() {
  const t = useTranslations('home');

  return (
    <div className="space-y-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-ivory rounded-2xl p-6 shadow-sm space-y-3 animate-pulse">
          <div className="h-5 bg-soft-gold/20 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-soft-gold/15 rounded w-full" />
            <div className="h-4 bg-soft-gold/15 rounded w-5/6" />
            <div className="h-4 bg-soft-gold/15 rounded w-4/6" />
          </div>
        </div>
      ))}
      <p className="text-center text-warm-gray text-sm">{t('loading')}</p>
    </div>
  );
}
