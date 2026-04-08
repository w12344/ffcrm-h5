/**
 * 顾问助手 API
 */

import { getAuthToken } from "@/utils/auth";

/**
 * 获取流式请求的完整URL
 */
const getStreamURL = (path: string): string => {
  // 开发环境使用代理，生产环境使用环境变量或默认值
  if (import.meta.env.DEV) {
    return `/api${path}`;
  }
  const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL
    ? `${(import.meta as any).env.VITE_API_BASE_URL}/api`
    : "/api";
  return `${apiBaseUrl}${path}`;
};

/**
 * 获取认证 token
 */
const getToken = () => {
  // 优先使用统一的 token 获取方法
  const token = getAuthToken();
  if (token) return token;
};

/**
 * 流式聊天请求参数
 */
export interface ChatStreamParams {
  /** 档案id，气泡右键发起的提问需传该参数 */
  customerProfileId?: string;
  /** 问题内容 */
  query: string;
  /** 会话id（可选，默认不传或传 null） */
  conversationId?: string | null;
  /** 聊天id（可选） */
  chatId?: string;
  /** 区块id（可选） */
  sectionId?: string;
  /** 机器人id（可选） */
  botId?: string;
}

/**
 * 流式聊天响应数据
 */
export interface ChatStreamResponse {
  // 根据实际返回数据结构定义
  [key: string]: any;
}

/**
 * 聊天记录请求参数
 */
export interface ChatHistoryParams {
  /** 会话id（可选，不传的话查询最近一次会话的记录） */
  conversationId?: string;
  /** 页码（可选，默认为1） */
  pageNumber?: number;
  /** 每页数量（可选，默认为10） */
  pageSize?: number;
}

/**
 * 聊天消息记录（后端实际返回的格式）
 */
export interface ChatHistoryMessage {
  id: number;
  employeeId: string;
  role: "user" | "assistant";
  query: string | null; // 用户的问题
  content: string | null; // AI的回答
  reasoningContent: string | null;
  followUp: string | null; // JSON字符串格式的追问问题
  contentType: string | null;
  conversationId: string;
  messageId: string | null;
  sectionId: string;
  botId: string;
  chatId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 聊天记录响应数据
 */
export interface ChatHistoryResponse {
  code: number;
  message: string;
  data: {
    data: ChatHistoryMessage[]; // 消息数组是倒序的（最新的在前）
    total: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Bot配置信息
 */
export interface BotConfig {
  /** Bot名称 */
  name: string;
  /** Bot描述 */
  description: string;
  /** Bot图标URL */
  iconURL: string;
  /** 引导信息 */
  onboardingInfo: {
    /** 开场白 */
    prologue: string;
    /** 建议问题列表 */
    suggestedQuestions: string[];
    /** 第二段引导文案（可选） */
    secondaryPrologue?: string;
  };
  /** Bot ID */
  botID: string;
}

/**
 * Bot配置响应数据
 */
export interface BotConfigResponse {
  code: number;
  message: string;
  data: BotConfig;
}

/**
 * 取消聊天请求参数
 */
export interface CancelChatParams {
  /** 会话ID */
  conversationId: string;
  /** 聊天ID */
  chatId: string;
}

/**
 * 取消聊天响应数据
 */
export interface CancelChatResponse {
  code: number;
  message: string;
}

/**
 * 流式聊天接口
 * 使用 SSE (Server-Sent Events) 进行流式通信
 */
export const fetchChatStream = async (
  params: ChatStreamParams,
  onMessage: (data: any) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void,
  abortSignal?: AbortSignal // 新增：支持取消请求
) => {
  // 使用统一的 URL 配置，不写死地址
  const url = `https://ffcrm-api.1605ai.com/api/coze/chat/stream`;

  try {
    // 使用统一的 token 获取方法
    const token = getToken();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      signal: abortSignal, // 传递abort信号
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let buffer = "";

    // 读取流式数据
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // 处理剩余的缓冲区数据
        if (buffer.trim()) {
          processSSEMessage(buffer, onMessage);
        }
        onComplete?.();
        break;
      }

      // 解码数据块
      buffer += decoder.decode(value, { stream: true });

      // 按行分割数据
      const lines = buffer.split("\n");

      // 保留最后一个不完整的行
      buffer = lines.pop() || "";

      // 处理完整的行
      for (const line of lines) {
        if (line.trim()) {
          processSSEMessage(line, onMessage);
        }
      }
    }
  } catch (error) {
    // 如果是用户主动取消，不当作错误处理
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('🛑 流式请求已被用户取消');
      onComplete?.(); // 调用完成回调
      return;
    }
    console.error("Stream error:", error);
    onError?.(error as Error);
  }
};

