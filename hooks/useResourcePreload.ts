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
 * 完整预加载视频
 * 
 * 使用 fetch 下载完整视频到浏览器缓存
 * 适用于首屏必须立即播放的关键视频
 * 
 * 注意：会消耗较多带宽，只用于关键视频
 * 
 * @param src - 视频 URL
 */
const preloadVideoFull = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    // 使用 fetch 预加载完整视频
    fetch(src, { 
      method: 'GET',
      // 允许浏览器缓存
      cache: 'force-cache'
    })
      .then(response => {
        if (response.ok) {
          // 读取完整响应以确保缓存
          return response.blob();
        }
        throw new Error(`HTTP ${response.status}`);
      })
      .then(() => {
        console.log(`[ResourcePreload] ✓ 视频完整预加载: ${src}`);
        resolve();
      })
      .catch(error => {
        console.warn(`[ResourcePreload] ✗ 视频完整预加载失败: ${src}`, error);
        resolve(); // 失败也 resolve，不阻塞
      });
    
    // 超时保护（30秒）
    setTimeout(() => resolve(), 30000);
  });
};

/**
 * 需要预加载的静态资源列表
 * 
 * 策略说明：
 * - 首屏图片（back0/back2/front）已在 usePreloadResources 中处理，这里不重复
 * - 视频分为"完整预加载"和"metadata预加载"两种
 * - 根据页面使用频率和用户行为设计优先级
 * 
 * Tech 页面策略：
 * - P0: pangu.webm 完整预加载（首屏默认显示）
 * - P1: 前几个项目视频 metadata（用户最可能 hover）
 * - P2: 其他视频 metadata
 */
export const STATIC_RESOURCES = {
  // 非首屏图片
  images: [
    '/back1.webp'  // 备用背景图（如果有使用的话）
  ],
  
  // P0: 需要完整预加载的关键视频
  // 这些视频会在页面首屏或核心交互中立即显示
  criticalVideos: [
    '/pangu.webm'      // Tech 页面首屏默认播放的视频
  ],
  
  // P1: 高优先级视频 - 只预加载 metadata
  // Tech 页面前几个项目，用户最可能 hover 到
  highPriorityVideos: [
    '/welcomeback.webm',  // Tech 页面第 2 个项目
    '/cstore.webm',       // Tech 页面第 3 个项目（CSTORE）
    '/dreampillow.webm',  // Tech 页面第 4 个项目
    '/contact.webm'       // Contact 页面视频
  ],
  
  // P2: 中优先级视频 - 只预加载 metadata
  // 其他可能用到的视频
  normalPriorityVideos: [
    '/jazzwithli.webm',   // Tech 页面（Jazz with Li）
    '/live.webm',         // Music 页面
    '/tv.webm',           // Music 页面
    '/games.webm',        // Music 页面
    '/anime.webm'         // Music 页面
  ],
  
  // P2: 中优先级图片 - 预加载完整图片
  // 已从视频改为图片的项目
  normalPriorityImages: [
    '/QI.webp',           // Tech 页面（Qi ESax）- 已改为图片
    '/boxofworld.webp'    // Tech 页面（Box of World）- 已改为图片
  ]
};

/**
 * 静态资源空闲预加载 Hook
 * 
 * 预加载顺序（按优先级）：
 * 1. 图片
 * 2. 关键视频（完整预加载）
 * 3. 高优先级视频（metadata）
 * 4. 中优先级视频（metadata）
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

      // 资源队列：按优先级排列
      // type: 'image' | 'video-full' | 'video-metadata'
      const queue: Array<{ type: 'image' | 'video-full' | 'video-metadata'; src: string; priority: string }> = [
        // P0: 图片
        ...STATIC_RESOURCES.images.map(src => ({ 
          type: 'image' as const, 
          src,
          priority: 'P0-image'
        })),
        // P0: 关键视频（完整预加载）
        ...STATIC_RESOURCES.criticalVideos.map(src => ({ 
          type: 'video-full' as const, 
          src,
          priority: 'P0-critical'
        })),
        // P1: 高优先级视频（metadata）
        ...STATIC_RESOURCES.highPriorityVideos.map(src => ({ 
          type: 'video-metadata' as const, 
          src,
          priority: 'P1-high'
        })),
        // P2: 中优先级图片（完整预加载）
        ...(STATIC_RESOURCES.normalPriorityImages || []).map(src => ({ 
          type: 'image' as const, 
          src,
          priority: 'P2-image'
        })),
        // P2: 中优先级视频（metadata）
        ...STATIC_RESOURCES.normalPriorityVideos.map(src => ({ 
          type: 'video-metadata' as const, 
          src,
          priority: 'P2-normal'
        }))
      ];

      let currentIndex = 0;
      let currentPriority = '';

      const preloadNext = () => {
        if (currentIndex >= queue.length) {
          console.log('[ResourcePreload] ✓ 所有静态资源预加载完成');
          return;
        }

        // 在外部获取当前项，用于设置 timeout
        const currentItem = queue[currentIndex];
        const timeout = currentItem.type === 'video-full' ? 30000 : 5000;

        idleHandleRef.current = requestIdle(
          async (deadline) => {
            // 关键视频需要更多时间，放宽条件
            const item = queue[currentIndex];
            if (!item) {
              console.log('[ResourcePreload] ✓ 所有静态资源预加载完成');
              return;
            }
            
            const needsMoreTime = item.type === 'video-full';
            const hasTime = needsMoreTime 
              ? (deadline.timeRemaining() > 5 || deadline.didTimeout)
              : (deadline.timeRemaining() > 10 || deadline.didTimeout);
            
            if (hasTime) {
              // 记录优先级变化
              if (item.priority !== currentPriority) {
                currentPriority = item.priority;
                console.log(`[ResourcePreload] 开始 ${currentPriority} 优先级资源...`);
              }
              
              if (item.type === 'image') {
                await preloadImage(item.src);
              } else if (item.type === 'video-full') {
                await preloadVideoFull(item.src);
              } else {
                await preloadVideoMetadata(item.src);
              }
              
              currentIndex++;
              preloadNext();
            } else {
              preloadNext();
            }
          },
          { timeout }
        );
      };

      console.log('[ResourcePreload] 开始在空闲时预加载静态资源...');
      console.log(`[ResourcePreload] 队列: ${queue.length} 个资源`);
      console.log(`[ResourcePreload] - 图片: ${STATIC_RESOURCES.images.length}`);
      console.log(`[ResourcePreload] - 关键视频(完整): ${STATIC_RESOURCES.criticalVideos.length}`);
      console.log(`[ResourcePreload] - 高优先视频(metadata): ${STATIC_RESOURCES.highPriorityVideos.length}`);
      console.log(`[ResourcePreload] - 中优先图片: ${(STATIC_RESOURCES.normalPriorityImages || []).length}`);
      console.log(`[ResourcePreload] - 中优先视频(metadata): ${STATIC_RESOURCES.normalPriorityVideos.length}`);
      preloadNext();

    }, delay);

    return () => {
      if (delayTimeoutRef.current) window.clearTimeout(delayTimeoutRef.current);
      if (idleHandleRef.current) cancelIdle(idleHandleRef.current);
    };
  }, [enabled, delay]);
};

export default useResourcePreload;
