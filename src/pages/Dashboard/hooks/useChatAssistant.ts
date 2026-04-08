import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import {
  fetchChatStream,
  ChatStreamParams,
  fetchChatHistory,
  cancelChat,
} from "../../../services/chat";
import { formatChatTime } from "../../../utils/dateFormat";

export interface UseChatAssistantReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  conversationId: string;
  sendMessage: (
    message: string,
    customerProfileId?: string,
    isInitialAiAnalysis?: boolean
  ) => void;
  clearMessages: () => void;
  loadConversation: (conversationId: string) => void;
  hideAllFollowUpQuestions: () => void; // 新增：隐藏所有接着问按钮
  cancelCurrentChat: () => Promise<void>; // 新增：取消当前聊天
}

export function useChatAssistant(initialMessages: ChatMessage[] = []): UseChatAssistantReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [currentChatId, setCurrentChatId] = useState<string>(""); // 当前聊天ID
  const messageIdRef = useRef(0);
  const isInitializedRef = useRef(false); // 防止重复初始化
  const abortControllerRef = useRef<AbortController | null>(null); // 用于终止fetch请求

  const generateId = () => ++messageIdRef.current;

  const addMessage = useCallback((message: Omit<ChatMessage, "id">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback(
    (id: number, updates: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
      );
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string, customerProfileId?: string) => {
      if (!content.trim() || isLoading) return;

      // 添加用户消息
      const now = new Date();
      const userMessage: Omit<ChatMessage, "id"> = {
        sender: "用户",
        time: formatChatTime(now),
        content: content.trim(),
        isBot: false,
      };
      addMessage(userMessage);

      // 添加机器人消息占位符，初始状态为思考中
      const botMessageId = addMessage({
        sender: "VanAI",
        time: formatChatTime(now),
        content: "",
        isBot: true,
        isStreaming: true,
        isComplete: false,
        thinkingStatus: "thinking",
        thinkingProgress: "正在深度思考中...",
      });

      setIsLoading(true);

      // 创建新的AbortController用于取消请求
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // 构建请求参数
        const params: ChatStreamParams = {
          query: content.trim(),
          // conversationId 逻辑：
          // 1. 如果已经有 conversationId，继续当前会话（即使是 AI 分析请求）
          // 2. 如果没有 conversationId，创建新会话
          // 3. 只有在点击"新会话"按钮时，conversationId 才会被清空
          conversationId: conversationId || undefined,
        };

        // 只有在提供了customerProfileId时才添加到参数中
        if (customerProfileId) {
          params.customerProfileId = customerProfileId;
        }

        // 累积的消息内容
        let accumulatedContent = "";
        // 累积的深度思考内容
        let accumulatedReasoningContent = "";
        // 累积的追问问题
        let followUpQuestions: string[] = [];

        // 思考进度文本数组
        const thinkingProgressTexts = [
          "正在深度思考中...",
          "分析问题背景...",
          "整理相关信息...",
          "构建回答框架...",
          "优化回答内容...",
          "即将完成思考...",
        ];
        let currentProgressIndex = 0;

        // 缓冲区和节流控制
        let updateBuffer = "";
        let lastUpdateTime = Date.now();
        let pendingUpdate = false;
        const UPDATE_INTERVAL = 80; // 每80ms最多更新一次，给 Markdown 渲染更多时间

        // 节流更新函数 - 优化流式markdown渲染
        const throttledUpdate = () => {
          if (pendingUpdate) return;

          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdateTime;

          // 检查是否有足够的内容进行更新
          const hasEnoughContent =
            updateBuffer.length >= 10 ||
            updateBuffer.includes("\n") ||
            updateBuffer.includes(" ") ||
            timeSinceLastUpdate >= UPDATE_INTERVAL * 2; // 强制更新间隔

          if (timeSinceLastUpdate >= UPDATE_INTERVAL && hasEnoughContent) {
            // 立即更新
            updateMessage(botMessageId, {
              content: accumulatedContent,
              reasoningContent: accumulatedReasoningContent,
              isStreaming: true,
              isComplete: false,
            });
            lastUpdateTime = now;
            updateBuffer = "";
          } else if (timeSinceLastUpdate >= UPDATE_INTERVAL * 2) {
            // 强制更新，避免长时间不更新
            updateMessage(botMessageId, {
              content: accumulatedContent,
              reasoningContent: accumulatedReasoningContent,
              isStreaming: true,
              isComplete: false,
            });
            lastUpdateTime = now;
            updateBuffer = "";
          } else {
            // 延迟更新
            pendingUpdate = true;
            setTimeout(() => {
              updateMessage(botMessageId, {
                content: accumulatedContent,
                reasoningContent: accumulatedReasoningContent,
                isStreaming: true,
                isComplete: false,
              });
              lastUpdateTime = Date.now();
              updateBuffer = "";
              pendingUpdate = false;
            }, UPDATE_INTERVAL - timeSinceLastUpdate);
          }
        };

        // 调用流式聊天接口
        await fetchChatStream(
          params,
          // onMessage: 处理每个流式数据块
          (data) => {
            console.log("📨 收到流式数据:", data);

            // 保存conversationId和chatId（从第一条消息中获取）
            if (data.conversation_id && !conversationId) {
              console.log("💾 保存conversationId:", data.conversation_id);
              setConversationId(data.conversation_id);
            }
            if (data.chat_id && !currentChatId) {
              console.log("💾 保存chatId:", data.chat_id);
              setCurrentChatId(data.chat_id);
            }

            // 处理追问问题 (type="follow_up")
            if (data.type === "follow_up" && data.content) {
              console.log("💡 收到追问问题:", data.content);
              followUpQuestions.push(data.content);

              // 更新消息，添加追问问题
              updateMessage(botMessageId, {
                followUpQuestions: [...followUpQuestions],
              });
              return;
            }

            // 分别处理深度思考内容和正式回答内容
            const reasoningChunk = data.reasoning_content || "";
            const contentChunk = data.content || "";

            // 处理深度思考内容
            if (reasoningChunk) {
              accumulatedReasoningContent += reasoningChunk;
              updateBuffer += reasoningChunk;

              // 动态更新思考进度文本
              const progressText =
                thinkingProgressTexts[
                  currentProgressIndex % thinkingProgressTexts.length
                ];
              currentProgressIndex = Math.min(
                currentProgressIndex + 1,
                thinkingProgressTexts.length - 1
              );

              // 更新思考状态和进度
              updateMessage(botMessageId, {
                thinkingStatus: "thinking",
                thinkingProgress: progressText,
                reasoningContent: accumulatedReasoningContent,
                isStreaming: true,
                isComplete: false,
              });
            }

            // 处理正式回答内容
            if (contentChunk) {
              accumulatedContent += contentChunk;
              updateBuffer += contentChunk;

              // 如果是第一次收到正式内容，标记思考完成
              if (accumulatedContent === contentChunk) {
                updateMessage(botMessageId, {
                  thinkingStatus: "completed",
                });
              }

              // 检查是否是markdown格式字符，如果是则延迟更新
              const isMarkdownChar = /[#*`_\[\]()]/.test(contentChunk);
              const isSpaceOrNewline = /[\s\n]/.test(contentChunk);

              // 对于markdown字符，使用更智能的更新策略
              if (isMarkdownChar || isSpaceOrNewline) {
                // 立即更新，确保markdown格式正确
                updateMessage(botMessageId, {
                  content: accumulatedContent,
                  reasoningContent: accumulatedReasoningContent,
                  isStreaming: true,
                  isComplete: false,
                });
                lastUpdateTime = Date.now();
                updateBuffer = "";
              } else {
                // 使用节流更新，避免更新过于频繁
                throttledUpdate();
              }
            }
          },
          // onError: 处理错误
          (error) => {
            console.error("❌ 流式请求错误:", error);
            throw error;
          },
          // onComplete: 流式完成
          () => {
            console.log("✅ 流式请求完成");
            console.log("💡 收集到的追问问题:", followUpQuestions);

            // 标记消息为完成状态，并保留追问问题
            updateMessage(botMessageId, {
              content: accumulatedContent || "抱歉，没有收到回复内容。",
              reasoningContent: accumulatedReasoningContent || undefined,
              isStreaming: false,
              isComplete: true,
              followUpQuestions:
                followUpQuestions.length > 0 ? followUpQuestions : undefined,
              thinkingStatus: accumulatedReasoningContent
                ? "completed"
                : undefined,
            });

            setIsLoading(false);
            abortControllerRef.current = null; // 清空引用
          },
          abortController.signal // 传递abort信号
        );
      } catch (error) {
        console.error("Chat API Error:", error);

        // 如果是用户主动取消，不显示错误消息
        if (error instanceof Error && error.name === "AbortError") {
          console.log("🛑 请求已被用户取消");
          return;
        }

        let errorMessage = "抱歉，发生了错误，请稍后重试。";

        if (error instanceof Error) {
          errorMessage = `抱歉，发生了错误：${error.message}`;
        }

        updateMessage(botMessageId, {
          content: errorMessage,
          isStreaming: false,
          isComplete: true,
        });
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null; // 清空引用
      }
    },
    [conversationId, isLoading, addMessage, updateMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages(initialMessages);
    messageIdRef.current = initialMessages.length;
    // 清空conversationId，让下次发送消息时不传conversationId（开启新会话）
    setConversationId("");
    console.log("🆕 已清空会话，下次发送消息将创建新会话");
  }, [initialMessages]);

  // 隐藏所有接着问按钮
  const hideAllFollowUpQuestions = useCallback(() => {
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        followUpQuestions: undefined, // 清空所有消息的接着问按钮
      }))
    );
    console.log("🙈 已隐藏所有接着问按钮");
  }, []);

  // 取消当前聊天
  const cancelCurrentChat = useCallback(async () => {
    console.log("🛑 用户点击终止按钮");

    // 1. 立即终止fetch请求（如果有的话）
    if (abortControllerRef.current) {
      console.log("🛑 终止fetch请求");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 2. 立即更新UI状态
    setIsLoading(false);
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.isBot && lastMessage.isStreaming) {
        return prev.map((msg, index) =>
          index === prev.length - 1
            ? {
                ...msg,
                isStreaming: false,
                isComplete: true,
                content: msg.content || "（已终止）",
              }
            : msg
        );
      }
      return prev;
    });

    // 3. 调用后端取消接口（如果有conversationId和chatId）
    if (conversationId && currentChatId) {
      try {
        console.log("🛑 调用取消接口...", {
          conversationId,
          chatId: currentChatId,
        });

        const response = await cancelChat({
          conversationId,
          chatId: currentChatId,
        });

        if (response.code === 200) {
          console.log("✅ 后端聊天已取消");
        }

        setCurrentChatId(""); // 清空chatId
      } catch (error) {
        console.error("❌ 调用取消接口失败:", error);
        // 即使取消接口失败，前端也已经停止了，不影响用户体验
      }
    } else {
      console.warn("⚠️ 缺少conversationId或chatId，跳过调用取消接口");
    }
  }, [conversationId, currentChatId]);

  // 加载指定会话的历史记录
  const loadConversation = useCallback(async (targetConversationId: string) => {
    try {
      console.log(`🔍 加载会话: ${targetConversationId}`);
      const response = await fetchChatHistory();

      if (
        response &&
        response.code === 200 &&
        response.data?.data?.length > 0
      ) {
        const allMessages = response.data.data;

        // 筛选出指定会话的消息
        const conversationMessages = allMessages.filter(
          (msg) => msg.conversationId === targetConversationId
        );

        if (conversationMessages.length > 0) {
          // 后端返回的消息是倒序的（最新的在前），需要反转为正序
          const sortedMessages = [...conversationMessages].reverse();

          // 转换为前端消息格式
          const formattedMessages: ChatMessage[] = sortedMessages.map((msg) => {
            // 解析追问问题
            let followUpQuestions: string[] | undefined;
            if (msg.followUp) {
              try {
                const parsed = JSON.parse(msg.followUp);
                followUpQuestions = Array.isArray(parsed)
                  ? parsed.map((item: any) => item.question).filter(Boolean)
                  : undefined;
              } catch (e) {
                console.warn("解析追问问题失败:", e);
              }
            }

            return {
              id: ++messageIdRef.current,
              sender: msg.role === "user" ? "用户" : "VanAI",
              time: msg.createdAt ? formatChatTime(msg.createdAt) : "",
              content:
                msg.role === "user" ? msg.query || "" : msg.content || "",
              reasoningContent:
                msg.role === "assistant"
                  ? msg.reasoningContent || undefined
                  : undefined,
              isBot: msg.role === "assistant",
              isStreaming: false,
              isComplete: true,
              followUpQuestions,
              thinkingStatus:
                msg.role === "assistant" && msg.reasoningContent
                  ? "completed"
                  : undefined,
            };
          });

          setMessages(formattedMessages);
          setConversationId(targetConversationId);
          console.log(
            `✅ 已加载会话 ${targetConversationId}，共 ${formattedMessages.length} 条消息`
          );
        } else {
          console.warn(`⚠️ 未找到会话 ${targetConversationId} 的消息`);
        }
      }
    } catch (error) {
      console.error("❌ 加载会话失败:", error);
    }
  }, []);

  // 初始化：加载历史聊天记录
  useEffect(() => {
    // 防止重复初始化
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initChatHistory = async () => {
      try {
        console.log("🔄 开始加载聊天历史记录...");
        const response = await fetchChatHistory();

        // 检查响应是否成功
        if (
          response &&
          response.code === 200 &&
          response.data?.data?.length > 0
        ) {
          console.log("✅ 成功加载聊天历史:", response);

          const historyMessages = response.data.data;

          // 获取会话ID（从第一条消息中获取）
          const conversationIdFromHistory = historyMessages[0].conversationId;
          setConversationId(conversationIdFromHistory);
          console.log(
            "💾 从历史记录中恢复 conversationId:",
            conversationIdFromHistory
          );

          // 后端返回的消息是倒序的（最新的在前），需要反转为正序
          const sortedMessages = [...historyMessages].reverse();

          // 转换为前端消息格式
          const formattedMessages: ChatMessage[] = sortedMessages.map((msg) => {
            // 解析追问问题（followUp 是 JSON 字符串）
            let followUpQuestions: string[] | undefined;
            if (msg.followUp) {
              try {
                const parsed = JSON.parse(msg.followUp);
                // followUp 格式是 [{question: "..."}, ...]
                followUpQuestions = Array.isArray(parsed)
                  ? parsed.map((item: any) => item.question).filter(Boolean)
                  : undefined;
              } catch (e) {
                console.warn("解析追问问题失败:", e);
              }
            }

            return {
              id: ++messageIdRef.current,
              sender: msg.role === "user" ? "用户" : "VanAI",
              time: msg.createdAt ? formatChatTime(msg.createdAt) : "",
              content:
                msg.role === "user" ? msg.query || "" : msg.content || "",
              reasoningContent:
                msg.role === "assistant"
                  ? msg.reasoningContent || undefined
                  : undefined,
              isBot: msg.role === "assistant",
              isStreaming: false,
              isComplete: true,
              followUpQuestions,
              thinkingStatus:
                msg.role === "assistant" && msg.reasoningContent
                  ? "completed"
                  : undefined,
            };
          });

          // 如果有初始消息，将其追加到历史记录的末尾（作为最新消息）
          if (initialMessages && initialMessages.length > 0) {
            // 重新分配 id 以保证唯一性
            const initialMessagesWithNewIds = initialMessages.map(msg => ({
              ...msg,
              id: ++messageIdRef.current
            }));
            formattedMessages.push(...initialMessagesWithNewIds);
          }

          setMessages(formattedMessages);
          console.log(
            `📝 已加载 ${formattedMessages.length} 条历史消息（未绑定会话，等待用户选择或新会话开始）`
          );
        } else {
          console.log("ℹ️ 没有历史聊天记录，将创建新会话");
          // 这里不预先生成会话ID，等待首次发送消息由后端创建并返回
          if (initialMessages && initialMessages.length > 0) {
             setMessages(initialMessages);
             messageIdRef.current = initialMessages.length;
          }
        }
      } catch (error) {
        console.error("❌ 加载聊天历史失败:", error);
        // 加载失败也不生成本地会话ID，保持为空
        if (initialMessages && initialMessages.length > 0) {
           setMessages(initialMessages);
           messageIdRef.current = initialMessages.length;
        }
      }
    };

    initChatHistory();
  }, [initialMessages]); // 依赖 initialMessages，但通常 initialMessages 不变

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    clearMessages,
    loadConversation,
    hideAllFollowUpQuestions,
    cancelCurrentChat,
  };
}
