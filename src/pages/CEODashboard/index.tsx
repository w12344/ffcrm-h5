import React from 'react';
import GlobalKPI from '../../components/ceo/GlobalKPI';
import OrgBubble from '../../components/ceo/OrgBubble';
import WorkloadForecast from '../../components/ceo/WorkloadForecast';
import ManagementWhip from '../../components/ceo/ManagementWhip';
import './index.less';

const CEODashboard: React.FC = () => {
  return (
    <div className="ceo-dashboard-container">
      {/* 头部可复用 Dashboard 的 Header */}
      
      <div className="ceo-dashboard-content">
        {/* 第一层：全局大盘 */}
        <div className="layer-1-global-kpi">
          <GlobalKPI />
        </div>

        {/* 第二层：组织业绩与质量 */}
        <div className="layer-2-org-bubble">
          <OrgBubble />
        </div>

        {/* 第三层：工作量与下周产出预期 */}
        <div className="layer-3-workload">
          <WorkloadForecast />
        </div>

        {/* 第四层：管理抓手与 AI 预警 */}
        <div className="layer-4-whip">
          <ManagementWhip />
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
