import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col } from 'antd';
import { UserOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import type { ContractBasicInfo } from '../types';
import SmartPasteButton from './SmartPasteButton';

interface BasicInfoFormProps {
  initialValues?: Partial<ContractBasicInfo>;
  templateName: string;
  onSubmit: (values: ContractBasicInfo) => void;
  onCancel: () => void;
  loading?: boolean;
  onValuesChange?: (values: Partial<ContractBasicInfo>) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  initialValues,
  templateName,
  onSubmit,
  onCancel,
  loading = false,
  onValuesChange,
}) => {
  const [form] = Form.useForm();

  // 当 initialValues 变化时更新表单字段（处理异步数据加载）
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // 设置合同标题默认值为模板名称
  useEffect(() => {
    if (templateName && !initialValues?.contractTitle) {
      form.setFieldsValue({
        contractTitle: templateName,
      });
    }
  }, [templateName, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  // 处理智能粘贴
  const handleSmartPaste = (data: Record<string, any>) => {
    form.setFieldsValue(data);
  };

  return (
    <div className="basic-info-form">
      {/* 模板信息提示 */}
      <Card className="template-info-card" bordered={false}>
        <div className="info-row">
          <span className="label">选择模板：</span>
          <span className="value">{templateName}</span>
        </div>
      </Card>

      {/* 基本信息表单 */}
      <Card 
        className="form-section-card" 
        title={
          <div className="section-title">
            <UserOutlined className="section-icon" />
            <span>合同基本信息</span>
          </div>
        }
        extra={<SmartPasteButton onPaste={handleSmartPaste} size="small" />}
        bordered={false}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onValuesChange={(_, allValues) => {
            onValuesChange?.(allValues);
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="合同标题"
                name="contractTitle"
                rules={[{ required: true, message: '请输入合同标题' }]}
              >
                <Input placeholder="请输入合同标题" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="签署人姓名"
                name="signerName"
                rules={[{ required: true, message: '请输入签署人姓名' }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="请输入签署人姓名" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="签署人手机号"
                name="signerMobile"
                rules={[
                  { required: true, message: '请输入签署人手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="请输入签署人手机号" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="签署人身份证号"
                name="signerIdCard"
                rules={[
                  { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号' }
                ]}
              >
                <Input 
                  prefix={<IdcardOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="请输入签署人身份证号" 
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 底部按钮 */}
      <div className="footer-actions footer-actions-centered">
        <Button size="large" onClick={onCancel}>
          取消
        </Button>
        <Button 
          type="primary" 
          size="large"
          loading={loading}
          onClick={handleSubmit}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoForm;
