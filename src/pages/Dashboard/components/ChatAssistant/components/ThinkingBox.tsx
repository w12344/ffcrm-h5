import React, { useState, useEffect, useRef } from 'react';
import './ThinkingBox.less';

interface ThinkingBoxProps {
  /** 思考状态：thinking-思考中, completed-已完成 */
  status: 'thinking' | 'completed';
  /** 思考内容 */
  content?: string;
}

const ThinkingBox: React.FC<ThinkingBoxProps> = ({
  status,
  content = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const thinkingContentRef = useRef<HTMLDivElement>(null);

  // 当内容更新时，自动滚动到底部（仅在思考状态下）
  useEffect(() => {
    if (status === 'thinking' && content && thinkingContentRef.current) {
      const contentElement = thinkingContentRef.current;
      // 使用requestAnimationFrame确保DOM更新完成后再滚动
      requestAnimationFrame(() => {
        contentElement.scrollTop = contentElement.scrollHeight;
      });
    }
  }, [content, status]);

  if (status === 'thinking') {
    return (
      <div className={`thinking-box ${status}`}>
        <div className="thinking-header">
          <div className="thinking-title">
            <span className="thinking-icon">🤔</span>
            <span className="thinking-text">
              深度思考中<span className="thinking-dots">...</span>
            </span>
          </div>
        </div>
        {content && (
          <div className="thinking-content" ref={thinkingContentRef}>
            <div className="content-text">
              {content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 已完成状态 - 可展开查看完整思考内容
  return (
    <div className={`thinking-box ${status} ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className="thinking-header clickable" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="thinking-title">
          <span className="completed-icon">✓</span>
          <span className="completed-text">已完成思考</span>
        </div>
        <div className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path 
              d="M4 6L8 10L12 6" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {isExpanded && content && (
        <div className="thinking-content expanded">
          <div className="content-text">
            {content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThinkingBox;
