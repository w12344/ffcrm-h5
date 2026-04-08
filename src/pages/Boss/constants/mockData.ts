/**
 * Boss Dashboard Mock Data — Aligned with 业务数据 - 业务.csv
 * "底层算账逻辑" 2.1: KPI 样式对齐 + 同比数据增强
 * 统计维度：年度统计（所有数据均为年度累计数据）
 */

export interface AdvisorData {
  id: string;
  name: string;
  revenue: number;
  target: number;
  completionRate: number;
  outstanding: number;
  activeCustomers: number;
  activeCustomersTarget?: number;
  refundAmount: number;
  refundRate: number;
  refundCount: number;
  visits: number;
  transactions: number;
  linkageRate: number;
  sleepingLeads: number;
  communicationWords: number;
  effectiveDialogues: number;
  contactedCustomers: number;
  newFriends: number;
  revenueGrowth: number; // YoY Revenue Growth %
  commission: number; // 销售收入（提成），按销售额 8% 计算
  dailyActivation: number; // 日均激活数
  tier: 'A' | 'B' | 'C' | 'D';
  pools?: {
    leads: number;
    customers: number;
    upgrades: number;
    deals: number;
    enrollments: number;
  };
}

// =====================================================================
// 卡片一：大盘人头总账（年度统计）
// =====================================================================
export const HEADCOUNT_LEDGER = {
  title: '大盘人头总账',
  subtitle: '年度累计 · 看生源底座与流失漏斗',
  mainMetric: {
    label: '大盘净招生人数',
    value: 936,
    unit: '人',
    target: 1200,
    progressLabel: '目标达成进度',
    progressText: '936 / 1200',
    yoy: { value: '+112人', trend: 'up' as const }, // 同比去年
  },
  // 第一组：前端销售漏斗
  salesFunnel: {
    groupLabel: '招生转化',
    deposit: {
      label: '交定金人头',
      value: 1195,
      yoy: { value: '+85人', trend: 'up' as const }
    },
    refund: {
      label: '退费人头',
      value: 259,
      yoy: { value: '-12人', trend: 'down' as const }
    },
    formula: '净招生 = 交定金 - 退费',
  },
  // 第二组：后端交付漏斗
  deliveryFunnel: {
    groupLabel: '交付留存',
    enrollment: {
      label: '实际入学数',
      value: 742,
      yoy: { value: '+45人', trend: 'up' as const }
    },
    dropout: {
      label: '退学人头',
      value: 28,
      yoy: { value: '-3人', trend: 'down' as const }
    },
    formula: '实际在读 = 入学 - 退学',
  },
};

// =====================================================================
// 卡片二：金额总账（年度统计）
// =====================================================================
export const REVENUE_LEDGER = {
  title: '金额总账',
  subtitle: '年度累计 · 看真实财务进账',
  mainMetric: {
    label: '实际总营收',
    value: 6416.4,
    unit: '万元',
    target: 7000.0,
    yoy: { value: '-463.6万', trend: 'down' as const },
  },
  collection: {
    label: '大盘总收款',
    value: 6820.5,
    unit: '万元',
    yoy: { value: '+25.2万', trend: 'up' as const }
  },
  totalRefund: {
    label: '大盘总退款',
    value: 404.1,
    unit: '万元',
    yoy: { value: '-12.8万', trend: 'down' as const }
  },
};

// =====================================================================
// Excel 下钻明细表 — 产品线矩阵
// =====================================================================
export interface ProductLineRow {
  key: string;
  productLine: string;
  category: string;
  preReg: number;
  actualEnrollment: number;
  refundCount: number;
  dropoutCount: number;
  actualRevenue: string;
  retentionRate?: string;
  dropoutRate?: string;
  yoyPreReg?: string;
  yoyEnrollment?: string;
}

