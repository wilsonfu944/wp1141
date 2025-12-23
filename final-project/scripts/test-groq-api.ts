/**
 * 测试 Groq API 配置
 * 运行方式: npx ts-node scripts/test-groq-api.ts
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGroqAPI() {
  console.log('🧪 测试 Groq API 配置...\n');

  // 1. 检查 API Key
  if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY 未设置');
    console.log('请在 .env.local 文件中添加: GROQ_API_KEY=your_api_key');
    return;
  }

  if (!GROQ_API_KEY.startsWith('gsk_')) {
    console.error('❌ API Key 格式错误');
    console.log('API Key 应该以 "gsk_" 开头');
    return;
  }

  console.log('✅ API Key 格式正确');
  console.log(`   Key 前缀: ${GROQ_API_KEY.substring(0, 10)}...\n`);

  // 2. 测试 API 调用
  console.log('📡 测试 API 连接...\n');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: '你是一個友善的AI小助手。'
          },
          {
            role: 'user',
            content: '你好，請簡單介紹一下自己。'
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    console.log(`状态码: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error('❌ API 调用失败');
      console.error('错误信息:', errorData);

      if (response.status === 401) {
        console.error('\n可能的原因:');
        console.error('1. API Key 无效或已过期');
        console.error('2. API Key 格式错误');
      } else if (response.status === 429) {
        console.error('\n可能的原因:');
        console.error('1. 请求频率过高，触发了速率限制');
        console.error('2. 请稍后再试');
      } else if (response.status === 400) {
        console.error('\n可能的原因:');
        console.error('1. 请求格式错误');
        console.error('2. 模型名称可能不正确');
      }

      return;
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('✅ API 调用成功！\n');
      console.log('AI 回复:');
      console.log(data.choices[0].message.content);
      console.log('\n✅ 配置正确，可以正常使用！');
    } else {
      console.error('❌ API 返回格式异常');
      console.error('响应数据:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ 网络错误');
    console.error('错误信息:', error instanceof Error ? error.message : String(error));
    console.error('\n可能的原因:');
    console.error('1. 网络连接问题');
    console.error('2. 无法访问 api.groq.com');
    console.error('3. 防火墙或代理设置问题');
  }
}

// 运行测试
testGroqAPI().catch(console.error);

