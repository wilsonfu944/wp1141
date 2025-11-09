# GitHub 推送指南

## 📋 步骤 1: 初始化 Git 仓库（已完成）

```bash
cd /Users/fuzhongyu/Desktop/hw5
git init
git add .
git commit -m "Initial commit: MySocialMedia project"
```

## 📋 步骤 2: 在 GitHub 创建新仓库

1. **登录 GitHub**
   - 访问 [github.com](https://github.com)
   - 登录你的账号

2. **创建新仓库**
   - 点击右上角的 "+" 号
   - 选择 "New repository"
   - 填写仓库信息：
     - **Repository name**: `mysocialmedia` (或你喜欢的名字)
     - **Description**: `A social media platform built with Next.js, NextAuth, MongoDB, and Pusher`
     - **Visibility**: 选择 Public 或 Private
     - **⚠️ 重要**: 不要勾选 "Initialize this repository with a README"（因为我们已经有了代码）
   - 点击 "Create repository"

3. **复制仓库 URL**
   - 创建后会显示仓库 URL，类似：
     - HTTPS: `https://github.com/your-username/mysocialmedia.git`
     - SSH: `git@github.com:your-username/mysocialmedia.git`

## 📋 步骤 3: 连接本地仓库到 GitHub

在终端执行以下命令（替换 `YOUR_USERNAME` 和 `YOUR_REPO_NAME`）：

```bash
cd /Users/fuzhongyu/Desktop/hw5

# 添加远程仓库（使用 HTTPS）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 或者使用 SSH（如果你配置了 SSH key）
# git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# 查看远程仓库配置
git remote -v
```

## 📋 步骤 4: 推送代码到 GitHub

```bash
# 确保所有更改都已提交
git add .
git commit -m "Initial commit: MySocialMedia project"

# 推送到 GitHub（首次推送）
git branch -M main
git push -u origin main
```

## 🔐 认证方式

### 方式 1: Personal Access Token (推荐)

1. **创建 Personal Access Token**
   - 前往 GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - 点击 "Generate new token (classic)"
   - 设置权限：至少勾选 `repo`
   - 生成并复制 token

2. **使用 Token 推送**
   - 当提示输入密码时，使用 token 而不是 GitHub 密码

### 方式 2: SSH Key

1. **生成 SSH Key**（如果还没有）
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **添加 SSH Key 到 GitHub**
   - 复制公钥：`cat ~/.ssh/id_ed25519.pub`
   - 在 GitHub Settings > SSH and GPG keys 中添加

## 📝 常用 Git 命令

```bash
# 查看状态
git status

# 添加所有更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到 GitHub
git push

# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v
```

## ⚠️ 注意事项

1. **不要提交敏感信息**
   - `.env.local` 文件已在 `.gitignore` 中
   - 确保不会提交密码、API keys 等

2. **提交前检查**
   ```bash
   git status
   git diff
   ```

3. **如果推送失败**
   - 检查网络连接
   - 确认 GitHub 仓库 URL 正确
   - 确认有推送权限

## 🚀 推送后下一步

推送成功后，你可以：
1. 在 GitHub 上查看你的代码
2. 按照 `VERCEL_DEPLOY.md` 的指南部署到 Vercel
3. 继续开发和提交更改



