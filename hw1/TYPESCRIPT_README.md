# TypeScript 跑步紀錄追蹤器

## 專案說明
這是一個使用 TypeScript 開發的純前端跑步紀錄追蹤網頁，包含完整的類型定義和現代 JavaScript 特性。

## 文件結構
```
running-tracker/
├── index.html          # HTML 主頁面
├── styles.css          # CSS 樣式文件
├── script.ts           # TypeScript 源代碼
├── script.js           # 編譯後的 JavaScript（自動生成）
├── tsconfig.json       # TypeScript 配置文件
├── package.json        # 專案依賴配置
├── compile.bat         # Windows 編譯腳本
└── TYPESCRIPT_README.md # 本說明文件
```

## TypeScript 特性

### 1. 類型定義
- `RunningRecord`: 跑步紀錄數據結構
- `ChartData`: 圖表數據類型
- `MoodOption`: 心情選項類型
- `Chart`: Chart.js 庫的類型聲明

### 2. 類別設計
- `RunningTracker`: 主要的跑步追蹤器類別
- 所有方法都有完整的類型註解
- 使用 `private` 修飾符保護內部方法

### 3. 類型安全
- DOM 元素操作使用類型斷言
- 函數參數和返回值都有明確類型
- 數組和物件操作都有類型檢查

## 編譯方法

### 方法一：使用編譯腳本（推薦）
1. 雙擊 `compile.bat` 文件
2. 腳本會自動檢查 TypeScript 編譯器
3. 編譯成功後會生成 `script.js`

### 方法二：手動編譯
1. 確保已安裝 Node.js 和 TypeScript
2. 在命令提示字元中執行：
   ```bash
   tsc script.ts --target ES2020 --module ES2020 --lib ES2020,DOM --outDir . --strict
   ```

### 方法三：使用 npm 腳本
1. 安裝依賴：`npm install`
2. 編譯：`npm run build`
3. 監聽模式：`npm run build:watch`

## 開發環境設置

### 1. 安裝 Node.js
- 下載：https://nodejs.org/
- 選擇 LTS 版本

### 2. 安裝 TypeScript
```bash
npm install -g typescript
```

### 3. 安裝專案依賴
```bash
npm install
```

## 功能特色

### 1. 跑步紀錄管理
- 新增、刪除跑步紀錄
- 心情選擇（5個等級）
- 數據持久化（localStorage）

### 2. 數據視覺化
- 距離變化折線圖
- 配速變化折線圖
- 月曆顯示跑步數據
- 圖表刻度優化（0.5間隔，密集顯示）

### 3. 互動功能
- 破紀錄恭喜動畫
- 彩帶效果
- 響應式設計
- 跑步經歷手動編輯

### 4. TypeScript 優勢
- 編譯時錯誤檢查
- 更好的 IDE 支持
- 重構更安全
- 代碼可讀性更高

## 使用說明

1. **開發時**：編輯 `script.ts` 文件
2. **編譯**：執行 `compile.bat` 或 `npm run build`
3. **測試**：打開 `index.html` 查看結果
4. **部署**：上傳所有文件到網頁伺服器

## 注意事項

- 瀏覽器無法直接執行 TypeScript，必須先編譯為 JavaScript
- 每次修改 `script.ts` 後都需要重新編譯
- 建議使用支援 TypeScript 的 IDE（如 VS Code）
- 編譯後的 `script.js` 會覆蓋原有文件

## 技術規格

- **TypeScript**: 5.0+
- **目標版本**: ES2020
- **圖表庫**: Chart.js
- **樣式**: CSS3 + Flexbox/Grid
- **數據存儲**: localStorage
- **響應式**: 支援行動裝置

## 授權
MIT License - 傅仲瑜
