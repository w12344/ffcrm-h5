import {
  Customer,
  CustomerBubble,
  BubbleSizeConfig,
  AreaConfig,
} from "@/types/dashboard";
import { PerformanceMonitor } from "./performanceMonitor";

/**
 * 客户等级颜色配置 - 暗色主题
 */
const LEVEL_COLORS_DARK: Record<
  "A" | "B" | "C" | "D" | "X",
  { color: string; gradient: string; boxShadow?: string }
> = {
  A: {
    color: "#ff6b9d",
    gradient: "linear-gradient( 180deg, #FD4895 0%, #C438EF 100%)",
    // boxShadow: '0 4px 15px rgba(255, 107, 157, 0.4), 0 0 20px rgba(255, 107, 157, 0.2)',
  },
  B: {
    color: "#ff9f43",
    gradient: "linear-gradient( 230deg, #FFB929 0%, #FF7FB7 100%)", // 原C的橙粉渐变
    // boxShadow: '0 4px 15px rgba(255, 159, 67, 0.4), 0 0 20px rgba(255, 159, 67, 0.2)',
  },
  C: {
    color: "#2ed573",
    gradient: "linear-gradient( 150deg, #80FFB3 0%, #5283E2 100%)", // 原D的绿蓝渐变
    // boxShadow: '0 4px 15px rgba(46, 213, 115, 0.4), 0 0 20px rgba(46, 213, 115, 0.2)',
  },
  D: {
    color: "#3742fa",
    gradient: "linear-gradient( 35deg, #06D7F6 0%, #4807EA 100%)", // 原B的蓝紫渐变
    // boxShadow: '0 4px 15px rgba(55, 66, 250, 0.4), 0 0 20px rgba(55, 66, 250, 0.2)',
  },
  X: {
    color: "#a4b0be",
    gradient:
      "linear-gradient( 212deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.5) 23%, rgba(255,255,255,0.3) 48%, rgba(0,0,0,0.6) 100%)",
    // boxShadow: '0 4px 15px rgba(164, 176, 190, 0.3), 0 0 20px rgba(164, 176, 190, 0.15)',
  },
};

/**
 * 客户等级颜色配置 - 浅色主题
 */
const LEVEL_COLORS_LIGHT: Record<
  "A" | "B" | "C" | "D" | "X",
  { color: string; gradient: string; boxShadow?: string }
> = {
  A: {
    color: "#fd4895",
    gradient: "linear-gradient(207deg, #FD4895 -12.28%, #C438EF 83.42%)",
  },
  B: {
    color: "#ffb929",
    gradient: "linear-gradient(180deg, #FFB929 0%, #FF7FB7 100%)", // 原C的橙粉渐变
  },
  C: {
    color: "#80ffb3",
    gradient: "linear-gradient(211deg, #80FFB3 4.54%, #5283E2 133.39%)", // 原D的绿蓝渐变
  },
  D: {
    color: "#06d7f6",
    gradient: "linear-gradient(37deg, #06D7F6 -0.08%, #4807EA 125.29%)", // 原B的蓝紫渐变
  },
  X: {
    color: "#979797",
    gradient:
      "linear-gradient(213deg, rgba(151, 151, 151, 0.06) 7.33%, rgba(151, 151, 151, 0.19) 48.5%, rgba(151, 151, 151, 0.50) 92.96%)",
  },
};

/**
 * 根据主题模式获取颜色配置
 */
const getLevelColors = (themeMode: "dark" | "light" = "dark") => {
  return themeMode === "light" ? LEVEL_COLORS_LIGHT : LEVEL_COLORS_DARK;
};

/**
 * 默认颜色配置（向后兼容）
 */
const LEVEL_COLORS = LEVEL_COLORS_DARK;

/**
 * 气泡尺寸配置（基准值，基于1920px屏幕宽度）
 */
const BUBBLE_SIZE_CONFIG: BubbleSizeConfig = {
  minSize: 30, // 最小尺寸（用于分数为0或没打分的情况）
  maxSize: 80, // 最大尺寸
  defaultSize: 30, // 质量分为0或没打分时的固定尺寸（等于minSize）
};

/**
 * 基准屏幕宽度（用于计算缩放比例）
 */
const BASE_SCREEN_WIDTH = 1920;

/**
 * 区域配置
 */
