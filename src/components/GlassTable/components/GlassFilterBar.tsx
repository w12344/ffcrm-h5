import React from 'react';
import { Space, Button } from 'antd';
import { FilterItem } from '../types';
import GlassInput from '../../GlassInput';
import GlassSelect from '../../GlassSelect';
import GlassDatePicker from '../../GlassDatePicker';

interface GlassFilterBarProps {
  schema: FilterItem[];
  onFilterChange: (key: string, value: any) => void;
}

const GlassFilterBar: React.FC<GlassFilterBarProps> = ({
  schema,
  onFilterChange
}) => {
  return (
    <div className="glass-filter-bar">
      <div className="filter-controls">
        <Space size={16}>
          {schema.map((item) => {
            if (item.type === 'search') {
              return (
                <GlassInput
                  key={item.key}
                  isSearch
                  placeholder={(item.placeholder as string) || '搜索...'}
                  style={{ width: item.width || 200 }}
                  onChange={(e: any) => onFilterChange(item.key, e.target.value)}
                />
              );
            }
            if (item.type === 'select') {
              return (
                <GlassSelect
                  key={item.key}
                  placeholder={(item.placeholder as string) || '请选择'}
                  style={{ width: item.width || 140 }}
                  onChange={(val: any) => onFilterChange(item.key, val)}
                  allowClear
                  options={item.options}
                />
              );
            }
            if (item.type === 'dateRange') {
              return (
                <GlassDatePicker
                  isRange
                  key={item.key}
                  placeholder={item.placeholder as unknown as [string, string]}
                  style={{ width: item.width || 280 }}
                  onChange={(_dates: any, dateStrings: any) => onFilterChange(item.key, dateStrings)}
                />
              );
            }
            return null;
          })}
        </Space>
      </div>

      <div className="filter-actions">
        <Space size={12}>
          <Button
            type="primary"
            className="glass-action-btn highlight"
            onClick={() => {}}
          >
            查询
          </Button>
          <Button
            className="glass-action-btn"
            onClick={() => {}}
          >
            重置
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default GlassFilterBar;
