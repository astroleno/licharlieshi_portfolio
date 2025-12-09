import React, { useContext, useState, useEffect } from 'react';
import { MUSIC_CATALOG } from '../constants';
import { VelocityText } from './VelocityText';
import { TransitionContext } from '../App';
import { MusicProjectList } from './MusicProjectList';

/**
 * Music Component - 音乐作品展示页面
 * 
 * 布局结构：
 * - 顶部区域：展示巨大的 "MUSIC" 标题（默认）或项目列表（激活状态）
 *   - 默认高度：80vh
 *   - 激活高度：90vh（展开显示更多内容）
 * - 底部区域：分类导航
 *   - 默认高度：20vh
 *   - 激活高度：10vh（收缩为紧凑模式）
 *   - 交互：
 *     - Hover：底部分类悬浮时，上方 MUSIC 文字显示对应视频遮罩效果
 *     - Click：点击分类进入详情列表
 * 
 * 视频遮罩实现原理（mix-blend-mode: multiply）：
 * - 底层：视频全屏播放
 * - 顶层：黑色背景 + 白色文字
 * - 混合模式计算：
 *   - 黑色(0) × 视频颜色 = 黑色 → 黑色区域保持黑色
 *   - 白色(1) × 视频颜色 = 视频颜色 → 白色文字区域显示视频
 * - 文字样式与 VelocityText 完全一致，保证大小对齐
 */
