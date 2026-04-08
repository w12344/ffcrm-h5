import React, { useState } from 'react';
import { Form } from 'antd';
import { UserAddOutlined, UserOutlined } from '@ant-design/icons';
import PremiumModal from '@/components/PremiumModal';
import { PremiumSelect } from '@/components/PremiumForm';
import { ADVISORS } from '../../Boss/constants/mockData';

const { Option } = PremiumSelect;

interface AssignAdvisorModalProps {
  visible: boolean;
  selectedCount: number;
  onCancel: () => void;
  onConfirm: (advisorId: string, advisorName: string) => void;
  themeMode?: 'dark' | 'light';
  title?: React.ReactNode;
  subtitle?: string;
  isSingle?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerLevel?: string;
  customerSource?: string;
  customerFollowUp?: string;
  currentAdvisor?: string;
}

const AssignAdvisorModal: React.FC<AssignAdvisorModalProps> = ({
  visible,
  selectedCount,
  onCancel,
  onConfirm,
  themeMode = 'light',
  title,
  subtitle,
  isSingle = false,
  customerName,
  customerPhone,
  customerLevel,
  customerSource,
  customerFollowUp,
  currentAdvisor,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    form.validateFields().then((values) => {
      const advisor = ADVISORS.find((a) => a.id === values.advisorId);
      if (!advisor) return;
      setLoading(true);
      setTimeout(() => {
        onConfirm(advisor.id, advisor.name);
        form.resetFields();
        setLoading(false);
      }, 500);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <PremiumModal
      visible={visible}
      onClose={handleCancel}
      onOk={handleConfirm}
      title={
        title || (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <UserAddOutlined />
            {isSingle ? '重新分配线索' : '批量分配线索'}
          </span>
        )
      }
      subtitle={subtitle || (isSingle ? "REASSIGN LEAD" : "BATCH LEAD ASSIGNMENT")}
      width={520}
      height="auto"
      themeMode={themeMode}
      className="assign-advisor-modal-premium"
      destroyOnClose
      okText="确认分配"
      showOk
      showCancel={false}
      confirmLoading={loading}
    >
      <div style={{ padding: '24px 28px 8px' }}>
        {isSingle && customerName ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingBottom: 20,
            marginBottom: 20,
            borderBottom: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(139,92,246,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6',
              flexShrink: 0,
            }}>
              <UserOutlined style={{ fontSize: 20 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{
                color: themeMode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                fontSize: 16,
                fontWeight: 500,
                marginBottom: 6,
                lineHeight: 1.2,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                {customerName}
                {customerLevel && (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    lineHeight: 1
                  }}>
                    {customerLevel}级
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 13,
                color: themeMode === 'dark' ? 'rgba(255,255,255,0.45)' : '#64748b',
                lineHeight: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  {customerPhone && <span><span style={{ color: '#94a3b8' }}>手机：</span>{customerPhone}</span>}
                  {customerSource && <span><span style={{ color: '#94a3b8' }}>来源：</span>{customerSource}</span>}
                  {currentAdvisor && <span><span style={{ color: '#94a3b8' }}>归属：</span>{currentAdvisor}</span>}
                </div>
                {customerFollowUp && <span><span style={{ color: '#94a3b8' }}>跟进情况：</span>{customerFollowUp}</span>}
              </div>
            </div>
          </div>
        ) : selectedCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            marginBottom: 20,
            fontSize: 13,
            color: 'var(--text-secondary, #64748b)',
          }}>
            <span style={{
              display: 'inline-block',
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: '22px',
              flexShrink: 0,
            }}>
              {selectedCount}
            </span>
            已选中 <strong>{selectedCount}</strong> 条线索，请选择要分配的销售顾问
          </div>
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            name="advisorId"
            label="销售顾问"
            rules={[{ required: true, message: '请选择销售顾问' }]}
          >
            <PremiumSelect
              showSearch
              placeholder="搜索或选择销售顾问"
              filterOption={(input, option) =>
                (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
              }
              optionLabelProp="label"
              style={{ width: '100%' }}
              size="large"
            >
              {ADVISORS.map((advisor) => (
                <Option
                  key={advisor.id}
                  value={advisor.id}
                  label={advisor.name}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 0' }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#fff',
                      flexShrink: 0,
                    }}>
                      {advisor.name[0]}
                    </div>
                    <div>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{advisor.name}</span>
                      <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>
                        {advisor.activeCustomers} 位客户 · 完成率 {advisor.completionRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </Option>
              ))}
            </PremiumSelect>
          </Form.Item>
        </Form>
      </div>
    </PremiumModal>
  );
};

export default AssignAdvisorModal;
