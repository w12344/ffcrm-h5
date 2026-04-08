import React, { useMemo } from 'react';
import './index.less';

interface UserAvatarProps {
  /** 用户名 */
  name: string;
  /** 头像大小，默认 32 */
  size?: number;
  /** 额外的类名 */
  className?: string;
  /** 额外的样式 */
  style?: React.CSSProperties;
  /** 点击事件 */
  onClick?: () => void;
}

/**
 * 用户头像组件
 * 
 * 特性：
 * 1. 飞书风格：渐变背景 + 白色文字
 * 2. 截取名字后两位
 * 3. 圆形显示
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 32,
  className = '',
  style = {},
  onClick
}) => {
  // 获取显示的名字：取最后两个字符
  const displayName = useMemo(() => {
    if (!name) return '';
    return name.length > 2 ? name.slice(-2) : name;
  }, [name]);

  return (
    <div
      className={`feishu-user-avatar ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4, // 字体大小随头像大小缩放
        lineHeight: `${size}px`,
        ...style
      }}
      onClick={onClick}
      title={name}
    >
      {displayName}
    </div>
  );
};

export default UserAvatar;
