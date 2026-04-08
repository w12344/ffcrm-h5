import React, { useState, useRef, useEffect } from 'react';
import CluePool from '../../../CluePool';
import TransactionEnrollmentPool from '../../../TransactionEnrollmentPool';
import CustomerUpgradePool from '../../../CustomerUpgradePool';
import thumbnailImage from '../../../../../../assets/images/image.png';
import './index.less';

export interface SubPool {
  label: string;
  value: string;
  slogan?: string;
}

export interface PoolInfo {
  id: string;
  title: string;
  slogan: string;
  description: string;
  statLabel?: string;
  statValue?: string;
  subPools?: [SubPool, SubPool]; // 上下分层支持
  rateLabel: string;
  rateValue: string;
  rateDescription: string;
  // 支持第二个比例 (如成交率+入学率并存)
  secondaryRateLabel?: string;
  secondaryRateValue?: string;
  secondaryRateDescription?: string;
  isWarning: boolean;
  isExcellent?: boolean;
  warningMsg?: string;
  excellentMsg?: string;
  tag: string;
  icon: React.ReactNode;
  thumbnail: React.ReactNode;
}

// SVG Icons - Enhanced with more detail
const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
    <path d="M22 12 A10 10 0 1 1 12 2" strokeDasharray="4 4" />
  </svg>
);


// 仿真微缩 UI 组件已移除，现在直接使用真实的池子组件渲染

const renderPoolContent = (
  id: string,
  themeMode: "dark" | "light",
  isThumbnail: boolean,
  role?: "advisor" | "market",
  onTransferCustomer?: (customer: any, onSuccess?: () => void) => void,
  onBubbleClick?: (id: string, name?: string, subPoolType?: 'deal' | 'enrolled') => void,
  onOpenCustomerProfile?: (customerProfileId: string) => void,
  onOpenAIAnalysis?: (customerProfileId: string) => void,
  onOpenLearningPanorama?: (customerProfileId: string) => void,
  headerExtra?: React.ReactNode
) => {
  const commonProps = { isThumbnail, themeMode, role, headerExtra };
  switch (id) {
    case 'clue': return (
      <CluePool
        {...commonProps}
        onClueClick={(clue: any) => onBubbleClick?.(clue.id, clue.name)}
        onTransferClue={onTransferCustomer}
      />
    );
    case 'enrolled': return <TransactionEnrollmentPool
      {...commonProps}
      onBubbleClick={(id, subPoolType) => onBubbleClick?.(id, undefined, subPoolType)}
      onOpenCustomerProfile={onOpenCustomerProfile}
      onOpenAIAnalysis={onOpenAIAnalysis}
      onOpenLearningPanorama={onOpenLearningPanorama}
    />;
    case 'customer':
    default: return (
      <CustomerUpgradePool
        {...commonProps}
        currentPoolId="follow"
        onTransferCustomer={onTransferCustomer}
        onOpenCustomerProfile={onOpenCustomerProfile || onBubbleClick}
        onBubbleClick={onBubbleClick}
        onOpenAIAnalysis={(id, _name) => onOpenAIAnalysis?.(id)}
      />
    );
  }
};

export const POOLS_DATA: PoolInfo[] = [
  {
    id: 'clue',
    title: '线索池',
    slogan: '源头管控 唯快不破',
    description: '未加微信的号码，需快速响应',
    statLabel: '线索总数',
    statValue: '1,245',
    rateLabel: '建联率',
    rateValue: '96%',
    rateDescription: '已建档 / 分配数',
    isWarning: false,
    isExcellent: true,
    excellentMsg: '转化战神：响应速度超快',
    tag: '快速响应',
    icon: <ActivityIcon />,
    thumbnail: null // Will be rendered by helper
  },
  {
    id: 'customer',
    title: '客户&升级池',
    slogan: '分层触达 靶向经营',
    description: '全量客户转化漏斗',
    subPools: [
      { label: '客户池', value: '342', slogan: '已建档的新客户' },
      { label: '升级池', value: '1,568', slogan: '高意向核心客户' }
    ],
    rateLabel: '激活率',
    rateValue: '18%',
    rateDescription: '升级数 / 客户总数',
    isWarning: true,
    warningMsg: '业务危机：客户正在流失',
    tag: '意向分层',
    icon: <UserIcon />,
    thumbnail: null
  },
  {
    id: 'enrolled',
    title: '成交&入学池',
    slogan: '交付全链路监控',
    description: '从支付到入学的必胜转段',
    subPools: [
      { label: '成交池', value: '156', slogan: '已交费待跟进' },
      { label: '入学池', value: '38', slogan: '在读活跃学员' }
    ],
    rateLabel: '成交率',
    rateValue: '45%',
    rateDescription: '成交人数 / 升级人数',
    secondaryRateLabel: '入学率',
    secondaryRateValue: '92%',
    secondaryRateDescription: '实际入学 / 已交费',
    isWarning: false,
    tag: '交付监控',
    icon: <CheckIcon />,
    thumbnail: null
  }
];

