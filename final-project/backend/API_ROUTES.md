# 📋 Vercel 部署 - API 路由清单

## ✅ 需要部署的所有 API 路由

根据 `src/index.ts`，以下 **14 个 API 路由组** 都需要部署到 Vercel：

### 1. 认证 API (`/api/auth`)
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录  
- `GET /api/auth/me` - 获取当前用户信息

### 2. 地点 API (`/api/locations`)
- 所有地点相关的 CRUD 操作

### 3. 动漫 API (`/api/animes`)
- 所有动漫相关的 CRUD 操作

### 4. 收藏 API (`/api/favorites`)
- 所有收藏相关的 CRUD 操作

### 5. 评论 API (`/api/comments`)
- 所有评论相关的 CRUD 操作

### 6. 行程 API (`/api/itineraries`)
- 所有行程相关的 CRUD 操作

### 7. 导出 API (`/api/export`)
- 行程导出功能

### 8. 论坛 API (`/api/forum`)
- 所有论坛相关的 CRUD 操作

### 9. 消息 API (`/api/messages`)
- 所有消息相关的 CRUD 操作

### 10. 评分 API (`/api/ratings`)
- 所有评分相关的 CRUD 操作

### 11. AI API (`/api/ai`)
- `POST /api/ai/chat` - AI 客服聊天

### 12. 收藏动漫 API (`/api/favorite-animes`)
- 收藏动漫相关的 CRUD 操作

### 13. 好友 API (`/api/friends`)
- 所有好友相关的 CRUD 操作

### 14. 健康检查 (`/api/health`)
- `GET /api/health` - 服务健康检查

---

## 📁 需要上传的文件

### 核心文件（必须）
```
backend/
├── api/
│   └── index.ts              ✅ Vercel serverless 入口
├── src/
│   ├── routes/               ✅ 所有路由文件（13个）
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
│   ├── controllers/          ✅ 控制器文件
│   ├── middleware/           ✅ 中间件（auth.ts等）
│   └── utils/                ✅ 工具函数
├── prisma/
│   └── schema.prisma         ✅ Prisma schema
├── package.json              ✅ 依赖配置
├── tsconfig.json             ✅ TypeScript 配置
└── vercel.json               ✅ Vercel 配置
```

### 路由文件详细列表
1. ✅ `src/routes/auth.ts`
2. ✅ `src/routes/locations.ts`
3. ✅ `src/routes/animes.ts`
4. ✅ `src/routes/favorites.ts`
5. ✅ `src/routes/comments.ts`
6. ✅ `src/routes/itineraries.ts`
7. ✅ `src/routes/export.ts`
8. ✅ `src/routes/forum.ts`
9. ✅ `src/routes/messages.ts`
10. ✅ `src/routes/ratings.ts`
11. ✅ `src/routes/ai.ts`
12. ✅ `src/routes/favoriteAnimes.ts`
13. ✅ `src/routes/friends.ts`

---

## 🚀 快速部署命令

```bash
# 1. 进入 backend 目录
cd final-project/backend

# 2. 登录 Vercel（首次需要）
vercel login

# 3. 部署到 Vercel
vercel

# 4. 生产环境部署
vercel --prod
```

---

## ⚙️ 环境变量设置

在 Vercel Dashboard 中设置以下环境变量：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ |
| `JWT_SECRET` | JWT 签名密钥 | ✅ |
| `CORS_ORIGIN` | 前端域名（用于 CORS） | ✅ |
| `LLM_API_KEY` | AI API 密钥（如果使用 AI 功能） | ⚠️ |
| `LLM_API_BASE` | AI API 基础 URL | ⚠️ |
| `GOOGLE_MAPS_API_KEY` | Google Maps API 密钥（如果使用） | ⚠️ |

---

## 📝 注意事项

1. ✅ 所有路由文件都已包含在 `api/index.ts` 中
2. ✅ `vercel.json` 已配置好路由映射
3. ✅ `package.json` 已添加 `postinstall` 脚本自动生成 Prisma Client
4. ⚠️ 确保数据库可以从 Vercel 访问
5. ⚠️ 确保所有环境变量都已设置

---

## 🔍 验证部署

部署成功后，访问：
- `https://你的域名.vercel.app/api/health` - 应该返回 `{ status: 'ok', message: 'AniMap API is running' }`



