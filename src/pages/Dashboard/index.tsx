import React, { useState } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Layout } from "@/components/Layout";
import { useTheme } from "@/hooks/useTheme";
import { useDashboardData } from "./hooks/useDashboardData";
import DashboardHeader from "./components/DashboardHeader";
import KPICard from "@/components/KPICard";
import PoolCarousel from "./components/CustomerUpgradePool/components/PoolCarousel";
import ChatAssistant from "./components/ChatAssistant";
import DashboardSkeleton from "./components/DashboardSkeleton";
import CustomerDetailModal from "@/pages/Market/components/CustomerDetailModal";
import "./index.less";

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const themeClass = isDark ? "dark-theme" : "light-theme";
  const { kpiData, loading } = useDashboardData();
  const [selectedCustomerProfileId] = useState<
    string | undefined
  >();
  const [currentPoolId, setCurrentPoolId] = useState<string | null>(null);
  const [lastPoolId, setLastPoolId] = useState<string | null>(null);

  // 包装 setCurrentPoolId，现在仅用于记录最后选择的状态或触发其它副作用
  const handleSelectPool = (poolId: string | null) => {
    if (poolId !== null) {
      setLastPoolId(poolId);
      setCurrentPoolId(poolId);
    }
  };
  const [aiAnalysisRequest] = useState<{
    customerProfileId: string;
    customerName: string;
  } | null>(null);
  const [chatWidth, setChatWidth] = useState<number>(23.2); // 初始宽度百分比
  const [topOffset, setTopOffset] = useState<number>(3.267); // 顶部偏移量（rem单位），会随宽度减小
  const [isResizing, setIsResizing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // 是否展开悬浮
  const [isMobileExpanded, setIsMobileExpanded] = useState(false); // 小屏下是否展开
  const [viewedEmployeeName, setViewedEmployeeName] = useState<string | undefined>(undefined); // 从URL中获取的顾问姓名

  // 从URL中读取顾问姓名
  React.useEffect(() => {
    const hash = window.location.hash;
    const queryStart = hash.indexOf("?");

    if (queryStart !== -1) {
      const queryString = hash.substring(queryStart + 1);
      const urlParams = new URLSearchParams(queryString);
      const employeeName = urlParams.get("employeeName");

      if (employeeName) {
        setViewedEmployeeName(decodeURIComponent(employeeName));
      }
    }
  }, []);

  // 监听窗口大小变化，自动调整展开状态
  React.useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 1370;
      // 如果从小屏切换到大屏，关闭移动端展开状态
      if (!isSmallScreen && isMobileExpanded) {
        setIsMobileExpanded(false);
      }
      // 如果从大屏切换到小屏，关闭桌面端展开状态
      if (isSmallScreen && isExpanded) {
        setIsExpanded(false);
        setChatWidth(23.2);
        setTopOffset(3.267);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileExpanded, isExpanded]);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const [selectedSubPoolType, setSelectedSubPoolType] = useState<'deal' | 'enrolled' | undefined>();

  const handleBubbleClick = (id: string, name?: string, subPoolType?: 'deal' | 'enrolled') => {
    // 模拟数据用于展示
    const mockChatRecords = [
      { id: 'c1', sender: 'customer' as const, content: '你好，请问直通车课程还有名额吗？', time: '10:30' },
      { id: 'c2', sender: 'advisor' as const, content: `您好！${name || '客户'}家长，名额还有最后3个，建议您尽快定金锁定。`, time: '10:35' },
    ];
    setSelectedCustomer({
      id,
      name: name || '示例客户',
      level: 'A',
      importance: 5,
      tags: ['高意向', '重点跟进'],
      status: 'active',
      source: '小红书',
      qualityScore: 95,
      maturityScore: 85,
      dealAmount: Math.floor(Math.random() * 10000 + 8000), // 随机生成 8000-18000 的金额
      attendanceRate: Math.floor(Math.random() * 15 + 85), // 随机生成 85-99 的出勤率
      chatRecords: mockChatRecords,
    } as any);
    setSelectedSubPoolType(subPoolType);
    setDetailModalVisible(true);
  };

  /**
   * 处理拖动开始
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  /**
   * 处理拖动
   */
  React.useEffect(() => {
    let rafId: number | null = null;
    let lastMouseX: number | null = null;
    let tempWidth: number = chatWidth; // 临时宽度，用于拖动过程中的计算
    let tempTopOffset: number = topOffset; // 临时顶部偏移
    let tempExpanded: boolean = isExpanded; // 临时展开状态
    let lastUpdateTime: number = 0; // 上次更新时间
    const UPDATE_THROTTLE = 50; // 节流间隔（毫秒）

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // 保存最新的鼠标位置
      lastMouseX = e.clientX;

      // 如果已经有一个待处理的动画帧，不要创建新的
      if (rafId !== null) return;

      // 使用 requestAnimationFrame 来优化性能
      rafId = requestAnimationFrame(() => {
        rafId = null;

        if (lastMouseX === null) return;

        const windowWidth = window.innerWidth;
        const newWidth = ((windowWidth - lastMouseX) / windowWidth) * 100;

        // 限制宽度范围：最小20%，最大60%
        if (newWidth >= 20 && newWidth <= 60) {
          tempWidth = newWidth;

          // 根据宽度变化计算顶部偏移量（从而改变高度）
          // 宽度从23.2%增加到60%时，顶部偏移从3.267rem减小到0.8rem
          const widthDelta = newWidth - 23.2; // 宽度增量
          const maxWidthDelta = 60 - 23.2; // 最大宽度增量 (36.8)
          const initialTopOffset = 3.267; // 初始顶部偏移
          const minTopOffset = 0.8; // 最小顶部偏移（与页面padding一致）
          const offsetRange = initialTopOffset - minTopOffset; // 偏移量变化范围
          const newTopOffset = initialTopOffset - (widthDelta / maxWidthDelta) * offsetRange;
          tempTopOffset = Math.max(minTopOffset, newTopOffset);

          // 当宽度超过初始值时，切换到悬浮模式；回到初始值时退出悬浮模式
          if (newWidth > 23.2) {
            tempExpanded = true;
          } else {
            tempExpanded = false;
            tempTopOffset = 3.267;
          }

          // 使用节流来减少状态更新频率，避免影响流式输出
          const now = Date.now();
          if (now - lastUpdateTime >= UPDATE_THROTTLE) {
            lastUpdateTime = now;

            // 批量更新状态
            setChatWidth(tempWidth);
            setTopOffset(tempTopOffset);
            if (tempExpanded !== isExpanded) {
              setIsExpanded(tempExpanded);
            }
          }
        }
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);

      // 拖动结束时，确保状态是最新的
      setChatWidth(tempWidth);
      setTopOffset(tempTopOffset);
      setIsExpanded(tempExpanded);

      // 清理可能待处理的动画帧
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastMouseX = null;
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      // 添加一个类来禁用过渡动画和指针事件，避免拖动时的卡顿和干扰
      document.body.classList.add('resizing-chat');
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.classList.remove('resizing-chat');
      // 清理可能待处理的动画帧
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isResizing, isExpanded, chatWidth, topOffset]);

  return (
    <ConfigProvider locale={zhCN}>
      <Layout>
        <div className={`dashboard ${themeClass}`}>
          <DashboardHeader />

            {loading ? (
              // 加载时显示完整的骨架屏
              <DashboardSkeleton themeMode={isDark ? "dark" : "light"} />
            ) : (
              // 数据加载完成后显示实际内容
              <div className="main-content">
                {/* Left Side - Dashboard Content */}
                <div className="dashboard-content">
                  {/* KPI Cards Section */}
                  <div className="kpi-section">
                    {kpiData.map((kpiDataItem, index) => (
                      <KPICard
                        key={index}
                        {...kpiDataItem}
                      />
                    ))}
                  </div>

                  {/* Customer Upgrade Pool Area - Always Carousel Mode */}
                  <div className="chart-section" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <PoolCarousel
                      onSelectPool={handleSelectPool}
                      themeMode={isDark ? "dark" : "light"}
                      initialPoolId={lastPoolId || currentPoolId}
                      fullWidth={true}
                      onBubbleClick={handleBubbleClick}
                      onOpenLearningPanorama={() => {
                        import('antd').then(({ notification }) => {
                          notification.info({
                            message: '学情全景',
                            description: '即将打通学练机数据，查看学生整体学习情况。',
                            placement: 'topRight',
                          });
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Right Side - Chat Assistant */}
                <div
                  className={`chat-section ${isExpanded ? "expanded" : ""} ${isMobileExpanded ? "mobile-expanded" : ""}`}
                  style={{
                    width: isExpanded ? `${chatWidth}%` : "23.2%",
                    top: isExpanded ? `${topOffset}rem` : undefined,
                    height: isExpanded ? `calc(100vh - ${topOffset + 1.8}rem)` : undefined
                  }}
                >
                  {/* 拖动手柄 */}
                  <div
                    className={`resize-handle ${isResizing ? "resizing" : ""}`}
                    onMouseDown={handleMouseDown}
                  >
                    <div className="resize-icon">
                      <svg
                        width="24"
                        height="48"
                        viewBox="0 0 24 48"
                        fill="none"
                      >
                        {/* 左侧竖线 */}
                        <rect
                          x="8"
                          y="16"
                          width="2.5"
                          height="16"
                          rx="1.25"
                          fill="currentColor"
                          opacity="0.7"
                        />
                        {/* 右侧竖线 */}
                        <rect
                          x="13.5"
                          y="16"
                          width="2.5"
                          height="16"
                          rx="1.25"
                          fill="currentColor"
                          opacity="0.7"
                        />
                        {/* 顶部装饰点 */}
                        <circle
                          cx="9.25"
                          cy="12"
                          r="1.5"
                          fill="currentColor"
                          opacity="0.5"
                        />
                        <circle
                          cx="14.75"
                          cy="12"
                          r="1.5"
                          fill="currentColor"
                          opacity="0.5"
                        />
                        {/* 底部装饰点 */}
                        <circle
                          cx="9.25"
                          cy="36"
                          r="1.5"
                          fill="currentColor"
                          opacity="0.5"
                        />
                        <circle
                          cx="14.75"
                          cy="36"
                          r="1.5"
                          fill="currentColor"
                          opacity="0.5"
                        />
                      </svg>
                    </div>
                  </div>
                  <ChatAssistant
                    customerProfileId={selectedCustomerProfileId}
                    aiAnalysisRequest={aiAnalysisRequest}
                    viewedEmployeeName={viewedEmployeeName}
                  />
                </div>

                {/* 透明蒙层 - 在展开时显示 */}
                {(isExpanded || isMobileExpanded) && (
                  <>
                    <div
                      className="chat-overlay"
                      onClick={() => {
                        setIsExpanded(false);
                        setIsMobileExpanded(false);
                        setChatWidth(23.2);
                        setTopOffset(3.267);
                      }}
                    />
                    {/* 收回提示按钮 - 根据顾问助手宽度定位 */}
                    {isExpanded && (
                      <div
                        className="collapse-hint"
                        style={{
                          right: `calc(${chatWidth}% + 2rem)`,
                        }}
                        onClick={() => {
                          // 收回到默认宽度和位置，并关闭展开状态
                          setIsExpanded(false);
                          setChatWidth(23.2);
                          setTopOffset(3.267);
                        }}
                      >
                        <div className="collapse-hint-icon">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            {/* 双箭头向右 - 收回聊天框 */}
                            <path
                              d="M10 6L18 12L10 18"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M4 6L12 12L4 18"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.6"
                            />
                          </svg>
                        </div>
                        <div className="collapse-hint-text">点击收回</div>
                      </div>
                    )}

                    {/* 移动端收回提示按钮 - 固定在50%位置左侧 */}
                    {isMobileExpanded && (
                      <div
                        className="collapse-hint mobile-collapse-hint"
                        onClick={() => {
                          // 关闭移动端展开状态
                          setIsMobileExpanded(false);
                        }}
                      >
                        <div className="collapse-hint-icon">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            {/* 双箭头向右 - 收回聊天框 */}
                            <path
                              d="M10 6L18 12L10 18"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M4 6L12 12L4 18"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.6"
                            />
                          </svg>
                        </div>
                        <div className="collapse-hint-text">点击收回</div>
                      </div>
                    )}
                  </>
                )}

                {/* 小屏下的AI聊天图标按钮 */}
                <div
                  className={`mobile-chat-trigger ${isMobileExpanded ? "hidden" : ""}`}
                  onClick={() => setIsMobileExpanded(true)}
                >
                  <div className="chat-icon">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      {/* 外层神经网络环 */}
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="url(#neuralGradient)"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.6"
                      />

                      {/* 内层AI芯片核心 */}
                      <rect
                        x="10"
                        y="10"
                        width="12"
                        height="12"
                        rx="2"
                        fill="url(#coreGradient)"
                        stroke="url(#neuralGradient)"
                        strokeWidth="1"
                      />

                      {/* 神经网络连接点 */}
                      <circle cx="6" cy="8" r="1.5" fill="url(#nodeGradient)" opacity="0.8">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="26" cy="8" r="1.5" fill="url(#nodeGradient)" opacity="0.8">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.3s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="6" cy="24" r="1.5" fill="url(#nodeGradient)" opacity="0.8">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.6s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="26" cy="24" r="1.5" fill="url(#nodeGradient)" opacity="0.8">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="0.9s" repeatCount="indefinite" />
                      </circle>

                      {/* 神经网络连接线 */}
                      <path
                        d="M7.5 9.5 L10 10"
                        stroke="url(#connectionGradient)"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <path
                        d="M24.5 9.5 L22 10"
                        stroke="url(#connectionGradient)"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <path
                        d="M7.5 22.5 L10 22"
                        stroke="url(#connectionGradient)"
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <path
                        d="M24.5 22.5 L22 22"
                        stroke="url(#connectionGradient)"
                        strokeWidth="1"
                        opacity="0.6"
                      />

                      {/* 中心AI标识 */}
                      <text
                        x="16"
                        y="18"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="bold"
                        fill="currentColor"
                        opacity="0.9"
                      >
                        AI
                      </text>

                      {/* 渐变定义 */}
                      <defs>
                        <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
                        </linearGradient>

                        <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                          <stop offset="70%" stopColor="currentColor" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
                        </radialGradient>

                        <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
                        </radialGradient>

                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="chat-label">顾问助手</div>
                </div>
              </div>
            )}
          </div>
          <CustomerDetailModal
            visible={detailModalVisible}
            customer={selectedCustomer}
            onCancel={() => {
              setDetailModalVisible(false);
              setSelectedSubPoolType(undefined);
            }}
            themeMode={themeClass === "dark-theme" ? "dark" : "light"}
            poolType={currentPoolId as any || 'clue'}
            subPoolType={selectedSubPoolType}
          />
        </Layout>
      </ConfigProvider>
  );
};

export default Dashboard;
