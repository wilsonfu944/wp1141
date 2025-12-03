# 作業設計與實作要求
_Exported on 2025/10/12 at 17:40:49 [GMT+8] from Cursor (1.5.11)_

---

**User**

請先不要實作，先看我的作業說明．## 題目說明

- 本次作業是希望你練習從一個 data source (i.e. one more multiple spreadsheet(s)) 以及使用 AI coding tool (i.e. Cursor) 來打造一個純前端的網路服務。
- 題目可以自訂，但整個服務應該要有 “**項目瀏覽**”，“**選取至某個容器** (到購物車、行事曆等)”，”**送出記錄**” 等階段。
- 在「**項目瀏覽**」方面，你的設計可以是分類瀏覽、關鍵字/條件搜尋… 檔，總之，請從服務設計的角度出發，設計出一個可以讓使用者輕鬆找到自己想要的項目。
    - 每個項目在展示時應該要提供足夠、有幫助、但也不要過多的資訊說明，以利使用者做決定
    - 如有需要，可以在項目上加上一些互動，以利使用者瀏覽更詳細的資訊，甚至做比較
- 在「**選取至某個容器**」方面，請從從服設計的角度出發，設計一個讓使用者方便理解、做決定的 UI/UX (e.g. 選課系統的課表, 電商系統的購物車, 等)
    - 與下一步 “送出記錄” 的區別是，在這一步像是在 git 裡頭的 “staging”, 也就是說，使用者還在 shop around, 這個容器應該要讓他無負擔的可以隨時增減、修改
    - 歡迎做出一些有利於使用者作出決定的設計
- 在「**送出記錄**」方面，表示使用者已經做好決定，正式把它送出。Again, 請從服務設計的角度思考，定義出這個步驟與上一個步驟的差別，例如：選課系統裡頭的確定選課、電商系統的送出訂單等。
    - 記錄一但送出，如果使用者如要修改，請你依照你想像中的服務邏輯，either 是不可以修改，或者是要走過一個跟上述課表/購物車不一樣的流程，已表示這個送出記錄不同的意義
    - 在一個完整的服務，這個步驟應該是要把記錄送到伺服器，存在使用者的個人資料裡頭。但我們這次還是純前端的 app, 所以你還是可以使用一個 component/state 存這個記錄就好
    - 因為是純前端，所以你也不用做到最後的金流、會員系統等。請自行設計一個合理的 ending 即可
