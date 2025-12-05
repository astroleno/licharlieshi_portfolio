import React, { useLayoutEffect, useRef, useContext } from 'react';
import { TransitionContext } from '../App';
import { VelocityText } from './VelocityText';

const Contact: React.FC = () => {
  const { isTextVisible } = useContext(TransitionContext);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const maskRectRef = useRef<SVGRectElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  // 动画状态
  const progressRef = useRef(0);
  const timelineRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const textEl = textRef.current;
    const wrapperEl = wrapperRef.current;

    if (!textEl || !wrapperEl) return;

    // 计算固定的字体大小（基于视口，不随滚动变化）
    const computeFixedFontSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 初始状态：wrapper 高度是 75vh
      const initialHeight = viewportHeight * 0.75;
      
      // 目标字体大小（像素）
      const ratio = viewportWidth >= 768 ? 0.10 : 0.08;
      const targetFontPx = viewportWidth * ratio;
      
      // 转换为 objectBoundingBox 坐标（0-1 范围）
      // 使用初始高度作为基准，这样字体大小不会随滚动变化
      const normalizedSize = targetFontPx / initialHeight;
      
      return normalizedSize;
    };

    // 计算固定的宽高比补偿（基于初始状态）
    const computeFixedAspectScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 初始状态：wrapper 宽度 = min(90vw, 110vh)，高度 = 75vh
      const maxWidth = Math.min(viewportWidth * 0.9, viewportHeight * 1.1);
      const initialHeight = viewportHeight * 0.75;
      const initialWidth = Math.min(viewportWidth, maxWidth);
      
      const aspect = initialWidth / initialHeight;
      return 1 / aspect;
    };

    // 设置固定的文字样式（只在初始化和 resize 时调用）
    const setupTextStyle = () => {
      const fontSize = computeFixedFontSize();
      const scale = computeFixedAspectScale();
      
      // text 元素应用 font-size 和 transform
      textEl.setAttribute('font-size', fontSize.toString());
      textEl.setAttribute('transform', `translate(0.5 0.5) scale(${scale} 1) translate(-0.5 -0.5)`);
      
      console.log('[Contact] Text setup - fontSize:', fontSize.toFixed(4), 'scale:', scale.toFixed(4));
    };

    // 初始化文字样式
    setupTextStyle();

    // 只在窗口 resize 时更新文字样式
    window.addEventListener('resize', setupTextStyle);

    // --- GSAP Animation Setup ---
    const gsap = (window as any).gsap;
    if (!gsap || !containerRef.current) return;

    const computeTargetDimensions = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const widthLimit = viewportWidth * 0.9;

      let rectHeight = viewportHeight * 0.4; // 40vh 目标
      let rectWidth = rectHeight * (16 / 9);

      if (rectWidth > widthLimit) {
        rectWidth = widthLimit;
        rectHeight = rectWidth * (9 / 16);
      }

      const squareLimit = Math.min(viewportWidth * 0.9, viewportHeight * 0.6); // 60vh 目标
      let squareSize = squareLimit;

      if (squareSize < rectHeight) {
        squareSize = rectHeight;
      }

      return {
        rectWidth: `${rectWidth}px`,
        rectHeight: `${rectHeight}px`,
        squareSize: `${squareSize}px`
      };
    };

    const target = computeTargetDimensions();
    
    // 创建 timeline（移除 onUpdate，文字样式保持固定不变）
    const tl = gsap.timeline({ 
      paused: true
      // 注意：不再使用 onUpdate，这样文字在滚动时不会变化
    });

    // A. 容器变形：75vh 全屏 -> 16:9 -> 正方形
    // 初始高度使用 75vh 确保文字中心始终在 37.5vh（从顶部）= 62.5vh（从底部）
    tl.fromTo(wrapperRef.current, 
      { 
        width: "100%", 
        height: "75vh", // 使用明确的 75vh 而非 100%
        borderRadius: "0px" 
      },
      { 
        width: target.rectWidth,
        height: target.rectHeight,
        borderRadius: "20px", 
        ease: "power2.inOut", 
        duration: 0.8 
      },
      0
    );

    tl.to(wrapperRef.current, {
      width: target.squareSize,
      height: target.squareSize,
      borderRadius: "32px",
      ease: "power2.out",
      duration: 0.5
    });

    // C. Mask 展开
    tl.fromTo(maskRectRef.current,
      { 
        scale: 0, 
        transformOrigin: "center center" 
      },
      { 
        scale: 1, 
        ease: "power2.inOut", 
        duration: 0.8 
      },
      0
    );

    // Removed opacity fade for text to prevent "change" during scroll

    // D. 社媒浮现
    if (socialRef.current) {
      tl.fromTo(socialRef.current,
        { 
          y: 20, 
          opacity: 0, 
          autoAlpha: 0 
        },
        { 
          y: 0, 
          opacity: 1, 
          autoAlpha: 1, 
          ease: "power2.out", 
          duration: 0.5 
        },
        0.5
      );
    }

    // E. Hint 消失
    if (hintRef.current) {
      hintRef.current.classList.remove('animate-pulse');
      
      tl.fromTo(hintRef.current, 
        { opacity: 1 }, 
        { 
          opacity: 0, 
          duration: 0.15, 
          ease: "power1.out" 
        }, 
        0
      );
    }

    timelineRef.current = tl;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); 
      const delta = e.deltaY * (0.001 / 1.5); // slow down progress to 1.5x of previous travel
      const newProgress = Math.max(0, Math.min(1, progressRef.current + delta));
      progressRef.current = newProgress;

      gsap.to(tl, {
        progress: newProgress,
        duration: 0.5,
        ease: "power2.out",
        overwrite: true
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('resize', setupTextStyle);
      if (container) container.removeEventListener('wheel', handleWheel);
      tl.kill();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-brand-black overflow-hidden relative flex flex-col"
    >
      
      {/* SVG Defs */}
      <svg className="absolute w-0 h-0">
        <defs>
          <mask id="meet-mask" maskContentUnits="objectBoundingBox">
            <rect x="0" y="0" width="1" height="1" fill="black" />
            {/* 单个 text 元素 + tspan，最可靠的方式 */}
            {/* 整体中心在 y=0.5（对应 wrapper 中心 = 页面顶部 37.5vh）*/}
            <text 
              ref={textRef}
              x="0.5" 
              y="0.5" 
              fill="white" 
              textAnchor="middle" 
              dominantBaseline="middle"
              fontWeight="900"
              style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '-0.02em' }}
            >
              <tspan x="0.5" dy="-0.6em">LISTEN</tspan>
              <tspan x="0.5" dy="1.2em">NOW</tspan>
            </text>
            <rect 
              ref={maskRectRef}
              x="0" 
              y="0" 
              width="1" 
              height="1" 
              fill="white" 
            />
          </mask>
        </defs>
      </svg>

      {/* TOP SECTION (75%) - 使用绝对定位确保 wrapper 中心始终在 37.5vh */}
      <div className="w-full h-[75vh] relative overflow-hidden z-10 px-6 md:px-0">
        {/* Wrapper - 使用绝对定位 + transform 确保中心点位置固定 */}
        <div 
          id="hero-contact"
          ref={wrapperRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-brand-red shadow-2xl"
          style={{
            width: '100%',
            height: '75vh', // 初始高度填满 75vh
            maskImage: 'url(#meet-mask)',
            WebkitMaskImage: 'url(#meet-mask)',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maxWidth: 'min(90vw, 110vh)'
          }}
        >
          <video 
            ref={videoRef}
            className="w-full h-full object-cover transform scale-105"
            autoPlay 
            muted 
            loop 
            playsInline
            src="/a.webm"
          />
          <div className="absolute inset-0 bg-brand-black -z-10" />
        </div>
      </div>

      {/* BOTTOM SECTION (25%) */}
      <div className="w-full h-[25vh] relative flex items-center justify-center bg-brand-black z-20">
         
         <div 
           ref={hintRef}
           className="absolute text-white/50 text-xs tracking-[0.3em] font-bold pointer-events-none"
         >
           SCROLL TO UNVEIL
         </div>

         <div 
           ref={socialRef}
           className="absolute flex items-center gap-8 md:gap-16 opacity-0"
         >
           <a href="mailto:hello@example.com" className="group relative">
              <span className="text-white text-sm md:text-xl font-bold tracking-[0.2em] uppercase font-sans hover:text-brand-red transition-colors duration-300">
                Mail
              </span>
           </a>
           <a href="#" className="group relative">
              <span className="text-white text-sm md:text-xl font-bold tracking-[0.2em] uppercase font-sans hover:text-brand-red transition-colors duration-300">
                Lnkd
              </span>
           </a>
           <a href="#" className="group relative">
              <span className="text-white text-sm md:text-xl font-bold tracking-[0.2em] uppercase font-sans hover:text-brand-red transition-colors duration-300">
                Insta
              </span>
           </a>
         </div>

      </div>

    </div>
  );
};

export default Contact;