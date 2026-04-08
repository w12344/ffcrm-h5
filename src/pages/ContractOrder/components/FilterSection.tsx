/**
 * 筛选区域组件
 */
import React from "react";
import { Input, Button, Select, Grid } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { DatePicker } from "antd";
import { Dayjs } from "dayjs";
import { GoodsOption, ContractQueryParams } from "@/services/contract";
import MobileDateRangePicker from "@/components/MobileDateRangePicker";

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

interface FilterSectionProps {
  filters: Partial<ContractQueryParams>;
  selectedGoods: string[];
  dateRange: [Dayjs | null, Dayjs | null];
  goodsList: GoodsOption[];
  goodsLoading: boolean;
  onFiltersChange: (filters: Partial<ContractQueryParams>) => void;
  onGoodsChange: (goods: string[]) => void;
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null]) => void;
  onSearch: () => void;
  onReset: () => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  selectedGoods,
  dateRange,
  goodsList,
  goodsLoading,
  onFiltersChange,
  onGoodsChange,
  onDateRangeChange,
  onSearch,
  onReset,
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div className="filter-section">
      <div className="filter-row">
        <Input
          placeholder="学生姓名"
          value={filters.studentName}
          onChange={(e) => onFiltersChange({ ...filters, studentName: e.target.value })}
          style={{ width: 200 }}
        />
        <Input
          placeholder="档案名称"
          value={filters.profileName}
          onChange={(e) => onFiltersChange({ ...filters, profileName: e.target.value })}
          style={{ width: 200 }}
        />
        <Select
          mode="multiple"
          placeholder="请选择产品"
          value={selectedGoods}
          onChange={onGoodsChange}
          loading={goodsLoading}
          showSearch
          optionFilterProp="label"
          allowClear
          maxTagCount="responsive"
          style={{ width: 250 }}
          options={goodsList.map((goods) => ({
            value: goods.name,
            label: goods.name,
          }))}
        />
        {isMobile ? (
          <MobileDateRangePicker
            value={dateRange}
            onChange={(dates) => onDateRangeChange(dates as [Dayjs | null, Dayjs | null])}
            placeholder={["签约开始日期", "签约结束日期"]}
          />
        ) : (
          <RangePicker
            value={dateRange}
            onChange={(dates) => onDateRangeChange(dates as [Dayjs | null, Dayjs | null])}
            placeholder={["签约开始日期", "签约结束日期"]}
            style={{ width: 350 }}
          />
        )}
        <div className="button-group">
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onReset}>
            重置
          </Button>
        </div>
      </div>
    </div>
  );
};