/**
 * 获取聊天记录
 * @param params 请求参数（可选，不传conversationId则查询最近一次会话记录）
 * @returns 聊天记录
 */
export const fetchChatHistory = async (
  params: ChatHistoryParams = {}
): Promise<ChatHistoryResponse> => {
  const url = getStreamURL("/coze/chat/history");
  const token = getToken();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: params.conversationId,
        pageNumber: params.pageNumber ?? 1,
        pageSize: params.pageSize ?? 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("获取聊天记录失败:", error);
    throw error;
  }
};

/**
 * 获取Bot配置信息
 * @returns Bot配置信息
 */
export const fetchBotConfig = async (): Promise<BotConfigResponse> => {
  const url = getStreamURL("/coze/chat/bot");
  const token = getToken();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("获取Bot配置失败:", error);
    throw error;
  }
};

/**
 * 取消聊天（终止AI流式输出）
 * @param params 取消聊天参数
 * @returns 取消结果
 */
export const cancelChat = async (params: CancelChatParams): Promise<CancelChatResponse> => {
  const url = getStreamURL("/coze/chat/cancel");
  const token = getToken();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("取消聊天失败:", error);
    throw error;
  }
};

/**
 * 处理 SSE 消息
 */
function processSSEMessage(line: string, onMessage: (data: any) => void) {
  // SSE 格式：event:message 或 data: {...}
  if (line.startsWith("event:message")) {
    // 跳过事件类型行，等待下一行的数据
    return;
  }

  if (line.startsWith("data:")) {
    const dataStr = line.slice(5).trim();

    // 跳过空数据或特殊标记
    if (!dataStr || dataStr === "[DONE]") {
      return;
    }

    try {
      const data = JSON.parse(dataStr);

      // 详细的消息类型过滤
      console.log("📨 收到SSE消息:", {
        type: data.type,
        role: data.role,
        hasContent: !!data.content,
        hasReasoningContent: !!data.reasoning_content,
        messagePreview:
          data.reasoning_content?.substring(0, 50) ||
          data.content?.substring(0, 50) ||
          "...",
      });

      // 过滤掉 type="verbose" 的消息（知识召回等中间过程）
      if (data.type === "verbose") {
        console.log("🚫 过滤verbose消息 - 知识召回过程");
        return;
      }

      // 处理 type="answer" 的消息，这些是AI的实际回答
      if (data.type === "answer" && data.role === "assistant") {
        console.log("✅ 处理answer消息");
        onMessage(data);
        return;
      }

      // 处理 type="follow_up" 的消息，这些是推荐的追问问题
      if (data.type === "follow_up") {
        console.log("💡 处理follow_up消息");
        onMessage(data);
        return;
      }

      // 兼容没有type字段的消息格式
      if (!data.type && data.reasoning_content) {
        console.log("✅ 处理无type字段的推理消息");
        onMessage(data);
        return;
      }

      console.log("⏭️ 跳过其他类型消息:", data.type);
    } catch (error) {
      console.warn("❌ 解析SSE消息失败:", dataStr, error);
    }
  }
}

/**
 * 顾问助手 API 对象（统一导出）
 */
export const chatApi = {
  /** 流式聊天接口 */
  fetchChatStream: fetchChatStream,
  /** 获取聊天记录接口 */
  fetchChatHistory: fetchChatHistory,
  /** 获取Bot配置接口 */
  fetchBotConfig: fetchBotConfig,
  /** 取消聊天接口 */
  cancelChat: cancelChat,
};

/**
 * 默认导出
 */
export default chatApi;
