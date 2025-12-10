/**
 * useResourcePreload.ts
 * 
 * 静态资源空闲预加载 Hook
 * 
 * 功能说明：
 * - 在浏览器空闲时预加载 public 文件夹中的静态资源
 * - 图片：完整预加载到浏览器缓存
 * - 视频：只预加载 metadata（duration、dimensions），不下载完整视频
 * - 使用 requestIdleCallback，不影响用户交互
 * 
 * 使用方式：
 * useResourcePreload({ enabled: hasLoaderFinished });
 * 
 * Vercel 部署说明：
 * - 预加载的资源会被 Vercel CDN 缓存
 * - vercel.json 中已配置 .webp/.webm 文件的长期缓存
 */

import { useEffect, useRef } from 'react';

/**
 * 预加载配置
 */
interface ResourcePreloadConfig {
  /** 是否启用预加载 */
  enabled: boolean;
  /** 延迟时间（毫秒），默认 3000ms */
  delay?: number;
}

/**
 * requestIdleCallback polyfill
 */
const requestIdle = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  return window.setTimeout(() => {
    callback({ didTimeout: false, timeRemaining: () => 50 });
  }, options?.timeout || 100) as unknown as number;
};

const cancelIdle = (handle: number): void => {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    window.clearTimeout(handle);
  }
};

/**
 * 预加载图片
 * 
 * @param src - 图片 URL
 */
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log(`[ResourcePreload] ✓ 图片: ${src}`);
      resolve();
    };
    img.onerror = () => {
      console.warn(`[ResourcePreload] ✗ 图片失败: ${src}`);
      resolve(); // 失败也 resolve，不阻塞其他资源
    };
    img.src = src;
  });
};

/**
 * 预加载视频 metadata
 * 
 * 只加载视频的元数据（时长、尺寸等），不下载完整视频内容
 * 这样可以：
 * 1. 让浏览器知道视频存在
 * 2. 用户播放时可以更快开始
 * 3. 不消耗大量带宽
 * 
 * @param src - 视频 URL
 */
const preloadVideoMetadata = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata'; // 只加载 metadata，不下载完整视频
    
    video.onloadedmetadata = () => {
      console.log(`[ResourcePreload] ✓ 视频metadata: ${src}`);
      resolve();
    };
    
    video.onerror = () => {
      console.warn(`[ResourcePreload] ✗ 视频失败: ${src}`);
      resolve();
    };
    
    // 设置超时，避免某些视频卡住
    setTimeout(() => resolve(), 5000);
    
    video.src = src;
  });
};

/**
 * 需要预加载的静态资源列表
 * 
 * 策略说明：
 * - 首屏图片（back0/back2/front）已在 usePreloadResources 中处理，这里不重复
 * - 只预加载用户很可能会访问到的资源
 * - 视频只预加载 metadata，不预加载完整内容
 */
export const STATIC_RESOURCES = {
  // 非首屏图片
  images: [
    '/back1.webp'  // 备用背景图（如果有使用的话）
  ],
  
  // 视频文件 - 只预加载 metadata
  // 按照用户访问可能性排序，优先预加载常用的
  videos: [
    '/contact.webm',     // Contact 页面视频
    '/live.webm',        // Music 页面可能用到
    '/tv.webm',          // Tech 页面可能用到
    '/games.webm',       // Game 页面可能用到
    // 以下视频按需添加，注意不要预加载太多
    // '/a.webm',
    // '/b.webm',
    // '/c.webm',
    // '/d.webm',
    // '/anime.webm',
    // '/welcomeback.webm',
    // '/dreampillow.webm',
    // '/pangu.webm',
  ]
};

/**
 * 静态资源空闲预加载 Hook
 */
export const useResourcePreload = (config: ResourcePreloadConfig): void => {
  const { enabled, delay = 3000 } = config;
  const hasPreloadedRef = useRef(false);
  const idleHandleRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || hasPreloadedRef.current) return;
    if (typeof window === 'undefined') return;

    console.log(`[ResourcePreload] ${delay}ms 后开始预加载静态资源...`);

    delayTimeoutRef.current = window.setTimeout(() => {
      hasPreloadedRef.current = true;

      // 资源队列：先图片后视频
      const queue: Array<{ type: 'image' | 'video'; src: string }> = [
        ...STATIC_RESOURCES.images.map(src => ({ type: 'image' as const, src })),
        ...STATIC_RESOURCES.videos.map(src => ({ type: 'video' as const, src }))
      ];

      let currentIndex = 0;

      const preloadNext = () => {
        if (currentIndex >= queue.length) {
          console.log('[ResourcePreload] ✓ 所有静态资源预加载完成');
          return;
        }

        idleHandleRef.current = requestIdle(
          async (deadline) => {
            if (deadline.timeRemaining() > 10 || deadline.didTimeout) {
              const item = queue[currentIndex];
              
              if (item.type === 'image') {
                await preloadImage(item.src);
              } else {
                await preloadVideoMetadata(item.src);
              }
              
              currentIndex++;
              preloadNext();
            } else {
              preloadNext();
            }
          },
          { timeout: 5000 }
        );
      };

      console.log('[ResourcePreload] 开始在空闲时预加载静态资源...');
      preloadNext();

    }, delay);

    return () => {
      if (delayTimeoutRef.current) window.clearTimeout(delayTimeoutRef.current);
      if (idleHandleRef.current) cancelIdle(idleHandleRef.current);
    };
  }, [enabled, delay]);
};

export default useResourcePreload;

