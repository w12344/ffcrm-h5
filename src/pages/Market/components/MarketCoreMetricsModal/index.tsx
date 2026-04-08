import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import PremiumModal from '@/components/PremiumModal';
import UniversalFunnelChart, { getGradientObj } from '@/components/UniversalFunnelChart';
import './index.less';

interface MarketCoreMetricsModalProps {
  visible: boolean;
  onClose: () => void;
  themeClass?: string;
}

const MarketCoreMetricsModal: React.FC<MarketCoreMetricsModalProps> = ({ visible, onClose, themeClass = '' }) => {
  const [activeTab, setActiveTab] = useState<'conversion' | 'channel'>('conversion');

  // Market specific mock Data mapped to Sales funnel
  const data = {
    leads: 1200,      // 总分配线索数
    customers: 650,   // 已建档客户数
    upgrades: 180,    // 进入升级池客户数
    deals: 20,        // 成交人数
    enrollments: 18   // 实际入学人数
  };

  // Rates calculation
  const contactRate = (data.customers / data.leads) * 100;
  const activationRate = (data.upgrades / data.customers) * 100;
  const closingRate = (data.deals / data.upgrades) * 100;
  const enrollmentRate = (data.enrollments / data.deals) * 100;

  // Warning logic
  const warnings = {
    contact: contactRate < 60,
    activation: activationRate < 20,
    closing: closingRate < 15,
    enrollment: enrollmentRate < 95
  };

  // Pie Chart: Channel Distribution
  const channelOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const { name, value, percent, data } = params;
        return `
          <div style="font-weight:bold;margin-bottom:4px;">${name}</div>
          线索量: ${value} (${percent}%)<br/>
          建联量: ${data.contactVolume}<br/>
          建联率: ${data.contactRate}%
        `;
      }
    },
    color: [
      getGradientObj('purple-pink', themeClass === 'dark-theme'),
      getGradientObj('blue-purple', themeClass === 'dark-theme'),
      getGradientObj('cyan-purple', themeClass === 'dark-theme'),
      getGradientObj('orange-pink', themeClass === 'dark-theme'),
      getGradientObj('green', themeClass === 'dark-theme')
    ],
    series: [
      {
        name: '线索渠道',
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: {
          borderRadius: 10,
          borderColor: themeClass === 'dark-theme' ? '#1e293b' : '#fff',
          borderWidth: 2
        },
        data: [
          { value: 450, name: '小红书', contactVolume: 315, contactRate: 70 },
          { value: 350, name: '抖音', contactVolume: 210, contactRate: 60 },
          { value: 200, name: '朋友圈', contactVolume: 160, contactRate: 80 },
          { value: 150, name: '百度搜索', contactVolume: 75, contactRate: 50 },
          { value: 50, name: '线下活动', contactVolume: 45, contactRate: 90 }
        ]
      }
    ]
  };

  // Bar Chart: Channel Conversion Rate Ranking
  const conversionOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>成交转化率: {c}%' },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }, name: '%' },
    yAxis: {
      type: 'category',
      data: ['百度搜索', '朋友圈', '抖音', '小红书', '线下活动'],
      axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }
    },
    series: [
      {
        name: '成交转化率',
        type: 'bar',
        data: [1.5, 2.1, 2.8, 3.5, 4.2],
        itemStyle: {
          color: getGradientObj('orange-pink', themeClass === 'dark-theme', true),
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b'
        }
      }
    ]
  };

  const funnelData = [
    { value: data.leads, name: '线索池' },
    { value: data.customers, name: '客户池' },
    { value: data.upgrades, name: '升级池' },
    { value: data.deals, name: '成交池' },
    { value: data.enrollments, name: '入学池' }
  ];

  const RateCard = ({ title, rate, threshold, warning, warningMsg, desc }: any) => {
    const isWarning = warning;
    return (
      <div className={`rate-card ${isWarning ? 'warning' : ''}`}>
        <div className="rate-header">
          <span className="rate-title">{title}</span>
          {isWarning && <span className="warning-badge">预警</span>}
        </div>
        <div className="rate-value-container">
          <span className={`rate-value ${isWarning ? 'text-red' : 'text-green'}`}>
            {rate.toFixed(1)}%
          </span>
          <span className="rate-threshold">目标 &ge; {threshold}%</span>
        </div>
        <div className="rate-desc">{desc}</div>
        {isWarning && <div className="rate-warning-msg">原因分析: {warningMsg}</div>}
      </div>
    );
  };

  const SecondaryRateCard = ({ title, value, desc, isCurrency = false }: any) => (
    <div className="secondary-rate-card">
      <div className="rate-title">{title}</div>
      <div className="rate-value">{isCurrency ? `￥${value}` : value}</div>
      <div className="rate-desc">{desc}</div>
    </div>
  );

  // Connection Trend Data based on time range (Line chart)
  const connectionTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['顾问A', '顾问B', '顾问C'],
      textStyle: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' },
      top: 0
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['03/27', '03/28', '03/29', '03/30', '03/31', '04/01', '04/02'],
      axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }
    },
    yAxis: {
      type: 'value',
      name: '建联量(人)',
      splitLine: { lineStyle: { type: 'dashed', color: themeClass === 'dark-theme' ? '#334155' : '#e2e8f0' } },
      axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }
    },
    series: [
      {
        name: '顾问A',
        type: 'line',
        smooth: true,
        data: [12, 15, 14, 18, 22, 16, 19],
        itemStyle: { color: getGradientObj('blue-purple', themeClass === 'dark-theme', true) }
      },
      {
        name: '顾问B',
        type: 'line',
        smooth: true,
        data: [10, 12, 16, 15, 18, 20, 17],
        itemStyle: { color: getGradientObj('orange-pink', themeClass === 'dark-theme', true) }
      },
      {
        name: '顾问C',
        type: 'line',
        smooth: true,
        data: [8, 9, 11, 14, 13, 15, 18],
        itemStyle: { color: getGradientObj('cyan-purple', themeClass === 'dark-theme', true) }
      }
    ]
  };

  return (
    <PremiumModal
      visible={visible}
      onClose={onClose}
      title="核心市场指标分析"
      showCancel={false}
      subtitle="CORE MARKET METRICS"
      themeMode={themeClass === 'dark-theme' ? 'dark' : 'light'}
    >
      <div className="market-metrics-modal-content">
        <div className="mmm-tabs">
          <div className={`mmm-tab ${activeTab === 'conversion' ? 'active' : ''}`} onClick={() => setActiveTab('conversion')}>
            线索转化维度
          </div>
          <div className={`mmm-tab ${activeTab === 'channel' ? 'active' : ''}`} onClick={() => setActiveTab('channel')}>
            渠道效能维度
          </div>
        </div>

        {activeTab === 'conversion' && (
          <div className="mmm-grid">
            <div className="mmm-card funnel-card">
              <div className="mmm-card-header">五池四率分析</div>
              <div className="mmm-card-body">
                <UniversalFunnelChart
                  data={funnelData}
                  themeMode={themeClass === 'dark-theme' ? 'dark' : 'light'}
                  colorSchemes={['purple-pink', 'blue-purple', 'cyan-purple', 'orange-pink', 'orange']}
                />
              </div>
            </div>

            <div className="mmm-card rates-container">
              <div className="mmm-card-header">核心四率监控</div>
              <div className="four-rates-grid">
                <RateCard
                  title="建联率" rate={contactRate} threshold={60} warning={warnings.contact}
                  warningMsg="顾问执行力不足" desc="已建档客户数 / 总分配线索数"
                />
                <RateCard
                  title="激活率" rate={activationRate} threshold={20} warning={warnings.activation}
                  warningMsg="跟进内容无价值" desc="进入升级池客户数 / 客户池总数"
                />
                <RateCard
                  title="成交率" rate={closingRate} threshold={15} warning={warnings.closing}
                  warningMsg="临门一脚能力弱" desc="成交人数 / 升级池总数"
                />
                <RateCard
                  title="入学率" rate={enrollmentRate} threshold={95} warning={warnings.enrollment}
                  warningMsg="交付风险高" desc="实际入学人数 / 交费人数"
                />
              </div>

              <div className="secondary-rates-grid">
                <SecondaryRateCard title="总线索数" value={850} desc="录入线索总量" />
                <SecondaryRateCard title="获客总成本" value={158000} desc="本年度市场投放总消耗" isCurrency />
                <SecondaryRateCard title="平均获客成本 (CPA)" value={131} desc="总成本 / 留资线索数" isCurrency />
                <SecondaryRateCard title="成单单客成本 (CPS)" value={8777} desc="总成本 / 最终成交数" isCurrency />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'channel' && (
          <div className="mmm-grid channel-grid">
            <div className="mmm-card">
              <div className="mmm-card-header">各顾问建联趋势</div>
              <div className="mmm-card-body">
                <ReactECharts option={connectionTrendOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            <div className="mmm-card">
              <div className="mmm-card-header">各渠道成交率排行</div>
              <div className="mmm-card-body">
                <ReactECharts option={conversionOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            <div className="mmm-card">
              <div className="mmm-card-header">获客渠道占比</div>
              <div className="mmm-card-body">
                <ReactECharts option={channelOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </PremiumModal>
  );
};

export default MarketCoreMetricsModal;
