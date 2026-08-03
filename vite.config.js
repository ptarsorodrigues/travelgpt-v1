import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import url from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-routes',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/places')) {
            const parsedUrl = url.parse(req.url, true);
            req.query = parsedUrl.query;
            const handler = (await import('./api/places.js')).default;
            return handler(req, res);
          }
          if (req.url && req.url.startsWith('/api/extract-maps-photo')) {
            const parsedUrl = url.parse(req.url, true);
            req.query = parsedUrl.query;
            const handler = (await import('./api/extract-maps-photo.js')).default;
            return handler(req, res);
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3000,
    open: true
  }
})

