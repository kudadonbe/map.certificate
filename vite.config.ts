import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isGitHubPages = mode === 'pages'

  return {
    base: isGitHubPages ? '/map.certificate/' : '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: isGitHubPages ? 'docs' : 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      host: true,
    },
  }
})
