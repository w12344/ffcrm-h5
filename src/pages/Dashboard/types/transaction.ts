/**
 * 交付健康度
 * healthy: 顺利交费且已正式入学的优质客户 (绿色/蓝色系)
 * pending: 交了定金/全款，但正处于等待开班、尚未入学的过渡期客户 (橙色/黄色系)
 * refunded: 发生退费或退费的客户 (灰色/暗红色)
 * dropped_out: 发生退学的客户 (灰色/暗红色，但显示在上方)
 */
export type DeliveryHealth = 'healthy' | 'pending' | 'refunded' | 'dropped_out';

/**
 * 成交记录产品标签类型
 */
export type ProductTag = 'A' | 'B' | 'C' | 'D';

/**
 * 成交客户（学生）基础信息
 */
export interface TransactionCustomer {
  id: string;
  name: string;
  
  ticketValue: number; // 客单价/产品持有量 (0-100) -> 映射为气泡大小
  deliveryHealth: DeliveryHealth; // 交付健康度 -> 映射为气泡颜色
  
  isEnrolled: boolean; // 是否已入学 (决定在水面还是池底)
  isRefunded: boolean; // 是否退费 (如果是则重度沉底，失去颜色)
  isDroppedOut?: boolean; // 是否退学 (失去颜色，但显示在上方)
  
  paymentTime: Date; // 最近交费时间
  enrollmentTime?: Date; // 最近入学记录更新时间 (若有则起决定在水面的相对顺序)
  
  hasPaymentConflict: boolean; // 防撞单警示（⚠️）：发现重复或异常
  hasRepurchaseOpportunity: boolean; // 机会闪烁：学习掌握度极高或到达重要交费节点

  productTags: ProductTag[]; // 产品图标徽章（A、B、C等产品的微缩图标）
  
  conflictText?: string; // 撞单提示文案
  opportunityText?: string; // 复购机会文案
}

/**
 * 成交气泡数据（用于渲染）
 */
export interface TransactionBubble {
  id: string;
  customer: TransactionCustomer;
  x: number; // 水平位置（百分比）
  y: number; // 垂直位置（百分比）
  size: number; // 气泡大小（像素）
  color: string; // 气泡主色
  gradient: string; // 气泡渐变色
  boxShadow: string; // 阴影效果
  area: 'surface' | 'bottom'; // 所在区域：水面 (入学池) 或池底 (成交池)
  hasAlert: boolean; // 是否有撞单警示
  shouldBlink: boolean; // 是否有机会闪烁
  index: number; // 在区域内的排序索引
}

/**
 * 气泡尺寸配置
 */
export interface BubbleSizeConfig {
  minSize: number;
  maxSize: number;
  defaultSize: number; 
}

/**
 * 区域配置
 */
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
