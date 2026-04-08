import { TransactionCustomer, TransactionBubble, BubbleSizeConfig, DeliveryHealth } from '../types/transaction';

// 尺寸配置（响应式计算基础）
const SIZE_CONFIG: BubbleSizeConfig = {
  minSize: 40,
  maxSize: 110,
  defaultSize: 55,
};

// 预定义健康度渐变主色与阴影 (对齐 CustomerUpgradePool 的 A/B/C/D/X 配色)
const HEALTH_COLORS: Record<DeliveryHealth, { color: string; gradient: string; glow: string }> = {
  healthy: {
    // 对应 C 级 (绿蓝渐变)
    color: "rgba(128, 255, 179, 0.4)",
    gradient: "linear-gradient(135deg, #80FFB3 0%, #5283E2 100%)",
    glow: "rgba(82, 131, 226, 0.3)",
  },
  pending: {
    // 对应 B 级 (橙粉渐变)
    color: "rgba(255, 185, 41, 0.4)",
    gradient: "linear-gradient(135deg, #FFB929 0%, #FF7FB7 100%)",
    glow: "rgba(255, 127, 183, 0.3)",
  },
  refunded: {
    // 对应 X 级 (灰色)
    color: "rgba(164, 176, 190, 0.2)",
    gradient: "linear-gradient(135deg, #a4b0be 0%, #747d8c 100%)",
    glow: "transparent",
  },
  dropped_out: {
    // 同退费颜色 (灰色)
    color: "rgba(164, 176, 190, 0.2)",
    gradient: "linear-gradient(135deg, #a4b0be 0%, #747d8c 100%)",
    glow: "transparent",
  },
};

/**
 * 排序逻辑：从右向左排列，最近更新的在最右边 (Index 0)
 */
const sortCustomers = (customers: TransactionCustomer[], area: 'surface' | 'bottom'): TransactionCustomer[] => {
  if (area === 'surface') {
    return [...customers].sort((a, b) => {
      const timeA = a.enrollmentTime?.getTime() || a.paymentTime.getTime();
      const timeB = b.enrollmentTime?.getTime() || b.paymentTime.getTime();
      return timeB - timeA;
    });
  } else {
    return [...customers].sort((a, b) => b.paymentTime.getTime() - a.paymentTime.getTime());
  }
};

/**
 * 规模计算
 */
const calculateBubbleSize = (ticketValue: number, containerWidth: number): number => {
  const baseScale = Math.min(1, containerWidth / 400);
  const min = SIZE_CONFIG.minSize * baseScale;
  const max = SIZE_CONFIG.maxSize * baseScale;
  return min + (ticketValue / 100) * (max - min);
};

export const generateTransactionLayout = (
  customers: TransactionCustomer[],
  containerWidth: number,
  containerHeight: number
): TransactionBubble[] => {
  if (containerWidth === 0 || containerHeight === 0 || customers.length === 0) return [];


  const surfaceCustomers: TransactionCustomer[] = [];
  const bottomCustomers: TransactionCustomer[] = [];

  customers.forEach(customer => {
    if (customer.isDroppedOut) {
      surfaceCustomers.push(customer); // 已退学在上方 (水面)
    } else if (customer.isRefunded) {
      bottomCustomers.push(customer);
    } else if (customer.isEnrolled) {
      surfaceCustomers.push(customer);
    } else {
      bottomCustomers.push(customer);
    }
  });

  const sortedSurface = sortCustomers(surfaceCustomers, 'surface');
  const sortedBottom = sortCustomers(bottomCustomers, 'bottom');

  const bubbles: TransactionBubble[] = [];

  // 水面布局：从右向左，从上向下 (Surface Range: 0%-70%)
  bubbles.push(...layoutRowPacking(sortedSurface, {
    yStart: 0,
    yEnd: containerHeight * 0.7,
    containerWidth,
    containerHeight,
    area: 'surface'
  }));

  // 池底布局：从右向左，从向下堆叠到底部边缘 (Bottom Range: 75%-100%)
  bubbles.push(...layoutRowPacking(sortedBottom, {
    yStart: containerHeight * 0.75,
    yEnd: containerHeight,
    containerWidth,
    containerHeight,
    area: 'bottom'
  }));

  return bubbles;
};

