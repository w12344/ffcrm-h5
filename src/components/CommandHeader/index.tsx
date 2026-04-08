import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { DatePicker } from 'antd';
import UserAvatar from '@/components/UserAvatar';
import { CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appendTokenToUrl } from '@/utils/url';
import LogoIcon from '@/assets/images/logo.png';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';

const { RangePicker } = DatePicker;

/** 生成日期范围预设（用于 RangePicker presets，显示在弹窗内） */
const getRangePresets = (): { label: string; value: [Dayjs, Dayjs] }[] => {
  const yesterday = dayjs().subtract(1, 'day');
  return [
    { label: '昨日', value: [yesterday.startOf('day'), yesterday.endOf('day')] },
    { label: '近七天', value: [yesterday.subtract(6, 'day').startOf('day'), yesterday.endOf('day')] },
    { label: '本月', value: [dayjs().startOf('month'), yesterday.endOf('day')] },
    { label: '本年', value: [dayjs().startOf('year'), yesterday.endOf('day')] },
  ];
};
import './index.less';

export interface CommandHeaderProps {
  /** 主标题 */
  mainTitle?: string;
  /** 副标题 */
  subTitle?: string;
  /** 中间区域自定义内容 */
  centerContent?: ReactNode;
  /** 右侧区域自定义内容 */
  rightContent?: ReactNode;
  /** 主题类名 */
  themeClass?: string;
  /** 是否显示月份选择器 */
  showMonthPicker?: boolean;
  /** 月份选择器默认值 */
  defaultMonth?: Dayjs;
  /** 月份变化回调 */
  onMonthChange?: (date: Dayjs | null) => void;
  /** 是否显示日期范围选择器（单位：天，含快捷选项） */
  showDateRangePicker?: boolean;
  /** 日期范围默认值 [start, end]，默认昨日 */
  defaultDateRange?: [Dayjs, Dayjs];
  /** 日期范围变化回调 */
  onDateRangeChange?: (range: [Dayjs, Dayjs]) => void;
}

