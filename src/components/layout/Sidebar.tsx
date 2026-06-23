'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export function Sidebar() {
  const t = useTranslations('nav');
  const ts = useTranslations('settings');
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  const isHome = pathname === '/' || pathname === '';
  const isChat = pathname === '/chat';

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col bg-ivory border-r border-soft-gold/20 z-40 py-7 px-4">
        {/* Logo */}
        <div className="mb-10 px-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕊️</span>
            <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-soft-gold">
              BibleMe
            </h1>
          </div>
          <p className="text-warm-gray/50 text-xs mt-1 italic">Sabda Terang Setiap Hari</p>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isHome
                ? 'bg-soft-gold/15 text-rose-dark'
                : 'text-warm-gray hover:bg-soft-gold/10 hover:text-charcoal'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill={isHome ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            {t('home')}
          </Link>

          <Link
            href="/chat"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isChat
                ? 'bg-soft-gold/15 text-rose-dark'
                : 'text-warm-gray hover:bg-soft-gold/10 hover:text-charcoal'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill={isChat ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
            </svg>
            {t('chat')}
          </Link>
        </nav>

        {/* Settings at bottom */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-gray hover:bg-soft-gold/10 hover:text-charcoal transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {ts('title')}
        </button>
      </aside>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}
