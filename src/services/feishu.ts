/**
 * 飞书认证 API 服务
 * 基于统一的 http 工具封装
 */

import { http } from '@/utils/request'

/**
 * 获取 APP ID 响应类型
 */
export interface GetAppIdResponse {
  appid: string
}

/**
 * 用户信息类型（原始）
 */
export interface RawUserInfo {
  name?: string
  en_name?: string
  user_name?: string
  display_name?: string
  avatar_url?: string
  avatar?: string
  picture?: string
  token?: string
  access_token?: string
  accessToken?: string
  [key: string]: any
}

/**
 * 获取 APP ID
 */
export const getFeishuAppId = () => {
  return http.get<GetAppIdResponse>('/feishu/app/auth/get_appid', {
    skipAuth: true // 获取 APP ID 不需要认证
  })
}

/**
 * 通过 SDK code 获取用户信息
 * @param code SDK 授权码
 */
export const getUserInfoBySdkCode = (code: string) => {
  return http.get<RawUserInfo>('/feishu/app/auth/getUserInfoBySdkCode', {
    params: { code },
    skipAuth: true // SDK 免登不需要认证头
  })
}

/**
 * 通过 API code 获取用户信息
 * @param code API 授权码
 * @param redirectUri 重定向URI
 */
export const getUserInfoByApiCode = (code: string, redirectUri: string) => {
  return http.get<RawUserInfo>('/feishu/app/auth/getUserInfoByApiCode', {
    params: { 
      code,
      redirectUri 
    },
    skipAuth: true // API 授权不需要认证头
  })
}

/**
 * 验证 token 是否有效并获取用户信息
 * @param token 访问令牌
 */
export const validateToken = (token: string) => {
  return http.get<RawUserInfo>('/feishu/app/auth/validateToken', {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    skipAuth: true // 使用自定义 header，不使用默认的 auth 逻辑
  })
}

/**
 * 飞书 API 对象（统一导出）
 */
export const feishuApi = {
  /** 获取 APP ID */
  getAppId: getFeishuAppId,
  /** 通过 SDK code 获取用户信息 */
  getUserInfoBySdkCode,
  /** 通过 API code 获取用户信息 */
  getUserInfoByApiCode,
  /** 验证 token 是否有效 */
  validateToken
}

/**
 * 默认导出
 */
export default feishuApi

