import React, { useState, useMemo } from 'react';
import { message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';
import DashboardHeader from '../Dashboard/components/DashboardHeader';
import GoalOverview from './components/GoalOverview';
import GoalList from './components/GoalList';
import { MOCK_TEAM_MEMBERS, TEAM_STAT_CONFIG } from './constants';
import { ItemType, GoalMetrics } from './types';
import './index.less';

const GoalSettingPage: React.FC = () => {
  const { isDark } = useTheme();
  const themeClass = isDark ? 'dark-theme' : 'light-theme';

  // Mock role, can be 'sales' or 'marketing'
  const [userRole] = useState<'sales' | 'marketing'>('sales');

  const [totalGoal, setTotalGoal] = useState(TEAM_STAT_CONFIG.totalGoal);
  const [totalEnrollmentGoal, setTotalEnrollmentGoal] = useState(TEAM_STAT_CONFIG.totalEnrollmentGoal);
  const [totalLeadsGoal, setTotalLeadsGoal] = useState(TEAM_STAT_CONFIG.totalLeadsGoal);

  const [members, setMembers] = useState<ItemType[]>(MOCK_TEAM_MEMBERS);

  // --- Derived Calculations ---
  const metrics = useMemo<GoalMetrics>(() => {
    const assignedAmount = members.reduce((sum: number, m: ItemType) => sum + (m.targetAmount || 0), 0);
    const assignedEnrollment = members.reduce((sum: number, m: ItemType) => sum + (m.targetEnrollment || 0), 0);
    const assignedLeads = members.reduce((sum: number, m: ItemType) => sum + (m.targetLeads || 0), 0);

    const assignedCount = members.length;

    const coverageRate = Math.round((assignedAmount / (totalGoal || 1)) * 100);
    const coverageRateEnrollment = Math.round((assignedEnrollment / (totalEnrollmentGoal || 1)) * 100);
    const coverageRateLeads = Math.round((assignedLeads / (totalLeadsGoal || 1)) * 100);

    const avgGoal = Math.round(assignedAmount / (assignedCount || 1));
    const avgEnrollmentGoal = Math.round(assignedEnrollment / (assignedCount || 1));
    const avgLeadsGoal = Math.round(assignedLeads / (assignedCount || 1));

    return {
      totalGoal,
      totalEnrollmentGoal,
      totalLeadsGoal,
      assignedAmount,
      assignedEnrollment,
      assignedLeads,
      assignedCount,
      coverageRate,
      coverageRateEnrollment,
      coverageRateLeads,
      avgGoal,
      avgEnrollmentGoal,
      avgLeadsGoal
    };
  }, [members, totalGoal, totalEnrollmentGoal, totalLeadsGoal]);

  // --- Handlers ---
  const handleUpdateTarget = (id: string, val: string, field: 'targetAmount' | 'targetEnrollment' | 'targetLeads' = 'targetAmount') => {
    const num = parseInt(val.replace(/[^\d]/g, '')) || 0;
    setMembers((prev: ItemType[]) => prev.map((m: ItemType) => m.id === id ? { ...m, [field]: num } : m));
  };

  const handleUpdateRemark = (id: string, val: string) => {
    setMembers((prev: ItemType[]) => prev.map((m: ItemType) => m.id === id ? { ...m, remark: val } : m));
  };

  const handleSave = () => {
    message.success({
      content: '战略目标已发布至各作战单元！',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      style: { marginTop: '10vh' }
    });
  };

  return (
    <div className={`goal-setting-page ${themeClass}`}>
      <DashboardHeader timeDimension="month" />

      <div className="gs-content">
        <GoalOverview
          metrics={metrics}
          totalGoal={totalGoal}
          setTotalGoal={setTotalGoal}
          totalEnrollmentGoal={totalEnrollmentGoal}
          setTotalEnrollmentGoal={setTotalEnrollmentGoal}
          totalLeadsGoal={totalLeadsGoal}
          setTotalLeadsGoal={setTotalLeadsGoal}
          members={members}
          userRole={userRole}
        />

        <GoalList
          members={members}
          totalGoal={totalGoal}
          totalLeadsGoal={totalLeadsGoal}
          handleUpdateTarget={handleUpdateTarget}
          handleUpdateRemark={handleUpdateRemark}
          handleSave={handleSave}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default GoalSettingPage;