const AREA_CONFIG: AreaConfig = {
  surface: {
    yRange: [0, 70], // 水面区域：从顶部开始（0%-70%），第一排紧贴顶部
    rows: 8, // 保留行数配置（未使用，但保持兼容性）
  },
  bottom: {
    yRange: [85, 100], // 池底区域：紧贴底部（85%-100%），100%对应气泡容器底部（X轴上方）
    rows: 1, // 固定1行，多余客户自动流向左侧（支持横向滚动）
  },
};

/**
 * 计算缩放比例
 * @param containerWidth 容器宽度（像素）
 * @returns 缩放比例
 */
const calculateScale = (containerWidth: number): number => {
  // 根据容器宽度相对于基准宽度的比例计算缩放系数
  return containerWidth / BASE_SCREEN_WIDTH;
};

/**
 * 根据质量分计算气泡尺寸
 * @param qualityScore 质量分（肥瘦分）0-10
 * @param containerWidth 容器宽度（像素），用于动态缩放
 * @param sizeScale 额外尺寸缩放（用于达到高度/面积目标），默认1
 * @returns 气泡尺寸（像素）
 */
const calculateBubbleSize = (
  qualityScore: number,
  containerWidth: number,
  sizeScale: number = 1
): number => {
  const scale = calculateScale(containerWidth) * sizeScale;

  // 如果质量分为0或负数，使用最小尺寸
  if (qualityScore <= 0) {
    return BUBBLE_SIZE_CONFIG.minSize * scale;
  }

  // 质量分在0-10之间，线性映射到minSize-maxSize
  // 确保即使分数很小也能显示
  const ratio = Math.min(qualityScore / 10, 1); // 防止超过1
  const baseSize =
    BUBBLE_SIZE_CONFIG.minSize +
    ratio * (BUBBLE_SIZE_CONFIG.maxSize - BUBBLE_SIZE_CONFIG.minSize);
  return baseSize * scale;
};

/**
 * 检查气泡是否应该显示警示标识（感叹号）
 * 注意：该字段由后端计算提供，前端直接使用
 * 后端计算规则：客户存在待解决异议或AI识别的相关风险
 */
const shouldShowAlert = (customer: Customer): boolean => {
  return customer.hasAlert ?? false;
};

/**
 * 检查气泡是否应该闪烁（表示存在机会）
 * 注意：该字段由后端计算提供，前端直接使用
 * 后端计算规则：客户成熟度90分以上但未成交，或AI识别的相关机会
 */
const shouldBlink = (customer: Customer): boolean => {
  return customer.hasOpportunity ?? false;
};

/**
 * 对客户进行排序
 * 水面区域：按最近沟通时间倒序（从右向左依次排列，越活跃的气泡越靠右，Index 0 最靠右）
 * 池底区域：按建联时间或最近降级时间先后排序（越近建联或退回的客户排在越前面，右侧/最显眼位置，Index 0 最靠右）
 */
const sortCustomers = (
  customers: Customer[],
  area: "surface" | "bottom"
): Customer[] => {
  if (area === "surface") {
    // 水面区域：按最近沟通时间排序，最近的在右边（从右向左排列）
    // 所以最近的应该最先处理，使用倒序
    return [...customers].sort(
      (a, b) => b.lastContactTime.getTime() - a.lastContactTime.getTime()
    );
  } else {
    // 池底区域：按建联时间或最近降级时间先后排序
    // 降级时间优先，如果没有降级时间，则使用建联时间
    return [...customers].sort((a, b) => {
      const timeA = a.demoteTime ? a.demoteTime.getTime() : a.createTime.getTime();
      const timeB = b.demoteTime ? b.demoteTime.getTime() : b.createTime.getTime();
      return timeB - timeA; // 倒序，最近的在最前面(右侧)
    });
  }
};

// 旧的碰撞检测函数已移除，水面排布改为像素级“最低可行高度”算法

// 旧的“沿X方向下落寻找最低Y”的函数已彻底移除，改为严格的行式相切排布

/**
 * 内部类型：用于水面区域行构建与度量
 */
type SurfaceRowItem = {
  xPx: number;
  radius: number;
  size: number;
  customer: Customer;
  colorKey: keyof typeof LEVEL_COLORS;
  __yPx?: number;
};

