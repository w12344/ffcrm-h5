import React, { memo } from "react";
import "./ChartLegend.less";

interface ChartLegendProps {
  themeMode?: "dark" | "light";
  onOpenList?: () => void;
  extra?: React.ReactNode;
}

const ChartLegend: React.FC<ChartLegendProps> = ({ 
  themeMode = "dark",
  onOpenList,
  extra
}) => {
  const legendItems = [
    { label: "已入学", color: "linear-gradient(135deg, #80FFB3 0%, #5283E2 100%)" },
    { label: "待开班", color: "linear-gradient(135deg, #FFB929 0%, #FF7FB7 100%)" },
    { label: "已退费", color: "linear-gradient(135deg, #a4b0be 0%, #747d8c 100%)" },
    { label: "已退学", color: "linear-gradient(135deg, #a4b0be 0%, #747d8c 100%)" },
  ];

  return (
    <div className={`chart-legend ${themeMode}-theme`}>
      <div className="legend-items">
        {legendItems.map((item, idx) => (
          <div key={idx} className="legend-item">
            <span className="legend-dot" style={{ background: item.color }} />
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>

      {extra}

      <button className="legend-export-btn" onClick={onOpenList} title="查看明细">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </button>
    </div>
  );
};

export default memo(ChartLegend);
