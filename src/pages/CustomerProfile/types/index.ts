/**
 * 客户档案页面类型定义
 */

/**
 * 时间轴节点类型
 */
export type TimelineType = "ADD_WECHAT" | string;

/**
 * 时间轴节点
 */
export interface TimelineNode {
  type: TimelineType;
  typeName: string;
  typeDescription: string;
  occurredAt: string;
  remark?: string;
  remarkName?: string; // 备注名称
}

/**
 * 异议/风险标签类型
 */
export type IssueType = "objection" | "timing" | "residence" | "upgrade";

/**
 * 异议/风险标签状态
 */
export type IssueStatus = "pending" | "resolved";

/**
 * 异议/风险标签
 */
export interface IssueTag {
  id: string;
  type: IssueType;
  label: string;
  status: IssueStatus;
}

/**
 * 异议详情数据
 */
export interface ObjectionDetail {
  /** 异议ID */
  id: number;
  /** 异议标题 */
  title: string;
  /** 异议描述 */
  description: string;
  /** 状态：PENDING-待解决, RESOLVED-已解决 */
  status: "PENDING" | "RESOLVED";
  /** 解决时间 */
  resolvedAt?: string;
  /** 客户档案ID */
  customerProfileId: number;
  /** 业务日期 */
  bizDate: string;
  /** 创建人ID */
  createdBy: number;
  /** 创建人姓名 */
  createdByName: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 聊天内容 */
  chatContent?: string;
  /** 解决方案 */
  solution?: string;
  /** 是否需要跟进：0-否，1-是 */
  requireFollowUp: 0 | 1;
  /** 异议分类 */
  category: string;
  /** 需要谁跟进 */
  requireWho?: string;
}

/**
 * 人工补充记录
 */
export interface ManualNote {
  id: string;
  content: string;
  author: string;
  createTime: string;
}

/**
 * 联系人信息
 */
export interface ContactInfo {
  /** 微信ID */
  wxId: string;
  /** 昵称 */
  nickName: string;
  /** 备注名 */
  alias: string;
  /** 头像URL */
  head: string;
  /** 是否为主要联系人 */
  isPrimaryContact: boolean;
  /** 关系 */
  relationship: string;
  /** 手机号 */
  mobile: string;
}

/**
 * 沟通记录类型
 */
export type CommunicationRecordType = "WECHAT" | "PHONE" | "MESSAGE" | string;

/**
 * 发送者类型
 */
export type SenderType = "EMPLOYEE" | "CUSTOMER";

/**
 * 消息类型
 */
export type MessageType = 1 | 2 | 3 | 4 | 34 | 50; // 1-文本 2-图片 3-图片 34-短语音 50-语音通话 4-视频等

/**
 * 通话类型
 */
export type CallType = 3 | 4 | 5; // 3-外呼 4-接入 5-多人通话

/**
 * 沟通记录
 */
export interface CommunicationRecord {
  /** 记录ID */
  recordId: string;
  /** 记录类型 */
  recordType: CommunicationRecordType;
  /** 发送者类型 */
  senderType: SenderType;
  /** 发送者姓名 */
  senderName: string;
  /** 发送者头像 */
  senderAvatar?: string;
  /** 消息时间 */
  messageTime: string;
  /** 业务日期 */
  bizDate: string;
  /** 联系人微信ID */
  contactWxId?: string;
  /** 通话时长（毫秒） */
  callDuration?: number;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 音频/视频URL */
  url?: string;
  /** 消息内容 */
  content?: string;
  /** 客户电话 */
  customerPhone?: string;
  /** 通话类型 */
  callType?: CallType;
  /** 录音URL */
  recordUrl?: string;
  /** 消息类型 */
  type?: MessageType;
  /** 消息类型名称 */
  typeName?: string;
  /** 通话文件URL */
  callFileUrl?: string;
  /** 员工微信ID */
  ownerWxId?: string;
}

/**
 * 学生基本信息
 */
export interface StudentBasicInfo {
  name: string; // 姓名（来源于昵称）
  realName?: string; // 真实姓名
  remarkName?: string; // 备注名称
  currentSchool?: string; // 当前学校
  gender?: "男" | "女" | "未知"; // 性别
  examYear: string; // 高考年届
  province?: string; // 学籍省份
  highSchool?: string; // 就读高中
  major: string; // 主修专业
  remark?: string; // 备注（保留用于其他用途）
  city?: string; // 城市（保留用于其他用途）
}

/**
 * 综合评估数据
 */
export interface EvaluationData {
  fatScore: number; // 肥客积分
  ripeScore: number; // 熟客积分
  level: string; // 评级
}

/**
 * 合同信息
 */
export interface ContractInfo {
  /** 合同ID */
  id: number;
  /** 客户档案ID */
  customerProfileId: number;
  /** 档案名称 */
  profileName?: string;
  /** 员工ID */
  employeeId: number;
  /** 模板ID */
  templateId: string;
  /** 模板名称 */
  templateName: string;
  /** 合同标题 */
  contractTitle: string;
  /** 合同状态 */
  contractStatus: string;
  /** 合同状态名称 */
  contractStatusName: string;
  /** 签署任务ID */
  signTaskId: string;
  /** 备注 */
  remark: string | null;
  /** 合同文档URL */
  contractDocumentUrl: string;
  /** 合同金额 */
  contractAmount?: number;
  /** 签署人姓名 */
  signerName?: string;
  /** 签署人手机 */
  signerMobile?: string;
  /** 创建时间 */
  createdAt: string | null;
  /** 更新时间 */
  updatedAt: string | null;
}

/**
 * 客户档案完整数据
 */
export interface CustomerProfileData {
  id: string;
  basicInfo: StudentBasicInfo;
  evaluation: EvaluationData;
  timeline: TimelineNode[];
  aiSummary: string;
  issueTags: IssueTag[];
  manualNotes: ManualNote[];
  contacts: ContactInfo[];
}
