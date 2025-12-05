import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import axios from 'axios';
import { z } from 'zod';

const router = Router();

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_API_BASE = process.env.LLM_API_BASE || 'https://api.groq.com/openai/v1';

// 验证 API Key 是否存在
if (!LLM_API_KEY) {
  console.warn('⚠️  LLM_API_KEY 未设置！AI 功能将无法使用。请在环境变量中设置 LLM_API_KEY。');
}

const chatSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

// AI 客服小精靈
router.post('/chat', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // 檢查 API Key
    if (!LLM_API_KEY) {
      console.error('❌ LLM_API_KEY 未設置');
      return res.status(500).json({ 
        error: 'AI服務配置錯誤',
        response: '抱歉，AI 服務尚未配置完成，請聯繫管理員。',
        details: 'LLM_API_KEY 環境變數未設置'
      });
    }

    const { message, conversationHistory = [] } = chatSchema.parse(req.body);
    const userId = req.user!.userId;

    console.log(`🤖 AI Chat Request - User: ${userId}, Message: ${message.substring(0, 50)}...`);

    // 構建系統提示詞
    const systemPrompt = `你是一個友善的動漫聖地巡禮助手小精靈，名字叫「AniMap小精靈」。你的職責是：

1. 幫助用戶了解AniMap平台的功能和使用方法
2. 回答關於動漫聖地巡禮的問題
3. 協助用戶尋找旅伴和規劃行程
4. 提供動畫和地點相關的資訊
5. 用友善、活潑、可愛的語氣回答問題，就像一個小精靈一樣

請用繁體中文回答，語氣要親切可愛，可以使用一些表情符號讓回答更生動。`;

    // 構建消息列表
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // 只保留最近10條對話歷史
      { role: 'user', content: message },
    ];

    console.log(`📤 調用 Groq API: ${LLM_API_BASE}/chat/completions`);
    console.log(`🔑 API Key 前綴: ${LLM_API_KEY.substring(0, 10)}...`);

    // 調用 Groq API
    const response = await axios.post(
      `${LLM_API_BASE}/chat/completions`,
      {
        model: 'llama-3.1-70b-versatile', // 使用 Groq 支持的模型
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${LLM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30秒超时
      }
    );

    console.log(`✅ Groq API 響應狀態: ${response.status}`);
    console.log(`📥 響應數據:`, JSON.stringify(response.data, null, 2).substring(0, 200));

    const aiResponse = response.data?.choices?.[0]?.message?.content || '抱歉，我暫時無法回答這個問題。';
    
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('❌ AI 返回空響應');
      throw new Error('AI returned empty response');
    }

    console.log(`✅ AI 響應成功，長度: ${aiResponse.length} 字符`);

    res.json({
      response: aiResponse,
    });
  } catch (error) {
    console.error('❌ AI chat error:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const errorData = error.response?.data;
      
      console.error(`❌ HTTP Error: ${status} ${statusText}`);
      console.error(`❌ Error Data:`, JSON.stringify(errorData, null, 2));
      
      // 根據不同的錯誤類型返回不同的錯誤信息
      if (status === 401) {
        return res.status(500).json({ 
          error: 'API 認證失敗',
          response: '抱歉，AI 服務認證失敗，請檢查 API Key 是否正確。',
          details: 'Invalid API Key'
        });
      } else if (status === 429) {
        return res.status(500).json({ 
          error: '請求過於頻繁',
          response: '抱歉，請求太頻繁了，請稍後再試！😊',
          details: 'Rate limit exceeded'
        });
      } else if (status === 400) {
        return res.status(500).json({ 
          error: '請求格式錯誤',
          response: '抱歉，我無法理解這個請求，請換個方式問問看！😊',
          details: errorData
        });
      } else {
        return res.status(500).json({ 
          error: 'AI服務暫時無法使用，請稍後再試',
          response: '抱歉，我現在有點忙，請稍後再來找我聊天吧！😊',
          details: errorData || error.message
        });
      }
    }
    
    // 非 HTTP 錯誤（網絡錯誤、超時等）
    res.status(500).json({ 
      error: 'AI服務暫時無法使用，請稍後再試',
      response: '抱歉，我現在有點忙，請稍後再來找我聊天吧！😊',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

