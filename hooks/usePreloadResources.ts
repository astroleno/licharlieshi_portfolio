/**
 * usePreloadResources.ts
 * 
 * 资源预加载工具 Hook
 * 
 * 功能说明：
 * - 提供图片预加载功能，支持批量并行加载
 * - 返回加载状态和进度，供 Loading 组件使用
 * - 支持超时降级，避免资源加载失败阻塞页面
 * - 使用 Image 对象预加载，利用浏览器缓存
 * 
 * 使用方式：
 * const { isLoaded, progress, error } = usePreloadResources({
 *   images: ['/back0.webp', '/back2.webp', '/front.webp'],
 *   timeout: 8000
 * });
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 预加载配置接口
 */
interface PreloadConfig {
  /** 需要预加载的图片 URL 列表 */
  images?: string[];
  /** 超时时间（毫秒），超时后即使未加载完也会返回 loaded 状态 */
  timeout?: number;
  /** 最小显示时间（毫秒），确保 Loading 动画至少显示这么长时间 */
  minDisplayTime?: number;
}

/**
 * 预加载状态接口
 */
interface PreloadState {
  /** 是否全部加载完成（或超时） */
  isLoaded: boolean;
  /** 加载进度 0-1 */
  progress: number;
  /** 已加载的资源数量 */
  loadedCount: number;
  /** 总资源数量 */
  totalCount: number;
  /** 是否发生错误 */
  hasError: boolean;
  /** 错误信息列表 */
  errors: string[];
}

/**
 * 预加载单张图片
 * 
 * @param src - 图片 URL
 * @returns Promise<boolean> - 加载成功返回 true，失败返回 false
 */
const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`[Preload] ✓ 图片加载成功: ${src}`);
      resolve(true);
    };
    
    img.onerror = () => {
      console.warn(`[Preload] ✗ 图片加载失败: ${src}`);
      resolve(false); // 失败也 resolve，不阻塞其他资源
    };
    
    // 设置 src 开始加载
    img.src = src;
  });
};

/**
 * 资源预加载 Hook
 * 
 * @param config - 预加载配置
 * @returns PreloadState - 加载状态
 */
export const usePreloadResources = (config: PreloadConfig = {}): PreloadState => {
  const {
    images = [],
    timeout = 8000,      // 默认 8 秒超时
    minDisplayTime = 1500 // 最小显示 1.5 秒，确保 Loading 动画流畅
  } = config;

  // 加载状态
  const [state, setState] = useState<PreloadState>({
    isLoaded: false,
    progress: 0,
    loadedCount: 0,
    totalCount: images.length,
    hasError: false,
    errors: []
  });

  // 记录开始时间，用于计算最小显示时间
  const startTimeRef = useRef<number>(Date.now());
  // 防止重复执行
  const hasStartedRef = useRef(false);

  /**
   * 执行预加载
   */
  const doPreload = useCallback(async () => {
    // 防止重复执行
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const totalCount = images.length;
    
    // 如果没有需要加载的资源，直接完成
    if (totalCount === 0) {
      // 等待最小显示时间
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      setTimeout(() => {
        setState(prev => ({ ...prev, isLoaded: true, progress: 1 }));
      }, remaining);
      return;
    }

    console.log(`[Preload] 开始预加载 ${totalCount} 个资源...`);

    // 已加载计数
    let loadedCount = 0;
    const errors: string[] = [];

    // 创建超时 Promise
    const timeoutPromise = new Promise<'timeout'>((resolve) => {
      setTimeout(() => resolve('timeout'), timeout);
    });

    // 并行加载所有图片，每完成一个更新进度
    const loadPromises = images.map(async (src) => {
      const success = await preloadImage(src);
      loadedCount++;
      
      if (!success) {
        errors.push(src);
      }

      // 更新进度状态
      setState(prev => ({
        ...prev,
        loadedCount,
        progress: loadedCount / totalCount,
        hasError: errors.length > 0,
        errors: [...errors]
      }));

      return success;
    });

    // 等待所有加载完成 或 超时
    const result = await Promise.race([
      Promise.all(loadPromises).then(() => 'complete' as const),
      timeoutPromise
    ]);

    if (result === 'timeout') {
      console.warn(`[Preload] 预加载超时 (${timeout}ms)，已加载 ${loadedCount}/${totalCount}`);
    } else {
      console.log(`[Preload] 预加载完成，成功 ${totalCount - errors.length}/${totalCount}`);
    }

    // 确保最小显示时间
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDisplayTime - elapsed);

    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isLoaded: true,
        progress: 1
      }));
    }, remaining);

  }, [images, timeout, minDisplayTime]);

  // 组件挂载时开始预加载
  useEffect(() => {
    startTimeRef.current = Date.now();
    doPreload();
  }, [doPreload]);

  return state;
};

/**
 * 首屏关键资源列表
 * 
 * 这些资源会在 Loading 动画期间优先加载
 * 确保首屏渲染时这些资源已经在浏览器缓存中
 */
export const CRITICAL_RESOURCES = {
  // 首屏 Home 页面的背景图片
  images: [
    '/back0.webp',   // 背景图层 0
    '/back2.webp',   // 背景图层 2
    '/front.webp'    // 前景图层
  ],
  // 首屏字体（通过 CSS font-display: swap 处理，这里不预加载）
  fonts: []
};

export default usePreloadResources;

