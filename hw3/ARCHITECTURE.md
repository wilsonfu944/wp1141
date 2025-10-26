# 專案架構文檔

## TypeScript 類型定義

### 1. Product - 商品類型
```typescript
interface Product {
  id: string;              // 商品唯一識別碼
  name: string;            // 商品名稱
  category: string;        // 商品分類
  price: number;           // 商品價格
  stock: number;           // 庫存數量
  description: string;     // 商品描述
  image_url: string;       // 商品圖片 URL
  brand: string;           // 品牌名稱
  rating: number;          // 評分 (1.0-5.0)
  features: string;        // 特徵 (用 / 分隔)
  created_date: string;    // 建立日期 (YYYY-MM-DD)
}
```

### 2. CartItem - 購物車商品
```typescript
interface CartItem {
  product: Product;        // 完整的商品資訊
  quantity: number;        // 購買數量
}
```

### 3. FilterOptions - 篩選選項
```typescript
interface FilterOptions {
  category?: string;                           // 商品分類
  minPrice?: number;                           // 最低價格
  maxPrice?: number;                           // 最高價格
  searchQuery?: string;                        // 搜尋關鍵字
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'rating';  // 排序方式
}
```

### 4. Order - 訂單資訊
```typescript
interface Order {
  id: string;                                  // 訂單編號
  items: CartItem[];                           // 訂單商品列表
  totalAmount: number;                         // 總金額
  createdAt: Date;                            // 建立時間
  status: 'pending' | 'confirmed' | 'completed';  // 訂單狀態
}
```

---

## Context 狀態管理

### 1. CartContext - 購物車管理

#### 功能特色
- ✅ **localStorage 持久化** - 重新整理頁面後購物車資料不會消失
- ✅ **訂單歷史管理** - 所有已送出的訂單都會保存
- ✅ **庫存驗證** - 加入購物車時自動檢查庫存
- ✅ **自動訊息提示** - 使用 Ant Design message 組件提供即時回饋

#### Context 介面
```typescript
interface CartContextType {
  cartItems: CartItem[];                       // 購物車商品列表
  orders: Order[];                             // 訂單歷史
  isCartEmpty: boolean;                        // 購物車是否為空
  
  // 購物車操作
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // 計算功能
  getTotalPrice: () => number;
  getTotalItems: () => number;
  
  // 訂單操作
  submitOrder: () => Order | null;
}
```

#### 使用方式
```typescript
import { useCart } from '@/contexts/CartContext';

function MyComponent() {
  const { cartItems, addToCart, getTotalPrice } = useCart();
  
  const handleAddToCart = () => {
    addToCart(product, 2);  // 加入 2 個商品
  };
  
  return (
    <div>
      <p>購物車商品數：{cartItems.length}</p>
      <p>總價：NT$ {getTotalPrice()}</p>
    </div>
  );
}
```

#### localStorage Keys
- `shopping_cart_items` - 儲存購物車商品
- `shopping_orders` - 儲存訂單歷史

---

### 2. ProductContext - 商品資料管理

#### 功能特色
- ✅ **自動載入 CSV** - 從 public/data/products.csv 自動載入商品資料
- ✅ **即時篩選** - 根據分類、價格、關鍵字即時篩選
- ✅ **多種排序** - 支援價格、名稱、評分排序
- ✅ **錯誤處理** - CSV 載入失敗時顯示錯誤訊息

#### Context 介面
```typescript
interface ProductContextType {
  products: Product[];                         // 原始商品列表
  filteredProducts: Product[];                 // 篩選後的商品列表
  loading: boolean;                            // 載入狀態
  error: string | null;                        // 錯誤訊息
  
  filterOptions: FilterOptions;                // 當前篩選選項
  categories: string[];                        // 所有分類列表
  
  // 篩選操作
  updateFilterOptions: (options: Partial<FilterOptions>) => void;
  resetFilters: () => void;
}
```

