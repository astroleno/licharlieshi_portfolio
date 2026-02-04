/**
 * App.tsx
 * 
 * 主应用组件
 * 
 * 功能说明：
 * - 管理页面导航和转场动画
 * - 实现首屏资源预加载，Loading 动画期间加载关键图片和视频
 * - 使用 React.lazy 实现组件懒加载，减少首屏 JS 包大小
 * - 提供 TransitionContext 共享文字显隐状态
 * 
 * 预加载策略（优化版）：
 * - Loading 阶段（2.5秒）：
 *   1. Home 图片（back0/back2/front.webp）
 *   2. Tech 关键视频（pangu.webm）完整预加载
 *   3. Tech JS chunk 提前下载
 * - 首屏完成后 1 秒：预加载 Music/Story/Contact JS chunk
 * - 首屏完成后 2 秒：预加载其他视频 metadata
 * 
 * 懒加载策略：
 * - Home: 首屏组件，同步加载
 * - Tech: 懒加载，但 JS chunk 在 Loading 期间已预加载
 * - Music/Story/Contact: 懒加载，首屏完成后空闲预加载
 * 
 * 转场动画：
 * - 普通页面：红色矩形扩展/收缩动画
 * - Contact 页面：快门式（Shutter）转场效果
 */

import React, { useState, useRef, useLayoutEffect, useEffect, Suspense } from 'react';
import Navigation from './components/Navigation';
import { VelocityText } from './components/VelocityText';
import Home from './components/Home';  // 首屏组件同步加载
import { Section } from './types';
import { usePreloadResources, CRITICAL_RESOURCES } from './hooks/usePreloadResources';
import { useIdlePreload } from './hooks/useIdlePreload';
import { useResourcePreload } from './hooks/useResourcePreload';

// ============================================
// 懒加载组件配置
// ============================================
// 非首屏组件使用 React.lazy 动态导入
// 这样首屏只需加载 Home 组件的代码，其他组件在导航时按需加载

/** Tech 页面 - 技术作品展示 */
const Tech = React.lazy(() => import('./components/Tech'));

/** Music 页面 - 音乐作品展示 */
const Music = React.lazy(() => import('./components/Music'));

/** Story 页面 - 故事作品展示（含 Unity WebGL） */
const Story = React.lazy(() => import('./components/Story'));

/** Contact 页面 - 联系方式 */
const Contact = React.lazy(() => import('./components/Contact'));

// ============================================
// 类型定义
// ============================================

/** 转场动画阶段枚举 */
type TransitionStage = 
  | 'IDLE'          // 空闲状态
  | 'EXITING_TEXT'  // 文字退出动画中
  | 'EXPANDING'     // 红色遮罩扩展中
  | 'SWITCHING'     // 切换内容中
  | 'SHRINKING'     // 红色遮罩收缩中
  | 'ENTERING_TEXT'; // 文字进入动画中

// ============================================
// 主组件
// ============================================

