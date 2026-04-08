/**
 * 合同基本信息（第一步）
 */
export interface ContractBasicInfo {
  contractTitle: string;
  signerName: string;
  signerMobile: string;
  signerIdCard: string;
}

/**
 * 合同填写字段请求
 */
export interface ContractFillFieldsRequest {
  /** 签署任务ID */
  signTaskId: string;
  
  // 学生信息
  studentName?: string;
  studentGender?: string;
  studentIdCard?: string;
  currentSchool?: string;
  studentGrade?: string;
  currentGrade?: string;
  studentPhone?: string;
  
  // 监护人信息
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianIdCard?: string;
  
  // 课程信息
  courseName?: string;
  advisor?: string;
  trainingMethod?: string; // 一对一、大班、小班
  
  // 选考冲刺营
  isXkccy?: boolean;
  xkccyStudyStartDate?: string;
  xkccyStudyEndDate?: string;
  xkccyHourlyFeeChecked?: boolean;
  xkccyMaterialFeeChecked?: boolean;
  xkccyPadFeeChecked?: boolean;
  xkccyInsuranceFeeChecked?: boolean;
  xkccyHourlyfee?: number;
  xkccyMaterialFee?: number;
  xkccyPadFee?: number;
  xkccyInsuranceFee?: number;
  xkccyTotalFeeChinese?: string;
  xkccyTotalFee?: number;
  
  // 高考冲刺营
  isGkccy?: boolean;
  gkccyStudyStartDate?: string;
  gkccyStudyEndDate?: string;
  gkccyHourlyFeeChecked?: boolean;
  gkccyMaterialFeeChecked?: boolean;
  gkccyPadFeeChecked?: boolean;
  gkccyInsuranceFeeChecked?: boolean;
  gkccyHourlyfee?: number;
  gkccyMaterialFee?: number;
  gkccyPadFee?: number;
  gkccyInsuranceFee?: number;
  gkccyTotalFeeChinese?: string;
  gkccyTotalFee?: number;
  
  // 直通车
  isZtc?: boolean;
  ztcTypeRadioButton?: string; // 联考直通车、校考直通车
  ztcStudyStartDate?: string;
  ztcStudyEndDate?: string;
  ztcHourlyFeeChecked?: boolean;
  ztcMaterialFeeChecked?: boolean;
  ztcPadFeeChecked?: boolean;
  ztcInsuranceFeeChecked?: boolean;
  ztcHourlyfee?: number;
  ztcMaterialFee?: number;
  ztcPadFee?: number;
  ztcInsuranceFee?: number;
  ztcTotalFeeChinese?: string;
  ztcTotalFee?: number;
  
  // 支付信息
  payDate1?: string;
  payFeeChinese1?: string;
  payDate2?: string;
  payFeeChinese2?: string;
  payChannel?: string; // 银行卡、其他
  otherPayChannel?: string;
  
  // 签订信息
  signDate1?: string;
  signDate2?: string;
  advisorSign?: string;
}
