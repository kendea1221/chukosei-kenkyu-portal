import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';

// フォント最適化：display='swap'でレンダリングブロック解消
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: '中高生研究ポータル',
  description:
    '中高生向けの研究プログラムを探せる。参加者のレビューを閲覧し、自分に合ったプログラムを見つけてください。',
  // パフォーマンス最適化：DNSプリフェッチ
  other: {
    'dns-prefetch': 'https://fonts.googleapis.com',
  },
  // ビューポート最適化
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
