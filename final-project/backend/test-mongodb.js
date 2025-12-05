#!/usr/bin/env node

/**
 * MongoDB 连接测试脚本
 * 使用方法：node test-mongodb.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMongoDB() {
  console.log('🔍 测试 MongoDB 连接...\n');

  // 检查环境变量
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ 错误：未设置 DATABASE_URL 环境变量');
    console.log('\n请在 .env 文件中设置：');
    console.log('DATABASE_URL="mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/animap?retryWrites=true&w=majority"');
    process.exit(1);
  }

  // 隐藏密码显示连接字符串
  const safeUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`📤 连接字符串: ${safeUrl}\n`);

  try {
    // 测试连接
    console.log('1️⃣ 测试数据库连接...');
    await prisma.$connect();
    console.log('✅ 数据库连接成功！\n');

    // 测试查询（检查是否有数据）
    console.log('2️⃣ 测试查询操作...');
    const userCount = await prisma.user.count();
    console.log(`✅ 查询成功！当前用户数量: ${userCount}\n`);

    // 测试创建（创建一个测试用户，然后删除）
    console.log('3️⃣ 测试创建操作...');
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@test.com`,
        password: 'test',
        name: 'Test User'
      }
    });
    console.log(`✅ 创建成功！测试用户 ID: ${testUser.id}\n`);

    // 测试删除
    console.log('4️⃣ 测试删除操作...');
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ 删除成功！\n');

    // 测试更新
    console.log('5️⃣ 检查数据库结构...');
    const collections = await prisma.$runCommandRaw({ listCollections: 1 });
    console.log('✅ 数据库结构正常！\n');

    console.log('🎉 所有测试通过！MongoDB 连接正常，可以开始使用。\n');
    console.log('📝 下一步：');
    console.log('   1. 运行 npx prisma db push 创建所有集合');
    console.log('   2. 运行 npm run dev 启动服务器');
    console.log('   3. 测试 API 端点');

  } catch (error) {
    console.error('❌ 测试失败！\n');
    console.error('错误信息:', error.message);
    console.error('\n可能的原因：');
    console.error('  1. MongoDB Atlas 网络访问未配置（需要允许 0.0.0.0/0）');
    console.error('  2. 连接字符串格式错误');
    console.error('  3. 数据库用户权限不足');
    console.error('  4. 网络连接问题');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testMongoDB();



