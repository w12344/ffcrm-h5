import request from "@/utils/request";

// 录音查询参数
export interface RecordingQueryParams {
  pageNumber: number;
  pageSize: number;
  startTime: string;
  endTime: string;
}

// 录音数据项
export interface RecordingItem {
  id: number;
  startTime: string;
  endTime: string;
  duration: number;
  url: string;
  filename: string;
  contactAlias?: string;
  contactWxId?: string;
  customer?: {
    id: number;
    name: string;
    alias: string;
    wxId: string;
  } | null;
}

// 分页数据
export interface RecordingPageData {
  data: RecordingItem[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// 分页响应数据
export interface RecordingPageResponse {
  code: number;
  message: string;
  data: RecordingPageData;
}

// 绑定联系人参数
export interface BindContactParams {
  id: number;
  contactWxId?: string;
}

// 绑定联系人响应
export interface BindContactResponse {
  code: number;
  message: string;
  data: any;
}

/**
 * 获取录音列表（分页）
 */
export const fetchRecordingList = (
  params: RecordingQueryParams
): Promise<{ data: RecordingPageResponse }> => {
  return request.post("/feishu/app/ab/page", params);
};

/**
 * 绑定联系人
 */
export const bindContact = (
  params: BindContactParams
): Promise<{ data: BindContactResponse }> => {
  return request.post("/feishu/app/ab/bindContact", params);
};


