import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// base './' genera rutas relativas: funciona en local y en GitHub Pages
// (https://cdoaweb.github.io/brailletopia/) sin configuración extra.
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        cursos: resolve(__dirname, 'pages/cursos.html'),
        juegos: resolve(__dirname, 'pages/juegos.html'),
        contacto: resolve(__dirname, 'pages/contacto.html'),
        login: resolve(__dirname, 'pages/login.html'),
        legales: resolve(__dirname, 'pages/legales.html'),
      },
    },
  },
});
