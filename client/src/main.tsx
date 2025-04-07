import { createRoot } from 'react-dom/client';
import MainRoutes from './router';
import { BrowserRouter } from 'react-router';
import './global.scss';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <MainRoutes />
  </BrowserRouter>,
)
