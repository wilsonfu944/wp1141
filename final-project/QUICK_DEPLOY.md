# ⚡ 快速部署到 Vercel

## 🎯 3 步完成部署

### 1️⃣ 推送到 GitHub（如果还没推送）

```bash
cd final-project
git add .
git commit -m "准备部署"
git push origin main
```

### 2️⃣ 在 Vercel 导入项目

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **"Add New Project"**
3. 选择仓库 `wilsonfu944/wp1141`
4. **⚠️ 重要：设置 Root Directory**
   - 在配置页面找到 "Root Directory"
   - 点击 "Edit" → 输入 `final-project` → "Save"

### 3️⃣ 配置环境变量并部署

在 "Environment Variables" 添加：

```
DATABASE_URL = mongodb+srv://你的连接字符串
JWT_SECRET = 你的密钥
LLM_API_KEY = 你的 Groq API Key
GOOGLE_MAPS_API_KEY = 你的 Google Maps API Key
```

然后点击 **"Deploy"** 即可！

## ✅ 部署完成

部署成功后，你会得到一个 URL，例如：
- `https://your-project.vercel.app`

访问 `/api/health` 检查 API 是否正常：
```
https://your-project.vercel.app/api/health
```

## 🔧 如果遇到问题

查看详细指南：[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

