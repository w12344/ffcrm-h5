/**
 * 飞书认证工具类
 * 基于 pages/utils/feishuAuth.js 封装的 TypeScript 版本
 * 
 * 功能特性：
 * 1. 支持 SDK 免登（飞书环境内）
 * 2. 支持 Web 授权（浏览器环境）
 * 3. Session 管理（sessionStorage + localStorage）
 * 4. Token 管理和请求头生成
 * 5. 用户信息格式化和多字段兼容
 */

import feishuApi from '@/services/feishu';

// ========== 类型定义 ==========

/** 飞书 SDK 全局对象 */
declare global {
  interface Window {
    h5sdk?: {
      ready: (callback: () => void) => void;
      error: (callback: (err: any) => void) => void;
    };
    tt?: {
      requestAccess: (options: {
        appID: string;
        scopeList: string[];
        success: (res: { code: string }) => void;
        fail: (err: any) => void;
      }) => void;
    };
  }
}

/** 原始用户信息（后端返回） */
export interface RawUserInfo {
  name?: string;
  en_name?: string;
  user_name?: string;
  display_name?: string;
  avatar_url?: string;
  avatar?: string;
  picture?: string;
  token?: string;
  access_token?: string;
  accessToken?: string;
  [key: string]: any;
}

/** 格式化后的用户信息 */
export interface FormattedUserInfo {
  name: string;
  avatar: string;
  welcomeText: string;
  token: string | null;
  rawData: RawUserInfo | null;
  roles?: string[];
  userId?: string;
}


// ========== 飞书认证工具类 ==========

export class FeishuAuth {
  private lang: string;

  constructor() {
    this.lang = window.navigator.language;
    
    this.log('初始化飞书认证');
    this.log('当前语言:', this.lang);
    this.log('当前环境:', import.meta.env.MODE);
  }

  // ========== 日志工具 ==========
  
  private log(...args: any[]) {
    if (import.meta.env.DEV) {
      console.log('[FeishuAuth]', ...args);
    }
  }

  private error(...args: any[]) {
    console.error('[FeishuAuth]', ...args);
  }

  // ========== 环境检测 ==========

  /**
   * 检查是否在飞书环境中
   */
  checkFeishuEnvironment(): boolean {
    if (!window.h5sdk) {
      this.log('不在飞书环境中');
      return false;
    }
    this.log('在飞书环境中');
    return true;
  }

  // ========== API 调用 ==========

  /**
   * 获取 APP ID
   */
  async getAppId(): Promise<string> {
    // 优先使用环境变量，避免额外的后端请求
    const envAppId = (import.meta as any).env?.VITE_FEISHU_APP_ID;
    if (envAppId) {
      this.log('使用环境变量 App ID:', envAppId);
      return envAppId;
    }
    try {
      const response = await feishuApi.getAppId();
      this.log('获取appid成功:', response.data);
      return response.data.data.appid;
    } catch (error) {
      this.error('获取appid失败:', error);
      throw error;
    }
  }

