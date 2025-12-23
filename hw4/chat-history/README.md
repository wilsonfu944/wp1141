# Chat History - 日本旅遊行程規劃平台

## 專案概述

本專案實作了一個「日本旅遊行程規劃平台」，提供以下核心功能：

1. **使用者認證系統**：註冊、登入、JWT 認證
2. **景點收藏**：整合 Google Maps API，搜尋並收藏日本景點
3. **行程規劃**：建立多天旅遊行程，並在地圖上規劃路線
4. **行事曆介面**：以日曆方式顯示行程，可編輯每日詳細行程
5. **地圖互動**：即時搜尋、標記、路線顯示等功能

## 技術架構

### 前端
- React + TypeScript + Vite
- Material UI（UI 組件庫）
- React Router（路由管理）
- Google Maps JavaScript API
- Axios（HTTP 客戶端）
- date-fns（日期處理）

### 後端
- Node.js + Express + TypeScript
- SQLite + Prisma ORM
- JWT 認證（jsonwebtoken + bcrypt）
- Google Maps API（Places、Geocoding、Directions）

## 主要開發歷程

### 1. 專案初始化
- 建立前後端專案結構
- 設定 TypeScript、ESLint、Vite
- 安裝必要套件

### 2. 後端基礎建設
- 設定 Express 伺服器、CORS
- 建立 Prisma Schema（User、Place、Trip、TripDay）
- 實作 JWT 認證中介層
- 實作錯誤處理與驗證中介層

### 3. 認證系統
- 使用者註冊/登入 API
- 密碼雜湊（bcrypt）
- JWT Token 產生與驗證
- 前端認證 Context
- Protected Routes

### 4. Google Maps 整合
- 後端 Google Maps 服務（Places、Geocoding、Directions）
- 前端地圖組件（@react-google-maps/api）
- 地圖搜尋功能
- 地圖標記與互動

### 5. 景點收藏功能
- Places CRUD API
- 前端景點列表與管理
- 即時搜尋並直接加入收藏
- 地圖與列表雙向同步

### 6. 行程規劃功能
- Trips 與 TripDay CRUD API
- 前端行程管理
- 行事曆視圖（CalendarView）
- 每日行程編輯（DayScheduleDialog）
- 支援設定每個景點的開始與結束時間

### 7. UI/UX 優化
- 首頁輪播圖片展示
- 搜尋結果自動顯示在地圖上
- 實時更新收藏列表
- 錯誤處理與使用者回饋

## 主要功能改進

1. **首頁設計**：實作圖片輪播，展示日本風景
2. **景點搜尋流程優化**：搜尋結果可直接加入收藏，無需中間步驟
3. **地圖同步**：搜尋時地圖自動定位到結果位置
4. **行事曆介面**：以日曆方式顯示行程，支援點擊編輯每日行程
5. **行程詳細編輯**：可為每個景點設定開始與結束時間

## 遇到的問題與解決方案

### 問題 1：useAuth.ts 檔案解析錯誤
- **錯誤**：`Expected ">" but found "value"`
- **原因**：檔案包含 JSX 但使用 .ts 副檔名
- **解決**：將 `useAuth.ts` 重新命名為 `useAuth.tsx`

### 問題 2：圖片無法顯示
- **錯誤**：某些 Unsplash 圖片連結失效或顯示 Google logo
- **解決**：更換為可靠的圖片連結，並調整參數確保品質

### 問題 3：地圖未同步搜尋結果
- **錯誤**：搜尋後地圖不會自動更新
- **解決**：實作 `onResultsChange` 與自動定位功能

### 問題 4：日期本地化問題
- **錯誤**：`require is not defined` 在使用 CommonJS 語法時
- **解決**：改用 ES Module import 語法

## 資料庫結構

### User（使用者）
- id, email, password, name, createdAt

### Place（景點）
- id, name, address, latitude, longitude, placeId, notes, category, userId

### Trip（行程）
- id, name, startDate, endDate, description, userId

### TripDay（行程日期）
- id, tripId, date, order, placeId, notes, startTime, endTime

## API 端點

### 認證
- POST /auth/register
- POST /auth/login
- GET /auth/me

### 景點
- GET /api/places
- POST /api/places
- GET /api/places/:id
- PUT /api/places/:id
- DELETE /api/places/:id
- POST /api/places/search

### 行程
- GET /api/trips
- POST /api/trips
- GET /api/trips/:id
- PUT /api/trips/:id
- DELETE /api/trips/:id
- POST /api/trips/:id/days
- PUT /api/trips/:id/days/:dayId
- DELETE /api/trips/:id/days/:dayId

## 環境變數

### Frontend (.env)
```
VITE_GOOGLE_MAPS_JS_KEY=your_browser_key
VITE_API_BASE_URL=http://localhost:3000
```

### Backend (.env)
```
PORT=3000
CORS_ORIGINS=http://localhost:5173
DATABASE_URL=file:./dev.db
JWT_SECRET=your_secret_key
GOOGLE_MAPS_SERVER_KEY=your_server_key
```

## 安全注意事項

- ✅ .env 檔案已加入 .gitignore
- ✅ 提供 .env.example 範本
- ✅ API Keys 不在程式碼中硬編碼
- ✅ 密碼使用 bcrypt 雜湊
- ⚠️ 後端 Server Key 應限制 IP 範圍以避免濫用

## 部署建議

1. **後端 Server Key**：建議在 Google Cloud Console 限制允許的 IP
2. **前端 Browser Key**：建議設定 HTTP referrers 限制
3. **生產環境**：使用環境變數管理，不使用 .env 檔案
4. **HTTPS**：生產環境強制使用 HTTPS

## 後續改進建議

1. 實作景點分類與篩選
2. 加入拖曳排序功能（react-beautiful-dnd）
3. 實作分享行程功能
4. 加入預算管理
5. 匯出行程為 PDF
6. 實作多使用者協作

## 測試流程

1. 啟動後端：`cd backend && npm run dev`
2. 啟動前端：`cd frontend && npm run dev`
3. 註冊新帳號
4. 搜尋日本景點並收藏
5. 建立行程並加入景點
6. 編輯每日行程時間
7. 檢視地圖路線

---

**開發時間**：約 [開發時間]
**開發工具**：Cursor AI Assistant
**專案狀態**：✅ 已完成核心功能

