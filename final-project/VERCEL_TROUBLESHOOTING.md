# 🔧 Vercel 部署失败排查指南

## 📋 常见部署失败原因

### 1. 构建错误（Build Error）

#### 检查方法：
在 Vercel Dashboard → Deployments → 点击失败的部署 → 查看 Build Logs

#### 常见错误：

**错误 1：`Cannot find module '@prisma/client'`**
```
原因：Prisma Client 未生成
解决：
1. 确保 DATABASE_URL 环境变量已设置
2. 检查 package.json 中的 postinstall 脚本：
   "postinstall": "prisma generate"
3. 如果还是失败，在 Vercel 设置中添加 Build Command：
   npm install && npx prisma generate && npm run build
```

**错误 2：`TypeScript errors`**
```
原因：TypeScript 类型错误
解决：
1. 本地运行 npm run build 检查错误
2. 修复所有 TypeScript 错误
3. 确保 tsconfig.json 配置正确
```

**错误 3：`Module not found`**
```
原因：导入路径错误或依赖缺失
解决：
1. 检查所有 import 语句
2. 确保所有依赖都在 package.json 中
3. 检查路径别名 @/ 是否正确配置
```

### 2. 环境变量缺失

#### 必需的环境变量：
```
DATABASE_URL - MongoDB 连接字符串（必需）
JWT_SECRET - JWT 密钥（必需）
LLM_API_KEY - Groq API Key（可选）
GOOGLE_MAPS_API_KEY - Google Maps API Key（可选）
```

#### 检查方法：
1. Vercel Dashboard → Settings → Environment Variables
2. 确保所有变量都已设置
3. 确保变量应用到 Production 环境

### 3. Root Directory 设置错误

#### 检查方法：
1. Settings → General → Root Directory
2. 必须设置为：`final-project`
3. 不能是 `.` 或空

### 4. Prisma 相关问题

#### 问题：Prisma Client 生成失败

**解决方案 1：修改 Build Command**
在 Vercel Settings → General → Build & Development Settings：
```
Build Command: npm install && npx prisma generate && npm run build
```

**解决方案 2：确保 postinstall 脚本存在**
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**解决方案 3：检查 DATABASE_URL**
- 确保 DATABASE_URL 格式正确
- MongoDB Atlas 连接字符串格式：
  ```
  mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
  ```

### 5. 内存或超时问题

#### 问题：构建超时
**解决**：在 vercel.json 中增加超时时间：
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 6. 依赖安装失败

#### 问题：npm install 失败
**解决**：
1. 检查 package.json 中的依赖版本
2. 确保所有依赖都是有效的
3. 尝试清除 node_modules 和 package-lock.json 后重新安装

## 🔍 诊断步骤

### 步骤 1：查看构建日志
1. 登录 Vercel Dashboard
2. 进入项目 → Deployments
3. 点击失败的部署
4. 查看 Build Logs
5. 找到第一个错误信息

### 步骤 2：本地复现错误
```bash
cd final-project
npm install
npm run build
```
如果本地也失败，修复错误后再推送。

### 步骤 3：检查环境变量
```bash
# 在 Vercel Dashboard 中检查
Settings → Environment Variables
```
确保所有必需变量都已设置。

### 步骤 4：验证 Root Directory
```
Settings → General → Root Directory
应该显示：final-project
```

## 🛠️ 快速修复方案

### 方案 1：重新部署
1. Deployments → 点击失败的部署
2. 点击 "Redeploy"
3. 选择最新的 commit

### 方案 2：删除并重新导入
1. 删除当前 Vercel 项目
2. 重新导入 GitHub 仓库
3. **立即设置 Root Directory 为 `final-project`**
4. 配置环境变量
5. 部署

### 方案 3：使用 Vercel CLI
```bash
cd final-project
vercel --prod
```
这会显示详细的错误信息。

## 📝 检查清单

部署前检查：
- [ ] 本地 `npm run build` 成功
- [ ] 所有 TypeScript 错误已修复
- [ ] 所有环境变量已设置
- [ ] Root Directory 设置为 `final-project`
- [ ] package.json 中有 `postinstall` 脚本
- [ ] DATABASE_URL 格式正确
- [ ] 代码已推送到 GitHub

## 🚨 如果还是失败

1. **截图构建日志**：包含完整的错误信息
2. **检查本地构建**：运行 `npm run build` 看是否有错误
3. **查看 Vercel 文档**：https://vercel.com/docs

## 💡 常见错误信息对照表

| 错误信息 | 可能原因 | 解决方法 |
|---------|---------|---------|
| `Cannot find module` | 依赖缺失或路径错误 | 检查 import 和 package.json |
| `Prisma Client not found` | Prisma 未生成 | 设置 DATABASE_URL 和 postinstall |
| `Type error` | TypeScript 错误 | 修复类型错误 |
| `Build timeout` | 构建时间过长 | 优化构建或增加超时 |
| `Environment variable missing` | 环境变量未设置 | 在 Vercel 中设置变量 |
| `404 Not Found` | Root Directory 错误 | 设置为 `final-project` |

