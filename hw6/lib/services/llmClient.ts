import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMError } from '../errors';
import { log } from '../logger';

const getGeminiClient = () => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY);
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateResponse(
  messages: Message[],
  systemPrompt?: string
): Promise<string> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Convert messages to Gemini format
    const prompt = buildPrompt(messages, systemPrompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new LLMError('Empty response from Gemini');
    }

    return text.trim();
  } catch (error: unknown) {
    log.error('Gemini API error', { error });

    // Handle specific error types
    if (error && typeof error === 'object') {
      // Check for 404 (model not found)
      if ('status' in error && error.status === 404) {
        throw new LLMError('模型不存在或無法使用，請檢查模型名稱設定', error);
      }
      // Check for 429 (rate limit)
      if ('status' in error && error.status === 429) {
        throw new LLMError('API 配額已用完或達到速率限制，請稍後再試', error);
      }
      // Check for 503 (service unavailable)
      if ('status' in error && error.status === 503) {
        throw new LLMError('服務暫時不可用，請稍後再試', error);
      }
    }

    // Handle error messages
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate limit')) {
        throw new LLMError('API 配額已用完或達到速率限制，請稍後再試', error);
      }
      if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('Not Found')) {
        throw new LLMError('模型不存在或無法使用，請檢查模型名稱設定', error);
      }
      if (error.message.includes('503') || error.message.includes('unavailable')) {
        throw new LLMError('服務暫時不可用，請稍後再試', error);
      }
    }

    throw new LLMError('無法生成回應，請稍後再試', error);
  }
}

function buildPrompt(messages: Message[], systemPrompt?: string): string {
  let prompt = '';

  if (systemPrompt) {
    prompt += `${systemPrompt}\n\n`;
  }

  // Convert conversation history
  for (const msg of messages) {
    if (msg.role === 'system') {
      continue; // System messages are handled above
    }
    const role = msg.role === 'user' ? '玩家' : '莊家';
    prompt += `${role}: ${msg.content}\n`;
  }

  prompt += '莊家: ';

  return prompt;
}

