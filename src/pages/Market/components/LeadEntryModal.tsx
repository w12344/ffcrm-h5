import React, { useState, useEffect } from 'react';
import { Form, message, notification, Tabs, Row, Col, Input, Select, Rate } from 'antd';
import { InboxOutlined, FileExcelOutlined, UserOutlined, HistoryOutlined } from '@ant-design/icons';
import PremiumModal from '@/components/PremiumModal';
import { PremiumUploadDragger } from '@/components/PremiumForm';
import GlassInput from '@/components/GlassInput';
import GlassSelect from '@/components/GlassSelect';
import GlassDatePicker from '@/components/GlassDatePicker';
import GlassTable from '@/components/GlassTable';
import { GlassColumnType } from '@/components/GlassTable/types';
import type { UploadProps } from 'antd';
import { fetchSelectionList, SelectionItem } from "@/services/contract";
import './LeadEntryModal.less';

const { Option } = Select;

// 线索来源（成交来源分类）硬编码枚举
const LEAD_SOURCES = [
  "A类",
  "B类",
  "线上一类",
  "廖-二类",
  "廖-一类",
  "转介绍（参与活动）",
  "转介绍（未参与活动）",
  "转介绍（后端提供线索）",
  "转介绍（个性化）",
  "转介绍（续班）",
  "小红书（嘉）",
  "自拓-视频号",
  "自拓-抖音",
  "自拓-小红书",
  "自拓-地推",
  "自拓-其他",
  "朱辉-视频号",
  "朱辉-小红书",
  "朱辉-抖音",
  "品宣",
  "渠道内名单",
  "私人代理",
  "往届非凡",
  "直上",
  "线下市场",
  "未知",
  "其他",
];

interface LeadEntryModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  themeMode?: 'dark' | 'light';
}

