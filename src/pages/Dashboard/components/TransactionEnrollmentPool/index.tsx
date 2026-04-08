import React, { useMemo, useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Tooltip } from "antd";
import { generateTransactionLayout } from "../../utils/transactionLayout";
import { generateMockTransactionData } from "./mock";
import ChartArea from "./components/ChartArea";
import ChartLegend from "./components/ChartLegend";
import "./index.less";

interface TransactionEnrollmentPoolProps {
  onBack?: () => void;
  onBubbleClick?: (id: string, subPoolType?: 'deal' | 'enrolled') => void;
  onOpenCustomerProfile?: (customerProfileId: string) => void;
  onOpenAIAnalysis?: (customerProfileId: string) => void;
  onOpenLearningPanorama?: (customerProfileId: string) => void;
  themeMode?: "dark" | "light";
  isThumbnail?: boolean;
  headerExtra?: React.ReactNode;
}

const TransactionEnrollmentPool: React.FC<TransactionEnrollmentPoolProps> = ({
  onBack,
  onBubbleClick,
  onOpenCustomerProfile,
  onOpenAIAnalysis,
  onOpenLearningPanorama,
  themeMode = "dark",
  isThumbnail = false,
  headerExtra,
}) => {
  // 容器尺寸状态
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1200);
  const [containerHeight, setContainerHeight] = useState<number>(600);

  // 初始化 Mock 数据 - 缩略图模式下极大减少数据量
  const [mockData] = useState(() => generateMockTransactionData(isThumbnail ? 8 : 30));

  useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
      setContainerHeight(containerRef.current.offsetHeight);
    }
  }, []);

  const measureDimensions = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      if (width > 0) setContainerWidth(width);
      if (height > 0) setContainerHeight(height);
    }
  }, []);

  useEffect(() => {
    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measureDimensions, 150);
    };

    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (Math.abs(width - containerWidth) > 10 || Math.abs(height - containerHeight) > 10) {
            setContainerWidth(width);
            setContainerHeight(height);
          }
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [measureDimensions, containerWidth, containerHeight]);

  // 生成气泡数据
  const bubbles = useMemo(() => {
    if (containerWidth > 100 && containerHeight > 0) {
      return generateTransactionLayout(mockData, containerWidth, containerHeight);
    }
    return [];
  }, [mockData, containerWidth, containerHeight]);

  // 统计数据
  const enrolledCount = mockData.filter(d => d.isEnrolled).length;
  const pendingCount = mockData.filter(d => !d.isEnrolled && !d.isRefunded).length;
  const refundedCount = mockData.filter(d => d.isRefunded).length;


  // 修正：实际上应该对应 A/B/C/D/X 的标准色
  const standardConfig = {
    A: "linear-gradient(135deg, #FD4895 0%, #C438EF 100%)",
    B: "linear-gradient(135deg, #FFB929 0%, #FF7FB7 100%)",
    C: "linear-gradient(135deg, #80FFB3 0%, #5283E2 100%)",
    D: "linear-gradient(135deg, #06D7F6 0%, #4807EA 100%)",
    X: "linear-gradient(135deg, #a4b0be 0%, #747d8c 100%)",
  };

  const levelStats = useMemo(() => {
    const total = mockData.length;
    return [
      { label: "已入学", count: enrolledCount, percentage: total > 0 ? (enrolledCount / total) * 100 : 0, color: standardConfig.C },
      { label: "待开班", count: pendingCount, percentage: total > 0 ? (pendingCount / total) * 100 : 0, color: standardConfig.B },
      { label: "已退费", count: refundedCount, percentage: total > 0 ? (refundedCount / total) * 100 : 0, color: standardConfig.X }
    ];
  }, [mockData, enrolledCount, pendingCount, refundedCount]);

  return (
    <div className={`transaction-enrollment-pool ${themeMode}-theme ${isThumbnail ? 'is-thumbnail' : ''}`} ref={containerRef}>
      {!isThumbnail && (
        <header className="chart-header">
          <div className="chart-header-left">
            {onBack && (
              <button className="back-to-carousel-btn" onClick={onBack}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="chart-title">
              <h3>成交池 & 入学池</h3>
            </div>
            <div className="color-bar">
              {levelStats.map((item, idx) => (
                item.percentage > 0 && (
                  <Tooltip
                    key={idx}
                    title={
                      <div className="color-bar-tooltip-content">
                        <div className="tooltip-name">{item.label}客户</div>
                        <div className="tooltip-info">
                          <div>▸ 数量: {item.count}人</div>
                          <div>▸ 占比: {item.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    }
                  >
                    <div
                      className="color-segment"
                      style={{
                        flex: `0 0 ${item.percentage}%`,
                        background: item.color
                      }}
                    />
                  </Tooltip>
                )
              ))}
            </div>
            <div className="customer-count">学生: {mockData.length}人</div>
          </div>

          <div className="chart-legend-container">
            <ChartLegend themeMode={themeMode} extra={headerExtra} />
          </div>
        </header>
      )}

      <ChartArea
        bubbles={bubbles}
        onBubbleClick={onBubbleClick}
        onBubbleContextMenu={(bubble, action) => {
          if (action === "profile") {
            onOpenCustomerProfile?.(bubble.customer.id);
          } else if (action === "analysis") {
            onOpenAIAnalysis?.(bubble.customer.id);
          } else if (action === "learning_panorama") {
            onOpenLearningPanorama?.(bubble.customer.id);
          }
        }}
      />
    </div>
  );
};

export default React.memo(TransactionEnrollmentPool);
