import React, { useState } from 'react';
import { Table, ConfigProvider, theme as antTheme, Button, Space } from 'antd';
import { GlassTableProps } from './types';
import GlassFilterBar from './components/GlassFilterBar';
import { useTheme } from '@/hooks/useTheme';
import './index.less';

const GlassTable = <T extends object>(props: GlassTableProps<T>) => {
  const {
    columns,
    dataSource,
    filterSchema = [],
    onFilterChange,
    extraActions = [],
    batchActions,
    pagination,
    rowSelection,
    ...restProps
  } = props;

  const { isDark } = useTheme();

  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState<React.Key[]>([]);
  const selectedRowKeys = rowSelection?.selectedRowKeys || internalSelectedRowKeys;

  const handleSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: T[], info: any) => {
    if (!rowSelection?.selectedRowKeys) {
      setInternalSelectedRowKeys(newSelectedRowKeys);
    }
    if (rowSelection?.onChange) {
      rowSelection.onChange(newSelectedRowKeys, selectedRows, info);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    if (onFilterChange) {
      // For now, we just pass the manual change.
      // In a real implementation, we would maintain a filter state and pass the whole object.
      onFilterChange({ [key]: value });
    }
  };

  // Helper to convert hex/named colors to RGB for the box-shadow glow effect
  const getRgbFromColor = (color: string) => {
    // Simple mapping for common colors used in the app
    const colorMap: Record<string, string> = {
      '#52c41a': '82, 196, 26', // success green
      '#1890ff': '24, 144, 255', // processing blue
      '#f5222d': '245, 34, 45', // error red
      '#faad14': '250, 173, 20', // warning orange
      '#eb2f96': '235, 47, 150', // magenta
      '#722ed1': '114, 46, 209', // purple
      'green': '82, 196, 26',
      'blue': '24, 144, 255',
      'red': '245, 34, 45',
      'orange': '250, 173, 20',
    };

    return colorMap[color.toLowerCase()] || '138, 43, 226'; // Default to theme purple
  };

  // Ant Design Table columns override for custom styles
  const glassColumns = columns.map((col) => ({
    ...col,
    className: `glass-cell ${col.isNumeric ? 'numeric' : ''} ${col.isTag ? 'tag-cell' : ''} ${col.className || ''}`,
    render: (text: any, record: T, index: number) => {
      // If the column has a custom render, use it
      if (col.render) {
        return col.render(text, record, index);
      }

      // Default numeric style
      if (col.isNumeric) {
        return <span className="glass-numeric-text">{text}</span>;
      }

      // Default tag style
      if (col.isTag && typeof col.tagColor === 'function') {
        const color = col.tagColor(text, record);
        const rgb = getRgbFromColor(color);
        return (
          <span
            className="glass-status-tag"
            style={{
              '--tag-color': color,
              '--tag-color-rgb': rgb
            } as any}
          >
            {text}
          </span>
        );
      }

      return text;
    },
  }));

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#8A2BE2', // Updated to match the purple gradient theme
          borderRadius: 12,
          colorBgContainer: 'transparent',
          colorText: isDark ? 'rgba(255, 255, 255, 0.85)' : '#333',
        },
        components: {
          Table: {
            headerBg: 'transparent',
            headerColor: isDark ? 'rgba(255, 255, 255, 0.85)' : '#333',
            rowHoverBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
            rowSelectedBg: 'transparent',
            rowSelectedHoverBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
          },
          Pagination: {
            itemActiveBg: 'transparent',
          }
        }
      }}
    >
      <div className={`glass-table-suite ${isDark ? 'dark-theme' : 'light-theme'}`}>
        {/* Universal Filter Hub */}
        {(filterSchema.length > 0) && (
          <GlassFilterBar
            schema={filterSchema}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* The Glass Table Core */}
        <div className="glass-table-container">
          {(batchActions || extraActions.length > 0) && (
            <div className="glass-batch-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="batch-actions-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {batchActions}
              </div>
              {extraActions.length > 0 && (
                <div className="batch-actions-right">
                  <Space size={12}>
                    {extraActions.map((action) => {
                      const isDistribute = action.key === 'distribute' || action.key.includes('batch');
                      return (
                        <Button
                          key={action.key}
                          type={action.highlight ? 'primary' : 'default'}
                          className={`glass-action-btn ${action.highlight ? 'highlight' : ''} ${action.type === 'danger' ? 'danger' : ''}`}
                          icon={action.icon}
                          onClick={action.onClick}
                          danger={action.type === 'danger'}
                        >
                          {action.label} {isDistribute && selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}
                        </Button>
                      );
                    })}
                  </Space>
                </div>
              )}
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Table
              {...restProps}
              columns={glassColumns as any}
              dataSource={dataSource}
              pagination={false}
              rowSelection={rowSelection ? {
                ...rowSelection,
                selectedRowKeys,
                onChange: handleSelectChange,
              } : undefined}
              className="glass-ant-table"
            />
          </div>
        </div>

        {/* External Pagination positioned at the very bottom */}
        {pagination !== false && (
          <div className="glass-pagination-external-wrapper">
            <Table
              dataSource={[]}
              columns={[]}
              locale={{ emptyText: <></> }}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: { goButton: <button className="glass-pagination-go-btn">确定</button> },
                showTotal: (total, range) => {
                  const ps = pagination && typeof pagination === 'object' && pagination.pageSize ? pagination.pageSize : 10;
                  const cp = (range && range[0]) ? Math.ceil(range[0] / ps) : 1;
                  const tp = Math.ceil(total / ps) || 1;
                  return (
                    <div className="glass-pagination-total-wrapper">
                      <span className="total-records">共 {total} 条记录</span>
                      <span className="current-page-info">第 {cp}/{tp} 页</span>
                    </div>
                  );
                },
                itemRender: (page, type, originalElement) => {
                  if (type === 'prev') {
                    return <a className="glass-pagination-nav-btn prev">上一页</a>;
                  }
                  if (type === 'next') {
                    return <a className="glass-pagination-nav-btn next">下一页</a>;
                  }
                  if (type === 'page') {
                    return <a className="glass-pagination-item-link">{page}</a>;
                  }
                  if (type === 'jump-prev' || type === 'jump-next') {
                    return <span className="glass-pagination-jump-ellipsis">...</span>;
                  }
                  return originalElement;
                },
                className: 'glass-pagination-container',
                ...pagination,
                total: dataSource?.length || 0,
              }}
              className="glass-ant-table-pagination-only"
              showHeader={false}
            />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default GlassTable;
