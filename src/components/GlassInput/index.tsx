import React from 'react';
import { Input, InputProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './index.less';

export interface GlassInputProps extends InputProps {
  /** 是否为搜索框，如果是则默认展示搜索图标前缀 */
  isSearch?: boolean;
}

const GlassInput: React.FC<GlassInputProps> = ({ 
  isSearch = false, 
  className = '', 
  prefix,
  ...props 
}) => {
  return (
    <Input
      className={`glass-search ${className}`}
      prefix={isSearch ? (prefix || <SearchOutlined />) : prefix}
      {...props}
    />
  );
};

export default GlassInput;
