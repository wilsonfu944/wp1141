# 快速參考指南

## TypeScript 類型定義速查

### 商品類型
```typescript
interface Product {
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
```

### 購物車商品
```typescript
interface CartItem {
  product: Product;
  quantity: number;
}
```

### 篩選選項
```typescript
interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'rating';
}
```

### 訂單
```typescript
interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  status: 'pending' | 'confirmed' | 'completed';
}
```

---

## Context 使用速查

### CartContext

#### 匯入
```typescript
import { useCart } from '@/contexts/CartContext';
```

#### 使用
```typescript
const {
  cartItems,           // CartItem[] - 購物車商品列表
  orders,              // Order[] - 訂單歷史
  isCartEmpty,         // boolean - 購物車是否為空
  addToCart,           // (product, quantity?) => void
  removeFromCart,      // (productId) => void
  updateQuantity,      // (productId, quantity) => void
  clearCart,           // () => void
  getTotalPrice,       // () => number
  getTotalItems,       // () => number
  submitOrder,         // () => Order | null
} = useCart();
```

#### 常用操作
```typescript
// 加入購物車
addToCart(product, 2);

// 移除商品
removeFromCart('P001');

// 更新數量
updateQuantity('P001', 5);

// 取得總價
const total = getTotalPrice();

// 提交訂單
const order = submitOrder();
```

---

### ProductContext

#### 匯入
```typescript
import { useProductContext } from '@/contexts/ProductContext';
```

#### 使用
```typescript
const {
  products,              // Product[] - 所有商品
  filteredProducts,      // Product[] - 篩選後的商品
  loading,               // boolean - 載入狀態
  error,                 // string | null - 錯誤訊息
  filterOptions,         // FilterOptions - 當前篩選條件
  categories,            // string[] - 所有分類
  updateFilterOptions,   // (options) => void
  resetFilters,          // () => void
} = useProductContext();
```

#### 常用操作
```typescript
// 搜尋
updateFilterOptions({ searchQuery: '手機' });

// 篩選分類
updateFilterOptions({ category: '電子產品' });

// 排序
updateFilterOptions({ sortBy: 'price-asc' });

// 價格範圍
updateFilterOptions({ minPrice: 1000, maxPrice: 5000 });

// 重置所有篩選
resetFilters();

// 組合多個條件
updateFilterOptions({
  category: '電子產品',
  searchQuery: 'Apple',
  sortBy: 'price-desc',
  minPrice: 10000
});
```

---

## 自定義 Hooks 速查

### useProducts
```typescript
import { useProducts } from '@/hooks/useProducts';

const { products, loading, error } = useProducts('/data/products.csv');
```

### useLocalStorage
```typescript
import { useLocalStorage } from '@/hooks/useLocalStorage';

const [favorites, setFavorites] = useLocalStorage('favorites', []);
```

### useFilters
```typescript
import { useFilters } from '@/hooks/useFilters';

const {
  filteredProducts,
  filterOptions,
  categories,
  priceRange,
  updateFilters,
  resetFilters,
  setSearchQuery,
  setCategory,
  setSortBy,
  setPriceRange
} = useFilters(products);
```

### useDebounce
```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [input, setInput] = useState('');
const debouncedInput = useDebounce(input, 500);

useEffect(() => {
  // 只在停止輸入 500ms 後才執行搜尋
  performSearch(debouncedInput);
}, [debouncedInput]);
```

### useThrottle
```typescript
import { useThrottle } from '@/hooks/useDebounce';

const [scrollY, setScrollY] = useState(0);
const throttledScrollY = useThrottle(scrollY, 100);
```

---

## 常用工具函數

### CSV 解析
```typescript
import { loadProductsFromCSV } from '@/utils/csvParser';

const products = await loadProductsFromCSV('/data/products.csv');
```

### 商品篩選
```typescript
import { filterProducts } from '@/utils/csvParser';

const filtered = filterProducts(products, '手機', '電子產品');
```

### 商品排序
```typescript
import { sortProducts } from '@/utils/csvParser';

const sorted = sortProducts(products, 'price-asc');
```

### localStorage 操作
```typescript
import { 
  clearLocalStorage, 
  clearAllLocalStorage 
} from '@/hooks/useLocalStorage';

clearLocalStorage('shopping_cart_items');
clearAllLocalStorage();
```

---

## 元件導入速查

### 從 components 導入
```typescript
import { Header } from '@/components/Header/Header';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { ShoppingCart } from '@/components/ShoppingCart/ShoppingCart';

// 或使用 barrel export
import { Header, ProductCard, ShoppingCart } from '@/components';
```

### 從 pages 導入
```typescript
import { ProductList } from '@/pages/ProductList/ProductList';
import { Checkout } from '@/pages/Checkout/Checkout';

// 或使用 barrel export
import { ProductList, Checkout } from '@/pages';
```

### 從 contexts 導入
```typescript
import { 
  ProductProvider, 
  useProductContext 
} from '@/contexts/ProductContext';

import { 
  CartProvider, 
  useCart 
} from '@/contexts/CartContext';

// 或使用 barrel export
import { 
  ProductProvider, 
  useProductContext,
  CartProvider,
  useCart 
} from '@/contexts';
```

---

## 完整使用範例

### 基本商品展示與購買
```typescript
import React from 'react';
import { useProductContext } from '@/contexts/ProductContext';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { Row, Col, Spin, Alert } from 'antd';

function ProductListPage() {
  const { filteredProducts, loading, error } = useProductContext();
  const { addToCart } = useCart();

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <Row gutter={[16, 16]}>
      {filteredProducts.map(product => (
        <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
}
```

