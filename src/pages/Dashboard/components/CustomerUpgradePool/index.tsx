import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { Tooltip } from "antd";
import { generateBubbleLayout } from "../../utils/bubbleLayout";
import { transformCustomerList } from "../../utils/dataTransform";
import { CustomerBubble } from "@/types/dashboard";
import { generateDefaultMockCustomers, appendReassignedMocks } from "../../utils/mockCustomerData";
import { useCustomerUpgradePool } from "../../hooks/useCustomerUpgradePool";
import { CustomerUpgradePoolQueryParams } from "@/services/databoard";
import performanceManager from "../../utils/performanceConfig";
import ChartArea from "./components/ChartArea";
import ChartLegend from "./components/ChartLegend";
import CustomerListDialog, {
  FilterParams,
} from "./components/CustomerListDialog";
import "./index.less";

interface CustomerUpgradePoolProps {
  bubbles?: CustomerBubble[];
  customerCount?: number;
  themeMode?: "dark" | "light";
  onBubbleClick?: (customerProfileId: string, customerName?: string) => void;
  onOpenCustomerProfile?: (customerProfileId: string, customerName?: string) => void;
  onOpenAIAnalysis?: (customerProfileId: string, customerName: string) => void;
  currentPoolId?: string | null;
  onBack?: () => void;
  isThumbnail?: boolean;
  role?: "advisor" | "market";
  onTransferCustomer?: (customer: any, onSuccess?: () => void) => void; // Added
  headerExtra?: React.ReactNode;
}

