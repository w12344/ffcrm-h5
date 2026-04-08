import wx from 'weixin-js-sdk';

// 微信SDK配置接口
interface WxConfig {
  debug?: boolean;
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
  jsApiList: any[];
}

// 分享配置接口
export interface ShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

class WeChatSDK {
  private isConfigured = false;

  /**
   * 初始化微信SDK
   * @param config 微信配置参数
   */
  async config(config: WxConfig): Promise<boolean> {
    return new Promise((resolve) => {
      wx.config({
        debug: config.debug || false,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: config.jsApiList
      });

      wx.ready(() => {
        console.log('微信SDK配置成功');
        this.isConfigured = true;
        resolve(true);
      });

      wx.error((res: any) => {
        console.error('微信SDK配置失败:', res);
        this.isConfigured = false;
        resolve(false);
      });
    });
  }

  /**
   * 检查是否在微信环境中
   */
  isWeChatBrowser(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return /micromessenger/.test(ua);
  }

  /**
   * 获取微信配置（需要后端接口支持）
   * @param url 当前页面URL
   */
  async getWxConfig(url: string): Promise<WxConfig | null> {
    try {
      // 直接使用统一 http 封装
      const { http } = await import('../utils/request');
      const res = await http.post<WxConfig>('/wechat/config', { url });
      if (res && res.data) return res.data as any;
      
      // 如果后端接口不可用，返回null
      return null;
    } catch (error) {
      console.error('获取微信配置失败:', error);
      return null;
    }
  }

  /**
   * 配置分享到朋友圈
   * @param config 分享配置
   */
  shareToTimeline(config: ShareConfig): void {
    if (!this.isConfigured) {
      console.warn('微信SDK未配置，无法分享到朋友圈');
      return;
    }

    wx.updateTimelineShareData({
      title: config.title,
      link: config.link,
      imgUrl: config.imgUrl,
      success: () => {
        console.log('分享到朋友圈配置成功');
      },
      fail: (error: any) => {
        console.error('分享到朋友圈配置失败:', error);
      }
    });
  }

  /**
   * 配置分享给朋友
   * @param config 分享配置
   */
  shareToFriend(config: ShareConfig): void {
    if (!this.isConfigured) {
      console.warn('微信SDK未配置，无法分享给朋友');
      return;
    }

    wx.updateAppMessageShareData({
      title: config.title,
      desc: config.desc,
      link: config.link,
      imgUrl: config.imgUrl,
      success: () => {
        console.log('分享给朋友配置成功');
      },
      fail: (error: any) => {
        console.error('分享给朋友配置失败:', error);
      }
    });
  }

  /**
   * 配置所有分享选项
   * @param config 分享配置
   */
  configShare(config: ShareConfig): void {
    this.shareToFriend(config);
    this.shareToTimeline(config);
  }

  /**
   * 初始化微信分享功能
   * @param shareConfig 分享配置
   */
  async initShare(shareConfig: ShareConfig): Promise<boolean> {
    // 检查是否在微信环境中
    if (!this.isWeChatBrowser()) {
      console.log('非微信环境，跳过微信分享配置');
      return false;
    }

    try {
      // 获取当前页面URL
      const currentUrl = window.location.href.split('#')[0];
      
      // 获取微信配置
      const wxConfig = await this.getWxConfig(currentUrl);
      
      if (!wxConfig) {
        console.log('未获取到微信配置，使用基础分享配置');
        // 即使没有后端支持，也可以配置基础的分享信息
        // 但需要注意，没有签名验证的情况下，某些高级功能可能无法使用
        this.configShare(shareConfig);
        return false;
      }

      // 配置微信SDK
      const configSuccess = await this.config({
        ...wxConfig,
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareTimeline',
          'onMenuShareAppMessage'
        ] as any[]
      });

      if (configSuccess) {
        // 配置分享信息
        this.configShare(shareConfig);
        return true;
      }

      return false;
    } catch (error) {
      console.error('初始化微信分享失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const wechatSDK = new WeChatSDK();

// 导出类型
export type { WxConfig };
