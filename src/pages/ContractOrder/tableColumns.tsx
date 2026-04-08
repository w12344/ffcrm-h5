/**
 * 表格列定义
 */
import { Button } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { ContractItem, ContractProfileGroup } from "@/services/contract";
import { formatCurrency, formatDate } from "./utils";
import { BUTTON_STYLES } from "./constants";

interface ExpandedColumnsParams {
  onOpenPaymentRecords: (contractId: number, profileId?: number) => void;
  onOpenPaymentCollection: (contractId: number, profileName: string, goods: string) => void;
  onOpenRefund: (contract: ContractItem) => void;
}

interface MainColumnsParams {
  onOpenCustomerProfile: (customerProfileId: number) => void;
}

/**
 * 子表格列定义（成单详情）
 */
export const getExpandedColumns = ({
  onOpenPaymentRecords,
  onOpenPaymentCollection,
  onOpenRefund,
}: ExpandedColumnsParams) => [
  {
    title: "产品",
    dataIndex: "goods",
    key: "goods",
    width: 120,
    ellipsis: true,
  },
  {
    title: "年级",
    dataIndex: "studentGrade",
    key: "studentGrade",
    width: 100,
    ellipsis: true,
  },
  {
    title: "专业",
    dataIndex: "studentMajors",
    key: "studentMajors",
    width: 100,
    ellipsis: true,
  },
  {
    title: "省份",
    dataIndex: "studentProvince",
    key: "studentProvince",
    width: 100,
    ellipsis: true,
  },
  {
    title: "来源",
    dataIndex: "studentSource",
    key: "studentSource",
    width: 100,
    ellipsis: true,
  },
  {
    title: "来源机构",
    dataIndex: "studentSourceOrg",
    key: "studentSourceOrg",
    width: 100,
    ellipsis: true,
  },
  {
    title: "实收金额",
    dataIndex: "orderCash",
    key: "orderCash",
    width: 110,
    render: (value: number) => (
      <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
        ¥{formatCurrency(value)}
      </span>
    ),
  },
  {
    title: "退费金额",
    dataIndex: "refundCash",
    key: "refundCash",
    width: 110,
    render: (value: number) => (
      <span
        style={{
          color: value > 0 ? "var(--color-error)" : "var(--text-secondary)",
          fontWeight: 600,
        }}
      >
        ¥{formatCurrency(value)}
      </span>
    ),
  },
  {
    title: "签约日期",
    dataIndex: "orderDate",
    key: "orderDate",
    width: 120,
    render: (value: string) => formatDate(value),
  },
  {
    title: "录入时间",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 160,
    render: (value: string) => formatDate(value, "YYYY-MM-DD HH:mm:ss"),
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
    title: "操作",
    key: "action",
    width: 240,
    fixed: "right" as const,
    render: (_: any, record: ContractItem) => (
      <div style={{ 
        display: "inline-flex", 
        gap: "0.213rem", 
        flexWrap: "nowrap"
      }}>
        <Button
          type="default"
          size="small"
          icon={<DollarOutlined />}
          onClick={() => onOpenPaymentRecords(record.id, record.customerProfileId)}
          style={BUTTON_STYLES.PAYMENT_RECORDS}
        >
          钱款记录
        </Button>
        <Button
          type="default"
          size="small"
          icon={<DollarOutlined />}
          onClick={() => onOpenPaymentCollection(record.id, record.profileName, record.goods)}
          style={BUTTON_STYLES.PAYMENT_COLLECTION}
        >
          回款
        </Button>
        <Button
          type="primary"
          size="small"
          icon={<DollarOutlined />}
          onClick={() => onOpenRefund(record)}
          style={BUTTON_STYLES.REFUND}
        >
          退款
        </Button>
      </div>
    ),
  },
];

/**
 * 主表格列定义（客户档案分组）
 */
export const getMainColumns = ({ onOpenCustomerProfile }: MainColumnsParams) => [
  {
    title: "档案名称",
    dataIndex: "profileName",
    key: "profileName",
    width: 120,
    ellipsis: true,
    render: (text: string, record: ContractProfileGroup) => (
      <span
        className="student-name-link"
        onClick={() => onOpenCustomerProfile(record.customerProfileId)}
        title="点击查看客户档案"
      >
        {text}
      </span>
    ),
  },
  {
    title: "学生姓名",
    dataIndex: "studentName",
    key: "studentName",
    align: "center" as const,
    width: 100,
    fixed: "left" as const,
    ellipsis: true,
  },
  {
    title: "成单数量",
    dataIndex: "contractCount",
    key: "contractCount",
    width: 100,
    align: "center" as const,
    render: (value: number) => <span style={{ fontWeight: 600 }}>{value}</span>,
  },
  {
    title: "总实收金额",
    dataIndex: "totalOrderCash",
    key: "totalOrderCash",
    align: "center" as const,
    width: 130,
    render: (value: number) => (
      <span style={{ color: "var(--color-success)", fontWeight: 600 }}>
        ¥{formatCurrency(value)}
      </span>
    ),
  },
  {
    title: "总退费金额",
    dataIndex: "totalRefundCash",
    key: "totalRefundCash",
    align: "center" as const,
    width: 130,
    render: (value: number) => (
      <span
        style={{
          color: value > 0 ? "var(--color-error)" : "var(--text-secondary)",
          fontWeight: 600,
        }}
      >
        ¥{formatCurrency(value)}
      </span>
    ),
  },
];
