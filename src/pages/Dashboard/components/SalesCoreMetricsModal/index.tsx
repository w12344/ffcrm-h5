import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import PremiumModal from '@/components/PremiumModal';
import UniversalFunnelChart, { getGradientObj } from '@/components/UniversalFunnelChart';
import './index.less';

interface SalesCoreMetricsModalProps {
  visible: boolean;
  onClose: () => void;
  themeClass?: string;
}

const SalesCoreMetricsModal: React.FC<SalesCoreMetricsModalProps> = ({ visible, onClose, themeClass = '' }) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'workload'>('performance');

  // Mock Data
  const data = {
    leads: 1200,      // 总分配线索数
    customers: 650,   // 已建档客户数
    upgrades: 180,    // 进入升级池客户数
    deals: 20,        // 成交人数
    enrollments: 18,  // 实际入学人数
    refunds: 1,       // 退费客户数
    dropouts: 0       // 退学客户数
  };

  // Rates calculation
  const contactRate = (data.customers / data.leads) * 100;
  const activationRate = (data.upgrades / data.customers) * 100;
  const closingRate = (data.deals / data.upgrades) * 100;
  const enrollmentRate = (data.enrollments / data.deals) * 100;

  const refundRate = (data.refunds / data.deals) * 100;
  const dropoutRate = data.enrollments ? (data.dropouts / data.enrollments) * 100 : 0;

  const totalConversionRate = (data.enrollments / data.customers) * 100;
  const upgradeEnrollmentRate = (data.enrollments / data.upgrades) * 100;

  // Warning logic
  const warnings = {
    contact: contactRate < 60,
    activation: activationRate < 20,
    closing: closingRate < 15,
    enrollment: enrollmentRate < 95
  };

  // Pie Chart: Customer Grading
  const gradingOption = {
    tooltip: { trigger: 'item' },
    color: [
      getGradientObj('purple-pink', themeClass === 'dark-theme'),
      getGradientObj('blue-purple', themeClass === 'dark-theme'),
      getGradientObj('cyan-purple', themeClass === 'dark-theme'),
      getGradientObj('orange-pink', themeClass === 'dark-theme'),
      getGradientObj('green', themeClass === 'dark-theme')
    ],
    series: [
      {
        name: '客户分级',
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: {
          borderRadius: 10,
          borderColor: themeClass === 'dark-theme' ? '#1e293b' : '#fff',
          borderWidth: 2
        },
        data: [
          { value: 14570, name: 'X' },
          { value: 2631, name: 'B' },
          { value: 1548, name: 'A' },
          { value: 964, name: 'D' },
          { value: 187, name: 'C' }
        ]
      }
    ]
  };

  // Bar Chart: Communication Effectiveness
  const commOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' } },
    yAxis: {
      type: 'category',
      data: ['张三', '李四', '王五', '赵六', '孙七'],
      axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }
    },
    series: [
      {
        name: '有效比(%)',
        type: 'bar',
        data: [65.0, 58.9, 62.2, 51.8, 42.1],
        itemStyle: {
          color: getGradientObj('cyan-purple', themeClass === 'dark-theme', true),
          borderRadius: [0, 4, 4, 0]
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

  const SecondaryRateCard = ({ title, rate, desc }: any) => (
    <div className="secondary-rate-card">
      <div className="rate-title">{title}</div>
      <div className="rate-value">{rate.toFixed(1)}%</div>
      <div className="rate-desc">{desc}</div>
    </div>
  );

  // Workload mock data (Line chart)
  const workloadOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['03/27', '03/28', '03/29', '03/30', '03/31', '04/01', '04/02'],
      axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }
    },
    yAxis: {
      type: 'value',
      name: '字数',
      splitLine: { lineStyle: { type: 'dashed', color: themeClass === 'dark-theme' ? '#334155' : '#e2e8f0' } },
      axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }
    },
    series: [
      {
        name: '有效字数',
        type: 'line',
        smooth: true,
        data: [81388, 106905, 142343, 98765, 136271, 113357, 113974],
        itemStyle: { color: getGradientObj('blue-purple', themeClass === 'dark-theme', true) },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(79, 172, 254, 0.4)' }, // 蓝色渐变半透明
              { offset: 1, color: 'rgba(118, 75, 162, 0)' }
            ]
          }
        }
      }
    ]
  };

  return (
    <PremiumModal
      visible={visible}
      onClose={onClose}
      title="核心销售指标分析"
      showCancel={false}
      subtitle="CORE SALES METRICS"
      themeMode={themeClass === 'dark-theme' ? 'dark' : 'light'}
    >
      <div className="sales-metrics-modal-content">
        <div className="smm-tabs">
          <div className={`smm-tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>
            业绩转化维度
          </div>
          <div className={`smm-tab ${activeTab === 'workload' ? 'active' : ''}`} onClick={() => setActiveTab('workload')}>
            工作量维度
          </div>
        </div>

        {activeTab === 'performance' && (
          <div className="smm-grid">
            <div className="smm-card funnel-card">
              <div className="smm-card-header">五池转化漏斗</div>
              <div className="smm-card-body">
                <UniversalFunnelChart
                  data={funnelData}
                  themeMode={themeClass === 'dark-theme' ? 'dark' : 'light'}
                  colorSchemes={['purple-pink', 'blue-purple', 'cyan-purple', 'orange-pink', 'orange']}
                />
              </div>
            </div>

            <div className="smm-card rates-container">
              <div className="smm-card-header">核心四率监控</div>
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
                <SecondaryRateCard title="总体转化率" rate={totalConversionRate} desc="入学池 / 客户池" />
                <SecondaryRateCard title="升级入学转化率" rate={upgradeEnrollmentRate} desc="入学池 / 升级池" />
                <SecondaryRateCard title="退费率" rate={refundRate} desc="退费客户数 / 成交客户数" />
                <SecondaryRateCard title="退学率" rate={dropoutRate} desc="退学客户数 / 入学客户数" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workload' && (
          <div className="smm-grid workload-grid">
            <div className="smm-card">
              <div className="smm-card-header">有效工作量趋势 (字数)</div>
              <div className="smm-card-body">
                <ReactECharts option={workloadOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            <div className="smm-card">
              <div className="smm-card-header">沟通有效性 (近7日)</div>
              <div className="smm-card-body">
                <ReactECharts option={commOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            <div className="smm-card">
              <div className="smm-card-header">客户分级概况</div>
              <div className="smm-card-body">
                <ReactECharts option={gradingOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </PremiumModal>
  );
};

export default SalesCoreMetricsModal;
