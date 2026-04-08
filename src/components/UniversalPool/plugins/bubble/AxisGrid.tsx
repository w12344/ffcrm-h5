import React from 'react';
import './AxisGrid.less';

interface AxisGridProps {
  width: number;
  height: number;
}

const AxisGrid: React.FC<AxisGridProps> = () => {
  // Y轴刻度数量（左侧）
  const yTickCount = 10;
  // X轴刻度数量（底部）
  const xTickCount = 10;

  // 生成Y轴刻度位置
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => ({
    position: (i / yTickCount) * 100,
  }));

  // 生成X轴刻度位置
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => ({
    position: (i / xTickCount) * 100,
  }));

  return (
    <div className="axis-grid">
      {/* Y轴刻度线（左侧） */}
      <div className="y-axis">
        <div className="axis-ticks">
          {yTicks.map((tick, index) => (
            <div
              key={`y-${index}`}
              className="tick-mark"
              style={{ bottom: `${tick.position}%` }}
            >
              <div className="tick-line" />
            </div>
          ))}
        </div>
      </div>

      {/* X轴刻度线（底部） */}
      <div className="x-axis">
        <div className="axis-ticks">
          {xTicks.map((tick, index) => (
            <div
              key={`x-${index}`}
              className="tick-mark"
              style={{ left: `${tick.position}%` }}
            >
              <div className="tick-line" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AxisGrid;
