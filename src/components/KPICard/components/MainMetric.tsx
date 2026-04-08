import React from 'react';
import { MainMetricProps } from '@/types/dashboard';

interface MainMetricExtendedProps extends MainMetricProps {
  onMetricClick?: (title: string) => void;
  showStatus?: boolean; // 新增：显式控制是否显示状态
}

const MainMetric: React.FC<MainMetricExtendedProps> = ({
  value,
  title,
  change,
  percent,
  trend,
  compareLabel = '昨',
  target,
  targetLabel,
  onMetricClick,
  showStatus = true // 默认显示
}) => {
  return (
    <div className="main-metric" onClick={() => onMetricClick?.(title)}>
      <div className="main-value-title">{title}</div>
      <div className="main-value-line">
        <div className="main-value-group">
          <div className="main-value">{value}</div>
          {target && (
            <div className="main-target-inline" onClick={(e) => { e.stopPropagation(); onMetricClick?.(targetLabel || '目标'); }}>
              <span className="separator">/</span>
              <span className="target-value">{target}</span>
            </div>
          )}
        </div>
        {showStatus && (change || percent) && (
          <div className="status-group">
            {change && (
              <span className={`change ${trend}`}>
                <span className="yesterday-badge">{compareLabel}</span>
                {change}
              </span>
            )}
            {percent && (
              <span className="percent">
                {percent} <span className={`trend-icon ${trend}`}></span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMetric;
