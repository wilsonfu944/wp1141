# Vercel 404 问题修复指南

## 🔍 常见 404 原因

### 1. 访问路径错误

**正确访问方式：**
- ✅ `https://你的域名.vercel.app/api/health`
- ✅ `https://你的域名.vercel.app/api/animes`
- ❌ `https://你的域名.vercel.app/` (根路径会 404，这是正常的)

### 2. Vercel 项目根目录设置错误

**检查步骤：**
1. 进入 Vercel Dashboard
2. 项目设置 → General → Root Directory
3. 确保设置为：`final-project/backend`

### 3. 环境变量未设置

**必需的环境变量：**
- `DATABASE_URL` - MongoDB 连接字符串
- `JWT_SECRET` - JWT 密钥
- `CORS_ORIGIN` - 前端域名

### 4. 构建失败

**检查构建日志：**
1. Vercel Dashboard → Deployments
2. 点击最新的部署
3. 查看 Build Logs
4. 确认是否有错误

## ✅ 已修复的配置

1. ✅ `vercel.json` - 路由配置已更新
2. ✅ `tsconfig.json` - 已包含 `api/**/*`
3. ✅ `api/index.ts` - Serverless 入口文件已配置

## 🧪 测试步骤

### 1. 检查部署状态

```bash
# 查看 Vercel 部署日志
vercel logs
```

### 2. 测试 API 端点

```bash
# 测试健康检查
curl https://你的域名.vercel.app/api/health

# 应该返回：
# {"status":"ok","message":"AniMap API is running"}
```

### 3. 检查 Vercel 函数日志

1. Vercel Dashboard → 项目 → Functions
2. 查看 `/api/index` 函数的日志
3. 检查是否有错误信息

## 🔧 如果还是 404

### 方法 1：检查项目根目录

在 Vercel Dashboard 中：
1. Settings → General
2. Root Directory 设置为：`final-project/backend`
3. 重新部署

### 方法 2：使用 Vercel CLI 重新部署

```bash
cd final-project/backend
vercel --prod --force
```

### 方法 3：检查路由配置

确认 `vercel.json` 内容：
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
      "src": "/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

## 📝 重要提醒

- **不要访问根路径** `/`，这是一个 API 服务，没有首页
- **所有 API 路径必须以 `/api/` 开头**
- **确保环境变量已正确设置**
- **检查 MongoDB Atlas 网络访问设置（允许 0.0.0.0/0）**

