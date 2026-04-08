/**
 * 统计区域组件
 */
import React from "react";
import {
  InboxOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { ContractStatData } from "@/services/contract";
import { formatCurrency } from "../utils";

interface StatSectionProps {
  statData: ContractStatData;
  statLoading: boolean;
}

const ICON_MAP = {
  InboxOutlined: InboxOutlined,
  FileTextOutlined: FileTextOutlined,
  MoneyCollectOutlined: MoneyCollectOutlined,
  RollbackOutlined: RollbackOutlined,
};

interface StatCardConfig {
  key: keyof ContractStatData;
  label: string;
  icon: keyof typeof ICON_MAP;
  gradient: string;
  isMoney?: boolean;
  isRefund?: boolean;
}

const STAT_CONFIGS: StatCardConfig[] = [
  {
    key: "profileCount",
    label: "成单档案总数",
    icon: "InboxOutlined",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  },
  {
    key: "totalContractCount",
    label: "成单总数",
    icon: "FileTextOutlined",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
  },
  {
    key: "totalOrderCash",
    label: "总实收金额",
    icon: "MoneyCollectOutlined",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    isMoney: true,
  },
  {
    key: "totalRefundCash",
    label: "总退款金额",
    icon: "RollbackOutlined",
    gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
    isMoney: true,
    isRefund: true,
  },
];

export const StatSection: React.FC<StatSectionProps> = ({ statData, statLoading }) => {
  const renderValue = (config: StatCardConfig) => {
    if (statLoading) return "...";
    
    const value = statData[config.key];
    if (config.isMoney) {
      return `¥${formatCurrency(value as number)}`;
    }
    return value;
  };

  return (
    <div className="stat-section">
      {STAT_CONFIGS.map((config) => {
        const IconComponent = ICON_MAP[config.icon];
        const valueClass = config.isMoney
          ? config.isRefund
            ? "stat-value-refund"
            : "stat-value-money"
          : "";

        return (
          <div key={config.key} className="stat-card">
            <div className="stat-icon" style={{ background: config.gradient }}>
              <IconComponent />
            </div>
            <div className="stat-content">
              <div className="stat-label">{config.label}</div>
              <div className={`stat-value ${valueClass}`}>{renderValue(config)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
