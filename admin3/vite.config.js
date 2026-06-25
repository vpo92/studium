import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const PROXY_PREFIX = '/proxy/8000'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    mode !== 'production' && {
      name: 'proxy-prefix-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && !req.url.startsWith(PROXY_PREFIX)) {
            req.url = PROXY_PREFIX + req.url
          }
          next()
        })
      }
    }
  ],
  base: mode === 'production' ? './' : PROXY_PREFIX + '/',
  server: {
    host: '0.0.0.0',
    port: 8000,
    allowedHosts: ['dev.vincentpoupet.fr'],
    proxy: {
      [PROXY_PREFIX + '/api']: {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(new RegExp('^' + PROXY_PREFIX + '/api'), '')
      }
    }
  }
}))
