import React, { useEffect } from "react";
import {
  Button,
  message,
  ConfigProvider,
  Empty,
  Grid,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  InboxOutlined,
  DollarOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import zhCN from "antd/locale/zh_CN";
import { Layout } from "@/components/Layout";
import SafeTable from "@/components/SafeTable";
import { useTheme } from "@/hooks/useTheme";
import { ContractProfileGroup } from "@/services/contract";
import AddContractModal from "./components/AddContractModal";
import PaymentRecordsModal from "./components/PaymentRecordsModal";
import PaymentCollectionModal from "./components/PaymentCollectionModal";
import RefundModal from "./components/RefundModal";
import ContractManagement from "./components/ContractManagement";
import QuickPaymentModal from "./components/QuickPaymentModal";
import { FilterSection } from "./components/FilterSection";
import { StatSection } from "./components/StatSection";
import { MobileCardList } from "./components/MobileCardList";
import { useContractData } from "./hooks/useContractData";
import { useModalManager } from "./hooks/useModalManager";
import { getExpandedColumns, getMainColumns } from "./tableColumns";
import { generateCustomerProfileUrl } from "./utils";
import { TAB_KEYS } from "./constants";
import { smartNavigate } from "@/utils/url";
import "./index.less";
import "./components/AddContractModal.less";

const { useBreakpoint } = Grid;

const ContractOrder: React.FC = () => {
  const { isDark } = useTheme();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [activeTab, setActiveTab] = React.useState(TAB_KEYS.DEALS);

  // 使用自定义 hooks
  const contractData = useContractData();
  const modalManager = useModalManager();

  // 处理客户档案跳转
  const handleOpenCustomerProfile = (customerProfileId: number) => {
    const url = generateCustomerProfileUrl(customerProfileId);
    smartNavigate(url);
  };

  // 初始加载产品列表
  useEffect(() => {
    contractData.loadGoodsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 初始加载和分页变化时重新加载
  useEffect(() => {
    contractData.refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractData.pageNumber, contractData.pageSize]);

  // 处理搜索
  const handleSearch = () => {
    contractData.resetToFirstPage();
  };

  // 处理重置
  const handleReset = () => {
    contractData.resetFilters();
    contractData.resetToFirstPage();
  };

  // 处理添加成单成功
  const handleAddSuccess = () => {
    modalManager.setAddModalVisible(false);
    contractData.resetToFirstPage();
  };

  // 处理退款成功
  const handleRefundSuccess = () => {
    modalManager.closeRefundModal();
    contractData.refreshData();
  };

  // 处理回款成功
  const handlePaymentCollectionSuccess = () => {
    modalManager.closePaymentCollectionModal();
    contractData.refreshData();
  };

  // 处理快速回款成功
  const handleQuickPaymentSuccess = () => {
    modalManager.setQuickPaymentModalVisible(false);
    message.success("回款成功");
    contractData.refreshData();
  };

  // 获取表格列定义
  const expandedColumns = getExpandedColumns({
    onOpenPaymentRecords: modalManager.openPaymentRecordsModal,
    onOpenPaymentCollection: modalManager.openPaymentCollectionModal,
    onOpenRefund: modalManager.openRefundModal,
  });

  const columns = getMainColumns({
    onOpenCustomerProfile: handleOpenCustomerProfile,
  });

  return (
    <ConfigProvider locale={zhCN}>
      <Layout>
        <div
          className={`contract-order-page ${
            isDark ? "dark-theme" : "light-theme"
          }`}
        >
          <div className="page-header">
            <h1>成交报单</h1>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as typeof TAB_KEYS.DEALS)}
            className="contract-tabs"
            items={[
              {
                key: "deals",
                label: "成交报单",
                children: (
                  <>
                    {/* 筛选区域 */}
                    <FilterSection
                      filters={contractData.filters}
                      selectedGoods={contractData.selectedGoods}
                      dateRange={contractData.dateRange}
                      goodsList={contractData.goodsList}
                      goodsLoading={contractData.goodsLoading}
                      onFiltersChange={contractData.setFilters}
                      onGoodsChange={contractData.setSelectedGoods}
                      onDateRangeChange={contractData.setDateRange}
                      onSearch={handleSearch}
                      onReset={handleReset}
                    />

          {/* 统计区域 */}
          <StatSection
            statData={contractData.statData}
            statLoading={contractData.statLoading}
          />

          {/* 表格区域 */}
          <div className="table-section">
            <div className="table-header">
              <Button
                icon={<MoneyCollectOutlined />}
                onClick={() => modalManager.setQuickPaymentModalVisible(true)}
              >
                回款
              </Button>
              <Button
                icon={<DollarOutlined />}
                onClick={() => {
                  // 如果有数据，默认打开第一个档案的钱款记录
                  if (contractData.dataSource.length > 0) {
                    modalManager.openProfilePaymentRecordsModal(
                      contractData.dataSource[0].customerProfileId
                    );
                  } else {
                    message.warning("暂无档案数据");
                  }
                }}
              >
                钱款记录
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => modalManager.setAddModalVisible(true)}
              >
                添加成交单
              </Button>
            </div>
            <SafeTable
              columns={columns}
              dataSource={contractData.dataSource}
              rowKey="customerProfileId"
              loading={contractData.loading}
              expandable={{
                expandedRowRender: (record: ContractProfileGroup) => (
                  <SafeTable
                    columns={expandedColumns}
                    dataSource={record.contracts}
                    rowKey="id"
                    className="child-table"
                    pagination={false}
                    showHeader={true}
                    size="small"
                    scroll={{ x: 1300 }}
                  />
                ),
                rowExpandable: (record: ContractProfileGroup) => record.contracts.length > 0,
                expandIcon: ({ expanded, onExpand, record }) => (
                  <div
                    className="custom-expand-icon"
                    onClick={(e) => onExpand(record, e)}
                  >
                    {expanded ? <MinusOutlined /> : <PlusOutlined />}
                  </div>
                ),
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={
                      <InboxOutlined
                        style={{ fontSize: 64, color: "var(--text-disabled)" }}
                      />
                    }
                    description={
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.373rem",
                        }}
                      >
                        暂无成交报单数据
                      </span>
                    }
                  />
                ),
              }}
              pagination={{
                current: contractData.pageNumber,
                pageSize: contractData.pageSize,
                total: contractData.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, size) => {
                  contractData.setPageNumber(page);
                  contractData.setPageSize(size);
                },
              }}
              scroll={{ x: 700 }}
            />

            {/* 移动端卡片列表 - 只在移动端显示 */}
            {isMobile && (
              <div className="mobile-card-list">
                <MobileCardList
                  loading={contractData.loading}
                  dataSource={contractData.dataSource}
                  total={contractData.total}
                  pageNumber={contractData.pageNumber}
                  pageSize={contractData.pageSize}
                  onPageChange={(page, size) => {
                    contractData.setPageNumber(page);
                    contractData.setPageSize(size);
                  }}
                  onOpenCustomerProfile={handleOpenCustomerProfile}
                  onOpenPaymentRecords={modalManager.openPaymentRecordsModal}
                  onOpenPaymentCollection={modalManager.openPaymentCollectionModal}
                  onOpenRefund={modalManager.openRefundModal}
                />
              </div>
            )}
                    </div>
                  </>
                ),
              },
              {
                key: "contracts",
                label: "合同管理",
                children: <ContractManagement />,
              },
            ]}
          />

          {/* 添加成单弹窗 */}
          <AddContractModal
            visible={modalManager.addModalVisible}
            onCancel={() => modalManager.setAddModalVisible(false)}
            onSuccess={handleAddSuccess}
          />

          {/* 钱款记录弹窗 */}
          <PaymentRecordsModal
            visible={modalManager.paymentRecordsModal.visible}
            contractId={modalManager.paymentRecordsModal.contractId}
            customerProfileId={modalManager.paymentRecordsModal.customerProfileId}
            initialProfileId={modalManager.paymentRecordsModal.initialProfileId}
            initialContractId={modalManager.paymentRecordsModal.initialContractId}
            mode={modalManager.paymentRecordsModal.customerProfileId && !modalManager.paymentRecordsModal.initialContractId ? 'full' : 'simple'}
            onCancel={modalManager.closePaymentRecordsModal}
          />

          {/* 回款弹窗 */}
          <PaymentCollectionModal
            visible={modalManager.paymentCollectionModal.visible}
            contractId={modalManager.paymentCollectionModal.contractId}
            profileName={modalManager.paymentCollectionModal.profileName}
            goods={modalManager.paymentCollectionModal.goods}
            onCancel={modalManager.closePaymentCollectionModal}
            onSuccess={handlePaymentCollectionSuccess}
          />

          {/* 快速回款弹窗 */}
          <QuickPaymentModal
            visible={modalManager.quickPaymentModalVisible}
            onCancel={() => modalManager.setQuickPaymentModalVisible(false)}
            onSuccess={handleQuickPaymentSuccess}
          />

          {/* 退款弹窗 */}
          <RefundModal
            visible={modalManager.refundModal.visible}
            contractId={modalManager.refundModal.contractId}
            orderCash={modalManager.refundModal.orderCash}
            profileName={modalManager.refundModal.profileName}
            goods={modalManager.refundModal.goods}
            studentName={modalManager.refundModal.studentName}
            onCancel={modalManager.closeRefundModal}
            onSuccess={handleRefundSuccess}
          />
        </div>
      </Layout>
    </ConfigProvider>
  );
};

export default ContractOrder;
