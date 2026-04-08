import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCustomerUpgradePool, CustomerUpgradePoolResponse, CustomerUpgradePoolQueryParams } from '@/services/databoard';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 客户升级池数据 Hook
 * 用于获取和管理客户升级池数据
 */
export const useCustomerUpgradePool = () => {
  const { hasToken, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<CustomerUpgradePoolResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [queryParams, setQueryParams] = useState<CustomerUpgradePoolQueryParams | undefined>(undefined);
  const hasFetchedRef = useRef(false); // 添加标记，防止重复调用

  const fetchData = useCallback(async (params?: CustomerUpgradePoolQueryParams) => {
    // 只在有 token 的情况下才调用接口
    if (!hasToken) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 使用传入的参数，不依赖 queryParams 状态
      const response = await fetchCustomerUpgradePool(params);
      setData(response.data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('获取客户升级池数据失败'));
    } finally {
      setLoading(false);
    }
  }, [hasToken]);
  
  // 更新查询参数并重新获取数据
  const updateQueryParams = useCallback((params: CustomerUpgradePoolQueryParams) => {
    setQueryParams(params);
    fetchData(params);
  }, [fetchData]);

  useEffect(() => {
    // 等待认证完成并且有 token 后才调用接口，且只调用一次
    if (!authLoading && hasToken && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData(queryParams);
    }
  }, [hasToken, authLoading, fetchData, queryParams]);

  return {
    data,
    loading: loading || authLoading,
    error,
    refetch: fetchData,
    updateQueryParams
  };
};

