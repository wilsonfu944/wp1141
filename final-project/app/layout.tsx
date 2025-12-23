import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import NavbarWrapper from '@/components/NavbarWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '動漫巡礼网站',
  description: '探索動漫中的真實場景，規劃你的巡礼之旅',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} bg-black text-white`}>
        <Providers>
          <NavbarWrapper />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

