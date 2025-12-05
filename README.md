# AniMap - 動漫聖地巡禮地圖

一個讓動漫愛好者探索現實世界取景地（聖地）的平台。使用者可以在地圖上找到動畫中出現的場景，並透過互動介面比較「動畫截圖」與「真實照片」的還原度。

## 功能特色

- 🗺️ **全螢幕互動地圖** - 使用 Google Maps 顯示所有動漫取景地點
- 📍 **智慧標記聚合** - 縮小地圖時自動聚合鄰近景點
- 🖼️ **沉浸式場景對比** - 拖曳滑桿比較動畫截圖與真實照片
- 🔍 **搜尋與篩選** - 依動畫名稱或地區篩選景點
- ❤️ **個人收藏** - 收藏想去的景點，建立個人清單
- 🔐 **使用者認證** - 安全的註冊/登入系統
- 💬 **留言板與私訊** - 與其他使用者交流，尋找旅伴
- 🤖 **AI客服小精靈** - 智能助手解答問題
- 👥 **好友系統** - 加好友、推薦好友（基於共同喜歡的動畫）
- ⭐ **評分系統** - 為動畫和地點評分
- 📝 **行程規劃** - 規劃聖地巡禮路線，智能優化
- 🎬 **動畫跑馬燈** - 首頁展示動畫輪播

## 技術堆疊

### 前端
- React 18 + TypeScript + Vite
- Google Maps API (地圖)
- Tailwind CSS (樣式)
- React Query (資料管理)
- React Router (路由)
- React Hook Form (表單)

### 後端
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT 認證
- Zod 驗證
- Groq AI API (客服小精靈)
- Google Maps Distance Matrix API (路線優化)

## 專案結構

```
final-project/
├── frontend/          # React 前端應用
├── backend/           # Express 後端 API
└── README.md
```

## 安裝與設定

### 前置需求

- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn
- Google Maps API Key
- Groq API Key (可選，用於AI客服)

### 1. 安裝依賴

```bash
# 安裝前端依賴
cd frontend
npm install

# 安裝後端依賴
cd ../backend
npm install
```

### 2. 設定資料庫

在 `backend` 目錄下建立 `.env` 檔案：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/animap?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
LLM_API_KEY="your-groq-api-key"
LLM_API_BASE="https://api.groq.com/openai/v1"
```

### 3. 初始化資料庫

```bash
cd backend

# 產生 Prisma Client
npm run prisma:generate

# 同步資料庫結構
npx prisma db push

# 載入種子資料
npm run prisma:seed
```

### 4. 設定前端環境變數

在 `frontend` 目錄下建立 `.env` 檔案：

```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 5. 啟動開發伺服器

```bash
# 啟動後端 (在 backend 目錄)
npm run dev

# 啟動前端 (在 frontend 目錄，新開一個終端)
npm run dev
```

前端將在 `http://localhost:5173` 運行
後端 API 將在 `http://localhost:3001` 運行

## API 端點

### 認證
- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入
- `GET /api/auth/me` - 取得當前使用者

### 地點
- `GET /api/locations` - 取得所有地點（支援查詢參數：animeId, region）
- `GET /api/locations/:id` - 取得單一地點詳情

### 動畫
- `GET /api/animes` - 取得所有動畫列表
- `GET /api/animes/:id` - 取得單一動畫及其地點

### 收藏
- `GET /api/favorites` - 取得使用者所有收藏
- `POST /api/favorites/:locationId` - 新增收藏
- `DELETE /api/favorites/:locationId` - 移除收藏
- `GET /api/favorites/:locationId/check` - 檢查是否已收藏

### 喜歡的動畫
- `GET /api/favorite-animes` - 取得使用者喜歡的動畫列表
- `POST /api/favorite-animes/:animeId` - 新增喜歡的動畫
- `DELETE /api/favorite-animes/:animeId` - 移除喜歡的動畫
- `GET /api/favorite-animes/:animeId/check` - 檢查是否已喜歡

### 好友
- `GET /api/friends` - 取得好友列表
- `POST /api/friends/request/:receiverId` - 發送好友請求
- `GET /api/friends/requests` - 取得待處理的好友請求
- `PUT /api/friends/request/:requestId` - 接受/拒絕好友請求
- `GET /api/friends/recommendations` - 取得推薦好友（基於共同喜歡的動畫）

### 評分
- `POST /api/ratings/anime/:id` - 為動畫評分
- `GET /api/ratings/anime/:id` - 取得動畫評分
- `POST /api/ratings/location/:id` - 為地點評分
- `GET /api/ratings/location/:id` - 取得地點評分

### AI客服
- `POST /api/ai/chat` - 與AI客服小精靈聊天

## 開發

### 資料庫遷移

```bash
cd backend
npx prisma db push
```

### 重新載入種子資料

```bash
cd backend
npm run prisma:seed
```

## 授權

MIT License
