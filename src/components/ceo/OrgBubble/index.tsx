import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import 'echarts-gl';
import './index.less';

const OrgBubble: React.FC = () => {
  const [option, setOption] = useState({});

  useEffect(() => {
    // Generate mock data for the 3D scatter plot
    const data = [];
    for (let i = 0; i < 50; i++) {
      const revenue = Math.random() * 1000000;
      const headcount = Math.random() * 50;
      const refundRate = Math.random() * 20;
      const target = 800000;
      const completion = (revenue / target) * 100;
      
      let color = '#F5222D'; // D
      if (completion >= 110) color = '#722ED1'; // A
      else if (completion >= 90) color = '#52C41A'; // B
      else if (completion >= 60) color = '#FAAD14'; // C

      data.push([revenue, headcount, refundRate, color, `员工${i}`, revenue * 0.1, refundRate * 10000]);
    }

    setOption({
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          const val = params.value;
          return `
            <div style="width: 280px; font-size: 14px; line-height: 22px;">
              <div>营收完成额 & 人头完成数（扣除退费）: ${(val[0]/10000).toFixed(1)}w & ${val[1].toFixed(0)}</div>
              <div>个人待收款: ${(val[5]/10000).toFixed(1)}w</div>
              <div>个人退费率/退费金额: ${val[2].toFixed(1)}% / ${(val[6]/10000).toFixed(1)}w</div>
            </div>
          `;
        }
      },
      xAxis3D: {
        type: 'value',
        name: '营收完成额'
      },
      yAxis3D: {
        type: 'value',
        name: '人头完成数'
      },
      zAxis3D: {
        type: 'value',
        name: '退费率'
      },
      grid3D: {
        viewControl: {
          projection: 'orthographic'
        }
      },
      series: [{
        type: 'scatter3D',
        data: data.map(item => ({
          value: item,
          itemStyle: { color: item[3] }
        })),
        symbolSize: 20,
        itemStyle: {
          opacity: 0.8
        }
      }]
    });
  }, []);

  return (
    <div className="ceo-org-bubble-container">
      <h3>组织业绩与质量</h3>
      <div className="echarts-wrapper">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};

export default OrgBubble;