type SurfaceLayoutMetrics = {
  rows: SurfaceRowItem[][];
  firstRowYPx: number;
  minYPx: number;
  maxYPxLimit: number;
  containerHeight: number;
};

/**
 * 构建水面区域行布局并返回度量（用于测量高度；不改变排布算法）
 */
const buildSurfaceRows = (
  customers: Customer[],
  containerWidth: number,
  containerHeightParam: number | undefined,
  sizeScale: number
): SurfaceLayoutMetrics => {
  const sortedCustomers = sortCustomers(customers, "surface");

  const [minY, maxY] = AREA_CONFIG.surface.yRange;
  const containerHeight =
    typeof containerHeightParam === "number" && containerHeightParam > 0
      ? containerHeightParam
      : containerWidth * 0.6;
  const minYPx = (minY * containerHeight) / 100; // 顶部边界
  const maxYPx = (maxY * containerHeight) / 100; // 水面底部边界
  const rightMargin = 10;
  const leftMargin = 10;

  const rows: SurfaceRowItem[][] = [];

  // 预先计算尺寸
  const queue: SurfaceRowItem[] = sortedCustomers.map((customer) => {
    const size = calculateBubbleSize(
      customer.qualityScore,
      containerWidth,
      sizeScale
    );
    const radius = size / 2;
    return { xPx: 0, radius, size, customer, colorKey: customer.level };
  });

  // 第一行（严格横向相切）
  const firstRow: SurfaceRowItem[] = [];
  let cursorXPx = containerWidth - rightMargin;
  let rowMaxRadius = 0;
  while (queue.length > 0) {
    const item = queue[0];
    const xPx = cursorXPx - item.radius;
    if (xPx - item.radius < leftMargin) break;
    item.xPx = xPx;
    firstRow.push(item);
    rowMaxRadius = Math.max(rowMaxRadius, item.radius);
    cursorXPx = xPx - item.radius;
    queue.shift();
  }
  if (firstRow.length > 0) rows.push(firstRow);

  // 第一行统一Y
  const firstRowYPx = minYPx + rowMaxRadius;

  // 后续行：逐行构建（相切最低可行高度）
  while (queue.length > 0 && rows.length < 20) {
    const upperRow = rows[rows.length - 1];
    const row: SurfaceRowItem[] = [];
    cursorXPx = containerWidth - rightMargin;
    while (queue.length > 0) {
      const item = queue[0];
      const xPx = cursorXPx - item.radius;
      if (xPx - item.radius < leftMargin) break;
      item.xPx = xPx;

      // 与上一行严格相切的最低可行高度（不再额外+1，避免可见缝隙）
      let yPxCandidate = firstRowYPx;
      for (const upper of upperRow) {
        const dx = Math.abs(xPx - upper.xPx);
        const minDist = item.radius + upper.radius;
        if (dx < minDist) {
          const dy = Math.sqrt(Math.max(minDist * minDist - dx * dx, 0));
          const upperYPx = (upper as any).__yPx ?? firstRowYPx;
          const requiredY = upperYPx + dy;
          yPxCandidate = Math.max(yPxCandidate, requiredY);
        }
      }

      if (yPxCandidate + item.radius > maxYPx) break;

      (item as any).__yPx = yPxCandidate;
      row.push(item);
      cursorXPx = xPx - item.radius;
      queue.shift();
    }

    if (row.length === 0) break;
    rows.push(row);
  }

  return { rows, firstRowYPx, minYPx, maxYPxLimit: maxYPx, containerHeight };
};

/**
 * 计算池底区域气泡的X坐标位置（精确相切排列）
 * @param bubbles 已排布的气泡
 * @param newSize 新气泡的尺寸（像素）
 * @param y 当前气泡的Y坐标（百分比）
 * @param containerWidth 容器宽度（像素）
 * @param area 区域类型（水面或池底）
 * @returns X坐标位置（百分比）
 */
// const calculateXPosition = (
//   bubbles: CustomerBubble[],
//   newSize: number,
//   y: number,
//   containerWidth: number,
//   containerHeight: number,
//   area: "surface" | "bottom" = "surface"
// ): number => {
//   const newRadius = newSize / 2;
//   const maxXPx = containerWidth - newRadius - 10; // 右边界留10px边距

//   if (bubbles.length === 0) {
//     return (maxXPx / containerWidth) * 100;
//   }

