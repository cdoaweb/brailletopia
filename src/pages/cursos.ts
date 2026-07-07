/* ============================================
   BRAILLETOPÍA - PÁGINA DE CURSOS
   Cursos generados desde el catálogo, filtros funcionales,
   visor de lecciones y progreso guardado en la base de datos.
   ============================================ */

import { initPage } from '../core/page';
import { renderBreadcrumbs } from '../components/layout';
import { COURSES, LEVEL_LABELS, type Course, type CourseLevel } from '../data/courses';
import { db, type CourseProgress } from '../core/db';
import { getSession } from '../core/auth';
import { BrailleCell } from '../components/braille-cell';
import { letterToUnicodeBraille } from '../data/braille';

const manager = initPage('cursos');
renderBreadcrumbs([
  { text: 'Inicio', url: '../index.html' },
  { text: 'Cursos' },
]);

const grid = document.getElementById('courses-grid') as HTMLElement;
const lessonArea = document.getElementById('lesson-area') as HTMLElement;
const filterLevel = document.getElementById('filter-level') as HTMLSelectElement;
const filterCategory = document.getElementById('filter-category') as HTMLSelectElement;

const LEVEL_STYLES: Record<CourseLevel, string> = {
  principiante: '',
  intermedio: 'background: var(--color-tertiary); color: var(--color-white);',
  avanzado: 'background: var(--color-error); color: var(--color-white);',
};

/** El progreso de invitados se guarda bajo el id "guest". */
function currentUserId(): string {
  return getSession()?.userId ?? 'guest';
}

function getProgress(courseId: string): CourseProgress | undefined {
  const userId = currentUserId();
  return db.find('progress', (p) => p.userId === userId && p.courseId === courseId);
}

function saveProgress(course: Course, completedLessons: number): void {
  const existing = getProgress(course.id);
  if (existing) {
    if (completedLessons > existing.completedLessons) {
      db.update('progress', existing.id, {
        completedLessons,
        updatedAt: new Date().toISOString(),
      });
    }
  } else {
    db.insert('progress', {
      userId: currentUserId(),
      courseId: course.id,
      completedLessons,
      totalLessons: course.lessons.length,
      updatedAt: new Date().toISOString(),
    });
  }
}

