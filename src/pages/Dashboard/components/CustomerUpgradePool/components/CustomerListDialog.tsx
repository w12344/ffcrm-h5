import React, { useState, useEffect } from "react";
import {
  Form,
  Empty,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  CustomerUpgradePoolItem,
  CustomerProfileListItem,
  CustomerProfileListQueryParams,
} from "@/services/databoard";
import { useCustomerProfileList } from "../../../hooks/useCustomerProfileList";
import { smartNavigate } from "@/utils/url";
import PremiumModal from "@/components/PremiumModal";
import GlassTable from "@/components/GlassTable";
import { GlassColumnType } from "@/components/GlassTable/types";
import "./CustomerListDialog.less";

interface CustomerListDialogProps {
  visible: boolean;
  onClose: () => void;
  customers?: CustomerUpgradePoolItem[]; // 兼容旧数据，可选
  loading?: boolean;
  onSearch?: (filters: FilterParams) => void;
  title?: string;
  themeMode?: "dark" | "light";
  useNewApi?: boolean; // 是否使用新接口
  isSelectable?: boolean; // 是否可选择（用于批量分配）
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: any[]) => void;
  onBatchDistribute?: (selectedRowKeys: React.Key[], selectedRows: any[]) => void; // 新增批量分配回调
}

interface FilterValues {
  remarkName?: string; // 更新为新接口的字段名
  level?: string;
  dateRange?: [Dayjs, Dayjs];
  objectionCategory?: string; // 更新为新接口的字段名
  fatScore?: number;
  ripeScore?: number;
}

export interface FilterParams {
  remarkName?: string; // 更新为新接口的字段名
  level?: string;
  dateRange?: [Date | null, Date | null];
  objectionCategory?: string; // 更新为新接口的字段名
  fatScore?: number;
  ripeScore?: number;
}

