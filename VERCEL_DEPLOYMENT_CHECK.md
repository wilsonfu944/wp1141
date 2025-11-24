# Vercel 部署檢查清單

## ✅ 已優化的配置

### 1. vercel.json
- ✅ 正確配置了 builds 和 routes
- ✅ 設定了 maxDuration 為 30 秒（Pro 版限制）
- ✅ 所有路由都指向 `/api/index.py`

### 2. api/index.py
- ✅ 正確設置了 Python 路徑
- ✅ 正確導入 Flask app
- ✅ 處理了相對導入問題

### 3. app.py
- ✅ 延遲初始化服務（避免部署時失敗）
- ✅ 錯誤處理完善
- ✅ 明確指定 template_folder

### 4. config.py
- ✅ 優化了 dotenv 載入（Vercel 不需要 .env 檔案）
- ✅ 直接從環境變數讀取

### 5. models/conversation.py
- ✅ 改善了 MongoDB 連線（增加超時時間）
- ✅ 多層 fallback 機制

## 📋 部署前檢查清單

### 必須的檔案
- [x] `vercel.json` - Vercel 配置
- [x] `api/index.py` - Serverless 函數入口
- [x] `requirements.txt` - Python 依賴
- [x] `app.py` - Flask 應用
- [x] 所有 `models/` 檔案
- [x] 所有 `services/` 檔案
- [x] 所有 `templates/` 檔案

### Vercel 環境變數（必須設定）
- [x] `LINE_CHANNEL_ID`
- [x] `LINE_CHANNEL_SECRET`
- [x] `LINE_CHANNEL_ACCESS_TOKEN`
- [x] `LLM_API_KEY`
- [x] `LLM_API_BASE` (可選，有預設值)
- [x] `MONGODB_URI`

### 測試步驟

1. **本地測試導入**
   ```bash
   cd api
   python3 -c "from app import app; print('✅ Import successful')"
   ```

2. **檢查依賴**
   ```bash
   pip install -r requirements.txt
   ```

3. **部署到 Vercel**
   ```bash
   vercel --prod
   ```

4. **測試端點**
   ```bash
   curl https://你的-vercel-url.vercel.app/
   curl https://你的-vercel-url.vercel.app/webhook
   ```

## 🔧 已修復的問題

1. ✅ **延遲初始化** - 避免部署時 MongoDB 連線失敗
2. ✅ **錯誤處理** - 所有關鍵點都有錯誤處理
3. ✅ **路徑問題** - 正確處理相對導入
4. ✅ **環境變數** - 優化 dotenv 載入
5. ✅ **MongoDB 連線** - 增加超時時間和 fallback

## ⚠️ Vercel 限制

### 執行時間限制
- 免費版：10 秒
- Pro 版：60 秒（已設定 maxDuration: 30）

### 建議
如果 LLM 回應時間經常超過 10 秒，考慮：
1. 升級到 Vercel Pro
2. 或使用其他平台（Railway、Render）

## 🚀 部署指令

```bash
# 1. 確認所有檔案已提交
git add .
git commit -m "Optimize for Vercel deployment"
git push

# 2. 在 Vercel Dashboard 中
# - 確認環境變數已設定
# - 等待自動部署完成
# - 或手動觸發 Redeploy

# 3. 測試
curl https://你的-vercel-url.vercel.app/
```

## 📝 如果部署失敗

1. 查看 Vercel 函數日誌
2. 檢查環境變數是否正確
3. 確認 MongoDB Atlas IP 白名單
4. 查看建置日誌中的錯誤訊息


