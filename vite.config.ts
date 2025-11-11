import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path, { resolve } from 'path'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

const alias = {
  '@/app': resolve(__dirname, 'app'),
  '@/lib': resolve(__dirname, 'lib'),
  '@/resources': resolve(__dirname, 'resources'),
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: 'app/index.html',
      },
    },
    outDir: 'out/renderer',
  },
  resolve: { alias },
  plugins: [
    tailwindcss(),
    react(),
    electron({
      main: {
        entry: path.resolve(__dirname, 'lib/main/main.ts'),
        vite: {
          resolve: { alias },
          build: {
            rollupOptions: {
              external: ['electron', 'better-sqlite3', 'bindings', 'koffi', /\.node$/],
            },
            outDir: 'out/main',
          },
          optimizeDeps: {
            exclude: ['electron', 'better-sqlite3', 'bindings', '@overwolf/ow-electron', 'koffi'],
          },
        },
        onstart: ({ startup }) => {
          return startup(['.', '--test-ad'], undefined, '@overwolf/ow-electron')
        },
      },
      preload: {
        input: path.resolve(__dirname, 'lib/preload/preload.ts'),
        vite: {
          resolve: { alias },
          build: {
            rollupOptions: {
              external: ['electron'],
            },
            outDir: 'out/preload',
          },
          optimizeDeps: {
            exclude: ['electron', '@overwolf/ow-electron', 'koffi'],
          },
        },
      },
    }),
  ],
})
