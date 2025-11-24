# Vercel 500 錯誤修復指南

## 🔍 問題診斷

你遇到的錯誤：
```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

這通常表示：
1. **服務初始化失敗** - ConversationService 在模組層級初始化時失敗
2. **環境變數缺失** - 缺少必要的環境變數
3. **資料庫連線失敗** - MongoDB 連線問題
4. **導入錯誤** - Python 模組導入問題

## ✅ 已修復的問題

### 1. 延遲初始化服務
- 將 `ConversationService` 改為延遲初始化
- 避免在模組導入時就嘗試連線資料庫
- 只有在實際使用時才初始化

### 2. 改善錯誤處理
- 加入 try-catch 處理初始化錯誤
- 提供更清楚的錯誤訊息

### 3. LINE Bot 初始化保護
- 加入錯誤處理，避免環境變數缺失時崩潰

## 📋 檢查清單

### 1. 確認 Vercel 環境變數

在 Vercel Dashboard → Settings → Environment Variables 確認以下變數：

- [ ] `LINE_CHANNEL_ID`
- [ ] `LINE_CHANNEL_SECRET`
- [ ] `LINE_CHANNEL_ACCESS_TOKEN`
- [ ] `LLM_API_KEY`
- [ ] `LLM_API_BASE` (可選，預設值已設定)
- [ ] `MONGODB_URI`

### 2. 檢查 MongoDB Atlas 設定

1. 登入 [MongoDB Atlas](https://cloud.mongodb.com/)
2. 進入你的 Cluster
3. 點擊 "Network Access"
4. 確認 IP 白名單包含 `0.0.0.0/0`（允許所有 IP）

### 3. 查看 Vercel 日誌

1. 在 Vercel Dashboard 中
2. 選擇你的專案
3. 進入 "Functions" 標籤
4. 點擊 `api/index.py`
5. 查看 "Logs" 標籤
6. 尋找錯誤訊息

## 🚀 重新部署步驟

### 1. 推送修復後的程式碼

```bash
git add .
git commit -m "Fix Vercel serverless function initialization"
git push
```

### 2. 在 Vercel Dashboard

1. 進入你的專案
2. 點擊 "Deployments"
3. 等待自動部署完成
4. 或手動觸發 "Redeploy"

### 3. 測試端點

```bash
# 測試根路徑
curl https://你的-vercel-url.vercel.app/

# 應該返回：
# {"status":"ok","message":"LINE Bot webhook is running"}
```

## 🔧 如果還是失敗

### 查看詳細錯誤

1. 在 Vercel Dashboard → Functions → api/index.py → Logs
2. 查看完整的錯誤堆疊
3. 根據錯誤訊息調整

### 常見錯誤和解決方案

#### 錯誤：Missing required environment variables
**解決方案：** 在 Vercel Dashboard 中設定所有環境變數

#### 錯誤：MongoDB connection failed
**解決方案：** 
- 檢查 MongoDB Atlas IP 白名單
- 確認 MONGODB_URI 格式正確

#### 錯誤：Import error
**解決方案：**
- 確認 `requirements.txt` 包含所有依賴
- 檢查 Python 版本相容性

#### 錯誤：Function timeout
**解決方案：**
- 優化程式碼執行時間
- 考慮升級到 Vercel Pro（60 秒限制）

## 📝 修改摘要

### 主要變更

1. **app.py**:
   - 將 `conversation_service` 改為延遲初始化
   - 加入 `get_conversation_service()` 函數
   - 所有使用 `conversation_service` 的地方改為呼叫函數

2. **api/index.py**:
   - 改善錯誤處理
   - 加入更詳細的錯誤訊息

3. **錯誤處理**:
   - LINE Bot 初始化加入錯誤處理
   - Webhook 處理加入檢查

## ⚠️ 重要提醒

1. **環境變數必須在 Vercel Dashboard 中設定**
2. **不要將 `.env` 檔案上傳到 GitHub**
3. **MongoDB Atlas 必須允許 Vercel 的 IP 連線**
4. **Vercel 免費版有 10 秒執行時間限制**

## 🆘 如果問題持續

如果修復後還是失敗，請：
1. 查看 Vercel 函數日誌
2. 複製完整的錯誤訊息
3. 檢查環境變數是否正確設定
4. 考慮使用其他平台（Railway、Render）