//   if (area === "bottom") {
//     // 池底区域：精确的从右到左相切排列
//     const yPx = (y * containerHeight) / 100;
//     const rowTolerance = 5; // 5像素的行容差

//     // 找到同一行（Y坐标相近）的气泡
//     const sameRowBubbles = bubbles.filter((bubble) => {
//       const bubbleYPx = (bubble.y * containerHeight) / 100;
//       return Math.abs(bubbleYPx - yPx) <= rowTolerance;
//     });

//     if (sameRowBubbles.length === 0) {
//       return (maxXPx / containerWidth) * 100;
//     }

//     // 找到最左边的气泡
//     sameRowBubbles.sort((a, b) => a.x - b.x);
//     const leftmostBubble = sameRowBubbles[0];

//     // 计算相切位置（像素坐标）
//     const leftmostXPx = (leftmostBubble.x * containerWidth) / 100;
//     const leftmostRadius = leftmostBubble.size / 2;
//     const tangentDistance = newRadius + leftmostRadius;
//     const newXPx = leftmostXPx - tangentDistance;

//     return (newXPx / containerWidth) * 100;
//   }

//   // 水面区域：使用calculateSurfacePosition处理
//   return (maxXPx / containerWidth) * 100;
// };

// 已废弃的旧水面计算函数被移除，改为像素级相切堆叠算法

/**
 * 布局水面区域的气泡
 * 气泡从顶部依次向下排列，每行从右向左相切排布
 * @param customers 客户列表
 * @param containerWidth 容器宽度（像素）
 * @param themeMode 主题模式
 */
