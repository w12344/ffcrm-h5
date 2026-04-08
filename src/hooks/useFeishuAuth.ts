/**
 * 飞书认证 React Hook
 * 
 * 功能：
 * 1. 自动检测并处理飞书登录
 * 2. 管理用户登录状态
 * 3. 提供登录、登出方法
 * 4. 处理加载和错误状态
 */

import { useState, useEffect, useCallback } from 'react';
import { feishuAuth, FormattedUserInfo } from '@/utils/feishuAuth';

interface UseFeishuAuthResult {
  /** 用户信息 */
  userInfo: FormattedUserInfo | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已登录 */
  isLoggedIn: boolean;
  /** 登录方法 */
  login: () => Promise<void>;
  /** 登出方法 */
  logout: () => void;
  /** 重新加载用户信息 */
  reload: () => Promise<void>;
}

/**
 * 飞书认证 Hook
 * 
 * @param autoLogin 是否自动登录（默认 true）
 * @returns 认证状态和操作方法
 */
export const useFeishuAuth = (autoLogin: boolean = true): UseFeishuAuthResult => {
  const [userInfo, setUserInfo] = useState<FormattedUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  /**
   * 获取用户信息
   */
  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[useFeishuAuth] 开始获取用户信息...');
      const userData = await feishuAuth.checkLoginAndGetUser();
      
      setUserInfo(userData);
      console.log('[useFeishuAuth] 用户信息获取成功:', userData);
    } catch (err: any) {
      console.error('[useFeishuAuth] 获取用户信息失败:', err);
      
      // 根据错误类型设置不同的错误信息
      let errorMessage = '获取用户信息失败';
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = `后端服务器未启动`;
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查后端服务';
      } else if (err.message.includes('获取到的用户信息无效')) {
        errorMessage = '用户信息获取失败，请重新登录';
      } else {
        errorMessage = err.message || '获取用户信息失败';
      }
      
      setError(errorMessage);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 处理授权码回调
   */
  const handleAuthorizationCode = useCallback(async (code: string, state: string) => {
    try {
      console.log('[useFeishuAuth] 检测到授权码，开始处理回调...');
      
      setIsLoading(true);
      setError(null);
      
      const userData = await feishuAuth.handleAuthorizationCode(code, state);
      console.log('[useFeishuAuth] 授权码处理成功:', userData);
      
      setUserInfo(userData);
      
      // 清除URL中的授权码参数（授权成功后再清除，避免刷新时丢失）
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // 检查是否有保存的重定向路径
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        console.log('[useFeishuAuth] 检测到重定向路径:', redirectPath);
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      }
    } catch (err: any) {
      console.error('[useFeishuAuth] 处理授权码失败:', err);
      setError(err.message || '处理授权码失败');
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 检查 SDK 并初始化
   */
  const checkSDKAndInit = useCallback(async () => {
    if (window.h5sdk && window.tt) {
      console.log('[useFeishuAuth] 飞书SDK已加载，开始获取用户信息');
      await fetchUserInfo();
    } else {
      console.log('[useFeishuAuth] 非飞书环境，开始Web授权流程');
      await fetchUserInfo();
    }
    
    // 检查是否有保存的重定向路径（SDK免登成功后）
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      console.log('[useFeishuAuth] SDK免登后检测到重定向路径:', redirectPath);
      localStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectPath;
    }
  }, [fetchUserInfo]);

  /**
   * 初始化
   */
  useEffect(() => {
    // 防止重复初始化
    if (hasInitialized) {
      console.log('[useFeishuAuth] 已初始化，跳过');
      return;
    }

    if (!autoLogin) {
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    console.log('[useFeishuAuth] 组件初始化，开始检查登录状态...');
    
    // 检查URL中是否有授权码
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const urlError = urlParams.get('error');
    
    console.log('[useFeishuAuth] URL参数检查:', { code, state, error: urlError });
    
    if (code && state) {
      // 处理授权码回调
      console.log('[useFeishuAuth] 检测到授权码，准备处理...');
      setHasInitialized(true);
      handleAuthorizationCode(code, state);
    } else {
      // 检查 SDK 并初始化
      console.log('[useFeishuAuth] 无授权码，执行正常登录流程');
      setHasInitialized(true);
      checkSDKAndInit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLogin]); // 只依赖 autoLogin，避免重复执行

  /**
   * 登录方法
   */
  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await fetchUserInfo();
    } catch (err: any) {
      console.error('[useFeishuAuth] 登录失败:', err);
      setError(err.message || '登录失败');
      throw err;
    }
  }, [fetchUserInfo]);

  /**
   * 登出方法
   */
  const logout = useCallback(() => {
    feishuAuth.clearUserInfo();
    setUserInfo(null);
    setError(null);
    setIsLoading(false);
    
    // 清除重定向路径
    localStorage.removeItem('redirectAfterLogin');
    
    // 清除所有可能的缓存数据
    try {
      // 清除所有 sessionStorage
      sessionStorage.clear();
      localStorage.clear();
      // 清除所有 localStorage 中的用户相关数据
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('user') || key.includes('feishu') || key.includes('auth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('[useFeishuAuth] 清除缓存失败:', error);
    }
    
    console.log('[useFeishuAuth] 用户已登出，停留在看板页面');
    // 不刷新页面，让用户停留在看板页面，但数据会因为没有token而无法加载
  }, []);

  /**
   * 重新加载用户信息
   */
  const reload = useCallback(async () => {
    await fetchUserInfo();
  }, [fetchUserInfo]);

  return {
    userInfo,
    isLoading,
    error,
    isLoggedIn: !!userInfo && !!userInfo.name && userInfo.name !== '未知用户',
    login,
    logout,
    reload,
  };
};

export default useFeishuAuth;

