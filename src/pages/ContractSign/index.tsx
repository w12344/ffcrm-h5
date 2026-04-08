import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Space, Spin, message, Empty } from "antd";
import { smartNavigate } from "@/utils/url";
import {
  EyeOutlined,
  CheckOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  fetchContractTemplates,
  fetchTemplatePreviewUrl,
} from "@/services/contractSign";
import type { ContractTemplate } from "./types";
import type { ContractInfo } from "@/pages/CustomerProfile/types";
import "./index.less";

const ContractSign: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const contract = location.state?.contract as ContractInfo;

  // 从 URL 查询参数中获取档案 ID
  const searchParams = new URLSearchParams(location.search);
  const customerProfileId = searchParams.get("customerProfileId");

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // 加载合同模板列表
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchContractTemplates();
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0].templateCode);
      }
    } catch (error) {
      message.error("加载合同模板失败");
      console.error("Load templates error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 预览模板 - 在新窗口打开
  const handlePreview = async (templateCode: string) => {
    try {
      setLoading(true);
      const url = await fetchTemplatePreviewUrl(templateCode);
      // 直接在新窗口打开预览链接，避免 iframe 跨域问题
      smartNavigate(url, "_blank", "noopener,noreferrer");
      message.success("预览已在新窗口打开");
    } catch (error) {
      message.error("获取模板预览失败");
      console.error("Fetch preview URL error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 确认签署 - 直接跳转到合同配置页面
  const handleConfirmSign = () => {
    if (!selectedTemplate) {
      message.warning("请选择合同模板");
      return;
    }

    const selectedTemplateInfo = templates.find(
      (t) => t.templateCode === selectedTemplate
    );
    if (!selectedTemplateInfo) {
      message.error("模板信息不存在");
      return;
    }

    // 优先使用 URL 参数中的档案 ID，其次使用 contract 中的
    const profileId = customerProfileId
      ? parseInt(customerProfileId, 10)
      : contract?.customerProfileId || 0;

    if (!profileId) {
      message.error("缺少客户档案ID");
      return;
    }

    // 直接跳转到合同配置页面（第一步：填写基本信息）
    navigate(`/contract-config`, {
      state: {
        customerProfileId: profileId,
        templateCode: selectedTemplate,
        templateName: selectedTemplateInfo.templateName,
      },
    });
  };

  // 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="contract-sign-page">
      {/* 页面头部 */}
      <div className="page-header">
        <h1 className="page-title">签署合同</h1>
      </div>

      {/* 合同信息卡片 */}
      {contract && (
        <Card className="contract-info-card" bordered={false}>
          <div className="info-row">
            <span className="label">合同标题：</span>
            <span className="value">{contract.contractTitle}</span>
          </div>
          <div className="info-row">
            <span className="label">模板名称：</span>
            <span className="value">{contract.templateName}</span>
          </div>
          <div className="info-row">
            <span className="label">合同状态：</span>
            <span className="value">{contract.contractStatusName}</span>
          </div>
        </Card>
      )}

      {/* 模板选择区域 */}
      <div className="template-selection-section">
        <div className="section-header">
          <FileTextOutlined className="section-icon" />
          <span className="section-title">选择合同模板</span>
        </div>

        <Spin spinning={loading}>
          {templates.length === 0 && !loading ? (
            <Empty description="暂无可用模板" />
          ) : (
            <div className="template-cards-grid">
              {templates.map((template) => (
                <div
                  key={template.templateCode}
                  className={`template-card ${
                    selectedTemplate === template.templateCode ? "selected" : ""
                  }`}
                  onClick={() => setSelectedTemplate(template.templateCode)}
                >
                  {/* 选中标识 */}
                  <div className="card-check">
                    {selectedTemplate === template.templateCode ? (
                      <div className="check-icon">
                        <CheckOutlined />
                      </div>
                    ) : (
                      <div className="uncheck-icon" />
                    )}
                  </div>

                  {/* 卡片内容 */}
                  <div className="card-body">
                    <div className="template-icon">
                      <FileTextOutlined />
                    </div>
                    <div className="template-info">
                      <h3 className="template-name">{template.templateName}</h3>
                      <p className="template-code">
                        模板编号：{template.templateCode}
                      </p>
                    </div>
                  </div>

                  {/* 预览按钮 */}
                  <div className="card-footer">
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(template.templateCode);
                      }}
                      className="preview-btn"
                    >
                      预览模板
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Spin>
      </div>

      {/* 底部操作按钮 */}
      <div className="footer-actions">
        <Space size="large">
          <Button size="large" onClick={handleBack}>
            取消
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckOutlined />}
            onClick={handleConfirmSign}
            disabled={!selectedTemplate}
          >
            开始签署
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default ContractSign;
