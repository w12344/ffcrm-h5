import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch, Checkbox, Radio, Button, Row, Col, message, Modal } from 'antd';
import { smartNavigate } from '@/utils/url';
import { 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined, 
  TrophyOutlined, 
  RocketOutlined,
  CrownOutlined,
  PayCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ContractFillFieldsRequest } from '../types';
import { fillContractFields, previewContract, submitSignTask } from '@/services/contractSign';
import dayjs from 'dayjs';
import FuwuSchoolForm from './FuwuSchoolForm';
import SmartPasteButton from './SmartPasteButton';

// 数字转中文大写金额
const numberToChinese = (money: number | string): string => {
  const num = typeof money === 'string' ? parseFloat(money) : money;
  if (isNaN(num)) return '';
  
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const cnIntRadice = ['', '拾', '佰', '仟'];
  const cnIntUnits = ['', '万', '亿', '兆'];
  const cnDecUnits = ['角', '分'];
  const cnInteger = '整';
  const cnIntLast = '元';
  const maxNum = 9999999999999.99;
  
  if (num === 0) return '零元整';
  if (num > maxNum) return '';
  
  let integerNum = Math.floor(num);
  let decimalNum = Math.round((num - integerNum) * 100);
  
  let chineseStr = '';
  let zeroCount = 0;
  
  // 处理整数部分
  if (integerNum === 0) {
    chineseStr = cnNums[0];
  } else {
    let unitPos = 0;
    while (integerNum > 0) {
      const section = integerNum % 10000;
      if (zeroCount > 0 && section !== 0) {
        chineseStr = cnNums[0] + chineseStr;
      }
      const sectionChinese = sectionToChinese(section, cnNums, cnIntRadice);
      chineseStr = sectionChinese + (section !== 0 ? cnIntUnits[unitPos] : '') + chineseStr;
      zeroCount = section === 0 ? zeroCount + 1 : 0;
      integerNum = Math.floor(integerNum / 10000);
      unitPos++;
    }
  }
  
  // 移除末尾的零（如"壹万零" -> "壹万"）
  chineseStr = chineseStr.replace(/零+$/, '');
  chineseStr += cnIntLast;
  
  // 处理小数部分
  if (decimalNum === 0) {
    chineseStr += cnInteger;
  } else {
    const jiao = Math.floor(decimalNum / 10);
    const fen = decimalNum % 10;
    if (jiao > 0) {
      chineseStr += cnNums[jiao] + cnDecUnits[0];
    } else if (fen > 0) {
      chineseStr += cnNums[0];
    }
    if (fen > 0) {
      chineseStr += cnNums[fen] + cnDecUnits[1];
    }
  }
  
  return chineseStr;
};

// 处理四位数字转中文
const sectionToChinese = (section: number, cnNums: string[], cnIntRadice: string[]): string => {
  let sectionChinese = '';
  let pos = 0;
  let zero = true;
  
  while (section > 0) {
    const v = section % 10;
    if (v === 0) {
      if (!zero) {
        zero = true;
        sectionChinese = cnNums[v] + sectionChinese;
      }
    } else {
      zero = false;
      sectionChinese = cnNums[v] + cnIntRadice[pos] + sectionChinese;
    }
    pos++;
    section = Math.floor(section / 10);
  }
  
  // 优化：如果是 10-19，去掉"壹"，如"壹拾" -> "拾"
  if (sectionChinese.startsWith('壹拾')) {
    sectionChinese = sectionChinese.substring(1);
  }
  
  return sectionChinese;
};

interface BasicInfo {
  contractTitle?: string;
  signerName?: string;
  signerMobile?: string;
  signerIdCard?: string;
}

interface DetailInfoFormProps {
  initialValues?: Partial<ContractFillFieldsRequest>;
  signTaskId: string;
  basicInfo?: BasicInfo;
  templateCode?: string;
  onSubmit: (values: ContractFillFieldsRequest) => void;
  onCancel: () => void;
  loading?: boolean;
  onValuesChange?: (values: Partial<ContractFillFieldsRequest>) => void;
  isViewOnly?: boolean;
}

