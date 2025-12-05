# 🍃 MongoDB 迁移指南

## 📋 概述

你的 MongoDB Atlas 连接字符串：
```
mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/?appName=Cluster0
```

**注意**：需要添加数据库名称，完整格式应该是：
```
mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/animap?retryWrites=true&w=majority
```

---

## ⚠️ 重要注意事项

### MongoDB 与 PostgreSQL 的差异

1. **不支持级联删除**：MongoDB 不支持 `onDelete: Cascade`，需要手动处理
2. **ID 类型**：MongoDB 使用 `ObjectId`，不是 `cuid()`
3. **关系处理**：MongoDB 的关系是引用，不是外键约束
4. **迁移方式**：不能直接使用 `prisma migrate`，需要使用 `prisma db push`

---

## 🚀 迁移步骤

### 步骤 1：备份当前 schema（可选）

```bash
cd final-project/backend
cp prisma/schema.prisma prisma/schema.postgresql.backup.prisma
```

### 步骤 2：替换为 MongoDB schema

```bash
# 备份原文件
mv prisma/schema.prisma prisma/schema.postgresql.prisma

# 使用 MongoDB schema
cp prisma/schema.mongodb.prisma prisma/schema.prisma
```

或者直接编辑 `prisma/schema.prisma`，将：
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

改为：
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

然后为所有 ID 字段添加 `@db.ObjectId` 和 `@default(auto())`。

### 步骤 3：更新连接字符串

在 `.env` 文件中设置：

```env
# MongoDB Atlas 连接字符串
# 注意：添加数据库名称 "animap"
DATABASE_URL="mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/animap?retryWrites=true&w=majority"
```

**重要**：
- 连接字符串末尾需要添加数据库名称（如 `/animap`）
- 添加 `?retryWrites=true&w=majority` 参数

### 步骤 4：配置 MongoDB Atlas

1. **允许网络访问**：
   - 登录 [MongoDB Atlas](https://cloud.mongodb.com/)
   - Network Access → Add IP Address
   - 添加 `0.0.0.0/0`（允许所有 IP，用于 Vercel 部署）

2. **创建数据库用户**（如果还没有）：
   - Database Access → Add New Database User
   - 用户名：`wilsonfu944`
   - 密码：`Aa101130091512`
   - 权限：Read and write to any database

### 步骤 5：生成 Prisma Client

```bash
cd final-project/backend
npx prisma generate
```

### 步骤 6：推送数据库结构

```bash
# 使用 db push（MongoDB 不支持 migrate）
npx prisma db push
```

这会创建所有集合（collections）和索引。

### 步骤 7：验证连接

```bash
# 打开 Prisma Studio 查看数据
npx prisma studio
```

### 步骤 8：更新代码（如果需要）

检查代码中是否有使用 PostgreSQL 特定功能的地方，MongoDB 可能需要调整。

---

## 🔧 在 Vercel 部署

### 1. 设置环境变量

在 Vercel Dashboard → Environment Variables：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/animap?retryWrites=true&w=majority` |

### 2. 确保 MongoDB Atlas 允许访问

- Network Access → 添加 `0.0.0.0/0`（允许所有 IP）

### 3. 部署

```bash
vercel --prod
```

---

## 📝 Schema 主要变更

### ID 字段变更

**PostgreSQL**:
```prisma
id String @id @default(cuid())
```

**MongoDB**:
```prisma
id String @id @default(auto()) @map("_id") @db.ObjectId
```

### 关系字段变更

**PostgreSQL**:
```prisma
userId String
user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

**MongoDB**:
```prisma
userId String @db.ObjectId
user   User @relation(fields: [userId], references: [id])
// 注意：移除了 onDelete: Cascade
```

---

## ⚠️ 代码调整注意事项

### 1. 级联删除

MongoDB 不支持级联删除，需要手动处理：

```typescript
// 删除用户时，需要手动删除相关数据
async function deleteUser(userId: string) {
  await prisma.$transaction([
    prisma.favorite.deleteMany({ where: { userId } }),
    prisma.comment.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}
```

### 2. ID 生成

MongoDB 会自动生成 ObjectId，不需要手动生成：

```typescript
// ✅ 正确
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    password: 'hashed',
    // id 会自动生成
  }
});

// ❌ 不需要手动设置 id
```

### 3. 查询语法

大部分 Prisma 查询语法相同，但某些高级功能可能不同。

---

## 🔍 验证迁移

### 1. 测试连接

```bash
export DATABASE_URL="mongodb+srv://..."
npx prisma db pull
```

如果成功，说明连接正常。

### 2. 检查集合

```bash
npx prisma studio
```

应该能看到所有集合（collections）。

### 3. 测试 CRUD 操作

```typescript
// 创建用户
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    password: 'hashed',
    name: 'Test User'
  }
});

// 查询用户
const users = await prisma.user.findMany();
```

---

## 🆘 常见问题

### Q: `db push` 失败？

**A**: 
- 检查连接字符串格式
- 确认 MongoDB Atlas 网络访问已配置
- 确认数据库用户权限正确

### Q: 如何迁移现有数据？

**A**: 
- 使用 MongoDB Compass 或 `mongoimport` 导入数据
- 或者编写迁移脚本，从 PostgreSQL 读取，写入 MongoDB

### Q: 可以同时使用 PostgreSQL 和 MongoDB 吗？

**A**: 
- 技术上可以，但不推荐
- 建议选择一个数据库并保持一致

### Q: 性能如何？

**A**: 
- MongoDB 对于文档型数据性能很好
- 对于复杂关系查询，PostgreSQL 可能更快
- 根据你的使用场景选择

---

## 📚 相关资源

- [Prisma MongoDB 文档](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [MongoDB Atlas 文档](https://docs.atlas.mongodb.com/)
- [MongoDB 连接字符串格式](https://docs.mongodb.com/manual/reference/connection-string/)

---

## ✅ 迁移检查清单

- [ ] 已备份 PostgreSQL schema
- [ ] 已更新 `schema.prisma` 为 MongoDB 版本
- [ ] 已更新 `DATABASE_URL` 连接字符串（包含数据库名称）
- [ ] MongoDB Atlas 网络访问已配置（允许 0.0.0.0/0）
- [ ] 已运行 `npx prisma generate`
- [ ] 已运行 `npx prisma db push`
- [ ] 已验证连接（`npx prisma studio`）
- [ ] 已测试基本 CRUD 操作
- [ ] 已更新 Vercel 环境变量
- [ ] 已部署并测试



