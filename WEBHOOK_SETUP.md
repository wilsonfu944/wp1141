# LINE Webhook 設定指南

## 常見錯誤：404 Not Found

如果你看到 "The webhook returned an HTTP status code other than 200 (404 Not Found)"，通常是以下原因：

## ✅ 正確的設定步驟

### 1. 確保應用程式正在運行

```bash
python3 run.py
```

應用程式應該運行在 `http://localhost:5001`

### 2. 啟動 ngrok（在另一個終端機）

```bash
ngrok http 5001
```

ngrok 會顯示類似這樣的輸出：
```
Forwarding  https://xxxx-xxxx-xxxx.ngrok.io -> http://localhost:5001
```

**重要：複製這個 HTTPS URL**

### 3. 在 LINE Developers Console 設定 Webhook URL

**⚠️ 關鍵：URL 必須包含 `/webhook` 路徑！**

**正確的 Webhook URL：**
```
https://xxxx-xxxx-xxxx.ngrok.io/webhook
```

**❌ 錯誤的 Webhook URL（會導致 404）：**
```
https://xxxx-xxxx-xxxx.ngrok.io          ❌ 缺少 /webhook
http://xxxx-xxxx-xxxx.ngrok.io/webhook   ❌ 必須使用 HTTPS
https://localhost:5001/webhook           ❌ 不能使用 localhost
```

### 4. 驗證步驟

1. 在 LINE Developers Console 中：
   - 進入你的 Channel
   - 點擊 "Messaging API" 標籤
   - 找到 "Webhook URL" 設定
   - 輸入：`https://你的-ngrok-url.ngrok.io/webhook`
   - 點擊 "Verify" 按鈕

2. 如果驗證成功，你會看到：
   - ✅ "Success" 訊息
   - Webhook 狀態變為 "Enabled"

3. 如果還是 404：
   - 確認 URL 結尾有 `/webhook`
   - 確認使用 HTTPS（不是 HTTP）
   - 確認 ngrok 正在運行
   - 確認應用程式正在運行
   - 在瀏覽器訪問 `https://你的-ngrok-url.ngrok.io/webhook` 應該看到 JSON 回應

### 5. 測試 Webhook

你可以在瀏覽器訪問以下 URL 來測試：

```
https://你的-ngrok-url.ngrok.io/webhook
```

應該看到：
```json
{
  "status": "ok",
  "message": "Webhook endpoint is accessible",
  "method": "GET",
  "note": "LINE Platform will send POST requests to this endpoint"
}
```

## 🔍 疑難排解

### 問題 1: 404 Not Found
- ✅ 確認 URL 包含 `/webhook`
- ✅ 確認使用 HTTPS
- ✅ 確認 ngrok 正在運行
- ✅ 確認應用程式正在運行

### 問題 2: Invalid Signature (400)
- ✅ 確認 `LINE_CHANNEL_SECRET` 在 `.env` 中正確設定
- ✅ 確認 LINE Developers Console 中的 Channel Secret 正確

### 問題 3: 500 Internal Server Error
- ✅ 檢查應用程式終端機的錯誤訊息
- ✅ 確認 MongoDB 連線正常
- ✅ 確認所有環境變數已設定

## 📝 檢查清單

在驗證 Webhook 之前，確認：

- [ ] 應用程式正在運行（`python3 run.py`）
- [ ] ngrok 正在運行（`ngrok http 5001`）
- [ ] Webhook URL 格式正確：`https://xxx.ngrok.io/webhook`
- [ ] 使用 HTTPS（不是 HTTP）
- [ ] URL 結尾有 `/webhook`
- [ ] `.env` 檔案中的 `LINE_CHANNEL_SECRET` 正確

## 💡 提示

- ngrok 的免費版本每次重啟 URL 會改變
- 如果 URL 改變了，記得更新 LINE Developers Console 中的設定
- 可以在瀏覽器訪問 webhook URL 來確認端點可訪問