const LeadEntryModal: React.FC<LeadEntryModalProps> = ({ visible, onCancel, onOk, themeMode = 'dark' }) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [manualForm] = Form.useForm();
  const [importForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [institutionList, setInstitutionList] = useState<SelectionItem[]>([]);
  const [_sourceList, setSourceList] = useState<SelectionItem[]>([]);
  const [selectionLoading, setSelectionLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSelectionList();
    }
  }, [visible]);

  const loadSelectionList = async () => {
    setSelectionLoading(true);
    try {
      const response = await fetchSelectionList();
      if (response.data.code === 200) {
        const data = response.data.data;
        const institutions = data.find((group: any) => group.key === 'form_selection_contract_institution')?.selections || [];
        const sources = data.find((group: any) => group.key === 'form_selection_contract_source')?.selections || [];
        setInstitutionList(institutions);
        setSourceList(sources);
      }
    } catch (error) {
      console.error("获取选项列表失败:", error);
    } finally {
      setSelectionLoading(false);
    }
  };

  const [historyRecords, setHistoryRecords] = useState<any[]>([
    { id: '1', time: '2026-03-20 10:30:00', filename: '2026春季意向名单.xlsx', total: 100, success: 85, duplicate: 15, operator: '王静', status: 'success' },
    { id: '2', time: '2026-03-18 15:20:00', filename: '小红书引流数据0318.csv', total: 50, success: 50, duplicate: 0, operator: '张明', status: 'success' }
  ]);

  const historyColumns: GlassColumnType<any>[] = [
    { title: '导入时间', dataIndex: 'time', key: 'time', width: 160 },
    { title: '文件名称', dataIndex: 'filename', key: 'filename', width: 220, ellipsis: true },
    { title: '总条数', dataIndex: 'total', key: 'total', width: 80 },
    { title: '成功导入', dataIndex: 'success', key: 'success', width: 100, render: (val: number) => <span style={{color: '#52c41a'}}>{val}</span> },
    { title: '重复跳过', dataIndex: 'duplicate', key: 'duplicate', width: 100, render: (val: number) => <span style={{color: '#faad14'}}>{val}</span> },
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: () => <span style={{color: '#52c41a'}}>完成</span> }
  ];

  // --- Bulk Import Logic ---
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    accept: '.xlsx, .xls, .csv',
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    }
  };

  const handleManualSubmit = () => {
    manualForm.validateFields().then(values => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        onOk({ type: 'manual', ...values });
        notification.success({
          message: '保存成功',
          description: `线索 [${values.name}] 已成功录入。`,
          placement: 'topRight',
        });
        manualForm.resetFields();
        setLoading(false);
      }, 800);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleImportSubmit = () => {
    importForm.validateFields().then(values => {
      if (fileList.length === 0) {
        message.warning('请先上传 Excel 文件');
        return;
      }
      setLoading(true);
      // Simulate API call and duplicate check
      setTimeout(() => {
        const mockTotal = Math.floor(Math.random() * 50) + 50; // 50-100
        const mockDuplicate = Math.floor(Math.random() * 20); // 0-20
        const mockSuccess = mockTotal - mockDuplicate;

        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const newRecord = {
          id: Date.now().toString(),
          time: timeStr,
          filename: fileList[0].name,
          total: mockTotal,
          success: mockSuccess,
          duplicate: mockDuplicate,
          operator: '当前用户',
          status: 'success'
        };

        setHistoryRecords([newRecord, ...historyRecords]);

        onOk({ type: 'import', ...values, file: fileList[0], result: newRecord });
        notification.success({
          message: '导入完成',
          description: `文件解析成功。共读取 ${mockTotal} 条，成功导入 ${mockSuccess} 条，查重跳过 ${mockDuplicate} 条。`,
          placement: 'topRight',
        });
        importForm.resetFields();
        setFileList([]);
        setLoading(false);
      }, 1500);
    });
  };

  const handleCancel = () => {
    manualForm.resetFields();
    importForm.resetFields();
    setFileList([]);
    onCancel();
  };

  const tabItems = [
    {
      key: 'manual',
      label: (<span><UserOutlined /> 手动录入</span>),
      children: (
        <div className="tab-content-wrapper">
          <Form
            form={manualForm}
            layout="vertical"
            className="manual-entry-form"
            initialValues={{ grade: '2026' }}
          >
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <GlassInput placeholder="请输入客户姓名" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="phone"
                  label="电话"
                  rules={[{ required: true, message: '请输入电话号码' }]}
                >
                  <GlassInput placeholder="请输入电话号码" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="wechat"
                  label="微信号orQQ"
                >
                  <GlassInput placeholder="请输入微信或QQ" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="grade"
                  label="年级"
                >
                  <GlassSelect placeholder="选择年级" style={{ width: '100%' }}>
                    {Array.from({ length: 10 }, (_, i) => 2026 + i).map(year => (
                      <Option key={year} value={`${year}`}>{year} 届</Option>
                    ))}
                    <Option value="graduated">已毕业</Option>
                  </GlassSelect>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="source"
                  label="线索来源"
                  rules={[{ required: true, message: '请选择线索来源' }]}
                >
                  <GlassSelect
                    placeholder="请选择线索来源"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                  >
                    {LEAD_SOURCES.map((source, index) => (
                      <Option key={index} value={source}>
                        {source}
                      </Option>
                    ))}
                  </GlassSelect>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="source2"
                  label="线索来源2"
                >
                  <GlassSelect
                    placeholder="请选择次级来源"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                  >
                    {LEAD_SOURCES.map((source, index) => (
                      <Option key={`source2-${index}`} value={source}>
                        {source}
                      </Option>
                    ))}
                  </GlassSelect>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="familyPhone"
                  label="家里人手机"
                >
                  <GlassInput placeholder="请输入家里人手机号码" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="familyPhone2"
                  label="家里人手机2"
                >
                  <GlassInput placeholder="请输入家里人手机号码2" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="familyPhone3"
                  label="家里人手机3"
                >
                  <GlassInput placeholder="请输入家里人手机号码3" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="connected"
                  label="电话是否接通"
                >
                  <GlassSelect placeholder="是否接通" style={{ width: '100%' }}>
                    <Option value="yes">是</Option>
                    <Option value="no">否</Option>

                    <Option value="unknown">未知</Option>
                  </GlassSelect>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="followUpStatus"
                  label="跟进状态"
                >
                  <GlassSelect placeholder="请选择跟进状态" allowClear style={{ width: '100%' }}>
                    <Option value="interested_will_add">有意考生愿意加微信</Option>
                    <Option value="interested_wont_add">有意考生不愿意加微信</Option>
                    <Option value="not_interested">无意考生</Option>
                    <Option value="uncontacted">未联系</Option>
                  </GlassSelect>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="nextFollowUpTime"
                  label="下次跟进时间"
                >
                  <GlassDatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="请选择下次跟进时间"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="currentSchool"
                  label="原学校"
                >
                  <GlassInput placeholder="请输入原学校" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="institution"
                  label="机构"
                >
                  <GlassSelect
                    placeholder="请选择机构"
                    showSearch
                    allowClear
                    loading={selectionLoading}
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                  >
                    {institutionList.map((institution, index) => (
                      <Option
                        key={institution.key || institution.value || index}
                        value={institution.value}
                      >
                        {institution.value}
                      </Option>
                    ))}
                  </GlassSelect>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="importance"
                  label="意向程度"
                >
                  <Rate allowHalf style={{ color: '#FFB929', marginTop: 4 }} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="cost"
                  label="线索成本 (元)"
                >
                  <GlassInput type="number" placeholder="请输入成本金额" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="remark"
                  label="备注"
                  className="full-width"
                >
                  <Input.TextArea rows={4} className="glass-search" placeholder="添加线索备注信息..." style={{ width: '100%', height: 'auto', borderRadius: '12px', padding: '12px' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      )
    },
    {
      key: 'import',
      label: (<span><FileExcelOutlined /> 批量导入</span>),
      children: (
        <div className="tab-content-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1 }}>
            <Form form={importForm} layout="vertical">
              <Form.Item
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>Excel/CSV 文件上传</span>
                    <a style={{ color: 'var(--color-purple)', fontSize: '13px' }} href="#" onClick={e => {e.preventDefault(); message.info('下载中...');}}>
                      下载模版
                    </a>
                  </div>
                }
              >
                <PremiumUploadDragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <div className="upload-icon-wrapper">
                      <InboxOutlined />
                    </div>
                  </p>
                  <p className="ant-upload-text">点击或将文件拖拽并释放到此区域</p>
                  <p className="ant-upload-hint">支持 .xlsx, .xls, .csv</p>
                </PremiumUploadDragger>
              </Form.Item>
            </Form>

            <div className="history-records-section" style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <HistoryOutlined style={{ marginRight: 8, color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>历史导入记录</span>
              </div>
              <GlassTable
                columns={historyColumns}
                dataSource={historyRecords}
                pagination={false}
                rowKey="id"
                size="small"
                scroll={{ y: 200 }}
                className="compact-history-table"
              />
            </div>
          </div>
        </div>
      ),
    }
  ];

  return (
    <PremiumModal
      visible={visible}
      onClose={handleCancel}
      title="录入线索"
      subtitle="UNIFIED LEAD INGESTION ENGINE"
      width={960}
      height="auto"
      themeMode={themeMode}
      className="lead-entry-modal-premium"
      destroyOnClose
      okText={activeTab === 'manual' ? '保存线索' : '开始导入'}
      onOk={activeTab === 'manual' ? handleManualSubmit : handleImportSubmit}
      confirmLoading={loading}
      showOk={true}
      showCancel={false}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="lead-entry-tabs"
      />
    </PremiumModal>
  );
};

export default LeadEntryModal;
