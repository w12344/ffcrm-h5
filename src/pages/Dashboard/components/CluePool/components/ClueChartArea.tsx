import React, { useMemo } from 'react';
import { ClueItem } from '../mock';
import { ClueBubble } from './ClueBubble';
import { generateBubbleLayout } from '../../../utils/bubbleLayout';
import { Customer } from '@/types/dashboard';

interface ClueChartAreaProps {
  clues: ClueItem[];
  containerWidth: number;
  containerHeight: number;
  themeMode?: "light" | "dark";
  onClueClick?: (clue: ClueItem) => void;
  onClueContextMenu?: (clue: ClueItem, action: "profile" | "analysis" | "transfer") => void;
  role?: "advisor" | "market";
}

export const ClueChartArea: React.FC<ClueChartAreaProps> = ({ 
  clues, 
  containerWidth, 
  containerHeight,
  themeMode,
  onClueClick,
  onClueContextMenu,
  role = "advisor"
}) => {
  const bubbles = useMemo(() => {
    if (!clues.length || containerWidth < 100 || containerHeight < 100) return [];

    // 将线索数据隐射为 Customer 接口，以便直接复用 bubbleLayout.ts 中精准的右到左相切排布算法
    const pseudoCustomers: Customer[] = clues.map(clue => {
      const isSleeping = clue.hoursElapsed > 24;

      let level: 'A' | 'B' | 'C' | 'D' | 'X' = 'B';
      if (clue.hoursElapsed <= 2) level = 'A';       // 最新线索 -> A级颜色(红)
      else if (clue.hoursElapsed <= 24) level = 'B'; // 活跃线索 -> B级颜色(橙)
      else level = 'X';                              // 沉睡线索 -> X级颜色(灰)

      let qualityScore = 5;
      if (clue.valueLevel === 'high') qualityScore = 10;
      else if (clue.valueLevel === 'trash') qualityScore = 0;

      const now = new Date();
      // 通过控制 lastContactTime，让 bubbleLayout 按照时间排布时，
      // hoursElapsed 越小(越新)，时间越接近现在，就会排在越右边
      const lastContactTime = new Date(now.getTime() - clue.hoursElapsed * 3600 * 1000);

      // 如果是沉睡线索，将 status 设为 'abandoned'，这样 bubbleLayout 就会严格将其排布在池底
      const status = isSleeping ? 'abandoned' : 'active';

      const customer: any = {
        id: clue.id,
        name: clue.name,
        level,
        qualityScore,
        maturityScore: 0,
        lastContactTime,
        // bubbleLayout.ts sortCustomers (bottom) 需要 createTime 作为降级后备排序字段
        createTime: lastContactTime,
        demoteTime: isSleeping ? lastContactTime : undefined,
        status,
        isPinned: !isSleeping, // 最新/活跃线索置顶进入“水面”，沉睡进入“池底”
        hasUnresolvedObjection: false,
        hasAIRisk: clue.collisionWarning || clue.valueLevel === 'trash',
        hasAIOpportunity: clue.valueLevel === 'high',
        isConverted: false,
        hasAlert: clue.collisionWarning || clue.valueLevel === 'trash',
        shouldBlink: clue.valueLevel === 'high',
        _originalClue: clue // 暂存原始数据，用于点击事件和 Tooltip
      };
      
      return customer as Customer;
    });

    return generateBubbleLayout(
      pseudoCustomers, 
      containerWidth, 
      containerHeight, 
      themeMode === 'light' ? 'light' : 'dark'
    );
  }, [clues, containerWidth, containerHeight, themeMode]);

  return (
    <div className="clue-chart-area" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {bubbles.map(b => {
        const clue = (b.customer as any)._originalClue as ClueItem;
        
        // b.x 和 b.y 返回的是在容器中的百分比位置，并且代表气泡中心点
        // 我们将其转换为绝对像素（左上角），因为 ClueBubble 内部重用了 CustomerBubble 的 className
        // 而 CustomerBubble 自带了 `transform: translate(-50%, -50%)`
        const cx = (b.x / 100) * containerWidth;
        const cy = (b.y / 100) * containerHeight;
        
        return (
          <ClueBubble 
            key={b.id}
            clue={clue}
            x={cx - b.size / 2} // 还原给 ClueBubble 的左上角 x
            y={cy - b.size / 2} // 还原给 ClueBubble 的左上角 y
            r={b.size / 2}
            themeMode={themeMode}
            onClick={onClueClick}
            onContextMenu={onClueContextMenu}
            role={role}
          />
        );
      })}
    </div>
  );
};
