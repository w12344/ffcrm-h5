/**
 * 合同数据管理 Hook
 */
import { useState, useRef, useCallback } from "react";
import { message } from "antd";
import { Dayjs } from "dayjs";
import {
  fetchContractList,
  fetchGoodsList,
  fetchContractStat,
  ContractProfileGroup,
  GoodsOption,
  ContractStatData,
  ContractQueryParams,
} from "@/services/contract";
import { buildQueryParams } from "../utils";
import { DEFAULT_FILTERS } from "../constants";

export const useContractData = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ContractProfileGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [goodsList, setGoodsList] = useState<GoodsOption[]>([]);
  const [goodsLoading, setGoodsLoading] = useState(false);
  const [statData, setStatData] = useState<ContractStatData>({
    totalContractCount: 0,
    totalOrderCash: 0,
    totalRefundCash: 0,
    profileCount: 0,
  });
  const [statLoading, setStatLoading] = useState(false);
  const [filters, setFilters] = useState<Partial<ContractQueryParams>>(DEFAULT_FILTERS);
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  
  const loadingRef = useRef(false);

  /**
   * 加载产品列表
   */
  const loadGoodsList = useCallback(async () => {
    setGoodsLoading(true);
    try {
      const response = await fetchGoodsList();
      if (response.data?.code === 200 && response.data?.data) {
        setGoodsList(response.data.data);
      }
    } catch (error) {
      console.error("加载产品列表失败:", error);
    } finally {
      setGoodsLoading(false);
    }
  }, []);

  /**
   * 加载统计数据
   */
  const loadStatData = useCallback(async () => {
    setStatLoading(true);
    try {
      const params = buildQueryParams(filters, selectedGoods, dateRange, pageNumber, pageSize);
      const response = await fetchContractStat(params);
      if (response.data?.code === 200 && response.data?.data) {
        setStatData(response.data.data);
      }
    } catch (error) {
      console.error("加载统计数据失败:", error);
      message.error("加载统计数据失败");
    } finally {
      setStatLoading(false);
    }
  }, [filters, selectedGoods, dateRange, pageNumber, pageSize]);

  /**
   * 加载合同列表数据
   */
  const loadData = useCallback(async () => {
    if (loadingRef.current) {
      console.log("请求正在进行中，跳过重复调用");
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    try {
      const params = buildQueryParams(filters, selectedGoods, dateRange, pageNumber, pageSize);
      const response = await fetchContractList(params);

      if (response.data?.code === 200 && response.data?.data) {
        setDataSource(response.data.data.data || []);
        setTotal(response.data.data.total || 0);
      } else {
        console.error("API 响应格式错误:", response);
        setDataSource([]);
        setTotal(0);
        message.error(response.data?.message || "数据格式错误");
      }
    } catch (error) {
      message.error("加载数据失败");
      console.error("加载成交报单失败:", error);
      setDataSource([]);
      setTotal(0);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [filters, selectedGoods, dateRange, pageNumber, pageSize]);

  /**
   * 刷新数据（列表 + 统计）
   */
  const refreshData = useCallback(() => {
    loadData();
    loadStatData();
  }, [loadData, loadStatData]);

  /**
   * 重置筛选条件
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedGoods([]);
    setDateRange([null, null]);
  }, []);

  /**
   * 重置到第一页
   */
  const resetToFirstPage = useCallback(() => {
    if (pageNumber === 1) {
      refreshData();
    } else {
      setPageNumber(1);
    }
  }, [pageNumber, refreshData]);

  return {
    // 状态
    loading,
    dataSource,
    total,
    pageNumber,
    pageSize,
    goodsList,
    goodsLoading,
    statData,
    statLoading,
    filters,
    selectedGoods,
    dateRange,
    
    // 更新函数
    setPageNumber,
    setPageSize,
    setFilters,
    setSelectedGoods,
    setDateRange,
    
    // 操作函数
    loadGoodsList,
    loadData,
    loadStatData,
    refreshData,
    resetFilters,
    resetToFirstPage,
  };
};
