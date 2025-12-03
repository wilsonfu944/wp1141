# AniMap 啟動指南

## 快速啟動步驟

### 1. 確認前置需求

確保已安裝：
- ✅ Node.js 18+
- ✅ PostgreSQL 14+ (需先啟動 PostgreSQL 服務)
- ✅ npm

### 2. 設定資料庫連線

編輯 `backend/.env` 檔案，修改資料庫連線字串：

```env
DATABASE_URL="postgresql://你的使用者名稱:你的密碼@localhost:5432/animap?schema=public"
JWT_SECRET="animap-secret-key-change-in-production"
PORT=3001
```

**範例：**
- 如果 PostgreSQL 使用者是 `postgres`，密碼是 `123456`
- 則設定為：`DATABASE_URL="postgresql://postgres:123456@localhost:5432/animap?schema=public"`

### 3. 初始化資料庫

在 `backend` 目錄執行：

```bash
cd backend

# 產生 Prisma Client
npm run prisma:generate

# 建立資料庫並執行遷移
npm run prisma:migrate

# 載入範例資料
npm run prisma:seed
```

### 4. 啟動後端伺服器

在 `backend` 目錄執行：

```bash
npm run dev
```

後端將在 `http://localhost:3001` 運行

### 5. 啟動前端開發伺服器

**開啟新的終端視窗**，在 `frontend` 目錄執行：

```bash
cd frontend
npm run dev
```

前端將在 `http://localhost:5173` 運行

### 6. 開啟瀏覽器

訪問：`http://localhost:5173`

---

## 常見問題

### PostgreSQL 連線錯誤

如果遇到資料庫連線錯誤：

1. **確認 PostgreSQL 服務已啟動**
   ```bash
   # macOS (使用 Homebrew)
   brew services start postgresql
   
   # 或使用 pg_ctl
   pg_ctl -D /usr/local/var/postgres start
   ```

2. **確認資料庫存在**
   ```bash
   # 連接到 PostgreSQL
   psql -U postgres
   
   # 建立資料庫
   CREATE DATABASE animap;
   ```

3. **檢查連線字串格式**
   - 格式：`postgresql://使用者名稱:密碼@主機:埠號/資料庫名稱?schema=public`
   - 確認使用者名稱、密碼、資料庫名稱都正確

### 前端無法連接到後端

檢查 `frontend/.env` 檔案（如果有的話），確保：
```env
VITE_API_URL=http://localhost:3001/api
```

### 端口被占用

如果 3001 或 5173 端口被占用：

1. **修改後端端口**：編輯 `backend/.env`，修改 `PORT=3002`
2. **修改前端 API URL**：在 `frontend/.env` 設定 `VITE_API_URL=http://localhost:3002/api`

---

## 開發指令

### 後端
- `npm run dev` - 啟動開發伺服器（自動重載）
- `npm run build` - 建置生產版本
- `npm run prisma:generate` - 產生 Prisma Client
- `npm run prisma:migrate` - 執行資料庫遷移
- `npm run prisma:seed` - 載入種子資料

### 前端
- `npm run dev` - 啟動開發伺服器
- `npm run build` - 建置生產版本
- `npm run preview` - 預覽生產版本

---

## 測試帳號

種子資料中沒有預設使用者，請先註冊一個帳號：
1. 訪問 `http://localhost:5173/register`
2. 填寫註冊表單
3. 登入後即可使用收藏功能


