import React, { memo, useRef, useState, useCallback } from 'react';
import { Tooltip } from 'antd';
import { ClueItem, ClueChannelType } from '../mock';
import { useTheme } from '@/hooks/useTheme';
import ContextMenu, { ContextMenuItem } from "@/components/ContextMenu";

// --- SVG Icons ---
const SocialIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM17 11H15V13H13V11H11V9H13V7H15V9H17V11Z" fill="currentColor" fillOpacity="0.6" />
    <path d="M7 9H9V11H7V9Z" fill="currentColor" fillOpacity="0.6" />
  </svg>
);

const ReferralIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" fillOpacity="0.6"/>
  </svg>
);

const GroundIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" fillOpacity="0.6"/>
  </svg>
);

const ColdCallIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.39 15.2C15.66 14.93 16.05 14.85 16.39 14.96C17.49 15.32 18.66 15.51 19.88 15.51C20.44 15.51 20.9 15.97 20.9 16.53V19.88C20.9 20.44 20.44 20.9 19.88 20.9C10.56 20.9 2.9 13.24 2.9 3.92C2.9 3.36 3.36 2.9 3.92 2.9H7.27C7.83 2.9 8.29 3.36 8.29 3.92C8.29 5.14 8.48 6.31 8.84 7.41C8.95 7.75 8.87 8.14 8.6 8.41L6.62 10.79Z" fill="currentColor" fillOpacity="0.6"/>
  </svg>
);

const getChannelIcon = (type: ClueChannelType) => {
  switch (type) {
    case 'social': return <SocialIcon />;
    case 'referral': return <ReferralIcon />;
    case 'ground': return <GroundIcon />;
    case 'cold': return <ColdCallIcon />;
    default: return null;
  }
};

interface ClueBubbleProps {
  clue: ClueItem;
  x: number;
  y: number;
  r: number; // radius
  themeMode?: 'light' | 'dark';
  onClick?: (clue: ClueItem) => void;
  onContextMenu?: (clue: ClueItem, action: "profile" | "analysis" | "transfer") => void;
  role?: "advisor" | "market";
}

