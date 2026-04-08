import { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import {
  fetchProfileDetail,
  fetchProfileTimeline,
  fetchProfileObjections,
  fetchProfileWxContacts,
  fetchCommunicationRecords,
  fetchContractList,
} from '@/services/profile';
import { CustomerProfileData, ObjectionDetail, CommunicationRecord, ContractInfo } from '../types';

interface UseProfileDataReturn {
  profileData: CustomerProfileData | null;
  objections: ObjectionDetail[];
  communicationRecords: CommunicationRecord[];
  contracts: ContractInfo[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * 自定义 Hook：加载档案数据
 * 封装数据获取逻辑，提高可维护性和可测试性
 */
export const useProfileData = (id: string | undefined): UseProfileDataReturn => {
  const [profileData, setProfileData] = useState<CustomerProfileData | null>(null);
  const [objections, setObjections] = useState<ObjectionDetail[]>([]);
  const [communicationRecords, setCommunicationRecords] = useState<CommunicationRecord[]>([]);
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 使用 ref 防止 StrictMode 下的重复请求
  const hasFetchedRef = useRef(false);
  const currentIdRef = useRef<string | undefined>(undefined);

  const loadProfileData = async () => {
    if (!id) {
      message.error('档案ID不存在');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 并行请求所有数据
      const [
        profileResponse,
        timelineResponse,
        objectionsResponse,
        contactsResponse,
        communicationResponse,
        contractsResponse,
      ] = await Promise.all([
        fetchProfileDetail(Number(id)),
        fetchProfileTimeline(Number(id)),
        fetchProfileObjections(Number(id)),
        fetchProfileWxContacts(Number(id)),
        fetchCommunicationRecords(Number(id)),
        fetchContractList(Number(id)),
      ]);

      const data = profileResponse.data.data;
      const timelineData = timelineResponse.data.data || [];
      const objectionsData = objectionsResponse.data.data || [];
      const contactsData = contactsResponse.data.data || [];
      const communicationData = communicationResponse.data.data || [];
      const contractsData = contractsResponse.data.data || [];

      setProfileData({
        id: data.id.toString(),
        basicInfo: {
          name: data.realName || data.remarkName || '未知',
          realName: data.realName,
          gender: data.gender === '男' || data.gender === '女' ? data.gender : '未知',
          examYear: data.editionLabel,
          province: data.province,
          currentSchool: data.currentSchool,
          major: data.major,
          remarkName: data.remarkName,
          city: data.province,
        },
        evaluation: {
          fatScore: data.fatScore,
          ripeScore: data.ripeScore,
          level: data.level,
        },
        timeline: timelineData,
        aiSummary: data.aiSummary || '暂无AI总结',
        issueTags: [],
        manualNotes: [],
        contacts: contactsData,
      });

      setObjections(objectionsData);
      setCommunicationRecords(communicationData);
      setContracts(contractsData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      message.error('加载档案数据失败，请稍后重试');
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 如果 id 改变，重置标记
    if (currentIdRef.current !== id) {
      hasFetchedRef.current = false;
      currentIdRef.current = id;
    }

    // 如果已经请求过，直接返回（防止 StrictMode 重复调用）
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    loadProfileData();
  }, [id]);

  return {
    profileData,
    objections,
    communicationRecords,
    contracts,
    loading,
    error,
    refetch: loadProfileData,
  };
};
