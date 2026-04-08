/**
 * 性能配置工具
 * 根据设备性能自动调整动画和渲染设置
 */

interface PerformanceConfig {
  // 动画设置
  enableComplexAnimations: boolean;
  enableParticleEffects: boolean;
  maxBubbleCount: number;
  animationFrameRate: number;
  
  // 渲染设置
  enableHardwareAcceleration: boolean;
  useLowQualityMode: boolean;
  
  // 交互设置
  debounceDelay: number;
  throttleDelay: number;
}

class PerformanceManager {
  private config: PerformanceConfig;
  private deviceScore: number = 0;

  constructor() {
    this.deviceScore = this.calculateDeviceScore();
    this.config = this.generateConfig();
  }

  /**
   * 计算设备性能评分 (0-100)
   */
  private calculateDeviceScore(): number {
    let score = 50; // 基础分数

    // 检查硬件并发数
    if (navigator.hardwareConcurrency) {
      score += Math.min(navigator.hardwareConcurrency * 8, 32);
    }

    // 检查内存大小
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.jsHeapSizeLimit) {
        const memoryGB = memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
        score += Math.min(memoryGB * 10, 20);
      }
    }

    // 检查用户代理字符串中的设备信息
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile') || userAgent.includes('android')) {
      score -= 20; // 移动设备减分
    }

    // 检查屏幕分辨率
    const pixelRatio = window.devicePixelRatio || 1;
    const screenArea = window.screen.width * window.screen.height * pixelRatio;
    if (screenArea > 2073600) { // 1920x1080
      score += 10;
    } else if (screenArea < 921600) { // 1280x720
      score -= 10;
    }

    // 检查是否支持硬件加速
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 根据设备评分生成配置
   */
  private generateConfig(): PerformanceConfig {
    if (this.deviceScore >= 80) {
      // 高性能设备
      return {
        enableComplexAnimations: true,
        enableParticleEffects: true,
        maxBubbleCount: 2000,
        animationFrameRate: 60,
        enableHardwareAcceleration: true,
        useLowQualityMode: false,
        debounceDelay: 16,
        throttleDelay: 16,
      };
    } else if (this.deviceScore >= 60) {
      // 中等性能设备
      return {
        enableComplexAnimations: true,
        enableParticleEffects: false,
        maxBubbleCount: 1000,
        animationFrameRate: 30,
        enableHardwareAcceleration: true,
        useLowQualityMode: false,
        debounceDelay: 32,
        throttleDelay: 32,
      };
    } else if (this.deviceScore >= 40) {
      // 低性能设备
      return {
        enableComplexAnimations: false,
        enableParticleEffects: false,
        maxBubbleCount: 500,
        animationFrameRate: 20,
        enableHardwareAcceleration: true,
        useLowQualityMode: true,
        debounceDelay: 50,
        throttleDelay: 50,
      };
    } else {
      // 极低性能设备
      return {
        enableComplexAnimations: false,
        enableParticleEffects: false,
        maxBubbleCount: 200,
        animationFrameRate: 15,
        enableHardwareAcceleration: false,
        useLowQualityMode: true,
        debounceDelay: 100,
        throttleDelay: 100,
      };
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * 获取设备评分
   */
  getDeviceScore(): number {
    return this.deviceScore;
  }

  /**
   * 应用性能优化CSS类
   */
  applyCSSOptimizations(): void {
    const body = document.body;
    
    if (this.config.useLowQualityMode) {
      body.classList.add('low-performance-mode');
    }
    
    if (!this.config.enableComplexAnimations) {
      body.classList.add('reduced-animations');
    }
    
    if (!this.config.enableHardwareAcceleration) {
      body.classList.add('no-hardware-acceleration');
    }
  }

  /**
   * 移除性能优化CSS类
   */
  removeCSSOptimizations(): void {
    const body = document.body;
    body.classList.remove('low-performance-mode', 'reduced-animations', 'no-hardware-acceleration');
  }

  /**
   * 监控性能并动态调整
   */
  startPerformanceMonitoring(): () => void {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    let animationId: number;
    let isMonitoring = true;

    const measureFPS = () => {
      if (!isMonitoring) return;
      
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // 如果FPS持续低于阈值，降级配置
        if (fps < 20 && this.deviceScore > 40) {
          console.warn(`🐌 检测到低FPS (${fps})，降级性能配置`);
          this.deviceScore = Math.max(20, this.deviceScore - 10);
          this.config = this.generateConfig();
          this.applyCSSOptimizations();
        }
      }
      
      if (isMonitoring) {
        animationId = requestAnimationFrame(measureFPS);
      }
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    // 返回清理函数
    return () => {
      isMonitoring = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }
}

// 创建全局实例
export const performanceManager = new PerformanceManager();

// 自动应用优化
performanceManager.applyCSSOptimizations();

// 开始性能监控
if (process.env.NODE_ENV !== 'production') {
  console.log(`🔧 设备性能评分: ${performanceManager.getDeviceScore()}/100`);
  console.log('🔧 性能配置:', performanceManager.getConfig());
  
  // 启动性能监控，并在页面卸载时清理
  const stopMonitoring = performanceManager.startPerformanceMonitoring();
  
  // 页面卸载时清理监控
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', stopMonitoring);
  }
}

export default performanceManager;
