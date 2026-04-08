/**
 * 飞书认证守卫组件
 * 
 * 功能：
 * 1. 自动检测并处理飞书登录
 * 2. 显示加载和错误状态
 * 3. 登录成功后渲染子组件
 * 
 * 使用示例：
 * ```tsx
 * <FeishuAuthGuard>
 *   <YourProtectedComponent />
 * </FeishuAuthGuard>
 * ```
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './index.less';

interface FeishuAuthGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 是否显示用户信息 */
  showUserInfo?: boolean;
  /** 自定义加载组件 */
  loadingComponent?: React.ReactNode;
  /** 自定义错误组件 */
  errorComponent?: (error: string, retry: () => void) => React.ReactNode;
}

export const FeishuAuthGuard: React.FC<FeishuAuthGuardProps> = ({
  children,
  showUserInfo = false,
  loadingComponent,
  errorComponent,
}) => {
  const { userInfo, isLoading, error, isLoggedIn, login, logout } = useAuth();

  // 加载状态
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="feishu-auth-guard">
        <div className="auth-loading">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <div className="loading-text">
            <span>正在验证身份</span>
            <div className="dots-animation">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    if (errorComponent) {
      return <>{errorComponent(error, login)}</>;
    }
    
    return (
      <div className="feishu-auth-guard">
        <div className="auth-error">
          <div className="error-icon">⚠️</div>
          <h3>登录失败</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={login}>
            重试登录
          </button>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!isLoggedIn) {
    return (
      <div className="feishu-auth-guard">
        <div className="auth-error">
          <div className="error-icon">🔐</div>
          <h3>需要登录</h3>
          <p>请先登录以访问此页面</p>
          <button className="retry-btn" onClick={login}>
            立即登录
          </button>
        </div>
      </div>
    );
  }

  // 已登录，渲染子组件
  return (
    <>
      {showUserInfo && userInfo && (
        <div className="auth-user-info">
          <img src={userInfo.avatar} alt={userInfo.name} className="user-avatar" />
          <div className="user-details">
            <span className="user-name">{userInfo.name}</span>
            <span className="user-welcome">{userInfo.welcomeText}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            退出登录
          </button>
        </div>
      )}
      {children}
    </>
  );
};

export default FeishuAuthGuard;

