import { useState, useCallback, useRef } from 'react';
import { sendStreamDeepSeekMessage, DeepSeekMessage, DEEPSEEK_ASSISTANT_ROLES } from '../services/deepseek';

export interface ChatMessage {
  id: number;
  sender: string;
  time: string;
  content: string;
  isBot: boolean;
  isStreaming?: boolean;
  isComplete?: boolean;
  role?: string;
}

export interface UseDeepSeekChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  selectedRole: string;
  sendMessage: (message: string) => void;
  setRole: (roleId: string) => void;
  regenerateLastResponse: () => void;
}

export function useDeepSeekChat(): UseDeepSeekChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('general');
  const messageIdRef = useRef(0);
  // const abortControllerRef = useRef<AbortController | null>(null);

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

  const getCurrentRole = useCallback(() => {
    return DEEPSEEK_ASSISTANT_ROLES.find(role => role.id === selectedRole) || DEEPSEEK_ASSISTANT_ROLES[0];
  }, [selectedRole]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);

    // 添加用户消息
    const userMessage: Omit<ChatMessage, 'id'> = {
      sender: 'user',
      time: new Date().toLocaleTimeString(),
      content: content.trim(),
      isBot: false,
    };
    addMessage(userMessage);

    // 添加AI消息占位符
    const botMessage: Omit<ChatMessage, 'id'> = {
      sender: 'assistant',
      time: new Date().toLocaleTimeString(),
      content: '',
      isBot: true,
      isStreaming: true,
    };
    const botMessageId = addMessage(botMessage);

    // 构建对话历史
    const conversationHistory: DeepSeekMessage[] = [
      {
        role: 'system',
        content: getCurrentRole().systemPrompt,
      },
      ...messages
        .filter(msg => msg.isComplete || msg.isBot === false)
        .map(msg => ({
          role: msg.isBot ? 'assistant' as const : 'user' as const,
          content: msg.content,
        })),
      {
        role: 'user',
        content: content.trim(),
      },
    ];

    try {
      let accumulatedContent = '';
      
      await sendStreamDeepSeekMessage(
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
          console.error('DeepSeek API Error:', error);
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
  }, [messages, isLoading, addMessage, updateMessage, getCurrentRole]);

  // const clearMessages = useCallback(() => {
  //   setMessages([]);
  //   messageIdRef.current = 0;
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort();
  //   }
  // }, []);

  const setRole = useCallback((roleId: string) => {
    setSelectedRole(roleId);
  }, []);

  const regenerateLastResponse = useCallback(async () => {
    if (messages.length === 0 || isLoading) return;

    // 找到最后一条AI消息
    const lastBotMessageIndex = messages.map((msg, index) => ({ msg, index }))
      .filter(({ msg }) => msg.isBot)
      .pop()?.index ?? -1;
    if (lastBotMessageIndex === -1) return;

    // 移除最后一条AI消息和对应的用户消息
    const newMessages = messages.slice(0, lastBotMessageIndex);
    setMessages(newMessages);

    // 重新发送最后一条用户消息
    const lastUserMessage = messages[lastBotMessageIndex - 1];
    if (lastUserMessage && !lastUserMessage.isBot) {
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, isLoading, sendMessage]);

  return {
    messages,
    isLoading,
    selectedRole,
    sendMessage,
    setRole,
    regenerateLastResponse,
  };
}












