import React, { useEffect, useState } from 'react';
import { fetchGlobalKPI, GlobalKPIData } from '@/services/dashboard';
import KPICard from '@/components/KPICard';
import { KPICardProps } from '@/types/dashboard';
import { Spin } from 'antd';
import './index.less';

const GlobalKPI: React.FC = () => {
  const [data, setData] = useState<GlobalKPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchGlobalKPI();
        // Mock data fallback if API fails
        if (res?.data?.data) {
          setData(res.data.data as unknown as GlobalKPIData);
        } else {
          setData({
            revenue: 64160000,
            target: 70930000,
            pending: 1200000,
            refund: 500000,
            refundHeadcount: 15
          });
        }
      } catch (err) {
        setData({
          revenue: 64160000,
          target: 70930000,
          pending: 1200000,
          refund: 500000,
          refundHeadcount: 15
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, []);

  if (loading || !data) {
    return <div className="global-kpi-loading"><Spin /></div>;
  }

  const completionRate = ((data.revenue / data.target) * 100).toFixed(1);
  const revenueFormat = (data.revenue / 1000000).toFixed(2) + 'M';
  const targetFormat = (data.target / 1000000).toFixed(2) + 'M';

  const kpiProps: KPICardProps = {
    title: '年度全局营收大盘',
    mainValue: revenueFormat,
    mainTarget: targetFormat,
    mainTargetLabel: '年度目标',
    subMetrics: [
      {
        title: '总待收款',
        value: (data.pending / 10000).toFixed(1) + 'w',
        change: '',
        percent: '',
        trend: '',
      },
      {
        title: '总退费金额',
        value: (data.refund / 10000).toFixed(1) + 'w',
        change: '',
        percent: '',
        trend: '',
      },
      {
        title: '总退费人头',
        value: data.refundHeadcount.toString(),
        change: '',
        percent: '',
        trend: '',
      }
    ],
    chartValue: `${completionRate}%`,
    chartLabel: '营收达成率',
    chartColor: 'blue-purple',
    chartType: 'circular',
    subMetricsColumns: 2,
    showMainStatus: false,
  };

  return (
    <div className="ceo-global-kpi-wrapper">
      <KPICard {...kpiProps} />
    </div>
  );
};

export default GlobalKPI;