  /**
   * 通过 SDK code 获取用户信息
   */
  async getUserInfo(code: string): Promise<RawUserInfo> {
    try {
      const response = await feishuApi.getUserInfoBySdkCode(code);
      this.log('获取用户信息成功:', response.data);
      return response.data.data;
    } catch (error) {
      this.error('getUserInfo 获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 通过 API code 获取用户信息
   */
  async getUserInfoByCode(code: string): Promise<RawUserInfo> {
    try {
      const redirectUri = window.location.origin + window.location.pathname;
      
      const response = await feishuApi.getUserInfoByApiCode(code, redirectUri);
      this.log('获取用户信息成功，完整响应:', response.data);
      this.log('返回的数据结构:', JSON.stringify(response.data.data, null, 2));
      
      return response.data.data;
    } catch (error) {
      this.error('getUserInfoByCode 获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 验证缓存的 token 是否有效
   */
  async validateCachedToken(token: string): Promise<RawUserInfo | null> {
    try {
      this.log('开始验证缓存的 token...');
      const response = await feishuApi.validateToken(token);
      this.log('Token 验证成功，用户信息:', response.data);
      return response.data.data;
    } catch (error: any) {
      this.log('Token 验证失败:', error.message || error);
      // Token 无效或过期
      return null;
    }
  }

  // ========== SDK 免登流程 ==========

  /**
   * 飞书 SDK 免登认证流程
   */
  async sdkAuth(): Promise<RawUserInfo> {
    return new Promise((resolve, reject) => {
      // 获取 APP ID
      this.getAppId().then(appId => {
        // 错误处理
        window.h5sdk!.error(err => {
          this.error('h5sdk error:', JSON.stringify(err));
          reject(err);
        });

        // 环境准备就绪
        window.h5sdk!.ready(() => {
          this.log('window.h5sdk.ready');
          this.log('url:', window.location.href);

          // 调用免登接口
          window.tt!.requestAccess({
            appID: appId,
            scopeList: [],
            // 成功回调
            success: (res) => {
              this.log('获取授权码成功');
              // 获取用户信息
              this.getUserInfo(res.code).then(userInfo => {
                resolve(userInfo);
              }).catch(error => {
                reject(error);
              });
            },
            // 失败回调
            fail: (err) => {
              this.error('获取授权码失败:', JSON.stringify(err));
              reject(err);
            }
          });
        });
      }).catch(error => {
        reject(error);
      });
    });
  }

  // ========== Web 授权流程 ==========

  /**
   * 飞书 Web 授权流程
   */
  async apiAuth(): Promise<void> {
    const appid = await this.getAppId();
    localStorage.setItem('feishu_appid', appid);
    console.log(window.location)
    
    // 保存当前完整路径（包括查询参数），授权后需要跳转回来
    const currentPath = window.location.pathname + window.location.hash;
    if (currentPath && currentPath !== '/') {
      localStorage.setItem('redirectAfterLogin', currentPath);
      this.log('保存授权前路径:', currentPath);
    }
    
    const redirectUri = window.location.origin + window.location.pathname;
    
    // 构建授权URL
    const state = this.generateRandomString(16);
    localStorage.setItem('feishu_state', state);
    
    const authUrl = `https://accounts.feishu.cn/open-apis/authen/v1/authorize?` +
                `client_id=${encodeURIComponent(appid)}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `response_type=code&` +
                `state=${encodeURIComponent(state)}`;
    
    window.location.href = authUrl;
  }

  /**
   * 处理授权码回调
   */
  async handleAuthorizationCode(code: string, state: string): Promise<FormattedUserInfo> {
    try {
      this.log('开始处理授权码:', code, 'state:', state);
      
      // 验证state参数
      const savedState = localStorage.getItem('feishu_state');
      if (state !== savedState) {
        throw new Error('State参数验证失败，可能存在安全风险');
      }

      // 获取新的用户信息
      const userInfo = await this.getUserInfoByCode(code);
      this.log('从后端获取到的原始用户信息:', userInfo);
      
      // 检查用户信息是否有效
      if (!userInfo) {
        throw new Error('后端返回的用户信息为空');
      }
      
      // 格式化用户信息
      const formattedUserInfo = this.formatUserInfo(userInfo);
      this.log('格式化后的用户信息:', formattedUserInfo);
      
      // 检查格式化后的信息
      if (!formattedUserInfo.name || formattedUserInfo.name === '未知用户') {
        console.warn('格式化后的用户名为空或未知，原始数据:', userInfo);
        console.warn('格式化结果:', formattedUserInfo);
      }
      
      // 保存到 localStorage（持久化）
      this.saveUserInfoToSession(userInfo, true);
      this.log('用户信息已保存到 localStorage');
      
      return formattedUserInfo;
    } catch (error) {
      this.error('处理授权码失败:', error);
      throw error;
    }
  }

  // ========== 用户信息处理 ==========

  /**
   * 格式化用户信息
   */
  formatUserInfo(userInfo: RawUserInfo | null): FormattedUserInfo {
    this.log('formatUserInfo 输入:', userInfo);
    
    if (!userInfo) {
      console.warn('userInfo 为空，返回默认值');
      return {
        name: '未知用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown',
        welcomeText: '欢迎使用',
        token: null,
        rawData: null
      };
    }
    
    const isZhCN = this.lang === "zh_CN" || this.lang === "zh-CN";
    
    // 尝试获取用户名
    let name = '未知用户';
    this.log('检查用户名字段:');
    this.log('- userInfo.name:', userInfo.name);
    this.log('- userInfo.en_name:', userInfo.en_name);
    this.log('- userInfo.user_name:', userInfo.user_name);
    this.log('- userInfo.display_name:', userInfo.display_name);
    
    if (userInfo.name) {
      name = userInfo.name;
      this.log('使用 userInfo.name:', name);
    } else if (userInfo.en_name) {
      name = userInfo.en_name;
      this.log('使用 userInfo.en_name:', name);
    } else if (userInfo.user_name) {
      name = userInfo.user_name;
      this.log('使用 userInfo.user_name:', name);
    } else if (userInfo.display_name) {
      name = userInfo.display_name;
      this.log('使用 userInfo.display_name:', name);
    } else {
      console.warn('未找到有效的用户名字段');
    }
    
    // 尝试获取头像
    let avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown';
    if (userInfo.avatar_url) {
      avatar = userInfo.avatar_url;
    } else if (userInfo.avatar) {
      avatar = userInfo.avatar;
    } else if (userInfo.picture) {
      avatar = userInfo.picture;
    }
    
    const formattedInfo: FormattedUserInfo = {
      name: name,
      avatar: avatar,
      welcomeText: isZhCN ? "欢迎使用FFCRM" : "Welcome to FFCRM",
      // 保存 token 信息，支持多种可能的字段名
      token: userInfo.token || userInfo.access_token || userInfo.accessToken || null,
      rawData: userInfo
    };
    
    this.log('formatUserInfo 输出:', formattedInfo);
    return formattedInfo;
  }

  // ========== Session 管理 ==========

  /**
   * 从 session 中获取用户信息
   */
  getSessionUserInfo(): FormattedUserInfo | null {
    try {
      // 尝试从sessionStorage获取用户信息
      const sessionUserInfo = sessionStorage.getItem('feishu_user_info');
      if (sessionUserInfo) {
        const userInfo: RawUserInfo = JSON.parse(sessionUserInfo);
        this.log('从session获取到用户信息:', userInfo.name);
        return this.formatUserInfo(userInfo);
      }
      
      // 尝试从localStorage获取用户信息（持久化登录）
      const localUserInfo = localStorage.getItem('feishu_user_info');
      if (localUserInfo) {
        const userInfo: RawUserInfo = JSON.parse(localUserInfo);
        this.log('从localStorage获取到用户信息:', userInfo.name);
        return this.formatUserInfo(userInfo);
      }
      
      return null;
    } catch (error) {
      this.error('获取session用户信息失败:', error);
      return null;
    }
  }

  /**
   * 保存用户信息到 session
   * @param userInfo 用户信息
   * @param persistent 是否持久化（默认 true，使用 localStorage）
   */
  saveUserInfoToSession(userInfo: RawUserInfo, persistent: boolean = true): void {
    try {
      const storage = persistent ? localStorage : sessionStorage;
      storage.setItem('feishu_user_info', JSON.stringify(userInfo));
      this.log('用户信息已保存到', persistent ? 'localStorage' : 'sessionStorage');
      this.log('保存的用户信息:', JSON.stringify(userInfo, null, 2));
      
      // 验证 token 是否被正确保存
      const token = userInfo.token || userInfo.access_token || userInfo.accessToken;
      if (token) {
        this.log('Token 已保存:', token.substring(0, 20) + '...');
      } else {
        console.warn('[FeishuAuth] ⚠️ 警告：用户信息中没有找到 token！');
        console.warn('[FeishuAuth] 用户信息字段:', Object.keys(userInfo));
      }
    } catch (error) {
      this.error('保存用户信息失败:', error);
    }
  }

  /**
   * 清除用户信息
   */
  clearUserInfo(): void {
    try {
      sessionStorage.removeItem('feishu_user_info');
      localStorage.removeItem('feishu_user_info');
      this.log('用户信息已清除');
    } catch (error) {
      this.error('清除用户信息失败:', error);
    }
  }

  // ========== 登录状态检查 ==========

  /**
   * 检查登录状态并获取用户信息
   * 优化流程：
   * 1. 先检查缓存中是否有用户信息和 token
   * 2. 如果有，直接使用（信任缓存的 token）
   * 3. 如果没有，执行授权流程
   * 
   * 注意：不在这里验证 token，而是在实际 API 调用失败时才重新授权
   * 这样可以避免每次刷新都要调用验证接口
   */
  async checkLoginAndGetUser(): Promise<FormattedUserInfo> {
    try {
      // 首先从缓存中检查是否已经登录
      const sessionUserInfo = this.getSessionUserInfo();
      if (sessionUserInfo && sessionUserInfo.token) {
        this.log('✅ 检测到缓存的用户信息和 token，直接使用');
        this.log('用户名:', sessionUserInfo.name);
        this.log('Token:', sessionUserInfo.token.substring(0, 20) + '...');
        return sessionUserInfo;
      }
      
      this.log('未检测到缓存，开始授权流程...');
      const openInFeishu = this.checkFeishuEnvironment();
      // 未登录，执行免登流程
      const userInfo = openInFeishu ? await this.sdkAuth() : await this.apiAuthPromise();
      
      // 检查获取到的用户信息是否有效
      if (!userInfo || !userInfo.name) {
        throw new Error('获取到的用户信息无效');
      }
      
      // 保存用户信息到 localStorage（持久化）
      this.saveUserInfoToSession(userInfo, true);
      
      return this.formatUserInfo(userInfo);
    } catch (error) {
      this.error('checkLoginAndGetUser 获取用户信息失败:', error);
      // 不保存任何信息到storage，也不返回默认用户信息
      // 让调用方处理错误状态
      throw error;
    }
  }

  /**
   * API 授权的 Promise 版本（用于统一接口）
   */
  private async apiAuthPromise(): Promise<RawUserInfo> {
    await this.apiAuth();
    // apiAuth 会跳转，所以不会执行到这里
    // 但为了类型安全，返回一个 never 类型
    return new Promise(() => {});
  }

  // ========== 工具函数 ==========

  /**
   * 生成随机字符串
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// ========== 单例导出 ==========

/**
 * 飞书认证工具单例
 */
export const feishuAuth = new FeishuAuth();

