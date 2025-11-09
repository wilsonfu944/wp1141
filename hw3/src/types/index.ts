export interface Store {
  id: string;
  store_name: string;
  category: '食物' | '生活用品';
  average_rating: number;
  description: string;
  delivery_time: number; // 外送時間（秒）
  items: Item[];
}

export interface Item {
  id: string;
  item_name: string;
  price: number;
  rating: number;
  description: string;
  store_name: string;
  category: '食物' | '生活用品';
}

export interface CartItem {
  id: string;
  item: Item;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  orderHistory: Order[];
  addOrder: (order: Order) => void;
  updateStoreRating: (orderId: string, rating: number, review: string) => void;
  updateOrderRating: (orderId: string, rating: number, review: string) => void;
  updateOrderDeliveryStatus: (orderId: string, isDelivered: boolean) => void;
  updateStoreAverageRating: (storeName: string, newRating: number) => void;
}

export interface Order {
  id: string;
  storeName: string;
  items: CartItem[];
  totalPrice: number;
  timestamp: Date;
  deliveryTime: number; // 送達時間（秒）
  isDelivered: boolean; // 是否已送達
  deliveryAddress: {
    name: string;
    address: string;
    phone: string;
  }; // 送達地址
  storeRating?: number; // 店家評分 1-5 星
  storeReview?: string; // 店家評論文字
  orderRating?: number; // 訂單評分 1-5 星
  orderReview?: string; // 訂單評論文字
}