// 获取核心池子数据
const getPools = (_role?: "advisor" | "market") => {
  return POOLS_DATA.map(pool => ({ ...pool, uid: pool.id }));
};

interface PoolCarouselProps {
  onSelectPool?: (poolId: string) => void;
  themeMode?: "dark" | "light";
  initialPoolId?: string | null;
  role?: "advisor" | "market";
  onTransferCustomer?: (customer: any, onSuccess?: () => void) => void;
  onBubbleClick?: (id: string, name?: string, subPoolType?: 'deal' | 'enrolled') => void;
  onOpenCustomerProfile?: (customerProfileId: string) => void;
  onOpenAIAnalysis?: (customerProfileId: string) => void;
  onOpenLearningPanorama?: (customerProfileId: string) => void;
  headerExtra?: React.ReactNode;
  fullWidth?: boolean;
}

const PoolCarousel: React.FC<PoolCarouselProps> = ({
  onSelectPool,
  themeMode = "light",
  initialPoolId,
  role = "advisor",
  onTransferCustomer,
  onBubbleClick,
  onOpenCustomerProfile,
  onOpenAIAnalysis,
  onOpenLearningPanorama,
  headerExtra,
  fullWidth = false,
}) => {
  const pools = React.useMemo(() => getPools(role), [role]);
  const poolsCount = pools.length;

  // 根据 initialPoolId 计算初始 activeIndex
  const computeInitialIndex = () => {
    if (!initialPoolId) return Math.min(1, poolsCount - 1); // 默认选中中间或最后一项
    const index = pools.findIndex(p => p.id === initialPoolId);
    return index !== -1 ? index : Math.min(1, poolsCount - 1);
  };

  const [activeIndex, setActiveIndex] = useState(computeInitialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialPoolId) {
      const index = pools.findIndex(p => p.id === initialPoolId);
      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  }, [initialPoolId, pools]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);

  // 修改为无限循环逻辑
  const goPrev = () => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : poolsCount - 1));
  };
  const goNext = () => {
    setActiveIndex(prev => (prev < poolsCount - 1 ? prev + 1 : 0));
  };

  const handleDragStart = (clientX: number) => {
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || startX === null) return;
    const diff = clientX - startX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goPrev();
      } else if (diff < 0) {
        goNext();
      }
      setStartX(clientX);
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setStartX(null);
  };

  return (
    <div className={`apple-carousel-wrapper ${themeMode} ${fullWidth ? 'full-width-mode' : ''}`} ref={containerRef}>
      {/* 轮播主区域 */}
      <div className="pc-body">
        {/* 左侧箭头按钮 - 无限循环始终显示 */}
        <button
          className="nav-btn prev-btn"
          onClick={goPrev}
          aria-label="上一个"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span className="nav-hint">PREV</span>
        </button>

        <div className="carousel-container">
          <div
            className="carousel-track"
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
            onTouchCancel={handleDragEnd}
          >
            {pools.map((pool, index) => {
              const diff = index - activeIndex;

              let className = 'pool-card';
              if (diff === 0) className += ' active';
              else if (diff === -1) className += ' prev';
              else if (diff === 1) className += ' next';
              else className += ' hidden-away';

              return (
                <div
                  key={pool.uid}
                  className={`${className} pool-${pool.id} ${pool.isWarning ? 'warning-alert' : ''} ${pool.isExcellent ? 'excellent-card' : ''}`}
                  onClick={() => {
                    if (diff === 0) onSelectPool?.(pool.id);
                    else if (Math.abs(diff) === 1) setActiveIndex(index);
                  }}
                  style={{ zIndex: 100 - Math.abs(diff) }}
                >
                  {diff === 0 && (
                    <div className="card-stack-layers">
                      <div className="stack-layer layer-1"></div>
                      <div className="stack-layer layer-2"></div>
                      <div className="stack-layer layer-3"></div>
                    </div>
                  )}

                  <div className="card-visual-wrapper">
                    {/* 核心内容层：真实的图表 */}
                    <div className={`card-content-layer ${diff === 0 ? 'full-mode' : 'thumbnail-mode'}`}>
                      {diff === 0 ? (
                        renderPoolContent(pool.id, themeMode, false, role, onTransferCustomer, onBubbleClick, onOpenCustomerProfile, onOpenAIAnalysis, onOpenLearningPanorama, headerExtra)
                      ) : (
                        <div className="thumbnail-image-wrapper">
                          <img src={thumbnailImage} alt="thumbnail" className="thumbnail-image" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

        {/* 右侧箭头按钮 - 无限循环始终显示 */}
        <button
          className="nav-btn next-btn"
          onClick={goNext}
          aria-label="下一个"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span className="nav-hint">NEXT</span>
        </button>
      </div>

      {/* 底部小圆点 */}
      <div className="carousel-indicators">
        {pools.map((pool, idx) => {
          return (
            <div
              key={pool.id}
              className={`indicator ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            />
          )
        })}
      </div>
    </div>
  );
};

export default PoolCarousel;
