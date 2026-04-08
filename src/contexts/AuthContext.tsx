/**
 * 认证上下文
 *
 * 功能：
 * 1. 全局管理用户认证状态
 * 2. 避免多个组件实例状态不同步
 * 3. 提供统一的认证接口
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { feishuAuth, FormattedUserInfo } from "@/utils/feishuAuth";
import { getAuthToken } from "@/utils/auth";

interface AuthContextValue {
  /** 用户信息 */
  userInfo: FormattedUserInfo | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否已登录 */
  isLoggedIn: boolean;
  /** 是否有有效的 token */
  hasToken: boolean;
  /** 登录方法 */
  login: () => Promise<void>;
  /** 登出方法 */
  logout: () => void;
  /** 重新加载用户信息 */
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  /** 是否自动登录（默认 true） */
  autoLogin?: boolean;
}

/**
 * 认证提供者组件
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  autoLogin = true,
}) => {
  const [userInfo, setUserInfo] = useState<FormattedUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [hasToken, setHasToken] = useState<boolean>(false);

  /**
   * 获取用户信息
   */
  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("[AuthContext] 开始获取用户信息...");
      const userData = await feishuAuth.checkLoginAndGetUser();

      console.log("[AuthContext] 用户信息获取成功:", userData);

      // 检查是否有 token
      const token = getAuthToken();
      const hasValidToken = !!token;
      console.log(
        "[AuthContext] Token 状态:",
        hasValidToken ? "已获取" : "未获取"
      );

      // 批量更新状态，确保所有状态同时更新
      setUserInfo(userData);
      setHasToken(hasValidToken);
      setIsLoading(false);

      console.log("[AuthContext] 状态更新完成");
    } catch (err: any) {
      console.error("[AuthContext] 获取用户信息失败:", err);

      // 根据错误类型设置不同的错误信息
      let errorMessage = "获取用户信息失败";

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage = `后端服务器未启动`;
      } else if (
        err.message.includes("NetworkError") ||
        err.message.includes("Failed to fetch")
      ) {
        errorMessage = "网络连接失败，请检查后端服务";
      } else if (err.message.includes("获取到的用户信息无效")) {
        errorMessage = "用户信息获取失败，请重新登录";
      } else {
        errorMessage = err.message || "获取用户信息失败";
      }

      setError(errorMessage);
      setUserInfo(null);
      setHasToken(false);
      setIsLoading(false);
    }
  }, []);

  /**
   * 处理授权码回调
   */
  const handleAuthorizationCode = useCallback(
    async (code: string, state: string) => {
      try {
        console.log("[AuthContext] 检测到授权码，开始处理回调...");

        setIsLoading(true);
        setError(null);

        // 处理授权码，保存用户信息和token
        const userData = await feishuAuth.handleAuthorizationCode(code, state);
        console.log("[AuthContext] 授权码处理成功:", userData);

        // 检查是否有 token
        const token = getAuthToken();
        const hasValidToken = !!token;
        console.log(
          "[AuthContext] Token 状态:",
          hasValidToken ? "已获取" : "未获取"
        );

        console.log("[AuthContext] 授权完成，准备刷新页面...");

        // 清除URL中的授权码参数，然后刷新页面
        const newUrl = window.location.pathname + window.location.hash;
        
        // 检查是否有保存的重定向路径
        const redirectPath = localStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          console.log("[AuthContext] 检测到重定向路径，跳转:", redirectPath);
          localStorage.removeItem("redirectAfterLogin");
          window.location.href = redirectPath;
        } else {
          // 没有重定向路径，刷新当前页面（清除URL参数）
          console.log("[AuthContext] 刷新页面，清除授权码参数");
          window.location.href = newUrl;
        }
      } catch (err: any) {
        console.error("[AuthContext] 处理授权码失败:", err);
        setError(err.message || "处理授权码失败");
        setUserInfo(null);
        setHasToken(false);
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * 处理URL中的token参数
   */
  const handleUrlToken = useCallback(async () => {
    try {
      // 从URL中获取token（支持hash路由后的参数）
      let urlToken: string | null = null;
      
      // 先尝试从主URL的query参数获取
      const mainUrlParams = new URLSearchParams(window.location.search);
      urlToken = mainUrlParams.get("token");
      
      // 如果主URL没有，尝试从hash后的query参数获取
      if (!urlToken && window.location.hash) {
        const hashParts = window.location.hash.split('?');
        if (hashParts.length > 1) {
          const hashQuery = hashParts.slice(1).join('?');
          const hashParams = new URLSearchParams(hashQuery);
          urlToken = hashParams.get("token");
        }
      }
      
      if (!urlToken) {
        return false; // 没有token，返回false表示需要继续授权流程
      }
      
      console.log("[AuthContext] ✅ 检测到URL中的token，跳过飞书授权登录");
      
      // 构造一个包含token的用户信息对象，保存到sessionStorage（不持久化）
      // 这样checkLoginAndGetUser会直接使用这个token，且不会污染localStorage中的原用户信息
      const tokenUserInfo = {
        token: urlToken,
        access_token: urlToken,
        accessToken: urlToken,
        name: "用户", // 临时用户名，后续可以通过API获取真实信息
      };
      
      // 保存到 sessionStorage（不持久化）
      feishuAuth.saveUserInfoToSession(tokenUserInfo, false);
      
      // 注意：保留URL中的token参数，以便用户刷新页面时仍可使用
      // 如果出于安全考虑需要清除token，可以取消下面的注释
      // try {
      //   const cleanHash = window.location.hash.split('?')[0];
      //   const cleanSearch = new URLSearchParams(window.location.search);
      //   cleanSearch.delete('token');
      //   const newSearch = cleanSearch.toString();
      //   
      //   let finalHash = cleanHash;
      //   if (window.location.hash.includes('token=')) {
      //     const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      //     hashParams.delete('token');
      //     const hashQuery = hashParams.toString();
      //     finalHash = hashQuery ? `${cleanHash}?${hashQuery}` : cleanHash;
      //   }
      //   
      //   const finalUrl = window.location.pathname + 
      //     (newSearch ? `?${newSearch}` : '') + 
      //     finalHash;
      //   window.history.replaceState({}, '', finalUrl);
      //   console.log("[AuthContext] 已清除URL中的token参数");
      // } catch (err) {
      //   console.warn("[AuthContext] 清除URL参数失败:", err);
      // }
      
      // 获取用户信息（会使用刚才保存的token）
      await fetchUserInfo();
      
      return true; // 返回true表示已处理token
    } catch (err: any) {
      console.error("[AuthContext] 处理URL token失败:", err);
      // 如果处理失败，清除可能已保存的错误信息
      feishuAuth.clearUserInfo();
      return false; // 返回false，继续授权流程
    }
  }, [fetchUserInfo]);

  /**
   * 初始化
   */
  useEffect(() => {
    // 防止重复初始化
    if (hasInitialized) {
      console.log("[AuthContext] 已初始化，跳过");
      return;
    }

    if (!autoLogin) {
      setIsLoading(false);
      setHasInitialized(true);
      return;
    }

    console.log("[AuthContext] 组件初始化，开始检查登录状态...");

    // 优先检查环境变量中的 VITE_TOKEN
    const envToken = import.meta.env.VITE_TOKEN;
    if (envToken) {
      console.log("[AuthContext] ✅ 检测到环境变量 VITE_TOKEN，跳过登录流程");
      const tokenUserInfo = {
        token: envToken,
        access_token: envToken,
        accessToken: envToken,
        name: "用户",
      };
      feishuAuth.saveUserInfoToSession(tokenUserInfo, false);
      setHasInitialized(true);
      fetchUserInfo();
      return;
    }

    // 先检查URL中是否有token参数
    setHasInitialized(true);
    handleUrlToken().then((hasToken) => {
      if (hasToken) {
        // 已处理token，流程结束
        console.log("[AuthContext] URL token处理完成");
        return;
      }
      
      // 没有token，继续检查授权码
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = window.location.hash.includes("?")
        ? new URLSearchParams(window.location.hash.split("?")[1] || "")
        : null;
      const code = urlParams.get("code") || hashParams?.get("code");
      const state = urlParams.get("state") || hashParams?.get("state");
      const urlError = urlParams.get("error");

      console.log("[AuthContext] URL参数检查:", { code, state, error: urlError });

      if (code && state) {
        // 处理授权码回调（飞书登录回调）
        console.log("[AuthContext] 检测到授权码，准备处理...");
        handleAuthorizationCode(code, state);
      } else {
        // 先检查是否有缓存的登录信息
        const cachedUserInfo = feishuAuth.getSessionUserInfo();
        if (cachedUserInfo && cachedUserInfo.token) {
          console.log("[AuthContext] 检测到缓存的用户信息，直接使用");
          setUserInfo(cachedUserInfo);
          setHasToken(true);
          setIsLoading(false);
        } else if (feishuAuth.checkFeishuEnvironment()) {
          // 飞书环境：无论是否在登录页，直接触发 SDK 免登
          console.log("[AuthContext] 飞书环境，自动触发 SDK 免登...");
          fetchUserInfo();
        } else {
          // 非飞书环境：路由守卫负责重定向到登录页，或等待用户手动操作
          console.log("[AuthContext] 非飞书环境，等待用户操作");
          setIsLoading(false);
        }
      }
    });
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
      console.error("[AuthContext] 登录失败:", err);
      setError(err.message || "登录失败");
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
    setHasToken(false);

    // 清除重定向路径
    localStorage.removeItem("redirectAfterLogin");

    console.log("[AuthContext] 用户已登出");
  }, []);

  /**
   * 重新加载用户信息
   */
  const reload = useCallback(async () => {
    await fetchUserInfo();
  }, [fetchUserInfo]);

  const value: AuthContextValue = {
    userInfo,
    isLoading,
    error,
    isLoggedIn: !!userInfo && !!userInfo.name && userInfo.name !== "未知用户",
    hasToken,
    login,
    logout,
    reload,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 使用认证上下文的 Hook
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
