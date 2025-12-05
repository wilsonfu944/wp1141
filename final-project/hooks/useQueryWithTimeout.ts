'use client';

import { useEffect, useState } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

// 带超时检测的 useQuery hook
export function useQueryWithTimeout<TData = unknown, TError = unknown>(
  options: UseQueryOptions<TData, TError> & { timeout?: number }
): UseQueryResult<TData, TError> & { isTimeout: boolean } {
  const { timeout = 10000, ...queryOptions } = options;
  const [isTimeout, setIsTimeout] = useState(false);

  const query = useQuery<TData, TError>({
    ...queryOptions,
    retry: (failureCount, error: any) => {
      // 超时或网络错误不重试
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        return false;
      }
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 1;
    },
  });

  useEffect(() => {
    if (query.isLoading && !query.isError) {
      setIsTimeout(false);
      const timer = setTimeout(() => {
        if (query.isLoading) {
          setIsTimeout(true);
          console.warn('Query timeout:', queryOptions.queryKey);
        }
      }, timeout);

      return () => clearTimeout(timer);
    } else {
      setIsTimeout(false);
    }
  }, [query.isLoading, query.isError, timeout, queryOptions.queryKey]);

  return {
    ...query,
    isTimeout,
  };
}

