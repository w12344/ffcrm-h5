import React, { memo, useState, useEffect } from 'react';
import { Button, Spin, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import PremiumModal from '@/components/PremiumModal';

interface ContractPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  contractUrl: string;
  contractTitle: string;
}

/**
 * 合同预览弹窗组件
 * 使用 WPS 在线预览服务
 */
const ContractPreviewModal: React.FC<ContractPreviewModalProps> = memo(({
  visible,
  onClose,
  contractUrl,
  contractTitle,
}) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // 重置加载状态
  useEffect(() => {
    if (visible) {
      setLoading(true);
      // 设置一个超时，如果5秒后还在加载，就隐藏加载提示
      const timer = setTimeout(() => {
        setLoading(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // 处理下载
  const handleDownload = async () => {
    try {
      setDownloading(true);
      message.loading({ content: '正在准备下载...', key: 'download', duration: 0 });

      const fileName = contractTitle.endsWith('.pdf') ? contractTitle : `${contractTitle}.pdf`;

      // 方法1: 尝试使用代理 URL 下载（如果是 OSS URL）
      if (contractUrl.includes('ffjy-data.oss-cn-heyuan.aliyuncs.com')) {
        const path = contractUrl.replace('https://ffjy-data.oss-cn-heyuan.aliyuncs.com', '');
        // 添加 download 参数强制下载，并传递文件名
        const proxyUrl = `/oss-pdf${path}?download=true&filename=${encodeURIComponent(fileName)}`;

        try {
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error('代理下载失败');

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          message.success({ content: '下载成功', key: 'download' });
          return;
        } catch (proxyError) {
          console.warn('代理下载失败，尝试直接下载:', proxyError);
        }
      }

      // 方法2: 直接使用原始 URL（添加 download 参数）
      const link = document.createElement('a');
      link.href = contractUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success({ content: '已触发下载', key: 'download' });
    } catch (error) {
      console.error('下载失败:', error);
      message.error({ content: '下载失败，请重试', key: 'download' });
    } finally {
      setDownloading(false);
    }
  };

  // 将 OSS URL 转换为代理 URL，用于预览而非下载
  const convertToProxyUrl = (url: string) => {
    // 如果是 OSS URL，转换为代理 URL
    if (url.includes('ffjy-data.oss-cn-heyuan.aliyuncs.com')) {
      const path = url.replace('https://ffjy-data.oss-cn-heyuan.aliyuncs.com', '');
      return `/oss-pdf${path}`;
    }
    return url;
  };

  // 构建 PDF 预览 URL
  const proxyUrl = convertToProxyUrl(contractUrl);
  const pdfViewUrl = proxyUrl.includes('#')
    ? proxyUrl
    : `${proxyUrl}#toolbar=0&navpanes=0&view=FitH`;

  return (
    <PremiumModal
      title={`下载合同：${contractTitle}`}
      visible={visible}
      onClose={onClose}
      width="90%"
      destroyOnClose
    >
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
        }}>
          <Spin size="large" tip="正在加载合同预览..." />
        </div>
      )}
      <embed
        src={pdfViewUrl}
        type="application/pdf"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        onLoad={() => setLoading(false)}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          loading={downloading}
          size="large"
        >
          下载合同
        </Button>
        <Button
          onClick={onClose}
          size="large"
        >
          关闭
        </Button>
      </div>
    </PremiumModal>
  );
});

ContractPreviewModal.displayName = 'ContractPreviewModal';

export default ContractPreviewModal;
