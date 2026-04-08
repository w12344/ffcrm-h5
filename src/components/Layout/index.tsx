import React from 'react';
import './index.less';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      {/* 主要内容区域 */}
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export { Layout };
export default Layout;

