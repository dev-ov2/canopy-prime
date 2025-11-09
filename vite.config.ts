import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

const rootDir = __dirname
const alias = { '@': rootDir }

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
    react(),
    tailwindcss(),
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
              external: ['electron', 'koffi', /\.node$/],
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
