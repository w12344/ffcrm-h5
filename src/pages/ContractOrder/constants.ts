/**
 * 合同订单页面常量配置
 */

// 默认分页配置
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

// 默认筛选条件
export const DEFAULT_FILTERS = {
  studentName: "",
  profileName: "",
  goods: "",
  sortBy: "createdAt" as const,
  sortOrder: "desc" as const,
};

// Tab 键值
export const TAB_KEYS = {
  DEALS: "deals",
  CONTRACTS: "contracts",
} as const;

// 统计卡片配置
export const STAT_CARD_CONFIGS = [
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
] as const;

// 按钮样式配置
export const BUTTON_STYLES = {
  PAYMENT_RECORDS: {
    background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    border: "none",
    color: "#ffffff",
  },
  PAYMENT_COLLECTION: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    color: "#ffffff",
  },
  REFUND: {
    background: "linear-gradient(135deg, var(--color-purple-primary) 0%, var(--color-purple-gradient-end) 100%)",
    border: "none",
  },
} as const;
