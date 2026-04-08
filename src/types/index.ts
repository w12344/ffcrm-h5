// 顾问信息类型
export interface Advisor {
  name: string;
  mobile: string;
  token: string; // Base62编码的UUID邀请码
  employeeLink: string; // 员工链接
}

// 调查问卷状态
export enum SurveyStatus {
  PENDING = 'pending', // 待审核
  APPROVED = 'approved', // 已通过
  REJECTED = 'rejected', // 已拒绝
}

// 测评方式
export enum AssessmentMethod {
  ONLINE = 'online', // 线上测评
  OFFLINE = 'offline', // 线下测评
}

// 预约项
export enum AppointmentType {
  ENGLISH_DIAGNOSTIC = 'english_diagnostic', // 英语诊断
  PARENT_MEETING = 'parent_meeting', // 家长会
  BOTH = 'both', // 两者都要
}

// 学科类型
export enum Subject {
  ENGLISH = 'english', // 英语
  MATH = 'math', // 数学
  CHINESE = 'chinese', // 语文
  PHYSICS = 'physics', // 物理
  CHEMISTRY = 'chemistry', // 化学
  BIOLOGY = 'biology', // 生物
}

// 时间段
export interface TimeSlot {
  id: string;
  date: string; // 日期格式: YYYY-MM-DD
  timeRange: string; // 时间范围: 如 "09:00-10:00"
  display: string; // 显示文本: 如 "12月15日 09:00-10:00"
}

// 体验项目类型
export interface ExperienceProject {
  appointmentType: string; // 预约类型：subject_diagnosis | career_planning | trial_class
  subjects: string[]; // 选择的学科
}

// 调查问卷表单数据
export interface SurveyFormData {
  studentName: string; // 学生姓名
  contactPhone: string; // 联系电话
  travelMode: string; // 出行方式
  isMeetPrincipal: string; // 是否参与校长见面
  childAttending: boolean; // 孩子是否同行（从travelMode推导）
  appointmentTime: string; // 预约时间段
  weekendTimeSlot: string; // 周末上门时间段
  customTimeSlot?: string; // 自定义时间段
  assessmentMethod: string; // 测评方式（支持新的多个选项）
  assessmentMethods: string[]; // 多选测评内容
  subject: string; // 学科（单选，从多选中取第一个）
  subjects: string[]; // 多选学科
  learningFocus: string[]; // 学习关注点（多选）
  customLearningFocus?: string; // 自定义学习关注点
  experienceProjects: ExperienceProject[]; // 想要体验的项目（多选）
  materials: string[]; // 领取的物料（多选）
  advisorName?: string; // 顾问姓名（从URL参数获取）
  advisorToken?: string; // 顾问邀请码（从URL参数获取）
}

// 调查问卷记录
export interface SurveyRecord {
  id: string;
  studentName: string;
  contactPhone: string;
  childAttending: boolean;
  appointmentTime: TimeSlot;
  assessmentMethod: AssessmentMethod;
  appointmentType: AppointmentType;
  subject: Subject;
  advisorName: string;
  advisorToken: string;
  submitTime: string; // 提交时间
  status: SurveyStatus;
  approvalTime?: string; // 审核通过时间
  rejectReason?: string; // 审核拒绝原因
}

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success?: boolean; // 兼容旧版本
}

// 分页数据类型
export interface PaginationData<T> {
  data: T[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 聊天消息类型
export interface ChatMessage {
  id: number;
  sender: string;
  time: string;
  content: string;
  isBot: boolean;
  isStreaming?: boolean;
  isComplete?: boolean;
}
