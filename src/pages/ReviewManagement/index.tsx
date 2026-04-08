import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Toast, 
  Input,
  Button,
  Dialog
} from '@arco-design/mobile-react';
import './index.less';
import { surveyApi, deliveryReception, approveReception } from '../../services/api';


interface AppointmentForm {
  subject?: string;
  childAttending?: boolean;
  appointmentTime?: string;
  appointmentType?: string;
  assessmentMethod?: string;
  learningFocus?: string[];
  advisorName?: string;
}

interface SurveyData {
  id: number;
  studentName: string;
  contactPhone: string;
  childAttending: boolean;
  appointmentTime: string;
  assessmentMethod: string;
  appointmentType: string;
  subject: string;
  learningFocus: string[];
  advisorName: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  deliveryState: number; // 0: 未交付, 1: 已交付
  createdAt: string;
  updatedAt: string;
}

// 存储键名
const STORAGE_KEYS = {
  USERNAME: 'review_management_username',
  PASSWORD: 'review_management_password',
  LOGIN_TIME: 'review_management_login_time',
  AUTO_LOGIN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7天过期
};

const ReviewManagement: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<number | undefined>(undefined); // undefined: 全部, 0: 待审核, 100: 已审核
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  
  // 使用ref来跟踪请求状态，避免闭包问题
  const abortControllerRef = useRef<AbortController | null>(null);
  const isRequestingRef = useRef(false);
  const currentPageRef = useRef(1);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 使用ref保存最新的筛选状态，避免闭包问题
  const activeTabRef = useRef<number | undefined>(undefined);
  const deliveryFilterRef = useRef<number | undefined>(undefined);
  const hasMoreRef = useRef<boolean>(true);
  const [isFeishuEnv, setIsFeishuEnv] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<number | undefined>(undefined); // undefined: 全部, 0: 待交付, 100: 已交付
  
  // 同步状态到ref
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);
  
  useEffect(() => {
    deliveryFilterRef.current = deliveryFilter;
  }, [deliveryFilter]);
  
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentRejectSurvey, setCurrentRejectSurvey] = useState<SurveyData | null>(null);
  
  // 表单验证规则
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});


  // 检查自动登录
  const checkAutoLogin = () => {
    try {
      const savedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
      const savedPassword = localStorage.getItem(STORAGE_KEYS.PASSWORD);
      const loginTime = localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);
      
      if (savedUsername && savedPassword && loginTime) {
        const timeDiff = Date.now() - parseInt(loginTime);
        
        // 检查是否过期
        if (timeDiff < STORAGE_KEYS.AUTO_LOGIN_EXPIRY) {
          // 自动登录
          setUsername(savedUsername);
          setPassword(savedPassword);
          setRememberLogin(true);
          
          // 验证凭据
          if (savedUsername === 'admin' && savedPassword === 'admin123') {
            setIsLoggedIn(true);
            loadSurveyData(1, true, undefined, undefined); // 默认加载全部数据，所有交付状态
          } else {
            // 凭据无效，清除存储
            clearLoginStorage();
          }
        } else {
          // 过期，清除存储
          clearLoginStorage();
          Toast.info('登录凭据已过期，请重新登录');
        }
      }
    } catch (error) {
      console.error('自动登录失败:', error);
      clearLoginStorage();
    }
  };

  // 保存登录信息到本地存储
  const saveLoginToStorage = (username: string, password: string) => {
    if (rememberLogin) {
      try {
        localStorage.setItem(STORAGE_KEYS.USERNAME, username);
        localStorage.setItem(STORAGE_KEYS.PASSWORD, password);
        localStorage.setItem(STORAGE_KEYS.LOGIN_TIME, Date.now().toString());
      } catch (error) {
        console.error('保存登录信息失败:', error);
      }
    }
  };

  // 清除本地存储的登录信息
  const clearLoginStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USERNAME);
      localStorage.removeItem(STORAGE_KEYS.PASSWORD);
      localStorage.removeItem(STORAGE_KEYS.LOGIN_TIME);
    } catch (error) {
      console.error('清除登录信息失败:', error);
    }
  };

  // 检测飞书环境
  const detectFeishuEnvironment = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isFeishu = userAgent.includes('feishu') || 
                     userAgent.includes('lark') || 
                     window.location.href.includes('feishu') ||
                     window.location.href.includes('lark');
    setIsFeishuEnv(isFeishu);
  };

  // 组件挂载时检查自动登录和环境
  useEffect(() => {
    detectFeishuEnvironment();
    checkAutoLogin();
    
    // 清理函数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);


  // 定时清理过期的登录信息
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const loginTime = localStorage.getItem(STORAGE_KEYS.LOGIN_TIME);
      if (loginTime) {
        const timeDiff = Date.now() - parseInt(loginTime);
        if (timeDiff >= STORAGE_KEYS.AUTO_LOGIN_EXPIRY) {
          clearLoginStorage();
        }
      }
    }, 60 * 60 * 1000); // 每小时检查一次

    return () => clearInterval(cleanupInterval);
  }, []);

  // 模拟登录API
  const handleLogin = async () => {
    // 清除之前的错误
    setErrors({});
    
    // 验证必填字段
    if (!username.trim()) {
      setErrors(prev => ({ ...prev, username: '请输入用户名' }));
      return;
    }
    
    if (!password.trim()) {
      setErrors(prev => ({ ...prev, password: '请输入密码' }));
      return;
    }

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (username === 'admin' && password === 'admin123') {
        setIsLoggedIn(true);
        
        // 保存登录信息到本地存储
        saveLoginToStorage(username, password);
        
        Toast.success('登录成功！');
        // 加载数据
        loadSurveyData(1, true, undefined, undefined); // 默认加载全部数据，所有交付状态
      } else {
        Toast.error('用户名或密码错误！');
      }
    } catch (error) {
      Toast.error('登录失败，请重试！');
    }
  };

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


  // 加载问卷数据
  const loadSurveyData = useCallback(async (page: number = 1, isRefresh: boolean = false, state?: number, deliveryState?: number) => {
    console.log('📡 开始加载数据:', { 
      page, 
      isRefresh, 
      state, 
      deliveryState,
      isRequesting: isRequestingRef.current
    });
    
    // 防止重复请求
    if (isRequestingRef.current) {
      console.log('⏸️ 请求已在进行中，跳过');
      return;
    }

    // 只有在没有正在进行的请求时才创建新的AbortController
    if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) {
      abortControllerRef.current = new AbortController();
    }
    isRequestingRef.current = true;

    // 设置加载状态
    if (page === 1 || isRefresh) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await surveyApi.getReceptionList(undefined, state, page, pageSize, deliveryState);
      console.log('📥 API响应:', { 
        code: response.code, 
        dataLength: response.data?.data?.length || 0,
        total: response.data?.total || 0,
        hasNext: response.data?.hasNext
      });
      
      if (response.code === 200 && response.data) {
        // 确保 data.data 是数组，如果不是或者为空，则使用空数组
        const dataArray = Array.isArray(response.data.data) ? response.data.data : [];
        
        // 转换数据格式以适配现有组件
        const convertedData: SurveyData[] = dataArray.map((record: any) => {
          // 解析 appointmentForm JSON 字符串
          let appointmentForm: AppointmentForm = {};
          try {
            appointmentForm = JSON.parse(record.appointmentForm || '{}') as AppointmentForm;
          } catch (e) {
            console.error('解析 appointmentForm 失败:', e);
            appointmentForm = {};
          }

          return {
            id: parseInt(record.id),
            studentName: record.name || '未知学员',
            contactPhone: record.mobile || '未提供',
            childAttending: appointmentForm.childAttending || false,
            appointmentTime: appointmentForm.appointmentTime || '未设置',
            assessmentMethod: appointmentForm.assessmentMethod || '未设置',
            appointmentType: appointmentForm.appointmentType || '未设置',
            subject: appointmentForm.subject || '未设置',
            learningFocus: appointmentForm.learningFocus || [],
            advisorName: appointmentForm.advisorName || '待分配',
            date: record.createdAt?.split(' ')[0] || '',
            status: record.state === 0 ? 'pending' : record.state === 1 ? 'approved' : 'rejected',
            deliveryState: record.deliveryState || 0, // 默认为未交付
            createdAt: record.createdAt || '',
            updatedAt: record.updatedAt || ''
          };
        });
        
        if (page === 1 || isRefresh) {
          console.log('🔄 设置新数据 (第一页/刷新):', { 
            newDataLength: convertedData.length,
            total: response.data.total || 0
          });
          setSurveys(convertedData);
          currentPageRef.current = 1;
        } else {
          setSurveys(prevSurveys => {
            console.log('📝 追加数据:', { 
              existingLength: prevSurveys.length,
              newDataLength: convertedData.length,
              totalAfter: prevSurveys.length + convertedData.length
            });
            return [...prevSurveys, ...convertedData];
          });
          currentPageRef.current = page;
        }
        
        setTotal(response.data.total || 0);
        // 使用API返回的hasNext字段来判断是否还有更多数据
        const hasMoreData = response.data.hasNext === true;
        setHasMore(hasMoreData);
        hasMoreRef.current = hasMoreData;
      } else {
        // API调用失败或数据格式错误
        Toast.error(response.message || '加载数据失败！');
        // 重置为空数据状态
        if (page === 1 || isRefresh) {
          setSurveys([]);
          setTotal(0);
        }
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch (error: any) {
      // 忽略取消的请求错误
      if (error.name === 'AbortError') {
        return;
      }
      
      Toast.error('加载数据失败！');
      console.error('加载数据失败:', error);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      isRequestingRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize]);


  // 加载更多
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || isRequestingRef.current) return;
    
    const nextPage = currentPageRef.current + 1;
    // 使用ref获取最新的筛选参数，避免闭包问题
    await loadSurveyData(nextPage, false, activeTabRef.current, deliveryFilterRef.current);
  }, [hasMore, loadingMore, loadSurveyData]);

  // 创建节流版本的滚动处理函数
  const throttledHandleScroll = useRef(
    throttle(() => {
      // 使用ref来获取最新状态，避免闭包问题
      if (isRequestingRef.current) return;
      
      // 检查是否还有更多数据，如果没有则直接返回，避免不必要的计算和函数调用
      if (!hasMoreRef.current) return;
      
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      
      // 当滚动到距离底部150px时开始加载更多，提前触发
      if (scrollHeight - scrollTop - clientHeight < 150) {
        loadMore();
      }
    }, 100) // 100ms节流
  ).current;

  // 滚动监听器
  useEffect(() => {
    if (isLoggedIn) {
      window.addEventListener('scroll', throttledHandleScroll);
      return () => {
        window.removeEventListener('scroll', throttledHandleScroll);
      };
    }
  }, [isLoggedIn, throttledHandleScroll]);

  // 处理标签页切换
  const handleTabChange = (index: number | undefined) => {
    console.log('🔄 标签切换开始:', { 
      from: activeTab, 
      to: index, 
      currentSurveysCount: surveys.length 
    });
    
    setActiveTab(index);
    activeTabRef.current = index; // 同步更新ref
    currentPageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
    }
    
    // 取消所有防抖请求
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // 立即清空列表数据，避免显示旧数据
    setSurveys([]);
    setTotal(0);
    // 如果切换到待审核状态，重置交付状态为全部
    let currentDeliveryFilter = deliveryFilter;
    if (index === 0) {
      currentDeliveryFilter = undefined;
      setDeliveryFilter(undefined);
      deliveryFilterRef.current = undefined; // 同步更新ref
    }
    
    const state = index; // undefined: 全部, 0: 待审核, 100: 已审核
    console.log('🚀 即将请求数据:', { state, deliveryFilter: currentDeliveryFilter });
    // 立即加载新数据，不使用防抖
    loadSurveyData(1, true, state, currentDeliveryFilter);
  };

  // 处理交付状态筛选
  const handleDeliveryFilterChange = (deliveryState: number | undefined) => {
    console.log('🔄 交付状态切换开始:', { 
      from: deliveryFilter, 
      to: deliveryState 
    });
    
    setDeliveryFilter(deliveryState);
    deliveryFilterRef.current = deliveryState; // 同步更新ref
    currentPageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
    }
    
    // 取消所有防抖请求
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // 立即清空列表数据，避免显示旧数据
    setSurveys([]);
    setTotal(0);
    console.log('✅ 已清空列表数据和防抖请求');
    
    // 立即加载新数据，不使用防抖
    loadSurveyData(1, true, activeTab, deliveryState);
  };

  // 处理审核通过
  const handleApprove = async (survey: SurveyData) => {
    setActionLoading(true);
    try {
      // 使用新的审核接口，state=1表示审批通过
      await approveReception(survey.id, 1);
      
      Toast.success('审核通过成功');
      // 重新加载数据
      loadSurveyData(1, true, activeTab, deliveryFilter);
    } catch (error) {
      console.error('审核通过失败:', error);
      Toast.error('审核通过失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 打开拒绝弹窗
  const openRejectModal = (survey: SurveyData) => {
    setCurrentRejectSurvey(survey);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // 确认拒绝
  const confirmReject = async () => {
    if (!currentRejectSurvey) return;
    if (!rejectReason || !rejectReason.trim()) {
      Toast.error('请填写拒绝原因');
      return;
    }

    setActionLoading(true);
    try {
      await approveReception(currentRejectSurvey.id, -1, rejectReason.trim());

      Toast.success('审核拒绝成功');
      setRejectModalVisible(false);
      setCurrentRejectSurvey(null);
      setRejectReason('');
      // 重新加载数据
      loadSurveyData(1, true, activeTab, deliveryFilter);
    } catch (error) {
      console.error('审核拒绝失败:', error);
      Toast.error('审核拒绝失败，请重试');
    } finally {
      setActionLoading(false);
    }
  };

  // 处理交付通过
  const handleDeliveryApprove = async (e: React.MouseEvent, survey: SurveyData, deliveryState: number) => {
    e.stopPropagation(); // 阻止卡片点击事件
    
    try {
      const actionText = deliveryState === 1 ? '交付' : '拒绝交付';
      const response = await deliveryReception(survey.id, deliveryState);
      
      if (response && response.code === 200) {
        Toast.success(`${actionText}成功！`);
        // 重新加载当前页面数据
        loadSurveyData(1, true, activeTab, deliveryFilter);
      } else {
        Toast.error(response?.message || `${actionText}失败！`);
      }
    } catch (error) {
      console.error('交付通过失败:', error);
      Toast.error('操作失败，请重试！');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#faad14';
      case 'approved': return '#52c41a';
      case 'rejected': return '#ff4d4f';
      default: return '#999';
    }
  };

  

  // 处理卡片点击，跳转到详情页
  const handleCardClick = (survey: SurveyData) => {
    // 将当前数据存储到localStorage供详情页使用
    localStorage.setItem('review_surveys', JSON.stringify(surveys));
    navigate(`/review/detail/${survey.id}`);
  };

  // 处理输入框变化
  const handleUsernameChange = (_e: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setUsername(value);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: undefined }));
    }
  };

  const handlePasswordChange = (_e: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  // 处理回车键登录
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // 登录页面
  if (!isLoggedIn) {
    return (
      <div className={`review-management ${isFeishuEnv ? 'feishu-env' : ''}`}>
        <div className="review-content">
          <div className="header">
            <div className="welcome-badge">
              🔐 问卷审核管理中心
            </div>
            <div className="description">
              <p>请登录以访问问卷审核管理功能</p>
            </div>
          </div>

          <div className="login-form-container">
            <div className="login-form">
              <div className="form-item">
                <label className="form-label">
                  用户名 <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <Input 
                    placeholder="请输入用户名" 
                    value={username}
                    onChange={handleUsernameChange}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                {errors.username && (
                  <div className="error-message">{errors.username}</div>
                )}
              </div>
              
              <div className="form-item">
                <label className="form-label">
                  密码 <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                  <Input 
                    type="password" 
                    placeholder="请输入密码"
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>
              
              <div className="form-item">
                <div className="remember-login">
                  <label className="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      checked={rememberLogin}
                      onChange={(e) => setRememberLogin(e.target.checked)}
                      className="checkbox"
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-text">记住登录状态（7天内免登录）</span>
                  </label>
                </div>
              </div>
              
              <div className="form-item">
                <Button type="primary" onClick={handleLogin} className="login-btn">
                  <span className="btn-text">登录</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 登录后的主页面内容
  return (
    <div className={`review-management ${isFeishuEnv ? 'feishu-env' : ''}`}>
      <div className="review-content">
        {/* 审核管理区域 */}
        <div className="review-management-area">
          {/* 页面标题 */}
          <div className="review-header">
            <h2 className="review-title">问卷审核管理</h2>
          </div>



          {/* 统一筛选器区域 */}
          <div className="unified-filter">
            {/* 审核状态筛选 */}
            <div className="filter-group">
              <div className="filter-label">审核状态：</div>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${activeTab === undefined ? 'active' : ''}`}
                  onClick={() => handleTabChange(undefined)}
                >
                  全部
                </button>
                <button 
                  className={`filter-btn ${activeTab === 0 ? 'active' : ''}`}
                  onClick={() => handleTabChange(0)}
                >
                  待审核
                </button>
                <button 
                  className={`filter-btn ${activeTab === 100 ? 'active' : ''}`}
                  onClick={() => handleTabChange(100)}
                >
                  已审核
                </button>
              </div>
            </div>

            {/* 交付状态筛选 */}
            <div className="filter-group">
              <div className="filter-label">交付状态：</div>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${deliveryFilter === undefined ? 'active' : ''}`}
                  onClick={() => handleDeliveryFilterChange(undefined)}
                >
                  全部
                </button>
                <button 
                  className={`filter-btn ${deliveryFilter === 0 ? 'active' : ''}`}
                  onClick={() => handleDeliveryFilterChange(0)}
                  disabled={activeTab === 0}
                  style={{
                    opacity: activeTab === 0 ? 0.5 : 1,
                    cursor: activeTab === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  待审批
                </button>
                <button 
                  className={`filter-btn ${deliveryFilter === 100 ? 'active' : ''}`}
                  onClick={() => handleDeliveryFilterChange(100)}
                  disabled={activeTab === 0}
                  style={{
                    opacity: activeTab === 0 ? 0.5 : 1,
                    cursor: activeTab === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  已审批
                </button>
              </div>
            </div>
          </div>

          {/* 问卷列表 */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-icon"></div>
              <div className="loading-title">正在加载问卷数据</div>
              <div className="loading-subtitle">请稍候片刻</div>
            </div>
          ) : surveys.length === 0 ? (
            <div className="empty-container" key={surveys.length}>
              <div className="empty-icon">📋</div>
              <div className="empty-title">暂无数据</div>
              <div className="empty-subtitle">
                {activeTab === undefined ? '当前没有问卷数据' :
                 activeTab === 0 ? '当前没有待审核的问卷' : 
                 activeTab === 100 ? '当前没有已通过的问卷' : '当前没有已拒绝的问卷'}
              </div>
            </div>
          ) : (
            <div className="survey-list-container">
              {surveys.map((survey) => (
                <div key={survey.id} className="survey-item" onClick={() => handleCardClick(survey)}>
                  {/* 状态标签 - 右上角 */}
                  <div className="status-tag-corner" style={{ backgroundColor: getStatusColor(survey.status) }}>
                    {getStatusText(survey.status)}
                  </div>
                  
                  <div className="survey-info">
                    <div className="student-name">
                      <span className="icon">👤</span>
                      {survey.studentName}
                    </div>
                    <div className="detail-item">
                      <span className="icon">📱</span>
                      <span>联系电话：{survey.contactPhone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">👨‍🏫</span>
                      <span>顾问：{survey.advisorName}</span>
                    </div>
                    {/* 交付状态 - 仅在非拒绝状态下显示 */}
                    {survey.status !== 'rejected' && (
                      <div className="detail-item">
                        <span className="icon">📦</span>
                        <span className={`delivery-status ${
                          survey.deliveryState === 1 ? 'delivered' : 
                          survey.deliveryState === -1 ? 'rejected' : 'pending'
                        }`}>
                          交付状态：{
                            survey.deliveryState === 1 ? '已交付' : 
                            survey.deliveryState === -1 ? '已驳回' : '待审批'
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 审核按钮 - 仅在待审核状态下显示 */}
                  {survey.status === 'pending' && (
                    <div className="review-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="review-btn approve-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(survey);
                        }}
                        disabled={actionLoading}
                      >
                        <span className="btn-icon">✓</span>
                        审核通过
                      </button>
                      <button
                        className="review-btn reject-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRejectModal(survey);
                        }}
                        disabled={actionLoading}
                      >
                        <span className="btn-icon">✗</span>
                        审核拒绝
                      </button>
                    </div>
                  )}

                  {/* 交付通过按钮 - 仅在已审核通过且待交付状态下显示 */}
                  {survey.status === 'approved' && survey.deliveryState !== 1 && survey.deliveryState !== -1 && (
                    <div className="delivery-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="delivery-btn approve-btn"
                        onClick={(e) => handleDeliveryApprove(e, survey, 1)}
                      >
                        <span className="btn-icon"></span>
                        交付通过
                      </button>
                      <button
                        className="delivery-btn reject-btn"
                        onClick={(e) => handleDeliveryApprove(e, survey, -1)}
                      >
                        <span className="btn-icon"></span>
                        交付驳回
                      </button>
                    </div>
                  )}
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

          {/* 数据统计 */}
          {total > 0 && (
            <div className="data-stats">
              已显示 {surveys.length} / {total} 个问卷
              {!hasMore && <span> · 已全部加载</span>}
            </div>
          )}
        </div>

        {/* 详情弹窗 */}
        {/* The original Dialog component was removed, so this section is no longer functional. */}
        {/* If a detailed view is needed, it would require a new component or re-implementation. */}

        {/* 拒绝原因弹窗 */}
        <Dialog
          visible={rejectModalVisible}
          title="审核拒绝"
          close={() => setRejectModalVisible(false)}
          footer={[
            {
              content: '取消',
              onClick: () => setRejectModalVisible(false)
            },
            {
              content: actionLoading ? '提交中...' : '确认拒绝',
              onClick: () => {
                confirmReject();
              },
              disabled: actionLoading
            }
          ]}
        >
          <div className="reject-modal-content">
            <div className="reject-reason-label">请填写拒绝原因：</div>
            <textarea
              className="reject-reason-input"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请详细说明拒绝的原因..."
              rows={4}
            />
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default ReviewManagement;
