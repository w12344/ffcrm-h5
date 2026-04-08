import { v4 as uuidv4 } from 'uuid';

// Base62编码字符集
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * 将字符串转换为Base62编码
 */
export function encodeBase62(str: string): string {
  // 将字符串转换为数字数组
  const bytes = new TextEncoder().encode(str);
  let num = 0;
  
  // 将字节数组转换为一个大数
  for (let i = 0; i < bytes.length; i++) {
    num = num * 256 + bytes[i];
  }
  
  // 转换为Base62
  if (num === 0) return '0';
  
  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  
  return result;
}

/**
 * 生成UUID并进行Base62编码
 */
export function generateToken(): string {
  const uuid = uuidv4().replace(/-/g, ''); // 移除连字符
  // 为了缩短长度，我们只取UUID的前16个字符
  const shortUuid = uuid.substring(0, 16);
  return encodeBase62(shortUuid);
}

/**
 * 解析URL参数
 */
export function parseUrlParams(url?: string): Record<string, string> {
  const urlStr = url || window.location.href;
  const urlObj = new URL(urlStr);
  const params: Record<string, string> = {};
  
  // 1) 解析标准 query (?x=1) 部分
  urlObj.searchParams.forEach((value, key) => {
    params[key] = decodeURIComponent(value);
  });

  // 2) 兼容 hash 路由：#/path?x=1&y=2
  const hash = urlObj.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex !== -1) {
    const hashQuery = hash.substring(qIndex + 1);
    const hashParams = new URLSearchParams(hashQuery);
    hashParams.forEach((value, key) => {
      // hash 中的参数优先生效
      params[key] = decodeURIComponent(value);
    });
  }
  
  return params;
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级处理：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  
  return `${month}月${day}日`;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * 生成随机ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
