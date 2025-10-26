# TypeScript 錯誤修復

## 修復日期：2025-10-11

---

## ✅ 已修復的問題

### 問題 1: CSS Modules 型別宣告缺失

#### 錯誤訊息
```
找不到模組 './ProductCompare.module.css' 或其對應的型別宣告。
```

#### 問題原因
TypeScript 預設不認識 `.module.css` 檔案，需要為 CSS Modules 提供型別宣告。

#### 解決方案
✅ 創建 `src/vite-env.d.ts` 檔案，包含：
- CSS Modules 型別宣告（.module.css, .module.scss, .module.sass）
- 圖片檔案型別宣告（.svg, .png, .jpg, .jpeg, .gif, .webp）
- Vite 客戶端型別參考

#### 新增檔案
**src/vite-env.d.ts**
```typescript
/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
// ... 其他型別宣告
```

---

### 問題 2: 未使用的變數警告

#### 錯誤訊息
```
'product' 已宣告但從未讀取其值。
```

#### 問題位置
`src/components/ProductCompare/ProductCompare.tsx:178`

#### 問題原因
在 `products.map()` 中，第一個參數 `product` 被宣告但沒有被使用，只使用了 `index`。

#### 解決方案
✅ 將未使用的參數改為底線 `_`，這是 TypeScript 的慣例，表示故意忽略該參數。

#### 修改內容
```typescript
// 修改前
...products.map((product, index) => ({
  title: `商品 ${index + 1}`,
  // ...
}))

// 修改後
...products.map((_, index) => ({
  title: `商品 ${index + 1}`,
  // ...
}))
```

---

## 📋 修復清單

### 新增檔案
- ✅ `src/vite-env.d.ts` - TypeScript 環境型別宣告

### 修改檔案
- ✅ `src/components/ProductCompare/ProductCompare.tsx` - 修復未使用變數警告

---

## 🎯 驗證修復

### 檢查 TypeScript 錯誤
```bash
# 在 VSCode 中
1. 開啟 src/components/ProductCompare/ProductCompare.tsx
2. 檢查是否還有紅色波浪線錯誤
3. 確認 CSS import 不再顯示錯誤
```

### 執行開發伺服器
```bash
npm run dev
```

### 檢查編譯
```bash
npm run build
```

應該不會看到任何 TypeScript 錯誤。

---

## 🔍 型別宣告檔案說明

### vite-env.d.ts 的作用

1. **CSS Modules 型別支援**
   - 讓 TypeScript 認識 `.module.css` 檔案
   - 提供 `styles` 物件的型別（字串索引）

2. **圖片檔案型別支援**
   - 允許 import 圖片檔案
   - 返回圖片的 URL 字串

3. **Vite 環境型別**
   - 引用 Vite 提供的環境變數型別
   - 支援 `import.meta.env` 等 Vite 特定功能

### 為什麼需要這個檔案？

TypeScript 是靜態型別檢查工具，預設只認識 `.ts`, `.tsx`, `.js`, `.jsx` 等程式碼檔案。

當我們 import CSS Modules 或圖片時：
```typescript
import styles from './Component.module.css';
import logo from './logo.png';
```

TypeScript 不知道這些檔案的型別，因此需要 `.d.ts` 宣告檔案告訴它：
- CSS Modules 返回一個物件，鍵是字串，值也是字串
- 圖片 import 返回圖片的 URL 字串

---

## 📚 相關知識

### TypeScript 型別宣告檔案

**`.d.ts` 檔案**
- Declaration File（宣告檔案）
- 只包含型別資訊，沒有實際的程式碼
- 讓 TypeScript 知道某些模組的型別結構

**全域型別宣告**
- 放在 `src/` 目錄下的 `.d.ts` 檔案
- 會被 TypeScript 自動載入
- 不需要手動 import

### 底線變數命名慣例

在 JavaScript/TypeScript 中：
```typescript
// 表示刻意忽略這個參數
array.map((_, index) => index)

// 如果需要使用，應該給予有意義的名稱
array.map((item, index) => item.id)
```

---

## ⚠️ 注意事項

### TypeScript 嚴格模式

專案啟用了 TypeScript 嚴格模式：
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

這意味著：
- ✅ 未使用的變數會產生警告
- ✅ 需要明確的型別宣告
- ✅ 更好的程式碼品質
- ⚠️ 需要更仔細地處理型別

### CSS Modules 命名規範

```typescript
// ✅ 正確：使用 camelCase
<div className={styles.productCard}>

// ✅ 正確：使用括號表示法處理 kebab-case
<div className={styles['product-card']}>

// ❌ 錯誤：直接使用 kebab-case 會報錯
<div className={styles.product-card}>
```

---

## 🔄 如果問題重現

### CSS Modules 錯誤重現
1. 確認 `src/vite-env.d.ts` 檔案存在
2. 確認 `tsconfig.json` 的 `include` 包含 `"src"`
3. 重新啟動 TypeScript 服務器（VSCode: Cmd+Shift+P → "Restart TS Server"）
4. 重新啟動開發伺服器

### 未使用變數警告
1. 檢查是否真的需要該變數
2. 如果不需要，改為底線 `_`
3. 如果需要但暫時未用，可以加上註解：
   ```typescript
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const unused = something;
   ```

---

## ✅ 驗證結果

執行 linter 檢查：
```bash
npm run lint
```

結果：
```
✅ No linter errors found.
```

所有 TypeScript 錯誤已成功修復！

---

**修復完成時間**：2025-10-11  
**狀態**：✅ 已完成  
**檢查結果**：無錯誤



