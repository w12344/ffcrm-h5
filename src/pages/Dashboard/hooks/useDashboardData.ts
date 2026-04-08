import { useState, useEffect, useRef } from "react";
import {
  fetchEmployeeScoreStat,
  fetchEmployeeAmountStat,
  fetchEmployeeAdmissionStat,
  fetchCustomerUpgradePool,
} from "@/services/databoard";
import type { KPIData } from "@/types/dashboard";
import { useAuth } from "@/contexts/AuthContext";

/**
 * 客户等级统计类型
 */
export interface CustomerLevelStats {
  A: number;
  B: number;
  C: number;
  D: number;
  X: number;
  total: number;
}

/**
 * 辅助函数：格式化金额（元转万元）
 */
const formatAmount = (amount: number): string => {
  const wan = amount / 10000;
  return wan >= 1 ? `${wan.toFixed(1)}w` : `${amount}`;
};

/**
 * 辅助函数：格式化百分比
 */
const formatPercent = (value: number): string => {
  return `${Math.abs(value).toFixed(0)}%`;
};

/**
 * 辅助函数：安全获取趋势（处理空字符串情况）
 */
const getTrendSafe = (change: number): "up" | "down" | "" => {
  return change > 0 ? "up" : change == 0 ? "" : "down";
};

/**
 * 辅助函数：格式化变化值
 */
const formatChange = (change: number, isAmount: boolean = false): string => {
  const prefix = change > 0 ? "+" : change < 0 ? "-" : "";
  if (isAmount) {
    return `${prefix}${formatAmount(Math.abs(change))}`;
  }
  return `${prefix}${Math.abs(change)}`;
};

/**
 * 看板数据管理 Hook
 * 负责获取和管理整个看板区域的所有数据
 */
