import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Import the 'path' module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3003, 
    proxy: {
      '/users': 'http://localhost:3000', 
      '/auth': 'http://localhost:3000',  
    }
  },
  resolve: {
    alias: {
      // Use path.resolve to create an absolute path to the src directory
      '@': path.resolve(__dirname, './src'),
    }
  },
});
