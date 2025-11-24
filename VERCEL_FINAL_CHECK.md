# ✅ Vercel 部署最終檢查

## 🎯 已完成的優化

### 1. api/index.py ✅
- ✅ 正確處理路徑和導入
- ✅ 明確設定工作目錄
- ✅ 加入錯誤處理和日誌

### 2. vercel.json ✅
- ✅ 正確配置 builds 和 routes
- ✅ 設定 maxDuration: 30 秒
- ✅ 設定 memory: 1024MB
- ✅ 設定 PYTHONUNBUFFERED 環境變數

### 3. app.py ✅
- ✅ 延遲初始化服務
- ✅ 明確指定 template_folder
- ✅ 完善的錯誤處理

### 4. config.py ✅
- ✅ 優化 dotenv 載入（Vercel 不需要）
- ✅ 直接從環境變數讀取

### 5. models/conversation.py ✅
- ✅ 增加 MongoDB 連線超時時間
- ✅ 多層 fallback 機制

## 📋 必須上傳的檔案

### 核心檔案
```
✅ app.py
✅ config.py
✅ run.py
✅ test_connection.py
✅ clear_conversation.py
```

### 目錄結構
```
✅ models/
   ✅ __init__.py
   ✅ conversation.py

✅ services/
   ✅ __init__.py
   ✅ line_service.py
   ✅ llm_service.py
   ✅ conversation_service.py

✅ templates/
   ✅ admin.html
   ✅ conversation_detail.html

✅ api/                    ⚠️ Vercel 必需
   ✅ index.py
```

### 配置檔案
```
✅ requirements.txt
✅ vercel.json            ⚠️ Vercel 必需
✅ .gitignore
✅ .env.example
✅ setup_env.sh.example
```

## 🚀 部署步驟

### 1. 確認所有檔案

```bash
# 檢查關鍵檔案
ls -la vercel.json api/index.py requirements.txt
```

### 2. 檢查 .gitignore

```bash
# 確認敏感檔案不會被上傳
git status | grep -E "\.env$|setup_env\.sh$"
# 應該沒有輸出
```

### 3. 提交並推送

```bash
git add .
git commit -m "Optimize for Vercel deployment"
git push
```

### 4. 在 Vercel Dashboard

1. 確認環境變數已設定（6 個變數）
2. 等待自動部署完成
3. 查看部署日誌

### 5. 測試

```bash
# 測試根路徑
curl https://你的-vercel-url.vercel.app/

# 應該返回：
# {"status":"ok","message":"LINE Bot webhook is running"}

# 測試 webhook
curl https://你的-vercel-url.vercel.app/webhook
```

## ⚠️ 重要提醒

1. **環境變數必須在 Vercel Dashboard 中設定**
2. **不要上傳 `.env` 檔案**
3. **MongoDB Atlas IP 白名單必須包含 `0.0.0.0/0`**
4. **Vercel 免費版有 10 秒執行時間限制**

## 🔍 如果部署失敗

1. 查看 Vercel Functions → api/index.py → Logs
2. 檢查環境變數是否正確
3. 確認所有檔案都已上傳
4. 查看建置日誌

## ✅ 部署檢查清單

- [ ] 所有檔案已推送到 GitHub
- [ ] Vercel 環境變數已設定（6 個）
- [ ] MongoDB Atlas IP 白名單已設定
- [ ] 部署狀態為 "Ready"
- [ ] 測試端點返回正確回應
- [ ] LINE Webhook URL 已更新


