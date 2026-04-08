/**
 * UniversalCircularChart - 通用环形进度图组件
 *
 * 支持两种模式：
 * 1. 单环模式 (mode: 'single') - 显示单个进度环
 * 2. 双环模式 (mode: 'dual') - 显示两个数据段的环形图
 *
 * 使用示例：
 *
 * 单环模式：
 * <UniversalCircularChart
 *   mode="single"
 *   value="78.0%"
 *   label="目标完成率"
 *   colorScheme="purple-pink"
 * />
 *
 * 双环模式：
 * <UniversalCircularChart
 *   mode="dual"
 *   centerValue="195"
 *   centerLabel="月度总积分"
 *   segments={[
 *     { value: 37, label: "月度关系经营积分", colorScheme: "cyan-purple" },
 *     { value: 158.5, label: "月度客户洞察积分", colorScheme: "orange-pink" }
 *   ]}
 * />
 */

import React, { useEffect, useRef, useMemo } from "react";
import VChart from "@visactor/vchart";
import { useTheme } from "@/hooks/useTheme";
import "./index.less";

// ============================================================================
// 类型定义
// ============================================================================

/** 预设的颜色方案 */
export type ColorScheme =
  | "purple-pink"      // 紫粉渐变 (月度总积分默认)
  | "blue-pink"        // 蓝粉渐变 (招生完成度)
  | "blue-purple"      // 蓝紫渐变 (目标金额完成度)
  | "cyan-purple"      // 青紫渐变 (关系经营积分)
  | "orange-pink"      // 橙粉渐变 (客户洞察积分)
  | "custom";          // 自定义颜色

/** 渐变色停止点 */
export interface GradientStop {
  offset: number;
  color: string;
}

/** 双环模式的数据段 */
export interface ChartSegment {
  value: number;
  label: string;
  colorScheme?: ColorScheme;
  customColors?: GradientStop[];
}

/** 单环模式的 Props */
interface SingleModeProps {
  mode: "single";
  /** 显示的值，如 "78.0%" 或 "195" */
  value: string;
  /** 中心标签文字 */
  label: string;
  /** 颜色方案 */
  colorScheme?: ColorScheme;
  /** 自定义渐变色（当 colorScheme 为 custom 时使用） */
  customColors?: GradientStop[];
}

/** 双环模式的 Props */
interface DualModeProps {
  mode: "dual";
  /** 中心显示的值 */
  centerValue: string;
  /** 中心标签文字 */
  centerLabel: string;
  /** 数据段配置 */
  segments: [ChartSegment, ChartSegment];
}

/** 组件 Props */
export type UniversalCircularChartProps = SingleModeProps | DualModeProps;

// ============================================================================
// 颜色配置
// ============================================================================

/** 获取预设的渐变色配置 */
const getPresetGradientColors = (
  scheme: ColorScheme,
  isDark: boolean
): GradientStop[] => {
  switch (scheme) {
    case "purple-pink":
      // 月度总积分 - 紫粉渐变
      return [
        { offset: 0, color: "#80239F" },
        { offset: 0.5, color: "#B43483" },
        { offset: 1, color: "#FE8B83" },
      ];
    case "blue-pink":
      // 招生完成度 - 蓝粉渐变
      return [
        { offset: 0, color: "#1e3a8a" },
        { offset: 0.5, color: "#1e3a8a" },
        { offset: 1, color: "#FE8B83" },
      ];
    case "blue-purple":
      // 目标金额完成度 - 蓝紫渐变
      return [
        { offset: 0, color: "#4facfe" },
        { offset: 0.3, color: "#00f2fe" },
        { offset: 0.7, color: "#667eea" },
        { offset: 1, color: "#764ba2" },
      ];
    case "cyan-purple":
      // 关系经营积分 - 青紫渐变
      if (isDark) {
        return [
          { offset: 0, color: "#0F55E8" },
          { offset: 1, color: "#1a3a8a" },
        ];
      }
      return [
        { offset: 0, color: "rgba(6, 215, 246, 1)" },
        { offset: 1, color: "rgba(72, 7, 234, 1)" },
      ];
    case "orange-pink":
      // 客户洞察积分 - 橙粉渐变
      if (isDark) {
        return [
          { offset: 0, color: "#FE8B83" },
          { offset: 0.5, color: "#B43483" },
          { offset: 1, color: "#80239F" },
        ];
      }
      return [
        { offset: 0, color: "rgba(255, 185, 41, 1)" },
        { offset: 1, color: "rgba(255, 127, 183, 1)" },
      ];
    default:
      return [
        { offset: 0, color: "#80239F" },
        { offset: 0.5, color: "#B43483" },
        { offset: 1, color: "#FE8B83" },
      ];
  }
};

