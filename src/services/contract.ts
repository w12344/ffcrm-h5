import request from "@/utils/request";

// 成交报单查询参数
export interface ContractQueryParams {
  pageNumber: number;
  pageSize: number;
  customerProfileId?: number;
  studentName?: string;
  studentGrade?: string;
  studentMajors?: string;
  studentProvince?: string;
  studentSource?: string;
  studentSubject?: string;
  profileName?: string;
  goods?: string;
  orderDateStart?: string;
  orderDateEnd?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// 成交报单数据项
export interface ContractItem {
  id: number;
  customerProfileId: number;
  orderCash: number;
  refundCash: number;
  contractCash: number | null;
  employeeId: number;
  orderDate: string;
  studentName: string;
  studentGrade: string;
  studentMajors: string;
  studentInstitution: string | null;
  studentProvince: string;
  studentSource: string;
  studentSubject: string | null;
  screenShotPath: string;
  studentSourceOrg: string;
  profileName: string;
  goods: string;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
}

// 客户档案分组数据
export interface ContractProfileGroup {
  customerProfileId: number;
  profileName: string;
  studentName: string;
  contractCount: number;
  totalOrderCash: number;
  totalRefundCash: number;
  contracts: ContractItem[];
}

// 分页数据
export interface ContractPageData {
  data: ContractProfileGroup[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 分页响应数据
export interface ContractPageResponse {
  code: number;
  message: string;
  data: ContractPageData;
}

// 创建成单请求参数
export interface CreateContractParams {
  customerProfileId: number;
  studentName: string;
  gender: string;
  goods: string;
  studentGrade: string;
  studentProvince: string;
  studentInstitution: string;
  studentMajors: string;
  currentSchool?: string;
  studentSource: string;
  contractCash: number;
  orderDate: string;
  orderCash: number;
  remark?: string;
  screenShotPaths?: string[];
  isNotify?: boolean;
  isRenewal?: boolean;
  discountAmount?: number;
  discountRemark?: string;
  paymentItems?: {
    paymentItem: string;
    amount: number;
  }[];
}

// 创建成单响应
export interface CreateContractResponse {
  code: number;
  message: string;
  data: ContractItem;
}

// 获取成交报单列表
export const fetchContractList = (params: ContractQueryParams) => {
  return request.post<ContractPageResponse>("/contract/pageNew", params);
};

// 客户档案选项
export interface ProfileOption {
  id: number;
  remarkName: string;
  editionNumStr: string;
  studentGrade?: string;
}

// 获取客户档案列表响应
export interface ProfileListResponse {
  code: number;
  message: string;
  data: ProfileOption[];
}

// 创建成单
export const createContract = (params: CreateContractParams) => {
  return request.post<CreateContractResponse>("/contract/create", params);
};

// 获取客户档案列表
export const fetchProfileList = () => {
  return request.get<ProfileListResponse>("/contract/profiles");
};

// 产品选项
export interface GoodsOption {
  id: number;
  name: string;
  type: string;
}

// 获取产品列表响应
export interface GoodsListResponse {
  code: number;
  message: string;
  data: GoodsOption[];
}

// 获取产品列表
export const fetchGoodsList = () => {
  return request.get<GoodsListResponse>("/contract/goods");
};

// 选项项（单个选项）
export interface SelectionItem {
  key: string | null;
  value: string;
}

// 选项组（包含一组选项）
export interface SelectionGroup {
  key: string;
  desc: string;
  selections: SelectionItem[];
}

// 获取选项列表响应
export interface SelectionListResponse {
  code: number;
  message: string;
  data: SelectionGroup[];
}

// 获取选项列表（机构和来源）
export const fetchSelectionList = () => {
  return request.get<SelectionListResponse>("/contract/selection");
};

// 退款请求参数
export interface RefundContractParams {
  contractId: number;
  refundCash: number;
  refundType: string;
  refundReason: string;
  refundDate: string;
  payeeName: string;
  payeeBank: string;
  payeeBankNumber: string;
  refundRemark: string;
  screenShotPaths?: string[];
  paymentItems?: {
    paymentItem: string;
    amount: number;
  }[];
}

// 退款响应
export interface RefundContractResponse {
  code: number;
  message: string;
  data: any;
}

// 退款接口
export const refundContract = (params: RefundContractParams) => {
  return request.post<RefundContractResponse>("/contract/refund", params);
};

// 统计数据
export interface ContractStatData {
  totalContractCount: number;
  totalOrderCash: number;
  totalRefundCash: number;
  profileCount: number;
}

// 统计响应
export interface ContractStatResponse {
  code: number;
  message: string;
  data: ContractStatData;
}

// 获取统计数据
export const fetchContractStat = (params: Omit<ContractQueryParams, 'pageNumber' | 'pageSize'>) => {
  return request.post<ContractStatResponse>("/contract/stat", params);
};

// 报单分页数据
export interface OrderPageData {
  data: ContractItem[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 报单列表响应
export interface OrderPageResponse {
  code: number;
  message: string;
  data: OrderPageData;
}

// 获取报单列表
export const fetchOrderList = (params: ContractQueryParams) => {
  return request.post<OrderPageResponse>("/contract/page", params);
};

// 付款项目
export interface PaymentItem {
  paymentItem: string;
  amount: number;
}

// 付款记录项
export interface PaymentRecord {
  id: number;
  customerProfileId: number;
  contractId: number;
  paymentAmount: number;
  paymentType: number;
  paymentTypeDesc: string;
  screenShotPaths: string[];
  paymentItems: PaymentItem[];
  remark: string | null;
  approvalStatus?: number; // 1-审批中，2-退回，3-通过
  createdAt: string;
  updatedAt: string;
}

// 付款记录响应
export interface PaymentRecordsResponse {
  code: number;
  message: string;
  data: PaymentRecord[];
}

// 获取付款记录
export const fetchPaymentRecords = (contractId: number) => {
  return request.get<PaymentRecordsResponse>(`/contract/payment-records/${contractId}`);
};

// 付款记录分页查询参数
export interface PaymentRecordQueryParams {
  pageNumber: number;
  pageSize: number;
  contractId?: number;
  goods?: string;
  studentName?: string;
  profileName?: string;
  approvalStatus?: number; // 1-审批中，2-退回，3-通过
}

// 付款记录分页数据
export interface PaymentRecordPageData {
  data: PaymentRecord[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 付款记录分页响应
export interface PaymentRecordPageResponse {
  code: number;
  message: string;
  data: PaymentRecordPageData;
}

// 获取付款记录分页列表
export const fetchPaymentRecordPage = (params: PaymentRecordQueryParams) => {
  return request.post<PaymentRecordPageResponse>("/contract/payment-record/page", params);
};

// 档案产品项
export interface ProfileProduct {
  id: number;
  goods: string;
}

// 档案产品列表响应
export interface ProfileProductsResponse {
  code: number;
  message: string;
  data: ProfileProduct[];
}

// 获取档案产品列表
export const fetchProfileProducts = (customerProfileId: number) => {
  return request.get<ProfileProductsResponse>(`/contract/listByProfileId`, {
    params: { customerProfileId }
  });
};

// 回款产品选项
export interface PaymentGoodsOption {
  id: number;
  name: string;
  type: string;
}

// 回款产品列表响应
export interface PaymentGoodsResponse {
  code: number;
  message: string;
  data: PaymentGoodsOption[];
}

// 获取回款产品列表
export const fetchPaymentGoods = () => {
  return request.get<PaymentGoodsResponse>(`/contract/goods`, {
    params: { type: 3 }
  });
};

// 创建回款记录请求参数
export interface CreatePaymentRecordParams {
  contractId: number;
  paymentItems: {
    paymentItem: string;
    amount: number;
  }[];
  paymentAmount: number;
  screenShotPaths: string[];
  remark: string;
}

// 创建回款记录响应
export interface CreatePaymentRecordResponse {
  code: number;
  message: string;
  data: any;
}

// 创建回款记录
export const createPaymentRecord = (params: CreatePaymentRecordParams) => {
  return request.post<CreatePaymentRecordResponse>("/contract/payment-record/create", params);
};

// 档案选项（带合同）
export interface ProfileWithContract {
  id: number;
  profileName: string;
  editionNum?: string;
  salesName?: string;
  remarkName?: string;
  editionNumStr?: string;
}

// 获取有合同的档案列表响应
export interface ProfilesWithContractsResponse {
  code: number;
  message: string;
  data: ProfileWithContract[];
}

// 获取有合同的档案列表
export const fetchProfilesWithContracts = () => {
  return request.get<ProfilesWithContractsResponse>("/contract/profiles-with-contracts");
};

// 搜索带合同的客户档案（COACH角色专用）
export interface SearchProfilesWithContractsResponse {
  code: number;
  message: string;
  data: ProfileWithContract[];
}

export const searchProfilesWithContracts = (profileName: string) => {
  return request.get<SearchProfilesWithContractsResponse>("/contract/search-profiles-with-contracts", {
    params: { profileName }
  });
};

// 根据档案ID获取合同详情（COACH角色专用）
export interface ContractDetailByProfile {
  studentName?: string;
  studentGrade?: string;
  studentProvince?: string;
  studentInstitution?: string;
  studentMajors?: string;
  currentSchool?: string;
  studentSource?: string;
  gender?: string;
  goods?: string;
  contractCash?: number;
  [key: string]: any;
}

export interface ContractDetailByProfileResponse {
  code: number;
  message: string;
  data: ContractDetailByProfile;
}

export const getContractDetailByProfile = (profileId: number) => {
  return request.get<ContractDetailByProfileResponse>("/contract/contract-detail-by-profile", {
    params: { profileId }
  });
};
