'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// 全局查询错误处理，避免一直转圈
export function QueryErrorHandler() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 监听查询错误
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === 'error') {
        const query = event.query;
        const error = query.state.error as any;
        
        // 如果是超时或网络错误，立即标记为失败，不再重试
        if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
          console.warn('Query timeout, stopping retries:', query.queryKey);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return null;
}