const layoutSurfaceBubbles = (
  customers: Customer[],
  containerWidth: number,
  containerHeightParam?: number,
  sizeScale: number = 1,
  themeMode: "dark" | "light" = "dark"
): CustomerBubble[] => {
  const bubbles: CustomerBubble[] = [];
  const sortedCustomers = sortCustomers(customers, "surface");

  const [minY, maxY] = AREA_CONFIG.surface.yRange;
  const containerHeight =
    typeof containerHeightParam === "number" && containerHeightParam > 0
      ? containerHeightParam
      : containerWidth * 0.6;
  const minYPx = (minY * containerHeight) / 100; // 顶部边界
  const maxYPx = (maxY * containerHeight) / 100; // 水面底部边界
  const rightMargin = 10;
  const leftMargin = 10;

  // 将客户按顺序放入多行：
  // - 第一行：严格同一Y，水平方向相切，保证横向整齐
  // - 后续行：同一行保持横向相切，Y为“与上一行相切的最低可行高度”

  type RowItem = {
    xPx: number;
    radius: number;
    size: number;
    customer: Customer;
    colorKey: keyof typeof LEVEL_COLORS;
  };
  const rows: RowItem[][] = [];

  // 预先将尺寸算出来，避免重复计算
  const queue: RowItem[] = sortedCustomers.map((customer) => {
    const size = calculateBubbleSize(
      customer.qualityScore,
      containerWidth,
      sizeScale
    );
    const radius = size / 2;
    return { xPx: 0, radius, size, customer, colorKey: customer.level };
  });

  // 生成第一行（严格横向相切、固定Y）
  const firstRow: RowItem[] = [];
  let cursorXPx = containerWidth - rightMargin; // 从最右侧向左放
  let rowMaxRadius = 0;
  while (queue.length > 0) {
    const item = queue[0];
    const xPx = cursorXPx - item.radius; // 中心点
    if (xPx - item.radius < leftMargin) break; // 放不下了，留给下一行
    item.xPx = xPx;
    firstRow.push(item);
    rowMaxRadius = Math.max(rowMaxRadius, item.radius);
    cursorXPx = xPx - item.radius; // 与当前球相切
    queue.shift();
  }
  if (firstRow.length > 0) rows.push(firstRow);

  // 第一行统一Y
  const firstRowYPx = minYPx + rowMaxRadius;

  // 后续行：逐行构建
  while (queue.length > 0 && rows.length < 20) {
    // 防御上限
    const upperRow = rows[rows.length - 1];
    const row: RowItem[] = [];
    cursorXPx = containerWidth - rightMargin;
    while (queue.length > 0) {
      const item = queue[0];
      const xPx = cursorXPx - item.radius;
      if (xPx - item.radius < leftMargin) break; // 当前行横向放不下
      item.xPx = xPx;

      // 计算与上一行相切所需的最小Y
      let yPxCandidate = firstRowYPx + 1; // 至少在第一行之下
      for (const upper of upperRow) {
        const dx = Math.abs(xPx - upper.xPx);
        const minDist = item.radius + upper.radius;
        if (dx < minDist) {
          const dy = Math.sqrt(Math.max(minDist * minDist - dx * dx, 0));
          const upperYPx = (upper as any).__yPx ?? firstRowYPx; // 上一行球心Y
          const requiredY = upperYPx + dy; // 相切所需Y
          yPxCandidate = Math.max(yPxCandidate, requiredY);
        }
      }

      // 边界保护
      if (yPxCandidate + item.radius > maxYPx) break; // 当前行再也放不下

      // 记录当前行该球的Y，供下一行使用
      (item as any).__yPx = yPxCandidate;
      row.push(item);
      cursorXPx = xPx - item.radius; // 与本行上一个球相切
      queue.shift();
    }

    if (row.length === 0) break; // 无法继续排布
    rows.push(row);
  }

  // 将行转为最终气泡（第一行Y固定，后续行使用构建阶段写入的 __yPx）

  // 获取主题对应的颜色配置
  const levelColors = getLevelColors(themeMode);

  // 第一行输出
  for (let i = 0; i < firstRow.length; i++) {
    const item = firstRow[i];
    (item as any).__yPx = firstRowYPx;
    const colorConfig = levelColors[item.colorKey];
    bubbles.push({
      id: `surface_${item.customer.id}_${bubbles.length}`,
      customer: item.customer,
      x: (item.xPx / containerWidth) * 100,
      y: (firstRowYPx / containerHeight) * 100,
      size: item.size,
      color: colorConfig.color,
      gradient: colorConfig.gradient,
      boxShadow: colorConfig.boxShadow ?? "none",
      area: "surface",
      hasAlert: shouldShowAlert(item.customer),
      shouldBlink: shouldBlink(item.customer),
      index: bubbles.length,
    });
  }

  // 后续行输出（按与上一行相切的最低可行高度）
  for (let r = 1; r < rows.length; r++) {
    const upperRow = rows[r - 1];
    for (let i = 0; i < rows[r].length; i++) {
      const item = rows[r][i];
      // 计算与上一行的最低Y
      // 精确相切：从第一行Y作为基准开始累积
      let yPx = firstRowYPx;
      for (const upper of upperRow) {
        const dx = Math.abs(item.xPx - upper.xPx);
        const minDist = item.radius + upper.radius;
        if (dx < minDist) {
          const dy = Math.sqrt(Math.max(minDist * minDist - dx * dx, 0));
          const upperYPx = (upper as any).__yPx ?? firstRowYPx;
          const requiredY = upperYPx + dy;
          yPx = Math.max(yPx, requiredY);
        }
      }
      // 边界保护
      yPx = Math.min(yPx, maxYPx - item.radius);
      (item as any).__yPx = yPx;

      const colorConfig = levelColors[item.colorKey];
      bubbles.push({
        id: `surface_${item.customer.id}_${bubbles.length}`,
        customer: item.customer,
        x: (item.xPx / containerWidth) * 100,
        y: (yPx / containerHeight) * 100,
        size: item.size,
        color: colorConfig.color,
        gradient: colorConfig.gradient,
        boxShadow: colorConfig.boxShadow ?? "none",
        area: "surface",
        hasAlert: shouldShowAlert(item.customer),
        shouldBlink: shouldBlink(item.customer),
        index: bubbles.length,
      });
    }
  }

  return bubbles;
};

/**
 * 布局池底区域的气泡
 * 初始只显示第一行（紧贴底部），滚动后在第一行下方继续显示剩余的球
 * @param customers 客户列表
 * @param containerWidth 容器宽度（像素）
 * @param containerHeightParam 容器高度（像素）
 * @param sizeScale 尺寸缩放比例
 * @param themeMode 主题模式
 */
