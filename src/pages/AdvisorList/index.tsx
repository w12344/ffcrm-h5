import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Toast } from '@arco-design/mobile-react';
import { Advisor } from '../../types';
import { advisorApi } from '../../services/api';
import { copyToClipboard } from '../../utils';
import { wechatSDK, ShareConfig } from '../../utils/wechat';
import './index.less';

// 节流函数
const throttle = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  return function (this: any, ...args: any[]) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};





const AdvisorList: React.FC = () => {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // 移除未使用的 currentPage 状态，使用 currentPageRef 来管理
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pageSize = 10;

  // 使用ref来跟踪请求状态，避免闭包问题
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRequestingRef = useRef(false);
  const currentPageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const loadingRef = useRef(false);

  // 加载顾问列表（首次加载）
  const loadAdvisors = useCallback(async (page: number = 1, isRefresh: boolean = false, name?: string) => {

    
    // 防止重复请求
    if (isRequestingRef.current) {
      return;
    }

    // 只有在没有正在进行的请求时才创建新的AbortController
    if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) {
      abortControllerRef.current = new AbortController();
    }
    isRequestingRef.current = true;

    // 设置加载状态
    if (page === 1) {
      setLoading(true);
      loadingRef.current = true;
    } else {
      setLoadingMore(true);
      loadingMoreRef.current = true;
    }

    try {
      // 优先使用传入的 name 参数，如果没有则使用 searchTerm 状态
      const searchName = name !== undefined ? name : searchTerm;

      const response = await advisorApi.getAdvisors(page, pageSize, searchName);
      // 如果请求成功完成，说明没有被取消
      
      console.log('API 返回数据:', response);

      if (response.code === 200 && response.data) {
        const { data: list, total: totalCount } = response.data;
        
        if (page === 1 || isRefresh) {
          // 首页或刷新
          // 使用函数式更新确保状态更新的一致性
          setAdvisors(() => {
            return list;
          });
          currentPageRef.current = 1;
        } else {
          // 加载更多
          setAdvisors(prev => {
            const newData = [...prev, ...list];
            return newData;
          });
          
          // 加载更多时，直接合并数据（服务端已按搜索条件过滤）
          
          currentPageRef.current = page;
        }
        
        setTotal(totalCount);
        // 更精确的 hasMore 计算
        const hasMoreData = list.length === pageSize && (page * pageSize) < totalCount;
        setHasMore(hasMoreData);
        hasMoreRef.current = hasMoreData;
        
        console.log('数据加载完成:', {
          page,
          listLength: list.length,
          pageSize,
          totalCount,
          hasMoreData,
          currentTotal: advisors.length + list.length
        });
        
        
        // 数据加载成功后，立即停止loading状态
        isRequestingRef.current = false;
        
        // 使用函数式更新确保loading状态在数据设置后更新
        setLoading(() => {
          return false;
        });
        setLoadingMore(() => {
          return false;
        });
        loadingRef.current = false;
        loadingMoreRef.current = false;
      } else {
        Toast.error(response.message || '加载顾问列表失败');
        
        // 确保在API失败时也清理loading状态
        isRequestingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
        loadingRef.current = false;
        loadingMoreRef.current = false;
      }
    } catch (error: any) {
      
      // 忽略取消的请求错误
      if (error.name === 'AbortError') {
        return;
      }
      
      // 确保在错误情况下也清理loading状态
      isRequestingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
      loadingMoreRef.current = false;
    } finally {
      if (isRequestingRef.current) {
        isRequestingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
        loadingRef.current = false;
        loadingMoreRef.current = false;
      }
    }
  }, []);

  // 加载更多
  const loadMore = useCallback(async () => {
    // 更严格的状态检查，使用 ref 获取最新状态
    if (loadingMoreRef.current || !hasMoreRef.current || isRequestingRef.current || loadingRef.current) {
      console.log('loadMore 被阻止:', { 
        loadingMore: loadingMoreRef.current, 
        hasMore: hasMoreRef.current, 
        isRequesting: isRequestingRef.current, 
        loading: loadingRef.current 
      });
      return;
    }
    
    const nextPage = currentPageRef.current + 1;
    console.log('开始加载更多，页码:', nextPage);
    
    // 直接传入当前的 searchTerm 值，避免闭包问题
    await loadAdvisors(nextPage, false, searchTerm);
  }, [loadAdvisors, searchTerm]);



  // 创建节流版本的滚动处理函数
  const throttledHandleScroll = useRef(
    throttle(() => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      
      // 计算滚动进度
      const progress = Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100);
      setScrollProgress(progress);
      
      // 严格检查是否应该触发加载更多
      // 使用 ref 获取最新状态，避免闭包问题
      // 1. 没有正在进行的请求
      // 2. 还有更多数据可以加载
      // 3. 不在加载更多状态
      // 4. 不在初始加载状态
      // 5. 滚动到距离底部150px以内
      const shouldLoadMore = !isRequestingRef.current && 
                           hasMoreRef.current && 
                           !loadingMoreRef.current && 
                           !loadingRef.current &&
                           (scrollHeight - scrollTop - clientHeight < 150);
      
      if (shouldLoadMore) {
        loadMore();
      }
    }, 200) // 增加节流时间到200ms，减少频繁调用
  ).current;

  // 复制链接
  const handleCopyLink = async (advisor: Advisor) => {
    // 添加按钮点击动画效果
    const button = document.querySelector(`[data-advisor-token="${advisor.token}"] .copy-btn`);
    if (button) {
      button.classList.add('btn-clicked');
      setTimeout(() => {
        button.classList.remove('btn-clicked');
      }, 300);
    }
    
    const link = advisor.employeeLink;
    const success = await copyToClipboard(link);
    
    if (success) {
      Toast.success('链接复制成功');
    } else {
      Toast.error('复制失败，请重试');
    }
  };

  // 转发链接
  const handleForwardLink = async (advisor: Advisor) => {
    // 点击时不改变按钮颜色，不做额外的点击动画
    
    const link = advisor.employeeLink;
    const shareConfig: ShareConfig = {
      title: `${advisor.name} - 专属顾问邀约`,
      desc: `点击链接，填写问卷，让${advisor.name}为您提供专业服务`,
      link: link,
      imgUrl: 'https://gd-pub.jinshujufiles.com/hi/2awB7mqIHE/20250830094433_fb97f3@hixlargeRetina'
    };

    // 如果在微信环境中：根据微信JS-SDK策略，无法直接拉起好友选择器。
    // 正确做法是预先配置分享信息，并提示用户使用右上角菜单进行分享。
    if (wechatSDK.isWeChatBrowser()) {
      try {
        await wechatSDK.initShare(shareConfig);
        Toast.success('请点击微信右上角使用分享');
      } catch (error) {
        Toast.error('分享配置失败，请重试');
      }
    } else {
      // 非微信环境，使用Web Share API或复制链接
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareConfig.title,
            text: shareConfig.desc,
            url: shareConfig.link
          });
          Toast.success('转发成功');
        } catch (error) {
          // 降级到复制链接
          const success = await copyToClipboard(shareConfig.link);
          if (success) {
            Toast.success('链接已复制到剪贴板，可手动分享');
          } else {
            Toast.error('转发失败');
          }
        }
      } else {
        // 降级到复制链接
        const success = await copyToClipboard(shareConfig.link);
        if (success) {
          Toast.success('链接已复制到剪贴板，可手动分享');
        } else {
          Toast.error('转发失败');
        }
      }
    }
  };

  // 防抖搜索相关状态
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchTimeRef = useRef<number>(0);
  const DEBOUNCE_DELAY = 4000; // 4秒防抖延迟

  // 执行搜索的内部函数
  const performSearch = useCallback((searchValue: string) => {
    currentPageRef.current = 1;
    loadAdvisors(1, true, searchValue);
    lastSearchTimeRef.current = Date.now();
  }, [loadAdvisors]);

  // 搜索顾问 - 只更新输入状态，不触发搜索
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // 执行搜索 - 在失去焦点或按回车时立即调用
  const handleSearchSubmit = useCallback(() => {
    // 清除定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    // 直接使用当前的 searchTerm 值，避免状态更新延迟问题
    const currentSearchTerm = searchTerm;
    
    // 如果搜索词为空，重置搜索
    if (!currentSearchTerm.trim()) {
      currentPageRef.current = 1;
      loadAdvisors(1, false, ''); // 传入空字符串，重置搜索
      return;
    }
    
    const currentTime = Date.now();
    const timeSinceLastSearch = currentTime - lastSearchTimeRef.current;
    
    // 如果距离上次搜索时间不足4秒，则需要等待
    if (timeSinceLastSearch < DEBOUNCE_DELAY) {
      return;
    }
    
    // 立即执行搜索
    performSearch(currentSearchTerm);
  }, [searchTerm, performSearch, DEBOUNCE_DELAY]);

  const handleClearSearch = useCallback(() => {

    setSearchTerm('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {

      abortControllerRef.current.abort();
    }
    isRequestingRef.current = false;
    loadingRef.current = false;
    loadingMoreRef.current = false;
    hasMoreRef.current = true;
    
    currentPageRef.current = 1;

    loadAdvisors(1, false, '');
  }, [loadAdvisors]);


  useEffect(() => {
    loadAdvisors(1, false, '');
    
    // 初始化微信分享
    const initWechatShare = async () => {
      const shareConfig: ShareConfig = {
        title: '飞帆CRM - 顾问列表',
        desc: '查看我们的专业顾问团队，为您提供优质服务',
        link: window.location.href,
        imgUrl: 'https://gd-pub.jinshujufiles.com/hi/2awB7mqIHE/20250830094433_fb97f3@hixlargeRetina'
      };
      
      await wechatSDK.initShare(shareConfig);
    };
    
    initWechatShare();

    // 添加滚动监听
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      // 清理工作
      window.removeEventListener('scroll', throttledHandleScroll);
      // 清理搜索定时器
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      // 在组件卸载时，只有当没有正在进行的请求时才清理AbortController
      // 这样可以避免React严格模式下正常请求被取消
      if (abortControllerRef.current && !isRequestingRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [throttledHandleScroll]);

  return (
    <div className="advisor-list">
      {/* 滚动进度条 */}
      <div className="scroll-progress-bar">
        <div 
          className="scroll-progress-fill" 
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
      
      {/* 导航栏 */}
      <div className="advisor-list-content">
        <div className="header">
          <h2>顾问列表</h2>
          <p>为每位顾问生成专属邀约链接，分享给家长填写问卷</p>
          
          {/* 搜索框 */}
          <div className="search-container">
            <div className="search-box">
              <svg className="search-icon" viewBox="0 0 20 20" width="18" height="18">
                <path d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9z"/>
              </svg>
              <input
                type="text"
                placeholder="搜索顾问姓名..."
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onBlur={handleSearchSubmit}
                className="search-input"
                lang="zh-CN"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
              />
              {/* 清空按钮 */}
              {searchTerm && (
                <button className="clear-btn" onClick={handleClearSearch}>
                  <svg viewBox="0 0 20 20" width="16" height="16">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z"/>
                  </svg>
                </button>
              )}
              {/* 搜索按钮 */}
              <button className="search-btn" onClick={handleSearchSubmit}>
                <svg viewBox="0 0 20 20" width="18" height="18">
                  <path d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9z"/>
                </svg>
              </button>
            </div>
            {searchTerm && (
              <div className="search-result-count">
                找到 {advisors.length} 位顾问
              </div>
            )}
          </div>
        </div>

        <div className="advisor-list-container">
          {advisors.map((advisor) => (
            <div 
              key={advisor.token} 
              className="advisor-card"
              data-advisor-token={advisor.token}
            >
              <div className="advisor-header">
                <div className="advisor-avatar">
                  <div className="avatar-circle">
                    {advisor.name.charAt(0)}
                  </div>
                </div>
                <div className="advisor-info">
                  <div className="advisor-name">{advisor.name}</div>
                  <div className="advisor-token">
                    <span className="token-label">邀请码：</span>
                    <span className="token-value">{advisor.token}</span>
                  </div>
                </div>
              </div>
              
              <div className="advisor-link">
                <span className="link-label">专属链接：</span>
                <div className="link-value">{advisor.employeeLink}</div>
              </div>
              
              <div className="advisor-actions">
                <Button
                  type="primary"
                  size="small"
                  className="copy-btn"
                  onClick={() => handleCopyLink(advisor)}
                >
                  <div className="btn-text">
                    <svg className="copy-icon" viewBox="0 0 16 16" width="14" height="14">
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                    </svg>
                    <span>复制</span>
                  </div>
                </Button>
                <Button
                  type="ghost"
                  size="small"
                  className="forward-btn"
                  onClick={() => handleForwardLink(advisor)}
                >
                  <div className="btn-text">
                    <svg className="forward-icon" viewBox="0 0 16 16" width="14" height="14">
                      <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
                    </svg>
                    <span>转发</span>
                  </div>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 骨架屏加载状态 */}
        {loading && (
          <div className="skeleton-container">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-header">
                  <div className="skeleton-avatar"></div>
                  <div className="skeleton-info">
                    <div className="skeleton-name"></div>
                    <div className="skeleton-token"></div>
                  </div>
                </div>
                <div className="skeleton-link"></div>
                <div className="skeleton-actions">
                  <div className="skeleton-button"></div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 加载更多状态 */}
        {loadingMore && (
          <div className="loading-more">
            <div className="loading-spinner"></div>
            <div className="loading-text">正在加载更多...</div>
          </div>
        )}

        {/* 空搜索结果 */}
        {!loading && searchTerm && advisors.length === 0 && (
          <div className="empty">
            <div className="empty-text">没有找到匹配的顾问</div>
          </div>
        )}

        {/* 数据统计 */}
        {total > 0 && (
          <div className="data-stats">
            已显示 {advisors.length} / {total} 位顾问
            {!hasMore && <span> · 已全部加载</span>}
          </div>
        )}
        </div>
    </div>
  );
};

export default AdvisorList;

