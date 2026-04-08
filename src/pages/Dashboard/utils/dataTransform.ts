import { CustomerUpgradePoolItem } from '@/services/databoard';
import { Customer, CustomerLevel } from '@/types/dashboard';

/**
 * 将 API 返回的客户数据转换为组件需要的 Customer 类型
 * 
 * 业务规则：
 * 1. 数据来源：已匹配销售人员的客户（学生），仅我负责的客户
 * 2. 家庭群客户只展示学生气泡
 * 3. 即使生熟分和肥瘦分都为 0，也要展示（使用最小气泡）
 */
export const transformCustomerData = (item: CustomerUpgradePoolItem): Customer => {
  // 映射等级，确保是有效的 CustomerLevel 类型
  // 如果等级为空或无效，默认为 X 级
  const level = (item.level === 'A' || item.level === 'B' || item.level === 'C' || item.level === 'D' || item.level === 'X') 
    ? item.level 
    : 'X' as CustomerLevel;

  // 转换日期格式 (YYYYMMDD -> Date)
  const parseDate = (dateNum: number): Date => {
    // 如果日期为 0 或无效，使用当前日期
    if (!dateNum || dateNum === 0) {
      return new Date();
    }
    
    const dateStr = dateNum.toString().padStart(8, '0'); // 确保是8位数字
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // 月份从0开始
    const day = parseInt(dateStr.substring(6, 8));
    
    // 验证日期有效性
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) {
      console.warn(`[DataTransform] 无效日期: ${dateNum}，使用当前日期`);
      return new Date();
    }
    
    return date;
  };

  // 使用最近的评分日期作为最近沟通时间
  // 如果两个日期都无效，使用当前日期
  const lastFatDate = item.lastFatRatingDate || 0;
  const lastRipeDate = item.lastRipeRatingDate || 0;
  
  const lastContactTime = lastRipeDate > lastFatDate
    ? parseDate(lastRipeDate)
    : parseDate(lastFatDate);

  // 计算客户状态
  // 超过 14 天未沟通的客户标记为 inactive
  const daysSinceContact = (new Date().getTime() - lastContactTime.getTime()) / (24 * 60 * 60 * 1000);
  const status = daysSinceContact > 14 ? 'inactive' : 'active';

  // 质量分（肥瘦分）：确保在 0-10 范围内
  const qualityScore = Math.max(0, Math.min(10, item.fatScore || 0));
  
  // 成熟度（生熟分）：确保在 0-100 范围内
  const maturityScore = Math.max(0, Math.min(100, item.ripeScore || 0));

  // TODO: Mocking fields for unified pool logic since API doesn't have them yet
  const now = new Date();
  // 模拟建联时间（1-30天前）
  const createTime = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  // 模拟置顶状态（10%概率）
  const isPinned = Math.random() < 0.1;
  // 模拟降级时间（降低成熟度的未置顶客户有30%概率有降级时间在5天内）
  let demoteTime: Date | undefined = undefined;
  if (!isPinned && maturityScore < 50 && Math.random() < 0.3) {
    demoteTime = new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000);
  }

  return {
    id: item.customerProfileId.toString(), // 使用客户档案ID
    name: item.remarkName || '未命名客户',
    level,
    qualityScore, // 肥客积分作为质量分（0-10）
    maturityScore, // 熟客积分作为成熟度（0-100）
    lastContactTime,
    status,
    abandonedTime: undefined, // API 暂无此字段
    createTime, // 补充建联时间 (用于池底排序)
    demoteTime, // 补充降级时间 (用于池底排序)
    isPinned,   // 补充置顶状态 (用于强制浮出水面)
    hasUnresolvedObjection: false, // API 暂无此字段，后续可通过其他接口补充
    hasAIRisk: false, // API 暂无此字段，后续可通过 AI 分析补充
    hasAIOpportunity: maturityScore >= 90, // 成熟度 90 分以上视为机会
    isConverted: false, // API 暂无此字段，后续可通过成交记录补充
    
    // 气泡视觉效果标识（由后端计算提供）
    // hasOpportunity: 客户成熟度90分以上但未成交，或AI识别的相关机会 → 闪烁效果
    // hasAlert: 客户存在待解决异议或AI识别的相关风险 → 感叹号标识
    hasOpportunity: item.hasOpportunity, // 待后端提供
    hasAlert: item.hasAlert, // 待后端提供

    // 悬浮提示文案
    opportunityText: item.opportunityText,
    alertText: item.alertText,
  };
};

/**
 * 批量转换客户数据
 */
export const transformCustomerList = (items: CustomerUpgradePoolItem[]): Customer[] => {
  return items.map(transformCustomerData);
};

