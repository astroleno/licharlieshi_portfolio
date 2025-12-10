import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { PROJECTS } from '../constants';
import { Project } from '../types';
import { TransitionContext } from '../App';

const SCROLL_REPEAT_COUNT = 8;

const Tech: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isHeroVideoReady, setHeroVideoReady] = useState(false);
  const [isTechnicalDetailsOpen, setIsTechnicalDetailsOpen] = useState(true);
  
  // Transition context to control visibility
  const { isTextVisible } = useContext(TransitionContext);

  // State to track the last valid video URL for the right side
  const [lastActiveVideoUrl, setLastActiveVideoUrl] = useState<string | undefined>(undefined);
  const [heroVideoSrc, setHeroVideoSrc] = useState<string | undefined>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const heroVideoContainerRef = useRef<HTMLDivElement>(null);
  // Duplicate the projects so we can loop the scroll position without blank gaps
  const infiniteProjects = useMemo(() => (
    Array.from({ length: SCROLL_REPEAT_COUNT }, () => PROJECTS).flat()
  ), []);
  
  // Initialize default video
  useEffect(() => {
    if (infiniteProjects.length > 0) {
      setLastActiveVideoUrl(infiniteProjects[0].videoUrl);
    }
  }, [infiniteProjects]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = scrollContainerRef.current;
    const list = listRef.current;
    if (!container || !list) return;

    let lastTime = performance.now();
    let lastScrollTop = container.scrollTop;
    let currentSkew = 0;
    let decayId: number;

    const applySkew = () => {
      if (!listRef.current) return;
      listRef.current.style.transform = `skewY(${currentSkew}deg)`;
    };

    const resetScrollPosition = () => {
      const midpoint = Math.max((list.scrollHeight - container.clientHeight) / 2, 0);
      container.scrollTop = midpoint;
      lastScrollTop = midpoint;
    };

    resetScrollPosition();

    const decaySkew = () => {
      if (Math.abs(currentSkew) > 0.05) {
        currentSkew *= 0.9;
        if (Math.abs(currentSkew) < 0.05) currentSkew = 0;
        applySkew();
      }
      decayId = requestAnimationFrame(decaySkew);
    };
    decayId = requestAnimationFrame(decaySkew);

    const handleScroll = () => {
      const now = performance.now();
      const dt = Math.max(now - lastTime, 16);
      const currentTop = container.scrollTop;
      const delta = currentTop - lastScrollTop;
      lastScrollTop = currentTop;
      lastTime = now;

      const velocity = delta / dt;
      const targetSkew = Math.max(Math.min(velocity * 60, 10), -10);
      currentSkew += (targetSkew - currentSkew) * 0.3;
      applySkew();

      const total = list.scrollHeight;
      const threshold = container.clientHeight;
      const maxScroll = Math.max(total - threshold, 0);
      if (currentTop <= threshold) {
        const next = Math.min(currentTop + total / 2, maxScroll);
        container.scrollTop = next;
        lastScrollTop = next;
      } else if (currentTop + threshold >= total) {
        const next = Math.max(currentTop - total / 2, 0);
        container.scrollTop = next;
        lastScrollTop = next;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resetScrollPosition();
    });
    resizeObserver.observe(container);
    resizeObserver.observe(list);

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(decayId);
      resizeObserver.disconnect();
    };
  }, []);

  const handleProjectClick = (project: Project) => {
    setActiveProject(project);
    setIsTechnicalDetailsOpen(true);
  };

  const handleClose = () => {
    setActiveProject(null);
    setIsTechnicalDetailsOpen(true);
  };

  const handleNext = () => {
    if (!activeProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === activeProject.id);
    const nextIndex = (currentIndex + 1) % PROJECTS.length;
    setActiveProject(PROJECTS[nextIndex]);
    setIsTechnicalDetailsOpen(true);
  };

  const handlePrev = () => {
    if (!activeProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === activeProject.id);
    const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length;
    setActiveProject(PROJECTS[prevIndex]);
    setIsTechnicalDetailsOpen(true);
  };

  // Auto-close detail when App starts transition (to ensure hero-work is always available)
  useEffect(() => {
    if (!isTextVisible && activeProject) {
      // When App starts transition, close detail to reveal main interface
      // This ensures hero-work is in DOM for App's transition mechanism
      setActiveProject(null);
    }
  }, [isTextVisible, activeProject]);

  // Get current video URL for the right side player
  // Use hovered project's video, or fall back to the last active one
  const currentRightVideoUrl = hoveredIndex !== null 
    ? infiniteProjects[hoveredIndex].videoUrl 
    : lastActiveVideoUrl;

  useEffect(() => {
    setHeroVideoReady(false);
    setHeroVideoSrc(undefined);

    if (!currentRightVideoUrl) return;
    if (typeof window === 'undefined') {
      setHeroVideoSrc(currentRightVideoUrl);
      return;
    }

    const container = heroVideoContainerRef.current;
    if (!container || !('IntersectionObserver' in window)) {
      setHeroVideoSrc(currentRightVideoUrl);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setHeroVideoSrc(currentRightVideoUrl);
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(container);

    return () => observer.disconnect();
  }, [currentRightVideoUrl]);

  // Main interface always renders (including hero-work)
  // Detail appears as overlay when activeProject is set
  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-brand-black relative overflow-hidden">
      {/* Left List */}
      <div 
        ref={scrollContainerRef}
        className="w-full md:w-1/2 h-full overflow-y-auto pt-24 pb-12 px-6 md:px-12 flex flex-col z-20 no-scrollbar"
      >
        <ul ref={listRef} className="space-y-2 will-change-transform">
          {infiniteProjects.map((project, index) => (
            <li key={`${project.id}-${index}`} className="relative group overflow-hidden">
                {/* Background Video for Text Mask Effect - Only active on hover */}
                {hoveredIndex === index && project.videoUrl && (
                   <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out bg-brand-black">
                     <video 
                       src={project.videoUrl} 
                       autoPlay 
                       loop 
                       muted 
                       playsInline 
                        preload="metadata"
                       className="w-full h-full object-cover opacity-0 transition-opacity duration-500"
                       onLoadedMetadata={(e) => {
                         const video = e.currentTarget;
                         if (video.duration) {
                           // Set start time to halfway (offset by half cycle)
                           video.currentTime = video.duration / 2;
                         }
                       }}
                       onSeeked={(e) => {
                         // Reveal video only after seek is complete to avoid black frames
                         e.currentTarget.style.opacity = '1';
                       }}
                     />
                  </div>
                )}

              <button
                onMouseEnter={() => {
                  setHoveredIndex(index);
                  if (project.videoUrl) {
                    setLastActiveVideoUrl(project.videoUrl);
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleProjectClick(project)}
                className={`
                  relative z-10 w-full text-left font-display uppercase leading-[0.85] tracking-tighter transition-all duration-300
                  font-variable
                  text-[12vw] md:text-[6rem] lg:text-[7.5rem]
                  ${hoveredIndex === index 
                    ? 'text-brand-red/60 translate-x-4' 
                    : 'text-gray-700 hover:text-gray-500'}
                `}
              >
                <div style={{ 
                    transform: isTextVisible ? 'translateY(0)' : 'translateY(100px)',
                    opacity: isTextVisible ? 1 : 0,
                    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: `${(index % PROJECTS.length) * 0.05}s` // Stagger based on index
                }}>
                    {project.name}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Visual Area - Video Player */}
      <div 
        id="hero-tech"
        ref={heroVideoContainerRef}
        className="hidden md:block w-1/2 h-full bg-brand-black relative transition-all duration-500 ease-in-out overflow-hidden"
      >
         {/* Video Player */}
         {heroVideoSrc && (
             <video
                key={heroVideoSrc}
                src={heroVideoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onLoadedData={() => setHeroVideoReady(true)}
                className="w-full h-full object-cover opacity-80 animate-fadeIn"
             />
         )}
         
         {/* Simple overlay to blend edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Detail View Overlay - Only renders when activeProject is set */}
      {activeProject && (
        <div className="absolute inset-0 z-30 bg-brand-black text-white flex flex-col md:flex-row animate-fadeIn w-full h-full">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 p-8 md:p-12 flex justify-between items-start z-40">
          <button onClick={handleClose} className="text-xs font-bold tracking-widest hover:text-brand-red transition-colors">CLOSE</button>
          
          <div className="flex gap-12">
             <button onClick={handlePrev} className="text-xs font-bold tracking-widest hover:text-brand-red transition-colors">PREV</button>
             <button onClick={handleNext} className="text-xs font-bold tracking-widest hover:text-brand-red transition-colors">NEXT</button>
          </div>
        </div>

        {/* Left Content Column - 参考Game.tsx的布局风格 */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-16 relative bg-brand-black overflow-y-auto py-24">
          
          {/* ========== 主要信息区 ========== */}
          
          {/* 大标题 - 增加底部间距，突出视觉层级 */}
          <h2 className="text-[12vw] md:text-[5rem] lg:text-[6rem] font-display font-bold leading-[1.1] mb-8 uppercase tracking-tighter text-brand-red">
            {activeProject.name}
          </h2>

          {/* 标签组 - 参考Game页面的标签样式 */}
          <div className="flex flex-wrap gap-3 text-xs font-bold tracking-widest mb-8">
            <span className="bg-brand-red text-black px-3 py-1">{activeProject.client}</span>
            <span className="bg-white/10 text-white px-3 py-1">{activeProject.year}</span>
            {activeProject.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-white/10 text-white px-3 py-1">{tag}</span>
            ))}
          </div>

          {/* ========== 关于项目区 ========== */}
          <div className="space-y-4 max-w-lg mb-10">
            {/* About标题 - 参考Game的小标题风格 */}
            <h3 className="text-sm font-bold tracking-wide text-gray-400 uppercase">
              About This Project
            </h3>
            
            {/* 副标题 */}
            <p className="text-sm md:text-base font-bold leading-tight text-white tracking-wide">
              {activeProject.subtitle}
            </p>
            
            {/* 描述 */}
            <p className="text-sm leading-relaxed text-gray-300">
              {activeProject.description}
            </p>
          </div>

          {/* ========== 角色与团队区 ========== */}
          <div className="space-y-6 mb-10">
            {/* Role - 更紧凑的显示 */}
            <div>
              <span className="text-[10px] text-gray-500 block mb-2 tracking-widest">ROLE :</span>
              <div className="text-xs md:text-sm font-bold uppercase tracking-wide text-white">
                {activeProject.role}
              </div>
            </div>

            {/* Collaborators - 简化为单行显示，用分隔符连接 */}
            {activeProject.collaborators && activeProject.collaborators.length > 0 && (
              <div>
                <span className="text-[10px] text-gray-500 block mb-2 tracking-widest">COLLABORATORS :</span>
                <div className="text-xs text-gray-400 leading-relaxed">
                  {activeProject.collaborators.map((collaborator, index) => (
                    <span key={index}>
                      {collaborator}
                      {index < activeProject.collaborators!.length - 1 && <span className="text-gray-600 mx-2">•</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Paper Submission - 如果存在 */}
            {activeProject.paperSubmission && (
              <div>
                <span className="text-[10px] text-gray-500 block mb-2 tracking-widest">PAPER SUBMISSION :</span>
                <div className="text-xs text-brand-red font-bold">
                  {activeProject.paperSubmission}
                  {activeProject.links?.conference && (
                    <a 
                      href={activeProject.links.conference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-1 hover:underline"
                    >
                      [Link →]
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ========== 技术栈区 ========== */}
          <div className="mb-10">
            <span className="text-[10px] text-gray-500 block mb-2 tracking-widest">TECH STACK :</span>
            <div className="text-sm font-bold uppercase tracking-wide text-white">
              {activeProject.tags.join(' / ')}
            </div>
          </div>

          {/* ========== 技术详情区（可折叠） ========== */}
          {activeProject.technicalDetails && (
            <div className="mb-10 border-t border-white/10 pt-6">
              <button
                onClick={() => setIsTechnicalDetailsOpen(!isTechnicalDetailsOpen)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-gray-500 tracking-widest uppercase">
                    {activeProject.technicalDetails.title} :
                  </span>
                  <span className="text-gray-500 text-sm transition-transform duration-300" style={{ transform: isTechnicalDetailsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </div>
              </button>
              
              <div 
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ 
                  maxHeight: isTechnicalDetailsOpen ? '1000px' : '0',
                  opacity: isTechnicalDetailsOpen ? 1 : 0 
                }}
              >
                <div className="pt-2 space-y-4">
                  {/* Overview */}
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {activeProject.technicalDetails.overview}
                  </p>
                  
                  {/* Components - 简化显示 */}
                  {activeProject.technicalDetails.components && activeProject.technicalDetails.components.length > 0 && (
                    <div>
                      <span className="text-[10px] text-gray-500 block mb-2 tracking-widest">KEY COMPONENTS :</span>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {activeProject.technicalDetails.components.slice(0, 5).map((component, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-brand-red">•</span>
                            <span>{component}</span>
                          </li>
                        ))}
                        {activeProject.technicalDetails.components.length > 5 && (
                          <li className="text-gray-500 italic">...and {activeProject.technicalDetails.components.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========== 链接区 - CTA按钮风格（参考Game） ========== */}
          {activeProject.links && (
            <div className="flex flex-col gap-3 pt-4">
              {/* GitHub - 主要CTA按钮 */}
              {activeProject.links.github && (
                <a 
                  href={activeProject.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-6 py-4 bg-brand-red text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-brand-red"
                >
                  <span>View on GitHub</span>
                  <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                </a>
              )}
              
              {/* Live Demo - 次要按钮 */}
              {activeProject.links.live && (
                <a 
                  href={activeProject.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-6 py-4 bg-white/10 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-brand-black"
                >
                  <span>See it Live</span>
                  <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                </a>
              )}
              
              {/* Conference - 只在没有paper submission时显示 */}
              {activeProject.links.conference && !activeProject.paperSubmission && (
                <a 
                  href={activeProject.links.conference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between px-6 py-4 bg-white/10 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-brand-black"
                >
                  <span>Conference</span>
                  <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right Visual Column */}
        <div className="hidden md:flex w-1/2 h-full relative overflow-hidden items-center justify-center">
          <div className="w-full max-w-5xl mx-auto aspect-video flex items-center justify-center">
            {activeProject.youtubeUrl ? (
              (() => {
                // 从 YouTube embed URL 中提取视频 ID
                // 格式: https://www.youtube.com/embed/VIDEO_ID
                const videoIdMatch = activeProject.youtubeUrl.match(/embed\/([^?]+)/);
                const videoId = videoIdMatch ? videoIdMatch[1] : '';
                // 构建 YouTube iframe URL，包含自动播放、静音、循环播放和播放列表参数
                const iframeSrc = `${activeProject.youtubeUrl}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
                return (
                  <iframe
                    src={iframeSrc}
                    title={activeProject.name}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                );
              })()
            ) : activeProject.videoUrl ? (
              <video 
                src={activeProject.videoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                preload="metadata"
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={activeProject.imageUrl} 
                alt={activeProject.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Tech;
