import type { Metadata } from 'next';
import { Noto_Serif_SC, Noto_Sans_SC, Cinzel } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import { ToastProvider } from '@/contexts/ToastContext';
import PageTransition from '@/components/PageTransition';

const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI 八字命理分析',
  description: '基于传统八字命理与AI的智能运势解读',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${notoSerif.variable} ${notoSans.variable} ${cinzel.variable}`}>
      <body className="min-h-screen">
        <UserProvider>
          <ToastProvider>
            <PageTransition>
              {children}
            </PageTransition>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
