/**
 * 登录页面
 * 支持：飞书扫码登录、账号密码登录（手机号+RSA加密密码）
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { feishuAuth } from '@/utils/feishuAuth';
import { rsaEncrypt } from '@/utils/rsaEncrypt';
import { accountLogin } from '@/api/login';
import { useTheme } from '@/hooks/useTheme';
import loginBg from '@/assets/images/login.jpeg';
import './index.less';

declare global {
  interface Window {
    QRLogin?: (options: {
      id: string;
      goto: string;
      width?: string;
      height?: string;
      style?: string;
    }) => {
      matchOrigin?: (origin: string) => boolean;
      matchData?: (data: any) => boolean;
    };
  }
}

const FEISHU_APP_ID =
  (import.meta as any).env?.VITE_FEISHU_APP_ID || 'cli_a72728271138d00c';
const FEISHU_SDK_URL =
  'https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/passport/qrcode/LarkSSOSDKWebQRCode-1.0.3.js';

type LoginMethod = 'qr' | 'account';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading, error, reload } = useAuth();
  const { isDark } = useTheme();
  const themeClass = isDark ? 'dark-theme' : 'light-theme';
  const qrRenderedRef = useRef(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('account'); // Default to account for better UX on first load
  const [loginTransition, setLoginTransition] = useState<'idle' | 'authenticating' | 'success'>('idle');
  const [accountForm, setAccountForm] = useState({ mobile: '', password: '' });
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // ... (Keep existing hooks and logic unchanged for getRedirectUri, useEffects, handleAccountLogin, etc.)
  // Note: I'm skipping common logic for brevity in this tool call, but ensuring it's preserved in the final file.

  // [LOGIC PRESERVED FROM ORIGINAL FILE]
  const getRedirectUri = useCallback(() => {
    const base = `${window.location.origin}${window.location.pathname}`.replace(/\/+$/, '') || window.location.origin;
    const currentUri = base + '/';
    const envUri = (import.meta as any).env?.VITE_FEISHU_REDIRECT_URI;
    const uri = import.meta.env.DEV ? currentUri : (envUri || currentUri);
    return uri;
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = window.location.hash.includes('?')
      ? new URLSearchParams(window.location.hash.split('?')[1] || '')
      : null;
    if (urlParams.get('code') || hashParams?.get('code')) {
      setLoginTransition('authenticating');
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setLoginTransition('success');
      const timer = setTimeout(() => {
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectPath;
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const isInFeishu = /Lark|Feishu/i.test(navigator.userAgent);
    if (isInFeishu || loginMethod !== 'qr') return;

    const container = document.getElementById('feishu_login_container');
    if (!container || qrRenderedRef.current) return;

    const loadAndRenderQR = () => {
      if (window.QRLogin && container) {
        container.innerHTML = '';
        const redirectUri = getRedirectUri();
        localStorage.setItem('feishu_state', 'STATE');
        const goto = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${FEISHU_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=STATE`;

        const QRLoginObj = window.QRLogin({
          id: 'feishu_login_container',
          goto,
          width: '300',
          height: '300',
          style: 'width: 300px; height: 300px; border: none; background-color: transparent;',
        });

        const handleMessage = (event: MessageEvent) => {
          if (QRLoginObj?.matchOrigin?.(event.origin) && QRLoginObj?.matchData?.(event.data)) {
            const loginTmpCode = event.data?.tmp_code;
            if (loginTmpCode) {
              window.location.href = `${goto}&tmp_code=${loginTmpCode}`;
            }
          }
        };

        window.addEventListener('message', handleMessage);
        qrRenderedRef.current = true;
        return () => window.removeEventListener('message', handleMessage);
      }
    };

    if (document.getElementById('feishu-sdk')) {
      loadAndRenderQR();
      return;
    }

    const script = document.createElement('script');
    script.id = 'feishu-sdk';
    script.src = FEISHU_SDK_URL;
    script.onload = () => loadAndRenderQR();
    script.onerror = () => console.error('飞书 SDK 加载失败');
    document.head.appendChild(script);
  }, [getRedirectUri, loginMethod]);

  const handleAccountLogin = async () => {
    const { mobile, password } = accountForm;
    if (!mobile?.trim()) {
      setAccountError('请输入手机号');
      return;
    }
    if (!password?.trim()) {
      setAccountError('请输入密码');
      return;
    }

    setAccountLoading(true);
    setAccountError(null);

    try {
      const encryptedPassword = await rsaEncrypt(password);
      const userInfo = await accountLogin({
        mobile: mobile.trim(),
        encryptedPassword,
      });

      const token = userInfo?.token || userInfo?.access_token || userInfo?.accessToken;
      const name = userInfo?.name || userInfo?.realName || userInfo?.userName || '用户';

      if (!token) {
        throw new Error('登录失败，未获取到 token');
      }

      feishuAuth.saveUserInfoToSession(
        {
          token,
          access_token: token,
          accessToken: token,
          name,
          ...userInfo,
        },
        true
      );

      await reload();
    } catch (err: any) {
      setAccountError(err?.message || '登录失败，请检查手机号和密码');
    } finally {
      setAccountLoading(false);
    }
  };

  const switchLoginMethod = (method: LoginMethod) => {
    if (method !== loginMethod) {
      setLoginMethod(method);
      setAccountError(null);
      if (method === 'qr') {
        qrRenderedRef.current = false;
      }
    }
  };

  const handleFeishuLogin = async () => {
    if (feishuAuth.checkFeishuEnvironment()) {
      // 移动端飞书（window.h5sdk 存在）：SDK 免登
      setLoginTransition('authenticating');
      try {
        const userInfo = await feishuAuth.sdkAuth();
        const token = userInfo?.token || userInfo?.access_token || userInfo?.accessToken;
        const name = userInfo?.name || (userInfo as any)?.en_name || '用户';
        if (!token) throw new Error('未获取到 token');
        feishuAuth.saveUserInfoToSession(
          { token, access_token: token, accessToken: token, name, ...userInfo },
          true
        );
        await reload();
      } catch (err: any) {
        setLoginTransition('idle');
        console.error('飞书SDK登录失败:', err);
      }
    } else if (isInFeishu) {
      // 飞书桌面端（UA 匹配但无 h5sdk）：OAuth 跳转授权，一键登录
      setLoginTransition('authenticating');
      try {
        await feishuAuth.apiAuth();
      } catch (err: any) {
        setLoginTransition('idle');
        console.error('飞书OAuth授权失败:', err);
      }
    } else {
      // 普通浏览器：显示二维码扫码登录
      switchLoginMethod('qr');
    }
  };

  const isInFeishu = /Lark|Feishu/i.test(navigator.userAgent);
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = window.location.hash.includes('?') ? new URLSearchParams(window.location.hash.split('?')[1] || '') : null;
  const hasAuthCode = !!(urlParams.get('code') || hashParams?.get('code'));

  // 渲染逻辑
  if (loginTransition !== 'idle') {
    return (
      <div className={`login-page ${themeClass}`}>
        <div className={`login-transition-overlay ${loginTransition}`}>
          <div className="transition-content">
            {loginTransition === 'authenticating' ? (
              <>
                <div className="transition-spinner">
                  <div className="spinner-ring" />
                </div>
                <div className="transition-text">正在验证身份...</div>
              </>
            ) : (
              <>
                <div className="transition-check">
                  <CheckCircleFilled />
                </div>
                <div className="transition-text">登录成功</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`login-page ${themeClass}`}>
      <div className="login-split-container">
        {/* Left Side: Enhanced Graphic Design Form */}
        <div className="login-side login-side--left">
          <div className="design-decorative-bg">01</div>
          
          <div className="login-form-content">
            <header className="login-header-v2">
              <div className="brand-marker">
                <span className="marker-num">01</span>
                <span className="marker-sep">/</span>
                <span className="marker-text">AUTHENTICATION</span>
              </div>
              <div className="brand-dot-logo" />
            </header>
            
            <main className="login-main">
              <div className="apple-greeting-v2">
                {/* <h2 className="greeting-sub">非凡CRM</h2> */}
                <h1 className="greeting-main">{loginMethod === 'account' ? '账号登录' : '飞书登录'}</h1>
                <p className="description-text">进入数字化协作空间，开启高效业务增长</p>
              </div>

              <div className="apple-auth-section">
                {loginMethod === 'account' ? (
                  <div className="apple-form">
                    <div className="apple-input-field">
                      <input
                        type="tel"
                        required
                        value={accountForm.mobile}
                        onChange={(e) => setAccountForm(f => ({ ...f, mobile: e.target.value }))}
                        maxLength={11}
                      />
                      <label>您的手机号</label>
                    </div>

                    <div className="apple-input-field">
                      <input
                        type="password"
                        required
                        value={accountForm.password}
                        onChange={(e) => setAccountForm(f => ({ ...f, password: e.target.value }))}
                      />
                      <label>密码</label>
                    </div>

                    {accountError && <div className="apple-error">{accountError}</div>}

                    <div className="apple-primary-actions">
                      <button
                        className="apple-button apple-button--primary"
                        onClick={handleAccountLogin}
                        disabled={accountLoading}
                      >
                        {accountLoading ? '正在验证' : '继续'}
                      </button>
                    </div>

                    <div className="apple-secondary-bridge">
                      <div className="apple-divider" />
                      <span>或</span>
                    </div>

                    <button
                      className="apple-button apple-button--secondary"
                      onClick={handleFeishuLogin}
                    >
                      <div className="lark-icon-mini" />
                      使用飞书登录
                    </button>
                  </div>
                ) : (
                  <div className="apple-qr-flow">
                    <div className="apple-qr-wrapper">
                      <div id="feishu_login_container" />
                      {!isInFeishu && (hasAuthCode || (isLoading && !error)) && (
                        <div className="apple-spinner-overlay">
                          <LoadingOutlined spin />
                        </div>
                      )}
                    </div>
                    <p className="qr-guide">使用飞书移动端扫描二维码</p>

                    <div className="apple-secondary-bridge">
                      <div className="apple-divider" />
                      <span>或</span>
                    </div>

                    <button
                      className="apple-button apple-button--secondary"
                      onClick={() => {
                        setLoginTransition('authenticating');
                        feishuAuth.apiAuth().catch(() => setLoginTransition('idle'));
                      }}
                    >
                      已登录飞书客户端，点这里
                    </button>

                    <button
                      className="apple-button apple-button--secondary"
                      onClick={() => switchLoginMethod('account')}
                      style={{ marginTop: 12 }}
                    >
                      切换到账号登录
                    </button>
                  </div>
                )}
              </div>
            </main>

            <footer className="design-footer">
              <div className="slogan-block">
                <div className="slogan-line">EMPOWERING YOUR BUSINESS</div>
                {/* <div className="slogan-brand">非凡CRM SYSTEM <span>v2.0</span></div> */}
              </div>
            </footer>
          </div>
        </div>

        {/* Right Side: Media (Kept minimal as per user's last edit) */}
        <div className="login-side login-side--right">
          <div className="apple-visual-wrapper" style={{ backgroundImage: `url(${loginBg})` }} />
        </div>
      </div>
    </div>
  );
};

export default Login;
