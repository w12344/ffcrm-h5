import React, { useMemo, memo, useState, useCallback } from "react";
import { Tooltip } from "antd";
import { TransactionBubble as TransactionBubbleType } from "../../../types/transaction";
import ContextMenu, { ContextMenuItem } from "@/components/ContextMenu";
import "./TransactionBubble.less";

interface TransactionBubbleProps {
  bubble: TransactionBubbleType;
  onClick?: (id: string, subPoolType?: 'deal' | 'enrolled') => void;
  onContextMenu?: (bubble: TransactionBubbleType, action: "profile" | "analysis" | "learning_panorama") => void;
}

const TransactionBubble: React.FC<TransactionBubbleProps> = ({
  bubble,
  onClick,
  onContextMenu
}) => {
  const { customer, x, y, size, gradient, area, hasAlert, shouldBlink } = bubble;

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  // 随机动画参数 (与 CustomerBubble 对齐)
  const floatParams = useMemo(() => ({
    delay: `-${Math.random() * 5}s`,
    duration: `${5 + Math.random() * 3}s`,
    floatX: `${8 + Math.random() * 12}px`,
    floatY: `${8 + Math.random() * 12}px`,
    rotate: `${Math.random() * 8 - 4}deg`
  }), []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, []);

  const contextMenuItems: ContextMenuItem[] = [
    {
      key: "analysis",
      label: "AI分析",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M5 8H7M9 8H11M8 5V7M8 9V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="5" cy="5" r="0.8" fill="currentColor" />
          <circle cx="11" cy="5" r="0.8" fill="currentColor" />
          <circle cx="5" cy="11" r="0.8" fill="currentColor" />
          <circle cx="11" cy="11" r="0.8" fill="currentColor" />
          <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.1" />
        </svg>
      ),
      onClick: () => onContextMenu?.(bubble, "analysis"),
    },
    {
      key: "profile",
      label: "客户档案",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 8C9.933 8 11.5 6.433 11.5 4.5C11.5 2.567 9.933 1 8 1C6.067 1 4.5 2.567 4.5 4.5C4.5 6.433 6.067 8 8 8Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M14 15C14 12.791 11.314 11 8 11C4.686 11 2 12.791 2 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="8" cy="4.5" r="2.5" fill="currentColor" opacity="0.15" />
        </svg>
      ),
      onClick: () => onContextMenu?.(bubble, "profile"),
    },
    {
      key: "learning_panorama",
      label: "学情全景",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 2V14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 6H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 9H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      onClick: () => onContextMenu?.(bubble, "learning_panorama"),
    }
  ];

  return (
    <>
      <Tooltip
      title={
        <div className="transaction-bubble-tooltip-content">
          <div className="tooltip-header">
            <span className="customer-name">{customer.name}</span>
            <span className={`status-tag ${customer.deliveryHealth}`}>
              {customer.deliveryHealth === 'healthy' ? '已入学' : customer.deliveryHealth === 'pending' ? '待开班' : customer.deliveryHealth === 'dropped_out' ? '已退学' : '已退费'}
            </span>
          </div>
          <div className="tooltip-body">
            <div className="info-row">
              <span className="label">含金量挡位:</span>
              <span className="value">{Math.round(customer.ticketValue)} 分</span>
            </div>
            <div className="info-row">
              <span className="label">最近动态:</span>
              <span className="value">{customer.isDroppedOut ? '已退学' : customer.isEnrolled ? '已完成排课入学' : '财务预收确认中'}</span>
            </div>
            {customer.isRefunded && !customer.isDroppedOut && (
              <div className="warning-row">
                ⚠️ 该学生已申请退费，状态为重度沉底
              </div>
            )}
            {customer.isDroppedOut && (
              <div className="warning-row">
                ⚠️ 该学生已申请退学
              </div>
            )}
            {customer.hasRepurchaseOpportunity && (
              <div className="opportunity-row">
                ✨ 发现潜在复购机会
              </div>
            )}
          </div>
        </div>
      }
      mouseEnterDelay={0.2}
      overlayClassName="legend-tooltip-overlay"
      open={contextMenu.visible ? false : undefined}
    >
      <div
        className={`transaction-bubble-item ${area} ${(customer.isRefunded || customer.isDroppedOut) ? 'refunded-sink' : ''} ${hasAlert ? 'has-conflict' : ''} ${shouldBlink ? 'blink' : ''}`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${size}px`,
          height: `${size}px`,
          background: gradient,
          '--delay': floatParams.delay,
          '--duration': floatParams.duration,
          '--float-x': floatParams.floatX,
          '--float-y': floatParams.floatY,
          '--rotate': floatParams.rotate,
          position: 'absolute',
          transform: 'translate(-50%, -50%)'
        } as React.CSSProperties}
        onClick={() => {
          // 传递是哪个池子的标记
          const subPoolType = customer.isEnrolled ? 'enrolled' : 'deal';
          onClick?.(bubble.id, subPoolType);
        }}
        onContextMenu={handleContextMenu}
      >
        {/* 感叹号警示 - 1:1 对齐 CustomerBubble */}
        {hasAlert && (
          <div className="exclamation-mark" style={{ width: size * 0.6, height: size * 0.6 }}>
            <div className="exclamation-line" />
            <div className="exclamation-dot" />
          </div>
        )}

        {/* 产品持有标签 */}
        <div className="product-badges">
          {customer.productTags && customer.productTags.slice(0, 3).map((p, i) => (
            <span key={i} className="product-badge">{p}</span>
          ))}
        </div>
      </div>
    </Tooltip>
    <ContextMenu
      visible={contextMenu.visible}
      position={{ x: contextMenu.x, y: contextMenu.y }}
      items={contextMenuItems}
      onClose={handleCloseContextMenu}
    />
    </>
  );
};

export default memo(TransactionBubble);
