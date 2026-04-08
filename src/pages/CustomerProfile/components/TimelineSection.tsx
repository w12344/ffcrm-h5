import React, { memo, useMemo } from 'react';
import { TimelineNode } from '../types';
import { formatTimelineDate } from '../utils/helpers';

interface TimelineSectionProps {
  timeline: TimelineNode[];
}

/**
 * 时间轴节点组件
 */
const TimelineNodeItem: React.FC<{
  node: TimelineNode;
  isLatest: boolean;
  colorIndex: number;
}> = memo(({ node, isLatest, colorIndex }) => (
  <div
    className={`timeline-node ${isLatest ? 'latest-node' : ''}`}
    data-color-index={colorIndex}
  >
    <div className="node-dot">
      {isLatest && <div className="pulse-ring"></div>}
    </div>
    <div className="node-content">
      <div className="node-header">
        <span className="node-label">{node.typeName}</span>
        <span className="node-date">{formatTimelineDate(node.occurredAt)}</span>
      </div>
      <div className="node-description">{node.typeDescription}</div>
      {node.remarkName && (
        <div className="node-remarkName">
          <div className="remarkName-icon">💬</div>
          <div className="remarkName-text">{node.remarkName}</div>
        </div>
      )}
      {isLatest && (
        <div className="latest-badge">
          <span className="badge-icon">🔥</span>
          <span className="badge-text">最新进展</span>
        </div>
      )}
    </div>
  </div>
));

TimelineNodeItem.displayName = 'TimelineNodeItem';

/**
 * 时间轴区域组件
 * 展示客户的时间轴进展
 */
const TimelineSection: React.FC<TimelineSectionProps> = memo(({ timeline }) => {
  // 计算可见的时间轴节点和是否已成交
  const { visibleTimeline, isDeal } = useMemo(() => {
    const dealNodeIndex = timeline.findIndex(
      (node) =>
        node.typeName?.includes('成交') || node.typeDescription?.includes('成交')
    );

    const visible =
      dealNodeIndex >= 0
        ? timeline.slice(0, dealNodeIndex + 1)
        : timeline;

    return {
      visibleTimeline: visible,
      isDeal: dealNodeIndex >= 0,
    };
  }, [timeline]);

  // 计算进度百分比
  const progressPercentage = useMemo(() => {
    return (visibleTimeline.length / (visibleTimeline.length + 2)) * 100;
  }, [visibleTimeline.length]);

  return (
    <div className="timeline-container">
      <div className="timeline-line"></div>
      <div
        className="timeline-progress-line"
        style={{ width: `${progressPercentage}%` }}
      ></div>
      <div
        className="timeline-gray-line"
        style={{ left: `${progressPercentage}%` }}
      ></div>

      {visibleTimeline.map((node, index) => (
        <TimelineNodeItem
          key={`${node.type}-${index}`}
          node={node}
          isLatest={index === visibleTimeline.length - 1}
          colorIndex={index % 6}
        />
      ))}

      {/* 未来节点预测 */}
      {!isDeal && (
        <>
          <div
            className="timeline-node future-node pending-with-more"
            data-color-index="0"
          >
            <div className="node-dot future-dot"></div>
            <div className="node-content future-content">
              <div className="pending-more-badge">
                <span className="more-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
                <span className="more-count">还有多个待跟进</span>
              </div>
              <div className="node-header">
                <span className="node-label">待跟进</span>
                <span className="node-date">即将到来</span>
              </div>
              <div className="node-description">继续保持联系，深入了解需求</div>
            </div>
          </div>
          <div
            className="timeline-node future-node success-node"
            data-color-index="2"
          >
            <div className="node-dot success-dot">
              <span className="success-icon">🏆</span>
            </div>
            <div className="node-content success-content">
              <div className="node-header">
                <span className="node-label">成单目标</span>
                <span className="node-date">近在咫尺</span>
              </div>
              <div className="node-description">
                <strong>离成单不远了，加油！</strong>
                <div className="success-tips">💡 建议：把握时机，适时推进签约</div>
              </div>
              <div className="success-badge">
                <span className="badge-icon">⚡</span>
                <span className="badge-text">冲刺阶段</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

TimelineSection.displayName = 'TimelineSection';

export default TimelineSection;