#### 使用方式
```typescript
import { useProductContext } from '@/contexts/ProductContext';

function ProductList() {
  const { 
    filteredProducts, 
    loading, 
    error,
    updateFilterOptions,
    categories 
  } = useProductContext();
  
  const handleSearch = (query: string) => {
    updateFilterOptions({ searchQuery: query });
  };
  
  if (loading) return <Spin />;
  if (error) return <Alert message={error} type="error" />;
  
  return (
    <div>
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 自定義 Hooks

### 1. useProducts - 載入商品資料
```typescript
const { products, loading, error } = useProducts('/data/products.csv');
```

**功能**：
- 從 CSV 檔案載入商品資料
- 自動處理載入狀態和錯誤
- 使用 useEffect 監聽檔案路徑變化

### 2. useLocalStorage - localStorage 持久化
```typescript
const [value, setValue] = useLocalStorage('key', initialValue);
```

**功能**：
- 自動同步狀態到 localStorage
- 支援任意 JSON 可序列化的資料類型
- 自動錯誤處理

**輔助函數**：
```typescript
clearLocalStorage('key');      // 清除特定 key
clearAllLocalStorage();         // 清除所有 localStorage
```

### 3. useFilters - 商品篩選管理
```typescript
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

**功能**：
- 統一管理所有篩選邏輯
- 自動計算分類列表和價格範圍
- 提供便捷的更新函數

### 4. useDebounce - 防抖
```typescript
const debouncedValue = useDebounce(searchQuery, 500);
```

**用途**：
- 搜尋輸入框優化
- 減少不必要的 API 請求
- 提升使用者體驗

### 5. useThrottle - 節流
```typescript
const throttledValue = useThrottle(scrollPosition, 100);
```

**用途**：
- 滾動事件優化
- 限制高頻事件觸發
- 提升效能

---

## 資料流架構

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           ProductProvider (CSV 載入)                │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │          CartProvider (localStorage)          │  │    │
│  │  │  ┌────────────────────────────────────────┐  │  │    │
│  │  │  │         Router & Components            │  │  │    │
│  │  │  │                                        │  │  │    │
│  │  │  │  - Header                              │  │  │    │
│  │  │  │  - ProductList                         │  │  │    │
│  │  │  │  - ShoppingCart                        │  │  │    │
│  │  │  │  - Checkout                            │  │  │    │
│  │  │  │                                        │  │  │    │
│  │  │  └────────────────────────────────────────┘  │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

資料流向：
1. CSV 檔案 → useProducts Hook → ProductContext → 商品展示組件
2. 使用者操作 → CartContext → localStorage → 購物車/結帳組件
3. 篩選條件 → ProductContext → filteredProducts → ProductList
```

---

## 使用範例

### 完整的商品瀏覽與購買流程

```typescript
import React from 'react';
import { useProductContext } from '@/contexts/ProductContext';
import { useCart } from '@/contexts/CartContext';
import { Button, Input, Select } from 'antd';

