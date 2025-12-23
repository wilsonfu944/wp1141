# 动漫巡礼网站

一个基于 Next.js 和 MongoDB 的动漫巡礼网站，提供动漫信息、巡礼景点、行程规划、社交互动等功能。

## 功能特色

- 🎌 动漫信息浏览（热门推荐、排行榜）
- 📍 巡礼景点地图（Google Maps 集成）
- 🗺️ 智能行程规划（最短路径算法）
- 💬 留言板和私讯功能
- 👥 找旅伴功能
- 🎮 动漫知识王游戏
- 👤 用户个人资料管理

## 技术栈

- **框架**: Next.js 14
- **数据库**: MongoDB
- **认证**: NextAuth.js
- **地图**: Google Maps API
- **样式**: Tailwind CSS
- **动画**: Framer Motion

## 环境变量

请确保在 `.env.local` 文件中设置以下环境变量：

```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 安装和运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
├── app/              # Next.js App Router 页面
├── components/       # React 组件
├── lib/             # 工具函数和配置
├── models/          # MongoDB 数据模型
├── public/          # 静态资源
└── types/           # TypeScript 类型定义
```

