import React from 'react';
import './ChatAssistantSkeleton.less';

/**
 * AI 助手区域骨架屏组件
 */
interface ChatAssistantSkeletonProps {
  themeMode?: 'dark' | 'light';
}

const ChatAssistantSkeleton: React.FC<ChatAssistantSkeletonProps> = ({ 
  themeMode = 'dark' 
}) => {
  const themeClass = `chat-assistant-skeleton-${themeMode}`;

  return (
    <div className={`chat-assistant-skeleton ${themeClass}`}>
      {/* 头部区域骨架屏 */}
      <div className="skeleton-header">
        <div className="skeleton-title skeleton-shimmer"></div>
        <div className="skeleton-actions">
          <div className="skeleton-btn skeleton-shimmer"></div>
          <div className="skeleton-btn skeleton-shimmer"></div>
        </div>
      </div>

      {/* 聊天消息区域骨架屏 */}
      <div className="skeleton-messages">
        {/* AI 消息 */}
        <div className="skeleton-message skeleton-message-ai">
          <div className="skeleton-avatar skeleton-shimmer"></div>
          <div className="skeleton-message-content">
            <div className="skeleton-message-bubble skeleton-shimmer">
              <div className="skeleton-text skeleton-shimmer" style={{ width: '90%' }}></div>
              <div className="skeleton-text skeleton-shimmer" style={{ width: '75%' }}></div>
              <div className="skeleton-text skeleton-shimmer" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        {/* 用户消息 */}
        <div className="skeleton-message skeleton-message-user">
          <div className="skeleton-message-content">
            <div className="skeleton-message-bubble skeleton-shimmer">
              <div className="skeleton-text skeleton-shimmer" style={{ width: '80%' }}></div>
              <div className="skeleton-text skeleton-shimmer" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="skeleton-avatar skeleton-shimmer"></div>
        </div>

        {/* AI 消息 */}
        <div className="skeleton-message skeleton-message-ai">
          <div className="skeleton-avatar skeleton-shimmer"></div>
          <div className="skeleton-message-content">
            <div className="skeleton-message-bubble skeleton-shimmer">
              <div className="skeleton-text skeleton-shimmer" style={{ width: '95%' }}></div>
              <div className="skeleton-text skeleton-shimmer" style={{ width: '70%' }}></div>
              <div className="skeleton-text skeleton-shimmer" style={{ width: '88%' }}></div>
              <div className="skeleton-text skeleton-shimmer" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        {/* 用户消息 */}
        <div className="skeleton-message skeleton-message-user">
          <div className="skeleton-message-content">
            <div className="skeleton-message-bubble skeleton-shimmer">
              <div className="skeleton-text skeleton-shimmer" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div className="skeleton-avatar skeleton-shimmer"></div>
        </div>

        {/* 正在输入指示器 */}
        <div className="skeleton-typing">
          <div className="skeleton-avatar skeleton-shimmer"></div>
          <div className="skeleton-typing-bubble skeleton-shimmer">
            <div className="skeleton-typing-dots">
              <div className="skeleton-dot skeleton-shimmer"></div>
              <div className="skeleton-dot skeleton-shimmer"></div>
              <div className="skeleton-dot skeleton-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 输入区域骨架屏 */}
      <div className="skeleton-input-area">
        <div className="skeleton-input-wrapper">
          <div className="skeleton-input-box skeleton-shimmer"></div>
        </div>
        <div className="skeleton-send-button skeleton-shimmer"></div>
      </div>
    </div>
  );
};

export default ChatAssistantSkeleton;
