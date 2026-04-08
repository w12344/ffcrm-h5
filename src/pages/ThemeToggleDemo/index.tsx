/**
 * 主题切换组件演示页面
 */
import React from "react";
import ThemeToggle from "@/components/ThemeToggle";
import "./index.less";

const ThemeToggleDemo: React.FC = () => {
  const handleThemeChange = (isDark: boolean) => {
    console.log('主题已切换到:', isDark ? '黑暗模式' : '白天模式');
  };

  return (
    <div className="theme-toggle-demo">
      <div className="demo-container">
        <h1 className="demo-title">主题切换组件演示</h1>
        <p className="demo-description">
          点击切换按钮可以在黑暗模式和白天模式之间切换
        </p>
        
        <div className="demo-content">
          <ThemeToggle onChange={handleThemeChange} />
        </div>

        <div className="demo-features">
          <h2>特性说明：</h2>
          <ul>
            <li>✨ 使用 SVG 绘制的月亮和太阳图标</li>
            <li>🎨 平滑的过渡动画效果</li>
            <li>🎯 点击时激活状态会显示边框高亮</li>
            <li>📱 支持响应式设计</li>
            <li>🎭 黑暗/白天模式一键切换</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggleDemo;

