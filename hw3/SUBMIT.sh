#!/bin/bash

# 作業繳交腳本
# 使用方法: bash SUBMIT.sh

echo "========================================"
echo "  WP1141 HW3 作業繳交前檢查"
echo "========================================"
echo ""

# 切換到 wp1141 目錄
cd /Users/joy.lin/Desktop/wp1141

# 檢查當前 branch
echo "📌 檢查 Git Branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "   當前 branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "   ⚠️  警告：當前不在 main branch！"
    read -p "   是否切換到 main branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    else
        echo "   ❌ 取消提交"
        exit 1
    fi
fi

echo "   ✅ 在 main branch"
echo ""

# 檢查 hw3 資料夾
echo "📂 檢查 hw3 資料夾..."
if [ ! -d "hw3" ]; then
    echo "   ❌ 找不到 hw3 資料夾！"
    exit 1
fi
echo "   ✅ hw3 資料夾存在"
echo ""

# 檢查 node_modules
echo "🔍 檢查是否包含不該提交的檔案..."
if [ -d "hw3/node_modules" ]; then
    echo "   ⚠️  發現 node_modules 資料夾"
    if grep -q "node_modules" hw3/.gitignore 2>/dev/null; then
        echo "   ✅ .gitignore 已設定 node_modules"
    else
        echo "   ❌ .gitignore 未設定 node_modules！"
        exit 1
    fi
fi

if [ -d "hw3/dist" ]; then
    echo "   ⚠️  發現 dist 資料夾"
    if grep -q "dist" hw3/.gitignore 2>/dev/null; then
        echo "   ✅ .gitignore 已設定 dist"
    else
        echo "   ❌ .gitignore 未設定 dist！"
        exit 1
    fi
fi

echo "   ✅ 無不該提交的檔案"
echo ""

# 檢查 README.md
echo "📖 檢查 README.md..."
if [ ! -f "hw3/README.md" ]; then
    echo "   ❌ 找不到 README.md！"
    exit 1
fi
README_SIZE=$(wc -c < hw3/README.md)
echo "   ✅ README.md 存在 ($README_SIZE bytes)"
echo ""

# 檢查 chat-history
echo "💬 檢查 Chat History..."
if [ ! -d "hw3/chat-history" ]; then
    echo "   ⚠️  找不到 chat-history 資料夾"
    read -p "   是否繼續? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    CHAT_COUNT=$(find hw3/chat-history -name "*.md" -type f | wc -l)
    if [ $CHAT_COUNT -eq 0 ]; then
        echo "   ⚠️  chat-history 資料夾是空的！"
        read -p "   是否繼續? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "   ✅ 找到 $CHAT_COUNT 個 chat history 檔案"
        
        # 檢查檔案大小
        CHAT_SIZE=$(du -sk hw3/chat-history | cut -f1)
        if [ $CHAT_SIZE -gt 100 ]; then
            echo "   ⚠️  Chat history 總大小: ${CHAT_SIZE}KB (超過 100KB)"
            echo "   建議處理檔案只保留 prompts"
            read -p "   是否仍要繼續? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        else
            echo "   ✅ Chat history 大小: ${CHAT_SIZE}KB"
        fi
    fi
fi
echo ""

# 顯示將要提交的檔案
echo "📋 將要提交的檔案："
git status hw3 --short 2>/dev/null || git status hw3

echo ""
echo "========================================"
read -p "確認要提交嗎? (y/n) " -n 1 -r
echo ""
echo "========================================"
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消提交"
    exit 1
fi

# 添加檔案
echo "➕ 添加 hw3 到 Git..."
git add hw3

# Commit
echo "💾 Commit..."
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

# Push
echo "🚀 Push 到 GitHub..."
git push origin main

echo ""
echo "========================================"
echo "  ✅ 提交完成！"
echo "========================================"
echo ""
echo "請前往 GitHub 確認："
echo "https://github.com/<your-username>/wp1141"
echo ""
echo "檢查項目："
echo "  □ hw3 資料夾已上傳"
echo "  □ README.md 正確顯示"
echo "  □ 檔案結構完整"
echo "  □ 預設 branch 是 main"
echo ""



