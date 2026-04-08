import { ReactNode } from 'react';
import { TableProps, ColumnType } from 'antd/es/table';

export type FilterType = 'search' | 'select' | 'dateRange';

export interface FilterOption {
  label: ReactNode;
  value: string | number;
}

export interface FilterItem {
  key: string;
  type: FilterType;
  label?: string;
  placeholder?: string | [string, string];
  options?: FilterOption[];
  width?: number | string;
}

export interface GlassAction {
  key: string;
  label: string;
  icon?: ReactNode;
  type?: 'primary' | 'default' | 'danger';
  highlight?: boolean;
  onClick: () => void;
}

export interface GlassTableProps<T> extends Omit<TableProps<T>, 'columns' | 'title'> {
  columns: GlassColumnType<T>[];
  filterSchema?: FilterItem[];
  onFilterChange?: (values: Record<string, any>) => void;
  extraActions?: GlassAction[];
  batchActions?: ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
}

export interface GlassColumnType<T> extends ColumnType<T> {
  // Add custom column properties if needed for the premium look
  isNumeric?: boolean;
  isTag?: boolean;
  tagColor?: string | ((value: any, record: T) => string);
}
