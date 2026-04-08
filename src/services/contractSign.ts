import http from "@/utils/request";
import type { ContractTemplate } from "@/pages/ContractSign/types";

/**
 * 获取合同模板列表
 */
export const fetchContractTemplates = async (): Promise<ContractTemplate[]> => {
  const response = await http.get<any>("/contract-info/templates");
  // 接口返回格式: { code: 200, message: "success", data: [...] }
  // http.get 返回 AxiosResponse<BaseResponse>，实际数据在 response.data.data 中
  const result = response.data;
  if (result && result.data && Array.isArray(result.data)) {
    return result.data as ContractTemplate[];
  }
  return [];
};

/**
 * 获取合同模板预览链接
 * @param templateCode 模板代码
 * @returns 预览链接
 */
export const fetchTemplatePreviewUrl = async (
  templateCode: string
): Promise<string> => {
  const response = await http.get<any>(
    `/contract-info/template/preview?templateCode=${templateCode}`
  );
  // 接口返回格式: { code: 200, message: "success", data: "预览链接URL" }
  const result = response.data;
  if (result && result.data) {
    return result.data;
  }
  throw new Error("获取预览链接失败");
};

/**
 * 创建签署任务
 * @param params 签署任务参数
 * @returns 签署任务 ID
 */
export interface CreateSignTaskParams {
  customerProfileId: number;
  templateCode: string;
  templateName: string;
  contractTitle: string;
  signerName: string;
  signerMobile: string;
  signerIdCard: string;
}

export interface CreateSignTaskResponse {
  signTaskId: string;
  [key: string]: any;
}

export const createSignTask = async (
  params: CreateSignTaskParams
): Promise<CreateSignTaskResponse> => {
  const response = await http.post<any>(
    "/contract-info/sign-task/create",
    params
  );
  const result = response.data;
  if (result && result.data) {
    return result.data;
  }
  throw new Error("创建签署任务失败");
};

/**
 * 获取合同填写详情
 * @param signTaskId 签署任务 ID
 * @returns 填写详情
 */
export const fetchSignTaskFillDetails = async (
  signTaskId: string
): Promise<any> => {
  const response = await http.get<any>(
    `/contract-info/sign-task/fill-details?signTaskId=${signTaskId}`
  );
  const result = response.data;
  if (result && result.data) {
    return result.data;
  }
  throw new Error("获取填写详情失败");
};

/**
 * 填写合同字段
 * @param data 合同填写数据
 * @returns 填写结果
 */
export const fillContractFields = async (data: any): Promise<any> => {
  const response = await http.post<any>(
    "/contract-info/sign-task/fill-fields",
    data
  );
  const result = response.data;
  if (result && result.code === 200) {
    return result.data;
  }
  throw new Error(result?.message || "填写合同字段失败");
};

/**
 * 预览合同
 * @param signTaskId 签署任务 ID
 * @returns 预览链接
 */
export const previewContract = async (signTaskId: string): Promise<string> => {
  const response = await http.get<any>(
    `/contract-info/sign-task/preview?signTaskId=${signTaskId}`
  );
  const result = response.data;
  if (result && result.data) {
    return result.data;
  }
  throw new Error("获取预览链接失败");
};

/**
 * 提交签署任务
 * @param signTaskId 签署任务 ID
 * @returns 提交结果
 */
export const submitSignTask = async (signTaskId: string): Promise<any> => {
  const response = await http.post<any>("/contract-info/sign-task/submit", {
    signTaskId,
  });
  const result = response.data;
  if (result && result.code === 200) {
    return result.data;
  }
  throw new Error(result?.message || "提交签署任务失败");
};

/**
 * 获取合同签署链接
 * @param signTaskId 签署任务 ID
 * @returns 签署链接
 */
export const getSignUrl = async (signTaskId: string): Promise<string> => {
  const response = await http.get<any>(
    `/contract-info/actor/sign-url?signTaskId=${signTaskId}`
  );
  const result = response.data;
  if (result && result.data) {
    return result.data;
  }
  throw new Error("获取签署链接失败");
};

/**
 * 获取合同详情
 * @param signTaskId 签署任务 ID
 * @returns 合同详情
 */
export const getContractDetails = async (signTaskId: string): Promise<any> => {
  const response = await http.get<any>(
    `/contract-info/sign-task/fill-details?signTaskId=${signTaskId}`
  );
  const result = response.data;
  if (result && result.data) {
    return result.data;
  }
  throw new Error("获取合同详情失败");
};

/**
 * 获取合同签署人信息
 * @param customerProfileId 客户档案 ID
 * @returns 签署人信息
 */
export interface SignerInfoResponse {
  id: number;
  customerProfileId: number;
  profileName: string;
  studentName: string;
  employeeId: number;
  employeeName: string;
  templateId: string;
  templateCode: string;
  templateName: string;
  contractTitle: string;
  contractStatus: string;
  contractStatusName: string;
  signTaskId: string;
  signerName: string;
  signerMobile: string;
  signerIdCard: string;
  remark: string;
  contractDocumentUrl: string;
  contractAmount: number;
  createdAt: string;
  updatedAt: string;
}

export const fetchSignerInfo = async (
  customerProfileId: number
): Promise<SignerInfoResponse> => {
  const response = await http.get<any>(
    `/contract-info/sign-task/singer-info?customerProfileId=${customerProfileId}`
  );
  const result = response.data;
  if (result && result.data) {
    return result.data;
  }
  throw new Error("获取签署人信息失败");
};

/**
 * 获取合同基本信息
 * @param contractId 合同 ID
 * @returns 合同基本信息
 */
export const getContractInfo = async (contractId: number): Promise<any> => {
  const response = await http.get<any>(`/contract-info/${contractId}`);
  const result = response.data;
  if (result && result.data) {
    return result.data;
  }
  throw new Error("获取合同基本信息失败");
};

/**
 * 删除合同
 * @param contractId 合同 ID
 * @returns 删除结果
 */
export const deleteContract = async (contractId: number): Promise<any> => {
  const response = await http.delete<any>(`/contract-info/${contractId}`);
  const result = response.data;
  if (result && result.code === 200) {
    return result.data;
  }
  throw new Error(result?.message || "删除合同失败");
};

export const contractSignApi = {
  fetchTemplates: fetchContractTemplates,
  fetchPreviewUrl: fetchTemplatePreviewUrl,
  createSignTask,
  fetchFillDetails: fetchSignTaskFillDetails,
  fillFields: fillContractFields,
  preview: previewContract,
  submit: submitSignTask,
  getSignUrl,
  getDetails: getContractDetails,
  getInfo: getContractInfo,
  delete: deleteContract,
  fetchSignerInfo,
};
