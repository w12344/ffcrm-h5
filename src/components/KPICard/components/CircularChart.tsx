/**
 * CircularChart - KPICard 专用环形图组件
 *
 * 这是一个向后兼容的包装组件，内部使用 UniversalCircularChart 通用组件。
 * 保留原有的 API 接口，确保现有代码无需修改。
 *
 * 如需在其他地方使用环形图，推荐直接使用 UniversalCircularChart 组件：
 * import UniversalCircularChart from '@/components/UniversalCircularChart';
 */

import React from "react";
import UniversalCircularChart, { ColorScheme } from "@/components/UniversalCircularChart";

// ============================================================================
// 类型定义
// ============================================================================

interface CircularChartProps {
  value: string;
  label: string;
  color: "blue-purple" | "pink-red" | "blue-green" | "orange" | "purple" | "purple-pink" | "cyan-purple" | "orange-pink";
}

interface MonthlyScoreChartProps {
  totalScore: number;
  relationshipScore: number;
  insightScore: number;
}

// ============================================================================
// 颜色映射
// ============================================================================

/** 将旧的 color prop 映射到新的 colorScheme */
const mapColorToScheme = (color: string): ColorScheme => {
  switch (color) {
    case "blue-purple":
      return "blue-purple"; // Fix mapping
    case "pink-red":
      return "blue-pink";
    case "blue-green":
      return "cyan-purple"; // Fix mapping
    case "orange":
      return "orange-pink";
    case "purple":
      return "purple-pink";
    case "purple-pink":
      return "purple-pink";
    case "cyan-purple":
      return "cyan-purple";
    case "orange-pink":
      return "orange-pink";
    default:
      return "purple-pink";
  }
};

// ============================================================================
// 单环进度图组件
// ============================================================================

const CircularChart: React.FC<CircularChartProps> = ({
  value,
  label,
  color,
}) => {
  return (
    <div className="chart-container">
      <div className="circular-chart">
        <UniversalCircularChart
          mode="single"
          value={value}
          label={label}
          colorScheme={mapColorToScheme(color)}
        />
      </div>
    </div>
  );
};

// ============================================================================
// 月度总积分专用双环图组件
// ============================================================================

export const MonthlyScoreChart: React.FC<MonthlyScoreChartProps> = ({
  totalScore,
  relationshipScore,
  insightScore,
}) => {
  return (
    <div className="chart-container">
      <div className="circular-chart">
        <UniversalCircularChart
          mode="dual"
          centerValue={String(totalScore)}
          centerLabel="月度总积分"
          segments={[
            {
              value: relationshipScore,
              label: "月度关系经营积分",
              colorScheme: "cyan-purple",
            },
            {
              value: insightScore,
              label: "月度客户洞察积分",
              colorScheme: "orange-pink",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CircularChart;
