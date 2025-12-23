import Groq from 'groq-sdk';
import { LLMError } from '../errors';
import { log } from '../logger';

const getGroqClient = () => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  return new Groq({ apiKey: GROQ_API_KEY });
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
    const groq = getGroqClient();
    
    // Prepare messages for Groq API
    const groqMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      groqMessages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
    
    // Convert conversation history to Groq format
    for (const msg of messages) {
      if (msg.role === 'system') {
        continue; // System messages are handled above
      }
      groqMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    // Use llama-3.1-8b-instant (stable and high-performance model)
    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new LLMError('Empty response from Groq');
    }

    return text.trim();
  } catch (error: unknown) {
    log.error('Groq API error', { error });

    // Handle specific error types
    if (error && typeof error === 'object') {
      // Check for 400 (bad request - model disabled or invalid)
      if ('status' in error && error.status === 400) {
        throw new LLMError('模型已停用或請求無效，請檢查模型設定', error);
      }
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
      if (error.message.includes('400') || error.message.includes('Bad Request') || error.message.includes('disabled')) {
        throw new LLMError('模型已停用或請求無效，請檢查模型設定', error);
      }
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