// ============================================================================
// 工具函数
// ============================================================================

/** 解析进度值 */
const parseProgressValue = (value: string): number => {
  if (value.includes("%")) {
    return parseFloat(value.replace("%", "")) / 100;
  }
  return 1;
};

/** 创建 VChart 渐变配置 */
const createGradientFill = (
  stops: GradientStop[],
  type: "conical" | "linear" = "conical"
) => {
  if (type === "linear") {
    return {
      gradient: "linear",
      x0: 0,
      y0: 0,
      x1: 1,
      y1: 1,
      stops,
    };
  }
  return {
    gradient: "conical",
    stops,
  };
};

// ============================================================================
// 单环模式组件
// ============================================================================

const SingleRingChart: React.FC<SingleModeProps> = ({
  value,
  label,
  colorScheme = "purple-pink",
  customColors,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<VChart | null>(null);
  const { isDark } = useTheme();

  const gradientColors = useMemo(() => {
    if (colorScheme === "custom" && customColors) {
      return customColors;
    }
    return getPresetGradientColors(colorScheme, isDark);
  }, [colorScheme, customColors, isDark]);

  const progress = useMemo(() => parseProgressValue(value), [value]);

  useEffect(() => {
    if (!chartRef.current) return;

    let resizeObserver: ResizeObserver | null = null;
    let renderTimeout: NodeJS.Timeout;

    const renderChart = () => {
      if (!chartRef.current) return;

      // Ensure we get valid dimensions even in hidden/tooltip states
      const rect = chartRef.current.getBoundingClientRect();
      const containerWidth = rect.width || chartRef.current.clientWidth || 54;
      const containerHeight = rect.height || chartRef.current.clientHeight || 54;

      if (containerWidth === 0 || containerHeight === 0) return;

      const containerSize = Math.min(containerWidth, containerHeight);
      const baseFontSize = containerSize * 0.18;
      const labelFontSize = baseFontSize * 0.35;

      const spec = {
        type: "circularProgress" as const,
        data: [
          {
            id: "id0",
            values: [
              {
                type: label,
                value: progress,
                text: value,
              },
            ],
          },
        ],
        valueField: "value",
        categoryField: "type",
        seriesField: "type",
        radius: 1,
        innerRadius: 0.7,
        roundCap: true,
        cornerRadius: 8,
        maxValue: 1,
        progress: {
          style: {
            innerPadding: 0,
            outerPadding: 0,
            cornerRadius: 25,
            fill: createGradientFill(gradientColors, "conical"),
          },
        },
        track: {
          style: {
            fill: isDark ? "#3f3f3f" : "rgb(245, 236, 230)", // 统一背景环颜色
          },
        },
        indicator: {
          visible: true,
          fixed: true,
          trigger: "none",
          title: {
            visible: true,
            autoLimit: true,
            space: 8,
            style: {
              fontSize: labelFontSize,
              fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              fontWeight: "normal",
              textAlign: "center",
              text: label,
            },
          },
          content: [
            {
              visible: true,
              style: {
                fontSize: baseFontSize,
                fill: isDark ? "#FFFFFF" : "#000000",
                fontWeight: 600,
                fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
                textAlign: "center",
                text: value,
              },
            },
          ],
        },
        background: "transparent",
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        outerRadius: 1,
        width: containerWidth,
        height: containerHeight,
        animationAppear: {
          duration: 1500,
          easing: "cubicOut",
          preset: "growRadius",
        },
      };

      if (chartInstance.current) {
        chartInstance.current.release();
        chartInstance.current = null;
      }

      chartInstance.current = new VChart(spec, {
        dom: chartRef.current,
        mode: "desktop-browser",
        dpr: 3,
        autoFit: true,
        animation: true,
      });

      chartInstance.current.renderSync();
    };

    // Use ResizeObserver for more reliable rendering in tooltips
    if (typeof ResizeObserver !== 'undefined' && chartRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        // Debounce render to avoid ResizeObserver loop limit exceeded errors
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => {
          if (entries[0].contentRect.width > 0 && entries[0].contentRect.height > 0) {
            renderChart();
          }
        }, 50);
      });
      resizeObserver.observe(chartRef.current);
    } else {
      // Fallback
      renderChart();
      window.addEventListener("resize", renderChart);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", renderChart);
      }
      clearTimeout(renderTimeout);
      if (chartInstance.current) {
        chartInstance.current.release();
        chartInstance.current = null;
      }
    };
  }, [progress, gradientColors, value, label, isDark]);

  return (
    <div className="universal-circular-chart">
      <div className="chart-wrapper">
        <div ref={chartRef} className="chart-canvas" />
      </div>
    </div>
  );
};

