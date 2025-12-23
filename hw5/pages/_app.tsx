import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // 5分鐘刷新一次
      refetchOnWindowFocus={false} // 關閉窗口聚焦時自動刷新，避免卡住
    >
      <Component {...pageProps} />
    </SessionProvider>
  );
}

