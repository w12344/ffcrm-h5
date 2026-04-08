import { Customer, CustomerLevel, CustomerStatus } from '@/types/dashboard';

/**
 * 生成随机日期（在指定天数范围内）
 */
const randomDateInDays = (daysAgo: number): Date => {
  const now = new Date();
  const randomDays = Math.random() * daysAgo;
  return new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
};

/**
 * 生成随机客户名称
 */
const generateCustomerName = (index: number): string => {
  const surnames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '梁'];
  const names = ['明', '华', '芳', '丽', '强', '伟', '静', '敏', '军', '磊', '洋', '勇', '艳', '娟', '杰', '涛', '超', '鹏', '辉', '婷'];

  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const name = names[Math.floor(Math.random() * names.length)];

  return `${surname}${name}${index}`;
};

/**
 * 根据客户等级生成对应的基础数据
 */
const getBaseDataByLevel = (level: CustomerLevel) => {
  switch (level) {
    case 'A':
      return {
        qualityScoreRange: [8, 10],
        maturityScoreRange: [80, 100],
        recentContactDays: 3,
        abandonChance: 0.05,
        objectionChance: 0.1,
        riskChance: 0.05,
        opportunityChance: 0.4,
      };
    case 'B':
      return {
        qualityScoreRange: [6, 8],
        maturityScoreRange: [60, 80],
        recentContactDays: 7,
        abandonChance: 0.1,
        objectionChance: 0.15,
        riskChance: 0.1,
        opportunityChance: 0.25,
      };
    case 'C':
      return {
        qualityScoreRange: [4, 6],
        maturityScoreRange: [40, 60],
        recentContactDays: 14,
        abandonChance: 0.2,
        objectionChance: 0.2,
        riskChance: 0.15,
        opportunityChance: 0.1,
      };
    case 'D':
      return {
        qualityScoreRange: [2, 4],
        maturityScoreRange: [20, 40],
        recentContactDays: 21,
        abandonChance: 0.3,
        objectionChance: 0.25,
        riskChance: 0.2,
        opportunityChance: 0.05,
      };
    case 'X':
      return {
        qualityScoreRange: [0, 2],
        maturityScoreRange: [0, 20],
        recentContactDays: 30,
        abandonChance: 0.5,
        objectionChance: 0.3,
        riskChance: 0.3,
        opportunityChance: 0.02,
      };
  }
};

/**
 * 生成模拟聊天记录
 */
const generateChatRecords = (customerName: string) => {
  return [
    { id: 'c1', sender: 'customer' as const, content: '你好，请问直通车课程还有名额吗？', time: '10:30' },
    { id: 'c2', sender: 'advisor' as const, content: `您好！${customerName}家长，名额还有最后3个，建议您尽快定金锁定。`, time: '10:35' },
    { id: 'c3', sender: 'customer' as const, content: '好的，定金是多少？', time: '10:40' },
    { id: 'c4', sender: 'assistant' as const, content: 'AI提示：该客户意向度极高，建议发送支付链接。', time: '10:41' },
  ];
};

/**
 * 生成模拟跟进历史
 */
const generateFollowUpHistory = () => {
  const isReassigned = Math.random() < 0.15; // 15% 概率为重新分配

  if (isReassigned) {
    return [
      { id: 'h1', time: '2024-03-25 10:00', action: '分配线索', operator: '系统', details: '线索进入线索池，自动分配给张莹' },
      { id: 'h2', time: '2024-03-26 14:20', action: '初次带看', operator: '张莹', details: '详细介绍了校区环境和师资力量' },
      { id: 'h3', time: '2024-03-27 10:15', action: '深度沟通', operator: '张莹', details: '解答了关于费用的疑问' },
      { id: 'h4', time: '2024-03-28 09:15', action: '重新分配', operator: '主管刘强', details: '因张莹离职，将线索转交给顾问吴亚丽继续跟进' },
      { id: 'h5', time: '2024-03-28 14:30', action: '接手建联', operator: '吴亚丽', details: '接手后首次与客户电话沟通，确认之前意向' },
    ];
  }

  return [
    { id: 'h1', time: '2024-03-25 10:00', action: '分配线索', operator: '系统', details: '线索进入线索池，自动分配给张莹' },
    { id: 'h2', time: '2024-03-26 14:20', action: '初次带看', operator: '张莹', details: '详细介绍了校区环境和师资力量' },
  ];
};

/**
 * 生成单个客户数据
 */
