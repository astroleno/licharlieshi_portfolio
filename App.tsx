import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import Navigation from './components/Navigation';
import { VelocityText } from './components/VelocityText';
import Home from './components/Home';
import Work from './components/Work';
import About from './components/About';
import Contact from './components/Contact';
import { Section } from './types';

// Define transition stages for precise control
type TransitionStage = 'IDLE' | 'EXITING_TEXT' | 'EXPANDING' | 'SWITCHING' | 'SHRINKING' | 'ENTERING_TEXT';

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<Section>(Section.HOME);
  const [nextSection, setNextSection] = useState<Section | null>(null);
  const [displayLoader, setDisplayLoader] = useState(true);
  const [hasLoaderFinished, setHasLoaderFinished] = useState(false);
  
  // Transition State
  const overlayRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<TransitionStage>('IDLE');
  const fromRectRef = useRef<DOMRect | null>(null);
  
  // Control text visibility globally
  // true = Show Text (Enter/Idle)
  // false = Hide Text (Exit/Transitioning)
  const isTextVisible = hasLoaderFinished && (stage === 'IDLE' || stage === 'ENTERING_TEXT');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = window.setTimeout(() => {
      setDisplayLoader(false);
      setHasLoaderFinished(true);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  // Helper to get ID based on section
  const getHeroId = (section: Section) => {
    switch(section) {
      case Section.HOME: return 'hero-home';
      case Section.WORK: return 'hero-work';
      case Section.ABOUT: return 'hero-about';
      case Section.CONTACT: return 'hero-contact';
    }
  };

  /**
   * 专用于第四屏（CONTACT）的快门式转场（方案一：Shutter / Slice）。
   * 说明：
   * - 只在“去 CONTACT”或“从 CONTACT 离开”时触发
   * - 完全作用在 App 级别的 overlay 上，不修改 Contact 内部的滚动 / 变形逻辑
   * - 步骤：
   *   1）先让当前屏文字执行 EXITING_TEXT（600ms）
   *   2）创建若干竖向条带（shutter），从下往上合拢遮住旧画面
   *   3）合拢完成后切换 currentSection
   *   4）再让条带从上往下打开，露出新画面，同时触发 ENTERING_TEXT
   */
  const runContactShutterTransition = (targetSection: Section) => {
    try {
      const gsap = (window as any).gsap;
      const overlay = overlayRef.current;
      if (!gsap || !overlay) {
        console.warn('[App] CONTACT 快门转场无法初始化（gsap 或 overlay 不存在），直接跳转');
        setCurrentSection(targetSection);
        return;
      }

      console.log('[App] 启动 CONTACT 快门式转场到：', targetSection);

      // 1. 先触发文字退出阶段
      setStage('EXITING_TEXT');
      setNextSection(targetSection);

      // 等待文字退出动画（与 VelocityText 约定为 ~0.6s）
      setTimeout(() => {
        try {
          // 2. 准备 overlay 容器为全屏
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // 清空之前可能残留的子节点（防御性处理）
          overlay.innerHTML = '';

          gsap.set(overlay, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            zIndex: 100,
            display: 'block',
            opacity: 1,
            pointerEvents: 'none',
          });

          // 3. 创建竖向条带（shutter slices）
          const sliceCount = 7; // 7 条竖向条，数字可调
          const sliceWidth = viewportWidth / sliceCount;
          const slices: HTMLDivElement[] = [];

          for (let i = 0; i < sliceCount; i++) {
            const slice = document.createElement('div');
            slice.style.position = 'absolute';
            slice.style.left = `${i * sliceWidth}px`;
            slice.style.top = '0';
            slice.style.width = `${sliceWidth + 1}px`; // +1 避免像素缝隙
            slice.style.height = `${viewportHeight}px`;
            slice.style.backgroundColor = '#CE0000'; // 品牌红
            slice.style.transformOrigin = '50% 100%'; // 自下而上收拢
            slice.style.transform = 'scaleY(0)';
            slice.style.willChange = 'transform, opacity';
            overlay.appendChild(slice);
            slices.push(slice);
          }

          // 4. 条带合拢：旧画面被完全遮挡
          setStage('EXPANDING'); // 复用语义：遮挡阶段

          gsap.to(slices, {
            scaleY: 1,
            duration: 0.35,
            ease: 'power3.inOut',
            stagger: {
              // 交替方向的交错，增加节奏感
              each: 0.03,
              from: 'edges',
            },
            onComplete: () => {
              try {
                // 完全遮挡后，安全切换内容
                setCurrentSection(targetSection);

                // 5. 条带打开：露出新画面
                //   关键：先让新屏以 isTextVisible = false 挂载一帧，
                //   再在条带打开的 onStart 中切换到 ENTERING_TEXT，
                //   这样文字可以从“隐藏 → 显示”完整执行入场动画。
                gsap.to(slices, {
                  scaleY: 0,
                  transformOrigin: '50% 0%', // 自上而下打开
                  duration: 0.35,
                  ease: 'power3.inOut',
                  stagger: {
                    each: 0.03,
                    from: 'center',
                  },
                  onStart: () => {
                    // 允许新屏文字开始进场
                    setStage('ENTERING_TEXT');
                  },
                  onComplete: () => {
                    // 6. 清理 overlay，回到空闲状态
                    console.log('[App] CONTACT 快门式转场结束');
                    overlay.innerHTML = '';
                    gsap.set(overlay, { display: 'none', opacity: 0 });
                    setStage('IDLE');
                    setNextSection(null);
                    fromRectRef.current = null;
                  },
                });
              } catch (innerError) {
                console.error('[App] CONTACT 快门式转场（打开阶段）出错', innerError);
              }
            },
          });
        } catch (errorInner) {
          console.error('[App] CONTACT 快门式转场初始化出错', errorInner);
          // 发生异常时回退为直接切屏，避免死锁
          setCurrentSection(targetSection);
          setStage('IDLE');
          setNextSection(null);
          fromRectRef.current = null;
        }
      }, 600); // 与 VelocityText EXIT 时间对齐
    } catch (errorOuter) {
      console.error('[App] CONTACT 快门式转场外部异常', errorOuter);
      setCurrentSection(targetSection);
      setStage('IDLE');
      setNextSection(null);
      fromRectRef.current = null;
    }
  };

  const handleNavigate = (targetSection: Section) => {
    if (targetSection === currentSection || stage !== 'IDLE') return;

    // ========== 特殊处理：第四屏 CONTACT 使用快门式转场 ==========
    if (targetSection === Section.CONTACT || currentSection === Section.CONTACT) {
      runContactShutterTransition(targetSection);
      return;
    }

    const hasGsap = typeof window !== 'undefined' && Boolean((window as any).gsap);
    if (!hasGsap) {
      console.warn('[App] GSAP 尚未加载，使用直接切换避免界面被锁定');
      setCurrentSection(targetSection);
      setStage('IDLE');
      setNextSection(null);
      fromRectRef.current = null;
      return;
    }

    // STEP 1: Start Exit Animation
    setNextSection(targetSection);
    setStage('EXITING_TEXT');
    
    // Wait for text to exit (0.6s) before expanding overlay
    setTimeout(() => {
        const currentHeroId = getHeroId(currentSection);
        const currentEl = document.getElementById(currentHeroId);
        
        if (currentEl) {
          fromRectRef.current = currentEl.getBoundingClientRect();
          setStage('EXPANDING');
        } else {
          setCurrentSection(targetSection);
          setStage('ENTERING_TEXT');
          // Wait for enter animation
          setTimeout(() => setStage('IDLE'), 1000); 
        }
    }, 600);
  };

  // EFFECT 1: Handle Expansion (Step 2 & 3)
  useLayoutEffect(() => {
    if (stage === 'EXPANDING' && fromRectRef.current && overlayRef.current && nextSection) {
      const gsap = (window as any).gsap;
      if (!gsap) {
        console.warn('[App] GSAP 不可用，跳过矩形扩展动画');
        setCurrentSection(nextSection);
        setStage('IDLE');
        setNextSection(null);
        fromRectRef.current = null;
        return;
      }
      const overlay = overlayRef.current;

      // Reset overlay to start position
      gsap.set(overlay, {
        position: 'fixed',
        top: fromRectRef.current.top,
        left: fromRectRef.current.left,
        width: fromRectRef.current.width,
        height: fromRectRef.current.height,
        backgroundColor: '#CE0000', // Brand Red
        zIndex: 100,
        display: 'block',
        opacity: 1,
        borderRadius: '0px'
      });

      // Animate to Full Screen
      gsap.to(overlay, {
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          // Once full screen, trigger the content switch
          setCurrentSection(nextSection);
          setStage('SWITCHING');
        }
      });
    }
  }, [stage, nextSection]);

  // EFFECT 2: Handle Shrinking (Step 4 & 5)
  // This runs after currentSection has updated and the new DOM is ready
  useLayoutEffect(() => {
    if (stage === 'SWITCHING' && overlayRef.current) {
      const gsap = (window as any).gsap;
      if (!gsap) {
        console.warn('[App] GSAP 不可用，直接完成切换');
        setStage('IDLE');
        setNextSection(null);
        fromRectRef.current = null;
        return;
      }
      const overlay = overlayRef.current;
      
      // We need a small delay to ensure the new component is fully mounted and reflowed
      requestAnimationFrame(() => {
        const targetId = getHeroId(currentSection);
        const targetEl = document.getElementById(targetId);

        if (targetEl) {
          // === 特殊处理：第三屏 About 不做矩形收缩，只做淡出，让字本身承担转场 ===
          if (currentSection === Section.ABOUT) {
            setStage('SHRINKING');

            gsap.to(overlay, {
              opacity: 0,
              duration: 0.6,
              ease: "power2.out",
              onStart: () => {
                // About 使用 VelocityText 的 zoom 模式来完成“全屏字 -> 正常字”的转场
                setStage('ENTERING_TEXT');
              },
              onComplete: () => {
                gsap.set(overlay, { display: 'none', opacity: 0 });
                setStage('IDLE');
                setNextSection(null);
                fromRectRef.current = null;
              }
            });
          } else {
            // 其它页面仍然使用矩形缩放到目标容器的效果
            const toRect = targetEl.getBoundingClientRect();
            
            setStage('SHRINKING');

            gsap.to(overlay, {
              top: toRect.top,
              left: toRect.left,
              width: toRect.width,
              height: toRect.height,
              duration: 0.8,
              ease: "power4.out",
              onStart: () => {
                // 短暂延迟后触发文字进场，让文字和幕布动作更贴合
                setTimeout(() => {
                  setStage('ENTERING_TEXT');
                }, 100);
              },
              onComplete: () => {
                // Cleanup
                gsap.set(overlay, { display: 'none', opacity: 0 });
                
                // 等待文字动画结束再回到 IDLE
                setTimeout(() => {
                    setStage('IDLE');
                    setNextSection(null);
                    fromRectRef.current = null;
                }, 800);
              }
            });
          }
        } else {
          // Fallback
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              gsap.set(overlay, { display: 'none' });
              setStage('IDLE');
              setNextSection(null);
            }
          });
        }
      });
    }
  }, [stage, currentSection]);

  return (
    <div className="flex w-full h-screen bg-brand-black text-white font-sans overflow-hidden relative">
      {/* 
        Unified Transition Overlay 
        Starts as red block matching 'from' element -> Full Screen -> Shrinks to 'to' element
      */}
      <div 
        ref={overlayRef}
        className="hidden pointer-events-none fixed bg-brand-red z-[100]"
      />

      {/* Navigation Sidebar */}
      <Navigation currentSection={currentSection} onNavigate={handleNavigate} />

      {/* Main Content Area - Pass visible state to children */}
      <main className="flex-1 ml-12 md:ml-16 h-full relative overflow-hidden">
        {/* We clone the element to pass props, or use Context if it gets complex. 
            For now, let's pass it explicitly if possible, or use a Context.
            Actually, let's use a simple React Context to share visibility state.
        */}
        <TransitionContext.Provider value={{ isTextVisible }}>
            {currentSection === Section.HOME && <Home />}
            {currentSection === Section.WORK && <Work />}
            {currentSection === Section.ABOUT && <About />}
            {currentSection === Section.CONTACT && <Contact />}
        </TransitionContext.Provider>
      </main>

      {displayLoader && (
        <div className="loading-overlay">
          <div className="loader-box" aria-label="Loading interface" />
        </div>
      )}
    </div>
  );
};

// Create a simple context for children to know if they should show text
export const TransitionContext = React.createContext({ isTextVisible: true });
export const useTransitionContext = () => React.useContext(TransitionContext);

export default App;
