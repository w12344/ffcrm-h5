export * from '@/types/dashboard';
export interface CustomerLevel {
  level: string;
  color: string;
  boxShadow: string;
  count: number;
}

export interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  boxShadow: string;
  level: string;
  isImportant: boolean;
}

// 聊天助手相关类型
export interface ChatMessage {
  id: number;
  sender: string;
  time: string;
  content: string;
  type?: 'text' | 'boss-daily-report'; // 消息类型
  reasoningContent?: string; // AI深度思考内容
  isBot: boolean;
  isStreaming?: boolean; // 是否为流式消息
  isComplete?: boolean;  // 流式消息是否完成
  followUpQuestions?: string[]; // 推荐的追问问题列表
  thinkingStatus?: 'thinking' | 'completed'; // 深度思考状态
  thinkingProgress?: string; // 思考进度文本
}

// 主题相关类型
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  toggleTheme: () => void;
}

// 组件Props类型
export interface DashboardHeaderProps {
  themeConfig: ThemeConfig;
}


export interface CustomerUpgradePoolProps {
  bubbles?: Bubble[];
  customerCount?: number;
}

// 导出新的客户相关类型

export interface ChatAssistantProps {
  messages?: ChatMessage[];
  initialMessages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
  customerProfileId?: string; // 客户档案ID，从气泡右键传入
  aiAnalysisRequest?: {
    customerProfileId: string;
    customerName: string;
  } | null; // AI分析请求
  viewedEmployeeName?: string; // 从URL中获取的顾问姓名，用于显示头像
}
