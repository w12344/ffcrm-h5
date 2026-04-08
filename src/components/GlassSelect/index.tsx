import React from 'react';
import { Select, SelectProps } from 'antd';
import './index.less';

export interface GlassSelectProps<ValueType = any> extends SelectProps<ValueType> {
  /** 选项列表，除了 children 也可以通过 options 传入 */
  options?: Array<{ label: React.ReactNode; value: string | number; [key: string]: any }>;
}

const GlassSelect: React.FC<GlassSelectProps> = ({
  className = '',
  popupClassName = '',
  options,
  children,
  ...props
}) => {
  return (
    <div className={`glass-select-dropdown ${className}`}>
      <Select
        bordered={false}
        popupClassName={`glass-select-dropdown-popup ${popupClassName}`}
        options={options}
        {...props}
      >
        {children}
      </Select>
    </div>
  );
};

export default GlassSelect;