export const ClueBubble: React.FC<ClueBubbleProps> = memo(({ clue, x, y, r, themeMode = 'light', onClick, onContextMenu, role = "advisor" }) => {
  const { isDark } = useTheme();
  const theme = themeMode === 'dark' || isDark ? 'dark' : 'light';

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  }, []);

  const contextMenuItems: ContextMenuItem[] = [
    {
      key: "analysis",
      label: "AI分析",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M5 8H7M9 8H11M8 5V7M8 9V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="5" cy="5" r="0.8" fill="currentColor" />
          <circle cx="11" cy="5" r="0.8" fill="currentColor" />
          <circle cx="5" cy="11" r="0.8" fill="currentColor" />
          <circle cx="11" cy="11" r="0.8" fill="currentColor" />
          <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.1" />
        </svg>
      ),
      onClick: () => onContextMenu?.(clue, "analysis"),
    },
  ];

  if (role === 'market') {
    contextMenuItems.push(
      {
        key: "transfer",
        label: "重新分配",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V8M8 8L5 5M8 8L11 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 10V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        onClick: () => onContextMenu?.(clue, "transfer"),
      }
    );
  } else {
    contextMenuItems.push({
      key: "profile",
      label: "客户档案",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 8C9.933 8 11.5 6.433 11.5 4.5C11.5 2.567 9.933 1 8 1C6.067 1 4.5 2.567 4.5 4.5C4.5 6.433 6.067 8 8 8Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M14 15C14 12.791 11.314 11 8 11C4.686 11 2 12.791 2 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="8" cy="4.5" r="2.5" fill="currentColor" opacity="0.15" />
        </svg>
      ),
      onClick: () => onContextMenu?.(clue, "profile"),
    });
  }

  // 为每个气泡生成唯一的随机动画参数（只在组件挂载时生成一次）
  const animationParams = useRef(
    (() => {
      // 根据气泡大小计算飘动强度系数 (大气泡飘动更明显)
      const sizeStatus = clue.valueLevel === 'high' ? 1.5 : (clue.valueLevel === 'trash' ? 0.5 : 1);
      const baseFloat = 6 + sizeStatus * 4; // 基础飘动距离 6-14px

      return {
        // 随机飘动距离
        floatX: Math.random() * baseFloat + baseFloat * 0.5,
        floatY: Math.random() * baseFloat + baseFloat * 0.5,
        // 随机飘动方向
        directionX: Math.random() > 0.5 ? 1 : -1,
        directionY: Math.random() > 0.5 ? 1 : -1,
        // 随机动画时长 (4-7秒)
        duration: Math.random() * 3 + 4 + sizeStatus * 0.5,
        // 随机延迟 (0-3秒)
        delay: Math.random() * 3,
        // 随机旋转角度
        rotate: (Math.random() - 0.5) * (8 + sizeStatus * 4),
      };
    })()
  ).current;

  // 获取渐变色
  const getGradient = (hours: number) => {
    if (theme === 'dark') {
      if (hours <= 2) return "linear-gradient( 180deg, #FD4895 0%, #C438EF 100%)";
      if (hours <= 24) return "linear-gradient( 230deg, #FFB929 0%, #FF7FB7 100%)";
      return "linear-gradient( 212deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.5) 23%, rgba(255,255,255,0.3) 48%, rgba(0,0,0,0.6) 100%)";
    } else {
      if (hours <= 2) return "linear-gradient(207deg, #FD4895 -12.28%, #C438EF 83.42%)";
      if (hours <= 24) return "linear-gradient(180deg, #FFB929 0%, #FF7FB7 100%)";
      return "linear-gradient(213deg, rgba(151, 151, 151, 0.06) 7.33%, rgba(151, 151, 151, 0.19) 48.5%, rgba(151, 151, 151, 0.50) 92.96%)";
    }
  };

  const gradient = getGradient(clue.hoursElapsed);
  const size = r * 2;
  const isSleep = clue.hoursElapsed > 24;

  const bubbleStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x + r}px`, // 使用中心点
    top: `${y + r}px`,
    width: `${size}px`,
    height: `${size}px`,
    background: gradient,
    opacity: isSleep ? 0.8 : undefined,
    ["--float-x" as any]: `${animationParams.floatX * animationParams.directionX}px`,
    ["--float-y" as any]: `${animationParams.floatY * animationParams.directionY}px`,
    ["--rotate" as any]: `${animationParams.rotate}deg`,
    ["--duration" as any]: `${animationParams.duration}s`,
    ["--delay" as any]: `${animationParams.delay}s`,
    willChange: 'transform, opacity',
  };

  // 悬浮提示框内容
  const getTooltipContent = () => (
    <div className="bubble-tooltip-content">
      <div className="tooltip-name">{clue.name}</div>
      <div className="tooltip-info">
        <div>▸ 手机: {clue.phone}</div>
        <div>▸ 新鲜度: {clue.hoursElapsed.toFixed(1)}小时</div>
        <div>▸ 渠道: {clue.channel === 'social' ? '社交媒体' : clue.channel === 'referral' ? '转介绍' : clue.channel === 'ground' ? '地推' : '陌电'}</div>
        <div>▸ 归属: {clue.advisor || '未知'}</div>
        {clue.allocator && <div>▸ 指派: {clue.allocator}</div>}
        {clue.valueLevel === 'trash' && <div className="alert-row trash-row">⛔ 该号码已被标记为垃圾线索</div>}
        {clue.collisionWarning && <div className="alert-row collision-row">⚡ 存在撞单风险（已有同事跟进）</div>}
      </div>
    </div>
  );

  const tooltipStyle = {
    overlayStyle: { maxWidth: "300px" },
    overlayInnerStyle: theme === 'dark' ? {
      background: "linear-gradient(135deg, rgba(40, 44, 52, 0.95), rgba(40, 44, 52, 0.95))",
      color: "#ffffff", padding: "12px 16px", borderRadius: "8px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)",
    } : {
      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 245, 250, 0.98))",
      color: "rgba(0, 0, 0, 0.88)", padding: "12px 16px", borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1) inset", border: "1px solid rgba(0, 0, 0, 0.1)", backdropFilter: "blur(10px)",
    }
  };

  const shouldBlink = clue.valueLevel === 'high';

  // 针对灰色沉睡气泡调整图标颜色对比度
  const iconColor = isSleep
    ? (theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)')
    : 'rgba(255,255,255,0.95)';

  const iconContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: iconColor,
    pointerEvents: 'none',
    width: `${size * 0.45}px`, // 动态比例：图标占气泡大小的 45%
    height: `${size * 0.45}px`,
  };

  return (
    <>
      <Tooltip title={getTooltipContent()} placement="top" mouseEnterDelay={0.15} arrow={true} open={contextMenu.visible ? false : undefined} {...tooltipStyle}>
        <div
          className={`customer-bubble ${shouldBlink ? "blink" : ""}`}
          style={bubbleStyle}
          onClick={() => onClick?.(clue)}
          onContextMenu={handleContextMenu}
        >
          {/* 渠道图标 - 动态比例且根据背景调整对比度 */}
          <div className="clue-channel-center-icon" style={iconContainerStyle}>
            {getChannelIcon(clue.channel)}
          </div>

          {/* ⛔ 垃圾线索警示：右上角橙色角标 */}
          {clue.valueLevel === 'trash' && (
            <div className="clue-alert-badge clue-alert-orange" style={{ width: size * 0.3, height: size * 0.3, fontSize: size * 0.14 }}>
              ✕
            </div>
          )}

          {/* ⚡ 撞单风险警示：左下角橙色角标 */}
          {clue.collisionWarning && (
            <div className="clue-alert-badge clue-alert-orange" style={{ width: size * 0.28, height: size * 0.28, fontSize: size * 0.13, bottom: '2%', right: '2%' }}>
              !
            </div>
          )}
        </div>
      </Tooltip>
      <ContextMenu
        visible={contextMenu.visible}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        items={contextMenuItems}
        onClose={handleCloseContextMenu}
      />
    </>
  );
});
