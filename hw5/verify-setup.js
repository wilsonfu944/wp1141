// OAuth 設置驗證腳本
// 運行: node verify-setup.js

require('dotenv').config({ path: '.env' });

console.log('\n🔍 檢查 X 社群平台環境配置...\n');

const checks = {
  'PostgreSQL 數據庫': process.env.DATABASE_URL,
  'NextAuth 密鑰': process.env.NEXTAUTH_SECRET,
  'NextAuth URL': process.env.NEXTAUTH_URL,
  'Google Client ID': process.env.GOOGLE_CLIENT_ID,
  'Google Client Secret': process.env.GOOGLE_CLIENT_SECRET,
  'GitHub Client ID': process.env.GITHUB_ID,
  'GitHub Client Secret': process.env.GITHUB_SECRET,
  'Pusher Key': process.env.NEXT_PUBLIC_PUSHER_KEY,
  'Pusher Cluster': process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  'Pusher App ID': process.env.PUSHER_APP_ID,
  'Pusher Secret': process.env.PUSHER_SECRET,
};

let allPassed = true;
let criticalPassed = true;

Object.entries(checks).forEach(([name, value]) => {
  const isCritical = !name.includes('Facebook');
  const isSet = value && value !== 'your-google-client-id' && value !== 'your-github-id' && value !== 'your-pusher-key' && value !== 'your-pusher-cluster' && value !== 'your-pusher-app-id' && value !== 'your-pusher-secret';
  
  if (isSet) {
    console.log(`✅ ${name}: 已設置`);
    if (name.includes('Client ID') || name.includes('Key')) {
      console.log(`   ${value.substring(0, 20)}...`);
    }
  } else {
    if (isCritical) {
      console.log(`❌ ${name}: 未設置或使用占位符`);
      criticalPassed = false;
    } else {
      console.log(`⚠️  ${name}: 未設置（可選）`);
    }
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50) + '\n');

if (criticalPassed) {
  console.log('✅ 所有必要的環境變數都已正確設置！');
  console.log('\n📝 OAuth 回調 URL 檢查清單：');
  console.log('\n   Google OAuth:');
  console.log('   ✓ 在 Google Cloud Console 添加:');
  console.log('     http://localhost:3000/api/auth/callback/google');
  console.log('\n   GitHub OAuth:');
  console.log('   ✓ 在 GitHub OAuth App 添加:');
  console.log('     http://localhost:3000/api/auth/callback/github');
  console.log('\n🚀 現在可以運行: npm run dev');
  console.log('   然後訪問: http://localhost:3000\n');
} else {
  console.log('❌ 還有必要的環境變數未設置');
  console.log('\n請查看 ENV_SETUP.md 獲取詳細設置指南\n');
}



