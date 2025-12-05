import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { PROJECTS } from '../constants';
import { Project } from '../types';
import { TransitionContext } from '../App';

const SCROLL_REPEAT_COUNT = 12;

const Work: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Transition context to control visibility
  const { isTextVisible } = useContext(TransitionContext);

  // State to track the last valid video URL for the right side
  const [lastActiveVideoUrl, setLastActiveVideoUrl] = useState<string | undefined>(undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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
    const container = scrollContainerRef.current;
    const contentEl = listRef.current;
    if (!container || !contentEl) return;

    let currentSkew = 0;
    let lastTime = performance.now();
    const virtualOffsetRef = { current: 0 };
    const totalHeightRef = { current: contentEl.scrollHeight };
    const anchorRef = { current: 0 };
    let isSyncing = false;

    const wrapOffset = (value: number) => {
      const total = totalHeightRef.current;
      if (total <= 0) return 0;
      let result = value % total;
      if (result < 0) result += total;
      return result;
    };

    const applyTransform = () => {
      if (!listRef.current) return;
      const translate = -virtualOffsetRef.current;
      listRef.current.style.transform = `translateY(${translate}px) skewY(${currentSkew}deg)`;
    };

    const updateMeasurements = () => {
      totalHeightRef.current = contentEl.scrollHeight;
      virtualOffsetRef.current = wrapOffset(virtualOffsetRef.current);
      const maxScroll = Math.max(container.scrollHeight - container.clientHeight, 0);
      anchorRef.current = maxScroll / 2;
      isSyncing = true;
      container.scrollTop = anchorRef.current;
      requestAnimationFrame(() => { isSyncing = false; });
    };

    updateMeasurements();
    virtualOffsetRef.current = wrapOffset(totalHeightRef.current / 2);
    applyTransform();

    const handleScroll = () => {
      if (isSyncing) return;
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;

      const delta = container.scrollTop - anchorRef.current;
      if (delta === 0) return;

      virtualOffsetRef.current = wrapOffset(virtualOffsetRef.current + delta);
      applyTransform();

      const rawVelocity = dt > 0 ? delta / dt : 0;
      const targetSkew = Math.max(Math.min(rawVelocity * 50, 8), -8);
      currentSkew += (targetSkew - currentSkew) * 0.1;
      if (Math.abs(currentSkew) < 0.1) currentSkew = 0;
      applyTransform();

      isSyncing = true;
      container.scrollTop = anchorRef.current;
      requestAnimationFrame(() => { isSyncing = false; });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    let animationId: number;
    const decaySkew = () => {
      if (Math.abs(currentSkew) > 0.05) {
        currentSkew *= 0.92;
        if (Math.abs(currentSkew) < 0.05) currentSkew = 0;
        applyTransform();
      }
      animationId = requestAnimationFrame(decaySkew);
    };
    animationId = requestAnimationFrame(decaySkew);

    const resizeObserver = new ResizeObserver(() => {
      updateMeasurements();
      applyTransform();
    });
    resizeObserver.observe(container);
    resizeObserver.observe(contentEl);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  const handleProjectClick = (project: Project) => {
    setActiveProject(project);
  };

  const handleClose = () => {
    setActiveProject(null);
  };

  const handleNext = () => {
    if (!activeProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === activeProject.id);
    const nextIndex = (currentIndex + 1) % PROJECTS.length;
    setActiveProject(PROJECTS[nextIndex]);
  };

  const handlePrev = () => {
    if (!activeProject) return;
    const currentIndex = PROJECTS.findIndex(p => p.id === activeProject.id);
    const prevIndex = (currentIndex - 1 + PROJECTS.length) % PROJECTS.length;
    setActiveProject(PROJECTS[prevIndex]);
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

  // Main interface always renders (including hero-work)
  // Detail appears as overlay when activeProject is set
  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-brand-black relative overflow-hidden">
      {/* Left List */}
      <div 
        ref={scrollContainerRef}
        className="w-full md:w-1/2 h-full overflow-y-auto pt-24 pb-12 px-6 md:px-12 flex flex-col justify-center z-20 no-scrollbar"
        style={{ scrollBehavior: 'auto' }}
      >
        <ul ref={listRef} className="space-y-2 transition-all duration-100 ease-linear">
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
      <div id="hero-work" className="hidden md:block w-1/2 h-full bg-brand-black relative transition-all duration-500 ease-in-out overflow-hidden">
         {/* Video Player */}
         {currentRightVideoUrl && (
             <video
                key={currentRightVideoUrl}
                src={currentRightVideoUrl}
                autoPlay
                loop
                muted
                playsInline
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

        {/* Left Content Column */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-20 relative bg-brand-black">
          {/* Meta Info */}
          <div className="flex flex-col gap-1 mb-2">
            <span className="text-xs font-mono text-gray-400">{activeProject.year}</span>
            <span className="text-xs font-mono text-white tracking-wider uppercase">{activeProject.client}</span>
          </div>

          {/* Title */}
          <h2 className="text-[15vw] md:text-[8rem] font-display font-bold leading-[0.85] mb-8 uppercase text-white tracking-tighter">
            {activeProject.name}
          </h2>

          {/* Description */}
          <p className="text-xs md:text-sm font-bold leading-relaxed max-w-md mb-12 uppercase text-gray-300 tracking-wide">
            {activeProject.description}
          </p>

          {/* Stack */}
          <div className="mb-16">
             <span className="text-[10px] text-gray-500 block mb-2 tracking-widest">STACK :</span>
             <div className="text-base md:text-xl font-bold uppercase tracking-wide">
               {activeProject.tags.join(' / ')}
             </div>
          </div>

          {/* CTA */}
          <button className="group flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-brand-red transition-colors">
            See it live
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Right Visual Column */}
        <div className="hidden md:flex w-1/2 h-full relative overflow-hidden items-center justify-center">
          <div className="w-full max-w-5xl mx-auto aspect-video flex items-center justify-center">
            {activeProject.youtubeUrl ? (
              <iframe
                src={`${activeProject.youtubeUrl}?autoplay=1&mute=1&loop=1&playlist=SbW4J_I4MYo`}
                title={activeProject.name}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : activeProject.videoUrl ? (
              <video 
                src={activeProject.videoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={activeProject.imageUrl} 
                alt={activeProject.name}
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

export default Work;
