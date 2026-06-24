'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { useUser } from '@/context/user-context';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

function formatDate(locale: string): string {
  return new Date().toLocaleDateString(
    locale === 'id' ? 'id-ID' : locale === 'zh' ? 'zh-CN' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  );
}

export function AppHeader() {
  const [showSettings, setShowSettings] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const { nickname, locale } = useUser();
  const pathname = usePathname();
  const isOnboarding = pathname.includes('onboarding');

  useEffect(() => {
    setDateStr(formatDate(locale));
  }, [locale]);
  const t = useTranslations('nav');

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3">
        {/* Left: logo (mobile only) + greeting */}
        <div>
          <div className="flex items-center gap-1.5 md:hidden">
            <span className="text-lg">🕊️</span>
            <h1 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-soft-gold">
              BibleMe
            </h1>
          </div>
          {nickname && (
            <p className="text-charcoal/70 text-xs mt-0.5 md:text-base md:font-semibold md:text-charcoal md:mt-0">
              {t('greeting')} {nickname} ✨
            </p>
          )}
        </div>

        {/* Right: language switcher + date + settings */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <span className="text-charcoal/60 text-xs hidden sm:inline">{dateStr}</span>
          {!isOnboarding && <button
            onClick={() => setShowSettings(true)}
            className="rounded-full p-2 text-warm-gray hover:bg-ivory transition-colors md:hidden"
            aria-label="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>}
        </div>
      </header>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
