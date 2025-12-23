# 动漫巡礼网站 - 设置指南

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件（如果还没有），并添加以下内容：

```env
MONGODB_URI=mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/?appName=Cluster0
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCWiHb1jxLZcwU7z4PlUXPgcWjVuyvOFQY
```

**注意**: 
- `NEXTAUTH_SECRET` 应该是一个随机字符串，可以使用 `openssl rand -base64 32` 生成
- 如果需要 Google 登录功能，还需要添加 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`

### 3. 初始化数据库

运行数据初始化脚本：

```bash
node scripts/initData.js
```

或者使用 TypeScript 版本（需要先编译）：

```bash
npx ts-node scripts/seedData.ts
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看网站。

## 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── auth/              # 认证页面
│   ├── anime/             # 动漫相关页面
│   ├── location/          # 景点相关页面
│   ├── map/               # 地图页面
│   ├── itinerary/          # 行程页面
│   ├── forum/             # 留言板
│   ├── messages/          # 私讯
│   ├── quiz/              # 知识王
│   └── profile/           # 用户资料
├── components/            # React 组件
├── lib/                   # 工具函数和配置
│   ├── mongodb.ts        # MongoDB 连接
│   └── auth.ts           # NextAuth 配置
├── models/                # MongoDB 数据模型
├── scripts/               # 脚本文件
├── types/                 # TypeScript 类型定义
└── public/                # 静态资源
```

## 主要功能

### 已实现的功能

✅ 前导页（显示统计数据）
✅ 首页（跑马灯、推荐、排行榜）
✅ 动漫列表和详情页
✅ 景点详情页
✅ 地图页面（Google Maps 集成）
✅ 行程规划（最短路径算法）
✅ 留言板
✅ 私讯功能
✅ 知识王游戏
✅ 用户认证（NextAuth）
✅ 用户个人资料

### 待完善的功能

- [ ] 图片上传到云存储（目前使用占位符）
- [ ] 实时消息（WebSocket）
- [ ] 更多知识王题目
- [ ] 评论回复功能
- [ ] 行程分享功能

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 添加环境变量：
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (生产环境 URL)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. 部署

## 注意事项

1. **图片上传**: 目前用户照片上传使用 `URL.createObjectURL`，这只是临时方案。生产环境应该使用 Cloudinary 或其他云存储服务。

2. **Google Maps API**: 确保在 Google Cloud Console 中启用 Maps JavaScript API，并设置正确的 API 密钥限制。

3. **MongoDB**: 确保 MongoDB Atlas 的网络访问设置允许从 Vercel 的 IP 地址访问。

4. **NextAuth Secret**: 在生产环境中，务必使用强随机字符串作为 `NEXTAUTH_SECRET`。

## 故障排除

### MongoDB 连接问题
- 检查 `MONGODB_URI` 是否正确
- 确认 MongoDB Atlas 的网络访问设置
- 检查数据库用户权限

### Google Maps 不显示
- 检查 API 密钥是否正确
- 确认已启用 Maps JavaScript API
- 检查 API 密钥的域名限制

### 认证问题
- 检查 `NEXTAUTH_SECRET` 是否设置
- 确认 `NEXTAUTH_URL` 与当前域名匹配
- 检查 Google OAuth 配置（如果使用）

## 开发建议

1. 使用 TypeScript 的类型检查来避免错误
2. 在提交代码前运行 `npm run lint`
3. 测试所有主要功能流程
4. 定期备份数据库

## 联系和支持

如有问题，请查看代码注释或参考 Next.js 和 MongoDB 的官方文档。

