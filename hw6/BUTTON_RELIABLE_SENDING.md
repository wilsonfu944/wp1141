# 可靠的按鈕發送策略

## 策略說明

為了確保按鈕**無論 LINE 設定如何都能顯示**，我們採用以下策略：

### 1. FollowEvent（加好友時）
- 使用 `push_message` 發送歡迎訊息
- 使用 `push_message` 發送按鈕
- **優點**：即使 Auto-reply 或 Greeting 開啟，`push_message` 也能發送

### 2. MessageEvent（首次訊息時）
- 如果有 `reply_token`：
  - 先用 `reply_message` 發送歡迎訊息（立即回應）
  - 然後用 `push_message` 發送按鈕（不依賴 reply_token）
- 如果沒有 `reply_token`：
  - 用 `push_message` 發送歡迎訊息和按鈕

### 3. 為什麼這樣做？

**`push_message` 的優點：**
- ✅ 不受 Auto-reply messages 影響
- ✅ 不受 Greeting messages 影響
- ✅ 可以在任何時候發送（只要使用者已加好友）
- ✅ 更可靠，不會被 LINE 的自動回應覆蓋

**`reply_message` 的限制：**
- ⚠️ reply_token 只能用一次
- ⚠️ 如果 Auto-reply 開啟，可能會被覆蓋
- ⚠️ 時效性限制（收到訊息後短時間內有效）

## 發送時機

1. **FollowEvent**：使用者加好友時
   - 立即發送歡迎訊息 + 按鈕

2. **首次 MessageEvent**：使用者第一次發送訊息時
   - 立即發送歡迎訊息 + 按鈕

3. **使用者要求時**：輸入「按鈕」等關鍵字
   - 使用 `reply_message`（如果有 reply_token）或 `push_message`

## 確保按鈕顯示的方法

1. **使用 push_message**：最可靠的方法
2. **立即發送**：在歡迎訊息之後立即發送，不要延遲太久
3. **錯誤處理**：捕獲所有錯誤並記錄，方便調試
4. **格式驗證**：確保按鈕格式符合 LINE 規範

## 測試方法

1. **測試 FollowEvent**：
   - 刪除 Bot 好友
   - 重新加好友
   - 應該立即看到歡迎訊息和按鈕

2. **測試首次訊息**：
   - 清除對話記錄
   - 發送第一條訊息
   - 應該看到歡迎訊息和按鈕

3. **測試手動觸發**：
   - 輸入「按鈕」或「顯示人格選項」
   - 應該看到按鈕

## 如果還是看不到按鈕

1. **檢查 Vercel 日誌**：
   - 尋找 `✅ First button sent successfully`
   - 尋找 `❌ LINE API Error`

2. **檢查 LINE Developers Console**：
   - 確認 Webhook URL 正確
   - 確認 Channel Access Token 正確

3. **檢查使用者狀態**：
   - 確認使用者已加 Bot 為好友
   - 確認 Bot 有發送訊息的權限

