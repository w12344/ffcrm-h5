import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import PremiumModal from '@/components/PremiumModal';
import { HEADCOUNT_LEDGER, REVENUE_LEDGER, PRODUCT_LINE_MATRIX, ADVISORS } from '../../constants/mockData';
import './index.less';

interface StrategicInsightModalProps {
  visible: boolean;
  onClose: () => void;
  themeClass?: string;
}

const StrategicInsightModal: React.FC<StrategicInsightModalProps> = ({ visible, onClose, themeClass = '' }) => {
  const [revenueTab, setRevenueTab] = useState<'overview' | 'ranking'>('overview');
  const [funnelTab, setFunnelTab] = useState<'sales' | 'company'>('sales');
  // 统一提取的渐变色配置，参考个人中心的配色风格
  const getGradient = (colorStart: string, colorEnd: string, isHorizontal: boolean = true) => ({
    type: 'linear',
    x: 0,
    y: 0,
    x2: isHorizontal ? 1 : 0,
    y2: isHorizontal ? 0 : 1,
    colorStops: [
      { offset: 0, color: colorStart },
      { offset: 1, color: colorEnd }
    ]
  });

  // 常用的渐变色对
  const gradients = {
    purple: { start: '#9013FE', end: '#B35AFE' }, // 紫色系 (技术/物理)
    orange: { start: '#E9A55E', end: '#F4C184' }, // 橙色系 (政治)
    blue: { start: '#4D6BB4', end: '#6A89CC' },   // 蓝色系 (通用)
    cyan: { start: '#2A9D8F', end: '#4DBBAE' },   // 青色系 (数学)
    pink: { start: '#E44887', end: '#F075A6' },   // 粉色系 (地理)
    green: { start: '#50E3C2', end: '#78EAD1' },  // 浅绿色 (化学)
    red: { start: '#F27B67', end: '#F69F90' }     // 红色系 (历史)
  };

  // Chart 1: 核心营收指标对比 (Actual Revenue vs Target)
  // 根据 mockData.ts 中的 REVENUE_COMPARISON 数据计算历年数据
  const lastYearNetRevenue = 6880.0;
  const currentNetRevenue = REVENUE_LEDGER.mainMetric.value;
  const targetRevenue = REVENUE_LEDGER.mainMetric.target;
  const yoyGrowthRate = ((currentNetRevenue - lastYearNetRevenue) / lastYearNetRevenue * 100).toFixed(1);

  const revenueProgressOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['实际营收', '目标营收', '营收增长率'], bottom: 0, textStyle: { color: themeClass === 'dark-theme' ? '#e2e8f0' : '#64748b' } },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: { type: 'category', data: ['25届(去年)', '26届(今年)'], axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' } },
    yAxis: [
      {
        type: 'value',
        name: '金额 (万)',
        splitLine: { lineStyle: { type: 'dashed', color: themeClass === 'dark-theme' ? '#334155' : '#e2e8f0' } },
        axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }
      },
      {
        type: 'value',
        name: '增长率 (%)',
        position: 'right',
        splitLine: { show: false },
        axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b', formatter: '{value}%' }
      }
    ],
    series: [
      {
        name: '实际营收',
        type: 'bar',
        barWidth: 24,
        itemStyle: {
          color: getGradient(gradients.pink.start, gradients.pink.end, false),
          borderRadius: [10, 10, 0, 0]
        },
        data: [lastYearNetRevenue, currentNetRevenue]
      },
      {
        name: '目标营收',
        type: 'bar',
        barWidth: 24,
        itemStyle: {
          color: themeClass === 'dark-theme' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: [10, 10, 0, 0]
        },
        data: [lastYearNetRevenue, targetRevenue] // 假设去年目标也是去年实际营收，或者可以忽略去年的目标
      },
      {
        name: '营收增长率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: gradients.blue.end,
          borderColor: '#fff',
          borderWidth: 2
        },
        lineStyle: { width: 3, color: gradients.blue.end },
        data: [0, parseFloat(yoyGrowthRate)] // 第一年作为基准为0
      }
    ]
  };

  // Employee Revenue Ranking Chart
  const sortedAdvisors = [...ADVISORS].sort((a, b) => b.revenue - a.revenue);
  const employeeRankingOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c}万' },
    grid: { left: '3%', right: '3%', bottom: '15%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: sortedAdvisors.map(a => a.name),
      axisLabel: {
        color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b',
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '金额 (万)',
      splitLine: { lineStyle: { type: 'dashed', color: themeClass === 'dark-theme' ? '#334155' : '#e2e8f0' } },
      axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }
    },
    series: [
      {
        name: '成交金额',
        type: 'bar',
        barWidth: 16,
        label: {
          show: true,
          position: 'top',
          color: themeClass === 'dark-theme' ? '#f8fafc' : '#334155',
          formatter: '{c}',
          fontSize: 10,
          rotate: 0
        },
        itemStyle: {
          color: getGradient(gradients.pink.start, gradients.pink.end, false),
          borderRadius: [8, 8, 0, 0]
        },
        data: sortedAdvisors.map(a => (a.revenue / 10000).toFixed(1))
      }
    ]
  };

  // Chart 2: 招生转化漏斗 (Sales Funnel: Deposit -> Refund -> Net)
  // ECharts funnel does not directly support itemStyle color linear gradient in the same way as bar charts.
  // We use echarts.graphic.LinearGradient if echarts is available, otherwise fallback to simple color array
  // For safety in ReactEcharts without direct access to echarts instance in render, we use a slightly different approach
  const funnelColors = [
    getGradient(gradients.blue.start, gradients.blue.end, false), // 垂直渐变更好看
    getGradient(gradients.orange.start, gradients.orange.end, false),
    getGradient(gradients.cyan.start, gradients.cyan.end, false)
  ];

  const funnelOption = {
    tooltip: { trigger: 'item', formatter: '{b} : {c}人' },
    color: funnelColors, // 使用 color 数组全局应用渐变
    series: [
      {
        name: '招生转化',
        type: 'funnel',
        left: '15%',
        width: '70%',
        minSize: '40%',
        maxSize: '100%',
        sort: 'desc',
        gap: 4, // 增加层级间距
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}人',
          color: '#fff',
          fontSize: 14,
          fontWeight: 'bold',
          textShadowBlur: 2,
          textShadowColor: 'rgba(0,0,0,0.3)' // 增加文字阴影提升辨识度
        },
        itemStyle: {
          borderColor: themeClass === 'dark-theme' ? '#1e293b' : '#fff',
          borderWidth: 0, // 移除边框，使用纯 gap 留白更现代
          borderType: 'solid',
          borderJoin: 'round', // 边角更圆润（如果开启border）
          borderRadius: 8, // 给漏斗图的每一层增加圆角，使其看起来像药丸堆叠
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowOffsetY: 8,
          shadowColor: 'rgba(0, 0, 0, 0.08)' // 更柔和的阴影
        },
        data: [
          { value: HEADCOUNT_LEDGER.salesFunnel.deposit.value, name: '交定金人头' },
          { value: HEADCOUNT_LEDGER.salesFunnel.deposit.value - HEADCOUNT_LEDGER.salesFunnel.refund.value, name: '净招生人头' },
          { value: HEADCOUNT_LEDGER.deliveryFunnel.enrollment.value, name: '实际入学数' }
        ]
      }
    ]
  };

  // Company 5-pool 4-rate Funnel
  const companyFunnelColors = [
    getGradient(gradients.purple.start, gradients.purple.end, false),
    getGradient(gradients.blue.start, gradients.blue.end, false),
    getGradient(gradients.cyan.start, gradients.cyan.end, false),
    getGradient(gradients.green.start, gradients.green.end, false),
    getGradient(gradients.orange.start, gradients.orange.end, false),
  ];

  // Aggregate pool data from all ADVISORS for company overview
  const totalPools = ADVISORS.reduce((acc, curr) => {
    if (curr.pools) {
      acc.leads += curr.pools.leads;
      acc.customers += curr.pools.customers;
      acc.upgrades += curr.pools.upgrades;
      acc.deals += curr.pools.deals;
      acc.enrollments += curr.pools.enrollments;
    }
    return acc;
  }, { leads: 0, customers: 0, upgrades: 0, deals: 0, enrollments: 0 });

  const companyFunnelOption = {
    tooltip: { trigger: 'item', formatter: '{b} : {c}人' },
    color: companyFunnelColors,
    series: [
      {
        name: '五池转化',
        type: 'funnel',
        left: '15%',
        width: '70%',
        minSize: '20%',
        maxSize: '100%',
        sort: 'desc',
        gap: 4,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}人',
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
          textShadowBlur: 2,
          textShadowColor: 'rgba(0,0,0,0.3)'
        },
        itemStyle: {
          borderColor: themeClass === 'dark-theme' ? '#1e293b' : '#fff',
          borderWidth: 0,
          borderType: 'solid',
          borderJoin: 'round',
          borderRadius: 8,
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowOffsetY: 8,
          shadowColor: 'rgba(0, 0, 0, 0.08)'
        },
        data: [
          { value: totalPools.leads, name: '线索池' },
          { value: totalPools.customers, name: '客户池' },
          { value: totalPools.upgrades, name: '升级池' },
          { value: totalPools.deals, name: '成交池' },
          { value: totalPools.enrollments, name: '入学池' }
        ]
      }
    ]
  };

  // Chart 3: 各产品线净招生同比增减 / 销售金额同比增减
  const [productLineTab, setProductLineTab] = useState<'deposit' | 'sales'>('deposit');

  const productData = PRODUCT_LINE_MATRIX.filter(p => p.key !== 'total').map(p => {
    // 模拟销售金额数据: 若有真实数据则使用，否则按人数*客单价估算
    const parsedSales = p.actualRevenue !== '-' ? parseFloat(p.actualRevenue) : p.preReg * 15.5;
    const yoyPreRegCount = parseInt(p.yoyPreReg?.replace('+', '') || '0');
    const salesYoy = yoyPreRegCount * 12.0;

    return {
      name: `${p.productLine}(${p.category})`,
      depositYoy: yoyPreRegCount, // 同比增减人数
      depositCount: p.preReg, // 交定金人数
      salesAmount: parsedSales, 
      salesYoy: salesYoy 
    };
  }).sort((a, b) => productLineTab === 'deposit' ? a.depositCount - b.depositCount : a.salesAmount - b.salesAmount);

  const productLifecycleOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { 
      data: productLineTab === 'deposit' ? ['交定金人数', '同比增减'] : ['销售金额(万)', '同比增减(万)'], 
      bottom: 0, 
      textStyle: { color: themeClass === 'dark-theme' ? '#e2e8f0' : '#64748b' } 
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: [
      {
        type: 'value',
        name: productLineTab === 'deposit' ? '人数' : '金额',
        splitLine: { lineStyle: { type: 'dashed', color: themeClass === 'dark-theme' ? '#334155' : '#e2e8f0' } },
        axisLabel: { color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b' }
      }
    ],
    yAxis: {
      type: 'category',
      data: productData.map(d => d.name),
      axisLabel: {
        color: themeClass === 'dark-theme' ? '#cbd5e1' : '#64748b',
        formatter: (value: string) => value.length > 8 ? value.substring(0, 8) + '...' : value
      }
    },
    series: [
      {
        name: productLineTab === 'deposit' ? '交定金人数' : '销售金额(万)',
        type: 'bar',
        barWidth: 6,
        barGap: '30%', 
        label: { show: true, position: 'right', color: themeClass === 'dark-theme' ? '#f8fafc' : '#334155', fontWeight: 'bold', fontSize: 10 },
        itemStyle: {
          color: getGradient(gradients.orange.start, gradients.orange.end),
          borderRadius: [0, 10, 10, 0]
        },
        data: productLineTab === 'deposit' ? productData.map(d => d.depositCount) : productData.map(d => Math.round(d.salesAmount))
      },
      {
        name: productLineTab === 'deposit' ? '同比增减' : '同比增减(万)',
        type: 'bar',
        barWidth: 6,
        label: {
          show: true,
          position: 'right',
          color: themeClass === 'dark-theme' ? '#f8fafc' : '#334155',
          fontWeight: 'bold',
          fontSize: 10,
          formatter: (params: any) => {
            return params.value > 0 ? `+${params.value}` : params.value;
          }
        },
        itemStyle: {
          color: getGradient(gradients.blue.start, gradients.blue.end),
          borderRadius: [0, 10, 10, 0]
        },
        data: productLineTab === 'deposit' ? productData.map(d => d.depositYoy) : productData.map(d => Math.round(d.salesYoy))
      }
    ]
  };

  // Chart 4: 收退款对比分布 (Collection vs Refund)
  const totalCollection = REVENUE_LEDGER.collection.value;
  const totalRefund = REVENUE_LEDGER.totalRefund.value;
  const netCashflow = (totalCollection - totalRefund).toFixed(1);

  const cashflowOption = {
    tooltip: { trigger: 'item' },
    legend: { top: '5%', left: 'center', textStyle: { color: themeClass === 'dark-theme' ? '#e2e8f0' : '#64748b' } },
    graphic: {
      elements: [
        {
          type: 'text',
          left: 'center',
          top: '38%',
          style: {
            text: '净流水 (万)',
            fill: themeClass === 'dark-theme' ? '#94a3b8' : '#94a3b8',
            fontSize: 12,
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '48%',
          style: {
            text: netCashflow,
            fill: themeClass === 'dark-theme' ? '#f8fafc' : '#1e293b',
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '60%',
          style: {
            text: '净流水 = 总流水 - 退款',
            fill: themeClass === 'dark-theme' ? '#64748b' : '#64748b',
            fontSize: 10,
          }
        }
      ]
    },
    color: [
      getGradient(gradients.orange.start, gradients.orange.end, false), // 垂直渐变更适合环形
      getGradient(gradients.red.start, gradients.red.end, false)
    ],
    series: [
      {
        name: '资金分布',
        type: 'pie',
        top: '10%', // 增加 top 边距，使其与图例隔开
        radius: ['55%', '80%'], // 更粗的环形，类似 KPI Card
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 20, // 更大的圆角
          borderColor: themeClass === 'dark-theme' ? '#1e293b' : '#fff',
          borderWidth: 4 // 更粗的边框，分隔更明显
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold', formatter: '{b}\n{c}万' }
        },
        labelLine: { show: false },
        data: [
          { value: REVENUE_LEDGER.collection.value, name: '大盘总流水' },
          { value: REVENUE_LEDGER.totalRefund.value, name: '大盘总退款' }
        ]
      }
    ]
  };

  return (
    <PremiumModal
      visible={visible}
      onClose={onClose}
      title="核心战略指标洞察"
      showCancel={false}
      subtitle="STRATEGIC METRIC INSIGHTS"
      themeMode={themeClass === 'dark-theme' ? 'dark' : 'light'}
    >
      <div className="bsim-chart-grid">
        <div className="bsim-chart-card">
          <div className="bcc-header">
            <div className="bcc-title">年度营收目标与员工排名概况</div>
            <div className="bcc-tabs">
              <div
                className={`bcc-tab ${revenueTab === 'overview' ? 'active' : ''}`}
                onClick={() => setRevenueTab('overview')}
              >
                达成概况
              </div>
              <div
                className={`bcc-tab ${revenueTab === 'ranking' ? 'active' : ''}`}
                onClick={() => setRevenueTab('ranking')}
              >
                员工排名
              </div>
            </div>
          </div>
          <div className="bcc-body">
            <ReactECharts
              option={revenueTab === 'overview' ? revenueProgressOption : employeeRankingOption}
              style={{ height: '100%', width: '100%' }}
              notMerge={true}
            />
          </div>
        </div>

        <div className="bsim-chart-card">
          <div className="bcc-header">
            <div className="bcc-title">年度大盘招生与五池四率漏斗</div>
            <div className="bcc-tabs">
              <div
                className={`bcc-tab ${funnelTab === 'sales' ? 'active' : ''}`}
                onClick={() => setFunnelTab('sales')}
              >
                招生交付
              </div>
              <div
                className={`bcc-tab ${funnelTab === 'company' ? 'active' : ''}`}
                onClick={() => setFunnelTab('company')}
              >
                五池四率
              </div>
            </div>
          </div>
          <div className="bcc-body">
            <ReactECharts option={funnelTab === 'sales' ? funnelOption : companyFunnelOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        <div className="bsim-chart-card">
          <div className="bcc-header">
            <div className="bcc-title">
              年度各产品线{productLineTab === 'deposit' ? '交定金人数' : '销售金额'}同比增减
            </div>
            <div className="bcc-tabs">
              <div
                className={`bcc-tab ${productLineTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setProductLineTab('deposit')}
              >
                交定金人数
              </div>
              <div
                className={`bcc-tab ${productLineTab === 'sales' ? 'active' : ''}`}
                onClick={() => setProductLineTab('sales')}
              >
                销售金额
              </div>
            </div>
          </div>
          <div className="bcc-body">
            <ReactECharts option={productLifecycleOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        <div className="bsim-chart-card">
          <div className="bcc-header">
            <div className="bcc-title">年度大盘资金收退分布</div>
          </div>
          <div className="bcc-body">
            <ReactECharts option={cashflowOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>
    </PremiumModal>
  );
};

export default StrategicInsightModal;
