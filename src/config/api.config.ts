// API配置文件
export const API_CONFIG = {
  // 开发环境
  development: {
    baseURL: '/',
    target: 'https://van-api.ffjy.org',
    timeout: 10000,
  },
  // 生产环境
  production: {
    // 使用同源前缀，避免浏览器CORS。请在部署的Web服务器上将 /api 反向代理到目标后端。
    baseURL: '/',
    target: 'https://van-api.ffjy.org',
    timeout: 15000,
  },
  // 测试环境
  test: {
    baseURL: '/',
    target: 'https://van-api.ffjy.org',
    timeout: 10000,
  },
};

// 获取当前环境
export const getCurrentEnv = () => {
  return import.meta.env.MODE || 'development';
};

// 获取当前环境的API配置
export const getAPIConfig = () => {
  const env = getCurrentEnv() as keyof typeof API_CONFIG;
  const base = API_CONFIG[env] || API_CONFIG.development;
  // 允许通过环境变量覆盖基础URL，保持与 axios 工具的一致策略
  // 生产环境：优先使用 VITE_API_BASE_URL + '/api'，否则回退到 '/api'（依赖同源反代）
  const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
  const resolvedBaseURL = envBase ? `${envBase.replace(/\/$/, '')}` : base.baseURL;
  return { ...base, baseURL: resolvedBaseURL };
};

// 微信配置
export const WECHAT_CONFIG = {
  appId: import.meta.env.VITE_WECHAT_APP_ID || 'your_wechat_app_id',
  debug: import.meta.env.MODE === 'development',
};
