# Next.js 全栈迁移指南

## 已完成的工作

1. ✅ 创建 Next.js 项目基础结构
2. ✅ 迁移 Prisma 配置和数据库文件
3. ✅ 创建基础 API 路由（auth, animes, locations, health）
4. ✅ 迁移工具函数（prisma, jwt, auth, routeOptimizer, googleMapsDistance）
5. ✅ 迁移组件、context、types
6. ✅ 创建 API 客户端（lib/api.ts）
7. ✅ 更新 package.json 添加 Prisma 脚本

## 需要完成的工作

### 1. 创建剩余的 API 路由

需要在 `app/api` 目录下创建以下路由：

- `app/api/comments/route.ts` - 评论相关
- `app/api/comments/[id]/route.ts` - 单个评论操作
- `app/api/comments/location/[locationId]/route.ts` - 获取地点评论
- `app/api/favorites/route.ts` - 收藏列表
- `app/api/favorites/[locationId]/route.ts` - 收藏操作
- `app/api/itineraries/route.ts` - 行程列表
- `app/api/itineraries/optimize/route.ts` - 路线优化
- `app/api/itineraries/[id]/route.ts` - 单个行程操作
- `app/api/itineraries/user/[userId]/route.ts` - 用户行程
- `app/api/itineraries/public/all/route.ts` - 公开行程
- `app/api/forum/posts/route.ts` - 论坛帖子
- `app/api/forum/posts/[id]/route.ts` - 单个帖子
- `app/api/messages/route.ts` - 消息相关
- `app/api/messages/conversations/route.ts` - 对话列表
- `app/api/messages/conversations/[userId]/route.ts` - 单个对话
- `app/api/friends/route.ts` - 好友相关
- `app/api/friends/request/[receiverId]/route.ts` - 发送好友请求
- `app/api/friends/requests/route.ts` - 好友请求列表
- `app/api/friends/recommendations/route.ts` - 好友推荐
- `app/api/ai/chat/route.ts` - AI 聊天
- `app/api/favorite-animes/route.ts` - 收藏的动画
- `app/api/favorite-animes/[animeId]/route.ts` - 收藏动画操作
- `app/api/ratings/anime/[id]/route.ts` - 动画评分
- `app/api/ratings/location/[id]/route.ts` - 地点评分

### 2. 迁移前端页面

将 `frontend/src/pages` 中的页面迁移到 Next.js App Router：

- `app/(main)/page.tsx` - 首页（LandingPage）
- `app/(main)/home/page.tsx` - 主页（HomePage）
- `app/(main)/map/page.tsx` - 地图页（MapPage）
- `app/(main)/plan/page.tsx` - 规划页（PlanPage）
- `app/(main)/animes/page.tsx` - 动画列表（AnimeListPage）
- `app/(main)/animes/[id]/page.tsx` - 动画详情（AnimeDetailPage）
- `app/(main)/locations/[id]/page.tsx` - 地点详情（LocationDetailPage）
- `app/(main)/itineraries/[id]/page.tsx` - 行程详情（ItineraryDetailPage）
- `app/(main)/profile/itineraries/page.tsx` - 我的行程（MyItinerariesPage）
- `app/(main)/explore/itineraries/page.tsx` - 探索行程（ExploreItinerariesPage）
- `app/(main)/forum/page.tsx` - 论坛（ForumPage）
- `app/(main)/forum/new/page.tsx` - 新帖子（NewForumPostPage）
- `app/(main)/forum/[id]/page.tsx` - 帖子详情（ForumPostPage）
- `app/(main)/messages/page.tsx` - 消息（MessagesPage）
- `app/(main)/friends/page.tsx` - 好友（FriendsPage）
- `app/(auth)/login/page.tsx` - 登录（Login）
- `app/(auth)/register/page.tsx` - 注册（Register）
- `app/(main)/profile/page.tsx` - 个人资料（Profile）

### 3. 创建布局组件

- `app/(main)/layout.tsx` - 主布局（包含 Navbar, Footer）
- `app/(auth)/layout.tsx` - 认证布局

### 4. 更新组件导入路径

所有组件需要更新导入路径：
- `@/components/...` 替代相对路径
- `@/lib/api` 替代 `../services/api`
- `@/context/...` 替代 `../context/...`

### 5. 环境变量配置

创建 `.env.local` 文件：

```env
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
LLM_API_KEY="your_groq_api_key"
LLM_API_BASE="https://api.groq.com/openai/v1"
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

### 6. 更新组件以使用 Next.js 特性

- 使用 `next/link` 替代 `react-router-dom` 的 `Link`
- 使用 `next/navigation` 的 `useRouter`, `usePathname` 替代 React Router
- 将客户端组件标记为 `'use client'`
- 服务器组件默认不需要标记

### 7. 运行和测试

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npm run prisma:generate

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 快速迁移脚本

你可以参考 `backend/src/routes` 中的 Express 路由，将它们转换为 Next.js API 路由。主要区别：

1. Express: `router.get('/path', handler)`
2. Next.js: `export async function GET(request: NextRequest) { ... }`

3. Express: `req.params.id`
4. Next.js: `const { id } = await params` (在动态路由中)

5. Express: `req.query`
6. Next.js: `const { searchParams } = new URL(request.url)`

## 注意事项

1. Next.js API 路由默认是服务器端，不需要 `'use client'`
2. 所有 API 路由文件必须命名为 `route.ts`
3. 动态路由使用 `[id]` 文件夹名称
4. 客户端组件必须标记 `'use client'`
5. 使用 `@/` 别名导入，已在 tsconfig.json 中配置

## 下一步

1. 按照上述列表创建剩余的 API 路由
2. 迁移前端页面到 App Router
3. 测试所有功能
4. 部署到 Vercel

