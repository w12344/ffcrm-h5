import React, { useState } from 'react';
import { Upload, Button, message, Table } from 'antd';
import { UploadOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import PremiumModal from '@/components/PremiumModal';

interface BossBusinessReportModalProps {
  visible: boolean;
  onClose: () => void;
  themeClass: string;
}

const BossBusinessReportModal: React.FC<BossBusinessReportModalProps> = ({ visible, onClose, themeClass }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    if (lines.length === 0) return;

    // Find max columns
    let maxCols = 0;
    lines.forEach(line => {
      const cols = line.split(',');
      if (cols.length > maxCols) maxCols = cols.length;
    });

    const newColumns = Array.from({ length: maxCols }).map((_, i) => ({
      title: `列 ${i + 1}`,
      dataIndex: `col${i}`,
      key: `col${i}`,
      width: 120,
      render: (text: string) => <div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div>
    }));

    const newData: any[] = [];
    lines.forEach((line, index) => {
      if (!line.trim()) return;
      const cols = line.split(',');
      const row: any = { key: index.toString() };
      cols.forEach((col, i) => {
        row[`col${i}`] = col.trim() || '-';
      });
      newData.push(row);
    });

    setColumns(newColumns);
    setCsvData(newData);
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
      message.success(`${file.name} 导入成功`);
    };
    reader.onerror = () => {
      message.error(`读取文件失败`);
    };
    reader.readAsText(file);
    return false; // Prevent auto upload
  };

  return (
    <PremiumModal
      visible={visible}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileExcelOutlined style={{ color: '#52c41a', fontSize: '22px' }} />
          <span>老板专属经营表 (Excel 兜底)</span>
        </div>
      }
      subtitle="EXCLUSIVE EXECUTIVE BUSINESS LEDGER"
      themeMode={themeClass === 'dark-theme' ? 'dark' : 'light'}
      className="boss-excel-modal"
      width="95vw"
    >
      <div style={{ padding: '0', minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Upload
            accept=".csv"
            beforeUpload={handleUpload}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList.slice(-1))}
            showUploadList={false}
          >
            <Button type="primary" icon={<UploadOutlined />} style={{ borderRadius: '8px' }}>上传数据源 (CSV)</Button>
          </Upload>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', opacity: 0.7 }}>
            支持无缝对接 `业务数据 - 业务.csv` 格式，保障数字精准备底。
          </span>
        </div>

        {csvData.length > 0 ? (
          <Table
            dataSource={csvData}
            columns={columns}
            pagination={false}
            scroll={{ x: 'max-content', y: 'calc(75vh - 120px)' }}
            size="small"
            bordered
            rowClassName={(_, index) => index % 2 === 0 ? 'excel-row-light' : 'excel-row-dark'}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', opacity: 0.5, fontSize: '16px' }}>
            暂未导入数据，请点击上方按钮导入 Excel/CSV 进行兜底。
          </div>
        )}
      </div>
    </PremiumModal>
  );
};

export default BossBusinessReportModal;
