import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        about: resolve(__dirname, 'public/about.html'),
        books: resolve(__dirname, 'public/books.html'),
        media: resolve(__dirname, 'public/media.html'),
        contact: resolve(__dirname, 'public/contact.html'),
        bookDetail: resolve(__dirname, 'public/book-detail.html'),
        cms: resolve(__dirname, 'public/cms/index.html')
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Variables are imported in main.scss
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
