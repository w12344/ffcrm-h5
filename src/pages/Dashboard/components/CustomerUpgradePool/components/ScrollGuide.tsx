import React, { useState, useEffect } from 'react';
import './ScrollGuide.less';

interface ScrollGuideProps {
  containerRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
}

const ScrollGuide: React.FC<ScrollGuideProps> = ({ containerRef, isVisible }) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkScrollability = () => {
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current;
        const hasScroll = scrollHeight > clientHeight;
        setShouldShow(hasScroll && isVisible);
      }
    };

    checkScrollability();
    
    const resizeObserver = new ResizeObserver(checkScrollability);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, isVisible]);

  if (!shouldShow) return null;

  return (
    <div className="scroll-guide">
      <div className="scroll-guide-content">
        <div className="scroll-guide-icon">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="scroll-arrow"
          >
            <path 
              d="M7 10L12 15L17 10" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="scroll-guide-text">
          向下滚动查看更多
        </div>
        <div className="scroll-guide-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
};

export default ScrollGuide;

