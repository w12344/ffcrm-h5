import React, { useMemo, useState } from 'react';
import { ConfigProvider, Tooltip, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RightOutlined, AimOutlined } from '@ant-design/icons';

import { Layout } from '@/components/Layout';
import zhCN from 'antd/locale/zh_CN';
import DashboardHeader from '../Dashboard/components/DashboardHeader';
import { useTheme } from '@/hooks/useTheme';
import { ADVISORS, TIER_CONFIG, AdvisorData, HEADCOUNT_LEDGER, REVENUE_LEDGER, GLOBAL_FINANCIALS } from './constants/mockData';
import ChatAssistant from '../Dashboard/components/ChatAssistant';
import { ChatMessage } from '../Dashboard/types';
import { useBubbleFontScale } from './hooks/useBubbleFontScale';
import StrategicInsightModal from './components/StrategicInsightModal';
import ProductDetailModal from './components/ProductDetailModal';
import BossBusinessReportModal from './components/BossBusinessReportModal';
import BossDrillDownModal from './components/BossDrillDownModal';
import ExcelPreviewModal from './components/ExcelPreviewModal';
import ReactECharts from 'echarts-for-react';
import UniversalCircularChart from '@/components/UniversalCircularChart';
import KPICard from '@/components/KPICard';
import { KPICardProps } from '@/types/dashboard';
import { getAuthToken } from '@/utils/auth';
import { fetchOtherEmployees, fetchEmployeeToken } from '@/services/databoard';


import '@/components/KPICard/index.less';
import './index.less';

// --- jxBoss Galaxy Constants ---
const GALAXY_CONFIG = {
  RADII_PERCENT: [25, 35, 45],
  CONTAINER_WIDTH: 1200,
  X_SCALE: 1.0,
  Y_SCALE: 1.0,
};

const CENTER_PLANET_SIZE = {
  DEFAULT_VW: 16,
};

const PLANET_SIZE_CONFIG = {
  MIN_PERCENT_OF_CENTER: 25,
  MAX_PERCENT_OF_CENTER: 45,
};

// --- jxBoss Layout Engine ---
// revenueRank: 0 = highest revenue (closest to center), 1 = lowest revenue (farthest)
const calculateNebulaPosition = (index: number, _total: number, revenueRank: number) => {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  const minPercent = GALAXY_CONFIG.RADII_PERCENT[0] / 100;
  const maxPercent = GALAXY_CONFIG.RADII_PERCENT[GALAXY_CONFIG.RADII_PERCENT.length - 1] / 100;

  const coreRadius = GALAXY_CONFIG.CONTAINER_WIDTH * minPercent;
  const maxDistRadius = GALAXY_CONFIG.CONTAINER_WIDTH * maxPercent;

  // revenueRank 0→closest, 1→farthest
  const radiusRatio = Math.sqrt(revenueRank);
  const radius = coreRadius + (maxDistRadius - coreRadius) * radiusRatio;
  return { radius, angle };
};

const checkCollision = (x1: number, y1: number, s1: number, x2: number, y2: number, s2: number) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < (s1 + s2) / 2 + 35;
};

const adjustPosition = (x: number, y: number, size: number, placed: any[]) => {
  let ax = x, ay = y, attempts = 0;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  while (attempts < 80) {
    let collision = false;
    for (const p of placed) {
      if (checkCollision(ax, ay, size, p.x, p.y, p.size)) {
        collision = true; break;
      }
    }
    if (!collision) return { x: ax, y: ay };
    const r = Math.sqrt(ax * ax + ay * ay);
    const a = Math.atan2(ay, ax) + goldenAngle * 0.4;
    ax = Math.cos(a) * (r + 12);
    ay = Math.sin(a) * (r + 12);
    attempts++;
  }
  return { x: ax, y: ay };
};

// --- Sun Color (matches jxBoss tier colors) ---
const getSunBackground = (completionRate: number): string => {
  if (completionRate >= 110) return 'linear-gradient(135deg, #FD4895 0%, #C438EF 100%)';
  if (completionRate >= 100) return 'linear-gradient(135deg, #FFB929 0%, #FF7FB7 100%)';
  if (completionRate >= 90) return 'linear-gradient(135deg, #80FFB3 0%, #5283E2 100%)';
  return 'linear-gradient(35deg, #06D7F6 0%, #4807EA 100%)';
};

/**
 * 基于日均激活数排名计算等级：
 * 前10% -> A(优秀/红)，10%-30% -> B(保持/橙)，30%-60% -> C(预期/绿)，60%-100% -> D(预警/蓝)
 */
