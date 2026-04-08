/**
 * 任务通知 API
 */

import { http } from '@/utils/request'

/**
 * 任务类型枚举
 */
export enum TaskType {
  /** 风险提醒 */
  RISK_ALERT = 1,
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  /** 待处理 */
  PENDING = 0,
  /** 已处理 */
  PROCESSED = 1,
}

/**
 * 排序方向
 */
export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * 排序字段
 */
export interface OrderField {
  /** 字段名 */
  field: string
  /** 排序方向 */
  direction: OrderDirection
}

/**
 * 异议点详情类型
 */
export interface ObjectionDetail {
  /** 异议点ID */
  id: number
  /** 异议点标题 */
  title: string
  /** 状态 */
  status: string
  /** 业务日期 */
  bizDate: string
  /** 异议类别 */
  category: string
  /** 解决方案 */
  solution: string
  /** 创建时间 */
  createdAt: string
  /** 创建人ID */
  createdBy: number
  /** 更新时间 */
  updatedAt: string
  /** 内容MD5 */
  contentMd5: string
  /** 需要谁处理 */
  requireWho: string | null
  /** 解决时间 */
  resolvedAt: string | null
  /** 聊天内容 */
  chatContent: string
  /** 描述 */
  description: string
  /** 需要跟进 */
  requireFollowUp: number
  /** 客户档案ID */
  customerProfileId: number
}

/**
 * 任务列表单条数据类型
 */
export interface TaskItem {
  /** 任务ID */
  id: number
  /** 任务名称 */
  taskName: string
  /** 任务类型 */
  type: TaskType
  /** 任务类型名称 */
  typeName: string
  /** 任务状态 */
  status: TaskStatus
  /** 任务状态名称 */
  statusName: string
  /** 员工ID */
  employeeId: number
  /** 员工名称 */
  employeeName: string
  /** 客户档案ID */
  customerProfileId: number
  /** 客户备注名称 */
  customerRemarkName: string
  /** 业务日期 */
  bizDate: string
  /** 任务描述 */
  description: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 详情JSON（异议点列表等） */
  detailJson?: string
}

/**
 * 任务列表响应数据类型
 */
export interface TaskListResponse {
  /** 任务列表 */
  data: TaskItem[]
  /** 总数 */
  total: number
  /** 当前页码 */
  pageNumber: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPages: number
  /** 是否有下一页 */
  hasNext: boolean
  /** 是否有上一页 */
  hasPrevious: boolean
}

/**
 * 任务列表查询参数类型
 */
export interface TaskListQueryParams {
  /** 页码 */
  pageNumber?: number
  /** 每页数量 */
  pageSize?: number
  /** 排序字段 */
  orders?: OrderField[]
  /** 任务类型 */
  taskType?: TaskType
  /** 任务状态 */
  status?: TaskStatus
  /** 任务名称（模糊搜索） */
  taskName?: string
  /** 客户档案ID */
  customerProfileId?: number
  /** 开始日期 */
  startDate?: string
  /** 结束日期 */
  endDate?: string
  /** 结束索引 */
  endIndex?: number
  /** 排序（兼容旧版） */
  order?: OrderField[]
  /** 开始位置 */
  startPosition?: number
  /** 结束位置 */
  endPosition?: number
  /** 开始索引 */
  startIndex?: number
  /** 开始结束范围 */
  startEnd?: number[]
}

/**
 * 获取任务列表
 * @param params 查询参数
 */
export const fetchTaskList = (params?: TaskListQueryParams) => {
  return http.post<TaskListResponse>('/xxl-backend/task/list', params || {})
}

/**
 * 标记任务为已读
 * @param taskId 任务ID
 */
export const markTaskAsRead = (taskId: number) => {
  return http.post(`/xxl-backend/task/complete?taskId=${taskId}`)
}

/**
 * 获取未读消息数量
 */
export const getUnreadCount = () => {
  return http.get<{ code: number; message: string; data: number }>('/xxl-backend/task/unread-count')
}

/**
 * 任务 API 对象（统一导出）
 */
export const taskApi = {
  /** 获取任务列表 */
  getTaskList: fetchTaskList,
  /** 标记任务为已读 */
  markTaskAsRead,
  /** 获取未读消息数量 */
  getUnreadCount,
}

/**
 * 默认导出
 */
export default taskApi
