'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ItineraryCartProvider } from '@/context/ItineraryCartContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryErrorHandler } from '@/components/QueryErrorHandler';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // 如果是网络错误或超时，不重试
          if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
            return false;
          }
          // 如果是 4xx 错误，不重试
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          // 最多重试 1 次
          return failureCount < 1;
        },
        retryDelay: 1000,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        // 添加超时设置
        networkMode: 'online',
      },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <QueryErrorHandler />
        <AuthProvider>
          <ItineraryCartProvider>
            {children}
          </ItineraryCartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

