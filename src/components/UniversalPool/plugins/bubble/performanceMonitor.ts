/**
 * 性能监控工具
 */

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  /**
   * 开始计时
   */
  static start(label: string): void {
    this.timers.set(label, performance.now());
  }

  /**
   * 结束计时并输出结果（仅在开发环境且性能有问题时输出）
   */
  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    // 只在开发环境且性能有问题时输出警告
    if (process.env.NODE_ENV === "development" && duration > 50) {
      // 超过50ms才警告
      console.warn(`🐌 性能警告: ${label} 耗时 ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * 监控函数执行时间
   */
  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  /**
   * 监控异步函数执行时间
   */
  static async measureAsync<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }

  /**
   * 检查内存使用情况（仅在开发环境输出）
   */
  static checkMemory(): void {
    if (process.env.NODE_ENV === "development" && "memory" in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      // 只在内存使用超过100MB时输出
      if (usedMB > 100) {
        console.log("📊 内存使用情况:", {
          used: `${usedMB.toFixed(2)}MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
        });
      }
    }
  }
}

/**
 * React组件性能监控Hook（仅在开发环境且性能有问题时输出）
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = performance.now();

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const renderTime = performance.now() - renderStart;
      if (renderTime > 50) {
        // 超过50ms才警告
        console.warn(`🐌 ${componentName} 渲染耗时 ${renderTime.toFixed(2)}ms`);
      }
    }
  });
};

// 导入React用于Hook
import * as React from "react";
