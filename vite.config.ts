import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'suppress-vite-client-errors',
      transformIndexHtml() {
        return [
          {
            tag: 'script',
            children: `(function(){var isV=function(m){if(!m)return false;var s=typeof m==='string'?m:(m.message||m.reason||String(m));return typeof s==='string'&&s.indexOf('[vite]')!==-1;};['error','warn','info','log'].forEach(function(k){var o=console[k];if(o){console[k]=function(){if(arguments&&isV(arguments[0]))return;o.apply(console,arguments);};}});window.addEventListener('error',function(e){if(isV(e.message||e.error)){e.preventDefault&&e.preventDefault();e.stopImmediatePropagation&&e.stopImmediatePropagation();}},true);window.addEventListener('unhandledrejection',function(e){if(isV(e.reason)){e.preventDefault&&e.preventDefault();e.stopImmediatePropagation&&e.stopImmediatePropagation();}},true);})();`,
            injectTo: 'head-prepend',
          },
        ];
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    hmr: false,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['motion'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
