import { initPage } from '../core/page';
import { renderBreadcrumbs } from '../components/layout';

initPage('legales');
renderBreadcrumbs([
  { text: 'Inicio', url: '../index.html' },
  { text: 'Información Legal' },
]);
