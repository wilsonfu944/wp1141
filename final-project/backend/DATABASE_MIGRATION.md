# 🗄️ 数据库迁移指南 - 从本地到云端

## 📋 概述

Vercel 是 serverless 环境，无法直接连接到本地数据库。需要将数据库迁移到云端服务。

## 🎯 推荐方案

### 方案对比

| 服务 | 免费额度 | 优点 | 缺点 |
|------|---------|------|------|
| **Vercel Postgres** | 256 MB | 与 Vercel 集成，设置简单 | 免费额度较小 |
| **Supabase** | 500 MB | 免费额度大，功能丰富 | 需要单独注册 |
| **Neon** | 512 MB | 免费额度大，支持分支 | 需要单独注册 |
| **Railway** | $5 免费额度 | 简单易用 | 免费额度有限 |

## 🚀 方案一：Vercel Postgres（推荐，最简单）

### 步骤 1：创建 Vercel Postgres 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目
3. 点击 **Storage** 标签
4. 点击 **Create Database**
5. 选择 **Postgres**
6. 选择区域（推荐：`ap-northeast-1` 东京，或 `us-east-1`）
7. 点击 **Create**
8. 等待数据库创建完成（约 1-2 分钟）

### 步骤 2：获取连接字符串

创建完成后，你会看到两个连接字符串：

1. **POSTGRES_PRISMA_URL** - 用于 Prisma（推荐）
2. **POSTGRES_URL** - 标准 PostgreSQL 连接字符串

**复制 `POSTGRES_PRISMA_URL`**，格式类似：
```
postgres://default:xxx@xxx.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15
```

### 步骤 3：在 Vercel 设置环境变量

1. 在项目设置中，进入 **Environment Variables**
2. 添加变量：
   - **Name**: `DATABASE_URL`
   - **Value**: 粘贴刚才复制的 `POSTGRES_PRISMA_URL`
   - **Environment**: 选择所有环境（Production, Preview, Development）

### 步骤 4：迁移数据库结构

在本地执行：

```bash
cd final-project/backend

# 1. 临时设置云端数据库 URL（不要覆盖本地 .env）
export DATABASE_URL="你的POSTGRES_PRISMA_URL"

# 2. 运行迁移
npx prisma migrate deploy

# 3. 或者使用 push（如果没有迁移历史）
npx prisma db push
```

### 步骤 5：迁移数据（可选）

如果需要迁移现有数据，见下方「数据迁移」部分。

---

## 🌟 方案二：Supabase（推荐，免费额度大）

### 步骤 1：创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/)
2. 注册/登录账户
3. 点击 **New Project**
4. 填写项目信息：
   - **Name**: animap
   - **Database Password**: 设置一个强密码（**重要：保存好这个密码**）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
5. 点击 **Create new project**
6. 等待项目创建（约 2 分钟）

### 步骤 2：获取连接字符串

1. 进入项目后，点击左侧 **Settings** → **Database**
2. 找到 **Connection string** 部分
3. 选择 **URI** 标签
4. 复制连接字符串，格式：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
5. **替换 `[YOUR-PASSWORD]`** 为你创建项目时设置的密码

### 步骤 3：在 Vercel 设置环境变量

1. 在 Vercel 项目设置中，进入 **Environment Variables**
2. 添加变量：
   - **Name**: `DATABASE_URL`
   - **Value**: 粘贴连接字符串（已替换密码）
   - **Environment**: 选择所有环境

### 步骤 4：迁移数据库结构

```bash
cd final-project/backend

# 临时设置云端数据库 URL
export DATABASE_URL="你的Supabase连接字符串"

# 运行迁移
npx prisma migrate deploy
# 或
npx prisma db push
```

---

## 🌟 方案三：Neon（推荐，支持分支）

### 步骤 1：创建 Neon 项目