const layoutBottomBubbles = (
  customers: Customer[],
  containerWidth: number,
  containerHeightParam?: number,
  sizeScale: number = 1,
  themeMode: "dark" | "light" = "dark"
): CustomerBubble[] => {
  const bubbles: CustomerBubble[] = [];
  const sortedCustomers = sortCustomers(customers, "bottom");

  // 获取主题对应的颜色配置
  const levelColors = getLevelColors(themeMode);

  // 池底区域Y坐标范围
  // const [minY] = AREA_CONFIG.bottom.yRange;
  const containerHeight =
    typeof containerHeightParam === "number" && containerHeightParam > 0
      ? containerHeightParam
      : containerWidth * 0.6;

  // const minYPx = (minY * containerHeight) / 100; // 池底顶部边界
  // 池底底部边界：容器底部，让球的底部紧贴容器底部（X轴会覆盖在球上方）
  const maxYPx = containerHeight;
  const rightMargin = 10;
  const leftMargin = 10;

  // 使用类似水面区域的多行布局逻辑
  type RowItem = {
    xPx: number;
    radius: number;
    size: number;
    customer: Customer;
    colorKey: keyof typeof LEVEL_COLORS;
  };
  const rows: RowItem[][] = [];

  // 预先计算所有气泡的尺寸
  const queue: RowItem[] = sortedCustomers.map((customer) => {
    const size = calculateBubbleSize(
      customer.qualityScore,
      containerWidth,
      sizeScale
    );
    const radius = size / 2;
    return { xPx: 0, radius, size, customer, colorKey: customer.level };
  });

  // 生成第一行（从右到左，紧贴底部）
  const firstRow: RowItem[] = [];
  let cursorXPx = containerWidth - rightMargin;

  for (const item of queue) {
    const leftEdge = cursorXPx - item.radius * 2;
    if (leftEdge < leftMargin && firstRow.length > 0) {
      break; // 第一行已满
    }
    item.xPx = cursorXPx - item.radius;
    firstRow.push(item);
    cursorXPx = leftEdge;
  }

  // 计算第一行的Y坐标：让球的底部紧贴底部边界（maxYPx）
  // 找到第一行中最大的半径
  const firstRowMaxRadius = firstRow.length > 0 
    ? Math.max(...firstRow.map(item => item.radius)) 
    : 0;
  // 球心Y坐标 = 底部边界 - 最大半径，这样球的底部就会紧贴底部边界
  const firstRowYPx = maxYPx - firstRowMaxRadius;

  if (firstRow.length > 0) {
    rows.push(firstRow);
  }

  // 移除已放置的气泡
  queue.splice(0, firstRow.length);

  // 生成后续行（向下堆叠，在第一行下方）- 渲染所有剩余的球
  let currentRowYPx = firstRowYPx;

  while (queue.length > 0) {
    const prevRow = rows[rows.length - 1];
    if (!prevRow || prevRow.length === 0) break;

    // 计算新行的Y坐标（与上一行相切，向下堆叠）
    const maxRadiusInPrevRow = Math.max(...prevRow.map((item) => item.radius));
    const maxRadiusInQueue =
      queue.length > 0 ? Math.max(...queue.map((item) => item.radius)) : 0;

    // 新行Y坐标 = 上一行Y坐标 + 上一行最大半径 + 当前行最大半径（向下堆叠）
    currentRowYPx = currentRowYPx + maxRadiusInPrevRow + maxRadiusInQueue;

    // 不再检查是否超出池底顶部边界，继续向上堆叠所有球
    // 容器高度会自动扩展以容纳所有球

    // 生成新行
    const newRow: RowItem[] = [];
    cursorXPx = containerWidth - rightMargin;

    // 遍历队列中的所有球，尽可能多地放入当前行
    const remainingQueue = [...queue];
    for (let i = 0; i < remainingQueue.length; i++) {
      const item = remainingQueue[i];
      const leftEdge = cursorXPx - item.radius * 2;
      if (leftEdge < leftMargin && newRow.length > 0) {
        break; // 当前行已满，剩余的球放到下一行
      }
      item.xPx = cursorXPx - item.radius;
      newRow.push(item);
      cursorXPx = leftEdge;
    }

    if (newRow.length > 0) {
      rows.push(newRow);
      queue.splice(0, newRow.length);
    } else {
      // 如果一个球都放不下，强制放置第一个球（避免死循环）
      if (queue.length > 0) {
        const item = queue[0];
        item.xPx = containerWidth - rightMargin - item.radius;
        rows.push([item]);
        queue.splice(0, 1);
      }
    }
  }

  console.log(
    `🎯 池底布局完成: 共${rows.length}行, ${sortedCustomers.length}个球`
  );
  console.log(`🎯 剩余未放置的球: ${queue.length}个`);

  // 将行数据转换为气泡数据
  let accumulatedYPx = firstRowYPx; // 累积的Y坐标

  rows.forEach((row, rowIndex) => {
    // 计算该行的Y坐标
    let rowYPx: number;
    if (rowIndex === 0) {
      rowYPx = firstRowYPx; // 第一行紧贴底部
    } else {
      const prevRow = rows[rowIndex - 1];
      const maxRadiusInPrevRow = Math.max(
        ...prevRow.map((item) => item.radius)
      );
      const maxRadiusInCurrentRow = Math.max(...row.map((item) => item.radius));
      // 新行Y坐标 = 上一行Y坐标 + 上一行最大半径 + 当前行最大半径（向下堆叠）
      accumulatedYPx =
        accumulatedYPx + maxRadiusInPrevRow + maxRadiusInCurrentRow;
      rowYPx = accumulatedYPx;
    }

    row.forEach((item, colIndex) => {
      const colorConfig = levelColors[item.colorKey];
      const y = (rowYPx / containerHeight) * 100;
      const x = (item.xPx / containerWidth) * 100;

      const bubble: CustomerBubble = {
        id: `bottom_${item.customer.id}_${rowIndex}_${colIndex}`,
        customer: item.customer,
        x,
        y,
        size: item.size,
        color: colorConfig.color,
        gradient: colorConfig.gradient,
        boxShadow: colorConfig.boxShadow ?? "none",
        area: "bottom",
        hasAlert: shouldShowAlert(item.customer),
        shouldBlink: shouldBlink(item.customer),
        index: bubbles.length,
      };

      bubbles.push(bubble);
    });
  });

  return bubbles;
};

