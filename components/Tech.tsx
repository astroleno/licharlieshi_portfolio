import React, { useState, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import { PROJECTS } from '../constants';
import { Project } from '../types';
import { TransitionContext } from '../App';
import LazyYouTube, { extractYouTubeId } from './LazyYouTube';

const SCROLL_REPEAT_COUNT = 8;
const PROJECTS_WITHOUT_CTA = new Set(['cstore', 'qiesax', 'jazzwithli', 'boxofworld']);

/**
 * 需要在详情页右侧展示可滚动长图（而非视频）的项目映射表
 * key: 项目 ID
 * value: 对应的图片路径（相对于 public 目录）
 */
const SCROLLABLE_IMAGE_PROJECTS: Record<string, string> = {
  'boxofworld': '/boxofworld.webp'
};

/**
 * 需要在详情页右侧展示可缩放图片（滚轮控制缩放，居中对齐）的项目映射表
 * key: 项目 ID
 * value: 对应的图片路径（相对于 public 目录）
 * 
 * 缩放效果参考 Home.tsx：
 * - 初始为最大放大（2x）
 * - 滚轮向下：缩小图片
 * - 滚轮向上：放大图片
 * - 缩放范围：1x ~ 2x
 * - 放大时不限制容器，可超出边界显示
 */
const ZOOMABLE_IMAGE_PROJECTS: Record<string, string> = {
  'qiesax': '/QI.webp'
};

const Tech: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isHeroVideoReady, setHeroVideoReady] = useState(false);
  const [isTechnicalDetailsOpen, setIsTechnicalDetailsOpen] = useState(true);
  
  // ========== 架构图 Modal 弹窗状态 ==========
  // 用于展示 technicalDetails.architectureImage 的全屏弹窗
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [archModalImageUrl, setArchModalImageUrl] = useState<string | null>(null);
  
  // Transition context to control visibility
  const { isTextVisible } = useContext(TransitionContext);

  // State to track the last valid video URL for the right side
  const [lastActiveVideoUrl, setLastActiveVideoUrl] = useState<string | undefined>(undefined);
  const [heroVideoSrc, setHeroVideoSrc] = useState<string | undefined>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const heroVideoContainerRef = useRef<HTMLDivElement>(null);
  // 详情页左侧内容区域的滚动容器
  // 每次打开 / 切换项目时，将其滚动条重置到顶部，保证所有项目初始布局一致
  const detailScrollRef = useRef<HTMLDivElement>(null);
  
  // ========== 可缩放图片相关 ==========
  // 用于 qiesax 等项目的滚轮缩放效果
  const zoomableContainerRef = useRef<HTMLDivElement>(null);
  const zoomProgressRef = useRef(0);  // 缩放进度 (0-1)
  const zoomImageRef = useRef<HTMLImageElement>(null);
  
  // ========== 架构图 Modal 弹窗相关 ==========
  // 用于全屏展示 architectureImage 的 Modal 组件
  const archModalContainerRef = useRef<HTMLDivElement>(null);
  const archModalImageRef = useRef<HTMLImageElement>(null);
  const archZoomProgressRef = useRef(0);  // Modal 内图片缩放进度 (0-1)
  // Duplicate the projects so we can loop the scroll position without blank gaps
  const infiniteProjects = useMemo(() => (
    Array.from({ length: SCROLL_REPEAT_COUNT }, () => PROJECTS).flat()
  ), []);

  const shouldRenderFakeButtons = activeProject ? PROJECTS_WITHOUT_CTA.has(activeProject.id) : false;

  // ========== 架构图 Modal 打开/关闭函数 ==========
  /**
   * 打开架构图全屏弹窗
   * @param imageUrl 架构图的图片路径
   */
  const openArchModal = useCallback((imageUrl: string) => {
    setArchModalImageUrl(imageUrl);
    setIsArchModalOpen(true);
    archZoomProgressRef.current = 0;  // 重置缩放进度
    console.log('[Tech] 打开架构图 Modal:', imageUrl);
  }, []);

  /**
   * 关闭架构图全屏弹窗
   */
  const closeArchModal = useCallback(() => {
    setIsArchModalOpen(false);
    setArchModalImageUrl(null);
    archZoomProgressRef.current = 0;  // 重置缩放进度
    console.log('[Tech] 关闭架构图 Modal');
  }, []);

  const resetDetailScrollPosition = useCallback((projectId?: string) => {
    const container = detailScrollRef.current;
    if (!container) return;

    try {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      } else {
        container.scrollTop = 0;
      }
      if (projectId) {
        console.log('[Tech] Detail scroll reset to top for project:', projectId);
      }
    } catch (error) {
      console.error('[Tech] Failed to reset detail scroll position:', error);
    }
  }, []);
  
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
    resetDetailScrollPosition(project.id);
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
    resetDetailScrollPosition(PROJECTS[nextIndex].id);
    setActiveProject(PROJECTS[nextIndex]);
    setIsTechnicalDetailsOpen(true);
  };

  const handlePrev = () => {
    if (!activeProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === activeProject.id);
    const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length;
    resetDetailScrollPosition(PROJECTS[prevIndex].id);
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

  // 当 activeProject 变化时，重置详情页左侧滚动区域到顶部
  // 确保所有项目在「刚进入详情页」时的布局一致（标题、About、视频等都从顶部开始）
  useEffect(() => {
    if (!activeProject) return;
    resetDetailScrollPosition(activeProject.id);
  }, [activeProject, resetDetailScrollPosition]);

  // ========== 架构图 Modal ESC 键关闭 & 滚轮缩放 ==========
  // 当 Modal 打开时，监听 ESC 键关闭和滚轮缩放
  useEffect(() => {
    if (!isArchModalOpen) return;

    // ESC 键关闭 Modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeArchModal();
      }
    };

    // 滚轮缩放（在 Modal 容器内）
    const container = archModalContainerRef.current;
    const image = archModalImageRef.current;
    const gsap = (window as any).gsap;

    if (container && image && gsap) {
      // 初始化图片缩放状态
      gsap.set(image, { scale: 1, transformOrigin: 'center center' });

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // 计算新的进度值（0-1 之间）
        // deltaY 正值 = 向下滚动（放大），负值 = 向上滚动（缩小）
        const delta = e.deltaY * 0.002;
        const newProgress = Math.max(0, Math.min(1, archZoomProgressRef.current + delta));
        archZoomProgressRef.current = newProgress;

        // 计算缩放值：1x ~ 3x（Modal 内允许更大缩放以查看细节）
        const targetScale = 1 + newProgress * 2;

        gsap.to(image, {
          scale: targetScale,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true
        });

        console.log('[Tech] Modal 图片缩放:', (newProgress * 100).toFixed(1) + '%', '缩放:', targetScale.toFixed(2) + 'x');
      };

      container.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        container.removeEventListener('wheel', handleWheel);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }

    // 如果没有 gsap，只监听 ESC 键
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isArchModalOpen, closeArchModal]);

  // ========== 可缩放图片的滚轮事件处理 ==========
  // 参考 Home.tsx 实现：滚轮控制图片缩放
  // 初始为最大放大（2x），滚轮向下缩小，向上放大
  useEffect(() => {
    // 只在当前项目是可缩放图片项目时启用
    if (!activeProject || !ZOOMABLE_IMAGE_PROJECTS[activeProject.id]) {
      // 重置缩放进度
      zoomProgressRef.current = 0;
      return;
    }

    const gsap = (window as any).gsap;
    const container = zoomableContainerRef.current;
    const image = zoomImageRef.current;

    if (!gsap || !container || !image) return;

    console.log('[Tech] 初始化可缩放图片滚轮事件:', activeProject.id);
    
    // 初始为最大放大（进度=0 对应 2x，进度=1 对应 1x）
    zoomProgressRef.current = 0;
    gsap.set(image, { scale: 2, transformOrigin: 'center center' });

    // 滚轮事件处理器
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();  // 阻止默认滚动行为
      e.stopPropagation(); // 阻止事件冒泡
      
      // 计算新的进度值（0-1 之间）
      // deltaY 正值 = 向下滚动（缩小），负值 = 向上滚动（放大）
      const delta = e.deltaY * 0.002;  // 调整灵敏度
      const newProgress = Math.max(0, Math.min(1, zoomProgressRef.current + delta));
      
      zoomProgressRef.current = newProgress;

      // 计算缩放值：2x ~ 1x（进度0=2x, 进度1=1x）
      const targetScale = 2 - newProgress;

      // 平滑过渡到新缩放值
      gsap.to(image, {
        scale: targetScale,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true
      });

      console.log('[Tech] 图片缩放进度:', (newProgress * 100).toFixed(1) + '%', '缩放:', targetScale.toFixed(2) + 'x');
    };

    // 添加滚轮事件监听（passive: false 允许 preventDefault）
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 清理函数
    return () => {
      console.log('[Tech] 清理可缩放图片事件监听器');
      container.removeEventListener('wheel', handleWheel);
      
      // 重置缩放进度
      zoomProgressRef.current = 0;
    };
  }, [activeProject]);

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
      {/* ========== 架构图全屏 Modal 弹窗 ========== */}
      {/* 点击背景或按 ESC 关闭，滚轮控制缩放 */}
      {isArchModalOpen && archModalImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fadeIn"
          onClick={closeArchModal}
        >
          {/* 顶部操作栏 */}
          <div className="absolute top-8 right-8 flex gap-8 items-center z-10">
            <span className="text-white/40 text-xs tracking-wider hidden md:block">
              SCROLL TO ZOOM
            </span>
            <button
              onClick={closeArchModal}
              className="text-xs font-bold tracking-widest text-white/60 hover:text-white transition-colors"
            >
              CLOSE
            </button>
          </div>

          {/* 图片容器（可缩放），点击任意位置关闭 */}
          <div 
            ref={archModalContainerRef}
            className="w-full h-full flex items-center justify-center p-12 overflow-visible cursor-pointer"
          >
            <img 
              ref={archModalImageRef}
              src={archModalImageUrl} 
              alt="Architecture Diagram"
              loading="eager"
              decoding="async"
              className="max-w-full max-h-full object-contain"
              style={{
                transformOrigin: 'center center',
                willChange: 'transform',
                filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))'
              }}
            />
          </div>
        </div>
      )}

      {activeProject && (
        <div className="absolute inset-0 z-30 bg-brand-black text-white flex flex-col md:flex-row animate-fadeIn w-full h-full">
        {/* Top Navigation Bar - 将 CLOSE 移到右上角，与 PREV / NEXT 并列 */}
        <div className="absolute top-0 left-0 right-0 p-8 md:p-12 flex justify-end items-start z-40">
          <div className="flex gap-8 md:gap-12 items-center">
            <button 
              onClick={handlePrev} 
              className="text-xs font-bold tracking-widest hover:text-brand-red transition-colors"
            >
              PREV
            </button>
            <button 
              onClick={handleNext} 
              className="text-xs font-bold tracking-widest hover:text-brand-red transition-colors"
            >
              NEXT
            </button>
            <button 
              onClick={handleClose} 
              className="text-xs font-bold tracking-widest hover:text-brand-red transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>

        {/* Left Content Column - 参考Story.tsx的布局风格 */}
        {/* 通过 detailScrollRef 控制滚动位置，确保每个项目详情初始时都从顶部开始展示 */}
        <div
          ref={detailScrollRef}
          className={`w-full md:w-1/2 h-full flex flex-col justify-start py-16 md:py-20 px-8 md:px-[4.5rem] relative bg-brand-black overflow-y-auto`}
        >
          
          {/* ========== 主要信息区 ========== */}
          
          {/* 大标题 - 增加底部间距，突出视觉层级 */}
          <h2 className="text-[12vw] md:text-[5rem] lg:text-[6rem] font-display font-bold leading-[1.1] mb-8 uppercase tracking-tighter text-brand-red">
            {activeProject.name}
          </h2>

          {/* 标签组 - 参考Story页面的标签样式 */}
          <div className="flex flex-wrap gap-3 text-xs font-bold tracking-widest mb-8">
            <span className="bg-brand-red text-black px-3 py-1">{activeProject.client}</span>
            <span className="bg-white/10 text-white px-3 py-1">{activeProject.year}</span>
            {activeProject.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="bg-white/10 text-white px-3 py-1">{tag}</span>
            ))}
          </div>

          {/* ========== 关于项目区 ========== */}
          <div className="space-y-4 max-w-lg mb-10">
            {/* About标题 - 参考Story的小标题风格 */}
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

          {/* ========== 链接区 - CTA按钮风格（参考Story） ========== */}
          {(() => {
            const links = activeProject.links;
            // 这些项目需要展示占位 CTA 按钮，但按钮不跳转
            const renderFakeButtons = shouldRenderFakeButtons;

            const hasAnyLink = !!(
              links?.github ||
              links?.live ||
              (links?.conference && !activeProject.paperSubmission)
            );

            if (!hasAnyLink && !renderFakeButtons) return null;

            return (
              <div className="flex flex-col gap-3 pt-4">
                {/* GitHub - 主要CTA按钮 */}
                {links?.github && (
                  <a 
                    href={links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between px-6 py-4 bg-brand-red text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-brand-red"
                  >
                    <span>View on GitHub</span>
                    <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                  </a>
                )}
                {!links?.github && renderFakeButtons && (
                  <button
                    type="button"
                    disabled
                    className="group flex items-center justify-between px-6 py-4 bg-brand-red text-white font-bold text-sm tracking-wider uppercase cursor-not-allowed"
                  >
                    <span>View on GitHub</span>
                    <span className="transform transition-transform">→</span>
                  </button>
                )}
                
                {/* Live Demo - 次要按钮 */}
                {links?.live && (
                  <a 
                    href={links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between px-6 py-4 bg-white/10 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-brand-black"
                  >
                    <span>See it Live</span>
                    <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                  </a>
                )}
                
                {/* Conference - 只在没有paper submission时显示 */}
                {links?.conference && !activeProject.paperSubmission && (
                  <a 
                    href={links.conference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between px-6 py-4 bg-white/10 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-brand-black"
                  >
                    <span>Conference</span>
                    <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                  </a>
                )}

                {!links?.live && renderFakeButtons && (
                  <button
                    type="button"
                    disabled
                    className="group flex items-center justify-between px-6 py-4 bg-white/10 text-white font-bold text-sm tracking-wider uppercase cursor-not-allowed"
                  >
                    <span>See it Live</span>
                    <span className="transform transition-transform">→</span>
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* Right Visual Column */}
        <div className="hidden md:flex w-1/2 h-full relative overflow-hidden flex-col items-center justify-center">
          {/* 
            容器大小保持与视频容器一致（max-w-5xl aspect-video）
            - qiesax: 可缩放图片（滚轮控制 1x~2x 缩放，放大时可超出容器）
            - boxofworld: 在容器内部可上下滚动浏览长图
            - 其他项目: 原有的 YouTube / 视频 / 图片逻辑
          */}
          <div className="w-full max-w-5xl mx-auto aspect-video flex items-center justify-center">
            {ZOOMABLE_IMAGE_PROJECTS[activeProject.id] ? (
              // ========== 可缩放图片容器 ==========
              // 滚轮控制缩放，放大时不限制容器大小（overflow-visible）
              <div 
                ref={zoomableContainerRef}
                className="w-full h-full overflow-visible flex items-center justify-center"
                style={{ boxSizing: 'border-box' }}
              >
                <img 
                  ref={zoomImageRef}
                  src={ZOOMABLE_IMAGE_PROJECTS[activeProject.id]} 
                  alt={activeProject.name}
                  loading="lazy"
                  decoding="async"
                  // 图片完整显示，居中对齐，保持宽高比
                  // 初始缩放为 2x，滚轮向下缩小到 1x
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transformOrigin: 'center center',
                    willChange: 'transform'
                  }}
                />
              </div>
            ) : SCROLLABLE_IMAGE_PROJECTS[activeProject.id] ? (
              // ========== 可滚动长图容器 ==========
              // 容器尺寸与视频容器一致，内部可上下滚动
              <div 
                className="w-full h-full overflow-y-auto overflow-x-hidden"
                style={{
                  boxSizing: 'border-box'
                }}
              >
                <img 
                  src={SCROLLABLE_IMAGE_PROJECTS[activeProject.id]} 
                  alt={activeProject.name}
                  loading="lazy"
                  decoding="async"
                  // 宽度 100% 适配容器，高度自适应（长图会超出容器高度，触发滚动）
                  className="w-full h-auto"
                />
              </div>
            ) : activeProject.youtubeUrl ? (
              // 使用 LazyYouTube 组件实现懒加载
              // 进入视口后才加载 YouTube iframe，节省带宽
              (() => {
                const videoId = extractYouTubeId(activeProject.youtubeUrl);
                if (!videoId) return null;
                return (
                  <LazyYouTube
                    videoId={videoId}
                    title={activeProject.name}
                    autoplay={true}
                    muted={true}
                    loop={true}
                    className="w-full h-full"
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
          
          {/* ========== 架构图按钮：视频下方，与视频等宽，左对齐，红色 GitHub 样式 ========== */}
          {activeProject.technicalDetails?.architectureImage && (
            <div className="w-full max-w-5xl mx-auto mt-4">
              <button
                onClick={() => openArchModal(activeProject.technicalDetails!.architectureImage!)}
                className="group flex items-center justify-between px-6 py-4 bg-brand-red text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-brand-black w-full"
              >
                <span>View Architecture</span>
                <span className="transform group-hover:translate-x-2 transition-transform">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default Tech;
