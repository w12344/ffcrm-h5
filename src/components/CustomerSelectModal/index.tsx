import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Empty, message, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTheme } from "@/hooks/useTheme";
import request from "@/utils/request";
import PremiumModal from "@/components/PremiumModal";
import "./index.less";

export interface Customer {
  id: number;
  name: string;
  alias: string;
  wxId: string;
}

interface CustomerSelectModalProps {
  visible: boolean;
  defaultSearch?: string;
  startTime?: string;
  endTime?: string;
  onClose: () => void;
  onConfirm: (customer: Customer | null) => void;
}

const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  visible,
  defaultSearch = "",
  startTime = "",
  endTime = "",
  onClose,
  onConfirm,
}) => {
  const { isDark } = useTheme();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [binding, setBinding] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComposingRef = useRef(false);

  // 获取时间范围
  const getTimeRange = () => {
    if (startTime && endTime) {
      return { startTime, endTime };
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return {
      startTime: `${dateStr} 00:00:00`,
      endTime: `${dateStr} 23:59:59`,
    };
  };

  // 调用客户API
  const callCustomerAPI = async (contactAlias: string | null = null) => {
    const timeRange = getTimeRange();
    const requestBody: any = {
      startTime: timeRange.startTime,
      endTime: timeRange.endTime,
    };

    // 如果有搜索关键词，添加到请求体中
    if (contactAlias) {
      requestBody.contactAlias = contactAlias;
    }

    const response = await request.post("/feishu/app/ab/contactList", requestBody);

    if (response.data?.code === 200 && response.data?.data) {
      // 转换API响应格式为组件需要的格式
      const customerList = response.data.data.map(
        (customer: any, index: number) => ({
          id: index + 1, // 使用索引作为临时ID
          name: customer.nickName, // 使用nickName作为主要显示名称
          alias: customer.alias || customer.nickName, // alias可能为空，使用nickName作为备选
          wxId: customer.wxId,
        })
      );

      setCustomers(customerList);

      // 如果有默认搜索，自动选择第一个匹配的结果
      if (defaultSearch && customerList.length > 0) {
        setSelectedCustomer(customerList[0]);
      }
    } else {
      throw new Error(response.data?.message || "获取客户列表失败");
    }
  };

  // 搜索客户
  const handleSearch = async () => {
    setLoading(true);
    try {
      if (!searchKeyword.trim()) {
        // 当什么都不输入时，默认查询20条
        await callCustomerAPI();
      } else {
        // 有搜索关键词时，传递关键词
        await callCustomerAPI(searchKeyword);
      }
    } catch (error) {
      console.error("搜索客户失败:", error);
      message.error(
        error instanceof Error ? error.message : "搜索客户失败"
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // 处理输入事件（防抖）
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);

    // 如果正在输入法编辑中，不执行搜索
    if (isComposingRef.current) {
      return;
    }

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置新的定时器，500ms后执行搜索
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch();
    }, 500);
  };

  // 输入法开始编辑
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  // 输入法结束编辑
  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    // 输入法结束后立即搜索
    handleSearch();
  };

  // 选择客户
  const selectCustomer = (customer: Customer) => {
    // 如果点击的是已选中的客户，则取消选中
    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(null);
    } else {
      // 否则选中该客户
      setSelectedCustomer(customer);
    }
  };

  // 确认选择
  const confirmSelection = () => {
    setBinding(true);
    // 如果有选中的客户，则绑定该客户；如果没有选中客户，则传递null表示不绑定
    onConfirm(selectedCustomer);
    // 不立即关闭弹窗，等待绑定完成
  };

  // 关闭弹窗
  const handleClose = () => {
    // 清理定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    setSearchKeyword("");
    setCustomers([]);
    setSelectedCustomer(null);
    setLoading(false);
    setBinding(false);
    isComposingRef.current = false;
    onClose();
  };

  // 监听弹窗显示状态
  useEffect(() => {
    if (visible) {
      if (defaultSearch) {
        setSearchKeyword(defaultSearch);
        handleSearch();
      } else {
        // 如果没有默认搜索，清空搜索框并查询默认客户列表
        setSearchKeyword("");
        handleSearch();
      }
      // 重置绑定状态
      setBinding(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, defaultSearch]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <PremiumModal
      title="选择客户"
      visible={visible}
      onClose={handleClose}
      width={500}
      className={`customer-select-modal ${isDark ? "dark-theme" : "light-theme"}`}
      destroyOnClose
    >
      <div className="modal-body">
        {/* 搜索框 */}
        <div className="search-section">
          <Input
            value={searchKeyword}
            onChange={handleInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onPressEnter={handleSearch}
            placeholder="请输入客户微信昵称或备注"
            suffix={
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              />
            }
          />
        </div>

        {/* 搜索结果列表 */}
        <div className="customer-list">
          {loading ? (
            <div className="loading">搜索中...</div>
          ) : customers.length === 0 ? (
            <Empty description="暂无搜索结果" />
          ) : (
            <div className="customer-items">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`customer-item ${
                    selectedCustomer?.id === customer.id ? "selected" : ""
                  }`}
                  onClick={() => selectCustomer(customer)}
                >
                  <div className="customer-info">
                    <div className="customer-name">{customer.name}</div>
                    {customer.alias && customer.alias !== customer.name && (
                      <div className="customer-alias">{customer.alias}</div>
                    )}
                    <div className="customer-wxid">{customer.wxId}</div>
                  </div>
                  <div className="select-indicator">
                    {selectedCustomer?.id === customer.id && (
                      <span className="selected-check">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <Button onClick={handleClose} disabled={binding}>取消</Button>
          <Button type="primary" onClick={confirmSelection} loading={binding}>确定</Button>
        </Space>
      </div>
    </PremiumModal>
  );
};

export default CustomerSelectModal;

