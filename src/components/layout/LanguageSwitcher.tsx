'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useUser } from '@/context/user-context';
import { Locale } from '@/lib/types';

const LANGS: { value: Locale; label: string }[] = [
  { value: 'id', label: 'ID' },
  { value: 'en', label: 'EN' },
  { value: 'zh', label: '中' },
];

export function LanguageSwitcher() {
  const { locale, updateProfile } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newLocale: Locale) {
    if (newLocale === locale) return;
    updateProfile({ locale: newLocale });
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-0.5">
      {LANGS.map(({ value, label }, i) => (
        <button
          key={value}
          onClick={() => handleChange(value)}
          className={`px-2 py-1 text-xs font-medium transition-colors rounded-lg ${
            locale === value
              ? 'text-rose-dark font-semibold'
              : 'text-warm-gray hover:text-charcoal'
          }`}
        >
          {label}
          {i < LANGS.length - 1 && (
            <span className="ml-0.5 text-soft-gold/40 pointer-events-none select-none"> ·</span>
          )}
        </button>
      ))}
    </div>
  );
}