const calculateDynamicTier = (advisor: AdvisorData, allAdvisors: AdvisorData[]): 'A' | 'B' | 'C' | 'D' => {
  const sorted = [...allAdvisors].sort((a, b) => b.dailyActivation - a.dailyActivation);
  const rank = sorted.findIndex(a => a.id === advisor.id);
  const percentile = rank / sorted.length; // 0 = top, 1 = bottom
  if (percentile < 0.1) return 'A';  // 前10%
  if (percentile < 0.3) return 'B';  // 10%-30%
  if (percentile < 0.6) return 'C';  // 30%-60%
  return 'D';                         // 60%-100%
};

const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'A': return 'linear-gradient(135deg, #FD4895 0%, #C438EF 100%)';
    case 'B': return 'linear-gradient(135deg, #FFB929 0%, #FF7FB7 100%)';
    case 'C': return 'linear-gradient(135deg, #80FFB3 0%, #5283E2 100%)';
    case 'D': return 'linear-gradient(135deg, #06D7F6 0%, #4807EA 100%)';
    default: return 'linear-gradient(135deg, #9ca3af 0%, #cbd5e1 100%)';
  }
};




// =====================================================================
// 卡片一：大盘人头总账
// =====================================================================
const HeadcountLedgerCard: React.FC<{ timeDimension: 'year' | 'month' }> = ({ timeDimension }) => {
  const data = HEADCOUNT_LEDGER;
  const progressPercent = ((data.mainMetric.value / data.mainMetric.target) * 100).toFixed(1);
  const compareLabel = timeDimension === 'year' ? '年' : '月';

  const kpiProps: KPICardProps = {
    title: data.mainMetric.label,
    mainValue: `${data.mainMetric.value}${data.mainMetric.unit}`,
    mainChange: data.mainMetric.yoy.value,
    mainPercent: '',
    mainTrend: data.mainMetric.yoy.trend,
    compareLabel: compareLabel,
    subMetrics: [
      {
        title: data.salesFunnel.deposit.label,
        value: `${data.salesFunnel.deposit.value}`,
        change: data.salesFunnel.deposit.yoy.value,
        percent: '',
        trend: data.salesFunnel.deposit.yoy.trend,
        compareLabel: compareLabel
      },
      {
        title: data.salesFunnel.refund.label,
        value: `${data.salesFunnel.refund.value}`,
        change: data.salesFunnel.refund.yoy.value,
        percent: '',
        trend: data.salesFunnel.refund.yoy.trend,
        compareLabel: compareLabel
      },
      {
        title: data.deliveryFunnel.enrollment.label,
        value: `${data.deliveryFunnel.enrollment.value}`,
        change: data.deliveryFunnel.enrollment.yoy.value,
        percent: '',
        trend: data.deliveryFunnel.enrollment.yoy.trend,
        compareLabel: compareLabel
      },
      {
        title: data.deliveryFunnel.dropout.label,
        value: `${data.deliveryFunnel.dropout.value}`,
        change: data.deliveryFunnel.dropout.yoy.value,
        percent: '',
        trend: data.deliveryFunnel.dropout.yoy.trend,
        compareLabel: compareLabel
      }
    ],
    chartValue: `${progressPercent}%`,
    chartLabel: '目标完成率',
    chartColor: 'purple-pink', // 使用 Dashboard 统一的紫粉渐变
    chartType: 'circular',
    mainTarget: `${data.mainMetric.target}${data.mainMetric.unit}`,
    mainTargetLabel: '目标人数',
    subMetricsColumns: 2,
    showMainStatus: true
  };

  return (
    <div className="boss-headcount-card" style={{ position: 'relative', height: '100%' }}>
      <KPICard {...kpiProps} />
    </div>
  );
};

