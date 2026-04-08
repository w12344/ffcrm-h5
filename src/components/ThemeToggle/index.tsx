/**
 * 主题切换组件 - 黑暗/白天模式切换
 */
import React, { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import "./index.less";

interface ThemeToggleProps {
  /** 自定义样式类名 */
  className?: string;
  /** 切换回调 */
  onChange?: (isDark: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = "",
  onChange
}) => {
  const { toggleTheme, isDark } = useTheme();

  const handleToggle = () => {
    // 在dark和light之间切换
    toggleTheme();
    
    // 触发回调
    onChange?.(!isDark);
  };

  // 监听主题变化，同步状态
  useEffect(() => {
    onChange?.(isDark);
  }, [isDark, onChange]);

  return (
    <div className={`theme-toggle-switch ${className}`} onClick={handleToggle}>
      {/* 背景容器 */}
      <div className="toggle-background">
        {/* 滑块 */}
        <div className={`toggle-slider ${isDark ? 'dark' : 'light'}`}>
          {/* 内部圆形边框 */}
          <div className="slider-border"></div>
        </div>

        {/* 月亮图标 */}
        <div className={`icon-wrapper moon ${isDark ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* 太阳图标 */}
        <div className={`icon-wrapper sun ${!isDark ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
