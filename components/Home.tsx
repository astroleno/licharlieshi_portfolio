import React, { useLayoutEffect, useRef, useContext } from 'react';
import { VelocityText } from './VelocityText';
import { TransitionContext } from '../App';

/**
 * Home 组件 - 首页展示
 * 
 * 布局说明：
 * - 上方 3/4 (75vh)：动画区域，包含背景图片、文字和前景图层
 * - 下方 1/4 (25vh)：详细文字介绍区域
 * - 整体固定在 100vh 内，页面完全不滚动
 * - 使用滚轮事件驱动动画，页面位置不变
 */
const Home: React.FC = () => {
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  // 动画进度 (0-1)
  const progressRef = useRef(0);
  // GSAP 时间线引用
  const timelineRef = useRef<any>(null);
  
  // 获取转场状态
  const { isTextVisible } = useContext(TransitionContext);

  useLayoutEffect(() => {
    const gsap = (window as any).gsap;
    const container = containerRef.current;

    if (!gsap || !container) return;

    console.log('[Home] 初始化滚轮驱动动画');

    try {
      // 创建时间线动画（不使用 ScrollTrigger，纯手动控制）
      const tl = gsap.timeline({ paused: true });

      // 动画序列：同时缩放背景图和前景树叶图层
      tl.to(".home-image", {
        scale: 2,                            // 前景图放大 2 倍
        z: 250,                              // Z轴位移，增强3D效果
        transformOrigin: "center center",
        ease: "none",                        // 线性，由滚轮控制缓动
        duration: 1
      }, 0)
      .to(".home-hero-section", {
        scale: 1.4,                          // 背景图放大 1.4 倍
        transformOrigin: "center center",
        ease: "none",
        duration: 1
      }, 0);                                 // 0 表示与第一个动画同时开始

      timelineRef.current = tl;
      console.log('[Home] 动画时间线创建成功');

    } catch (error) {
      console.error('[Home] 动画初始化失败:', error);
    }

    // 滚轮事件处理器
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();  // 阻止默认滚动行为
      
      const gsap = (window as any).gsap;
      const tl = timelineRef.current;
      if (!tl) return;

      // 计算新的进度值（0-1 之间）
      // deltaY 正值 = 向下滚动，负值 = 向上滚动
      const delta = e.deltaY * 0.001;  // 调整灵敏度
      const newProgress = Math.max(0, Math.min(1, progressRef.current + delta));
      
      progressRef.current = newProgress;

      // 平滑过渡到新进度
      gsap.to(tl, {
        progress: newProgress,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true
      });

      console.log('[Home] 动画进度:', (newProgress * 100).toFixed(1) + '%');
    };

    // 添加滚轮事件监听（passive: false 允许 preventDefault）
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 清理函数
    return () => {
      console.log('[Home] 清理事件监听器');
      container.removeEventListener('wheel', handleWheel);
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    // 外层容器：固定一屏高度，完全禁止滚动
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-hidden bg-brand-black text-white relative"
      style={{ perspective: '500px' }}  // 3D 透视效果
    >
      {/* 固定布局容器：整个页面布局 */}
      <div className="w-full h-screen flex flex-col">
        
        {/* ========== 上方 3/4：动画视觉区域 ========== */}
        <div className="relative w-full h-[75vh] overflow-hidden flex-shrink-0">
          {/* 第一层：背景图片 */}
          <div className="content relative w-full h-full z-0">
            <section 
              id="hero-home"
              className="home-hero-section w-full h-full bg-cover bg-center" 
              style={{ 
                backgroundImage: 'url(https://images.unsplash.com/photo-1512747646639-ed824d861e0d?q=80&w=2070&auto=format&fit=crop)' 
              }}
            />
          </div>

          {/* 第二层：中间文字层（夹在背景和前景之间） */}
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-10 pointer-events-none mix-blend-difference text-white">
            <div className="flex flex-col items-center">
                <VelocityText 
                    content="CREATION OF" 
                    visible={isTextVisible}
                    delay={0.2}
                    className="text-[8vw] md:text-[10vw] font-display font-bold uppercase tracking-tighter text-white"
                />
                
                <VelocityText 
                    content="SOMETHING SPECIAL" 
                    visible={isTextVisible}
                    delay={0.4}
                    className="text-[4vw] md:text-[6vw] font-display font-bold text-white uppercase tracking-tighter mt-[-2vw]"
                />
            </div>
          </div>

          {/* 第三层：前景悬浮图片（树叶/透明元素） */}
          <div className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none overflow-hidden flex items-center justify-center">
            <img 
              src="https://uploads-ssl.webflow.com/5cff83ac2044e22cb8cf2f11/5d13364599bb70e3560cc4e5_background-min%203.png" 
              alt="Floating Effect"
              loading="lazy"
              decoding="async"
              className="home-image w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ========== 下方 1/4：详细文字区域 ========== */}
        <div className="w-full h-[25vh] bg-brand-black flex-shrink-0 flex items-center justify-center px-8">
          <div className="max-w-4xl text-center flex flex-col items-center">
            
            {/* 小标题 */}
            <div className="mb-3 overflow-hidden">
                <VelocityText 
                    content="WELCOME TO THE WONDERLAND" 
                    visible={isTextVisible}
                    delay={0.6}
                    className="text-brand-red/80 font-display text-sm md:text-base uppercase tracking-[0.3em]"
                />
            </div>

            {/* 正文 - 拆分成两行以获得更好的动画效果，或者作为一个整体块淡入 */}
            <div className="text-white/60 text-base md:text-lg leading-relaxed font-light overflow-hidden flex flex-col items-center gap-1">
                <VelocityText 
                    content="In the shadowed depths of yon ancient keep," 
                    visible={isTextVisible}
                    delay={0.7}
                    mode="sync" // 正文句子不需要每个字母都错位，整句滑入更好读
                    className="text-white/60"
                />
                 <VelocityText 
                    content="lurketh secrets darker than the night." 
                    visible={isTextVisible}
                    delay={0.8}
                    mode="sync"
                    className="text-white/60"
                />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
