import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CartItem, Product, Order } from '@/types';
import { message } from 'antd';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  submitOrder: () => Order | null;
  orders: Order[];
  isCartEmpty: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

// localStorage 的 key 定義
const CART_STORAGE_KEY = 'shopping_cart_items';
const ORDERS_STORAGE_KEY = 'shopping_orders';

// 從 localStorage 讀取資料的輔助函數
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// 儲存資料到 localStorage 的輔助函數
const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // 從 localStorage 初始化狀態
  const [cartItems, setCartItems] = useState<CartItem[]>(() => 
    loadFromLocalStorage(CART_STORAGE_KEY, [])
  );
  const [orders, setOrders] = useState<Order[]>(() => 
    loadFromLocalStorage(ORDERS_STORAGE_KEY, [])
  );

  // 當 cartItems 變化時，同步到 localStorage
  useEffect(() => {
    saveToLocalStorage(CART_STORAGE_KEY, cartItems);
  }, [cartItems]);

  // 當 orders 變化時，同步到 localStorage
  useEffect(() => {
    saveToLocalStorage(ORDERS_STORAGE_KEY, orders);
  }, [orders]);

  // 加入購物車
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.product.id === product.id);

      if (existingItem) {
        // 檢查庫存
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          message.warning(`庫存不足！目前庫存：${product.stock}`);
          return prevItems;
        }

        message.success('已更新購物車數量');
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // 檢查庫存
        if (quantity > product.stock) {
          message.warning(`庫存不足！目前庫存：${product.stock}`);
          return prevItems;
        }

        message.success('已加入購物車');
        return [...prevItems, { product, quantity }];
      }
    });
  }, []);

  // 從購物車移除
  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prevItems) => prevItems.filter(item => item.product.id !== productId));
    message.success('已從購物車移除');
  }, []);

  // 更新數量
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) => {
      return prevItems.map(item => {
        if (item.product.id === productId) {
          // 檢查庫存
          if (quantity > item.product.stock) {
            message.warning(`庫存不足！目前庫存：${item.product.stock}`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  }, [removeFromCart]);

  // 清空購物車
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // 計算總價
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [cartItems]);

  // 計算總商品數
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // 提交訂單
  const submitOrder = useCallback((): Order | null => {
    if (cartItems.length === 0) {
      message.warning('購物車是空的！');
      return null;
    }

    const order: Order = {
      id: `ORDER-${Date.now()}`,
      items: [...cartItems],
      totalAmount: getTotalPrice(),
      createdAt: new Date(),
      status: 'pending',
    };

    setOrders(prev => [...prev, order]);
    clearCart();
    message.success('訂單已送出！');
    
    return order;
  }, [cartItems, getTotalPrice, clearCart]);

  // 計算購物車是否為空
  const isCartEmpty = cartItems.length === 0;

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    submitOrder,
    orders,
    isCartEmpty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

