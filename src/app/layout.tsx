import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionProvider } from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'UNO Card Arena — Competitive Multiplayer Card Game Platform',
  description:
    'Play real-time multiplayer UNO-style card games with friends, compete in ranked tournaments, test strategies against custom AI bots, and climb global leaderboards.',
  keywords: ['uno', 'card game', 'multiplayer', 'tournaments', 'ai bots', 'real-time card arena'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-[#060911] text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
