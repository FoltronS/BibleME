'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === '';
  const isChat = pathname === '/chat';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ivory/95 backdrop-blur-sm border-t border-soft-gold/30 z-50 md:hidden">
      <div className="max-w-lg mx-auto flex">
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
            isHome ? 'text-rose-dark' : 'text-warm-gray'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isHome ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span className="text-xs font-medium">{t('home')}</span>
        </Link>
        <Link
          href="/chat"
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
            isChat ? 'text-rose-dark' : 'text-warm-gray'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isChat ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
          </svg>
          <span className="text-xs font-medium">{t('chat')}</span>
        </Link>
      </div>
    </nav>
  );
}
