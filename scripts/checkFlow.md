# 從主頁到動漫內頁的流程檢視

## 流程圖

```
1. 用戶訪問主頁 (/home)
   └─> HomePage 組件載入
       └─> 從 /api/anime 獲取動漫列表
           └─> 顯示動漫卡片

2. 用戶點擊動漫卡片
   └─> Link 組件導航到 /anime/[id]
       └─> app/anime/[id]/page.tsx 處理路由
           └─> 調用 AnimeDetailPage 組件
               └─> 傳入 animeId 參數

3. AnimeDetailPage 組件
   └─> useEffect 觸發
       └─> 並行請求：
           ├─> GET /api/anime/[id] (獲取動漫詳情)
           ├─> GET /api/comments?targetType=anime&targetId=[id] (獲取評論)
           ├─> GET /api/anime/[id]/rate (獲取用戶評分，如果已登入)
           └─> GET /api/user/profile (獲取用戶資料，如果已登入)

4. API 路由處理 (/api/anime/[id])
   └─> 解析 params.id
       └─> 驗證 ObjectId 格式
           └─> 連接 MongoDB
               └─> Anime.findById(id)
                   └─> 手動查詢 locations
                       └─> 返回 JSON 響應

5. 組件接收數據
   └─> 檢查 animeRes.ok
       └─> 如果成功：解析 JSON 並設置狀態
       └─> 如果失敗：顯示錯誤或"不存在"訊息
```

## 關鍵連結點

### 主頁連結
- **位置**: `final-project/components/HomePage.tsx` (如果使用) 或 `components/AnimeListPage.tsx`
- **連結方式**: `<Link href={`/anime/${anime._id}`}>`
- **觸發**: 點擊動漫卡片

### 路由處理
- **文件**: `app/anime/[id]/page.tsx`
- **功能**: 接收動態路由參數 `id`，傳遞給 `AnimeDetailPage` 組件

### 數據獲取
- **API 路由**: `app/api/anime/[id]/route.ts`
- **組件請求**: `components/AnimeDetailPage.tsx` 中的 `fetch('/api/anime/${animeId}')`

## 潛在問題點

1. **路由參數解析**: Next.js 15 需要 await params
2. **API 響應處理**: 需要檢查 `res.ok` 狀態
3. **數據序列化**: 確保所有字段都可以 JSON 序列化
4. **錯誤處理**: 需要適當的錯誤訊息和狀態碼

