# 🚀 Vercel 部署指南

Next.js 全栈项目部署到 Vercel 非常简单，因为前后端都在同一个项目中！

## 📋 部署前准备

### 1. 确保代码已推送到 GitHub

```bash
cd final-project
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

### 2. 准备环境变量

在 Vercel 部署时需要设置以下环境变量：

- `DATABASE_URL` - MongoDB 连接字符串
- `JWT_SECRET` - JWT 密钥（用于用户认证）
- `LLM_API_KEY` - Groq API Key（用于 AI 功能）
- `LLM_API_BASE` - Groq API 基础 URL（可选，默认：`https://api.groq.com/openai/v1`）
- `GOOGLE_MAPS_API_KEY` - Google Maps API Key（用于地图和路线优化）

## 🚀 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [https://vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库 `wilsonfu944/wp1141`
   - **重要：设置 Root Directory 为 `final-project`**
     - 在 "Configure Project" 页面
     - 找到 "Root Directory" 设置
     - 点击 "Edit"
     - 输入 `final-project`
     - 点击 "Save"

3. **配置环境变量**
   - 在 "Environment Variables" 部分添加：
     ```
     DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
     JWT_SECRET=your-secret-key-here
     LLM_API_KEY=your-groq-api-key
     LLM_API_BASE=https://api.groq.com/openai/v1
     GOOGLE_MAPS_API_KEY=your-google-maps-api-key
     ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 2-5 分钟）

### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **在项目目录中部署**
   ```bash
   cd final-project
   vercel
   ```

4. **设置环境变量**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add LLM_API_KEY
   vercel env add GOOGLE_MAPS_API_KEY
   ```

5. **生产环境部署**
   ```bash
   vercel --prod
   ```

## ⚙️ 重要配置

### Root Directory 设置

**必须设置 Root Directory 为 `final-project`**，因为：
- 你的项目在 `final-project/` 目录下
- Vercel 需要知道在哪里找到 `package.json` 和 `next.config.ts`

设置方法：
1. 在 Vercel Dashboard → Project Settings → General
2. 找到 "Root Directory"
3. 设置为 `final-project`

### 构建配置

Vercel 会自动检测 Next.js 项目，但你可以手动设置：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`（自动）
- **Output Directory**: `.next`（自动）
- **Install Command**: `npm install`（自动）

### Prisma 配置

项目已配置 `postinstall` 脚本自动生成 Prisma Client：

```json
"postinstall": "prisma generate"
```

Vercel 在安装依赖时会自动运行此脚本，无需额外配置。

## 🔍 验证部署

部署完成后，访问你的 Vercel URL（例如：`https://your-project.vercel.app`）

### 检查 API 是否正常

访问健康检查端点：
```
https://your-project.vercel.app/api/health
```

应该返回：
```json
{
  "status": "ok",
  "message": "AniMap API is running"
}
```

### 检查前端是否正常

访问首页：
```
https://your-project.vercel.app
```

## 🐛 常见问题

### 1. 构建失败：找不到 Prisma Client

**解决方案**：
- 确保 `package.json` 中有 `postinstall` 脚本
- 检查 `DATABASE_URL` 环境变量是否正确设置

### 2. API 返回 404

**解决方案**：
- 确保 Root Directory 设置为 `final-project`
- 检查 API 路由文件是否在 `app/api/` 目录下
- 确保文件名为 `route.ts`

### 3. 数据库连接失败

**解决方案**：
- 检查 `DATABASE_URL` 格式是否正确
- MongoDB Atlas 需要允许 Vercel 的 IP 地址（或设置为允许所有 IP）
- 确保 MongoDB 连接字符串包含 `retryWrites=true&w=majority`

### 4. 环境变量未生效

**解决方案**：
- 在 Vercel Dashboard 中重新设置环境变量
- 重新部署项目（环境变量更改后需要重新部署）

## 📝 部署后步骤

1. **测试所有功能**
   - 用户注册/登录
   - API 端点
   - 数据库操作

2. **设置自定义域名**（可选）
   - Vercel Dashboard → Settings → Domains
   - 添加你的域名

3. **配置环境变量**
   - 确保生产环境的所有环境变量都已设置
   - 检查敏感信息是否安全

## 🎉 完成！

部署成功后，你的 Next.js 全栈应用就可以通过 Vercel URL 访问了！

前后端都在同一个项目中，无需分开部署，非常方便！

