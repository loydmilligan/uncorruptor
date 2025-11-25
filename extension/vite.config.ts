import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, renameSync } from 'fs'

// Custom plugin to copy manifest and icons
function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist')

      // Ensure dist directory exists
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
      }

      // Move popup.html to root of dist
      const popupHtmlSrc = resolve(distDir, 'src/popup/popup.html')
      const popupHtmlDest = resolve(distDir, 'popup.html')
      if (existsSync(popupHtmlSrc)) {
        renameSync(popupHtmlSrc, popupHtmlDest)
      }

      // Move options.html to root of dist
      const optionsHtmlSrc = resolve(distDir, 'src/options/options.html')
      const optionsHtmlDest = resolve(distDir, 'options.html')
      if (existsSync(optionsHtmlSrc)) {
        renameSync(optionsHtmlSrc, optionsHtmlDest)
      }

      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(distDir, 'manifest.json')
      )

      // Copy icons directory if it exists
      const iconsDir = resolve(__dirname, 'icons')
      const distIconsDir = resolve(distDir, 'icons')

      if (existsSync(iconsDir)) {
        if (!existsSync(distIconsDir)) {
          mkdirSync(distIconsDir, { recursive: true })
        }

        const iconFiles = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png']
        iconFiles.forEach((file) => {
          const srcPath = resolve(iconsDir, file)
          if (existsSync(srcPath)) {
            copyFileSync(srcPath, resolve(distIconsDir, file))
          }
        })
      }

      console.log('✓ Static assets copied to dist/')
    },
  }
}

export default defineConfig({
  plugins: [react(), copyStaticAssets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        options: resolve(__dirname, 'src/options/options.html'),
        'service-worker': resolve(__dirname, 'src/background/serviceWorker.ts'),
        'content-script': resolve(__dirname, 'src/content/extractPageData.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Keep specific names for extension files
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js'
          }
          if (chunkInfo.name === 'content-script') {
            return 'content-script.js'
          }
          return '[name].[hash].js'
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
