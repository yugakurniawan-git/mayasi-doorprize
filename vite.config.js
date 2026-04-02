import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({command, mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      laravel({
        input: ['resources/js/app.jsx'],
        refresh: true,
      }),
      tailwindcss(),
      react(),
    ],
    server: {
      host: true, // atau "0.0.0.0"
      port: parseInt(env.VITE_PORT) || 7401,
      cors: true,
      watch: {
        usePolling: true, // penting untuk hot reload di Docker
      },
    },
  };
});
