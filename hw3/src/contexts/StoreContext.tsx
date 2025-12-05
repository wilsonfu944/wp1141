import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Store } from '@/types';

interface StoreContextType {
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  stores: Store[]; // 所有店家數據
  setStores: (stores: Store[]) => void;
  storeRatings: Record<string, number[]>; // 店家所有評分記錄
  updateStoreRating: (storeName: string, rating: number) => void;
  getAverageRating: (storeName: string) => number; // 獲取平均評分
  getStoreByName: (storeName: string) => Store | null; // 根據店名獲取店家
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [storeRatings, setStoreRatings] = useState<Record<string, number[]>>({});

  const updateStoreRating = (storeName: string, rating: number) => {
    setStoreRatings(prev => ({
      ...prev,
      [storeName]: [...(prev[storeName] || []), rating]
    }));
  };

  const getAverageRating = (storeName: string) => {
    const ratings = storeRatings[storeName];
    if (!ratings || ratings.length === 0) {
      return 3.0; // 如果沒有評分，返回初始值3.0
    }
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
  };

  const getStoreByName = (storeName: string) => {
    return stores.find(store => store.store_name === storeName) || null;
  };

  const value: StoreContextType = {
    currentStore,
    setCurrentStore,
    stores,
    setStores,
    storeRatings,
    updateStoreRating,
    getAverageRating,
    getStoreByName,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
