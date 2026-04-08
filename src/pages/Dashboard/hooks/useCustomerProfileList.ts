import { useState, useCallback } from 'react';
import {
  fetchCustomerProfileList,
  CustomerProfileListResponse,
  CustomerProfileListQueryParams
} from '@/services/databoard';
import { useAuth } from '@/contexts/AuthContext';

// MOCK DATA FOR MARKET PAGE DISTRIBUTION
const generateMockData = (params?: CustomerProfileListQueryParams) => {
  const pageSize = params?.pageSize || 10;
  const pageNumber = params?.pageNumber || 1;
  const total = 45;

  const mockItems = Array.from({ length: pageSize }).map((_, i) => {
    const id = (pageNumber - 1) * pageSize + i + 1;
    const isMockD = i % 4 === 0;
    const isMockA = i % 5 === 0;

    return {
      customerProfileId: `mock-id-${id}`,
      remarkName: `待分配线索_${id}号`,
      level: isMockA ? 'A' : (isMockD ? 'D' : 'B'),
      importance: isMockA ? 5 : (isMockD ? 2 : 4),
      tags: isMockA ? ['高意向', '重点跟进'] : ['一般跟进'],
      fatScore: Number((Math.random() * 5 + 5).toFixed(1)),
      ripeScore: Number((Math.random() * 5 + 5).toFixed(1)),
      bizDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    };
  });

  // Filter logic for mock data
  let filteredItems = [...mockItems];
  if (params?.level) {
    filteredItems = filteredItems.filter(item => item.level === params.level);
  }
  if (params?.remarkName) {
    filteredItems = filteredItems.filter(item => item.remarkName.includes(params.remarkName!));
  }

  return {
    code: 200,
    msg: "success",
    data: {
      data: filteredItems,
      pageNumber,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  } as any;
};

/**
 * 客户档案列表数据 Hook
 * 用于获取和管理客户档案列表数据（新接口）
 */
export const useCustomerProfileList = (useMockForDistribution = false) => {
  const { hasToken } = useAuth();
  const [data, setData] = useState<CustomerProfileListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (params?: CustomerProfileListQueryParams) => {
    if (useMockForDistribution) {
      setLoading(true);
      setTimeout(() => {
        const mockResponse = generateMockData(params);
        setData(mockResponse.data);
        setLoading(false);
      }, 500);
      return;
    }

    // 只在有 token 的情况下才调用接口
    if (!hasToken) {
      console.log('[useCustomerProfileList] 等待 token...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useCustomerProfileList] 开始获取客户档案列表数据', params);
      const response = await fetchCustomerProfileList(params);
      console.log('[useCustomerProfileList] API响应:', response);
      console.log('[useCustomerProfileList] 响应数据:', response.data);
      setData(response.data.data);
      console.log('[useCustomerProfileList] 获取成功，数据条数:', response.data.data?.data?.length || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('获取客户档案列表数据失败'));
      console.error('[useCustomerProfileList] 获取失败:', err);
    } finally {
      setLoading(false);
    }
  }, [hasToken, useMockForDistribution]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