/**
 * 通用行排列算法：从右向左，从上向下依次排列
 */
function layoutRowPacking(
  customers: TransactionCustomer[],
  config: { yStart: number; yEnd: number; containerWidth: number; containerHeight: number; area: 'surface' | 'bottom' }
): TransactionBubble[] {
  const { yStart, yEnd, containerWidth, containerHeight, area } = config;
  const result: TransactionBubble[] = [];

  if (customers.length === 0) return result;

  const rightMargin = 10;
  const leftMargin = 10;

  // Queue of items to place
  const queue = customers.map(customer => {
    const size = calculateBubbleSize(customer.ticketValue, containerWidth);
    return { size, radius: size / 2, customer };
  });

  type RowItem = { xPx: number; radius: number; size: number; __yPx?: number; customer: TransactionCustomer };
  const rows: RowItem[][] = [];

  // First Row
  const firstRow: RowItem[] = [];
  let cursorXPx = containerWidth - rightMargin;
  let rowMaxRadius = 0;

  while (queue.length > 0) {
    const item = queue[0];
    const xPx = cursorXPx - item.radius;
    if (xPx - item.radius < leftMargin) break;

    firstRow.push({ xPx, radius: item.radius, size: item.size, customer: item.customer });
    rowMaxRadius = Math.max(rowMaxRadius, item.radius);
    cursorXPx = xPx - item.radius;
    queue.shift();
  }

  if (firstRow.length > 0) rows.push(firstRow);

  // Base Y for the first row (Top-to-Bottom)
  const firstRowYPx = yStart + rowMaxRadius;

  // Subsequent rows: place directly under the previous row, tangent
  while (queue.length > 0 && rows.length < 20) {
    const upperRow = rows[rows.length - 1];
    const row: RowItem[] = [];
    cursorXPx = containerWidth - rightMargin;

    while (queue.length > 0) {
      const item = queue[0];
      const xPx = cursorXPx - item.radius;
      if (xPx - item.radius < leftMargin) break;

      let yPxCandidate = firstRowYPx + 1;
      for (const upper of upperRow) {
        const dx = Math.abs(xPx - upper.xPx);
        const minDist = item.radius + Math.max(10, upper.radius); // Add padding for collision feeling
        if (dx < minDist) {
          const dy = Math.sqrt(Math.max(minDist * minDist - dx * dx, 0));
          const upperYPx = upper.__yPx ?? firstRowYPx;
          yPxCandidate = Math.max(yPxCandidate, upperYPx + dy);
        }
      }

      if (yPxCandidate + item.radius > yEnd) break;

      row.push({ xPx, radius: item.radius, size: item.size, __yPx: yPxCandidate, customer: item.customer });
      cursorXPx = xPx - item.radius;
      queue.shift();
    }

    if (row.length === 0) {
      // Emergency escape if one item is too big for the whole width
      if (queue.length > 0) queue.shift();
      continue;
    }
    rows.push(row);
  }

  // Map to final array
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const item = rows[r][c];

      let finalY = item.__yPx ?? firstRowYPx;
      if (area === 'bottom' && r === 0) {
        // If bottom area, stick to the floor if allowed
        finalY = yEnd - item.radius;
      } else if (area === 'bottom') {
        finalY = (rows[r - 1]?.[0]?.__yPx ?? (yEnd - item.radius)) + item.radius * 2;
      }

      if (item.customer.isRefunded && area === 'bottom') finalY = yEnd - item.radius;

      // Keep within bounds
      finalY = Math.min(Math.max(finalY, item.radius), containerHeight - item.radius);

      const styleInfo = HEALTH_COLORS[item.customer.deliveryHealth];

      result.push({
        id: item.customer.id,
        customer: item.customer,
        x: (item.xPx / containerWidth) * 100,
        y: (finalY / containerHeight) * 100,
        size: item.size,
        color: styleInfo.color,
        gradient: styleInfo.gradient,
        boxShadow: `inset 0 0 10px rgba(255,255,255,0.3), 0 4px 15px ${styleInfo.glow}`,
        area,
        hasAlert: item.customer.hasPaymentConflict,
        shouldBlink: item.customer.hasRepurchaseOpportunity,
        index: result.length
      });
    }
  }

  return result;
}