// User Profile Component
const UserProfile: React.FC = () => {
  const { userInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 获取用户角色
  const userRoles = userInfo?.roles || [];
  
  // 检查用户是否有特定角色
  const hasRole = (role: string) => userRoles.includes(role as any);
  
  // 检查是否有任意一个角色
  const hasAnyRole = (...roles: string[]) => roles.some(role => hasRole(role));
  
  // 根据权限表定义菜单项可见性（参考 routes.ts）
  const canViewOrderList = hasAnyRole('BOSS', 'SUPERADMIN', 'SHOP_KEEPER', 'SALESPERSON');
  const canViewTargetSetting = hasAnyRole('BOSS', 'SUPERADMIN', 'SHOP_KEEPER');
  const canViewSalesDashboard = hasAnyRole('BOSS', 'SUPERADMIN', 'SHOP_KEEPER', 'SALESPERSON');
  const canViewShopDashboard = hasAnyRole('BOSS', 'SUPERADMIN', 'SHOP_KEEPER');
  const canViewBossDashboard = hasAnyRole('BOSS', 'SUPERADMIN'); // 老板看板：仅老板和超级管理员
  const canViewDesignerTask = hasAnyRole('BOSS', 'SUPERADMIN', 'DESIGNER_LEADER', 'DESIGNER');
  const canViewDesignerPool = hasAnyRole('BOSS', 'SUPERADMIN', 'DESIGNER_LEADER');
  const canViewFactoryOrder = hasAnyRole('BOSS', 'SUPERADMIN', 'FACTORY');
  const canViewFinanceDashboard = hasAnyRole('FINANCE', 'FINANCE_MANAGER', 'BOSS', 'GENERAL_MANAGER', 'SUPERADMIN'); // 财务看板：财务、财务主管、老板、总经理、超级管理员
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMenu(false);
  };

  const handleOrderList = () => {
    // 使用 hash 路由格式打开新窗口，并携带 token
    const baseUrl = window.location.origin;
    const url = appendTokenToUrl(`${baseUrl}/#/order/list`);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleTargetSetting = () => {
    // 使用 hash 路由格式打开新窗口，并携带 token
    const baseUrl = window.location.origin;
    const url = appendTokenToUrl(`${baseUrl}/#/shop/target-strategy`);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleSalesDashboard = () => {
    // 使用 hash 路由格式打开新窗口，并携带 token 和 userId
    const baseUrl = window.location.origin;
    // 如果有 userId，添加到 URL 参数中
    const salesUrl = userInfo?.userId 
      ? `${baseUrl}/#/sales/dashboard?userId=${userInfo.userId}`
      : `${baseUrl}/#/sales/dashboard`;
    const url = appendTokenToUrl(salesUrl);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleShopDashboard = () => {
    // 使用 hash 路由格式打开新窗口，并携带 token
    const baseUrl = window.location.origin;
    const url = appendTokenToUrl(`${baseUrl}/#/shop/dashboard`);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleBossDashboard = () => {
    // 使用 hash 路由格式打开新窗口，并携带 token
    const baseUrl = window.location.origin;
    const url = appendTokenToUrl(`${baseUrl}/#/boss`);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleDesignerTask = () => {
    // 使用 hash 路由格式打开新窗口，并携带 token
    const baseUrl = window.location.origin;
    const url = appendTokenToUrl(`${baseUrl}/#/designer/my-task`);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleDesignerPool = () => {
    // 使用 hash 路由格式打开新窗口，并携带 token
    const baseUrl = window.location.origin;
    const url = appendTokenToUrl(`${baseUrl}/#/designer/task`);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleFactoryOrder = () => {
    // 使用 hash 路由格式打开新窗口，并携带 token
    const baseUrl = window.location.origin;
    const url = appendTokenToUrl(`${baseUrl}/#/factory/order/list`);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleFinanceDashboard = () => {
    // 使用 hash 路由格式打开新窗口，并携带 token
    const baseUrl = window.location.origin;
    const url = appendTokenToUrl(`${baseUrl}/#/shop/business`);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  // 企微建群功能暂时隐藏
  // const handleWeComGroupDemo = () => {
  //   const baseUrl = window.location.origin;
  //   const url = appendTokenToUrl(`${baseUrl}/#/wecom-group-demo`);
  //   window.open(url, '_blank');
  //   setShowMenu(false);
  // };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);
  
  return (
    <div className="user-info-wrapper" ref={menuRef}>
      <div className="user-profile" onClick={() => setShowMenu(!showMenu)}>
        <UserAvatar 
          name={userInfo?.name || "管理员"}
          size={28}
        />
        <div className="info">
          <div className="name">{userInfo?.name || "管理员"}</div>
        </div>
        <span className={`dropdown-arrow ${showMenu ? 'open' : ''}`}>▼</span>
      </div>
      {showMenu && (
        <div className="user-dropdown-menu">
          <div className="menu-header">
            <UserAvatar 
              name={userInfo?.name || "管理员"}
              size={48}
              className="menu-avatar"
            />
            <div className="menu-user-info">
              <div className="menu-user-name">{userInfo?.name || "管理员"}</div>
            </div>
          </div>
          {canViewOrderList && (
            <div className="menu-item" onClick={handleOrderList}>
              <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>订单列表</span>
            </div>
          )}
          {canViewTargetSetting && (
            <div className="menu-item" onClick={handleTargetSetting}>
              <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>目标设置</span>
            </div>
          )}
          {canViewSalesDashboard && (
            <div className="menu-item" onClick={handleSalesDashboard}>
              <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 9L13 14L9 10L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>客户管理</span>
            </div>
          )}
          {canViewShopDashboard && (
            <div className="menu-item" onClick={handleShopDashboard}>
              <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 10H15V16H9V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>店铺管理</span>
            </div>
          )}
          {canViewBossDashboard && (
            <div className="menu-item" onClick={handleBossDashboard}>
              <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="2" fill="currentColor"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                <circle cx="12" cy="17" r="2" fill="currentColor"/>
              </svg>
              <span>老板看板</span>
            </div>
          )}
          {canViewDesignerTask && (
            <div className="menu-item" onClick={handleDesignerTask}>
              <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>设计师任务</span>
            </div>
          )}
          {canViewDesignerPool && (
            <div className="menu-item" onClick={handleDesignerPool}>
              <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>设计公海</span>
            </div>
          )}
          {canViewFactoryOrder && (
            <div className="menu-item" onClick={handleFactoryOrder}>
              <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>工厂端</span>
            </div>
          )}
          {canViewFinanceDashboard && (
            <div className="menu-item" onClick={handleFinanceDashboard}>
              <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>财务看板</span>
            </div>
          )}
          {/* 企微建群功能暂时隐藏 */}
          {/* <div className="menu-item" onClick={handleWeComGroupDemo}>
            <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>企微建群</span>
          </div> */}
          <div className="menu-item" onClick={handleLogout}>
            <svg className="menu-item-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>退出登录</span>
          </div>
        </div>
      )}
    </div>
  );
};

const CommandHeader: React.FC<CommandHeaderProps> = ({
  mainTitle = '鲸夕 AI',
  subTitle = '门店人才效能 · 目标统筹指挥部',
  centerContent,
  rightContent,
  themeClass = '',
  showMonthPicker = false,
  defaultMonth = dayjs(),
  onMonthChange,
  showDateRangePicker = false,
  defaultDateRange,
  onDateRangeChange,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(defaultMonth);
  const yesterday = dayjs().subtract(1, 'day');
  const defaultRange: [Dayjs, Dayjs] = defaultDateRange ?? [
    yesterday.startOf('day'),
    yesterday.endOf('day'),
  ];
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(defaultRange);

  // 阻止 header 区域的点击事件冒泡，避免触发父组件的点击事件
  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 处理月份变化
  const handleMonthChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedMonth(date);
      if (onMonthChange) {
        onMonthChange(date);
      }
    }
  };

  // 处理日期范围变化（含弹窗内快捷选择）
  const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates?.[0] && dates?.[1]) {
      setDateRange([dates[0], dates[1]]);
      onDateRangeChange?.([dates[0], dates[1]]);
    }
  };

  return (
    <div className={`command-header ${themeClass}`} onClick={handleHeaderClick}>
      {/* Left Section - Logo & Titles (Fixed) */}
      <div className="header-left">
        <div className="logo-icon">
          <img src={LogoIcon} alt="Logo" className="logo-image" />
        </div>
        <div className="header-titles">
          <div className="main-title">{mainTitle}</div>
          <div className="sub-title">
            <span className="dot"></span> {subTitle}
          </div>
        </div>
      </div>

      {/* Center Section - Customizable */}
      {centerContent && (
        <div className="header-center">
          {centerContent}
        </div>
      )}

      {/* Right Section - Customizable + User Profile */}
      <div className="header-right">
        {/* Date Range Picker - 快捷选项在弹窗内 */}
        {showDateRangePicker && (
          <div className="date-range-picker-group">
            <RangePicker
              value={dateRange}
              onChange={handleRangeChange}
              presets={getRangePresets()}
              locale={locale}
              format="YYYY/MM/DD"
              allowClear={false}
              bordered={false}
              className="header-range-picker"
              dropdownClassName="boss-date-range-dropdown"
              disabledDate={(current) => current && current.isAfter(dayjs().subtract(1, 'day'), 'day')}
              placeholder={['开始日期', '结束日期']}
            />
          </div>
        )}
        {/* Month Picker - Conditionally displayed with Target Strategy style */}
        {showMonthPicker && !showDateRangePicker && (
          <div className="month-picker-group">
            <div className="month-picker-item">
              <span className="icon"><CalendarOutlined /></span>
              <DatePicker
                value={selectedMonth}
                onChange={handleMonthChange}
                picker="month"
                locale={locale}
                format="YYYY年M月"
                allowClear={false}
                suffixIcon={null}
                bordered={false}
                className="header-month-picker"
                disabledDate={(current) => {
                  // 禁用未来月份
                  return current && current.isAfter(dayjs(), 'month');
                }}
              />
            </div>
          </div>
        )}

        {rightContent}

        {/* User Profile - Always displayed */}
        <UserProfile />
      </div>
    </div>
  );
};

export default CommandHeader;
