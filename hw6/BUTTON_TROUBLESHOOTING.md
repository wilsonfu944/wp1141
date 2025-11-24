# 按鈕功能故障排除指南

## 按鈕何時會顯示？

1. **首次對話時**：當使用者第一次與 Bot 互動時（加好友或發送第一條訊息）
2. **Follow Event**：當使用者加 Bot 為好友時
3. **使用者要求時**：輸入以下任一指令：
   - `顯示人格選項`
   - `按鈕`
   - `選人格`
   - `選擇人格`
   - `人格選項`
   - `顯示按鈕`

## 如果看不到按鈕，可能的原因：

### 1. 已有對話記錄
如果使用者之前已經與 Bot 對話過，按鈕不會自動顯示。解決方法：
- 輸入「顯示人格選項」或「按鈕」來手動顯示按鈕
- 或者清除該使用者的對話記錄（使用 admin 後台或 `clear_conversation.py`）

### 2. 部署問題
檢查以下項目：
- 確認 `persona_service.py` 已正確部署
- 檢查 Vercel/伺服器日誌，看是否有錯誤訊息
- 確認 LINE Bot SDK 版本正確（`line-bot-sdk>=3.5.0`）

### 3. Import 路徑問題
如果部署時出現 `ModuleNotFoundError`：
- 確認檔案結構正確
- 檢查 `sys.path` 設定
- 確認所有檔案都在 `hw6` 資料夾中

### 4. LINE API 限制
- 確認 LINE Channel Access Token 正確
- 檢查是否有 API 呼叫限制
- 確認 Bot 有發送訊息的權限

## 測試按鈕功能

執行以下命令測試：
```bash
cd hw6
python3 test_persona_buttons.py
```

如果測試通過，按鈕功能本身是正常的，問題可能在部署或對話流程。

## 檢查日誌

查看伺服器日誌，尋找以下訊息：
- `✅ Persona selection buttons sent to {user_id}` - 按鈕已成功發送
- `⚠️ Failed to send persona buttons: {e}` - 按鈕發送失敗
- `❌ Error handling follow event` - Follow Event 處理失敗

## 手動觸發按鈕

如果按鈕沒有自動顯示，使用者可以：
1. 輸入「顯示人格選項」
2. 輸入「按鈕」
3. 輸入「選人格」

這些指令都會觸發按鈕顯示。

