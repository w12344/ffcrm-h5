/**
 * 日期时间格式化工具
 * 
 * 提供统一的日期时间格式化功能，适用于聊天消息、历史记录等场景
 * 
 * @module dateFormat
 */

/**
 * 时间格式化选项
 */
export interface DateFormatOptions {
  /** 是否显示秒数，默认 true */
  showSeconds?: boolean;
  /** 是否使用12小时制，默认 false (使用24小时制) */
  use12Hour?: boolean;
  /** 自定义"今天"的文本，默认不显示 */
  todayText?: string;
  /** 自定义"昨天"的文本，默认 "昨日" */
  yesterdayText?: string;
  /** 自定义"前天"的文本，默认 "前天" */
  beforeYesterdayText?: string;
}

/**
 * 日期比较结果枚举
 */
enum DateRelation {
  /** 今天 */
  TODAY = 'today',
  /** 昨天 */
  YESTERDAY = 'yesterday',
  /** 前天 */
  BEFORE_YESTERDAY = 'before_yesterday',
  /** 今年的其他日期 */
  THIS_YEAR = 'this_year',
  /** 往年 */
  PREVIOUS_YEARS = 'previous_years',
}

/**
 * 获取日期的开始时间（00:00:00.000）
 * @param date 日期对象
 * @returns 该日期的开始时间
 */
function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 判断两个日期是否为同一天
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 是否为同一天
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 计算两个日期之间相差的天数
 * @param date1 较新的日期
 * @param date2 较旧的日期
 * @returns 相差的天数
 */
function getDaysDifference(date1: Date, date2: Date): number {
  const start = getStartOfDay(date2);
  const end = getStartOfDay(date1);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 判断日期与当前时间的关系
 * @param date 要判断的日期
 * @param now 当前时间，默认为 new Date()
 * @returns 日期关系枚举
 */
function getDateRelation(date: Date, now: Date = new Date()): DateRelation {
  // 今天
  if (isSameDay(date, now)) {
    return DateRelation.TODAY;
  }

  const daysDiff = getDaysDifference(now, date);

  // 昨天
  if (daysDiff === 1) {
    return DateRelation.YESTERDAY;
  }

  // 前天
  if (daysDiff === 2) {
    return DateRelation.BEFORE_YESTERDAY;
  }

  // 今年
  if (date.getFullYear() === now.getFullYear()) {
    return DateRelation.THIS_YEAR;
  }

  // 往年
  return DateRelation.PREVIOUS_YEARS;
}

/**
 * 格式化时间部分（时:分:秒 或 时:分）
 * @param date 日期对象
 * @param showSeconds 是否显示秒数
 * @param use12Hour 是否使用12小时制
 * @returns 格式化后的时间字符串
 */
function formatTime(date: Date, showSeconds: boolean = true, use12Hour: boolean = false): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  let period = '';
  if (use12Hour) {
    period = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  }

  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');

  const timeStr = showSeconds
    ? `${hoursStr}:${minutesStr}:${secondsStr}`
    : `${hoursStr}:${minutesStr}`;

  return `${timeStr}${period}`;
}

/**
 * 格式化日期部分（年-月-日 或 月-日）
 * @param date 日期对象
 * @param includeYear 是否包含年份
 * @returns 格式化后的日期字符串
 */
function formatDate(date: Date, includeYear: boolean = true): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');

  if (includeYear) {
    return `${year}-${monthStr}-${dayStr}`;
  }

  return `${monthStr}-${dayStr}`;
}

/**
 * 格式化聊天消息时间
 * 
 * 格式规则：
 * - 今天：只显示 时:分:秒
 * - 昨天：昨日 时:分:秒
 * - 前天：前天 时:分:秒
 * - 今年其他日期：月-日 时:分:秒
 * - 往年：年-月-日 时:分:秒
 * 
 * @param date 日期对象、时间戳或日期字符串
 * @param options 格式化选项
 * @returns 格式化后的时间字符串
 * 
 * @example
 * ```typescript
 * // 今天 14:30:45
 * formatChatTime(new Date());
 * // => "14:30:45"
 * 
 * // 昨天 14:30:45
 * formatChatTime(new Date(Date.now() - 24 * 60 * 60 * 1000));
 * // => "昨日 14:30:45"
 * 
 * // 前天 14:30:45
 * formatChatTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
 * // => "前天 14:30:45"
 * 
 * // 今年其他日期
 * formatChatTime(new Date('2025-01-15 14:30:45'));
 * // => "01-15 14:30:45"
 * 
 * // 往年
 * formatChatTime(new Date('2024-01-15 14:30:45'));
 * // => "2024-01-15 14:30:45"
 * 
 * // 自定义选项
 * formatChatTime(new Date(), { showSeconds: false, todayText: '今天' });
 * // => "今天 14:30"
 * ```
 */
