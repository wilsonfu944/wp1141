# 🔍 Vercel 配置检查清单

## 📁 项目结构确认

你的项目结构：
```
Git 仓库根目录: /Users/fuzhongyu/Desktop/final-project
├── final-project/          ← Next.js 项目在这里
│   ├── package.json        ← ✅ 存在
│   ├── next.config.ts      ← ✅ 存在
│   ├── app/
│   ├── components/
│   └── ...
├── hw1/
├── hw2/
└── ...
```

**GitHub 仓库**: `wilsonfu944/wp1141`
**Git 路径**: `final-project/package.json`

## ✅ Vercel 正确配置

### 1. 项目连接
- [ ] GitHub 仓库：`wilsonfu944/wp1141`
- [ ] 分支：`main`
- [ ] 仓库是公开的（或 Vercel 有访问权限）

### 2. Root Directory（最重要！）
- [ ] 设置为：`final-project`
- [ ] **不是** `.` 或空
- [ ] **不是** `final-project/final-project`

### 3. 构建配置
- [ ] Framework Preset: `Next.js`
- [ ] Build Command: `npm run build`（自动检测）
- [ ] Output Directory: `.next`（自动检测）
- [ ] Install Command: `npm install`（自动检测）

### 4. 环境变量
- [ ] `DATABASE_URL` - MongoDB 连接字符串
- [ ] `JWT_SECRET` - JWT 密钥
- [ ] `LLM_API_KEY`（可选）
- [ ] `GOOGLE_MAPS_API_KEY`（可选）

## 🚨 常见错误配置

### ❌ 错误 1：Root Directory 为空或 `.`
**结果**: Vercel 在仓库根目录查找 `package.json`，但实际在 `final-project/` 目录
**解决**: 设置为 `final-project`

### ❌ 错误 2：Root Directory 为 `final-project/final-project`
**结果**: Vercel 找不到项目文件
**解决**: 设置为 `final-project`（只有一层）

### ❌ 错误 3：连接到错误的 GitHub 仓库
**结果**: 部署的是其他项目
**解决**: 确认仓库是 `wilsonfu944/wp1141`

### ❌ 错误 4：连接到错误的分支
**结果**: 部署的是旧代码
**解决**: 确认分支是 `main`

## 🔧 如何检查和修复

### 步骤 1：检查 Vercel 项目设置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击项目 `wp1141`
3. 进入 **Settings** → **General**
4. 检查以下内容：

```
Git Repository: wilsonfu944/wp1141
Production Branch: main
Root Directory: final-project  ← 这里必须正确！
```

### 步骤 2：如果 Root Directory 错误

1. 点击 **Root Directory** 旁边的 **Edit**
2. 输入：`final-project`
3. 点击 **Save**
4. 这会触发重新部署

### 步骤 3：验证部署

1. 进入 **Deployments** 标签
2. 查看最新部署的 **Build Logs**
3. 应该看到：
   ```
   Installing dependencies...
   Running "npm run build"...
   Build completed
   ```

如果看到 `Cannot find package.json`，说明 Root Directory 设置错误。

## 📝 快速验证命令

如果你想在本地验证路径是否正确：

```bash
# 从 Git 根目录检查
cd /Users/fuzhongyu/Desktop/final-project
ls final-project/package.json  # 应该存在

# 检查 Git 中的路径
git ls-files final-project/package.json  # 应该显示 final-project/package.json
```

## 🎯 正确的 Vercel 配置示例

在 Vercel Dashboard 中应该看到：

```
Project Name: wp1141
Git Repository: wilsonfu944/wp1141
Production Branch: main
Root Directory: final-project  ← 关键！
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
```

## 💡 如果还是不行

1. **删除并重新导入项目**
   - 在 Vercel Dashboard 删除当前项目
   - 重新导入 `wilsonfu944/wp1141`
   - **在配置页面立即设置 Root Directory 为 `final-project`**
   - 不要等到部署后再设置

2. **使用 Vercel CLI 部署**
   ```bash
   cd /Users/fuzhongyu/Desktop/final-project/final-project
   vercel --prod
   ```
   这会自动检测正确的路径

3. **检查 GitHub 仓库**
   - 确认代码已推送
   - 确认 `final-project/package.json` 在仓库中
   - 访问：https://github.com/wilsonfu944/wp1141/tree/main/final-project

