# Vercel 配置修正

## 問題

錯誤訊息：
```
Error: The pattern "api/index.py" defined in `functions` doesn't match any Serverless Functions inside the `api` directory.
```

## 解決方案

### 方法一：使用 builds（推薦）

使用 `builds` 屬性明確指定使用 `@vercel/python`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.py"
    }
  ]
}
```

### 方法二：簡化配置（如果方法一不行）

如果還是有問題，可以嘗試更簡單的配置：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

## 重要檢查

1. **確認 api/index.py 存在**
   ```bash
   ls -la api/index.py
   ```

2. **確認檔案內容正確**
   - 必須有 `from app import app`
   - 必須導出 `app` 物件

3. **確認專案結構**
   ```
   My HW6/
   ├── api/
   │   └── index.py    ✅ 必須存在
   ├── app.py
   ├── vercel.json
   └── ...
   ```

## 如果還是有問題

嘗試將所有路由都指向同一個函數：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

注意：`dest` 路徑不要有前導斜線 `/api/index.py`，改為 `api/index.py`。


