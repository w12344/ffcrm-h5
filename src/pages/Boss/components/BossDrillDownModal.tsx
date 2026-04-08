import React, { useMemo } from 'react';
import { Table, Badge } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import PremiumModal from '@/components/PremiumModal';

interface BossDrillDownModalProps {
  visible: boolean;
  onClose: () => void;
  productName: string;
  themeClass: string;
}

const BossDrillDownModal: React.FC<BossDrillDownModalProps> = ({ visible, onClose, productName, themeClass }) => {
  const mockStudents = useMemo(() => {
    const statuses = ['已入学', '待开班', '已退费', '退学'];
    return Array.from({ length: 45 }).map((_, i) => ({
      key: i.toString(),
      id: `STU${20000 + i}`,
      name: `学员${i + 1}`,
      product: productName,
      advisor: ['张莹', '吴亚丽', '金雷拉', '王静'][i % 4],
      amount: [50000, 110000, 60000, 0][i % 4],
      status: statuses[i % 4],
      date: `2026-03-${String(1 + (i % 30)).padStart(2, '0')}`,
    }));
  }, [productName]);

  const columns = [
    { title: '学员ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '报读产品', dataIndex: 'product', key: 'product', width: 120 },
    { title: '归属顾问', dataIndex: 'advisor', key: 'advisor', width: 100 },
    { title: '实际落袋金额(元)', dataIndex: 'amount', key: 'amount', width: 150 },
    { title: '缴费日期', dataIndex: 'date', key: 'date', width: 120 },
    {
      title: '交付健康度(状态)',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => {
        let color = '#8c8c8c'; // 灰色 - 退学
        if (status === '已入学') color = '#ff4d4f'; // 红色
        else if (status === '待开班') color = '#faad14'; // 黄色
        else if (status === '已退费') color = '#1890ff'; // 蓝色

        return (
          <span style={{ color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Badge color={color} />
            {status}
          </span>
        );
      }
    },
  ];

  return (
    <PremiumModal
      visible={visible}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileExcelOutlined style={{ color: '#52c41a', fontSize: '22px' }} />
          <span>{productName} - 详表明细 (Excel视图)</span>
        </div>
      }
      subtitle="DETAILED PRODUCT TRANSACTION LEDGER"
      themeMode={themeClass === 'dark-theme' ? 'dark' : 'light'}
      className="boss-excel-modal"
      width="90vw"
    >
      <div style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
        <Table
          dataSource={mockStudents}
          columns={columns}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 'max-content', y: 'calc(70vh - 100px)' }}
          size="small"
          bordered
          rowClassName={(_, index) => index % 2 === 0 ? 'excel-row-light' : 'excel-row-dark'}
        />
      </div>
    </PremiumModal>
  );
};

export default BossDrillDownModal;