// =====================================================================
// 卡片二：金额总账
// =====================================================================
const RevenueLedgerCard: React.FC<{ timeDimension: 'year' | 'month' }> = ({ timeDimension }) => {
  const navigate = useNavigate();
  const data = REVENUE_LEDGER;
  const progressPercent = ((data.mainMetric.value / data.mainMetric.target) * 100).toFixed(1);
  const compareLabel = timeDimension === 'year' ? '年' : '月';

  const kpiProps: KPICardProps = {
    title: data.mainMetric.label,
    mainValue: `${data.mainMetric.value}${data.mainMetric.unit}`,
    mainChange: data.mainMetric.yoy.value,
    mainPercent: '',
    mainTrend: data.mainMetric.yoy.trend,
    compareLabel: compareLabel,
    subMetrics: [
      {
        title: data.collection.label,
        value: `${data.collection.value}${data.collection.unit}`,
        change: data.collection.yoy.value,
        percent: '',
        trend: data.collection.yoy.trend,
        compareLabel: compareLabel
      },
      {
        title: data.totalRefund.label,
        value: `${data.totalRefund.value}${data.totalRefund.unit}`,
        change: data.totalRefund.yoy.value,
        percent: '',
        trend: data.totalRefund.yoy.trend,
        compareLabel: compareLabel
      }
    ],
    chartValue: `${progressPercent}%`,
    chartLabel: '目标完成率',
    chartColor: 'blue-purple', // 保持蓝紫渐变
    chartType: 'circular',
    mainTarget: `${data.mainMetric.target}${data.mainMetric.unit}`,
    mainTargetLabel: '目标金额',
    subMetricsColumns: 2,
    showMainStatus: true
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Tooltip title="配置团队目标">
        <AimOutlined
          className="bl-config-icon"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            cursor: 'pointer',
            fontSize: '18px',
            color: 'var(--text-disabled)',
            transition: 'all 0.3s'
          }}
          onClick={() => navigate('/goal-setting')}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1890ff';
            e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-disabled)';
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}
        />
      </Tooltip>
      <KPICard {...kpiProps} />
    </div>
  );
};


