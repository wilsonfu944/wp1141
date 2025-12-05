# 🚀 快速部署指南

## 📋 部署前检查清单

- [ ] 已创建云端数据库（Vercel Postgres / Supabase / Neon）
- [ ] 已获取数据库连接字符串
- [ ] 已迁移数据库结构到云端
- [ ] （可选）已迁移数据到云端
- [ ] 已准备所有环境变量

---

## ⚡ 5 分钟快速部署

### 步骤 1：创建云端数据库（2 分钟）

#### 选项 A：Vercel Postgres（最简单）

1. Vercel Dashboard → 项目 → **Storage** → **Create Database** → **Postgres**
2. 选择区域（推荐：`ap-northeast-1` 东京）
3. 创建后，复制 **POSTGRES_PRISMA_URL**

#### 选项 B：Supabase（免费额度大）

1. 访问 https://supabase.com/ → **New Project**
2. 设置密码，选择区域（推荐：Tokyo）
3. Settings → Database → Connection string → **URI**
4. 复制并替换 `[YOUR-PASSWORD]`

### 步骤 2：迁移数据库结构（1 分钟）

```bash
cd final-project/backend

# 设置云端数据库 URL
export DATABASE_URL="你的云端数据库连接字符串"

# 推送数据库结构
npx prisma db push
```

### 步骤 3：设置 Vercel 环境变量（1 分钟）

在 Vercel Dashboard → 项目 → Settings → Environment Variables：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | 你的云端数据库连接字符串 | ⚠️ 必需 |
| `JWT_SECRET` | 随机字符串（`openssl rand -base64 32`） | ⚠️ 必需 |
| `CORS_ORIGIN` | `https://你的前端域名.vercel.app` | ⚠️ 必需 |
| `LLM_API_KEY` | 你的 Groq API Key | 可选 |

### 步骤 4：部署（1 分钟）

```bash
cd final-project/backend

# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

---

## 🔍 验证部署

```bash
# 测试健康检查
curl https://你的域名.vercel.app/api/health

# 应该返回：
# {"status":"ok","message":"AniMap API is running"}
```

---

## ❓ 常见问题

### Q: 数据库连接失败？

**A**: 
- 确认 `DATABASE_URL` 已正确设置
- 确认连接字符串包含 SSL 参数（`?sslmode=require`）
- 在本地测试：`export DATABASE_URL="..." && npx prisma db pull`

### Q: 如何迁移现有数据？

**A**: 
```bash
# 1. 导出本地数据
./export-local-data.sh

# 2. 导入到云端
psql "你的云端数据库连接字符串" < animap-data.sql
```

### Q: 部署后 API 返回 500 错误？

**A**: 
- 检查 Vercel 函数日志
- 确认所有环境变量已设置
- 确认数据库连接正常

---

## 📚 详细文档

- **完整部署指南**：`VERCEL_DEPLOY.md`
- **数据库迁移指南**：`DATABASE_MIGRATION.md`
- **API 路由清单**：`API_ROUTES.md`

---

## 🆘 需要帮助？

如果遇到问题，请检查：

1. ✅ 数据库连接字符串格式正确
2. ✅ 环境变量已添加到 Vercel
3. ✅ 数据库结构已迁移
4. ✅ Vercel 函数日志中的错误信息



