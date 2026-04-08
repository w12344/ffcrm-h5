import React, { useEffect, useState } from "react";
import { Form, InputNumber, Input, message, Spin, Checkbox, Upload, Button, Space } from "antd";
import { DollarOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import {
  fetchPaymentGoods,
  createPaymentRecord,
  CreatePaymentRecordParams
} from "@/services/contract";
import { getAuthToken } from "@/utils/auth";
import { useTheme } from "@/hooks/useTheme";
import PremiumModal from "@/components/PremiumModal";
import "./PaymentCollectionModal.less";

interface PaymentCollectionModalProps {
  visible: boolean;
  contractId: number | null;
  profileName?: string;
  goods?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface PaymentItem {
  paymentItem: string;
  amount: number;
  checked: boolean;
}

const PaymentCollectionModal: React.FC<PaymentCollectionModalProps> = ({
  visible,
  contractId,
  profileName,
  goods,
  onCancel,
  onSuccess,
}) => {
  const { isDark } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [manualTotalAmount, setManualTotalAmount] = useState<number>(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);

  // 加载回款产品列表
  const loadPaymentGoods = async () => {
    setLoading(true);
    try {
      const response = await fetchPaymentGoods();
      if (response.data?.code === 200 && response.data?.data) {
        // 初始化付款项目
        const items = response.data.data.map((item) => ({
          paymentItem: item.name,
          amount: 0,
          checked: false,
        }));
        setPaymentItems(items);
      } else {
        message.error(response.data?.message || "加载产品列表失败");
      }
    } catch (error) {
      console.error("加载产品列表失败:", error);
      message.error("加载产品列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 当弹窗打开时加载数据
  useEffect(() => {
    if (visible) {
      loadPaymentGoods();
      form.resetFields();
    } else {
      setPaymentItems([]);
      setManualTotalAmount(0);
      setFileList([]);
      setUploadedPaths([]);
    }
  }, [visible]);

  // 处理金额变化
  const handleAmountChange = (index: number, value: number | null) => {
    const newItems = [...paymentItems];
    newItems[index].amount = value || 0;
    // 输入金额自动勾选
    if (value && value > 0) {
      newItems[index].checked = true;
    }
    setPaymentItems(newItems);
    // 自动计算总金额
    updateTotalAmount(newItems);
  };

  // 更新总金额
  const updateTotalAmount = (items: PaymentItem[]) => {
    const total = items
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.amount, 0);
    setManualTotalAmount(total);
  };

  // 处理复选框变化
  const handleCheckChange = (index: number, checked: boolean) => {
    const newItems = [...paymentItems];
    newItems[index].checked = checked;
    // 取消勾选时清空金额
    if (!checked) {
      newItems[index].amount = 0;
    }
    setPaymentItems(newItems);
    // 自动计算总金额
    updateTotalAmount(newItems);
  };

  // 处理图片上传
  const handleUploadChange = ({ fileList: newFileList, file }: any) => {
    setFileList(newFileList);

    // 上传成功时保存图片路径
    if (file.status === "done" && file.response) {
      console.log("上传成功，响应数据:", file.response);

      // 从响应中获取图片地址
      if (file.response.code === 200 && file.response.data) {
        setUploadedPaths((prev) => [...prev, file.response.data]);
      } else {
        console.error("上传失败:", file.response);
        message.error(file.response.message || "截图上传失败");
      }
    } else if (file.status === "error") {
      message.error("截图上传失败，请重试");
    } else if (file.status === "removed") {
      // 删除图片时从路径列表中移除
      const removedUrl = file.response?.data;
      if (removedUrl) {
        setUploadedPaths((prev) => prev.filter((path) => path !== removedUrl));
      }
    }
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!contractId) {
      message.error("合同ID不能为空");
      return;
    }

    try {
      const values = await form.validateFields();

      // 获取选中的付款项目
      const selectedItems = paymentItems
        .filter((item) => item.checked && item.amount > 0)
        .map((item) => ({
          paymentItem: item.paymentItem,
          amount: item.amount,
        }));

      if (selectedItems.length === 0) {
        message.error("请至少选择一个付款项目并输入金额");
        return;
      }

      // 使用已上传的图片路径
      const screenShotPaths = uploadedPaths;

      const params: CreatePaymentRecordParams = {
        contractId,
        paymentItems: selectedItems,
        paymentAmount: manualTotalAmount,
        screenShotPaths,
        remark: values.remark || "",
      };

      setSubmitting(true);
      const response = await createPaymentRecord(params);

      if (response.data?.code === 200) {
        message.success("回款记录创建成功！");
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.data?.message || "创建回款记录失败");
      }
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误，不显示消息
        return;
      }
      message.error(error?.message || "创建回款记录失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PremiumModal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.267rem" }}>
          <DollarOutlined style={{ color: "var(--color-purple-primary)" }} />
          <span>回款</span>
        </div>
      }
      visible={visible}
      onClose={onCancel}
      width={1100}
      destroyOnClose
      className="payment-collection-modal"
    >
      <Spin spinning={loading}>
        {/* 档案和产品信息 */}
        {(profileName || goods) && (
          <div
            className="contract-info-card"
            style={{
              marginBottom: "0.533rem",
              padding: "0.4rem 0.533rem",
              background: isDark
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(139, 92, 246, 0.05)",
              borderRadius: "0.213rem",
              border: `1px solid ${
                isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.06)"
              }`,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "0.267rem 0.4rem",
                alignItems: "center",
              }}
            >
              {profileName && (
                <>
                  <span
                    style={{
                      color: isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.45)",
                      fontSize: "0.32rem",
                    }}
                  >
                    档案名称：
                  </span>
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: "0.373rem",
                      color: isDark ? "#ffffff" : "rgba(0, 0, 0, 0.88)",
                    }}
                  >
                    {profileName}
                  </span>
                </>
              )}
              {goods && (
                <>
                  <span
                    style={{
                      color: isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.45)",
                      fontSize: "0.32rem",
                    }}
                  >
                    产品：
                  </span>
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: "0.373rem",
                      color: isDark ? "#ffffff" : "rgba(0, 0, 0, 0.88)",
                    }}
                  >
                    {goods}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <Form form={form} layout="vertical" autoComplete="off">
          {/* 付款项目列表 */}
          <div className="payment-items-section">
            <div className="section-title">付款项目</div>
            <div className="payment-items-grid">
              {paymentItems.map((item, index) => (
                <div key={index} className="payment-item-row">
                  <Checkbox
                    checked={item.checked}
                    onChange={(e) => handleCheckChange(index, e.target.checked)}
                  >
                    {item.paymentItem}
                  </Checkbox>
                  <InputNumber
                    style={{ width: "120px" }}
                    placeholder="金额"
                    prefix="¥"
                    min={0}
                    precision={2}
                    value={item.amount || undefined}
                    onChange={(value) => handleAmountChange(index, value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 总回款金额输入 */}
          <div
            style={{
              marginBottom: "0.533rem",
              padding: "0.4rem 0.533rem",
              background: isDark
                ? "rgba(139, 92, 246, 0.1)"
                : "rgba(139, 92, 246, 0.05)",
              borderRadius: "0.213rem",
              border: `1px solid ${
                isDark
                  ? "rgba(139, 92, 246, 0.2)"
                  : "rgba(139, 92, 246, 0.15)"
              }`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span
              style={{
                fontSize: "0.373rem",
                color: isDark
                  ? "rgba(255, 255, 255, 0.85)"
                  : "rgba(0, 0, 0, 0.88)",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              总回款金额：
            </span>
            <InputNumber
              style={{ flex: 1, maxWidth: "4rem" }}
              prefix="¥"
              min={0}
              precision={2}
              value={manualTotalAmount}
              onChange={(value) => setManualTotalAmount(value || 0)}
            />
          </div>

          {/* 图片上传 */}
          <Form.Item
            label="上传截图"
            name="screenShot"
            rules={[
              {
                required: true,
                validator: async () => {
                  if (fileList.length === 0) {
                    return Promise.reject(new Error('请上传截图'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra="支持jpg、jpeg、png、gif、bmp、webp格式，最大5MB，最多8张"
          >
            <Upload
              action="https://ffcrm-api.1605ai.com/api/contract/upload-screenshot"
              name="file"
              listType="picture"
              fileList={fileList}
              headers={{
                Authorization: `Bearer ${getAuthToken()}`,
              }}
              onChange={handleUploadChange}
              maxCount={8}
              accept=".jpg,.jpeg,.png,.gif,.bmp,.webp"
              beforeUpload={(file) => {
                const isImage = [
                  "image/jpeg",
                  "image/jpg",
                  "image/png",
                  "image/gif",
                  "image/bmp",
                  "image/webp",
                ].includes(file.type);
                if (!isImage) {
                  message.error(
                    "只能上传jpg、jpeg、png、gif、bmp、webp格式的图片！"
                  );
                  return false;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error("图片大小不能超过5MB！");
                  return false;
                }
                return true;
              }}
              multiple
            >
              <Button icon={<UploadOutlined />}>上传截图</Button>
            </Upload>
          </Form.Item>

          {/* 备注 */}
          <Form.Item label="备注" name="remark">
            <Input.TextArea
              rows={3}
              placeholder="请输入备注信息（可选）"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Spin>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '20px',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        marginTop: '8px'
      }}>
        <Space size={16}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={submitting}>确认回款</Button>
        </Space>
      </div>
    </PremiumModal>
  );
};

export default PaymentCollectionModal;
