import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import the 'path' module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  base: process.env.NODE_ENV === 'production' ? '/' : '/admin/',
  server: {
    port: 3003, 
    proxy: {
      '/users': 'https://mazad-click-server.onrender.com', 
      '/auth': 'https://mazad-click-server.onrender.com',  
    }
  },
  resolve: {
    alias: {
      // Use path.resolve to create an absolute path to the src directory
      '@': path.resolve(__dirname, './src'),
    }
  },
});
