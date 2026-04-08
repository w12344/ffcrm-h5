import React from 'react';
import './ProfileSkeleton.less';

/**
 * 客户档案页面骨架屏组件
 */
const ProfileSkeleton: React.FC = () => {
  return (
    <div className="profile-skeleton">
      {/* 页面头部骨架屏 */}
      <div className="skeleton-header">
        <div className="skeleton-title skeleton-animate"></div>
      </div>

      {/* 主内容区域骨架屏 */}
      <div className="skeleton-content">
        {/* 学生基本信息骨架屏 */}
        <div className="skeleton-section">
          <div className="skeleton-section-header">
            <div className="skeleton-section-title skeleton-animate"></div>
            <div className="skeleton-button skeleton-animate"></div>
          </div>
          <div className="skeleton-info-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-info-item">
                <div className="skeleton-label skeleton-animate"></div>
                <div className="skeleton-value skeleton-animate"></div>
              </div>
            ))}
          </div>
        </div>

        {/* 综合评估骨架屏 */}
        <div className="skeleton-section">
          <div className="skeleton-section-title skeleton-animate"></div>
          <div className="skeleton-evaluation">
            <div className="skeleton-score skeleton-animate"></div>
            <div className="skeleton-tag skeleton-animate"></div>
            <div className="skeleton-link skeleton-animate"></div>
          </div>
        </div>

        {/* 时间轴骨架屏 */}
        <div className="skeleton-section">
          <div className="skeleton-section-title skeleton-animate"></div>
          <div className="skeleton-timeline">
            <div className="skeleton-timeline-line skeleton-animate"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-timeline-node">
                <div className="skeleton-node-dot skeleton-animate"></div>
                <div className="skeleton-node-label skeleton-animate"></div>
                <div className="skeleton-node-date skeleton-animate"></div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 总结骨架屏 */}
        <div className="skeleton-section">
          <div className="skeleton-section-title skeleton-animate"></div>
          <div className="skeleton-summary">
            <div className="skeleton-summary-line skeleton-animate"></div>
            <div className="skeleton-summary-line skeleton-animate"></div>
            <div className="skeleton-summary-line skeleton-animate" style={{ width: '80%' }}></div>
          </div>
        </div>

        {/* 异议区域骨架屏 */}
        <div className="skeleton-section">
          <div className="skeleton-section-header">
            <div className="skeleton-section-title skeleton-animate"></div>
            <div className="skeleton-button skeleton-animate"></div>
          </div>
          <div className="skeleton-tags">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-tag skeleton-animate"></div>
            ))}
          </div>
          <div className="skeleton-button-full skeleton-animate"></div>
        </div>

        {/* 人工补充骨架屏 */}
        <div className="skeleton-section">
          <div className="skeleton-section-title skeleton-animate"></div>
          {[1, 2].map((i) => (
            <div key={i} className="skeleton-note">
              <div className="skeleton-note-line skeleton-animate"></div>
              <div className="skeleton-note-line skeleton-animate"></div>
              <div className="skeleton-note-meta skeleton-animate"></div>
            </div>
          ))}
          <div className="skeleton-button-full skeleton-animate"></div>
        </div>

        {/* 联系人信息骨架屏 */}
        <div className="skeleton-section">
          <div className="skeleton-section-title skeleton-animate"></div>
          <div className="skeleton-contact">
            <div className="skeleton-avatar skeleton-animate"></div>
            <div className="skeleton-contact-info">
              <div className="skeleton-contact-name skeleton-animate"></div>
              <div className="skeleton-contact-detail skeleton-animate"></div>
              <div className="skeleton-contact-detail skeleton-animate"></div>
            </div>
            <div className="skeleton-relation-tag skeleton-animate"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;