const CustomerListDialog: React.FC<CustomerListDialogProps> = ({
  visible,
  onClose,
  customers = [],
  loading = false,
  onSearch,
  title = "客户池&升级池",
  themeMode = "dark",
  useNewApi = true,
  isSelectable = false,
  onSelectionChange,
  onBatchDistribute,
}) => {
  const [form] = Form.useForm();
  const [filteredData, setFilteredData] = useState<
    (CustomerUpgradePoolItem | CustomerProfileListItem)[]
  >(customers || []);

  // 使用新接口的hook
  const {
    data: newApiData,
    loading: newApiLoading,
    refetch,
  } = useCustomerProfileList(isSelectable); // 如果是用来分配的选择模式，则启用Mock数据

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // 当customers变化时更新filteredData（兼容旧接口）
  useEffect(() => {
    if (!useNewApi) {
      setFilteredData(customers || []);
    }
  }, [customers, useNewApi]);

  // 当新接口数据变化时更新filteredData
  useEffect(() => {
    if (useNewApi && newApiData?.data) {
      console.log("[CustomerListDialog] 新API数据更新:", newApiData);
      console.log(
        "[CustomerListDialog] 完整数据结构:",
        JSON.stringify(newApiData, null, 2)
      );
      console.log(
        "[CustomerListDialog] newApiData.data类型:",
        typeof newApiData.data,
        Array.isArray(newApiData.data)
      );
      console.log("[CustomerListDialog] newApiData.data内容:", newApiData.data);

      // 根据实际API响应结构，数据在 newApiData.data 中
      // 但如果 newApiData.data 是对象而不是数组，那么真正的数据在 newApiData.data.data 中
      let dataArray: any[] = [];
      if (Array.isArray(newApiData.data)) {
        dataArray = newApiData.data;
      } else if (
        newApiData.data &&
        Array.isArray((newApiData.data as any).data)
      ) {
        dataArray = (newApiData.data as any).data;
      }
      console.log("[CustomerListDialog] 最终数据数组:", dataArray);
      setFilteredData(dataArray);
    }
  }, [newApiData, useNewApi]);

  // 当弹窗打开时获取数据
  useEffect(() => {
    if (visible && useNewApi) {
      console.log("[CustomerListDialog] 弹窗打开，开始获取数据");
      refetch({
        pageNumber: 1,
        pageSize: 10,
      });
    }
  }, [visible, useNewApi, refetch]);

  // 处理筛选
  const handleFilter = (values: FilterValues) => {
    if (useNewApi) {
      // 使用新接口进行搜索
      // 获取当前分页设置，如果没有则使用默认值
      const currentPageSize =
        newApiData?.pageSize || (newApiData?.data as any)?.pageSize || 10;

      const queryParams: CustomerProfileListQueryParams = {
        remarkName: values.remarkName,
        level: values.level,
        bizDateStart: values.dateRange?.[0]?.toISOString(),
        bizDateEnd: values.dateRange?.[1]?.toISOString(),
        objectionCategory: values.objectionCategory,
        fatScore: values.fatScore,
        ripeScore: values.ripeScore,
        pageNumber: 1, // 查询时重置到第一页
        pageSize: currentPageSize, // 保持当前的pageSize设置
      };
      refetch(queryParams);
      return;
    }

    // 兼容旧接口的搜索逻辑
    if (onSearch) {
      const filterParams: FilterParams = {
        remarkName: values.remarkName,
        level: values.level,
        dateRange: values.dateRange
          ? [
              values.dateRange[0]?.toDate() || null,
              values.dateRange[1]?.toDate() || null,
            ]
          : undefined,
        objectionCategory: values.objectionCategory,
        fatScore: values.fatScore,
        ripeScore: values.ripeScore,
      };
      onSearch(filterParams);
      return;
    }

    // 本地筛选（兼容旧数据）
    let result = [...customers];

    // 客户名称筛选
    if (values.remarkName) {
      result = result.filter((customer) =>
        customer.remarkName
          .toLowerCase()
          .includes(values.remarkName!.toLowerCase())
      );
    }

    // 客户评级筛选
    if (values.level) {
      result = result.filter((customer) => customer.level === values.level);
    }

    // 日期范围筛选
    if (values.dateRange && values.dateRange.length === 2) {
      const [startDate, endDate] = values.dateRange;
      result = result.filter((customer) => {
        // 兼容新旧接口的日期字段
        const dateField =
          "bizDate" in customer
            ? (customer as any).bizDate
            : (customer as CustomerUpgradePoolItem).createdAt;
        const customerDate = dayjs(dateField as string);
        return (
          customerDate.isAfter(startDate.startOf("day")) &&
          customerDate.isBefore(endDate.endOf("day"))
        );
      });
    }

    setFilteredData(result);
  };

  // 处理打开客户档案
  const handleOpenCustomerProfile = (customerProfileId: number) => {
    console.log("打开客户档案:", customerProfileId);
    // 在新窗口中打开客户档案页面
    const basePath = import.meta.env.BASE_URL || "/";
    const normalizedBasePath = basePath.endsWith("/")
      ? basePath
      : `${basePath}/`;
    const url = `${normalizedBasePath}index.html#/customer/${customerProfileId}`;
    smartNavigate(url);
  };

  // 表格列定义
  const columns: GlassColumnType<
    CustomerUpgradePoolItem | CustomerProfileListItem
  >[] = [
    {
      title: "姓名",
      dataIndex: "remarkName",
      key: "remarkName",
      width: 150,
      fixed: "left",
      render: (text: string, record: any) => (
        <a
          style={{ color: "var(--color-purple)", fontWeight: 500, cursor: "pointer" }}
          onClick={() => handleOpenCustomerProfile(record.customerProfileId)}
          title="点击查看客户档案"
        >
          {text || '未知客户'}
        </a>
      ),
    },
    {
      title: "电话",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (phone: string) => phone || "138****0000",
    },
    {
      title: "跟进状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: () => "未联系",
    },
    {
      title: "线索来源",
      dataIndex: "source",
      key: "source",
      width: 120,
      render: () => "线上一类",
    },
    {
      title: "创建时间",
      dataIndex: "bizDate",
      key: "bizDate",
      width: 150,
      sorter: (a: any, b: any) => {
        const dateA = useNewApi ? a.bizDate : a.createdAt;
        const dateB = useNewApi ? b.bizDate : b.createdAt;
        return dayjs(dateA).unix() - dayjs(dateB).unix();
      },
      render: (date: string) => (date ? dayjs(date).format("YYYY/MM/DD HH:mm") : "2026/03/24 10:00"),
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      width: 150,
      render: () => "-",
    },
    {
      title: "负责人",
      dataIndex: "owner",
      key: "owner",
      width: 100,
      render: () => "王静",
    },
    {
      title: "最新跟进记录",
      dataIndex: "lastRecord",
      key: "lastRecord",
      width: 150,
      render: () => <span style={{ color: '#bfbfbf' }}>暂无跟进记录</span>,
    },
    {
      title: "实际跟进时间",
      dataIndex: "lastChatDate",
      key: "lastChatDate",
      width: 150,
      sorter: (a: any, b: any) =>
        dayjs(a.lastChatDate || "").unix() - dayjs(b.lastChatDate || "").unix(),
      render: (date: string) => (date ? dayjs(date).format("YYYY/MM/DD HH:mm") : "2026/03/24 10:00"),
    },
    {
      title: "下次跟进时间",
      dataIndex: "nextFollowUp",
      key: "nextFollowUp",
      width: 150,
      render: () => "-",
    },
    {
      title: "渠道",
      dataIndex: "channel",
      key: "channel",
      width: 100,
      render: () => "小红书",
    }
  ];

  return (
    <PremiumModal
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={`共 ${filteredData.length} 条数据`}
      width={1280}
      className="customer-list-dialog-premium"
      themeMode={themeMode}
      showCancel={false}
      destroyOnClose
    >
      <div className="boss-modal-content-inner" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 客户列表表格 */}
        <GlassTable
          filterSchema={[
            {
              key: 'remarkName',
              type: 'search',
              placeholder: '请输入客户名称',
              width: 200,
            },
            {
              key: 'level',
              type: 'select',
              placeholder: '请选择客户评级',
              options: [
                { label: "A级", value: "A" },
                { label: "B级", value: "B" },
                { label: "C级", value: "C" },
                { label: "D级", value: "D" },
                { label: "X级", value: "X" },
              ],
              width: 150,
            },
            {
              key: 'dateRange',
              type: 'dateRange',
              placeholder: '加客日期范围' as any,
              width: 280,
            }
          ]}
          onFilterChange={(values) => {
            handleFilter(values as any);
          }}
          extraActions={[
            ...(isSelectable ? [{
              key: 'distribute',
              label: `批量分配 ${selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}`,
              type: 'primary' as const,
              highlight: selectedRowKeys.length > 0,
              onClick: () => {
                if (selectedRowKeys.length > 0) {
                  onBatchDistribute?.(selectedRowKeys, selectedRows);
                }
              }
            }] : [])
          ]}
          rowSelection={isSelectable ? {
            selectedRowKeys,
            onChange: (newSelectedRowKeys, newSelectedRows) => {
              setSelectedRowKeys(newSelectedRowKeys);
              setSelectedRows(newSelectedRows);
              onSelectionChange?.(newSelectedRowKeys, newSelectedRows);
            },
          } : undefined}
          columns={columns}
          dataSource={Array.isArray(filteredData) ? filteredData : []}
          rowKey="customerProfileId"
          loading={useNewApi ? newApiLoading : loading}
          size="middle"
          pagination={
            useNewApi && newApiData
              ? {
                  current:
                    newApiData.pageNumber || (newApiData.data as any)?.pageNumber,
                  pageSize:
                    newApiData.pageSize || (newApiData.data as any)?.pageSize,
                  total: newApiData.total || (newApiData.data as any)?.total,
                  showTotal: (total) => `共 ${total} 条`,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  onChange: (page, size) => {
                    const formValues = form.getFieldsValue();
                    const queryParams: CustomerProfileListQueryParams = {
                      remarkName: formValues.remarkName,
                      level: formValues.level,
                      bizDateStart: formValues.dateRange?.[0]?.toISOString(),
                      bizDateEnd: formValues.dateRange?.[1]?.toISOString(),
                      objectionCategory: formValues.objectionCategory,
                      fatScore: formValues.fatScore,
                      ripeScore: formValues.ripeScore,
                      pageNumber: page,
                      pageSize: size,
                    };
                    refetch(queryParams);
                  },
                }
              : {
                  total: filteredData.length,
                  pageSize: 10,
                  showTotal: (total) => `共 ${total} 条`,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: ["10", "20", "50", "100"],
                }
          }
          locale={{
            emptyText: (
              <Empty
                description="暂无客户数据"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          scroll={{ x: 1200, y: "calc(100vh - 200px)" }}
          className="premium-customer-table"
        />

        {/* The bottom distribution bar is no longer needed here as it was moved to the top header */}
      </div>
    </PremiumModal>
  );
};

export default CustomerListDialog;
