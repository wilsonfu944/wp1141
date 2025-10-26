# 作業繳交指南

## 📦 繳交前檢查清單

### ✅ 必要檢查項目

- [ ] **README.md 完整說明**
  - [x] 服務功能說明
  - [x] 安裝步驟
  - [x] 使用方式
  - [x] 技術架構
  - [x] 相關文檔連結

- [ ] **Chat History 處理**
  - [ ] 已將 Cursor chat histories 下載為 .md 檔
  - [ ] 已放置在 `hw3/chat-history/` 資料夾
  - [ ] 如檔案 > 100KB，已處理只保留 prompts

- [ ] **.gitignore 設定**
  - [x] node_modules 已排除
  - [x] dist 已排除
  - [x] .env 檔案已排除
  - [x] 編輯器設定檔已排除
  - [ ] 無大型多媒體檔案

- [ ] **程式碼品質**
  - [x] 無 TypeScript 錯誤
  - [x] 無 ESLint 錯誤
  - [x] 程式碼可正常執行

- [ ] **Git 狀態**
  - [ ] 所有變更已 commit
  - [ ] 確認在 main branch
  - [ ] 確認 GitHub repo 預設 branch 為 main

---

## 📂 專案結構檢查

### 當前專案結構
```
wp1141/hw3/
├── README.md                    ✅ 完整說明
├── package.json                 ✅ 依賴套件
├── tsconfig.json               ✅ TypeScript 配置
├── vite.config.ts              ✅ Vite 配置
├── .gitignore                  ✅ Git 忽略設定
│
├── chat-history/               ⚠️ 請放置 chat .md 檔
│   └── (放置 Cursor chat .md 檔案)
│
├── public/
│   └── data/
│       └── products.csv        ✅ 商品資料（100筆）
│
├── src/
│   ├── components/             ✅ 7 個組件
│   ├── contexts/               ✅ 2 個 Context
│   ├── hooks/                  ✅ 5 個自定義 Hook
│   ├── pages/                  ✅ 2 個頁面
│   ├── types/                  ✅ TypeScript 類型
│   ├── utils/                  ✅ 工具函數
│   └── App.tsx                 ✅ 主應用
│
└── 文檔/
    ├── ARCHITECTURE.md         ✅ 架構說明
    ├── FEATURES.md             ✅ 功能說明
    ├── QUICK_REFERENCE.md      ✅ 快速參考
    ├── DATA_INFO.md            ✅ 資料說明
    ├── SETUP.md                ✅ 快速開始
    ├── CHANGELOG.md            ✅ 更新日誌
    ├── FIXES.md                ✅ 問題修復
    └── PROJECT_SUMMARY.md      ✅ 專案總結
```

---

## 🗂️ Chat History 處理

### 步驟 1: 下載 Chat History
1. 在 Cursor 中開啟 Chat
2. 點擊右上角選單
3. 選擇 "Download chat history"
4. 儲存 .md 檔案

### 步驟 2: 檢查檔案大小
```bash
cd /Users/joy.lin/Desktop/wp1141/hw3/chat-history
du -sh *.md
```

### 步驟 3: 如果檔案 > 100KB
如果總檔案大小超過 100KB，請使用 Cursor 處理：

**Prompt 範例：**
```
請幫我處理這個 chat history .md 檔案，只保留我的 prompts（使用者提問），
移除所有 AI 回應的內容。保持原有的格式和時間戳記。
```

### 步驟 4: 確認檔案已放置
```bash
# 檢查 chat-history 資料夾內容
ls -lh /Users/joy.lin/Desktop/wp1141/hw3/chat-history/
```

---

## 🔍 .gitignore 檢查

### 確認以下檔案已被忽略

```bash
# 在 hw3/ 目錄下執行
git status

# 確認以下不應出現在待 commit 清單：
# - node_modules/
# - dist/
# - *.log
# - .DS_Store
# - .env
```

### 如果有不該 commit 的檔案出現
```bash
# 從 git 追蹤中移除（但保留本地檔案）
git rm --cached <檔案名稱>

# 或移除整個資料夾
git rm -r --cached <資料夾名稱>

# 然後 commit
git commit -m "Remove unwanted files from git tracking"
```

---

## 📝 README.md 檢查

### 必要內容確認

您的 README.md 已包含以下內容：

- ✅ **專案簡介**：購物網站功能說明
- ✅ **功能特色**：
  - 項目瀏覽（篩選、搜尋、排序、比較）
  - 購物車管理（localStorage 持久化）
  - 訂單結帳
- ✅ **技術架構**：React 18 + TypeScript + Ant Design
- ✅ **安裝步驟**：`npm install` + `npm run dev`
- ✅ **使用說明**：瀏覽、加入購物車、結帳流程
- ✅ **資料格式**：CSV 欄位說明
- ✅ **常見問題**：FAQ 列表
- ✅ **相關文檔**：連結到其他文檔

**✅ README.md 內容完整！無需修改**

---

## 🚀 Git 提交步驟

### 步驟 1: 確認當前位置和分支
```bash
cd /Users/joy.lin/Desktop/wp1141
pwd
# 應該顯示：/Users/joy.lin/Desktop/wp1141

git branch
# 確認在 main branch（有 * 標記）
```

