import React from 'react';
import { TeamOutlined, EditOutlined, WalletOutlined, UserOutlined, ArrowUpOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { GoalMetrics, ItemType } from '../types';

interface GoalOverviewProps {
  metrics: GoalMetrics;
  totalGoal: number;
  setTotalGoal: (val: number) => void;
  totalEnrollmentGoal: number;
  setTotalEnrollmentGoal: (val: number) => void;
  totalLeadsGoal: number;
  setTotalLeadsGoal: (val: number) => void;
  members: ItemType[];
  userRole: 'sales' | 'marketing';
}

const GoalOverview: React.FC<GoalOverviewProps> = ({
  metrics,
  totalGoal,
  setTotalGoal,
  totalEnrollmentGoal,
  setTotalEnrollmentGoal,
  totalLeadsGoal,
  setTotalLeadsGoal,
  members,
  userRole
}) => {
  const isOverAllocated = userRole === 'sales'
    ? (metrics.assignedAmount > totalGoal && totalGoal > 0) || (metrics.assignedEnrollment > totalEnrollmentGoal && totalEnrollmentGoal > 0)
    : (metrics.assignedLeads > totalLeadsGoal && totalLeadsGoal > 0);

  const overAmount = metrics.assignedAmount > totalGoal ? metrics.assignedAmount - totalGoal : 0;
  const overEnrollment = metrics.assignedEnrollment > totalEnrollmentGoal ? metrics.assignedEnrollment - totalEnrollmentGoal : 0;
  const overLeads = metrics.assignedLeads > totalLeadsGoal ? metrics.assignedLeads - totalLeadsGoal : 0;

  const baselineAvg = metrics.assignedCount > 0 ? Math.round(totalGoal / metrics.assignedCount) : 0;
  const baselineEnrollmentAvg = metrics.assignedCount > 0 ? Math.round(totalEnrollmentGoal / metrics.assignedCount) : 0;
  const baselineLeadsAvg = metrics.assignedCount > 0 ? Math.round(totalLeadsGoal / metrics.assignedCount) : 0;



  // Generate pie chart data and legend based on top 10 members
  const sortKey = userRole === 'sales' ? 'targetAmount' : 'targetLeads';
  const sortedMembers = [...members].sort((a, b) => b[sortKey] - a[sortKey]);
  const topMembers = sortedMembers.slice(0, 10);
  const colors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#a0d911', '#fa8c16', '#2f54eb'
  ];

  const pieData = topMembers.map((m, idx) => ({
    value: userRole === 'sales' ? m.targetAmount : m.targetLeads,
    name: m.group,
    itemStyle: {
      color: colors[idx % colors.length],
    }
  }));

  const pieOption = {
    tooltip: { trigger: 'item', formatter: userRole === 'sales' ? '{b}: ¥{c} ({d}%)' : '{b}: {c}条 ({d}%)' },
    series: [
      {
        name: '目标分配',
        type: 'pie',
        radius: ['75%', '90%'],
        center: ['50%', '50%'],
        itemStyle: {
          borderRadius: 20,
          borderColor: 'var(--kpi-card-bg, #fff)',
          borderWidth: 4
        },
        label: {
          show: true,
          position: 'center',
          formatter: () => `{val|${(userRole === 'sales' ? metrics.coverageRate : metrics.coverageRateLeads).toFixed(1)}%}\n{txt|目标覆盖}`,
          rich: {
            val: {
              fontSize: 22,
              fontWeight: '800',
              color: '#52c41a',
              fontFamily: 'Rajdhani',
              lineHeight: 28
            },
            txt: {
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 20
            }
          }
        },
        data: pieData.length > 0 ? pieData : [{ value: 1, name: '暂无分配', itemStyle: { color: '#f0f0f0' } }]
      }
    ]
  };

  return (
    <div className="gs-overview-grid">
      {/* Card 1: Global Mission */}
      <div className="gs-stat-card" style={{ '--accent-color': '#1890ff' } as React.CSSProperties}>
        <div className="gs-label">全公司总目标</div>
        <div className="gs-value-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          {userRole === 'sales' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="gs-currency" style={{ marginRight: '8px', fontSize: '13px' }}>销售额: ¥</span>
                <span className="gs-value" style={{ fontSize: '24px', lineHeight: '1.2' }}>{totalGoal.toLocaleString()}</span>
                <EditOutlined className="gs-icon" style={{ cursor: 'pointer', color: '#1890ff', marginLeft: '8px', fontSize: '14px' }} onClick={() => {
                  const val = prompt('请输入新的全公司销售额总目标：', totalGoal.toString());
                  if (val) setTotalGoal(parseInt(val.replace(/[^\d]/g, '')) || totalGoal);
                }} title="编辑销售额目标" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="gs-currency" style={{ marginRight: '8px', fontSize: '13px' }}>招生人数: </span>
                <span className="gs-value" style={{ fontSize: '24px', lineHeight: '1.2' }}>{totalEnrollmentGoal.toLocaleString()}</span>
                <span className="gs-currency" style={{ marginLeft: '4px', fontSize: '13px' }}>人</span>
                <EditOutlined className="gs-icon" style={{ cursor: 'pointer', color: '#1890ff', marginLeft: '8px', fontSize: '14px' }} onClick={() => {
                  const val = prompt('请输入新的全公司招生人数总目标：', totalEnrollmentGoal.toString());
                  if (val) setTotalEnrollmentGoal(parseInt(val.replace(/[^\d]/g, '')) || totalEnrollmentGoal);
                }} title="编辑招生人数目标" />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="gs-currency" style={{ marginRight: '8px', fontSize: '13px' }}>线索数量: </span>
              <span className="gs-value" style={{ fontSize: '24px', lineHeight: '1.2' }}>{totalLeadsGoal.toLocaleString()}</span>
              <span className="gs-currency" style={{ marginLeft: '4px', fontSize: '13px' }}>条</span>
              <EditOutlined className="gs-icon" style={{ cursor: 'pointer', color: '#1890ff', marginLeft: '8px', fontSize: '14px' }} onClick={() => {
                const val = prompt('请输入新的全公司线索总目标：', totalLeadsGoal.toString());
                if (val) setTotalLeadsGoal(parseInt(val.replace(/[^\d]/g, '')) || totalLeadsGoal);
              }} title="编辑线索数量目标" />
            </div>
          )}
        </div>

        <div className="gs-sub-info-block" style={{ marginTop: 'auto', gap: '4px' }}>
          {userRole === 'sales' ? (
            <>
              <div className="gs-sub-row" style={{ fontSize: '12px' }}>
                已分配金额: <span className="gs-sub-val" style={{ fontSize: '12px' }}>¥{metrics.assignedAmount.toLocaleString()}</span>
                {metrics.assignedAmount > totalGoal && totalGoal > 0 && (
                  <span className="gs-trend-tag"><ArrowUpOutlined /> 超出 ¥{overAmount.toLocaleString()}</span>
                )}
              </div>
              <div className="gs-sub-row" style={{ fontSize: '12px' }}>
                已分配招生: <span className="gs-sub-val" style={{ fontSize: '12px' }}>{metrics.assignedEnrollment.toLocaleString()}人</span>
                {metrics.assignedEnrollment > totalEnrollmentGoal && totalEnrollmentGoal > 0 && (
                  <span className="gs-trend-tag"><ArrowUpOutlined /> 超出 {overEnrollment.toLocaleString()}人</span>
                )}
              </div>
            </>
          ) : (
            <div className="gs-sub-row" style={{ fontSize: '12px' }}>
              已分配线索: <span className="gs-sub-val" style={{ fontSize: '12px' }}>{metrics.assignedLeads.toLocaleString()}条</span>
              {metrics.assignedLeads > totalLeadsGoal && totalLeadsGoal > 0 && (
                <span className="gs-trend-tag"><ArrowUpOutlined /> 超出 {overLeads.toLocaleString()}条</span>
              )}
            </div>
          )}
        </div>
        <WalletOutlined className="gs-watermark-icon" />
      </div>

      {/* Card 2: Efficiency Index */}
      <div className="gs-stat-card" style={{ '--accent-color': '#06D7F6' } as React.CSSProperties}>
        <div className="gs-label">人均目标对比</div>
        <div className="gs-value-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          {userRole === 'sales' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="gs-currency" style={{ marginRight: '8px', fontSize: '13px' }}>销售额: ¥</span>
                <span className="gs-value" style={{ fontSize: '24px', lineHeight: '1.2' }}>{metrics.avgGoal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="gs-currency" style={{ marginRight: '8px', fontSize: '13px' }}>招生人数: </span>
                <span className="gs-value" style={{ fontSize: '24px', lineHeight: '1.2' }}>{metrics.avgEnrollmentGoal.toLocaleString()}</span>
                <span className="gs-currency" style={{ marginLeft: '4px', fontSize: '13px' }}>人</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="gs-currency" style={{ marginRight: '8px', fontSize: '13px' }}>线索数量: </span>
              <span className="gs-value" style={{ fontSize: '24px', lineHeight: '1.2' }}>{metrics.avgLeadsGoal.toLocaleString()}</span>
              <span className="gs-currency" style={{ marginLeft: '4px', fontSize: '13px' }}>条</span>
            </div>
          )}
        </div>

        <div className="gs-sub-info-block" style={{ marginTop: 'auto', gap: '4px' }}>
          {userRole === 'sales' ? (
            <>
              <div className="gs-sub-row" style={{ justifyContent: 'space-between', fontSize: '12px' }}>
                <span>全公司人均:</span>
                <span className="gs-sub-val" style={{ fontSize: '12px' }}>
                  ¥{baselineAvg.toLocaleString()} / {baselineEnrollmentAvg.toLocaleString()}人
                </span>
              </div>
            </>
          ) : (
            <div className="gs-sub-row" style={{ justifyContent: 'space-between', fontSize: '12px' }}>
              <span>全公司人均:</span>
              <span className="gs-sub-val" style={{ fontSize: '12px' }}>{baselineLeadsAvg.toLocaleString()}条</span>
            </div>
          )}
        </div>
        <UserOutlined className="gs-watermark-icon" />
      </div>

      {/* Card 3: Elite Crew */}
      <div className="gs-stat-card" style={{ '--accent-color': '#FD4895' } as React.CSSProperties}>
        <div className="gs-label">
          已分配人数
        </div>
        <div className="gs-value-row">
          <span className="gs-value" style={{ color: '#52c41a' }}>{metrics.assignedCount}</span>
          <span className="gs-currency" style={{ marginLeft: '8px', color: '#52c41a' }}>人</span>
        </div>
        <div className="gs-sub-info-block">
          <div className="gs-highlight-tag green" style={{ marginTop: 'auto' }}>
            已设置目标的员工数量
          </div>
        </div>
        <TeamOutlined className="gs-watermark-icon" />
      </div>

      {/* Card 4: Coverage Radar */}
      <div className="gs-stat-card" style={{ '--accent-color': '#C438EF', padding: '0', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
        <div style={{ flex: 1, position: 'relative', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '130px', height: '130px', marginRight: '210px' }}>
              <ReactECharts
                option={pieOption}
                style={{ width: '100%', height: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </div>

            <div className="gs-chart-legend">
              {topMembers.map((member, idx) => {
                const ratio = userRole === 'sales'
                  ? (totalGoal > 0 ? Math.round((member.targetAmount / totalGoal) * 1000) / 10 : 0)
                  : (totalLeadsGoal > 0 ? Math.round((member.targetLeads / totalLeadsGoal) * 1000) / 10 : 0);
                return (
                  <div key={member.id} className="gs-legend-item">
                    <div className="gs-legend-dot" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                    <div className="gs-legend-label" title={member.name}>{member.name}</div>
                    <div className="gs-legend-val">{ratio}%</div>
                  </div>
                );
              })}
            </div>
        </div>
        {isOverAllocated && (
          <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'center' }}>
            <div className="gs-highlight-tag red" style={{ width: '100%', textAlign: 'center', background: '#fffbe6', color: '#faad14', border: '1px solid #ffe58f' }}>
              ⚠️ 当前分配总额已超过全公司总目标
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalOverview;
