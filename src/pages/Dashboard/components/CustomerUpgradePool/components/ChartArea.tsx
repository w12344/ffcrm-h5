import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { CustomerBubble as CustomerBubbleType } from '@/types/dashboard';
import CustomerBubble from './CustomerBubble';
import AxisGrid from './AxisGrid';
import AIBackground from './AIBackground';

interface ChartAreaProps {
  bubbles: CustomerBubbleType[];
  onBubbleClick?: (customerProfileId: string, customerName?: string) => void;
  onBubbleContextMenu?: (bubble: CustomerBubbleType, action: 'profile' | 'analysis' | 'transfer') => void;
  onScrollStateChange?: (hasScrolled: boolean) => void;
  role?: "advisor" | "market";
}

// 空间分区网格配置
const GRID_CELL_SIZE = 200; // 每个网格单元的像素大小
const VIEWPORT_BUFFER = 1.0; // 视口缓冲区倍数（1.0 = 无缓冲，只渲染可视区域）

// 空间分区网格类 - 用于快速查找可见区域内的气泡
class SpatialGrid {
  private grid: Map<string, CustomerBubbleType[]> = new Map();
  private cellSize: number;

  constructor(cellSize: number = GRID_CELL_SIZE) {
    this.cellSize = cellSize;
  }

  // 添加气泡到网格
  addBubble(bubble: CustomerBubbleType, containerWidth: number, containerHeight: number) {
    // 将百分比坐标转换为像素坐标
    const x = (bubble.x / 100) * containerWidth;
    const y = (bubble.y / 100) * containerHeight;
    const radius = bubble.size / 2;

    // 计算气泡占据的网格单元范围
    const minX = x - radius;
    const maxX = x + radius;
    const minY = y - radius;
    const maxY = y + radius;

    const startCellX = Math.floor(minX / this.cellSize);
    const endCellX = Math.floor(maxX / this.cellSize);
    const startCellY = Math.floor(minY / this.cellSize);
    const endCellY = Math.floor(maxY / this.cellSize);

    // 将气泡添加到所有相关的网格单元
    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
      for (let cellY = startCellY; cellY <= endCellY; cellY++) {
        const key = `${cellX},${cellY}`;
        if (!this.grid.has(key)) {
          this.grid.set(key, []);
        }
        this.grid.get(key)!.push(bubble);
      }
    }
  }

  // 查询可见区域内的气泡
  queryVisibleBubbles(
    viewportX: number,
    viewportY: number,
    viewportWidth: number,
    viewportHeight: number,
    buffer: number = 1
  ): Set<CustomerBubbleType> {
    const visibleBubbles = new Set<CustomerBubbleType>();

    // 计算可见区域的网格单元范围（包含缓冲区）
    const minX = viewportX - viewportWidth * (buffer - 1);
    const maxX = viewportX + viewportWidth * buffer;
    const minY = viewportY - viewportHeight * (buffer - 1);
    const maxY = viewportY + viewportHeight * buffer;

    const startCellX = Math.floor(minX / this.cellSize);
    const endCellX = Math.floor(maxX / this.cellSize);
    const startCellY = Math.floor(minY / this.cellSize);
    const endCellY = Math.floor(maxY / this.cellSize);

    // 收集所有相关网格单元中的气泡
    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
      for (let cellY = startCellY; cellY <= endCellY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cellBubbles = this.grid.get(key);
        if (cellBubbles) {
          cellBubbles.forEach(bubble => visibleBubbles.add(bubble));
        }
      }
    }

    return visibleBubbles;
  }

  // 清空网格
  clear() {
    this.grid.clear();
  }
}

