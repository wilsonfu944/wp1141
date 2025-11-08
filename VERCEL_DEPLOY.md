# Vercel 部署指南

## 📋 部署前准备清单

### 1. 确保代码已推送到 GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. 更新 OAuth 回调 URL

#### Google OAuth
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择你的项目
3. 进入「API 和服務」>「憑證」
4. 编辑你的 OAuth 2.0 客户端 ID
5. 在「授權的重新導向 URI」中添加：
   ```
   https://your-project.vercel.app/api/auth/callback/google
   ```

#### GitHub OAuth
1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 选择你的 OAuth App
3. 更新「Authorization callback URL」为：
   ```
   https://your-project.vercel.app/api/auth/callback/github
   ```

## 🚀 部署步骤

### 方法 1: 通过 Vercel Dashboard

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: Next.js（会自动检测）
   - Root Directory: `./`（默认）
   - Build Command: `npm run build`（默认）
   - Output Directory: `.next`（默认）

4. **设置环境变量**
   在 "Environment Variables" 中添加以下变量：

   ```env
   # OAuth - Google
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # OAuth - GitHub
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # Pusher
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster

   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth (重要！)
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXTAUTH_SECRET=your_random_secret_key_min_32_chars
   ```

   **⚠️ 重要提示：**
   - `NEXTAUTH_URL` 必须设置为你的 Vercel 部署 URL
   - `NEXTAUTH_SECRET` 可以使用以下命令生成：
     ```bash
     openssl rand -base64 32
     ```
   - 所有环境变量都需要在 Vercel 中设置（包括 `NEXT_PUBLIC_*` 变量）

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成

### 方法 2: 通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **设置环境变量**
   ```bash
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add GITHUB_CLIENT_ID
   vercel env add GITHUB_CLIENT_SECRET
   vercel env add PUSHER_APP_ID
   vercel env add PUSHER_KEY
   vercel env add PUSHER_SECRET
   vercel env add PUSHER_CLUSTER
   vercel env add NEXT_PUBLIC_PUSHER_KEY
   vercel env add NEXT_PUBLIC_PUSHER_CLUSTER
   vercel env add MONGODB_URI
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   ```

5. **生产环境部署**
   ```bash
   vercel --prod
   ```

## ⚙️ 部署后配置

### 1. 更新 NEXTAUTH_URL
部署完成后，Vercel 会给你一个 URL（例如：`https://your-project.vercel.app`）

1. 在 Vercel Dashboard 中进入项目设置
2. 进入 "Environment Variables"
3. 更新 `NEXTAUTH_URL` 为你的实际 Vercel URL
4. 重新部署（或等待自动重新部署）

### 2. 验证环境变量
确保所有环境变量都已正确设置：
- ✅ 所有 OAuth 凭据
- ✅ MongoDB 连接字符串
- ✅ Pusher 配置
- ✅ NextAuth URL 和 Secret

### 3. 测试部署
访问你的 Vercel URL 并测试：
- [ ] 首页加载正常
- [ ] 登录功能正常
- [ ] OAuth 回调正常
- [ ] 数据库连接正常
- [ ] Pusher 实时功能正常

## 🔧 常见问题

### 问题 1: OAuth 回调失败
**解决方案：**
- 确保在 Google/GitHub OAuth 设置中添加了正确的回调 URL
- 确保 `NEXTAUTH_URL` 环境变量设置为你的 Vercel URL

### 问题 2: 数据库连接失败
**解决方案：**
- 检查 MongoDB Atlas 的 IP 白名单（需要添加 Vercel 的 IP 或允许所有 IP）
- 确保 MongoDB 连接字符串正确

### 问题 3: 环境变量未生效
**解决方案：**
- 确保在 Vercel Dashboard 中设置了所有环境变量
- 重新部署项目
- 检查变量名是否正确（区分大小写）

### 问题 4: 构建失败
**解决方案：**
- 检查 `package.json` 中的构建脚本
- 确保所有依赖都已正确安装
- 查看 Vercel 构建日志中的错误信息

## 📝 环境变量清单

部署前，确保以下环境变量都已设置：

- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GITHUB_CLIENT_ID`
- [ ] `GITHUB_CLIENT_SECRET`
- [ ] `PUSHER_APP_ID`
- [ ] `PUSHER_KEY`
- [ ] `PUSHER_SECRET`
- [ ] `PUSHER_CLUSTER`
- [ ] `NEXT_PUBLIC_PUSHER_KEY`
- [ ] `NEXT_PUBLIC_PUSHER_CLUSTER`
- [ ] `MONGODB_URI`
- [ ] `NEXTAUTH_URL` (部署后更新为 Vercel URL)
- [ ] `NEXTAUTH_SECRET`

## 🎯 最佳实践

1. **使用环境变量**
   - 不要将敏感信息提交到 Git
   - 使用 Vercel 的环境变量功能

2. **监控部署**
   - 定期检查 Vercel 部署日志
   - 设置错误监控（可选）

3. **测试生产环境**
   - 部署后立即测试所有功能
   - 确保 OAuth 回调正常工作

4. **备份配置**
   - 保存所有环境变量的副本
   - 记录 OAuth 回调 URL 配置

## 🔗 有用的链接

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [NextAuth.js 部署文档](https://next-auth.js.org/configuration/options#nextauth_url)
- [MongoDB Atlas 网络访问](https://docs.atlas.mongodb.com/security/ip-access-list/)

