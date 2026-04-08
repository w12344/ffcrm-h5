import React from 'react';
import { Button } from 'antd';
import './index.less';

interface EmptyStateProps {
  /** 
   * 提示标题
   * @default "暂无数据"
   */
  title?: string;
  /** 
   * 辅助说明文字 
   */
  description?: React.ReactNode;
  /** 
   * 自定义图片，可以是 ReactNode 或者图片 URL
   */
  image?: React.ReactNode | string;
  /** 
   * 图片样式
   */
  imageStyle?: React.CSSProperties;
  /** 
   * 底部操作区
   */
  action?: React.ReactNode;
  /** 
   * 是否撑满父容器高度（居中显示）
   * @default true
   */
  fullHeight?: boolean;
  /** 
   * 自定义类名
   */
  className?: string;
  /** 
   * 自定义样式
   */
  style?: React.CSSProperties;
  /**
   * 按钮文字（如果提供了 onButtonClick）
   */
  buttonText?: string;
  /**
   * 按钮点击回调
   */
  onButtonClick?: () => void;
}

const DefaultEmptyImage = () => (
  <svg width="120" height="120" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="paint0_linear" x1="80" y1="40" x2="80" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="var(--color-primary, #165dff)" stopOpacity="0.1"/>
        <stop offset="1" stopColor="var(--color-primary, #165dff)" stopOpacity="0.02"/>
      </linearGradient>
    </defs>
    <circle cx="80" cy="80" r="60" fill="url(#paint0_linear)"/>
    <path d="M106 102L116 112" stroke="var(--color-primary, #165dff)" strokeWidth="6" strokeLinecap="round" opacity="0.4"/>
    <path d="M50 50L60 60" stroke="var(--color-primary, #165dff)" strokeWidth="4" strokeLinecap="round" opacity="0.2"/>
    <path d="M110 55L100 65" stroke="var(--color-primary, #165dff)" strokeWidth="4" strokeLinecap="round" opacity="0.2"/>
    <rect x="55" y="55" width="50" height="60" rx="4" fill="white" stroke="var(--color-border-base, #e5e6eb)" strokeWidth="2"/>
    <path d="M65 70H95" stroke="var(--color-border-base, #e5e6eb)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M65 80H95" stroke="var(--color-border-base, #e5e6eb)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M65 90H85" stroke="var(--color-border-base, #e5e6eb)" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="100" cy="100" r="16" fill="white" stroke="var(--color-primary, #165dff)" strokeWidth="3"/>
    <path d="M96 96L104 104" stroke="var(--color-primary, #165dff)" strokeWidth="3" strokeLinecap="round"/>
    <path d="M104 96L96 104" stroke="var(--color-primary, #165dff)" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

/**
 * 通用空状态组件
 * @description 用于页面或模块无数据时的占位展示
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title = '暂无数据',
  description,
  image,
  imageStyle,
  action,
  fullHeight = true,
  className = '',
  style,
  buttonText,
  onButtonClick,
}) => {
  const renderImage = () => {
    if (!image) return <DefaultEmptyImage />;
    if (typeof image === 'string') {
      return <img src={image} alt={title} />;
    }
    return image;
  };

  return (
    <div 
      className={`empty-state-container ${fullHeight ? 'full-height' : ''} ${className}`}
      style={style}
    >
      <div className="empty-image" style={imageStyle}>
        {renderImage()}
      </div>
      
      {title && <div className="empty-title">{title}</div>}
      
      {description && <div className="empty-description">{description}</div>}
      
      {(action || (buttonText && onButtonClick)) && (
        <div className="empty-footer">
          {action ? action : (
            <Button type="primary" onClick={onButtonClick}>
              {buttonText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
