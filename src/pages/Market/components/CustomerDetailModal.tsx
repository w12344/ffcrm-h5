import React from 'react';
import { Tabs, Steps, Empty, Rate } from 'antd';
import { PhoneOutlined, MessageOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { Customer } from '@/types/dashboard';
import PremiumModal from '@/components/PremiumModal';
import './CustomerDetailModal.less';

import CommunicationRecords from "@/components/CommunicationRecords";
import { CommunicationRecord } from "@/pages/CustomerProfile/types";

// Mock phone call records for raw clues
const mockPhoneCallRecords: CommunicationRecord[] = [
  {
    recordId: "phone-1",
    customerProfileId: 0,
    senderType: "EMPLOYEE",
    senderId: "emp-1",
    senderName: "市场人员A",
    recordType: "PHONE",
    content: "",
    bizDate: "2026-03-30 10:15:00",
    messageTime: "2026-03-30 10:15:00",
    employeeName: "市场人员A",
    wxId: "",
    customerWxId: "",
    callType: "OUTBOUND",
    callDuration: 125,
    recordUrl: "mock-url" // Just needs to be present to show the play icon
  },
  {
    recordId: "phone-2",
    customerProfileId: 0,
    senderType: "EMPLOYEE",
    senderId: "emp-1",
    senderName: "市场人员A",
    recordType: "PHONE",
    content: "",
    bizDate: "2026-03-30 14:30:00",
    messageTime: "2026-03-30 14:30:00",
    employeeName: "市场人员A",
    wxId: "",
    customerWxId: "",
    callType: "OUTBOUND",
    callDuration: 0, // Unanswered
  }
] as unknown as CommunicationRecord[];

// Helper to convert simple chat records to CommunicationRecord format
const convertChatToCommunicationRecords = (chatRecords: any[]): CommunicationRecord[] => {
  return chatRecords.map((record, index) => {
    const isEmployee = record.sender === 'advisor' || record.sender === 'assistant';
    // Format time roughly for display (using current date for mock)
    const today = new Date().toISOString().split('T')[0];
    const timeStr = `${today} ${record.time}:00`;

    return {
      recordId: `chat-${index}`,
      customerProfileId: 0,
      senderType: isEmployee ? "EMPLOYEE" : "CUSTOMER",
      senderId: isEmployee ? "emp-1" : "cust-1",
      senderName: isEmployee ? "顾问张三" : "客户",
      recordType: "TEXT",
      content: record.content,
      bizDate: timeStr,
      messageTime: timeStr,
      employeeName: record.sender === 'advisor' ? "顾问张三" : (record.sender === 'assistant' ? "AI助手" : ""),
      wxId: "",
      customerWxId: ""
    } as unknown as CommunicationRecord;
  });
};

interface CustomerDetailModalProps {
  visible: boolean;
  customer: Customer | null;
  onCancel: () => void;
  themeMode?: 'dark' | 'light';
  poolType?: 'clue' | 'customer' | 'enrolled'; // 传入当前气泡所在的池子类型
  subPoolType?: 'deal' | 'enrolled'; // 对于成交&入学池，区分是成交池(deal)还是入学池(enrolled)
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ visible, customer, onCancel, themeMode = 'dark', poolType, subPoolType }) => {
  if (!customer) return null;

  const isEnrolled = poolType === 'enrolled' || subPoolType === 'deal' || subPoolType === 'enrolled'; // 是否是成交&入学池的客户
  const isClue = !isEnrolled && (poolType === 'clue' || customer.id.startsWith('clue') || customer.id.startsWith('CLUE') || (!customer.chatRecords?.length && !customer.qualityScore));
  const isDealSubPool = isEnrolled && subPoolType === 'deal'; // 成交池(池底)
  const isEnrolledSubPool = isEnrolled && subPoolType === 'enrolled'; // 入学池(池面)

  const historyItems = customer.followUpHistory?.map((item: any) => ({
    title: item.action,
    description: (
      <div style={{ paddingBottom: '8px' }}>
        <div style={{ fontSize: '12px' }}>操作人: {item.operator} | {item.time}</div>
        {item.details && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.details}</div>}
      </div>
    ),
  })) || [];

  // 针对原始线索的默认转化引擎数据
  const defaultClueHistory = isClue && historyItems.length === 0 ? [
    {
      title: '线索录入',
      description: (
        <div style={{ paddingBottom: '8px' }}>
          <div style={{ fontSize: '12px' }}>操作人: 系统自动 | {customer.lastContactTime ? new Date(customer.lastContactTime).toISOString().split('T')[0] : '2026-03-30'}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>通过 {customer.source || '核心渠道'} 自动抓取并录入系统</div>
        </div>
      )
    },
    {
      title: '待分配',
      description: (
        <div style={{ paddingBottom: '8px' }}>
          <div style={{ fontSize: '12px', color: '#faad14' }}>当前状态: 等待市场人员分配或顾问认领</div>
        </div>
      )
    }
  ] : historyItems;

  // Render variables
  const timelineDataToRender = isClue ? defaultClueHistory : historyItems;

  return (
    <PremiumModal
      visible={visible}
      onClose={onCancel}
      showCancel={false}
      title='用户详情'
      width={780}
      className="customer-detail-modal-premium"
      themeMode={themeMode}
    >
      <div className="customer-hero-section">
        <div className="hero-bubble-wrapper">
          <div className="hero-bubble-avatar">
            {customer.name.charAt(0)}
          </div>
          <div className="hero-main-info">
            <div className="hero-name-row">
              <h2 className="hero-name">{customer.name}</h2>
              {/* <div className="premium-level-tag">
                {customer.level} 级
              </div> */}
              {customer.importance !== undefined && (
                <div className="premium-importance-stars">
                  <Rate disabled allowHalf value={customer.importance} />
                </div>
              )}
            </div>
            <div className="hero-meta-row">
              <span className="hero-source">来源: {customer.source || '小红书'}</span>
              {customer.tags && customer.tags.map((tag, idx) => (
                <div key={idx} className="premium-custom-tag tag-blue">{tag}</div>
              ))}
              {isClue && (!customer.tags || customer.tags.length === 0) && (
                <>
                  <div className="premium-custom-tag tag-orange">高意向</div>
                  <div className="premium-custom-tag tag-red">重点跟进</div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* <div className="hero-actions">
          <Space size={12}>
            {customer.status === 'active' && <div className="status-indicator-pulse" />}
            <span className="status-text">{customer.status === 'active' ? '实时活跃' : '离线状态'}</span>
          </Space>
        </div> */}
      </div>

      <div className={`metrics-dashboard-premium ${isClue ? 'clue-mode' : ''} ${isEnrolled ? 'enrolled-mode' : ''}`}>
        <div className="metric-tile">
          <div className="metric-label">{isClue ? '线索停留时长' : (isEnrolledSubPool ? '掌握程度排名' : (isDealSubPool ? '实际成交金额' : '综合评价等级'))}</div>
          <div className="metric-value-row">
            {isEnrolledSubPool ? (
              <>
                <span className="metric-value neon-blue">{customer.attendanceRate || '1'}</span>
                {/* <span className="metric-unit">%</span> */}
              </>
            ) : isDealSubPool ? (
              <>
                <span className="metric-value neon-purple">{customer.dealAmount || '12800'}</span>
                <span className="metric-unit">元</span>
              </>
            ) : (
              <>
                <span className={`metric-value ${isClue ? 'neon-orange' : 'neon-purple'}`}>
                  {isClue ? '2.4' : (customer.level || customer.qualityScore)}
                </span>
                <span className="metric-unit">{isClue ? '小时' : ''}</span>
              </>
            )}
          </div>
          <div className="metric-footer">{isClue ? '未建联，需尽快处理' : (isEnrolledSubPool ? '学习情况排名靠前' : (isDealSubPool ? '已缴纳全款/定金' : '超越 92% 同类客户'))}</div>
        </div>

        {!isClue && (
          <div className="metric-tile">
            <div className="metric-label">{isEnrolled ? (isEnrolledSubPool ? '已耗课时/总课时' : '成交转化周期') : '成交意向度'}</div>
            <div className="metric-value-row">
              <span className={`metric-value ${isEnrolled ? 'neon-blue' : 'neon-green'}`}>
                {isEnrolled ? (isEnrolledSubPool ? '24/120' : '12') : `${customer.maturityScore || 85}%`}
              </span>
              {isEnrolled && !isEnrolledSubPool && <span className="metric-unit">天</span>}
            </div>
            <div className="metric-footer">{isEnrolled ? (isEnrolledSubPool ? '课耗进度正常' : '从线索录入到成单') : '处于[极高意向]区间'}</div>
          </div>
        )}

        <div className="metric-tile">
          <div className="metric-label">{isClue ? '录入时间' : (isEnrolled ? (isEnrolledSubPool ? '入学时间' : '成交时间') : '线索分配时间')}</div>
          <div className="metric-value-row small">
            <span className="metric-value">{customer.lastContactTime ? new Date(customer.lastContactTime).toISOString().split('T')[0] : '2026-03-30'}</span>
          </div>
          <div className="metric-footer">{isClue ? '系统自动抓取' : (isEnrolled ? (isEnrolledSubPool ? '已正式签约入读' : '已核销定金并入账') : `已分配给 [${customer.advisor || '张三'}]`)}</div>
        </div>

        <div className="metric-tile">
          <div className="metric-label">{isClue ? '线索来源' : (isEnrolledSubPool ? '成交产品' : (isDealSubPool ? '成交产品' : '最后跟进时间'))}</div>
          <div className="metric-value-row small">
            <span className="metric-value" style={{ fontSize: (isClue || isEnrolled) ? '16px' : undefined }}>{isClue ? (customer.source || '小红书') : (isEnrolledSubPool ? '私塾' : (isDealSubPool ? '直通车' : '2026-03-20'))}</span>
          </div>
          <div className="metric-footer">{isClue ? '' : (isEnrolledSubPool ? '学习状态：在读中' : (isDealSubPool ? '课程类型：正价课' : '沟通顺畅'))}</div>
        </div>

        {isClue && (
          <div className="metric-tile">
            <div className="metric-label">联系方式</div>
            <div className="metric-value-row small">
              <span className="metric-value" style={{ fontSize: '16px' }}>{customer.phone || '138' + Math.floor(10000000 + Math.random() * 90000000)}</span>
            </div>
            <div className="metric-footer">微信号: {customer.wechat || '未提供'}</div>
          </div>
        )}
      </div>

      <div className="modal-tabs-wrapper-premium">
        <Tabs
          defaultActiveKey="chat"
          centered
          className="premium-detail-tabs"
          items={[
            {
              key: 'chat',
              label: (<span>{isClue ? <PhoneOutlined /> : <MessageOutlined />} {isClue ? '电话沟通记录' : '沟通记录'}</span>),
              children: (
                <div className="tab-scroll-container premium-scrollbar chat-view">
                  {isClue ? (
                    // 纯线索的电话沟通记录：展示为电话记录列表
                    <div className="messenger-container" style={{ padding: '0 8px' }}>
                      <CommunicationRecords
                        records={mockPhoneCallRecords}
                      />
                    </div>
                  ) : (
                    // 已建联客户的沟通记录：使用微信聊天气泡样式
                    customer.chatRecords && customer.chatRecords.length > 0 ? (
                      <div className="messenger-container" style={{ padding: '0 8px' }}>
                        <CommunicationRecords
                          records={convertChatToCommunicationRecords(customer.chatRecords)}
                        />
                      </div>
                    ) : (
                      <Empty description="暂无沟通记录" />
                    )
                  )}
                </div>
              )
            },
            {
              key: 'history',
              label: (<span><DeploymentUnitOutlined /> 线索流转</span>),
              children: (
                <div className="tab-scroll-container history-timeline premium-scrollbar">
                  {timelineDataToRender.length > 0 ? (
                    <div className="conversion-steps-wrapper">
                      <Steps
                        direction="vertical"
                        size="small"
                        current={timelineDataToRender.length - 1}
                        items={timelineDataToRender}
                      />
                    </div>
                  ) : (
                    <Empty description="暂无进程数据" />
                  )}
                </div>
              )
            }
          ]}
        />
      </div>
    </PremiumModal>
  );
};

export default CustomerDetailModal;
