'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/context/user-context';
import { useRouter } from '@/i18n/navigation';
import { msg } from '@/lib/msg';

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const { updateProfile } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState('');
  const [struggle, setStruggle] = useState('');

  function handleNext() {
    if (step === 1 && nickname.trim()) setStep(2);
  }

  function handleComplete(skipStruggle = false) {
    const name = nickname.trim();
    const userStruggle = skipStruggle ? '' : struggle.trim();

    updateProfile({ nickname: name, struggle: userStruggle });

    msg(`Name: ${name}\nStruggle: ${userStruggle || '(not shared)'}`, 'New User');

    router.replace('/');
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-start pt-14 px-5">
      {/* Dove + Brand */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-7xl mb-3 drop-shadow-sm">🕊️</span>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-charcoal">
          BibleMe
        </h1>
        <p className="mt-1 text-soft-gold italic text-base">
          Sabda Terang Setiap Hari
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-ivory rounded-2xl p-6 shadow-sm">
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                {t('step1Title')} 👋
              </h2>
              <p className="text-warm-gray text-sm mt-1">{t('step1Subtitle')}</p>
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('step1Placeholder')}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              className="w-full bg-white border border-soft-gold/30 rounded-xl px-4 py-3 text-charcoal placeholder:text-warm-gray/70 focus:outline-none focus:ring-2 focus:ring-soft-gold/40 text-sm"
            />
            <button
              onClick={handleNext}
              disabled={!nickname.trim()}
              className="w-full bg-soft-gold disabled:bg-warm-gray/30 text-white rounded-xl py-3 font-semibold text-sm transition-colors hover:bg-rose-dark disabled:cursor-not-allowed"
            >
              {t('step1Next')} →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">
                Hei, {nickname}! 🌅
              </h2>
              <p className="text-warm-gray text-sm mt-1">{t('step2Title')}</p>
              <p className="text-warm-gray/60 text-xs">{t('step2Hint')}</p>
            </div>
            <textarea
              value={struggle}
              onChange={(e) => setStruggle(e.target.value)}
              placeholder={t('step2Placeholder')}
              rows={3}
              className="w-full bg-white border border-soft-gold/30 rounded-xl px-4 py-3 text-charcoal resize-none focus:outline-none focus:ring-2 focus:ring-soft-gold/40 text-sm"
            />
            <button
              onClick={() => handleComplete(false)}
              className="w-full bg-soft-gold text-white rounded-xl py-3 font-semibold text-sm transition-colors hover:bg-rose-dark"
            >
              {t('step2Next')} 🕊️
            </button>
            <button
              onClick={() => handleComplete(true)}
              className="w-full text-center text-warm-gray text-sm hover:text-charcoal transition-colors py-1"
            >
              {t('step2Skip')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
