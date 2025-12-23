# 快速開始指南

## 立即執行

### 1. 安裝相依套件
```bash
npm install
```

### 2. 啟動開發伺服器
```bash
npm run dev
```

### 3. 開啟瀏覽器
預設會自動開啟瀏覽器前往 `http://localhost:3000`

## 專案概述

這是一個完整的購物網站專案，包含以下三個主要階段：

### ✅ 第一階段：項目瀏覽
- 商品列表展示
- 分類篩選
- 關鍵字搜尋
- 多種排序方式
- 商品詳細資訊展示

### 🛒 第二階段：購物車管理
- 加入購物車
- 調整商品數量
- 移除商品
- 即時價格計算
- 購物車狀態持久化

### 💳 第三階段：訂單結帳
- 訂單明細確認
- 收件資訊填寫
- 表單驗證
- 訂單送出確認
- 成功頁面展示

## 技術棧

- ⚛️ React 18 + TypeScript
- 🎨 Ant Design 5
- ⚡ Vite
- 🎯 React Router
- 📊 CSV 資料源

## 目錄結構

```
hw3/
├── src/
│   ├── components/      # 可重用組件
│   ├── contexts/        # 全域狀態管理
│   ├── hooks/           # 自定義 Hooks
│   ├── pages/           # 頁面組件
│   ├── types/           # TypeScript 類型
│   └── utils/           # 工具函數
└── public/
    └── data/
        └── products.csv # 商品資料
```

## 修改商品資料

編輯 `public/data/products.csv` 檔案即可修改商品資料。
儲存後重新整理瀏覽器即可看到更新。

## 常用指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 程式碼檢查
npm run lint
```

## 瀏覽器支援

- Chrome (推薦)
- Firefox
- Safari
- Edge

## 注意事項

- 本專案為純前端應用，無後端伺服器
- 重新整理頁面後，購物車和訂單資料會清空
- 需要網路連線才能載入商品圖片（使用 Unsplash CDN）

## 遇到問題？

請查看 `README.md` 中的「常見問題」章節。




