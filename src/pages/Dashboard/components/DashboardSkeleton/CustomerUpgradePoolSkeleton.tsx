import React from 'react';
import './CustomerUpgradePoolSkeleton.less';

/**
 * 客户升级池区域骨架屏组件
 */
interface CustomerUpgradePoolSkeletonProps {
  themeMode?: 'dark' | 'light';
}

const CustomerUpgradePoolSkeleton: React.FC<CustomerUpgradePoolSkeletonProps> = ({ 
  themeMode = 'dark' 
}) => {
  const themeClass = `customer-upgrade-pool-skeleton-${themeMode}`;

  return (
    <div className={`customer-upgrade-pool-skeleton ${themeClass}`}>
      {/* 头部区域骨架屏 */}
      <div className="skeleton-header">
        <div className="skeleton-header-left">
          {/* 标题骨架 */}
          <div className="skeleton-title skeleton-shimmer"></div>
          
          {/* 颜色条骨架 */}
          <div className="skeleton-color-bar">
            <div className="skeleton-color-segment skeleton-shimmer" style={{ width: '25%' }}></div>
            <div className="skeleton-color-segment skeleton-shimmer" style={{ width: '30%' }}></div>
            <div className="skeleton-color-segment skeleton-shimmer" style={{ width: '20%' }}></div>
            <div className="skeleton-color-segment skeleton-shimmer" style={{ width: '15%' }}></div>
            <div className="skeleton-color-segment skeleton-shimmer" style={{ width: '10%' }}></div>
          </div>
          
          {/* 客户数量骨架 */}
          <div className="skeleton-customer-count skeleton-shimmer"></div>
        </div>
        
        {/* 图例区域骨架 */}
        <div className="skeleton-legend">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-legend-item">
              <div className="skeleton-legend-dot skeleton-shimmer"></div>
              <div className="skeleton-legend-text skeleton-shimmer"></div>
            </div>
          ))}
          <div className="skeleton-legend-button skeleton-shimmer"></div>
        </div>
      </div>

      {/* 图表区域骨架屏 */}
      <div className="skeleton-chart-area">
        {/* 气泡图骨架 - 模拟多个气泡 */}
        <div className="skeleton-bubbles">
          {/* 第一行气泡 */}
          <div className="skeleton-bubble-row">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div 
                key={`row1-${i}`} 
                className="skeleton-bubble skeleton-shimmer"
                style={{
                  width: `${Math.random() * 20 + 15}px`,
                  height: `${Math.random() * 20 + 15}px`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* 第二行气泡 */}
          <div className="skeleton-bubble-row">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div 
                key={`row2-${i}`} 
                className="skeleton-bubble skeleton-shimmer"
                style={{
                  width: `${Math.random() * 25 + 20}px`,
                  height: `${Math.random() * 25 + 20}px`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* 第三行气泡 */}
          <div className="skeleton-bubble-row">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <div 
                key={`row3-${i}`} 
                className="skeleton-bubble skeleton-shimmer"
                style={{
                  width: `${Math.random() * 30 + 25}px`,
                  height: `${Math.random() * 30 + 25}px`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* 第四行气泡 */}
          <div className="skeleton-bubble-row">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div 
                key={`row4-${i}`} 
                className="skeleton-bubble skeleton-shimmer"
                style={{
                  width: `${Math.random() * 35 + 30}px`,
                  height: `${Math.random() * 35 + 30}px`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* 底部时间轴骨架 */}
        <div className="skeleton-timeline">
          <div className="skeleton-timeline-line skeleton-shimmer"></div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="skeleton-timeline-tick">
              <div className="skeleton-timeline-dot skeleton-shimmer"></div>
              <div className="skeleton-timeline-label skeleton-shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerUpgradePoolSkeleton;
