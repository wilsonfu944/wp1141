# LINE Bot with LLM Integration

完整的 LINE 聊天機器人系統，整合 Groq LLM API 和 MongoDB Atlas，支援對話記錄與管理後台。

## 功能特色

- ✅ LINE Webhook 接收與回覆訊息
- ✅ Groq LLM API 整合（支援上下文記憶）
- ✅ MongoDB Atlas 持久化對話記錄
- ✅ 腳本回覆 + LLM 混合邏輯
- ✅ 錯誤處理與降級機制
- ✅ 管理後台查看對話記錄
- ✅ 清晰的架構設計（Service + Repository 層）

## 專案結構

```
.
├── app.py                 # Flask 主應用程式
├── config.py             # 配置管理
├── run.py                # 啟動腳本（推薦使用）
├── test_connection.py    # 連線測試腳本
├── setup_env.sh          # 環境變數設定腳本
├── requirements.txt      # Python 依賴套件
├── .env                  # 環境變數（需自行建立）
├── .env.example          # 環境變數範例
├── README.md             # 完整文件
├── QUICKSTART.md         # 快速開始指南
├── models/               # 資料模型層
│   ├── __init__.py
│   └── conversation.py   # Conversation 與 Message 模型
├── services/             # 服務層
│   ├── __init__.py
│   ├── line_service.py   # LINE API 服務
│   ├── llm_service.py    # LLM (Groq) 服務
│   └── conversation_service.py  # 對話邏輯服務
└── templates/            # HTML 模板
    ├── admin.html        # 管理後台列表
    └── conversation_detail.html  # 對話詳情頁
```

## 安裝步驟

### 1. 安裝 Python 依賴

```bash
pip install -r requirements.txt
```

### 2. 設定環境變數

**方法一：使用設定腳本（推薦）**

```bash
./setup_env.sh
```

**方法二：手動建立 `.env` 檔案**

建立 `.env` 檔案（參考 `.env.example`）：

```env
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LLM_API_KEY=your_groq_api_key
LLM_API_BASE=https://api.groq.com/openai/v1
MONGODB_URI=your_mongodb_uri
```

### 3. 測試連線（可選）

執行測試腳本驗證所有服務連線：

```bash
python test_connection.py
```

### 4. 設定 LINE Webhook

1. 登入 [LINE Developers Console](https://developers.line.biz/)
2. 選擇你的 Channel
3. 進入 "Messaging API" 設定
4. 設定 Webhook URL（使用 ngrok 或部署後的 URL）
5. 啟用 Webhook

## 執行方式

### 本地開發（使用 ngrok）

#### 1. 啟動 Flask 應用

**推薦方式：使用啟動腳本**

```bash
python run.py
```

啟動腳本會自動驗證配置並顯示有用的資訊。

**替代方式：直接啟動**

```bash
python app.py
```

應用程式會在 `http://localhost:5000` 啟動。

#### 2. 使用 ngrok 建立隧道

在另一個終端機執行：

```bash
ngrok http 5000
```

ngrok 會顯示一個公開 URL，例如：
```
Forwarding  https://xxxx-xxxx-xxxx.ngrok.io -> http://localhost:5000
```

#### 3. 設定 LINE Webhook URL

在 LINE Developers Console 中，將 Webhook URL 設定為：
```
https://xxxx-xxxx-xxxx.ngrok.io/webhook
```

#### 4. 驗證 Webhook

在 LINE Developers Console 中點擊 "Verify" 按鈕，確認連線成功。

### 生產環境部署

可以部署到：
- Heroku
- AWS EC2 / Elastic Beanstalk
- Google Cloud Run
- Azure App Service
- 任何支援 Python 的雲端平台

記得設定環境變數，並確保 Webhook URL 是 HTTPS。

## API 端點

### Webhook
- `POST /webhook` - LINE Webhook 接收端點

### 管理後台
- `GET /admin` - 對話列表（網頁）
- `GET /admin/conversation/<conversation_id>` - 對話詳情（網頁）
- `GET /api/conversations` - 對話列表（JSON API）

### 查詢參數
- `page` - 頁碼（預設：1）
- `limit` - 每頁數量（預設：20）
- `user_id` - 篩選特定用戶

## 架構說明

### Repository 層 (`models/conversation.py`)
- 負責 MongoDB 資料庫操作
- 提供 CRUD 方法
- 資料模型定義

### Service 層 (`services/`)
- **LineService**: 處理 LINE API 呼叫
- **LLMService**: 處理 Groq LLM API 呼叫與提示詞建構
- **ConversationService**: 整合對話邏輯，協調各服務

### 應用層 (`app.py`)
- Flask 路由定義
- Webhook 處理
- 管理後台路由

## 對話流程

1. 用戶發送訊息到 LINE
2. LINE 發送 Webhook 事件到 `/webhook`
3. 驗證簽章並解析事件
4. `ConversationService` 處理訊息：
   - 從資料庫載入或建立對話
   - 嘗試腳本回覆（關鍵字匹配）
   - 若無腳本回覆，呼叫 LLM 生成回覆（帶上下文）
   - 儲存對話記錄
   - 透過 LINE API 發送回覆
5. 回覆用戶

## 錯誤處理

- LLM API 失敗時，回傳降級訊息
- LINE API 失敗時，記錄錯誤並嘗試重試
- 資料庫錯誤時，記錄但不中斷流程
- 所有錯誤都有適當的日誌記錄

## 開發建議

### 測試 Webhook

可以使用 [LINE Webhook Tester](https://developers.line.biz/console/) 或直接從 LINE 應用程式發送訊息。

### 查看日誌

應用程式會在終端機輸出日誌，包括：
- 收到的訊息
- API 錯誤
- 資料庫操作

### 自訂 LLM 提示詞

編輯 `services/llm_service.py` 中的 `build_prompt` 方法，修改系統提示詞。

### 新增腳本回覆

在 `services/llm_service.py` 的 `generate_scripted_response` 方法中新增關鍵字匹配規則。

## 疑難排解

### Webhook 驗證失敗
- 檢查 `LINE_CHANNEL_SECRET` 是否正確
- 確認 ngrok URL 是 HTTPS
- 檢查防火牆設定

### LLM 無回應
- 檢查 `LLM_API_KEY` 是否有效
- 確認 Groq API 配額
- 查看終端機錯誤訊息

### MongoDB 連線失敗
- 檢查 `MONGODB_URI` 格式
- 確認 IP 白名單設定（MongoDB Atlas）
- 檢查網路連線

## 授權

此專案僅供學習與開發使用。

## 聯絡資訊

如有問題，請查看程式碼註解或相關文件。

