import React from 'react';
import { KPICardProps } from '@/types/dashboard';
import MainMetric from './components/MainMetric';
import SubMetrics from './components/SubMetrics';
import CircularChart, { MonthlyScoreChart } from './components/CircularChart';
import UniversalCircularChart from '@/components/UniversalCircularChart';
import './index.less';

const KPICard: React.FC<KPICardProps> = ({
  mainValue,
  mainChange,
  mainPercent,
  mainTrend,
  compareLabel,
  mainTarget,
  mainTargetLabel,
  subMetrics,
  
  // 图表配置
  showChart = true,
  chartType = 'circular',
  chartValue,
  chartLabel,
  chartColor = 'blue-purple',
  
  // 同心圆/多环图数据
  chartCenterTitle,
  chartOuterLabel,
  chartInnerLabel,
  chartOuterProgress,
  chartInnerProgress,
  chartTotalProgress,
  
  title,
  onClick,
  subMetricsColumns = 1,
  showMainStatus = true
}) => {
  const handleMetricClick = (e: React.MouseEvent, metricTitle: string) => {
    e.stopPropagation();
    if (onClick) {
      onClick(metricTitle);
    } else {
      window.dispatchEvent(new CustomEvent('open-excel-preview', {
        detail: { targetText: metricTitle }
      }));
    }
  };

  const renderChart = () => {
    if (!showChart || chartType === 'none') return null;

    if (chartType === 'multi-ring') {
      return (
        <div className="chart-container">
          <div className="circular-chart">
            <UniversalCircularChart
              mode="concentric"
              totalProgress={chartTotalProgress || 0}
              signedProgress={chartOuterProgress || 0}
              enrolledProgress={chartInnerProgress || 0}
              title={chartCenterTitle || "完成度"}
              colorTheme={chartColor === 'orange' ? 'orange' : 'default'}
              outerLabel={chartOuterLabel}
              innerLabel={chartInnerLabel}
            />
          </div>
        </div>
      );
    }

    if (chartType === 'score') {
      return (
        <MonthlyScoreChart
          totalScore={parseInt(mainValue) || 0}
          relationshipScore={parseInt(subMetrics[0]?.value) || 0}
          insightScore={parseInt(subMetrics[1]?.value) || 0}
        />
      );
    }

    return (
      <CircularChart
        value={chartValue || ''}
        label={chartLabel || ''}
        color={chartColor as any}
      />
    );
  };

  return (
    <div className="kpi-card" onClick={(e) => handleMetricClick(e, title)}>
      <div className="left-content">
        <MainMetric
          value={mainValue}
          change={mainChange || ''}
          percent={mainPercent || ''}
          trend={mainTrend || ''}
          title={title}
          compareLabel={compareLabel}
          target={mainTarget}
          targetLabel={mainTargetLabel}
          showStatus={showMainStatus}
          onMetricClick={(t) => handleMetricClick({ stopPropagation: () => {} } as any, t)}
        />

        <SubMetrics
          metrics={subMetrics}
          defaultCompareLabel={compareLabel}
          columns={subMetricsColumns}
          onMetricClick={(t) => handleMetricClick({ stopPropagation: () => {} } as any, t)}
        />
      </div>

      {renderChart()}
    </div>
  );
};

export default KPICard;
