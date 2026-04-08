/**
 * 弹窗状态管理 Hook
 */
import { useState, useCallback } from "react";
import { ContractItem } from "@/services/contract";

interface RefundModalState {
  visible: boolean;
  contractId: number | null;
  orderCash: number;
  profileName: string;
  goods: string;
  studentName: string;
}

interface PaymentRecordsModalState {
  visible: boolean;
  contractId: number | null;
  customerProfileId: number | null;
  initialProfileId: number | null;
  initialContractId: number | null;
}

interface PaymentCollectionModalState {
  visible: boolean;
  contractId: number | null;
  profileName: string;
  goods: string;
}

export const useModalManager = () => {
  // 添加成单弹窗
  const [addModalVisible, setAddModalVisible] = useState(false);

  // 退款弹窗
  const [refundModal, setRefundModal] = useState<RefundModalState>({
    visible: false,
    contractId: null,
    orderCash: 0,
    profileName: "",
    goods: "",
    studentName: "",
  });

  // 付款记录弹窗
  const [paymentRecordsModal, setPaymentRecordsModal] = useState<PaymentRecordsModalState>({
    visible: false,
    contractId: null,
    customerProfileId: null,
    initialProfileId: null,
    initialContractId: null,
  });

  // 回款弹窗
  const [paymentCollectionModal, setPaymentCollectionModal] = useState<PaymentCollectionModalState>({
    visible: false,
    contractId: null,
    profileName: "",
    goods: "",
  });

  // 快速回款弹窗
  const [quickPaymentModalVisible, setQuickPaymentModalVisible] = useState(false);

  /**
   * 打开退款弹窗
   */
  const openRefundModal = useCallback((contract: ContractItem) => {
    setRefundModal({
      visible: true,
      contractId: contract.id,
      orderCash: contract.orderCash,
      profileName: contract.profileName,
      goods: contract.goods,
      studentName: contract.studentName,
    });
  }, []);

  /**
   * 关闭退款弹窗
   */
  const closeRefundModal = useCallback(() => {
    setRefundModal({
      visible: false,
      contractId: null,
      orderCash: 0,
      profileName: "",
      goods: "",
      studentName: "",
    });
  }, []);

  /**
   * 打开付款记录弹窗（合同级别）
   */
  const openPaymentRecordsModal = useCallback((contractId: number, profileId?: number) => {
    setPaymentRecordsModal({
      visible: true,
      contractId: null,
      customerProfileId: null,
      initialProfileId: profileId || null,
      initialContractId: contractId,
    });
  }, []);

  /**
   * 打开付款记录弹窗（档案级别）
   */
  const openProfilePaymentRecordsModal = useCallback((customerProfileId: number) => {
    setPaymentRecordsModal({
      visible: true,
      contractId: null,
      customerProfileId,
      initialProfileId: null,
      initialContractId: null,
    });
  }, []);

  /**
   * 关闭付款记录弹窗
   */
  const closePaymentRecordsModal = useCallback(() => {
    setPaymentRecordsModal({
      visible: false,
      contractId: null,
      customerProfileId: null,
      initialProfileId: null,
      initialContractId: null,
    });
  }, []);

  /**
   * 打开回款弹窗
   */
  const openPaymentCollectionModal = useCallback((contractId: number, profileName: string, goods: string) => {
    setPaymentCollectionModal({
      visible: true,
      contractId,
      profileName,
      goods,
    });
  }, []);

  /**
   * 关闭回款弹窗
   */
  const closePaymentCollectionModal = useCallback(() => {
    setPaymentCollectionModal({
      visible: false,
      contractId: null,
      profileName: "",
      goods: "",
    });
  }, []);

  return {
    // 添加成单弹窗
    addModalVisible,
    setAddModalVisible,

    // 退款弹窗
    refundModal,
    openRefundModal,
    closeRefundModal,

    // 付款记录弹窗
    paymentRecordsModal,
    openPaymentRecordsModal,
    openProfilePaymentRecordsModal,
    closePaymentRecordsModal,

    // 回款弹窗
    paymentCollectionModal,
    openPaymentCollectionModal,
    closePaymentCollectionModal,

    // 快速回款弹窗
    quickPaymentModalVisible,
    setQuickPaymentModalVisible,
  };
};