### 步驟 2: 檢查狀態
```bash
git status
# 查看所有變更的檔案
```

### 步驟 3: 添加檔案
```bash
# 添加 hw3 資料夾所有內容
git add hw3

# 或者分別添加（更謹慎）
git add hw3/src
git add hw3/public
git add hw3/chat-history
git add hw3/*.md
git add hw3/*.json
git add hw3/*.ts
```

### 步驟 4: 確認要 commit 的檔案
```bash
git status
# 確認所有 hw3 相關檔案都在 "Changes to be committed"
# 確認沒有 node_modules、dist 等不該 commit 的檔案
```

### 步驟 5: Commit
```bash
git commit -m "Add hw3: 購物網站 (React + TypeScript + Ant Design)

功能：
- 商品瀏覽（篩選、搜尋、排序、比較）
- 購物車管理（localStorage 持久化）
- 訂單結帳流程
- 100 筆商品資料（5 大分類）

技術：
- React 18 + TypeScript
- Ant Design 5
- React Context 狀態管理
- CSV 資料源
- 響應式設計"
```

### 步驟 6: Push 到 GitHub
```bash
git push origin main
# 或簡寫
git push
```

### 步驟 7: 驗證
```bash
# 在瀏覽器開啟你的 GitHub repo
# 確認：
# 1. hw3 資料夾已上傳
# 2. README.md 正確顯示
# 3. 所有檔案都在
# 4. 預設 branch 是 main
```

---

## ⚠️ 常見問題排除

### Q1: 預設 branch 不是 main？
```bash
# 檢查當前 branch
git branch -a

# 如果在 master，需要切換到 main
git checkout -b main  # 創建 main branch
git push -u origin main  # push 到遠端

# 在 GitHub 設定預設 branch：
# Settings > Branches > Default branch > 改為 main
```

### Q2: 忘記添加 chat-history？
```bash
# 添加 chat history
git add hw3/chat-history

# Commit
git commit -m "Add chat history"

# Push
git push
```

### Q3: 不小心 commit 了 node_modules？
```bash
# 從 git 移除但保留本地檔案
git rm -r --cached hw3/node_modules

# 確認 .gitignore 有 node_modules
echo "node_modules" >> hw3/.gitignore

# Commit
git commit -m "Remove node_modules from git tracking"

# Push
git push
```

### Q4: Commit 訊息寫錯了？
```bash
# 修改最後一次 commit 訊息（還沒 push）
git commit --amend -m "新的 commit 訊息"

# 如果已經 push，需要 force push（小心使用）
git push --force
```

### Q5: 檔案太大無法 push？
```bash
# 檢查哪些檔案太大
find hw3 -type f -size +50M

# 移除大檔案並加入 .gitignore
git rm --cached hw3/path/to/large/file
echo "path/to/large/file" >> hw3/.gitignore

# Commit 並 push
git commit -m "Remove large files"
git push
```

---

## 📋 最終檢查清單

### 在 push 之前

- [ ] `npm run dev` 可以正常執行
- [ ] `npm run build` 可以正常編譯
- [ ] `npm run lint` 無錯誤
- [ ] README.md 說明完整
- [ ] chat-history 資料夾有 .md 檔案
- [ ] .gitignore 設定正確
- [ ] 無 node_modules、dist 在 git 中
- [ ] 無大型多媒體檔案
- [ ] 所有程式碼都已 commit

### 在 push 之後

- [ ] GitHub repo 上看到 hw3 資料夾
- [ ] README.md 正確顯示
- [ ] 檔案結構完整
- [ ] 預設 branch 是 main
- [ ] Commit 訊息清楚

---

## 🎯 快速執行命令

### 一鍵檢查和提交（謹慎使用）
```bash
#!/bin/bash
# 切換到 wp1141 目錄
cd /Users/joy.lin/Desktop/wp1141

# 確認在 main branch
git checkout main

# 檢查狀態
echo "=== Git Status ==="
git status

# 添加 hw3
echo "=== Adding hw3 ==="
git add hw3

# 顯示要 commit 的檔案
echo "=== Files to be committed ==="
git status

# 等待確認
read -p "按 Enter 繼續 commit，或 Ctrl+C 取消..."

# Commit
git commit -m "Add hw3: 購物網站 (React + TypeScript + Ant Design)"

# Push
echo "=== Pushing to GitHub ==="
git push origin main

echo "=== 完成！ ==="
echo "請前往 GitHub 確認：https://github.com/<your-username>/wp1141"
```

---

## 📞 需要幫助？

### 檢查項目
1. **README.md 完整性** ✅ 已完成
2. **Chat history** ⚠️ 請手動下載並放置
3. **.gitignore** ✅ 已設定
4. **程式碼品質** ✅ 無錯誤
5. **Git 提交** ⚠️ 請依照上述步驟執行

### 文檔參考
- [README.md](./README.md) - 主要說明文檔
- [SETUP.md](./SETUP.md) - 快速開始指南
- [FIXES.md](./FIXES.md) - 問題修復說明

---

**準備好了嗎？開始提交吧！** 🚀

記得：**不接受遲交！** ⏰