const CustomerUpgradePool: React.FC<CustomerUpgradePoolProps> = ({
  bubbles: customBubbles,
  themeMode = "dark",
  onBubbleClick,
  onOpenCustomerProfile,
  onOpenAIAnalysis,
  currentPoolId = 'follow',
  onBack,
  isThumbnail = false,
  role = "advisor",
  onTransferCustomer, // Destructured
  headerExtra,
}) => {
  const isDark = themeMode === "dark";

  // 获取真实的客户数据
  const { data, loading, error, updateQueryParams } = useCustomerUpgradePool();

  // 客户列表弹窗状态
  const [listDialogVisible, setListDialogVisible] = useState(false);

  // 隐藏的等级状态（使用数组而不是Set，确保React能正确检测变化）
  const [hiddenLevels, setHiddenLevels] = useState<string[]>([]);

  // 如果没有真实数据或数据为空，则使用 mock 数据（并追加特殊状态的 mock 数据）
  const useMockData = !data || data.list.length === 0;

  const displayData = useMemo(() => {
    if (!useMockData) {
      // 真实数据目前不支持重分配状态 mock
      return data?.list || [];
    }
    // 使用 mock 数据，并且将重分配的特殊气泡强行追加进去
    return appendReassignedMocks(generateDefaultMockCustomers() as any);
  }, [data, useMockData]);

  // 容器引用和尺寸状态
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1200);
  const [containerHeight, setContainerHeight] = useState<number>(600);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      if (width > 0 && height > 0) {
        setContainerWidth(width);
        setContainerHeight(height);
      } else {
        const timer = setTimeout(() => {
          if (containerRef.current) {
            const retryWidth = containerRef.current.offsetWidth;
            const retryHeight = containerRef.current.offsetHeight;
            if (retryWidth > 0 && retryHeight > 0) {
              setContainerWidth(retryWidth);
              setContainerHeight(retryHeight);
            }
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 测量容器尺寸的回调（用于 resize）
  const measureDimensions = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      if (width > 0) setContainerWidth(width);
      if (height > 0) setContainerHeight(height);
    }
  }, []);

  // 监听窗口大小变化和容器尺寸变化（优化版本，避免不必要的重新计算）
  useEffect(() => {
    let resizeTimer: number | null = null;
    let lastWidth = containerWidth;
    let lastHeight = containerHeight;

    const handleResize = () => {
      // 使用防抖，避免频繁触发
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(() => {
        measureDimensions();
      }, 150); // 150ms 防抖
    };

    // 使用 ResizeObserver 监听容器尺寸变化（更精确）
    let resizeObserver: ResizeObserver | null = null;

    if (containerRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;

          // 只有当尺寸变化超过阈值时才更新（避免微小变化导致重新计算）
          const widthDiff = Math.abs(width - lastWidth);
          const heightDiff = Math.abs(height - lastHeight);

          if (widthDiff > 10 || heightDiff > 10) {
            // 10px 阈值
            lastWidth = width;
            lastHeight = height;

            if (width > 0) setContainerWidth(width);
            if (height > 0) setContainerHeight(height);
          }
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    // 只监听窗口大小变化，不监听容器变化
    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [measureDimensions, containerWidth, containerHeight]);

  /**
   * 处理搜索
   */
  const handleSearch = (filters: FilterParams) => {
    // 转换筛选参数为API参数
    const queryParams: CustomerUpgradePoolQueryParams = {
      name: filters.remarkName || undefined,
      level: filters.level || undefined,
      startDate: filters.dateRange?.[0]
        ? filters.dateRange[0].toISOString().split("T")[0]
        : undefined,
      endDate: filters.dateRange?.[1]
        ? filters.dateRange[1].toISOString().split("T")[0]
        : undefined,
      opinion: filters.objectionCategory || undefined,
    };

    // 调用更新查询参数方法
    updateQueryParams(queryParams);
  };

  /**
   * 处理图例点击，切换等级显示/隐藏
   */
  const handleToggleLevel = useCallback((level: string) => {
    setHiddenLevels((prev) => {
      // 使用数组操作，确保React能检测到变化
      if (prev.includes(level)) {
        // 显示该等级
        return prev.filter((l) => l !== level);
      } else {
        // 隐藏该等级
        return [...prev, level];
      }
    });
  }, []);

  /**
   * 处理气泡右键菜单操作
   */
  const handleBubbleContextMenu = useCallback(
    (bubble: CustomerBubble, action: "profile" | "analysis" | "transfer") => {
      const customerProfileId = bubble.customer.id;
      const customerName = bubble.customer.name;

      if (!customerProfileId) {
        return;
      }

      if (action === "profile") {
        onOpenCustomerProfile?.(customerProfileId);
      } else if (action === "analysis") {
        onOpenAIAnalysis?.(customerProfileId, customerName);
      } else if (action === "transfer") {
        onTransferCustomer?.(bubble.customer); // Call the new handler
      }
    },
    [onOpenCustomerProfile, onOpenAIAnalysis, onTransferCustomer]
  );

  // 创建稳定的数据标识符，避免不必要的重新计算
  const dataIdentifier = useMemo(() => {
    if (!data?.list) return null;
    // 使用数据长度和第一个/最后一个元素的customerProfileId作为标识符
    return `${data.list.length}-${data.list[0]?.customerProfileId || ""}-${data.list[data.list.length - 1]?.customerProfileId || ""
      }`;
  }, [data?.list]);

  // 生成或使用传入的气泡数据（性能优化版本）
  const allBubbles = useMemo(() => {
    if (customBubbles) {
      return customBubbles;
    }

    // 性能优化：在缩略图模式下极大减少气泡数量，降低计算和渲染开销
    const effectiveMaxBubbles = isThumbnail ? 12 : performanceManager.getConfig().maxBubbleCount;

    if (displayData && containerWidth > 50 && containerHeight > 0) {
      // 将原始数据转换为前端需要的格式
      const customers = useMockData
        ? displayData
        : transformCustomerList(displayData as any);
      const limitedCustomers = customers.slice(0, effectiveMaxBubbles);

      const result = generateBubbleLayout(
        limitedCustomers,
        containerWidth,
        containerHeight,
        themeMode
      );
      return result;
    }

    return [];
  }, [
    customBubbles,
    dataIdentifier,
    containerWidth,
    containerHeight,
    themeMode,
    isThumbnail,
    displayData,
    useMockData,
  ]);

  // 根据隐藏的等级过滤气泡
  const bubbles = useMemo(() => {
    if (hiddenLevels.length === 0) {
      return allBubbles;
    }

    return allBubbles.filter(
      (bubble: any) => !hiddenLevels.includes(bubble.customer.level)
    );
  }, [allBubbles, hiddenLevels]);

  // 计算每个等级的客户数量和比例（基于过滤后的气泡，受隐藏状态影响）
  const levelStats = useMemo(() => {
    const stats: Record<string, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      X: 0,
    };

    // 使用过滤后的气泡来计算统计数据
    bubbles.forEach((bubble: any) => {
      stats[bubble.customer.level]++;
    });

    const total = bubbles.length;

    const result = Object.entries(stats).map(([level, count]) => ({
      level,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));

    console.log("📊 Level stats calculated:", result, "total:", total);

    return result;
  }, [bubbles]);

  // 色条颜色配置
  const colorConfig = {
    A: "linear-gradient(135deg, #FD4895 0%, #C438EF 100%)",
    B: "linear-gradient(135deg, #FFB929 0%, #FF7FB7 100%)", // 橙粉渐变
    C: "linear-gradient(135deg, #80FFB3 0%, #5283E2 100%)", // 绿蓝渐变
    D: "linear-gradient(135deg, #06D7F6 0%, #4807EA 100%)", // 蓝紫渐变
    X: "linear-gradient(135deg, #a4b0be 0%, #747d8c 100%)",
  };

  // 生成色条Tooltip内容
  const getColorBarTooltipContent = useCallback(
    (level: string, count: number, percentage: number) => {
      return (
        <div className="color-bar-tooltip-content">
          <div className="tooltip-name">{level}级客户</div>
          <div className="tooltip-info">
            <div>▸ 数量: {count}人</div>
            <div>▸ 占比: {percentage.toFixed(1)}%</div>
          </div>
        </div>
      );
    },
    []
  );

  // 根据主题动态设置tooltip样式
  const colorBarTooltipStyle = useMemo(
    () => ({
      overlayStyle: {
        maxWidth: "300px",
      },
      overlayInnerStyle: isDark
        ? {
          background:
            "linear-gradient(135deg, rgba(40, 44, 52, 0.95), rgba(40, 44, 52, 0.95))",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
        }
        : {
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 245, 250, 0.98))",
          color: "rgba(0, 0, 0, 0.88)",
          padding: "12px 16px",
          borderRadius: "8px",
          boxShadow:
            "0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1) inset",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
        },
    }),
    [isDark]
  );

  // 错误状态
  if (error) {
    return (
      <div className="customer-upgrade-pool">
        <div className="chart-header">
          <div className="chart-header-left">
            <div className="chart-title">
              <h3>客户池&升级池</h3>
            </div>
          </div>
        </div>
        <div className="chart-error-state">
          <div className="error-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              {/* 背景圆环 */}
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="url(#bgGradient)"
                strokeWidth="1.5"
                opacity="0.2"
              />

              {/* 主要图形 - 客户升级池概念 */}
              <g transform="translate(40, 40)">
                {/* 中心圆 - 代表核心客户 */}
                <circle
                  cx="0"
                  cy="0"
                  r="8"
                  fill="url(#centerGradient)"
                  opacity="0.9"
                />

                {/* 环绕的小圆点 - 代表客户群体 */}
                <g className="customer-dots">
                  <circle
                    cx="18"
                    cy="0"
                    r="3"
                    fill="url(#dotGradient1)"
                    opacity="0.7"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.4;0.9;0.4"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="12.7"
                    cy="12.7"
                    r="2.5"
                    fill="url(#dotGradient2)"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.8;0.3"
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="0"
                    cy="18"
                    r="3"
                    fill="url(#dotGradient3)"
                    opacity="0.7"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.4;0.9;0.4"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="-12.7"
                    cy="12.7"
                    r="2.5"
                    fill="url(#dotGradient4)"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.8;0.3"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="-18"
                    cy="0"
                    r="3"
                    fill="url(#dotGradient1)"
                    opacity="0.7"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.4;0.9;0.4"
                      dur="2.1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="-12.7"
                    cy="-12.7"
                    r="2.5"
                    fill="url(#dotGradient2)"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.8;0.3"
                      dur="1.9s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="0"
                    cy="-18"
                    r="3"
                    fill="url(#dotGradient3)"
                    opacity="0.7"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.4;0.9;0.4"
                      dur="2.3s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="12.7"
                    cy="-12.7"
                    r="2.5"
                    fill="url(#dotGradient4)"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.3;0.8;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>

                {/* 连接线 - 表示升级路径 */}
                <g className="connection-lines" opacity="0.4">
                  <path
                    d="M8,0 Q13,0 18,0"
                    stroke="url(#lineGradient)"
                    strokeWidth="1"
                    fill="none"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,20;10,10;0,20"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path
                    d="M5.7,5.7 Q9,9 12.7,12.7"
                    stroke="url(#lineGradient)"
                    strokeWidth="1"
                    fill="none"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,20;10,10;0,20"
                      dur="3.2s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path
                    d="M0,8 Q0,13 0,18"
                    stroke="url(#lineGradient)"
                    strokeWidth="1"
                    fill="none"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,20;10,10;0,20"
                      dur="2.8s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path
                    d="M-5.7,5.7 Q-9,9 -12.7,12.7"
                    stroke="url(#lineGradient)"
                    strokeWidth="1"
                    fill="none"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,20;10,10;0,20"
                      dur="3.4s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              </g>

              {/* 外层装饰环 */}
              <circle
                cx="40"
                cy="40"
                r="28"
                stroke="url(#outerGradient)"
                strokeWidth="1"
                opacity="0.3"
                strokeDasharray="4,4"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 40 40;360 40 40"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* 渐变定义 */}
              <defs>
                <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
                  <stop
                    offset="0%"
                    stopColor="var(--color-purple-primary)"
                    stopOpacity="0.1"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-purple-primary)"
                    stopOpacity="0.3"
                  />
                </radialGradient>

                <radialGradient id="centerGradient" cx="30%" cy="30%" r="70%">
                  <stop
                    offset="0%"
                    stopColor="var(--color-purple-primary)"
                    stopOpacity="0.9"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-purple-gradient-end)"
                    stopOpacity="0.7"
                  />
                </radialGradient>

                <linearGradient
                  id="dotGradient1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                </linearGradient>

                <linearGradient
                  id="dotGradient2"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.5" />
                </linearGradient>

                <linearGradient
                  id="dotGradient3"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#d946ef" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                </linearGradient>

                <linearGradient
                  id="dotGradient4"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#d946ef" stopOpacity="0.5" />
                </linearGradient>

                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-purple-primary)"
                    stopOpacity="0.2"
                  />
                  <stop
                    offset="50%"
                    stopColor="var(--color-purple-primary)"
                    stopOpacity="0.6"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-purple-primary)"
                    stopOpacity="0.2"
                  />
                </linearGradient>

                <linearGradient
                  id="outerGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-purple-primary)"
                    stopOpacity="0.4"
                  />
                  <stop
                    offset="50%"
                    stopColor="var(--color-purple-gradient-end)"
                    stopOpacity="0.2"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-purple-primary)"
                    stopOpacity="0.4"
                  />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="error-title">数据加载失败</div>
          <div className="error-message">
            {error.message || "Request failed with status code 401"}
          </div>
          <button
            className="error-retry-btn"
            onClick={() => updateQueryParams({})}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M12.25 7C12.25 9.8995 9.8995 12.25 7 12.25C4.1005 12.25 1.75 9.8995 1.75 7C1.75 4.1005 4.1005 1.75 7 1.75C8.61763 1.75 10.0669 2.48749 11.025 3.675"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M10.5 1.75V3.675H8.575"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`customer-upgrade-pool ${isThumbnail ? 'is-thumbnail' : ''}`}>
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
            <h3>{currentPoolId === 'follow' ? '客户池&升级池' : currentPoolId === 'clue' ? '线索池' : '客户池&升级池'}</h3>
          </div>
          <div className="color-bar">
            {levelStats.map(
              (item) =>
                item.percentage > 0 && (
                  <Tooltip
                    key={item.level}
                    title={getColorBarTooltipContent(
                      item.level,
                      item.count,
                      item.percentage
                    )}
                    placement="top"
                    mouseEnterDelay={0.15}
                    arrow={true}
                    {...colorBarTooltipStyle}
                  >
                    <div
                      className={`color-segment level-${item.level}`}
                      style={{
                        flex: `0 0 ${item.percentage}%`,
                        background:
                          colorConfig[item.level as keyof typeof colorConfig],
                      }}
                    ></div>
                  </Tooltip>
                )
            )}
          </div>
          <div className="customer-count">客户: {data?.count || 0}人</div>
        </div>
        <div className="chart-legend-container">
          <ChartLegend
            onOpenList={((currentPoolId === 'clue' && role === 'advisor') || role === 'market') ? () => setListDialogVisible(true) : undefined}
            hiddenLevels={hiddenLevels}
            onToggleLevel={handleToggleLevel}
            levelStats={levelStats}
            extra={headerExtra}
          />
        </div>
      </div>
      )}

      <div className="chart-area-container" ref={containerRef}>
        <ChartArea
          bubbles={bubbles}
          onBubbleClick={(id, name) => onBubbleClick?.(id, name)}
          onBubbleContextMenu={handleBubbleContextMenu}
          role={role}
        />
      </div>

      {/* 客户列表弹窗 */}
      <CustomerListDialog
        visible={listDialogVisible}
        onClose={() => setListDialogVisible(false)}
        customers={data?.list || []}
        loading={loading}
        onSearch={handleSearch}
        themeMode={themeMode}
          useNewApi={true}
        />
    </div>
  );
};

export default React.memo(CustomerUpgradePool);
