/**
 * 登录相关 API
 */

import { http } from '@/utils/request';

export interface AccountLoginParams {
  mobile: string;
  encryptedPassword: string;
}

export interface LoginResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  name?: string;
  userName?: string;
  realName?: string;
  userId?: string | number;
  avatar?: string;
  [key: string]: any;
}

/**
 * 账号密码登录
 * POST /api/xxl-backend/login
 */
export async function accountLogin(params: AccountLoginParams) {
  const res = await http.post<LoginResponse>('/xxl-backend/login', params, {
    skipAuth: true,
  } as any);
  const body = res.data as any;
  // 兼容 { data: {...} } 或直接返回用户信息
  return (body?.data ?? body) as LoginResponse;
}
