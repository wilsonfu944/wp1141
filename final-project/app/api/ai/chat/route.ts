import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set in environment variables');
      return NextResponse.json(
        { 
          error: 'AI service is not configured',
          details: 'GROQ_API_KEY environment variable is missing. Please add it to your Vercel environment variables or .env.local file.'
        },
        { status: 500 }
      );
    }

    // 验证 API Key 格式
    if (!GROQ_API_KEY.startsWith('gsk_')) {
      console.error('GROQ_API_KEY format is invalid');
      return NextResponse.json(
        { 
          error: 'Invalid API key format',
          details: 'GROQ_API_KEY should start with "gsk_"'
        },
        { status: 500 }
      );
    }

    // 构建消息历史
    const messages: Array<{ role: string; content: string }> = [];
    
    // 添加系统提示（作为第一个 user message，因为某些模型可能不支持 system role）
    // 或者尝试使用 system role
    try {
      messages.push({
        role: 'system',
        content: '你是一個友善的AI小助手，專門幫助用戶解答關於動漫、景點和行程規劃的問題。請用繁體中文回答，語氣要親切友善。'
      });
    } catch (e) {
      // 如果 system role 不支持，则跳过
    }

    // 添加对话历史（如果有）
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      // 只取最近10条消息，避免超过token限制
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach((msg: any) => {
        if (msg && typeof msg === 'object' && (msg.role === 'user' || msg.role === 'assistant')) {
          if (typeof msg.content === 'string' && msg.content.trim()) {
            messages.push({
              role: msg.role,
              content: msg.content.trim()
            });
          }
        }
      });
    }

    // 添加当前用户消息
    if (typeof message === 'string' && message.trim()) {
      messages.push({
        role: 'user',
        content: message.trim()
      });
    }

    // 验证消息格式
    if (messages.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid message format',
          details: 'No valid messages to send'
        },
        { status: 400 }
      );
    }

    // 确保至少有一条 user message
    const hasUserMessage = messages.some(msg => msg.role === 'user');
    if (!hasUserMessage) {
      return NextResponse.json(
        { 
          error: 'Invalid message format',
          details: 'At least one user message is required'
        },
        { status: 400 }
      );
    }

    // 准备请求体 - 移除 system role，因为某些模型可能不支持
    const cleanMessages = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

    // 如果没有消息，返回错误
    if (cleanMessages.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid message format',
          details: 'No valid messages to send'
        },
        { status: 400 }
      );
    }

    // 将 system prompt 添加到第一条 user message
    const systemPrompt = '你是一個友善的AI小助手，專門幫助用戶解答關於動漫、景點和行程規劃的問題。請用繁體中文回答，語氣要親切友善。';
    if (cleanMessages[0]?.role === 'user') {
      cleanMessages[0].content = `${systemPrompt}\n\n${cleanMessages[0].content}`;
    }

    const requestBody = {
      model: 'llama-3.1-8b-instant', // 尝试更新的模型名称
      messages: cleanMessages,
      temperature: 0.7,
      max_tokens: 1024,
    };

    console.log('Calling Groq API with:', {
      model: requestBody.model,
      messageCount: requestBody.messages.length,
      firstMessageRole: requestBody.messages[0]?.role,
      hasApiKey: !!GROQ_API_KEY
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorText = '';
      let errorData = null;
      try {
        errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (e) {
        // 如果无法解析为 JSON，使用原始文本
        errorData = { message: errorText };
      }
      
      console.error('Groq API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        hasApiKey: !!GROQ_API_KEY,
        apiKeyPrefix: GROQ_API_KEY ? GROQ_API_KEY.substring(0, 10) + '...' : 'missing'
      });
      
      // 根据错误类型返回不同的错误信息
      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: 'AI service authentication failed. Please check your API key.',
            details: errorData?.message || 'Unauthorized'
          },
          { status: 500 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { 
            error: 'AI service is temporarily unavailable. Please try again later.',
            details: 'Rate limit exceeded'
          },
          { status: 429 }
        );
      } else if (response.status === 400) {
        console.error('Bad Request details:', {
          errorData,
          requestBody: {
            model: requestBody.model,
            messageCount: requestBody.messages.length,
            messages: requestBody.messages.map(m => ({ role: m.role, contentLength: m.content.length }))
          }
        });
        return NextResponse.json(
          { 
            error: 'Invalid request to AI service',
            details: errorData?.message || errorData?.error?.message || 'Bad request - Please check the request format'
          },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { 
            error: 'Failed to get AI response',
            details: errorData?.message || `HTTP ${response.status}: ${response.statusText}`
          },
          { status: 500 }
        );
      }
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response from Groq API:', data);
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({
      response: aiResponse
    });

  } catch (error) {
    console.error('Error calling Groq API:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

