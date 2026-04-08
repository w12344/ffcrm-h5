/**
 * 合同模板信息
 */
export interface ContractTemplate {
  /** 模板代码 */
  templateCode: string;
  /** 模板ID */
  templateId: string;
  /** 模板名称 */
  templateName: string;
}

/**
 * 合同模板列表响应
 */
export interface ContractTemplateResponse {
  code: number;
  message: string;
  data: ContractTemplate[];
}
