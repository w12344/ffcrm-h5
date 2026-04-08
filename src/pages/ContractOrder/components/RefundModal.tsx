import React, { useEffect, useState } from "react";
import { Form, InputNumber, Input, message, DatePicker, Upload, Select, Checkbox, Spin, Button, Space } from "antd";
import { DollarOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import dayjs from "dayjs";
import { getAuthToken } from "@/utils/auth";
import {
  refundContract,
  RefundContractParams,
  fetchPaymentGoods
} from "@/services/contract";
import { useTheme } from "@/hooks/useTheme";
import PremiumModal from "@/components/PremiumModal";
import "./RefundModal.less";

interface RefundModalProps {
  visible: boolean;
  contractId: number | null;
  orderCash: number;
  profileName?: string;
  goods?: string;
  studentName?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface RefundFormValues {
  refundType: string;
  refundReason: string;
  refundCash: number;
  refundDate: string;
  payeeName: string;
  payeeBank: string;
  payeeBankNumber: string;
  refundRemark: string;
}

interface PaymentItem {
  paymentItem: string;
  amount: number;
  checked: boolean;
}

// 退费类型枚举
const REFUND_TYPE_OPTIONS = [
  { label: "【退费】课次/多次", value: "退费-课次/多次" },
  { label: "【退食宿费】", value: "退食宿费" },
  { label: "【退定金】原学校限制", value: "退定金-原学校限制" },
  { label: "【退定金】专业/机构限制", value: "退定金-专业/机构限制" },
  { label: "【退定金】投档限制", value: "退定金-投档限制" },
  { label: "【退定金】转变升学途径", value: "退定金-转变升学途径" },
  { label: "【退学费】教学交付不满", value: "退学费-教学交付不满" },
  { label: "【退学费】运营交付不满", value: "退学费-运营交付不满" },
  { label: "【退学费】提前结业", value: "退学费-提前结业" },
  { label: "【退学费】个性化退费", value: "退学费-个性化退费" },
];

const RefundModal: React.FC<RefundModalProps> = ({
  visible,
  contractId,
  orderCash,
  goods,
  studentName,
  onCancel,
  onSuccess,
}) => {
  const { isDark } = useTheme();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

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

  // 加载付款项目
  const loadPaymentGoods = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetchPaymentGoods();
      if (response.data?.code === 200 && response.data?.data) {
        const items = response.data.data.map((item) => ({
          paymentItem: item.name,
          amount: 0,
          checked: false,
        }));
        setPaymentItems(items);
      } else {
        message.error(response.data?.message || "加载付款项目失败");
      }
    } catch (error) {
      console.error("加载付款项目失败:", error);
      message.error("加载付款项目失败");
    } finally {
      setPaymentLoading(false);
    }
  };

  // 处理金额变化
  const handleAmountChange = (index: number, value: number | null) => {
    const newItems = [...paymentItems];
    newItems[index].amount = value || 0;
    if (value && value > 0) {
      newItems[index].checked = true;
    }
    setPaymentItems(newItems);
    updateCalculatedAmount(newItems);
  };

  // 更新计算的总金额
  const updateCalculatedAmount = (items: PaymentItem[]) => {
    const total = items
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.amount, 0);
    setCalculatedAmount(total);
    form.setFieldsValue({ refundCash: total });
  };

  // 处理复选框变化
  const handleCheckChange = (index: number, checked: boolean) => {
    const newItems = [...paymentItems];
    newItems[index].checked = checked;
    if (!checked) {
      newItems[index].amount = 0;
    }
    setPaymentItems(newItems);
    updateCalculatedAmount(newItems);
  };

  // 当弹窗打开时重置表单并设置默认值
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setFileList([]);
      setUploadedPaths([]);
      loadPaymentGoods();
      // 设置默认值
      form.setFieldsValue({
        refundDate: dayjs(), // 默认今天
        payeeName: studentName || '', // 默认学生姓名
      });
    } else {
      setPaymentItems([]);
      setCalculatedAmount(0);
    }
  }, [visible, form, studentName]);

  // 处理提交
  const handleSubmit = async () => {
    if (!contractId) {
      message.error("合同ID不能为空");
      return;
    }

    try {
      const values: RefundFormValues = await form.validateFields();

      if (values.refundCash <= 0) {
        message.error("退款金额必须大于0");
        return;
      }

      if (values.refundCash > orderCash) {
        message.error("退款金额不能超过订单金额");
        return;
      }

      // 使用已上传的图片路径
      const screenShotPaths = uploadedPaths;

      const params: RefundContractParams = {
        contractId,
        refundCash: values.refundCash,
        refundType: values.refundType,
        refundReason: values.refundReason,
        refundDate: dayjs(values.refundDate).format('YYYY-MM-DD'),
        payeeName: values.payeeName,
        payeeBank: values.payeeBank,
        payeeBankNumber: values.payeeBankNumber,
        refundRemark: values.refundRemark || "",
        screenShotPaths,
        paymentItems: paymentItems
          .filter(item => item.checked && item.amount > 0)
          .map(item => ({
            paymentItem: item.paymentItem,
            amount: item.amount
          })),
      };

      setSubmitting(true);
      const response = await refundContract(params);

      if (response.data?.code === 200) {
        message.success("退款成功！");
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.data?.message || "退款失败");
      }
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误，不显示消息
        return;
      }
      message.error(error?.message || "退款失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PremiumModal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "0.267rem" }}>
          <DollarOutlined style={{ color: "var(--color-purple-primary)" }} />
          <span>退款申请</span>
        </div>
      }
      visible={visible}
      onClose={onCancel}
      width={800}
      destroyOnClose
      className="refund-modal"
    >
      {/* 合同信息卡片 */}
        <div
          className="contract-info-card"
          style={{
            marginBottom: "0.4rem",
            padding: "0.32rem 0.4rem",
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
              gap: "0.16rem 0.32rem",
              alignItems: "center",
            }}
          >
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
            {studentName && (
              <>
                <span
                  style={{
                    color: isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.45)",
                    fontSize: "0.32rem",
                  }}
                >
                  学生姓名：
                </span>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "0.373rem",
                    color: isDark ? "#ffffff" : "rgba(0, 0, 0, 0.88)",
                  }}
                >
                  {studentName}
                </span>
              </>
            )}
            <span
              style={{
                color: isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.45)",
                fontSize: "0.32rem",
              }}
            >
              订单金额：
            </span>
            <span
              style={{
                color: "#06b6d4",
                fontWeight: 600,
                fontSize: "0.427rem",
              }}
            >
              ¥{orderCash?.toLocaleString("zh-CN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
        </div>

        {/* 退款表单 */}
        <Form form={form} layout="vertical" autoComplete="off" className="refund-form">
          <div className="form-grid">
            {/* 退费类型 */}
            <Form.Item
              label="退费类型"
              name="refundType"
              rules={[{ required: true, message: "请选择退费类型" }]}
            >
              <Select placeholder="请选择" options={REFUND_TYPE_OPTIONS} />
            </Form.Item>

            {/* 退费原因 */}
            <Form.Item
              label="退费原因"
              name="refundReason"
              rules={[{ required: true, message: "请输入退费原因" }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>

            {/* 发生时间 */}
            <Form.Item
              label="发生时间"
              name="refundDate"
              style={{ marginTop: "0.267rem" }}
              rules={[{ required: true, message: "请选择发生时间" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="请选择"
                format="YYYY-MM-DD"
              />
            </Form.Item>

            {/* 收款人姓名 */}
            <Form.Item
              label="收款人姓名"
              name="payeeName"
              rules={[{ required: true, message: "请输入收款人姓名" }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>

            {/* 开户行 */}
            <Form.Item
              label="开户行"
              name="payeeBank"
              rules={[{ required: true, message: "请输入开户行" }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>

            {/* 银行账号 */}
            <Form.Item
              label="银行账号"
              name="payeeBankNumber"
              rules={[{ required: true, message: "请输入银行账号" }]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </div>

          {/* 付款项目列表 */}
          <Spin spinning={paymentLoading}>
            <div className="payment-items-section" style={{ marginBottom: "16px", marginTop: "16px" }}>
              <div className="section-title" style={{
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "12px",
                color: "var(--text-primary)"
              }}>付款项目</div>
              <div className="payment-items-grid">
                {paymentItems.map((item, index) => (
                  <div
                    key={index}
                    className={`payment-item-card ${item.checked ? 'checked' : ''}`}
                  >
                    <Checkbox
                      checked={item.checked}
                      onChange={(e) => handleCheckChange(index, e.target.checked)}
                    >
                      <span className="payment-item-label">{item.paymentItem}</span>
                    </Checkbox>
                    <InputNumber
                      className="payment-item-input"
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
          </Spin>

          {/* 退费金额 - 自动计算 */}
          <Form.Item
            label="退费金额"
            name="refundCash"
            rules={[{ required: true, message: "请输入退费金额" }]}
            tooltip="根据选中的付款项目自动计算"
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="自动计算"
              addonBefore="CNY-人民币"
              min={0}
              max={orderCash}
              precision={2}
              value={calculatedAmount}
              readOnly
              disabled
            />
          </Form.Item>

          {/* 备注 - 全宽 */}
          <Form.Item label="备注" name="refundRemark" className="full-width-item">
            <Input.TextArea
              rows={3}
              placeholder="请输入"
              maxLength={200}
              showCount
            />
          </Form.Item>

          {/* 图片上传 - 全宽 */}
          <Form.Item
            label="图片"
            className="full-width-item"
            extra="支持jpg、jpeg、png、gif、bmp、webp格式，最大5MB，最多8张"
          >
            <Upload
              action="https://ffcrm-api.1605ai.com/api/contract/upload-screenshot"
              name="file"
              listType="picture-card"
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
              {fileList.length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid rgba(0,0,0,0.04)',
          marginTop: '8px'
        }}>
          <Space size={16}>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>确认退款</Button>
          </Space>
        </div>
    </PremiumModal>
  );
};

export default RefundModal;
