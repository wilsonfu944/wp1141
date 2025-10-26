import { useState, useEffect } from 'react';

/**
 * 自定義 Hook：防抖（Debounce）
 * 用於延遲執行某個值的更新，常用於搜尋輸入框
 * @param value 要防抖的值
 * @param delay 延遲時間（毫秒）
 * @returns 防抖後的值
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 設定定時器來延遲更新
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清除定時器（如果 value 在 delay 時間內再次改變）
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 自定義 Hook：節流（Throttle）
 * 用於限制函數的執行頻率
 * @param value 要節流的值
 * @param interval 時間間隔（毫秒）
 * @returns 節流後的值
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    
    // 如果距離上次更新的時間超過 interval，立即更新
    if (now >= lastUpdated + interval) {
      setThrottledValue(value);
      setLastUpdated(now);
    } else {
      // 否則設定定時器在適當時間更新
      const timerId = setTimeout(() => {
        setThrottledValue(value);
        setLastUpdated(Date.now());
      }, interval - (now - lastUpdated));

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [value, interval, lastUpdated]);

  return throttledValue;
}







