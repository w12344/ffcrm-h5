import React from 'react';
import { Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface BasicInfo {
  contractTitle?: string;
  signerName?: string;
  signerMobile?: string;
  signerIdCard?: string;
}

interface BasicInfoDisplayProps {
  basicInfo: BasicInfo;
}

/**
 * 合同基本信息展示区域
 */
const BasicInfoDisplay: React.FC<BasicInfoDisplayProps> = ({ basicInfo }) => {
  return (
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
  );
};

export default BasicInfoDisplay;
