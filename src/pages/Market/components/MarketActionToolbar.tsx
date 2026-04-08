import React from 'react';
import { Button, Tooltip, Space } from 'antd';
import { FormOutlined, InteractionOutlined, FileExcelOutlined } from '@ant-design/icons';
import './MarketActionToolbar.less';

interface MarketActionToolbarProps {
  onBatchInput: () => void;
  onBatchDistribute: () => void;
  onBatchTransfer: () => void; // Added
  onImportExcel: () => void;
}

const MarketActionToolbar: React.FC<MarketActionToolbarProps> = ({
  onBatchInput,
  onBatchDistribute,
  onBatchTransfer,
  onImportExcel,
}) => {
  return (
    <div className="market-action-bar">
      <Space size={12}>
        <Button 
          icon={<FormOutlined />}
          className="market-action-btn ghost-btn" 
          onClick={onBatchInput}
        >
          批量录入
        </Button>

        <Button 
          icon={<InteractionOutlined />}
          className="market-action-btn ghost-btn"
          onClick={onBatchTransfer}
        >
          批量转
        </Button>
        
        <Tooltip title="基于算法的智能线索下发">
          <Button 
            className="market-action-btn primary-gradient-btn"
            onClick={onBatchDistribute}
          >
            线索智能分配
          </Button>
        </Tooltip>

        <Button 
          icon={<FileExcelOutlined />}
          className="market-action-btn excel-ghost-btn"
          onClick={onImportExcel}
        >
          导入 Excel
        </Button>
      </Space>
    </div>
  );
};

export default MarketActionToolbar;