export const PRODUCT_LINE_MATRIX: ProductLineRow[] = [
  { key: '1', productLine: '直通车（大冲留存）', category: '不含纯文化', preReg: 257, actualEnrollment: 259, refundCount: 0, dropoutCount: 11, actualRevenue: '-', retentionRate: '93%', dropoutRate: '4.2%', yoyPreReg: '-82', yoyEnrollment: '-79' },
  { key: '2', productLine: '直通车（大冲留存）', category: '纯文化', preReg: 2, actualEnrollment: 0, refundCount: 0, dropoutCount: 0, actualRevenue: '-', yoyPreReg: '+1', yoyEnrollment: '-' },
  { key: '3', productLine: '续班', category: '不含纯文化', preReg: 82, actualEnrollment: 82, refundCount: 0, dropoutCount: 1, actualRevenue: '-', retentionRate: '35%', dropoutRate: '1.2%', yoyPreReg: '-2', yoyEnrollment: '-1' },
  { key: '4', productLine: '职高', category: '不含纯文化', preReg: 30, actualEnrollment: 30, refundCount: 0, dropoutCount: 2, actualRevenue: '-', dropoutRate: '6.7%', yoyPreReg: '-13', yoyEnrollment: '-13' },
  { key: '5', productLine: '全国', category: '不含纯文化', preReg: 87, actualEnrollment: 85, refundCount: 0, dropoutCount: 4, actualRevenue: '-', dropoutRate: '4.7%', yoyPreReg: '-1', yoyEnrollment: '-3' },
  { key: '6', productLine: '浙江高考', category: '不含纯文化', preReg: 207, actualEnrollment: 210, refundCount: 0, dropoutCount: 9, actualRevenue: '-', dropoutRate: '4.3%', yoyPreReg: '-85', yoyEnrollment: '-86' },
  { key: '7', productLine: '浙江高考', category: '纯文化', preReg: 10, actualEnrollment: 0, refundCount: 0, dropoutCount: 0, actualRevenue: '-', yoyPreReg: '+6', yoyEnrollment: '-' },
  { key: '8', productLine: '私塾', category: '不含纯文化', preReg: 71, actualEnrollment: 76, refundCount: 0, dropoutCount: 1, actualRevenue: '1044.4', dropoutRate: '1.3%', yoyPreReg: '+36', yoyEnrollment: '+39' },
  { key: '9', productLine: '私塾', category: '纯文化', preReg: 5, actualEnrollment: 0, refundCount: 0, dropoutCount: 0, actualRevenue: '-', yoyPreReg: '+4', yoyEnrollment: '-' },
  { key: 'total', productLine: '合计', category: '', preReg: 751, actualEnrollment: 742, refundCount: 259, dropoutCount: 28, actualRevenue: '6416.4', retentionRate: '67%', dropoutRate: '3.8%', yoyPreReg: '-136', yoyEnrollment: '-143' },
];

export const REVENUE_COMPARISON = {
  total: {
    label: '年度总营收情况同比',
    current: { collection: 6820.5, refund: 404.1, netRevenue: 6416.4 },
    lastYear: { collection: 6870.7, refund: 342.1, netRevenue: 6880.0 },
    yoy: { collection: -50.2, refund: 62.1, netRevenue: -463.6 },
  },
  sishu: {
    label: '私塾营收情况同比',
    current: { collection: 1081.1, refund: 36.7, netRevenue: 1044.4 },
    lastYear: { collection: 516.4, refund: 3.2, netRevenue: 542.8 },
    yoy: { collection: 564.6, refund: 33.5, netRevenue: 501.6 },
  },
  gexinghua: {
    label: '个性化营收情况同比',
    current: { collection: 508.9, refund: 56.1, netRevenue: 452.7 },
    lastYear: { collection: 566.2, refund: 48.4, netRevenue: 750.0 },
    yoy: { collection: -57.3, refund: 7.7, netRevenue: -297.3 },
  },
};

// =====================================================================
// Legacy support
// =====================================================================
export const GLOBAL_FINANCIALS = {
  growth: {
    label: '全盘进招生数',
    value: 936,
    target: 1200,
    unit: '人',
    percent: 78.0,
    trend: { type: 'up', value: '+112人', label: '同比' },
    metrics: [
      { label: '成交人头', value: '355人' },
      { label: '成交效率', value: '60%', color: 'green' }
    ]
  },
  quality: {
    label: '生源留存总账',
    value: 67,
    unit: '%',
    badge: '留存率',
    trend: { type: 'down', value: '-3.2%', label: '同比' },
    metrics: [
      { label: '累计退费', value: '-259人', color: 'red' },
      { label: '实际在读', value: '742人', color: 'blue' }
    ]
  },
  cash: {
    label: '实际收支总账',
    value: 6416.4,
    unit: '万元',
    percent: 90.4,
    trend: { type: 'up', value: '+241万', label: '同比' },
    metrics: [
      { label: '总收款', value: '6820.5万' },
      { label: '总退款', value: '-404.1万', color: 'red' }
    ]
  },
  risk: {
    label: '经营潜力缺口',
    value: 1250,
    unit: '万元',
    badge: '待收池',
    trend: { type: 'down', value: '-50.2万', label: '同期缺口' },
    metrics: [
      { label: '营收同比', value: '-463.6万', color: 'red' },
      { label: '年度目标', value: '7093.9万' }
    ]
  }
};

export const CHANNELS_CONVERSION = [
  { name: '小红书', rate: 24.5, leads: 320, trend: 'up' },
  { name: '美团/大众点评', rate: 18.2, leads: 150, trend: 'up' },
  { name: '地推拉访', rate: 12.4, leads: 450, trend: 'down' },
  { name: '转介绍', rate: 45.8, leads: 85, trend: 'up' },
];

