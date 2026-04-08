/**
 * 档案数据 API
 */

import { http } from '@/utils/request'

/**
 * 档案详情数据类型
 */
export interface ProfileDetail {
  /** 档案ID */
  id: number
  /** 真实姓名 */
  realName: string
  /** 备注名称 */
  remarkName: string
  /** 届别标签 */
  editionLabel: string
  /** 专业 */
  major: string
  /** 当前学校 */
  currentSchool: string
  /** 省份 */
  province: string
  /** 性别 */
  gender: string
  /** AI总结 */
  aiSummary: string
  /** 肥客积分 */
  fatScore: number
  /** 熟客积分 */
  ripeScore: number
  /** 等级 */
  level: string
}

/**
 * 根据档案 ID 查询档案详情
 * @param id 档案ID
 */
export const fetchProfileDetail = (id: number) => {
  return http.get<ProfileDetail>(`/xxl-backend/profile/${id}`)
}

/**
 * 时间轴节点类型
 */
export interface TimelineNode {
  type: string
  typeName: string
  typeDescription: string
  occurredAt: string
  remark?: string
}

/**
 * 根据档案 ID 查询时间轴
 * @param id 档案ID
 */
export const fetchProfileTimeline = (id: number) => {
  return http.get<TimelineNode[]>(`/xxl-backend/profile/${id}/timeline`)
}

/**
 * 异议详情数据类型
 */
export interface ObjectionDetail {
  /** 异议ID */
  id: number
  /** 异议标题 */
  title: string
  /** 异议描述 */
  description: string
  /** 状态：PENDING-待解决, RESOLVED-已解决 */
  status: 'PENDING' | 'RESOLVED'
  /** 解决时间 */
  resolvedAt?: string
  /** 客户档案ID */
  customerProfileId: number
  /** 业务日期 */
  bizDate: string
  /** 创建人ID */
  createdBy: number
  /** 创建人姓名 */
  createdByName: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 聊天内容 */
  chatContent?: string
  /** 解决方案 */
  solution?: string
  /** 是否需要跟进：0-否，1-是 */
  requireFollowUp: 0 | 1
  /** 异议分类 */
  category: string
  /** 需要谁跟进 */
  requireWho?: string
}

/**
 * 根据档案 ID 查询异议列表
 * @param id 档案ID
 */
export const fetchProfileObjections = (id: number) => {
  return http.get<ObjectionDetail[]>(`/xxl-backend/profile/${id}/objections`)
}

/**
 * 标记异议为已处理
 * @param objectionId 异议ID
 */
export const markObjectionAsResolved = (objectionId: number) => {
  return http.post(`/xxl-backend/objection/resolve?objectionId=${objectionId}`)
}

/**
 * 联系人信息类型
 */
export interface WxContact {
  /** 微信ID */
  wxId: string
  /** 昵称 */
  nickName: string
  /** 备注名 */
  alias: string
  /** 头像URL */
  head: string
  /** 是否为主要联系人 */
  isPrimaryContact: boolean
  /** 关系 */
  relationship: string
  /** 手机号 */
  mobile: string
}

/**
 * 根据档案 ID 查询微信联系人列表
 * @param id 档案ID
 */
export const fetchProfileWxContacts = (id: number) => {
  return http.get<WxContact[]>(`/xxl-backend/profile/${id}/wx-contacts`)
}

/**
 * 更新学生基本信息的请求参数
 */
export interface UpdateProfileParams {
  /** 档案ID */
  id: number
  /** 真实姓名（来源于昵称，可编辑） */
  realName: string
  /** 主修专业 */
  major: string
  /** 就读高中 */
  currentSchool: string
  /** 学籍省份 */
  province: string
  /** 性别 */
  gender: string
}

/**
 * 更新学生基本信息
 * @param params 更新参数
 */
export const updateProfileBasicInfo = (params: UpdateProfileParams) => {
  return http.post<ProfileDetail>('/xxl-backend/profile/update', params)
}

/**
 * 获取档案沟通记录
 * @param id 档案ID
 */
export const fetchCommunicationRecords = (id: number) => {
  return http.get(`/xxl-backend/profile/${id}/communication-records`)
}

/**
 * 合同信息类型
 */
export interface ContractInfo {
  /** 合同ID */
  id: number
  /** 客户档案ID */
  customerProfileId: number
  /** 员工ID */
  employeeId: number
  /** 模板ID */
  templateId: string
  /** 模板名称 */
  templateName: string
  /** 合同标题 */
  contractTitle: string
  /** 合同状态 */
  contractStatus: string
  /** 合同状态名称 */
  contractStatusName: string
  /** 签署任务ID */
  signTaskId: string
  /** 备注 */
  remark: string | null
  /** 合同文档URL */
  contractDocumentUrl: string
  /** 创建时间 */
  createdAt: string | null
  /** 更新时间 */
  updatedAt: string | null
}

/**
 * 根据档案 ID 查询合同列表
 * @param customerProfileId 客户档案ID
 */
export const fetchContractList = (customerProfileId: number) => {
  return http.get<ContractInfo[]>(`/contract-info/list?customerProfileId=${customerProfileId}`)
}

/**
 * 语音转文字参数类型
 */
export interface RecordTranscriptionParams {
  /** 记录ID */
  recordId: string
  /** 记录类型 */
  recordType: string
}

/**
 * 语音转文字响应类型
 */
export interface RecordTranscriptionResponse {
  /** 录音URL */
  recordUrl: string
  /** 转写文本 */
  transcription: string
  /** 转写状态 */
  transStatus: number
}

/**
 * 语音转文字
 * @param params 语音转文字参数
 */
export const fetchRecordTranscription = (params: RecordTranscriptionParams) => {
  return http.get<RecordTranscriptionResponse>(
    `/xxl-backend/profile/record-transcription?recordId=${params.recordId}&recordType=${params.recordType}`
  )
}

/**
 * 档案 API 对象（统一导出）
 */
export const profileApi = {
  /** 获取档案详情 */
  getProfileDetail: fetchProfileDetail,
  /** 获取时间轴 */
  getTimeline: fetchProfileTimeline,
  /** 获取异议列表 */
  getObjections: fetchProfileObjections,
  /** 获取微信联系人 */
  getWxContacts: fetchProfileWxContacts,
  /** 更新学生基本信息 */
  updateBasicInfo: updateProfileBasicInfo,
  /** 获取沟通记录 */
  getCommunicationRecords: fetchCommunicationRecords,
  /** 获取合同列表 */
  getContractList: fetchContractList,
  /** 语音转文字 */
  getRecordTranscription: fetchRecordTranscription
}

/**
 * 默认导出
 */
export default profileApi

