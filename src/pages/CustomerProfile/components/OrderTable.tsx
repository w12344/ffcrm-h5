import React, { memo } from "react";
import { Table, Grid } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ContractItem } from "@/services/contract";
import MobileTableCard from "@/components/MobileTableCard";

const { useBreakpoint } = Grid;

interface OrderTableProps {
  orders: ContractItem[];
  loading?: boolean;
}

/**
 * 报单列表表格组件
 * 桌面端显示表格，移动端显示卡片
 */
const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  loading = false,
}) => {
  const screens = useBreakpoint();

  const columns: ColumnsType<ContractItem> = [
    {
      title: "成单日期",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (text: string) => text?.split("T")[0] || "-",
    },
    {
      title: "商品名称",
      dataIndex: "goods",
      key: "goods",
      width: 150,
      ellipsis: true,
    },
    {
      title: "实收金额",
      dataIndex: "orderCash",
      key: "orderCash",
      width: 120,
      render: (value: number) => (
        <span style={{ color: "#52c41a" }}>
          ¥{value?.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "退费金额",
      dataIndex: "refundCash",
      key: "refundCash",
      width: 120,
      render: (value: number) => (
        <span style={{ color: value > 0 ? "#ff4d4f" : "inherit" }}>
          ¥{value?.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      width: 200,
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (text: string) => {
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
  ];

  // 判断是否为移动端
  const isMobile = !screens.md;

  // 移动端渲染卡片
  if (isMobile) {
    return (
      <MobileTableCard
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        emptyText="暂无报单信息"
        primaryField="goods"
        highlightFields={['orderCash', 'refundCash']}
      />
    );
  }

  // 桌面端渲染表格
  return (
    <Table<ContractItem>
      columns={columns}
      dataSource={orders}
      rowKey="id"
      pagination={false}
      loading={loading}
      scroll={{ x: 1000 }}
      size="middle"
    />
  );
};

export default memo(OrderTable);
