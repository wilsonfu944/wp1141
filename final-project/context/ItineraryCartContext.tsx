'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Location } from '@/types';

interface CartItem {
  location: Location;
  duration?: number; // 預計停留時間（分鐘）
  notes?: string;
}

interface ItineraryCartContextType {
  items: CartItem[];
  addItem: (location: Location) => void;
  removeItem: (locationId: string) => void;
  updateItem: (locationId: string, updates: Partial<Omit<CartItem, 'location'>>) => void;
  clearCart: () => void;
  hasItem: (locationId: string) => boolean;
  totalItems: number;
  reorderItems: (startIndex: number, endIndex: number) => void;
  setItemsOrder: (newOrder: CartItem[]) => void;
}

const ItineraryCartContext = createContext<ItineraryCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'animap_itinerary_cart';

export function ItineraryCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // 從 localStorage 載入
  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, []);

  // 儲存到 localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (location: Location) => {
    if (!hasItem(location.id)) {
      setItems([...items, { location, duration: 30 }]); // 預設停留 30 分鐘
    }
  };

  const removeItem = (locationId: string) => {
    setItems(items.filter((item) => item.location.id !== locationId));
  };

  const updateItem = (locationId: string, updates: Partial<Omit<CartItem, 'location'>>) => {
    setItems(
      items.map((item) =>
        item.location.id === locationId ? { ...item, ...updates } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const hasItem = (locationId: string) => {
    return items.some((item) => item.location.id === locationId);
  };

  const reorderItems = (startIndex: number, endIndex: number) => {
    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setItems(result);
  };

  const setItemsOrder = (newOrder: CartItem[]) => {
    setItems(newOrder);
  };

  return (
    <ItineraryCartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        hasItem,
        totalItems: items.length,
        reorderItems,
        setItemsOrder,
      }}
    >
      {children}
    </ItineraryCartContext.Provider>
  );
}

export function useItineraryCart() {
  const context = useContext(ItineraryCartContext);
  if (context === undefined) {
    throw new Error('useItineraryCart must be used within an ItineraryCartProvider');
  }
  return context;
}

export type { CartItem };


