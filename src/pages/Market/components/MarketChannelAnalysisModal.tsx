import React from 'react';
import { Table } from 'antd';
import { FundProjectionScreenOutlined } from '@ant-design/icons';
import PremiumModal from '@/components/PremiumModal';

interface MarketChannelAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  themeClass: string;
  metricTitle?: string;
}

const MarketChannelAnalysisModal: React.FC<MarketChannelAnalysisModalProps> = ({ visible, onClose, themeClass, metricTitle }) => {
  // Mock data for channels
  const mockData = [
    {
      key: '1',
      channel: '微信公众号',
      leads: 450,
      connected: 320,
      connectedRate: '71.1%',
      highIntent: 120,
      highIntentRate: '37.5%',
      deals: 25,
      dealRate: '7.8%',
      revenue: '18.5w',
      children: [
        {
          key: '1-1',
          channel: '销售-张伟',
          leads: 200,
          connected: 150,
          connectedRate: '75.0%',
          highIntent: 60,
          highIntentRate: '40.0%',
          deals: 15,
          dealRate: '10.0%',
          revenue: '11.5w',
        },
        {
          key: '1-2',
          channel: '销售-李娜',
          leads: 250,
          connected: 170,
          connectedRate: '68.0%',
          highIntent: 60,
          highIntentRate: '35.3%',
          deals: 10,
          dealRate: '5.9%',
          revenue: '7.0w',
        }
      ]
    },
    {
      key: '2',
      channel: '抖音',
      leads: 380,
      connected: 280,
      connectedRate: '73.6%',
      highIntent: 95,
      highIntentRate: '33.9%',
      deals: 18,
      dealRate: '6.4%',
      revenue: '12.8w',
      children: [
        {
          key: '2-1',
          channel: '销售-张伟',
          leads: 180,
          connected: 140,
          connectedRate: '77.8%',
          highIntent: 50,
          highIntentRate: '35.7%',
          deals: 10,
          dealRate: '7.1%',
          revenue: '7.5w',
        },
        {
          key: '2-2',
          channel: '销售-王强',
          leads: 200,
          connected: 140,
          connectedRate: '70.0%',
          highIntent: 45,
          highIntentRate: '32.1%',
          deals: 8,
          dealRate: '5.7%',
          revenue: '5.3w',
        }
      ]
    },
    {
      key: '3',
      channel: '线下活动',
      leads: 210,
      connected: 190,
      connectedRate: '90.4%',
      highIntent: 110,
      highIntentRate: '57.8%',
      deals: 35,
      dealRate: '18.4%',
      revenue: '35.0w',
      children: [
        {
          key: '3-1',
          channel: '销售-李娜',
          leads: 110,
          connected: 100,
          connectedRate: '90.9%',
          highIntent: 60,
          highIntentRate: '60.0%',
          deals: 20,
          dealRate: '20.0%',
          revenue: '20.0w',
        },
        {
          key: '3-2',
          channel: '销售-王强',
          leads: 100,
          connected: 90,
          connectedRate: '90.0%',
          highIntent: 50,
          highIntentRate: '55.6%',
          deals: 15,
          dealRate: '16.7%',
          revenue: '15.0w',
        }
      ]
    },
    {
      key: '4',
      channel: '转介绍',
      leads: 120,
      connected: 115,
      connectedRate: '95.8%',
      highIntent: 85,
      highIntentRate: '73.9%',
      deals: 42,
      dealRate: '36.5%',
      revenue: '45.2w',
      children: [
        {
          key: '4-1',
          channel: '销售-张伟',
          leads: 60,
          connected: 58,
          connectedRate: '96.7%',
          highIntent: 45,
          highIntentRate: '77.6%',
          deals: 22,
          dealRate: '37.9%',
          revenue: '23.0w',
        },
        {
          key: '4-2',
          channel: '销售-李娜',
          leads: 60,
          connected: 57,
          connectedRate: '95.0%',
          highIntent: 40,
          highIntentRate: '70.2%',
          deals: 20,
          dealRate: '35.1%',
          revenue: '22.2w',
        }
      ]
    },
    {
      key: '5',
      channel: '官网SEO',
      leads: 120,
      connected: 85,
      connectedRate: '70.8%',
      highIntent: 35,
      highIntentRate: '41.1%',
      deals: 8,
      dealRate: '9.4%',
      revenue: '6.5w',
      children: [
        {
          key: '5-1',
          channel: '销售-王强',
          leads: 120,
          connected: 85,
          connectedRate: '70.8%',
          highIntent: 35,
          highIntentRate: '41.1%',
          deals: 8,
          dealRate: '9.4%',
          revenue: '6.5w',
        }
      ]
    }
  ];

  const columns = [
    {
      title: '渠道名称',
      dataIndex: 'channel',
      key: 'channel',
      width: 140,
      fixed: 'left' as const,
      render: (text: string, record: any) => {
        // Apply different styles depending on if it's a parent (channel) or child (sales rep) row
        if (record.children) {
          return <strong style={{ color: 'var(--text-primary)' }}>{text}</strong>;
        }
        return <span style={{ color: 'var(--text-secondary)', paddingLeft: '8px' }}>{text}</span>;
      }
    },
    {
      title: '线索获取',
      children: [
        {
          title: '总线索数',
          dataIndex: 'leads',
          key: 'leads',
          width: 110,
          sorter: (a: any, b: any) => a.leads - b.leads,
        },
      ]
    },
    {
      title: '线索质量与流转',
      children: [
        {
          title: '已建联数',
          dataIndex: 'connected',
          key: 'connected',
          width: 110,
          sorter: (a: any, b: any) => a.connected - b.connected,
        },
        {
          title: '建联率',
          dataIndex: 'connectedRate',
          key: 'connectedRate',
          width: 100,
        },
        {
          title: '高意向数',
          dataIndex: 'highIntent',
          key: 'highIntent',
          width: 110,
          sorter: (a: any, b: any) => a.highIntent - b.highIntent,
        },
        {
          title: '高意向占比',
          dataIndex: 'highIntentRate',
          key: 'highIntentRate',
          width: 110,
        },
      ]
    },
    {
      title: '成交与转化',
      children: [
        {
          title: '成交数',
          dataIndex: 'deals',
          key: 'deals',
          width: 100,
          sorter: (a: any, b: any) => a.deals - b.deals,
        },
        {
          title: '成交率',
          dataIndex: 'dealRate',
          key: 'dealRate',
          width: 120,
        },
        {
          title: '带来营收',
          dataIndex: 'revenue',
          key: 'revenue',
          width: 110,
          render: (text: string) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>¥{text}</span>
        },
      ]
    }
  ];

  return (
    <PremiumModal
      visible={visible}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FundProjectionScreenOutlined style={{ color: '#8b5cf6', fontSize: '22px' }} />
          <span>{metricTitle ? `${metricTitle} - 渠道转化分析` : '市场渠道转化分析详表'}</span>
        </div>
      }
      subtitle="MARKET CHANNEL CONVERSION ANALYSIS"
      themeMode={themeClass === 'dark-theme' ? 'dark' : 'light'}
      className="market-channel-modal"
      width="90vw"
    >
      <div style={{ padding: '16px 0', minHeight: '50vh', display: 'flex', flexDirection: 'column' }}>
        <Table
          dataSource={mockData}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content', y: 'calc(70vh - 160px)' }}
          size="middle"
          bordered
          rowClassName={(_, index) => index % 2 === 0 ? 'excel-row-light' : 'excel-row-dark'}
          expandable={{
            defaultExpandAllRows: false,
            expandRowByClick: true,
            rowExpandable: (record) => !!record.children && record.children.length > 0,
          }}
          summary={pageData => {
            let totalLeads = 0;
            let totalConnected = 0;
            let totalHighIntent = 0;
            let totalDeals = 0;
            let totalRevenueNum = 0;

            pageData.forEach(({ leads, connected, highIntent, deals, revenue }) => {
              totalLeads += leads;
              totalConnected += connected;
              totalHighIntent += highIntent;
              totalDeals += deals;
              totalRevenueNum += parseFloat(revenue.replace('w', ''));
            });

            return (
              <Table.Summary.Row style={{ background: themeClass === 'dark-theme' ? 'rgba(255,255,255,0.05)' : '#fafafa', fontWeight: 'bold' }}>
                <Table.Summary.Cell index={0}>总计</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>{totalLeads}</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>{totalConnected}</Table.Summary.Cell>
                <Table.Summary.Cell index={3}>{((totalConnected / totalLeads) * 100).toFixed(1)}%</Table.Summary.Cell>
                <Table.Summary.Cell index={4}>{totalHighIntent}</Table.Summary.Cell>
                <Table.Summary.Cell index={5}>{((totalHighIntent / totalConnected) * 100).toFixed(1)}%</Table.Summary.Cell>
                <Table.Summary.Cell index={6}>{totalDeals}</Table.Summary.Cell>
                <Table.Summary.Cell index={7}>{((totalDeals / totalConnected) * 100).toFixed(1)}%</Table.Summary.Cell>
                <Table.Summary.Cell index={8}><span style={{ color: '#52c41a' }}>¥{totalRevenueNum.toFixed(1)}w</span></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </div>
    </PremiumModal>
  );
};

export default MarketChannelAnalysisModal;
