# GitHub 上傳檢查清單

## ✅ 應該上傳的檔案

### 核心程式碼
- [x] `app.py`
- [x] `config.py`
- [x] `run.py`
- [x] `test_connection.py`
- [x] `clear_conversation.py`

### 專案結構
- [x] `models/` 目錄（所有 .py 檔案）
- [x] `services/` 目錄（所有 .py 檔案）
- [x] `templates/` 目錄（所有 .html 檔案）

### 配置檔案
- [x] `requirements.txt`
- [x] `.env.example`（不包含真實金鑰）
- [x] `.gitignore`
- [x] `setup_env.sh.example`（不包含真實金鑰）

### 文件
- [x] `README.md`
- [x] `README_LOVE_BOT.md`
- [x] `QUICKSTART.md`
- [x] `WEBHOOK_SETUP.md`
- [x] `BOT_DESIGN.md`
- [x] `LINE_GREETING_SETUP.md`
- [x] `DEBUG_FOLLOW_EVENT.md`
- [x] `GITHUB_UPLOAD.md`

## ❌ 絕對不要上傳

- [ ] `.env` - 包含真實 API 金鑰
- [ ] `setup_env.sh` - 包含真實 API 金鑰
- [ ] `__pycache__/` - Python 快取
- [ ] `*.pyc` - 編譯檔案
- [ ] `.DS_Store` - 系統檔案
- [ ] `*.log` - 日誌檔案

## 🚀 上傳步驟

1. 初始化 Git：
   ```bash
   git init
   ```

2. 檢查 .gitignore：
   ```bash
   cat .gitignore
   ```

3. 檢查狀態：
   ```bash
   git status
   ```

4. 確認沒有敏感檔案：
   ```bash
   git status | grep -E "\.env$|setup_env\.sh$"
   # 應該沒有輸出
   ```

5. 加入檔案：
   ```bash
   git add .
   ```

6. 再次確認：
   ```bash
   git status
   # 確認沒有 .env 或 setup_env.sh
   ```

7. 提交：
   ```bash
   git commit -m "Initial commit: LINE Bot 戀愛機器人專案"
   ```

8. 連接到 GitHub：
   ```bash
   git remote add origin https://github.com/你的用戶名/你的倉庫名.git
   git branch -M main
   git push -u origin main
   ```
