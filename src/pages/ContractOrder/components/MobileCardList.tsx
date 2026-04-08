/**
 * 移动端卡片列表组件
 */
import React from "react";
import { Pagination } from "antd";
import {
  InboxOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ContractProfileGroup, ContractItem } from "@/services/contract";

interface MobileCardListProps {
  loading: boolean;
  dataSource: ContractProfileGroup[];
  total: number;
  pageNumber: number;
  pageSize: number;
  onPageChange: (page: number, size: number) => void;
  onOpenCustomerProfile: (customerProfileId: number) => void;
  onOpenPaymentRecords: (contractId: number, profileId: number) => void;
  onOpenPaymentCollection: (contractId: number, profileName: string, goods: string) => void;
  onOpenRefund: (contract: ContractItem) => void;
}

export const MobileCardList: React.FC<MobileCardListProps> = ({
  loading,
  dataSource,
  total,
  pageNumber,
  pageSize,
  onPageChange,
  onOpenCustomerProfile,
  onOpenPaymentRecords,
  onOpenPaymentCollection,
  onOpenRefund,
}) => {
  if (loading) {
    return <div className="empty-state">加载中...</div>;
  }

  if (dataSource.length === 0) {
    return (
      <div className="empty-state">
        <InboxOutlined style={{ fontSize: 48, color: "var(--text-disabled)", marginBottom: 16 }} />
        <div>暂无成交报单数据</div>
      </div>
    );
  }

  return (
    <>
      {dataSource.map((group) => (
        <div key={group.customerProfileId} className="profile-group-card">
          {/* 档案头部 */}
          <div className="profile-header">
            <div className="profile-info">
              <div className="profile-name">{group.profileName}</div>
              <div className="profile-student">
                学生：
                <span
                  className="name-link"
                  onClick={() => onOpenCustomerProfile(group.customerProfileId)}
                >
                  {group.contracts[0]?.studentName}
                </span>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">总收款：</span>
                <span className="stat-value money">
                  ¥{group.totalOrderCash?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">总退费：</span>
                <span className="stat-value refund">
                  ¥{group.totalRefundCash?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
          </div>

          {/* 合同列表 */}
          <div className="contracts-list">
            {group.contracts.map((contract) => (
              <div key={contract.id} className="contract-card">
                <div className="card-header">
                  <div className="card-title">
                    <div className="product-name">{contract.goods}</div>
                  </div>
                  <div className="card-actions">
                    <div
                      className="action-btn payment-btn"
                      onClick={() =>
                        onOpenPaymentRecords(contract.id, group.customerProfileId)
                      }
                      title="付款记录"
                    >
                      <FileTextOutlined />
                    </div>
                    <div
                      className="action-btn collection-btn"
                      onClick={() =>
                        onOpenPaymentCollection(contract.id, group.profileName, contract.goods)
                      }
                      title="回款"
                    >
                      <MoneyCollectOutlined />
                    </div>
                    <div
                      className="action-btn refund-btn"
                      onClick={() => onOpenRefund(contract)}
                      title="退款"
                    >
                      <RollbackOutlined />
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-row">
                    <span className="label">实收金额：</span>
                    <span className="value money">
                      ¥{contract.orderCash?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="card-row">
                    <span className="label">退费金额：</span>
                    <span className="value refund">
                      ¥{contract.refundCash?.toLocaleString() || "0"}
                    </span>
                  </div>
                  {contract.remark && (
                    <div className="card-row">
                      <span className="label">备注：</span>
                      <span className="value">{contract.remark}</span>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <span className="date-info">
                    {dayjs(contract.orderDate).format("YYYY-MM-DD")}
                  </span>
                  <span className="goods-tag">{contract.goods}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 移动端分页 */}
      {!loading && dataSource.length > 0 && (
        <Pagination
          current={pageNumber}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger={false}
          className="mobile-pagination"
        />
      )}
    </>
  );
};
