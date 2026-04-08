/**
 * URL 构建工具函数
 */

/**
 * 检测是否为移动端
 */
export const isMobileDevice = (): boolean => {
  // 检测屏幕宽度
  const isMobileWidth = window.innerWidth <= 768;

  // 检测 User Agent
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /mobile|android|iphone|ipad|phone/i.test(userAgent);

  return isMobileWidth || isMobileUA;
};

/**
 * 智能导航：移动端直接跳转，PC端打开新窗口
 * @param url - 目标 URL
 * @param target - 窗口目标，默认为 '_blank'
 * @param features - 窗口特性，默认为 undefined
 */
export const smartNavigate = (
  url: string,
  target: string = "_blank",
  features?: string
): void => {
  if (isMobileDevice()) {
    // 移动端直接跳转
    target === "_blank"
      ? window.open(url, target, features)
      : (window.location.href = url);
  } else {
    // PC端打开新窗口
    window.open(url, target, features);
  }
};

/**
 * 获取应用的基础路径
 */
export const getBasePath = (): string => {
  // 从 import.meta.env.BASE_URL 获取 Vite 配置的 base 路径
  return import.meta.env.BASE_URL || "/";
};

/**
 * 从当前 URL 获取 token 参数
 */
export const getTokenFromUrl = (): string | null => {
  // 先尝试从主URL的query参数获取
  const mainUrlParams = new URLSearchParams(window.location.search);
  let token = mainUrlParams.get("token");

  // 如果主URL没有，尝试从hash后的query参数获取
  if (!token && window.location.hash) {
    const hashParts = window.location.hash.split("?");
    if (hashParts.length > 1) {
      const hashQuery = hashParts.slice(1).join("?");
      const hashParams = new URLSearchParams(hashQuery);
      token = hashParams.get("token");
    }
  }

  return token;
};

/**
 * 为 URL 添加 token 参数
 * @param url - 原始 URL
 * @returns 添加了 token 的 URL
 */
export const appendTokenToUrl = (url: string): string => {
  const token = getTokenFromUrl();
  if (!token) {
    return url;
  }

  // 处理 hash 路由格式：/#/path 或 /#/path?param=value
  if (url.includes('#/')) {
    const [baseUrl, hashPart] = url.split('#/');
    const [path, query] = hashPart.split('?');
    
    if (query) {
      // 已有查询参数，追加 token
      return `${baseUrl}#/${path}?${query}&token=${encodeURIComponent(token)}`;
    } else {
      // 没有查询参数，添加 token
      return `${baseUrl}#/${path}?token=${encodeURIComponent(token)}`;
    }
  }
  
  // 处理普通 URL 格式
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
};

/**
 * 构建完整的应用 URL
 * @param path - 路由路径（不包含 # 号）
 * @param preserveToken - 是否保留当前 URL 中的 token 参数，默认为 false
 * @returns 完整的 URL
 */
export const buildAppUrl = (
  path: string,
  preserveToken: boolean = false
): string => {
  const basePath = getBasePath();
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // 确保基础路径以 / 结尾
  const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;

  // 构建基础 URL：基础路径 + index.html + # + 路由路径
  let url = `${normalizedBasePath}index.html#/${cleanPath}`;

  // 如果需要保留 token，则添加到 query 参数中
  if (preserveToken) {
    const token = getTokenFromUrl();
    if (token) {
      // 检查路径中是否已经有 query 参数
      const separator = cleanPath.includes("?") ? "&" : "?";
      url = `${normalizedBasePath}index.html#/${cleanPath}${separator}token=${encodeURIComponent(
        token
      )}`;
    }
  }

  return url;
};

/**
 * 构建客户档案页面 URL
 * @param customerProfileId - 客户档案 ID
 * @param preserveToken - 是否保留当前 URL 中的 token 参数，默认为 false
 * @returns 客户档案页面的完整 URL
 */
export const buildCustomerProfileUrl = (
  customerProfileId: string,
  preserveToken: boolean = false
): string => {
  return buildAppUrl(`customer/${customerProfileId}`, preserveToken);
};

/**
 * 打开客户档案页面（移动端直接跳转，PC端新窗口）
 * @param customerProfileId - 客户档案 ID
 * @param preserveToken - 是否保留当前 URL 中的 token 参数，默认为 false
 */
export const openCustomerProfile = (
  customerProfileId: string,
  preserveToken: boolean = false
): void => {
  const url = buildCustomerProfileUrl(customerProfileId, preserveToken);
  smartNavigate(url);
};

/**
 * 构建成交报单页面 URL
 * @param preserveToken - 是否保留当前 URL 中的 token 参数，默认为 true
 * @returns 成交报单页面的完整 URL
 */
export const buildContractOrderUrl = (
  preserveToken: boolean = true
): string => {
  return buildAppUrl("contract-order", preserveToken);
};

/**
 * 打开成交报单页面（移动端直接跳转，PC端新窗口）
 * @param preserveToken - 是否保留当前 URL 中的 token 参数，默认为 true
 */
export const openContractOrder = (preserveToken: boolean = true): void => {
  const url = buildContractOrderUrl(preserveToken);
  smartNavigate(url);
};
