import React from 'react';
import KPICardSkeleton from '../KPICardSkeleton';
import CustomerUpgradePoolSkeleton from './CustomerUpgradePoolSkeleton';
import ChatAssistantSkeleton from './ChatAssistantSkeleton';
import './index.less';

/**
 * 看板页面完整骨架屏组件
 * 包含所有区域的骨架屏效果
 */
interface DashboardSkeletonProps {
  /** 主题模式 */
  themeMode?: 'dark' | 'light';
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ 
  themeMode = 'dark' 
}) => {
  const themeClass = `dashboard-skeleton-${themeMode}`;

  return (
    <div className={`dashboard-skeleton ${themeClass}`}>
      {/* 主内容区域 */}
      <div className="main-content">
        {/* 左侧 - 看板内容 */}
        <div className="dashboard-content">
          {/* KPI 卡片区域骨架屏 */}
          <div className="kpi-section">
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </div>

          {/* 客户升级池区域骨架屏 */}
          <div className="chart-section">
            <CustomerUpgradePoolSkeleton themeMode={themeMode} />
          </div>
        </div>

        {/* 右侧 - AI 助手骨架屏 */}
        <div className="chat-section">
          <ChatAssistantSkeleton themeMode={themeMode} />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
