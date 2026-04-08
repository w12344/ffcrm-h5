import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  message,
  ConfigProvider,
  Empty,
  Table,
  Select,
  Tag,
  Space
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import { Layout } from "@/components/Layout";
import { useTheme } from "@/hooks/useTheme";
import PremiumModal from "@/components/PremiumModal";
import {
  fetchApprovalList,
  ApprovalItem,
  ApprovalQueryParams,
  approveItem,
  deliveryItem,
  AppointmentForm,
} from "@/services/approval";
import "./index.less";

const { TextArea } = Input;

const ApprovalManagement: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ApprovalItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 筛选条件
  const [filters, setFilters] = useState({
    name: "",
    state: "",
    deliveryState: "",
  });

  // 拒绝弹窗状态
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectType, setRejectType] = useState<"approve" | "delivery">("approve");
  const [rejectReason, setRejectReason] = useState("");
  const [currentRejectItem, setCurrentRejectItem] = useState<ApprovalItem | null>(null);

  // 预约详情弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ApprovalItem | null>(null);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const params: ApprovalQueryParams = {
        page: pageNumber,
        pageSize,
        name: filters.name || undefined,
        state: filters.state || undefined,
        deliveryState: filters.deliveryState || undefined,
      };

      const response = await fetchApprovalList(params);

      if (response.data?.code === 200 && response.data?.data) {
        setDataSource(response.data.data.data || []);
        setTotal(response.data.data.total || 0);
      } else {
        throw new Error(response.data?.message || "获取数据失败");
      }
    } catch (error) {
      console.error("获取审批列表失败:", error);
      message.error(
        error instanceof Error ? error.message : "获取数据失败"
      );
      setDataSource([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    setPageNumber(1);
    loadData();
  };

  // 重置
  const handleReset = () => {
    setFilters({
      name: "",
      state: "",
      deliveryState: "",
    });
    setPageNumber(1);
  };

  // 审核通过
  const handleApprove = async (record: ApprovalItem) => {
    try {
      const response = await approveItem({
        id: record.id,
        state: 1,
        reason: "审核通过",
      });

      if (response.data?.code === 200) {
        message.success("审核通过成功");
        loadData();
      } else {
        throw new Error(response.data?.message || "审核通过失败");
      }
    } catch (error) {
      console.error("审核通过失败:", error);
      message.error(
        error instanceof Error ? error.message : "审核通过失败"
      );
    }
  };

  // 审核拒绝
  const handleReject = (record: ApprovalItem) => {
    setCurrentRejectItem(record);
    setRejectType("approve");
    setRejectReason("");
    setRejectModalVisible(true);
  };

  // 交付通过
  const handleDeliver = async (record: ApprovalItem) => {
    try {
      const response = await deliveryItem({
        id: record.id,
        deliveryState: 1,
        reason: "交付通过",
      });

      if (response.data?.code === 200) {
        message.success("交付通过成功");
        loadData();
      } else {
        throw new Error(response.data?.message || "交付通过失败");
      }
    } catch (error) {
      console.error("交付通过失败:", error);
      message.error(
        error instanceof Error ? error.message : "交付通过失败"
      );
    }
  };

  // 交付拒绝
  const handleRejectDelivery = (record: ApprovalItem) => {
    setCurrentRejectItem(record);
    setRejectType("delivery");
    setRejectReason("");
    setRejectModalVisible(true);
  };

  // 确认拒绝
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      message.warning("请输入拒绝理由");
      return;
    }

    if (!currentRejectItem) return;

    try {
      if (rejectType === "approve") {
        const response = await approveItem({
          id: currentRejectItem.id,
          state: -1,
          reason: rejectReason,
        });

        if (response.data?.code === 200) {
          message.success("审核拒绝成功");
        } else {
          throw new Error(response.data?.message || "审核拒绝失败");
        }
      } else {
        const response = await deliveryItem({
          id: currentRejectItem.id,
          deliveryState: -1,
          reason: rejectReason,
        });

        if (response.data?.code === 200) {
          message.success("交付拒绝成功");
        } else {
          throw new Error(response.data?.message || "交付拒绝失败");
        }
      }

      setRejectModalVisible(false);
      setCurrentRejectItem(null);
      setRejectReason("");
      loadData();
    } catch (error) {
      console.error("拒绝操作失败:", error);
      message.error(
        error instanceof Error ? error.message : "拒绝操作失败"
      );
    }
  };

  // 查看预约详情
  const handleViewDetail = (record: ApprovalItem) => {
    setSelectedAppointment(record);
    setDetailModalVisible(true);
  };

  // 解析预约表单数据
  const parseAppointmentForm = (appointmentForm: AppointmentForm | string | undefined): AppointmentForm | null => {
    if (!appointmentForm) return null;

    if (typeof appointmentForm === "string") {
      try {
        return JSON.parse(appointmentForm);
      } catch (e) {
        console.error("解析预约表单失败:", e);
        return null;
      }
    }

    return appointmentForm;
  };

  // 获取顾问名称
  const getAdvisorName = (appointmentForm: AppointmentForm | string | undefined): string => {
    const form = parseAppointmentForm(appointmentForm);
    if (!form) return "-";
    return form.advisorName || form.advisor || form.consultant || "-";
  };

  // 格式化日期时间
  const formatDateTime = (dateString: string): string => {
    if (!dateString) return "-";
    return dayjs(dateString).format("YYYY-MM-DD HH:mm");
  };

  // 状态标签映射
  const getStateTag = (state: number) => {
    const stateMap: Record<number, { text: string; color: string }> = {
      0: { text: "待审核", color: "gold" },
      1: { text: "已通过", color: "green" },
      [-1]: { text: "已拒绝", color: "red" },
    };
    const config = stateMap[state] || { text: "未知", color: "default" };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列配置
  const columns = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 100,
    },
    {
      title: "手机号",
      dataIndex: "mobile",
      key: "mobile",
      width: 120,
    },
    {
      title: "预约信息",
      key: "appointment",
      width: 100,
      render: (_: any, record: ApprovalItem) => (
        <div>
          {record.appointmentForm ? (
            <Button
              type="link"
              size="small"
              onClick={() => handleViewDetail(record)}
            >
              查看
            </Button>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>无预约信息</span>
          )}
        </div>
      ),
    },
    {
      title: "顾问",
      key: "advisor",
      width: 100,
      render: (_: any, record: ApprovalItem) => (
        <span>{getAdvisorName(record.appointmentForm)}</span>
      ),
    },
    {
      title: "审核状态",
      dataIndex: "state",
      key: "state",
      width: 100,
      render: (state: number) => getStateTag(state),
    },
    {
      title: "交付状态",
      dataIndex: "deliveryState",
      key: "deliveryState",
      width: 100,
      render: (deliveryState: number) => getStateTag(deliveryState),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (text: string) => formatDateTime(text),
    },
    {
      title: "操作",
      key: "action",
      width: 240,
      fixed: "right" as const,
      render: (_: any, record: ApprovalItem) => (
        <div className="action-buttons">
          {record.state === 0 && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleApprove(record)}
                style={{ color: "var(--color-success)" }}
              >
                审核通过
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => handleReject(record)}
                style={{ color: "var(--color-error)" }}
              >
                审核拒绝
              </Button>
            </>
          )}
          {record.deliveryState === 0 && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleDeliver(record)}
                style={{ color: "var(--color-info)" }}
              >
                交付通过
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => handleRejectDelivery(record)}
                style={{ color: "var(--color-warning)" }}
              >
                交付拒绝
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // 初始化加载
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize]);

  // 当重置筛选条件后自动搜索
  useEffect(() => {
    if (!filters.name && !filters.state && !filters.deliveryState) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // 渲染预约详情
  const renderAppointmentDetail = () => {
    if (!selectedAppointment?.appointmentForm) {
      return <Empty description="暂无预约详情" />;
    }

    const form = parseAppointmentForm(selectedAppointment.appointmentForm);
    if (!form) {
      return <Empty description="预约数据解析失败" />;
    }

    const travelModeMap: Record<string, string> = {
      parent_only: "家长单独上门",
      student_only: "学生单独上门",
      both_together: "家长和孩子一同上门",
    };

    const appointmentTypeMap: Record<string, string> = {
      english_diagnostic: "英语诊断",
      math_diagnostic: "数学诊断",
      comprehensive_diagnostic: "综合诊断",
    };

    const assessmentMap: Record<string, string> = {
      no_appointment: "不预约测评",
      chinese: "语文",
      math: "数学",
      english: "英语",
      japanese: "日语",
      politics: "政治",
      history: "历史",
      geography: "地理",
      physics: "物理",
      chemistry: "化学",
      biology: "生物",
      technology: "技术",
    };

    const learningFocusMap: Record<string, string> = {
      education_philosophy: "教育理念",
      education_process: "教育流程",
      teaching_precision: "教学精度",
      faculty_situation: "师资情况",
    };

    return (
      <div className="appointment-details">
        <div className="detail-section">
          <div className="section-title">基本信息</div>
          <div className="detail-item">
            <span className="label">学生姓名:</span>
            <span className="value">{form.studentName || form.name || "-"}</span>
          </div>
          <div className="detail-item">
            <span className="label">联系电话:</span>
            <span className="value">{form.contactPhone || form.phone || form.mobile || "-"}</span>
          </div>
          <div className="detail-item">
            <span className="label">出行方式:</span>
            <span className="value">{travelModeMap[form.travelMode || ""] || form.travelMode || "-"}</span>
          </div>
          <div className="detail-item">
            <span className="label">是否与校长见面:</span>
            <span className="value">{form.isMeetPrincipal === "1" ? "是" : form.isMeetPrincipal === "0" ? "否" : "-"}</span>
          </div>
        </div>

        <div className="detail-section">
          <div className="section-title">预约信息</div>
          <div className="detail-item">
            <span className="label">预约项目:</span>
            <span className="value">{appointmentTypeMap[form.appointmentType || ""] || form.appointmentType || "-"}</span>
          </div>
          <div className="detail-item">
            <span className="label">预约时间:</span>
            <span className="value">{form.appointmentTime || "-"}</span>
          </div>
          {form.customTimeSlot && (
            <div className="detail-item">
              <span className="label">自定义时间:</span>
              <span className="value">{form.customTimeSlot}</span>
            </div>
          )}
        </div>

        <div className="detail-section">
          <div className="section-title">测评信息</div>
          <div className="detail-item">
            <span className="label">测评内容:</span>
            <span className="value">
              {form.assessmentMethods && Array.isArray(form.assessmentMethods)
                ? form.assessmentMethods.map((m) => assessmentMap[m] || m).join("、")
                : "-"}
            </span>
          </div>
        </div>

        <div className="detail-section">
          <div className="section-title">学习关注</div>
          <div className="detail-item">
            <span className="label">关注点:</span>
            <span className="value">
              {form.learningFocus && Array.isArray(form.learningFocus)
                ? form.learningFocus
                    .filter((f) => f !== "other")
                    .map((f) => learningFocusMap[f] || f)
                    .join("、")
                : "-"}
            </span>
          </div>
          {form.customLearningFocus && (
            <div className="detail-item">
              <span className="label">自定义关注点:</span>
              <span className="value">{form.customLearningFocus}</span>
            </div>
          )}
        </div>

        <div className="detail-section">
          <div className="section-title">顾问信息</div>
          <div className="detail-item">
            <span className="label">顾问姓名:</span>
            <span className="value">{form.advisorName || form.advisor || form.consultant || "-"}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <ConfigProvider locale={zhCN}>
        <div className={`approval-management-page ${isDark ? "dark-theme" : "light-theme"}`}>
          <div className="page-header">
            <h1>审批管理</h1>
          </div>

          {/* 搜索区域 */}
          <div className="filter-section">
            <div className="filter-row">
              <div className="filter-item">
                <label className="filter-label">姓名</label>
                <Input
                  placeholder="请输入学生姓名"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  onPressEnter={handleSearch}
                  className="filter-input"
                />
              </div>
              <div className="filter-item">
                <label className="filter-label">审核状态</label>
                <Select
                  placeholder="全部"
                  value={filters.state || undefined}
                  onChange={(value) => setFilters({ ...filters, state: value || "" })}
                  className="filter-select"
                  options={[
                    { label: "全部", value: "" },
                    { label: "待审核", value: "0" },
                    { label: "已通过", value: "1" },
                    { label: "已拒绝", value: "-1" },
                  ]}
                />
              </div>
              <div className="filter-item">
                <label className="filter-label">交付状态</label>
                <Select
                  placeholder="全部"
                  value={filters.deliveryState || undefined}
                  onChange={(value) => setFilters({ ...filters, deliveryState: value || "" })}
                  className="filter-select"
                  options={[
                    { label: "全部", value: "" },
                    { label: "待审核", value: "0" },
                    { label: "已通过", value: "1" },
                    { label: "已拒绝", value: "-1" },
                  ]}
                />
              </div>
              <div className="filter-actions">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={loading}
                >
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </div>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="table-section">
            <Table
              columns={columns}
              dataSource={dataSource}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pageNumber,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, size) => {
                  setPageNumber(page);
                  setPageSize(size || 10);
                },
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无数据"
                  />
                ),
              }}
              scroll={{ x: 1100 }}
            />
          </div>

          {/* 拒绝确认弹窗 */}
          <PremiumModal
            title={rejectType === "approve" ? "审核拒绝" : "交付拒绝"}
            visible={rejectModalVisible}
            onClose={() => {
              setRejectModalVisible(false);
              setCurrentRejectItem(null);
              setRejectReason("");
            }}
            className="reject-modal"
          >
            <div className="reject-form">
              <div className="form-item">
                <label className="form-label">拒绝理由：</label>
                <TextArea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入拒绝理由..."
                  rows={4}
                />
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '20px',
              borderTop: '1px solid rgba(0,0,0,0.04)',
              marginTop: '8px'
            }}>
              <Space size={16}>
                <Button onClick={() => {
                  setRejectModalVisible(false);
                  setCurrentRejectItem(null);
                  setRejectReason("");
                }}>取消</Button>
                <Button type="primary" danger onClick={handleConfirmReject}>确认拒绝</Button>
              </Space>
            </div>
          </PremiumModal>

          {/* 预约详情弹窗 */}
          <PremiumModal
            title="预约详情"
            visible={detailModalVisible}
            onClose={() => {
              setDetailModalVisible(false);
              setSelectedAppointment(null);
            }}
            width={700}
            className="appointment-detail-modal"
          >
            {renderAppointmentDetail()}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '20px',
              borderTop: '1px solid rgba(0,0,0,0.04)',
              marginTop: '8px'
            }}>
              <Button onClick={() => {
                setDetailModalVisible(false);
                setSelectedAppointment(null);
              }}>关闭</Button>
            </div>
          </PremiumModal>
        </div>
      </ConfigProvider>
    </Layout>
  );
};

export default ApprovalManagement;


