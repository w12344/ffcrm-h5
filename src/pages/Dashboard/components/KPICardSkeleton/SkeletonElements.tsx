import React from 'react';

/**
 * 基础骨架元素组件
 */

// 骨架标题
export const SkeletonTitle: React.FC<{ width?: string }> = ({ width = '120px' }) => (
  <div className="skeleton-title skeleton-shimmer" style={{ width }} />
);

// 骨架值（大）
export const SkeletonValue: React.FC<{ width?: string }> = ({ width = '80px' }) => (
  <div className="skeleton-value skeleton-shimmer" style={{ width }} />
);

// 骨架变化值
export const SkeletonChange: React.FC<{ width?: string }> = ({ width = '50px' }) => (
  <div className="skeleton-change skeleton-shimmer" style={{ width }} />
);

// 骨架百分比
export const SkeletonPercent: React.FC<{ width?: string }> = ({ width = '60px' }) => (
  <div className="skeleton-percent skeleton-shimmer" style={{ width }} />
);

// 骨架点（圆点指示器）
export const SkeletonDot: React.FC = () => (
  <div className="skeleton-dot skeleton-shimmer" />
);

// 骨架子标题
export const SkeletonSubTitle: React.FC<{ width?: string }> = ({ width = '140px' }) => (
  <div className="skeleton-sub-title skeleton-shimmer" style={{ width }} />
);

// 骨架子值
export const SkeletonSubValue: React.FC<{ width?: string }> = ({ width = '60px' }) => (
  <div className="skeleton-sub-value skeleton-shimmer" style={{ width }} />
);

// 骨架子变化值
export const SkeletonSubChange: React.FC<{ width?: string }> = ({ width = '40px' }) => (
  <div className="skeleton-sub-change skeleton-shimmer" style={{ width }} />
);

// 骨架子百分比
export const SkeletonSubPercent: React.FC<{ width?: string }> = ({ width = '50px' }) => (
  <div className="skeleton-sub-percent skeleton-shimmer" style={{ width }} />
);

// 骨架圆形图表
export const SkeletonCircle: React.FC = () => (
  <div className="skeleton-circle skeleton-shimmer" />
);

/**
 * 组合骨架元素
 */

// 主指标骨架
export const SkeletonMainMetric: React.FC = () => (
  <div className="skeleton-main-metric">
    <SkeletonTitle />
    <div className="skeleton-value-row">
      <SkeletonValue />
      <SkeletonChange />
      <SkeletonPercent />
    </div>
  </div>
);

// 子指标骨架
export const SkeletonSubMetric: React.FC = () => (
  <div className="skeleton-sub-metric">
    <SkeletonDot />
    <div className="skeleton-content">
      <SkeletonSubTitle />
      <div className="skeleton-sub-value-row">
        <SkeletonSubValue />
        <SkeletonSubChange />
        <SkeletonSubPercent />
      </div>
    </div>
  </div>
);

// 子指标列表骨架
export const SkeletonSubMetrics: React.FC<{ count?: number }> = ({ count = 2 }) => (
  <div className="skeleton-sub-metrics">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonSubMetric key={index} />
    ))}
  </div>
);

// 图表区域骨架
export const SkeletonChart: React.FC = () => (
  <div className="skeleton-chart">
    <SkeletonCircle />
  </div>
);

