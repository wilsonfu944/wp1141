# Follow Event 除錯指南

## 問題：加入好友後沒有自動發送歡迎訊息

如果加入好友後必須先發送訊息才會收到回應，可能是 Follow Event 沒有正確觸發。

## 檢查步驟

### 1. 確認 LINE Developers Console 設定

1. 登入 [LINE Developers Console](https://developers.line.biz/)
2. 選擇你的 Channel
3. 進入 "Messaging API" 設定
4. 確認以下設定：
   - ✅ **Webhook** 已啟用
   - ✅ **Auto-reply messages** 已關閉（或設定為空白）
   - ✅ **Greeting messages** 已關閉（或設定為空白）

### 2. 檢查應用程式日誌

查看應用程式終端機或日誌檔案，尋找：
- `✅ Follow Event triggered!` - 表示 Follow Event 有觸發
- `Event type: follow` - 表示收到 Follow Event

```bash
# 查看日誌
tail -f /tmp/linebot.log | grep -i "follow\|event"
```

### 3. 測試 Follow Event

1. **清除你的對話記錄：**
   ```bash
   python3 clear_conversation.py clear-user <你的用戶ID>
   ```

2. **在 LINE 中移除 Bot：**
   - 長按 Bot → 封鎖或刪除

3. **重新加入 Bot：**
   - 搜尋 Bot 並加入
   - 應該會立即收到歡迎訊息

4. **檢查日誌：**
   - 應該看到 `✅ Follow Event triggered!`
   - 如果沒有，可能是設定問題

## 可能的原因和解決方案

### 原因 1: Auto-reply messages 未關閉

**解決方案：**
- 在 LINE Developers Console 中關閉 "Auto-reply messages"
- 這樣 Follow Event 才能正常觸發

### 原因 2: Webhook 未正確設定

**解決方案：**
- 確認 Webhook URL 正確：`https://你的-ngrok-url.ngrok.io/webhook`
- 確認 Webhook 狀態為 "Enabled"
- 點擊 "Verify" 確認連線正常

### 原因 3: Follow Event 處理器未正確註冊

**解決方案：**
- 確認程式碼中有 `@handler.add(FollowEvent)`
- 確認已 import `FollowEvent`：`from linebot.models import FollowEvent`
- 重啟應用程式

### 原因 4: LINE 帳號類型限制

**解決方案：**
- 某些 LINE 帳號類型可能不支援 Follow Event
- 確認你的 Channel 類型支援 Follow Event

## 臨時解決方案

如果 Follow Event 無法正常運作，目前的程式碼已經有備用機制：

1. **首次對話檢查：**
   - 當使用者發送第一條訊息時
   - 程式會檢查是否為首次對話
   - 如果是，會自動發送歡迎訊息

所以即使 Follow Event 沒有觸發，使用者發送第一條訊息時還是會收到歡迎訊息。

## 測試指令

```bash
# 查看應用程式是否運行
ps aux | grep python | grep run.py

# 查看日誌
tail -f /tmp/linebot.log

# 測試 webhook
curl -X POST http://localhost:5001/webhook \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: test" \
  -d '{"events":[{"type":"follow","source":{"userId":"test123"}}]}'
```

## 如果還是無法解決

1. 檢查 LINE Developers Console 的所有設定
2. 確認 Webhook URL 正確且可訪問
3. 查看應用程式日誌的詳細錯誤訊息
4. 確認 LINE SDK 版本是否支援 Follow Event