- 這個服務不需要有 “使用者 ID” 或者是 “登入” 的設計
- 當然，你的服務的最佳設計很可能不一定符合 “**項目瀏覽**”，“**選取至某個容器** (到購物車、行事曆等)”，”**送出記錄**” 等三個階段，所以這邊可以有彈性，但我們期待你的設計是以讓使用者覺得容易理解資訊、做出選擇為原則。
- 如果你想要做一個 **台大的選課服務 app**，我們提供了以前 (100 學年度下學期) 全校的課表供你參考，可以從[這裡下載 (NTU COOL)](https://cool.ntu.edu.tw/files/8238955)。
- 如果你想做其他的服務，例如：購物網站、dating app 等，而如果你沒有合理合法的 data source, 你可以請 AI (e.g. in Cursor) 幫你生成。無論如何，請不要直接拿上課示範的 restaurant-app 的 dish-data.csv 來使用 (i.e. 即使你還是想要做一個點餐系統，請自行產生別的 spreadsheet)。

## 基本要求

- 除了上述題目說明的要求/規定事項之外，請達成底下基本。
- 程式語言除了必要的 HTML, CSS 之外，動態網頁的部分規定使用 React.ts (i.e. TypeScript 版本的 React)，而不是 pure JavaScript or React.js。
- UI 的部分請使用現成的框架 (i.e. 不要只是使用 pure CSS)，你可以選擇課堂上有教過的 MaterialUI, Ant Design, Shadcn, TailwindCSS (with cn), 或者是任何你喜歡的框架。
- Spreadsheet 原始應為一個或者是多個 .csv 檔案，存放在 hw3/src/public/data 底下。你的服務應該要做到當使用者編輯/更改 .csv 檔案，更新到你的 repo 以後，你的服務應該會自動更新 (either hot reload, or restart app)，不需要改動其他的程式碼
- 你的服務如果需要多媒體檔案 (e.g. 圖檔、音檔、影像檔等)，除非數量與 size 很小，否則請不要上傳到 GitHub repo. Instead, 你應該要把它們放到雲端的空間，然後讓你的 app 可以在執行的時候去抓取檔案即可 (i.e. 把連結放在 code 裡面)
- 請 (指揮 AI) 適時地將你的 code refactoring. 例如，不要把產生畫面與操作資料的邏輯混再一起，應該要把 code 分成 hooks, components 等，以利閱讀與維護
- 如果有多個 components 需要 access 同樣的一些資料，請把他們放到 context 底下，以利管理
- 由於 app 越來越複雜，你的 Cursor 對話記錄很可能會變得太大 — 我們的初衷是希望同學們可以分享如何 “vibe” code 你的作業，因此，請留下你的 prompt 部分就好，不用把 Cursor 的回應細節也傳上來
    - 你可以將 Cursor chat history 的 .md 檔交給 cursor 處理，請他把 prompts 留下來就好
- 雖然不會算在檢查的項目裡頭，但請務必養成開 branches, 打 tags, 常常 add/commit 的習慣，以利你如果需要 backtrack/undo 到某個 historical point, 你的 code 還是救得回來
- 請務必建立 .gitignore 檔案，把例如 node_moddules 等不必要的檔案擋住，不要上傳到 GitHub
- 除了 Cursor 產生的 README 之外, 請務必在上傳作業前仔細的看過你的 README — 是否有把如何安裝、執行你的 app 有寫清楚？如果因故造成 reviewer 有評分的困難，需要動用到 TA 的協助，將會有一定程度的扣分．

---

**User**

請幫我建立一個基於 React + TypeScript 的購物網站專案，使用 Vite 作為建置工具。

專案要求：
1. 使用 React 18 + TypeScript
2. UI 框架使用 Ant Design
3. 狀態管理使用 React Context
4. 樣式使用 CSS Modules
5. 資料來源為 public/data 目錄下的 CSV 檔案

請建立以下目錄結構：
src/
├── components/     # 可重複使用的組件
├── contexts/       # React Context
├── hooks/          # 自定義 Hook
├── types/          # TypeScript 類型定義
├── utils/          # 工具函數
├── pages/          # 頁面組件
└── styles/         # 樣式檔案

請先建立基礎的專案配置檔案：
- package.json 包含必要依賴
- tsconfig.json
- vite.config.ts
- 基本的 App.tsx 和 main.tsx

同時請建立以下基礎組件框架：
- Header 組件（包含導航、搜尋、購物車圖標）
- ProductCard 組件（商品卡片）
- ShoppingCart 組件（購物車側邊欄）

請使用 TypeScript 嚴格模式，並為每個組件定義清晰的 props 接口。

---

**User**

請為購物網站生成 100 筆真實的商品資料，儲存為 CSV 格式。

商品資料應包含以下欄位：
id,name,category,price,stock,description,image_url,brand,rating,features,created_date

類別分布：
- 電子產品 (30%)
- 服飾配件 (25%) 
- 家居生活 (20%)
- 美妝保養 (15%)
- 圖書文具 (10%)

資料要求：
1. 價格範圍：100～20000 元
2. 庫存數量：0～200
3. 評分：1.0～5.0（小數點後一位）
4. 品牌：真實存在的品牌名稱
5. 圖片 URL：使用真實的圖片連結（如 unsplash、picsum 等）
6. 特徵：用斜線分隔的多個特徵，如 "防水/藍牙5.0/降噪"
7. 描述：詳細的商品描述，至少 20 字
8. 建立日期：最近一年的隨機日期

請確保資料多樣性，包含熱門商品和利基商品，部分商品庫存為 0 模擬缺貨狀態。

生成後請將資料儲存為：public/data/products.csv
並同時建立對應的 TypeScript 類型定義。

---

**User**

請為購物網站建立完整的 TypeScript 類型定義和狀態管理 Context。

需要的類型定義：
1. Product - 商品類型（對應 CSV 欄位）
2. CartItem - 購物車商品（包含商品資訊 + 數量）
3. FilterOptions - 篩選選項（分類、價格範圍、評分等）
4. Order - 訂單資訊

請建立以下 Context：
1. CartContext - 管理購物車狀態
   - 加入商品
   - 移除商品  
   - 更新數量
   - 清空購物車
   - 計算總價和總數量

2. ProductContext - 管理商品資料
   - 從 CSV 載入商品資料
   - 商品篩選和搜尋
   - 排序功能

功能要求：
- 購物車狀態需持久化到 localStorage
- 商品資料載入使用 useEffect 和 fetch
- 提供自定義 Hook：useCart, useProducts

請實現完整的 Context Provider 和對應的 reducer/state 邏輯。

---

**User**

請建立商品瀏覽頁面，包含以下功能：

1. 商品篩選側邊欄：
   - 分類篩選（電子產品、服飾配件等）
   - 價格範圍滑桿
   - 評分篩選（星等）
   - 品牌多選篩選
   - 庫存狀態篩選

2. 商品列表：
   - 網格布局顯示商品卡片
   - 每張卡片顯示：圖片、名稱、價格、評分、庫存狀態
   - 懸停效果顯示更多資訊
   - 加入購物車按鈕

3. 搜尋和排序：
   - 關鍵字搜尋（商品名稱、描述、品牌）
   - 排序選項（價格低到高、價格高到低、評分、新品優先）

4. 商品比較功能：
   - 可選取最多 3 個商品進行比較
   - 比較彈窗顯示規格對照表

請使用 Ant Design 的組件：
- Layout, Row, Col 進行布局
- Card 顯示商品
- Slider, Checkbox, Radio 進行篩選
- Input.Search 進行搜尋
- Select 進行排序

頁面需響應式設計，在手機上顯示單列，平板兩列，電腦四列。

---

**User**

請幫我修改以下兩問題
1. **搜尋欄位重複**：頁面中出現了兩個「搜尋商品...」的搜尋欄位，我只需要保留一個
2. **商品圖片與名稱不對應**：部分商品的圖片和名稱顯示不匹配
