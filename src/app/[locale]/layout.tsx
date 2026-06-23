import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { UserProvider } from '@/context/user-context';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { Locale } from '@/lib/types';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <UserProvider locale={locale as Locale}>
        {/* Desktop sidebar — hidden on mobile */}
        <Sidebar />

        {/* Main area — offset by sidebar width on desktop, fills viewport height */}
        <div className="flex flex-col h-screen md:ml-56">
          <AppHeader />
          {/* flex-1 + overflow-y-auto: scrollable on normal pages, overridable by chat */}
          <main className="flex-1 flex flex-col min-h-0 px-4 pb-20 md:pb-8 pt-2">
            <div className="max-w-lg mx-auto md:max-w-3xl w-full flex-1 flex flex-col">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </UserProvider>
    </NextIntlClientProvider>
  );
}
