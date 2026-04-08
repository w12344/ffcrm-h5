import React from 'react';
import { DatePicker } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import './index.less';

interface MobileDateRangePickerProps {
  value?: [Dayjs | null, Dayjs | null];
  onChange?: (dates: [Dayjs | null, Dayjs | null]) => void;
  placeholder?: [string, string];
}

/**
 * 移动端日期范围选择器
 * 使用两个独立的日期选择器，更适合移动端操作
 */
const MobileDateRangePicker: React.FC<MobileDateRangePickerProps> = ({
  value,
  onChange,
  placeholder = ['开始日期', '结束日期'],
}) => {
  const [startDate, endDate] = value || [null, null];

  const handleStartChange = (date: Dayjs | null) => {
    onChange?.([date, endDate]);
  };

  const handleEndChange = (date: Dayjs | null) => {
    onChange?.([startDate, date]);
  };

  return (
    <div className="mobile-date-range-picker">
      <DatePicker
        value={startDate}
        onChange={handleStartChange}
        placeholder={placeholder[0]}
        suffixIcon={<CalendarOutlined />}
        format="YYYY-MM-DD"
        allowClear
        className="date-picker-start"
      />
      <div className="date-separator">至</div>
      <DatePicker
        value={endDate}
        onChange={handleEndChange}
        placeholder={placeholder[1]}
        suffixIcon={<CalendarOutlined />}
        format="YYYY-MM-DD"
        allowClear
        className="date-picker-end"
      />
    </div>
  );
};

export default MobileDateRangePicker;