const AdvisorInsight: React.FC<{ advisor: AdvisorData; onOpenReport: (advisorName: string) => void; timeDimension: 'year' | 'month' }> = ({ advisor, onOpenReport, timeDimension }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'ability'>('performance');

  const hexToRgba = (hex: string, opacity: number) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const getFunnelGradient = (tier: string, opacity: number) => {
    let start = '#1890ff', end = '#0050b3';
    if (tier === 'A') { start = '#FD4895'; end = '#C438EF'; }
    if (tier === 'B') { start = '#FFB929'; end = '#FF7FB7'; }
    if (tier === 'C') { start = '#80FFB3'; end = '#5283E2'; }
    if (tier === 'D') { start = '#06D7F6'; end = '#4807EA'; }

    return {
      type: 'linear',
      x: 0, y: 0, x2: 1, y2: 1,
      colorStops: [
        { offset: 0, color: hexToRgba(start, opacity) },
        { offset: 1, color: hexToRgba(end, opacity) }
      ]
    };
  };

  const funnelOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c}'
    },
    series: [
      {
        name: '过程转化',
        type: 'funnel',
        left: '5%',
        right: '5%',
        top: 5,
        bottom: 5,
        width: '90%',
        min: 0,
        max: advisor.pools?.leads || 100,
        minSize: '10%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}',
          color: '#fff',
          fontSize: 10,
          fontWeight: 'bold',
          textShadowColor: 'rgba(0,0,0,0.3)',
          textShadowBlur: 2
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
          borderRadius: 4
        },
        data: [
          { value: advisor.pools?.leads || 0, name: '线索池', itemStyle: { color: getFunnelGradient(advisor.tier, 1) } },
          { value: advisor.pools?.customers || 0, name: '客户池', itemStyle: { color: getFunnelGradient(advisor.tier, 0.85) } },
          { value: advisor.pools?.upgrades || 0, name: '升级池', itemStyle: { color: getFunnelGradient(advisor.tier, 0.7) } },
          { value: advisor.pools?.deals || 0, name: '成交池', itemStyle: { color: getFunnelGradient(advisor.tier, 0.55) } },
          { value: advisor.pools?.enrollments || 0, name: '入学池', itemStyle: { color: getFunnelGradient(advisor.tier, 0.4) } }
        ]
      }
    ]
  };

  const themeColor = getFunnelGradient(advisor.tier, 1).colorStops[0].color;
  const themeBg = getFunnelGradient(advisor.tier, 0.1).colorStops[0].color;

  const enrollmentTarget = advisor.activeCustomersTarget || Math.round(advisor.activeCustomers * 1.2); // Fallback if no target
  const enrollmentRate = Math.min((advisor.activeCustomers / enrollmentTarget) * 100, 100);

  // --- Radar Chart Logic ---
  const radarData = [
    Math.min(advisor.completionRate, 100),
    advisor.linkageRate || 0,
    Math.min(((advisor.newFriends || 0) / 20) * 100, 100),
    Math.min(((advisor.communicationWords || 0) / 15) * 100, 100),
    100 - (advisor.refundRate || 0)
  ].map(v => Math.round(v));

  const getRadarType = () => {
    const [performance, conversion, leadGen, comms, service] = radarData;
    if (performance >= 70 && conversion >= 70 && leadGen >= 70 && comms >= 70 && service >= 70) return '均衡型';
    if (leadGen > conversion && leadGen > comms) return '攻坚型';
    if (conversion > leadGen && conversion > comms) return '转化型';
    if (comms > leadGen && comms > conversion) return '服务型';
    return '进取型';
  };

  const radarOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'var(--border-lighter)',
      textStyle: { color: 'var(--text-primary)' },
      formatter: (params: any) => {
        const val = params.value;
        return `
          <div style="font-weight:bold;margin-bottom:4px;color:${themeColor}">综合能力评估</div>
          <div>业绩达成：${val[0]}</div>
          <div>转化能力：${val[1]}</div>
          <div>拓客能力：${val[2]}</div>
          <div>沟通活跃：${val[3]}</div>
          <div>服务风控：${val[4]}</div>
        `;
      }
    },
    radar: {
      indicator: [
        { name: '业绩达成', max: 100 },
        { name: '转化能力', max: 100 },
        { name: '拓客能力', max: 100 },
        { name: '沟通活跃', max: 100 },
        { name: '服务风控', max: 100 }
      ],
      radius: '60%',
      center: ['50%', '55%'],
      splitNumber: 4,
      shape: 'polygon',
      axisName: {
        color: '#000',
        fontSize: 11,
        fontWeight: 600
      },
      splitArea: {
        areaStyle: {
          color: [
            hexToRgba(themeColor, 0.02),
            hexToRgba(themeColor, 0.04),
            hexToRgba(themeColor, 0.06),
            hexToRgba(themeColor, 0.08)
          ],
          shadowColor: 'rgba(0, 0, 0, 0.02)',
          shadowBlur: 10
        }
      },
      axisLine: { lineStyle: { color: hexToRgba(themeColor, 0.2) } },
      splitLine: { lineStyle: { color: hexToRgba(themeColor, 0.2) } }
    },
    series: [
      {
        name: '能力维度',
        type: 'radar',
        data: [
          {
            value: radarData,
            name: '综合能力评估',
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: { color: themeColor, borderColor: '#fff', borderWidth: 2 },
            areaStyle: {
              color: {
                type: 'radial',
                x: 0.5, y: 0.5, r: 0.5,
                colorStops: [
                  { offset: 0, color: hexToRgba(themeColor, 0.6) },
                  { offset: 1, color: hexToRgba(themeColor, 0.1) }
                ]
              }
            },
            lineStyle: { color: themeColor, width: 2 }
          }
        ]
      }
    ]
  };

  return (
    <div className="boss-advisor-insight-modal">
      <div className="baim-header">
        <div className="baim-title-row">
          <div className="baim-name-wrapper">
            <span className="baim-title" style={{ color: '#000' }}>{advisor.name}</span>
            <span className="baim-tier-badge" style={{ background: themeBg, color: themeColor }}>
              {calculateDynamicTier(advisor, ADVISORS)}级
            </span>
          </div>
          <div className="baim-actions">
            <div className="baim-growth-badge" style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '10px',
              background: advisor.revenueGrowth >= 0 ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
              color: advisor.revenueGrowth >= 0 ? '#52c41a' : '#ff4d4f',
              fontWeight: '600'
            }}>
              营收{timeDimension === 'year' ? '同比' : '环比'} {advisor.revenueGrowth >= 0 ? '+' : ''}{advisor.revenueGrowth}%
            </div>
            <div className="baim-detail-btn" onClick={(e) => { e.stopPropagation(); onOpenReport(advisor.name); }}>
              <span className="baim-db-text" style={{ color: '#000' }}>数据明细</span>
              <RightOutlined className="baim-db-icon" style={{ color: '#000' }} />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="baim-tabs">
          <div
            className={`baim-tab-item ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setActiveTab('performance'); }}
            style={{ '--tab-color': '#000', color: '#000' } as React.CSSProperties}
          >
            业务达成
          </div>
          <div
            className={`baim-tab-item ${activeTab === 'ability' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setActiveTab('ability'); }}
            style={{ '--tab-color': '#000', color: '#000' } as React.CSSProperties}
          >
            能力模型
          </div>
        </div>
      </div>

      <div className="baim-content">
        {activeTab === 'performance' && (
          <div className="baim-tab-content-performance">
            {/* 双进度环形卡片布局 */}
            <div className="baim-progress-dual-rings">
              <div className="baim-ring-item">
                <div className="baim-ring-circle" style={{ width: '54px', height: '54px', position: 'relative' }}>
                  <UniversalCircularChart
                    mode="single"
                    value={`${advisor.completionRate.toFixed(0)}%`}
                    label="完成率"
                    colorScheme="custom"
                    customColors={[
                      { offset: 0, color: themeColor },
                      { offset: 1, color: themeColor }
                    ]}
                  />
                </div>
                <div className="baim-ring-info">
                  <div className="baim-ring-title" style={{ color: '#000' }}>营收完成 (w)</div>
                  <div className="baim-ring-data">
                    <span className="current" style={{ color: '#000' }}>¥{(advisor.revenue / 10000).toFixed(1)}</span>
                    <span className="target" style={{ color: '#000' }}>/ ¥{((advisor.revenue / 10000) / (advisor.completionRate / 100)).toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="baim-ring-divider"></div>
              <div className="baim-ring-item">
                <div className="baim-ring-circle" style={{ width: '54px', height: '54px', position: 'relative' }}>
                  <UniversalCircularChart
                    mode="single"
                    value={`${enrollmentRate.toFixed(0)}%`}
                    label="达成率"
                    colorScheme="custom"
                    customColors={[
                      { offset: 0, color: '#52c41a' },
                      { offset: 1, color: '#52c41a' }
                    ]}
                  />
                </div>
                <div className="baim-ring-info">
                  <div className="baim-ring-title" style={{ color: '#000' }}>净招生 (人)</div>
                  <div className="baim-ring-data">
                    <span className="current" style={{ color: '#000' }}>{advisor.activeCustomers}</span>
                    <span className="target" style={{ color: '#000' }}>/ {enrollmentTarget}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 沟通有效性与转化漏斗过程指标 - 左右紧凑布局 */}
            <div className="baim-process-panel compact" style={{ marginTop: '0' }}>
              <div className="baim-pp-header">
                <span className="baim-pp-h-title" style={{ color: '#000' }}>销售转化漏斗与沟通指标</span>
              </div>
              <div className="baim-pp-body">
                <div className="baim-pp-funnel-wrap">
                  <ReactECharts option={funnelOption} style={{ height: '130px', width: '100%' }} opts={{ renderer: 'svg' }} />
                </div>
                <div className="baim-pp-metrics-wrap">
                  <div className="baim-pp-grid-2x2">
                    <div className="baim-pp-chat-item">
                      <div className="baim-pp-chat-val" style={{ color: '#000' }}>{advisor.communicationWords.toFixed(1)}<span style={{ color: '#000' }}>w</span></div>
                      <div className="baim-pp-chat-lbl" style={{ color: '#000' }}>沟通量(字)</div>
                    </div>
                    <div className="baim-pp-chat-item">
                      <div className="baim-pp-chat-val" style={{ color: '#000' }}>{advisor.effectiveDialogues}</div>
                      <div className="baim-pp-chat-lbl" style={{ color: '#000' }}>有效对话</div>
                    </div>
                    <div className="baim-pp-chat-item">
                      <div className="baim-pp-chat-val" style={{ color: '#000' }}>{advisor.contactedCustomers}</div>
                      <div className="baim-pp-chat-lbl" style={{ color: '#000' }}>接触客数</div>
                    </div>
                    <div className="baim-pp-chat-item">
                      <div className="baim-pp-chat-val" style={{ color: '#000' }}>{advisor.newFriends}</div>
                      <div className="baim-pp-chat-lbl" style={{ color: '#000' }}>新加好友</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部详细指标块 - 紧凑横向 */}
            <div className="baim-bottom-compact">
              <div className="baim-bc-item">
                <div className="baim-bc-val" style={{ color: '#000' }}>¥{(advisor.refundAmount / 10000).toFixed(1)}w</div>
                <div className="baim-bc-lbl" style={{ color: '#000' }}>退费总额</div>
              </div>
              <div className="baim-bc-item">
                <div className="baim-bc-val" style={{ color: '#000' }}>¥{(advisor.outstanding / 10000).toFixed(1)}w</div>
                <div className="baim-bc-lbl" style={{ color: '#000' }}>个人待收款</div>
              </div>
              <div className="baim-bc-item highlight">
                <div className="baim-bc-val" style={{ color: '#000' }}>{advisor.linkageRate}%</div>
                <div className="baim-bc-lbl" style={{ color: '#000' }}>当周上门成交率</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ability' && (
          <div className="baim-tab-content-ability">
            <div className="baim-radar-header">
              <span className="baim-rh-title" style={{ color: '#000' }}>综合能力评估</span>
              <span className="baim-rh-type" style={{ color: themeColor, background: hexToRgba(themeColor, 0.1) }}>{getRadarType()}</span>
            </div>
            <div className="baim-radar-container">
              <ReactECharts option={radarOption} style={{ height: '260px', width: '100%' }} opts={{ renderer: 'svg' }} />
            </div>
            <div className="baim-radar-desc" style={{ color: '#000' }}>
              根据该员工近期的“业绩、转化、拓客、沟通、风控”五个核心维度进行的综合模型分析。
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// const BossSidebar: React.FC = () => {
//   // Sort advisors by revenue for leaderboard
//   const topAdvisors = [...ADVISORS].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
//
//   return (
//     <div className="boss-right-sidebar">
//       <div className="sidebar-module warnings-module">
//         <div className="module-title">
//           <span className="icon">⚠️</span> 待办预警 (今日必须跟进)
//         </div>
//         <div className="warning-list">
//           {WARNINGS.map((warn, i) => (
//             <div key={i} className={`warning-item type-${warn.type}`}>
//               <div className="w-advisor">{warn.advisor}</div>
//               <div className="w-text">{warn.text}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//
//       <div className="sidebar-module channel-module">
//         <div className="module-title">
//           <span className="icon">🎯</span> 细分渠道成交率 (市场子弹)
//         </div>
//         <div className="channel-list">
//           {CHANNELS_CONVERSION.map((ch, i) => (
//             <div key={i} className="channel-item">
//               <div className="ch-info">
//                 <span className="ch-name">{ch.name}</span>
//                 <span className="ch-leads">{ch.leads} 线索</span>
//               </div>
//               <div className="ch-rate">
//                 {ch.rate}%
//                 {ch.trend === 'up' ? <span className="trend up">↑</span> : <span className="trend down">↓</span>}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//
//       <div className="sidebar-module leaderboard-module">
//         <div className="module-title">
//           <span className="icon">🏆</span> 营收龙虎榜 (鞭策刺激)
//         </div>
//         <div className="leaderboard-list">
//           {topAdvisors.map((adv, i) => (
//             <div key={adv.id} className="lb-item">
//               <div className={`lb-rank rank-${i + 1}`}>#{i + 1}</div>
//               <div className="lb-name">{adv.name}</div>
//               <div className="lb-val">{(adv.revenue / 10000).toFixed(1)}w</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

const BossDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const themeClass = isDark ? 'dark-theme' : 'light-theme';
  const [isStrategicModalVisible, setIsStrategicModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isExcelPreviewVisible, setIsExcelPreviewVisible] = useState(false);
  const [reportSearchName, setReportSearchName] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [drillDownProduct, setDrillDownProduct] = useState<string | null>(null);
  const [timeDimension, setTimeDimension] = useState<'year' | 'month'>('year');

  // Font scale hook with 'M' curve, 12px min, 32px max
  const { getFontSize } = useBubbleFontScale({ curve: 'M', minFontSize: 12, maxFontSize: 32 });

  const handlePlanetClick = async (p: any) => {
    const hide = message.loading('正在跳转中...', 0);
    try {
      const res = await fetchOtherEmployees();
      const employees = res.data?.data || [];
      const employee = employees.find(e => e.employeeName === p.name);

      if (employee) {
        const tokenRes = await fetchEmployeeToken(employee.employeeId);
        const token = tokenRes.data?.data;
        if (token) {
          const { origin, pathname } = window.location;
          const targetUrl = `${origin}${pathname}#/dashboard?token=${token}&employeeName=${encodeURIComponent(employee.employeeName)}&employeeId=${employee.employeeId}`;
          hide();
          window.open(targetUrl, '_blank');
          return;
        }
      }

      // Fallback
      const fallbackToken = getAuthToken() || '';
      const targetUrl = `/#/dashboard?token=${encodeURIComponent(fallbackToken)}&employeeName=${encodeURIComponent(p.name)}&employeeId=${p.id}`;
      hide();
      window.open(targetUrl, '_blank');
    } catch (error) {
      console.error('Failed to navigate to dashboard:', error);
      const fallbackToken = getAuthToken() || '';
      const targetUrl = `/#/dashboard?token=${encodeURIComponent(fallbackToken)}&employeeName=${encodeURIComponent(p.name)}&employeeId=${p.id}`;
      hide();
      window.open(targetUrl, '_blank');
    }
  };

  const bossMessages: ChatMessage[] = useMemo(() => [
    {
      id: 1,
      sender: 'VanAI',
      time: '09:00',
      content: '', // content is handled by custom component
      type: 'boss-daily-report',
      isBot: true,
    }
  ], []);

  const planets = useMemo(() => {
    const placed: any[] = [];
    const centerSizePx = CENTER_PLANET_SIZE.DEFAULT_VW * 18;

    return ADVISORS.map((advisor, idx) => {
      const val = advisor.commission;
      const minVal = Math.min(...ADVISORS.map(a => a.commission));
      const maxVal = Math.max(...ADVISORS.map(a => a.commission));

      const percentOfCenter = PLANET_SIZE_CONFIG.MIN_PERCENT_OF_CENTER +
        ((val - minVal) / (maxVal - minVal || 1)) * (PLANET_SIZE_CONFIG.MAX_PERCENT_OF_CENTER - PLANET_SIZE_CONFIG.MIN_PERCENT_OF_CENTER);

      const size = (percentOfCenter / 100) * centerSizePx;

      // 销售金额越高越靠近中心：revenue 排名转为 0(最高)~1(最低)
      const sortedByRevenue = [...ADVISORS].sort((a, b) => b.revenue - a.revenue);
      const revenueRankIndex = sortedByRevenue.findIndex(a => a.id === advisor.id);
      const revenueRank = (revenueRankIndex + 1) / (ADVISORS.length + 1);

      const { radius, angle } = calculateNebulaPosition(idx, ADVISORS.length, revenueRank);

      let x = Math.cos(angle) * radius * GALAXY_CONFIG.X_SCALE;
      let y = Math.sin(angle) * radius * GALAXY_CONFIG.Y_SCALE;

      const adjusted = adjustPosition(x, y, size, placed);
      placed.push({ ...adjusted, size });

      const xP = (adjusted.x / GALAXY_CONFIG.CONTAINER_WIDTH) * 100;
      const yP = (adjusted.y / GALAXY_CONFIG.CONTAINER_WIDTH) * 100;

      const diameterVW = (percentOfCenter / 100) * CENTER_PLANET_SIZE.DEFAULT_VW;

      const dynamicTier = calculateDynamicTier(advisor, ADVISORS);

      return {
        ...advisor,
        tier: dynamicTier,
        diameterVW, // Store the diameter for dynamic font size calculation
        style: {
          left: `calc(50% + ${xP}%)`,
          top: `calc(50% + ${yP}%)`,
          width: `${diameterVW}vw`,
          height: `${diameterVW}vw`,
          '--float-x': `${(Math.sin(idx) * 12).toFixed(1)}px`,
          '--float-y': `${(Math.cos(idx) * 12).toFixed(1)}px`,
          '--duration': `${(6 + (idx % 4) * 2).toFixed(1)}s`,
          '--delay': `${(idx * 0.1).toFixed(1)}s`,
          '--tier-color': getTierColor(dynamicTier),
        } as React.CSSProperties
      };
    });
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <Layout>
        <div className={`dashboard boss-dashboard-v3 ${themeClass}`}>
          <DashboardHeader
            timeDimension={timeDimension}
            onTimeDimensionChange={setTimeDimension}
          />

          <div className="boss-main-layout">
            <div className="boss-left-column">
              {/* 大盘指标概览顶栏 */}



              <div className="boss-stats-header" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
                <HeadcountLedgerCard timeDimension={timeDimension} />
                <RevenueLedgerCard timeDimension={timeDimension} />
              </div>



              <div className="jx-galaxies-wrapper">
                {/* --- Galaxy Legend (Soft Glass HUD) --- */}
                <div className="boss-galaxy-legend">
                  <div className="legend-items">
                    {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG[keyof typeof TIER_CONFIG]][]).map(([key, cfg]) => (
                      <div key={key} className="legend-item">
                        <div className="legend-dot" style={{ background: cfg.bg }}></div>
                        <div className="legend-text">
                          <span className="legend-label">{cfg.label}</span>
                          <span className="legend-range">{cfg.range}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Center Sphere: 大盘总营收达成率 - 老板最关心的"钱袋子" */}
                <div className="jx-sun-wrapper" onClick={() => setIsStrategicModalVisible(true)} style={{ cursor: 'pointer' }}>
                  <div className="jx-sun-core" style={{
                    background: getSunBackground(GLOBAL_FINANCIALS.cash.percent),
                    fontSize: `calc(min(${(CENTER_PLANET_SIZE.DEFAULT_VW * 0.778).toFixed(3)}vw, ${(CENTER_PLANET_SIZE.DEFAULT_VW * 0.778 * 1.8).toFixed(3)}vh) * 0.05)`,
                    '--dynamic-font-name': `${getFontSize(CENTER_PLANET_SIZE.DEFAULT_VW) * 0.8}px`,
                    '--dynamic-font-val': `${getFontSize(CENTER_PLANET_SIZE.DEFAULT_VW) * 1.4}px`
                  } as React.CSSProperties}>
                    <div className="sun-content">
                      {/* Row 1: Revenue Metrics */}
                      <div className="sun-metric-row revenue">
                        <div className="sun-label">{timeDimension === 'year' ? '年度' : '月度'}总营收达成率</div>
                        <div className="sun-value">
                          {GLOBAL_FINANCIALS.cash.percent}
                          <small>%</small>
                        </div>
                        <div className="sun-sub-text">
                          {GLOBAL_FINANCIALS.cash.value}{GLOBAL_FINANCIALS.cash.unit} / 680万元
                        </div>
                      </div>

                      {/* Tactical Divider */}
                      <div className="sun-divider">
                        <div className="divider-line" />
                        <div className="divider-node" />
                        <div className="divider-line" />
                      </div>

                      {/* Row 2: Enrollment Metrics */}
                      <div className="sun-metric-row enrollment">
                        <div className="sun-label">总净招生人数</div>
                        <div className="sun-value-pill">
                          <span className="val-main">{GLOBAL_FINANCIALS.growth.value}</span>
                          <span className="val-sep">/</span>
                          <span className="val-target">{GLOBAL_FINANCIALS.growth.target}</span>
                          <span className="val-unit">人</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="jx-sun-halo" />
                </div>



                {/* Planets (Advisors) */}
                  {planets.map((p) => (
                    <Tooltip key={p.id} title={<AdvisorInsight advisor={p} timeDimension={timeDimension} onOpenReport={(name) => {
                      setReportSearchName(name);
                      setIsExcelPreviewVisible(true);
                    }} />} color="transparent" overlayInnerStyle={{ width: '390px', padding: 0, background: 'transparent', boxShadow: 'none' }} overlayClassName={`jx-planet-tooltip-overlay ${themeClass}`}>
                    <div
                      className={`jx-planet-item tier-${p.tier}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanetClick(p);
                      }}
                      style={{
                        left: p.style.left,
                        top: p.style.top,
                        width: p.style.width,
                        height: p.style.height,
                        fontSize: `${p.diameterVW * 0.12}vw`,
                        '--dynamic-font-name': `${getFontSize(p.diameterVW)}px`,
                        '--dynamic-font-val': `${getFontSize(p.diameterVW) * 1.2}px`
                      } as React.CSSProperties}>
                      <div className="planet-float-wrapper" style={{
                        '--float-x': (p.style as any)['--float-x'],
                        '--float-y': (p.style as any)['--float-y'],
                        '--duration': (p.style as any)['--duration'],
                        '--delay': (p.style as any)['--delay'],
                        '--tier-color': (p.style as any)['--tier-color'],
                      } as React.CSSProperties}>
                        <div className="planet-core">
                          {/* 进度环 - 基于 completionRate */}
                          <svg
                            style={{
                              position: 'absolute',
                              top: '-8%',
                              left: '-8%',
                              width: '116%',
                              height: '116%',
                              transform: 'rotate(-90deg)',
                              pointerEvents: 'none',
                              zIndex: 1,
                              overflow: 'visible',
                            }}
                            viewBox="0 0 100 100"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="46"
                              fill="none"
                              stroke="rgba(255, 255, 255, 0.25)"
                              strokeWidth="2.5"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="46"
                              fill="none"
                              stroke={
                                p.tier === 'A' ? '#C438EF' :
                                  p.tier === 'B' ? '#FFB929' :
                                    p.tier === 'C' ? '#5283E2' :
                                      '#06D7F6'
                              }
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 46}`}
                              strokeDashoffset={`${2 * Math.PI * 46 * (1 - Math.min((p.completionRate || 0) / 100, 1))}`}
                              style={{
                                transition: 'stroke-dashoffset 0.6s ease-out',
                              }}
                            />
                          </svg>

                          <div className="planet-mini-info">
                            <div className="pmi-left">
                              {Math.round(p.commission / 10000)}
                            </div>
                            <div className="pmi-divider"></div>
                            <div className="pmi-right">
                              <div className="pmi-right-top">
                                {Math.round(p.revenue / 10000)}
                              </div>
                              <div className="pmi-right-bottom">
                                {p.transactions}
                              </div>
                            </div>
                          </div>
                          <div className="pmi-name">{p.name}</div>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Boss Right Panel replaces ChatAssistant */}
            {/* <BossSidebar /> */}
            <div className="chat-section">
              <ChatAssistant initialMessages={bossMessages} />
            </div>
          </div>
        </div>

        <StrategicInsightModal
          visible={isStrategicModalVisible}
          onClose={() => setIsStrategicModalVisible(false)}
          themeClass={themeClass}
        />

        <ProductDetailModal
          visible={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          themeClass={themeClass}
        />

        <BossBusinessReportModal
          visible={isReportModalVisible}
          onClose={() => setIsReportModalVisible(false)}
          themeClass={themeClass}
        />

        <ExcelPreviewModal
          visible={isExcelPreviewVisible}
          onClose={() => {
            setIsExcelPreviewVisible(false);
            setReportSearchName('');
          }}
          themeClass={themeClass}
          searchText={reportSearchName}
        />

        <BossDrillDownModal
          visible={!!drillDownProduct}
          onClose={() => setDrillDownProduct(null)}
          productName={drillDownProduct || ''}
          themeClass={themeClass}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default BossDashboard;
