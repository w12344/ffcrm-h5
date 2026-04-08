import React from "react";
import { SubMetric } from '@/types/dashboard';

interface SubMetricsProps {
  metrics: SubMetric[];
  defaultCompareLabel?: string;
  onMetricClick?: (title: string) => void;
  columns?: 1 | 2; // 新增：控制显示列数
}

const SubMetrics: React.FC<SubMetricsProps> = ({ 
  metrics, 
  defaultCompareLabel = '昨', 
  onMetricClick,
  columns = 1 
}) => {
  const getIconClass = (index: number) => {
    return index === 0 ? "blue" : "orange";
  };

  return (
    <div className={`sub-metrics columns-${columns}`}>
      {metrics.map((metric, index) => (
        <div key={index} className="sub-metric" onClick={() => onMetricClick?.(metric.title)}>
          <div className="metric-content">
            <div className="sub-title">
              <div className={`metric-icon ${getIconClass(index)}`}></div>
              <div>{metric.title}</div>
            </div>
            <div className="sub-value">
              <span className="value">{metric.value}</span>
              {(metric.showStatus !== false) && (metric.change || metric.percent) && (
                <div className="sub-status-group">
                  {metric.change && (
                    <span className={`change ${metric.trend}`}>
                      <span className="yesterday-badge">{metric.compareLabel || defaultCompareLabel}</span>
                      {metric.change}
                    </span>
                  )}
                  {metric.percent && (
                    <span className="percent">
                      {metric.percent} <span className={`trend-icon ${metric.trend}`}></span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubMetrics;
