import React, { useState, useEffect } from 'react';
import { Form, message, Modal } from 'antd';
import { smartNavigate } from '@/utils/url';
import type { ContractFillFieldsRequest } from '../types';
import { fillContractFields, previewContract, submitSignTask } from '@/services/contractSign';
import dayjs from 'dayjs';
import {
  StudentInfoSection,
  GuardianInfoSection,
  ServiceInfoSection,
  BasicInfoDisplay,
  FormActions,
} from './FormSections';
import SmartPasteButton from './SmartPasteButton';

interface BasicInfo {
  contractTitle?: string;
  signerName?: string;
  signerMobile?: string;
  signerIdCard?: string;
}

interface FuwuSchoolFormProps {
  initialValues?: Partial<ContractFillFieldsRequest>;
  signTaskId: string;
  basicInfo?: BasicInfo;
  onSubmit: (values: ContractFillFieldsRequest) => void;
  loading?: boolean;
  onValuesChange?: (values: Partial<ContractFillFieldsRequest>) => void;
  isViewOnly?: boolean;
}

/**
 * 服务学校模板表单
 */
const FuwuSchoolForm: React.FC<FuwuSchoolFormProps> = ({
  initialValues,
  signTaskId,
  basicInfo,
  onSubmit,
  loading = false,
  onValuesChange,
  isViewOnly = false,
}) => {
  const [form] = Form.useForm();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);

  const responsiveLayout = {
    xs: 24,
    sm: 12,
    md: 8,
  };

  // 初始化表单值
  useEffect(() => {
    if (initialValues) {
      const formattedValues = { ...initialValues };
      // 转换日期字段
      const dateFields = ['serviceStartDate', 'serviceEndDate', 'signDate1', 'signDate2'];
      dateFields.forEach(field => {
        if (formattedValues[field as keyof typeof formattedValues]) {
          formattedValues[field as keyof typeof formattedValues] = dayjs(
            formattedValues[field as keyof typeof formattedValues] as string
          ) as any;
        }
      });
      form.setFieldsValue(formattedValues);
    }
  }, [initialValues, form]);

  // 格式化表单数据
  const formatFormData = (values: any): ContractFillFieldsRequest => {
    const formatted = { ...values };
    
    // 转换日期字段为字符串
    const dateFields = ['serviceStartDate', 'serviceEndDate', 'signDate1', 'signDate2'];
    dateFields.forEach(field => {
      if (formatted[field] && dayjs.isDayjs(formatted[field])) {
        formatted[field] = formatted[field].format('YYYY-MM-DD');
      }
    });

    return {
      ...formatted,
      signTaskId,
    };
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      // 1. 先验证表单
      const values = await form.validateFields();
      
      // 2. 显示二次确认弹窗
      Modal.confirm({
        title: '提交确认',
        content: '请先仔细确认合同内容无误，确认提交之后合同将发送给客户',
        okText: '确认提交',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          try {
            const formattedValues = formatFormData(values);
            
            // 3. 调用填充字段接口
            await fillContractFields(formattedValues);
            // 4. 调用提交接口
            await submitSignTask(signTaskId);
            message.success('合同提交成功');
            onSubmit(formattedValues);
          } catch (error: any) {
            console.error('Submit error:', error);
            message.error(error?.message || '提交失败，请重试');
          }
        },
      });
    } catch (error: any) {
      console.error('Form validation error:', error);
      message.error('请检查表单填写是否有误');
    }
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      setSaveDraftLoading(true);
      const values = form.getFieldsValue();
      const formattedValues = formatFormData(values);
      await fillContractFields(formattedValues);
      message.success('草稿保存成功');
    } catch (error: any) {
      console.error('Save draft error:', error);
      message.error(error?.message || '保存草稿失败');
    } finally {
      setSaveDraftLoading(false);
    }
  };

  // 预览合同
  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      const values = form.getFieldsValue();
      const formattedValues = formatFormData(values);
      
      await fillContractFields(formattedValues);
      const previewUrl = await previewContract(signTaskId);
      
      if (previewUrl) {
        smartNavigate(previewUrl);
      } else {
        message.error('获取预览链接失败');
      }
    } catch (error: any) {
      console.error('Preview contract error:', error);
      message.error(error?.message || '预览合同失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 处理智能粘贴
  const handleSmartPaste = (data: Record<string, any>) => {
    form.setFieldsValue(data);
  };

  return (
    <div className="detail-info-form">
      {basicInfo && <BasicInfoDisplay basicInfo={basicInfo} />}

      {/* 快捷操作栏 */}
      <div style={{ 
        marginBottom: '16px', 
        padding: '12px 16px', 
        background: '#fff', 
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '14px', color: '#606266' }}>
          <span style={{ fontWeight: 500 }}>💡 提示：</span>
          可使用智能粘贴功能快速填充学生和监护人信息
        </div>
        <SmartPasteButton onPaste={handleSmartPaste} buttonText="智能粘贴" />
      </div>

      <Form
        form={form}
        layout="vertical"
        disabled={isViewOnly}
        onValuesChange={(_, allValues) => {
          if (onValuesChange) {
            onValuesChange(allValues);
          }
        }}
        className="contract-form"
      >
        <StudentInfoSection isHqMb={true} responsiveLayout={responsiveLayout} />
        <GuardianInfoSection isHqMb={true} responsiveLayout={responsiveLayout} />
        <ServiceInfoSection responsiveLayout={responsiveLayout} />

        <FormActions
          isViewOnly={isViewOnly}
          saveDraftLoading={saveDraftLoading}
          previewLoading={previewLoading}
          submitLoading={loading}
          onSaveDraft={handleSaveDraft}
          onPreview={handlePreview}
          onSubmit={handleSubmit}
        />
      </Form>
    </div>
  );
};

export default FuwuSchoolForm;
