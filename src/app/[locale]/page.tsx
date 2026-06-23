'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/context/user-context';
import { useDevotional } from '@/hooks/useDevotional';
import { VerseCard } from '@/components/devotional/VerseCard';
import { ReflectionCard } from '@/components/devotional/ReflectionCard';
import { MotivationCard } from '@/components/devotional/MotivationCard';

type Tab = 'verse' | 'reflection' | 'letter';

const TABS: { key: Tab; emoji: string; labelKey: string }[] = [
  { key: 'verse',      emoji: '📖', labelKey: 'tabVerse' },
  { key: 'reflection', emoji: '📝', labelKey: 'tabReflection' },
  { key: 'letter',     emoji: '💌', labelKey: 'tabLetter' },
];

function LoadingCard({ message }: { message: string }) {
  return (
    <div className="bg-ivory rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center gap-4 min-h-48">
      <span className="text-soft-gold text-2xl animate-pulse">✦</span>
      <p className="text-warm-gray text-sm italic">{message}</p>
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations('home');
  const { nickname, struggle, locale, hydrated } = useUser();
  const { data, verseData, verseLoading, contentLoading, error, refetch } = useDevotional(nickname, struggle, locale);
  const [activeTab, setActiveTab] = useState<Tab>('verse');

  if (!hydrated) return null;

  const showVerseLoading  = verseLoading;
  const showContentLoading = !verseLoading && contentLoading;

  return (
    <div className="space-y-4 py-4 overflow-y-auto flex-1">
      {/* Tab bar */}
      <div className="flex gap-2">
        {TABS.map(({ key, emoji, labelKey }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === key
                ? 'bg-soft-gold text-white shadow-sm'
                : 'bg-ivory text-charcoal hover:bg-sage/20'
            }`}
          >
            <span>{emoji}</span>
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-ivory rounded-2xl p-8 shadow-sm text-center space-y-3">
          <p className="text-warm-gray text-sm">{t('errorMessage')}</p>
          <button
            onClick={refetch}
            className="bg-soft-gold text-white rounded-xl px-6 py-2 text-sm font-medium hover:bg-rose-dark transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {/* Verse tab */}
      {!error && activeTab === 'verse' && (
        showVerseLoading
          ? <LoadingCard message={t('loadingVerse')} />
          : verseData && <VerseCard verse={verseData.verse} />
      )}

      {/* Reflection tab */}
      {!error && activeTab === 'reflection' && (
        showVerseLoading || showContentLoading
          ? <LoadingCard message={t('loadingReflection')} />
          : data && <ReflectionCard content={data.devotion} />
      )}

      {/* Letter tab */}
      {!error && activeTab === 'letter' && (
        showVerseLoading || showContentLoading
          ? <LoadingCard message={t('loadingLetter')} />
          : data && <MotivationCard content={data.letter} />
      )}
    </div>
  );
}
