import React from 'react';
import './AIBackground.less';

interface AIBackgroundProps {
  width: number;
  height: number;
}

const AIBackground: React.FC<AIBackgroundProps> = () => {
  return (
    <div className="ai-background">
      {/* 动态网格背景 */}
      <div className="grid-background">
        <div className="grid-lines horizontal" />
        <div className="grid-lines vertical" />
      </div>

      {/* 渐变光晕 */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />

      {/* 数据流动效果 */}
      <div className="data-streams">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="data-stream" style={{
            left: `${10 + i * 12}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${4 + Math.random() * 2}s`
          }} />
        ))}
      </div>
    </div>
  );
};

export default AIBackground;

