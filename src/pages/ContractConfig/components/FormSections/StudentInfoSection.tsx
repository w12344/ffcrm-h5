import React from 'react';
import { Form, Input, Select, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface StudentInfoSectionProps {
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
 * 学生信息表单区域
 */
const StudentInfoSection: React.FC<StudentInfoSectionProps> = ({
  isHqMb = false,
  responsiveLayout = { xs: 24, sm: 12, md: 8 },
}) => {
  return (
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

          {isHqMb ? (
            // 服务学校模板：只保留身份证号
            <>
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
            </>
          ) : (
            // 冲刺营/私塾模板：身份证号 + 电话 + 学校 + 年级
            <>
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
            </>
          )}
        </Row>
      </div>
    </div>
  );
};

export default StudentInfoSection;
