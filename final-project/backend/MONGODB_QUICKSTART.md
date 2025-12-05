# 🚀 MongoDB 快速开始

## ✅ 已完成的配置

1. ✅ Prisma schema 已更新为 MongoDB 版本
2. ✅ 所有模型已配置 `@db.ObjectId`
3. ✅ 已移除 `onDelete: Cascade`（MongoDB 不支持）

## 🔧 下一步操作

### 1. 更新连接字符串

在 `.env` 文件中设置：

```env
# ⚠️ 注意：添加数据库名称 "animap"
DATABASE_URL="mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/animap?retryWrites=true&w=majority"
```

**重要**：
- 连接字符串末尾需要添加 `/animap`（数据库名称）
- 添加 `?retryWrites=true&w=majority` 参数

### 2. 配置 MongoDB Atlas 网络访问

1. 登录 [MongoDB Atlas](https://cloud.mongodb.com/)
2. 进入你的 Cluster
3. 点击 **Network Access**
4. 点击 **Add IP Address**
5. 选择 **Allow Access from Anywhere**（`0.0.0.0/0`）
6. 点击 **Confirm**

### 3. 生成 Prisma Client

```bash
cd final-project/backend
npx prisma generate
```

### 4. 推送数据库结构

```bash
npx prisma db push
```

这会创建所有集合（collections）和索引。

### 5. 验证连接

```bash
npx prisma studio
```

应该能看到所有集合。

---

## 🚀 部署到 Vercel

### 1. 设置环境变量

在 Vercel Dashboard → Environment Variables：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/animap?retryWrites=true&w=majority` |

### 2. 确保 MongoDB Atlas 允许访问

- Network Access → 添加 `0.0.0.0/0`

### 3. 部署

```bash
vercel --prod
```

---

## ⚠️ 重要提醒

1. **级联删除**：MongoDB 不支持级联删除，删除用户时需要手动删除相关数据
2. **ID 生成**：MongoDB 会自动生成 ObjectId，不需要手动设置
3. **迁移数据**：如果需要迁移现有数据，需要编写迁移脚本

---

## 📚 详细文档

- **完整迁移指南**：`MONGODB_MIGRATION.md`
- **部署指南**：`VERCEL_DEPLOY.md`



