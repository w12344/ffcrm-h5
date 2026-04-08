import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Upload,
  Button,
  message,
  Select,
  Switch,
  Checkbox,
  Spin,
  Space
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import {
  createContract,
  CreateContractParams,
  fetchProfileList,
  ProfileOption,
  fetchGoodsList,
  GoodsOption,
  fetchSelectionList,
  SelectionItem,
  fetchPaymentGoods,
  searchProfilesWithContracts,
  getContractDetailByProfile,
  ProfileWithContract,
} from "@/services/contract";
import { getAuthToken, getCurrentUserInfo } from "@/utils/auth";
import PremiumModal from "@/components/PremiumModal";

interface AddContractModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface PaymentItem {
  paymentItem: string;
  amount: number;
  checked: boolean;
}

// 省份枚举
const PROVINCES = [
  "北京",
  "天津",
  "河北",
  "山西",
  "内蒙古",
  "辽宁",
  "吉林",
  "黑龙江",
  "上海",
  "江苏",
  "浙江",
  "安徽",
  "福建",
  "江西",
  "山东",
  "河南",
  "湖北",
  "湖南",
  "广东",
  "广西",
  "海南",
  "重庆",
  "四川",
  "贵州",
  "云南",
  "西藏",
  "陕西",
  "甘肃",
  "青海",
  "宁夏",
  "新疆",
  "台湾",
  "香港",
  "澳门",
];

// 机构和来源将从接口动态加载，不再使用硬编码

// 专业枚举
const MAJORS = [
  "美术",
  "书法",
  "舞蹈",
  "音乐",
  "表演",
  "播音",
  "纯文化",
  "体育",
  "戏表",
];


// 年级枚举（20届-40届）
const GRADES = Array.from({ length: 21 }, (_, i) => `${20 + i}届`);

