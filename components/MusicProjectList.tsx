import React, { useState, useEffect } from 'react';
import { MusicCategoryData } from '../types';
import LazyYouTube, { extractYouTubeId } from './LazyYouTube';

interface MusicProjectListProps {
  category: MusicCategoryData;
}

/**
 * MusicProjectList Component
 * 
 * 显示音乐项目列表和YouTube播放器的左右布局页面。
 * 布局结构：
 * - 左侧 (50%): 滚动的作品详情列表
 * - 右侧 (50%): YouTube视频播放器容器
 * 
 * 交互逻辑：
 * - 点击左侧链接时，右侧播放器切换到对应的YouTube视频
 * - 视频自动播放并循环
 */
export const MusicProjectList: React.FC<MusicProjectListProps> = ({ category }) => {
  // 当前选中的YouTube视频URL（完整URL）
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // 注意：extractYouTubeId 函数从 LazyYouTube 组件导入

  // 检查链接是否为YouTube链接
  const isYouTubeLink = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // 收集所有YouTube链接，找到第一个有效的作为默认视频
  // 特殊处理：live分类优先选择第二个视频（因为第一个Performance 1失效了）
  useEffect(() => {
    const youtubeLinks: string[] = [];
    
    // 收集所有YouTube链接
    for (const work of category.works) {
      if (work.links && work.links.length > 0) {
        for (const link of work.links) {
          if (isYouTubeLink(link.url)) {
            youtubeLinks.push(link.url);
          }
        }
      }
    }
    
    // 根据分类ID选择默认视频
    if (youtubeLinks.length > 0) {
      // live分类且有多个视频时，跳过第一个（失效的Performance 1）
      if (category.id === 'live' && youtubeLinks.length > 1) {
        setSelectedVideoUrl(youtubeLinks[1]); // 选择Performance 2
      } else {
        setSelectedVideoUrl(youtubeLinks[0]); // 其他分类选择第一个
      }
    }
  }, [category]);

  // 处理链接点击
  const handleLinkClick = (url: string, e: React.MouseEvent) => {
    if (isYouTubeLink(url)) {
      e.preventDefault(); // 阻止默认跳转行为
      setSelectedVideoUrl(url);
    }
    // 非YouTube链接保持原有行为（在新标签页打开）
  };

  // 注意：YouTube URL 解析和嵌入现在由 LazyYouTube 组件处理

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-brand-black">
      
      {/* 左侧：作品详情列表 */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto scrollbar-hide px-4 md:px-12 py-8 md:py-[4.5rem] box-border">
        <div className="max-w-3xl mx-auto flex flex-col gap-12 md:gap-[4.5rem]">
          
          {/* Category Header (Mobile Only / Optional Context) */}
          <div className="md:hidden text-brand-red font-mono text-xs tracking-widest mb-4">
            {category.label} // {category.yearRange}
          </div>

          {/* Works List */}
          {category.works.map((work, index) => (
            <div 
              key={index} 
              className="flex flex-col gap-4 group"
              style={{
                animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                transform: 'translateY(20px)'
              }}
            >
              
              {/* Title - 双语标题：英文大号在上，中文小号在下 */}
              <div className="flex flex-col gap-1">
                <h3 className="text-4xl md:text-6xl font-display font-bold text-white uppercase leading-[0.85] tracking-tighter">
                  {work.nameEn}
                </h3>
                <p className="text-lg md:text-2xl font-display font-bold text-white/60 leading-none tracking-tight">
                  {work.nameCn}
                </p>
              </div>

              <div className="flex flex-col gap-4 border-l-2 border-brand-red pl-4">
                {/* Role */}
                <div className="flex flex-col gap-1">
                  <span className="text-brand-red font-mono text-xs md:text-sm tracking-wide uppercase">
                    {work.role}
                  </span>
                  
                  {/* Description */}
                  {work.description && (
                    <p className="text-white/60 font-mono text-sm md:text-base leading-relaxed">
                      {work.description}
                    </p>
                  )}
                  
                  {/* Award - 奖项信息（如果存在）*/}
                  {work.award && (
                    <p className="text-brand-red/80 font-mono text-xs md:text-sm leading-relaxed italic mt-1">
                      {work.award}
                    </p>
                  )}
                </div>

                {/* Links - 具体曲目链接 */}
                {work.links && work.links.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {work.links.map((link, idx) => {
                      const isYouTube = isYouTubeLink(link.url);
                      const isActive = selectedVideoUrl === link.url;
                      
                      return (
                        <a
                          key={idx}
                          href={link.url}
                          target={isYouTube ? undefined : "_blank"}
                          rel={isYouTube ? undefined : "noopener noreferrer"}
                          onClick={(e) => handleLinkClick(link.url, e)}
                          className={`
                            px-3 py-1 text-xs font-mono transition-all duration-300 rounded-sm uppercase cursor-pointer
                            ${isActive 
                              ? 'bg-brand-red text-white' 
                              : 'bg-white/10 hover:bg-white text-white hover:text-black'
                            }
                          `}
                        >
                          {link.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Bottom Padding for scroll space */}
          <div className="h-24 w-full" />
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>

      {/* 右侧：YouTube视频播放器容器 */}
      {/* 使用 LazyYouTube 组件实现懒加载，节省首屏资源 */}
      <div className="hidden md:flex w-1/2 h-full relative overflow-hidden items-center justify-center bg-brand-black">
        <div className="w-full max-w-5xl mx-auto aspect-video flex items-center justify-center px-8">
          {selectedVideoUrl ? (
            (() => {
              const videoId = extractYouTubeId(selectedVideoUrl);
              if (!videoId) return (
                <div className="flex items-center justify-center w-full h-full border border-white/10">
                  <p className="text-white/30 font-mono text-sm">Invalid video URL</p>
                </div>
              );
              return (
                <LazyYouTube
                  key={selectedVideoUrl} // 使用 key 确保 URL 变化时重新加载
                  videoId={videoId}
                  title="YouTube Video Player"
                  autoplay={true}
                  muted={true}
                  loop={true}
                  className="w-full h-full"
                />
              );
            })()
          ) : (
            // 没有 YouTube 链接时显示占位符
            <div className="flex items-center justify-center w-full h-full border border-white/10">
              <p className="text-white/30 font-mono text-sm">No video available</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
