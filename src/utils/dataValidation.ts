/**
 * 数据验证和防护工具函数
 */

/**
 * 确保数据是数组，如果不是则返回空数组
 * @param data 待验证的数据
 * @returns 数组
 */
export const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  console.warn('数据不是数组，返回空数组:', data);
  return [];
};

/**
 * 确保数据是数字，如果不是则返回默认值
 * @param data 待验证的数据
 * @param defaultValue 默认值
 * @returns 数字
 */
export const ensureNumber = (data: any, defaultValue: number = 0): number => {
  if (typeof data === 'number' && !isNaN(data)) {
    return data;
  }
  console.warn('数据不是有效数字，返回默认值:', data, 'default:', defaultValue);
  return defaultValue;
};

/**
 * 确保数据是字符串，如果不是则返回默认值
 * @param data 待验证的数据
 * @param defaultValue 默认值
 * @returns 字符串
 */
export const ensureString = (data: any, defaultValue: string = ''): string => {
  if (typeof data === 'string') {
    return data;
  }
  console.warn('数据不是字符串，返回默认值:', data, 'default:', defaultValue);
  return defaultValue;
};

/**
 * 验证 API 响应数据的基本结构
 * @param response API 响应
 * @param expectedDataKey 期望的数据字段名
 * @returns 验证结果
 */
export const validateApiResponse = <T>(
  response: any,
  expectedDataKey: string = 'data'
): { isValid: boolean; data: T[]; total: number; message?: string } => {
  try {
    // 检查响应是否存在
    if (!response || !response.data) {
      return {
        isValid: false,
        data: [],
        total: 0,
        message: '响应数据不存在'
      };
    }

    const responseData = response.data;
    
    // 检查数据字段是否存在且为数组
    if (!responseData[expectedDataKey] || !Array.isArray(responseData[expectedDataKey])) {
      return {
        isValid: false,
        data: [],
        total: 0,
        message: `响应数据中的 ${expectedDataKey} 字段不是数组`
      };
    }

    // 检查总数字段
    const total = ensureNumber(responseData.total, 0);

    return {
      isValid: true,
      data: responseData[expectedDataKey],
      total
    };
  } catch (error) {
    console.error('验证 API 响应时出错:', error);
    return {
      isValid: false,
      data: [],
      total: 0,
      message: '验证响应数据时发生错误'
    };
  }
};
