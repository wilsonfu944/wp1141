// 商品類型定義
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  brand: string;
  rating: number;
  features: string;
  created_date: string;
}

// 購物車項目類型定義
export interface CartItem {
  product: Product;
  quantity: number;
}

// 訂單類型定義
export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  status: 'pending' | 'confirmed' | 'completed';
}

// 篩選條件類型定義
export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'rating' | 'date';
  brands?: string[];
  minRating?: number;
  inStockOnly?: boolean;
}

