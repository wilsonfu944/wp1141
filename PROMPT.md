# 动漫巡礼网站开发 Prompt

## 项目概述

创建一个完整的动漫巡礼网站，让用户可以探索动漫中的真实场景，规划巡礼之旅，并与其他动漫爱好者互动。

## 技术栈要求

- **前端框架**: Next.js 14 (App Router)
- **数据库**: MongoDB (使用 Mongoose)
- **认证**: NextAuth.js
- **地图服务**: Google Maps API
- **样式**: Tailwind CSS
- **动画**: Framer Motion (可选)
- **部署**: Vercel

## 功能需求

### 1. 前导页 (Landing Page)
- 显示网站统计信息：
  - 动漫作品数量
  - 巡礼地点数量
  - 总用户数
- 提供进入网站的按钮

### 2. 首页
- **跑马灯**: 显示热门动漫信息
- **动漫推荐区域**:
  - 热门动漫（按评分排序）
  - 你的喜欢动漫（登录用户）
  - 近期动漫（按发布日期排序）
- **右侧排行榜**: 按星级显示前10名动漫

### 3. 动漫详情页
- 动漫基本信息（标题、描述、评分、类型、制作公司等）
- 对应的巡礼景点列表
- 评论区（支持发表评论、点赞）

### 4. 景点详情页
- 景点介绍和地址
- 官方图片展示
- 用户上传的照片（支持用户上传）
- 评论区

### 5. 动漫列表页
- 显示所有动漫
- 与首页相同的布局和功能

### 6. 地图页面
- 集成 Google Maps
- 在地图上标注所有巡礼景点
- 点击标记显示景点信息
- 右侧显示：
  - 选中景点的照片和信息
  - 行程购物车（可以添加/移除景点）
  - 确认按钮，跳转到行程规划页

### 7. 行程规划页
- **创建行程**:
  - 从购物车接收景点列表
  - 使用最短路径算法自动排序景点
  - 允许用户调整：
    - 停留时间（分钟）
    - 出发日期
    - 景点顺序（上移/下移）
  - 保存行程（可设置为公开/私密）
- **我的行程**: 显示用户创建的行程
- **热门行程**: 显示其他用户公开的行程

### 8. 留言板页面
- 分类显示：
  - 一般讨论
  - 找旅伴
- 用户可以发表帖子
- 显示点赞数和评论数
- 支持查看详情

### 9. 私讯功能
- 类似 Line 的聊天界面
- 左侧显示对话列表
- 右侧显示聊天内容
- 实时消息（轮询或 WebSocket）

### 10. 知识王游戏
- 动漫知识问答游戏
- 多个难度等级（简单/中等/困难）
- 显示进度条和得分
- 答题后显示正确答案和解释
- 完成后显示总分和评价

### 11. 用户个人资料
- 显示用户基本信息
- 编辑个人资料（姓名等）
- 显示最喜欢的动漫列表
- 支持添加/移除喜欢的动漫

### 12. 导航栏
- 未登录：显示"登入"按钮
- 已登录：显示用户头像，点击进入个人资料
- 包含所有主要页面的链接

## 数据模型

### User (用户)
- name, email, password, image
- favoriteAnime (ObjectId[])

### Anime (动漫)
- title, titleJP, description, coverImage
- rating, releaseDate, genres, studio, episodes, status
- locations (ObjectId[])

### Location (景点)
- name, nameJP, description, address
- latitude, longitude
- images (string[])
- anime (ObjectId)
- userPhotos (ObjectId[])

### Comment (评论)
- content, author (ObjectId)
- targetType ('anime' | 'location')
- targetId (ObjectId)
- likes (ObjectId[]), replies (ObjectId[])

### UserPhoto (用户照片)
- imageUrl, location (ObjectId)
- author (ObjectId), caption

### Itinerary (行程)
- title, description, author (ObjectId)
- items: [{ location, stayDuration, order }]
- startDate, isPublic
- likes (ObjectId[])

### Message (私讯)
- content, sender (ObjectId), recipient (ObjectId)
- read

### Post (帖子)
- title, content, author (ObjectId)
- category ('general' | 'travel-companion')
- likes (ObjectId[]), comments (ObjectId[])

### Quiz (知识王)
- title, description
- questions: [{ question, options, correctAnswer, explanation }]
- difficulty ('easy' | 'medium' | 'hard')

## API 路由

- `/api/stats` - 获取统计数据
- `/api/anime` - 获取动漫列表
- `/api/anime/[id]` - 获取动漫详情
- `/api/anime/favorites` - 获取用户喜欢的动漫
- `/api/location` - 获取景点列表
- `/api/location/[id]` - 获取景点详情
- `/api/comments` - 获取/创建评论
- `/api/itinerary` - 获取/创建行程
- `/api/posts` - 获取/创建帖子
- `/api/messages` - 获取/发送私讯
- `/api/messages/conversations` - 获取对话列表
- `/api/quiz` - 获取知识王题目
- `/api/user/profile` - 获取/更新用户资料
- `/api/upload/photo` - 上传用户照片
- `/api/auth/signup` - 用户注册

## 环境变量

```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
GOOGLE_CLIENT_ID=... (可选，用于 Google 登录)
GOOGLE_CLIENT_SECRET=... (可选，用于 Google 登录)
```

## 初始数据

- 生成 20 部动漫的初始数据
- 为每部动漫创建至少 1-2 个巡礼景点
- 景点应包含真实的日本地址和坐标

## 特殊功能实现

### 最短路径算法
- 使用最近邻算法（Nearest Neighbor）或更高级的算法
- 考虑景点之间的距离
- 允许用户手动调整顺序

### 图片上传
- 目前使用 URL.createObjectURL 作为占位
- 生产环境应集成 Cloudinary 或其他云存储服务

### 实时消息
- 使用轮询（每3秒）或考虑 WebSocket
- 标记已读消息

## UI/UX 要求

- 现代化、美观的界面设计
- 响应式布局（支持移动端）
- 流畅的动画和过渡效果
- 清晰的导航和用户反馈
- 使用 Tailwind CSS 进行样式设计

## 部署

- 配置 Vercel 部署
- 确保环境变量正确设置
- MongoDB Atlas 连接配置

## 开发步骤

1. 创建 Next.js 项目结构
2. 配置 MongoDB 连接和模型
3. 设置 NextAuth 认证
4. 创建所有页面和组件
5. 实现 API 路由
6. 集成 Google Maps
7. 实现行程规划算法
8. 添加初始数据
9. 测试所有功能
10. 部署到 Vercel

