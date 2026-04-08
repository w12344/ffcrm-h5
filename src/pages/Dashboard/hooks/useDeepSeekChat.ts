import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '../../../types';
import { sendStreamChatMessage, OpenAIMessage } from '../../../services/openai';

export interface UseDeepSeekChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: string) => void;
  clearMessages: () => void;
}

export function useDeepSeekChat(): UseDeepSeekChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageIdRef = useRef(0);

  const generateId = () => ++messageIdRef.current;

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((id: number, updates: Partial<ChatMessage>) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // 添加用户消息
    const userMessage: Omit<ChatMessage, 'id'> = {
      sender: '用户',
      time: new Date().toLocaleTimeString(),
      content: content.trim(),
      isBot: false,
    };
    addMessage(userMessage);

    // 添加机器人消息占位符
    const botMessageId = addMessage({
      sender: 'FFAI',
      time: new Date().toLocaleTimeString(),
      content: '',
      isBot: true,
      isStreaming: true,
      isComplete: false,
    });

    setIsLoading(true);

    // 构建对话历史
    const conversationHistory: OpenAIMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的CRM顾问助手，帮助用户分析客户数据、提供业务建议和解答相关问题。请用专业、友好的语气回答用户的问题。'
      },
      ...messages.map(msg => ({
        role: msg.isBot ? 'assistant' as const : 'user' as const,
        content: msg.content,
      })),
      {
        role: 'user',
        content: content.trim(),
      }
    ];

    try {
      let accumulatedContent = '';
      
      await sendStreamChatMessage(
        conversationHistory,
        // 处理流式数据块
        (chunk: string) => {
          accumulatedContent += chunk;
          updateMessage(botMessageId, {
            content: accumulatedContent,
          });
        },
        // 流式完成
        (fullResponse: string) => {
          updateMessage(botMessageId, {
            content: fullResponse,
            isStreaming: false,
            isComplete: true,
          });
          setIsLoading(false);
        },
        // 错误处理
        (error: Error) => {
          console.error('OpenAI API Error:', error);
          updateMessage(botMessageId, {
            content: `抱歉，发生了错误：${error.message}`,
            isStreaming: false,
            isComplete: true,
          });
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      updateMessage(botMessageId, {
        content: '抱歉，发生了意外错误，请稍后重试。',
        isStreaming: false,
        isComplete: true,
      });
      setIsLoading(false);
    }
  }, [messages, isLoading, addMessage, updateMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    messageIdRef.current = 0;
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