function ShoppingPage() {
  // 1. 取得商品資料和篩選功能
  const {
    filteredProducts,
    loading,
    categories,
    updateFilterOptions,
    resetFilters
  } = useProductContext();
  
  // 2. 取得購物車功能
  const {
    addToCart,
    cartItems,
    getTotalPrice,
    getTotalItems
  } = useCart();
  
  // 3. 處理搜尋
  const handleSearch = (value: string) => {
    updateFilterOptions({ searchQuery: value });
  };
  
  // 4. 處理分類篩選
  const handleCategoryChange = (category: string) => {
    updateFilterOptions({ 
      category: category === 'all' ? undefined : category 
    });
  };
  
  // 5. 處理排序
  const handleSortChange = (sortBy: string) => {
    updateFilterOptions({ sortBy: sortBy as any });
  };
  
  // 6. 加入購物車
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };
  
  return (
    <div>
      {/* 搜尋和篩選 */}
      <Input.Search 
        placeholder="搜尋商品" 
        onSearch={handleSearch} 
      />
      
      <Select onChange={handleCategoryChange}>
        <Select.Option value="all">所有分類</Select.Option>
        {categories.map(cat => (
          <Select.Option key={cat} value={cat}>{cat}</Select.Option>
        ))}
      </Select>
      
      <Select onChange={handleSortChange}>
        <Select.Option value="price-asc">價格：低到高</Select.Option>
        <Select.Option value="price-desc">價格：高到低</Select.Option>
        <Select.Option value="name">名稱</Select.Option>
        <Select.Option value="rating">評分</Select.Option>
      </Select>
      
      <Button onClick={resetFilters}>重置篩選</Button>
      
      {/* 商品列表 */}
      {loading ? (
        <p>載入中...</p>
      ) : (
        <div>
          {filteredProducts.map(product => (
            <div key={product.id}>
              <h3>{product.name}</h3>
              <p>NT$ {product.price}</p>
              <Button onClick={() => handleAddToCart(product)}>
                加入購物車
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* 購物車摘要 */}
      <div>
        <p>購物車：{getTotalItems()} 件商品</p>
        <p>總計：NT$ {getTotalPrice()}</p>
      </div>
    </div>
  );
}
```

---

## 效能優化

### 1. useMemo - 記憶化計算
```typescript
// ProductContext 中
const filteredProducts = useMemo(() => {
  let result = filterProducts(products, searchQuery, category);
  if (sortBy) {
    result = sortProducts(result, sortBy);
  }
  return result;
}, [products, searchQuery, category, sortBy]);
```

### 2. useCallback - 記憶化函數
```typescript
// CartContext 中
const addToCart = useCallback((product: Product, quantity: number) => {
  // ... 實作
}, []);
```

### 3. React.memo - 組件記憶化
```typescript
export const ProductCard = React.memo<ProductCardProps>(({ product }) => {
  // ... 組件實作
});
```

### 4. 防抖搜尋
```typescript
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 500);

useEffect(() => {
  updateFilterOptions({ searchQuery: debouncedSearch });
}, [debouncedSearch]);
```

---

## 錯誤處理

### 1. CSV 載入錯誤
```typescript
try {
  const data = await loadProductsFromCSV(csvPath);
  setProducts(data);
} catch (err) {
  setError('載入商品資料失敗，請稍後再試');
  console.error('Error loading products:', err);
}
```

### 2. localStorage 錯誤
```typescript
try {
  localStorage.setItem(key, JSON.stringify(value));
} catch (error) {
  console.error('localStorage 儲存失敗:', error);
  // 可能是 quota exceeded，優雅降級
}
```

### 3. 庫存驗證
```typescript
if (newQuantity > product.stock) {
  message.warning(`庫存不足！目前庫存：${product.stock}`);
  return prevItems;  // 不更新狀態
}
```

---

## 測試建議

### 1. Context 單元測試
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCart } from '@/contexts/CartContext';

test('addToCart should add product to cart', () => {
  const { result } = renderHook(() => useCart());
  
  act(() => {
    result.current.addToCart(mockProduct, 2);
  });
  
  expect(result.current.cartItems).toHaveLength(1);
  expect(result.current.getTotalItems()).toBe(2);
});
```

### 2. Hooks 測試
```typescript
test('useDebounce should delay value update', async () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 500),
    { initialProps: { value: 'initial' } }
  );
  
  expect(result.current).toBe('initial');
  
  rerender({ value: 'updated' });
  expect(result.current).toBe('initial');  // 還沒更新
  
  await waitFor(() => {
    expect(result.current).toBe('updated');  // 500ms 後更新
  }, { timeout: 600 });
});
```

---

## 最佳實踐

### 1. 類型安全
- ✅ 所有 props 都有明確的 TypeScript 介面定義
- ✅ 使用 strict mode 確保類型檢查
- ✅ 避免使用 `any` 類型

### 2. 狀態管理
- ✅ 全域狀態使用 Context
- ✅ 局部狀態使用 useState
- ✅ 副作用使用 useEffect

### 3. 效能
- ✅ 使用 useMemo 避免不必要的計算
- ✅ 使用 useCallback 避免函數重新創建
- ✅ 使用 React.memo 避免組件重新渲染

### 4. 持久化
- ✅ 購物車資料自動儲存到 localStorage
- ✅ 訂單歷史保存在 localStorage
- ✅ 重新整理頁面資料不會丟失

### 5. 使用者體驗
- ✅ 載入狀態顯示
- ✅ 錯誤訊息提示
- ✅ 成功操作回饋
- ✅ 防抖優化搜尋

---

## 擴展建議

### 1. 新增功能
- [ ] 商品收藏功能（使用 FavoritesContext）
- [ ] 瀏覽歷史記錄
- [ ] 商品比較功能
- [ ] 評論與評分系統
- [ ] 優惠券系統

### 2. 效能優化
- [ ] 虛擬滾動（react-window）
- [ ] 圖片懶加載（Intersection Observer）
- [ ] Service Worker 快取
- [ ] 程式碼分割（React.lazy）

### 3. 功能增強
- [ ] 多語系支援（i18n）
- [ ] 深色模式
- [ ] PWA 支援
- [ ] 無障礙優化（ARIA）

---

**文檔版本**：v1.0  
**最後更新**：2025-10-11  
**維護者**：開發團隊







