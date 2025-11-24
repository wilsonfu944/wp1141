# 部署資訊

## 1. 部署連結

### LINE Bot

- **LINE Bot URL**: 請在 LINE Developers Console 中查看
- **QR Code**: 請在 LINE Developers Console 中下載 QR Code
- **Webhook URL**: `https://your-vercel-url.vercel.app/webhook`

> **取得方式**：
> 1. 前往 https://developers.line.biz/console/
> 2. 選擇你的 Provider 和 Channel
> 3. 在「Messaging API」頁面可以找到：
>   - Bot 的 QR Code（可下載）
>   - Webhook URL 設定位置

### 管理後台

- **Production URL**: `https://your-vercel-url.vercel.app/admin`
- **功能說明**：
  - 查看所有對話記錄
  - 查看單一對話的詳細內容
  - 清除特定使用者或所有對話記錄
- **登入需求**：目前無需登入（公開存取）

> **注意**：請將 `your-vercel-url` 替換為你的實際 Vercel 部署網址

## 2. 部署狀態

- ✅ **Vercel 部署**：已配置 `vercel.json`
- ✅ **環境變數**：需在 Vercel Dashboard 中設定
- ✅ **Webhook**：需在 LINE Developers Console 中設定

## 3. 設定檢查清單

### LINE Developers Console

- [ ] Channel ID 已設定
- [ ] Channel Secret 已設定
- [ ] Channel Access Token 已設定
- [ ] Webhook URL 已設定為 `https://your-vercel-url.vercel.app/webhook`
- [ ] Webhook 已驗證（顯示綠色勾勾）
- [ ] Auto-reply messages 已關閉
- [ ] Greeting messages 已關閉

### Vercel Dashboard

- [ ] 專案已部署
- [ ] 環境變數已設定：
  - [ ] `LINE_CHANNEL_ID`
  - [ ] `LINE_CHANNEL_SECRET`
  - [ ] `LINE_CHANNEL_ACCESS_TOKEN`
  - [ ] `LLM_API_KEY`
  - [ ] `LLM_API_BASE`
  - [ ] `MONGODB_URI`
- [ ] 部署狀態為 "Ready"

### MongoDB Atlas

- [ ] Cluster 已建立
- [ ] 資料庫使用者已建立
- [ ] IP Whitelist 已設定（或設為 0.0.0.0/0 允許所有 IP）
- [ ] Connection String 已取得

## 4. 測試步驟

1. **測試 Webhook**
   - 在 LINE Developers Console 中點擊 "Verify"
   - 應該顯示 "Success"

2. **測試 Bot**
   - 掃描 QR Code 加 Bot 為好友
   - 應該收到歡迎訊息和人格選擇按鈕

3. **測試管理後台**
   - 訪問 `https://your-vercel-url.vercel.app/admin`
   - 應該能看到對話記錄列表

## 5. 取得實際 URL

### Vercel URL

1. 前往 https://vercel.com/dashboard
2. 選擇你的專案
3. 在 "Domains" 或 "Deployments" 中可以看到部署 URL
4. 格式通常為：`your-project-name.vercel.app`

### LINE Bot QR Code

1. 前往 https://developers.line.biz/console/
2. 選擇你的 Provider 和 Channel
3. 在 "Messaging API" 頁面
4. 找到 "QR Code" 區塊
5. 點擊下載或顯示 QR Code

