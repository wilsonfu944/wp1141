# 🚀 本地开发设置指南

## ✅ 已完成的设置

1. ✅ 创建了 `.env.local` 文件
2. ✅ 配置了 MongoDB 连接字符串
3. ✅ 生成了 Prisma Client
4. ✅ 启动了开发服务器

## 📝 环境变量说明

`.env.local` 文件已创建，包含以下配置：

- `DATABASE_URL` - MongoDB Atlas 连接字符串（已配置）
- `JWT_SECRET` - JWT 密钥（用于用户认证）
- `LLM_API_KEY` - Groq API Key（可选，用于 AI 功能）
- `GOOGLE_MAPS_API_KEY` - Google Maps API Key（可选，用于地图功能）

## 🔧 如果需要更新环境变量

编辑 `.env.local` 文件：

```bash
# 编辑环境变量
nano .env.local
# 或
code .env.local
```

## 🎯 访问应用

开发服务器应该正在运行，访问：

- **前端首页**: http://localhost:3000
- **API 健康检查**: http://localhost:3000/api/health
- **API 端点**: http://localhost:3000/api/*

## 🛠️ 常用命令

```bash
# 启动开发服务器
npm run dev

# 生成 Prisma Client（如果 schema 有更新）
npm run prisma:generate

# 运行数据库种子（填充初始数据）
npm run prisma:seed

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## ⚠️ 注意事项

1. **MongoDB 连接**
   - 确保 MongoDB Atlas 允许你的 IP 地址访问
   - 或设置为允许所有 IP（仅用于开发）

2. **API Keys（可选）**
   - `LLM_API_KEY` - 如果没有，AI 功能将无法使用
   - `GOOGLE_MAPS_API_KEY` - 如果没有，地图和路线优化功能可能受限

3. **端口**
   - Next.js 默认使用 3000 端口
   - 如果端口被占用，Next.js 会自动使用下一个可用端口

## 🐛 故障排除

### 服务器无法启动

```bash
# 检查端口是否被占用
lsof -i :3000

# 如果被占用，可以杀死进程或使用其他端口
PORT=3001 npm run dev
```

### Prisma 连接错误

```bash
# 重新生成 Prisma Client
npm run prisma:generate

# 检查 DATABASE_URL 是否正确
echo $DATABASE_URL
```

### 模块未找到错误

```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

## 📚 下一步

1. 访问 http://localhost:3000 查看应用
2. 测试 API 端点：http://localhost:3000/api/health
3. 如果需要，运行数据库种子：`npm run prisma:seed`

