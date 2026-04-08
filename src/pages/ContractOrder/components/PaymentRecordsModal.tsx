import React, { useEffect, useState } from "react";
import { Table, Empty, message, Spin, Select, Image, Tag, Pagination, Input } from "antd";
import { InboxOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fetchPaymentRecordPage,
  fetchPaymentRecords,
  PaymentRecord,
  PaymentRecordQueryParams,
  fetchProfileProducts,
  ProfileProduct,
  fetchProfilesWithContracts,
  ProfileWithContract,
} from "@/services/contract";
import { useTheme } from "@/hooks/useTheme";
import TableFilter from "@/components/TableFilter";
import PremiumModal from "@/components/PremiumModal";
import "./PaymentRecordsModal.less";

interface PaymentRecordsModalProps {
  visible: boolean;
  contractId?: number | null;
  customerProfileId?: number | null;
  initialProfileId?: number | null;
  initialContractId?: number | null;
  mode?: 'full' | 'simple'; // full: 表格上方打开，显示所有筛选项; simple: 表格行内打开，只显示两个筛选项
  onCancel: () => void;
}

const PaymentRecordsModal: React.FC<PaymentRecordsModalProps> = ({
  visible,
  contractId,
  customerProfileId,
  initialProfileId,
  initialContractId,
  mode = 'simple',
  onCancel,
}) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [products, setProducts] = useState<ProfileProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<
    number | undefined
  >(undefined);
  const [productsLoading, setProductsLoading] = useState(false);
  const [profiles, setProfiles] = useState<ProfileWithContract[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<
    number | undefined
  >(undefined);
  const [profilesLoading, setProfilesLoading] = useState(false);

  // 分页和筛选状态
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [studentName, setStudentName] = useState<string>("");
  const [selectedGoods, setSelectedGoods] = useState<string | undefined>(undefined);
  const [approvalStatus, setApprovalStatus] = useState<number | undefined>(undefined);

  // 加载档案列表
  const loadProfiles = async () => {
    setProfilesLoading(true);
    try {
      const response = await fetchProfilesWithContracts();
      if (response.data?.code === 200 && response.data?.data) {
        setProfiles(response.data.data);
      } else {
        message.error(response.data?.message || "加载档案列表失败");
        setProfiles([]);
      }
    } catch (error) {
      console.error("加载档案列表失败:", error);
      message.error("加载档案列表失败");
      setProfiles([]);
    } finally {
      setProfilesLoading(false);
    }
  };

  // 加载档案产品列表
  const loadProfileProducts = async (profileId?: number) => {
    const idToUse = profileId || customerProfileId;
    if (!idToUse) return;

    setProductsLoading(true);
    try {
      const response = await fetchProfileProducts(idToUse);
      if (response.data?.code === 200 && response.data?.data) {
        setProducts(response.data.data);
        // 如果只有一个产品，自动选中
        if (response.data.data.length === 1) {
          setSelectedProductId(response.data.data[0].id);
        }
      } else {
        message.error(response.data?.message || "加载产品列表失败");
        setProducts([]);
      }
    } catch (error) {
      console.error("加载产品列表失败:", error);
      message.error("加载产品列表失败");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // 加载付款记录
  const loadPaymentRecords = async () => {
    setLoading(true);
    try {
      // simple模式：使用 fetchPaymentRecords 接口，传入 contractId
      if (mode === 'simple' && selectedProductId) {
        const response = await fetchPaymentRecords(selectedProductId);
        if (response.data?.code === 200 && response.data?.data) {
          setRecords(response.data.data);
          setTotal(response.data.data.length);
        } else {
          message.error(response.data?.message || "加载付款记录失败");
          setRecords([]);
          setTotal(0);
        }
      }
      // full模式：使用 fetchPaymentRecordPage 分页接口
      else if (mode === 'full') {
        const params: PaymentRecordQueryParams = {
          pageNumber,
          pageSize,
        };

        // 添加筛选条件
        if (selectedProductId) {
          params.contractId = selectedProductId;
        }
        if (selectedProfileId) {
          const profile = profiles.find(p => p.id === selectedProfileId);
          if (profile) {
            params.profileName = profile.profileName;
          }
        }
        if (studentName.trim()) {
          params.studentName = studentName.trim();
        }
        if (selectedGoods) {
          params.goods = selectedGoods;
        }
        if (approvalStatus !== undefined) {
          params.approvalStatus = approvalStatus;
        }

        const response = await fetchPaymentRecordPage(params);
        if (response.data?.code === 200 && response.data?.data) {
          setRecords(response.data.data.data);
          setTotal(response.data.data.total);
        } else {
          message.error(response.data?.message || "加载付款记录失败");
          setRecords([]);
          setTotal(0);
        }
      }
    } catch (error) {
      console.error("加载付款记录失败:", error);
      message.error("加载付款记录失败");
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 当弹窗打开时加载数据
  useEffect(() => {
    if (visible) {
      // 加载档案列表（用于下拉框显示）
      loadProfiles();

      setRecords([]);
      setPageNumber(1);
      setTotal(0);
      setStudentName("");
      setSelectedGoods(undefined);
      setApprovalStatus(undefined);

      // 从表格行内打开：有 initialProfileId 和 initialContractId，需要默认回显
      if (initialProfileId && initialContractId) {
        setSelectedProfileId(initialProfileId);
        // 产品会在 selectedProfileId 的 useEffect 中加载并设置
      }
      // 从表格上方打开：只有 customerProfileId，不设置默认选中
      else if (customerProfileId) {
        setSelectedProfileId(undefined);
        setSelectedProductId(undefined);
        // full模式下打开时自动加载一次全部数据
        if (mode === 'full') {
          setTimeout(() => loadPaymentRecords(), 100);
        } else {
          // simple模式加载该档案的产品列表
          loadProfileProducts();
        }
      }
      // 其他情况：清空选中状态
      else {
        setSelectedProfileId(undefined);
        setSelectedProductId(undefined);
      }
    } else {
      setRecords([]);
      setProducts([]);
      setSelectedProductId(undefined);
      setProfiles([]);
      setSelectedProfileId(undefined);
      setPageNumber(1);
      setTotal(0);
      setStudentName("");
      setSelectedGoods(undefined);
      setApprovalStatus(undefined);
    }
  }, [visible, contractId, customerProfileId, initialProfileId, initialContractId]);

  // 当选择档案时加载产品列表（仅simple模式）
  useEffect(() => {
    if (visible && mode === 'simple' && selectedProfileId) {
      loadProfileProducts(selectedProfileId);
      setRecords([]);
    }
  }, [selectedProfileId, mode]);

  // full模式下加载所有合同产品
  // useEffect(() => {
  //   if (visible && mode === 'full' && profiles.length > 0 && products.length === 0) {
  //     loadAllProducts();
  //   }
  // }, [profiles, mode, visible]);

  // 当产品列表加载完成后，如果有初始合同ID，设置选中
  useEffect(() => {
    if (visible && products.length > 0 && initialContractId && initialProfileId) {
      setSelectedProductId(initialContractId);
    }
  }, [products, visible, initialContractId, initialProfileId]);

  // 当分页或筛选条件变化时加载付款记录
  useEffect(() => {
    if (visible && mode === 'simple' && (selectedProductId || selectedProfileId)) {
      // simple模式：选择筛选项后自动加载
      loadPaymentRecords();
    }
  }, [pageNumber, pageSize, selectedProductId]);

  // full模式下分页变化时加载
  useEffect(() => {
    if (visible && mode === 'full') {
      // 分页变化时自动加载
      loadPaymentRecords();
    }
  }, [pageNumber, pageSize]);

  // 搜索按钮点击事件（仅full模式使用）
  const handleSearch = () => {
    setPageNumber(1);
    loadPaymentRecords();
  };

  // 重置按钮点击事件（仅full模式使用）
  const handleReset = () => {
    setSelectedProfileId(undefined);
    setSelectedProductId(undefined);
    setProducts([]);
    setStudentName("");
    setSelectedGoods(undefined);
    setApprovalStatus(undefined);
    setPageNumber(1);
    // 重置后重新加载数据
    loadPaymentRecords();
  };

  // 表格列定义
  const columns = [
    {
      title: "学生姓名",
      dataIndex: "studentName",
      key: "studentName",
      width: 100  ,
      ellipsis: true,
      render: (value: string | null) => value || "-",
    },
     {
      title: "档案名称",
      dataIndex: "profileName",
      key: "profileName",
      width: 100,
      ellipsis: true,
      render: (value: string | null) => value || "-",
    },
    {
      title: "项目",
      dataIndex: "paymentItems",
      key: "paymentItems",
      width: 200,
      render: (items: PaymentRecord["paymentItems"]) => {
        if (!items || items.length === 0) return "-";
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.133rem",
            }}
          >
            {items.map((item, index) => (
              <div key={index} style={{ fontSize: "0.32rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>
                  {item.paymentItem}：
                </span>
                <span
                  style={{ color: "var(--color-success)", fontWeight: 500 }}
                >
                  ¥
                  {item.amount?.toLocaleString("zh-CN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "类型",
      dataIndex: "paymentTypeDesc",
      key: "paymentTypeDesc",
      width: 100,
      render: (value: string, record: PaymentRecord) => (
        <span
          style={{
            color:
              record.paymentType === 1
                ? "var(--color-success)"
                : "var(--color-error)",
            fontWeight: 600,
          }}
        >
          {value}
        </span>
      ),
    },
    {
      title: "金额",
      dataIndex: "paymentAmount",
      key: "paymentAmount",
      width: 120,
      render: (value: number) => (
        <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
          ¥
          {value?.toLocaleString("zh-CN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"}
        </span>
      ),
    },

    {
      title: "付款截图",
      dataIndex: "screenShotPaths",
      key: "screenShotPaths",
      width: 120,
      render: (paths: string[]) => {
        if (!paths || paths.length === 0) return "-";
        return (
          <Image.PreviewGroup>
            <div style={{ display: "flex", gap: "0.133rem", flexWrap: "wrap" }}>
              {paths.slice(0, 3).map((path, index) => (
                <Image
                  key={index}
                  src={path}
                  alt={`截图${index + 1}`}
                  style={{
                    width: "0.8rem",
                    height: "0.8rem",
                    objectFit: "cover",
                    borderRadius: "0.107rem",
                    cursor: "pointer",
                  }}
                />
              ))}
              {paths.length > 3 && (
                <div
                  style={{
                    width: "0.8rem",
                    height: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                    borderRadius: "0.107rem",
                    fontSize: "0.32rem",
                    color: isDark
                      ? "rgba(255, 255, 255, 0.65)"
                      : "rgba(0, 0, 0, 0.65)",
                  }}
                >
                  +{paths.length - 3}
                </div>
              )}
            </div>
          </Image.PreviewGroup>
        );
      },
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      width: 150,
      ellipsis: true,
      render: (value: string | null) => value || "-",
    },
    {
      title: "审批状态",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      width: 100,
      render: (value: number | string) => {
        if (!value) return "-";

        const statusConfig: Record<string | number, { color: string; text: string }> = {
          1: { color: "processing", text: "审批中" },
          2: { color: "error", text: "退回" },
          3: { color: "success", text: "通过" }
        };

        const config = statusConfig[value] || { color: "default", text: String(value) };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "录入时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (value: string) =>
        value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
  ];

  return (
    <PremiumModal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.267rem" }}>
          <DollarOutlined style={{ color: "var(--color-purple-primary)" }} />
          <span>钱款记录</span>
        </div>
      }
      visible={visible}
      onClose={onCancel}
      width={1200}
      destroyOnClose
      className="payment-records-modal"
    >
      <Spin spinning={loading || productsLoading || profilesLoading}>
        {/* 筛选区域 */}
        <TableFilter
          compact
          onSearch={handleSearch}
          onReset={handleReset}
          showSearch={mode === 'full'}
          showReset={mode === 'full'}
        >
          <Select
            placeholder="请选择档案"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            value={selectedProfileId}
            onChange={(value) => {
              setSelectedProfileId(value);
              setSelectedProductId(undefined);
              setProducts([]);
              // full模式下切换档案时加载该档案的所有合同产品
              if (mode === 'full' && value) {
                loadProfileProducts(value);
              }
            }}
            loading={profilesLoading}
            disabled={mode === 'simple'}
            style={{ width: 150 }}
            options={profiles.map((profile, index) => ({
              key: `profile-${profile.id}-${index}`,
              value: profile.id,
              label: profile.profileName,
            }))}
          />

          <Select
            placeholder="请选择产品"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            value={selectedProductId}
            onChange={setSelectedProductId}
            loading={productsLoading}
            disabled={mode === 'simple'}
            style={{ width: 150 }}
            options={products.map((product, index) => ({
              key: `product-${product.id}-${index}`,
              value: product.id,
              label: product.goods,
            }))}
          />

          {mode === 'full' && (
            <>
              <Input
                placeholder="请输入学生姓名"
                allowClear
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 150 }}
              />

              <Input
                placeholder="请输入产品名称"
                allowClear
                value={selectedGoods}
                onChange={(e) => setSelectedGoods(e.target.value || undefined)}
                onPressEnter={handleSearch}
                style={{ width: 200 }}
              />

              <Select
                placeholder="全部状态"
                allowClear
                value={approvalStatus}
                onChange={setApprovalStatus}
                style={{ width: 150 }}
                options={[
                  { value: 1, label: "审批中" },
                  { value: 2, label: "退回" },
                  { value: 3, label: "通过" },
                ]}
              />
            </>
          )}
        </TableFilter>

        {/* 付款记录表格 */}
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          pagination={false}
          scroll={{ x: 950, y: 400 }}
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
                    暂无付款记录
                  </span>
                }
              />
            ),
          }}
        />

        {/* 分页 - 仅full模式显示 */}
        {mode === 'full' && total > 0 && (
          <div style={{ marginTop: "0.4rem", display: "flex", justifyContent: "flex-end" }}>
            <Pagination
              current={pageNumber}
              pageSize={pageSize}
              total={total}
              onChange={(page, size) => {
                setPageNumber(page);
                setPageSize(size);
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </div>
        )}
      </Spin>
    </PremiumModal>
  );
};

export default PaymentRecordsModal;
