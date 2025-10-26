# Japan Trip Planner 🇯🇵

一個專為日本旅遊規劃設計的全端應用系統，整合 Google Maps API，提供景點收藏與行程規劃功能。

## 📋 目錄

- [專案簡介](#專案簡介)
- [功能清單](#功能清單)
- [技術架構](#技術架構)
- [架構圖](#架構圖)
- [安裝與設定](#安裝與設定)
- [啟動步驟](#啟動步驟)
- [API 文檔與範例](#api-文檔與範例)
- [資料庫結構](#資料庫結構)
- [已知問題](#已知問題)
- [未來改進](#未來改進)
- [安全性風險說明](#安全性風險說明)

## 🎯 專案簡介

### 使用情境
本平台專為計畫日本旅遊的使用者設計，提供完整的行程規劃解決方案：

1. **景點探索**：整合 Google Maps API，搜尋並收藏想去的日本景點
2. **行程規劃**：建立多天旅遊行程，安排每日景點順序與時間
3. **路線規劃**：自動計算景點間的最佳路線，優化旅遊安排
4. **個人化收藏**：建立個人的景點資料庫，可重複使用於不同行程

### 目標使用者
- 計畫前往日本旅遊的旅客
- 需要系統化行程安排的旅行者
- 希望整合地圖與路線規劃的使用者

## ✨ 功能清單

- 🔐 **使用者認證**：註冊、登入、JWT 認證
- 🗺️ **Google Maps 整合**：地圖顯示、搜尋景點、路線規劃
- 📍 **景點收藏**：搜尋並收藏景點，包含名稱、地址、座標、備註
- ✈️ **行程規劃**：建立多天行程，安排每日景點
- 📅 **行事曆介面**：視覺化行程日期與景點分佈
- ⏰ **時間管理**：為每個景點設定開始與結束時間
- 🎨 **現代化 UI**：使用 Material UI 打造友善的使用體驗
- 🔄 **即時更新**：搜尋與地圖雙向互動，資料即時同步

## 🛠️ 技術架構

### 前端
- **框架**：React 18 + TypeScript
- **建置工具**：Vite
- **UI 框架**：Material UI (MUI)
- **路由**：React Router v6
- **HTTP 客戶端**：Axios
- **地圖整合**：@react-google-maps/api
- **日期處理**：date-fns
- **拖曳功能**：react-beautiful-dnd

### 後端
- **框架**：Node.js + Express + TypeScript
- **資料庫**：SQLite + Prisma ORM
- **認證**：JWT (jsonwebtoken)
- **安全**：bcrypt (密碼雜湊)
- **API 整合**：
  - Google Places API（景點搜尋）
  - Google Geocoding API（座標轉換）
  - Google Directions API（路線規劃）

## 📐 架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React + Vite)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  登入/註冊    │  │   首頁       │  │   我的景點   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │   我的行程   │  │  行程詳情頁面  │                      │
│  └──────────────┘  └──────────────┘                      │
│                                                               │
│  ┌───────────────────────────────────────────┐             │
│  │          Google Maps 地圖顯示              │             │
│  │    - 景點搜尋與標記    - 路線規劃           │             │
│  └───────────────────────────────────────────┘             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         │ (Axios)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     後端 (Express + TypeScript)               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Auth API │  │Place API │  │Trip API  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                               │
│  ┌──────────────────────────────────────────┐             │
│  │        中介層 (Middleware)                 │             │
│  │    - JWT 認證    - 錯誤處理    - 驗證      │             │
│  └──────────────────────────────────────────┘             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     資料層 (SQLite + Prisma)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐               │
│  │ User │  │Place │  │ Trip │  │ TripDay  │               │
│  └──────┘  └──────┘  └──────┘  └──────────┘               │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   外部服務 (Google Maps API)                  │
├─────────────────────────────────────────────────────────────┤
│  - Places API (景點搜尋)                                     │
│  - Geocoding API (地址轉座標)                                │
│  - Directions API (路線規劃)                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 安裝與設定

### 前置需求
- Node.js 18+
- npm 或 yarn
- Google Cloud Platform 帳號與 API Key

### 1. 克隆專案

```bash
cd wp1141
git clone <repository-url> hw4
cd hw4
```

### 2. 設定 Google Maps API

請參考以下步驟設定 Google Maps API：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用以下 API：
   - Places API
   - Geocoding API
   - Directions API
4. 建立兩個 API Key：
   - **Browser Key**（限制 HTTP referrers）：用於前端
   - **Server Key**（限制 IP）：用於後端

### 3. 後端設定

```bash
cd backend
npm install
```

建立並編輯 `.env` 檔案：

```bash
cp .env.example .env
```

編輯 `.env`：
```env
PORT=3000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=file:./dev.db
JWT_SECRET=your-super-secret-jwt-key-change-this
GOOGLE_MAPS_SERVER_KEY=YOUR_SERVER_KEY
```

初始化資料庫：
```bash
npm run db:generate
npm run db:push
```

### 4. 前端設定

```bash
cd ../frontend
npm install
```

建立並編輯 `.env` 檔案：

```bash
cp .env.example .env
```

編輯 `.env`：
```env
VITE_GOOGLE_MAPS_JS_KEY=YOUR_BROWSER_KEY
VITE_API_BASE_URL=http://localhost:3000
```

## 🔄 啟動步驟

### 方式一：使用自動啟動腳本（推薦）

```bash
# 在專案根目錄
chmod +x START_SERVERS.sh
./START_SERVERS.sh
```

### 方式二：手動啟動

**終端 1 - 啟動後端：**

```bash
cd backend
npm run dev
```

後端將運行在 `http://localhost:3000`

**終端 2 - 啟動前端：**

```bash
cd frontend
npm run dev
```

前端將運行在 `http://localhost:5173`

### 停止服務

```bash
# 使用腳本停止
./START_SERVERS.sh

# 或手動停止
# 按 Ctrl+C 停止各自的服務
```

## 📡 API 文檔與範例

### 認證 API

#### 1. 註冊

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

**回應示例：**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. 登入

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**回應示例：**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. 取得當前使用者

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**回應示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-10-01T10:00:00.000Z"
  }
}
```

### 景點 API

#### 4. 搜尋景點

```bash
curl -X POST http://localhost:3000/api/places/search \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "富士山",
    "latitude": 35.3606,
    "longitude": 138.7274
  }'
```

**回應示例：**
```json
{
  "success": true,
  "data": [
    {
      "place_id": "ChIJXXXXXXXXXXXXXXXXX",
      "name": "富士山",
      "formatted_address": "山梨縣富士吉田市",
      "geometry": {
        "location": {
          "lat": 35.3606,
          "lng": 138.7274
        }
      },
      "rating": 4.8
    }
  ]
}
```

#### 5. 新增收藏景點

```bash
curl -X POST http://localhost:3000/api/places \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "富士山",
    "address": "山梨縣富士吉田市",
    "latitude": 35.3606,
    "longitude": 138.7274,
    "placeId": "ChIJXXXXXXXXXXXXXXXXX",
    "category": "景點",
    "notes": "必訪景點"
  }'
```

**回應示例：**
```json
{
  "success": true,
  "message": "Place created successfully",
  "data": {
    "id": 1,
    "name": "富士山",
    "address": "山梨縣富士吉田市",
    "latitude": 35.3606,
    "longitude": 138.7274,
    "placeId": "ChIJXXXXXXXXXXXXXXXXX",
    "category": "景點",
    "notes": "必訪景點",
    "userId": 1,
    "createdAt": "2024-10-01T10:00:00.000Z"
  }
}
```

### 行程 API

#### 6. 建立行程

```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "日本關西之旅",
    "startDate": "2024-12-01",
    "endDate": "2024-12-07",
    "description": "7天6夜關西深度遊"
  }'
```

**回應示例：**
```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "id": 1,
    "name": "日本關西之旅",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-07T23:59:59.999Z",
    "description": "7天6夜關西深度遊",
    "userId": 1,
    "createdAt": "2024-10-01T10:00:00.000Z"
  }
}
```

#### 7. 新增景點到行程

```bash
curl -X POST http://localhost:3000/api/trips/1/days \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-01",
    "placeId": 1,
    "order": 1,
    "startTime": "09:00",
    "endTime": "12:00",
    "notes": "上午參觀"
  }'
```

**回應示例：**
```json
{
  "success": true,
  "message": "Trip day created successfully",
  "data": {
    "id": 1,
    "tripId": 1,
    "date": "2024-12-01T00:00:00.000Z",
    "order": 1,
    "placeId": 1,
    "notes": "上午參觀",
    "startTime": "09:00",
    "endTime": "12:00",
    "createdAt": "2024-10-01T10:00:00.000Z"
  }
}
```

#### 8. 取得行程詳情

```bash
curl -X GET http://localhost:3000/api/trips/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**回應示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "日本關西之旅",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-07T23:59:59.999Z",
    "description": "7天6夜關西深度遊",
    "userId": 1,
    "days": [
      {
        "id": 1,
        "date": "2024-12-01T00:00:00.000Z",
        "order": 1,
        "notes": "上午參觀",
        "startTime": "09:00",
        "endTime": "12:00",
        "place": {
          "id": 1,
          "name": "富士山",
          "address": "山梨縣富士吉田市",
          "latitude": 35.3606,
          "longitude": 138.7274
        }
      }
    ]
  }
}
```

## 🗄️ 資料庫結構

### User（使用者）
```sql
- id: Int (PK)
- email: String (UNIQUE)
- password: String (hashed)
- name: String?
- createdAt: DateTime
```

### Place（景點）
```sql
- id: Int (PK)
- name: String
- address: String
- latitude: Float
- longitude: Float
- placeId: String? (Google Place ID)
- notes: String?
- category: String?
- userId: Int (FK → User)
- createdAt: DateTime
- updatedAt: DateTime
```

### Trip（行程）
```sql
- id: Int (PK)
- name: String
- startDate: DateTime
- endDate: DateTime
- description: String?
- userId: Int (FK → User)
- createdAt: DateTime
- updatedAt: DateTime
```

### TripDay（行程日期）
```sql
- id: Int (PK)
- tripId: Int (FK → Trip)
- date: DateTime
- order: Int (當天景點順序)
- placeId: Int (FK → Place)
- notes: String?
- startTime: String?
- endTime: String?
- createdAt: DateTime
```

## ⚠️ 已知問題

1. **後端 Server Key 無 IP 限制**：目前後端使用的 Google Maps Server Key 未設定 IP 限制，存在安全風險（詳見下方安全性風險說明）

2. **瀏覽器快取問題**：某些情況下，清除快取後才能看到最新的搜尋結果

3. **時區顯示**：行程日期使用 UTC 時間，前端顯示可能與本地時間有差異

4. **圖檔載入**：首頁輪播圖片依賴外部服務，網路不穩定時可能無法顯示

5. **大量資料處理**：當行程包含大量景點時，地圖顯示與路線計算可能較慢

## 🔮 未來改進

### 功能增強
1. **景點分類與篩選**：依類別（景點、餐廳、住宿）篩選收藏
2. **拖曳排序**：使用 drag-and-drop 功能調整行程順序
3. **路線優化**：根據時間與距離自動優化行程路線
4. **預算管理**：為每個行程設定預算並追蹤支出
5. **分享功能**：匯出行程為 PDF 或分享連結
6. **多人協作**：支援多人共同編輯行程
7. **離線地圖**：快取地圖資料，支援離線查看
8. **景點評價**：允許使用者為景點評分與留言

### 技術優化
1. **效能優化**：使用虛擬滾動處理大量資料
2. **快取策略**：實作 Redis 快取 Google Maps API 回應
3. **搜尋建議**：實作自動完成搜尋建議功能
4. **圖片上傳**：允許使用者上傳行程照片
5. **通知系統**：行程提醒與通知功能

### 用戶體驗
1. **多語言支援**：支援英文、日文等多種語言
2. **深色模式**：實作深色主題切換
3. **響應式設計**：優化行動裝置使用體驗
4. **無障礙設計**：符合 WCAG 標準

## 🛡️ 安全性風險說明

### ⚠️ 重要：Server Key 安全風險

目前後端使用的 Google Maps Server Key **未設定 IP 限制**，存在以下風險：

#### 風險分析
1. **API 金鑰暴露**：如果 API Key 被洩露，任何人都可以使用該 Key 呼叫 Google Maps API
2. **費用風險**：未授權使用者大量呼叫 API 可能造成 Google Cloud 帳單費用激增
3. **配額耗盡**：大量請求可能導致 API 配額耗盡，影響正常使用

#### 建議防護措施

**1. IP 限制（推薦）**
- 前往 [Google Cloud Console](https://console.cloud.google.com/)
- 選擇 API & Services → Credentials
- 點擊您的 Server Key
- 在 "Application restrictions" 選擇 "IP addresses"
- 加入允許的 IP 範圍（例如：`203.0.113.0/24`）

**2. API 限制**
- 限制 Server Key 只能使用必要的 API：
  - Places API
  - Geocoding API
  - Directions API

**3. 配額管理**
- 設定每日配額上限
- 啟用預算警報
- 監控 API 使用量

#### 生產環境部署建議

1. **環境變數**：使用環境變數管理 API Keys，不要硬編碼
2. **HTTPS**：強制使用 HTTPS 連線
3. **CORS 限制**：設定嚴格的 CORS 政策，只允許信任的來源
4. **速率限制**：實作 API 速率限制，防止濫用
5. **監控與記錄**：記錄所有 API 呼叫，監控異常行為

### 其他安全考量

1. **密碼安全**：使用 bcrypt 雜湊，強度係數設定為 10
2. **JWT 過期時間**：Token 設有過期時間（7天）
3. **SQL 注入防護**：使用 Prisma ORM 自動處理參數化查詢
4. **XSS 防護**：React 自動跳脫使用者輸入
5. **檔案上傳限制**：目前不支援檔案上傳，避免檔案上傳漏洞

---

## 📄 License

MIT License

## 👤 作者

WP1141 Homework 4 - 日本旅遊行程規劃平台
