// DeepSeek API 服务
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = 'sk-7572e9c2f6084f9a8201b1a0e12b76ba';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

// 普通聊天请求
export async function sendDeepSeekMessage(
  messages: DeepSeekMessage[],
  onSuccess?: (response: DeepSeekResponse) => void,
  onError?: (error: Error) => void
): Promise<DeepSeekResponse | null> {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error! status: ${response.status}, message: ${errorText}`);
    }

    const data: DeepSeekResponse = await response.json();
    onSuccess?.(data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error : new Error('Unknown error');
    onError?.(errorMessage);
    return null;
  }
}

// 流式聊天请求
export async function sendStreamDeepSeekMessage(
  messages: DeepSeekMessage[],
  onChunk?: (chunk: string) => void,
  onComplete?: (fullResponse: string) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error! status: ${response.status}, message: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            onComplete?.(fullResponse);
            return;
          }

          try {
            const parsed: DeepSeekStreamResponse = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            
            if (content) {
              fullResponse += content;
              onChunk?.(content);
            }
          } catch (e) {
            // 忽略解析错误，继续处理下一行
            console.warn('Failed to parse chunk:', data);
          }
        }
      }
    }

    onComplete?.(fullResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error : new Error('Unknown error');
    onError?.(errorMessage);
  }
}

// 获取可用的DeepSeek模型列表
export const DEEPSEEK_MODELS = [
  { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'DeepSeek 对话模型' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'DeepSeek 代码模型' },
];

// 预设的AI助手角色
export const DEEPSEEK_ASSISTANT_ROLES = [
  {
    id: 'general',
    name: '通用助手',
    description: '帮助您解决各种问题',
    systemPrompt: '你是一个智能助手，能够帮助用户解决各种问题。请用友好、专业的语气回答用户的问题。'
  },
  {
    id: 'crm',
    name: 'CRM专家',
    description: '专业的客户关系管理顾问',
    systemPrompt: '你是一个专业的CRM顾问，擅长客户关系管理、销售流程优化、客户数据分析等。请用专业、友好的语气为用户提供CRM相关的建议和解决方案。'
  },
  {
    id: 'business',
    name: '商业顾问',
    description: '提供商业策略和运营建议',
    systemPrompt: '你是一个经验丰富的商业顾问，能够为用户提供商业策略、市场分析、运营优化等方面的专业建议。'
  },
  {
    id: 'tech',
    name: '技术专家',
    description: '解决技术问题和提供技术方案',
    systemPrompt: '你是一个技术专家，擅长各种编程语言、技术架构、系统设计等。请用专业、清晰的语言为用户提供技术解决方案。'
  }
];