### 搜尋與篩選
```typescript
import React, { useState } from 'react';
import { useProductContext } from '@/contexts/ProductContext';
import { Input, Select, Button } from 'antd';

function FilterBar() {
  const { 
    categories, 
    updateFilterOptions, 
    resetFilters 
  } = useProductContext();
  
  const [search, setSearch] = useState('');

  return (
    <div>
      <Input.Search
        value={search}
        onChange={e => setSearch(e.target.value)}
        onSearch={value => updateFilterOptions({ searchQuery: value })}
        placeholder="搜尋商品"
      />
      
      <Select 
        onChange={cat => updateFilterOptions({ category: cat })}
        style={{ width: 200 }}
      >
        <Select.Option value={undefined}>所有分類</Select.Option>
        {categories.map(cat => (
          <Select.Option key={cat} value={cat}>{cat}</Select.Option>
        ))}
      </Select>
      
      <Select 
        onChange={sort => updateFilterOptions({ sortBy: sort })}
        style={{ width: 150 }}
      >
        <Select.Option value="price-asc">價格：低到高</Select.Option>
        <Select.Option value="price-desc">價格：高到低</Select.Option>
        <Select.Option value="name">名稱</Select.Option>
        <Select.Option value="rating">評分</Select.Option>
      </Select>
      
      <Button onClick={resetFilters}>重置</Button>
    </div>
  );
}
```

### 購物車管理
```typescript
import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { List, Button, InputNumber } from 'antd';

function CartSidebar() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems
  } = useCart();

  return (
    <div>
      <h2>購物車 ({getTotalItems()} 件)</h2>
      
      <List
        dataSource={cartItems}
        renderItem={item => (
          <List.Item
            actions={[
              <InputNumber
                min={1}
                max={item.product.stock}
                value={item.quantity}
                onChange={qty => updateQuantity(item.product.id, qty || 1)}
              />,
              <Button 
                danger 
                onClick={() => removeFromCart(item.product.id)}
              >
                移除
              </Button>
            ]}
          >
            <List.Item.Meta
              title={item.product.name}
              description={`NT$ ${item.product.price}`}
            />
          </List.Item>
        )}
      />
      
      <div>
        <strong>總計：NT$ {getTotalPrice().toLocaleString()}</strong>
      </div>
    </div>
  );
}
```

### 結帳流程
```typescript
import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';

function CheckoutForm() {
  const { submitOrder, isCartEmpty } = useCart();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const order = submitOrder();
    if (order) {
      message.success(`訂單 ${order.id} 已送出！`);
      navigate('/order-success');
    }
  };

  if (isCartEmpty) {
    return <div>購物車是空的！</div>;
  }

  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item 
        name="name" 
        label="姓名" 
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item 
        name="phone" 
        label="電話"
        rules={[{ required: true, pattern: /^09\d{8}$/ }]}
      >
        <Input />
      </Form.Item>
      
      <Form.Item 
        name="address" 
        label="地址"
        rules={[{ required: true }]}
      >
        <Input.TextArea />
      </Form.Item>
      
      <Button type="primary" htmlType="submit">
        送出訂單
      </Button>
    </Form>
  );
}
```

---

## localStorage Keys

| Key | 用途 | 類型 |
|-----|------|------|
| `shopping_cart_items` | 購物車商品 | CartItem[] |
| `shopping_orders` | 訂單歷史 | Order[] |

---

## 效能優化檢查清單

- [ ] 使用 `useMemo` 記憶化計算結果
- [ ] 使用 `useCallback` 記憶化事件處理函數
- [ ] 使用 `React.memo` 避免不必要的組件重新渲染
- [ ] 搜尋框使用 `useDebounce` 延遲搜尋
- [ ] 滾動事件使用 `useThrottle` 限制觸發頻率
- [ ] 大型列表考慮使用虛擬滾動（react-window）
- [ ] 圖片使用懶加載（Intersection Observer API）

---

## 除錯技巧

### 檢查 localStorage
```javascript
// 在瀏覽器 Console 中執行
console.log(localStorage.getItem('shopping_cart_items'));
console.log(localStorage.getItem('shopping_orders'));
```

### 清除 localStorage
```javascript
// 清除購物車
localStorage.removeItem('shopping_cart_items');

// 清除訂單
localStorage.removeItem('shopping_orders');

// 清除全部
localStorage.clear();
```

### 檢查 Context 狀態
```typescript
// 在組件中
const cart = useCart();
console.log('Cart Items:', cart.cartItems);
console.log('Total:', cart.getTotalPrice());

const products = useProductContext();
console.log('Filtered Products:', products.filteredProducts);
console.log('Filter Options:', products.filterOptions);
```

---

## 常見問題快速解決

### Q: 購物車資料重新整理後消失？
A: 檢查是否正確使用了 `CartProvider` 包裹整個應用，localStorage 功能已自動啟用。

### Q: 商品列表無法載入？
A: 
1. 檢查 CSV 檔案路徑是否正確：`/data/products.csv`
2. 檢查 CSV 檔案格式是否正確（11 個欄位）
3. 查看 Console 是否有錯誤訊息

### Q: 篩選功能沒有作用？
A: 確認使用 `updateFilterOptions` 而不是直接修改 `filterOptions`

### Q: TypeScript 類型錯誤？
A: 確認所有匯入路徑使用 `@/` alias，檢查 `tsconfig.json` 配置是否正確

---

**最後更新**：2025-10-11  
**版本**：v1.0