export const WARNINGS = [
  { type: 'linkage', advisor: '刘祥宇', text: '建联率仅 45% (<60%)' },
  { type: 'linkage', advisor: '沈建华', text: '建联率仅 32% (<60%)' },
  { type: 'sleep', advisor: '陈孟丽', text: '12 个高意向客户超7天未跟进' },
  { type: 'refund', advisor: '沈建华', text: '个人退费率飙升至 15.2%' },
];

export const ADVISORS: AdvisorData[] = [
  { id: '1', name: '张莹', revenue: 10669000, target: 12000000, completionRate: 88.9, outstanding: 40000, activeCustomers: 149, activeCustomersTarget: 180, refundAmount: 601000, refundRate: 5.6, refundCount: 55, visits: 152, transactions: 83, linkageRate: 55, sleepingLeads: 0, communicationWords: 20.3, effectiveDialogues: 151, contactedCustomers: 180, newFriends: 39, revenueGrowth: 12.5, commission: 853520, dailyActivation: 18.5, tier: 'A', pools: { leads: 1200, customers: 850, upgrades: 320, deals: 150, enrollments: 120 } },
  { id: '2', name: '吴亚丽', revenue: 9626000, target: 9000000, completionRate: 107.0, outstanding: 173000, activeCustomers: 137, activeCustomersTarget: 130, refundAmount: 720000, refundRate: 7.5, refundCount: 66, visits: 79, transactions: 59, linkageRate: 75, sleepingLeads: 0, communicationWords: 10.5, effectiveDialogues: 85, contactedCustomers: 110, newFriends: 25, revenueGrowth: 8.2, commission: 770080, dailyActivation: 14.2, tier: 'A', pools: { leads: 950, customers: 700, upgrades: 280, deals: 130, enrollments: 110 } },
  { id: '3', name: '金雷拉', revenue: 9265000, target: 10000000, completionRate: 92.7, outstanding: 196000, activeCustomers: 134, activeCustomersTarget: 145, refundAmount: 587000, refundRate: 6.3, refundCount: 54, visits: 23, transactions: 13, linkageRate: 57, sleepingLeads: 0, communicationWords: 9.1, effectiveDialogues: 97, contactedCustomers: 93, newFriends: 4, revenueGrowth: 2.1, commission: 741200, dailyActivation: 11.8, tier: 'B', pools: { leads: 880, customers: 650, upgrades: 250, deals: 120, enrollments: 105 } },
  { id: '4', name: '王静', revenue: 9109000, target: 9000000, completionRate: 101.2, outstanding: 114000, activeCustomers: 115, activeCustomersTarget: 110, refundAmount: 379000, refundRate: 4.2, refundCount: 35, visits: 107, transactions: 71, linkageRate: 66, sleepingLeads: 0, communicationWords: 4.7, effectiveDialogues: 60, contactedCustomers: 81, newFriends: 11, revenueGrowth: 15.4, commission: 728720, dailyActivation: 12.5, tier: 'A', pools: { leads: 820, customers: 580, upgrades: 210, deals: 110, enrollments: 95 } },
  { id: '5', name: '张红吉', revenue: 4794000, target: 4500000, completionRate: 106.5, outstanding: 65000, activeCustomers: 60, activeCustomersTarget: 55, refundAmount: 464000, refundRate: 9.7, refundCount: 43, visits: 27, transactions: 14, linkageRate: 52, sleepingLeads: 0, communicationWords: 3.5, effectiveDialogues: 58, contactedCustomers: 41, newFriends: 2, revenueGrowth: 12.8, commission: 383520, dailyActivation: 7.3, tier: 'B', pools: { leads: 600, customers: 420, upgrades: 150, deals: 80, enrollments: 65 } },
  { id: '6', name: '廖正凯', revenue: 4658000, target: 5000000, completionRate: 93.2, outstanding: 20000, activeCustomers: 64, activeCustomersTarget: 70, refundAmount: 251000, refundRate: 5.4, refundCount: 23, visits: 29, transactions: 12, linkageRate: 41, sleepingLeads: 0, communicationWords: 1.8, effectiveDialogues: 28, contactedCustomers: 35, newFriends: 6, revenueGrowth: -2.3, commission: 372640, dailyActivation: 5.6, tier: 'C', pools: { leads: 580, customers: 390, upgrades: 140, deals: 75, enrollments: 60 } },
  { id: '7', name: '赵菲菲', revenue: 4468000, target: 6000000, completionRate: 74.5, outstanding: 161000, activeCustomers: 86, activeCustomersTarget: 115, refundAmount: 112000, refundRate: 2.5, refundCount: 10, visits: 32, transactions: 21, linkageRate: 66, sleepingLeads: 0, communicationWords: 3.5, effectiveDialogues: 58, contactedCustomers: 41, newFriends: 2, revenueGrowth: 6.7, commission: 357440, dailyActivation: 8.9, tier: 'B', pools: { leads: 550, customers: 360, upgrades: 120, deals: 65, enrollments: 55 } },
  { id: '8', name: '陈孟丽', revenue: 2885000, target: 3000000, completionRate: 96.2, outstanding: 9000, activeCustomers: 45, activeCustomersTarget: 48, refundAmount: 218000, refundRate: 7.6, refundCount: 20, visits: 35, transactions: 24, linkageRate: 69, sleepingLeads: 0, communicationWords: 5.5, effectiveDialogues: 65, contactedCustomers: 48, newFriends: 3, revenueGrowth: -5.1, commission: 230800, dailyActivation: 6.1, tier: 'D', pools: { leads: 400, customers: 280, upgrades: 90, deals: 45, enrollments: 38 } },
  { id: '9', name: '王璐', revenue: 2864000, target: 3500000, completionRate: 81.8, outstanding: 0, activeCustomers: 40, activeCustomersTarget: 50, refundAmount: 187000, refundRate: 6.5, refundCount: 17, visits: 27, transactions: 19, linkageRate: 70, sleepingLeads: 0, communicationWords: 4.9, effectiveDialogues: 43, contactedCustomers: 30, newFriends: 3, revenueGrowth: -8.2, commission: 229120, dailyActivation: 4.8, tier: 'D', pools: { leads: 380, customers: 250, upgrades: 85, deals: 42, enrollments: 35 } },
  { id: '10', name: '刘景', revenue: 1436000, target: 2600000, completionRate: 55.2, outstanding: 106000, activeCustomers: 28, activeCustomersTarget: 50, refundAmount: 60000, refundRate: 4.2, refundCount: 6, visits: 5, transactions: 4, linkageRate: 80, sleepingLeads: 0, communicationWords: 2.0, effectiveDialogues: 17, contactedCustomers: 12, newFriends: 2, revenueGrowth: -15.4, commission: 114880, dailyActivation: 3.2, tier: 'D', pools: { leads: 250, customers: 160, upgrades: 50, deals: 25, enrollments: 20 } },
  { id: '11', name: '龙青', revenue: 906000, target: 2000000, completionRate: 45.3, outstanding: 381000, activeCustomers: 23, activeCustomersTarget: 50, refundAmount: 70000, refundRate: 7.7, refundCount: 6, visits: 9, transactions: 7, linkageRate: 78, sleepingLeads: 0, communicationWords: 1.6, effectiveDialogues: 29, contactedCustomers: 23, newFriends: 1, revenueGrowth: -20.1, commission: 72480, dailyActivation: 2.5, tier: 'D', pools: { leads: 200, customers: 120, upgrades: 40, deals: 18, enrollments: 15 } },
  { id: '12', name: '刘祥宇', revenue: 646000, target: 1500000, completionRate: 43.1, outstanding: 278000, activeCustomers: 15, activeCustomersTarget: 35, refundAmount: 116000, refundRate: 18.0, refundCount: 11, visits: 3, transactions: 2, linkageRate: 67, sleepingLeads: 0, communicationWords: 2.0, effectiveDialogues: 17, contactedCustomers: 12, newFriends: 2, revenueGrowth: -25.5, commission: 51680, dailyActivation: 1.8, tier: 'D', pools: { leads: 150, customers: 90, upgrades: 30, deals: 12, enrollments: 10 } },
  { id: '13', name: '陈泯名', revenue: 354000, target: 354000, completionRate: 100.0, outstanding: 0, activeCustomers: 4, activeCustomersTarget: 4, refundAmount: 0, refundRate: 0.0, refundCount: 0, visits: 7, transactions: 4, linkageRate: 57, sleepingLeads: 0, communicationWords: 0.7, effectiveDialogues: 9, contactedCustomers: 9, newFriends: 1, revenueGrowth: 50.0, commission: 28320, dailyActivation: 1.2, tier: 'B', pools: { leads: 80, customers: 50, upgrades: 15, deals: 5, enrollments: 4 } },
];

export const TIER_CONFIG = {
  A: { label: '优秀', range: '日均激活数排名前10%', color: '#FD4895', bg: 'linear-gradient(135deg, #FD4895 0%, #C438EF 100%)' },
  B: { label: '保持', range: '前30%-前10%', color: '#FFB929', bg: 'linear-gradient(135deg, #FFB929 0%, #FF7FB7 100%)' },
  C: { label: '预期', range: '前60%-前30%', color: '#80FFB3', bg: 'linear-gradient(135deg, #80FFB3 0%, #5283E2 100%)' },
  D: { label: '预警', range: '前100%-前60%', color: '#06D7F6', bg: 'linear-gradient(135deg, #06D7F6 0%, #4807EA 100%)' },
};
