# 📋 GitHub 上傳檢查清單

## ✅ 必須上傳的檔案

### 核心應用程式
- [x] `app.py`
- [x] `config.py`
- [x] `run.py`
- [x] `test_connection.py`
- [x] `clear_conversation.py`

### 目錄結構
- [x] `models/__init__.py`
- [x] `models/conversation.py`
- [x] `services/__init__.py`
- [x] `services/line_service.py`
- [x] `services/llm_service.py`
- [x] `services/conversation_service.py`
- [x] `templates/admin.html`
- [x] `templates/conversation_detail.html`
- [x] `api/index.py` ⚠️ **Vercel 部署必需**

### 配置檔案
- [x] `requirements.txt`
- [x] `vercel.json` ⚠️ **Vercel 部署必需**
- [x] `.gitignore`
- [x] `.env.example` ✅ **剛建立**
- [x] `setup_env.sh.example`

### 文件
- [x] `README.md`
- [x] `README_LOVE_BOT.md`
- [x] `QUICKSTART.md`
- [x] `WEBHOOK_SETUP.md`
- [x] `BOT_DESIGN.md`
- [x] `LINE_GREETING_SETUP.md`
- [x] `DEBUG_FOLLOW_EVENT.md`
- [x] `VERCEL_DEPLOY.md`
- [x] `VERCEL_FIX.md`
- [x] `VERCEL_ERROR_FIX.md`
- [x] `GITHUB_UPLOAD.md`
- [x] `GITHUB_CHECKLIST.md`
- [x] `GITHUB_FILES.md`

## ❌ 絕對不要上傳

- [ ] `.env` - 包含真實 API 金鑰（已在 .gitignore）
- [ ] `setup_env.sh` - 包含真實 API 金鑰（已在 .gitignore）
- [ ] `__pycache__/` - Python 快取（已在 .gitignore）
- [ ] `*.pyc` - 編譯檔案（已在 .gitignore）
- [ ] `.DS_Store` - 系統檔案（已在 .gitignore）

## 🚀 上傳步驟

```bash
# 1. 檢查狀態
git status

# 2. 確認沒有敏感檔案
git status | grep -E "\.env$|setup_env\.sh$"
# 應該沒有輸出

# 3. 加入所有檔案
git add .

# 4. 再次確認
git status
# 確認沒有 .env 或 setup_env.sh

# 5. 提交
git commit -m "Initial commit: LINE Bot 戀愛機器人專案"

# 6. 推送到 GitHub
git remote add origin https://github.com/你的用戶名/你的倉庫名.git
git branch -M main
git push -u origin main
```
