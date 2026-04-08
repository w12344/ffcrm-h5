import React from 'react';
import { Table, TableProps } from 'antd';

interface SafeTableProps<T = any> extends Omit<TableProps<T>, 'dataSource'> {
  dataSource?: T[];
  fallbackDataSource?: T[];
}

/**
 * 安全的 Table 组件，确保 dataSource 始终是数组
 */
const SafeTable = <T extends Record<string, any>>({
  dataSource,
  fallbackDataSource = [],
  ...props
}: SafeTableProps<T>) => {
  // 确保 dataSource 是数组
  const safeDataSource = React.useMemo(() => {
    if (Array.isArray(dataSource)) {
      return dataSource;
    }
    console.warn('SafeTable: dataSource 不是数组，使用 fallbackDataSource:', dataSource);
    return fallbackDataSource;
  }, [dataSource, fallbackDataSource]);

  return <Table {...props} dataSource={safeDataSource} />;
};

export default SafeTable;
