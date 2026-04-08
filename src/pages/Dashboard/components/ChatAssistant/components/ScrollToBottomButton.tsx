import React from 'react';
import './ScrollToBottomButton.less';

interface ScrollToBottomButtonProps {
  /** 是否显示按钮 */
  visible: boolean;
  /** 是否正在加载（显示加载动画） */
  isLoading?: boolean;
  /** 点击回调 */
  onClick: () => void;
}

const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  isLoading = false,
  onClick,
}) => {
  if (!visible) return null;

  return (
    <button
      className={`scroll-to-bottom-button ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      title="滚动到底部"
    >
      {/* 加载圈动画 */}
      {isLoading && (
        <div className="loading-ring">
          <svg viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3"
            />
          </svg>
        </div>
      )}
      
      {/* 向下箭头图标 */}
      <svg
        className="arrow-icon"
        width="0.533rem"
        height="0.533rem"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M10 3.33334V16.6667M10 16.6667L15.8333 10.8333M10 16.6667L4.16667 10.8333"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ScrollToBottomButton;

