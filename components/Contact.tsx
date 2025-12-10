import React, { useLayoutEffect, useRef, useContext, useEffect, useState } from 'react';
import { TransitionContext } from '../App';
import { VelocityText } from './VelocityText';

/**
 * Contact 组件
 * 
 * 功能说明：
 * - 展示联系方式页面
 * - 使用 SVG mask 实现文字镂空效果
 * - 滚轮驱动动画：容器变形 + mask 展开
 * 
 * 动画初始化策略：
 * - 延迟初始化，等待转场动画完成后再计算尺寸
 * - 避免在快门转场期间读取不稳定的 DOM 尺寸
 */
const Contact: React.FC = () => {
  const { isTextVisible } = useContext(TransitionContext);
  
  // 标记动画是否已初始化
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  // 标记 mask / wrapper 是否已完成首帧渲染，避免未就绪时露出红底
  const [isWrapperVisible, setIsWrapperVisible] = useState(false);
  
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
  
  // 初始化延迟定时器
  const initTimerRef = useRef<number | null>(null);

  // 组合可见性：只有在首帧安全 + 动画初始化完成后才展示
  const shouldShowWrapper = isWrapperVisible && isAnimationReady;

  // 预置 wrapper 背景色：未就绪时强制黑底，避免品牌红提前露出
  const wrapperBgColor = shouldShowWrapper ? '#CE0000' : '#000000';

  /**
   * 延迟初始化动画
   * 
   * 原因：
   * - 从 Game 页面切换过来时，会触发快门转场动画
   * - 快门转场期间 Contact 组件已挂载，但 DOM 尺寸可能不稳定
   * - 延迟 100-200ms 等待转场完成后再初始化，确保尺寸计算准确
   */
  useEffect(() => {
    // 延迟设置动画就绪状态
    initTimerRef.current = window.setTimeout(() => {
      setIsAnimationReady(true);
      console.log('[Contact] 动画初始化延迟完成，开始设置动画');
    }, 150); // 150ms 延迟，等待快门转场基本完成
    
    return () => {
      if (initTimerRef.current) {
        window.clearTimeout(initTimerRef.current);
      }
    };
  }, []);

  /**
   * 首帧安全可见性控制
   * 
   * 背景：从 Game 首次切换到 Contact 时，主线程与 GPU 负载较高，
   * SVG mask 可能在首帧还未完全生效，导致红色背景短暂暴露。
   * 方案：等待 DOM 挂载后通过双层 rAF 再打开可见性，确保 mask 已经可用。
   */
  useEffect(() => {
    let raf1: number | null = null;
    let raf2: number | null = null;

    const enableVisibility = () => {
      // 只有在 mask / 文本 / 容器均已挂载后才允许显示
      if (!wrapperRef.current || !textRef.current || !maskRectRef.current) return;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setIsWrapperVisible(true);
        });
      });
    };

    enableVisibility();

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  useLayoutEffect(() => {
    // 等待动画就绪标记
    if (!isAnimationReady) return;
    
    if (typeof window === 'undefined') return;

    const textEl = textRef.current;
    const wrapperEl = wrapperRef.current;

    if (!textEl || !wrapperEl) return;
    
    console.log('[Contact] 开始初始化动画，当前 wrapper 尺寸:', 
      wrapperEl.offsetWidth, 'x', wrapperEl.offsetHeight);

    // 计算固定的字体大小（基于视口，不随滚动变化）
    const computeFixedFontSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 初始状态：wrapper 高度是 80vh
      const initialHeight = viewportHeight * 0.80;
      
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
      
      // 初始状态：wrapper 宽度 = min(90vw, 110vh)，高度 = 80vh
      const maxWidth = Math.min(viewportWidth * 0.9, viewportHeight * 1.1);
      const initialHeight = viewportHeight * 0.80;
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

    // A. 容器变形：80vh 全屏 -> 16:9 -> 正方形
    // 初始高度使用 80vh 确保文字中心始终在 40vh（从顶部）= 60vh（从底部）
    tl.fromTo(wrapperRef.current, 
      { 
        width: "100%", 
        height: "80vh", // 使用明确的 80vh 而非 100%
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

    // C. Mask 展开：使用 attr 动画避免 SVG transform 坐标系问题
    tl.fromTo(maskRectRef.current,
      { 
        attr: { x: 0.5, y: 0.5, width: 0, height: 0 } // 从中心收拢
      },
      { 
        attr: { x: 0, y: 0, width: 1, height: 1 },     // 展开覆盖整个 0-1 区域
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
  }, [isAnimationReady]); // 依赖 isAnimationReady，延迟后才初始化

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
            {/* 整体中心在 y=0.5（对应 wrapper 中心 = 页面顶部 40vh）*/}
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
              <tspan x="0.5" dy="-0.6em">CONTACT</tspan>
              <tspan x="0.5" dy="1.2em">NOW</tspan>
            </text>
            {/* 
              maskRect 用于滚轮动画展开效果
              重要：初始 transform: scale(0) 确保在 GSAP 接管之前不显示
              这解决了从 Game 页面切换过来时的红色方块闪烁问题
            */}
            <rect 
              ref={maskRectRef}
              x="0.5" 
              y="0.5" 
              width="0" 
              height="0" 
              fill="white"
              // 初始为点状，等待 GSAP attr 动画展开，避免 transform 坐标系偏移
            />
          </mask>
        </defs>
      </svg>

      {/* TOP SECTION (80%) - 使用绝对定位确保 wrapper 中心始终在 40vh */}
      <div className="w-full h-[80vh] relative overflow-hidden z-10 px-6 md:px-0">
        {/* 
          Wrapper - 使用绝对定位 + transform 确保中心点位置固定
          
          重要：在 isAnimationReady 为 false 时设置 opacity: 0
          这解决了从 Game 页面第一次切换过来时的红色方块闪烁问题
          原因：Game 页面的 iframe/Unity 占用大量资源，导致 Contact 首次渲染时
          SVG mask 可能还没完全初始化，红色背景会暴露出来
        */}
        <div 
          id="hero-contact"
          ref={wrapperRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-2xl"
          style={{
            width: '100%',
            height: '80vh', // 初始高度填满 80vh
            maskImage: 'url(#meet-mask)',
            WebkitMaskImage: 'url(#meet-mask)',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maxWidth: 'min(90vw, 110vh)',
            // 未就绪时强制黑底，遮挡品牌红，防止首帧红块
            backgroundColor: wrapperBgColor,
            // 关键修复：动画就绪前隐藏 wrapper，避免红色背景闪烁
            visibility: isWrapperVisible ? 'visible' : 'hidden',
            opacity: shouldShowWrapper ? 1 : 0,
            transition: 'opacity 0.2s ease-out'
          }}
        >
          <video 
            ref={videoRef}
            className="w-full h-full object-cover transform scale-105"
            autoPlay 
            muted 
            // loop
            playsInline // 只播放一次
            src="/contact.webm"
          />
          <div className="absolute inset-0 bg-brand-black -z-10" />
        </div>
      </div>

      {/* BOTTOM SECTION (20%) */}
      <div className="w-full h-[20vh] relative flex items-center justify-center bg-brand-black z-20">
         
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