1. 访问 [Neon](https://neon.tech/)
2. 注册/登录（支持 GitHub 登录）
3. 点击 **Create Project**
4. 填写项目信息：
   - **Name**: animap
   - **Region**: 选择 `Asia Pacific (Tokyo)` 或 `Asia Pacific (Singapore)`
5. 点击 **Create Project**

### 步骤 2：获取连接字符串

1. 项目创建后，会自动显示连接字符串
2. 点击 **Connection Details**
3. 复制 **Connection string**，格式：
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### 步骤 3：在 Vercel 设置环境变量

同方案二，将连接字符串添加到 Vercel 环境变量。

### 步骤 4：迁移数据库结构

同方案二。

---

## 📦 数据迁移（从本地到云端）

如果你需要迁移现有的数据：

### 方法一：使用 pg_dump 和 psql（推荐）

```bash
# 1. 导出本地数据库
pg_dump -h localhost -U postgres -d animap --data-only --column-inserts > data.sql

# 2. 导入到云端数据库
# 对于 Supabase/Neon，需要先连接到数据库
psql "你的云端数据库连接字符串" < data.sql
```

### 方法二：使用 Prisma Seed（如果有 seed 文件）

```bash
# 设置云端数据库 URL
export DATABASE_URL="你的云端数据库连接字符串"

# 运行 seed
npx prisma db seed
```

### 方法三：使用数据库迁移工具

如果数据量不大，可以手动重新创建数据。

---

## ✅ 验证迁移

### 1. 测试连接

```bash
# 设置云端数据库 URL
export DATABASE_URL="你的云端数据库连接字符串"

# 测试连接
npx prisma db pull
```

如果成功，说明连接正常。

### 2. 检查表结构

```bash
# 查看所有表
npx prisma studio
```

在浏览器中打开 Prisma Studio，确认所有表都已创建。

### 3. 测试 API

部署到 Vercel 后，测试 API 端点：
```bash
curl https://你的域名.vercel.app/api/health
```

---

## 🔧 常见问题

### Q: 迁移后数据丢失？

**A**: 确保在迁移数据前，数据库结构已正确迁移。使用 `prisma migrate deploy` 或 `prisma db push` 创建表结构。

### Q: 连接超时？

**A**: 
- 检查连接字符串是否正确
- 确认数据库服务已启动
- 检查防火墙设置（某些服务需要允许 IP）

### Q: SSL 连接错误？

**A**: 确保连接字符串包含 `?sslmode=require` 参数。

### Q: Prisma 迁移失败？

**A**: 
- 检查 `prisma/migrations` 目录是否存在迁移文件
- 如果没有，使用 `npx prisma db push` 代替
- 检查 Prisma schema 是否正确

### Q: 如何同时使用本地和云端数据库？

**A**: 
- 本地开发：使用 `.env` 文件中的 `DATABASE_URL`
- Vercel 部署：使用 Vercel 环境变量中的 `DATABASE_URL`
- 两者互不干扰

---

## 📝 完整迁移清单

- [ ] 选择云数据库服务（Vercel Postgres / Supabase / Neon）
- [ ] 创建云端数据库
- [ ] 获取连接字符串
- [ ] 在 Vercel 设置 `DATABASE_URL` 环境变量
- [ ] 在本地测试连接：`export DATABASE_URL="..." && npx prisma db push`
- [ ] 迁移数据库结构：`npx prisma migrate deploy`
- [ ] （可选）迁移数据
- [ ] 验证迁移：`npx prisma studio`
- [ ] 部署到 Vercel
- [ ] 测试生产环境 API

---

## 🎯 推荐流程

1. **开发阶段**：继续使用本地数据库
2. **准备部署**：创建云端数据库（推荐 Supabase，免费额度大）
3. **迁移结构**：使用 `prisma db push` 或 `prisma migrate deploy`
4. **（可选）迁移数据**：使用 `pg_dump` 导出，`psql` 导入
5. **设置 Vercel**：添加 `DATABASE_URL` 环境变量
6. **部署测试**：部署到 Vercel 并测试

---

## 📚 相关资源

- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase 文档](https://supabase.com/docs)
- [Neon 文档](https://neon.tech/docs)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)



