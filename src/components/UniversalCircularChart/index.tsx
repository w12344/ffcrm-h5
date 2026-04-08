/**
 * UniversalCircularChart - 通用高级环形进度图组件 (Native Canvas Implementation)
 *
 * 深度定制的 Canvas 渲染引擎，完美适配低代码平台。高性能、高配置、无依赖(移除VChart)。
 *
 * 支持三种模式：
 * 1. 单环模式 (mode: 'single') - 带有渐变色和追尾圆角的单进度环
 * 2. 拼接双环模式 (mode: 'dual') - 两段数据拼接成一个完整的环 (如: 月度总积分)
 * 3. 同心双环模式 (mode: 'concentric') - 内外双圈独立进度 (如: 招生完成度/目标金额完成度)
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/hooks/useTheme";
import "./index.less";

// ============================================================================
// 类型定义
// ============================================================================

export type ColorScheme =
  | "purple-pink"
  | "blue-pink"
  | "blue-purple"
  | "cyan-purple"
  | "orange-pink"
  | "orange"
  | "custom";

export interface GradientStop {
  offset: number;
  color: string;
}

export interface ChartSegment {
  value: number;
  label: string;
  colorScheme?: ColorScheme;
  customColors?: GradientStop[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: number | string;
}

export interface BaseChartConfig {
  className?: string;
  style?: React.CSSProperties;
  animationDuration?: number; // 动画时长，默认 1500
  radiusRatio?: number; // 半径占容器的一半的比例，默认 ~0.85
  lineWidthRatio?: number; // 线宽占容器的一半的比例
  trackColor?: string; // 轨道底色
  textColor?: string; // 文本颜色
  titleColor?: string; // 标题颜色
}

interface SingleModeProps extends BaseChartConfig {
  mode: "single";
  value: string;
  label: string;
  colorScheme?: ColorScheme;
  customColors?: GradientStop[];
}

interface DualModeProps extends BaseChartConfig {
  mode: "dual";
  centerValue: string;
  centerLabel: string;
  segments: [ChartSegment, ChartSegment];
}

interface ConcentricModeProps extends BaseChartConfig {
  mode: "concentric";
  totalProgress: number;
  signedProgress: number;
  enrolledProgress: number;
  title?: string;
  colorTheme?: "default" | "orange";
  outerLabel?: string; // 默认 "年度签约人数"
  innerLabel?: string; // 默认 "年度入学人数"
}

export type UniversalCircularChartProps = SingleModeProps | DualModeProps | ConcentricModeProps;

// ============================================================================
// 颜色配置及工具函数
// ============================================================================

const getPresetGradientColors = (scheme: ColorScheme, isDark: boolean): GradientStop[] => {
  switch (scheme) {
    case "purple-pink":
      return [
        { offset: 0, color: "#80239F" },
        { offset: 0.5, color: "#B43483" },
        { offset: 1, color: "#FE8B83" },
      ];
    case "blue-pink":
      return [
        { offset: 0, color: "#1e3a8a" },
        { offset: 0.5, color: "#1e3a8a" },
        { offset: 1, color: "#FE8B83" },
      ];
    case "blue-purple":
      return [
        { offset: 0, color: "#4facfe" },
        { offset: 0.3, color: "#00f2fe" },
        { offset: 0.7, color: "#667eea" },
        { offset: 1, color: "#764ba2" },
      ];
    case "cyan-purple":
      return isDark
        ? [
            { offset: 0, color: "#0F55E8" },
            { offset: 1, color: "#1a3a8a" },
          ]
        : [
            { offset: 0, color: "rgba(6, 215, 246, 1)" },
            { offset: 1, color: "rgba(72, 7, 234, 1)" },
          ];
    case "orange-pink":
      return isDark
        ? [
            { offset: 0, color: "#FE8B83" },
            { offset: 0.5, color: "#B43483" },
            { offset: 1, color: "#80239F" },
          ]
        : [
            { offset: 0, color: "rgba(255, 185, 41, 1)" },
            { offset: 1, color: "rgba(255, 127, 183, 1)" },
          ];
    case "orange":
      return [
        { offset: 0, color: "#FFA94D" },
        { offset: 0.5, color: "#FF7B00" },
        { offset: 1, color: "#FF7B00" },
      ];
    default:
      return [
        { offset: 0, color: "#80239F" },
        { offset: 0.5, color: "#B43483" },
        { offset: 1, color: "#FE8B83" },
      ];
  }
};

const parseProgressValue = (value: string): number => {
  if (value.includes("%")) return parseFloat(value.replace("%", "")) / 100;
  return 1;
};

// ============================================================================
// 核心 Canvas 渲染组件
// ============================================================================

const UniversalCircularChart: React.FC<UniversalCircularChartProps> = (props) => {
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "light";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const [animProgress, setAnimProgress] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, label: "", value: 0,
  });

  // --- 动画逻辑 ---
  useEffect(() => {
    const duration = props.animationDuration || 1500;
    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) startTimeRef.current = currentTime;
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      setAnimProgress(easeOutCubic(progress));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimProgress(1);
        animationRef.current = null;
        startTimeRef.current = null;
      }
    };

    startTimeRef.current = null;
    setAnimProgress(0);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [props.mode, props.animationDuration]); // Re-trigger on mode change

  // --- 绘制逻辑 ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const drawChart = () => {
      const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 2;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const size = Math.min(containerWidth, containerHeight);

      if (size === 0) return;

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const scale = size / 280;
      const startAngle = -Math.PI / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const drawText = (titleText: string, valueText: string) => {
        const baseFontSize = size * 0.18;
        const titleFontSize = baseFontSize * 0.35;
        const valueFontSize = baseFontSize;
        const spacing = 8; // 严格保持 8px 间距，不进行缩放

        const totalTextHeight = titleFontSize + spacing + valueFontSize;
        const titleY = centerY - totalTextHeight / 2 + titleFontSize;
        const valueY = centerY + totalTextHeight / 2;

        ctx.fillStyle = props.titleColor || (theme === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)");
        ctx.font = `normal ${titleFontSize}px PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(titleText, centerX, titleY);

        ctx.fillStyle = props.textColor || (theme === "dark" ? "#FFFFFF" : "#000000");
        ctx.font = `600 ${valueFontSize}px PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(valueText, centerX, valueY);
      };

      const defaultTrackColor = theme === "dark" ? "#3f3f3f" : "rgb(245, 236, 230)";
      const trackColor = props.trackColor || defaultTrackColor;

      // Hex/RGBA to RGB helper
      const hex2rgb = (hex: string) => {
        if(hex.startsWith('rgba')) {
           const parts = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
           return parts ? [parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3])] : [0,0,0];
        }
        const h = hex.replace('#', '');
        return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)];
      };

      // 绘制带渐变的圆弧（支持超过100%的进度，并且渐变会平滑拉伸到整个弧度）
      const drawGradientArc = (radius: number, lineWidth: number, targetAngle: number, colors: GradientStop[], specialBlue: boolean = false) => {
        const segments = 180;
        const anglePerSegment = targetAngle / segments;

        for (let i = 0; i < segments; i++) {
          const segStart = startAngle + i * anglePerSegment;
          const segEnd = segStart + anglePerSegment;
          const p = i / segments;

          let r, g, b;

          if (specialBlue) {
            // 特殊的蓝色分段渐变逻辑，完美还原原版招生完成度蓝色环
            if (p <= 0.52) {
              r = 15; g = 85; b = 232;
            } else if (p <= 0.76) {
              const localP = (p - 0.52) / (0.76 - 0.52);
              r = 15 + (10 - 15) * localP;
              g = 85 + (61 - 85) * localP;
              b = 232 + (159 - 232) * localP;
            } else {
              r = 10; g = 61; b = 159;
            }
          } else {
            // 通用插值
            const cIdx = Math.min(Math.floor(p * (colors.length - 1)), colors.length - 2);
            const c1 = colors[cIdx];
            const c2 = colors[cIdx + 1];
            const rgb1 = hex2rgb(c1.color);
            const rgb2 = hex2rgb(c2.color);
            const localP = (p - c1.offset) / (c2.offset - c1.offset || 1);

            r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * localP);
            g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * localP);
            b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * localP);
          }

          ctx.beginPath();
          // 移除 overlap 0.02 因为使用 round cap 会自然覆盖
          ctx.arc(centerX, centerY, radius, segStart, segEnd);
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = lineWidth;

          // 原版代码所有线段都使用了 round，这能完美解决进度超过 100% 时的交界处覆盖问题
          ctx.lineCap = "round";
          ctx.stroke();
        }
      };

      if (props.mode === "concentric") {
        // --- 同心双环模式 ---
        // 匹配原始 Canvas 尺寸比例
        const outerRadius = (props.radiusRatio ? size/2 * props.radiusRatio : 110 * scale);
        const innerRadius = (props.radiusRatio ? size/2 * props.radiusRatio * 0.8 : 88 * scale);
        const outerLineWidth = props.lineWidthRatio ? size/2 * props.lineWidthRatio : 40 * scale;
        const innerLineWidth = props.lineWidthRatio ? size/2 * props.lineWidthRatio * 0.75 : 30 * scale;

        const signedAngle = (props.signedProgress / 100) * 2 * Math.PI * animProgress;
        const enrolledAngle = (props.enrolledProgress / 100) * 2 * Math.PI * animProgress;

        // 外圈背景
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = trackColor;
        ctx.lineWidth = outerLineWidth;
        ctx.stroke();

        // 外圈进度
        if (signedAngle > 0) {
          const isOrange = props.colorTheme === 'orange';
          const colors: GradientStop[] = isOrange ? [
            { offset: 0, color: '#FFA94D' },
            { offset: 1, color: '#FF7B00' }
          ] : [];
          drawGradientArc(outerRadius, outerLineWidth, signedAngle, colors, !isOrange);
        }

        // 内圈进度
        if (enrolledAngle > 0 && props.enrolledProgress > 1) {
          const colors: GradientStop[] = props.colorTheme === 'orange' ? [
            { offset: 0, color: '#FF7FB7' },
            { offset: 1, color: '#FFB929' }
          ] : [
            { offset: 0, color: '#D946EF' },
            { offset: 1, color: '#FFC9E3' }
          ];
          drawGradientArc(innerRadius, innerLineWidth, enrolledAngle, colors, false);
        }

        drawText(props.title || "完成度", `${Math.round(props.totalProgress)}%`);

      } else if (props.mode === "single") {
        // --- 单环模式 ---
        // 匹配原始 VChart 尺寸比例: radius 1, innerRadius 0.7 => 占用 15% 的线宽
        const radius = props.radiusRatio ? size/2 * props.radiusRatio : 119 * scale;
        const lineWidth = props.lineWidthRatio ? size/2 * props.lineWidthRatio : 42 * scale;
        const targetProgress = parseProgressValue(props.value);
        const currentProgress = targetProgress * animProgress;
        const progressAngle = currentProgress * 2 * Math.PI;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = trackColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        if (progressAngle > 0) {
          const colors = props.customColors || getPresetGradientColors(props.colorScheme || "purple-pink", theme === "dark");
          drawGradientArc(radius, lineWidth, progressAngle, colors, false);
        }
        drawText(props.label, props.value);

      } else if (props.mode === "dual") {
        // --- 拼接双环模式 ---
        // 匹配原始 VChart 尺寸比例: radius 0.92, innerRadius 0.65 => 占用 13.5% 的线宽
        const radius = props.radiusRatio ? size/2 * props.radiusRatio : 110 * scale;
        const lineWidth = props.lineWidthRatio ? size/2 * props.lineWidthRatio : 38 * scale;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = trackColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        const totalValue = props.segments.reduce((acc, seg) => acc + seg.value, 0) || 1;
        const visibleSegments = props.segments.filter(s => s.value > 0);
        const actualGap = visibleSegments.length > 1 ? 0.08 : 0;
        let currentAngle = startAngle;

        props.segments.forEach(seg => {
          const ratio = seg.value / totalValue;
          const segAngle = ratio * 2 * Math.PI * animProgress;

          if (segAngle > 0) {
            const colors = seg.customColors || getPresetGradientColors(seg.colorScheme || "purple-pink", theme === "dark");

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle + actualGap/2, currentAngle + segAngle - actualGap/2);

            // 为每段创建正确的线性渐变 (从左上到右下，与 VChart 行为一致)
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            colors.forEach(c => gradient.addColorStop(c.offset, c.color));

            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";
            ctx.stroke();
            currentAngle += segAngle;
          }
        });

        drawText(props.centerLabel, props.centerValue);
      }
    };

    drawChart();

    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => requestAnimationFrame(drawChart), 50);
    };

    window.addEventListener("resize", handleResize);

    // Use ResizeObserver for parent container changes
    let observer: ResizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(handleResize);
      if (containerRef.current) observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
    };
  }, [props, animProgress, theme]);

  // --- 交互与 Tooltip ---
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (props.mode === "single") return; // 单环不显示 tooltip，直接显示在中间
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width / (window.devicePixelRatio || 2);
    const scaleY = canvas.height / rect.height / (window.devicePixelRatio || 2);
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const size = Math.min(container.offsetWidth, container.offsetHeight);
    const scale = size / 280;
    const centerX = size / 2;
    const centerY = size / 2;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    let hit = false;

    if (props.mode === "concentric") {
      const outerRadius = props.radiusRatio ? size/2 * props.radiusRatio : 110 * scale;
      const innerRadius = props.radiusRatio ? size/2 * props.radiusRatio * 0.8 : 88 * scale;
      const outerLineWidth = props.lineWidthRatio ? size/2 * props.lineWidthRatio : 40 * scale;
      const innerLineWidth = props.lineWidthRatio ? size/2 * props.lineWidthRatio * 0.75 : 30 * scale;

      const signedAngle = (props.signedProgress / 100) * 2 * Math.PI;
      const enrolledAngle = (props.enrolledProgress / 100) * 2 * Math.PI;

      if (Math.abs(distance - outerRadius) <= outerLineWidth / 2 && angle <= signedAngle) {
        setTooltip({ visible: true, x: e.clientX, y: e.clientY, label: props.outerLabel || "年度签约人数", value: props.signedProgress });
        hit = true;
      } else if (props.enrolledProgress > 1 && Math.abs(distance - innerRadius) <= innerLineWidth / 2 && angle <= enrolledAngle) {
        setTooltip({ visible: true, x: e.clientX, y: e.clientY, label: props.innerLabel || "年度入学人数", value: props.enrolledProgress });
        hit = true;
      }
    } else if (props.mode === "dual") {
      const radius = props.radiusRatio ? size/2 * props.radiusRatio : 110 * scale;
      const lineWidth = props.lineWidthRatio ? size/2 * props.lineWidthRatio : 38 * scale;

      if (Math.abs(distance - radius) <= lineWidth / 2) {
        const totalValue = props.segments.reduce((acc, seg) => acc + seg.value, 0) || 1;
        let currentAngle = 0;
        for (const seg of props.segments) {
          const segAngle = (seg.value / totalValue) * 2 * Math.PI;
          if (angle >= currentAngle && angle <= currentAngle + segAngle) {
            setTooltip({ visible: true, x: e.clientX, y: e.clientY, label: seg.label, value: seg.value });
            hit = true;
            break;
          }
          currentAngle += segAngle;
        }
      }
    }

    if (hit) {
      canvas.style.cursor = "pointer";
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
      canvas.style.cursor = "default";
    }
  }, [props]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  }, []);

  return (
    <div className={`universal-circular-chart ${props.className || ''}`} style={props.style} ref={containerRef}>
      <div className="chart-wrapper">
        <canvas
          ref={canvasRef}
          className="chart-canvas"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {tooltip.visible && createPortal(
        <div
          style={{
            position: "fixed", left: `${tooltip.x}px`, top: `${tooltip.y - 60}px`,
            transform: "translateX(-50%)", background: theme === 'dark' ? '#1e293b' : '#fff',
            color: theme === 'dark' ? '#f8fafc' : '#333', padding: "8px 12px",
            borderRadius: "6px", fontSize: "12px", pointerEvents: "none", zIndex: 10000,
            boxShadow: theme === 'dark' ? "0 4px 12px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.15)",
            border: theme === 'dark' ? "1px solid rgba(255,255,255,0.1)" : "none"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: tooltip.label.includes('签约') ? "#1890ff" : "#ff6b9d" }} />
            <span>{tooltip.label}</span>
            <span style={{ fontWeight: "bold", marginLeft: "auto" }}>
              {props.mode === 'concentric' ? `${tooltip.value}%` : tooltip.value}
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UniversalCircularChart;
