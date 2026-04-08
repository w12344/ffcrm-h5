import React, { useState, useRef, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocation } from "react-router-dom";
import TaskNotificationDialog from "@/components/TaskNotificationDialog";
import OtherEmployeesDropdown from "../OtherEmployeesDropdown";
import GlassSelect from "@/components/GlassSelect";
import GlassDatePicker from "@/components/GlassDatePicker";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { TaskType, getUnreadCount } from "@/services/task";
import { smartNavigate } from "@/utils/url";
import xiaoxiIcon from "../../../../assets/images/xiaoxi.png";
import gerenIcon from "../../../../assets/images/geren.png";
import lightXiaoxiIcon from "../../../../assets/images/light_xiaoxi.png";
import lightGerenIcon from "../../../../assets/images/light_geren.png";
import lightLogoIcon from "../../../../assets/images/light_logo.png";
import LogoIcon from "../../../../assets/images/logo.png";
import ExcelPreviewModal from "@/pages/Boss/components/ExcelPreviewModal";
import SalesCoreMetricsModal from "../SalesCoreMetricsModal";
import "./index.less";

interface DashboardHeaderProps {
  onMetricsClick?: () => void;
  timeDimension?: 'year' | 'month';
  onTimeDimensionChange?: (dimension: 'year' | 'month') => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMetricsClick, timeDimension: externalTimeDimension, onTimeDimensionChange }) => {
  const { userInfo, isLoggedIn, isLoading, login, logout } = useAuth();
  const { isDark } = useTheme();
  const location = useLocation();

  // 检查是否在老板端（Boss 或 CEO 驾驶舱）或者是市场端
  const isBossTerminal = location.pathname.includes('/boss') || location.pathname.includes('/ceo-dashboard') || location.pathname.includes('/market');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showOtherEmployeesDropdown, setShowOtherEmployeesDropdown] =
    useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [viewedEmployee, setViewedEmployee] = useState<{
    name: string;
    id: number;
  } | null>(null);
  const [hasOtherEmployees, setHasOtherEmployees] = useState<boolean | null>(
    null
  ); // null表示未加载，false表示无数据，true表示有数据
  const menuRef = useRef<HTMLDivElement>(null);
  const personalIconRef = useRef<HTMLImageElement>(null);

  const [localTimeDimension, setLocalTimeDimension] = useState<'year' | 'month'>('year');
  const timeDimension = externalTimeDimension || localTimeDimension;
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());

  // 根据主题选择对应的图标
  const currentXiaoxiIcon = isDark ? xiaoxiIcon : lightXiaoxiIcon;
  const currentGerenIcon = isDark ? gerenIcon : lightGerenIcon;
  const currentLogoIcon = isDark ? LogoIcon : lightLogoIcon;
  const handleThemeChange = () => {
    // ThemeToggle组件现在自己处理主题切换
  };

  // 从URL中读取顾问信息
  useEffect(() => {
    // 对于hash路由，参数在hash后面，需要从hash中提取
    const hash = window.location.hash;
    const queryStart = hash.indexOf("?");

    if (queryStart !== -1) {
      const queryString = hash.substring(queryStart + 1);
      const urlParams = new URLSearchParams(queryString);
      const employeeName = urlParams.get("employeeName");
      const employeeId = urlParams.get("employeeId");

      if (employeeName && employeeId) {
        setViewedEmployee({
          name: decodeURIComponent(employeeName),
          id: parseInt(employeeId, 10),
        });
        return;
      }
    }

    setViewedEmployee(null);
  }, []);

  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const response: any = await getUnreadCount();
      if (response?.data?.code === 200) {
        setUnreadCount(response.data.data);
      }
    } catch (error) {
      // 静默失败，不影响用户体验
    }
  };

  // 组件挂载时获取未读消息数量
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadCount();
      // 每30秒刷新一次未读消息数量
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const [isExcelModalVisible, setIsExcelModalVisible] = useState(false);
  const [excelSearchText, setExcelSearchText] = useState<string>("");
  const [isCoreMetricsModalVisible, setIsCoreMetricsModalVisible] = useState(false);

  useEffect(() => {
    const handleOpenExcelPreview = (e: any) => {
      setIsExcelModalVisible(true);
      if (e.detail?.targetText) {
        setExcelSearchText(e.detail.targetText);
      } else {
        setExcelSearchText("");
      }
    };
    window.addEventListener("open-excel-preview", handleOpenExcelPreview);
    return () => {
      window.removeEventListener("open-excel-preview", handleOpenExcelPreview);
    };
  }, []);

  const handleLoginClick = () => {
    if (!isLoading) {
      login();
    }
  };

  const navigateToPage = (path: string) => {
    setShowUserMenu(false);
    const basePath = import.meta.env.BASE_URL || "/";
    const normalizedBasePath = basePath.endsWith("/")
      ? basePath
      : `${basePath}/`;

    const hash = window.location.hash;
    const queryStart = hash.indexOf("?");
    let queryToken = null;

    if (queryStart !== -1) {
      const queryString = hash.substring(queryStart + 1);
      const urlParams = new URLSearchParams(queryString);
      queryToken = urlParams.get("token");
    }

    if (queryToken) {
      const url = `${normalizedBasePath}index.html#${path}?token=${queryToken}`;
      smartNavigate(url);
    } else {
      const url = `${normalizedBasePath}index.html#${path}`;
      smartNavigate(url);
    }
  };

  const handleContractOrder = () => navigateToPage("/contract-order");
  const handleRecordingManagement = () => navigateToPage("/recording");
  const handleApprovalManagement = () => navigateToPage("/approval");
  const handleMarketDashboard = () => navigateToPage("/market");
  const handleBossDashboard = () => navigateToPage("/boss");
  const handleLeadsManagement = () => navigateToPage("/leads-management");
  const handleAdvisorDashboard = () => navigateToPage("/dashboard");

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handlePersonalIconClick = () => {
    if (personalIconRef.current) {
      const rect = personalIconRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 3.4, // 0.213rem ≈ 3.4px，与用户头像弹窗间距保持一致
        left: rect.left - 100, // 调整位置，让下拉菜单在图标下方居中
      });
    }
    setShowOtherEmployeesDropdown(!showOtherEmployeesDropdown);
  };

  const handleNotificationClick = () => {
    setShowNotificationDialog(true);
    // 打开弹窗后刷新未读消息数量
    setTimeout(() => {
      fetchUnreadCount();
    }, 500);
  };

  // 格式化未读消息数量显示
  const formatUnreadCount = (count: number) => {
    return count > 99 ? "99+" : count.toString();
  };

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <div className="logo">
          <img src={currentLogoIcon} alt="logo" className="logo-icon" />
        </div>
        {/* 主题切换组件 */}
        <ThemeToggle onChange={handleThemeChange} />
      </div>
      <div className="header-right">
        {/* 通用年份选择器 */}
        {isBossTerminal && (
          <>
            <div className="header-campus-picker" style={{ marginRight: '8px' }}>
              <GlassSelect
                defaultValue="hangzhou"
                style={{ width: 120 }}
                options={[
                  { label: '杭州校区', value: 'hangzhou' },
                  { label: '广州校区', value: 'guangzhou' },
                ]}
                onChange={(value) => console.log('Selected Campus:', value)}
              />
            </div>
            {/* 时间维度选择器 */}
            <div className="header-dimension-picker" style={{ marginRight: '8px' }}>
              <GlassSelect
                value={timeDimension}
                style={{ width: 80 }}
                options={[
                  { label: '年度', value: 'year' },
                  { label: '月度', value: 'month' },
                ]}
                onChange={(value) => {
                  const newDim = value as 'year' | 'month';
                  setLocalTimeDimension(newDim);
                  onTimeDimensionChange?.(newDim);
                  // Reset to current date when switching dimensions to avoid invalid dates
                  setSelectedDate(dayjs());
                  console.log('Selected Dimension:', value);
                }}
              />
            </div>
          </>
        )}
        <div className="header-date-picker" style={{ marginRight: '8px' }}>
          <GlassDatePicker
            picker={timeDimension}
            placeholder={timeDimension === 'year' ? "请选择年份" : "请选择月份"}
            value={selectedDate}
            allowClear={false}
            onChange={(date, dateString) => {
              if (date) {
                setSelectedDate(date);
                console.log(`Selected ${timeDimension === 'year' ? 'Year' : 'Month'}:`, dateString);
              }
            }}
          />
        </div>
        {/* 报表预览图标 - 仅在老板端显示 */}
        {isBossTerminal && (
          <div
            className="doc-icon-wrapper excel-icon-wrapper"
            onClick={() => setIsExcelModalVisible(true)}
            title="数据报表预览"
            style={{ cursor: "pointer" }}
          >
            <svg
              className="excel-icon"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="#52c41a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2V8H20"
                stroke="#52c41a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 13L12 17M8 17L12 13"
                stroke="#52c41a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 13H15"
                stroke="#52c41a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17H15"
                stroke="#52c41a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* 核心指标看板图标 - Dashboard特有 */}
        {!isBossTerminal && (
          <div
            className="doc-icon-wrapper metrics-icon-wrapper"
            onClick={() => {
              if (onMetricsClick) {
                onMetricsClick();
              } else {
                setIsCoreMetricsModalVisible(true);
              }
            }}
            title="核心销售指标"
            style={{ cursor: "pointer", marginRight: "8px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg
              className="metrics-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 20V10M12 20V4M6 20V14"
                stroke={isDark ? "#1890ff" : "#1890ff"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        {/* 产品文档图标 */}
        <div
          className="doc-icon-wrapper"
          onClick={() =>
            smartNavigate(
              "https://ncnkzwzddvpy.feishu.cn/wiki/Qhe8wWnsdiJOGkktCKjcKYywnxf"
            )
          }
          title="产品文档"
          style={{ cursor: "pointer" }}
        >
          <svg
            className="doc-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 13H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 9H9H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* 通知图标 */}
        <div className="notification-wrapper">
          <img
            src={currentXiaoxiIcon}
            alt="通知"
            className="icon-btn"
            title="通知"
            onClick={handleNotificationClick}
            style={{ cursor: "pointer" }}
          />
          {unreadCount > 0 && (
            <span className="unread-badge">
              {formatUnreadCount(unreadCount)}
            </span>
          )}
        </div>
        {/* 个人中心图标 - 仅在有其他顾问数据时显示 */}
        {hasOtherEmployees && (
          <img
            ref={personalIconRef}
            src={currentGerenIcon}
            alt="个人中心"
            className="icon-btn"
            title="个人中心"
            onClick={handlePersonalIconClick}
            style={{ cursor: "pointer" }}
          />
        )}

        {/* 飞书登录集成 */}
        {isLoading ? (
          <div className="login-loading">...</div>
        ) : isLoggedIn && userInfo ? (
          <div className="user-info-wrapper" ref={menuRef}>
            <div className="user-info" onClick={toggleUserMenu}>
              {viewedEmployee ? (
                <div className="user-avatar viewed-employee-avatar-inline">
                  {viewedEmployee.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img
                  src={userInfo.avatar || currentGerenIcon}
                  alt={userInfo.name}
                  className="user-avatar"
                />
              )}
              <span className="user-name">
                {(viewedEmployee && viewedEmployee.name) || userInfo.name}
              </span>
              <span className={`dropdown-arrow ${showUserMenu ? "open" : ""}`}>
                ▼
              </span>
            </div>
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <div className="menu-header">
                  {viewedEmployee ? (
                    <div className="menu-avatar viewed-employee-avatar-menu">
                      {viewedEmployee.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <img
                      src={userInfo.avatar || currentGerenIcon}
                      alt={userInfo.name}
                      className="menu-avatar"
                    />
                  )}
                  <div className="menu-user-info">
                    <div className="menu-user-name">
                      {(viewedEmployee && viewedEmployee.name) || userInfo.name}
                    </div>
                  </div>
                </div>
                <div className="menu-item" onClick={handleAdvisorDashboard}>
                  <svg
                    className="menu-item-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H9H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>顾问看板</span>
                </div>
                <div className="menu-item" onClick={handleContractOrder}>
                  <svg
                    className="menu-item-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H9H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>成交报单</span>
                </div>
                <div className="menu-item" onClick={handleMarketDashboard}>
                  <svg
                    className="menu-item-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H9H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>市场营销</span>
                </div>
                <div className="menu-item" onClick={handleBossDashboard}>
                  <svg
                    className="menu-item-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H9H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>老板看板</span>
                </div>
                <div className="menu-item" onClick={handleLeadsManagement}>
                  <svg
                    className="menu-item-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H9H8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>线索管理</span>
                </div>
                <div className="menu-item" onClick={handleRecordingManagement}>
                  <svg
                    className="menu-item-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 1C11.4696 1 10.9609 1.21071 10.5858 1.58579C10.2107 1.96086 10 2.46957 10 3V12C10 12.5304 10.2107 13.0391 10.5858 13.4142C10.9609 13.7893 11.4696 14 12 14C12.5304 14 13.0391 13.7893 13.4142 13.4142C13.7893 13.0391 14 12.5304 14 12V3C14 2.46957 13.7893 1.96086 13.4142 1.58579C13.0391 1.21071 12.5304 1 12 1Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 10V12C19 13.8565 18.2625 15.637 16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12V10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 19V23"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 23H16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>录音管理</span>
                </div>
                <div className="menu-item" onClick={handleApprovalManagement}>
                  <svg
                    className="menu-item-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 11L12 14L22 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>审批管理</span>
                </div>
                <div className="menu-item" onClick={handleLogout}>
                  <svg
                    className="menu-item-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17L21 12L16 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>退出登录</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`login-btn ${isLoading ? "disabled" : ""}`}
            onClick={handleLoginClick}
          >
            {isLoading ? "登录中..." : "登录"}
          </div>
        )}
      </div>

      {/* 任务通知弹窗 */}
      <TaskNotificationDialog
        visible={showNotificationDialog}
        onClose={() => {
          setShowNotificationDialog(false);
          // 关闭弹窗时刷新未读消息数量
          fetchUnreadCount();
        }}
        title="任务中心"
        themeMode={isDark ? "dark" : "light"}
        defaultTaskType={TaskType.RISK_ALERT}
      />

      {/* 其他顾问下拉组件 */}
      <OtherEmployeesDropdown
        visible={showOtherEmployeesDropdown}
        onClose={() => setShowOtherEmployeesDropdown(false)}
        position={dropdownPosition}
        onDataLoaded={setHasOtherEmployees}
      />

      {isBossTerminal && (
        <ExcelPreviewModal
          visible={isExcelModalVisible}
          onClose={() => {
            setIsExcelModalVisible(false);
            setExcelSearchText("");
          }}
          themeClass={isDark ? 'dark-theme' : 'light-theme'}
          searchText={excelSearchText}
        />
      )}

      <SalesCoreMetricsModal
        visible={isCoreMetricsModalVisible}
        onClose={() => setIsCoreMetricsModalVisible(false)}
        themeClass={isDark ? "dark-theme" : "light-theme"}
      />
    </div>
  );
};

export default DashboardHeader;
