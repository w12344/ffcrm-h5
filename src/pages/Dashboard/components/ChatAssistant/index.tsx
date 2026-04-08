import React, { useState, useRef, useEffect } from "react";
import { ChatAssistantProps } from "../../types";
import { useChatAssistant } from "../../hooks/useChatAssistant";
import { fetchBotConfig, BotConfig } from "@/services/chat";
import MessageList, { MessageListRef } from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import ChatHistory from "./components/ChatHistory";
import ScrollToBottomButton from "./components/ScrollToBottomButton";
import "./index.less";

const ChatAssistant: React.FC<ChatAssistantProps> = React.memo(({
  messages: externalMessages,
  initialMessages,
  onSendMessage,
  customerProfileId,
  aiAnalysisRequest,
  viewedEmployeeName,
}) => {
  const [historyVisible, setHistoryVisible] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const messageListRef = useRef<MessageListRef>(null);
  const { messages, isLoading, sendMessage, clearMessages, loadConversation, hideAllFollowUpQuestions, cancelCurrentChat } = useChatAssistant(initialMessages);
  const processedRequestRef = useRef<string | null>(null);
  const botConfigLoadedRef = useRef(false); // 防止重复加载Bot配置

  // 使用外部传入的消息或内部管理的消息
  const displayMessages = externalMessages || messages;

  // 监听消息变化，当AI回复完成且有接着问按钮时，滚动到底部
  useEffect(() => {
    if (displayMessages.length === 0) return;
    
    const lastMessage = displayMessages[displayMessages.length - 1];
    
    // 如果最后一条消息是AI消息，且已完成，且有接着问按钮
    if (lastMessage.isBot && lastMessage.isComplete && lastMessage.followUpQuestions && lastMessage.followUpQuestions.length > 0) {
      // 使用setTimeout确保DOM已更新（接着问按钮已渲染）
      // 延迟时间稍长一些，确保接着问按钮的动画也完成
      setTimeout(() => {
        messageListRef.current?.forceScrollToBottom();
        console.log('📜 AI回复完成，滚动到接着问按钮底部');
      }, 200); // 200ms延迟，确保DOM和动画都完成
    }
  }, [displayMessages]);

  // 组件挂载后，确保初次展开时滚动到底部（例如从“AI分析”入口打开弹窗）
  useEffect(() => {
    // 等待列表渲染完成再滚动
    const timer = setTimeout(() => {
      messageListRef.current?.forceScrollToBottom();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 获取Bot配置信息
  useEffect(() => {
    // 如果已经加载过，直接返回
    if (botConfigLoadedRef.current) {
      return;
    }

    const loadBotConfig = async () => {
      try {
        botConfigLoadedRef.current = true; // 标记为已加载
        const response = await fetchBotConfig();
        if (response.code === 200 && response.data) {
          setBotConfig(response.data);
          console.log('Bot配置加载成功:', response.data);
        }
      } catch (error) {
        console.error('加载Bot配置失败:', error);
        botConfigLoadedRef.current = false; // 加载失败时重置标志，允许重试
      }
    };

    loadBotConfig();
  }, []);

  // 处理AI分析请求
  React.useEffect(() => {
    let highlightTimer: NodeJS.Timeout | null = null;
    
    if (aiAnalysisRequest) {
      const requestKey = `${aiAnalysisRequest.customerProfileId}-${aiAnalysisRequest.customerName}`;
      // 避免重复处理同一个请求
      if (processedRequestRef.current !== requestKey) {
        processedRequestRef.current = requestKey;
        
        // 触发高亮动画
        setIsHighlighted(true);
        highlightTimer = setTimeout(() => setIsHighlighted(false), 2000); // 2秒后移除高亮
        
        const analysisMessage = `帮我分析客户档案"${aiAnalysisRequest.customerName}"的聊天记录以及接下来的打法`;
        // 如果当前仍在流式回复中，先中断当前对话
        cancelCurrentChat();
        // 中断后直接发起AI分析
        sendMessage(analysisMessage, aiAnalysisRequest.customerProfileId, true);
        // 发送后强制滚动到底部，保证弹窗打开即定位到最新消息
        requestAnimationFrame(() => {
          setTimeout(() => {
            messageListRef.current?.forceScrollToBottom();
          }, 0);
        });
      }
    }
    
    return () => {
      if (highlightTimer) {
        clearTimeout(highlightTimer);
      }
    };
  }, [aiAnalysisRequest, sendMessage]);

  const handleSendMessage = (message: string) => {
    if (onSendMessage) {
      onSendMessage(message);
    } else {
      // 普通发送不带customerProfileId；仅AI分析入口携带
      sendMessage(message);
    }
    
    // 发送消息后确保滚动到底部
    requestAnimationFrame(() => {
      messageListRef.current?.forceScrollToBottom();
    });
  };

  // 处理追问问题点击
  const handleFollowUpClick = (question: string) => {
    // 先隐藏所有接着问按钮
    hideAllFollowUpQuestions();
    // 然后发送消息
    handleSendMessage(question);
    // handleSendMessage 中已经包含滚动逻辑，这里不需要重复调用
  };

  // 处理选择历史会话
  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
  };

  // 处理滚动按钮点击
  const handleScrollToBottomClick = () => {
    messageListRef.current?.scrollToBottom();
    setShowScrollButton(false);
  };

  // 处理滚动按钮显示状态变化
  const handleScrollButtonVisibilityChange = (visible: boolean) => {
    setShowScrollButton(visible);
  };

  return (
    <div className={`chat-assistant ${isHighlighted ? 'ai-analysis-highlight' : ''}`}>
      <div className="chat-header">
        <h3>顾问助手</h3>
        <div className="header-actions">
          <button
            className="history-button"
            onClick={() => setHistoryVisible(true)}
            title="查看历史对话"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V11C14 11.5523 13.5523 12 13 12H5L2 14V3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </button>
          <button 
            className="clear-button" 
            onClick={clearMessages}
            title="新会话"
          >
            新会话
          </button>
        </div>
      </div>

      <MessageList 
        ref={messageListRef}
        messages={displayMessages}
        onFollowUpClick={handleFollowUpClick}
        onScrollButtonVisibilityChange={handleScrollButtonVisibilityChange}
        botConfig={botConfig}
        viewedEmployeeName={viewedEmployeeName}
      />

      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={isLoading}
        placeholder={customerProfileId ? "询问关于此客户的问题..." : "输入您的问题..."}
        isLoading={isLoading}
        onStop={cancelCurrentChat}
      />

      {/* 滚动到底部按钮 - 固定在聊天助手容器底部 */}
      <ScrollToBottomButton
        visible={showScrollButton}
        isLoading={isLoading}
        onClick={handleScrollToBottomClick}
      />

      <ChatHistory
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        onSelectConversation={handleSelectConversation}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只在关键 props 变化时才重新渲染
  return (
    prevProps.customerProfileId === nextProps.customerProfileId &&
    prevProps.viewedEmployeeName === nextProps.viewedEmployeeName &&
    prevProps.messages === nextProps.messages &&
    prevProps.onSendMessage === nextProps.onSendMessage &&
    // aiAnalysisRequest 需要深度比较
    JSON.stringify(prevProps.aiAnalysisRequest) === JSON.stringify(nextProps.aiAnalysisRequest)
  );
});

ChatAssistant.displayName = 'ChatAssistant';

export default ChatAssistant;
