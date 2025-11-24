# Vercel Webhook 連線問題修復指南

## 🔍 問題診斷

你的 Vercel URL 顯示需要身份驗證，這可能是因為：
1. 部署保護已啟用
2. 應用程式未正確部署
3. 路由配置問題

## ✅ 解決方案

### 步驟 1: 檢查 Vercel 部署狀態

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的專案
3. 查看 "Deployments" 標籤
4. 確認最新部署狀態為 "Ready"

### 步驟 2: 關閉部署保護（如果需要）

1. 在專案設定中
2. 進入 "Deployment Protection"
3. 如果啟用了保護，暫時關閉或設定允許的 IP

### 步驟 3: 確認環境變數

1. 進入 "Settings" → "Environment Variables"
2. 確認以下變數都已設定：
   - `LINE_CHANNEL_ID`
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LLM_API_KEY`
   - `LLM_API_BASE`
   - `MONGODB_URI`

### 步驟 4: 重新部署

```bash
# 如果使用 Vercel CLI
vercel --prod

# 或直接在 GitHub 推送新 commit
git add .
git commit -m "Fix Vercel deployment"
git push
```

### 步驟 5: 測試端點

部署完成後，測試：

```bash
# 測試根路徑
curl https://你的-vercel-url.vercel.app/

# 應該返回：
# {"status":"ok","message":"LINE Bot webhook is running"}

# 測試 webhook (GET)
curl https://你的-vercel-url.vercel.app/webhook

# 應該返回歡迎訊息
```

### 步驟 6: 在 LINE Developers Console 設定

1. 登入 [LINE Developers Console](https://developers.line.biz/)
2. 選擇你的 Channel
3. 進入 "Messaging API" → "Webhook settings"
4. 設定 Webhook URL: `https://你的-vercel-url.vercel.app/webhook`
5. 點擊 "Verify" 確認連線

## 🔧 已建立的檔案

我已經為你建立了：
- ✅ `vercel.json` - Vercel 配置檔案
- ✅ `api/index.py` - Serverless 函數入口
- ✅ `VERCEL_DEPLOY.md` - 完整部署指南

## ⚠️ 重要提醒

### Vercel 限制

1. **執行時間限制**：
   - 免費版：10 秒
   - Pro 版：60 秒
   - 如果 LLM 回應時間過長可能超時

2. **冷啟動**：
   - Serverless 函數可能有冷啟動延遲
   - 第一次請求可能較慢

3. **環境變數**：
   - 必須在 Vercel Dashboard 中設定
   - 不要將 `.env` 檔案上傳到 GitHub

## 🚀 替代方案

如果 Vercel 不適合，建議使用：

### Railway（推薦）
- ✅ 簡單易用
- ✅ 免費方案
- ✅ 支援長期運行的應用
- ✅ 無執行時間限制

### Render
- ✅ 免費方案
- ✅ 支援 Flask
- ✅ 自動部署

### 本地 + ngrok（開發用）
- ✅ 完全控制
- ✅ 無限制
- ⚠️ 需要保持電腦開機

## 📝 下一步

1. 將新建立的檔案推送到 GitHub：
   ```bash
   git add vercel.json api/index.py
   git commit -m "Add Vercel deployment config"
   git push
   ```

2. 在 Vercel Dashboard 中：
   - 確認環境變數已設定
   - 重新部署
   - 檢查部署日誌

3. 測試 webhook：
   - 在 LINE Developers Console 驗證
   - 發送測試訊息



