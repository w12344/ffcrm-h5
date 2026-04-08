import { ObjectionDetail } from '../types';

/**
 * 格式化时间轴日期
 */
export const formatTimelineDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * 根据评级获取对应的样式类名
 */
export const getLevelClassName = (level: string): string => {
  const levelMap: Record<string, string> = {
    A: 'level-a',
    A级: 'level-a',
    A级客户: 'level-a',
    B: 'level-b',
    B级: 'level-b',
    B级客户: 'level-b',
    C: 'level-c',
    C级: 'level-c',
    C级客户: 'level-c',
    D: 'level-d',
    D级: 'level-d',
    D级客户: 'level-d',
  };
  return levelMap[level] || 'level-default';
};

/**
 * 获取异议标签颜色
 */
export const getObjectionStatusColor = (
  status: ObjectionDetail['status']
): 'success' | 'warning' => {
  return status === 'RESOLVED' ? 'success' : 'warning';
};

/**
 * 转换异议数据格式用于弹窗显示
 */
export const transformObjectionsForDialog = (objections: ObjectionDetail[]) => {
  return objections.map((obj) => ({
    ...obj,
    contentMd5: '',
    createdByName: obj.createdByName || '',
    status: obj.status as string,
    requireWho: obj.requireWho || null,
    resolvedAt: obj.resolvedAt || null,
    chatContent: obj.chatContent || '',
    description: obj.description || '',
    solution: obj.solution || '',
  }));
};
