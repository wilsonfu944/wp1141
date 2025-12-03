import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import axios from 'axios';
import { z } from 'zod';

const router = Router();

const LLM_API_KEY = process.env.LLM_API_KEY || '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';
const LLM_API_BASE = process.env.LLM_API_BASE || 'https://api.groq.com/openai/v1';

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
    const { message, conversationHistory = [] } = chatSchema.parse(req.body);
    const userId = req.user!.userId;

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

    const aiResponse = response.data?.choices?.[0]?.message?.content || '抱歉，我暫時無法回答這個問題。';
    
    if (!aiResponse || aiResponse.trim() === '') {
      throw new Error('AI returned empty response');
    }

    res.json({
      response: aiResponse,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
    }
    res.status(500).json({ 
      error: 'AI服務暫時無法使用，請稍後再試',
      response: '抱歉，我現在有點忙，請稍後再來找我聊天吧！😊'
    });
  }
});

export default router;

