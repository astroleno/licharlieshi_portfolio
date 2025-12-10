/**
 * LazyYouTube.tsx
 * 
 * YouTube 懒加载组件
 * 
 * 功能说明：
 * - 使用 IntersectionObserver 实现视口懒加载
 * - 进入视口前显示占位图（YouTube 缩略图）
 * - 进入视口后才加载真正的 YouTube iframe
 * - 可选：点击触发模式（用户点击封面才加载）
 * 
 * 优势：
 * - 减少首屏请求数量
 * - 节省带宽（用户不滚动到的视频不会加载）
 * - 提升页面性能（减少第三方脚本）
 * 
 * 使用方式：
 * <LazyYouTube 
 *   videoId="dQw4w9WgXcQ" 
 *   title="Video Title"
 *   autoplay={true}
 * />
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * 组件属性接口
 */
interface LazyYouTubeProps {
  /** YouTube 视频 ID */
  videoId: string;
  /** 视频标题（用于 accessibility） */
  title?: string;
  /** 是否自动播放（进入视口后） */
  autoplay?: boolean;
  /** 是否静音 */
  muted?: boolean;
  /** 是否循环播放 */
  loop?: boolean;
  /** 是否使用点击触发模式（默认 false，进入视口自动加载） */
  clickToLoad?: boolean;
  /** 自定义 className */
  className?: string;
  /** iframe 加载完成回调 */
  onLoad?: () => void;
}

/**
 * 获取 YouTube 缩略图 URL
 * 
 * YouTube 提供多种缩略图尺寸：
 * - default.jpg: 120x90
 * - mqdefault.jpg: 320x180
 * - hqdefault.jpg: 480x360
 * - sddefault.jpg: 640x480 (可能不存在)
 * - maxresdefault.jpg: 1280x720 (可能不存在)
 * 
 * @param videoId - YouTube 视频 ID
 * @returns 缩略图 URL
 */
const getThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * YouTube 懒加载组件
 */
const LazyYouTube: React.FC<LazyYouTubeProps> = ({
  videoId,
  title = 'YouTube Video',
  autoplay = true,
  muted = true,
  loop = true,
  clickToLoad = false,
  className = '',
  onLoad
}) => {
  // 是否已加载 iframe
  const [isLoaded, setIsLoaded] = useState(false);
  // 是否在视口内
  const [isInView, setIsInView] = useState(false);
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 构建 YouTube iframe URL
   */
  const getIframeSrc = useCallback((): string => {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: muted ? '1' : '0',
      loop: loop ? '1' : '0',
      playlist: loop ? videoId : '', // loop 需要 playlist 参数
      rel: '0', // 不显示相关视频
      modestbranding: '1', // 简洁品牌
      playsinline: '1' // iOS 内联播放
    });
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId, autoplay, muted, loop]);

  /**
   * IntersectionObserver 监听视口
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 如果已加载，不需要继续监听
    if (isLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          console.log(`[LazyYouTube] 视频 ${videoId} 进入视口`);
          setIsInView(true);
          
          // 如果不是点击触发模式，进入视口就加载
          if (!clickToLoad) {
            setIsLoaded(true);
          }
          
          // 进入视口后停止监听
          observer.disconnect();
        }
      },
      {
        // 提前 200px 开始加载
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [videoId, clickToLoad, isLoaded]);

  /**
   * 处理点击事件（点击触发模式）
   */
  const handleClick = () => {
    if (clickToLoad && isInView && !isLoaded) {
      setIsLoaded(true);
    }
  };

  /**
   * iframe 加载完成处理
   */
  const handleIframeLoad = () => {
    console.log(`[LazyYouTube] 视频 ${videoId} iframe 加载完成`);
    onLoad?.();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-black ${className}`}
      onClick={handleClick}
      style={{ cursor: clickToLoad && !isLoaded ? 'pointer' : 'default' }}
    >
      {/* 占位图 - 显示 YouTube 缩略图 */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 缩略图 */}
          <img
            src={getThumbnailUrl(videoId)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* 播放按钮覆盖层 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40">
            {/* YouTube 播放按钮样式 */}
            <div className="w-16 h-12 bg-red-600 rounded-lg flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
              <svg 
                className="w-6 h-6 text-white ml-1" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          
          {/* 点击提示（仅点击触发模式） */}
          {clickToLoad && isInView && (
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-white/80 text-sm bg-black/50 px-3 py-1 rounded">
                Click to play
              </span>
            </div>
          )}
          
          {/* 加载中提示（进入视口但还未加载） */}
          {!clickToLoad && isInView && !isLoaded && (
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-white/60 text-xs">
                Loading...
              </span>
            </div>
          )}
        </div>
      )}

      {/* YouTube iframe - 只在加载后渲染 */}
      {isLoaded && (
        <iframe
          src={getIframeSrc()}
          title={title}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleIframeLoad}
        />
      )}
    </div>
  );
};

export default LazyYouTube;

/**
 * 工具函数：从 YouTube URL 提取视频 ID
 * 
 * 支持的 URL 格式：
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * 
 * @param url - YouTube URL
 * @returns 视频 ID 或 null
 */
export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/watch\?.*v=([^&\s]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

