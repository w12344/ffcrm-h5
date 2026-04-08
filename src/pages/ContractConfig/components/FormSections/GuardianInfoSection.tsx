import React from 'react';
import { Form, Input, Row, Col } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

interface GuardianInfoSectionProps {
  /** 是否为服务学校模板 */
  isHqMb?: boolean;
  /** 响应式布局配置 */
  responsiveLayout?: {
    xs: number;
    sm: number;
    md: number;
  };
}

/**
 * 监护人信息表单区域
 */
const GuardianInfoSection: React.FC<GuardianInfoSectionProps> = ({
  isHqMb = false,
  responsiveLayout = { xs: 24, sm: 12, md: 8 },
}) => {
  return (
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

          {isHqMb && (
            <Col span={24}>
              <Form.Item 
                label="联系地址" 
                name="address"
                rules={[{ required: true, message: '请输入联系地址' }]}
              >
                <Input placeholder="请输入联系地址" />
              </Form.Item>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default GuardianInfoSection;
