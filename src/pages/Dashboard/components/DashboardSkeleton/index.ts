/**
 * 看板页面骨架屏组件导出
 */

// 主骨架屏组件作为默认导出
export { default } from './index.tsx';

// 具名导出各个子组件
export { default as DashboardSkeleton } from './index.tsx';
export { default as CustomerUpgradePoolSkeleton } from './CustomerUpgradePoolSkeleton';
export { default as ChatAssistantSkeleton } from './ChatAssistantSkeleton';

// 重新导出现有的 KPI 卡片骨架屏
export { default as KPICardSkeleton } from '../KPICardSkeleton';
