import { useMemo } from 'react';
import { Bubble } from '../types';
import { CUSTOMER_LEVELS, CHART_CONFIG } from '../constants';

/**
 * 检查两个气泡是否重叠
 * @param bubble1 第一个气泡
 * @param bubble2 第二个气泡
 * @param minDistance 最小距离（以容器百分比为单位）
 * @returns 是否重叠
 */
const checkOverlap = (
  bubble1: { x: number; y: number; size: number },
  bubble2: { x: number; y: number; size: number },
  minDistance: number = 2
): boolean => {
  // 计算两个气泡中心点的距离
  const dx = bubble1.x - bubble2.x;
  const dy = bubble1.y - bubble2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 计算两个气泡的半径之和（转换为百分比单位）
  // 假设容器宽度约为1000px，size是像素值
  const radius1 = (bubble1.size / 2 / 1000) * 100;
  const radius2 = (bubble2.size / 2 / 1000) * 100;
  
  // 两个气泡的半径之和加上最小间距
  const minRequiredDistance = radius1 + radius2 + minDistance;
  
  return distance < minRequiredDistance;
};

/**
 * 尝试为气泡生成一个不重叠的位置
 * @param bubbles 已存在的气泡数组
 * @param size 新气泡的大小
 * @param maxAttempts 最大尝试次数
 * @returns 气泡位置或null
 */
// const generateNonOverlappingPosition = (
//   bubbles: Bubble[],
//   size: number,
//   maxAttempts: number = 50
// ): { x: number; y: number } | null => {
//   const { bubbleConfig } = CHART_CONFIG;
//   
//   for (let attempt = 0; attempt < maxAttempts; attempt++) {
//     const x = Math.random() * (bubbleConfig.xRange.max - bubbleConfig.xRange.min) + bubbleConfig.xRange.min;
//     const y = Math.random() * (bubbleConfig.yRange.max - bubbleConfig.yRange.min) + bubbleConfig.yRange.min;
//     
//     const newBubble = { x, y, size };
//     
//     // 检查是否与现有气泡重叠
//     const hasOverlap = bubbles.some(existingBubble => 
//       checkOverlap(newBubble, existingBubble)
//     );
//     
//     if (!hasOverlap) {
//       return { x, y };
//     }
//   }
//   
//   // 如果尝试多次后仍然找不到合适的位置，返回null
//   return null;
// };

/**
 * 使用网格优化的碰撞检测
 * 将画布分成网格，只检测相邻网格中的气泡
 */
const generateBubblesWithGrid = (): Bubble[] => {
  const bubbles: Bubble[] = [];
  const { bubbleConfig } = CHART_CONFIG;
  
  // 创建网格系统以优化碰撞检测
  const gridSize = 10; // 网格大小（百分比）
  const grid: Map<string, Bubble[]> = new Map();
  
  const getGridKey = (x: number, y: number): string => {
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
    return `${gridX},${gridY}`;
  };
  
  const getNearbyBubbles = (x: number, y: number): Bubble[] => {
    const nearby: Bubble[] = [];
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
    
    // 检查当前网格和周围8个网格
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${gridX + dx},${gridY + dy}`;
        const cellBubbles = grid.get(key);
        if (cellBubbles) {
          nearby.push(...cellBubbles);
        }
      }
    }
    
    return nearby;
  };
  
  const addToGrid = (bubble: Bubble) => {
    const key = getGridKey(bubble.x, bubble.y);
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(bubble);
  };
  
  CUSTOMER_LEVELS.forEach((level, levelIndex) => {
    for (let i = 0; i < level.count; i++) {
      const size = Math.random() * (bubbleConfig.sizeRange.max - bubbleConfig.sizeRange.min) + bubbleConfig.sizeRange.min;
      const isImportant = Math.random() < bubbleConfig.importantChance;
      
      // 尝试生成不重叠的位置
      let position = null;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!position && attempts < maxAttempts) {
        const x = Math.random() * (bubbleConfig.xRange.max - bubbleConfig.xRange.min) + bubbleConfig.xRange.min;
        const y = Math.random() * (bubbleConfig.yRange.max - bubbleConfig.yRange.min) + bubbleConfig.yRange.min;
        
        const newBubble = { x, y, size };
        const nearbyBubbles = getNearbyBubbles(x, y);
        
        // 只检查附近的气泡
        const hasOverlap = nearbyBubbles.some(existingBubble => 
          checkOverlap(newBubble, existingBubble, 1.5)
        );
        
        if (!hasOverlap) {
          position = { x, y };
        }
        
        attempts++;
      }
      
      // 如果找到了合适的位置，添加气泡
      if (position) {
        const bubble: Bubble = {
          id: `${levelIndex}-${i}`,
          x: position.x,
          y: position.y,
          size,
          color: level.color,
          boxShadow: level.boxShadow,
          level: level.level,
          isImportant
        };
        
        bubbles.push(bubble);
        addToGrid(bubble);
      } else {
        // 如果找不到位置，尝试减小尺寸后再试一次
        const smallerSize = size * 0.7;
        
        for (let retry = 0; retry < 20; retry++) {
          const x = Math.random() * (bubbleConfig.xRange.max - bubbleConfig.xRange.min) + bubbleConfig.xRange.min;
          const y = Math.random() * (bubbleConfig.yRange.max - bubbleConfig.yRange.min) + bubbleConfig.yRange.min;
          
          const newBubble = { x, y, size: smallerSize };
          const nearbyBubbles = getNearbyBubbles(x, y);
          
          const hasOverlap = nearbyBubbles.some(existingBubble => 
            checkOverlap(newBubble, existingBubble, 1)
          );
          
          if (!hasOverlap) {
            const bubble: Bubble = {
              id: `${levelIndex}-${i}`,
              x,
              y,
              size: smallerSize,
              color: level.color,
              boxShadow: level.boxShadow,
              level: level.level,
              isImportant
            };
            
            bubbles.push(bubble);
            addToGrid(bubble);
            break;
          }
        }
      }
    }
  });
  
  return bubbles;
};

export const useBubbleData = (): Bubble[] => {
  return useMemo(() => {
    return generateBubblesWithGrid();
  }, []);
};
