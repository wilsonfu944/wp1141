# Google OAuth 設定指南

## 問題：存取權被封鎖

這個問題通常是因為 Google OAuth 應用程式設定不正確。請按照以下步驟修正：

## 解決步驟

### 1. 前往 Google Cloud Console

訪問：https://console.cloud.google.com/

### 2. 選擇或建立專案

- 選擇你的專案（或建立新專案）
- 專案名稱：MySocialMedia（或你喜歡的名稱）

### 3. 啟用 Google+ API

1. 在左側選單選擇「API 和服務」>「程式庫」
2. 搜尋「Google+ API」或「Google Identity」
3. 點擊「啟用」

### 4. 設定 OAuth 同意畫面

1. 前往「API 和服務」>「OAuth 同意畫面」
2. 選擇「外部」（如果是個人專案）
3. 填寫必要資訊：
   - 應用程式名稱：MySocialMedia
   - 使用者支援電子郵件：你的電子郵件
   - 開發人員連絡資訊：你的電子郵件
4. 點擊「儲存並繼續」
5. 在「範圍」頁面，直接點擊「儲存並繼續」
6. 在「測試使用者」頁面：
   - **重要**：新增你要用來測試的 Google 帳號
   - 點擊「新增使用者」
   - 輸入你的 Google 電子郵件
   - 點擊「新增」
7. 點擊「儲存並繼續」完成設定

### 5. 建立 OAuth 2.0 憑證

1. 前往「API 和服務」>「憑證」
2. 點擊「建立憑證」>「OAuth 用戶端 ID」
3. 如果提示設定 OAuth 同意畫面，請先完成步驟 4
4. 應用程式類型：選擇「網頁應用程式」
5. 名稱：MySocialMedia Web Client
6. **授權的重新導向 URI**（非常重要！）：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   如果之後要部署到 Vercel，也要新增：
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
7. 點擊「建立」
8. 複製「用戶端 ID」和「用戶端密鑰」

### 6. 更新環境變數

將複製的憑證更新到 `.env.local`：

```env
GOOGLE_CLIENT_ID=你的用戶端ID
GOOGLE_CLIENT_SECRET=你的用戶端密鑰
```

### 7. 重新啟動開發伺服器

```bash
# 停止目前的伺服器 (Ctrl+C)
# 然後重新啟動
npm run dev
```

## 常見問題

### Q: 還是顯示「存取權被封鎖」？

**A: 檢查以下幾點：**

1. **測試使用者設定**：
   - 確保你的 Google 帳號已加入「測試使用者」列表
   - 如果應用程式在測試模式，只有測試使用者可以登入

2. **重定向 URI 必須完全匹配**：
   - 必須是：`http://localhost:3000/api/auth/callback/google`
   - 不能有尾隨斜線
   - 必須使用 http（本地開發）或 https（生產環境）

3. **應用程式狀態**：
   - 如果應用程式在「測試」模式，只有測試使用者可以登入
   - 要讓所有人使用，需要提交應用程式進行驗證（但個人專案通常不需要）

### Q: 如何讓應用程式公開使用？

**A: 發布應用程式：**

1. 前往「OAuth 同意畫面」
2. 點擊「發布應用程式」
3. 確認警告訊息
4. 發布後，任何人都可以使用（但仍需要正確的重定向 URI）

### Q: 本地開發和生產環境都需要設定嗎？

**A: 是的，需要分別設定：**

- **本地開發**：`http://localhost:3000/api/auth/callback/google`
- **Vercel 部署**：`https://your-app.vercel.app/api/auth/callback/google`

可以在同一個 OAuth 用戶端 ID 中新增多個重定向 URI。

## 驗證設定

完成設定後，嘗試以下步驟：

1. 清除瀏覽器快取和 Cookie
2. 重新訪問 `http://localhost:3000/auth/signin`
3. 點擊「使用 Google 登入」
4. 應該會看到 Google 登入畫面
5. 登入後應該會重定向回你的應用程式

## 需要幫助？

如果問題仍然存在，請檢查：
- Google Cloud Console 中的錯誤訊息
- 瀏覽器開發者工具中的 Console 和 Network 標籤
- Next.js 終端機中的錯誤訊息

