# AniMap - Next.js 全栈应用

動漫聖地巡禮平台，使用 Next.js 全栈开发。

## 项目结构

```
animap-nextjs/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── (main)/            # 主页面组
│   ├── (auth)/            # 认证页面组
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
├── context/               # React Context
├── lib/                   # 工具函数和库
│   ├── prisma.ts         # Prisma 客户端
│   ├── jwt.ts            # JWT 工具
│   ├── auth.ts           # 认证中间件
│   └── api.ts            # API 客户端
├── utils/                 # 工具函数
│   ├── routeOptimizer.ts # 路线优化
│   └── googleMapsDistance.ts # Google Maps 距离计算
├── prisma/                # Prisma 配置
│   ├── schema.prisma     # 数据库模型
│   └── seed.ts           # 数据库种子
└── types/                 # TypeScript 类型定义
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入你的配置：

```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="your-secret-key"
LLM_API_KEY="your-groq-api-key"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### 3. 设置数据库

```bash
# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移（如果需要）
npm run prisma:migrate

# 填充种子数据
npm run prisma:seed
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint
- `npm run prisma:generate` - 生成 Prisma Client
- `npm run prisma:migrate` - 运行数据库迁移
- `npm run prisma:seed` - 填充种子数据

## 迁移状态

✅ 已完成：
- 项目基础结构
- Prisma 配置
- 基础 API 路由（auth, animes, locations）
- 工具函数和库
- 组件和 Context
- API 客户端

⏳ 进行中：
- 剩余 API 路由
- 前端页面迁移

📋 待完成：
- 完整测试
- 部署配置

详细迁移指南请查看 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## 技术栈

- **框架**: Next.js 16 (App Router)
- **数据库**: MongoDB (Prisma ORM)
- **认证**: JWT
- **UI**: React 19 + Tailwind CSS
- **状态管理**: React Query + Context API
- **地图**: React Leaflet + Google Maps API
- **AI**: Groq API

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置环境变量
4. 部署

Vercel 会自动检测 Next.js 项目并配置构建。

## 注意事项

1. 所有 API 路由在 `app/api` 目录下
2. 客户端组件需要标记 `'use client'`
3. 使用 `@/` 别名导入（已在 tsconfig.json 配置）
4. API 调用使用相对路径 `/api/...`
