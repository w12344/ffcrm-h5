/**
 * 认证工具函数
 * 基于 pages/utils/auth.js 封装的 TypeScript 版本
 *
 * 功能：
 * 1. 获取认证 token
 * 2. 生成带认证的请求头
 */

import { RawUserInfo } from "./feishuAuth";

/**
 * 获取认证 Token
 */
export const getAuthToken = (): string | null => {
  try {
    // 优先从 URL query 参数获取 token（支持hash路由后的参数）
    let queryToken: string | null = null;
    
    // 先尝试从主URL的query参数获取
    const mainUrlParams = new URLSearchParams(window.location.search);
    queryToken = mainUrlParams.get("token");
    
    // 如果主URL没有，尝试从hash后的query参数获取
    if (!queryToken && window.location.hash) {
      const hashParts = window.location.hash.split('?');
      if (hashParts.length > 1) {
        const hashQuery = hashParts.slice(1).join('?'); // 处理可能有多个?的情况
        const hashParams = new URLSearchParams(hashQuery);
        queryToken = hashParams.get("token");
        
        if (queryToken) {
          console.log(
            "[Auth] ✅ 从 hash query 参数获取到认证token:",
            queryToken.substring(0, 20) + "..."
          );
        }
      }
    }
    
    if (queryToken) {
      console.log(
        "[Auth] ✅ 从 URL 参数获取到认证token:",
        queryToken.substring(0, 20) + "..."
      );
      return queryToken;
    }

    // 其次尝试从 sessionStorage 获取
    let userInfoStr = sessionStorage.getItem("feishu_user_info");
    let source = "sessionStorage";

    // 如果 sessionStorage 中没有，尝试从 localStorage 获取
    if (!userInfoStr) {
      userInfoStr = localStorage.getItem("feishu_user_info");
      source = "localStorage";
    }

    if (userInfoStr) {
      const parsedUserInfo: RawUserInfo = JSON.parse(userInfoStr);
      console.log(
        `[Auth] 从 ${source} 获取到用户信息，字段:`,
        Object.keys(parsedUserInfo)
      );

      // 从用户信息中获取 token，支持多种可能的字段名
      const token =
        parsedUserInfo.token ||
        parsedUserInfo.access_token ||
        parsedUserInfo.accessToken ||
        null;

      if (token) {
        console.log(
          "[Auth] ✅ 获取到认证token:",
          token.substring(0, 20) + "..."
        );
      } else {
        console.warn("[Auth] ⚠️ 警告：用户信息中没有找到 token 字段！");
        console.warn("[Auth] 用户信息内容:", parsedUserInfo);
      }

      return token;
    }

    console.warn("[Auth] ⚠️ 未找到用户信息，无法获取token");
    return null;
  } catch (error) {
    console.error("[Auth] 获取认证token失败:", error);
    return null;
  }
};

/**
 * 获取带认证的请求头
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token =  getAuthToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log(
      "[Auth] 请求头已添加Authorization:",
      `Bearer ${token.substring(0, 10)}...`
    );
  } else {
    console.log("[Auth] 未找到token，请求头不包含Authorization");
  }

  return headers;
};

/**
 * 检查用户是否已登录
 */
export const isUserLoggedIn = (): boolean => {
  try {
    // 首先检查 sessionStorage
    let userInfoStr = sessionStorage.getItem("feishu_user_info");

    // 如果 sessionStorage 中没有，检查 localStorage
    if (!userInfoStr) {
      userInfoStr = localStorage.getItem("feishu_user_info");
    }

    if (!userInfoStr) return false;

    const parsedUserInfo: RawUserInfo = JSON.parse(userInfoStr);
    return !!(
      parsedUserInfo &&
      parsedUserInfo.name &&
      parsedUserInfo.name !== "未知用户"
    );
  } catch (error) {
    console.error("[Auth] 检查用户登录状态失败:", error);
    return false;
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUserInfo = (): RawUserInfo | null => {
  try {
    const userInfoStr = localStorage.getItem("feishu_user_info");
    if (userInfoStr) {
      return JSON.parse(userInfoStr);
    }

    return null;
  } catch (error) {
    console.error("[Auth] 获取当前用户信息失败:", error);
    return null;
  }
};
