import React from 'react';
import { DatePicker } from 'antd';
import type { DatePickerProps, RangePickerProps } from 'antd/es/date-picker';
import './index.less';

const { RangePicker } = DatePicker;

// 通用的日期选择器 Props，支持单选和范围选，并支持各种选择类型 (年/月/日等)
export type GlassDatePickerProps =
  | ({ isRange?: false } & DatePickerProps)
  | ({ isRange: true } & RangePickerProps);

const GlassDatePicker: React.FC<GlassDatePickerProps> = (props) => {
  const { isRange, className, ...restProps } = props;

  // 组装通用样式类
  const wrapperClass = `glass-date-picker-wrapper ${className || ''}`;

  if (isRange) {
    return (
      <div className={wrapperClass}>
        <RangePicker
          bordered={false}
          className="glass-range-picker glass-picker-component"
          {...(restProps as RangePickerProps)}
        />
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <DatePicker
        bordered={false}
        className="glass-date-picker glass-picker-component"
        {...(restProps as DatePickerProps)}
      />
    </div>
  );
};

export default GlassDatePicker;
