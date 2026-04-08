import React, { useMemo } from 'react';
import { Modal, type ModalProps } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { PremiumButton } from '@/components/PremiumForm';
import './index.less';

export interface PremiumModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 确认回调 */
  onOk?: () => void;
  /** 标题 */
  title: React.ReactNode;
  /** 副标题 */
  subtitle?: React.ReactNode;
  /** 内容 */
  children: React.ReactNode;
  /** 宽度 */
  width?: number | string;
  /** 高度 */
  height?: number | string;
  /** 主题模式 */
  themeMode?: 'light' | 'dark';
  /** 自定义类名 */
  className?: string;
  /** 关闭时销毁子元素 */
  destroyOnClose?: boolean;
  /** 确认按钮文案 */
  okText?: string;
  /** 取消按钮文案 */
  cancelText?: string;
  /** 是否显示确认按钮 */
  showOk?: boolean;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 确认按钮 loading 状态 */
  confirmLoading?: boolean;
  /** 额外的自定义按钮 (渲染在取消按钮左侧) */
  extraButtons?: React.ReactNode;
  /** 完全自定义底部 (传入 null 则隐藏整个底部) */
  footer?: React.ReactNode;
  /** 透传给 antd Modal 的其他属性 */
  modalProps?: Omit<ModalProps, 'open' | 'onCancel' | 'onOk' | 'title' | 'width' | 'destroyOnClose' | 'className' | 'footer'>;
}

/**
 * PremiumModal - 基于 antd Modal 的高级弹窗组件
 *
 * 特性：
 * - 继承 antd Modal 的动画系统，流畅无闪烁
 * - 支持 light/dark 主题
 * - 自定义标题区域（支持副标题）
 * - 统一且固定的底部操作按钮区 (支持 3D PremiumButton)
 * - 高度可配置
 */
const PremiumModal: React.FC<PremiumModalProps> = ({
  visible,
  onClose,
  onOk,
  title,
  subtitle,
  children,
  width = 1200,
  height = '80vh',
  className = '',
  themeMode = 'dark',
  destroyOnClose = true,
  okText = '确定',
  cancelText = '关闭',
  showOk = false,
  showCancel = true,
  confirmLoading = false,
  extraButtons,
  footer,
  modalProps,
}) => {
  // 合并类名
  const wrapClassName = useMemo(() => {
    const classes = ['premium-modal-wrapper'];
    classes.push(themeMode === 'dark' ? 'dark-theme' : 'light-theme');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [themeMode, className]);

  // 自定义标题渲染
  const titleNode = useMemo(() => (
    <div className="premium-modal-title-group">
      <div className="premium-modal-title">{title}</div>
      {subtitle && <div className="premium-modal-subtitle">{subtitle}</div>}
    </div>
  ), [title, subtitle]);

  // 渲染底部操作区
  const renderFooter = () => {
    if (footer === null) return null;
    if (footer) {
      return <div className="premium-modal-footer">{footer}</div>;
    }

    return (
      <div className="premium-modal-footer">
        <div className="premium-modal-footer-extra">
          {extraButtons}
        </div>
        <div className="premium-modal-footer-actions">
          {showCancel && (
            <PremiumButton variant="secondary" onClick={onClose}>
              {cancelText}
            </PremiumButton>
          )}
          {showOk && (
            <PremiumButton variant="primary" onClick={onOk} loading={confirmLoading}>
              {okText}
            </PremiumButton>
          )}
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={titleNode}
      width={width}
      destroyOnClose={destroyOnClose}
      wrapClassName={wrapClassName}
      centered
      footer={null} // 禁用 antd 默认 footer，因为我们自定义渲染在 content 内
      closeIcon={<CloseOutlined />}
      maskClosable
      keyboard
      afterClose={() => {
        // 确保关闭后清理可能残留的样式
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
      }}
      modalRender={(modal) => (
        <div className="premium-modal-outer-container">
          {modal}
        </div>
      )}
      styles={{
        body: { height, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
        content: { padding: 0, overflow: 'hidden' },
        mask: { backdropFilter: 'blur(8px)' },
      }}
      {...modalProps}
    >
      <div className="premium-modal-content-wrapper">
        <div className="premium-modal-content">
          {children}
        </div>
        {renderFooter()}
      </div>
    </Modal>
  );
};

export default PremiumModal;
