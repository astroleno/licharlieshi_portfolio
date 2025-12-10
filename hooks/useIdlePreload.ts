/**
 * useIdlePreload.ts
 * 
 * 空闲时预加载 Hook
 * 
 * 功能说明：
 * - 在浏览器空闲时预加载懒加载组件的 JS chunk
 * - 使用 requestIdleCallback API，不影响用户交互
 * - 支持 fallback，兼容不支持 requestIdleCallback 的浏览器
 * - 预加载完成后，用户切换页面时可以秒开
 * 
 * 使用方式：
 * useIdlePreload({
 *   enabled: hasLoaderFinished,  // 首屏加载完成后启用
 *   delay: 2000                   // 延迟 2 秒再开始预加载
 * });
 * 
 * Vercel 部署注意：
 * - 预加载的是构建后的 JS chunk（带 hash）
 * - 这些文件会被 Vercel CDN 缓存
 * - vercel.json 中已配置 assets 目录的长期缓存
 */

import { useEffect, useRef } from 'react';

/**
 * 预加载配置接口
 */
interface IdlePreloadConfig {
  /** 是否启用预加载（通常在首屏加载完成后设为 true） */
  enabled: boolean;
  /** 启用后延迟多久开始预加载（毫秒），默认 2000ms */
  delay?: number;
}

/**
 * requestIdleCallback 的 polyfill
 * 
 * 对于不支持 requestIdleCallback 的浏览器（如 Safari），
 * 使用 setTimeout 作为 fallback
 */
const requestIdleCallbackPolyfill = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback: 使用 setTimeout，模拟空闲时间
  return window.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50 // 假设有 50ms 空闲时间
    });
  }, options?.timeout || 100) as unknown as number;
};

/**
 * cancelIdleCallback 的 polyfill
 */
const cancelIdleCallbackPolyfill = (handle: number): void => {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    window.clearTimeout(handle);
  }
};

/**
 * 预加载单个模块
 * 
 * @param importFn - 动态 import 函数
 * @param name - 模块名称（用于日志）
 */
const preloadModule = async (
  importFn: () => Promise<any>,
  name: string
): Promise<void> => {
  try {
    await importFn();
    console.log(`[IdlePreload] ✓ 预加载成功: ${name}`);
  } catch (error) {
    console.warn(`[IdlePreload] ✗ 预加载失败: ${name}`, error);
  }
};

/**
 * 需要预加载的页面组件列表
 * 
 * 这些组件使用 React.lazy 动态导入，
 * 预加载后会被浏览器缓存，切换页面时无需重新下载
 */
const PRELOAD_MODULES = [
  { name: 'Tech', importFn: () => import('../components/Tech') },
  { name: 'Music', importFn: () => import('../components/Music') },
  { name: 'Game', importFn: () => import('../components/Game') },
  { name: 'Contact', importFn: () => import('../components/Contact') }
];

/**
 * 空闲时预加载 Hook
 * 
 * @param config - 预加载配置
 */
export const useIdlePreload = (config: IdlePreloadConfig): void => {
  const { enabled, delay = 2000 } = config;
  
  // 防止重复预加载
  const hasPreloadedRef = useRef(false);
  // 存储 idle callback handle，用于清理
  const idleHandleRef = useRef<number | null>(null);
  // 存储 delay timeout handle
  const delayTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // 未启用或已预加载过，跳过
    if (!enabled || hasPreloadedRef.current) return;
    
    // 服务端渲染检查
    if (typeof window === 'undefined') return;

    console.log(`[IdlePreload] 首屏加载完成，${delay}ms 后开始预加载其他页面...`);

    // 延迟后开始预加载
    delayTimeoutRef.current = window.setTimeout(() => {
      // 标记为已预加载，防止重复执行
      hasPreloadedRef.current = true;

      let currentIndex = 0;

      /**
       * 在空闲时间预加载下一个模块
       * 
       * 策略：
       * - 每次空闲回调只加载一个模块
       * - 加载完成后再请求下一次空闲回调
       * - 这样可以充分利用空闲时间，不影响用户交互
       */
      const preloadNext = () => {
        if (currentIndex >= PRELOAD_MODULES.length) {
          console.log('[IdlePreload] ✓ 所有页面预加载完成');
          return;
        }

        idleHandleRef.current = requestIdleCallbackPolyfill(
          async (deadline) => {
            // 检查是否有足够的空闲时间（至少 10ms）
            // 或者已经超时（需要强制执行）
            if (deadline.timeRemaining() > 10 || deadline.didTimeout) {
              const module = PRELOAD_MODULES[currentIndex];
              await preloadModule(module.importFn, module.name);
              currentIndex++;
              
              // 继续预加载下一个
              preloadNext();
            } else {
              // 空闲时间不足，等待下次空闲
              preloadNext();
            }
          },
          { timeout: 3000 } // 最多等待 3 秒
        );
      };

      // 开始预加载
      console.log('[IdlePreload] 开始在空闲时预加载...');
      preloadNext();

    }, delay);

    // 清理函数
    return () => {
      if (delayTimeoutRef.current) {
        window.clearTimeout(delayTimeoutRef.current);
      }
      if (idleHandleRef.current) {
        cancelIdleCallbackPolyfill(idleHandleRef.current);
      }
    };
  }, [enabled, delay]);
};

export default useIdlePreload;

