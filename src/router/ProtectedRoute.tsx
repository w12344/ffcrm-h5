/**
 * 受保护的路由组件
 * 
 * 功能：
 * 1. 检查用户是否已登录
 * 2. 未登录时显示加载状态，等待授权流程完成
 * 3. 授权流程会自动保存路径并在完成后跳转回来
 */

import { ReactElement } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactElement;
}

/**
 * 检查用户是否已登录
 */
const isUserLoggedIn = (): boolean => {
  try {
    // 首先检查 sessionStorage
    let userInfo = sessionStorage.getItem('feishu_user_info');
    
    // 如果 sessionStorage 中没有，检查 localStorage
    if (!userInfo) {
      userInfo = localStorage.getItem('feishu_user_info');
    }
    
    if (!userInfo) return false;
    
    const parsedUserInfo = JSON.parse(userInfo);
    return parsedUserInfo && parsedUserInfo.name && parsedUserInfo.name !== '未知用户';
  } catch (error) {
    console.error('检查用户登录状态失败:', error);
    return false;
  }
};

/**
 * 受保护的路由组件
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuth();

  // 检查用户是否已登录（双重检查：使用 Context 和本地存储）
  const loggedIn = isLoggedIn || isUserLoggedIn();

  // 如果正在加载或未登录，返回空（授权流程会自动处理）
  // 路径保存已经在 apiAuth() 中处理
  if (isLoading || !loggedIn) {
    console.log('[ProtectedRoute] 等待授权...', { isLoading, loggedIn });
    return null;
  }

  console.log('[ProtectedRoute] 用户已登录，允许访问');
  
  // 已登录，渲染子组件
  return children;
};

export default ProtectedRoute;

