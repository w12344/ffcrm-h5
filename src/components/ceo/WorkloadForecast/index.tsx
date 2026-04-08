import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import './index.less';

const WorkloadForecast: React.FC = () => {
  const [barOption, setBarOption] = useState({});

  useEffect(() => {
    setBarOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: ['当下激活客户数', '分配客户量', '建联率', '上门量', '上门成交率']
      },
      series: [
        {
          name: '指标',
          type: 'bar',
          data: [120, 200, 45, 80, 25],
          itemStyle: {
            color: '#1890ff'
          }
        }
      ]
    });
  }, []);

  return (
    <div className="ceo-workload-forecast">
      <div className="workload-left">
        <h3>工作量统计</h3>
        <ReactECharts option={barOption} style={{ height: '300px' }} />
      </div>
      <div className="workload-right">
        <h3>下周业绩预测</h3>
        <div className="forecast-card">
          <div className="forecast-title">下周营收预测区间</div>
          <div className="forecast-value">5.2M - 6.8M</div>
          <div className="forecast-sub">基于当前激活池客户 × 顾问历史转化率</div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadForecast;
