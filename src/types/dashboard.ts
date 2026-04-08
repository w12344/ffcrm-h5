// KPI相关类型定义
export interface SubMetric {
  title: string;
  value: string;
  change: string;
  percent: string;
  trend: 'up' | 'down' | '';
  completionPercent?: string; // 完成度百分比（用于图表显示）
  compareLabel?: string; // 对比标签
  showStatus?: boolean; // 是否显示涨跌数值和百分比
}

export interface KPIData {
  title: string;
  mainValue: string;
  mainChange?: string;
  mainPercent?: string;
  mainTrend?: 'up' | 'down' | '';
  compareLabel?: string; // 主指标对比标签
  mainTarget?: string; // 主指标目标值
  mainTargetLabel?: string; // 目标值标签
  subMetrics: SubMetric[];

  // 图表配置
  showChart?: boolean; // 是否显示图表
  chartType?: 'circular' | 'multi-ring' | 'score' | 'none';
  chartValue?: string; // 对于 single/dual 模式是中间显示的数值
  chartLabel?: string; // 对于 single/dual 模式是中间显示的标签
  chartColor?: 'blue-purple' | 'pink-red' | 'blue-green' | 'purple-pink' | 'cyan-purple' | 'orange-pink' | 'orange';

  // 高级图表额外数据 (支持 concentric/multi-ring)
  chartCenterTitle?: string;
  chartOuterLabel?: string;
  chartInnerLabel?: string;
  chartOuterProgress?: number;
  chartInnerProgress?: number;
  chartTotalProgress?: number;

  showMainStatus?: boolean; // 是否显示主指标的涨跌数值和百分比
  subMetricsColumns?: 1 | 2; // 子指标显示列数
}

export interface KPICardProps extends KPIData {
  onClick?: (title: string) => void;
}

export interface MainMetricProps {
  title: string;
  value: string;
  change: string;
  percent: string;
  trend: 'up' | 'down' | '';
  compareLabel?: string;
  target?: string;
  targetLabel?: string;
}

/**
 * 客户评级
 */
export type CustomerLevel = 'A' | 'B' | 'C' | 'D' | 'X';

/**
 * 客户状态
 */
export type CustomerStatus = 'active' | 'abandoned' | 'inactive';

/**
 * 警示类型
 */
export type AlertType = 'objection' | 'risk' | 'opportunity';

/**
 * 客户（学生）基础信息
 */
export interface Customer {
  id: string;
  name: string;
  level: CustomerLevel;
  qualityScore: number;
  maturityScore: number;
  lastContactTime: Date;
  lastFollowUp?: string;
  advisor?: string;
  source?: string;
  phone?: string;
  wechat?: string;
  status: CustomerStatus;
  abandonedTime?: Date;
  createTime: Date;
  demoteTime?: Date;
  isPinned: boolean;
  hasUnresolvedObjection: boolean;
  hasAIRisk: boolean;
  hasAIOpportunity: boolean;
  isConverted: boolean;
  distributionStatus?: 'normal' | 'reassigned';
  reassignedTo?: string;
  reassignedAt?: string;

  hasOpportunity?: boolean;
  hasAlert?: boolean;

  opportunityText?: string;
  alertText?: string;

  importance?: number; // 意向程度 (星级)
  tags?: string[]; // 用户标签

  chatRecords?: {
    id: string;
    sender: 'advisor' | 'customer' | 'assistant';
    content: string;
    time: string;
  }[];
  followUpHistory?: {
    id: string;
    time: string;
    action: string;
    operator: string;
    details?: string;
  }[];

  // 扩展属性
  dealAmount?: number; // 实际成交金额 (用于成交池)
  attendanceRate?: number; // 出勤率 (用于入学池)
}

export interface CustomerBubble {
  id: string;
  customer: Customer;
  x: number;
  y: number;
  size: number;
  color: string;
  gradient: string;
  boxShadow: string;
  area: 'surface' | 'bottom';
  hasAlert: boolean;
  shouldBlink: boolean;
  index: number;
}

export interface BubbleSizeConfig {
  minSize: number;
  maxSize: number;
  defaultSize: number;
}

export interface AreaConfig {
  surface: {
    yRange: [number, number];
    rows: number;
  };
  bottom: {
    yRange: [number, number];
    rows: number;
  };
}
