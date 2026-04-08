import React from 'react';
import { Button } from 'antd';
import { createInterviewAction, exportManagementActions } from '@/services/dashboard';
import './index.less';

const mockWarnings = [
  { id: 1, name: '张三', reason: '连续 7 天 D 级', severity: 'high' },
  { id: 2, name: '李四', reason: '当下激活客户数 < 5', severity: 'medium' },
  { id: 3, name: '王五', reason: '建联率 < 30%', severity: 'medium' }
];

const ManagementWhip: React.FC = () => {
  const handleInterview = async (employee: any) => {
    try {
      await createInterviewAction({ employeeId: employee.id, reason: employee.reason });
      // show success message
    } catch (e) {
      // show error
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportManagementActions();
      const url = window.URL.createObjectURL(new Blob([blob as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'management_actions.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      // show error
    }
  };

  return (
    <div className="ceo-management-whip">
      <div className="rank-list-area">
        <h3>龙虎榜 TOP3</h3>
        <div className="rank-columns">
          <div className="rank-column">
            <h4>营收榜</h4>
            <ul>
              <li>1. 陈总 - 2.5M</li>
              <li>2. 林总 - 1.8M</li>
              <li>3. 赵总 - 1.2M</li>
            </ul>
          </div>
          <div className="rank-column">
            <h4>人头榜</h4>
            <ul>
              <li>1. 刘经理 - 45人</li>
              <li>2. 孙经理 - 38人</li>
              <li>3. 周经理 - 30人</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="ai-whip-area">
        <div className="whip-header">
          <h3>AI 预警 (待处理)</h3>
          <Button onClick={handleExport}>批量导出</Button>
        </div>
        <div className="whip-list">
          {mockWarnings.map(w => (
            <div key={w.id} className="whip-item">
              <div className="item-info">
                <span className="employee-name">{w.name}</span>
                <span className="whip-reason">{w.reason}</span>
              </div>
              <Button type="primary" danger size="small" onClick={() => handleInterview(w)}>立即约谈</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagementWhip;
