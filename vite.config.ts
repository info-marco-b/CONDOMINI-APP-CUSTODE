import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";




// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'harmotomic-kimberlee-nondisrupting.ngrok-free.dev',
      '192.168.1.208',
      'localhost'
    ],
    /*
    proxy: {
      '/api': {
        target: 'http://192.168.1.208:3000',
        changeOrigin: true,
        secure: false,
        xfwd: true, // Importante: inoltra gli header X-Forwarded-For/Proto
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Errore Proxy:', err);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              console.log('Cookie intercettato dal Proxy per:', req.url);
            }
          });
        }
      }
    }
      */
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // o 192.168.1.208
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Prendiamo il cookie dal backend e lo "ripuliamo" per il browser
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              res.setHeader('set-cookie', setCookie);
            }
          });
        }
      }
    }
  }
});