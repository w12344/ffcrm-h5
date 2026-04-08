import React, { useState, useRef, useCallback, memo, useMemo, useEffect } from "react";
import { Tooltip } from "antd";
import { useTheme } from "@/hooks/useTheme";
import { CustomerBubble as CustomerBubbleType } from "@/types/dashboard";
import ContextMenu, { ContextMenuItem } from "@/components/ContextMenu";
import "./CustomerBubble.less";

interface CustomerBubbleProps {
  bubble: CustomerBubbleType;
  onClick?: (bubble: CustomerBubbleType) => void;
  onContextMenu?: (
    bubble: CustomerBubbleType,
    action: "profile" | "analysis" | "transfer"
  ) => void;
  isVisible?: boolean; // 新增：是否在视口内可见
  onElementMount?: (bubbleId: string, element: HTMLElement | null) => void; // 新增：元素挂载回调
  role?: "advisor" | "market";
}

const CustomerBubble: React.FC<CustomerBubbleProps> = memo(
  ({ bubble, onClick, onContextMenu, isVisible = true, onElementMount, role = "advisor" }) => {
    const { isDark } = useTheme();
    const [contextMenu, setContextMenu] = useState<{
      visible: boolean;
      x: number;
      y: number;
    }>({ visible: false, x: 0, y: 0 });
    const bubbleRef = useRef<HTMLDivElement>(null);

    // 注册元素到 IntersectionObserver
    useEffect(() => {
      if (onElementMount && bubbleRef.current) {
        onElementMount(bubble.id, bubbleRef.current);
        return () => {
          onElementMount(bubble.id, null);
        };
      }
    }, [bubble.id, onElementMount]);

    // 为每个气泡生成唯一的随机动画参数（只在组件挂载时生成一次）
    const animationParams = useRef(
      (() => {
        // 根据气泡大小计算飘动强度系数 (大气泡飘动更明显)
        const sizeRatio = Math.min(bubble.size / 50, 2); // 50px为基准，最大2倍强度
        const baseFloat = 6 + sizeRatio * 4; // 基础飘动距离 6-14px

        return {
          // 随机飘动距离 - 根据气泡大小调整
          floatX: Math.random() * baseFloat + baseFloat * 0.5,
          floatY: Math.random() * baseFloat + baseFloat * 0.5,
          // 随机飘动方向
          directionX: Math.random() > 0.5 ? 1 : -1,
          directionY: Math.random() > 0.5 ? 1 : -1,
          // 随机动画时长 (4-7秒) - 大气泡稍慢，小气泡稍快
          duration: Math.random() * 3 + 4 + sizeRatio * 0.5,
          // 随机延迟 (0-3秒)
          delay: Math.random() * 3,
          // 随机旋转角度 - 根据气泡大小调整旋转幅度
          rotate: (Math.random() - 0.5) * (8 + sizeRatio * 4),
        };
      })()
    ).current;

    const handleClick = useCallback(() => {
      onClick?.(bubble);
    }, [onClick, bubble]);

    /**
     * 处理右键点击
     */
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault(); // 阻止默认右键菜单
      e.stopPropagation(); // 阻止事件冒泡

      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
      });
    }, []);

    /**
     * 关闭右键菜单
     */
    const handleCloseContextMenu = useCallback(() => {
      setContextMenu({ visible: false, x: 0, y: 0 });
    }, []);

    /**
     * 右键菜单项配置
     */
    const contextMenuItems: ContextMenuItem[] = [
      {
        key: "analysis",
        label: "AI分析",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* AI 芯片外框 */}
            <rect
              x="2"
              y="2"
              width="12"
              height="12"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
            {/* 内部电路图案 */}
            <path
              d="M5 8H7M9 8H11M8 5V7M8 9V11"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* 四个角的连接点 */}
            <circle cx="5" cy="5" r="0.8" fill="currentColor" />
            <circle cx="11" cy="5" r="0.8" fill="currentColor" />
            <circle cx="5" cy="11" r="0.8" fill="currentColor" />
            <circle cx="11" cy="11" r="0.8" fill="currentColor" />
            {/* 背景渐变 */}
            <rect
              x="2"
              y="2"
              width="12"
              height="12"
              rx="2"
              fill="currentColor"
              opacity="0.1"
            />
          </svg>
        ),
        onClick: () => {
          onContextMenu?.(bubble, "analysis");
        },
      },
      {
        key: "profile",
        label: "客户档案",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 8C9.933 8 11.5 6.433 11.5 4.5C11.5 2.567 9.933 1 8 1C6.067 1 4.5 2.567 4.5 4.5C4.5 6.433 6.067 8 8 8Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M14 15C14 12.791 11.314 11 8 11C4.686 11 2 12.791 2 15"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle
              cx="8"
              cy="4.5"
              r="2.5"
              fill="currentColor"
              opacity="0.15"
            />
          </svg>
        ),
        onClick: () => {
          onContextMenu?.(bubble, "profile");
        },
      },
    ];

    if (role === 'market') {
      contextMenuItems.push({
        key: "transfer",
        label: "线索转移",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 8L12 8M8 4L12 8L8 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        onClick: () => {
          onContextMenu?.(bubble, "transfer");
        }
      });
    }

    // 生成Tooltip内容
    const getTooltipContent = useCallback(() => {
      const isReassigned = bubble.customer.distributionStatus === 'reassigned';
      return (
        <div className={`bubble-tooltip-content ${isDark ? 'dark-theme' : 'light-theme'}`}>
          <div className="tooltip-name">{bubble.customer.name}</div>
          <div className="tooltip-info">
            <div className="info-item">▸ 等级: {bubble.customer.level}</div>
            <div className="info-item">▸ 质量分: {bubble.customer.qualityScore}</div>
            <div className="info-item">▸ 成熟度: {bubble.customer.maturityScore}</div>
            {bubble.customer.hasOpportunity &&
              bubble.customer.opportunityText && (
                <div className="info-item">▸ 机会: {bubble.customer.opportunityText}</div>
              )}
            {bubble.customer.hasAlert && bubble.customer.alertText && (
              <div className="info-item">▸ 风险: {bubble.customer.alertText}</div>
            )}
            {isReassigned && (
              <div className="info-item">
                ▸ {bubble.customer.reassignedAt || '未知时间'} 已分配给 {bubble.customer.reassignedTo || '未知顾问'}
              </div>
            )}
          </div>
        </div>
      );
    }, [bubble.customer, isDark]);

    const bubbleStyle: React.CSSProperties = {
      left: `${bubble.x}%`,
      top: `${bubble.y}%`,
      width: `${bubble.size}px`,
      height: `${bubble.size}px`,
      background: bubble.gradient,
      boxShadow: bubble.boxShadow,
      // X级客户增加透明度
      opacity: bubble.customer.level === "X" ? 0.8 : undefined,
      // GPU 加速：只对可见的球开启
      willChange: isVisible ? 'transform, opacity' : 'auto',
      // 传递随机动画参数到CSS变量
      ["--float-x" as any]: `${
        animationParams.floatX * animationParams.directionX
      }px`,
      ["--float-y" as any]: `${
        animationParams.floatY * animationParams.directionY
      }px`,
      ["--rotate" as any]: `${animationParams.rotate}deg`,
      ["--duration" as any]: `${animationParams.duration}s`,
      ["--delay" as any]: `${animationParams.delay}s`,
    };

    // 根据气泡大小动态计算感叹号尺寸
    const exclamationSize = bubble.size * 0.6; // 感叹号容器大小为气泡的60%
    const exclamationStyle: React.CSSProperties = {
      width: `${exclamationSize}px`,
      height: `${exclamationSize}px`,
    };

    // 根据主题动态设置tooltip样式
    const tooltipStyle = useMemo(() => ({
      overlayStyle: {
        maxWidth: "300px",
      },
      overlayInnerStyle: isDark ? {
        background: "linear-gradient(135deg, rgba(40, 44, 52, 0.95), rgba(40, 44, 52, 0.95))",
        color: "#ffffff",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
      } : {
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 245, 250, 0.98))",
        color: "rgba(0, 0, 0, 0.88)",
        padding: "12px 16px",
        borderRadius: "8px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1) inset",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
      }
    }), [isDark]);

    return (
      <>
        <Tooltip
          title={getTooltipContent()}
          placement="top"
          mouseEnterDelay={0.15}
          arrow={true}
          open={contextMenu.visible ? false : undefined}
          {...tooltipStyle}
        >
          <div
            ref={bubbleRef}
            data-bubble-id={bubble.id}
            className={`customer-bubble ${bubble.area} ${
              bubble.shouldBlink ? "blink" : ""
            } ${bubble.hasAlert ? "alert" : ""} ${
              isVisible ? "" : "out-of-viewport"
            } ${bubble.customer.distributionStatus === 'reassigned' ? "reassigned" : ""}`}
            style={bubbleStyle}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
          >
            {bubble.customer.distributionStatus === 'reassigned' && (
              <div className="reassigned-corner-icon">
                !
              </div>
            )}
            {/* exclamation mark - shown for alerts or opportunities to match reference image density */}
            {(bubble.hasAlert || bubble.customer.hasOpportunity) && (
              <div className="exclamation-mark" style={exclamationStyle}>
                <div className="exclamation-line"></div>
                <div className="exclamation-dot"></div>
              </div>
            )}
          </div>
        </Tooltip>

        {/* 右键菜单 */}
        <ContextMenu
          visible={contextMenu.visible}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          items={contextMenuItems}
          onClose={handleCloseContextMenu}
        />
      </>
    );
  },
  // 自定义比较函数，只在关键属性变化时重新渲染
  (prevProps, nextProps) => {
    return (
      prevProps.bubble.id === nextProps.bubble.id &&
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.bubble.x === nextProps.bubble.x &&
      prevProps.bubble.y === nextProps.bubble.y &&
      prevProps.onElementMount === nextProps.onElementMount
    );
  }
);

export default CustomerBubble;
