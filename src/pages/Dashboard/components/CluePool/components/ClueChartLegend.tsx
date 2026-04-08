import React, { useCallback, useMemo } from "react";
import { Tooltip } from "antd";
import { useTheme } from "@/hooks/useTheme";

interface LevelStat {
  level: string;
  count: number;
  percentage: number;
}

interface ClueChartLegendProps {
  onOpenList?: () => void;
  hiddenLevels?: string[];
  onToggleLevel?: (level: string) => void;
  levelStats?: LevelStat[];
  extra?: React.ReactNode;
}

const ClueChartLegend: React.FC<ClueChartLegendProps> = ({
  onOpenList,
  hiddenLevels = [],
  onToggleLevel,
  levelStats = [],
  extra,
}) => {
  const { isDark } = useTheme();

  const legendItems = useMemo(() => {
    // 匹配光泽与3D气泡的渐变
    const darkThemeItems = [
      { label: "最新线索(0-24小时)", color: "linear-gradient( 180deg, #FD4895 0%, #C438EF 100%)", level: "new" },
      { label: "活跃线索(1-7天)", color: "linear-gradient( 230deg, #FFB929 0%, #FF7FB7 100%)", level: "active" },
      { label: "沉睡线索(>7天)", color: "linear-gradient( 212deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.5) 23%, rgba(255,255,255,0.3) 48%, rgba(0,0,0,0.6) 100%)", level: "sleeping" },
    ];

    const lightThemeItems = [
      { label: "最新线索(0-24小时)", color: "linear-gradient(207deg, #FD4895 -12.28%, #C438EF 83.42%)", level: "new" },
      { label: "活跃线索(1-7天)", color: "linear-gradient(180deg, #FFB929 0%, #FF7FB7 100%)", level: "active" },
      { label: "沉睡线索(>7天)", color: "linear-gradient(213deg, rgba(151, 151, 151, 0.06) 7.33%, rgba(151, 151, 151, 0.19) 48.5%, rgba(151, 151, 151, 0.50) 92.96%)", level: "sleeping" },
    ];

    return isDark ? darkThemeItems : lightThemeItems;
  }, [isDark]);

  const levelCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    levelStats.forEach((stat) => { map[stat.level] = stat.count; });
    return map;
  }, [levelStats]);

  const levelPercentageMap = useMemo(() => {
    const map: Record<string, number> = {};
    levelStats.forEach((stat) => { map[stat.level] = stat.percentage; });
    return map;
  }, [levelStats]);

  const handleOpenList = () => { onOpenList?.(); };
  const handleLegendClick = (level: string) => { onToggleLevel?.(level); };

  const getTooltipContent = useCallback((level: string) => {
    const count = levelCountMap[level] || 0;
    const percentage = levelPercentageMap[level] || 0;
    let name = level === "new" ? "最新线索" : level === "active" ? "活跃线索" : "沉睡线索";

    return (
      <div className="legend-tooltip-content">
        <div className="tooltip-name">{name}</div>
        <div className="tooltip-info">
          <div>▸ 数量: {count}人</div>
          <div>▸ 占比: {percentage.toFixed(1)}%</div>
        </div>
      </div>
    );
  }, [levelCountMap, levelPercentageMap]);

  const tooltipStyle = useMemo(() => ({
    overlayStyle: { maxWidth: "300px" },
    overlayInnerStyle: isDark
      ? {
        background: "linear-gradient(135deg, rgba(40, 44, 52, 0.95), rgba(40, 44, 52, 0.95))",
        color: "#ffffff",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      }
      : {
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 245, 250, 0.98))",
        color: "rgba(0, 0, 0, 0.88)",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1) inset",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
      },
  }), [isDark]);

  return (
    <div className="chart-legend">
      <div className="legend-items">
        {legendItems.map((item) => {
          const isHidden = hiddenLevels.includes(item.level);
          return (
            <Tooltip
              key={item.level}
              title={getTooltipContent(item.level)}
              placement="top"
              mouseEnterDelay={0.15}
              arrow={true}
              {...tooltipStyle}
            >
              <div
                className={`legend-item ${isHidden ? "legend-item-hidden" : ""}`}
                onClick={() => handleLegendClick(item.level)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="legend-dot"
                  style={{ background: item.color, opacity: isHidden ? 0.3 : 1 }}
                />
                <span className="legend-label" style={{ opacity: isHidden ? 0.5 : 1 }}>
                  {item.label}
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>
      {extra}
      <button className="legend-export-btn" onClick={handleOpenList} title="查看客户列表">
        <svg className="export-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default ClueChartLegend;
