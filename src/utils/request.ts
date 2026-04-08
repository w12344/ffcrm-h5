import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from './auth';

export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success?: boolean;
}

export interface RequestConfig extends Omit<InternalAxiosRequestConfig, 'headers'> {
  skipErrorHandler?: boolean;
  skipAuth?: boolean; // 新增：是否跳过自动添加认证头
  onUploadProgress?: (progressEvent: any) => void;
  headers?: any;
}

const getBaseURL = () => {
  if (import.meta.env.DEV) return '/api';
  const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL ? `${(import.meta as any).env.VITE_API_BASE_URL}/api` : '/api';
  return apiBaseUrl;
};

const request: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 自动添加认证 token（除非明确跳过）
    const skipAuth = (config as any).skipAuth;
    if (!skipAuth) {
      const token = getAuthToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // GET 请求添加时间戳防止缓存
    if (config.method?.toLowerCase() === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    // 开发环境日志
    if (import.meta.env.DEV) {
      console.log('Request:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        params: config.params,
        data: config.data,
        hasAuth: !!config.headers?.['Authorization'],
      });
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

request.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const { data } = response;
    if (import.meta.env.DEV) {
      console.log('Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    if (data && typeof data === 'object' && 'code' in data) {
      const { code, success } = data as BaseResponse;
      if (success === true || code === 200 || code === 0) return response;
      return Promise.reject(new Error((data as BaseResponse).message || '请求失败'));
    }
    return response;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    const status = error.response?.status;
    
    // 处理 401 未授权错误 - token 失效
    if (status === 401) {
      console.warn('[Request] Token 已失效，清除缓存');
      // 清除缓存的用户信息和 token
      sessionStorage.removeItem('feishu_user_info');
      localStorage.removeItem('feishu_user_info');
      
      // 保存当前路径，登录后跳转回来
      const currentPath = window.location.pathname + window.location.hash;
      if (currentPath && currentPath !== '/') {
        localStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      // 直接跳转登录页
      window.location.replace(`${window.location.origin}${window.location.pathname}#/login`);
      
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    
    // 提取错误响应中的 message
    if (error.response?.data) {
      const responseData = error.response.data as any;
      // 如果响应数据中有 message 字段，使用它
      if (responseData.message) {
        return Promise.reject(new Error(responseData.message));
      }
      // 如果有 msg 字段（某些接口可能使用 msg）
      if (responseData.msg) {
        return Promise.reject(new Error(responseData.msg));
      }
    }
    
    // 如果没有自定义消息，使用默认错误消息
    const statusMessages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '拒绝访问',
      404: '请求的资源不存在',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
    };
    
    const defaultMessage = status ? statusMessages[status] || `请求失败 (${status})` : '网络错误，请检查网络连接';
    
    return Promise.reject(new Error(error.message || defaultMessage));
  }
);

export const http = {
  get<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<BaseResponse<T>>> {
    return request.get(url, config);
  },
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<BaseResponse<T>>> {
    return request.post(url, data, config);
  },
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<BaseResponse<T>>> {
    return request.put(url, data, config);
  },
  delete<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<BaseResponse<T>>> {
    return request.delete(url, config);
  },
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<BaseResponse<T>>> {
    return request.patch(url, data, config);
  },
  upload<T = any>(url: string, formData: FormData, config?: RequestConfig): Promise<AxiosResponse<BaseResponse<T>>> {
    const uploadConfig: RequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    };
    if (config?.onUploadProgress) uploadConfig.onUploadProgress = config.onUploadProgress;
    return request.post(url, formData, uploadConfig);
  },
};

export default request;
export { request };


