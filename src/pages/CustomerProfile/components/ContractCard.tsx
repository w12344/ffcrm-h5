import React, { memo } from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ContractInfo } from '../types';
import { smartNavigate } from '@/utils/url';

interface ContractTableProps {
  contracts: ContractInfo[];
}

/**
 * 合同列表表格组件
 * 使用 Table 展示合同信息
 */
const ContractTable: React.FC<ContractTableProps> = memo(({ contracts }) => {
  // 获取合同状态标签颜色
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'task_finished': 'success',
      'task_pending': 'processing',
      'task_failed': 'error',
      'task_cancelled': 'default',
    };
    return statusMap[status] || 'default';
  };

  // 处理预览合同 - 在新窗口打开查看
  const handlePreview = (url: string) => {
    // 在新窗口打开 PDF 进行预览
    smartNavigate(url, '_blank', 'noopener,noreferrer');
  };

  // 处理下载合同 - 触发下载
  const handleDownload = (url: string, title: string) => {
    // 创建一个隐藏的 a 标签触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'contract.pdf';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 表格列定义
  const columns: ColumnsType<ContractInfo> = [
    {
      title: '合同标题',
      dataIndex: 'contractTitle',
      key: 'contractTitle',
      width: 300,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'contractStatusName',
      key: 'contractStatusName',
      width: 120,
      render: (text: string, record: ContractInfo) => (
        <Tag color={getStatusColor(record.contractStatus)}>{text}</Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
      render: (text: string | null) => text || '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string | undefined) => {
        if (!text) return '-';
        const date = new Date(text);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: ContractInfo) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record.contractDocumentUrl)}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.contractDocumentUrl, record.contractTitle)}
          >
            下载
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table<ContractInfo>
      columns={columns}
      dataSource={contracts}
      rowKey="id"
      pagination={false}
      scroll={{ x: 1000 }}
    />
  );
});

ContractTable.displayName = 'ContractTable';

export default ContractTable;
