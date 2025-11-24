# 快速開始指南

## 🚀 5 分鐘快速啟動

### 1. 安裝依賴

```bash
pip install -r requirements.txt
```

### 2. 設定環境變數

```bash
./setup_env.sh
```

或手動建立 `.env` 檔案（已包含你的 API 金鑰）。

### 3. 測試連線（可選）

```bash
python test_connection.py
```

### 4. 啟動應用程式

```bash
python run.py
```

應用程式會在 `http://localhost:5000` 啟動。

### 5. 使用 ngrok 建立公開 URL

在另一個終端機：

```bash
ngrok http 5000
```

複製 ngrok 提供的 HTTPS URL（例如：`https://xxxx-xxxx.ngrok.io`）

### 6. 設定 LINE Webhook

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 選擇你的 Channel
3. 進入 "Messaging API" → "Webhook settings"
4. 設定 Webhook URL: `https://xxxx-xxxx.ngrok.io/webhook`
5. 點擊 "Verify" 確認連線
6. 啟用 "Use webhook"

### 7. 測試 Bot

1. 開啟你的 LINE 應用程式
2. 搜尋並加入你的 Bot
3. 發送訊息測試！

### 8. 查看管理後台

瀏覽器開啟：`http://localhost:5000/admin`

## 📁 專案結構

```
.
├── app.py                    # Flask 主應用
├── config.py                # 配置管理
├── run.py                   # 啟動腳本
├── test_connection.py        # 連線測試
├── setup_env.sh             # 環境變數設定
├── requirements.txt         # Python 依賴
├── models/                  # 資料模型
│   └── conversation.py
├── services/                # 服務層
│   ├── line_service.py
│   ├── llm_service.py
│   └── conversation_service.py
└── templates/              # HTML 模板
    ├── admin.html
    └── conversation_detail.html
```

## 🔑 API 端點

- `POST /webhook` - LINE Webhook 接收端點
- `GET /admin` - 管理後台（對話列表）
- `GET /admin/conversation/<id>` - 對話詳情
- `GET /api/conversations` - JSON API

## 💡 常見問題

### Webhook 驗證失敗？

- 確認 ngrok URL 是 HTTPS
- 檢查 `LINE_CHANNEL_SECRET` 是否正確
- 確認防火牆沒有阻擋

### LLM 無回應？

- 檢查 Groq API 金鑰是否有效
- 確認 API 配額是否足夠
- 查看終端機錯誤訊息

### MongoDB 連線失敗？

- 檢查 MongoDB Atlas IP 白名單
- 確認連線字串格式正確
- 檢查網路連線

## 📚 更多資訊

詳細文件請參考 `README.md`



