import React from 'react';
import { Empty } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import './index.less';

export interface MobileTableCardProps<T = any> {
  /** 表格列配置 */
  columns: ColumnType<T>[];
  /** 数据源 */
  dataSource: T[];
  /** 数据的唯一键 */
  rowKey: string | ((record: T) => string);
  /** 加载状态 */
  loading?: boolean;
  /** 空状态文本 */
  emptyText?: string;
  /** 卡片点击事件 */
  onCardClick?: (record: T) => void;
  /** 自定义卡片渲染 */
  renderCard?: (record: T, index: number) => React.ReactNode;
  /** 自定义操作按钮区域 */
  renderActions?: (record: T) => React.ReactNode;
  /** 主要字段（显示在卡片头部） */
  primaryField?: string;
  /** 次要字段（显示在卡片头部副标题） */
  secondaryField?: string;
  /** 需要高亮显示的字段 */
  highlightFields?: string[];
  /** 需要隐藏的字段 */
  hiddenFields?: string[];
  /** 卡片类名 */
  cardClassName?: string;
}

/**
 * 移动端表格卡片组件
 * 将表格数据以卡片形式展示，适配移动端
 */
function MobileTableCard<T extends Record<string, any>>(
  props: MobileTableCardProps<T>
) {
  const {
    columns,
    dataSource,
    rowKey,
    loading = false,
    emptyText = '暂无数据',
    onCardClick,
    renderCard,
    renderActions,
    primaryField,
    secondaryField,
    highlightFields = [],
    hiddenFields = [],
    cardClassName = '',
  } = props;

  // 获取记录的唯一键
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || String(index);
  };

  // 渲染字段值
  const renderFieldValue = (column: ColumnType<T>, record: T): React.ReactNode => {
    const { dataIndex, render } = column;
    const fieldKey = Array.isArray(dataIndex) ? dataIndex.join('.') : dataIndex;
    const value = fieldKey ? record[fieldKey as string] : undefined;

    // 如果有自定义渲染函数，使用自定义渲染
    if (render) {
      const rendered = render(value, record, -1);
      // 处理 RenderedCell 类型
      if (rendered && typeof rendered === 'object' && 'props' in rendered) {
        return rendered.props?.children || rendered;
      }
      return rendered as React.ReactNode;
    }

    // 默认渲染
    return value !== null && value !== undefined ? String(value) : '-';
  };

  // 判断字段是否需要高亮
  const isHighlightField = (dataIndex: any): boolean => {
    const fieldKey = Array.isArray(dataIndex) ? dataIndex.join('.') : dataIndex;
    return highlightFields.includes(fieldKey as string);
  };

  // 判断字段是否需要隐藏
  const isHiddenField = (dataIndex: any): boolean => {
    const fieldKey = Array.isArray(dataIndex) ? dataIndex.join('.') : dataIndex;
    return hiddenFields.includes(fieldKey as string);
  };

  // 获取字段的 CSS 类名
  const getFieldClassName = (dataIndex: any): string => {
    const classes: string[] = ['value'];
    if (isHighlightField(dataIndex)) {
      classes.push('highlight');
    }
    return classes.join(' ');
  };

  // 渲染默认卡片
  const renderDefaultCard = (record: T, index: number) => {
    const key = getRowKey(record, index);
    
    // 获取主要字段和次要字段
    const primaryValue = primaryField ? record[primaryField] : null;
    const secondaryValue = secondaryField ? record[secondaryField] : null;

    return (
      <div
        key={key}
        className={`mobile-table-card ${cardClassName}`}
        onClick={() => onCardClick?.(record)}
      >
        {/* 卡片头部 */}
        {(primaryValue || secondaryValue) && (
          <div className="card-header">
            <div className="card-title">
              {primaryValue && (
                <div className="primary-text">{primaryValue}</div>
              )}
              {secondaryValue && (
                <div className="secondary-text">{secondaryValue}</div>
              )}
            </div>
            {renderActions && (
              <div className="card-actions">{renderActions(record)}</div>
            )}
          </div>
        )}

        {/* 卡片主体 */}
        <div className="card-body">
          {columns
            .filter((col) => !isHiddenField(col.dataIndex))
            .map((column, colIndex) => {
              const fieldKey = Array.isArray(column.dataIndex)
                ? column.dataIndex.join('.')
                : column.dataIndex;
              
              // 如果是主要字段或次要字段，且已经在头部显示，则跳过
              if (
                (primaryField && fieldKey === primaryField) ||
                (secondaryField && fieldKey === secondaryField)
              ) {
                return null;
              }

              return (
                <div key={`${key}-${colIndex}`} className="card-row">
                  <span className="label">{column.title as string}:</span>
                  <span className={getFieldClassName(column.dataIndex)}>
                    {renderFieldValue(column, record)}
                  </span>
                </div>
              );
            })}
        </div>

        {/* 如果没有主要字段，操作按钮显示在底部 */}
        {!primaryValue && !secondaryValue && renderActions && (
          <div className="card-footer">{renderActions(record)}</div>
        )}
      </div>
    );
  };

  // 渲染内容
  const renderContent = () => {
    if (loading) {
      return <div className="mobile-table-loading">加载中...</div>;
    }

    if (!dataSource || dataSource.length === 0) {
      return (
        <div className="mobile-table-empty">
          <Empty
            image={
              <InboxOutlined
                style={{ fontSize: 48, color: 'var(--text-disabled)' }}
              />
            }
            description={emptyText}
          />
        </div>
      );
    }

    return dataSource.map((record, index) => {
      if (renderCard) {
        return renderCard(record, index);
      }
      return renderDefaultCard(record, index);
    });
  };

  return <div className="mobile-table-card-list">{renderContent()}</div>;
}

export default MobileTableCard;
