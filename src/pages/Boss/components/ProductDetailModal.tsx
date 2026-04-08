import React from 'react';
import { Row, Col, Statistic, Progress } from 'antd';
import PremiumModal from '@/components/PremiumModal';
import './ProductDetailModal.less';

interface ProductDetailModalProps {
  visible: boolean;
  onClose: () => void;
  product: any;
  themeClass: string;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ visible, onClose, product, themeClass }) => {
  if (!product) return null;

  return (
    <PremiumModal
      visible={visible}
      onClose={onClose}
      title={`${product.name} - 专项经营分析`}
      subtitle="SPECIALIZED PRODUCT OPERATION ANALYSIS"
      themeMode={themeClass === 'dark-theme' ? 'dark' : 'light'}
      width={800}
    >
      <div className="product-detail-container">
        {/* Top Summary */}
        <div className="summary-section">
          <Row gutter={16}>
            <Col span={8}>
              <div className="summary-card">
                <Statistic
                  title="净招生人数"
                  value={product.netCount}
                  suffix={`/ ${product.depositCount}`}
                  valueStyle={{ color: 'var(--color-purple-primary, #7c3aed)' }}
                />
                <div className="progress-bar">
                  <Progress percent={Math.round((product.netCount / product.depositCount) * 100)} size="small" strokeColor="var(--color-purple-primary, #7c3aed)" />
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="summary-card">
                <Statistic
                  title="实际落袋营收"
                  value={product.amount / 10000}
                  precision={1}
                  suffix="万"
                  valueStyle={{ color: '#eb2f96' }}
                />
              </div>
            </Col>
            <Col span={8}>
              <div className="summary-card">
                <Statistic
                  title="实际入学人数"
                  value={product.actualEnrollment}
                  suffix="人"
                  valueStyle={{ color: '#52c41a' }}
                />
                 <div className="progress-bar">
                  <Progress percent={Math.round((product.actualEnrollment / product.netCount) * 100)} size="small" strokeColor="#52c41a" />
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Regional Breakdown */}
        <div className="regional-breakdown">
          <h3 className="section-subtitle">战区核算明细</h3>
          <div className="regional-cards">
            {product.regionalData.map((rd: any, idx: number) => (
              <div key={idx} className="regional-card">
                <div className="rc-header">
                  <div className="rc-title">{rd.region}战区</div>
                </div>
                <div className="rc-grid">
                  <div className="rc-stat">
                    <span className="label">交定金</span>
                    <span className="val">{rd.deposit}</span>
                  </div>
                  <div className="rc-stat">
                    <span className="label">退费流失</span>
                    <span className="val red">-{rd.refund}</span>
                  </div>
                  <div className="rc-stat">
                    <span className="label">实际入学</span>
                    <span className="val green">{rd.actual}</span>
                  </div>
                  <div className="rc-stat">
                    <span className="label">退学人数</span>
                    <span className="val red">-{rd.dropout}</span>
                  </div>
                  <div className="rc-stat">
                    <span className="label">净招生</span>
                    <span className="val highlight">{rd.deposit - rd.refund}</span>
                  </div>
                  <div className="rc-stat" style={{ gridColumn: 'span 2' }}>
                    <span className="label">实际营收</span>
                    <span className="val highlight-money">{(rd.amount / 10000).toFixed(1)}w</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PremiumModal>
  );
};

export default ProductDetailModal;
