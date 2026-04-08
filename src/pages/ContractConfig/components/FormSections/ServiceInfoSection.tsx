import React from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Radio, Row, Col } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface ServiceInfoSectionProps {
  /** 响应式布局配置 */
  responsiveLayout?: {
    xs: number;
    sm: number;
    md: number;
  };
}

/**
 * 服务信息表单区域（仅用于服务学校模板）
 */
const ServiceInfoSection: React.FC<ServiceInfoSectionProps> = ({
  responsiveLayout = { xs: 24, sm: 12, md: 8 },
}) => {
  // 监听支付渠道变化
  const payChannel = Form.useWatch('payChannel');
  const form = Form.useFormInstance();
  return (
    <div className="form-section-card">
      <div className="section-title" style={{ padding: '0.533rem 0.667rem 0.4rem' }}>
        <BookOutlined className="section-icon" />
        <span>服务信息</span>
      </div>
      <div className="ant-card-body">
        <Row gutter={[16, 24]}>
          <Col {...responsiveLayout}>
            <Form.Item 
              label="服务项目" 
              name="serviceProject"
              rules={[{ required: true, message: '请选择服务项目' }]}
            >
              <Select placeholder="请选择服务项目">
                <Select.Option value="冲刺班">冲刺班</Select.Option>
                <Select.Option value="私塾班">私塾班</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col {...responsiveLayout}>
            <Form.Item 
              label="服务金额" 
              name="serviceAmount"
              rules={[{ required: true, message: '请输入服务金额' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入服务金额"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>

          <Col {...responsiveLayout}>
            <Form.Item 
              label="服务开始日期" 
              name="serviceStartDate"
              rules={[{ required: true, message: '请选择服务开始日期' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="请选择开始日期"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          
          <Col {...responsiveLayout}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Form.Item 
                label="服务结束日期" 
                name="serviceEndDate"
                rules={[{ required: true, message: '请选择服务结束日期' }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="请选择结束日期"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '30px' }}>
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
                    
                    form.setFieldsValue({ serviceEndDate: finalDate });
                  }}
                >
                  <Radio.Button value="01-04">1月4号</Radio.Button>
                  <Radio.Button value="06-04">6月4号</Radio.Button>
                </Radio.Group>
              </div>
            </div>
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
              label="每日住宿费用" 
              name="dailyAccommodationFee"
              rules={[{ required: true, message: '请输入每日住宿费用' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="请输入费用"
                min={0}
                precision={2}
              />
            </Form.Item>
          </Col>
          
          <Col {...responsiveLayout}>
            <Form.Item 
              label="签署日期1" 
              name="signDate1"
              rules={[{ required: true, message: '请选择签署日期' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="请选择签署日期"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          
          <Col {...responsiveLayout}>
            <Form.Item 
              label="签署日期2" 
              name="signDate2"
              rules={[{ required: true, message: '请选择签署日期' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="请选择签署日期"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ServiceInfoSection;
