# Ubor Eat - 外送平台

一個現代化的外送平台網站，提供完整的訂餐體驗，包括店家瀏覽、商品選擇、購物車管理、地址管理和訂單追蹤功能。

## 🚀 功能特色

### 📱 主要功能

- **店家瀏覽**：瀏覽不同類型的店家（食物、生活用品）
- **商品選擇**：查看店家商品詳情，包括價格、評分、描述
- **購物車管理**：添加/移除商品，調整數量
- **地址管理**：保存多個送達地址，支持歷史地址選擇
- **訂單追蹤**：實時送達計時器，顯示訂單狀態
- **評分系統**：為店家和訂單進行評分

### 🎯 核心特色

#### 1. 智能送達計時器
- 基於店家實際送達時間的準確倒數
- 實時狀態更新（處理中 → 準備中 → 即將送達 → 已送達）
- 動態顏色變化，視覺化送達進度
- 在訂單歷史頁面持續追蹤

#### 2. 地址管理系統
- 自動記憶用戶輸入的地址
- 支持多個地址管理
- 快速選擇歷史地址
- 地址驗證確保信息完整

#### 3. 用戶友好界面
- 響應式設計，適配各種設備
- 直觀的導航和操作流程
- 美觀的 UI 設計
- 流暢的用戶體驗

## 🛠️ 技術棧

- **前端框架**：React 18 + TypeScript
- **路由管理**：React Router
- **狀態管理**：React Context API
- **樣式框架**：Tailwind CSS
- **構建工具**：Vite
- **圖標庫**：Lucide React
- **數據處理**：Papa Parse (CSV)

## 📋 系統要求

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本
- 現代瀏覽器（Chrome、Firefox、Safari、Edge）

## 🚀 快速開始

### 1. 環境準備

確保你的系統已安裝 Node.js：

```bash
# 檢查 Node.js 版本
node --version

# 檢查 npm 版本
npm --version
```

如果沒有安裝 Node.js，請前往 [Node.js 官網](https://nodejs.org/) 下載並安裝。

### 2. 下載項目

```bash
# 克隆項目（如果使用 Git）
git clone <repository-url>
cd hw3

# 或者直接下載並解壓項目文件夾
```

### 3. 安裝依賴

```bash
# 安裝項目依賴
npm install
```

### 4. 啟動開發服務器

```bash
# 啟動開發服務器
npm run dev
```

### 5. 訪問網站

打開瀏覽器，訪問 `http://localhost:5173`

## 📁 項目結構

```
hw3/
├── public/
│   └── delivery_data2.csv          # 店家數據文件
├── src/
│   ├── components/                 # 可重用組件
│   │   ├── ui/                    # UI 基礎組件
│   │   ├── CartDrawer.tsx         # 購物車抽屜
│   │   ├── DeliveryTimer.tsx      # 送達計時器
│   │   ├── ItemModal.tsx          # 商品詳情彈窗
│   │   ├── RatingDialog.tsx       # 評分對話框
│   │   └── StoreCard.tsx          # 店家卡片
│   ├── contexts/                  # 狀態管理
│   │   ├── AddressContext.tsx     # 地址管理
│   │   ├── CartContext.tsx        # 購物車狀態
│   │   └── StoreContext.tsx       # 店家狀態
│   ├── pages/                     # 頁面組件
│   │   ├── CartPage.tsx           # 購物車頁面
│   │   ├── CheckoutPage.tsx       # 結帳頁面
│   │   ├── OrderHistory.tsx       # 訂單歷史
│   │   └── StoreList.tsx          # 店家列表
│   ├── types/                     # TypeScript 類型定義
│   ├── utils/                     # 工具函數
│   ├── App.tsx                    # 主應用組件
│   └── main.tsx                   # 應用入口
├── package.json                   # 項目配置
├── tailwind.config.js             # Tailwind 配置
├── tsconfig.json                  # TypeScript 配置
└── vite.config.ts                 # Vite 配置
```

## 🎮 使用指南

### 瀏覽店家
1. 在主頁面瀏覽所有店家
2. 使用搜尋功能查找特定店家或商品
3. 使用分類篩選（全部、食物、生活用品）

### 選擇商品
1. 點擊店家卡片查看商品列表
2. 查看商品詳情（價格、評分、描述）
3. 點擊「加入購物車」按鈕

### 管理購物車
1. 點擊右上角購物車圖標
2. 調整商品數量或移除商品
3. 查看訂單摘要和總價

### 結帳流程
1. 點擊「前往結帳」按鈕
2. 選擇或新增送達地址
3. 確認訂單詳情
4. 點擊「確認送出訂單」

### 追蹤訂單
1. 自動跳轉到訂單歷史頁面
2. 查看送達計時器倒數
3. 等待送達完成
4. 為訂單和店家評分

## 🔧 開發說明

### 數據來源
- 店家數據來自 `public/delivery_data2.csv`
- 包含店家名稱、商品信息、價格、評分等
- 送達時間為隨機生成（20-100秒）

### 狀態管理
- 使用 React Context 管理全局狀態
- 分離關注點：購物車、店家、地址各自管理
- 支持狀態持久化（在會話期間）

### 樣式系統
- 使用 Tailwind CSS 進行樣式設計
- 響應式設計，適配各種屏幕尺寸
- 統一的設計語言和組件庫

## 🐛 故障排除

### 常見問題

**1. 端口被佔用**
```bash
# 如果 5173 端口被佔用，Vite 會自動使用其他端口
# 查看終端輸出確認實際端口號
```

**2. 依賴安裝失敗**
```bash
# 清除緩存並重新安裝
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**3. 數據加載失敗**
- 確保 `public/delivery_data2.csv` 文件存在
- 檢查文件格式是否正確

**4. 頁面無法訪問**
- 確認開發服務器正在運行
- 檢查瀏覽器控制台是否有錯誤信息

## 📝 功能詳細說明

### 送達計時器
- 基於訂單創建時間和店家送達時間計算
- 實時更新，準確顯示剩餘時間
- 狀態變化：處理中（藍色）→ 準備中（黃色）→ 即將送達（紅色）→ 已送達（綠色）

### 地址管理
- 支持多個地址保存
- 第一個地址自動設為默認
- 地址信息包含：收件人姓名、詳細地址、聯絡電話

### 評分系統
- 店家評分：1-5 星評分 + 文字評論
- 訂單評分：1-5 星評分 + 文字評論
- 評分會影響店家平均評分

## 🤝 貢獻指南

1. Fork 項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 許可證

此項目僅供學習和演示使用。

## 📞 聯繫方式

如有問題或建議，請聯繫開發團隊。

---

**享受你的外送體驗！🍕🍔🥗**