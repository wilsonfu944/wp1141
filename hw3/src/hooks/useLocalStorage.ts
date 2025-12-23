import { useState, useEffect } from 'react';

/**
 * 自定義 Hook：使用 localStorage 持久化狀態
 * @param key localStorage 的 key
 * @param initialValue 初始值
 * @returns [state, setState] tuple
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 從 localStorage 讀取初始狀態
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // 更新 localStorage 的函數
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允許 value 是一個函數（類似 setState）
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * 清除 localStorage 中的特定 key
 * @param key localStorage 的 key
 */
export const clearLocalStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error clearing ${key} from localStorage:`, error);
  }
};

/**
 * 清除所有 localStorage
 */
export const clearAllLocalStorage = (): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};







