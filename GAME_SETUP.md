# 動漫知識王實時對戰系統 - 設置說明

## 功能特色

- ✅ 1v1 實時對戰（WebSocket）
- ✅ 10秒超時自動匹配AI對手
- ✅ 速度加權評分系統（第1秒1000分，第9秒200分）
- ✅ 雙殺機制（雙方都答對時，速度快的一方+50分）
- ✅ 排位賽系統（銅牌→銀牌→金牌→白金→鑽石→大師）
- ✅ 單人練習模式（保留原有功能）

## 運行方式

### 開發環境

由於需要WebSocket支持，需要使用自定義服務器：

```bash
# 安裝依賴（如果還沒安裝）
npm install

# 使用 tsx 運行（支持TypeScript）
npx tsx server.js

# 或者編譯後運行
npm run build
node server.js
```

### 生產環境

1. 編譯TypeScript文件
2. 運行 `node server.js`

## 環境變量

確保 `.env.local` 包含：

```
MONGODB_URI=your-mongodb-uri
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## 使用說明

1. 訪問 `/quiz` 頁面
2. 選擇「1v1 實時對戰」
3. 點擊「隨機配對」
4. 等待10秒，如果沒有真人對手，會自動匹配AI
5. 開始對戰！

## 注意事項

- WebSocket服務器需要單獨運行（通過server.js）
- 確保MongoDB連接正常
- AI難度會根據玩家排位自動調整

