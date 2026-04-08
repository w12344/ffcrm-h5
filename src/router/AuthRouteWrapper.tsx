/**
 * 路由认证包装器
 * 未登录用户访问受保护路由时重定向到登录页
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRouteWrapperProps {
  children: React.ReactNode;
  /** 是否不需要认证（如登录页） */
  noAuth?: boolean;
}

const AuthRouteWrapper: React.FC<AuthRouteWrapperProps> = ({
  children,
  noAuth = false,
}) => {
  const location = useLocation();
  const { isLoggedIn, isLoading } = useAuth();
  const isLoginPage = location.pathname === '/login' || location.hash.includes('/login');

  // 不需要认证的页面直接渲染
  if (noAuth) {
    return <>{children}</>;
  }

  // 加载中时显示空白或加载状态，避免闪烁
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#181818',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
          加载中...
        </div>
      </div>
    );
  }

  // 未登录且不是登录页，重定向到登录页
  if (!isLoggedIn && !isLoginPage) {
    const redirectPath = location.pathname + location.search + location.hash;
    const loginPath = redirectPath && redirectPath !== '/' && !redirectPath.includes('/login')
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : '/login';
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default AuthRouteWrapper;
