import { KPIData, CustomerLevel, ChatMessage } from '../types';

// KPI数据配置
export const KPI_DATA: KPIData[] = [
  {
    title: "月度总积分累计",
    mainValue: "500",
    mainChange: "+50",
    mainPercent: "58%",
    mainTrend: "up",
    subMetrics: [
      {
        title: "月度关系经营积分累计",
        value: "300",
        change: "+30",
        percent: "28%",
        trend: "down"
      },
      {
        title: "月度客户洞察积分累计", 
        value: "200",
        change: "+30",
        percent: "28%",
        trend: "down"
      }
    ],
    chartValue: "500",
    chartLabel: "月度总积分",
    chartColor: "blue-purple"
  },
  {
    title: "年度招生人数目标",
    mainValue: "500",
    mainChange: "+50",
    mainPercent: "58%",
    mainTrend: "up",
    subMetrics: [
      {
        title: "年度签约人数",
        value: "300",
        change: "+30",
        percent: "28%",
        trend: "down"
      },
      {
        title: "年度入学人数",
        value: "200", 
        change: "+30",
        percent: "28%",
        trend: "down"
      }
    ],
    chartValue: "88%",
    chartLabel: "招生完成度",
    chartColor: "pink-red"
  },
  {
    title: "年度金额目标",
    mainValue: "500w",
    mainChange: "+50",
    mainPercent: "58%",
    mainTrend: "up",
    subMetrics: [
      {
        title: "年度合同金额",
        value: "300w",
        change: "+30",
        percent: "28%",
        trend: "down"
      },
      {
        title: "年度到账金额",
        value: "200w",
        change: "+30", 
        percent: "28%",
        trend: "down"
      }
    ],
    chartValue: "88%",
    chartLabel: "目标金额完成度",
    chartColor: "blue-green"
  }
];

// 客户等级配置 - 暗色主题
export const CUSTOMER_LEVELS: CustomerLevel[] = [
  { 
    level: 'A级客户', 
    color: 'linear-gradient(180deg, #FD4895 0%, #C438EF 100%)', 
    boxShadow: '0px 0px 20px 8px rgba(255,255,255,0.3), inset 3px 3px 6px 0px #FFFFFF',
    count: 8 
  },
  { 
    level: 'B级客户', 
    color: 'linear-gradient(230deg, #FFB929 0%, #FF7FB7 100%)', // 橙粉渐变
    boxShadow: '0px 0px 20px 8px rgba(255,255,255,0.3), inset 3px 3px 6px 0px #FFFFFF',
    count: 12 
  },
  { 
    level: 'C级客户', 
    color: 'linear-gradient(150deg, #80FFB3 0%, #5283E2 100%)', // 绿蓝渐变
    boxShadow: '0px 0px 20px 8px rgba(255,255,255,0.3), inset 3px 3px 6px 0px #FFFFFF',
    count: 15 
  },
  { 
    level: 'D级客户', 
    color: 'linear-gradient(35deg, #06D7F6 0%, #4807EA 100%)', // 蓝紫渐变
    boxShadow: '0px 0px 20px 8px rgba(255,255,255,0.3), inset 3px 3px 6px 0px #FFFFFF',
    count: 10 
  },
  { 
    level: 'X级客户', 
    color: 'linear-gradient(212deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.5) 23%, rgba(255,255,255,0.3) 48%, rgba(0,0,0,0.6) 100%)',
    boxShadow: '0px 0px 20px 8px rgba(255,255,255,0.3), inset 3px 3px 6px 0px #FFFFFF',
    count: 5 
  }
];

// 图表配置
export const CHART_CONFIG = {
  dates: ['8.21', '8.22', '8.23', '8.24', '8.25', '8.26', '8.27', '8.28', '8.29', '8.30'],
  yValues: [30, 20, 10, 0, -10],
  bubbleConfig: {
    xRange: { min: 5, max: 95 },
    yRange: { min: 10, max: 90 },
    sizeRange: { min: 12, max: 35 },
    importantChance: 0.15
  }
};

// 默认聊天消息
export const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: 'VanAI',
    time: 'Today 9:41',
    content: '今日重要消息:',
    isBot: true
  },
  {
    id: 2,
    sender: 'VanAI',
    time: 'Today 9:41',
    content: '你好,吴亚丽(8月17日)\n\n新客户开发: 3人\n可计分客户: 2人\n\n各项积分:\n• 胖瘦积分: 85分\n• 转化积分: 92分\n• 虚拟非凡币: 150个\n• 月度积分: 277分\n\n预估本月非凡币: 320个\n\n[查看积分详情]\n\n沟通统计:\n• 字符数: 2,450字\n• 通话时长: 45分钟\n• 联系客户: 8人',
    isBot: true
  },
  {
    id: 3,
    sender: 'Li',
    time: 'Today 9:41',
    content: '你的客户说想你了-再佛系下去,他们可要被隔壁同事拐跑啦~',
    isBot: false
  }
];

// 主题配置
export const THEME_CONFIG = {
  light: {
    icon: '☀️',
    className: 'light-theme'
  },
  dark: {
    icon: '🌙',
    className: 'dark-theme'
  }
};
