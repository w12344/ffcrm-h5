import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseOutlined } from '@ant-design/icons';
import './index.less';

interface BossModalProps {
  visible: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
  themeClass?: string;
  customClassName?: string;
}

/**
 * BossModal - A premium, strategic-styled modal base component.
 * Follows the 'Material' encapsulation pattern suggested by the Juejin article.
 */
const BossModal: React.FC<BossModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  width = '90vw',
  height = 'auto',
  themeClass = '',
  customClassName = ''
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!visible || !mounted) return null;

  const modalContent = (
    <div className={themeClass}>
      <div className="boss-modal-overlay" onClick={onClose} />

      <div
        className={`boss-modal-shell ${customClassName}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          maxWidth: '98vw', // Maximize available width
          maxHeight: '98vh' // Maximize available height
        }}
      >
        <div className="boss-modal-header">
          <div className="boss-modal-title-group">
            <div className="boss-modal-title">{title}</div>
            {subtitle && <div className="boss-modal-subtitle">{subtitle}</div>}
          </div>
          <button className="boss-modal-close-btn" onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>

        <div className="boss-modal-content">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BossModal;
