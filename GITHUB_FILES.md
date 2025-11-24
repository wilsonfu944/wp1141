# GitHub 上傳檔案清單

## 📁 完整檔案架構

```
My HW6/
├── 📄 核心應用程式檔案
│   ├── app.py                          ✅ 必須上傳
│   ├── config.py                       ✅ 必須上傳
│   ├── run.py                          ✅ 必須上傳
│   ├── test_connection.py              ✅ 必須上傳
│   └── clear_conversation.py           ✅ 必須上傳
│
├── 📁 models/ (資料模型層)
│   ├── __init__.py                     ✅ 必須上傳
│   └── conversation.py                ✅ 必須上傳
│
├── 📁 services/ (服務層)
│   ├── __init__.py                     ✅ 必須上傳
│   ├── line_service.py                 ✅ 必須上傳
│   ├── llm_service.py                  ✅ 必須上傳
│   └── conversation_service.py         ✅ 必須上傳
│
├── 📁 templates/ (HTML 模板)
│   ├── admin.html                      ✅ 必須上傳
│   └── conversation_detail.html        ✅ 必須上傳
│
├── 📁 api/ (Vercel Serverless 函數)
│   └── index.py                        ✅ 必須上傳 (Vercel 部署用)
│
├── 📄 配置檔案
│   ├── requirements.txt                ✅ 必須上傳
│   ├── vercel.json                     ✅ 必須上傳 (Vercel 部署用)
│   ├── .gitignore                      ✅ 必須上傳
│   ├── .env.example                    ✅ 必須上傳 (不包含真實金鑰)
│   └── setup_env.sh.example            ✅ 必須上傳 (不包含真實金鑰)
│
└── 📄 文件檔案
    ├── README.md                       ✅ 必須上傳
    ├── README_LOVE_BOT.md              ✅ 必須上傳
    ├── QUICKSTART.md                   ✅ 必須上傳
    ├── WEBHOOK_SETUP.md                ✅ 必須上傳
    ├── BOT_DESIGN.md                   ✅ 必須上傳
    ├── LINE_GREETING_SETUP.md          ✅ 必須上傳
    ├── DEBUG_FOLLOW_EVENT.md           ✅ 必須上傳
    ├── VERCEL_DEPLOY.md                ✅ 必須上傳
    ├── VERCEL_FIX.md                   ✅ 必須上傳
    ├── VERCEL_ERROR_FIX.md             ✅ 必須上傳
    ├── GITHUB_UPLOAD.md                ✅ 必須上傳
    └── GITHUB_CHECKLIST.md             ✅ 必須上傳
```

## ❌ 絕對不要上傳的檔案

```
My HW6/
├── .env                                ❌ 不要上傳 (包含真實 API 金鑰)
├── setup_env.sh                        ❌ 不要上傳 (包含真實 API 金鑰)
├── __pycache__/                        ❌ 不要上傳 (Python 快取)
├── models/__pycache__/                 ❌ 不要上傳
├── services/__pycache__/               ❌ 不要上傳
├── *.pyc                               ❌ 不要上傳
├── .DS_Store                           ❌ 不要上傳 (macOS 系統檔案)
├── *.log                               ❌ 不要上傳 (日誌檔案)
└── test_follow_event.py                ❌ 可選 (測試檔案，已在 .gitignore)
```

## ✅ 快速檢查清單

### 核心檔案（必須上傳）
- [x] `app.py`
- [x] `config.py`
- [x] `run.py`
- [x] `test_connection.py`
- [x] `clear_conversation.py`

### 目錄結構（必須上傳）
- [x] `models/__init__.py`
- [x] `models/conversation.py`
- [x] `services/__init__.py`
- [x] `services/line_service.py`
- [x] `services/llm_service.py`
- [x] `services/conversation_service.py`
- [x] `templates/admin.html`
- [x] `templates/conversation_detail.html`
- [x] `api/index.py` ⚠️ **重要：Vercel 部署需要**

### 配置檔案（必須上傳）
- [x] `requirements.txt`
- [x] `vercel.json` ⚠️ **重要：Vercel 部署需要**
- [x] `.gitignore`
- [x] `.env.example` (不包含真實金鑰)
- [x] `setup_env.sh.example` (不包含真實金鑰)

### 文件（建議上傳）
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

## 🚀 上傳步驟

### 1. 檢查 .gitignore

```bash
cat .gitignore
```

確認包含：
- `.env`
- `setup_env.sh`
- `__pycache__/`
- `*.pyc`
- `.DS_Store`

### 2. 檢查要上傳的檔案

```bash
git status
```

確認：
- ✅ 看到所有應該上傳的檔案
- ❌ **沒有看到** `.env` 或 `setup_env.sh`

### 3. 加入所有檔案

```bash
git add .
```

### 4. 再次確認

```bash
git status
```

確認：
- ✅ 所有應該上傳的檔案都在 "Changes to be committed"
- ❌ **沒有** `.env` 或 `setup_env.sh`

### 5. 提交

```bash
git commit -m "Initial commit: LINE Bot 戀愛機器人專案"
```

### 6. 推送到 GitHub

```bash
git remote add origin https://github.com/你的用戶名/你的倉庫名.git
git branch -M main
git push -u origin main
```

## ⚠️ 特別注意

### Vercel 部署需要的檔案

如果你要部署到 Vercel，**必須**包含：
- ✅ `vercel.json` - Vercel 配置
- ✅ `api/index.py` - Serverless 函數入口

### 環境變數

- ❌ **絕對不要**上傳 `.env` 檔案
- ✅ 上傳 `.env.example` 作為範本
- ✅ 在 Vercel Dashboard 中設定環境變數

## 📋 檔案數量統計

應該上傳的檔案總數：約 **25-30 個檔案**

包括：
- 核心程式碼：5 個
- 模型層：2 個
- 服務層：4 個
- 模板：2 個
- API 函數：1 個
- 配置檔案：5 個
- 文件：12+ 個