const ChartArea: React.FC<ChartAreaProps> = ({ bubbles, onBubbleClick, onBubbleContextMenu, role = "advisor" }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const bubblesContainerRef = useRef<HTMLDivElement>(null);
  const spatialGridRef = useRef<SpatialGrid>(new SpatialGrid(GRID_CELL_SIZE));
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [hasScrolled, setHasScrolled] = useState(false); // 是否已经滚动过（用于触发池底球的渲染）
  const [gridReady, setGridReady] = useState(false); // 空间网格是否已准备好
  const [gridVersion, setGridVersion] = useState(0); // 空间网格版本号，用于强制重新计算
  const [visibleBubbleIds, setVisibleBubbleIds] = useState<Set<string>>(new Set()); // 使用 IntersectionObserver 跟踪的可见球
  const lastScrollUpdateRef = useRef<number>(0); // 上次滚动更新时间
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null); // IntersectionObserver 实例
  const bubbleElementsRef = useRef<Map<string, HTMLElement>>(new Map()); // 球元素引用
  const SCROLL_THROTTLE = 32; // 滚动节流间隔（约30fps，降低更新频率）

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        // 使用父容器的高度作为基准，避免循环依赖
        const parentElement = chartRef.current.parentElement;
        const containerHeight = parentElement ? parentElement.offsetHeight : chartRef.current.offsetHeight;

        setDimensions({
          width: chartRef.current.offsetWidth,
          height: containerHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // 构建空间分区网格（当气泡数据或容器尺寸变化时）
  useEffect(() => {
    if (bubbles.length === 0 || dimensions.width === 0 || dimensions.height === 0) {
      setGridReady(false);
      return;
    }

    const grid = spatialGridRef.current;
    grid.clear();

    // 将所有气泡添加到空间网格
    bubbles.forEach(bubble => {
      grid.addBubble(bubble, dimensions.width, dimensions.height);
    });

    setGridReady(true);
    // 更新版本号，强制 visibleBubbles 重新计算
    setGridVersion(v => v + 1);
  }, [bubbles, dimensions.width, dimensions.height]);

  // 监听滚动位置变化（优化版本）
  useEffect(() => {
    const updateScrollPosition = () => {
      if (chartRef.current) {
        const parent = chartRef.current.parentElement;
        if (parent) {
          const now = Date.now();
          const timeSinceLastUpdate = now - lastScrollUpdateRef.current;

          // 节流：如果距离上次更新时间太短，跳过本次更新
          if (timeSinceLastUpdate < SCROLL_THROTTLE) {
            return;
          }

          lastScrollUpdateRef.current = now;
          const newScrollY = parent.scrollTop;
          const newScrollX = parent.scrollLeft;

          // 批量更新状态
          setScrollPosition(prev => {
            // 增加位置变化阈值（20px），减少更新频率
            if (Math.abs(prev.x - newScrollX) < 20 && Math.abs(prev.y - newScrollY) < 20) {
              return prev;
            }
            return { x: newScrollX, y: newScrollY };
          });

          // 如果发生了纵向滚动，标记为已滚动（触发池底所有球的渲染）
          if (newScrollY > 0 && !hasScrolled) {
            setHasScrolled(true);
          }
        }
      }
    };

    const chartElement = chartRef.current;
    const parentElement = chartElement?.parentElement;

    if (parentElement) {
      // 初始化滚动位置
      updateScrollPosition();

      // 监听滚动事件，使用 requestAnimationFrame 优化性能
      let rafId: number | null = null;
      const throttledScrollHandler = () => {
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            updateScrollPosition();
            rafId = null;
          });
        }
      };

      parentElement.addEventListener('scroll', throttledScrollHandler, { passive: true });

      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        parentElement.removeEventListener('scroll', throttledScrollHandler);
      };
    }
  }, [hasScrolled, SCROLL_THROTTLE]);

  // 使用空间分区网格计算可见气泡（性能优化核心）
  const visibleBubbles = useMemo(() => {
    console.log('🎨 [ChartArea] 重新计算 visibleBubbles, bubbles数量:', bubbles.length);

    if (bubbles.length === 0) {
      console.log('⚠️ [ChartArea] bubbles为空，返回空数组');
      return [];
    }

    // 如果容器尺寸还没准备好，返回所有气泡（初始渲染）
    if (dimensions.width === 0 || dimensions.height === 0) {
      console.log('⚠️ [ChartArea] 容器尺寸未准备好，返回所有气泡');
      return bubbles;
    }

    // 如果空间网格还没准备好，使用降级方案
    if (!gridReady) {
      return bubbles;
    }

    // 获取父容器的滚动信息
    const parentElement = chartRef.current?.parentElement;
    if (!parentElement) {
      return bubbles;
    }

    const containerRect = parentElement.getBoundingClientRect();
    const viewportWidth = containerRect.width;
    const viewportHeight = containerRect.height;

    // 使用空间网格快速查询可见区域内的气泡（无缓冲区）
    const visibleSet = spatialGridRef.current.queryVisibleBubbles(
      scrollPosition.x,
      scrollPosition.y,
      viewportWidth,
      viewportHeight,
      VIEWPORT_BUFFER
    );

    // 转换为数组
    const visibleArray = Array.from(visibleSet);

    // 降级方案：如果空间网格返回空结果，使用传统的视口裁剪方法
    if (visibleArray.length === 0 && bubbles.length > 0) {
      // 分离水面和池底的气泡
      const surfaceBubbles = bubbles.filter(b => b.area === 'surface');
      const bottomBubbles = bubbles.filter(b => b.area === 'bottom');

      // 计算可见区域范围（无缓冲区，严格可视区域）
      const visibleLeft = Math.max(0, scrollPosition.x / dimensions.width * 100);
      const visibleRight = Math.min(100, (scrollPosition.x + viewportWidth) / dimensions.width * 100);
      const visibleTop = Math.max(0, scrollPosition.y / dimensions.height * 100);
      const visibleBottom = Math.min(100, (scrollPosition.y + viewportHeight) / dimensions.height * 100);

      // 过滤出可见区域内的气泡
      const filteredSurface = surfaceBubbles.filter(bubble => {
        const bubbleRadius = bubble.size / 2;
        const bubbleLeft = bubble.x - (bubbleRadius / dimensions.width * 100);
        const bubbleRight = bubble.x + (bubbleRadius / dimensions.width * 100);
        const bubbleTop = bubble.y - (bubbleRadius / dimensions.height * 100);
        const bubbleBottom = bubble.y + (bubbleRadius / dimensions.height * 100);

        return !(bubbleRight < visibleLeft ||
                 bubbleLeft > visibleRight ||
                 bubbleBottom < visibleTop ||
                 bubbleTop > visibleBottom);
      });

      // 处理池底气泡
      let finalBottomBubbles = bottomBubbles;
      if (!hasScrolled && bottomBubbles.length > 0) {
        const minY = Math.min(...bottomBubbles.map(b => b.y));
        const yThreshold = 5;
        finalBottomBubbles = bottomBubbles.filter(b => Math.abs(b.y - minY) < yThreshold);
      }

      const result = [...filteredSurface, ...finalBottomBubbles];
      console.log('✅ [ChartArea] 使用降级方案，返回气泡数:', result.length);

      // 统计各等级的气泡数量
      const levelCount = result.reduce((acc, bubble) => {
        acc[bubble.customer.level] = (acc[bubble.customer.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 [ChartArea] 可见气泡等级分布:', levelCount);

      return result;
    }

    // 分离水面和池底的气泡
    const surfaceBubbles = visibleArray.filter(b => b.area === 'surface');
    const bottomBubbles = visibleArray.filter(b => b.area === 'bottom');

    // 如果还没有滚动，只渲染第一行池底的球
    let finalBottomBubbles = bottomBubbles;
    if (!hasScrolled && bottomBubbles.length > 0) {
      const allBottomBubbles = bubbles.filter(b => b.area === 'bottom');
      const minY = Math.min(...allBottomBubbles.map(b => b.y));
      const yThreshold = 5;

      finalBottomBubbles = bottomBubbles.filter(b => Math.abs(b.y - minY) < yThreshold);
    }

    const result = [...surfaceBubbles, ...finalBottomBubbles];
    console.log('✅ [ChartArea] 使用空间网格，返回气泡数:', result.length, '网格版本:', gridVersion);

    // 统计各等级的气泡数量
    const levelCount = result.reduce((acc, bubble) => {
      acc[bubble.customer.level] = (acc[bubble.customer.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('📊 [ChartArea] 可见气泡等级分布:', levelCount);

    return result;
  }, [bubbles, dimensions, scrollPosition, hasScrolled, gridReady, gridVersion]);

  // 直接使用 visibleBubbles，不需要额外的缓存层
  // IntersectionObserver 已经提供了足够的优化

  // 使用 IntersectionObserver 监听球的可见性（性能最优方案）
  useEffect(() => {
    const parentElement = chartRef.current?.parentElement;
    if (!parentElement || visibleBubbles.length === 0) {
      return;
    }

    let pendingUpdates: Array<{ id: string; isVisible: boolean }> = [];
    let updateTimer: number | null = null;

    // 创建 IntersectionObserver 实例
    const observer = new IntersectionObserver(
      (entries) => {
        // 收集更新
        entries.forEach(entry => {
          const bubbleId = entry.target.getAttribute('data-bubble-id');
          if (bubbleId) {
            pendingUpdates.push({
              id: bubbleId,
              isVisible: entry.isIntersecting
            });
          }
        });

        // 防抖：延迟批量更新
        if (updateTimer) {
          clearTimeout(updateTimer);
        }

        updateTimer = window.setTimeout(() => {
          if (pendingUpdates.length > 0) {
            const updates = [...pendingUpdates];
            pendingUpdates = [];

            requestAnimationFrame(() => {
              setVisibleBubbleIds(prev => {
                const newSet = new Set(prev);
                updates.forEach(({ id, isVisible }) => {
                  if (isVisible) {
                    newSet.add(id);
                  } else {
                    newSet.delete(id);
                  }
                });
                return newSet;
              });
            });
          }
        }, 50); // 50ms 防抖
      },
      {
        root: parentElement,
        rootMargin: '150px', // 提前150px加载，进一步减少卡顿
        threshold: [0, 0.1], // 0% 和 10% 可见时触发
      }
    );

    intersectionObserverRef.current = observer;

    // 观察所有已渲染的球
    bubbleElementsRef.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      if (updateTimer) {
        clearTimeout(updateTimer);
      }
      observer.disconnect();
      intersectionObserverRef.current = null;
    };
  }, [visibleBubbles]);

  // 注册球元素到 IntersectionObserver
  const registerBubbleElement = useCallback((bubbleId: string, element: HTMLElement | null) => {
    if (element) {
      bubbleElementsRef.current.set(bubbleId, element);
      intersectionObserverRef.current?.observe(element);
    } else {
      const existingElement = bubbleElementsRef.current.get(bubbleId);
      if (existingElement) {
        intersectionObserverRef.current?.unobserve(existingElement);
        bubbleElementsRef.current.delete(bubbleId);
      }
    }
  }, []);

  // 计算气泡容器所需的宽度（性能优化版本）
  const bubblesContainerWidth = React.useMemo(() => {
    if (bubbles.length === 0 || dimensions.width === 0) {
      return '100%';
    }

    // 性能优化：只在气泡数量较少时计算精确宽度
    if (bubbles.length > 200) {
      return '100%'; // 气泡过多时使用默认宽度
    }

    // 找到最左边的气泡（x坐标最小）
    let minX = Infinity;
    for (const bubble of bubbles) {
      const bubbleMinX = bubble.x - bubble.size / 2 / 10;
      if (bubbleMinX < minX) {
        minX = bubbleMinX;
      }
    }

    // 如果最左边的气泡超出了左边界（x < 0），则需要扩展容器宽度
    if (minX < 0) {
      // 计算需要额外的宽度（百分比转像素）
      const extraWidth = Math.abs(minX) * dimensions.width / 100;
      const totalWidth = dimensions.width + extraWidth;
      return `${totalWidth}px`;
    }

    return '100%';
  }, [bubbles.length, dimensions.width]); // 优化依赖项

  const handleBubbleClick = useCallback((bubble: CustomerBubbleType) => {
    // 调用外部传入的回调函数，传递客户档案ID和名称
    if (onBubbleClick && bubble.customer.id) {
      onBubbleClick(bubble.customer.id, bubble.customer.name);
    }
  }, [onBubbleClick]);

  const handleBubbleContextMenu = useCallback((bubble: CustomerBubbleType, action: 'profile' | 'analysis' | 'transfer') => {
    onBubbleContextMenu?.(bubble, action);
  }, [onBubbleContextMenu]);

  // 计算池底气泡数量（基于所有气泡，不是可见气泡）
  const bottomBubblesCount = React.useMemo(() => {
    return bubbles.filter(bubble => bubble.area === 'bottom').length;
  }, [bubbles]);

  // 计算实际需要的容器高度（基于是否滚动和所有气泡的位置）
  const actualContainerHeight = React.useMemo(() => {
    if (bubbles.length === 0 || dimensions.height === 0) {
      return dimensions.height || 600;
    }

    // 如果还没有滚动，使用默认容器高度
    if (!hasScrolled) {
      return dimensions.height;
    }

    // 滚动后，计算实际需要的高度以容纳所有气泡
    // 找到最底部的气泡（Y坐标最大 + 半径）
    let maxBottomPx = 0;
    for (const bubble of bubbles) {
      const bubbleBottomPx = (bubble.y / 100) * dimensions.height + bubble.size / 2;
      if (bubbleBottomPx > maxBottomPx) {
        maxBottomPx = bubbleBottomPx;
      }
    }

    // 添加底部边距（100px）
    const requiredHeight = maxBottomPx + 100;

    // 返回实际需要的高度（至少为容器高度）
    return Math.max(requiredHeight, dimensions.height);
  }, [bubbles, dimensions.height, hasScrolled]);

  return (
    <div
      className="chart-area"
      ref={chartRef}
      style={{
        width: bubblesContainerWidth,
        // height: `${actualContainerHeight}px`,
        // minHeight: `${dimensions.height}px`
      }}
    >
      {/* AI 背景效果 - 使用 React.memo 避免不必要的重新渲染 */}
      <AIBackground width={dimensions.width} height={actualContainerHeight} />

      {/* 坐标轴和网格 - 使用 React.memo 避免不必要的重新渲染 */}
      <AxisGrid width={dimensions.width} height={actualContainerHeight} />

      {/* 气泡容器 */}
      <div className="bubbles-container" ref={bubblesContainerRef}>
        {/* 使用视口裁剪优化：只渲染可见区域的气泡 */}
        {visibleBubbles.map((bubble) => (
          <CustomerBubble
            key={bubble.id}
            bubble={bubble}
            onClick={handleBubbleClick}
            onContextMenu={handleBubbleContextMenu}
            isVisible={visibleBubbleIds.has(bubble.id)}
            onElementMount={registerBubbleElement}
            role={role}
          />
        ))}
      </div>

      {/* 池底球数量统计 */}
      {bottomBubblesCount > 0 && (
        <div className="bottom-count-indicator">
          池底共 {bottomBubblesCount} 个
        </div>
      )}
    </div>
  );
};

export default ChartArea;
