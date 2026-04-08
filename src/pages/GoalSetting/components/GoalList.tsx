import React from 'react';
import { SaveOutlined } from '@ant-design/icons';
import { ItemType } from '../types';
import { PremiumButton } from '@/components/PremiumForm';

interface GoalListProps {
  members: ItemType[];
  totalGoal: number;
  totalLeadsGoal: number;
  handleUpdateTarget: (id: string, val: string, field?: 'targetAmount' | 'targetEnrollment' | 'targetLeads') => void;
  handleUpdateRemark: (id: string, val: string) => void;
  handleSave: () => void;
  userRole: 'sales' | 'marketing';
}

const GoalList: React.FC<GoalListProps> = ({
  members,
  totalGoal,
  totalLeadsGoal,
  handleUpdateTarget,
  handleUpdateRemark,
  handleSave,
  userRole
}) => {
  return (
    <div className="gs-list-container" style={{ '--sales-extra-col': userRole === 'sales' ? '200px' : '0px' } as React.CSSProperties}>
      <div className="gs-list-title-area">
        <h2 className="gs-h2">设置团队目标</h2>
        <PremiumButton variant="primary" icon={<SaveOutlined />} onClick={handleSave}>
          保存并立即发布目标
        </PremiumButton>
      </div>
      <div className="gs-list-scroll-wrapper">
        <div className="gs-list-header">
          <div className="col-status">状态</div>
          <div className="col-name">员工名称</div>
          {userRole === 'sales' ? (
              <>
                <div className="col-target">本月度销售额目标设定（¥）</div>
                <div className="col-target">本月度招生人数目标设定</div>
              </>
            ) : (
              <div className="col-target">本月度线索数量目标设定</div>
            )}
          <div className="col-remark">备注（选填）</div>
          <div className="col-ratio">占比权重</div>
        </div>
        <div className="gs-allocation-list">
          {members.map((member: ItemType, idx: number) => {
          const ratio = userRole === 'sales'
            ? (totalGoal > 0 ? Math.round((member.targetAmount / totalGoal) * 1000) / 10 : 0)
            : (member.targetLeads && totalLeadsGoal > 0 ? Math.round((member.targetLeads / totalLeadsGoal) * 1000) / 10 : 0);
          return (
            <div key={member.id} className="gs-member-card" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
              <div className="gs-member-status">
                <div className="gs-avatar-wrap">
                  <img src={member.avatar} alt={member.name} className="gs-avatar" />
                </div>
                <div className="gs-status-indicator" style={{ backgroundColor: member.statusColor || '#52c41a' }}></div>
                <div className="gs-short-name">{member.name}</div>
              </div>

              <div className="gs-member-identity">
                <div className="name">{member.group}</div>
                <div className="id-text">ID: {member.id}</div>
              </div>

              {userRole === 'sales' ? (
                <>
                  <div className="gs-input-field gs-target-field">
                    <input
                      type="text"
                      className="gs-glass-input"
                      value={member.targetAmount.toLocaleString()}
                      onChange={(e) => handleUpdateTarget(member.id, e.target.value, 'targetAmount')}
                    />
                  </div>
                  <div className="gs-input-field gs-target-field">
                    <input
                      type="text"
                      className="gs-glass-input"
                      value={member.targetEnrollment.toLocaleString()}
                      onChange={(e) => handleUpdateTarget(member.id, e.target.value, 'targetEnrollment')}
                    />
                  </div>
                </>
              ) : (
                <div className="gs-input-field gs-target-field">
                  <input
                    type="text"
                    className="gs-glass-input"
                    value={member.targetLeads.toLocaleString()}
                    onChange={(e) => handleUpdateTarget(member.id, e.target.value, 'targetLeads')}
                  />
                </div>
              )}

              <div className="gs-input-field gs-remark-field">
                <input
                  type="text"
                  className="gs-glass-input"
                  placeholder="请输入备注"
                  value={member.remark}
                  onChange={(e) => handleUpdateRemark(member.id, e.target.value)}
                />
              </div>

              <div className="gs-ratio-display">
                <div className="ratio-val">{ratio}%</div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default GoalList;
