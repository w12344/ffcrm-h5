import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, message, Steps, Grid } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;
import { ThemeContext } from '@/contexts/ThemeContext';
import { createSignTask, fetchSignTaskFillDetails, getContractInfo, fetchSignerInfo } from '@/services/contractSign';
import BasicInfoForm from './components/BasicInfoForm';
import DetailInfoForm from './components/DetailInfoForm';
import type { ContractBasicInfo, ContractFillFieldsRequest } from './types';
import './index.less';

interface LocationState {
  customerProfileId?: number;
  templateCode?: string;
  templateName?: string;
  signTaskId?: string;
  contractId?: number;
  isEdit?: boolean;
  isViewOnly?: boolean;
  contractTitle?: string;
  contractDetails?: any;
}

// 缓存键名
const CACHE_KEY_PREFIX = 'contract_config_';
const CACHE_STEP_KEY = 'current_step';
const CACHE_BASIC_INFO_KEY = 'basic_info';
const CACHE_DETAIL_INFO_KEY = 'detail_info';
const CACHE_SIGN_TASK_ID_KEY = 'sign_task_id';
const CACHE_TEMPLATE_CODE_KEY = 'template_code';
const CACHE_LOCATION_STATE_KEY = 'location_state';

const ContractConfig: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const currentTheme = themeContext?.currentTheme || 'light';
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // 获取缓存的 location state（用于页面刷新后恢复）
  const getCachedLocationState = (): LocationState | null => {
    try {
      // 尝试从所有可能的缓存键中查找
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(CACHE_KEY_PREFIX) && key.endsWith(`_${CACHE_LOCATION_STATE_KEY}`)
      );
      if (keys.length > 0) {
        const cached = localStorage.getItem(keys[0]);
        return cached ? JSON.parse(cached) : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // 优先使用 location.state，如果为空则使用缓存
  const state = (location.state as LocationState) || getCachedLocationState();

  // 生成缓存键（基于customerProfileId）
  const getCacheKey = (key: string) => {
    const profileId = state?.customerProfileId || 'default';
    return `${CACHE_KEY_PREFIX}${profileId}_${key}`;
  };

  // 从缓存加载初始数据
  const loadFromCache = () => {
    try {
      const cachedStep = localStorage.getItem(getCacheKey(CACHE_STEP_KEY));
      const cachedBasicInfo = localStorage.getItem(getCacheKey(CACHE_BASIC_INFO_KEY));
      const cachedDetailInfo = localStorage.getItem(getCacheKey(CACHE_DETAIL_INFO_KEY));
      const cachedSignTaskId = localStorage.getItem(getCacheKey(CACHE_SIGN_TASK_ID_KEY));
      const cachedTemplateCode = localStorage.getItem(getCacheKey(CACHE_TEMPLATE_CODE_KEY));

      return {
        step: cachedStep ? parseInt(cachedStep, 10) : 0,
        basicInfo: cachedBasicInfo ? JSON.parse(cachedBasicInfo) : null,
        detailInfo: cachedDetailInfo ? JSON.parse(cachedDetailInfo) : null,
        signTaskId: cachedSignTaskId || '',
        templateCode: cachedTemplateCode || undefined,
      };
    } catch (error) {
      console.error('Load cache error:', error);
      return { step: 0, basicInfo: null, detailInfo: null, signTaskId: '', templateCode: undefined };
    }
  };

  // 初始化状态
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [signTaskId, setSignTaskId] = useState<string>('');
  const [basicInfo, setBasicInfo] = useState<ContractBasicInfo | null>(null);
  const [detailInfo, setDetailInfo] = useState<Partial<ContractFillFieldsRequest> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [templateCode, setTemplateCode] = useState<string | undefined>(state?.templateCode);
  
  // 使用 ref 防止 StrictMode 下的重复请求
  const hasLoadedSignerInfoRef = React.useRef(false);

  // 初始化时处理缓存
  useEffect(() => {
    if (isInitialized) return;
    
    // 保存 location.state 到缓存（如果有）
    const hasLocationState = location.state && (location.state as LocationState).customerProfileId;
    if (hasLocationState) {
      const locationState = location.state as LocationState;
      localStorage.setItem(getCacheKey(CACHE_LOCATION_STATE_KEY), JSON.stringify(locationState));
    }
    
    // 如果是编辑模式，直接进入第二步
    if (state?.isEdit && state?.signTaskId && state?.contractId) {
      setCurrentStep(1);
      setSignTaskId(state.signTaskId);
      // 如果有传入的合同详情，直接使用
      if (state.contractDetails) {
        setDetailInfo(state.contractDetails);
      }
      // 调用合同基本信息接口
      const fetchContractBasicInfo = async () => {
        try {
          const contractInfo = await getContractInfo(state.contractId!);
          setBasicInfo({
            contractTitle: contractInfo.contractTitle || state.contractTitle || '',
            signerName: contractInfo.signerName || '',
            signerMobile: contractInfo.signerMobile || '',
            signerIdCard: contractInfo.signerIdCard || '',
          });
          // 设置 templateCode
          if (contractInfo.templateCode) {
            setTemplateCode(contractInfo.templateCode);
          }
        } catch (error) {
          console.error('获取合同基本信息失败:', error);
          // 如果接口失败，使用传入的数据
          if (state.contractTitle) {
            setBasicInfo({
              contractTitle: state.contractTitle,
              signerName: state.contractDetails?.signerName || '',
              signerMobile: state.contractDetails?.signerMobile || '',
              signerIdCard: state.contractDetails?.signerIdCard || '',
            });
          }
        }
      };
      fetchContractBasicInfo();
    } else {
      // 从缓存恢复数据
      const cachedData = loadFromCache();
      setCurrentStep(cachedData.step);
      setSignTaskId(cachedData.signTaskId);
      setBasicInfo(cachedData.basicInfo);
      setDetailInfo(cachedData.detailInfo);
      if (cachedData.templateCode) {
        setTemplateCode(cachedData.templateCode);
      }
      
      // 如果是新建模式且在第一步，获取签署人信息
      if (cachedData.step === 0 && state?.customerProfileId && !cachedData.basicInfo) {
        // 防止 StrictMode 重复调用
        if (hasLoadedSignerInfoRef.current) {
          return;
        }
        hasLoadedSignerInfoRef.current = true;
        
        const fetchSignerInfoData = async () => {
          try {
            setLoading(true);
            const signerInfo = await fetchSignerInfo(state.customerProfileId!);
            // 将签署人信息填充到表单
            setBasicInfo({
              contractTitle: signerInfo.contractTitle || state.templateName || '',
              signerName: signerInfo.signerName || '',
              signerMobile: signerInfo.signerMobile || '',
              signerIdCard: signerInfo.signerIdCard || '',
            });
          } catch (error) {
            console.error('获取签署人信息失败:', error);
            // 如果接口失败，不影响用户继续填写
          } finally {
            setLoading(false);
          }
        };
        fetchSignerInfoData();
      }
    }
    
    setIsInitialized(true);
  }, []);

  // 保存步骤到缓存
  useEffect(() => {
    if (!isInitialized) return; // 初始化完成后才开始保存
    localStorage.setItem(getCacheKey(CACHE_STEP_KEY), currentStep.toString());
  }, [currentStep, isInitialized]);

  // 保存 templateCode 到缓存
  useEffect(() => {
    if (templateCode) {
      localStorage.setItem(getCacheKey(CACHE_TEMPLATE_CODE_KEY), templateCode);
    }
  }, [templateCode]);

  // 保存基本信息到缓存
  useEffect(() => {
    if (basicInfo) {
      localStorage.setItem(getCacheKey(CACHE_BASIC_INFO_KEY), JSON.stringify(basicInfo));
    }
  }, [basicInfo]);

  // 保存signTaskId到缓存
  useEffect(() => {
    if (signTaskId) {
      localStorage.setItem(getCacheKey(CACHE_SIGN_TASK_ID_KEY), signTaskId);
    }
  }, [signTaskId]);

  // 保存详细信息到缓存
  useEffect(() => {
    if (detailInfo) {
      localStorage.setItem(getCacheKey(CACHE_DETAIL_INFO_KEY), JSON.stringify(detailInfo));
    }
  }, [detailInfo]);

  // 当进入第二步时，获取详情数据
  useEffect(() => {
    const fetchDetailInfo = async () => {
      // 如果是编辑模式且已经有详情数据，不需要重新获取
      if (state?.isEdit && state?.contractDetails) {
        return;
      }
      
      if (currentStep === 1 && signTaskId && !detailInfo) {
        try {
          setLoading(true);
          const data = await fetchSignTaskFillDetails(signTaskId);
          setDetailInfo(data);
        } catch (error) {
          console.error('获取详情失败:', error);
          message.error('获取表单详情失败');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDetailInfo();
  }, [currentStep, signTaskId]);

  // 清除缓存
  const clearCache = () => {
    localStorage.removeItem(getCacheKey(CACHE_STEP_KEY));
    localStorage.removeItem(getCacheKey(CACHE_BASIC_INFO_KEY));
    localStorage.removeItem(getCacheKey(CACHE_DETAIL_INFO_KEY));
    localStorage.removeItem(getCacheKey(CACHE_SIGN_TASK_ID_KEY));
    localStorage.removeItem(getCacheKey(CACHE_LOCATION_STATE_KEY));
  };

  // 处理第一步表单提交
  const handleBasicInfoSubmit = async (values: ContractBasicInfo) => {
    if (!state?.customerProfileId || !state?.templateCode || !state?.templateName) {
      message.error('缺少必要参数');
      return;
    }

    try {
      setLoading(true);

      // 调用创建签署任务接口
      const result = await createSignTask({
        customerProfileId: state.customerProfileId,
        templateCode: state.templateCode,
        templateName: state.templateName,
        ...values,
      });

      // 保存数据并进入第二步
      setBasicInfo(values);
      setSignTaskId(result.signTaskId);
      setCurrentStep(1);
    } catch (error) {
      message.error('保存失败，请重试');
      console.error('Create sign task error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理第二步表单提交
  const handleDetailSubmit = async (values: ContractFillFieldsRequest) => {
    try {
      setLoading(true);
      console.log('Submitting detailed info:', values);
      // 清除缓存
      clearCache();
      
      // 返回到学生档案页面
      if (state?.customerProfileId) {
        navigate(`/customer/${state.customerProfileId}`);
      } else {
        navigate(-1);
      }
    } catch (error) {
      message.error('提交失败，请重试');
      console.error('Submit detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存基本信息草稿
  const handleBasicInfoChange = (values: Partial<ContractBasicInfo>) => {
    setBasicInfo(prev => ({ ...prev, ...values } as ContractBasicInfo));
  };

  // 保存详细信息草稿
  const handleDetailInfoChange = (values: Partial<ContractFillFieldsRequest>) => {
    setDetailInfo(values);
  };

  // 返回上一页
  const handleBack = () => {
    // 清除缓存
    clearCache();
    // 返回上一级路由
    navigate(-1);
  };

  // 步骤配置
  const steps = [
    {
      title: '基本信息',
      description: '填写合同基本信息',
      icon: <span className="step-icon-number">1</span>,
    },
    {
      title: '详细信息',
      description: '填写合同详细内容',
      icon: <span className="step-icon-number">2</span>,
    },
  ];

  return (
    <div className={`contract-config-page ${currentTheme}-theme`}>
      {/* 页面头部 */}
      <div className="page-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          className="back-button"
        />
        <h1 className="page-title">合同配置</h1>
      </div>

      {/* 步骤进度条 */}
      <div className="steps-container">
        <Steps
          current={currentStep}
          items={steps}
          className="contract-steps"
          labelPlacement="vertical"
          direction={isMobile ? 'horizontal' : 'horizontal'}
        />
      </div>

      {/* 步骤内容 */}
      <div className="steps-content">
        {/* 第一步：填写基本信息 */}
        {currentStep === 0 && state?.templateName && (
          <BasicInfoForm
            templateName={state.templateName}
            initialValues={basicInfo || undefined}
            onSubmit={handleBasicInfoSubmit}
            onCancel={() => navigate(-1)}
            loading={loading}
            onValuesChange={handleBasicInfoChange}
          />
        )}

        {/* 第二步：填写详细表单 */}
        {currentStep === 1 && (
          <DetailInfoForm
            signTaskId={signTaskId}
            basicInfo={basicInfo || undefined}
            templateCode={templateCode}
            initialValues={detailInfo || undefined}
            onSubmit={handleDetailSubmit}
            onCancel={() => setCurrentStep(0)}
            loading={loading}
            onValuesChange={handleDetailInfoChange}
            isViewOnly={state?.isViewOnly || false}
          />
        )}
      </div>
    </div>
  );
};

export default ContractConfig;
