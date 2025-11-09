# 跑步路線追蹤 App

一個完整的前後端分離跑步路線追蹤應用程式，使用 React + TypeScript + Vite 前端和 Node.js + Express + TypeScript 後端。

## 技術棧

### 前端
- React 18 + TypeScript
- Vite (建構工具)
- TailwindCSS (UI 框架)
- Axios (HTTP 客戶端)
- Google Maps JavaScript API (地圖功能)

### 後端
- Node.js + Express + TypeScript
- SQLite (資料庫)
- JWT (認證)
- bcryptjs (密碼雜湊)
- Google Maps Server APIs (Geocoding, Directions)

## 功能特色

### 使用者認證
- 註冊 / 登入 / 登出
- JWT 權杖認證
- 密碼雜湊保護
- 權限控管

### 路線管理
- 新增跑步路線
- 地圖點擊選擇起點/終點
- 自動計算路線距離
- 路線列表檢視
- 編輯 / 刪除路線
- 地圖定位顯示

### 地圖功能
- Google Maps 整合
- 互動式地圖操作
- 路線視覺化
- 地址轉座標
- 距離計算

## 專案結構

```
my-hw4/
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/      # React 組件
│   │   ├── hooks/          # 自定義 Hooks
│   │   ├── services/       # API 服務
│   │   ├── types/          # TypeScript 型別
│   │   └── ...
│   ├── .env.example        # 環境變數範例
│   └── package.json
├── backend/                 # Node.js 後端
│   ├── src/
│   │   ├── database/       # 資料庫相關
│   │   ├── models/         # 資料模型
│   │   ├── routes/         # API 路由
│   │   ├── middleware/     # 中介軟體
│   │   ├── services/       # 外部服務
│   │   └── ...
│   ├── .env.example        # 環境變數範例
│   └── package.json
└── README.md
```

## 首次設定指南

### 前置需求
- Node.js (建議 v18 以上)
- npm 或 yarn
- Google Cloud Platform 帳號（用於取得 Google Maps API Key）

### 取得 Google Maps API Key

1. **前往 Google Cloud Console**
   - 訪問：https://console.cloud.google.com/
   - 登入您的 Google 帳號

2. **建立新專案或選擇現有專案**
   - 點擊頂部「建立專案」
   - 輸入專案名稱（例如：running-tracker）
   - 點擊「建立」

3. **啟用必要的 API**
   - 在側邊欄選擇「API 和服務」>「程式庫」
   - 搜尋並啟用以下 API：
     - Maps JavaScript API
     - Geocoding API
     - Directions API

4. **建立憑證（API Key）**

   **前端 Browser Key (Maps JavaScript API)**
   - 前往「API 和服務」>「憑證」
   - 點擊「建立憑證」>「API 金鑰」
   - 複製建立的金鑰
   - **重要**：點擊「限制金鑰」
     - 應用程式限制：選擇「HTTP 推薦資料來源 (網站)」
     - 在「網站限制」中加入：`http://localhost:5173`
     - API 限制：選擇「限制金鑰」> 只選擇「Maps JavaScript API」
   - 點擊「儲存」

   **後端 Server Key (Geocoding, Directions API)**
   - 建立第二個 API 金鑰
   - 點擊「限制金鑰」
     - 應用程式限制：選擇「無」
     - API 限制：選擇「限制金鑰」> 選擇以下兩個：
       - Geocoding API
       - Directions API
   - 點擊「儲存」

5. **設定計費（免費額度）**
   - Google Maps 提供每月 $200 的免費額度
   - 對於小型專案測試完全夠用
   - 在「結帳」頁面啟用帳單即可開始使用

### 環境變數設定

#### 後端環境變數 (.env)
```env
PORT=3000
DATABASE_URL=file:./dev.db
GOOGLE_MAPS_SERVER_KEY=你的_Server_Key_放這裡
JWT_SECRET=請生成一個隨機字串作為 JWT 密鑰（建議至少 32 字元）
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 前端環境變數 (.env)
```env
VITE_GOOGLE_MAPS_JS_KEY=你的_Browser_Key_放這裡
VITE_API_BASE_URL=http://localhost:3000
```

> **注意**：請將上述的 `你的_Server_Key_放這裡` 和 `你的_Browser_Key_放這裡` 替換為您從 Google Cloud Console 取得的實際 API Key。

## 安裝與執行

### 1. 安裝依賴

#### 後端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 2. 設定環境變數

複製 `env.example` 為 `.env` 並填入實際值：

```bash
# 後端
cd backend
cp env.example .env
# 使用文字編輯器開啟 .env 檔案，填入以下內容：
# - GOOGLE_MAPS_SERVER_KEY：填入您的 Server Key
# - JWT_SECRET：填入一個隨機字串（可自行生成或使用線上工具）

# 前端
cd ../frontend
cp env.example .env
# 使用文字編輯器開啟 .env 檔案，填入以下內容：
# - VITE_GOOGLE_MAPS_JS_KEY：填入您的 Browser Key
# - VITE_API_BASE_URL：預設為 http://localhost:3000
```

**快速生成 JWT_SECRET**（可選）：
```bash
# macOS/Linux
openssl rand -base64 32

# 或在 Node.js 中
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. 初始化資料庫

資料庫會在後端啟動時自動初始化（透過 `runMigrations()`）。如果您想手動執行：

```bash
cd backend
npm run db:migrate
```

首次啟動後端伺服器時，會自動建立必要的資料表：
- `users` - 使用者表
- `routes` - 路線表

### 4. 啟動服務

#### 啟動後端 (終端機 1)
```bash
cd backend
npm run dev
```

#### 啟動前端 (終端機 2)
```bash
cd frontend
npm run dev
```

### 5. 存取應用程式

- 前端: http://localhost:5173
- 後端 API: http://localhost:3000
- 健康檢查: http://localhost:3000/health

## API 端點

### 認證
- `POST /auth/register` - 註冊
- `POST /auth/login` - 登入
- `POST /auth/logout` - 登出
- `GET /auth/verify` - 驗證權杖

### 路線管理
- `GET /api/routes` - 取得所有路線
- `GET /api/routes/:id` - 取得特定路線
- `POST /api/routes` - 建立新路線
- `PUT /api/routes/:id` - 更新路線
- `DELETE /api/routes/:id` - 刪除路線

## 使用說明

1. **註冊/登入**: 首次使用請先註冊帳戶
2. **新增路線**: 點擊「新增路線」按鈕，填寫路線資訊並在地圖上選擇起點和終點
3. **檢視路線**: 在路線列表中點擊「查看地圖」可在地圖上顯示該路線
4. **編輯路線**: 點擊路線列表中的「編輯」按鈕修改路線資訊
5. **刪除路線**: 點擊「刪除」按鈕移除不需要的路線

## 開發說明

### 資料庫模型

#### Users 表
- id (主鍵)
- email (唯一)
- password (雜湊)
- createdAt, updatedAt

#### Routes 表
- id (主鍵)
- title, description
- startLat, startLng, endLat, endLng
- distance (公尺)
- date
- createdBy (外鍵)
- createdAt, updatedAt

### 安全特性

- JWT 權杖認證
- 密碼 bcrypt 雜湊
- CORS 設定
- 輸入驗證
- 權限控管

### 錯誤處理

- 統一的 API 響應格式
- 適當的 HTTP 狀態碼
- 前端錯誤提示
- 後端日誌記錄

## 授權

MIT License





