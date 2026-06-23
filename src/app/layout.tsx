import type { Metadata } from 'next';
import { Playfair_Display, Lora } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BibleMe — devotion Harian',
  description: 'Teman rohani harianmu. Daily devotional with Bibly, your spiritual companion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${playfair.variable} ${lora.variable} h-full`}>
      <body className="min-h-full bg-cream text-charcoal font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
