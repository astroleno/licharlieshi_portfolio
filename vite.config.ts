/**
 * vite.config.ts
 * 
 * Vite 构建配置
 * 
 * 功能说明：
 * - 开发服务器配置（端口 3000）
 * - React 插件支持
 * - 代码分割优化（manualChunks）
 * - 构建优化（压缩、chunk 大小警告）
 * 
 * 代码分割策略：
 * - vendor-react: React 核心库，几乎不变，长期缓存
 * - vendor-ui: UI 相关库（plyr 等）
 * - page-xxx: 各页面组件，按需加载
 */

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // ============================================
    // 开发服务器配置
    // ============================================
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    
    // ============================================
    // 插件配置
    // ============================================
    plugins: [react()],
    
    // ============================================
    // 环境变量定义
    // ============================================
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    
    // ============================================
    // 路径别名
    // ============================================
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    
    // ============================================
    // 构建配置
    // ============================================
    build: {
      // 输出目录
      outDir: 'dist',
      
      // 启用 source map（生产环境可设为 false）
      sourcemap: false,
      
      // 压缩配置 - 使用 esbuild（Vite 默认，无需额外安装）
      minify: 'esbuild',
      
      // Chunk 大小警告阈值（KB）
      chunkSizeWarningLimit: 500,
      
      // Rollup 配置
      rollupOptions: {
        output: {
          // ============================================
          // 代码分割配置（manualChunks）
          // ============================================
          manualChunks: (id: string) => {
            // node_modules 中的依赖
            if (id.includes('node_modules')) {
              // React 核心库 - 变化最少，长期缓存
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              
              // UI/播放器相关库
              if (id.includes('plyr')) {
                return 'vendor-plyr';
              }
              
              // 工具库
              if (id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'vendor-utils';
              }
              
              // 其他第三方库
              return 'vendor-other';
            }
            
            // 页面组件分割 - 实现按需加载
            // 这些组件已经通过 React.lazy 动态导入，Vite 会自动分割
            // 这里的配置确保它们被正确命名
            
            // Tech 页面
            if (id.includes('components/Tech')) {
              return 'page-tech';
            }
            
            // Music 页面
            if (id.includes('components/Music') || id.includes('components/MusicProjectList')) {
              return 'page-music';
            }
            
            // Game 页面
            if (id.includes('components/Game')) {
              return 'page-game';
            }
            
            // Contact 页面
            if (id.includes('components/Contact')) {
              return 'page-contact';
            }
            
            // 不匹配的文件由 Vite 自动处理
            return undefined;
          },
          
          // 输出文件命名规则
          // 使用 contenthash 确保内容变化时文件名变化，便于缓存
          chunkFileNames: (chunkInfo) => {
            // 页面 chunks 使用简洁名称
            if (chunkInfo.name.startsWith('page-')) {
              return 'assets/[name]-[hash].js';
            }
            // vendor chunks
            if (chunkInfo.name.startsWith('vendor-')) {
              return 'assets/[name]-[hash].js';
            }
            // 其他 chunks
            return 'assets/chunks/[name]-[hash].js';
          },
          
          // 入口文件命名
          entryFileNames: 'assets/[name]-[hash].js',
          
          // 静态资源命名
          assetFileNames: (assetInfo) => {
            // 字体文件
            if (assetInfo.name && /\.(woff2?|ttf|otf|eot)$/.test(assetInfo.name)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            // 图片文件
            if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            // CSS 文件
            if (assetInfo.name && /\.css$/.test(assetInfo.name)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            // 其他资源
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    },
    
    // ============================================
    // 优化配置
    // ============================================
    optimizeDeps: {
      // 预构建的依赖
      include: ['react', 'react-dom', 'clsx', 'tailwind-merge']
    }
  };
});
