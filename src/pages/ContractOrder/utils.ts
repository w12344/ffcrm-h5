/**
 * 合同订单页面工具函数
 */
import dayjs, { Dayjs } from "dayjs";
import { ContractQueryParams } from "@/services/contract";

/**
 * 格式化金额显示
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return "0.00";
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * 格式化日期
 */
export const formatDate = (value: string | undefined | null, format = "YYYY-MM-DD"): string => {
  if (!value) return "-";
  return dayjs(value).format(format);
};

/**
 * 构建查询参数
 */
export const buildQueryParams = (
  filters: Partial<ContractQueryParams>,
  selectedGoods: string[],
  dateRange: [Dayjs | null, Dayjs | null],
  pageNumber: number,
  pageSize: number
): ContractQueryParams => {
  return {
    pageNumber,
    pageSize,
    ...filters,
    goods: selectedGoods.length > 0 ? selectedGoods.join(",") : undefined,
    orderDateStart: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
    orderDateEnd: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
  };
};

/**
 * 生成客户档案 URL
 */
export const generateCustomerProfileUrl = (customerProfileId: number): string => {
  const basePath = import.meta.env.BASE_URL || "/";
  const normalizedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return `${normalizedBasePath}index.html#/customer/${customerProfileId}`;
};
