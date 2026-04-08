import { TransactionCustomer, DeliveryHealth, ProductTag } from '@/pages/Dashboard/types/transaction';

/**
 * 随机生成过去N天内的时间
 */
const randomRecentDate = (daysAgo: number) => {
  const now = new Date();
  return new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
};

const NAMES = ['赵飞', '钱雪', '孙磊', '李敏', '周杰', '吴静', '郑强', '王婷', '冯鑫', '陈薇',
  '褚云', '卫东', '蒋伟', '沈腾', '韩梅', '杨杨', '朱一', '秦霄', '尤雅', '许魏',
  '何洁', '吕蒙', '施展', '张三', '孔明', '曹操', '严浩', '华佗', '金喜', '魏婴'];

export const generateMockTransactionData = (count: number = 25): TransactionCustomer[] => {
  const result: TransactionCustomer[] = [];

  for (let i = 0; i < count; i++) {
    // 随机客单价/持有量得分 0-100 (决定气泡大小)
    // 假设 20% 高净值满分客户(大)，50% 中等(中)，30% 仅定金(小)
    const rand = Math.random();
    let ticketValue = 50;
    if (rand < 0.2) ticketValue = 90 + Math.random() * 10;
    else if (rand > 0.7) ticketValue = 10 + Math.random() * 20;
    else ticketValue = 40 + Math.random() * 30;

    // 随机交付健康度
    let deliveryHealth: DeliveryHealth = 'healthy';
    const healthRand = Math.random();
    if (healthRand < 0.15) deliveryHealth = 'refunded'; // 15% 退费沉底
    else if (healthRand < 0.25) deliveryHealth = 'dropped_out'; // 10% 退学
    else if (healthRand < 0.55) deliveryHealth = 'pending'; // 30% 交了钱等开班

    // 根据健康度决定是否入学 (Surface)
    const isEnrolled = deliveryHealth === 'healthy';
    const isRefunded = deliveryHealth === 'refunded';
    const isDroppedOut = deliveryHealth === 'dropped_out';

    // 生成时间
    const paymentTime = randomRecentDate(30); // 30天内交费
    let enrollmentTime: Date | undefined;

    if (isEnrolled) {
      // 如果已入学，入学时间必然晚于交费时间
      enrollmentTime = new Date(paymentTime.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
      // 如果入学时间超过了当前时间，取当前时间前一点
      if (enrollmentTime > new Date()) enrollmentTime = new Date();
    }

    // 防撞单警示 ⚠️：(当不在退费状态且有5%概率撞单)
    const hasPaymentConflict = !isRefunded && Math.random() < 0.05;

    // 机会闪烁：学习度极高，复购/转介绍最佳时机 (仅在入学状态下出现，5%概率)
    const hasRepurchaseOpportunity = isEnrolled && Math.random() < 0.05;

    // 产品标签 A B C
    const tagsCount = ticketValue > 80 ? 3 : ticketValue > 40 ? 2 : 1;
    const allTags: ProductTag[] = ['A', 'B', 'C', 'D'];
    // shuffle and slice
    const productTags = [...allTags].sort(() => 0.5 - Math.random()).slice(0, tagsCount);

    result.push({
      id: `tran-${i}-${Date.now()}`,
      name: NAMES[i % NAMES.length] + Math.floor(Math.random() * 10),
      ticketValue,
      deliveryHealth,
      isEnrolled,
      isRefunded,
      isDroppedOut,
      paymentTime,
      enrollmentTime,
      hasPaymentConflict,
      hasRepurchaseOpportunity,
      productTags,
      conflictText: hasPaymentConflict ? '发现潜在撞单，请核查渠道真实性' : undefined,
      opportunityText: hasRepurchaseOpportunity ? '学习指标优异，可切入复购/转介绍' : undefined,
    });
  }

  return result;
};
