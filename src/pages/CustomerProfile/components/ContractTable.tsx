import React, { memo, useState, useContext } from "react";
import { Table, Button, Space, message, Tag, Modal, Grid } from "antd";
import {
  DownloadOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { smartNavigate } from "@/utils/url";
import {
  getSignUrl,
  getContractDetails,
  deleteContract,
} from "@/services/contractSign";
import { ThemeContext } from "@/contexts/ThemeContext";
import type { ColumnsType } from "antd/es/table";
import { ContractInfo } from "../types";
import ContractPreviewModal from "./ContractPreviewModal";
import MobileTableCard from "@/components/MobileTableCard";

const { useBreakpoint } = Grid;

interface ContractTableProps {
  contracts: ContractInfo[];
  onContractDeleted?: () => void;
}

/**
 * 合同列表表格组件
 * 使用 Table 展示合同信息
 */
const ContractTable: React.FC<ContractTableProps> = ({
  contracts,
  onContractDeleted,
}) => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentContract, setCurrentContract] = useState<ContractInfo | null>(
    null
  );
  const themeContext = useContext(ThemeContext);
  const isDark = themeContext?.currentTheme === "dark";

  // 判断是否为移动端
  const isMobile = !screens.md;

  // 获取合同状态标签颜色
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      task_finished: "success",
      task_pending: "processing",
      task_failed: "error",
      task_cancelled: "default",
    };
    return statusMap[status] || "default";
  };

  // 关闭预览弹窗
  const handleClosePreview = () => {
    setPreviewVisible(false);
    setCurrentContract(null);
  };

  // 处理下载合同 - 直接在新窗口打开
  const handleDownload = (contract: ContractInfo) => {
    if (contract.contractDocumentUrl) {
      smartNavigate(
        contract.contractDocumentUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      message.warning("合同文档不存在");
    }
  };

  // 处理编辑合同
  const handleEdit = async (
    contract: ContractInfo,
    isViewOnly: boolean = false
  ) => {
    try {
      // 调用合同详情接口
      const details = await getContractDetails(contract.signTaskId);
      // 跳转到合同配置页面
      navigate("/contract-config", {
        state: {
          signTaskId: contract.signTaskId,
          customerProfileId: contract.customerProfileId,
          contractId: contract.id,
          templateCode: details.templateCode,
          templateName: contract.templateName,
          contractTitle: contract.contractTitle,
          isEdit: true,
          isViewOnly: isViewOnly,
          contractDetails: details,
        },
      });
    } catch (error) {
      console.error("获取合同详情失败:", error);
      message.error("获取合同详情失败");
    }
  };

  // 处理复制签署链接
  const handleCopySignUrl = async (signTaskId: string) => {
    try {
      const url = await getSignUrl(signTaskId);
      // 复制到剪贴板
      await navigator.clipboard.writeText(url);
      message.success("签署链接已复制到剪贴板");
    } catch (error) {
      console.error("复制签署链接失败:", error);
      message.error("复制签署链接失败");
    }
  };

  // 处理删除合同
  const handleDelete = (contract: ContractInfo) => {
    Modal.confirm({
      title: "删除合同",
      icon: <ExclamationCircleOutlined />,
      content: `确认要删除合同「${contract.contractTitle}」吗？此操作不可恢复。`,
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      centered: true,
      onOk: async () => {
        try {
          await deleteContract(contract.id);
          message.success("删除成功");
          // 调用回调函数刷新列表
          if (onContractDeleted) {
            onContractDeleted();
          }
        } catch (error: any) {
          console.error("删除合同失败:", error);
          message.error(error?.message || "删除失败");
        }
      },
    });
  };

  // 处理打开客户档案
  const handleOpenCustomerProfile = (customerProfileId: number) => {
    const basePath = import.meta.env.BASE_URL || "/";
    const normalizedBasePath = basePath.endsWith("/")
      ? basePath
      : `${basePath}/`;
    const url = `${normalizedBasePath}index.html#/customer/${customerProfileId}`;
    smartNavigate(url);
  };

  // 表格列定义
  const columns: ColumnsType<ContractInfo> = [
    {
      title: "档案名称",
      dataIndex: "profileName",
      key: "profileName",
      width: 150,
      ellipsis: true,
      render: (text: string | undefined, record: ContractInfo) =>
        text ? (
          <span
            style={{
              color: "var(--color-purple-primary)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => handleOpenCustomerProfile(record.customerProfileId)}
            title="点击查看客户档案"
          >
            {text}
          </span>
        ) : (
          "-"
        ),
    },
     {
      title: "学生姓名",
      dataIndex: "studentName",
      key: "studentName",
      width: 100,
      render: (text: string | undefined) => text || "-",
    },
    {
      title: "合同标题",
      dataIndex: "contractTitle",
      key: "contractTitle",
      width: 300,
      ellipsis: true,
    },
    {
      title: "合同金额",
      dataIndex: "contractAmount",
      key: "contractAmount",
      width: 120,
      render: (value: number | undefined) =>
        value
          ? `¥${value.toLocaleString("zh-CN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "-",
    },
    {
      title: "签署人",
      dataIndex: "signerName",
      key: "signerName",
      width: 100,
      ellipsis: true,
      render: (text: string | undefined) => text || "-",
    },
    {
      title: "手机",
      dataIndex: "signerMobile",
      key: "signerMobile",
      width: 120,
      ellipsis: true,
      render: (text: string | undefined) => text || "-",
    },
    {
      title: "状态",
      dataIndex: "contractStatusName",
      key: "contractStatusName",
      width: 100,
      render: (text: string, record: ContractInfo) => (
        <Tag color={getStatusColor(record.contractStatus)}>{text}</Tag>
      ),
    },
   
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      width: 150,
      ellipsis: true,
      render: (text: string | null) => text || "-",
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (text: string | undefined) => {
        if (!text) return "-";
        const date = new Date(text);
        return date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "操作",
      key: "action",
      width: 350,
      fixed: "right",
      render: (_: any, record: ContractInfo) => {
        const hasDocument = !!record.contractDocumentUrl;
        const canEdit = record.contractStatus === "task_created" || record.contractStatus === "fill_completed";
        const canSign = record.contractStatus === "sign_progress";
        const isSignProgress = record.contractStatus === "sign_progress";

        // 基础按钮样式
        const baseButtonStyle = {
          borderRadius: "4px",
          ...(isDark && {
            borderColor: "rgba(255, 255, 255, 0.3)",
            color: "rgba(255, 255, 255, 0.85)",
            background: "transparent",
          }),
        };

        // 禁用状态样式
        const disabledButtonStyle = {
          ...baseButtonStyle,
          ...(isDark && {
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "rgba(255, 255, 255, 0.25)",
            background: "rgba(255, 255, 255, 0.02)",
            cursor: "not-allowed",
            opacity: 0.4,
          }),
        };

        return (
          <Space size="small">
            {isSignProgress ? (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleEdit(record, true)}
                style={baseButtonStyle}
              >
                预览
              </Button>
            ) : (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record, false)}
                disabled={!canEdit}
                style={canEdit ? baseButtonStyle : disabledButtonStyle}
              >
                编辑
              </Button>
            )}
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              disabled={!hasDocument}
              style={hasDocument ? baseButtonStyle : disabledButtonStyle}
            >
              下载
            </Button>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopySignUrl(record.signTaskId)}
              disabled={!canSign}
              style={canSign ? baseButtonStyle : disabledButtonStyle}
            >
              签署链接
            </Button>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              style={baseButtonStyle}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  // 渲染移动端操作按钮
  const renderMobileActions = (record: ContractInfo) => {
    const hasDocument = !!record.contractDocumentUrl;
    const canEdit = record.contractStatus === "task_created" || record.contractStatus === "fill_completed";
    const canSign = record.contractStatus === "sign_progress";
    const isSignProgress = record.contractStatus === "sign_progress";

    return (
      <>
        {isSignProgress ? (
          <div className="action-btn" onClick={() => handleEdit(record, true)}>
            <EyeOutlined />
          </div>
        ) : (
          <div
            className="action-btn"
            onClick={() => canEdit && handleEdit(record, false)}
            style={{ opacity: canEdit ? 1 : 0.4 }}
          >
            <EditOutlined />
          </div>
        )}
        <div
          className="action-btn"
          onClick={() => hasDocument && handleDownload(record)}
          style={{ opacity: hasDocument ? 1 : 0.4 }}
        >
          <DownloadOutlined />
        </div>
        <div
          className="action-btn"
          onClick={() => canSign && handleCopySignUrl(record.signTaskId)}
          style={{ opacity: canSign ? 1 : 0.4 }}
        >
          <CopyOutlined />
        </div>
        <div className="action-btn" onClick={() => handleDelete(record)}>
          <DeleteOutlined />
        </div>
      </>
    );
  };

  // 移动端渲染卡片
  if (isMobile) {
    return (
      <>
        <MobileTableCard
          columns={columns.filter((col) => col.key !== "action")}
          dataSource={contracts}
          rowKey={(record: ContractInfo, index?: number) => `contract-${record.id}-${record.signTaskId}-${index}`}
          emptyText="暂无合同信息"
          primaryField="contractTitle"
          highlightFields={["contractAmount"]}
          hiddenFields={["action", "signerName"]}
          renderActions={renderMobileActions}
        />

        {/* 合同预览弹窗 */}
        {currentContract && (
          <ContractPreviewModal
            visible={previewVisible}
            onClose={handleClosePreview}
            contractUrl={currentContract.contractDocumentUrl}
            contractTitle={currentContract.contractTitle}
          />
        )}
      </>
    );
  }

  // 桌面端渲染表格
  return (
    <>
      <Table<ContractInfo>
        columns={columns}
        dataSource={contracts}
        rowKey={(record, index) => `contract-${record.id}-${record.signTaskId}-${index}`}
        pagination={false}
        scroll={{ x: 1420, y: 400 }}
      />

      {/* 合同预览弹窗 */}
      {currentContract && (
        <ContractPreviewModal
          visible={previewVisible}
          onClose={handleClosePreview}
          contractUrl={currentContract.contractDocumentUrl}
          contractTitle={currentContract.contractTitle}
        />
      )}
    </>
  );
};

export default memo(ContractTable);
