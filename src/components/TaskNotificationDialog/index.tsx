import React, { useState, useEffect } from 'react';
import { Form, Select, Button, Table, Tag, Space, Empty } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { TaskItem, TaskListQueryParams, TaskStatus, TaskType, OrderDirection, fetchTaskList, ObjectionDetail, markTaskAsRead } from '@/services/task';
import ObjectionDetailDialog from '@/components/ObjectionDetailDialog';
import PremiumModal from '@/components/PremiumModal';
import './index.less';

interface TaskNotificationDialogProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  themeMode?: 'dark' | 'light';
  defaultTaskType?: TaskType;
  defaultCustomerProfileId?: number;
}

interface FilterValues {
  taskName?: string;
  status?: TaskStatus;
}

const TaskNotificationDialog: React.FC<TaskNotificationDialogProps> = ({
  visible,
  onClose,
  title = '通知列表',
  themeMode = 'dark',
  defaultCustomerProfileId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [taskList, setTaskList] = useState<TaskItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentFilters, setCurrentFilters] = useState<Partial<TaskListQueryParams>>({ status: TaskStatus.PENDING });

  // 异议点详情弹窗状态
  const [objectionDialogVisible, setObjectionDialogVisible] = useState(false);
  const [currentObjections, setCurrentObjections] = useState<ObjectionDetail[]>([]);

  // 主题类名
  const themeClassName = `task-notification-dialog-${themeMode}`;
  const dropdownClassName = `task-notification-dialog-${themeMode}-dropdown`;

  // 加载任务列表
  const loadTaskList = async (params?: Partial<TaskListQueryParams>) => {
    setLoading(true);
    try {
      const filters = params !== undefined ? params : currentFilters;
      const queryParams: TaskListQueryParams = {
        pageNumber: pageNumber,
        pageSize: pageSize,
        customerProfileId: defaultCustomerProfileId,
        orders: [
          {
            field: 'createdAt',
            direction: OrderDirection.DESC,
          },
        ],
        ...filters,
      };

      console.log('请求参数:', queryParams);
      const response = await fetchTaskList(queryParams);
      console.log('完整响应:', response);

      // 处理响应数据 - response.data 是 BaseResponse<TaskListResponse>
      if (response.data && response.data.data) {
        const taskListResponse = response.data.data; // 这是 TaskListResponse
        console.log('任务列表响应数据:', taskListResponse);

        setTaskList(taskListResponse.data || []);
        setTotal(taskListResponse.total || 0);
        console.log('设置任务列表:', taskListResponse.data?.length, '条，总数:', taskListResponse.total);
      }
    } catch (error) {
      console.error('加载任务列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 监听对话框打开，重置到第一页
  useEffect(() => {
    if (visible) {
      setPageNumber(1);
    }
  }, [visible]);

  // 初始加载和分页变化时加载数据
  useEffect(() => {
    if (visible) {
      loadTaskList();
    }
  }, [visible, pageNumber, pageSize]);

  // 任务状态颜色映射
  const getStatusColor = (status: TaskStatus): string => {
    const colorMap: Record<TaskStatus, string> = {
      [TaskStatus.PENDING]: 'warning',
      [TaskStatus.PROCESSED]: 'success',
    };
    return colorMap[status] || 'default';
  };

  // 处理筛选
  const handleFilter = (values: FilterValues) => {
    const queryParams: Partial<TaskListQueryParams> = {
      taskName: values.taskName,
      status: values.status,
    };

    setCurrentFilters(queryParams);
    setPageNumber(1);
    loadTaskList(queryParams);
  };

  // 重置筛选
  const handleReset = () => {
    const defaultFilters = { status: TaskStatus.PENDING };
    form.setFieldsValue(defaultFilters);
    setCurrentFilters(defaultFilters);
    setPageNumber(1);
    loadTaskList(defaultFilters);
  };

  // 处理分页变化
  const handleTableChange = (page: number, size: number) => {
    setPageNumber(page); // antd 分页和 API 都从1开始
    setPageSize(size);
  };

  // 处理查看异议点详情
  const handleViewObjections = async (record: TaskItem) => {
    if (!record.detailJson) {
      console.warn('该任务没有异议点详情数据');
      return;
    }

    try {
      // 标记任务为已读
      await markTaskAsRead(record.id);
      console.log('任务已标记为已读:', record.id);

      const objections: ObjectionDetail[] = JSON.parse(record.detailJson);
      setCurrentObjections(objections);
      setObjectionDialogVisible(true);

      // 重新加载任务列表以更新状态，使用当前筛选条件
      loadTaskList(currentFilters);
    } catch (error) {
      console.error('处理任务查看失败:', error);
    }
  };

  // 关闭异议点详情弹窗
  const handleCloseObjectionDialog = () => {
    setObjectionDialogVisible(false);
    setCurrentObjections([]);
  };

  // 表格列定义
  const columns: ColumnsType<TaskItem> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_: any, __: TaskItem, index: number) => (pageNumber - 1) * pageSize + index + 1,
    },
    {
      title: '任务描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: '任务状态',
      dataIndex: 'statusName',
      key: 'statusName',
      width: 100,
      align: 'center',
      render: (text: string, record: TaskItem) => (
        <Tag color={getStatusColor(record.status)}>{text}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: TaskItem) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewObjections(record)}
          disabled={!record.detailJson}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <PremiumModal
      title={title}
      visible={visible}
      onClose={onClose}
      width={1400}
      destroyOnClose
      className={themeClassName}
    >
      {/* 筛选表单 */}
      <Form
        form={form}
        layout="inline"
        onFinish={handleFilter}
        initialValues={{ status: TaskStatus.PENDING }}
        style={{
          marginBottom: 16,
          padding: '10px 10px 0px 10px',
          borderRadius: 8
        }}
      >
        <Form.Item name="status" style={{ marginBottom: 12 }}>
          <Select
            placeholder="请选择任务状态"
            allowClear
            style={{ width: 150 }}
            popupClassName={dropdownClassName}
            options={[
              { label: '待处理', value: TaskStatus.PENDING },
              { label: '已处理', value: TaskStatus.PROCESSED },
            ]}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 12 }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              查询
            </Button>
            <Button
              onClick={handleReset}
              icon={<ReloadOutlined />}
            >
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 任务列表表格 */}
      <Table
        columns={columns}
        dataSource={taskList}
        rowKey="id"
        loading={loading}
        size="middle"
        pagination={{
          current: pageNumber, // antd 分页从1开始
          pageSize: pageSize,
          total: total,
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: handleTableChange,
        }}
        locale={{
          emptyText: (
            <Empty
              description="暂无任务数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
        scroll={{ x: 800, y: 'calc(80vh - 220px)' }}
      />

      {/* 异议点详情弹窗 */}
      <ObjectionDetailDialog
        visible={objectionDialogVisible}
        onClose={handleCloseObjectionDialog}
        objections={currentObjections}
        themeMode={themeMode}
      />
    </PremiumModal>
  );
};

export default TaskNotificationDialog;
