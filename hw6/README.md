# LINE Bot - 戀愛機器人

一個使用 Python Flask 開發的 LINE Bot，扮演使用者的男女朋友，提供陪伴、關心和支持。支援多種人格切換，使用 LLM (Groq) 生成自然對話。

## 📋 目錄

- [功能特色](#功能特色)
- [部署連結](#部署連結)
- [環境設定](#環境設定)
- [本地開發](#本地開發)
- [部署說明](#部署說明)
- [專案結構](#專案結構)
- [API 文件](#api-文件)

## ✨ 功能特色

### 核心功能

- 💕 **戀愛機器人角色**：扮演使用者的男女朋友，提供陪伴和關心
- 🎭 **6 種人格選擇**：傻白甜、正直、溫柔體貼、兇巴巴但愛你的、恐怖情人、悲觀的
- 🤖 **智能對話**：使用 LLM (Groq) 生成自然、有感情的對話
- 💬 **對話記錄**：完整儲存所有對話歷史
- 🎨 **管理後台**：網頁介面查看和管理對話記錄
- 🔘 **按鈕互動**：使用 LINE Buttons Template 選擇人格

### 人格類型

1. **傻白甜** - 天真可愛，有點呆萌
2. **正直** - 正義感強，誠實可靠
3. **溫柔體貼** - 非常溫柔，善解人意
4. **兇巴巴但愛你的** - 傲嬌類型
5. **恐怖情人** - 佔有慾強，會吃醋
6. **悲觀的** - 總是往壞處想，需要安慰

## 🔗 部署連結

### LINE Bot

- **Bot ID**: 請在 LINE Developers Console 查看
- **QR Code**: 請在 LINE Developers Console 下載
- **Webhook URL**: `https://your-vercel-url.vercel.app/webhook`

### 管理後台

- **Production URL**: `https://your-vercel-url.vercel.app/admin`
- **功能**：
  - 查看所有對話記錄
  - 查看單一對話的詳細內容
  - 清除對話記錄

> **注意**：請將 `your-vercel-url` 替換為你的實際 Vercel 部署網址

## ⚙️ 環境設定

### 必要環境變數

建立 `.env` 檔案（參考 `env.example`）：

```bash
# LINE API 設定
LINE_CHANNEL_ID=your_channel_id_here
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here

# LLM API 設定 (Groq)
LLM_API_KEY=your_llm_api_key_here
LLM_API_BASE=https://api.groq.com/openai/v1

# MongoDB 設定
MONGODB_URI=your_mongodb_uri_here

# 應用程式設定 (可選)
FLASK_ENV=development
DEBUG=True
```

### 取得 API 金鑰

#### 1. LINE Developers Console

1. 前往 https://developers.line.biz/console/
2. 建立 Provider 和 Channel
3. 在 Channel 設定中取得：
   - Channel ID
   - Channel Secret
   - Channel Access Token
4. 設定 Webhook URL：`https://your-vercel-url.vercel.app/webhook`

#### 2. Groq API

1. 前往 https://console.groq.com/
2. 註冊帳號並建立 API Key
3. 將 API Key 填入 `LLM_API_KEY`

#### 3. MongoDB Atlas

1. 前往 https://www.mongodb.com/cloud/atlas
2. 建立免費 Cluster
3. 建立資料庫使用者
4. 取得 Connection String
5. 將 Connection String 填入 `MONGODB_URI`

## 💻 本地開發

### 前置需求

- Python 3.8+
- pip
- MongoDB Atlas 帳號（或本地 MongoDB）

### 安裝步驟

1. **複製專案**

```bash
git clone https://github.com/wilsonfu944/wp1141.git
cd wp1141/hw6
```

2. **建立虛擬環境（建議）**

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. **安裝依賴**

```bash
pip install -r requirements.txt
```

4. **設定環境變數**

```bash
cp env.example .env
# 編輯 .env 檔案，填入你的 API 金鑰
```

5. **測試連線**

```bash
python3 test_connection.py
```

6. **啟動開發伺服器**

```bash
python3 run.py
```

伺服器會在 `http://localhost:5001` 啟動。

### 使用 ngrok 測試 Webhook

1. **安裝 ngrok**

```bash
# macOS
brew install ngrok

# 或從 https://ngrok.com/download 下載
```

2. **啟動 ngrok**

```bash
ngrok http 5001
```

3. **設定 LINE Webhook URL**

在 LINE Developers Console 中設定 Webhook URL：
```
https://your-ngrok-url.ngrok.io/webhook
```

4. **驗證 Webhook**

在 LINE Developers Console 中點擊 "Verify" 按鈕。

## 🚀 部署說明

### 部署到 Vercel

1. **安裝 Vercel CLI**

```bash
npm i -g vercel
```

2. **登入 Vercel**

```bash
vercel login
```

3. **部署**

```bash
cd hw6
vercel
```

4. **設定環境變數**

在 Vercel Dashboard 中設定所有環境變數：
- `LINE_CHANNEL_ID`
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LLM_API_KEY`
- `LLM_API_BASE`
- `MONGODB_URI`

5. **設定 Webhook URL**

在 LINE Developers Console 中設定 Webhook URL：
```
https://your-project.vercel.app/webhook
```

### Vercel 設定檔

專案已包含 `vercel.json` 設定檔：

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.py"
    }
  ],
  "functions": {
    "api/index.py": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

## 📁 專案結構

```
hw6/
├── api/
│   └── index.py              # Vercel Serverless Function 入口
├── models/
│   ├── __init__.py
│   └── conversation.py       # 對話資料模型
├── services/
│   ├── __init__.py
│   ├── line_service.py       # LINE API 服務
│   ├── llm_service.py        # LLM API 服務
│   ├── conversation_service.py  # 對話邏輯服務
│   └── persona_service.py   # 人格管理服務
├── templates/
│   ├── admin.html            # 管理後台主頁
│   └── conversation_detail.html  # 對話詳情頁
├── app.py                    # Flask 主應用程式
├── config.py                 # 環境變數配置
├── run.py                    # 本地開發啟動腳本
├── requirements.txt          # Python 依賴
├── vercel.json               # Vercel 部署配置
├── env.example               # 環境變數範例
├── chatbot-design.md         # Bot 設計文件
├── README.md                 # 本文件
└── ...                       # 其他檔案
```

## 🔌 API 文件

### Webhook 端點

#### `POST /webhook`

接收 LINE Platform 的 webhook 事件。

**Headers:**
- `X-Line-Signature`: LINE 簽章（用於驗證）

**Body:**
LINE Platform 的 webhook 事件 JSON

**回應:**
```json
{
  "status": "ok"
}
```

### 管理後台端點

#### `GET /admin`

顯示管理後台主頁，列出所有對話記錄。

#### `GET /admin/conversation/<conversation_id>`

顯示特定對話的詳細內容。

#### `GET /api/conversations`

API 端點，返回所有對話記錄的 JSON。

#### `POST /admin/clear-conversation/<user_id>`

清除特定使用者的對話記錄。

#### `POST /admin/clear-all`

清除所有對話記錄。

## 🧪 測試

### 測試連線

```bash
python3 test_connection.py
```

測試 MongoDB、LINE API 和 LLM API 的連線。

### 測試按鈕格式

```bash
python3 test_button_json.py
```

驗證按鈕 JSON 格式是否符合 LINE 規範。

### 測試按鈕發送

```bash
python3 test_send_button.py
```

測試按鈕物件的建立和發送方式。

## 📝 開發注意事項

### 環境變數安全

- ⚠️ **不要**將 `.env` 檔案上傳到 Git
- ✅ 使用 `env.example` 作為範本
- ✅ 在 Vercel 中設定環境變數

### 已忽略的檔案

專案已設定 `.gitignore`，以下檔案不會上傳：
- `.env`
- `__pycache__/`
- `*.pyc`
- `.DS_Store`
- `*.log`

### 程式碼結構

- **Service Layer**：處理業務邏輯
- **Repository Layer**：處理資料庫操作
- **Model Layer**：定義資料模型
- **Controller Layer**：處理 HTTP 請求和回應

## 🐛 故障排除

### 按鈕不顯示

1. 檢查 LINE Developers Console：
   - 關閉 Auto-reply messages
   - 關閉 Greeting messages
2. 檢查 Vercel 日誌是否有錯誤
3. 確認 Webhook URL 正確設定

### Webhook 驗證失敗

1. 確認 Webhook URL 格式正確：`https://your-url.vercel.app/webhook`
2. 確認 Vercel 部署成功
3. 檢查 LINE Channel Secret 是否正確

### LLM API 錯誤

1. 檢查 Groq API Key 是否正確
2. 檢查 API 配額是否用完
3. 查看 Vercel 日誌中的詳細錯誤訊息

更多故障排除資訊，請參考：
- `BUTTON_DEBUG_GUIDE.md`
- `BUTTON_TROUBLESHOOTING.md`
- `BUTTON_RELIABLE_SENDING.md`

## 📄 授權

本專案為作業專案，僅供學習使用。

## 👤 作者

- 傅仲瑜

## 📚 參考資料

- [LINE Messaging API 文件](https://developers.line.biz/en/docs/messaging-api/)
- [Groq API 文件](https://console.groq.com/docs)
- [MongoDB Atlas 文件](https://docs.atlas.mongodb.com/)
- [Vercel 文件](https://vercel.com/docs)

