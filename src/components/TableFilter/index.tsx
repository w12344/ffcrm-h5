import React, { ReactNode } from 'react';
import { Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import './index.less';

export interface TableFilterProps {
  /** 筛选项内容 */
  children: ReactNode;
  /** 搜索按钮点击事件 */
  onSearch: () => void;
  /** 重置按钮点击事件 */
  onReset: () => void;
  /** 是否显示搜索按钮 */
  showSearch?: boolean;
  /** 是否显示重置按钮 */
  showReset?: boolean;
  /** 搜索按钮文本 */
  searchText?: string;
  /** 重置按钮文本 */
  resetText?: string;
  /** 自定义类名 */
  className?: string;
  /** 紧凑模式（用于弹窗内，不显示背景、边框和padding） */
  compact?: boolean;
}

const TableFilter: React.FC<TableFilterProps> = ({
  children,
  onSearch,
  onReset,
  showSearch = true,
  showReset = true,
  searchText = '搜索',
  resetText = '重置',
  className = '',
  compact = false,
}) => {
  return (
    <div className={`table-filter ${compact ? 'table-filter-compact' : ''} ${className}`}>
      <div className="filter-row">
        {children}
        <div className="button-group">
          {showSearch && (
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={onSearch}
            >
              {searchText}
            </Button>
          )}
          {showReset && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onReset}
            >
              {resetText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableFilter;