export const useDashboardData = () => {
  const { hasToken, isLoading: authLoading } = useAuth();
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [customerLevelStats, setCustomerLevelStats] =
    useState<CustomerLevelStats>({
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      X: 0,
      total: 0,
    });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  console.log("[useDashboardData] customerLevelStats:", customerLevelStats);

  // 加载员工积分统计数据（不传 date 参数，使用后端默认值）
  const loadEmployeeScoreStat = async (): Promise<KPIData> => {
    const response = await fetchEmployeeScoreStat();

    if (!response.data?.data) {
      throw new Error("获取员工积分统计数据失败：数据为空");
    }

    const scoreData = response.data.data;

    // 计算昨日总积分变化
    const yesterdayTotal =
      (scoreData.yesterdayRipeScore || 0) + (scoreData.yesterdayFatScore || 0);

    // 构建月度总积分累计卡片数据
    return {
      title: "月度总积分累计",
      mainValue: String(scoreData.monthlyTotalScore || 0) + "分",
      mainChange: formatChange(yesterdayTotal),
      mainPercent: scoreData.totalRankFormat,
      mainTrend: getTrendSafe(yesterdayTotal),
      subMetrics: [
        {
          title: "月度关系经营积分累计",
          value: String(scoreData.monthlyRipeScore || 0),
          change: formatChange(scoreData.yesterdayRipeScore || 0),
          percent: scoreData.ripeRankFormat || "0",
          trend: getTrendSafe(scoreData.yesterdayRipeScore || 0),
        },
        {
          title: "月度客户洞察积分累计",
          value: String(scoreData.monthlyFatScore || 0),
          change: formatChange(scoreData.yesterdayFatScore || 0),
          percent: scoreData.fatRankFormat || "0",
          trend: getTrendSafe(scoreData.yesterdayFatScore || 0),
        },
      ],
      chartValue: String(scoreData.monthlyTotalScore || 0),
      chartLabel: "月度总积分",
      chartColor: "blue-purple",
      chartType: "score",
    };
  };

  // 加载员工金额统计数据
  const loadEmployeeAmountStat = async (): Promise<KPIData> => {
    const response = await fetchEmployeeAmountStat();

    if (!response.data?.data) {
      throw new Error("获取员工金额统计数据失败：数据为空");
    }

    const amountData = response.data.data;

    // 计算年度完成百分比
    const yearlyCompletion =
      amountData.yearlyTargetAmount > 0
        ? (
            (amountData.yearlyReceivedAmount / amountData.yearlyTargetAmount) *
            100
          ).toFixed(0)
        : "0";

    // 计算合同金额的完成度百分比
    const contractCompletion =
      amountData.yearlyTargetAmount > 0
        ? (
            (amountData.yearlyContractAmount / amountData.yearlyTargetAmount) *
            100
          ).toFixed(0)
        : "0";

    // 计算到账金额的完成度百分比
    const receivedCompletion =
      amountData.yearlyTargetAmount > 0
        ? (
            (amountData.yearlyReceivedAmount / amountData.yearlyTargetAmount) *
            100
          ).toFixed(0)
        : "0";

    // 构建年度金额目标卡片数据
    return {
      title: "年度金额目标",
      mainValue: formatAmount(amountData.yearlyTargetAmount || 0) + "w",
      mainChange: formatChange(amountData.yesterdayReceivedAmount || 0, true),
      mainPercent: formatPercent(amountData.receivedAmountRankPercentage || 0),
      mainTrend: getTrendSafe(amountData.receivedAmountRankChange || 0),
      subMetrics: [
        {
          title: "年度合同金额",
          value: formatAmount(amountData.yearlyContractAmount || 0) + "w",
          change: formatChange(amountData.yesterdayContractAmount || 0, true),
          percent: amountData.contractAmountRankFormat || "0",
          trend: getTrendSafe(amountData.yesterdayContractAmount || 0),
          completionPercent: contractCompletion,
        },
        {
          title: "年度到账金额",
          value: formatAmount(amountData.yearlyReceivedAmount || 0) + "w",
          change: formatChange(amountData.yesterdayReceivedAmount || 0, true),
          percent: amountData.receivedAmountRankFormat || "0",
          trend: getTrendSafe(amountData.yesterdayReceivedAmount || 0),
          completionPercent: receivedCompletion,
        },
      ],
      chartValue: `${yearlyCompletion}%`,
      chartLabel: "目标金额完成度",
      chartColor: "orange",
      chartType: "multi-ring",
      chartCenterTitle: "目标金额完成度",
      chartOuterLabel: "合同金额",
      chartInnerLabel: "到账金额",
      chartTotalProgress: parseFloat(yearlyCompletion),
      chartOuterProgress: parseFloat(contractCompletion),
      chartInnerProgress: parseFloat(receivedCompletion),
      // 年度目标不显示涨跌
      showChart: true,
    };
  };

  // 加载员工招生统计数据
  const loadEmployeeAdmissionStat = async (): Promise<KPIData> => {
    const response = await fetchEmployeeAdmissionStat();

    if (!response.data?.data) {
      throw new Error("获取员工招生统计数据失败：数据为空");
    }

    const admissionData = response.data.data;

    // 计算年度完成百分比（使用签约人数/目标人数）
    const yearlyCompletion =
      admissionData.yearlyTargetAdmission > 0
        ? (
            (admissionData.yearlyContractCount /
              admissionData.yearlyTargetAdmission) *
            100
          ).toFixed(0)
        : "0";

    // 计算签约人数的完成度百分比
    const contractCompletion =
      admissionData.yearlyTargetAdmission > 0
        ? (
            (admissionData.yearlyContractCount /
              admissionData.yearlyTargetAdmission) *
            100
          ).toFixed(0)
        : "0";

    // 计算入学人数的完成度百分比
    const admissionCompletion =
      admissionData.yearlyTargetAdmission > 0
        ? (
            (admissionData.yearlyAdmissionCount /
              admissionData.yearlyTargetAdmission) *
            100
          ).toFixed(0)
        : "0";

    // 构建年度招生人数目标卡片数据
    return {
      title: "年度招生人数目标",
      mainValue: String(admissionData.yearlyTargetAdmission || 0) + "人",
      mainChange: formatChange(admissionData.yesterdayAdmissionCount || 0),
      mainPercent: formatPercent(admissionData.admissionRankPercentage || 0),
      mainTrend: getTrendSafe(admissionData.admissionRankChange || 0),
      subMetrics: [
        {
          title: "年度签约人数",
          value: String(admissionData.yearlyContractCount || 0),
          change: formatChange(admissionData.yesterdayContractCount || 0),
          percent: admissionData.contractRankFormat || "0",
          trend: getTrendSafe(admissionData.yesterdayContractCount || 0),
          completionPercent: contractCompletion,
        },
        {
          title: "年度入学人数",
          value: String(admissionData.yearlyAdmissionCount || 0),
          change: formatChange(admissionData.yesterdayAdmissionCount || 0),
          percent: admissionData.admissionRankFormat || "0",
          trend: getTrendSafe(admissionData.yesterdayAdmissionCount || 0),
          completionPercent: admissionCompletion,
        },
      ],
      chartValue: `${yearlyCompletion}%`,
      chartLabel: "招生完成度",
      chartColor: "blue-purple",
      chartType: "multi-ring",
      chartCenterTitle: "招生完成度",
      chartOuterLabel: "年度签约人数",
      chartInnerLabel: "年度入学人数",
      chartTotalProgress: parseFloat(yearlyCompletion),
      chartOuterProgress: parseFloat(contractCompletion),
      chartInnerProgress: parseFloat(admissionCompletion),
      // 年度目标不显示涨跌
      showChart: true,
      showMainStatus: false,
    };
  };

  // 加载客户等级统计数据
  const loadCustomerLevelStats = async (): Promise<CustomerLevelStats> => {
    const response = await fetchCustomerUpgradePool({});

    if (!response.data?.data) {
      throw new Error("获取客户升级池数据失败：数据为空");
    }

    const stats: CustomerLevelStats = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      X: 0,
      total: 0,
    };

    // 统计各等级客户数量
    response.data.data.list.forEach((customer) => {
      const level = customer.level as keyof Omit<CustomerLevelStats, "total">;
      if (level in stats) {
        stats[level]++;
        stats.total++;
      }
    });

    return stats;
  };

  // 加载所有看板数据
  const loadAllDashboardData = async () => {
    // 防止在 React StrictMode 下重复加载
    if (hasLoadedRef.current) {
      return;
    }

    // 只在有 token 的情况下才调用接口
    if (!hasToken) {
      console.log("[useDashboardData] 等待 token...");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      hasLoadedRef.current = true;

      console.log("[useDashboardData] 开始加载看板数据");
      // 并行加载所有数据
      const [scoreData, amountData, admissionData, levelStats] =
        await Promise.all([
          loadEmployeeScoreStat(),
          loadEmployeeAmountStat(),
          loadEmployeeAdmissionStat(),
          loadCustomerLevelStats(),
        ]);

      // 设置 KPI 数据（按照显示顺序：积分、招生、金额）
      setKpiData([scoreData, admissionData, amountData]);
      setCustomerLevelStats(levelStats);
      console.log("[useDashboardData] 加载成功");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "加载看板数据失败";
      console.error("[useDashboardData] 加载失败:", err);
      setError(errorMessage);
      hasLoadedRef.current = false; // 失败时重置标记，允许重试
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据（手动刷新时不受 hasLoadedRef 限制）
  const refresh = async () => {
    // 只在有 token 的情况下才调用接口
    if (!hasToken) {
      console.log("[useDashboardData] 刷新失败：没有 token");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("[useDashboardData] 开始刷新看板数据");
      // 并行加载所有数据
      const [scoreData, amountData, admissionData] = await Promise.all([
        loadEmployeeScoreStat(),
        loadEmployeeAmountStat(),
        loadEmployeeAdmissionStat(),
      ]);

      // 设置 KPI 数据（按照显示顺序：积分、招生、金额）
      setKpiData([scoreData, admissionData, amountData]);
      console.log("[useDashboardData] 刷新成功");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "刷新看板数据失败";
      console.error("[useDashboardData] 刷新失败:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据，等待认证完成并且有 token 后才调用接口
  useEffect(() => {
    if (!authLoading && hasToken) {
      console.log("[useDashboardData] 认证完成且有 token，开始加载数据");
      loadAllDashboardData();
    }
  }, [hasToken, authLoading]);

  return {
    kpiData,
    customerLevelStats,
    loading: loading || authLoading,
    error,
    refresh,
  };
};