const generateCustomer = (id: string, level: CustomerLevel, index: number): Customer => {
  const baseData = getBaseDataByLevel(level)!;

  // 生成质量分（有5%概率为0或没打分）
  const hasNoScore = Math.random() < 0.05;
  const qualityScore = hasNoScore
    ? 0
    : Math.random() * (baseData.qualityScoreRange[1] - baseData.qualityScoreRange[0]) + baseData.qualityScoreRange[0];

  // 生成成熟度
  const maturityScore = Math.random() * (baseData.maturityScoreRange[1] - baseData.maturityScoreRange[0]) + baseData.maturityScoreRange[0];

  // 生成最近沟通时间
  const lastContactTime = randomDateInDays(baseData.recentContactDays);

  // 确定客户状态
  let status: CustomerStatus = 'active';
  let abandonedTime: Date | undefined;

  // 计算是否超过2周未沟通
  const daysSinceContact = (new Date().getTime() - lastContactTime.getTime()) / (24 * 60 * 60 * 1000);
  const isInactive = daysSinceContact > 14;

  // 判断是否被放弃
  const isAbandoned = Math.random() < baseData.abandonChance;

  if (isAbandoned) {
    status = 'abandoned';
    abandonedTime = randomDateInDays(30);
  } else if (isInactive) {
    status = 'inactive';
  }

  // 生成警示和机会标识
  const hasUnresolvedObjection = Math.random() < baseData.objectionChance;
  const hasAIRisk = Math.random() < baseData.riskChance;
  const hasAIOpportunity = Math.random() < baseData.opportunityChance;

  // 成熟度90分以上但未成交的客户有机会闪烁
  const isHighMaturity = maturityScore >= 90;
  const isConverted = Math.random() < 0.1; // 10%的客户已成交

  const name = generateCustomerName(index);
  const followUpHistory = generateFollowUpHistory();

  // Mock importance (1-5) and tags based on level
  const importance = level === 'A' ? 5 : level === 'B' ? 4 : level === 'C' ? 3 : level === 'D' ? 2 : 1;
  const tags = level === 'A' ? ['高意向', '重点跟进'] : level === 'B' ? ['一般跟进'] : [];

  // 模拟分配状态：如果 history 中包含重新分配，则设为 reassigned。
  // 为了保证客户池里始终能看到，强制让 id 结尾是 '3' 的客户变为重新分配状态
  const distributionStatus = (id.endsWith('3') || followUpHistory.some(h => h.action === '重新分配')) ? 'reassigned' : 'normal';

  return {
    id,
    name,
    level,
    importance,
    tags,
    qualityScore: Math.round(qualityScore * 10) / 10,
    maturityScore: Math.round(maturityScore),
    lastContactTime,
    status,
    abandonedTime,
    hasUnresolvedObjection,
    hasAIRisk,
    hasAIOpportunity: hasAIOpportunity || (isHighMaturity && !isConverted),
    isConverted,
    createTime: lastContactTime,
    isPinned: false,
    distributionStatus,
    chatRecords: generateChatRecords(name),
    followUpHistory,
  };
};

/**
 * 专门为顾问的客户升级池追加几个必定为 reassigned 状态的 mock 数据
 */
export const appendReassignedMocks = (list: any[]) => {
  const reassigned1 = generateCustomer('reassigned-9901', 'A', 9901);
  reassigned1.distributionStatus = 'reassigned';
  reassigned1.name = '王小明';
  reassigned1.reassignedTo = '李顾问';
  reassigned1.reassignedAt = '2026-03-30 14:30';

  const reassigned2 = generateCustomer('reassigned-9902', 'B', 9902);
  reassigned2.distributionStatus = 'reassigned';
  reassigned2.name = '张三丰';
  reassigned2.reassignedTo = '王顾问';
  reassigned2.reassignedAt = '2026-03-29 10:15';

  const reassigned3 = generateCustomer('reassigned-9903', 'C', 9903);
  reassigned3.distributionStatus = 'reassigned';
  reassigned3.name = '刘德华';
  reassigned3.reassignedTo = '赵顾问';
  reassigned3.reassignedAt = '2026-03-28 16:45';

  return [...list, reassigned1, reassigned2, reassigned3];
}

/**
 * 生成模拟客户数据
 * @param levelCounts 各等级客户数量配置
 */
export const generateMockCustomers = (levelCounts: Record<CustomerLevel, number>): Customer[] => {
  const customers: Customer[] = [];
  let globalIndex = 0;

  const levels: CustomerLevel[] = ['A', 'B', 'C', 'D', 'X'];

  levels.forEach(level => {
    const count = levelCounts[level] || 0;
    for (let i = 0; i < count; i++) {
      const customer = generateCustomer(`${level}-${i}`, level, globalIndex++);
      customers.push(customer);
    }
  });

  return customers;
};

/**
 * 默认客户数量配置
 */
export const DEFAULT_LEVEL_COUNTS: Record<CustomerLevel, number> = {
  A: 8,
  B: 12,
  C: 15,
  D: 10,
  X: 5,
};

/**
 * 生成默认模拟数据
 */
export const generateDefaultMockCustomers = (): Customer[] => {
  return generateMockCustomers(DEFAULT_LEVEL_COUNTS);
};

