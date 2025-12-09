import React, { useState, useContext, useRef, useEffect } from 'react';
import { VelocityText } from './VelocityText';
import { TransitionContext } from '../App';

/**
 * Game Component
 * 
 * Behavior:
 * - Click "PLAY GAME" → Load game and enter fullscreen
 * - ESC to exit fullscreen → Game pauses, show gray overlay with "PAUSED"
 * - Click "CONTINUE" → Re-enter fullscreen, game resumes (no reload)
 * - Tab to background → Game pauses automatically
 * 
 * Technical:
 * - iframe stays mounted after first load (no reload on fullscreen toggle)
 * - Use postMessage to communicate pause/resume with Unity
 * - Gray overlay with blur effect when paused
 */
const Game: React.FC = () => {
  // Get text visibility state from App.tsx's TransitionContext
  const { isTextVisible } = useContext(TransitionContext);
  
  // Game loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Game started state - only load iframe after clicking play
  const [gameStarted, setGameStarted] = useState(false);
  
  // Game loaded state - true after iframe finishes loading
  const [gameLoaded, setGameLoaded] = useState(false);
  
  // iframe reference
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Container reference for fullscreen API
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Detect if mobile device
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  /**
   * Send message to iframe to pause/resume Unity game
   */
  const sendGameCommand = (command: 'pause' | 'resume') => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: command }, '*');
    }
  };

  /**
   * Handle play/continue button click
   */
  const handlePlayClick = async () => {
    if (!gameContainerRef.current) return;

    try {
      if (!gameStarted) {
        // First time: start game and enter fullscreen
        setGameStarted(true);
        setIsLoading(true);
        // Small delay to ensure iframe is mounted
        setTimeout(async () => {
          try {
            await gameContainerRef.current?.requestFullscreen();
            setIsFullscreen(true);
          } catch (err) {
            console.warn('Fullscreen request failed:', err);
          }
        }, 100);
      } else {
        // Already started: just enter fullscreen and resume
        if (!document.fullscreenElement) {
          await gameContainerRef.current.requestFullscreen();
          setIsFullscreen(true);
          sendGameCommand('resume');
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
      if (!gameStarted) {
        setGameStarted(true);
        setIsLoading(true);
      }
    }
  };

  /**
   * Listen for fullscreen state changes
   * Use multiple event sources to ensure state is always synced
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Small delay to let browser fully update fullscreen state
      setTimeout(() => {
        const isNowFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isNowFullscreen);
        
        // Pause game when exiting fullscreen, resume when entering
        if (gameLoaded) {
          if (isNowFullscreen) {
            sendGameCommand('resume');
          } else {
            sendGameCommand('pause');
          }
        }
      }, 100);
    };

    // Listen to multiple fullscreen events for cross-browser compatibility
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [gameLoaded]);

  /**
   * iframe load completion callback
   */
  const handleIframeLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
      setGameLoaded(true);
    }, 500);
  };

  // Determine if paused overlay should show (game loaded, not fullscreen, game started)
  const showPausedOverlay = gameStarted && gameLoaded && !isFullscreen && !isLoading;

  /**
   * Sync pause/resume with overlay state
   * - When overlay is visible (not fullscreen), send pause
   * - When overlay is hidden and game started, send resume
   */
  useEffect(() => {
    if (!gameLoaded) return;
    // 如果仍然残留全屏，强制退出全屏避免状态不同步
    if (showPausedOverlay && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (showPausedOverlay) {
      sendGameCommand('pause');
    } else if (gameStarted) {
      sendGameCommand('resume');
    }
  }, [showPausedOverlay, gameLoaded, gameStarted]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-brand-black relative">
      {/* Left Info Section - overflow-visible to prevent text clipping */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-8 md:px-16 relative z-10 overflow-visible">
        
        {/* Main Title - use !overflow-visible to override VelocityText's overflow-hidden */}
        <div className="mb-8 overflow-visible">
          <VelocityText 
            content="HISSTORY" 
            visible={isTextVisible}
            variant="default"
            className="text-[12vw] md:text-[5rem] lg:text-[6rem] font-display font-bold leading-[1.1] tracking-tighter text-brand-red !overflow-visible"
          />
        </div>

        {/* Game Description Area */}
        <div 
          className="space-y-6 max-w-lg transition-all duration-700"
          style={{
            transform: isTextVisible ? 'translateY(0)' : 'translateY(50px)',
            opacity: isTextVisible ? 1 : 0,
            transitionDelay: '0.2s'
          }}
        >
          {/* Meta Info Tags */}
          <div className="flex gap-4 text-xs font-bold tracking-widest">
            <span className="bg-brand-red text-black px-3 py-1">UNITY</span>
            <span className="bg-white/10 text-white px-3 py-1">WEBGL</span>
            <span className="bg-white/10 text-white px-3 py-1">2025</span>
          </div>

          {/* Game Introduction */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-wide text-gray-400 uppercase">
              About This Game
            </h3>
            <p className="text-sm leading-relaxed text-gray-300">
              A Unity WebGL game project that can be experienced directly in your browser 
              without any downloads or installations required.
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              This game demonstrates comprehensive skills in interaction design, 3D modeling, 
              physics engine implementation, and user experience design.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-4">
            {!isMobile ? (
              <button
                onClick={handlePlayClick}
                className="group flex items-center justify-between px-6 py-4 bg-brand-red text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-brand-red"
              >
                <span>
                  {!gameStarted ? 'PLAY GAME' : (showPausedOverlay ? 'CONTINUE' : 'ENTER FULLSCREEN')}
                </span>
                <span className="transform group-hover:translate-x-2 transition-transform">
                  ⇱
                </span>
              </button>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 px-6 py-4 rounded">
                <p className="text-sm text-yellow-400 leading-relaxed">
                  📱 This game requires a desktop browser for the best experience. 
                  Mobile devices may encounter performance or compatibility issues.
                </p>
              </div>
            )}
          </div>

          {/* Tech Stack Tags */}
          <div className="pt-6">
            <span className="text-[10px] text-gray-500 block mb-2 tracking-widest">
              TECH STACK :
            </span>
            <div className="text-xs font-bold uppercase tracking-wide text-white">
              Unity Engine / C# / WebGL / 3D Modeling
            </div>
          </div>
        </div>
      </div>

      {/* Right Game Section */}
      <div 
        id="hero-game"
        ref={gameContainerRef}
        className="w-full md:w-1/2 h-full relative overflow-hidden"
        style={{ backgroundColor: '#000000' }}
      >
        {/* Unity WebGL Game Embed - stays mounted after first load */}
        {/* When paused: grayscale + dim filter to show gray game screen */}
        {gameStarted && (
          <iframe 
            ref={iframeRef}
            src="/game/index.html"
            title="Portfolio Game - Unity WebGL"
            className="w-full h-full border-0 absolute inset-0"
            style={{
              opacity: isLoading ? 0 : 1,
              transition: 'all 0.3s ease',
              backgroundColor: '#000000',
              // When paused: apply grayscale and darken filter to show gray game screen
              filter: showPausedOverlay ? 'grayscale(1) brightness(0.4)' : 'none',
              // Keep iframe visible to show game screen, just dimmed
              pointerEvents: showPausedOverlay ? 'none' : 'auto'
            }}
            onLoad={handleIframeLoad}
            allow="accelerometer; gyroscope; fullscreen"
          />
        )}

        {/* Initial Placeholder - before game starts */}
        {!gameStarted && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#000000' }}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-white font-bold text-lg tracking-widest">
                READY TO PLAY
              </p>
              <p className="text-gray-500 text-sm">
                Click "PLAY GAME" to start
              </p>
            </div>
          </div>
        )}

        {/* Loading State Overlay */}
        {isLoading && gameStarted && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#000000', zIndex: 10 }}
          >
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-brand-red/20 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-bold text-sm tracking-widest animate-pulse">
                LOADING GAME
              </p>
              <p className="text-gray-500 text-xs">
                Initializing Unity WebGL Runtime...
              </p>
            </div>
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-gray-600 text-xs">
                First load may take 10-30 seconds, please wait
              </p>
            </div>
          </div>
        )}

        {/* PAUSED Overlay - semi-transparent to show gray game screen underneath */}
        {showPausedOverlay && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
            style={{ 
              // Semi-transparent black overlay to show game screen underneath (now grayscale)
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 20
            }}
            onClick={handlePlayClick}
          >
            <div className="text-center space-y-6">
              {/* Pause Icon */}
              <div className="flex justify-center gap-4 mb-4">
                <div className="w-5 h-20 bg-white/80 rounded-sm" />
                <div className="w-5 h-20 bg-white/80 rounded-sm" />
              </div>
              
              <p className="text-white font-bold text-3xl tracking-widest">
                PAUSED
              </p>
              
              <p className="text-gray-300 text-sm max-w-xs">
                Game is paused. Click here or press "CONTINUE" button to resume playing.
              </p>
              
              {/* Play button hint */}
              <div className="mt-8 animate-pulse">
                <div className="w-16 h-16 mx-auto border-2 border-white/50 rounded-full flex items-center justify-center bg-white/10">
                  <div className="w-0 h-0 border-l-[14px] border-l-white/90 border-y-[9px] border-y-transparent ml-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Exit Hint - only in fullscreen */}
        {isFullscreen && !isLoading && gameStarted && (
          <div 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 animate-fadeIn pointer-events-none"
            style={{ zIndex: 30 }}
          >
            <div className="bg-black/80 text-white px-4 py-2 rounded text-xs">
              Press ESC to pause and exit
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
