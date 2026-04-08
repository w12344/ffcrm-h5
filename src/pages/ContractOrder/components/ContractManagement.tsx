import React, { useState, useEffect } from "react";
import { Button, message, Spin, Input, Select, Pagination } from "antd";
import { 
  PlusOutlined, 
  ReloadOutlined as ReloadIcon,
  InboxOutlined
} from "@ant-design/icons";
import http from "@/utils/request";
import ContractTable from "@/pages/CustomerProfile/components/ContractTable";
import { ContractInfo } from "@/pages/CustomerProfile/types";
import ProfileSelectModal from "./ProfileSelectModal";
import TableFilter from "@/components/TableFilter";
import "./ContractManagement.less";

const ContractManagement: React.FC = () => {
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileSelectModalVisible, setProfileSelectModalVisible] = useState(false);
  
  // 分页
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  
  // 筛选条件
  const [filters, setFilters] = useState({
    templateCode: "",
    contractTitle: "",
    contractStatus: "",
    signerMobile: "",
    profileName: "",
    studentName: "",
    signerName: ""
  });

  // 临时筛选条件（用于搜索按钮）
  const [tempFilters, setTempFilters] = useState({
    templateCode: "",
    contractTitle: "",
    contractStatus: "",
    signerMobile: "",
    profileName: "",
    studentName: "",
    signerName: ""
  });

  // 处理搜索
  const handleSearch = () => {
    setFilters({ ...tempFilters });
  };

  // 处理重置
  const handleReset = () => {
    const resetFilters = {
      templateCode: "",
      contractTitle: "",
      contractStatus: "",
      signerMobile: "",
      profileName: "",
      studentName: "",
      signerName: ""
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setPageNumber(1);
  };

  // 加载合同列表（分页）
  const loadContracts = async () => {
    setLoading(true);
    try {
      // 构建请求参数
      const params: any = {
        pageNumber,
        pageSize
      };

      // 添加筛选条件（只添加非空值）
      if (filters.templateCode) params.templateCode = filters.templateCode;
      if (filters.contractTitle) params.contractTitle = filters.contractTitle;
      if (filters.contractStatus) params.contractStatus = filters.contractStatus;
      if (filters.signerMobile) params.signerMobile = filters.signerMobile;
      if (filters.profileName) params.profileName = filters.profileName;
      if (filters.studentName) params.studentName = filters.studentName;
      if (filters.signerName) params.signerName = filters.signerName;

      const response = await http.post<any>("/contract-info/page", params);
      if (response.data?.code === 200 && response.data?.data) {
        setContracts(response.data.data.data || []);
        setTotal(response.data.data.total || 0);
      } else {
        message.error(response.data?.message || "加载合同列表失败");
        setContracts([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("加载合同列表失败:", error);
      message.error("加载合同列表失败");
      setContracts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, [pageNumber, filters]);

  // 处理创建合同 - 打开档案选择弹窗
  const handleCreateContract = () => {
    setProfileSelectModalVisible(true);
  };

  // 处理档案选择确认
  const handleProfileConfirm = (profileId: number) => {
    setProfileSelectModalVisible(false);
    
    // 清除所有合同相关的缓存
    const allKeys = Object.keys(localStorage);
    const contractKeys = allKeys.filter(key => key.startsWith('contract_config_'));
    contractKeys.forEach(key => localStorage.removeItem(key));

    // 获取当前URL中的token参数
    const hash = window.location.hash;
    const queryStart = hash.indexOf("?");
    let queryToken = null;

    if (queryStart !== -1) {
      const queryString = hash.substring(queryStart + 1);
      const urlParams = new URLSearchParams(queryString);
      queryToken = urlParams.get("token");
    }

    // 构建签署页面URL，携带token和档案信息
    const params = new URLSearchParams();
    if (queryToken) {
      params.append('token', queryToken);
    }
    params.append('customerProfileId', profileId.toString());

    // 在新窗口打开合同签署页面
    const url = `${window.location.origin}/#/contract-sign/new?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="contract-management">
      {/* 筛选区域 */}
      <TableFilter onSearch={handleSearch} onReset={handleReset}>
        <Select
          placeholder="选择合同模板"
          value={tempFilters.templateCode || undefined}
          onChange={(value) => setTempFilters({ ...tempFilters, templateCode: value || "" })}
          allowClear
          style={{ width: 200 }}
          options={[
            { label: "全部模板", value: "" },
            { label: "冲刺营培训服务合同", value: "BOOT_CAMP" },
            { label: "私塾培训服务合同", value: "PRIVATE_SCHOOL" },
            { label: "后勤保障服务合同", value: "LOGISTICS_SERVICE" }
          ]}
        />
        <Input
          placeholder="搜索档案名称"
          value={tempFilters.profileName}
          onChange={(e) => setTempFilters({ ...tempFilters, profileName: e.target.value })}
          allowClear
          style={{ width: 200 }}
        />
        <Input
          placeholder="搜索学生姓名"
          value={tempFilters.studentName}
          onChange={(e) => setTempFilters({ ...tempFilters, studentName: e.target.value })}
          allowClear
          style={{ width: 200 }}
        />
        <Select
          placeholder="合同状态"
          value={tempFilters.contractStatus || undefined}
          onChange={(value) => setTempFilters({ ...tempFilters, contractStatus: value || "" })}
          allowClear
          style={{ width: 200 }}
          options={[
            { label: "全部状态", value: "" },
            { label: "任务创建中", value: "task_created" },
            { label: "已创建", value: "finish_creation" },
            { label: "填写中", value: "fill_progress" },
            { label: "填写已完成", value: "fill_completed" },
            { label: "签署中", value: "sign_progress" },
            { label: "签署已完成", value: "sign_completed" },
            { label: "任务已完成", value: "task_finished" }
          ]}
        />
        <Input
          placeholder="搜索签署人"
          value={tempFilters.signerName}
          onChange={(e) => setTempFilters({ ...tempFilters, signerName: e.target.value })}
          allowClear
          style={{ width: 200 }}
        />
      </TableFilter>

      <Spin spinning={loading}>
        <div className="contract-management-content">
          {/* 操作按钮区域 */}
          <div className="table-header">
            <Button
              icon={<ReloadIcon />}
              onClick={loadContracts}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateContract}
            >
              创建合同
            </Button>
          </div>

          {contracts.length === 0 && !loading ? (
            <div className="empty-state">
              <InboxOutlined />
              <p>暂无合同信息</p>
            </div>
          ) : (
            <>
              <ContractTable 
                contracts={contracts} 
                onContractDeleted={loadContracts}
              />
              {total > 0 && (
                <Pagination
                  current={pageNumber}
                  pageSize={pageSize}
                  total={total}
                  onChange={(page) => setPageNumber(page)}
                  showSizeChanger={false}
                  showTotal={(total) => `共 ${total} 条`}
                />
              )}
            </>
          )}
        </div>
      </Spin>

      {/* 档案选择弹窗 */}
      <ProfileSelectModal
        visible={profileSelectModalVisible}
        onCancel={() => setProfileSelectModalVisible(false)}
        onConfirm={handleProfileConfirm}
      />
    </div>
  );
};

export default ContractManagement;