export function formatChatTime(
  date: Date | number | string,
  options: DateFormatOptions = {}
): string {
  // 参数处理和验证
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    console.error('Invalid date parameter:', date);
    return '--:--:--';
  }

  // 验证日期是否有效
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '--:--:--';
  }

  // 合并默认选项
  const {
    showSeconds = true,
    use12Hour = false,
    todayText = '',
    yesterdayText = '昨日',
    beforeYesterdayText = '前天',
  } = options;

  // 获取当前时间
  const now = new Date();

  // 判断日期关系
  const relation = getDateRelation(dateObj, now);

  // 格式化时间部分
  const timeStr = formatTime(dateObj, showSeconds, use12Hour);

  // 根据日期关系返回不同格式
  switch (relation) {
    case DateRelation.TODAY:
      // 今天：只显示时间，或自定义前缀 + 时间
      return todayText ? `${todayText} ${timeStr}` : timeStr;

    case DateRelation.YESTERDAY:
      // 昨天：昨日 + 时间
      return `${yesterdayText} ${timeStr}`;

    case DateRelation.BEFORE_YESTERDAY:
      // 前天：前天 + 时间
      return `${beforeYesterdayText} ${timeStr}`;

    case DateRelation.THIS_YEAR:
      // 今年其他日期：月-日 + 时间
      return `${formatDate(dateObj, false)} ${timeStr}`;

    case DateRelation.PREVIOUS_YEARS:
      // 往年：年-月-日 + 时间
      return `${formatDate(dateObj, true)} ${timeStr}`;

    default:
      // 默认返回完整格式
      return `${formatDate(dateObj, true)} ${timeStr}`;
  }
}

/**
 * 格式化相对时间（用于历史记录列表等场景）
 * 
 * 格式规则：
 * - 1分钟内：刚刚
 * - 1小时内：X分钟前
 * - 24小时内：X小时前
 * - 今年：月-日
 * - 往年：年-月-日
 * 
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的相对时间字符串
 * 
 * @example
 * ```typescript
 * formatRelativeTime(new Date(Date.now() - 30 * 1000));
 * // => "刚刚"
 * 
 * formatRelativeTime(new Date(Date.now() - 30 * 60 * 1000));
 * // => "30分钟前"
 * 
 * formatRelativeTime(new Date(Date.now() - 5 * 60 * 60 * 1000));
 * // => "5小时前"
 * ```
 */
export function formatRelativeTime(date: Date | number | string): string {
  // 参数处理和验证
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    console.error('Invalid date parameter:', date);
    return '--';
  }

  // 验证日期是否有效
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '--';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();

  // 小于1分钟
  if (diffMs < 60 * 1000) {
    return '刚刚';
  }

  // 小于1小时
  if (diffMs < 60 * 60 * 1000) {
    const minutes = Math.floor(diffMs / (60 * 1000));
    return `${minutes}分钟前`;
  }

  // 小于24小时
  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    return `${hours}小时前`;
  }

  // 今年
  if (dateObj.getFullYear() === now.getFullYear()) {
    return formatDate(dateObj, false);
  }

  // 往年
  return formatDate(dateObj, true);
}

/**
 * 获取友好的日期描述（今天、昨天、前天等）
 * @param date 日期对象、时间戳或日期字符串
 * @returns 友好的日期描述
 * 
 * @example
 * ```typescript
 * getFriendlyDateText(new Date());
 * // => "今天"
 * 
 * getFriendlyDateText(new Date(Date.now() - 24 * 60 * 60 * 1000));
 * // => "昨天"
 * ```
 */
export function getFriendlyDateText(date: Date | number | string): string {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    return '';
  }

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const relation = getDateRelation(dateObj);

  switch (relation) {
    case DateRelation.TODAY:
      return '今天';
    case DateRelation.YESTERDAY:
      return '昨天';
    case DateRelation.BEFORE_YESTERDAY:
      return '前天';
    case DateRelation.THIS_YEAR:
      return formatDate(dateObj, false);
    case DateRelation.PREVIOUS_YEARS:
      return formatDate(dateObj, true);
    default:
      return formatDate(dateObj, true);
  }
}

