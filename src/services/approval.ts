import request from "@/utils/request";

// 审批查询参数
export interface ApprovalQueryParams {
  page: number;
  pageSize: number;
  name?: string;
  state?: string;
  deliveryState?: string;
}

// 预约表单数据
export interface AppointmentForm {
  studentName?: string;
  name?: string;
  contactPhone?: string;
  phone?: string;
  mobile?: string;
  travelMode?: string;
  isMeetPrincipal?: string;
  appointmentType?: string;
  appointmentTime?: string;
  weekendTimeSlot?: string;
  customTimeSlot?: string;
  assessmentMethods?: string[];
  subjects?: string[];
  learningFocus?: string[];
  customLearningFocus?: string;
  advisorName?: string;
  advisor?: string;
  consultant?: string;
  advisorToken?: string;
}

// 审批数据项
export interface ApprovalItem {
  id: number;
  name: string;
  mobile: string;
  appointmentForm?: AppointmentForm | string;
  state: number; // 0-待审核, 1-已通过, -1-已拒绝
  deliveryState: number; // 0-待审核, 1-已通过, -1-已拒绝
  createdAt: string;
}

// 分页数据
export interface ApprovalPageData {
  data: ApprovalItem[];
  total: number;
  totalPages: number;
}

// 分页响应数据
export interface ApprovalPageResponse {
  code: number;
  message: string;
  data: ApprovalPageData;
}

// 审核操作参数
export interface ApproveParams {
  id: number;
  state: number;
  reason: string;
}

// 交付操作参数
export interface DeliveryParams {
  id: number;
  deliveryState: number;
  reason: string;
}

// 操作响应
export interface OperationResponse {
  code: number;
  message: string;
  data: any;
}

/**
 * 获取审批列表（分页）
 */
export const fetchApprovalList = (
  params: ApprovalQueryParams
): Promise<{ data: ApprovalPageResponse }> => {
  const queryParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  
  if (params.name) {
    queryParams.append("name", params.name);
  }
  if (params.state !== undefined && params.state !== "") {
    queryParams.append("state", params.state);
  }
  if (params.deliveryState !== undefined && params.deliveryState !== "") {
    queryParams.append("deliveryState", params.deliveryState);
  }
  
  return request.get(`/reception/list?${queryParams.toString()}`);
};

/**
 * 审核操作
 */
export const approveItem = (
  params: ApproveParams
): Promise<{ data: OperationResponse }> => {
  return request.post("/reception/approve", params);
};

/**
 * 交付操作
 */
export const deliveryItem = (
  params: DeliveryParams
): Promise<{ data: OperationResponse }> => {
  return request.post("/reception/delivery", params);
};


