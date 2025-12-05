# Vercel 部署指南

## 📋 需要部署的 API 路由清单

根据 `src/index.ts`，以下所有 API 路由都需要部署到 Vercel：

### 认证相关
- ✅ `/api/auth/register` - 用户注册
- ✅ `/api/auth/login` - 用户登录
- ✅ `/api/auth/me` - 获取当前用户信息

### 地点相关
- ✅ `/api/locations/*` - 地点相关 API

### 动漫相关
- ✅ `/api/animes/*` - 动漫相关 API
- ✅ `/api/favorite-animes/*` - 收藏动漫相关 API

### 收藏相关
- ✅ `/api/favorites/*` - 收藏相关 API

### 评论相关
- ✅ `/api/comments/*` - 评论相关 API

### 行程相关
- ✅ `/api/itineraries/*` - 行程相关 API
- ✅ `/api/export/*` - 行程导出相关 API

### 论坛相关
- ✅ `/api/forum/*` - 论坛相关 API

### 消息相关
- ✅ `/api/messages/*` - 消息相关 API

### 评分相关
- ✅ `/api/ratings/*` - 评分相关 API

### AI 相关
- ✅ `/api/ai/*` - AI 客服相关 API

### 好友相关
- ✅ `/api/friends/*` - 好友相关 API

### 健康检查
- ✅ `/api/health` - 健康检查端点

---

## 🗄️ ⚠️ 重要：数据库迁移

**Vercel 无法连接到本地数据库！** 在部署前，必须先将数据库迁移到云端。

### 快速选择：

1. **Vercel Postgres**（最简单，与 Vercel 集成）
   - 在 Vercel Dashboard → Storage → Create Database → Postgres
   - 复制 `POSTGRES_PRISMA_URL` 作为 `DATABASE_URL`

2. **Supabase**（推荐，免费额度 500MB）
   - 访问 https://supabase.com/ 创建项目
   - 获取连接字符串，添加到 Vercel 环境变量

3. **Neon**（推荐，免费额度 512MB，支持分支）
   - 访问 https://neon.tech/ 创建项目
   - 获取连接字符串，添加到 Vercel 环境变量

### 详细步骤：

📖 **完整迁移指南**：请查看 [`DATABASE_MIGRATION.md`](./DATABASE_MIGRATION.md)

### 快速迁移命令：

```bash
# 1. 导出本地数据（可选）
cd final-project/backend
./export-local-data.sh

# 2. 迁移数据库结构到云端
export DATABASE_URL="你的云端数据库连接字符串"
npx prisma db push

# 3. 导入数据（如果有导出文件）
psql "你的云端数据库连接字符串" < animap-data.sql
```

---

## 🚀 部署步骤

### 1. 安装 Vercel CLI（如果还没有）

```bash
npm i -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 在 backend 目录下部署

```bash
cd final-project/backend
vercel
```

### 4. 设置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量：

```env
# ⚠️ 数据库连接（必须是云端数据库，不能是本地！）
# Vercel Postgres: 使用 POSTGRES_PRISMA_URL
# Supabase: postgresql://postgres:密码@db.xxx.supabase.co:5432/postgres
# Neon: postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
DATABASE_URL=你的云端数据库连接字符串

# JWT 密钥
JWT_SECRET=你的JWT密钥（使用 openssl rand -base64 32 生成）

# CORS 配置（前端域名）
CORS_ORIGIN=https://你的前端域名.vercel.app

# AI API 配置（如果需要）
LLM_API_KEY=你的LLM_API_KEY
LLM_API_BASE=https://api.groq.com/openai/v1

# Google Maps API（如果需要）
GOOGLE_MAPS_API_KEY=你的Google_Maps_API_Key
```

#### 在 Vercel Dashboard 设置环境变量：

1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加上述所有环境变量
4. 确保选择正确的环境（Production, Preview, Development）

### 5. 配置 Prisma

由于 Vercel 是 serverless 环境，需要确保：

1. **生成 Prisma Client**：
   ```bash
   npm run prisma:generate
   ```

2. **在 package.json 中添加 postinstall 脚本**：
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```

3. **数据库迁移**：
   - 在本地运行迁移：`npx prisma migrate deploy`
   - 或者使用 Vercel 的构建命令自动运行

### 6. 更新 vercel.json（如果需要）

如果使用自定义构建配置，可以修改 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

### 7. 部署

```bash
# 预览部署
vercel

# 生产部署
vercel --prod
```

---

## 📝 文件结构

部署到 Vercel 需要的文件：

```
backend/
├── api/
│   └── index.ts          # Vercel serverless 入口文件
├── src/
│   ├── index.ts          # 原始 Express 应用（本地开发用）
│   ├── routes/           # 所有路由文件
│   │   ├── auth.ts
│   │   ├── locations.ts
│   │   ├── animes.ts
│   │   ├── favorites.ts
│   │   ├── comments.ts
│   │   ├── itineraries.ts
│   │   ├── export.ts
│   │   ├── forum.ts
│   │   ├── messages.ts
│   │   ├── ratings.ts
│   │   ├── ai.ts
│   │   ├── favoriteAnimes.ts
│   │   └── friends.ts
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   └── utils/            # 工具函数
├── prisma/
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # 种子数据
├── package.json
├── tsconfig.json
└── vercel.json           # Vercel 配置文件
```

---

## ⚠️ 注意事项

1. **数据库连接**（⚠️ 最重要）：
   - **必须使用云端数据库**，不能使用本地数据库
   - Vercel 是 serverless 环境，无法连接到 localhost
   - 推荐使用 Vercel Postgres、Supabase 或 Neon
   - 确保连接字符串格式正确（包含 SSL 参数）
   - 在部署前，先在本地测试云端数据库连接

2. **环境变量**：
   - 不要在代码中硬编码敏感信息
   - 使用 Vercel 的环境变量管理

3. **CORS 配置**：
   - 更新 `CORS_ORIGIN` 为实际的前端域名
   - 生产环境不要使用 `*`

4. **Prisma**：
   - 确保在构建时生成 Prisma Client
   - 数据库迁移需要在部署前完成

5. **冷启动**：
   - Serverless 函数可能有冷启动延迟
   - 考虑使用 Vercel Pro 计划减少延迟

---

## 🔍 测试部署

部署后，测试以下端点：

```bash
# 健康检查
curl https://你的域名.vercel.app/api/health

# 测试其他 API
curl https://你的域名.vercel.app/api/auth/login
```

---

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Vercel + Express 部署指南](https://vercel.com/guides/using-express-with-vercel)
- [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

