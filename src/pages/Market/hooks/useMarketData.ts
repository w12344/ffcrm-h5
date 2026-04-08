import { useState, useEffect } from "react";
import type { KPIData } from "@/types/dashboard";
import { useAuth } from "@/contexts/AuthContext";

/**
 * 市场部专属数据 Hook
 * 专注于线索获取、分配效率和流量质量
 */
export const useMarketData = (timeDimension: 'year' | 'month' = 'year') => {
  const { hasToken } = useAuth();
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟从接口获取市场部专属 KPI
    const loadMarketKPIs = async () => {
      setLoading(true);
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 800));

      const compareLabel = timeDimension === 'year' ? '年' : '月';

      const marketKPIs: KPIData[] = [
        {
          title: "线索数量",
          mainValue: timeDimension === 'year' ? "1,280 人" : "280 人",
          mainChange: "+45",
          mainPercent: "92%",
          mainTrend: "up",
          compareLabel: compareLabel,
          subMetrics: [
            {
              title: "待处理线索",
              value: "156",
              change: "-12",
              percent: "12%",
              trend: "down",
              compareLabel: compareLabel
            },
            {
              title: "今日新增线索",
              value: "38",
              change: "+5",
              percent: "3%",
              trend: "up",
              compareLabel: compareLabel
            }
          ],
          chartValue: "85.3%",
          chartLabel: "目标完成率",
          chartColor: "blue-purple",
          chartType: "circular"
        },
        {
          title: "线索质量与流转",
          mainValue: "82.4%",
          mainChange: "+3.6%",
          mainPercent: "88%",
          mainTrend: "up",
          compareLabel: compareLabel,
          subMetrics: [
            {
              title: "已建联线索",
              value: "648 人",
              change: "+24",
              percent: "52%",
              trend: "up",
              compareLabel: compareLabel
            },
            {
              title: "高意向占比",
              value: "32.5%",
              change: "+4.2%",
              percent: "42%",
              trend: "up",
              compareLabel: compareLabel
            }
          ],
          chartValue: "82.4%",
          chartLabel: "线索建联率",
          chartColor: "blue-green",
          chartType: "circular"
        },
        {
          title: "线索成交与转化",
          mainValue: "12.5%",
          mainChange: "+2.1%",
          mainPercent: "88%",
          mainTrend: "up",
          compareLabel: compareLabel,
          subMetrics: [
            {
              title: "已成交线索数",
              value: "42 笔",
              change: "+5",
              percent: "12%",
              trend: "up",
              compareLabel: compareLabel
            },
            {
              title: "已成交线索销售总额",
              value: "¥32.5w",
              change: "+¥1.2w",
              percent: "92%",
              trend: "up",
              compareLabel: compareLabel
            }
          ],
          chartValue: "12.5%",
          chartLabel: "成交转化率",
          chartColor: "pink-red",
          chartType: "circular"
        }
      ];

      setKpiData(marketKPIs);
      setLoading(false);
    };

    if (hasToken) {
      loadMarketKPIs();
    }
  }, [hasToken, timeDimension]);

  return {
    kpiData,
    loading
  };
};
