import React, { useState, useEffect, useRef } from 'react';
import { smartNavigate } from '@/utils/url';
import { fetchOtherEmployees, fetchEmployeeToken, OtherEmployee } from '@/services/databoard';
import { useTheme } from '@/contexts/ThemeContext';
import './index.less';

interface OtherEmployeesDropdownProps {
  /** 是否显示下拉菜单 */
  visible: boolean;
  /** 关闭下拉菜单的回调 */
  onClose: () => void;
  /** 下拉菜单的位置 */
  position?: {
    top: number;
    left: number;
  };
  /** 数据加载完成的回调，返回是否有数据 */
  onDataLoaded?: (hasData: boolean) => void;
}

const OtherEmployeesDropdown: React.FC<OtherEmployeesDropdownProps> = ({
  visible,
  onClose,
  position = { top: 0, left: 0 },
  onDataLoaded
}) => {
  const { isDark } = useTheme();
  const [otherEmployees, setOtherEmployees] = useState<OtherEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingToken, setLoadingToken] = useState<number | null>(null); // 正在获取token的员工ID
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取其他顾问列表
  const fetchOtherEmployeesList = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetchOtherEmployees();
      if (response.data.code === 200) {
        const employees = response.data.data || [];
        setOtherEmployees(employees);
        // 通知父组件是否有数据
        onDataLoaded?.(employees.length > 0);
      }
    } catch (error) {
      console.error('获取其他顾问列表失败:', error);
      // 出错时也通知父组件无数据
      onDataLoaded?.(false);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // 组件挂载时立即检查数据（用于决定是否显示个人中心图标）
  useEffect(() => {
    fetchOtherEmployeesList();
  }, []);

  // 当组件显示时获取数据（如果还没有数据）
  useEffect(() => {
    if (visible && otherEmployees.length === 0) {
      fetchOtherEmployeesList();
    }
  }, [visible]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // 处理顾问点击事件
  const handleEmployeeClick = async (employee: OtherEmployee) => {
    setLoadingToken(employee.employeeId);
    try {
      const response = await fetchEmployeeToken(employee.employeeId);
      if (response.data.code === 200 && response.data.data) {
        // 构建正确的URL：保持hash路由在正确位置，并添加顾问姓名和ID
        const { origin, pathname, hash } = window.location;
        const encodedName = encodeURIComponent(employee.employeeName);
        const newUrl = `${origin}${pathname}${hash}?token=${response.data.data}&employeeName=${encodedName}&employeeId=${employee.employeeId}`;
        
        // 新开窗口展示该顾问的看板页面
        smartNavigate(newUrl,'_blank');
        
        // 关闭下拉菜单
        onClose();
      } else {
        console.error('获取员工token失败:', response.data.message || '未知错误');
        // 可以添加错误提示
      }
    } catch (error) {
      console.error('获取员工token失败:', error);
      // 可以添加错误提示
    } finally {
      setLoadingToken(null);
    }
  };

  // 生成头像（姓名首字母）
  const generateAvatar = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (!visible) return null;

  return (
    <div
      ref={dropdownRef}
      className={`other-employees-dropdown ${isDark ? 'dark-theme' : 'light-theme'}`}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 1000
      }}
    >
      <div className="dropdown-content">
        <div className="dropdown-header">
          <span className="header-title">选择顾问</span>
        </div>
        
        <div className="dropdown-body">
          {loadingEmployees ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <span>加载中...</span>
            </div>
          ) : otherEmployees.length > 0 ? (
            <div className="employees-list">
              {otherEmployees.map((employee) => (
                <div 
                  key={employee.employeeId} 
                  className={`employee-item ${loadingToken === employee.employeeId ? 'loading' : ''}`}
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <div className="employee-avatar">
                    {loadingToken === employee.employeeId ? (
                      <div className="loading-spinner" />
                    ) : (
                      generateAvatar(employee.employeeName)
                    )}
                  </div>
                  <div className="employee-info">
                    <span className="employee-name">{employee.employeeName}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>暂无其他顾问</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherEmployeesDropdown;
