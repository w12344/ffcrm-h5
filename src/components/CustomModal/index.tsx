import React from 'react';
import './index.less';

type CustomModalProps = {
  visible: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  maskClosable?: boolean;
};

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  title,
  children,
  okText = '确定',
  cancelText = '取消',
  onOk,
  onCancel,
  maskClosable = true,
}) => {
  if (!visible) return null;

  const handleMaskClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget && maskClosable) {
      onCancel && onCancel();
    }
  };

  return (
    <div className="custom-modal-mask" onClick={handleMaskClick}>
      <div className="custom-modal-container">
        {title && <div className="custom-modal-header">{title}</div>}
        <div className="custom-modal-body">{children}</div>
        <div className="custom-modal-footer">
          <button className="custom-modal-btn cancel" onClick={onCancel}>{cancelText}</button>
          <button className="custom-modal-btn ok" onClick={onOk}>{okText}</button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;


