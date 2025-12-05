import React, { useContext } from 'react';
import { TIMELINE } from '../constants';
import { VelocityText } from './VelocityText';
import { TransitionContext } from '../App';

const About: React.FC = () => {
  const { isTextVisible } = useContext(TransitionContext);

  return (
  <div className="w-full h-full bg-brand-black relative overflow-hidden flex flex-col">
      
      {/* Top Section (75vh) - 作为 WHO 的完整舞台区域 */}
      {/* 这里我们让 hero-about 覆盖整个上方 3/4 屏幕，而不是局限在一行文字的容器里 */}
      <div className="relative w-full h-[75vh] overflow-hidden">
        
        {/* Giant WHO Text - 使用 zoom 模式：占据整个 3/4 区域进行缩放 */}
        <div 
          id="hero-about" 
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <VelocityText 
            content="WHO" 
            visible={isTextVisible}
            variant="zoom"      // 仅 About 使用 zoom 模式
            className="text-[40vw] md:text-[32vw] font-display font-bold leading-none tracking-tighter select-none text-brand-red"
          />
        </div>
        
        {/* Silhouette Placeholder - Mimicking the 'H' cutout in the reference image */}
        {/* Note: Since we don't have the specific silhouette image, we just keep the text clean as requested. 
            If an image is needed inside the text, we would use background-clip: text or a mask.
            For now, focusing on the layout and scale. */}
      </div>

      {/* Bottom Section (25vh) - Timeline - Matches Home screen bottom area */}
      <div className="w-full h-[25vh] bg-brand-red relative z-20 flex items-end">
        <div className="w-full h-full max-w-[90%] mx-auto relative flex justify-between items-end pb-8 md:pb-12">
             {/* Hover instruction - REMOVED per request */}
             
            {TIMELINE.map((event, index) => (
              <div key={event.year} className="flex flex-col relative group w-1/3">
                  {/* Vertical line connector */}
                  <div className={`
                    absolute bottom-full h-[5vh] w-[1px] bg-white/30 mb-4 transition-all duration-500 group-hover:h-[8vh] group-hover:bg-white
                    ${index === 0 ? 'left-0' : index === TIMELINE.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                  `}></div>
                  
                  {/* Content Alignment */}
                  <div className={`flex flex-col ${index === 0 ? 'items-start' : index === TIMELINE.length - 1 ? 'items-end' : 'items-center'}`}>
                    {/* Year Tag */}
                    <span className="text-[10px] font-bold text-brand-red bg-black px-2 py-1 mb-2 block w-fit tracking-widest">
                      {event.year}
                    </span>
                    {/* Category Label - Animated */}
                    <div className="text-xl md:text-3xl font-display font-bold uppercase tracking-tight text-white leading-none">
                       <VelocityText 
                          content={event.category} 
                          visible={isTextVisible}
                          delay={0.5 + (index * 0.1)} // Stagger the timeline items
                          className="text-white"
                       />
                    </div>
                  </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default About;
