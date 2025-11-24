# Vercel 部署指南

## 📋 部署步驟

### 1. 準備檔案

確保以下檔案存在：
- ✅ `vercel.json` - Vercel 配置檔案
- ✅ `api/index.py` - Serverless 函數入口
- ✅ `requirements.txt` - Python 依賴
- ✅ `.env.example` - 環境變數範本

### 2. 在 Vercel 設定環境變數

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的專案
3. 進入 "Settings" → "Environment Variables"
4. 新增以下環境變數：
   - `LINE_CHANNEL_ID`
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LLM_API_KEY`
   - `LLM_API_BASE`
   - `MONGODB_URI`

### 3. 部署

#### 方法一：使用 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel

# 生產環境部署
vercel --prod
```

#### 方法二：透過 GitHub

1. 將程式碼推送到 GitHub
2. 在 Vercel Dashboard 中連接 GitHub 倉庫
3. Vercel 會自動部署

### 4. 設定 Webhook URL

部署完成後，在 LINE Developers Console 設定：
```
https://你的-vercel-url.vercel.app/webhook
```

## ⚠️ 常見問題

### 問題 1: Webhook 連線失敗

**可能原因：**
- 環境變數未正確設定
- Vercel 函數超時
- 路由配置錯誤

**解決方案：**
1. 檢查 Vercel Dashboard 中的環境變數
2. 查看 Vercel 函數日誌
3. 確認 `vercel.json` 配置正確

### 問題 2: 函數超時

Vercel 免費版函數執行時間限制為 10 秒。

**解決方案：**
- 優化程式碼執行時間
- 考慮使用 Vercel Pro（60 秒限制）
- 或使用其他平台（如 Railway、Render）

### 問題 3: 依賴安裝失敗

**解決方案：**
- 確認 `requirements.txt` 格式正確
- 檢查 Python 版本相容性
- 查看 Vercel 建置日誌

## 🔍 除錯

### 查看日誌

1. 在 Vercel Dashboard 中
2. 選擇你的專案
3. 進入 "Functions" 標籤
4. 查看函數執行日誌

### 測試端點

```bash
# 測試健康檢查
curl https://你的-vercel-url.vercel.app/

# 測試 webhook (GET)
curl https://你的-vercel-url.vercel.app/webhook
```

## 📝 注意事項

1. **環境變數**：確保所有敏感資訊都設定在 Vercel 環境變數中
2. **超時限制**：注意 Vercel 的函數執行時間限制
3. **冷啟動**：Serverless 函數可能有冷啟動延遲
4. **資料庫連線**：確保 MongoDB Atlas 允許 Vercel 的 IP 連線（或設定為 0.0.0.0/0）

## 🚀 替代部署方案

如果 Vercel 不適合，可以考慮：

1. **Railway** - 簡單易用，支援 Python
2. **Render** - 免費方案，支援 Flask
3. **Heroku** - 傳統 PaaS 平台
4. **AWS Lambda** - Serverless，功能強大
5. **Google Cloud Run** - 容器化部署