const DetailInfoForm: React.FC<DetailInfoFormProps> = ({
  initialValues,
  signTaskId,
  basicInfo,
  templateCode,
  onSubmit,
  loading = false,
  onValuesChange,
  isViewOnly = false,
}) => {
  const [form] = Form.useForm();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);
  
  // 判断模板类型
  const isPrivateSchool = templateCode === 'PRIVATE_SCHOOL';
  const isHqMb = templateCode === 'LOGISTICS_SERVICE';
  const titlePrefix = isPrivateSchool ? '私塾' : '';
  
  // 培训方式选项
  const trainingMethodOptions = isPrivateSchool 
    ? [{ label: '一对一', value: '一对一' }]
    : [
        { label: '一对一', value: '一对一' },
        { label: '大班', value: '大班' },
        { label: '小班', value: '小班' },
      ];

  // 监听表单值变化，控制模块显示
  const isXkccy = Form.useWatch('isXkccy', form);
  const isGkccy = Form.useWatch('isGkccy', form);
  const isZtc = Form.useWatch('isZtc', form);
  const payChannel = Form.useWatch('payChannel', form);

  // 使用 ref 追踪上一次的状态
  const prevModulesRef = useRef({ isXkccy: false, isGkccy: false, isZtc: false });

  // 确保三个模块只能同时开启一个
  useEffect(() => {
    const prev = prevModulesRef.current;
    
    console.log('模块状态变化:', { 
      isXkccy, isGkccy, isZtc, 
      prev 
    });
    
    // 只在模块从 false 变为 true 时（刚被开启）才执行互斥逻辑
    if (isXkccy && !prev.isXkccy) {
      console.log('选考冲刺营被开启，关闭其他模块');
      setTimeout(() => {
        form.setFieldsValue({ isGkccy: false, isZtc: false });
      }, 0);
    } else if (isGkccy && !prev.isGkccy) {
      console.log('高考冲刺营被开启，关闭其他模块');
      setTimeout(() => {
        form.setFieldsValue({ isXkccy: false, isZtc: false });
      }, 0);
    } else if (isZtc && !prev.isZtc) {
      console.log('直通车被开启，关闭其他模块');
      setTimeout(() => {
        form.setFieldsValue({ isXkccy: false, isGkccy: false });
      }, 0);
    }
    
    // 更新 ref 保存当前状态
    prevModulesRef.current = { isXkccy, isGkccy, isZtc };
  }, [isXkccy, isGkccy, isZtc, form]);

  // 监听复选框状态，强制绑定到 Checkbox 组件
  const xkccyHourlyFeeChecked = Form.useWatch('xkccyHourlyFeeChecked', form);
  const xkccyMaterialFeeChecked = Form.useWatch('xkccyMaterialFeeChecked', form);
  const xkccyPadFeeChecked = Form.useWatch('xkccyPadFeeChecked', form);
  const xkccyInsuranceFeeChecked = Form.useWatch('xkccyInsuranceFeeChecked', form);
  
  const gkccyHourlyFeeChecked = Form.useWatch('gkccyHourlyFeeChecked', form);
  const gkccyMaterialFeeChecked = Form.useWatch('gkccyMaterialFeeChecked', form);
  const gkccyPadFeeChecked = Form.useWatch('gkccyPadFeeChecked', form);
  const gkccyInsuranceFeeChecked = Form.useWatch('gkccyInsuranceFeeChecked', form);
  
  const ztcHourlyFeeChecked = Form.useWatch('ztcHourlyFeeChecked', form);
  const ztcMaterialFeeChecked = Form.useWatch('ztcMaterialFeeChecked', form);
  const ztcPadFeeChecked = Form.useWatch('ztcPadFeeChecked', form);
  const ztcInsuranceFeeChecked = Form.useWatch('ztcInsuranceFeeChecked', form);

  // 监听各项费用金额，用于自动计算合计
  const xkccyHourlyfee = Form.useWatch('xkccyHourlyfee', form);
  const xkccyMaterialFee = Form.useWatch('xkccyMaterialFee', form);
  const xkccyPadFee = Form.useWatch('xkccyPadFee', form);
  const xkccyInsuranceFee = Form.useWatch('xkccyInsuranceFee', form);
  
  const gkccyHourlyfee = Form.useWatch('gkccyHourlyfee', form);
  const gkccyMaterialFee = Form.useWatch('gkccyMaterialFee', form);
  const gkccyPadFee = Form.useWatch('gkccyPadFee', form);
  const gkccyInsuranceFee = Form.useWatch('gkccyInsuranceFee', form);
  
  const ztcHourlyfee = Form.useWatch('ztcHourlyfee', form);
  const ztcMaterialFee = Form.useWatch('ztcMaterialFee', form);
  const ztcPadFee = Form.useWatch('ztcPadFee', form);
  const ztcInsuranceFee = Form.useWatch('ztcInsuranceFee', form);

  // 自动计算选考冲刺营合计费用
  useEffect(() => {
    const fees = [
      xkccyHourlyFeeChecked ? (xkccyHourlyfee || 0) : 0,
      xkccyMaterialFeeChecked ? (xkccyMaterialFee || 0) : 0,
      xkccyPadFeeChecked ? (xkccyPadFee || 0) : 0,
      xkccyInsuranceFeeChecked ? (xkccyInsuranceFee || 0) : 0,
    ];
    const total = fees.reduce((sum, fee) => sum + Number(fee), 0);
    if (total > 0) {
      const chinese = numberToChinese(total);
      setTimeout(() => {
        form.setFieldsValue({ 
          xkccyTotalFeeChinese: chinese,
          xkccyTotalFee: total
        });
      }, 0);
    }
  }, [xkccyHourlyFeeChecked, xkccyHourlyfee, xkccyMaterialFeeChecked, xkccyMaterialFee, 
      xkccyPadFeeChecked, xkccyPadFee, xkccyInsuranceFeeChecked, xkccyInsuranceFee, form]);

  // 自动计算高考冲刺营合计费用
  useEffect(() => {
    const fees = [
      gkccyHourlyFeeChecked ? (gkccyHourlyfee || 0) : 0,
      gkccyMaterialFeeChecked ? (gkccyMaterialFee || 0) : 0,
      gkccyPadFeeChecked ? (gkccyPadFee || 0) : 0,
      gkccyInsuranceFeeChecked ? (gkccyInsuranceFee || 0) : 0,
    ];
    const total = fees.reduce((sum, fee) => sum + Number(fee), 0);
    if (total > 0) {
      const chinese = numberToChinese(total);
      setTimeout(() => {
        form.setFieldsValue({ 
          gkccyTotalFeeChinese: chinese,
          gkccyTotalFee: total
        });
      }, 0);
    }
  }, [gkccyHourlyFeeChecked, gkccyHourlyfee, gkccyMaterialFeeChecked, gkccyMaterialFee, 
      gkccyPadFeeChecked, gkccyPadFee, gkccyInsuranceFeeChecked, gkccyInsuranceFee, form]);

  // 自动计算直通车合计费用
  useEffect(() => {
    const fees = [
      ztcHourlyFeeChecked ? (ztcHourlyfee || 0) : 0,
      ztcMaterialFeeChecked ? (ztcMaterialFee || 0) : 0,
      ztcPadFeeChecked ? (ztcPadFee || 0) : 0,
      ztcInsuranceFeeChecked ? (ztcInsuranceFee || 0) : 0,
    ];
    const total = fees.reduce((sum, fee) => sum + Number(fee), 0);
    if (total > 0) {
      const chinese = numberToChinese(total);
      setTimeout(() => {
        form.setFieldsValue({ 
          ztcTotalFeeChinese: chinese,
          ztcTotalFee: total
        });
      }, 0);
    }
  }, [ztcHourlyFeeChecked, ztcHourlyfee, ztcMaterialFeeChecked, ztcMaterialFee, 
      ztcPadFeeChecked, ztcPadFee, ztcInsuranceFeeChecked, ztcInsuranceFee, form]);

  useEffect(() => {
    // 设置默认值
    const defaultValues = {
      isXkccy: false,
      isGkccy: false,
      isZtc: false,
    };
    
    // 处理 initialValues
    if (initialValues) {
      // 处理日期字段，转为 dayjs 对象
      const dateFields = [
        'xkccyStudyStartDate', 'xkccyStudyEndDate',
        'gkccyStudyStartDate', 'gkccyStudyEndDate',
        'ztcStudyStartDate', 'ztcStudyEndDate',
        'payDate1', 'payDate2',
        'signDate1', 'signDate2'
      ];

      const formattedValues: Record<string, any> = { ...defaultValues, ...initialValues };
      dateFields.forEach(field => {
        const value = formattedValues[field];
        // 只在值存在且是字符串时才转换为 dayjs 对象
        if (value && typeof value === 'string') {
          formattedValues[field] = dayjs(value);
        }
      });

      form.setFieldsValue(formattedValues);
    } else {
      // 没有 initialValues 时，只设置默认值
      form.setFieldsValue(defaultValues);
    }
    
    // 如果是私塾模板且培训方式未设置，自动设置为"一对一"
    if (isPrivateSchool && !initialValues?.trainingMethod) {
      form.setFieldsValue({ trainingMethod: '一对一' });
    }
  }, [initialValues, form, isPrivateSchool]);

  // 格式化表单数据
  const formatFormData = (values: any) => {
    const dateFields = [
      'xkccyStudyStartDate', 'xkccyStudyEndDate',
      'gkccyStudyStartDate', 'gkccyStudyEndDate',
      'ztcStudyStartDate', 'ztcStudyEndDate',
      'payDate1', 'payDate2',
      'signDate1', 'signDate2'
    ];

    const formattedValues = { ...values, signTaskId };
    
    // 格式化日期字段
    dateFields.forEach(field => {
      const key = field as keyof ContractFillFieldsRequest;
      if (formattedValues[key]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formattedValues[key] = (formattedValues[key] as any).format('YYYY-MM-DD');
      }
    });

    // 格式化合计费用（小写）字段，确保保留两位小数
    const totalFeeFields = ['xkccyTotalFee', 'gkccyTotalFee', 'ztcTotalFee'];
    totalFeeFields.forEach(field => {
      if (formattedValues[field] !== undefined && formattedValues[field] !== null) {
        formattedValues[field] = Number(formattedValues[field]).toFixed(2);
      }
    });

    return formattedValues;
  };

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
      
      // 获取当前表单值（不验证完整性）
      const values = form.getFieldsValue();
      const formattedValues = formatFormData(values);
      
      // 调用填写字段接口保存草稿
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
      
      // 获取当前表单值（不验证完整性）
      const values = form.getFieldsValue();
      const formattedValues = formatFormData(values);
      
      // 先保存当前填写的内容
      await fillContractFields(formattedValues);
      
      // 调用预览接口
      const previewUrl = await previewContract(signTaskId);
      
      if (previewUrl) {
        // 在新窗口打开预览
        smartNavigate(previewUrl);
      } else {
        message.error('预览链接获取失败');
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      message.error(error?.message || '预览失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 处理智能粘贴
  const handleSmartPaste = (data: Record<string, any>) => {
    // 直接设置表单值，所有字段都是文本类型
    form.setFieldsValue(data);
  };

  // 表单布局配置
  const responsiveLayout = {
    xs: 24,
    sm: 12,
    md: 8,
  };

  // 如果是服务学校模板，使用专用表单组件
  if (isHqMb) {
    return (
      <FuwuSchoolForm
        initialValues={initialValues}
        signTaskId={signTaskId}
        basicInfo={basicInfo}
        onSubmit={onSubmit}
        loading={loading}
        onValuesChange={onValuesChange}
        isViewOnly={isViewOnly}
      />
    );
  }

  // 原有的冲刺营和私塾模板表单
  return (
    <div className="detail-info-form">
      {basicInfo && (
        <div className="form-section-card" style={{ marginBottom: '0.533rem' }}>
          <div className="section-title" style={{ padding: '0.533rem 0.667rem 0.4rem' }}>
            <UserOutlined className="section-icon" />
            <span>合同基本信息</span>
          </div>
          <div className="ant-card-body">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="info-item">
                  <span className="info-label">合同标题：</span>
                  <span className="info-value">{basicInfo.contractTitle}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <span className="info-label">签署人姓名：</span>
                  <span className="info-value">{basicInfo.signerName}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <span className="info-label">签署人手机号：</span>
                  <span className="info-value">{basicInfo.signerMobile}</span>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <span className="info-label">签署人身份证号：</span>
                  <span className="info-value">{basicInfo.signerIdCard}</span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      )}

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
        onValuesChange={(changedValues, allValues) => {
          // 自动勾选/取消勾选复选框的逻辑
          const feeFields = [
            // 选考冲刺营
            { amount: 'xkccyHourlyfee', checked: 'xkccyHourlyFeeChecked' },
            { amount: 'xkccyMaterialFee', checked: 'xkccyMaterialFeeChecked' },
            { amount: 'xkccyPadFee', checked: 'xkccyPadFeeChecked' },
            { amount: 'xkccyInsuranceFee', checked: 'xkccyInsuranceFeeChecked' },
            // 高考冲刺营
            { amount: 'gkccyHourlyfee', checked: 'gkccyHourlyFeeChecked' },
            { amount: 'gkccyMaterialFee', checked: 'gkccyMaterialFeeChecked' },
            { amount: 'gkccyPadFee', checked: 'gkccyPadFeeChecked' },
            { amount: 'gkccyInsuranceFee', checked: 'gkccyInsuranceFeeChecked' },
            // 直通车
            { amount: 'ztcHourlyfee', checked: 'ztcHourlyFeeChecked' },
            { amount: 'ztcMaterialFee', checked: 'ztcMaterialFeeChecked' },
            { amount: 'ztcPadFee', checked: 'ztcPadFeeChecked' },
            { amount: 'ztcInsuranceFee', checked: 'ztcInsuranceFeeChecked' },
          ];
          // 检查是否有金额字段发生变化
          setTimeout(() => {
            feeFields.forEach(({ amount, checked }) => {
              if (changedValues.hasOwnProperty(amount)) {
                const amountValue = changedValues[amount];
                const shouldCheck = amountValue !== null && amountValue !== undefined && amountValue !== '';
                console.log(`Field ${amount} changed to ${amountValue}, setting ${checked} to ${shouldCheck}`);
                form.setFieldsValue({
                  [checked]: shouldCheck
                });
              }
            });
          }, 0);

          if (onValuesChange) {
            onValuesChange(allValues);
          }
        }}
        className="contract-form"
      >
        {/* 1. 学生信息 */}
        <div className="form-section-card">
          <div className="section-title" style={{ padding: '0.533rem 0.667rem 0.4rem' }}>
            <UserOutlined className="section-icon" />
            <span>学生信息</span>
          </div>
          <div className="ant-card-body">
            <Row gutter={[16, 24]}>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="学生姓名" 
                  name="studentName"
                  rules={[{ required: true, message: '请输入学生姓名' }]}
                >
                  <Input placeholder="请输入学生姓名" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="学生性别" 
                  name="studentGender"
                  rules={[{ required: true, message: '请选择学生性别' }]}
                >
                  <Select placeholder="请选择性别">
                    <Select.Option value="男">男</Select.Option>
                    <Select.Option value="女">女</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="学生身份证号" 
                  name="studentIdCard"
                  rules={[
                    { required: true, message: '请输入学生身份证号' },
                    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号' }
                  ]}
                >
                  <Input placeholder="请输入身份证号" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="学生电话" 
                  name="studentPhone"
                  rules={[
                    { required: true, message: '请输入学生电话' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input placeholder="请输入学生电话" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="当前学校" 
                  name="currentSchool"
                  rules={[{ required: true, message: '请输入当前学校' }]}
                >
                  <Input placeholder="请输入当前学校" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="当前年级" 
                  name="currentGrade"
                  rules={[{ required: true, message: '请输入当前年级' }]}
                >
                  <Input placeholder="请输入当前年级" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>

        {/* 2. 监护人信息 */}
        <div className="form-section-card">
          <div className="section-title" style={{ padding: '0.533rem 0.667rem 0.4rem' }}>
            <TeamOutlined className="section-icon" />
            <span>监护人信息</span>
          </div>
          <div className="ant-card-body">
            <Row gutter={[16, 24]}>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="监护人姓名" 
                  name="guardianName"
                  rules={[{ required: true, message: '请输入监护人姓名' }]}
                >
                  <Input placeholder="请输入监护人姓名" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="与学生关系" 
                  name="guardianRelation"
                  rules={[{ required: true, message: '请输入与学生关系' }]}
                >
                  <Input placeholder="请输入关系（如：父子、母子）" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="监护人电话" 
                  name="guardianPhone"
                  rules={[
                    { required: true, message: '请输入监护人电话' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input placeholder="请输入监护人电话" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="监护人身份证" 
                  name="guardianIdCard"
                  rules={[
                    { required: true, message: '请输入监护人身份证' },
                    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号' }
                  ]}
                >
                  <Input placeholder="请输入监护人身份证" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>

        {/* 3. 课程信息 */}
        <div className="form-section-card">
          <div className="section-title" style={{ padding: '0.533rem 0.667rem 0.4rem' }}>
            <BookOutlined className="section-icon" />
            <span>课程信息</span>
          </div>
          <div className="ant-card-body">
            <Row gutter={[16, 24]}>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="课程名称" 
                  name="courseName"
                  rules={[{ required: true, message: '请输入课程名称' }]}
                >
                  <Input placeholder="请输入课程名称" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="课程顾问" 
                  name="advisor"
                  rules={[{ required: true, message: '请输入课程顾问' }]}
                >
                  <Input placeholder="请输入课程顾问" />
                </Form.Item>
              </Col>
              {!isPrivateSchool && (
                <Col {...responsiveLayout}>
                  <Form.Item 
                    label="培训方式" 
                    name="trainingMethod"
                    rules={[{ required: true, message: '请选择培训方式' }]}
                  >
                    <Select placeholder="请选择培训方式" options={trainingMethodOptions} />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </div>
        </div>

        {/* 4. 选考冲刺营 */}
        <div className="form-section-card">
          <div className="section-title" style={{ padding: '0.533rem 0.667rem 0.4rem', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrophyOutlined className="section-icon" />
              <span>{titlePrefix}选考冲刺营</span>
            </div>
            <Form.Item name="isXkccy" valuePropName="checked" noStyle>
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
          </div>
          {isXkccy && (
            <div className="ant-card-body">
              <Row gutter={[16, 24]}>
                <Col {...responsiveLayout}>
                  <Form.Item label="开始日期" name="xkccyStudyStartDate">
                    <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
                  </Form.Item>
                </Col>
                <Col {...responsiveLayout}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <Form.Item label="结束日期" name="xkccyStudyEndDate" style={{ flex: 1, marginBottom: 0 }}>
                      <DatePicker style={{ width: '100%' }} placeholder="请选择结束日期" />
                    </Form.Item>
                    <div style={{ paddingTop: '30px' }}>
                      <Radio.Group 
                        size="small"
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const now = dayjs();
                          const currentYear = now.year();
                          const targetDate = dayjs(`${currentYear}-${selectedDate}`);
                          
                          // 如果当前日期已经超过目标日期，则使用明年的日期
                          const finalDate = now.isAfter(targetDate) 
                            ? dayjs(`${currentYear + 1}-${selectedDate}`)
                            : targetDate;
                          
                          form.setFieldsValue({ xkccyStudyEndDate: finalDate });
                        }}
                      >
                        <Radio.Button value="01-04">1月4号</Radio.Button>
                        <Radio.Button value="06-04">6月4号</Radio.Button>
                      </Radio.Group>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row gutter={[16, 24]}>
                <Col {...responsiveLayout}>
                  <Form.Item label="课时费" style={{ marginBottom: 0 }}>
                    <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="xkccyHourlyFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!xkccyHourlyFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ xkccyHourlyFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                        <Form.Item 
                          name="xkccyHourlyfee" 
                          noStyle
                        >
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                <Col {...responsiveLayout}>
                  <Form.Item label="资料费" style={{ marginBottom: 0 }}>
                     <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="xkccyMaterialFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!xkccyMaterialFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ xkccyMaterialFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                        <Form.Item name="xkccyMaterialFee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                <Col {...responsiveLayout}>
                  <Form.Item label="平板费" style={{ marginBottom: 0 }}>
                     <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="xkccyPadFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!xkccyPadFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ xkccyPadFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                         <Form.Item name="xkccyPadFee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                <Col {...responsiveLayout}>
                  <Form.Item label="保险费" style={{ marginBottom: 0 }}>
                     <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="xkccyInsuranceFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!xkccyInsuranceFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ xkccyInsuranceFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                        <Form.Item name="xkccyInsuranceFee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '0.533rem' }}>
                <Col span={12}>
                  <Form.Item label="合计费用（大写）" name="xkccyTotalFeeChinese">
                    <Input 
                      placeholder="例：壹万贰佰佰拾元整 或 10000" 
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value && /^\d+(\.\d{1,2})?$/.test(value)) {
                          const chinese = numberToChinese(value);
                          if (chinese) {
                            form.setFieldsValue({ xkccyTotalFeeChinese: chinese });
                          }
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="合计费用（小写）" name="xkccyTotalFee">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      placeholder="例：10000"
                      min={0}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  {(() => {
                    const fees = [
                      xkccyHourlyFeeChecked ? (xkccyHourlyfee || 0) : 0,
                      xkccyMaterialFeeChecked ? (xkccyMaterialFee || 0) : 0,
                      xkccyPadFeeChecked ? (xkccyPadFee || 0) : 0,
                      xkccyInsuranceFeeChecked ? (xkccyInsuranceFee || 0) : 0,
                    ];
                    const total = fees.reduce((sum, fee) => sum + Number(fee), 0);
                    return total > 0 ? (
                      <div style={{ marginTop: '-0.4rem', marginBottom: '0.533rem', fontSize: '0.48rem', fontWeight: 'bold', color: '#ff4d4f' }}>
                        核对金额：¥{total.toFixed(2)}
                      </div>
                    ) : null;
                  })()}
                </Col>
              </Row>
            </div>
          )}
        </div>

        {/* 5. 高考冲刺营 */}
        <div className="form-section-card">
          <div className="section-title" style={{ padding: '0.533rem 0.667rem 0.4rem', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RocketOutlined className="section-icon" />
              <span>{titlePrefix}高考冲刺营</span>
            </div>
            <Form.Item name="isGkccy" valuePropName="checked" noStyle>
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
          </div>
          {isGkccy && (
             <div className="ant-card-body">
              <Row gutter={[16, 24]}>
                <Col {...responsiveLayout}>
                  <Form.Item label="开始日期" name="gkccyStudyStartDate">
                    <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
                  </Form.Item>
                </Col>
                <Col {...responsiveLayout}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <Form.Item label="结束日期" name="gkccyStudyEndDate" style={{ flex: 1, marginBottom: 0 }}>
                      <DatePicker style={{ width: '100%' }} placeholder="请选择结束日期" />
                    </Form.Item>
                    <div style={{ paddingTop: '30px' }}>
                      <Radio.Group 
                        size="small"
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const now = dayjs();
                          const currentYear = now.year();
                          const targetDate = dayjs(`${currentYear}-${selectedDate}`);
                          
                          // 如果当前日期已经超过目标日期，则使用明年的日期
                          const finalDate = now.isAfter(targetDate) 
                            ? dayjs(`${currentYear + 1}-${selectedDate}`)
                            : targetDate;
                          
                          form.setFieldsValue({ gkccyStudyEndDate: finalDate });
                        }}
                      >
                        <Radio.Button value="01-04">1月4号</Radio.Button>
                        <Radio.Button value="06-04">6月4号</Radio.Button>
                      </Radio.Group>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row gutter={[16, 24]}>
                 <Col {...responsiveLayout}>
                  <Form.Item label="课时费" style={{ marginBottom: 0 }}>
                    <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="gkccyHourlyFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!gkccyHourlyFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ gkccyHourlyFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                        <Form.Item name="gkccyHourlyfee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                <Col {...responsiveLayout}>
                  <Form.Item label="资料费" style={{ marginBottom: 0 }}>
                     <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="gkccyMaterialFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!gkccyMaterialFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ gkccyMaterialFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                        <Form.Item name="gkccyMaterialFee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                 <Col {...responsiveLayout}>
                  <Form.Item label="平板费" style={{ marginBottom: 0 }}>
                     <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="gkccyPadFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!gkccyPadFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ gkccyPadFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                         <Form.Item name="gkccyPadFee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                 <Col {...responsiveLayout}>
                  <Form.Item label="保险费" style={{ marginBottom: 0 }}>
                     <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="gkccyInsuranceFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!gkccyInsuranceFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ gkccyInsuranceFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                        <Form.Item name="gkccyInsuranceFee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '0.533rem' }}>
                <Col span={12}>
                  <Form.Item label="合计费用（大写）" name="gkccyTotalFeeChinese">
                    <Input 
                      placeholder="例：壹万贰佰佰拾元整 或 10000" 
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value && /^\d+(\.\d{1,2})?$/.test(value)) {
                          const chinese = numberToChinese(value);
                          if (chinese) {
                            form.setFieldsValue({ gkccyTotalFeeChinese: chinese });
                          }
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="合计费用（小写）" name="gkccyTotalFee">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      placeholder="例：10000"
                      min={0}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  {(() => {
                    const fees = [
                      gkccyHourlyFeeChecked ? (gkccyHourlyfee || 0) : 0,
                      gkccyMaterialFeeChecked ? (gkccyMaterialFee || 0) : 0,
                      gkccyPadFeeChecked ? (gkccyPadFee || 0) : 0,
                      gkccyInsuranceFeeChecked ? (gkccyInsuranceFee || 0) : 0,
                    ];
                    const total = fees.reduce((sum, fee) => sum + Number(fee), 0);
                    return total > 0 ? (
                      <div style={{ marginTop: '-0.4rem', marginBottom: '0.533rem', fontSize: '0.48rem', fontWeight: 'bold', color: '#ff4d4f' }}>
                        核对金额：¥{total.toFixed(2)}
                      </div>
                    ) : null;
                  })()}
                </Col>
              </Row>
            </div>
          )}
        </div>

        {/* 6. 直通车 */}
        <div className="form-section-card">
           <div className="section-title" style={{ padding: '0.533rem 0.667rem 0.4rem', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CrownOutlined className="section-icon" />
              <span>{titlePrefix}直通车</span>
            </div>
            <Form.Item name="isZtc" valuePropName="checked" noStyle>
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
          </div>
          {isZtc && (
            <div className="ant-card-body">
              <Row gutter={[16, 24]}>
                <Col span={24}>
                  <Form.Item label="类型" name="ztcTypeRadioButton">
                    <Radio.Group>
                      <Radio value="联考直通车">联考直通车</Radio>
                      <Radio value="校考直通车">校考直通车</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col {...responsiveLayout}>
                  <Form.Item label="开始日期" name="ztcStudyStartDate">
                    <DatePicker style={{ width: '100%' }} placeholder="请选择开始日期" />
                  </Form.Item>
                </Col>
                <Col {...responsiveLayout}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <Form.Item label="结束日期" name="ztcStudyEndDate" style={{ flex: 1, marginBottom: 0 }}>
                      <DatePicker style={{ width: '100%' }} placeholder="请选择结束日期" />
                    </Form.Item>
                    <div style={{ paddingTop: '30px' }}>
                      <Radio.Group 
                        size="small"
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const now = dayjs();
                          const currentYear = now.year();
                          const targetDate = dayjs(`${currentYear}-${selectedDate}`);
                          
                          // 如果当前日期已经超过目标日期，则使用明年的日期
                          const finalDate = now.isAfter(targetDate) 
                            ? dayjs(`${currentYear + 1}-${selectedDate}`)
                            : targetDate;
                          
                          form.setFieldsValue({ ztcStudyEndDate: finalDate });
                        }}
                      >
                        <Radio.Button value="01-04">1月4号</Radio.Button>
                        <Radio.Button value="06-04">6月4号</Radio.Button>
                      </Radio.Group>
                    </div>
                  </div>
                </Col>
              </Row>
               <Row gutter={[16, 24]}>
                 <Col {...responsiveLayout}>
                  <Form.Item label="课时费" style={{ marginBottom: 0 }}>
                    <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="ztcHourlyFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!ztcHourlyFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ ztcHourlyFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                        <Form.Item name="ztcHourlyfee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                 <Col {...responsiveLayout}>
                  <Form.Item label="资料费" style={{ marginBottom: 0 }}>
                     <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="ztcMaterialFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!ztcMaterialFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ ztcMaterialFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                        <Form.Item name="ztcMaterialFee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                 <Col {...responsiveLayout}>
                  <Form.Item label="平板费" style={{ marginBottom: 0 }}>
                     <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="ztcPadFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!ztcPadFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ ztcPadFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                         <Form.Item name="ztcPadFee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                 <Col {...responsiveLayout}>
                  <Form.Item label="保险费" style={{ marginBottom: 0 }}>
                     <Row gutter={8}>
                      <Col span={4}>
                        <Form.Item 
                          name="ztcInsuranceFeeChecked" 
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox 
                            checked={!!ztcInsuranceFeeChecked} 
                            onChange={(e) => form.setFieldsValue({ ztcInsuranceFeeChecked: e.target.checked })}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={20}>
                        <Form.Item name="ztcInsuranceFee" noStyle>
                          <InputNumber 
                            style={{ width: '100%' }} 
                            placeholder="金额" 
                            min={0}
                            max={9999999999999}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
               <Row gutter={16} style={{ marginTop: '0.533rem' }}>
                <Col span={12}>
                  <Form.Item label="合计费用（大写）" name="ztcTotalFeeChinese">
                    <Input 
                      placeholder="例：壹万贰佰佰拾元整 或 10000" 
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value && /^\d+(\.\d{1,2})?$/.test(value)) {
                          const chinese = numberToChinese(value);
                          if (chinese) {
                            form.setFieldsValue({ ztcTotalFeeChinese: chinese });
                          }
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="合计费用（小写）" name="ztcTotalFee">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      placeholder="例：10000"
                      min={0}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  {(() => {
                    const fees = [
                      ztcHourlyFeeChecked ? (ztcHourlyfee || 0) : 0,
                      ztcMaterialFeeChecked ? (ztcMaterialFee || 0) : 0,
                      ztcPadFeeChecked ? (ztcPadFee || 0) : 0,
                      ztcInsuranceFeeChecked ? (ztcInsuranceFee || 0) : 0,
                    ];
                    const total = fees.reduce((sum, fee) => sum + Number(fee), 0);
                    return total > 0 ? (
                      <div style={{ marginTop: '-0.4rem', marginBottom: '0.533rem', fontSize: '0.48rem', fontWeight: 'bold', color: '#ff4d4f' }}>
                        核对金额：¥{total.toFixed(2)}
                      </div>
                    ) : null;
                  })()}
                </Col>
              </Row>
            </div>
          )}
        </div>

        {/* 7. 支付与签订信息 */}
        <div className="form-section-card">
          <div className="section-title" style={{ padding: '0.533rem 0.667rem 0.4rem' }}>
            <PayCircleOutlined className="section-icon" />
            <span>支付与签订信息</span>
          </div>
          <div className="ant-card-body">
            <Row gutter={[16, 24]}>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="首期支付日期" 
                  name="payDate1"
                  rules={[{ required: true, message: '请选择首期支付日期' }]}
                >
                   <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="首期金额（大写）" 
                  name="payFeeChinese1"
                  rules={[{ required: true, message: '请输入首期金额' }]}
                >
                  <Input 
                    placeholder="例：壹万贰佰佰拾元整 或 10000" 
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      // 如果输入的是数字，自动转换为大写
                      if (value && /^\d+(\.\d{1,2})?$/.test(value)) {
                        const chinese = numberToChinese(value);
                        if (chinese) {
                          form.setFieldsValue({ payFeeChinese1: chinese });
                        }
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="二期支付日期" 
                  name="payDate2"
                  rules={[{ required: true, message: '请选择二期支付日期' }]}
                >
                   <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="二期金额（大写）" 
                  name="payFeeChinese2"
                  rules={[{ required: true, message: '请输入二期金额' }]}
                >
                  <Input 
                    placeholder="例：壹万贰佰佰拾元整 或 10000" 
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (value && /^\d+(\.\d{1,2})?$/.test(value)) {
                        const chinese = numberToChinese(value);
                        if (chinese) {
                          form.setFieldsValue({ payFeeChinese2: chinese });
                        }
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="支付渠道" 
                  name="payChannel"
                  rules={[{ required: true, message: '请选择支付渠道' }]}
                >
                  <Select placeholder="请选择">
                    <Select.Option value="银行卡">银行卡</Select.Option>
                    <Select.Option value="其他">其他</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              {payChannel === '其他' && (
                <Col {...responsiveLayout}>
                  <Form.Item 
                    label="其他渠道说明" 
                    name="otherPayChannel"
                    rules={[{ required: true, message: '请输入其他渠道说明' }]}
                  >
                    <Input placeholder="请输入说明" />
                  </Form.Item>
                </Col>
              )}
              <Col {...responsiveLayout}>
                <Form.Item 
                  label="签订日期" 
                  name="signDate1"
                  rules={[{ required: true, message: '请选择签订日期' }]}
                >
                   <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </div>
      </Form>

      {/* 底部按钮 - 只读模式下不显示 */}
      {!isViewOnly && (
        <div className="footer-actions">
          <Button 
            size="large"
            icon={<EyeOutlined />}
            loading={previewLoading}
            onClick={handlePreview}
          >
            预览合同
          </Button>
          <Button 
            size="large"
            loading={saveDraftLoading}
            onClick={handleSaveDraft}
          >
            保存草稿
          </Button>
          <Button 
            type="primary" 
            size="large"
            loading={loading}
            onClick={handleSubmit}
          >
            提交合同
          </Button>
        </div>
      )}
    </div>
  );
};

export default DetailInfoForm;
