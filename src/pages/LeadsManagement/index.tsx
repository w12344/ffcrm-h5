import React, { useState } from 'react';
import { notification, Button, Dropdown, Rate, Popconfirm } from 'antd';
import { PlusOutlined, UserAddOutlined, DownOutlined, ExportOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { useTheme } from '@/hooks/useTheme';
import DashboardHeader from '../Dashboard/components/DashboardHeader';
import LeadEntryModal from '../Market/components/LeadEntryModal';
import AssignAdvisorModal from './components/AssignAdvisorModal';
import CustomerDetailModal from '../Market/components/CustomerDetailModal';
import GlassTable from '@/components/GlassTable';
import { FilterItem, GlassAction, GlassColumnType } from '@/components/GlassTable/types';
import { MOCK_LEADS, STATUS_CONFIG, LeadItem } from './constants';
import './index.less';

const LeadsManagement: React.FC = () => {
  const { isDark } = useTheme();
  const themeClass = isDark ? 'dark-theme' : 'light-theme';

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [leadsData, setLeadsData] = useState<LeadItem[]>(MOCK_LEADS);
  const [isEntryModalVisible, setIsEntryModalVisible] = useState(false);
  const [isDistributeVisible, setIsDistributeVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const handleEntryOk = (values: any) => {
    notification.success({
      message: '线索录入成功',
      description: `线索 [${values.name}] 已成功进入候选池`,
      placement: 'topRight',
    });
    setIsEntryModalVisible(false);
  };

  const handleDistributeConfirm = (_advisorId: string, advisorName: string) => {
    notification.success({
      message: '分配成功',
      description: `已将 ${selectedRowKeys.length || '全部'} 条线索分配给顾问【${advisorName}】`,
      placement: 'topRight',
    });
    setIsDistributeVisible(false);
    setSelectedRowKeys([]);
  };

  const handleDelete = (id: string) => {
    setLeadsData(prev => prev.filter(item => item.id !== id));
    notification.success({
      message: '删除成功',
      description: '已成功删除该线索',
      placement: 'topRight',
    });
  };

  const handleViewDetail = (record: LeadItem) => {
    setSelectedCustomer({
      id: record.id,
      name: record.name,
      level: record.intentLevel === '高意向' ? 'A' : record.intentLevel === '一般意向' ? 'B' : 'C',
      importance: record.intentLevel === '高意向' ? 5 : record.intentLevel === '一般意向' ? 3 : 1,
      tags: ['线上来源', '需跟进'],
      type: 'lead',
      phone: record.phone,
      lastFollowUp: record.latestFollowUpTime,
      nextFollowUp: record.latestFollowUpTime,
      amount: 0
    });
    setDetailModalVisible(true);
  };

  const LEAD_SOURCES = [
    "A类", "B类", "线上一类", "廖-二类", "廖-一类",
    "转介绍（参与活动）", "转介绍（未参与活动）", "转介绍（后端提供线索）",
    "转介绍（个性化）", "转介绍（续班）", "小红书（嘉）",
    "自拓-视频号", "自拓-抖音", "自拓-小红书", "自拓-地推", "自拓-其他",
    "朱辉-视频号", "朱辉-小红书", "朱辉-抖音", "品宣", "渠道内名单",
    "私人代理", "往届非凡", "直上", "线下市场", "未知", "其他",
  ];

  // 1. Define Filter Schema
  const filterSchema: FilterItem[] = [
    { key: 'keyword', type: 'search', placeholder: '输入姓名、手机进行查询', width: 280 },
    {
      key: 'intent',
      type: 'select',
      placeholder: '意向级别',
      options: [
        { label: <Rate disabled value={5} style={{ fontSize: 14, color: '#FFB929' }} />, value: '5' },
        { label: <Rate disabled value={4} style={{ fontSize: 14, color: '#FFB929' }} />, value: '4' },
        { label: <Rate disabled value={3} style={{ fontSize: 14, color: '#FFB929' }} />, value: '3' },
        { label: <Rate disabled value={2} style={{ fontSize: 14, color: '#FFB929' }} />, value: '2' },
        { label: <Rate disabled value={1} style={{ fontSize: 14, color: '#FFB929' }} />, value: '1' },
      ],
      width: 140
    },
    {
      key: 'source',
      type: 'select',
      placeholder: '线索来源',
      options: LEAD_SOURCES.map(source => ({ label: source, value: source })),
      width: 140
    },
    {
      key: 'status',
      type: 'select',
      placeholder: '跟进状态',
      options: [
        { label: '有意考生愿意加微信', value: 'interested_will_add' },
        { label: '有意考生不愿意加微信', value: 'interested_wont_add' },
        { label: '无意考生', value: 'not_interested' },
        { label: '未联系', value: 'uncontacted' },
      ],
      width: 160
    },
    {
      key: 'advisor',
      type: 'select',
      placeholder: '所属顾问',
      options: [
        { label: '张伟', value: '张伟' },
        { label: '李娜', value: '李娜' },
        { label: '王强', value: '王强' },
      ],
      width: 110
    },
    {
      key: 'date',
      type: 'dateRange',
      placeholder: ['开始日期', '结束日期'],
    }
  ];

  // 3. Define Columns
  const columns: GlassColumnType<LeadItem>[] = [
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
      title: '手机号码',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: '意向级别',
      dataIndex: 'intentLevel',
      key: 'intentLevel',
      width: 120,
      render: (level) => {
        const value = level === '高意向' ? 5 : level === '一般意向' ? 3 : 1;
        return <Rate disabled allowHalf value={value} style={{ fontSize: '14px', color: '#FFB929' }} />;
      }
    },
    {
      title: '线索来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
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
      title: '跟进状态',
      dataIndex: 'followUpStatus',
      key: 'followUpStatus',
      width: 100,
    },
    {
      title: '归属人',
      dataIndex: 'advisor',
      key: 'advisor',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      isTag: true,
      tagColor: (status: keyof typeof STATUS_CONFIG) => STATUS_CONFIG[status]?.color || '#1890ff',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_, record: LeadItem) => (
        <div className="action-space">
          <a className="glass-action-link" onClick={() => handleViewDetail(record)}>查看详情</a>
          <span className="glass-action-divider">|</span>
          <a className="glass-action-link">编辑</a>
          <span className="glass-action-divider">|</span>
          <Popconfirm
            title="确认删除该线索吗？"
            description="删除后将无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确认删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <a className="glass-action-link danger">删除</a>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 4. Define Actions
  const extraActions: GlassAction[] = [
    {
      key: 'add',
      label: '录入线索',
      icon: <PlusOutlined />,
      highlight: true,
      onClick: () => setIsEntryModalVisible(true)
    },
    {
      key: 'distribute',
      label: '批量分配',
      icon: <UserAddOutlined />,
      type: 'danger',
      onClick: () => setIsDistributeVisible(true)
    },
    {
      key: 'batch-export',
      label: '批量导出',
      icon: <ExportOutlined />,
      type: 'default',
      highlight: selectedRowKeys.length > 0,
      onClick: () => {
        if (selectedRowKeys.length === 0) {
          notification.warning({
            message: '提示',
            description: '请先选择需要导出的线索',
            placement: 'topRight',
          });
          return;
        }
        notification.success({
          message: '导出成功',
          description: `已成功导出 ${selectedRowKeys.length} 条线索`,
          placement: 'topRight',
        });
      }
    },
  ];

  const batchActions = (
    <>
      <span className="batch-info">
        已选 <span className="batch-count">{selectedRowKeys.length}</span> 个
      </span>
      <Dropdown
        menu={{ items: [{ key: '1', label: '批量修改状态' }, { key: '2', label: '批量修改意向' }] }}
      >
        <Button size="small">
          编辑 <DownOutlined />
        </Button>
      </Dropdown>
      <Dropdown
        menu={{ items: [{ key: '1', label: '转移给其他顾问' }] }}
      >
        <Button size="small">
          转移 <DownOutlined />
        </Button>
      </Dropdown>
    </>
  );

  return (
    <Layout>
      <div className={`leads-management-page ${themeClass}`}>
        <DashboardHeader />

        <div className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <GlassTable
              columns={columns}
              dataSource={leadsData}
              filterSchema={filterSchema}
              extraActions={extraActions}
              batchActions={batchActions}
              rowSelection={{
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
              scroll={{ x: 'max-content', y: '100%' }}
            />
          </div>
        </div>

        <LeadEntryModal
          visible={isEntryModalVisible}
          onCancel={() => setIsEntryModalVisible(false)}
          onOk={handleEntryOk}
          themeMode={isDark ? 'dark' : 'light'}
        />

        <AssignAdvisorModal
          visible={isDistributeVisible}
          selectedCount={selectedRowKeys.length}
          onCancel={() => setIsDistributeVisible(false)}
          onConfirm={handleDistributeConfirm}
          themeMode={isDark ? 'dark' : 'light'}
        />

        <CustomerDetailModal
          visible={detailModalVisible}
          customer={selectedCustomer}
          onCancel={() => setDetailModalVisible(false)}
          themeMode={isDark ? 'dark' : 'light'}
        />
      </div>
    </Layout>
  );
};

export default LeadsManagement;
