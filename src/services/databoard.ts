/**
 * 看板数据 API
 */

import { http } from '@/utils/request'

/**
 * 员工积分统计数据类型
 */
export interface EmployeeScoreStat {
  /** 月度总积分 */
  monthlyTotalScore: number
  /** 月度熟客积分 */
  monthlyRipeScore: number
  /** 月度肥客积分 */
  monthlyFatScore: number
  /** 昨日熟客积分 */
  yesterdayRipeScore: number
  /** 昨日肥客积分 */
  yesterdayFatScore: number
  /** 昨日熟客排名 */
  yesterdayRipeRank: number
  /** 昨日肥客排名 */
  yesterdayFatRank: number
  /** 熟客排名变化 */
  ripeRankChange: number
  /** 肥客排名变化 */
  fatRankChange: number
  /** 熟客排名百分比 */
  ripeRankPercentage: number
  /** 肥客排名百分比 */
  fatRankPercentage: number
  /** 总排名格式 */
  totalRankFormat: string
  /** 熟客排名格式 */
  ripeRankFormat: string
  /** 肥客排名格式 */
  fatRankFormat: string
}

/**
 * 员工金额统计数据类型
 */
export interface EmployeeAmountStat {
  /** 年度目标金额 */
  yearlyTargetAmount: number
  /** 年度合同金额 */
  yearlyContractAmount: number
  /** 年度收款金额 */
  yearlyReceivedAmount: number
  /** 昨日合同金额 */
  yesterdayContractAmount: number
  /** 昨日收款金额 */
  yesterdayReceivedAmount: number
  /** 昨日合同金额排名 */
  yesterdayContractAmountRank: number
  /** 昨日收款金额排名 */
  yesterdayReceivedAmountRank: number
  /** 合同金额排名变化 */
  contractAmountRankChange: number
  /** 收款金额排名变化 */
  receivedAmountRankChange: number
  /** 合同金额排名百分比 */
  contractAmountRankPercentage: number
  /** 收款金额排名百分比 */
  receivedAmountRankPercentage: number
  /** 合同金额排名格式 */
  contractAmountRankFormat: string
  /** 收款金额排名格式 */
  receivedAmountRankFormat: string
}

/**
 * 员工招生统计数据类型
 */
export interface EmployeeAdmissionStat {
  /** 年度目标招生数 */
  yearlyTargetAdmission: number
  /** 年度合同数 */
  yearlyContractCount: number
  /** 年度招生数 */
  yearlyAdmissionCount: number
  /** 昨日合同数 */
  yesterdayContractCount: number
  /** 昨日招生数 */
  yesterdayAdmissionCount: number
  /** 昨日合同排名 */
  yesterdayContractRank: number
  /** 昨日招生排名 */
  yesterdayAdmissionRank: number
  /** 合同排名变化 */
  contractRankChange: number
  /** 招生排名变化 */
  admissionRankChange: number
  /** 合同排名百分比 */
  contractRankPercentage: number
  /** 招生排名百分比 */
  admissionRankPercentage: number
  /** 合同排名格式 */
  contractRankFormat: string
  /** 招生排名格式 */
  admissionRankFormat: string
}

/**
 * 客户升级池单条数据类型
 */
export interface CustomerUpgradePoolItem {
  /** 客户档案ID */
  customerProfileId: number
  /** 员工ID */
  employeeId: number
  /** 用户ID */
  userId: string
  /** 备注名称 */
  remarkName: string
  /** 创建时间 */
  createdAt: string
  /** 版本号 */
  editionNum: number
  /** 肥客积分 */
  fatScore: number
  /** 熟客积分 */
  ripeScore: number
  /** 等级 */
  level: string
  /** 最后肥客评分日期 (格式: YYYYMMDD) */
  lastFatRatingDate: number
  /** 最后熟客评分日期 (格式: YYYYMMDD) */
  lastRipeRatingDate: number
  /** 肥客调研次数 */
  fatSurveyCount: number
  
  // ======== 气泡显示标识字段（待后端提供） ========
  /** 是否显示机会标识 - 客户成熟度90分以上但未成交，或AI识别的相关机会 */
  hasOpportunity?: boolean
  /** 是否显示警示标识 - 客户存在待解决异议或AI识别的相关风险 */
  hasAlert?: boolean

  /** 机会说明文案（可选） */
  opportunityText?: string
  /** 风险/异议说明文案（可选） */
  alertText?: string
}

/**
 * 客户升级池响应数据类型
 */
export interface CustomerUpgradePoolResponse {
  /** 客户列表 */
  list: CustomerUpgradePoolItem[]
  /** 总数 */
  count: number
}

/**
 * 员工统计查询参数类型
 */
export interface EmployeeStatQueryParams {
  /** 日期（可选，不传则使用默认日期） */
  date?: string
}

/**
 * 看板查询参数类型
 */
export interface DashboardQueryParams {
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
  /** 员工ID */
  employeeId?: number
  /** 部门ID */
  departmentId?: number
  /** 项目ID */
  projectId?: number
  [key: string]: any
}

/**
 * 客户升级池查询参数类型
 */
