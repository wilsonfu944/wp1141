# 按鈕不顯示問題調試指南

## 可能的原因（非程式問題）

### 1. LINE 官方帳號權限問題 ⚠️
**最可能的原因！**

LINE 按鈕訊息需要：
- ✅ 使用者必須先加 Bot 為好友
- ✅ Bot 必須有「發送訊息」權限
- ✅ 確認 LINE Developers Console 中的權限設定

**檢查方法：**
1. 前往 LINE Developers Console
2. 選擇你的 Channel
3. 檢查「Messaging API」設定
4. 確認「Auto-reply messages」已關閉（如果開啟會干擾）
5. 確認「Greeting messages」已關閉（如果開啟會干擾）

### 2. Push Message 限制
- Push Message 只能在「24小時內有互動」的使用者上使用
- 如果使用者超過24小時沒互動，需要使用 Reply Message
- **解決方法：** 在首次訊息時使用 `reply_message` 而不是 `push_message`

### 3. Webhook 未正確觸發
- 檢查 Vercel 日誌，看是否有收到 webhook
- 檢查是否有錯誤訊息
- 確認 webhook URL 正確設定

### 4. LINE SDK 版本問題
- 確認 `line-bot-sdk` 版本 >= 3.5.0
- 舊版本可能不支援某些功能

### 5. 按鈕格式被 LINE 拒絕
- LINE 會靜默忽略格式錯誤的訊息
- 不會回傳錯誤，只是不顯示
- **檢查方法：** 查看 Vercel 日誌中的詳細錯誤訊息

## 調試步驟

### 步驟 1：檢查日誌
查看 Vercel 部署日誌，尋找：
- `🔍 Attempting to send buttons to {user_id}`
- `✅ First button sent successfully`
- `❌ LINE API Error sending buttons`

### 步驟 2：測試按鈕格式
```bash
cd hw6
python3 test_button_json.py
```

### 步驟 3：檢查 LINE Developers Console
1. 前往 https://developers.line.biz/console/
2. 選擇你的 Provider 和 Channel
3. 檢查「Messaging API」設定
4. 確認 Webhook URL 正確
5. 點擊「Verify」測試 webhook

### 步驟 4：使用 Reply Message 代替 Push Message
如果 Push Message 有問題，可以改用 Reply Message：
- 在 `handle_message` 中使用 `reply_token`
- 在首次訊息時發送按鈕

## 快速修復建議

### 方案 1：改用 Reply Message（推薦）
在首次訊息時，使用 `reply_message` 發送按鈕：
```python
if reply_token:
    line_bot_api.reply_message(reply_token, buttons1)
```

### 方案 2：檢查權限
1. 確認 Bot 有發送訊息權限
2. 關閉 Auto-reply 和 Greeting messages
3. 確認使用者已加好友

### 方案 3：使用 Flex Message
如果 Buttons Template 有問題，可以改用 Flex Message（更靈活但更複雜）

## 檢查清單

- [ ] LINE Developers Console 權限設定正確
- [ ] Auto-reply messages 已關閉
- [ ] Greeting messages 已關閉
- [ ] Webhook URL 正確設定
- [ ] Vercel 部署成功且無錯誤
- [ ] 使用者已加 Bot 為好友
- [ ] 查看 Vercel 日誌確認按鈕發送狀態
- [ ] 測試按鈕 JSON 格式正確

## 如果還是看不到按鈕

請提供：
1. Vercel 部署日誌（特別是按鈕發送相關的訊息）
2. LINE Developers Console 的設定截圖
3. 測試時的完整對話記錄

