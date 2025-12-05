import React, { useRef, useLayoutEffect } from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 文本动画组件的属性定义
// - variant = 'velocity'：当前默认的“惯性 + 残影”效果
// - variant = 'zoom'：用于第三屏 WHO 的“全屏缩放”效果
interface VelocityTextProps {
  content: string;
  className?: string;
  delay?: number; // 整体延迟
  mode?: 'sync' | 'stagger'; // 字母是一起动还是错位动
  visible?: boolean; // 控制进场/退场
  variant?: 'velocity' | 'zoom'; // 动画模式
}

export const VelocityText: React.FC<VelocityTextProps> = ({ 
  content, 
  className,
  delay = 0,
  mode = 'stagger',
  visible = true, // 默认为 true，即挂载时自动播放进场
  variant = 'velocity'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  
  /**
   * 第一个 effect：只负责「创建时间线」与初始状态，不关心 visible。
   * - 对于 velocity：构建 0 -> 1 的进场时间线，退场由 reverse() 实现严格反向。
   * - 对于 zoom：同样构建 0 -> 1 的缩放时间线。
   */
  useLayoutEffect(() => {
    // zoom 模式单独处理，不走统一时间线逻辑（避免第三屏 WHO 闪烁 / 裁切问题）
    if (variant === 'zoom') return;

    const gsap = (window as any).gsap;
    if (!gsap || !containerRef.current) return;

    const ctx = gsap.context(() => {
      try {
        // 如果之前的动画还在跑，杀掉它，避免叠加
        if (timelineRef.current) {
          timelineRef.current.kill();
        }

        const tl = gsap.timeline({
          paused: true,              // 默认暂停，由第二个 effect 控制播放 / 反播
          defaults: { ease: "power4.out" }
        });

        // 根据不同 variant 构建 0 -> 1 的完整时间线
        if (variant === 'zoom') {
          // ========== ZOOM 模式：用于第三屏 WHO ==========
          // 时间线定义：progress 0 时为“超大且透明”，progress 1 为“正常且可见”
          gsap.set([".main-char", ".ghost-1-char", ".ghost-2-char"], {
            scale: 8,
            y: 0,
            skewX: 0,
            opacity: 0,
            transformOrigin: "50% 50%"
          });

          tl.to([".ghost-2-char", ".ghost-1-char", ".main-char"], {
            scale: 1,
            skewX: 0,
            opacity: (index: number, _target: Element) => {
              // 主层/残影层透明度稍有差异，保留残影感
              if ((index as number) === 0) return 0.3;
              if ((index as number) === 1) return 0.6;
              return 1;
            },
            duration: 0.9,
            delay,
            stagger: 0.02
          });
        } else {
          // ========== VELOCITY 模式：默认的惯性滑入 + 残影 ==========
          // 进场时间线：progress 0 时在视野下方且透明，progress 1 时回正并完全可见
          gsap.set([".main-char", ".ghost-1-char", ".ghost-2-char"], {
            y: '120%',
            skewX: -20,
            opacity: 0
          });

          tl.to(".main-char", 
            { 
              y: '0%', 
              skewX: 0,        // 回正
              opacity: 1, 
              duration: 0.8, 
              stagger: mode === 'stagger' ? 0.03 : 0,
              delay: delay 
            }
          );

          tl.to(".ghost-1-char",
            { 
              y: '0%', 
              skewX: 0, 
              opacity: 0.6,
              duration: 0.8,
              stagger: mode === 'stagger' ? 0.03 : 0,
              delay: delay + 0.04 
            },
            "<"
          );

          tl.to(".ghost-2-char",
            { 
              y: '0%', 
              skewX: 0, 
              opacity: 0.3,
              duration: 0.9,
              stagger: mode === 'stagger' ? 0.03 : 0,
              delay: delay + 0.08 
            },
            "<"
          );
        }

        // 保存时间线引用，供第二个 effect 控制播放方向
        timelineRef.current = tl;
      } catch (error) {
        console.error('[VelocityText] 动画执行出错', error);
      }

    }, containerRef);

    return () => {
      ctx.revert();
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  // 注意：这里不依赖 visible，避免每次显隐都重建时间线导致闪烁
  }, [content, delay, mode, variant]); 

  /**
   * 第二个 effect：只根据 visible 控制时间线的播放方向
   * - visible = true  → 从头正向播放（0 -> 1）
   * - visible = false → 反向播放（从当前位置回到 0）
   */
  useLayoutEffect(() => {
    if (variant === 'zoom') return; // zoom 由其专用 effect 控制

    const gsap = (window as any).gsap;
    if (!gsap) return;
    const tl = timelineRef.current;
    if (!tl) return;

    try {
      if (visible) {
        // 切入：从起点正向播放
        tl.timeScale(1);
        tl.play(0);
      } else {
        // 切出：从当前进度反向播放到 0，得到 exactly 反向的轨迹
        tl.timeScale(1);
        tl.reverse();
      }
    } catch (error) {
      console.error('[VelocityText] 可见性切换时出错', error);
    }
  }, [visible, variant]);

  /**
   * 第三个 effect：专门给 zoom 模式（第三屏 WHO）使用，恢复稳定的缩放逻辑
   * 不使用可反播时间线，避免首帧闪烁和裁切问题。
   */
  useLayoutEffect(() => {
    if (variant !== 'zoom') return;

    const gsap = (window as any).gsap;
    if (!gsap || !containerRef.current) return;

    const ctx = gsap.context(() => {
      try {
        // 先清理旧时间线
        if (timelineRef.current) {
          timelineRef.current.kill();
          timelineRef.current = null;
        }

        const tl = gsap.timeline({
          defaults: { ease: 'power4.out' }
        });

        // 初始：根据 visible 决定是从“超大且透明”还是“正常且可见”开始
        gsap.set(['.main-char', '.ghost-1-char', '.ghost-2-char'], {
          scale: visible ? 8 : 1,
          y: 0,
          skewX: 0,
          opacity: visible ? 0 : 1,
          transformOrigin: '50% 50%'
        });

        if (visible) {
          // 进场：从超大缩小到正常，同时带轻微残影透明度
          tl.to(['.ghost-2-char', '.ghost-1-char', '.main-char'], {
            scale: 1,
            skewX: 0,
            opacity: (index: number, _target: Element) => {
              if ((index as number) === 0) return 0.3;
              if ((index as number) === 1) return 0.6;
              return 1;
            },
            duration: 0.9,
            delay,
            stagger: 0.02
          });
        } else {
          // 退场：从正常缩放到超大，并淡出
          tl.to(['.main-char', '.ghost-1-char', '.ghost-2-char'], {
            scale: 8,
            skewX: 8,
            opacity: 0,
            duration: 0.6,
            stagger: 0.02
          });
        }

        timelineRef.current = tl;
      } catch (error) {
        console.error('[VelocityText][zoom] 动画执行出错', error);
      }
    }, containerRef);

    return () => {
      ctx.revert();
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [visible, delay, variant]);

  // 将字符串拆分为字符数组，处理空格
  const characters = content.split('').map((char, i) => (
    char === ' ' ? '\u00A0' : char
  ));

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative overflow-hidden inline-flex mix-blend-screen leading-none", 
        className
      )}
      aria-label={content}
    >
      {/* 
        我们渲染三层完全一样的文字，完全重叠
        Layer 0: 主文字 (White/Current Color)
        Layer 1: 残影 1 (Brand Red - 60%)
        Layer 2: 残影 2 (Brand Red - 30%)
      */}

      {/* Layer 2: 最底层的残影 (拖尾最长) - 初始透明度为0 */}
      <div className="absolute top-0 left-0 flex select-none pointer-events-none text-[#FF0000] mix-blend-screen" aria-hidden="true">
        {characters.map((char, i) => (
          // 使用 opacity-0 作为 CSS 初始状态，避免首帧闪烁
          <span key={`g2-${i}`} className="ghost-2-char inline-block origin-bottom-left will-change-transform opacity-0">
            {char}
          </span>
        ))}
      </div>

      {/* Layer 1: 中间层的残影 - 初始透明度为0 */}
      <div className="absolute top-0 left-0 flex select-none pointer-events-none text-[#CE0000] mix-blend-screen" aria-hidden="true">
        {characters.map((char, i) => (
          <span key={`g1-${i}`} className="ghost-1-char inline-block origin-bottom-left will-change-transform opacity-0">
            {char}
          </span>
        ))}
      </div>

      {/* Layer 0: 主文字 (最上层) - 初始透明度为0 */}
      <div className="relative flex z-10">
        {characters.map((char, i) => (
          <span key={`main-${i}`} className="main-char inline-block origin-bottom-left will-change-transform opacity-0">
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

