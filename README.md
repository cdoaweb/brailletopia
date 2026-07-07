# Brailletopía

Brailletopía es una plataforma web educativa, accesible e inclusiva creada con el propósito de facilitar el aprendizaje del sistema braille a alumnado de Educación Primaria, especialmente a estudiantes con baja visión o ceguera, sin excluir a usuarios videntes.

**Sitio web:** https://cdoaweb.github.io/brailletopia/

## Tecnologías

- **TypeScript** — toda la lógica de la aplicación (`src/`)
- **Vite** — servidor de desarrollo y build de producción multipágina
- **Base de datos local** — colecciones tipadas sobre `localStorage` (`src/core/db.ts`): usuarios, progreso de cursos, puntuaciones de juegos y mensajes de contacto
- **CSS con variables** — sistema de diseño propio (`css/`), conforme a WCAG 2.1 AA

## Desarrollo

```bash
npm install       # instalar dependencias
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # verificación de tipos + build de producción en dist/
npm run preview   # previsualizar el build de producción
```

## Estructura

```
index.html            Portada
pages/                Páginas (cursos, juegos, contacto, login, legales)
css/                  Estilos (variables, layout, componentes, accesibilidad)
src/
  core/               db (base de datos), auth, accesibilidad, audio, anuncios
  components/         layout (header/footer/panel), celda braille, teclado Perkins
  data/               alfabeto braille y catálogo de cursos
  games/              juego "Adivina la letra"
  pages/              script de entrada de cada página
```

## Funcionalidades

- **Cursos** con lecciones interactivas, filtros por nivel/categoría y progreso guardado (por usuario o como invitado)
- **Juegos**: adivina la letra (3 niveles, con ranking de puntuaciones), celda braille interactiva y teclado Perkins virtual con escritura por acordes
- **Cuentas de usuario**: registro e inicio de sesión locales (hash SHA-256)
- **Accesibilidad**: panel con tamaño de texto, alto contraste y narrador; atajos de teclado (Alt+A, Alt+N, Alt+C, Alt+1/2/3); anuncios `aria-live`

## Despliegue

Al hacer push a `main`, GitHub Actions compila el proyecto y publica `dist/` en GitHub Pages (el *Source* en Settings → Pages debe ser **GitHub Actions**). El script `deploy-github-pages.sh` automatiza el flujo dev → main verificando antes que el proyecto compila.
