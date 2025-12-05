#!/bin/bash

# 导出本地数据库数据
# 使用方法：./export-local-data.sh [本地数据库名称] [输出文件]

set -e

DB_NAME=${1:-animap}
OUTPUT_FILE=${2:-animap-data.sql}

# 检查 pg_dump 是否安装
if ! command -v pg_dump &> /dev/null; then
  echo "❌ 错误：未找到 pg_dump"
  echo "请安装 PostgreSQL 客户端工具"
  exit 1
fi

echo "📤 正在导出本地数据库: $DB_NAME"
echo "输出文件: $OUTPUT_FILE"
echo ""

# 读取本地 .env 文件获取数据库连接信息
if [ -f .env ]; then
  source .env
  if [ -n "$DATABASE_URL" ]; then
    echo "从 .env 读取数据库连接信息"
    pg_dump "$DATABASE_URL" --data-only --column-inserts > "$OUTPUT_FILE"
  else
    echo "⚠️  .env 中没有 DATABASE_URL，使用默认连接"
    pg_dump -h localhost -U postgres -d "$DB_NAME" --data-only --column-inserts > "$OUTPUT_FILE"
  fi
else
  echo "⚠️  未找到 .env 文件，使用默认连接"
  pg_dump -h localhost -U postgres -d "$DB_NAME" --data-only --column-inserts > "$OUTPUT_FILE"
fi

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 数据导出成功！"
  echo "文件位置: $(pwd)/$OUTPUT_FILE"
  echo ""
  echo "📝 下一步：导入到云端数据库"
  echo "  psql \"你的云端数据库连接字符串\" < $OUTPUT_FILE"
else
  echo ""
  echo "❌ 导出失败"
  exit 1
fi



