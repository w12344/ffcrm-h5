import React, { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { ClueItem, generateMockClues } from './mock';
import { ClueChartArea } from './components/ClueChartArea';
import ClueChartLegend from './components/ClueChartLegend';
import ClueTableModal from './components/ClueTableModal';
import { Tooltip } from 'antd';
import { useTheme } from '@/hooks/useTheme';
import './index.less';

interface CluePoolProps {
  themeMode?: "dark" | "light";
  onBack?: () => void;
  onClueClick?: (clue: ClueItem) => void;
  onOpenAIAnalysis?: (clueId: string, name: string) => void;
  onTransferClue?: (clue: ClueItem, onSuccess?: () => void) => void;
  isThumbnail?: boolean;
  role?: "advisor" | "market";
  headerExtra?: React.ReactNode;
}

const CluePool: React.FC<CluePoolProps> = ({
  themeMode = "light",
  onBack,
  onClueClick,
  onOpenAIAnalysis,
  onTransferClue,
  isThumbnail = false,
  role = "advisor",
  headerExtra,
}) => {
  const { isDark } = useTheme();
  const theme = themeMode === "dark" || isDark ? "dark" : "light";
  const [clues, setClues] = useState<ClueItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDim, setContainerDim] = useState({ width: 0, height: 0 });
  const [hiddenLevels, setHiddenLevels] = useState<string[]>([]);
  const [isTableModalVisible, setIsTableModalVisible] = useState(false);

  useEffect(() => {
    // 缩略图模式下减少 Mock 数据量，提升渲染性能
    const count = isThumbnail ? 15 : 80;
    setClues(generateMockClues(count));
  }, [isThumbnail]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      if (w > 0 && h > 0) setContainerDim({ width: w, height: h });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerDim({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const newCount = clues.filter(c => c.hoursElapsed <= 2).length;
  const activeCount = clues.filter(c => c.hoursElapsed > 2 && c.hoursElapsed <= 24).length;
  const sleepingCount = clues.filter(c => c.hoursElapsed > 24).length;
  const total = clues.length;

  const levelStats = [
    { level: 'new', count: newCount, percentage: total > 0 ? (newCount / total) * 100 : 0 },
    { level: 'active', count: activeCount, percentage: total > 0 ? (activeCount / total) * 100 : 0 },
    { level: 'sleeping', count: sleepingCount, percentage: total > 0 ? (sleepingCount / total) * 100 : 0 },
  ];

  const filteredClues = clues.filter(c => {
    if (c.hoursElapsed <= 2 && hiddenLevels.includes('new')) return false;
    if (c.hoursElapsed > 2 && c.hoursElapsed <= 24 && hiddenLevels.includes('active')) return false;
    if (c.hoursElapsed > 24 && hiddenLevels.includes('sleeping')) return false;
    return true;
  });

  const handleToggleLevel = (level: string) => {
    setHiddenLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const colorConfig = theme === 'dark' ? {
    new: "linear-gradient( 180deg, #FD4895 0%, #C438EF 100%)",
    active: "linear-gradient( 230deg, #FFB929 0%, #FF7FB7 100%)",
    sleeping: "linear-gradient( 212deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.5) 23%, rgba(255,255,255,0.3) 48%, rgba(0,0,0,0.6) 100%)"
  } : {
    new: "linear-gradient(207deg, #FD4895 -12.28%, #C438EF 83.42%)",
    active: "linear-gradient(180deg, #FFB929 0%, #FF7FB7 100%)",
    sleeping: "linear-gradient(213deg, rgba(151, 151, 151, 0.06) 7.33%, rgba(151, 151, 151, 0.19) 48.5%, rgba(151, 151, 151, 0.50) 92.96%)"
  };

  const getColorBarTooltipContent = (level: string, count: number, percentage: number) => {
    const name = level === "new" ? "最新线索" : level === "active" ? "活跃线索" : "沉睡线索";
    return (
      <div className="color-bar-tooltip-content">
        <div className="tooltip-name">{name}</div>
        <div className="tooltip-info">
          <div>▸ 数量: {count}条</div>
          <div>▸ 占比: {percentage.toFixed(1)}%</div>
        </div>
      </div>
    );
  };

  const colorBarTooltipStyle = {
    styles: {
      root: { maxWidth: "300px" },
      body: theme === 'dark'
        ? {
          background: "linear-gradient(135deg, rgba(40, 44, 52, 0.95), rgba(40, 44, 52, 0.95))",
          color: "#ffffff", padding: "12px 16px", borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)",
        }
        : {
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 245, 250, 0.98))",
          color: "rgba(0, 0, 0, 0.88)", padding: "12px 16px", borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1) inset", border: "1px solid rgba(0, 0, 0, 0.1)", backdropFilter: "blur(10px)",
        },
    }
  };

  /**
   * 从线索池中移除已分配的线索
   */
  const removeClueFromPool = useCallback((clueId: string) => {
    setClues(prev => prev.filter(c => c.id !== clueId));
  }, []);

  /**
   * 处理线索气泡右键菜单操作
   */
  const handleBubbleContextMenu = useCallback(
    (clue: ClueItem, action: "profile" | "analysis" | "transfer") => {
      if (action === "profile") {
        onClueClick?.(clue);
      } else if (action === "analysis") {
        onOpenAIAnalysis?.(clue.id, clue.name);
      } else if (action === "transfer") {
        // 分配线索时，传入成功回调以从池中移除该线索
        onTransferClue?.(clue, () => removeClueFromPool(clue.id));
      }
    },
    [onClueClick, onOpenAIAnalysis, onTransferClue, removeClueFromPool]
  );

  return (
    <div className={`clue-pool customer-upgrade-pool ${theme} ${isThumbnail ? 'is-thumbnail' : ''}`}>
      {!isThumbnail && (
        <div className="chart-header">
        <div className="chart-header-left">
          {onBack && (
            <button
              className="back-to-carousel-btn"
              onClick={onBack}
              title="返回三大工作台"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="chart-title">
            <h3>线索池</h3>
          </div>
          <div className="color-bar">
            {levelStats.map((item) => item.percentage > 0 && (
              <Tooltip
                key={item.level}
                title={getColorBarTooltipContent(item.level, item.count, item.percentage)}
                placement="top"
                mouseEnterDelay={0.15}
                arrow={true}
                {...colorBarTooltipStyle}
              >
                <div
                  className={`color-segment level-${item.level}`}
                  style={{
                    flex: `0 0 ${item.percentage}%`,
                    background: colorConfig[item.level as keyof typeof colorConfig],
                  }}
                ></div>
              </Tooltip>
            ))}
          </div>
          <div className="customer-count">线索: {total}条</div>
        </div>
        <div className="chart-legend-container">
          <ClueChartLegend
            hiddenLevels={hiddenLevels}
            onToggleLevel={handleToggleLevel}
            levelStats={levelStats}
            onOpenList={() => setIsTableModalVisible(true)}
            extra={headerExtra}
          />
        </div>
      </div>
      )}

      <div className="chart-area-container clue-chart-wrapper" ref={containerRef}>
        {containerDim.width > 0 && (
          <ClueChartArea
            clues={filteredClues}
            containerWidth={containerDim.width}
            containerHeight={containerDim.height}
            themeMode={theme}
            onClueClick={onClueClick}
            onClueContextMenu={handleBubbleContextMenu}
            role={role}
          />
        )}
      </div>

      <ClueTableModal
        visible={isTableModalVisible}
        onClose={() => setIsTableModalVisible(false)}
        clues={filteredClues}
        themeMode={theme}
      />
    </div>
  );
};

export default React.memo(CluePool);
