import React from 'react';
import { Tabs, Empty } from 'antd';
import { ObjectionDetail } from '@/services/task';
import PremiumModal from '@/components/PremiumModal';
import './index.less';

interface ObjectionDetailDialogProps {
  visible: boolean;
  onClose: () => void;
  objections: ObjectionDetail[];
  selectedObjectionId?: number | null; // 选中的异议ID，用于定位到对应的tab
  themeMode?: 'dark' | 'light';
}

const ObjectionDetailDialog: React.FC<ObjectionDetailDialogProps> = ({
  visible,
  onClose,
  objections,
  selectedObjectionId,
  themeMode = 'dark',
}) => {
  // 主题类名
  const themeClassName = `objection-detail-dialog-${themeMode}`;

  // 确定默认激活的 tab key
  const defaultActiveKey = selectedObjectionId
    ? String(selectedObjectionId)
    : (objections.length > 0 ? String(objections[0].id) : undefined);

  // 使用 state 管理当前激活的 tab
  const [activeKey, setActiveKey] = React.useState<string | undefined>(defaultActiveKey);

  // 当 selectedObjectionId 或 visible 变化时，更新 activeKey
  React.useEffect(() => {
    if (visible) {
      const newActiveKey = selectedObjectionId
        ? String(selectedObjectionId)
        : (objections.length > 0 ? String(objections[0].id) : undefined);
      setActiveKey(newActiveKey);
    }
  }, [selectedObjectionId, visible, objections]);

  // 格式化聊天内容
  const formatChatContent = (chatContent: string) => {
    if (!chatContent) return null;

    // 按换行符分割聊天内容
    const lines = chatContent.split('\n').filter(line => line.trim());

    return (
      <div className="chat-content">
        {lines.map((line, index) => {
          // 判断是客户还是员工
          const isCustomer = line.startsWith('客户：');
          const isEmployee = line.startsWith('员工：');

          if (isCustomer || isEmployee) {
            const content = line.substring(3).replace(/^"/, '').replace(/"$/, '');
            return (
              <div key={index} className={`chat-message ${isCustomer ? 'customer' : 'employee'}`}>
                <div className="message-label">{isCustomer ? '客户' : '员工'}</div>
                <div className="message-content">{content}</div>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  // 创建 Tab 项
  const tabItems = objections.map((objection) => ({
    key: String(objection.id),
    label: objection.title,
    children: (
      <div className="objection-detail">
        <div className="detail-section">
          <div className="section-title">基本信息</div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">异议类别：</span>
              <span className="info-value">{objection.category}</span>
            </div>
            <div className="info-item">
              <span className="info-label">创建时间：</span>
              <span className="info-value">{objection.createdAt}</span>
            </div>
            <div className="info-item">
              <span className="info-label">状态：</span>
              <span className="info-value">{objection.status === 'PENDING' ? '待处理' : '已处理'}</span>
            </div>
          </div>
        </div>

        {objection.description && (
          <div className="detail-section">
            <div className="section-title">描述</div>
            <div className="section-content">{objection.description}</div>
          </div>
        )}

        {objection.solution && (
          <div className="detail-section">
            <div className="section-title">解决方案</div>
            <div className="section-content">{objection.solution}</div>
          </div>
        )}

        <div className="detail-section">
          <div className="section-title">聊天记录</div>
          {objection.chatContent ? (
            formatChatContent(objection.chatContent)
          ) : (
            <Empty description="暂无聊天记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </div>
    ),
  }));

  return (
    <PremiumModal
      title="异议点列表"
      visible={visible}
      onClose={onClose}
      width={900}
      destroyOnClose
      className={themeClassName}
    >
      {objections.length > 0 ? (
        <Tabs
          items={tabItems}
          activeKey={activeKey}
          onChange={setActiveKey}
          className="objection-tabs"
        />
      ) : (
        <Empty description="暂无异议点数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </PremiumModal>
  );
};

export default ObjectionDetailDialog;

