import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  EditOutlined,
  EyeOutlined,
  DownOutlined,
  UpOutlined,
  MessageOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Tag, message, Tabs } from "antd";
import { useTheme } from "@/hooks/useTheme";


// 组件
import { EmptyState } from "@/components";
import ProfileSkeleton from "./components/ProfileSkeleton";
import ObjectionDetailDialog from "@/components/ObjectionDetailDialog";
import CommunicationRecords from "@/components/CommunicationRecords";
import BasicInfoForm from "./components/BasicInfoForm";
import TimelineSection from "./components/TimelineSection";
import ContractTable from "./components/ContractTable";
import OrderTable from "./components/OrderTable";
import AddContractModal from "@/pages/ContractOrder/components/AddContractModal";
import {
  BasicInfoIcon,
  TimelineIcon,
  AISummaryIcon,
  IssuesIcon,
  ContactsIcon,
  ContractIcon,
} from "./components/SectionIcons";

// 服务
import { updateProfileBasicInfo } from "@/services/profile";
import { fetchOrderList, ContractItem } from "@/services/contract";

// Hooks
import { useProfileData } from "./hooks/useProfileData";

// 工具函数
import {
  getLevelClassName,
  getObjectionStatusColor,
  transformObjectionsForDialog,
} from "./utils/helpers";

import "./index.less";

/**
 * 客户档案页面
 */
