import React from 'react';
import { ChatMessage } from '../../../types';
import StreamingMarkdownMessage from './StreamingMarkdownMessage';
import TypingIndicator from './TypingIndicator';
import FollowUpQuestions from './FollowUpQuestions';
import ThinkingBox from './ThinkingBox';
import MarkdownRenderer from './MarkdownRenderer';
import BossDailyReportCard from './BossDailyReportCard';
import { useAuth } from '@/contexts/AuthContext';

interface MessageItemProps {
  message: ChatMessage;
  onFollowUpClick?: (question: string) => void;
  botIconURL?: string; // Bot头像URL
  viewedEmployeeName?: string; // 从URL中获取的顾问姓名
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onFollowUpClick, botIconURL, viewedEmployeeName }) => {
  const { userInfo } = useAuth();
  
  // 格式化消息内容，使用Markdown渲染
  const formatMessageContent = (content: string) => {
    if (!content) return null;
    return <MarkdownRenderer content={content} />;
  };

  // 获取显示的用户名（优先使用URL传递的顾问姓名）
  const displayUserName = viewedEmployeeName || userInfo?.name || 'U';

  return (
    <div className="message-container">
      {/* 时间戳显示在顶部 */}
      <div className="message-time-header">
        <span className="time">{message.time}</span>
      </div>

      <div className={`message ${message.isBot ? 'bot' : 'user'}`}>
        {/* 头像 */}
        <div className="message-avatar">
          {message.isBot ? (
            botIconURL ? (
              <img src={botIconURL} alt="AI" className="avatar-image" />
            ) : (
              <span>AI</span>
            )
          ) : (
            // 用户头像逻辑：
            // 1. 如果有 viewedEmployeeName（查看其他顾问），显示该顾问的名字首字母
            // 2. 否则使用当前登录用户的头像或名字首字母
            viewedEmployeeName ? (
              <span>{viewedEmployeeName.charAt(0)}</span>
            ) : userInfo?.avatar ? (
              <img src={userInfo.avatar} alt={displayUserName} />
            ) : (
              <span>{displayUserName.charAt(0)}</span>
            )
          )}
        </div>

        {/* 消息内容区域 */}
        <div className="message-wrapper">
          {/* 深度思考组件 - 仅对AI消息显示 */}
          {message.isBot && message.thinkingStatus && (
            <ThinkingBox
              status={message.thinkingStatus}
              content={message.reasoningContent}
            />
          )}

          {/* 消息内容 - 在ThinkingBox模式下，只有当有正式回答内容时才显示 */}
          {(() => {
            // 自定义消息类型
            if (message.type === 'boss-daily-report') {
              return (
                <div className="message-content custom-card" style={{ padding: 0, background: 'transparent', boxShadow: 'none', border: 'none' }}>
                  <BossDailyReportCard />
                </div>
              );
            }

            // ThinkingBox 模式
            if (message.thinkingStatus) {
              // 流式状态：只在有正式回答内容时显示
              if (message.isStreaming) {
                return message.content ? (
                  <div className="message-content">
                    <StreamingMarkdownMessage message={message} />
                  </div>
                ) : null;
              }
              // 非流式状态：只在有正式回答内容且思考已完成时显示
              return (message.content && message.thinkingStatus !== 'thinking') ? (
                <div className="message-content">
                  <div className="answer-content">
                    {formatMessageContent(message.content)}
                  </div>
                </div>
              ) : null;
            }
            
            // 传统模式（无 ThinkingBox）
            return (
              <div className="message-content">
                {message.isBot && message.isStreaming ? (
                  (message.content || message.reasoningContent) ? (
                    <StreamingMarkdownMessage message={message} />
                  ) : (
                    <div className="typing-status">
                      <span>正在思考</span>
                      <TypingIndicator />
                    </div>
                  )
                ) : (
                  <>
                    {/* 深度思考内容 - 传统样式 */}
                    {message.reasoningContent && (
                      <div className="reasoning-content">
                        {formatMessageContent(message.reasoningContent)}
                      </div>
                    )}
                    {/* 正式回答内容 */}
                    {message.content && (
                      <div className="answer-content">
                        {formatMessageContent(message.content)}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {/* 追问问题按钮 - 在有追问问题时显示（可以在流式过程中显示） */}
          {message.isBot && 
           message.followUpQuestions && 
           message.followUpQuestions.length > 0 && 
           onFollowUpClick && (
            <FollowUpQuestions 
              questions={message.followUpQuestions}
              onQuestionClick={onFollowUpClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
