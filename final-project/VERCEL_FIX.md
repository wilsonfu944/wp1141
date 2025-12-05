# 🔧 修复 Vercel DNS_PROBE_FINISHED_NXDOMAIN 错误

## 问题原因

`DNS_PROBE_FINISHED_NXDOMAIN` 错误通常表示：
1. **Root Directory 未正确设置** - Vercel 找不到项目文件
2. **部署失败** - 构建过程中出错
3. **项目未正确连接** - GitHub 仓库连接有问题

## ✅ 解决步骤

### 1. 检查 Vercel Dashboard

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目 `wp1141`
3. 点击项目进入详情页

### 2. 检查 Root Directory 设置（最重要！）

1. 进入 **Settings** → **General**
2. 找到 **Root Directory** 设置
3. **必须设置为 `final-project`**
   - 如果显示为空或 `.`，点击 **Edit**
   - 输入 `final-project`
   - 点击 **Save**

### 3. 检查部署状态

1. 进入 **Deployments** 标签
2. 查看最新的部署状态：
   - ✅ **Ready** - 部署成功
   - ⏳ **Building** - 正在构建
   - ❌ **Error** - 构建失败（点击查看错误详情）

### 4. 如果部署失败

#### 检查构建日志：
1. 点击失败的部署
2. 查看 **Build Logs**
3. 常见错误：
   - `Cannot find module` - 可能是 Root Directory 设置错误
   - `Prisma Client not found` - 需要设置环境变量 `DATABASE_URL`
   - `Build failed` - 检查 `package.json` 和依赖

#### 重新部署：
1. 在 **Deployments** 页面
2. 点击 **Redeploy** 按钮
3. 选择最新的 commit
4. 点击 **Redeploy**

### 5. 检查环境变量

1. 进入 **Settings** → **Environment Variables**
2. 确保以下变量已设置：
   ```
   DATABASE_URL
   JWT_SECRET
   LLM_API_KEY (可选)
   GOOGLE_MAPS_API_KEY (可选)
   ```
3. 如果缺少，添加后需要 **重新部署**

### 6. 验证部署

部署成功后，你应该能看到：
- ✅ 部署状态为 **Ready**
- ✅ 有一个绿色的 URL（例如：`https://wp1141-xxx.vercel.app`）

访问这个 URL 应该能正常打开网站。

## 🚨 如果仍然无法访问

### 方法 1：删除并重新导入项目

1. 在 Vercel Dashboard 中删除当前项目
2. 点击 **Add New Project**
3. 选择仓库 `wilsonfu944/wp1141`
4. **立即设置 Root Directory 为 `final-project`**
5. 配置环境变量
6. 点击 **Deploy**

### 方法 2：使用 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 进入项目目录
cd final-project

# 部署
vercel --prod
```

### 方法 3：检查 GitHub 仓库

确保：
- 代码已推送到 GitHub
- 仓库是公开的（或 Vercel 有访问权限）
- 分支名称是 `main`

## 📝 快速检查清单

- [ ] Root Directory 设置为 `final-project`
- [ ] 部署状态为 **Ready**（不是 Error）
- [ ] 环境变量已正确设置
- [ ] 代码已推送到 GitHub
- [ ] 访问的 URL 是正确的（从 Vercel Dashboard 复制）

## 💡 常见错误和解决方案

### 错误：`Cannot find module '@prisma/client'`
**解决**：确保 `DATABASE_URL` 环境变量已设置，Vercel 会自动运行 `postinstall` 脚本生成 Prisma Client

### 错误：`Build failed: Command 'npm run build' exited with 1`
**解决**：检查构建日志，通常是 TypeScript 错误或缺少依赖

### 错误：`404 Not Found`（部署成功但页面 404）
**解决**：检查 Root Directory 设置，应该是 `final-project`

## 🎯 正确的项目结构

Vercel 应该看到这样的结构：
```
final-project/
├── app/
├── components/
├── lib/
├── package.json
├── next.config.ts
└── vercel.json
```

如果 Root Directory 设置错误，Vercel 会在错误的目录查找这些文件，导致部署失败。

## 📞 需要帮助？

如果以上步骤都无法解决问题，请：
1. 截图 Vercel Dashboard 的部署日志
2. 截图 Settings → General 页面（显示 Root Directory）
3. 检查 GitHub 仓库是否正确连接

