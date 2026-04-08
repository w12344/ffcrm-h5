export type ClueValueLevel = 'high' | 'standard' | 'trash';
export type ClueChannelType = 'social' | 'referral' | 'ground' | 'cold';

export interface ClueItem {
  id: string;
  name: string;
  phone: string;
  timeCreated: number;
  hoursElapsed: number; // 0-2 极鲜, 2-24 常规, >24 陈旧
  valueLevel: ClueValueLevel;
  channel: ClueChannelType;
  collisionWarning: boolean;
  allocator?: string;
  advisor?: string; // 新增归属人字段
  latestFollowUpContent?: string;
  latestFollowUpTime?: string;
  followUpStage?: string;
}

export const generateMockClues = (count: number = 80): ClueItem[] => {
  const clues: ClueItem[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // 随机分配新鲜度 (偏向于常规和陈旧，少量新鲜)
    const timeRand = Math.random();
    let hoursElapsed = 0;
    if (timeRand < 0.2) {
      hoursElapsed = Math.random() * 2; // 极鲜 20%
    } else if (timeRand < 0.7) {
      hoursElapsed = 2 + Math.random() * 22; // 常规 50%
    } else {
      hoursElapsed = 24 + Math.random() * 100; // 陈旧 30%
    }

    // 随机分配价值 (偏向于标准，少量大标签和废号)
    const valRand = Math.random();
    let valueLevel: ClueValueLevel = 'standard';
    if (valRand < 0.15) valueLevel = 'high'; // 高价值 15%
    else if (valRand > 0.85) valueLevel = 'trash'; // 废号 15%

    // 随机分配渠道
    const channelRand = Math.random();
    let channel: ClueChannelType = 'cold';
    if (channelRand < 0.3) channel = 'social';
    else if (channelRand < 0.5) channel = 'referral';
    else if (channelRand < 0.7) channel = 'ground';

    // 撞单警告 (低概率)
    const collisionWarning = Math.random() < 0.08;

    // 随机分配顾问
    const advisors = ['王静', '张明', '李华', '赵强', '孙梅', '周飞'];
    const advisor = advisors[Math.floor(Math.random() * advisors.length)];

    const stages = ['新线索', '初次沟通', '意向确认'];
    const followUpStage = stages[Math.floor(Math.random() * stages.length)];

    const followUpContents = ['已发资料', '电话未接', '微信已加', '需进一步沟通'];
    const latestFollowUpContent = followUpContents[Math.floor(Math.random() * followUpContents.length)];
    const latestFollowUpTime = '2023-10-25 10:00';

    clues.push({
      id: `clue-${i}`,
      name: `客户_${Math.floor(Math.random() * 10000)}`,
      phone: `13${Math.floor(Math.random() * 1000000000)}`,
      timeCreated: now - hoursElapsed * 3600 * 1000,
      hoursElapsed,
      valueLevel,
      channel,
      collisionWarning,
      allocator: valueLevel === 'high' && Math.random() < 0.5 ? '张总监' : undefined,
      advisor,
      latestFollowUpContent,
      latestFollowUpTime,
      followUpStage
    });
  }

  return clues;
};
