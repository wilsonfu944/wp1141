#!/bin/bash

# 数据库迁移脚本 - 从本地迁移到云端
# 使用方法：./migrate-to-cloud.sh [云端数据库URL]

set -e

CLOUD_DB_URL=$1

if [ -z "$CLOUD_DB_URL" ]; then
  echo "❌ 错误：请提供云端数据库连接字符串"
  echo ""
  echo "使用方法："
  echo "  ./migrate-to-cloud.sh 'postgresql://user:password@host:5432/dbname'"
  echo ""
  echo "或者设置环境变量："
  echo "  export DATABASE_URL='你的连接字符串'"
  echo "  ./migrate-to-cloud.sh"
  exit 1
fi

echo "🚀 开始迁移数据库到云端..."
echo ""

# 检查 Prisma 是否安装
if ! command -v npx &> /dev/null; then
  echo "❌ 错误：未找到 npx，请先安装 Node.js"
  exit 1
fi

# 设置环境变量
export DATABASE_URL="$CLOUD_DB_URL"

echo "📋 步骤 1: 生成 Prisma Client..."
npx prisma generate

echo ""
echo "📋 步骤 2: 推送数据库结构到云端..."
echo "⚠️  这将创建所有表结构（不会删除现有数据）"
read -p "继续？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 已取消"
  exit 1
fi

npx prisma db push --accept-data-loss

echo ""
echo "✅ 数据库结构迁移完成！"
echo ""
echo "📋 步骤 3: 验证迁移..."
echo "正在打开 Prisma Studio 进行验证..."
echo "（按 Ctrl+C 关闭 Prisma Studio）"
echo ""

npx prisma studio

echo ""
echo "✅ 迁移完成！"
echo ""
echo "📝 下一步："
echo "1. 在 Vercel Dashboard 设置环境变量 DATABASE_URL"
echo "2. 如果需要迁移数据，使用 pg_dump 导出本地数据"
echo "3. 使用 psql 导入到云端数据库"
echo ""
echo "示例命令："
echo "  pg_dump -h localhost -U postgres -d animap --data-only > data.sql"
echo "  psql \"$CLOUD_DB_URL\" < data.sql"