const AddContractModal: React.FC<AddContractModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [profileList, setProfileList] = useState<ProfileOption[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [goodsList, setGoodsList] = useState<GoodsOption[]>([]);
  const [goodsLoading, setGoodsLoading] = useState(false);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);
  const [institutionList, setInstitutionList] = useState<SelectionItem[]>([]);
  const [sourceList, setSourceList] = useState<SelectionItem[]>([]);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);

  // COACH角色相关状态
  const isCoach = (() => {
    const userInfo = getCurrentUserInfo();
    const roles = userInfo?.roles;
    if (Array.isArray(roles)) {
      return roles.includes("COACH");
    }
    return roles === "COACH";
  })();
  const [coachProfileOptions, setCoachProfileOptions] = useState<ProfileWithContract[]>([]);
  const [coachProfileSearchLoading, setCoachProfileSearchLoading] = useState(false);

  // 加载客户档案列表、产品列表和选项列表
  useEffect(() => {
    if (visible) {
      loadProfileList();
      loadGoodsList();
      loadSelectionList();
      loadPaymentGoods();
    } else {
      // 关闭弹窗时重置付款项目
      setPaymentItems([]);
      setCalculatedAmount(0);
      setCoachProfileOptions([]);
    }
  }, [visible]);

  // 当选择客户档案时，自动填充学生姓名和年级
  const handleProfileChange = (profileId: number) => {
    const selectedProfile:any = profileList.find((p) => p.id === profileId);
    if (selectedProfile) {
      const fieldsToUpdate: any = {};

      // 从 editionNumStr 中提取年级（例如："26届"）
      if (selectedProfile.editionNumStr) {
        fieldsToUpdate.studentGrade = selectedProfile.editionNumStr;
      }

      // 从 remarkName 中提取学生姓名
      if (selectedProfile.remarkName) {
        fieldsToUpdate.studentName = selectedProfile.remarkName;
      }

      // 如果API返回了studentName字段，优先使用
      if (selectedProfile.studentName) {
        fieldsToUpdate.studentName = selectedProfile.studentName;
      }

      // 如果API返回了studentGrade字段，优先使用
      if (selectedProfile.studentGrade) {
        fieldsToUpdate.studentGrade = selectedProfile.studentGrade;
      }

      // 批量更新表单字段
      if (Object.keys(fieldsToUpdate).length > 0) {
        form.setFieldsValue(fieldsToUpdate);
      }
    }
  };

  // COACH角色：搜索客户档案
  const handleCoachProfileSearch = async (value: string) => {
    if (!value || value.trim() === "") {
      setCoachProfileOptions([]);
      return;
    }
    setCoachProfileSearchLoading(true);
    try {
      const response = await searchProfilesWithContracts(value.trim());
      if (response.data.code === 200) {
        setCoachProfileOptions(response.data.data || []);
      } else {
        message.error("搜索客户档案失败");
      }
    } catch (error) {
      console.error("搜索客户档案失败:", error);
      message.error("搜索客户档案失败");
    } finally {
      setCoachProfileSearchLoading(false);
    }
  };

  // COACH角色：选择客户档案后，调用接口获取合同详情并填充表单
  const handleCoachProfileChange = async (profileId: number) => {
    if (!profileId) return;
    try {
      const response = await getContractDetailByProfile(profileId);
      if (response.data.code === 200 && response.data.data) {
        const detail = response.data.data;
        const fieldsToUpdate: any = {};
        if (detail.studentName) fieldsToUpdate.studentName = detail.studentName;
        if (detail.studentGrade) fieldsToUpdate.studentGrade = detail.studentGrade;
        if (detail.studentProvince) fieldsToUpdate.studentProvince = detail.studentProvince;
        if (detail.studentInstitution) fieldsToUpdate.studentInstitution = detail.studentInstitution;
        if (detail.studentMajors) fieldsToUpdate.studentMajors = detail.studentMajors;
        if (detail.currentSchool) fieldsToUpdate.currentSchool = detail.currentSchool;
        if (detail.studentSource) fieldsToUpdate.studentSource = detail.studentSource;
        if (detail.gender) fieldsToUpdate.gender = detail.gender;
        if (detail.goods) fieldsToUpdate.goods = detail.goods;
        if (detail.contractCash != null) fieldsToUpdate.contractCash = detail.contractCash;
        if (Object.keys(fieldsToUpdate).length > 0) {
          form.setFieldsValue(fieldsToUpdate);
        }
      }
    } catch (error) {
      console.error("获取合同详情失败:", error);
    }
  };

  const loadProfileList = async () => {
    setProfileLoading(true);
    try {
      const response = await fetchProfileList();
      if (response.data.code === 200) {
        setProfileList(response.data.data);
      } else {
        message.error("加载客户档案列表失败");
      }
    } catch (error) {
      console.error("加载客户档案列表失败:", error);
      message.error("加载客户档案列表失败");
    } finally {
      setProfileLoading(false);
    }
  };

  const loadGoodsList = async () => {
    setGoodsLoading(true);
    try {
      const response = await fetchGoodsList();
      if (response.data.code === 200) {
        setGoodsList(response.data.data);
      } else {
        message.error("加载产品列表失败");
      }
    } catch (error) {
      console.error("加载产品列表失败:", error);
      message.error("加载产品列表失败");
    } finally {
      setGoodsLoading(false);
    }
  };

  const loadSelectionList = async () => {
    setSelectionLoading(true);
    try {
      const response = await fetchSelectionList();
      if (response.data.code === 200) {
        const allSelections = response.data.data;
        // 根据 key 字段过滤机构和来源
        const institutionGroup = allSelections.find(
          (item) => item.key === "form_selection_contract_institution"
        );
        const sourceGroup = allSelections.find(
          (item) => item.key === "form_selection_contract_source"
        );
        setInstitutionList(institutionGroup?.selections || []);
        setSourceList(sourceGroup?.selections || []);
      } else {
        message.error("加载选项列表失败");
      }
    } catch (error) {
      console.error("加载选项列表失败:", error);
      message.error("加载选项列表失败");
    } finally {
      setSelectionLoading(false);
    }
  };

  const loadPaymentGoods = async () => {
    setPaymentLoading(true);
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
    // 输入金额自动勾选
    if (value && value > 0) {
      newItems[index].checked = true;
    }
    setPaymentItems(newItems);
    // 自动计算总金额
    updateCalculatedAmount(newItems);
  };

  // 更新计算的总金额
  const updateCalculatedAmount = (items: PaymentItem[]) => {
    const total = items
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.amount, 0);
    setCalculatedAmount(total);
    // 同步更新表单的实收金额字段
    form.setFieldsValue({ orderCash: total });
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
    updateCalculatedAmount(newItems);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const params: CreateContractParams = {
        customerProfileId: values.customerProfileId,
        studentName: values.studentName,
        gender: values.gender,
        goods: values.goods,
        studentGrade: values.studentGrade,
        studentProvince: values.studentProvince,
        studentInstitution: values.studentInstitution,
        studentMajors: values.studentMajors,
        currentSchool: values.currentSchool,
        studentSource: values.studentSource,
        contractCash: values.contractCash,
        orderDate: values.orderDate.format("YYYY-MM-DD"),
        orderCash: values.orderCash,
        remark: values.remark,
        screenShotPaths: uploadedPaths,
        isNotify: values.isNotify,
        isRenewal: values.isRenewal,
        discountAmount: values.discountAmount,
        discountRemark: values.discountRemark,
        paymentItems: paymentItems
          .filter(item => item.checked && item.amount > 0)
          .map(item => ({
            paymentItem: item.paymentItem,
            amount: item.amount
          })),
      };

      const response = await createContract(params);

      if (response.data.code === 200) {
        message.success("添加成单成功");
        handleCancel();
        onSuccess();
      } else {
        message.error(response.data.message || "添加成单失败");
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error("请填写完整信息");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setUploadedPaths([]);
    onCancel();
  };

  return (
    <PremiumModal
      title="添加成单"
      visible={visible}
      onClose={handleCancel}
      width={900}
      destroyOnClose
      className="add-contract-modal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          orderDate: dayjs(),
          isNotify: true,
          isRenewal: false,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0 16px",
          }}
        >
          <Form.Item
            label="客户档案"
            name="customerProfileId"
            rules={[{ required: true, message: "请选择客户档案" }]}
          >
            {isCoach ? (
              <Select
                placeholder="输入档案名称搜索"
                showSearch
                allowClear
                filterOption={false}
                loading={coachProfileSearchLoading}
                onSearch={handleCoachProfileSearch}
                onChange={handleCoachProfileChange}
                notFoundContent={coachProfileSearchLoading ? <Spin size="small" /> : null}
                options={coachProfileOptions.map((profile) => ({
                  value: profile.id,
                  label: `${profile.id}-${profile.profileName}-${profile.editionNum || profile.editionNumStr || ''}-${profile.salesName || ''}`,
                }))}
              />
            ) : (
              <Select
                placeholder="请选择客户档案"
                loading={profileLoading}
                showSearch
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                onChange={handleProfileChange}
                options={profileList.map((profile) => ({
                  value: profile.id,
                  label: `${profile.remarkName} (${profile.editionNumStr})`,
                }))}
              />
            )}
          </Form.Item>

          <Form.Item
            label="学生姓名"
            name="studentName"
            rules={[{ required: true, message: "请输入学生姓名" }]}
          >
            <Input placeholder="请输入学生姓名" />
          </Form.Item>

          <Form.Item
            label="性别"
            name="gender"
            rules={[{ required: true, message: "请选择性别" }]}
          >
            <Select
              placeholder="请选择性别"
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              <Select.Option value="男">男</Select.Option>
              <Select.Option value="女">女</Select.Option>
            </Select>
          </Form.Item>

          <div className="product-renewal-wrapper">
            <Form.Item
              label="产品"
              name="goods"
              rules={[{ required: true, message: "请选择产品" }]}
              className="product-field"
            >
              <Select
                placeholder="请选择产品"
                loading={goodsLoading}
                showSearch
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={goodsList.map((goods) => ({
                  value: goods.name,
                  label: goods.name,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="是否续产品"
              name="isRenewal"
              valuePropName="checked"
              className="renewal-field"
            >
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="年级"
            name="studentGrade"
            rules={[{ required: true, message: "请选择年级" }]}
          >
            <Select
              placeholder="请选择年级"
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {GRADES.map((grade) => (
                <Select.Option key={grade} value={grade}>
                  {grade}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="省份"
            name="studentProvince"
            rules={[{ required: true, message: "请选择省份" }]}
          >
            <Select
              placeholder="请选择省份"
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {PROVINCES.map((province) => (
                <Select.Option key={province} value={province}>
                  {province}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="机构"
            name="studentInstitution"
            rules={[{ required: true, message: "请选择机构" }]}
          >
            <Select
              placeholder="请选择机构"
              showSearch
              allowClear
              loading={selectionLoading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {institutionList.map((institution, index) => (
                <Select.Option
                  key={institution.key || institution.value || index}
                  value={institution.value}
                >
                  {institution.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="专业"
            name="studentMajors"
            rules={[{ required: true, message: "请选择专业" }]}
          >
            <Select
              placeholder="请选择专业"
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {MAJORS.map((major) => (
                <Select.Option key={major} value={major}>
                  {major}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="原学校" name="currentSchool">
            <Input placeholder="请输入原学校（选填）" />
          </Form.Item>

          <Form.Item
            label="来源"
            name="studentSource"
            rules={[{ required: true, message: "请选择来源" }]}
          >
            <Select
              placeholder="请选择来源"
              showSearch
              allowClear
              loading={selectionLoading}
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {sourceList.map((source, index) => (
                <Select.Option
                  key={source.key || source.value || index}
                  value={source.value}
                >
                  {source.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="合同金额"
            name="contractCash"
            rules={[{ required: true, message: "请输入合同金额" }]}
          >
            <InputNumber
              placeholder="请输入合同金额"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            label="成交日期"
            name="orderDate"
            rules={[{ required: true, message: "请选择成交日期" }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="请选择成交日期"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        {/* 付款项目列表 */}
        <Spin spinning={paymentLoading}>
          <div className="payment-items-section" style={{ marginBottom: "16px" }}>
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

        {/* 实收金额 - 自动计算 */}
        <Form.Item
          label="实收金额"
          name="orderCash"
          rules={[{ required: true, message: "请输入实收金额" }]}
          tooltip="根据选中的付款项目自动计算"
        >
          <InputNumber
            placeholder="自动计算"
            style={{ width: "100%" }}
            min={0}
            precision={2}
            prefix="¥"
            value={calculatedAmount}
            readOnly
            disabled
          />
        </Form.Item>

        {/* 优惠金额和赠送说明 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 16px",
          }}
        >
          <Form.Item
            label="优惠金额"
            name="discountAmount"
          >
            <InputNumber
              placeholder="请输入优惠金额（选填）"
              style={{ width: "100%" }}
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            label="赠送说明"
            name="discountRemark"
          >
            <Input placeholder="请输入赠送说明（选填）" />
          </Form.Item>
        </div>

        <Form.Item label="备注" name="remark">
          <Input.TextArea
            placeholder="请输入备注（选填）"
            rows={2}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="支付截图上传"
          name="screenShot"
          rules={[
            {
              required: true,
              validator: async () => {
                if (fileList.length === 0) {
                  return Promise.reject(new Error('请上传支付截图'));
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
            onChange={({ fileList: newFileList, file }) => {
              setFileList(newFileList);

              // 上传成功时保存图片路径
              if (file.status === "done" && file.response) {
                console.log("上传成功，响应数据:", file.response);

                // 从响应中获取图片地址
                if (file.response.code === 200 && file.response.data) {
                  setUploadedPaths((prev) => [...prev, file.response.data]);
                  console.log("保存截图路径:", file.response.data);
                } else {
                  console.error("上传失败:", file.response);
                  message.error(file.response.message || "支付截图上传失败");
                }
              } else if (file.status === "error") {
                message.error("支付截图上传失败，请重试");
              } else if (file.status === "removed") {
                // 删除图片时从路径列表中移除
                const removedUrl = file.response?.data;
                if (removedUrl) {
                  setUploadedPaths((prev) => prev.filter((path) => path !== removedUrl));
                }
              }
            }}
            maxCount={8}
            multiple
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
          >
            <Button icon={<UploadOutlined />}>上传截图</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="往群里发通知"
          name="isNotify"
          valuePropName="checked"
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
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
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>提交</Button>
        </Space>
      </div>
    </PremiumModal>
  );
};

export default AddContractModal;
