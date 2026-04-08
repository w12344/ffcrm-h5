import React, { useState } from 'react';
import { Rate } from 'antd';
import PremiumModal from '@/components/PremiumModal';
import GlassTable from '@/components/GlassTable';
import { GlassColumnType } from '@/components/GlassTable/types';
import { ClueItem } from '../mock';
import CustomerDetailModal from '@/pages/Market/components/CustomerDetailModal';
import { Customer } from '@/types/dashboard';

interface ClueTableModalProps {
  visible: boolean;
  onClose: () => void;
  clues: ClueItem[];
  themeMode?: 'dark' | 'light';
}

const ClueTableModal: React.FC<ClueTableModalProps> = ({
  visible,
  onClose,
  clues,
  themeMode = 'light'
}) => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleViewDetail = (record: ClueItem) => {
    // Map ClueItem to Customer for the detail modal
    const mockCustomer: Customer = {
      id: record.id,
      name: record.name,
      level: record.valueLevel === 'high' ? 'A' : record.valueLevel === 'standard' ? 'B' : 'C',
      importance: record.valueLevel === 'high' ? 5 : record.valueLevel === 'standard' ? 3 : 1,
      tags: record.valueLevel === 'high' ? ['高意向', '重点跟进'] : ['一般跟进'],
      qualityScore: 80,
      maturityScore: 50,
      lastContactTime: new Date(record.timeCreated),
      status: 'active',
      createTime: new Date(record.timeCreated),
      isPinned: false,
      hasUnresolvedObjection: false,
      hasAIRisk: false,
      hasAIOpportunity: false,
      isConverted: false,
      phone: record.phone,
      source: record.channel === 'social' ? '社交媒体' : record.channel === 'referral' ? '转介绍' : record.channel === 'ground' ? '地推' : '陌拜',
      advisor: record.advisor,
    };
    setSelectedCustomer(mockCustomer);
    setDetailVisible(true);
  };
  const columns: GlassColumnType<ClueItem>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text) => (
        <span style={{
          background: 'linear-gradient(rgb(255, 185, 41) 0%, rgb(255, 127, 183) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 600
        }}>
          {text}
        </span>
      )
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: '意向级别',
      dataIndex: 'valueLevel',
      key: 'valueLevel',
      width: 100,
      render: (level) => {
        const value = level === 'high' ? 5 : level === 'standard' ? 3 : 1;
        return <Rate disabled allowHalf value={value} style={{ fontSize: '14px', color: '#FFB929' }} />;
      }
    },
    {
      title: '线索来源',
      dataIndex: 'channel',
      key: 'channel',
      width: 120,
      render: (channel) => {
        const channelMap: Record<string, string> = {
          'social': '社交媒体',
          'referral': '转介绍',
          'ground': '地推',
          'cold': '陌拜'
        };
        return channelMap[channel] || channel;
      }
    },
    {
      title: '最新跟进内容',
      dataIndex: 'latestFollowUpContent',
      key: 'latestFollowUpContent',
      width: 250,
      ellipsis: true,
    },
    {
      title: '最新跟进时间',
      dataIndex: 'latestFollowUpTime',
      key: 'latestFollowUpTime',
      width: 160,
    },
    {
      title: '跟进阶段',
      dataIndex: 'followUpStage',
      key: 'followUpStage',
      width: 100,
    },
    {
      title: '归属人',
      dataIndex: 'advisor',
      key: 'advisor',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_, record: ClueItem) => (
        <div className="action-space" style={{ display: 'flex', gap: '8px' }}>
          <a className="glass-action-link" style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => handleViewDetail(record)}>查看详情</a>
        </div>
      ),
    },
  ];

  return (
    <>
      <PremiumModal
        visible={visible}
        onClose={onClose}
        title="线索列表明细"
        width="90vw"
        themeMode={themeMode}
        footer={null}
      >
        <div style={{ height: '500px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <GlassTable
            columns={columns}
            dataSource={clues}
            scroll={{ y: 400 }}
            pagination={false}
          />
        </div>
      </PremiumModal>

      <CustomerDetailModal
        visible={detailVisible}
        customer={selectedCustomer}
        onCancel={() => setDetailVisible(false)}
        themeMode={themeMode}
        poolType="clue"
      />
    </>
  );
};

export default ClueTableModal;