export interface CustomerUpgradePoolQueryParams {
  /** 客户名称（模糊搜索） */
  name?: string
  /** 客户评级 */
  level?: string
  /** 加客开始日期（格式：YYYY-MM-DD） */
  startDate?: string
  /** 加客结束日期（格式：YYYY-MM-DD） */
  endDate?: string
  /** 异议关键词 */
  opinion?: string
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 客户档案列表查询参数类型
 */
export interface CustomerProfileListQueryParams {
  /** 备注名称（模糊搜索） */
  remarkName?: string
  /** 业务开始日期（ISO格式） */
  bizDateStart?: string
  /** 业务结束日期（ISO格式） */
  bizDateEnd?: string
  /** 客户评级 */
  level?: string
  /** 肥客积分 */
  fatScore?: number
  /** 熟客积分 */
  ripeScore?: number
  /** 异议分类 */
  objectionCategory?: string
  /** 页码 */
  pageNumber?: number
  /** 每页数量 */
  pageSize?: number
}

/**
 * 客户档案列表单条数据类型
 */
export interface CustomerProfileListItem {
  /** 客户档案ID */
  customerProfileId: number
  /** 员工ID */
  employeeId: number
  /** 用户ID */
  userId: string
  /** 备注名称 */
  remarkName: string
  /** 业务日期 */
  bizDate: string
  /** 版本号 */
  editionNum: number
  /** 等级 */
  level: string
  /** 肥客积分 */
  fatScore: number
  /** 熟客积分 */
  ripeScore: number
  /** 最后聊天日期 (格式: YYYY-MM-DD) */
  lastChatDate: string
  /** 异议分类 */
  objectionCategories: string
}

/**
 * 客户档案列表响应数据类型
 */
export interface CustomerProfileListResponse {
  /** 客户列表 */
  data: CustomerProfileListItem[]
  /** 总数 */
  total: number
  /** 页码 */
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
 * 获取员工积分统计信息
 */
export const fetchEmployeeScoreStat = (params?: EmployeeStatQueryParams) => {
  return http.get<EmployeeScoreStat>('/xxl-backend/dashboard/employee-score-stat', {
    params
  })
}

/**
 * 获取员工金额统计信息
 */
export const fetchEmployeeAmountStat = (params?: EmployeeStatQueryParams) => {
  return http.get<EmployeeAmountStat>('/xxl-backend/dashboard/employee-amount-stat', {
    params
  })
}

/**
 * 获取员工招生统计信息
 */
export const fetchEmployeeAdmissionStat = (params?: EmployeeStatQueryParams) => {
  return http.get<EmployeeAdmissionStat>('/xxl-backend/dashboard/employee-admission-stat', {
    params
  })
}

/**
 * 获取客户升级池信息
 * @param params 查询参数（可选，默认不传参数）
 */
export const fetchCustomerUpgradePool = (params?: CustomerUpgradePoolQueryParams) => {
  return http.get<CustomerUpgradePoolResponse>('/xxl-backend/dashboard/customer-upgrade-pool', {
    params
  })
}

/**
 * 获取客户档案列表信息（新接口）
 * @param params 查询参数（可选，默认不传参数）
 */
export const fetchCustomerProfileList = (params?: CustomerProfileListQueryParams) => {
  return http.post<CustomerProfileListResponse>('/xxl-backend/dashboard/customer-profile-list', {
    ...params
  })
}

/**
 * 其他顾问数据类型
 */
export interface OtherEmployee {
  /** 员工ID */
  employeeId: number
  /** 员工姓名 */
  employeeName: string
}

/**
 * 其他顾问列表响应类型
 */
export interface OtherEmployeesResponse {
  code: number
  message: string
  data: OtherEmployee[]
}

/**
 * 获取其他顾问列表
 */
export const fetchOtherEmployees = () => {
  return http.get<OtherEmployee[]>('/xxl-backend/dashboard/other-employees')
}

/**
 * 员工Token响应类型
 */
export interface EmployeeTokenResponse {
  code: number
  message: string
  data: string
}

/**
 * 获取员工Token
 * @param employeeId 员工ID
 */
export const fetchEmployeeToken = (employeeId: number) => {
  return http.get<string>('/xxl-backend/dashboard/employee-token', {
    params: { employeeId }
  })
}

/**
 * 看板 API 对象（统一导出）
 */
export const dashboardApi = {
  /** 获取员工积分统计 */
  getEmployeeScoreStat: fetchEmployeeScoreStat,
  /** 获取员工金额统计 */
  getEmployeeAmountStat: fetchEmployeeAmountStat,
  /** 获取员工招生统计 */
  getEmployeeAdmissionStat: fetchEmployeeAdmissionStat,
  /** 获取客户升级池 */
  getCustomerUpgradePool: fetchCustomerUpgradePool,
  /** 获取客户档案列表 */
  getCustomerProfileList: fetchCustomerProfileList,
  /** 获取其他顾问列表 */
  getOtherEmployees: fetchOtherEmployees,
  /** 获取员工Token */
  getEmployeeToken: fetchEmployeeToken
}

/**
 * 默认导出
 */
export default dashboardApi

