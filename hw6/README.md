# 海龜湯 LINE Bot

一個整合 Groq AI 的海龜湯推理遊戲 LINE Bot，使用 Next.js 開發並部署至 Vercel。![alt text](https://qr-official.line.me/sid/L/089zdkfo.png)

# LINE Bot QR Code

![LINE Bot QR Code](./images/qr-code.png)


Production URL：sea-turtle-soup-bot.vercel.app
## 功能特色

- 🎮 **海龜湯遊戲**：AI 莊家提供謎題，玩家通過提問找出真相
- 🤖 **AI 驅動**：使用 Groq API 提供智能回應
- 💬 **對話管理**：完整的對話紀錄與狀態追蹤
- 📊 **管理後台**：即時監控對話、檢視統計、管理歷程
- 🔄 **優雅降級**：LLM 服務失效時提供友善的降級回覆
- ⚡ **即時更新**：後台可即時看到新訊息/新會話

## 技術架構

- **框架**：Next.js 14 (App Router) + TypeScript
- **資料庫**：MongoDB Atlas + Mongoose
- **AI 服務**：Groq API
- **部署**：Vercel
- **樣式**：Tailwind CSS

## 環境變數設定

在 `.env.local` 檔案中設定以下環境變數：

```env
# LINE Bot Configuration
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=

# Groq API
GROQ_API_KEY=

# MongoDB
MONGODB_URI=

# Admin Dashboard Password (optional)
ADMIN_PASSWORD=admin123
```

## 本地開發

1. 安裝依賴：
```bash
npm install
```

2. 設定環境變數（建立 `.env.local` 檔案）

3. 啟動開發伺服器：
```bash
npm run dev
```

4. 訪問 `http://localhost:3000`

## LINE Bot 設定

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 建立新的 Provider 和 Channel
3. 取得 Channel Secret 和 Channel Access Token
4. 設定 Webhook URL：`https://your-domain.vercel.app/api/line`
5. 啟用 Webhook

## 部署至 Vercel

### 步驟 1：準備 GitHub Repository
1. 初始化 Git（如果還沒有）：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. 在 GitHub 建立新的 repository

3. 推送程式碼到 GitHub：
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### 步驟 2：在 Vercel 部署
1. 前往 [Vercel](https://vercel.com) 並登入
2. 點擊 "Add New Project"
3. 匯入你的 GitHub repository
4. 設定專案：
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`（預設）
   - Output Directory: `.next`（預設）

### 步驟 3：設定環境變數
在 Vercel 專案設定中的 "Environment Variables" 添加：
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `GROQ_API_KEY`
- `MONGODB_URI`
- `ADMIN_PASSWORD`（可選）

### 步驟 4：部署與測試
1. 點擊 "Deploy" 開始部署
2. 等待部署完成（通常 1-2 分鐘）
3. 取得部署 URL（例如：`https://your-project.vercel.app`）

### 步驟 5：設定 LINE Webhook
1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇你的 Channel
3. 在 "Messaging API" 標籤中找到 "Webhook URL"
4. 設定為：`https://your-project.vercel.app/api/line`
5. 點擊 "Verify" 確認 webhook 可連接
6. 啟用 "Use webhook"

## API 端點

- `POST /api/line` - LINE Webhook 端點
- `GET /api/line` - Webhook 健康檢查
- `GET /api/health` - 系統健康檢查
- `GET /api/admin/conversations` - 取得對話列表（支援篩選）
- `GET /api/admin/conversations/[id]` - 取得對話詳情

## 管理後台

訪問 `/admin` 路徑可進入管理後台，功能包括：

- 對話列表與篩選（使用者、日期、關鍵字）
- 統計數據（總對話數、活躍使用者、總訊息數）
- 對話詳情與訊息時間軸
- 即時更新（每 5 秒自動刷新）

## 遊戲流程

1. 使用者輸入「開始」開始新遊戲
2. Bot 隨機選擇一個海龜湯謎題
3. 使用者可以：
   - 提問（Bot 回答「是」、「不是」或「無關」）
   - 要求提示
   - 查看當前謎題
   - 重新開始
4. 當使用者猜出答案時，Bot 會確認並解釋完整故事

## 專案結構

```
├── app/
│   ├── api/
│   │   ├── line/              # LINE Webhook
│   │   ├── health/             # 健康檢查
│   │   └── admin/              # 管理後台 API
│   ├── admin/                  # 管理後台頁面
│   └── page.tsx                 # 首頁
├── lib/
│   ├── db/                     # 資料庫連接與模型
│   ├── services/               # 業務邏輯服務
│   ├── logger.ts               # 日誌工具
│   └── errors.ts               # 錯誤處理
└── README.md
```

## 錯誤處理

系統包含完整的錯誤處理機制：

- LLM API 配額/速率限制檢測
- 資料庫連接錯誤處理
- LINE API 錯誤處理
- 優雅降級與友善錯誤訊息

## 授權

本專案為作業專案，僅供學習使用。