function renderCourses(): void {
  const level = filterLevel.value;
  const category = filterCategory.value;

  const visible = COURSES.filter(
    (c) =>
      (level === 'todos' || c.level === level) &&
      (category === 'todos' || c.category === category),
  );

  if (visible.length === 0) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info" role="status">
          <div class="alert-content">
            <p>No hay cursos que coincidan con los filtros seleccionados.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = visible
    .map((course) => {
      const progress = getProgress(course.id);
      const completed = progress?.completedLessons ?? 0;
      const total = course.lessons.length;
      const percent = Math.round((completed / total) * 100);
      const isDone = completed >= total;

      const progressBar =
        completed > 0
          ? `
        <div style="margin-top: var(--space-sm);" aria-label="Progreso del curso: ${percent}%">
          <div style="background: var(--color-gray-200); border-radius: 999px; height: 12px; overflow: hidden;">
            <div style="background: ${isDone ? 'var(--color-success, #2e7d32)' : 'var(--color-primary)'}; width: ${percent}%; height: 100%;"></div>
          </div>
          <span style="font-size: var(--font-size-small); color: var(--color-gray-700);">
            ${completed}/${total} lecciones ${isDone ? '· ¡Completado! 🎉' : ''}
          </span>
        </div>`
          : '';

      const buttonLabel = isDone ? 'Repasar' : completed > 0 ? 'Continuar' : 'Comenzar';

      return `
        <article class="col-12 col-md-6 course-card card" role="listitem">
          <span class="course-level" style="${LEVEL_STYLES[course.level]}">${LEVEL_LABELS[course.level]}</span>
          <div class="card-header">
            <div class="card-icon" aria-hidden="true">${course.icon}</div>
            <h3 class="card-title">${course.title}</h3>
          </div>
          <div class="card-body">
            <p>${course.description}</p>
            <div class="badge badge-primary" style="margin-top: var(--space-sm);">${total} lecciones</div>
            ${progressBar}
          </div>
          <div class="card-footer">
            <button class="btn btn-primary" style="width: 100%;" data-course="${course.id}">
              ${buttonLabel}
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  grid.querySelectorAll<HTMLButtonElement>('[data-course]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const course = COURSES.find((c) => c.id === btn.dataset.course);
      if (course) openCourse(course);
    });
  });
}

function openCourse(course: Course): void {
  const progress = getProgress(course.id);
  // Repasar desde el principio si ya está completado
  const startAt =
    progress && progress.completedLessons < course.lessons.length
      ? progress.completedLessons
      : 0;
  showLesson(course, startAt);
  lessonArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showLesson(course: Course, index: number): void {
  const lesson = course.lessons[index];
  const total = course.lessons.length;

  lessonArea.style.display = 'block';
  lessonArea.innerHTML = `
    <div class="card" style="max-width: 700px; margin: var(--space-xl) auto;">
      <div class="card-header">
        <h2 class="card-title">${course.title}</h2>
      </div>
      <div class="card-body" style="text-align: center;">
        <p style="color: var(--color-gray-700);">Lección ${index + 1} de ${total}</p>
        <h3 style="margin: var(--space-md) 0;">
          ${lesson.title}
          ${lesson.letter ? `<span aria-hidden="true" style="margin-left: var(--space-sm);">${letterToUnicodeBraille(lesson.letter)}</span>` : ''}
        </h3>
        <p style="margin-bottom: var(--space-lg);">${lesson.description}</p>
        <div id="lesson-braille"></div>
      </div>
      <div class="card-footer" style="display: flex; gap: var(--space-md); flex-wrap: wrap; justify-content: center;">
        <button class="btn btn-outline" id="lesson-prev" ${index === 0 ? 'disabled' : ''}>← Anterior</button>
        <button class="btn btn-primary btn-xl" id="lesson-next">
          ${index + 1 === total ? '✓ Terminar curso' : 'Completar y continuar →'}
        </button>
        <button class="btn btn-outline" id="lesson-close">✕ Salir del curso</button>
      </div>
    </div>
  `;

  const brailleContainer = document.getElementById('lesson-braille');
  if (brailleContainer && lesson.letter) {
    const cell = new BrailleCell(brailleContainer, {
      size: 'large',
      interactive: true,
      showNumbers: true,
    });
    cell.setLetter(lesson.letter);
  }

  manager.announce(`${course.title}. Lección ${index + 1} de ${total}: ${lesson.title}`);

  document.getElementById('lesson-prev')?.addEventListener('click', () => {
    if (index > 0) showLesson(course, index - 1);
  });

  document.getElementById('lesson-next')?.addEventListener('click', () => {
    saveProgress(course, index + 1);
    if (index + 1 === total) {
      manager.announce(`¡Enhorabuena! Has completado el curso ${course.title}.`);
      closeLessonArea();
    } else {
      showLesson(course, index + 1);
    }
    renderCourses();
  });

  document.getElementById('lesson-close')?.addEventListener('click', () => {
    closeLessonArea();
    renderCourses();
  });
}

function closeLessonArea(): void {
  lessonArea.style.display = 'none';
  lessonArea.innerHTML = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filtros: reaccionan al cambio directamente
filterLevel.addEventListener('change', renderCourses);
filterCategory.addEventListener('change', renderCourses);

document.getElementById('filter-clear')?.addEventListener('click', () => {
  filterLevel.value = 'todos';
  filterCategory.value = 'todos';
  renderCourses();
  manager.announce('Filtros restablecidos');
});

// Aviso para invitados
if (!getSession()) {
  const notice = document.getElementById('guest-notice');
  if (notice) {
    notice.innerHTML = `
      <div class="alert alert-info" role="status" style="margin-bottom: var(--space-lg);">
        <div class="alert-icon">ℹ</div>
        <div class="alert-content">
          <p>Estás navegando como invitado. <a href="login.html">Inicia sesión</a> para guardar tu progreso en tu cuenta.</p>
        </div>
      </div>
    `;
  }
}

renderCourses();
