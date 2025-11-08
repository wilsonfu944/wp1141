# MySocialMedia

一個使用 Next.js + NextAuth + MongoDB + Pusher 建立的社群網站，類似 Twitter/X。

## 功能特色

- ✅ OAuth 登入 (Google / GitHub)
- ✅ 註冊時設定 userID
- ✅ 發文功能 (280字限制，支援 Hashtag 和 Mention)
- ✅ 文章互動 (按讚、轉發、留言)
- ✅ 個人首頁 (可編輯個人資料)
- ✅ 關注/取消關注功能
- ✅ 即時更新 (使用 Pusher)
- ✅ 多層嵌套留言

## 技術棧

- **前端**: Next.js 14, React, TypeScript, TailwindCSS
- **後端**: Next.js API Routes
- **認證**: NextAuth.js
- **資料庫**: MongoDB
- **即時通訊**: Pusher

## 環境變數設定

請在 `.env.local` 檔案中設定以下環境變數：

```env
# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Pusher
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_min_32_chars
```

## 安裝與執行

1. 安裝依賴套件：
```bash
npm install
```

2. 設定環境變數：
複製 `.env.local.example` 為 `.env.local` 並填入你的環境變數值。

3. 執行開發伺服器：
```bash
npm run dev
```

4. 開啟瀏覽器訪問：
```
http://localhost:3000
```

## 部署到 Vercel

1. 將專案推送到 GitHub
2. 在 Vercel 中匯入專案
3. 設定環境變數（在 Vercel 專案設定中）
4. 更新 `NEXTAUTH_URL` 為你的 Vercel 網址
5. 部署完成！

## 專案結構

```
hw5/
├── components/          # React 組件
│   ├── Sidebar.tsx     # 側邊欄
│   ├── PostForm.tsx    # 發文表單
│   └── PostCard.tsx    # 文章卡片
├── lib/                # 工具函數
│   ├── mongodb.ts      # MongoDB 連接
│   ├── models.ts       # 資料模型
│   └── pusher.ts       # Pusher 設定
├── pages/              # Next.js 頁面
│   ├── api/           # API Routes
│   ├── auth/          # 認證頁面
│   ├── profile/        # 個人首頁
│   ├── index.tsx      # 首頁
│   └── post.tsx       # 發文頁面
├── styles/            # 樣式檔案
└── public/           # 靜態資源
```

## 主要功能說明

### 發文功能
- 280 字限制
- 連結佔 23 字元
- Hashtag (#) 和 Mention (@) 不計字數
- 支援儲存草稿和載入草稿

### 文章互動
- 按讚/取消按讚
- 轉發/取消轉發
- 留言（支援多層嵌套）
- 即時更新（使用 Pusher）

### 個人首頁
- 顯示個人資訊（姓名、userID、簡介、背景圖）
- 顯示統計（文章數、關注數、追蹤者數）
- 可編輯個人資料（僅限自己的首頁）
- 可關注/取消關注其他用戶

## 注意事項

- 首次登入需要設定 userID
- 轉發的文章無法刪除
- 只有自己的原創文章可以刪除
- 確保 MongoDB 連線正常
- 確保 Pusher 設定正確以使用即時功能

## License

MIT

