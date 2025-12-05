#!/usr/bin/env node

/**
 * 快速测试 Groq API Key 是否有效
 * 使用方法：node test-ai-key.js [你的API_KEY]
 */

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.argv[2] || process.env.LLM_API_KEY;
const API_BASE = process.env.LLM_API_BASE || 'https://api.groq.com/openai/v1';

if (!API_KEY) {
  console.error('❌ 错误：未提供 API Key');
  console.log('\n使用方法：');
  console.log('  1. 设置环境变量：export LLM_API_KEY=你的API_KEY');
  console.log('  2. 或作为参数传入：node test-ai-key.js 你的API_KEY');
  console.log('  3. 或在 .env 文件中设置 LLM_API_KEY');
  process.exit(1);
}

console.log('🔍 测试 Groq API Key...');
console.log(`📤 API Base: ${API_BASE}`);
console.log(`🔑 API Key 前缀: ${API_KEY.substring(0, 10)}...`);
console.log('');

axios.post(
  `${API_BASE}/chat/completions`,
  {
    model: 'llama-3.1-70b-versatile',
    messages: [
      { role: 'user', content: '你好，请用一句话介绍你自己' }
    ],
    max_tokens: 100,
  },
  {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  }
)
  .then((response) => {
    console.log('✅ API Key 有效！');
    console.log(`📥 响应状态: ${response.status}`);
    console.log(`🤖 AI 回复: ${response.data?.choices?.[0]?.message?.content || '无回复'}`);
    console.log('');
    console.log('✅ 测试通过！你的 API Key 可以正常使用。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ API Key 测试失败！');
    console.error('');
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.error(`❌ HTTP 状态码: ${status}`);
      console.error(`❌ 错误信息:`, JSON.stringify(data, null, 2));
      console.error('');
      
      if (status === 401) {
        console.error('💡 解决方案：');
        console.error('   - API Key 无效或已过期');
        console.error('   - 请到 https://console.groq.com/ 生成新的 API Key');
        console.error('   - 确认 API Key 格式正确（以 gsk_ 开头）');
      } else if (status === 429) {
        console.error('💡 解决方案：');
        console.error('   - API 调用频率超过限制');
        console.error('   - 请稍后再试');
      } else {
        console.error('💡 请检查：');
        console.error('   - API Key 是否正确');
        console.error('   - 网络连接是否正常');
        console.error('   - Groq API 服务是否可用');
      }
    } else if (error.request) {
      console.error('❌ 网络错误：无法连接到 Groq API');
      console.error('💡 请检查：');
      console.error('   - 网络连接');
      console.error('   - 防火墙设置');
      console.error('   - 代理设置');
    } else {
      console.error('❌ 错误：', error.message);
    }
    
    process.exit(1);
  });



