import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, '/v1/messages'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Ajouter les headers Anthropic
            const apiKey = process.env.VITE_ANTHROPIC_API_KEY || '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';
            proxyReq.setHeader('x-api-key', apiKey);
            proxyReq.setHeader('anthropic-version', '2023-06-01');
            // Supprimer les headers CORS du client pour éviter les problèmes
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Ajouter les headers CORS pour la réponse
            proxyRes.headers['access-control-allow-origin'] = '*';
            proxyRes.headers['access-control-allow-methods'] = 'POST, OPTIONS';
            proxyRes.headers['access-control-allow-headers'] = 'Content-Type';
          });
        },
      },
    },
  },
});
