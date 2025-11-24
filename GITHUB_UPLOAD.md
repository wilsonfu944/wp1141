# GitHub 上傳指南

## ✅ 應該上傳的檔案

### 核心程式碼
- ✅ `app.py` - Flask 主應用程式
- ✅ `config.py` - 配置管理
- ✅ `run.py` - 啟動腳本
- ✅ `test_connection.py` - 連線測試腳本
- ✅ `clear_conversation.py` - 清除對話記錄腳本

### 專案結構
- ✅ `models/` - 資料模型層
  - ✅ `__init__.py`
  - ✅ `conversation.py`
- ✅ `services/` - 服務層
  - ✅ `__init__.py`
  - ✅ `line_service.py`
  - ✅ `llm_service.py`
  - ✅ `conversation_service.py`
- ✅ `templates/` - HTML 模板
  - ✅ `admin.html`
  - ✅ `conversation_detail.html`

### 配置檔案
- ✅ `requirements.txt` - Python 依賴套件
- ✅ `.env.example` - 環境變數範例（不包含真實 API 金鑰）
- ✅ `.gitignore` - Git 忽略規則

### 文件
- ✅ `README.md` - 專案說明文件
- ✅ `README_LOVE_BOT.md` - 戀愛機器人說明
- ✅ `QUICKSTART.md` - 快速開始指南
- ✅ `WEBHOOK_SETUP.md` - Webhook 設定指南
- ✅ `BOT_DESIGN.md` - Bot 設計文件
- ✅ `LINE_GREETING_SETUP.md` - 歡迎訊息設定指南
- ✅ `DEBUG_FOLLOW_EVENT.md` - Follow Event 除錯指南
- ✅ `GITHUB_UPLOAD.md` - 本檔案

### 腳本檔案
- ✅ `setup_env.sh` - 環境變數設定腳本（但建議移除其中的真實 API 金鑰）

## ❌ 不應該上傳的檔案

### 敏感資訊
- ❌ `.env` - **絕對不要上傳！** 包含真實的 API 金鑰和密碼
- ❌ 任何包含真實 API 金鑰的檔案

### 系統檔案
- ❌ `__pycache__/` - Python 快取檔案
- ❌ `*.pyc` - Python 編譯檔案
- ❌ `.DS_Store` - macOS 系統檔案
- ❌ `*.swp`, `*.swo` - 編輯器暫存檔案

### 虛擬環境
- ❌ `venv/` - Python 虛擬環境
- ❌ `env/` - 虛擬環境
- ❌ `ENV/` - 虛擬環境

### 日誌檔案
- ❌ `*.log` - 日誌檔案
- ❌ `/tmp/linebot.log` - 應用程式日誌

### IDE 設定
- ❌ `.vscode/` - VS Code 設定（可選，如果包含個人設定）
- ❌ `.idea/` - PyCharm 設定

## ⚠️ 重要注意事項

### 1. 環境變數檔案

**絕對不要上傳 `.env` 檔案！**

應該：
- ✅ 上傳 `.env.example` 作為範本
- ✅ 在 `.env.example` 中使用占位符（如 `your_api_key_here`）
- ❌ 不要在 `.env.example` 中包含真實的 API 金鑰

### 2. setup_env.sh 檔案

如果 `setup_env.sh` 包含真實的 API 金鑰，有兩個選擇：

**選項 A：移除真實金鑰（推薦）**
```bash
# 修改 setup_env.sh，使用環境變數或提示用戶輸入
```

**選項 B：不上傳此檔案**
```bash
# 將 setup_env.sh 加入 .gitignore
```

### 3. 檢查現有檔案

在上傳前，檢查以下檔案是否包含敏感資訊：
- `setup_env.sh` - 可能包含 API 金鑰
- 任何 `.env` 檔案
- 任何配置檔案

## 📋 上傳前檢查清單

- [ ] 確認 `.env` 已加入 `.gitignore`
- [ ] 確認 `setup_env.sh` 不包含真實 API 金鑰（或已加入 `.gitignore`）
- [ ] 確認 `.env.example` 只包含占位符
- [ ] 確認沒有日誌檔案被上傳
- [ ] 確認沒有 `__pycache__` 被上傳
- [ ] 確認沒有系統檔案（`.DS_Store` 等）被上傳

## 🚀 上傳步驟

### 1. 初始化 Git 倉庫（如果還沒有）

```bash
cd "/Users/fuzhongyu/Desktop/My HW6"
git init
```

### 2. 檢查 .gitignore

```bash
cat .gitignore
```

確認包含：
- `.env`
- `__pycache__/`
- `*.pyc`
- `.DS_Store`
- `venv/`
- `*.log`

### 3. 檢查要上傳的檔案

```bash
# 查看會被追蹤的檔案
git status

# 確認沒有敏感檔案
git status | grep -E "\.env$|setup_env\.sh"
```

### 4. 加入檔案

```bash
# 加入所有應該上傳的檔案
git add .

# 再次確認
git status
```

### 5. 提交

```bash
git commit -m "Initial commit: LINE Bot 戀愛機器人專案"
```

### 6. 連接到 GitHub

```bash
# 在 GitHub 建立新倉庫後
git remote add origin https://github.com/你的用戶名/你的倉庫名.git
git branch -M main
git push -u origin main
```

## 🔒 安全建議

1. **使用 GitHub Secrets**（如果使用 GitHub Actions）
   - 將 API 金鑰儲存在 GitHub Secrets
   - 在 CI/CD 中使用環境變數

2. **使用環境變數**
   - 在部署時使用環境變數
   - 不要將 `.env` 檔案加入版本控制

3. **定期檢查**
   - 定期檢查是否有敏感資訊被意外上傳
   - 如果發現，立即撤銷並重新生成 API 金鑰

## 📝 建議的 README 內容

在 README.md 中應該包含：

```markdown
## 環境變數設定

1. 複製 `.env.example` 為 `.env`
2. 填入你的 API 金鑰：
   - LINE_CHANNEL_ID
   - LINE_CHANNEL_SECRET
   - LINE_CHANNEL_ACCESS_TOKEN
   - LLM_API_KEY
   - LLM_API_BASE
   - MONGODB_URI
```

這樣其他開發者就知道如何設定環境變數，而不需要看到真實的金鑰。



