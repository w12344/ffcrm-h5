import React, { memo, useRef, useEffect, useState } from "react";
import { TransactionBubble as TransactionBubbleType } from "../../../types/transaction";
import TransactionBubble from "./TransactionBubble";
import AxisGrid from "../../CustomerUpgradePool/components/AxisGrid";
import AIBackground from "../../CustomerUpgradePool/components/AIBackground";

interface ChartAreaProps {
  bubbles: TransactionBubbleType[];
  onBubbleClick?: (id: string, subPoolType?: 'deal' | 'enrolled') => void;
  onBubbleContextMenu?: (
    bubble: TransactionBubbleType,
    action: "profile" | "analysis" | "learning_panorama"
  ) => void;
}

const ChartArea: React.FC<ChartAreaProps> = ({
  bubbles,
  onBubbleClick,
  onBubbleContextMenu,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setDimensions({
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (!bubbles || bubbles.length === 0) {
    return <div className="chart-area-empty">暂无客户数据</div>;
  }

  return (
    <div className="chart-area-container" ref={chartRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* AI 背景效果 */}
      <AIBackground width={dimensions.width} height={dimensions.height} />

      {/* 坐标轴和网格 */}
      <AxisGrid width={dimensions.width} height={dimensions.height} />

      <div className="bubbles-container" style={{ position: 'absolute', inset: 0 }}>
        {bubbles.map((bubble) => (
          <TransactionBubble
            key={bubble.id}
            bubble={bubble}
            onClick={onBubbleClick}
            onContextMenu={onBubbleContextMenu}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(ChartArea);