const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const themeClass = isDark ? "dark-theme" : "light-theme";
  // 使用自定义 Hook 加载数据
  const { profileData, objections, communicationRecords, contracts, loading, refetch } =
    useProfileData(id);

  // 本地状态
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isObjectionDialogVisible, setIsObjectionDialogVisible] = useState(false);
  const [selectedObjectionId, setSelectedObjectionId] = useState<number | null>(null);
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(false);
  
  // 报单列表状态
  const [orders, setOrders] = useState<ContractItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addDealModalVisible, setAddDealModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("contracts");

  // 处理基本信息编辑 - 使用 useCallback 优化
  const handleEditBasicInfo = useCallback(() => {
    if (profileData) {
      // 初始化编辑表单数据
      setEditFormData({
        realName: profileData.basicInfo.realName,
        gender: profileData.basicInfo.gender,
        examYear: profileData.basicInfo.examYear,
        province: profileData.basicInfo.province,
        currentSchool: profileData.basicInfo.currentSchool,
        major: profileData.basicInfo.major,
        remarkName: profileData.basicInfo.remarkName,
      });
      setIsEditingBasicInfo(true);
    }
  }, [profileData]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingBasicInfo(false);
    setEditFormData({});
  }, []);

  const handleSaveBasicInfo = useCallback(async () => {
    if (!id) return;

    try {
      await updateProfileBasicInfo({
        id: Number(id),
        ...editFormData,
      });

      message.success("保存成功");
      setIsEditingBasicInfo(false);
      setEditFormData({});

      // 刷新页面以重新加载数据
      window.location.reload();
    } catch (error) {
      message.error("保存失败，请稍后重试");
      console.error("Failed to save basic info:", error);
    }
  }, [id, editFormData]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * 处理异议标签点击
   */
  const handleObjectionClick = useCallback((objectionId: number) => {
    setSelectedObjectionId(objectionId);
    setIsObjectionDialogVisible(true);
  }, []);

  /**
   * 加载报单列表
   */
  const loadOrders = useCallback(async () => {
    if (!id) return;
    
    setOrdersLoading(true);
    try {
      const res = await fetchOrderList({
        pageNumber: 1,
        pageSize: 100,
        customerProfileId: Number(id),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      
      if (res.data.code === 200) {
        setOrders(res.data.data.data || []);
      }
    } catch (error) {
      console.error("加载报单列表失败:", error);
      message.error("加载报单列表失败");
    } finally {
      setOrdersLoading(false);
    }
  }, [id]);

  // 当切换到报单列表时加载数据
  const hasLoadedOrders = useRef(false);
  
  useEffect(() => {
    if (activeTab === "orders" && !ordersLoading && !hasLoadedOrders.current) {
      hasLoadedOrders.current = true;
      loadOrders();
    }
  }, [activeTab, loadOrders, ordersLoading]);

  /**
   * 处理创建合同 - 跳转到合同签署页面
   */
  const handleCreateContract = useCallback(() => {
    if (!id) {
      message.error('档案ID不存在');
      return;
    }

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

    // 构建签署页面URL，携带档案ID和token
    const params = new URLSearchParams();
    params.append('customerProfileId', id);
    if (queryToken) {
      params.append('token', queryToken);
    }

    // 跳转到合同签署页面
    navigate(`/contract-sign/new?${params.toString()}`);
  }, [id, navigate]);

  /**
   * 联系人 Tabs 数据 - 使用 useMemo 缓存
   */
  const contactTabItems = useMemo(() => {
    if (!profileData) return [];

    return profileData.contacts.map((contact) => ({
      key: contact.wxId,
      label: (
        <span className="tab-label">
          {contact.nickName}
          {contact.isPrimaryContact && " (主联系人)"}
        </span>
      ),
      children: (
        <div className="contact-card">
          <div className="contact-avatar">
            {contact.head ? (
              <img src={contact.head} alt={contact.nickName} />
            ) : (
              <span>{contact.nickName.charAt(0)}</span>
            )}
          </div>
          <div className="contact-info">
            <div className="contact-row">
              <span className="contact-label">昵称:</span>
              <span className="contact-value">{contact.nickName}</span>
            </div>
            {contact.alias && (
              <div className="contact-row">
                <span className="contact-label">备注名:</span>
                <span className="contact-value">{contact.alias}</span>
              </div>
            )}
            <div className="contact-row">
              <span className="contact-label">微信ID:</span>
              <span className="contact-value">{contact.wxId}</span>
            </div>
            {contact.mobile && (
              <div className="contact-row">
                <span className="contact-label">手机号:</span>
                <span className="contact-value">{contact.mobile}</span>
              </div>
            )}
            <div className="contact-row">
              <span className="contact-label">关系:</span>
              <span className="contact-value">{contact.relationship}</span>
            </div>
          </div>
        </div>
      ),
    }));
  }, [profileData]);

  if (loading || !profileData) {
    return (
      <div className={`customer-profile-page ${themeClass}`}>
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className={`customer-profile-page ${themeClass}`}>
      {/* 主内容区域 */}
      <div className="profile-content">
        {/* 学生基本信息 */}
        <section className="info-section basic-info-card">
          <div className="section-header">
            <h2 className="section-title">
              <BasicInfoIcon />
              <span>学生档案：{profileData.basicInfo.remarkName}</span>
            </h2>
            <div className="header-actions">
              {!isEditingBasicInfo ? (
                <>
                  <Button
                    type="text"
                    icon={
                      isBasicInfoExpanded ? <UpOutlined /> : <DownOutlined />
                    }
                    size="small"
                    onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
                  >
                    {isBasicInfoExpanded ? "收起" : "展开"}
                  </Button>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={handleEditBasicInfo}
                  >
                    编辑
                  </Button>
                </>
              ) : (
                <div className="edit-actions">
                  <Button type="text" size="small" onClick={handleCancelEdit}>
                    取消
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleSaveBasicInfo}
                  >
                    保存
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 收起状态的视觉分隔 */}
          {!isBasicInfoExpanded && !isEditingBasicInfo && (
            <div className="collapsed-divider"></div>
          )}

          {/* 基本信息 - 可展开/收起 */}
          {(isBasicInfoExpanded || isEditingBasicInfo) && (
            <>
              <BasicInfoForm
                data={profileData.basicInfo}
                isEditing={isEditingBasicInfo}
                editFormData={editFormData}
                themeClass={themeClass}
                onFieldChange={handleFieldChange}
              />
              {/* 分隔线 */}
              <div className="section-divider"></div>
            </>
          )}

          {/* 综合评估 & 打分 - 始终显示 */}
          <div className="evaluation-section">
            <h3 className="evaluation-title">综合评估 & 打分</h3>
            <div
              className={`evaluation-content ${getLevelClassName(
                profileData.evaluation.level
              )}`}
            >
              {/* 等级徽章放在熟客积分后面 */}
              <div className="level-badge inline-badge">
                <span className="level-badge-text">
                  {profileData.evaluation.level}
                </span>
              </div>
              <div className="evaluation-item score-item">
                <span className="evaluation-label">肥客积分:</span>
                <span className="evaluation-value score-value fat-score">
                  {profileData.evaluation.fatScore}
                </span>
              </div>
              <div className="evaluation-item score-item">
                <span className="evaluation-label">熟客积分:</span>
                <span className="evaluation-value score-value ripe-score">
                  {profileData.evaluation.ripeScore}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 时间轴 */}
        <section className="info-section timeline-section">
          <div className="timeline-header">
            <h2 className="section-title">
              <TimelineIcon />
              <span>时间轴</span>
            </h2>
          </div>
          <TimelineSection timeline={profileData.timeline} />
        </section>

        {/* AI 总结 */}
        <section className="info-section ai-summary">
          <div className="section-header">
            <h2 className="section-title">
              <AISummaryIcon />
              <span>AI 总结</span>
            </h2>
          </div>
          <div className="summary-content">{profileData.aiSummary}</div>
        </section>

        {/* 异议区域 */}
        <section className="info-section issues-section">
          <div className="section-header">
            <h2 className="section-title">
              <IssuesIcon />
              <span>异议区域</span>
            </h2>
            {objections.length > 0 && (
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => setIsObjectionDialogVisible(true)}
              >
                查看详情
              </Button>
            )}
          </div>

          {/* 异议标签概览 */}
          <div className="issues-tags">
            {objections.map((objection) => (
              <Tag
                key={objection.id}
                color={getObjectionStatusColor(objection.status)}
                className="issue-tag clickable"
                onClick={() => handleObjectionClick(objection.id)}
                style={{ cursor: "pointer" }}
              >
                {objection.title}
              </Tag>
            ))}
            {objections.length === 0 && (
              <span className="empty-text">暂无异议</span>
            )}
          </div>
        </section>

        {/* 异议详情弹窗 */}
        <ObjectionDetailDialog
          visible={isObjectionDialogVisible}
          onClose={() => {
            setIsObjectionDialogVisible(false);
            setSelectedObjectionId(null);
          }}
          objections={transformObjectionsForDialog(objections)}
          selectedObjectionId={selectedObjectionId}
          themeMode={themeClass === "dark-theme" ? "dark" : "light"}
        />

        {/* 合同与报单列表 */}
        <section className="info-section contracts-section">
          <div className="section-header">
            <h2 className="section-title">
              <ContractIcon />
              <span>合同与报单</span>
              <div className="title-refresh-btn" onClick={() => { refetch(); loadOrders(); }}>
                <ReloadOutlined />
              </div>
            </h2>
            {activeTab === "contracts" ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={handleCreateContract}
              >
                创建合同
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => setAddDealModalVisible(true)}
              >
                添加成交单
              </Button>
            )}
          </div>
          
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "contracts",
                label: "合同列表",
                children: contracts.length === 0 ? (
                  <EmptyState title="暂无合同信息" />
                ) : (
                  <ContractTable contracts={contracts} onContractDeleted={refetch} />
                ),
              },
              {
                key: "orders",
                label: "报单列表",
                children: ordersLoading ? (
                  <div style={{ padding: "40px", textAlign: "center" }}>加载中...</div>
                ) : orders.length === 0 ? (
                  <EmptyState title="暂无报单信息" />
                ) : (
                  <OrderTable orders={orders} loading={ordersLoading} />
                ),
              },
            ]}
          />
        </section>

        {/* 添加成交单弹窗 */}
        <AddContractModal
          visible={addDealModalVisible}
          onCancel={() => setAddDealModalVisible(false)}
          onSuccess={() => {
            loadOrders();
            setAddDealModalVisible(false);
          }}
        />

        {/* 联系人信息 */}
        <section className="info-section contacts-section">
          <h2 className="section-title">
            <ContactsIcon />
            <span>联系人信息</span>
          </h2>
          {profileData.contacts.length === 0 ? (
            <EmptyState title="暂无联系人信息" />
          ) : (
            <Tabs className="contacts-tabs" items={contactTabItems} />
          )}
        </section>

        {/* 沟通记录 */}
        <section className="info-section communication-records-section">
          <h2 className="section-title">
            <MessageOutlined
              className="section-icon"
              style={{ fontSize: "18px" }}
            />
            <span>沟通记录</span>
          </h2>
          <CommunicationRecords
            records={communicationRecords}
            themeMode={themeClass === "dark-theme" ? "dark" : "light"}
          />
        </section>
      </div>
    </div>
  );
};

export default CustomerProfile;
