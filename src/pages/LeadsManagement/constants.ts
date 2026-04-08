export interface LeadItem {
  id: string;
  leadNo: string;
  name: string;
  phone: string;
  intentLevel: string;
  source: string;
  latestFollowUpContent: string;
  latestFollowUpTime: string;
  followUpStatus: string;
  status: string;
  advisor?: string;
}

export const STATUS_CONFIG = {
  '未建联': { color: '#8c8c8c' }, // Gray
  '已建联': { color: '#1890ff' }, // Blue
  '跟进中': { color: '#52C41A' }, // Green
  '已成交': { color: '#722ed1' }, // Purple
  '待开班': { color: '#FAAD14' }, // Yellow/Orange
  '已入学': { color: '#FF4D4F' }, // Red
  '已流失': { color: '#d9d9d9' }, // Light Gray
} as const;

export const INTENT_CONFIG = {
  '高意向': { color: '#1890ff' },
  '一般意向': { color: '#1890ff' },
  '低意向': { color: '#1890ff' },
} as const;

export const MOCK_LEADS: LeadItem[] = [
  {
    id: '1',
    leadNo: 'LEAD-231001001',
    name: '陈敏',
    phone: '13800138000',
    intentLevel: '高意向',
    source: '官网注册',
    latestFollowUpContent: '初步了解课程需求，预约体验课。',
    latestFollowUpTime: '2023-10-31 10:30',
    followUpStatus: '初次沟通',
    status: '已入学',
    advisor: '张伟'
  },
  {
    id: '2',
    leadNo: 'LEAD-231001002',
    name: '王雷',
    phone: '13900139000',
    intentLevel: '一般意向',
    source: '活动报名',
    latestFollowUpContent: '对全栈课程感兴趣，等待开班信息。',
    latestFollowUpTime: '2023-10-30 15:45',
    followUpStatus: '意向确认',
    status: '待开班',
    advisor: '李娜'
  },
  {
    id: '3',
    leadNo: 'LEAD-231001003',
    name: '李华',
    phone: '13700137000',
    intentLevel: '低意向',
    source: '合作伙伴',
    latestFollowUpContent: '暂无明确需求，建议后续跟进。',
    latestFollowUpTime: '2023-10-29 11:00',
    followUpStatus: '新线索',
    status: '未建联',
    advisor: '王强'
  },
  {
    id: '4',
    leadNo: 'LEAD-231001004',
    name: '赵强',
    phone: '13600136000',
    intentLevel: '高意向',
    source: '官网注册',
    latestFollowUpContent: '已完成体验课，准备支付学费。',
    latestFollowUpTime: '2023-10-28 16:20',
    followUpStatus: '签约付款',
    status: '已成交',
    advisor: '张伟'
  },
  {
    id: '5',
    leadNo: 'LEAD-231001005',
    name: '刘英',
    phone: '13500135000',
    intentLevel: '一般意向',
    source: '活动报名',
    latestFollowUpContent: '咨询课程时间安排，需要灵活班型。',
    latestFollowUpTime: '2023-10-27 09:55',
    followUpStatus: '初次沟通',
    status: '已建联',
    advisor: '李娜'
  },
  {
    id: '6',
    leadNo: 'LEAD-231001006',
    name: '孙浩',
    phone: '13400134000',
    intentLevel: '高意向',
    source: '官网注册',
    latestFollowUpContent: '强烈意向，要求尽快安排入学测试。',
    latestFollowUpTime: '2023-10-26 14:10',
    followUpStatus: '意向确认',
    status: '已入学',
    advisor: '张伟'
  },
  {
    id: '7',
    leadNo: 'LEAD-231001007',
    name: '周婷',
    phone: '13300133000',
    intentLevel: '低意向',
    source: '合作伙伴',
    latestFollowUpContent: '推荐客户，需要进一步沟通需求。',
    latestFollowUpTime: '2023-10-25 17:30',
    followUpStatus: '新线索',
    status: '跟进中',
    advisor: '王强'
  },
  {
    id: '8',
    leadNo: 'LEAD-231001008',
    name: '吴磊',
    phone: '13200132000',
    intentLevel: '一般意向',
    source: '活动报名',
    latestFollowUpContent: '对AI课程感兴趣，等待公开课通知。',
    latestFollowUpTime: '2023-10-24 10:45',
    followUpStatus: '初次沟通',
    status: '待开班',
    advisor: '李娜'
  },
  {
    id: '9',
    leadNo: 'LEAD-231001009',
    name: '郑洁',
    phone: '13100131000',
    intentLevel: '高意向',
    source: '官网注册',
    latestFollowUpContent: '已支付定金，正在办理入学手续。',
    latestFollowUpTime: '2023-10-23 13:15',
    followUpStatus: '签约付款',
    status: '已入学',
    advisor: '张伟'
  },
  {
    id: '10',
    leadNo: 'LEAD-231001010',
    name: '郭伟',
    phone: '13000130000',
    intentLevel: '一般意向',
    source: '合作伙伴',
    latestFollowUpContent: '咨询企业培训方案，需要定制服务。',
    latestFollowUpTime: '2023-10-22 11:50',
    followUpStatus: '初次沟通',
    status: '跟进中',
    advisor: '王强'
  }
];
