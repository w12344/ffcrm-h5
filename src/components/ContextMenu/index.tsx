import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './index.less';

/**
 * 右键菜单项配置
 */
export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean; // 是否在此项后显示分割线
  onClick?: () => void;
}

/**
 * 右键菜单组件属性
 */
export interface ContextMenuProps {
  /** 是否显示菜单 */
  visible: boolean;
  /** 菜单位置 (鼠标点击位置) */
  position: { x: number; y: number };
  /** 菜单项配置 */
  items: ContextMenuItem[];
  /** 关闭菜单回调 */
  onClose: () => void;
}

/**
 * 通用右键菜单组件
 * 
 * 特性：
 * 1. 模拟系统原生右键菜单样式
 * 2. 自动处理边界检测，防止菜单超出视口
 * 3. 点击菜单外部自动关闭
 * 4. 支持键盘 ESC 关闭
 * 5. 支持禁用项、危险项、分割线
 */
const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  position,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * 计算菜单位置，处理边界情况
   */
  const getMenuPosition = useCallback(() => {
    if (!menuRef.current) return { left: position.x, top: position.y };

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = position.x;
    let top = position.y;

    // 右边界检测
    if (left + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width - 5; // 留5px边距
    }

    // 底部边界检测
    if (top + menuRect.height > viewportHeight) {
      top = viewportHeight - menuRect.height - 5; // 留5px边距
    }

    // 左边界检测
    if (left < 0) {
      left = 5;
    }

    // 顶部边界检测
    if (top < 0) {
      top = 5;
    }

    return { left, top };
  }, [position]);

  /**
   * 处理点击菜单项
   */
  const handleItemClick = useCallback(
    (item: ContextMenuItem) => {
      if (item.disabled) return;
      
      item.onClick?.();
      onClose();
    },
    [onClose]
  );

  /**
   * 监听点击外部关闭菜单
   */
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // 使用 setTimeout 延迟添加监听器，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  /**
   * 监听 ESC 键关闭菜单
   */
  useEffect(() => {
    if (!visible) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [visible, onClose]);

  if (!visible) return null;

  const menuPosition = getMenuPosition();

  // 使用 Portal 将菜单渲染到 body，避免被父容器的 overflow/transform 等属性影响
  return createPortal(
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: `${menuPosition.left}px`,
        top: `${menuPosition.top}px`,
      }}
      onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
    >
      <ul className="context-menu-list">
        {items.map((item, index) => (
          <React.Fragment key={item.key}>
            <li
              className={`context-menu-item ${item.disabled ? 'disabled' : ''} ${
                item.danger ? 'danger' : ''
              }`}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <span className="menu-item-icon">{item.icon}</span>}
              <span className="menu-item-label">{item.label}</span>
            </li>
            {item.divider && index < items.length - 1 && (
              <li className="context-menu-divider" />
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>,
    document.body
  );
};

export default ContextMenu;

