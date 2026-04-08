import React from 'react';
import {
  SkeletonMainMetric,
  SkeletonSubMetrics,
  SkeletonChart
} from './SkeletonElements';
import './index.less';

/**
 * KPI 卡片骨架屏组件
 * 在数据加载时显示，提供更好的用户体验
 */
const KPICardSkeleton: React.FC = () => {
  return (
    <div className="kpi-card-skeleton">
      {/* 左侧内容区域 */}
      <div className="skeleton-left">
        {/* 主指标骨架 */}
        <SkeletonMainMetric />

        {/* 子指标骨架 */}
        <SkeletonSubMetrics count={2} />
      </div>

      {/* 右侧图表区域 */}
      <SkeletonChart />
    </div>
  );
};

export default KPICardSkeleton;

