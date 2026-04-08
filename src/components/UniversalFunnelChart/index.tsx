import React from 'react';
import ReactECharts from 'echarts-for-react';

export type ColorScheme =
  | "purple-pink"
  | "blue-pink"
  | "blue-purple"
  | "cyan-purple"
  | "orange-pink"
  | "orange"
  | "green"
  | "custom";

export interface FunnelData {
  name: string;
  value: number;
}

export interface UniversalFunnelChartProps {
  data: FunnelData[];
  colorSchemes?: ColorScheme[];
  themeMode?: 'light' | 'dark';
  height?: string | number;
  width?: string | number;
  className?: string;
  style?: React.CSSProperties;
  gap?: number;
  labelPosition?: 'inside' | 'outside' | 'left' | 'right';
  title?: string;
}

export const getGradientObj = (scheme: ColorScheme, isDark: boolean, isHorizontal = false) => {
  let stops = [];
  switch (scheme) {
    case "purple-pink":
      stops = [ { offset: 0, color: "#80239F" }, { offset: 0.5, color: "#B43483" }, { offset: 1, color: "#FE8B83" } ]; break;
    case "blue-pink":
      stops = [ { offset: 0, color: "#1e3a8a" }, { offset: 0.5, color: "#1e3a8a" }, { offset: 1, color: "#FE8B83" } ]; break;
    case "blue-purple":
      stops = [ { offset: 0, color: "#4facfe" }, { offset: 0.3, color: "#00f2fe" }, { offset: 0.7, color: "#667eea" }, { offset: 1, color: "#764ba2" } ]; break;
    case "cyan-purple":
      stops = isDark ? [ { offset: 0, color: "#0F55E8" }, { offset: 1, color: "#1a3a8a" } ] : [ { offset: 0, color: "rgba(6, 215, 246, 1)" }, { offset: 1, color: "rgba(72, 7, 234, 1)" } ]; break;
    case "orange-pink":
      stops = isDark ? [ { offset: 0, color: "#FE8B83" }, { offset: 0.5, color: "#B43483" }, { offset: 1, color: "#80239F" } ] : [ { offset: 0, color: "rgba(255, 185, 41, 1)" }, { offset: 1, color: "rgba(255, 127, 183, 1)" } ]; break;
    case "orange":
      stops = [ { offset: 0, color: "#FFA94D" }, { offset: 0.5, color: "#FF7B00" }, { offset: 1, color: "#FF7B00" } ]; break;
    case "green":
      stops = [ { offset: 0, color: "#50E3C2" }, { offset: 1, color: "#78EAD1" } ]; break;
    default:
      stops = [ { offset: 0, color: "#80239F" }, { offset: 1, color: "#FE8B83" } ]; break;
  }
  
  return {
    type: 'linear',
    x: 0, y: 0, x2: isHorizontal ? 1 : 0, y2: isHorizontal ? 0 : 1,
    colorStops: stops
  };
};

const UniversalFunnelChart: React.FC<UniversalFunnelChartProps> = ({
  data,
  colorSchemes = ["purple-pink", "blue-purple", "cyan-purple", "orange-pink", "orange"],
  themeMode = 'light',
  height = '100%',
  width = '100%',
  className = '',
  style,
  gap = 4,
  labelPosition = 'inside',
  title
}) => {
  const isDark = themeMode === 'dark';
  
  const colors = colorSchemes.map(scheme => getGradientObj(scheme, isDark, false));

  const option = {
    tooltip: { trigger: 'item', formatter: '{b} : {c}人' },
    color: colors,
    series: [
      {
        name: title || '漏斗分析',
        type: 'funnel',
        left: '10%',
        width: '80%',
        minSize: '20%',
        maxSize: '100%',
        sort: 'desc',
        gap: gap,
        label: {
          show: true,
          position: labelPosition,
          formatter: '{b}: {c}人',
          color: labelPosition === 'inside' ? '#fff' : (isDark ? '#cbd5e1' : '#334155'),
          fontSize: 13,
          fontWeight: 'bold',
          textShadowBlur: labelPosition === 'inside' ? 2 : 0,
          textShadowColor: labelPosition === 'inside' ? 'rgba(0,0,0,0.3)' : 'transparent'
        },
        itemStyle: {
          borderColor: isDark ? '#1e293b' : '#fff',
          borderWidth: 0,
          borderRadius: 8,
          shadowBlur: 10,
          shadowOffsetY: 5,
          shadowColor: 'rgba(0,0,0,0.1)'
        },
        data: data
      }
    ]
  };

  return (
    <div className={`universal-funnel-chart ${className}`} style={{ height, width, ...style }}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge={true} />
    </div>
  );
};

export default UniversalFunnelChart;