import React, { useEffect, useState } from "react";
import { Form, InputNumber, Input, message, Spin, Checkbox, Upload, Button, Select, Space } from "antd";
import { DollarOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import {
  fetchPaymentGoods,
  createPaymentRecord,
  CreatePaymentRecordParams,
  fetchProfilesWithContracts,
  ProfileWithContract,
  fetchProfileProducts,
  ProfileProduct
} from "@/services/contract";
import { getAuthToken } from "@/utils/auth";
import { useTheme } from "@/hooks/useTheme";
import PremiumModal from "@/components/PremiumModal";
import "./QuickPaymentModal.less";

interface QuickPaymentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface PaymentItem {
  paymentItem: string;
  amount: number;
  checked: boolean;
}


const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({
  visible,
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

  // 档案和产品相关状态
  const [profiles, setProfiles] = useState<ProfileWithContract[]>([]);
  const [products, setProducts] = useState<ProfileProduct[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | undefined>(undefined);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // 加载档案列表
  const loadProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const response = await fetchProfilesWithContracts();
      if (response.data?.code === 200 && response.data?.data) {
        const uniqueProfiles = response.data.data
        setProfiles(uniqueProfiles);
      } else {
        message.error(response.data?.message || "加载档案列表失败");
        setProfiles([]);
      }
    } catch (error) {
      console.error("加载档案列表失败:", error);
      message.error("加载档案列表失败");
      setProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // 加载档案产品列表
  const loadProfileProducts = async (profileId: number) => {
    setLoadingProducts(true);
    try {
      const response = await fetchProfileProducts(profileId);
      if (response.data?.code === 200 && response.data?.data) {
        setProducts(response.data.data);
        // 如果只有一个产品，自动选中
        if (response.data.data.length === 1) {
          setSelectedProductId(response.data.data[0].id);
        }
      } else {
        message.error(response.data?.message || "加载产品列表失败");
        setProducts([]);
      }
    } catch (error) {
      console.error("加载产品列表失败:", error);
      message.error("加载产品列表失败");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // 加载回款产品列表
  const loadPaymentGoods = async () => {
    setLoading(true);
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
      loadProfiles();
      loadPaymentGoods();
      form.resetFields();
    } else {
      setPaymentItems([]);
      setManualTotalAmount(0);
      setFileList([]);
      setUploadedPaths([]);
      setProfiles([]);
      setProducts([]);
      setSelectedProfileId(undefined);
      setSelectedProductId(undefined);
    }
  }, [visible]);

  // 当选择档案时加载产品列表
  useEffect(() => {
    if (visible && selectedProfileId) {
      loadProfileProducts(selectedProfileId);
      setSelectedProductId(undefined);
      form.setFieldsValue({ productId: undefined });
    }
  }, [visible, selectedProfileId]);

  // 档案选择变化
  const handleProfileChange = (profileId: number) => {
    setSelectedProfileId(profileId);
    setSelectedProductId(undefined);
    setProducts([]);
    form.setFieldsValue({ productId: undefined });
  };

  // 产品选择变化
  const handleProductChange = (productId: number) => {
    setSelectedProductId(productId);
  };

  // 处理金额变化
  const handleAmountChange = (index: number, value: number | null) => {
    const newItems = [...paymentItems];
    newItems[index].amount = value || 0;
    if (value && value > 0) {
      newItems[index].checked = true;
    }
    setPaymentItems(newItems);
    updateTotalAmount(newItems);
  };

  // 更新总金额
  const updateTotalAmount = (items: PaymentItem[]) => {
    const total = items
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.amount, 0);
    setManualTotalAmount(total);
    form.setFieldsValue({ totalAmount: total });
  };

  // 处理复选框变化
  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newItems = [...paymentItems];
    newItems[index].checked = checked;
    setPaymentItems(newItems);
    updateTotalAmount(newItems);
  };

  // 文件上传配置
  const uploadProps = {
    name: "file",
    action: "https://ffcrm-api.1605ai.com/api/contract/upload-screenshot",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    fileList,
    accept: ".jpg,.jpeg,.png,.gif,.bmp,.webp",
    maxCount: 8,
    multiple: true,
    beforeUpload: (file: File) => {
      const isImage = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
      ].includes(file.type);
      if (!isImage) {
        message.error("只能上传jpg、jpeg、png、gif、bmp、webp格式的图片！");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("图片大小不能超过5MB！");
        return false;
      }
      return true;
    },
    onChange: (info: any) => {
      let newFileList = [...info.fileList];
      newFileList = newFileList.slice(-8);
      setFileList(newFileList);

      if (info.file.status === "done") {
        const response = info.file.response;
        if (response?.code === 200 && response?.data) {
          setUploadedPaths((prev) => [...prev, response.data]);
          message.success(`${info.file.name} 上传成功`);
        } else {
          message.error(response?.message || `${info.file.name} 上传失败`);
        }
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 上传失败`);
      }
    },
    onRemove: (file: UploadFile) => {
      const index = fileList.indexOf(file);
      if (index > -1 && uploadedPaths[index]) {
        const newPaths = [...uploadedPaths];
        newPaths.splice(index, 1);
        setUploadedPaths(newPaths);
      }
    },
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      await form.validateFields();

      if (!selectedProductId) {
        message.error("请选择产品");
        return;
      }

      if (uploadedPaths.length === 0) {
        message.error("请上传截图");
        return;
      }

      const values = form.getFieldsValue();
      const checkedItems = paymentItems.filter((item) => item.checked);

      if (checkedItems.length === 0) {
        message.error("请至少选择一个付款项目");
        return;
      }

      setSubmitting(true);

      const params: CreatePaymentRecordParams = {
        contractId: selectedProductId,
        paymentAmount: values.totalAmount,
        remark: values.remark || "",
        screenShotPaths: uploadedPaths,
        paymentItems: checkedItems.map((item) => ({
          paymentItem: item.paymentItem,
          amount: item.amount,
        })),
      };

      const response = await createPaymentRecord(params);

      if (response.data?.code === 200) {
        message.success("回款记录创建成功");
        form.resetFields();
        setFileList([]);
        setUploadedPaths([]);
        setPaymentItems([]);
        onSuccess();
      } else {
        message.error(response.data?.message || "创建回款记录失败");
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error("请填写完整信息");
      } else {
        console.error("创建回款记录失败:", error);
        message.error("创建回款记录失败");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PremiumModal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DollarOutlined style={{ color: "#8b5cf6" }} />
          <span>回款</span>
        </div>
      }
      visible={visible}
      onClose={onCancel}
      width={900}
      className={`quick-payment-modal ${isDark ? "dark-theme" : "light-theme"}`}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          {/* 档案和产品选择（PC端同一行） */}
          <div className="profile-contract-row">
            <Form.Item
              label="档案名称"
              name="profileId"
              rules={[{ required: true, message: "请选择档案" }]}
            >
              <Select
                placeholder="请选择档案"
                loading={loadingProfiles}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                onChange={handleProfileChange}
                options={profiles.map(p => ({
                  value: p.id,
                  label: p.profileName
                }))}
              />
            </Form.Item>

            <Form.Item
              label="产品"
              name="productId"
              rules={[{ required: true, message: "请选择产品" }]}
            >
              <Select
                placeholder="请先选择档案"
                loading={loadingProducts}
                disabled={!selectedProfileId}
                onChange={handleProductChange}
                options={products.map(p => ({
                  value: p.id,
                  label: p.goods
                }))}
              />
            </Form.Item>
          </div>

          {/* 付款项目 */}
          <div className="payment-items-section">
            <div className="section-title">付款项目</div>
            <div className="payment-items-grid">
              {paymentItems.map((item, index) => (
                <div key={index} className="payment-item-row">
                  <Checkbox
                    checked={item.checked}
                    onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                  >
                    {item.paymentItem}
                  </Checkbox>
                  <InputNumber
                    min={0}
                    precision={2}
                    value={item.amount}
                    onChange={(value) => handleAmountChange(index, value)}
                    placeholder="金额"
                    style={{ width: "120px" }}
                    prefix="¥"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 总金额 */}
          <Form.Item
            label="回款总金额"
            name="totalAmount"
            rules={[{ required: true, message: "请输入回款总金额" }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: "100%" }}
              prefix="¥"
              placeholder="请输入回款总金额"
              value={manualTotalAmount}
              onChange={(value) => setManualTotalAmount(value || 0)}
            />
          </Form.Item>

          {/* 备注 */}
          <Form.Item label="备注" name="remark">
            <Input.TextArea
              rows={3}
              placeholder="请输入备注信息（选填）"
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* 上传截图 */}
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
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传截图</Button>
            </Upload>
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

export default QuickPaymentModal;
