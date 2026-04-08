import React from 'react';
import { Button } from 'antd';
import './MarketHeaderActions.less';

// 优化后的管理图标 - 极简表格风格
const ManageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10H21M7 3V21M17 3V21M3 14H21M3 18H21M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

interface MarketHeaderActionsProps {
  onManageLeads: () => void;
  isLoading?: boolean;
}

const MarketHeaderActions: React.FC<MarketHeaderActionsProps> = ({
  onManageLeads,
  isLoading = false
}) => {
  return (
    <div className="market-header-actions">
      <Button
        className="market-pill-button manage-btn highlight"
        icon={<ManageIcon />}
        onClick={onManageLeads}
        loading={isLoading}
        style={{ height: '36px', borderRadius: '18px', padding: '0 20px' }}
      >
        线索管理
      </Button>
    </div>
  );
};

export default MarketHeaderActions;