/**
 * 将客户数据转换为气泡布局数据
 *
 * 业务规则说明：
 *
 * 1. 数据来源：已匹配销售人员的客户（学生），即我负责的客户（学生）
 *    - 家庭群客户只展示学生气泡
 *
 * 2. 数据权限：仅查看我负责的客户
 *
 * 3. 数据展示方式：气泡图/表格
 *
 * 4. 气泡图展示说明：
 *    - 气泡大小：根据客户质量分（肥瘦分 ∈ [0,10]），线性映射到气泡尺寸（30-80px）
 *      特殊情况：肥瘦分为0或没打分时，固定气泡尺寸（30px）
 *      气泡大小会根据屏幕宽度动态缩放，保持相对比例一致
 *
 *    - 气泡颜色：根据客户评级（A/B/C/D/X），输出预定义气泡颜色
 *
 *    - 气泡位置：分为水面区域和池底区域
 *      * 水面区域（Y: 5%-50%）：活跃客户（未放弃且1周内有沟通）
 *        - X轴：根据最近沟通时间倒序，气泡从右向左依次排列，相切排布
 *        - Y轴：从顶部依次向下自然排列（类似俄罗斯方块从上往下堆叠）
 *          第一行放满后自动换到第二行，依此类推
 *          多余客户自动流向左侧（支持横向滚动）
 *
 *      * 池底区域（Y: 60%-95%）：展示顾问主动放弃的客户，或超过1周未沟通的客户
 *        - X轴：根据放弃时间倒序或未沟通时长倒序，气泡从右向左依次排列
 *        - Y轴：根据客户成熟度分数在池底区域内动态计算
 *          成熟度越高越靠上（Y值越小），成熟度越低越靠下（Y值越大）
 *        - 多余客户自动流向左侧（支持横向滚动）
 *
 *    - 气泡警示标识（存在风险/问题）：客户存在待解决异议，或AI识别的相关风险
 *
 *    - 气泡闪烁（存在机会）：客户成熟度90分以上但未成交，或AI识别的相关机会
 *
 *    - 展示全量我的客户（学生）数据
 *
 * 5. 坐标轴说明：
 *    - X轴：最近沟通时间排序（从右到左，最近的在右边）
 *    - Y轴：分为两个独立区域
 *      * 水面区域（5%-50%）：从顶部依次向下自然堆叠，与成熟度无关
 *      * 池底区域（60%-95%）：根据成熟度动态分布（成熟度100->60%, 成熟度0->95%）
 *
 * @param customers 客户列表
 * @param containerWidth 容器宽度（像素），用于动态缩放气泡大小
 */