const Music: React.FC = () => {
  const { isTextVisible } = useContext(TransitionContext);
  // 当前激活的分类ID，null 表示未选择任何分类（默认视图）
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  // 悬浮的分类ID，用于触发视频遮罩效果
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  
  // 详情视图的渲染和动画状态
  const [renderDetails, setRenderDetails] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  // 视频映射：每个分类对应的预览视频
  const categoryVideoMap: Record<string, string> = {
    games: '/games.webm',
    tv: '/tv.webm',
    anime: '/anime.webm',
    live: '/live.webm'
  };

  // Find the full data object for the active category
  const activeCategoryData = MUSIC_CATALOG.find(c => c.id === activeCategoryId);
  const isExpanded = !!activeCategoryId;

  // Handle transition logic
  useEffect(() => {
    if (activeCategoryId) {
      // Opening details: Render immediately, then fade in
      setRenderDetails(true);
      // Small delay to allow render before opacity transition
      const timer = setTimeout(() => setDetailVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      // Closing details: Fade out, then stop rendering after animation
      setDetailVisible(false);
      const timer = setTimeout(() => setRenderDetails(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeCategoryId]);

  return (
    <div className="w-full h-full bg-brand-black relative overflow-hidden flex flex-col">
      
      {/* Top Section - Content Stage */}
      <div 
        id="hero-music"
        className={`relative w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isExpanded ? 'h-[90vh]' : 'h-[80vh]'
        }`}
      >
        
        {/* Default View: Giant Text with Video Mask on Hover */}
        <div 
          className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-500 ${
            activeCategoryId ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* 默认状态：红色MUSIC文字 - 始终渲染以保持动画连续性 */}
          <div className={`transition-opacity duration-300 ${hoveredCategoryId ? 'opacity-0' : 'opacity-100'}`}>
            <VelocityText 
              content="MUSIC" 
              visible={isTextVisible && !activeCategoryId}
              variant="zoom"
              className="text-[40vw] md:text-[32vw] font-display font-bold leading-none tracking-tighter select-none text-brand-red"
            />
          </div>

          {/* 
            悬浮时：视频+文字遮罩效果
            实现原理：
            1. 底层：视频全屏播放
            2. 顶层：黑色背景 + 白色文字，使用 mix-blend-mode: multiply
            3. multiply 混合模式效果：
               - 黑色 × 视频 = 黑色（黑色区域保持黑色）
               - 白色 × 视频 = 视频（白色文字区域显示视频）
            4. 文字样式与 VelocityText 完全一致，保证大小对齐
          */}
          {hoveredCategoryId && categoryVideoMap[hoveredCategoryId] && (
            <div className="absolute inset-0 w-full h-full animate-fadeIn">
              {/* 底层：视频全屏播放 */}
              <video 
                key={hoveredCategoryId}
                src={categoryVideoMap[hoveredCategoryId]}
                autoPlay 
                loop 
                muted 
                playsInline 
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* 顶层：黑色背景 + 白色文字遮罩 */}
              <div 
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
                style={{ mixBlendMode: 'multiply' }}
              >
                {/* 
                  文字层 - 使用与 VelocityText 完全相同的样式类
                  确保字体大小、粗细、字间距完全一致
                  注意：必须与 VelocityText 的 className 保持一致
                */}
                <span className="text-[40vw] md:text-[32vw] font-display font-bold leading-none tracking-tighter select-none text-white">
                  MUSIC
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Active View: Project List */}
        {/* Renders when a category is selected */}
        {renderDetails && activeCategoryData && (
          <div 
            className={`absolute inset-0 z-20 transition-all duration-700 ease-out bg-brand-black/95 ${
              detailVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-90'
            }`}
          >
            {/* Key ensures component remounts for fresh animation when category changes */}
            <MusicProjectList key={activeCategoryId} category={activeCategoryData} />
          </div>
        )}

      </div>

      {/* Bottom Section - Category Navigation */}
      <div 
        className={`w-full relative z-30 flex items-center transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          isExpanded ? 'h-[10vh] bg-black' : 'h-[20vh] bg-brand-red'
        }`}
      >
        {/* 内部容器 - 负责水平均匀分布4个分类 */}
        <div className={`
            w-full h-full mx-auto relative flex justify-between items-center px-0 box-border transition-all duration-700
            max-w-full
        `}>
             
            {MUSIC_CATALOG.map((category, index) => {
              const isActive = activeCategoryId === category.id;

              return (
                <div 
                  key={category.id} 
                  className={`
                    flex flex-col relative group cursor-pointer h-full flex-1
                    transition-all duration-300
                    ${isExpanded 
                        ? (isActive ? 'bg-brand-red' : 'bg-transparent hover:bg-white/10') // Expanded: Active=Red, Inactive=Black/Transparent
                        : (isActive ? 'bg-white/5' : '') // Default: Hover/Active effect
                    }
                  `}
                  // 悬浮时显示对应视频
                  onMouseEnter={() => !isExpanded && setHoveredCategoryId(category.id)}
                  onMouseLeave={() => !isExpanded && setHoveredCategoryId(null)}
                  // 点击进入详情
                  onClick={() => setActiveCategoryId(isActive ? null : category.id)}
                >
                  {/* Content Alignment - 外层容器负责垂直居中对齐 */}
                  <div 
                    className={`
                      flex flex-col w-full h-full transition-all duration-500 items-center justify-center
                    `}
                    style={{
                      transform: isTextVisible ? 'translateY(0)' : 'translateY(100px)',
                      opacity: isTextVisible ? 1 : 0,
                      transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      transitionDelay: isTextVisible ? `${index * 0.1}s` : '0s'
                    }}
                  >
                    {/* Inner Container - 将标签和文字作为整体居中 */}
                    <div className="flex flex-col items-center">
                      {/* Year/Subtitle Tag - Always show, but adjust style in expanded mode */}
                      <div className={`
                          transition-all duration-500 ease-in-out
                          ${isExpanded ? 'mb-1 opacity-80' : 'mb-2 opacity-100'}
                      `}>
                          <span className={`
                          text-[10px] md:text-xs font-bold px-2 py-1 block tracking-widest transition-colors duration-300
                          ${isExpanded 
                              ? (isActive ? 'bg-black text-brand-red' : 'bg-brand-red text-black') // Expanded colors
                              : (isActive ? 'bg-white text-brand-red' : 'bg-black text-brand-red group-hover:bg-white group-hover:text-brand-red') // Default colors
                          }
                          `}>
                          {category.yearRange || 'WORKS'}
                          </span>
                      </div>
                      
                      {/* Category Label */}
                      <div className={`
                        font-display font-bold uppercase tracking-tight leading-none transition-all duration-300 text-center
                        ${isExpanded 
                            ? (isActive ? 'text-white' : 'text-white/50 hover:text-white') // Expanded text colors
                            : (isActive ? 'text-white' : 'text-white/70 group-hover:text-white') // Default text colors
                        }
                        ${isExpanded ? 'text-lg md:text-xl' : 'text-xl md:text-4xl'}
                      `}>
                         <span className={isActive ? 'opacity-100' : 'opacity-80'}>
                           {category.label}
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Music;