const App: React.FC = () => {
  // ========== 页面状态 ==========
  const [currentSection, setCurrentSection] = useState<Section>(Section.HOME);
  const [nextSection, setNextSection] = useState<Section | null>(null);
  
  // ========== Loading 状态 ==========
  // 使用预加载 Hook，等待首屏关键资源加载完成
  // 同时预加载 Home 图片 + Tech 关键视频，用户切换时能秒开
  const { isLoaded: resourcesLoaded, progress } = usePreloadResources({
    images: CRITICAL_RESOURCES.images,
    videos: CRITICAL_RESOURCES.videos,  // Tech 页面关键视频
    timeout: 12000,      // 12 秒超时（视频需要更多时间）
    minDisplayTime: 2500 // 最少显示 2.5 秒，确保 Loading 动画流畅 + 预加载完成
  });
  
  // ========== 立即预加载 Tech JS chunk ==========
  // 在 Loading 期间就开始下载 Tech 组件的代码
  // 这样用户切换到 Tech 时无需等待 JS 加载
  useEffect(() => {
    // 立即触发 Tech 组件的动态 import（不等首屏完成）
    import('./components/Tech').then(() => {
      console.log('[App] Tech 组件 JS chunk 预加载完成');
    }).catch(err => {
      console.warn('[App] Tech 组件 JS chunk 预加载失败:', err);
    });
  }, []);
  
  // Loading 显示状态：资源未加载完成时显示
  const displayLoader = !resourcesLoaded;
  // Loading 完成标记：用于控制文字动画
  const hasLoaderFinished = resourcesLoaded;
  
  // ========== 空闲预加载 ==========
  // 首屏加载完成后，在浏览器空闲时预加载其他页面的 JS chunk
  // 注意：Tech 已在 Loading 期间预加载，这里主要加载 Music/Story/Contact
  useIdlePreload({
    enabled: hasLoaderFinished,  // 首屏加载完成后启用
    delay: 1000                   // 延迟 1 秒（Tech 已预加载，可以更快开始其他页面）
  });
  
  // ========== 静态资源预加载 ==========
  // 在 JS chunk 预加载完成后，继续预加载 public 文件夹中的静态资源
  // 图片：完整预加载 | 视频：只预加载 metadata
  // 注意：pangu.webm 已在 Loading 阶段完整预加载，这里主要是其他资源
  useResourcePreload({
    enabled: hasLoaderFinished,  // 首屏加载完成后启用
    delay: 2000                   // 延迟 2 秒（关键资源已预加载，可以更快开始）
  });
  
  // ========== 转场状态 ==========
  const overlayRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<TransitionStage>('IDLE');
  const fromRectRef = useRef<DOMRect | null>(null);
  
  // 文字可见性控制：Loading 完成且处于空闲/进入阶段时显示文字
  const isTextVisible = hasLoaderFinished && (stage === 'IDLE' || stage === 'ENTERING_TEXT');

  // ========== 调试日志 ==========
  useEffect(() => {
    if (progress > 0 && progress < 1) {
      console.log(`[App] 资源加载进度: ${(progress * 100).toFixed(0)}%`);
    }
    if (resourcesLoaded) {
      console.log('[App] 首屏资源加载完成，隐藏 Loading');
    }
  }, [progress, resourcesLoaded]);

  // ========== 辅助函数 ==========
  
  /**
   * 根据页面类型获取对应的 Hero 元素 ID
   * 用于转场动画定位
   */
  const getHeroId = (section: Section): string => {
    switch(section) {
      case Section.HOME: return 'hero-home';
      case Section.TECH: return 'hero-tech';
      case Section.MUSIC: return 'hero-music';
      case Section.STORY: return 'hero-story';
      case Section.CONTACT: return 'hero-contact';
    }
  };

  // ========== Contact 专用快门转场 ==========
  
  /**
   * Contact 页面专用的快门式转场动画
   * 
   * 效果说明：
   * - 多个竖向条带从下往上合拢，遮住旧画面
   * - 切换内容后，条带从上往下打开，露出新画面
   * - 产生类似电影快门的视觉效果
   * 
   * @param targetSection - 目标页面
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

          // 清空之前可能残留的子节点
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
          const sliceCount = 7;
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

          // 4. 条带合拢动画
          setStage('EXPANDING');

          gsap.to(slices, {
            scaleY: 1,
            duration: 0.35,
            ease: 'power3.inOut',
            stagger: {
              each: 0.03,
              from: 'edges',
            },
            onComplete: () => {
              try {
                // 完全遮挡后，切换内容
                setCurrentSection(targetSection);

                // 5. 条带打开动画
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
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
                        setStage('ENTERING_TEXT');
                      },
                      onComplete: () => {
                        // 6. 清理并回到空闲状态
                        console.log('[App] CONTACT 快门式转场结束');
                        overlay.innerHTML = '';
                        gsap.set(overlay, { display: 'none', opacity: 0 });
                        setStage('IDLE');
                        setNextSection(null);
                        fromRectRef.current = null;
                      },
                    });
                  });
                });
              } catch (innerError) {
                console.error('[App] CONTACT 快门式转场（打开阶段）出错', innerError);
              }
            },
          });
        } catch (errorInner) {
          console.error('[App] CONTACT 快门式转场初始化出错', errorInner);
          setCurrentSection(targetSection);
          setStage('IDLE');
          setNextSection(null);
          fromRectRef.current = null;
        }
      }, 600);
    } catch (errorOuter) {
      console.error('[App] CONTACT 快门式转场外部异常', errorOuter);
      setCurrentSection(targetSection);
      setStage('IDLE');
      setNextSection(null);
      fromRectRef.current = null;
    }
  };

  // ========== 导航处理 ==========
  
  /**
   * 处理页面导航
   * 
   * @param targetSection - 目标页面
   */
  const handleNavigate = (targetSection: Section) => {
    // 防止重复导航或转场中导航
    if (targetSection === currentSection || stage !== 'IDLE') return;

    // Contact 页面使用快门式转场
    if (targetSection === Section.CONTACT || currentSection === Section.CONTACT) {
      runContactShutterTransition(targetSection);
      return;
    }

    // 检查 GSAP 是否可用
    const hasGsap = typeof window !== 'undefined' && Boolean((window as any).gsap);
    if (!hasGsap) {
      console.warn('[App] GSAP 尚未加载，使用直接切换');
      setCurrentSection(targetSection);
      setStage('IDLE');
      setNextSection(null);
      fromRectRef.current = null;
      return;
    }

    // 开始普通转场：文字退出 → 扩展遮罩 → 切换 → 收缩遮罩 → 文字进入
    setNextSection(targetSection);
    setStage('EXITING_TEXT');
    
    // 等待文字退出后开始扩展动画
    setTimeout(() => {
      const currentHeroId = getHeroId(currentSection);
      const currentEl = document.getElementById(currentHeroId);
      
      if (currentEl) {
        fromRectRef.current = currentEl.getBoundingClientRect();
        setStage('EXPANDING');
      } else {
        setCurrentSection(targetSection);
        setStage('ENTERING_TEXT');
        setTimeout(() => setStage('IDLE'), 1000);
      }
    }, 600);
  };

  // ========== 转场动画效果 ==========
  
  // EFFECT 1: 处理遮罩扩展动画
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

      // 设置遮罩初始位置（当前 Hero 元素位置）
      gsap.set(overlay, {
        position: 'fixed',
        top: fromRectRef.current.top,
        left: fromRectRef.current.left,
        width: fromRectRef.current.width,
        height: fromRectRef.current.height,
        backgroundColor: '#CE0000',
        zIndex: 100,
        display: 'block',
        opacity: 1,
        borderRadius: '0px'
      });

      // 扩展到全屏
      gsap.to(overlay, {
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          setCurrentSection(nextSection);
          setStage('SWITCHING');
        }
      });
    }
  }, [stage, nextSection]);

  // EFFECT 2: 处理遮罩收缩动画
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
      
      requestAnimationFrame(() => {
        const targetId = getHeroId(currentSection);

        /**
         * 首次懒加载目标页面（如 Tech）时，组件可能尚未挂载，
         * 需要轮询几次等待 DOM 就绪，避免直接走回退淡出导致动画缺失。
         */
        const maxAttempts = 10;
        const attemptInterval = 50; // ms
        let attempt = 0;

        const tryShrinkToTarget = () => {
          const targetEl = document.getElementById(targetId);

          if (targetEl) {
            // Music 页面特殊处理：只做淡出
            if (currentSection === Section.MUSIC) {
              setStage('SHRINKING');

              gsap.to(overlay, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.out",
                onStart: () => {
                  setStage('ENTERING_TEXT');
                },
                onComplete: () => {
                  gsap.set(overlay, { display: 'none', opacity: 0 });
                  setStage('IDLE');
                  setNextSection(null);
                  fromRectRef.current = null;
                }
              });
              return;
            }

            // 其它页面：收缩到目标 Hero 元素
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
                setTimeout(() => {
                  setStage('ENTERING_TEXT');
                }, 100);
              },
              onComplete: () => {
                gsap.set(overlay, { display: 'none', opacity: 0 });
                
                setTimeout(() => {
                  setStage('IDLE');
                  setNextSection(null);
                  fromRectRef.current = null;
                }, 800);
              }
            });
            return;
          }

          // 未找到目标，继续短暂重试等待懒加载后的 DOM 挂载
          if (attempt < maxAttempts) {
            attempt += 1;
            setTimeout(tryShrinkToTarget, attemptInterval);
            return;
          }

          // 最终回退：淡出
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              gsap.set(overlay, { display: 'none' });
              setStage('IDLE');
              setNextSection(null);
            }
          });
        };

        tryShrinkToTarget();
      });
    }
  }, [stage, currentSection]);

  // ========== 渲染 ==========
  
  return (
    <div className="flex w-full h-screen bg-brand-black text-white font-sans overflow-hidden relative">
      {/* 转场遮罩层 */}
      <div 
        ref={overlayRef}
        className="hidden pointer-events-none fixed bg-brand-red z-[100]"
      />

      {/* 侧边导航 */}
      <Navigation currentSection={currentSection} onNavigate={handleNavigate} />

      {/* 主内容区域 */}
      <main className="flex-1 ml-12 md:ml-16 h-full relative overflow-hidden">
        <TransitionContext.Provider value={{ isTextVisible }}>
          {/* 首屏组件 - 同步加载 */}
          {currentSection === Section.HOME && <Home />}
          
          {/* 非首屏组件 - 懒加载 */}
          {/* fallback 设为 null，避免切屏时闪现 Loading */}
          {/* 转场动画本身已经提供了视觉过渡，不需要额外的加载提示 */}
          <Suspense fallback={null}>
            {currentSection === Section.TECH && <Tech />}
            {currentSection === Section.MUSIC && <Music />}
            {currentSection === Section.STORY && <Story />}
            {currentSection === Section.CONTACT && <Contact />}
          </Suspense>
        </TransitionContext.Provider>
      </main>

      {/* Loading 遮罩层 - 首屏资源加载完成前显示 */}
      {displayLoader && (
        <div className="loading-overlay">
          <div className="loader-box" aria-label="Loading interface" />
          {/* 可选：显示加载进度 */}
          {/* <div className="absolute bottom-8 text-white/30 text-xs">
            {(progress * 100).toFixed(0)}%
          </div> */}
        </div>
      )}
    </div>
  );
};

// ============================================
// Context 导出
// ============================================

/**
 * 转场状态 Context
 * 
 * 提供给子组件判断当前文字是否应该显示
 * 用于配合 VelocityText 组件的进出场动画
 */
export const TransitionContext = React.createContext({ isTextVisible: true });

/**
 * 获取转场状态的 Hook
 * 
 * @returns {{ isTextVisible: boolean }} - 文字是否可见
 */
export const useTransitionContext = () => React.useContext(TransitionContext);

export default App;