// ============================================================================
// 双环模式组件
// ============================================================================

const DualRingChart: React.FC<DualModeProps> = ({
  centerValue,
  centerLabel,
  segments,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<VChart | null>(null);
  const { isDark } = useTheme();

  const hasData = useMemo(
    () => segments.some((seg) => seg.value > 0),
    [segments]
  );

  useEffect(() => {
    if (!chartRef.current) return;

    const renderChart = () => {
      if (!chartRef.current) return;

      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = chartRef.current.clientHeight;

      if (containerWidth === 0 || containerHeight === 0) return;

      const containerSize = Math.min(containerWidth, containerHeight);
      const baseFontSize = containerSize * 0.18;
      const labelFontSize = baseFontSize * 0.35;

      const chartData = hasData
        ? segments.map((seg) => ({
            type: seg.label,
            value: seg.value,
          }))
        : [{ type: "默认圆环", value: 1 }];

      const spec = {
        type: "pie" as const,
        data: [{ id: "id0", values: chartData }],
        valueField: "value",
        categoryField: "type",
        seriesField: "type",
        radius: 0.92,
        innerRadius: 0.65,
        roundCap: true,
        cornerRadius: 8,
        label: { visible: false },
        pie: {
          style: {
            fill: (datum: any) => {
              if (datum.type === "默认圆环") {
                return isDark ? "#3f3f3f" : "rgb(245, 236, 230)";
              }

              const segment = segments.find((seg) => seg.label === datum.type);
              if (!segment) return "#666666";

              const colors = segment.customColors ||
                getPresetGradientColors(segment.colorScheme || "purple-pink", isDark);

              return createGradientFill(colors, "linear");
            },
          },
        },
        indicator: {
          visible: true,
          fixed: true,
          trigger: "none",
          title: {
            visible: true,
            autoLimit: true,
            space: 8,
            style: {
              fontSize: labelFontSize,
              fill: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              fontWeight: "normal",
              textAlign: "center",
              text: centerLabel,
            },
          },
          content: [
            {
              visible: true,
              style: {
                fontSize: baseFontSize,
                fontWeight: 700,
                fill: isDark ? "#FFFFFF" : "#000000",
                fontFamily: "DIN Alternate, -apple-system, BlinkMacSystemFont, sans-serif",
                textAlign: "center",
                text: centerValue,
              },
            },
          ],
        },
        track: {
          style: {
            fill: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          },
        },
        background: "transparent",
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        outerRadius: 1,
        width: containerWidth,
        height: containerHeight,
        animationAppear: {
          duration: 1500,
          easing: "cubicOut",
          preset: "growRadius",
        },
      };

      if (chartInstance.current) {
        chartInstance.current.release();
        chartInstance.current = null;
      }

      chartInstance.current = new VChart(spec, {
        dom: chartRef.current,
        mode: "desktop-browser",
        dpr: 3,
        autoFit: true,
        animation: true,
      });

      chartInstance.current.renderSync();
    };

    renderChart();

    const handleResize = () => {
      requestAnimationFrame(renderChart);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstance.current) {
        chartInstance.current.release();
        chartInstance.current = null;
      }
    };
  }, [centerValue, centerLabel, segments, hasData, isDark]);

  return (
    <div className="universal-circular-chart">
      <div className="chart-wrapper">
        <div ref={chartRef} className="chart-canvas" />
      </div>
    </div>
  );
};

// ============================================================================
// 主组件
// ============================================================================

const UniversalCircularChart: React.FC<UniversalCircularChartProps> = (props) => {
  if (props.mode === "single") {
    return <SingleRingChart {...props} />;
  }
  return <DualRingChart {...props} />;
};

export default UniversalCircularChart;
