import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Layout } from "@/components/Layout";
import { useTheme } from "@/hooks/useTheme";
import { useMarketData } from "./hooks/useMarketData";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import KPICard from "@/components/KPICard";
import PoolCarousel from "../Dashboard/components/CustomerUpgradePool/components/PoolCarousel";
import ChatAssistant from "../Dashboard/components/ChatAssistant";
import MarketHeaderActions from "./components/MarketHeaderActions";
import CustomerDetailModal from "./components/CustomerDetailModal";
import DashboardSkeleton from "../Dashboard/components/DashboardSkeleton";
import { notification } from "antd";
import { Customer } from "@/types/dashboard";
import CustomerListDialog from "../Dashboard/components/CustomerUpgradePool/components/CustomerListDialog";
import MarketChannelAnalysisModal from "./components/MarketChannelAnalysisModal";
import MarketCoreMetricsModal from "./components/MarketCoreMetricsModal";
import AssignAdvisorModal from "@/pages/LeadsManagement/components/AssignAdvisorModal";
import "./index.less";

const Market: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const themeClass = isDark ? "dark-theme" : "light-theme";
  const [timeDimension, setTimeDimension] = useState<'year' | 'month'>('year');
  const { kpiData, loading } = useMarketData(timeDimension);
  const [currentPoolId, setCurrentPoolId] = useState<string | null>(null);
  const [lastPoolId, setLastPoolId] = useState<string | null>(null);

  // --- Sidebar Resizing & Expanding Logic ---
  const [isResizing, setIsResizing] = useState(false);
  const [chatWidth, setChatWidth] = useState(23.2); // Initial width %
  const [isExpanded, setIsExpanded] = useState(false); // Hover/Expanded mode
  const [topOffset, setTopOffset] = useState(3.267); // Top offset (rem)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerListVisible, setCustomerListVisible] = useState(false);

  // Modal for Channel Analysis
  const [channelAnalysisVisible, setChannelAnalysisVisible] = useState(false);
  const [currentMetricTitle, setCurrentMetricTitle] = useState('');

  // Modal for Market Core Metrics
  const [marketMetricsVisible, setMarketMetricsVisible] = useState(false);

  // Modal for Assign Advisor
  const [assignAdvisorVisible, setAssignAdvisorVisible] = useState(false);
  const [customerToAssign, setCustomerToAssign] = useState<Customer | null>(null);
  const [assignSuccessCallback, setAssignSuccessCallback] = useState<(() => void) | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleKPIClick = (title: string) => {
    setCurrentMetricTitle(title);
    setChannelAnalysisVisible(true);
  };

  const handleManageLeads = () => {
    navigate('/leads-management');
  };



  const handleSelectionChange = (_selectedRowKeys: React.Key[], selectedRows: any[]) => {
    console.log("Selected leads:", selectedRows);
  };

  const handleBatchDistributeConfirm = (selectedRowKeys: React.Key[], _selectedRows: any[]) => {
    notification.success({
      message: '分配成功',
      description: `已成功将 ${selectedRowKeys.length} 条线索分配给指定的销售顾问`,
      placement: 'topRight',
    });
    setCustomerListVisible(false);
  };

  const handleTransferCustomer = (customer: Customer, onSuccess?: () => void) => {
    setCustomerToAssign(customer);
    setAssignSuccessCallback(() => onSuccess);
    setAssignAdvisorVisible(true);
  };

  const handleOpenCustomerProfile = (customerProfileId: string) => {
    const { origin } = window.location;
    window.open(`${origin}/#/customer/${customerProfileId}`, '_blank');
  };

  const [selectedSubPoolType, setSelectedSubPoolType] = useState<'deal' | 'enrolled' | undefined>();

  const handleBubbleClick = (id: string, name?: string, subPoolType?: 'deal' | 'enrolled') => {
    const mockChatRecords = [
      { id: 'c1', sender: 'customer' as const, content: '你好，请问直通车课程还有名额吗？', time: '10:30' },
      { id: 'c2', sender: 'advisor' as const, content: `您好！${name || '客户'}家长，名额还有最后3个，建议您尽快定金锁定。`, time: '10:35' },
      { id: 'c3', sender: 'customer' as const, content: '好的，定金是多少？', time: '10:40' },
      { id: 'c4', sender: 'assistant' as const, content: 'AI提示：该客户意向度极高，建议发送支付链接。', time: '10:41' },
      { id: 'c5', sender: 'advisor' as const, content: '定金是2000元，您可以直接点击这个链接支付：https://pay.example.com/123', time: '10:45' }
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
      qualityRank: 92,
      intentScore: 88,
      intentLabel: '极高意向',
      lastFollowUp: '2026-03-20',
      advisor: '张三',
      deliverySatisfaction: Math.floor(Math.random() * 15 + 85), // 随机生成 85-99 的满意度
      chatRecords: mockChatRecords,
      followUpHistory: [
        {
          id: 'fh1',
          action: '线索录入',
          operator: '系统自动',
          time: '2026-03-20 10:30',
          details: '通过 小红书(核心) 自动抓取并录入系统'
        }
      ]
    } as any);
    setSelectedSubPoolType(subPoolType);
    setDetailModalVisible(true);
  };

  useEffect(() => {
    let lastMouseX: number | null = null;
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const UPDATE_THROTTLE = 16;

    let tempWidth = chatWidth;
    let tempTopOffset = topOffset;
    let tempExpanded = isExpanded;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      lastMouseX = e.clientX;
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (lastMouseX === null) return;

        const windowWidth = window.innerWidth;
        const newWidth = ((windowWidth - lastMouseX) / windowWidth) * 100;

        if (newWidth >= 20 && newWidth <= 60) {
          tempWidth = newWidth;
          const widthDelta = newWidth - 23.2;
          const maxWidthDelta = 60 - 23.2;
          const initialTopOffset = 3.267;
          const minTopOffset = 0.8;
          const offsetRange = initialTopOffset - minTopOffset;
          const newTopOffset = initialTopOffset - (widthDelta / maxWidthDelta) * offsetRange;
          tempTopOffset = Math.max(minTopOffset, newTopOffset);

          if (newWidth > 23.2) {
            tempExpanded = true;
          } else {
            tempExpanded = false;
            tempTopOffset = 3.267;
          }

          const now = Date.now();
          if (now - lastUpdateTime >= UPDATE_THROTTLE) {
            lastUpdateTime = now;
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
      setChatWidth(tempWidth);
      setTopOffset(tempTopOffset);
      setIsExpanded(tempExpanded);
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
      document.body.classList.add('resizing-chat');
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.classList.remove('resizing-chat');
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isResizing, isExpanded, chatWidth, topOffset]);

  const handleSelectPool = (poolId: string | null) => {
    if (poolId !== null) {
      setLastPoolId(poolId);
      setCurrentPoolId(poolId);
    }
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Layout>
        <div className={`dashboard market-dashboard ${themeClass}`}>
          <DashboardHeader
            onMetricsClick={() => setMarketMetricsVisible(true)}
            timeDimension={timeDimension}
            onTimeDimensionChange={setTimeDimension}
          />

          {loading ? (
            <DashboardSkeleton themeMode={isDark ? "dark" : "light"} />
          ) : (
            <div className="main-content">
              <div className="dashboard-content">
                <div className="kpi-section">
                  {kpiData.map((kpiDataItem, index) => (
                    <KPICard
                      key={index}
                      {...kpiDataItem}
                      onClick={handleKPIClick}
                    />
                  ))}
                </div>

                <div className="chart-section" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                  <PoolCarousel
                      onSelectPool={handleSelectPool}
                      themeMode={isDark ? "dark" : "light"}
                      initialPoolId={lastPoolId || currentPoolId}
                      role="market"
                      onTransferCustomer={handleTransferCustomer}
                      onBubbleClick={handleBubbleClick}
                      onOpenCustomerProfile={handleOpenCustomerProfile}
                      onOpenLearningPanorama={() => {
                        import('antd').then(({ notification }) => {
                          notification.info({
                            message: '学情全景',
                            description: '即将打通学练机数据，查看学生整体学习情况。',
                            placement: 'topRight',
                          });
                        });
                      }}
                      fullWidth={true}
                      headerExtra={
                        <MarketHeaderActions
                          onManageLeads={handleManageLeads}
                        />
                      }
                    />
                </div>
              </div>

              <div
                className={`chat-section ${isExpanded ? "expanded" : ""} ${isMobileExpanded ? "mobile-expanded" : ""}`}
                style={{
                  width: isExpanded ? `${chatWidth}%` : "23.2%",
                  top: isExpanded ? `${topOffset}rem` : undefined,
                  height: isExpanded ? `calc(100vh - ${topOffset + 1.8}rem)` : undefined
                }}
              >
                <div
                  className={`resize-handle ${isResizing ? "resizing" : ""}`}
                  onMouseDown={handleMouseDown}
                >
                  <div className="resize-icon">
                    <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
                      <rect x="8" y="16" width="2.5" height="16" rx="1.25" fill="currentColor" opacity="0.7" />
                      <rect x="13.5" y="16" width="2.5" height="16" rx="1.25" fill="currentColor" opacity="0.7" />
                    </svg>
                  </div>
                </div>

                <ChatAssistant
                  customerProfileId={undefined}
                  aiAnalysisRequest={null}
                />
              </div>

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
                  {isExpanded && (
                    <div
                      className="collapse-hint"
                      style={{ right: `calc(${chatWidth}% + 2rem)` }}
                      onClick={() => {
                        setIsExpanded(false);
                        setChatWidth(23.2);
                        setTopOffset(3.267);
                      }}
                    >
                      <div className="collapse-hint-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M10 6L18 12L10 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4 6L12 12L4 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

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

          <CustomerListDialog
            visible={customerListVisible}
            onClose={() => setCustomerListVisible(false)}
            themeMode={themeClass === "dark-theme" ? "dark" : "light"}
            title="选择线索进行分配"
            isSelectable={true}
            onSelectionChange={handleSelectionChange}
            onBatchDistribute={handleBatchDistributeConfirm}
          />

          <MarketChannelAnalysisModal
            visible={channelAnalysisVisible}
            onClose={() => setChannelAnalysisVisible(false)}
            themeClass={themeClass}
            metricTitle={currentMetricTitle}
          />

          <MarketCoreMetricsModal
            visible={marketMetricsVisible}
            onClose={() => setMarketMetricsVisible(false)}
            themeClass={themeClass}
          />

          <AssignAdvisorModal
            visible={assignAdvisorVisible}
            selectedCount={1}
            isSingle={true}
            customerName={customerToAssign?.name || (customerToAssign as any)?.remarkName || "线索"}
            customerPhone={(customerToAssign as any)?.phone || "138****0000"}
            customerLevel={customerToAssign?.level || "B"}
            customerSource={customerToAssign?.source || "线上一类"}
            customerFollowUp={customerToAssign?.lastFollowUp ? `最近跟进于 ${customerToAssign?.lastFollowUp}` : "暂无跟进记录"}
            currentAdvisor={customerToAssign?.advisor || "未知顾问"}
            onCancel={() => {
              setAssignAdvisorVisible(false);
              setCustomerToAssign(null);
            }}
            onConfirm={(_advisorId, advisorName) => {
              notification.success({
                message: '重新分配成功',
                description: `线索 [${customerToAssign?.name || (customerToAssign as any)?.remarkName || "线索"}] 已成功重新分配给销售顾问 ${advisorName}。`,
                placement: 'topRight',
              });
              setAssignAdvisorVisible(false);
              if (assignSuccessCallback) {
                assignSuccessCallback();
              }
              setCustomerToAssign(null);
            }}
            themeMode={themeClass === "dark-theme" ? "dark" : "light"}
          />
        </div>
      </Layout>
    </ConfigProvider>
  );
};

export default Market;
