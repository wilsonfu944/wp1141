import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, Item, CartContextType, Order } from '@/types';

interface CartState {
  items: CartItem[];
  orderHistory: Order[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_STORE_RATING'; payload: { orderId: string; rating: number; review: string } }
  | { type: 'UPDATE_ORDER_RATING'; payload: { orderId: string; rating: number; review: string } }
  | { type: 'UPDATE_ORDER_DELIVERY_STATUS'; payload: { orderId: string; isDelivered: boolean } };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { id: action.payload.id, item: action.payload, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'ADD_ORDER':
      return { ...state, orderHistory: [...state.orderHistory, action.payload] };
    case 'UPDATE_STORE_RATING':
      return {
        ...state,
        orderHistory: state.orderHistory.map(order =>
          order.id === action.payload.orderId
            ? { ...order, storeRating: action.payload.rating, storeReview: action.payload.review }
            : order
        ),
      };
    case 'UPDATE_ORDER_RATING':
      return {
        ...state,
        orderHistory: state.orderHistory.map(order =>
          order.id === action.payload.orderId
            ? { ...order, orderRating: action.payload.rating, orderReview: action.payload.review }
            : order
        ),
      };
    case 'UPDATE_ORDER_DELIVERY_STATUS':
      return {
        ...state,
        orderHistory: state.orderHistory.map(order =>
          order.id === action.payload.orderId
            ? { ...order, isDelivered: action.payload.isDelivered }
            : order
        ),
      };
    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], orderHistory: [] });

  const addItem = (item: Item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, cartItem) => total + cartItem.quantity, 0);
  };

  const addOrder = (order: Order) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
  };

  const updateStoreRating = (orderId: string, rating: number, review: string) => {
    dispatch({ type: 'UPDATE_STORE_RATING', payload: { orderId, rating, review } });
  };

  const updateOrderRating = (orderId: string, rating: number, review: string) => {
    dispatch({ type: 'UPDATE_ORDER_RATING', payload: { orderId, rating, review } });
  };

  const updateOrderDeliveryStatus = (orderId: string, isDelivered: boolean) => {
    dispatch({ type: 'UPDATE_ORDER_DELIVERY_STATUS', payload: { orderId, isDelivered } });
  };

  const value: CartContextType = {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    orderHistory: state.orderHistory,
    addOrder,
    updateStoreRating,
    updateOrderRating,
    updateOrderDeliveryStatus,
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