export const generateBubbleLayout = (
  customers: Customer[],
  containerWidth: number = BASE_SCREEN_WIDTH,
  containerHeight?: number,
  themeMode: "dark" | "light" = "dark"
): CustomerBubble[] => {
  return PerformanceMonitor.measure("气泡布局生成", () => {
    // 性能检查：如果客户数量过多，给出警告
    if (customers.length > 1000) {
      console.warn(`⚠️ 客户数量过多 (${customers.length})，可能影响性能`);
    }

    // 分离水面区域和池底区域的客户
    const surfaceCustomers: Customer[] = [];
    const bottomCustomers: Customer[] = [];

    const now = new Date().getTime();

    customers.forEach((customer) => {
      const daysSinceContact = (now - customer.lastContactTime.getTime()) / (24 * 60 * 60 * 1000);
      
      // 双轨制入水面：
      // 1. 手动打捞 (isPinned)
      // 2. AI自动托气 (探针判断关系升温，这里简化为 意向度>60 并且 最近7天有过沟通)
      const isSurface = customer.isPinned || (customer.maturityScore >= 60 && daysSinceContact <= 7);
      
      // 死亡线淘汰机制（挤压回流公海）：
      // 超过14天未沟通（且未置顶）的将在其他地方被过滤掉，但目前如果传进来了，就强制下沉池底或抛弃。
      // 这里将其沉降至池底
      
      if (isSurface) {
        surfaceCustomers.push(customer);
      } else {
        bottomCustomers.push(customer);
      }
    });

    // 动态尺寸缩放：目标让水面高度≈容器高度50%，并尽量让面积比≈50/50
    if (surfaceCustomers.length === 0 && bottomCustomers.length === 0) {
      return [] as CustomerBubble[];
    }

    const effContainerHeight =
      typeof containerHeight === "number" && containerHeight > 0
        ? containerHeight
        : containerWidth * 0.6;

    // 第一遍：测量水面高度（scale=1）
    let surfaceScale = 1;
    if (surfaceCustomers.length > 0) {
      const metrics = buildSurfaceRows(
        surfaceCustomers,
        containerWidth,
        effContainerHeight,
        1
      );
      let usedMaxYPx = metrics.firstRowYPx;
      for (let r = 0; r < metrics.rows.length; r++) {
        for (let i = 0; i < metrics.rows[r].length; i++) {
          const it = metrics.rows[r][i];
          const itemYPx = (it.__yPx ?? metrics.firstRowYPx) + it.radius;
          if (itemYPx > usedMaxYPx) usedMaxYPx = itemYPx;
        }
      }
      const usedHeightPx = Math.max(0, usedMaxYPx - metrics.minYPx);
      const targetHeightPx = effContainerHeight * 0.5;
      if (usedHeightPx > 0) {
        const rawScale = targetHeightPx / usedHeightPx;
        surfaceScale = Math.min(Math.max(rawScale, 0.6), 2.0);
      }
    }

    // 统一上下区域尺寸比例：池底与水面使用相同的 scale，
    // 确保相同质量分在上下区域的尺寸完全一致
    const bottomScale = surfaceScale;

    // 分别布局两个区域（使用动态scale），不改变排布算法
    const surfaceBubbles = PerformanceMonitor.measure("水面区域布局", () =>
      layoutSurfaceBubbles(
        surfaceCustomers,
        containerWidth,
        effContainerHeight,
        surfaceScale,
        themeMode
      )
    );
    const bottomBubbles = PerformanceMonitor.measure("池底区域布局", () =>
      layoutBottomBubbles(
        bottomCustomers,
        containerWidth,
        effContainerHeight,
        bottomScale,
        themeMode
      )
    );

    const totalBubbles = [...surfaceBubbles, ...bottomBubbles];
    console.log(
      `✅ 生成了 ${totalBubbles.length} 个气泡 (水面: ${surfaceBubbles.length}, 池底: ${bottomBubbles.length})`
    );

    return totalBubbles;
  });
};

/**
 * 导出配置供外部使用
 */
export { BUBBLE_SIZE_CONFIG, AREA_CONFIG, LEVEL_COLORS };
